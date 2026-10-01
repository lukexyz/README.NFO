#!/usr/bin/env node
// CASTAWAY as a phreak-era tone pad: a hand-built blue box with a 4x4 keypad
// of the dual-tone grid (rows 697 770 852 941 Hz, columns 1209 1336 1477
// 1633 Hz), a little oscilloscope that shows the two sine waves of every key
// and their sum, and a red dot-matrix readout that fills in as keys fire.
// Style: catalogue entry hack-17 ("Phreak tone pad"). The DTMF table is an
// open standard (ITU-T Q.23); everything else here is drawn in this file.
//
//   node examples/castaway/src/88-tone-pad_opus_5.5.mjs
//   node examples/castaway/src/88-tone-pad_opus_5.5.mjs --at=31 --out=some/where.svg
//
// Regenerates ../assets/88-tone-pad_opus_5.5.svg. The .md is hand-written.
// Plain Node, no dependencies, deterministic (no clock, no Math.random).
// --at bakes a head start (seconds) into every animation so a late frame can
// be checked without waiting; use it only with --out.
//
// How the banner works
//   * THE BOX sits on the sand in the foreground; the island (palm, raft,
//     her, nodding on the beat) is behind it on the right. Always daytime.
//   * THE NAME is on a strip of embossed label tape: an original monoline
//     stroke alphabet drawn three times (dark rim, light rim, face).
//   * THE PAD. Each key press lights its whole row band and whole column
//     band in amber, meeting at the key; the cap goes down 3 units; the two
//     frequency labels light. Keys fire on the beat of the theme (80 BPM,
//     one every 0.75 s) and sound for 0.45 s, like real dialling.
//   * THE SCOPE draws LOW, HIGH and SUM traces, computed here from the real
//     frequencies (8 ms across the screen) as cubic Hermite segments with
//     exact derivatives, so the beating pattern of the sum is genuine. It
//     also shows the ringback pair (440 + 480 Hz) while the line rings, and
//     F + A (349 + 440 Hz, the bottom of an F major chord) while on hold.
//   * THE READOUT is a 16 x 2 dot-matrix LED. The pad dials 2278 2929, which
//     the letters on the keys spell CAST AWAY; the island does not answer
//     (headphones). Then it dials 127.0.0.1:8765 (* types a dot, # a colon),
//     which picks up at once. Then D, the super-rare key: please hold.
//   * THE LOOP is 16 bars of 3 s (48 s, 64 beats). Every ambient period
//     divides it or loops off-screen, so there is no seam. Motion is CSS,
//     step-end for the hardware, eased for the scene.
//   * prefers-reduced-motion stops everything on a complete frame: CAST AWAY
//     dialled, key 9 down, its row and column lit, its tones on the scope.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '88-tone-pad_opus_5.5';
const ASSETS = path.join(HERE, '..', 'assets');
const arg = (name) => {
  const hit = process.argv.slice(2).find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
};
const AT = Number(arg('at') || 0);
const OUT = arg('out') || path.join(ASSETS, `${SLUG}.svg`);

// ---------------------------------------------------------------------------
// Frame and timing
// ---------------------------------------------------------------------------
const W = 1280, H = 720;
const BEAT = 0.75, BEATS = 64, LOOP = BEAT * BEATS;  // 48 s, 16 bars of 3 s
const PRESS = 0.45;                                  // tone on, seconds
const RM_T = 7 * BEAT + 0.2;                         // reduced-motion frame

// ---------------------------------------------------------------------------
// Number helpers
// ---------------------------------------------------------------------------
const D2R = Math.PI / 180;
const r1 = (n) => {
  let s = (Math.round(n * 10) / 10).toFixed(1);
  if (s.endsWith('.0')) s = s.slice(0, -2);
  if (s === '-0') s = '0';
  return s.replace(/^(-?)0\./, '$1.');
};
const r2 = (n) => {
  let s = (Math.round(n * 100) / 100).toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  if (s === '-0') s = '0';
  return s.replace(/^(-?)0\./, '$1.');
};
const r3 = (n) => {
  let s = (Math.round(n * 1000) / 1000).toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
  if (s === '-0') s = '0';
  return s.replace(/^(-?)0\./, '$1.');
};
const nums = (arr) => arr.reduce((s, v, i) => s + (i && !String(v).startsWith('-') ? ' ' : '') + v, '');
const pct = (sec) => r2((sec / LOOP) * 100) + '%';

// ---------------------------------------------------------------------------
// A monoline stroke alphabet (engraving-style capitals), drawn for this file.
// Units: cap height 10, y down from the cap line. [advance width, path].
// ---------------------------------------------------------------------------
const P = (cx, cy, rx, ry, a) => [cx + rx * Math.cos(a * D2R), cy + ry * Math.sin(a * D2R)];
function arc(cx, cy, rx, ry, a0, a1, move = true) {
  const n = Math.max(1, Math.ceil(Math.abs(a1 - a0) / 120));
  const [x0, y0] = P(cx, cy, rx, ry, a0);
  let s = (move ? 'M' : 'L') + r3(x0) + ' ' + r3(y0);
  for (let i = 1; i <= n; i++) {
    const [x, y] = P(cx, cy, rx, ry, a0 + ((a1 - a0) * i) / n);
    s += `A${r3(rx)} ${r3(ry)} 0 0 ${a1 > a0 ? 1 : 0} ${r3(x)} ${r3(y)}`;
  }
  return s;
}
const FONT = {
  A: [6, 'M0 10L3 0L6 10M1.05 6.6H4.95'],
  B: [6, 'M0 10V0H3.2' + arc(3.2, 2.5, 2.5, 2.5, -90, 90, false) + 'H0M3.4 5' + arc(3.4, 7.5, 2.6, 2.5, -90, 90, false) + 'H0'],
  C: [6.2, arc(3.1, 5, 3.1, 5, -40, -320)],
  D: [6, 'M0 0V10H2.4' + arc(2.4, 5, 3.6, 5, 90, -90, false) + 'H0'],
  E: [5.4, 'M5.4 0H0V10H5.4M0 5H4.2'],
  F: [5.4, 'M5.4 0H0V10M0 5H4.2'],
  G: [6.2, arc(3.1, 5, 3.1, 5, -40, -360) + 'H3.5'],
  H: [6, 'M0 0V10M6 0V10M0 5H6'],
  I: [0, 'M0 0V10'],
  J: [4.6, 'M4.6 0V7' + arc(2.3, 7, 2.3, 3, 0, 180, false)],
  K: [5.8, 'M0 0V10M5.6 0L0 6.4M1.9 4.5L5.8 10'],
  L: [5.2, 'M0 0V10H5.2'],
  M: [7.2, 'M0 10V0L3.6 7.2L7.2 0V10'],
  N: [6, 'M0 10V0L6 10V0'],
  O: [6.4, arc(3.2, 5, 3.2, 5, 0, 360)],
  P: [6, 'M0 10V0H3.4' + arc(3.4, 2.6, 2.6, 2.6, -90, 90, false) + 'H0'],
  Q: [6.4, arc(3.2, 5, 3.2, 5, 0, 360) + 'M3.9 7.3L6.5 10.3'],
  R: [6, 'M0 10V0H3.4' + arc(3.4, 2.6, 2.6, 2.6, -90, 90, false) + 'H0M3 5.2L6 10'],
  S: [6, arc(3, 2.55, 2.8, 2.55, -25, -270) + arc(3, 7.55, 3, 2.45, -90, 150, false)],
  T: [6, 'M0 0H6M3 0V10'],
  U: [6, 'M0 0V6.8' + arc(3, 6.8, 3, 3.2, 180, 0, false) + 'V0'],
  V: [6, 'M0 0L3 10L6 0'],
  W: [8, 'M0 0L2 10L4 2.8L6 10L8 0'],
  X: [6, 'M0 0L6 10M6 0L0 10'],
  Y: [6, 'M0 0L3 5.2L6 0M3 5.2V10'],
  Z: [6, 'M0 0H6L0 10H6'],
  0: [6, arc(3, 5, 3, 5, 0, 360)],
  1: [5, 'M0.6 2.1L2.7 0V10M0.4 10H5'],
  2: [6, arc(3, 2.9, 2.85, 2.9, -180, 30) + 'L0 10H6'],
  3: [6, arc(3, 2.45, 2.7, 2.45, -160, 90) + arc(3, 7.45, 3, 2.55, -90, 160, false)],
  4: [6, 'M4.4 10V0L0 6.8H6'],
  5: [6, 'M5.6 0H0.9L0.6 4.7' + arc(3, 6.95, 3, 3.05, -142, 150, false)],
  6: [6, arc(3, 6.8, 3, 3.2, 0, 360) + 'M0 6.8C0 2.6 2 -0.1 5.2 0.5'],
  7: [6, 'M0 0H6L2 10'],
  8: [6, arc(3, 2.5, 2.6, 2.5, 90, 450) + arc(3, 7.5, 3, 2.5, -90, 270)],
  9: [6, arc(3, 3.2, 3, 3.2, 0, 360) + 'M6 3.2C6 7.4 4 10.1 0.8 9.5'],
  ' ': [3.4, ''],
  '.': [0, 'M0 10h0'],
  ',': [0, 'M.3 9.6L-.3 11.4'],
  ':': [0, 'M0 3.4h0M0 10h0'],
  '-': [3.6, 'M0 5.4H3.6'],
  '+': [5, 'M0 5.2H5M2.5 2.7V7.7'],
  '/': [4.2, 'M0 10.4L4.2 -.4'],
  '*': [5.2, 'M2.6 2.2V7.8M.2 3.6L5 6.4M.2 6.4L5 3.6'],
  '#': [5.6, 'M1.9 .6L1.2 9.4M4.6 .6L3.9 9.4M0 3.3H5.6M-.3 6.7H5.3'],
  '·': [0, 'M0 5.2h0'],
  "'": [0, 'M0 0V2.4'],
  '(': [2, 'M2 -.4Q-.4 5 2 10.4'],
  ')': [2, 'M0 -.4Q2.4 5 0 10.4'],
  '=': [5, 'M0 3.7H5M0 6.7H5'],
  '?': [5.3, arc(2.7, 2.6, 2.6, 2.6, -175, 70) + 'L2.7 7.2M2.7 10h0'],
  '!': [0, 'M0 0V7.2M0 10h0'],
};

// transform one glyph path: (u,v) units -> (x + u*s, y + v*s)
function placeGlyph(d, x, y, s) {
  const tok = d.match(/[MLHVQCAZh]|-?\d*\.?\d+(?:e-?\d+)?/g) || [];
  let out = '', i = 0, cmd = '';
  const X = (u) => r1(x + u * s), Y = (v) => r1(y + v * s);
  const num = () => parseFloat(tok[i++]);
  while (i < tok.length) {
    if (/[A-Za-z]/.test(tok[i])) cmd = tok[i++];
    const vals = [];
    switch (cmd) {
      case 'M': case 'L': vals.push(X(num()), Y(num())); break;
      case 'H': vals.push(X(num())); break;
      case 'V': vals.push(Y(num())); break;
      case 'h': vals.push(r2(num() * s)); break;
      case 'Q': vals.push(X(num()), Y(num()), X(num()), Y(num())); break;
      case 'C': vals.push(X(num()), Y(num()), X(num()), Y(num()), X(num()), Y(num())); break;
      case 'A': {
        const rx = num(), ry = num(), rot = num(), la = num(), sw = num();
        vals.push(r1(rx * s), r1(ry * s), r3(rot), la, sw, X(num()), Y(num()));
        break;
      }
      case 'Z': out += 'Z'; continue;
      default: throw new Error('glyph cmd ' + cmd);
    }
    out += cmd + nums(vals.map(String));
  }
  return out;
}
const glyph = (ch) => {
  const g = FONT[ch];
  if (!g) throw new Error(`no stroke glyph for "${ch}"`);
  return g;
};
// width in px of a string at a given cap height and tracking (units)
function textWidth(str, cap, track = 2.6) {
  const s = cap / 10;
  let w = 0;
  [...str].forEach((ch, i) => { w += glyph(ch)[0] + (i < str.length - 1 ? track : 0); });
  return w * s;
}
// stroke text -> path d. align: 'l' | 'c' | 'r'. mono: cell width in units.
function text(str, x, y, cap, { track = 2.6, align = 'l', mono = 0 } = {}) {
  const s = cap / 10;
  const total = mono ? str.length * mono * s : textWidth(str, cap, track);
  let cx = align === 'c' ? x - total / 2 : align === 'r' ? x - total : x;
  let d = '';
  for (const ch of str) {
    const [w, gd] = glyph(ch);
    if (mono) {
      if (gd) d += placeGlyph(gd, cx + ((mono - w) / 2) * s, y, s);
      cx += mono * s;
    } else {
      if (gd) d += placeGlyph(gd, cx, y, s);
      cx += (w + track) * s;
    }
  }
  return d;
}

// ---------------------------------------------------------------------------
// 5 x 7 dot-matrix LED font, drawn for this file
// ---------------------------------------------------------------------------
const LED = {
  0: '01110 10001 10011 10101 11001 10001 01110', 1: '00100 01100 00100 00100 00100 00100 01110',
  2: '01110 10001 00001 00010 00100 01000 11111', 3: '11111 00010 00100 00010 00001 10001 01110',
  4: '00010 00110 01010 10010 11111 00010 00010', 5: '11111 10000 11110 00001 00001 10001 01110',
  6: '00110 01000 10000 11110 10001 10001 01110', 7: '11111 00001 00010 00100 01000 01000 01000',
  8: '01110 10001 10001 01110 10001 10001 01110', 9: '01110 10001 10001 01111 00001 00010 01100',
  A: '01110 10001 10001 11111 10001 10001 10001', B: '11110 10001 10001 11110 10001 10001 11110',
  C: '01110 10001 10000 10000 10000 10001 01110', D: '11100 10010 10001 10001 10001 10010 11100',
  E: '11111 10000 10000 11110 10000 10000 11111', F: '11111 10000 10000 11110 10000 10000 10000',
  G: '01110 10001 10000 10111 10001 10001 01111', H: '10001 10001 10001 11111 10001 10001 10001',
  I: '01110 00100 00100 00100 00100 00100 01110', J: '00111 00010 00010 00010 00010 10010 01100',
  K: '10001 10010 10100 11000 10100 10010 10001', L: '10000 10000 10000 10000 10000 10000 11111',
  M: '10001 11011 10101 10101 10001 10001 10001', N: '10001 10001 11001 10101 10011 10001 10001',
  O: '01110 10001 10001 10001 10001 10001 01110', P: '11110 10001 10001 11110 10000 10000 10000',
  Q: '01110 10001 10001 10001 10101 10010 01101', R: '11110 10001 10001 11110 10100 10010 10001',
  S: '01111 10000 10000 01110 00001 00001 11110', T: '11111 00100 00100 00100 00100 00100 00100',
  U: '10001 10001 10001 10001 10001 10001 01110', V: '10001 10001 10001 10001 10001 01010 00100',
  W: '10001 10001 10001 10101 10101 10101 01010', X: '10001 10001 01010 00100 01010 10001 10001',
  Y: '10001 10001 10001 01010 00100 00100 00100', Z: '11111 00001 00010 00100 01000 10000 11111',
  '.': '00000 00000 00000 00000 00000 01100 01100', ':': '00000 01100 01100 00000 01100 01100 00000',
  ',': '00000 00000 00000 00000 01100 00100 01000', '/': '00000 00001 00010 00100 01000 10000 00000',
  '-': '00000 00000 00000 11111 00000 00000 00000', '?': '01110 10001 00001 00010 00100 00000 00100',
};

// ---------------------------------------------------------------------------
// The dual-tone grid
// ---------------------------------------------------------------------------
const ROWS = [697, 770, 852, 941];
const COLS = [1209, 1336, 1477, 1633];
const KEYS = [['1', '2', '3', 'A'], ['4', '5', '6', 'B'], ['7', '8', '9', 'C'], ['*', '0', '#', 'D']];
const SUB = { 2: 'ABC', 3: 'DEF', 4: 'GHI', 5: 'JKL', 6: 'MNO', 7: 'PQRS', 8: 'TUV', 9: 'WXYZ',
  A: '2-5 MIN', B: '12-25 MIN', C: '30-60 MIN', D: '3-6 HRS' };
const keyPos = {};
KEYS.forEach((row, ri) => row.forEach((k, ci) => { keyPos[k] = [ri, ci]; }));

// ---------------------------------------------------------------------------
// The 48-second script (beats of 0.75 s)
// ---------------------------------------------------------------------------
const presses = [];  // {t, key}
const dial = (b0, keys) => [...keys].forEach((k, i) => presses.push({ t: (b0 + i) * BEAT, key: k }));
dial(0, '22782929');          // CAST AWAY, in the letters on the keys
dial(16, '127*0*0*1#8765');   // 127.0.0.1:8765
presses.push({ t: 37 * BEAT, key: 'D' });  // super rare

// readout: line 0 and line 1, 16 columns. Each entry: text at column, [on, off] in beats
const readout = [];
const msg = (line, col, str, b0, b1) => readout.push({ line, col, str, on: b0 * BEAT, off: b1 * BEAT });
// typed dial strings: one character per key press
const typed = (line, str, startBeat, offBeat, beatOf) => {
  [...str].forEach((ch, i) => { if (ch !== ' ') msg(line, i, ch, beatOf(i, startBeat), offBeat); });
};
// 2278 2929 / CAST AWAY: position 4 is a space; digits 0-3 on beats 0-3, 5-8 on 4-7
const castBeat = (i, b0) => b0 + (i < 4 ? i : i - 1);
typed(0, '2278 2929', 0, 12, castBeat);
typed(1, 'CAST AWAY', 0, 12, castBeat);
msg(0, 0, 'NO ANSWER.', 12, 16);
msg(1, 0, 'HEADPHONES ON', 12, 16);
typed(0, '127.0.0.1:8765', 16, 36, (i, b0) => b0 + i);
msg(1, 0, 'AFTER SERVE.PY', 16, 32);
msg(1, 0, 'PICKS UP AT ONCE', 32, 36);
msg(0, 0, 'D', 37, 40);
msg(1, 0, 'SUPER RARE GAG', 38, 40);
msg(0, 0, 'PLEASE HOLD', 40, 44);
msg(1, 0, 'WAIT 3 TO 6 HRS', 40, 44);
msg(0, 0, 'YOUR GAG IS', 44, 48);
msg(1, 0, 'IMPORTANT TO US', 44, 48);
msg(0, 0, 'HOLD MUSIC:', 48, 52);
msg(1, 0, '80 BPM, F MAJOR', 48, 52);
msg(0, 0, 'YOU ARE CALLER', 52, 56);
msg(1, 0, 'NUMBER 1 OF 1', 52, 56);
msg(0, 0, 'IDLE', 56, 64);
[0, 4, 8, 12].forEach((c, i) => msg(1, c, 'NOD', 57 + i, 64));

// scope states: [low Hz, high Hz, on, off] in seconds
const scopeStates = presses.map(({ t, key }) => {
  const [ri, ci] = keyPos[key];
  return { lo: ROWS[ri], hi: COLS[ci], on: t, off: t + PRESS };
});
scopeStates.push({ lo: 440, hi: 480, on: 8 * BEAT, off: 8 * BEAT + 2 });          // ringback
scopeStates.push({ lo: 440, hi: 480, on: 30 * BEAT, off: 30 * BEAT + 0.5 });
scopeStates.push({ lo: 349, hi: 440, exact: [349.23, 440], on: 40 * BEAT, off: 56 * BEAT }); // F + A, on hold

const lamps = {
  DIAL: [[0, 8], [16, 30], [37, 38]],
  RING: [[8, 8 + 2 / BEAT], [30, 30 + 0.5 / BEAT]],
  LINE: [[32, 56]],
  HOLD: [[40, 56]],
};
const idleLamp = [[56, 64]];

// ---------------------------------------------------------------------------
// Keyframes: on/off schedules (step-end) shared by every element that uses them
// ---------------------------------------------------------------------------
const css = [];
const kfCache = new Map();
let kfN = 0;
function merge(ivs) {
  const s = ivs.map(([a, b]) => [a, b]).sort((p, q) => p[0] - q[0]);
  const out = [];
  for (const iv of s) {
    if (out.length && iv[0] <= out[out.length - 1][1] + 1e-9) out[out.length - 1][1] = Math.max(out[out.length - 1][1], iv[1]);
    else out.push(iv);
  }
  return out;
}
const isOn = (ivs, t) => ivs.some(([a, b]) => t >= a - 1e-9 && t < b - 1e-9);
// returns a class name animating `prop` between offV and onV
function sched(ivs, prop = 'opacity', onV = '1', offV = '0') {
  ivs = merge(ivs.filter(([a, b]) => b > a));
  const key = prop + onV + offV + JSON.stringify(ivs.map(([a, b]) => [r3(a), r3(b)]));
  if (kfCache.has(key)) return kfCache.get(key);
  const name = 's' + (kfN++).toString(36);
  const stops = [];
  const at0 = isOn(ivs, 0);
  stops.push(`0%{${prop}:${at0 ? onV : offV}}`);
  for (const [a, b] of ivs) {
    if (a > 1e-9) stops.push(`${pct(a)}{${prop}:${onV}}`);
    if (b < LOOP - 1e-9) stops.push(`${pct(b)}{${prop}:${offV}}`);
  }
  const atEnd = isOn(ivs, LOOP - 1e-6);
  stops.push(`100%{${prop}:${atEnd ? onV : offV}}`);
  css.push(`@keyframes ${name}{${stops.join('')}}.${name}{animation:${name} ${LOOP}s step-end${AT ? ` ${r3(-AT)}s` : ''} infinite}`);
  kfCache.set(key, name);
  return name;
}
// attribute string: class + reduced-motion base state
const vis = (ivs) => {
  const c = sched(ivs);
  return `class="${c}"${isOn(ivs, RM_T) ? '' : ' opacity="0"'}`;
};
const beatsToSec = (ivs) => ivs.map(([a, b]) => [a * BEAT, b * BEAT]);

// ---------------------------------------------------------------------------
// Seeded PRNG (mulberry32), for sparkle placement only
// ---------------------------------------------------------------------------
const rng = (seed) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const rand = rng(1992);

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------
const C = {
  boxTop: '#6f9fe6', boxFace0: '#3169c2', boxFace1: '#2453a3', boxEdge: '#143670',
  plate: '#11264a', plateEdge: '#0a1830', print: '#eee8d6', printDim: '#9fb3d6',
  key0: '#f3efe4', key1: '#ddd7c8', keySkirt: '#a49d8c', legend: '#2b2a27',
  keyAD0: '#f7bba7', keyAD1: '#ec9b83', keyADSkirt: '#b8644f',
  amber: '#ffb000', amberHot: '#ffd36a',
  phosphor: '#39ff88', phosphorCore: '#d9ffe9', screen: '#06140c',
  led: '#ff4b33', ledHot: '#ffc2b0', ledOff: '#3b100b', ledWin: '#140504',
  tapeRed0: '#d84b3c', tapeRed1: '#b3382c', tapeRim: '#6e1b13', tapeFace: '#fcebe4',
  tapeBlk0: '#2a2b2e', tapeBlk1: '#141517',
  coral: '#e8735f', cream: '#efe6cf', hair: '#6b4330', skin: '#f0c49f', skinShade: '#d9a580',
};

// ---------------------------------------------------------------------------
// Scene behind the box: sky, sea, shore, palm, raft, her
// ---------------------------------------------------------------------------
const defs = [];
const body = [];
const HZN = 232;

defs.push(`<clipPath id="frame"><rect width="${W}" height="${H}" rx="20"/></clipPath>`);
defs.push(`<linearGradient id="sky" x1="0" y1="0" x2="0" y2="${HZN}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#6fbde9"/><stop offset=".62" stop-color="#ade0f3"/><stop offset="1" stop-color="#e4f3ea"/></linearGradient>`);
defs.push(`<linearGradient id="sea" x1="0" y1="${HZN}" x2="0" y2="352" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#2794c2"/><stop offset=".55" stop-color="#36b0cf"/><stop offset="1" stop-color="#7fd8d6"/></linearGradient>`);
defs.push(`<linearGradient id="sand" x1="0" y1="340" x2="0" y2="${H}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f6e2b6"/><stop offset=".5" stop-color="#f1d49d"/><stop offset="1" stop-color="#e6c186"/></linearGradient>`);
defs.push(`<radialGradient id="sunHalo"><stop offset="0" stop-color="#fff6cf" stop-opacity=".95"/><stop offset=".45" stop-color="#fff2c0" stop-opacity=".35"/><stop offset="1" stop-color="#fff2c0" stop-opacity="0"/></radialGradient>`);
defs.push(`<radialGradient id="softShadow"><stop offset="0" stop-color="#6b4a22" stop-opacity=".42"/><stop offset=".6" stop-color="#6b4a22" stop-opacity=".18"/><stop offset="1" stop-color="#6b4a22" stop-opacity="0"/></radialGradient>`);
defs.push(`<radialGradient id="cloudShade"><stop offset="0" stop-color="#0d2340" stop-opacity=".16"/><stop offset=".55" stop-color="#0d2340" stop-opacity=".09"/><stop offset="1" stop-color="#0d2340" stop-opacity="0"/></radialGradient>`);

body.push(`<rect width="${W}" height="${HZN + 2}" fill="url(#sky)"/>`);
// sun
body.push(`<circle cx="92" cy="50" r="86" fill="url(#sunHalo)"/><circle cx="92" cy="50" r="25" fill="#fff8de"/>`);
// clouds: flat painted puffs, drifting on long off-screen loops
function cloud(x, y, k) {
  const puffs = [[0, 0, 22], [24, -10, 26], [52, -2, 20], [70, 6, 14], [-20, 8, 13]];
  const top = puffs.map(([dx, dy, r]) => `M${r1(x + dx * k - r * k)} ${r1(y + dy * k)}a${r1(r * k)} ${r1(r * k)} 0 1 1 ${r1(2 * r * k)} 0a${r1(r * k)} ${r1(r * k)} 0 1 1 ${r1(-2 * r * k)} 0`).join('');
  const base = `M${r1(x - 30 * k)} ${r1(y + 8 * k)}h${r1(112 * k)}a${r1(9 * k)} ${r1(9 * k)} 0 0 1 0 ${r1(14 * k)}h${r1(-112 * k)}a${r1(9 * k)} ${r1(9 * k)} 0 0 1 0 ${r1(-14 * k)}z`;
  return `<path d="${top}${base}" fill="#fff"/><path d="M${r1(x - 34 * k)} ${r1(y + 17 * k)}h${r1(118 * k)}a${r1(6 * k)} ${r1(6 * k)} 0 0 1 0 ${r1(10 * k)}h${r1(-118 * k)}z" fill="#d9ecf5"/>`;
}
const clouds = [[180, 46, 0.9], [640, 30, 0.75], [1010, 70, 1.1]];
const CLOUD_T = 144, TRAVEL = 1680, XB = W + 60;
css.push(`@keyframes drift{from{transform:translateX(-${TRAVEL}px)}to{transform:translateX(0)}}`);
clouds.forEach(([x, y, k], i) => {
  const phase = (x - XB + TRAVEL) / TRAVEL;
  body.push(`<g class="cl${i}" transform="translate(${x - XB} 0)">${cloud(XB, y, k)}</g>`);
  css.push(`.cl${i}{animation:drift ${CLOUD_T}s linear ${r3(-phase * CLOUD_T - AT)}s infinite}`);
});

// sea
body.push(`<rect y="${HZN}" width="${W}" height="${360 - HZN}" fill="url(#sea)"/>`);
body.push(`<path d="M0 ${HZN}H${W}" stroke="#e9f6f4" stroke-width="1.6" opacity=".7"/>`);
// glints (only the right strip and the left margin really show)
{
  let g = '';
  for (let i = 0; i < 26; i++) {
    const x = i < 4 ? 4 + rand() * 26 : 1004 + rand() * 270;
    const y = HZN + 8 + rand() * 100;
    const w = 6 + rand() * 16 * ((y - HZN) / 100 + 0.3);
    const cls = `gl${i % 4}`;
    g += `<path class="${cls}" d="M${r1(x)} ${r1(y)}h${r1(w)}" />`;
  }
  body.push(`<g stroke="#f4fffd" stroke-width="2" stroke-linecap="round" opacity=".85">${g}</g>`);
  css.push(`@keyframes glint{0%,100%{opacity:.1}50%{opacity:.95}}`);
  [0, 1, 2, 3].forEach((i) => css.push(`.gl${i}{animation:glint 3s ease-in-out ${r3(-i * 0.75 - AT)}s infinite}`));
}
// sand with a wet band and a wash of foam
body.push(`<path d="M0 352C200 344 420 350 640 346S1080 338 ${W} 344V${H}H0Z" fill="url(#sand)"/>`);
body.push(`<path d="M0 352C200 344 420 350 640 346S1080 338 ${W} 344V356C1080 352 860 360 640 358S200 360 0 364Z" fill="#e3c48c" opacity=".55"/>`);
body.push(`<g class="wash"><path d="M990 341C1060 334 1120 342 1180 336S1250 334 ${W} 336V346C1240 344 1200 348 1170 350S1050 348 990 352Z" fill="#fbfdf8" opacity=".9"/><path d="M990 350C1070 344 1130 352 1200 346S1260 346 ${W} 348" fill="none" stroke="#ffffff" stroke-width="1.5" opacity=".7"/></g>`);
css.push(`@keyframes wash{0%,100%{transform:translateY(-5px);opacity:.55}45%{transform:translateY(4px);opacity:1}}`);
css.push(`.wash{animation:wash 6s ease-in-out ${r3(-AT)}s infinite}`);

// the raft at the waterline, mostly hidden behind the box
{
  let logs = '';
  for (let i = 0; i < 5; i++) {
    const y = 330 + i * 5.2;
    logs += `<rect x="${1002 + i * 1.5}" y="${r1(y)}" width="78" height="6" rx="3" fill="${i % 2 ? '#a7744a' : '#b9855a'}"/>`;
  }
  body.push(`<g>${logs}<path d="M1016 329v28M1066 329v28" stroke="#6e4a2c" stroke-width="2"/></g>`);
}

// palm: slender, segmented, reddish-tan, rising from behind her
const palm = [];
{
  const B = [1226, 528], Cc = [1218, 300], T = [1170, 86];
  const q = (t) => [
    (1 - t) ** 2 * B[0] + 2 * (1 - t) * t * Cc[0] + t * t * T[0],
    (1 - t) ** 2 * B[1] + 2 * (1 - t) * t * Cc[1] + t * t * T[1],
  ];
  const N = 36, L = [], R = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const [x, y] = q(t);
    const [x2, y2] = q(Math.min(1, t + 0.01));
    const [x1, y1] = q(Math.max(0, t - 0.01));
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
    const nx = -dy / len, ny = dx / len;
    const w = (26 * (1 - t) + 12 * t) / 2 + (i === 0 ? 3 : 0);
    L.push([x + nx * w, y + ny * w]); R.push([x - nx * w, y - ny * w]);
  }
  const poly = [...L, ...R.reverse()];
  palm.push(`<path d="M${poly.map(([x, y]) => r1(x) + ' ' + r1(y)).join('L')}Z" fill="#b97a50"/>`);
  // rings
  let rings = '';
  for (let i = 1; i < 26; i++) {
    const t = i / 26.5;
    const [x, y] = q(t);
    const w = (26 * (1 - t) + 12 * t) / 2;
    rings += `M${r1(x - w)} ${r1(y - 1)}q${r1(w)} ${r1(3 + w * 0.12)} ${r1(2 * w)} 0`;
  }
  palm.push(`<path d="${rings}" fill="none" stroke="#86502f" stroke-width="1.6" opacity=".7"/>`);
}
// fronds: leaflets along a curved spine
function frond(cx, cy, ang, len, droop, fill, seed) {
  const R2 = rng(seed);
  const a = ang * D2R;
  const p0 = [cx, cy];
  const p2 = [cx + Math.cos(a) * len, cy + Math.sin(a) * len + droop * len];
  const p1 = [cx + Math.cos(a) * len * 0.55, cy + Math.sin(a) * len * 0.55 - len * 0.12];
  const at = (t) => [
    (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
    (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1],
  ];
  let d = '';
  const n = 13;
  const R = (v) => Math.round(v);
  for (let i = 1; i <= n; i++) {
    const t = 0.1 + (i / n) * 0.88;
    const [x, y] = at(t);
    const [xa, ya] = at(Math.min(1, t + 0.02));
    const tx = xa - x, ty = ya - y, tl = Math.hypot(tx, ty) || 1;
    const ux = tx / tl, uy = ty / tl;
    const ll = len * 0.37 * Math.sin(Math.PI * Math.min(1, t * 1.08)) ** 0.7 * (0.85 + R2() * 0.3);
    for (const side of [-1, 1]) {
      // leaflet direction: rotate the tangent by +/-58 deg, then let it droop
      const rot = side * 58 * D2R;
      let lx = ux * Math.cos(rot) - uy * Math.sin(rot);
      let ly = ux * Math.sin(rot) + uy * Math.cos(rot);
      ly += 0.55; const ln = Math.hypot(lx, ly); lx /= ln; ly /= ln;
      const bw = 2.6;
      // absolute points, rounded, then written relative (q ... q ... z)
      const P0 = [R(x - ux * bw), R(y - uy * bw)];
      const Q1 = [R(x + lx * ll * 0.5 + ux * 3), R(y + ly * ll * 0.5 + uy * 3)];
      const E = [R(x + lx * ll), R(y + ly * ll)];
      const Q2 = [R(x + lx * ll * 0.45 + ux * 6), R(y + ly * ll * 0.45 + uy * 6)];
      const P3 = [R(x + ux * bw * 2), R(y + uy * bw * 2)];
      d += `M${P0[0]} ${P0[1]}q${nums([Q1[0] - P0[0], Q1[1] - P0[1], E[0] - P0[0], E[1] - P0[1]].map(String))}` +
        `q${nums([Q2[0] - E[0], Q2[1] - E[1], P3[0] - E[0], P3[1] - E[1]].map(String))}z`;
    }
  }
  // spine, stopped short of the tip so it never pokes out as a stick
  const ts = 0.84;
  const c1 = [p0[0] + (p1[0] - p0[0]) * ts, p0[1] + (p1[1] - p0[1]) * ts];
  const e1 = at(ts);
  const spine = `M${r1(p0[0])} ${r1(p0[1])}Q${r1(c1[0])} ${r1(c1[1])} ${r1(e1[0])} ${r1(e1[1])}`;
  return `<path d="${d}" fill="${fill}"/><path d="${spine}" fill="none" stroke="${fill}" stroke-width="2.6" stroke-linecap="round"/>`;
}
{
  const cx = 1170, cy = 86;
  const fr = [
    [-168, 150, 0.32, '#2f7f4c'], [-128, 120, 0.22, '#3a9358'], [-92, 92, 0.1, '#2f7f4c'],
    [-52, 120, 0.25, '#3a9358'], [-14, 150, 0.36, '#2f7f4c'], [28, 130, 0.38, '#3a9358'],
    [150, 140, 0.32, '#3a9358'], [112, 110, 0.3, '#2f7f4c'], [70, 104, 0.34, '#2a7345'],
  ];
  let f = '';
  fr.forEach(([a, l, d, c], i) => { f += frond(cx, cy, a, l, d, c, 50 + i); });
  f += `<circle cx="1162" cy="96" r="7.5" fill="#6d4a2b"/><circle cx="1176" cy="98" r="7" fill="#5e3f24"/><circle cx="1169" cy="105" r="6.5" fill="#76512f"/>`;
  palm.push(`<g class="fronds">${f}</g>`);
  css.push(`@keyframes sway{0%,100%{transform:rotate(-1.6deg)}50%{transform:rotate(1.6deg)}}`);
  css.push(`.fronds{transform-origin:1170px 86px;animation:sway 12s ease-in-out ${r3(-3 - AT)}s infinite}`);
}
body.push(`<g>${palm.join('')}</g>`);
// palm shadow on the sand
body.push(`<ellipse cx="1206" cy="530" rx="46" ry="7" fill="#7a5328" opacity=".22"/>`);

// her: small, simple, sitting on the sand, nodding on the beat
{
  const ox = 1150, oy = 530;
  const T2 = (pts) => pts.map(([x, y]) => `${r1(ox + x)} ${r1(oy + y)}`).join('L');
  const line = (pts, w, col) => `<path d="M${T2(pts)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  let s = '';
  s += `<ellipse cx="${ox - 14}" cy="${oy + 1}" rx="44" ry="6" fill="#7a5328" opacity=".25"/>`;
  // far leg
  s += line([[-2, -8], [-22, -33], [-34, -4]], 10, C.skinShade);
  s += `<ellipse cx="${ox - 38}" cy="${oy - 2.5}" rx="7" ry="3.4" fill="${C.skinShade}"/>`;
  // torso (coral tank top)
  s += `<path d="M${T2([[-8, -6], [-9, -30], [-6, -49], [6, -51], [11, -32], [12, -8]])}Z" fill="${C.coral}"/>`;
  s += `<path d="M${T2([[-4, -49], [-2, -54], [5, -54], [6, -51]])}Z" fill="${C.skin}"/>`;
  // shorts + near leg
  s += line([[2, -8], [-26, -36]], 14, C.skin);
  s += line([[-26, -36], [-42, -5]], 11, C.skin);
  s += `<ellipse cx="${ox - 47}" cy="${oy - 3}" rx="7.5" ry="3.6" fill="${C.skin}"/>`;
  s += line([[9, -6], [2, -8], [-9, -19]], 16, C.cream);
  s += line([[-12, -24.5], [-3, -15]], 1.2, '#d6c8a4');
  // arm round the knees
  s += line([[2, -46], [-10, -30], [-25, -38]], 7.5, C.skin);
  s += `<circle cx="${ox - 26}" cy="${oy - 39}" r="4" fill="${C.skin}"/>`;
  // head group (nods)
  let h = '';
  h += `<circle cx="${ox - 1}" cy="${oy - 66}" r="11.5" fill="${C.skin}"/>`;
  h += `<path d="M${ox - 12} ${oy - 66}l-2.6 2.2 2.4 1.2z" fill="${C.skin}"/>`;
  // hair: cap over the top and back, with a loose low bun
  h += `<path d="M${ox - 12.5} ${oy - 68}C${ox - 12} ${oy - 81} ${ox + 9} ${oy - 83} ${ox + 11} ${oy - 68}C${ox + 12} ${oy - 60} ${ox + 7} ${oy - 56} ${ox + 3} ${oy - 56}C${ox + 4} ${oy - 62} ${ox - 2} ${oy - 70} ${ox - 12.5} ${oy - 68}Z" fill="${C.hair}"/>`;
  h += `<circle cx="${ox + 11}" cy="${oy - 58}" r="6" fill="${C.hair}"/><path d="M${ox + 7} ${oy - 61}q4 -2 7 1" stroke="#875a3f" stroke-width="1.4" fill="none"/>`;
  h += `<circle cx="${ox - 7}" cy="${oy - 67}" r="1.3" fill="#2b1d16"/>`;
  h += `<path d="M${ox - 8.6} ${oy - 61.5}q2 1.2 3.6 0" stroke="#b36b56" stroke-width="1.2" fill="none" stroke-linecap="round"/>`;
  // headphones: band over the crown, cup over the ear
  h += `<path d="M${ox - 5} ${oy - 77}C${ox - 2} ${oy - 84} ${ox + 7} ${oy - 82} ${ox + 7} ${oy - 70}" fill="none" stroke="${C.cream}" stroke-width="3.6" stroke-linecap="round"/>`;
  h += `<ellipse cx="${ox + 2.5}" cy="${oy - 66}" rx="5.2" ry="6.6" fill="${C.cream}" stroke="#cbbf9f" stroke-width="1.4"/>`;
  s += `<g class="nod">${h}</g>`;
  body.push(`<g>${s}</g>`);
  css.push(`@keyframes nod{0%{transform:rotate(0)}14%{transform:rotate(-9deg)}42%{transform:rotate(-2deg)}100%{transform:rotate(0)}}`);
  css.push(`.nod{transform-origin:${ox}px ${oy - 54}px;animation:nod ${BEAT}s ease-in-out ${r3(-AT)}s infinite}`);
  // two notes drifting up from the headphones, one per half bar
  const note = `<path d="M0 0a3.6 2.8 -20 1 0 .1 0zM3.3 -1.2V-15l6.5 2.4v3.4l-5.2 -1.8" fill="#2f8ea3" stroke="#2f8ea3" stroke-width="1.2" stroke-linejoin="round"/>`;
  body.push(`<g transform="translate(${ox - 4} ${oy - 84})"><g class="nt0" opacity="0">${note}</g><g class="nt1" transform="translate(-12 -26)" opacity=".7">${note}</g></g>`);
  css.push(`@keyframes note{0%{transform:translate(0,0);opacity:0}15%{opacity:.75}100%{transform:translate(-22px,-46px);opacity:0}}`);
  css.push(`.nt0{animation:note 3s ease-out ${r3(-AT)}s infinite}.nt1{animation:note 3s ease-out ${r3(-1.5 - AT)}s infinite}`);
}

// a hermit crab wearing a coconut, pottering about on the sand
{
  const cx = 1066, cy = 640;
  let s = `<ellipse cx="${cx}" cy="${cy + 3}" rx="18" ry="3.6" fill="#7a5328" opacity=".25"/>`;
  s += `<g class="crabLegs" stroke="#d2543f" stroke-width="2" stroke-linecap="round" fill="none"><path d="M${cx - 10} ${cy - 3}l-6 5M${cx - 6} ${cy - 2}l-4 6M${cx + 6} ${cy - 2}l4 6M${cx + 10} ${cy - 3}l6 5"/></g>`;
  s += `<path d="M${cx - 15} ${cy - 3}a15 13 0 0 1 30 0z" fill="#6a4426"/><path d="M${cx - 11} ${cy - 9}q11 -10 22 0" stroke="#8a5d38" stroke-width="2" fill="none"/><circle cx="${cx - 4}" cy="${cy - 10}" r="1.4" fill="#3b2513"/>`;
  s += `<path d="M${cx - 17} ${cy - 4}l-4 -5M${cx - 17} ${cy - 4}l-1 -6" stroke="#d2543f" stroke-width="1.6" stroke-linecap="round"/><circle cx="${cx - 21}" cy="${cy - 10}" r="1.6" fill="#1d1d1d"/><circle cx="${cx - 18}" cy="${cy - 11}" r="1.6" fill="#1d1d1d"/>`;
  body.push(`<g class="crab">${s}</g>`);
  css.push(`@keyframes crab{0%,100%{transform:translateX(0)}50%{transform:translateX(-26px)}}@keyframes hop{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.5px)}}`);
  css.push(`.crab{animation:crab 24s steps(24,end) ${r3(-AT)}s infinite}.crabLegs{animation:hop .75s step-end ${r3(-AT)}s infinite}`);
}

// ---------------------------------------------------------------------------
// The box
// ---------------------------------------------------------------------------
const BX = 36, BY = 104, BW = 964, BH = 580;   // overall, incl. top face
const FY = 124;                                 // front face starts
const box = [];
defs.push(`<linearGradient id="face" x1="0" y1="${FY}" x2="0" y2="${BY + BH}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${C.boxFace0}"/><stop offset="1" stop-color="${C.boxFace1}"/></linearGradient>`);
defs.push(`<linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".13"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/></linearGradient>`);
defs.push(`<linearGradient id="topf" x1="0" y1="${BY}" x2="0" y2="${FY}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#8ab4ef"/><stop offset="1" stop-color="${C.boxTop}"/></linearGradient>`);
// shadow on the sand
box.push(`<ellipse cx="${BX + BW / 2}" cy="${BY + BH + 4}" rx="${BW / 2 + 40}" ry="30" fill="url(#softShadow)"/>`);
box.push(`<path d="M${BX + 4} ${BY + BH - 2}H${BX + BW - 4}" stroke="#5a3b18" stroke-width="5" opacity=".35" stroke-linecap="round"/>`);
// top face (seen from slightly above)
box.push(`<path d="M${BX + 30} ${BY}H${BX + BW - 30}Q${BX + BW - 18} ${BY} ${BX + BW - 10} ${BY + 8}L${BX + BW} ${FY}H${BX}L${BX + 10} ${BY + 8}Q${BX + 18} ${BY} ${BX + 30} ${BY}Z" fill="url(#topf)" stroke="${C.boxEdge}" stroke-width="2"/>`);
// a little sand on the lid (seeded)
{
  const R3 = rng(80);
  let sp = '';
  for (let i = 0; i < 46; i++) {
    const x = BX + 40 + R3() * (BW - 80), y = BY + 4 + R3() * 14;
    sp += `M${r1(x)} ${r1(y)}h${r1(0.5 + R3() * 1.6)}`;
  }
  var sandBits = `<path d="${sp}" stroke="#f1d49d" stroke-width="1.8" stroke-linecap="round" opacity=".85"/>`;
}
// front face
box.push(`<path d="M${BX} ${FY}H${BX + BW}V${BY + BH - 16}Q${BX + BW} ${BY + BH} ${BX + BW - 16} ${BY + BH}H${BX + 16}Q${BX} ${BY + BH} ${BX} ${BY + BH - 16}Z" fill="url(#face)" stroke="${C.boxEdge}" stroke-width="2"/>`);
box.push(`<path d="M${BX} ${FY}H${BX + BW}V${BY + BH - 16}Q${BX + BW} ${BY + BH} ${BX + BW - 16} ${BY + BH}H${BX + 16}Q${BX} ${BY + BH} ${BX} ${BY + BH - 16}Z" fill="url(#sheen)"/>`);
box.push(`<path d="M${BX + 2} ${FY + 1.5}H${BX + BW - 2}" stroke="#9cc0f2" stroke-width="1.5" opacity=".8"/>`);
// screws
const screw = (x, y) => `<circle cx="${x}" cy="${y}" r="7.5" fill="#c9cfd8" stroke="#6d7787" stroke-width="1.2"/><path d="M${x - 4} ${y - 1.6}l8 3.2M${x + 1.6} ${y - 4}l-3.2 8" stroke="#5d6676" stroke-width="1.6" stroke-linecap="round"/>`;
box.push(sandBits);
box.push(screw(BX + 16, FY + 16) + screw(BX + BW - 16, FY + 16) + screw(BX + 16, BY + BH - 16) + screw(BX + BW - 16, BY + BH - 16));

// ---- label tape: CASTAWAY, embossed ----
function tape({ x, y, w, h, rot, str, cap, cell, kind, id }) {
  const red = kind === 'red';
  const g0 = red ? C.tapeRed0 : C.tapeBlk0, g1 = red ? C.tapeRed1 : C.tapeBlk1;
  const gid = `tg_${id}`;
  defs.push(`<linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${g0}"/><stop offset=".5" stop-color="${g1}"/><stop offset="1" stop-color="${g0}"/></linearGradient>`);
  const tw = str.length * cell * (cap / 10);
  const tx = (w - tw) / 2, ty = (h - cap) / 2;
  const d = text(str, tx, ty, cap, { mono: cell });
  defs.push(`<path id="tx_${id}" d="${d}"/>`);
  const sw = cap * (red ? 0.17 : 0.15);
  const rim = red ? C.tapeRim : '#000000';
  const face = red ? C.tapeFace : '#f1f1ee';
  const cut = Math.min(5, h * 0.12);
  return `<g transform="translate(${x} ${y}) rotate(${rot} ${w / 2} ${h / 2})">` +
    `<path d="M2 ${3 + 2}H${w + 2}V${h + 3}H2Z" fill="#081a36" opacity=".35"/>` +
    `<path d="M0 0H${w}L${w - cut * 0.4} ${h / 2}L${w} ${h}H0L${cut * 0.4} ${h / 2}Z" fill="url(#${gid})"/>` +
    `<path d="M0 1.2H${w}" stroke="#ffffff" stroke-opacity="${red ? 0.28 : 0.14}" stroke-width="1.4"/>` +
    `<g fill="none" stroke-linecap="round" stroke-linejoin="round">` +
    `<use href="#tx_${id}" transform="translate(${r2(cap * 0.03)} ${r2(cap * 0.04)})" stroke="${rim}" stroke-opacity=".75" stroke-width="${r2(sw * 1.12)}"/>` +
    `<use href="#tx_${id}" transform="translate(${r2(-cap * 0.018)} ${r2(-cap * 0.022)})" stroke="#ffffff" stroke-width="${r2(sw)}"/>` +
    `<use href="#tx_${id}" stroke="${face}" stroke-width="${r2(sw * 0.86)}"/>` +
    `</g></g>`;
}
box.push(tape({ x: 66, y: 142, w: 452, h: 88, rot: -1.2, str: 'CASTAWAY', cap: 54, cell: 8.9, kind: 'red', id: 'name' }));
box.push(tape({ x: 548, y: 144, w: 222, h: 32, rot: 0.9, str: 'ISLAND TONE PAD', cap: 14, cell: 9.4, kind: 'blk', id: 't1' }));
box.push(tape({ x: 556, y: 188, w: 250, h: 32, rot: -0.7, str: 'NO SAMPLES INSIDE', cap: 14, cell: 9.4, kind: 'blk', id: 't2' }));

// ---- IDLE button (set apart) and the speaker grille ----
{
  const cx = 852, cy = 187;
  box.push(`<circle cx="${cx}" cy="${cy}" r="36" fill="#1b3a73"/><circle cx="${cx}" cy="${cy}" r="33" fill="#c7ccd5" stroke="#7d8696" stroke-width="1.4"/>`);
  defs.push(`<radialGradient id="btn" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#ff9b84"/><stop offset=".7" stop-color="${C.coral}"/><stop offset="1" stop-color="#b84a3a"/></radialGradient>`);
  defs.push(`<radialGradient id="btnGlow"><stop offset="0" stop-color="#ffcf8a" stop-opacity=".9"/><stop offset=".6" stop-color="#ffb000" stop-opacity=".35"/><stop offset="1" stop-color="#ffb000" stop-opacity="0"/></radialGradient>`);
  box.push(`<circle cx="${cx}" cy="${cy}" r="58" fill="url(#btnGlow)" ${vis(beatsToSec(idleLamp))}/>`);
  box.push(`<circle cx="${cx}" cy="${cy + 3}" r="26" fill="#8f3a2c"/><circle cx="${cx}" cy="${cy}" r="26" fill="url(#btn)"/>`);
  box.push(`<circle cx="${cx}" cy="${cy}" r="26" fill="#ffe2a8" ${vis(beatsToSec(idleLamp))} fill-opacity=".5"/>`);
  box.push(`<path d="${text('IDLE', cx, cy - 6, 12, { align: 'c', track: 2.8 })}" fill="none" stroke="#5a1d14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`);
  // speaker grille: rings of holes
  const gx = 936, gy = 187;
  let holes = '';
  const ringsN = [[0, 1], [9, 6], [18, 12], [27, 18], [36, 24]];
  for (const [rr, n] of ringsN) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (rr ? 0.26 : 0);
      holes += `M${r1(gx + Math.cos(a) * rr)} ${r1(gy + Math.sin(a) * rr)}h0`;
    }
  }
  box.push(`<circle cx="${gx}" cy="${gy}" r="42" fill="#28589f" stroke="#16397a" stroke-width="1.5"/>`);
  defs.push(`<path id="holes" d="${holes}"/>`);
  box.push(`<g stroke-linecap="round"><use href="#holes" stroke="#0a1730" stroke-width="5.4"/><use href="#holes" stroke="#4f80c8" stroke-width="5.4" transform="translate(0 1.4)" opacity=".55"/><use href="#holes" stroke="#081327" stroke-width="5"/></g>`);
}

// ---- the keypad plate ----
const KP = { x: 60, y: 250, w: 462, h: 416 };
const KX0 = 144, KY0 = 300, KW = 80, KH = 70, KG = 14;
const colX = (ci) => KX0 + ci * (KW + KG);
const rowY = (ri) => KY0 + ri * (KH + KG);
box.push(`<rect x="${KP.x}" y="${KP.y}" width="${KP.w}" height="${KP.h}" rx="12" fill="${C.plate}" stroke="${C.plateEdge}" stroke-width="2"/>`);
box.push(`<path d="M${KP.x + 10} ${KP.y + KP.h - 1}H${KP.x + KP.w - 10}" stroke="#4f7fcb" stroke-width="1.6" opacity=".7"/>`);
// unlit tracks
{
  let tr = '';
  ROWS.forEach((_, ri) => { tr += `<rect x="${KX0 - 7}" y="${rowY(ri) - 5}" width="${4 * KW + 3 * KG + 14}" height="${KH + 10}" rx="10"/>`; });
  COLS.forEach((_, ci) => { tr += `<rect x="${colX(ci) - 5}" y="${KY0 - 7}" width="${KW + 10}" height="${4 * KH + 3 * KG + 14}" rx="10"/>`; });
  box.push(`<g fill="#17305a" opacity=".9">${tr}</g>`);
}
// lit bands, per row and per column
const rowIv = ROWS.map(() => []), colIv = COLS.map(() => []);
presses.forEach(({ t, key }) => { const [ri, ci] = keyPos[key]; rowIv[ri].push([t, t + PRESS]); colIv[ci].push([t, t + PRESS]); });
{
  defs.push(`<filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>`);
  ROWS.forEach((_, ri) => {
    if (!rowIv[ri].length) return;
    const a = vis(rowIv[ri]);
    box.push(`<g ${a}><rect x="${KX0 - 12}" y="${rowY(ri) - 10}" width="${4 * KW + 3 * KG + 24}" height="${KH + 20}" rx="14" fill="${C.amber}" opacity=".45" filter="url(#soft)"/><rect x="${KX0 - 7}" y="${rowY(ri) - 5}" width="${4 * KW + 3 * KG + 14}" height="${KH + 10}" rx="10" fill="${C.amber}"/></g>`);
  });
  COLS.forEach((_, ci) => {
    if (!colIv[ci].length) return;
    const a = vis(colIv[ci]);
    box.push(`<g ${a}><rect x="${colX(ci) - 10}" y="${KY0 - 12}" width="${KW + 20}" height="${4 * KH + 3 * KG + 24}" rx="14" fill="${C.amber}" opacity=".45" filter="url(#soft)"/><rect x="${colX(ci) - 5}" y="${KY0 - 7}" width="${KW + 10}" height="${4 * KH + 3 * KG + 14}" rx="10" fill="${C.amber}"/></g>`);
  });
}
// frequency labels (lit copies on top)
{
  const cap = 12;
  let base = '';
  const lit = [];
  COLS.forEach((f, ci) => {
    const d = text(String(f), colX(ci) + KW / 2, KY0 - 32, cap, { align: 'c', track: 2.4 });
    base += d;
    if (colIv[ci].length) lit.push([d, colIv[ci]]);
  });
  ROWS.forEach((f, ri) => {
    const d = text(String(f), KX0 - 18, rowY(ri) + KH / 2 - cap / 2, cap, { align: 'r', track: 2.4 });
    base += d;
    if (rowIv[ri].length) lit.push([d, rowIv[ri]]);
  });
  box.push(`<path d="${base}" fill="none" stroke="${C.printDim}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`);
  for (const [d, iv] of lit) box.push(`<path d="${d}" fill="none" stroke="${C.amberHot}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" ${vis(iv)}/>`);
  box.push(`<path d="${text('HZ', KP.x + 18, KY0 - 32, 10, { track: 2.4 })}" fill="none" stroke="${C.printDim}" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>`);
  // caption under the pad
  const cap2 = 'A REGULAR  B OCCASIONAL  C RARE  D SUPER RARE';
  let cs = 10.5;
  while (textWidth(cap2, cs, 2.4) > 4 * KW + 3 * KG + 22) cs -= 0.25;
  box.push(`<path d="${text(cap2, KX0 + (4 * KW + 3 * KG) / 2, KP.y + KP.h - 26, cs, { align: 'c', track: 2.4 })}" fill="none" stroke="${C.print}" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>`);
}
// keys
defs.push(`<linearGradient id="keyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.key0}"/><stop offset="1" stop-color="${C.key1}"/></linearGradient>`);
defs.push(`<linearGradient id="keyAD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.keyAD0}"/><stop offset="1" stop-color="${C.keyAD1}"/></linearGradient>`);
const keyIv = {};
presses.forEach(({ t, key }) => { (keyIv[key] ||= []).push([t, t + PRESS]); });
KEYS.forEach((row, ri) => row.forEach((k, ci) => {
  const x = colX(ci), y = rowY(ri);
  const ad = ci === 3;
  const skirt = ad ? C.keyADSkirt : C.keySkirt;
  let face = `<rect x="${x}" y="${y}" width="${KW}" height="${KH - 4}" rx="9" fill="url(#${ad ? 'keyAD' : 'keyG'})"/>`;
  face += `<path d="M${x + 8} ${y + 1.6}H${x + KW - 8}" stroke="#ffffff" stroke-width="1.6" opacity=".8" stroke-linecap="round"/>`;
  const sub = SUB[k];
  const big = 26;
  const ty = sub ? y + 9 : y + (KH - 4 - big) / 2;
  face += `<path d="${text(k, x + KW / 2, ty, big, { align: 'c' })}" fill="none" stroke="${C.legend}" stroke-width="3.3" stroke-linecap="round" stroke-linejoin="round"/>`;
  if (sub) {
    const sc = ad ? 8.6 : 10;
    face += `<path d="${text(sub, x + KW / 2, y + 47, sc, { align: 'c', track: ad ? 2 : 3 })}" fill="none" stroke="${ad ? '#5d2417' : '#55524a'}" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  let pressedAttr = '';
  let glow = '';
  if (keyIv[k]) {
    const ivs = keyIv[k];
    const cls = sched(ivs, 'transform', 'translateY(3px)', 'translateY(0)');
    pressedAttr = ` class="${cls}"${isOn(ivs, RM_T) ? ' transform="translate(0 3)"' : ''}`;
    glow = `<rect x="${x}" y="${y}" width="${KW}" height="${KH - 4}" rx="9" fill="${C.amber}" fill-opacity=".22" ${vis(ivs)}/>`;
  }
  box.push(`<g><rect x="${x}" y="${y + 4}" width="${KW}" height="${KH - 4}" rx="9" fill="${skirt}"/><g${pressedAttr}>${face}${glow}</g></g>`);
}));

// ---- the scope ----
const SC = { x: 548, y: 250, w: 430, h: 248 };
const SS = { x: 562, y: 264, w: 402, h: 214 };
const PX0 = 574, PX1 = 952;           // plot area
const TB = 0.008;                      // 8 ms across
const BANDS = { lo: { cy: 309, amp: 15 }, hi: { cy: 369, amp: 15 }, sum: { cy: 441, amp: 14 } };
const LABY = { lo: 276, hi: 336, sum: 397 };
defs.push(`<radialGradient id="crt" cx=".5" cy=".5" r=".75"><stop offset="0" stop-color="#0d2a1a"/><stop offset="1" stop-color="${C.screen}"/></radialGradient>`);
defs.push(`<clipPath id="scr"><rect x="${SS.x}" y="${SS.y}" width="${SS.w}" height="${SS.h}" rx="8"/></clipPath>`);
box.push(`<rect x="${SC.x}" y="${SC.y}" width="${SC.w}" height="${SC.h}" rx="12" fill="#1c2128" stroke="#0d1015" stroke-width="2"/>`);
box.push(`<path d="M${SC.x + 10} ${SC.y + 1.5}H${SC.x + SC.w - 10}" stroke="#4a525e" stroke-width="1.5"/>`);
box.push(`<rect x="${SS.x}" y="${SS.y}" width="${SS.w}" height="${SS.h}" rx="8" fill="url(#crt)"/>`);
{
  // graticule
  let g = '';
  for (let i = 0; i <= 10; i++) { const x = PX0 + ((PX1 - PX0) * i) / 10; g += `M${r1(x)} ${SS.y + 6}V${SS.y + SS.h - 6}`; }
  let c = '';
  for (const b of Object.values(BANDS)) c += `M${PX0} ${b.cy}H${PX1}`;
  box.push(`<g clip-path="url(#scr)"><path d="${g}" stroke="#1b5a35" stroke-width="1" opacity=".55"/><path d="${c}" stroke="#1f6a3e" stroke-width="1" stroke-dasharray="2 4" opacity=".8"/></g>`);
  // band labels
  const lab = (s, y) => text(s, SS.x + 12, y, 11, { track: 2.4 });
  box.push(`<path d="${lab('LOW', LABY.lo)}${lab('HIGH', LABY.hi)}${lab('SUM', LABY.sum)}" fill="none" stroke="${C.phosphor}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" opacity=".75"/>`);
  box.push(`<path d="${text('HZ', SS.x + 110, LABY.lo, 11, { track: 2.4 })}${text('HZ', SS.x + 110, LABY.hi, 11, { track: 2.4 })}" fill="none" stroke="${C.phosphor}" stroke-width="1.4" stroke-linecap="round" opacity=".55"/>`);
  box.push(`<path d="${text('0.8 MS/DIV', SC.x + SC.w - 14, SC.y + SC.h - 12, 8, { align: 'r', track: 2.4 })}${text('SCOPE', SC.x + 14, SC.y + SC.h - 12, 8, { track: 2.6 })}" fill="none" stroke="#8d97a6" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>`);
}
// traces: exact sums of sines as cubic Hermite segments
function traceD(freqs, amp, cy) {
  const Wp = PX1 - PX0;
  const fmax = Math.max(...freqs);
  const n = Math.ceil(TB * fmax * 4);
  const yv = (t) => cy - amp * freqs.reduce((s, f) => s + Math.sin(2 * Math.PI * f * t), 0);
  const dyt = (t) => -amp * freqs.reduce((s, f) => s + 2 * Math.PI * f * Math.cos(2 * Math.PI * f * t), 0);
  const dxdt = Wp / TB;
  const R = (v) => Math.round(v * 10) / 10;
  let px = R(PX0), py = R(yv(0));
  let d = `M${r1(px)} ${r1(py)}c`;
  const parts = [];
  for (let i = 0; i < n; i++) {
    const t0 = (i / n) * TB, t1 = ((i + 1) / n) * TB;
    const x0 = PX0 + dxdt * t0, x1 = PX0 + dxdt * t1;
    const h = (x1 - x0) / 3;
    const s0 = dyt(t0) / dxdt, s1 = dyt(t1) / dxdt;
    const y0 = yv(t0), y1 = yv(t1);
    const c1x = R(x0 + h), c1y = R(y0 + s0 * h), c2x = R(x1 - h), c2y = R(y1 - s1 * h);
    const ex = R(x1), ey = R(y1);
    parts.push(r1(c1x - px), r1(c1y - py), r1(c2x - px), r1(c2y - py), r1(ex - px), r1(ey - py));
    px = ex; py = ey;
  }
  return d + nums(parts);
}
{
  const traces = new Map();   // id -> {d, ivs}
  const want = (id, freqs, band, iv) => {
    if (!traces.has(id)) traces.set(id, { d: traceD(freqs, BANDS[band].amp, BANDS[band].cy), ivs: [] });
    traces.get(id).ivs.push(iv);
  };
  const labels = new Map();  // number string -> {band, ivs}
  const wantLab = (band, n, iv) => {
    const k = band + n;
    if (!labels.has(k)) labels.set(k, { band, n, ivs: [] });
    labels.get(k).ivs.push(iv);
  };
  const allOn = [];
  for (const s of scopeStates) {
    const lo = s.exact ? s.exact[0] : s.lo, hi = s.exact ? s.exact[1] : s.hi;
    const iv = [s.on, s.off];
    want(`tl${s.lo}`, [lo], 'lo', iv);
    want(`th${s.hi}`, [hi], 'hi', iv);
    want(`ts${s.lo}_${s.hi}`, [lo, hi], 'sum', iv);
    wantLab('lo', String(s.lo), iv);
    wantLab('hi', String(s.hi), iv);
    allOn.push(iv);
  }
  const offIv = [];
  {
    const m = merge(allOn);
    let t = 0;
    for (const [a, b] of m) { if (a > t) offIv.push([t, a]); t = b; }
    if (t < LOOP) offIv.push([t, LOOP]);
  }
  let defsT = '';
  for (const [id, { d }] of traces) defsT += `<path id="${id}" d="${d}"/>`;
  defs.push(defsT);
  const flat = `M${PX0} ${BANDS.lo.cy}H${PX1}M${PX0} ${BANDS.hi.cy}H${PX1}M${PX0} ${BANDS.sum.cy}H${PX1}`;
  defs.push(`<path id="tflat" d="${flat}"/>`);
  const layer = (sw, col, op) => {
    let s = `<g fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}">`;
    s += `<use href="#tflat" ${vis(offIv)}/>`;
    for (const [id, { ivs }] of traces) s += `<use href="#${id}" ${vis(ivs)}/>`;
    return s + '</g>';
  };
  box.push(`<g clip-path="url(#scr)">${layer(7, C.phosphor, 0.16)}${layer(2.4, C.phosphor, 0.95)}${layer(0.9, C.phosphorCore, 0.9)}</g>`);
  // the Hz numbers
  let ls = `<g fill="none" stroke="${C.phosphor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">`;
  const numR = SS.x + 101;   // numbers right-aligned here, HZ follows
  const yOf = { lo: LABY.lo, hi: LABY.hi };
  const numDefs = new Set();
  for (const { band, n, ivs } of labels.values()) {
    if (!numDefs.has(n)) { defs.push(`<path id="n${n}" d="${text(n, 0, 0, 11, { track: 2.4 })}"/>`); numDefs.add(n); }
    ls += `<use href="#n${n}" x="${r1(numR - textWidth(n, 11, 2.4))}" y="${yOf[band]}" ${vis(ivs)}/>`;
  }
  defs.push(`<path id="ndash" d="${text('---', 0, 0, 11, { track: 2.4 })}"/>`);
  const dx = r1(numR - textWidth('---', 11, 2.4));
  ls += `<use href="#ndash" x="${dx}" y="${yOf.lo}" ${vis(offIv)}/><use href="#ndash" x="${dx}" y="${yOf.hi}" ${vis(offIv)}/>`;
  box.push(ls + '</g>');
  // a soft scanline sheen over the tube
  defs.push(`<linearGradient id="glass" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".09"/><stop offset=".5" stop-color="#fff" stop-opacity=".02"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`);
  box.push(`<rect x="${SS.x}" y="${SS.y}" width="${SS.w}" height="${SS.h}" rx="8" fill="url(#glass)"/>`);
}

// ---- lamps ----
{
  const ly = 524;
  const cols = { DIAL: '#5dff8f', RING: C.amber, LINE: '#5dff8f', HOLD: '#ff5a40' };
  const offc = { DIAL: '#1f4a2c', RING: '#4a3810', LINE: '#1f4a2c', HOLD: '#4d1a14' };
  Object.keys(lamps).forEach((name, i) => {
    const x = SC.x + 16 + i * 106;
    const ivs = beatsToSec(lamps[name]);
    box.push(`<circle cx="${x}" cy="${ly}" r="8.5" fill="#0d1a33"/><circle cx="${x}" cy="${ly}" r="6.5" fill="${offc[name]}"/>`);
    if (!defs.some((d) => d.includes(`id="lg${name}"`))) defs.push(`<radialGradient id="lg${name}"><stop offset=".3" stop-color="${cols[name]}" stop-opacity=".55"/><stop offset="1" stop-color="${cols[name]}" stop-opacity="0"/></radialGradient>`);
    box.push(`<g ${vis(ivs)}><circle cx="${x}" cy="${ly}" r="17" fill="url(#lg${name})"/><circle cx="${x}" cy="${ly}" r="6.5" fill="${cols[name]}"/><circle cx="${x - 2}" cy="${ly - 2}" r="2.2" fill="#ffffff" opacity=".8"/></g>`);
    box.push(`<path d="${text(name, x + 16, ly - 6, 12, { track: 2.6 })}" fill="none" stroke="${C.print}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`);
  });
}

// ---- the dot-matrix readout ----
{
  const RD = { x: 548, y: 548, w: 430, h: 118 };
  const p = 4.2;
  const cols = 16, rows = 16;
  const x0 = RD.x + (RD.w - (cols * 6 - 2) * p) / 2;
  const y0 = RD.y + (RD.h - (rows - 1) * p) / 2;
  box.push(`<rect x="${RD.x}" y="${RD.y}" width="${RD.w}" height="${RD.h}" rx="10" fill="#1d1112" stroke="#0d0707" stroke-width="2"/>`);
  box.push(`<rect x="${RD.x + 10}" y="${RD.y + 10}" width="${RD.w - 20}" height="${RD.h - 20}" rx="6" fill="${C.ledWin}"/>`);
  // unlit dots, as a pattern: 5x7 per cell, 6x9 pitch
  let pd = '';
  for (let j = 0; j < 7; j++) for (let i = 0; i < 5; i++) pd += `M${r2(p / 2 + i * p)} ${r2(p / 2 + j * p)}h0`;
  defs.push(`<pattern id="ledOff" x="${r2(x0 - p / 2)}" y="${r2(y0 - p / 2)}" width="${r2(6 * p)}" height="${r2(9 * p)}" patternUnits="userSpaceOnUse"><path d="${pd}" stroke="${C.ledOff}" stroke-width="3" stroke-linecap="round"/></pattern>`);
  box.push(`<rect x="${r2(x0 - p / 2)}" y="${r2(y0 - p / 2)}" width="${r2(cols * 6 * p - p)}" height="${r2(16 * p)}" fill="url(#ledOff)"/>`);
  // glyph defs
  const used = new Set();
  for (const m of readout) for (const ch of m.str) if (ch !== ' ') used.add(ch);
  for (const ch of used) {
    const rowsB = LED[ch];
    if (!rowsB) throw new Error('no LED glyph ' + ch);
    let d = '';
    rowsB.split(' ').forEach((bits, j) => [...bits].forEach((b, i) => { if (b === '1') d += `M${r2(i * p)} ${r2(j * p)}h0`; }));
    defs.push(`<path id="L${ch.charCodeAt(0)}" d="${d}"/>`);
  }
  // one group per message
  let mi = 0;
  let uses = '';
  for (const m of readout) {
    let g = '';
    [...m.str].forEach((ch, i) => {
      if (ch === ' ') return;
      g += `<use href="#L${ch.charCodeAt(0)}" x="${r2(x0 + (m.col + i) * 6 * p)}" y="${r2(y0 + m.line * 9 * p)}"/>`;
    });
    const id = `m${mi++}`;
    defs.push(`<g id="${id}">${g}</g>`);
    uses += `<use href="#${id}" ${vis([[m.on, m.off]])}/>`;
  }
  box.push(`<g fill="none" stroke-linecap="round"><g stroke="${C.led}" stroke-width="8" opacity=".22">${uses}</g><g stroke="${C.led}" stroke-width="3.6">${uses}</g><g stroke="${C.ledHot}" stroke-width="1.3" opacity=".75">${uses}</g></g>`);
  box.push(`<rect x="${RD.x + 10}" y="${RD.y + 10}" width="${RD.w - 20}" height="${RD.h - 20}" rx="6" fill="url(#glass)"/>`);
}

// maker's mark, small, along the bottom edge
box.push(`<path d="${text('ONE BAR EXCHANGE · HAND-BUILT ON THE ISLAND · DAYTIME USE ONLY', BX + BW / 2, BY + BH - 15, 8, { align: 'c', track: 2.8 })}" fill="none" stroke="#a9c3ea" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round" opacity=".75"/>`);

// cloud shadow drifting over everything on the ground
const shadeLayer = `<g class="cshade" transform="translate(${r1(-420 + 2120 * (30 / 96))} 0)"><ellipse cx="0" cy="480" rx="330" ry="150" fill="url(#cloudShade)"/></g>`;
css.push(`@keyframes cshade{from{transform:translateX(-420px)}to{transform:translateX(1700px)}}.cshade{animation:cshade 96s linear ${r3(-30 - AT)}s infinite}`);

// ---------------------------------------------------------------------------
// Assemble
// ---------------------------------------------------------------------------
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="ttl">
<title id="ttl">CASTAWAY: a hand-built tone pad on the island, dialling CAST AWAY</title>
<style>
${css.join('\n')}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
<defs>${defs.join('\n')}</defs>
<g clip-path="url(#frame)">
${body.join('\n')}
${box.join('\n')}
${shadeLayer}
</g>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="19" fill="none" stroke="#0b2a4a" stroke-opacity=".35" stroke-width="2"/>
</svg>
`;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB, ${kfN} schedules)`);
