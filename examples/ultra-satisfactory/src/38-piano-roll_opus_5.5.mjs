#!/usr/bin/env node
// Piano roll / falling notes: README header generator for ULTRA-SATISFACTORY.
//
//   node examples/ultra-satisfactory/src/38-piano-roll_opus_5.5.mjs
//
// Writes examples/ultra-satisfactory/assets/38-piano-roll_opus_5.5.svg.
// Plain Node, no dependencies, no randomness, no clock: the same bytes every run.
//
// The style is the falling-note piano roll (the family that runs from the Music
// Animation Machine through Synthesia-type visualisers to black MIDI): pitch across,
// time down, every note a flat bar, a keyboard along the bottom whose keys light
// in the bar's colour as it lands. Nothing here is copied from any of those
// programs, and no real tune is transcribed.
//
// What the roll plays is the app's recipe book, all of it:
//   * 211 notes, one for every machine recipe in data/data.json (88 alternates
//     included, drawn hollow). No recipe is left out and none is played twice;
//     the generator throws if that is ever not true.
//   * A bar's length is that recipe's cycle time, at 1 px per second. The longest
//     recipe in the book (the Uranium Fuel Unit alternate, 300 s) lasts the whole
//     300 s phrase; a 1 s Packager recipe is a tick.
//   * Colour is the machine. The nine machines sit left to right from the slowest
//     average cycle (Particle Accelerator, 100 s) to the fastest (Smelter, 2.5 s),
//     so the slow ones are the bass.
//   * The labelled bars are the long ones; a purple diamond marks the parts the
//     Space Elevator asks for in Phases 1 to 4 (Phase 5's parts have no machine
//     recipe in the data, so no note). Which key a recipe lands on, and when it
//     comes in, is arrangement, not data.
// After the phrase comes a 100 s title card: ULTRA SATISFACTORY spelled in notes
// (a black-MIDI picture in miniature, 80 of the 88 keys wide). The roll window is
// exactly one period tall (400 px), so a whole title is on screen at load, and the
// loop (32 s, 12.5 px/s, i.e. the factory at 12.5x) closes without a jump.
//
// Motion: one CSS translate moves the whole roll. Each key's light is its own
// step-end keyframe set computed from the same note list, so keys and bars cannot
// drift apart; the "recipes played" counter is three digit strips stepped the same
// way. White bars light their keys gold (white on ivory would not show).
// prefers-reduced-motion stops everything on the first frame, opening chord lit,
// with the counter reading 211.
//
// Lettering is an original monoline stroke face defined below (paths, never <text>).
//
// Data checked against the app on 2026-09-30 (ultra_satisfactory.data.load_data()):
// 211 recipes with inMachine, 88 of them alternate, cycle times as listed in BOOK.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '38-piano-roll_opus_5.5';
const OUT = path.resolve(HERE, `../assets/${SLUG}.svg`);

// ------------------------------------------------------------------ the book
// "cycle seconds:recipe name", * = alternate. Straight from data/data.json
// (recipes with inMachine), grouped by the machine in producedIn.
const BOOK = {
  'Particle Accelerator': '60:Plutonium Pellet;120:Instant Plutonium Cell*;120:Nuclear Pasta',
  Manufacturer: '8:Beacon;8:Classic Battery*;8:Gas Filter;12:Explosive Rebar;12:Infused Uranium Cell*;12:Turbo Rifle Ammo;16:Caterium Computer*;16:Flexible Framework*;16:Heavy Flexible Frame*;16:High-Speed Connector;16:Iodine Infused Filter;16:Radio Connection Unit*;24:Computer;24:Plastic Smart Plating*;30:Heavy Modular Frame;32:Automated Speed Wiring*;32:Insulated Crystal Oscillator*;32:Supercomputer;32:Turbo Motor;32:Turbo Pressure Motor*;40:Radio Control System*;40:Silicon High-Speed Connector*;48:Radio Control Unit;48:Rigour Motor*;50:Super-State Computer*;60:Automated Miner*;60:Modular Engine;64:Heavy Encased Frame*;64:Turbo Electric Motor*;120:Adaptive Control Unit;120:Crystal Beacon*;120:Crystal Oscillator;120:Magnetic Field Generator;120:Nuke Nobelisk;120:Thermal Propulsion Rocket;150:Uranium Fuel Rod;240:Plutonium Fuel Rod;300:Uranium Fuel Unit*',
  Assembler: '4:Black Powder;4:Coated Iron Canister*;4:Fabric;6:Alclad Aluminum Sheet;6:Heat Exchanger*;6:Nobelisk;6:Stun Rebar;8:Alclad Casing*;8:Circuit Board;8:Fused Quickwire*;8:Heat Sink;10:Encased Industrial Beam;12:AI Limiter;12:Bolted Iron Plate*;12:Coated Iron Plate*;12:Compacted Coal*;12:Electrode Circuit Board*;12:Encased Plutonium Cell;12:Gas Nobelisk;12:Insulated Cable*;12:Motor;12:Reinforced Iron Plate;12:Rifle Ammo;12:Rubber Concrete*;12:Shatter Rebar;12:Stator;12:Steel Rotor*;15:Electromagnetic Connection Rod*;15:Encased Industrial Pipe*;15:Quickwire Stator*;15:Rotor;16:Adhered Iron Plate*;16:Cheap Silica*;16:Copper Rotor*;16:Electric Motor*;16:Fine Black Powder*;20:Fused Wire*;20:OC Supercomputer*;24:Automated Wiring;24:Bolted Frame*;24:Cluster Nobelisk;24:Fine Concrete*;24:Homing Rifle Ammo;24:Quickwire Cable*;24:Silicon Circuit Board*;24:Steel Coated Plate*;24:Versatile Framework;30:Electromagnetic Control Rod;30:Smart Plating;32:Stitched Iron Plate*;48:Caterium Circuit Board*;60:Modular Frame;60:Pressure Conversion Cube;60:Pulse Nobelisk;60:Steeled Frame*;64:Crystal Computer*;80:Assembly Director System;120:Plutonium Fuel Unit*',
  Blender: '3:Battery;6:Diluted Fuel*;6:Instant Scrap*;6:Nitric Acid;8:Turbo Blend Fuel*;10:Cooling System;12:Encased Uranium Cell;12:Fertile Uranium*;12:Turbo Rifle Ammo;20:Heat-Fused Frame*;24:Non-fissile Uranium;32:Cooling Device*;40:Fused Modular Frame',
  Foundry: '3:Solid Steel Ingot*;4:Aluminum Ingot;4:Steel Ingot;6:Iron Alloy Ingot*;12:Coke Steel Ingot*;12:Copper Alloy Ingot*;16:Compacted Steel Ingot*',
  Refinery: '1:Aluminum Scrap;2:Diluted Packaged Fuel*;2:Polyester Fabric*;3:Sloppy Alumina*;3:Wet Concrete*;4:Electrode Aluminum Scrap*;4:Liquid Biofuel;5:Pure Caterium Ingot*;6:Alumina Solution;6:Fuel;6:Heavy Oil Residue*;6:Petroleum Coke;6:Plastic;6:Polymer Resin*;6:Residual Fuel;6:Residual Plastic;6:Residual Rubber;6:Rubber;6:Smokeless Powder;6:Sulfuric Acid;8:Coated Cable*;8:Pure Quartz Crystal*;8:Steamed Copper Sheet*;8:Turbo Heavy Fuel*;12:Pure Iron Ingot*;12:Recycled Plastic*;12:Recycled Rubber*;16:Turbofuel*;24:Pure Copper Ingot*',
  Constructor: '1:Empty Fluid Tank;2:Aluminum Casing;2:Cable;3:Hatcher Protein;3:Hog Protein;3:Spitter Protein;3:Steel Canister*;3:Stinger Protein;4:Biomass (Alien Protein);4:Biomass (Mycelia);4:Biomass (Wood);4:Caterium Wire*;4:Charcoal*;4:Concrete;4:Empty Canister;4:Iron Rebar;4:Iron Rod;4:Solid Biofuel;4:Steel Beam;4:Wire;5:Biomass (Leaves);5:Quickwire;5:Steel Rod*;6:Alien DNA Capsule;6:Color Cartridge;6:Copper Powder;6:Copper Sheet;6:Iron Plate;6:Screw;6:Steel Pipe;8:Biocoal*;8:Power Shard (1);8:Quartz Crystal;8:Silica;12:Power Shard (2);12:Steel Screw*;24:Cast Screw*;24:Iron Wire*;24:Power Shard (5)',
  Packager: '1:Packaged Alumina Solution;1:Packaged Nitrogen Gas;1:Unpackage Alumina Solution;1:Unpackage Nitrogen Gas;1:Unpackage Sulfuric Acid;1:Unpackage Water;2:Packaged Nitric Acid;2:Packaged Water;2:Unpackage Fuel;2:Unpackage Liquid Biofuel;2:Unpackage Oil;3:Packaged Fuel;3:Packaged Liquid Biofuel;3:Packaged Sulfuric Acid;3:Unpackage Nitric Acid;4:Packaged Heavy Oil Residue;4:Packaged Oil;6:Packaged Turbofuel;6:Unpackage Heavy Oil Residue;6:Unpackage Turbofuel',
  Smelter: '2:Copper Ingot;2:Iron Ingot;2:Pure Aluminum Ingot*;4:Caterium Ingot',
};

// Machines left to right = slowest average cycle to fastest. `lanes` is [first, count].
const MACHINES = [
  { key: 'Particle Accelerator', short: 'PARTICLE ACCELERATOR', col: '#ff4f8b', lanes: [0, 6] },
  { key: 'Manufacturer', short: 'MANUFACTURER', col: '#ff7a45', lanes: [6, 18] },
  { key: 'Assembler', short: 'ASSEMBLER', col: '#ffb02e', lanes: [24, 24] },
  { key: 'Blender', short: 'BLENDER', col: '#e8d44d', lanes: [48, 7] },
  { key: 'Foundry', short: 'FOUNDRY', col: '#a3e635', lanes: [55, 5] },
  { key: 'Refinery', short: 'REFINERY', col: '#4ade80', lanes: [60, 8] },
  { key: 'Constructor', short: 'CONSTRUCTOR', col: '#2dd4bf', lanes: [68, 10] },
  { key: 'Packager', short: 'PACKAGER', col: '#60a5fa', lanes: [78, 5] },
  { key: 'Smelter', short: 'SMELTER', col: '#a78bfa', lanes: [83, 5] },
];
const M = Object.fromEntries(MACHINES.map((m) => [m.key, m]));
for (const m of MACHINES) {
  m.recipes = BOOK[m.key].split(';').map((s) => {
    const i = s.indexOf(':');
    const alt = s.endsWith('*');
    return { dur: +s.slice(0, i), name: s.slice(i + 1, alt ? -1 : undefined), alt, used: false, m };
  });
  m.total = m.recipes.reduce((a, r) => a + r.dur, 0);
  m.avg = m.total / m.recipes.length;
}
const ALL = MACHINES.flatMap((m) => m.recipes);
const N_RECIPES = ALL.length;
const N_ALT = ALL.filter((r) => r.alt).length;
const TOTAL_S = ALL.reduce((a, r) => a + r.dur, 0);
if (N_RECIPES !== 211 || N_ALT !== 88) throw new Error(`book is ${N_RECIPES} recipes / ${N_ALT} alternates, expected 211 / 88`);
for (let i = 1; i < MACHINES.length; i++) if (MACHINES[i].avg >= MACHINES[i - 1].avg) throw new Error('machines are not ordered slowest to fastest');

// ------------------------------------------------------------------ geometry
const W = 830;
const LANES = 88, LW = 9;
const X0 = 23, X1 = X0 + LANES * LW;        // roll: x 23..815
const ROLL_Y = 76;
const PHRASE = 300;                         // seconds = px: the longest recipe
const TITLE_ZONE = 100;                     // px of title card after the phrase
const P = PHRASE + TITLE_ZONE;              // one period = the roll window height
const KEY_Y = ROLL_Y + P;                   // the now-line
const WK_H = 52, BK_H = 32;
const LOOP = 32;                            // seconds: 12.5 px/s
const H = KEY_Y + WK_H + 49;
const lx = (lane) => X0 + lane * LW;

// ------------------------------------------------------------------ palette
const C = {
  panel: '#111217', roll: '#191a21', rollDark: '#14151b', grid: '#ffffff',
  ink: '#eef0f6', dim: '#9aa0b4', faint: '#666c80', rule: '#838aa0',
  cyan: '#00cfff', white: '#f3f5fa', gold: '#e8d44d',
  obj: '#a855f7', itm: '#ec4899', bld: '#38bdf8', objLight: '#c89bff',
  wkey: '#e7e4dc', wkeyEdge: '#9c998f', bkey: '#1b1c23', keyInk: '#77746b',
};

// ------------------------------------------------------------------ helpers
const f = (n) => { const s = (Math.round(n * 100) / 100).toString(); return s === '-0' ? '0' : s; };
const pct = (frac) => `${+(frac * 100).toFixed(3)}%`;

// ------------------------------------------------------------------ the face
// Monoline, cap height 10, y = 0 cap line, y = 10 baseline. [advance width, path].
const RND_O = 'M2.4 0H3.4Q5.8 0 5.8 2.4V7.6Q5.8 10 3.4 10H2.4Q0 10 0 7.6V2.4Q0 0 2.4 0Z';
const GLYPHS = {
  A: [6, 'M0 10L3 0L6 10M1.1 6.6H4.9'],
  B: [5.6, 'M0 0V10H3.2Q5.6 10 5.6 7.4Q5.6 4.8 3.2 4.8H0M3 4.8Q5.2 4.8 5.2 2.4Q5.2 0 3 0H0'],
  C: [5.6, 'M5.6 2.4Q5.6 0 3.3 0H2.4Q0 0 0 2.4V7.6Q0 10 2.4 10H3.3Q5.6 10 5.6 7.6'],
  D: [5.8, 'M0 0H2.8Q5.8 0 5.8 3V7Q5.8 10 2.8 10H0Z'],
  E: [5, 'M5 0H0V10H5M0 4.9H4'],
  F: [5, 'M5 0H0V10M0 4.9H4'],
  G: [5.8, 'M5.6 2.4Q5.6 0 3.3 0H2.4Q0 0 0 2.4V7.6Q0 10 2.4 10H3.4Q5.8 10 5.8 7.6V5.3H3.2'],
  H: [5.8, 'M0 0V10M5.8 0V10M0 4.9H5.8'],
  I: [0, 'M0 0V10'],
  J: [4.2, 'M4.2 0V7.7Q4.2 10 2.1 10Q0 10 0 7.9'],
  K: [5.6, 'M0 0V10M5.4 0L0 6.2M2.1 4.2L5.6 10'],
  L: [4.6, 'M0 0V10H4.6'],
  M: [7, 'M0 10V0L3.5 6L7 0V10'],
  N: [5.8, 'M0 10V0L5.8 10V0'],
  O: [5.8, RND_O],
  P: [5.6, 'M0 10V0H3.2Q5.6 0 5.6 2.8Q5.6 5.6 3.2 5.6H0'],
  Q: [5.8, `${RND_O}M3.4 7.2L6.2 10.6`],
  R: [5.6, 'M0 10V0H3.2Q5.6 0 5.6 2.7Q5.6 5.4 3.2 5.4H0M3 5.4L5.6 10'],
  S: [5.6, 'M5.4 2.2Q5.4 0 3.2 0H2.4Q0.1 0 0.1 2.4Q0.1 4.8 2.4 4.8H3.2Q5.6 4.8 5.6 7.4Q5.6 10 3.2 10H2.4Q0 10 0 7.8'],
  T: [5.6, 'M0 0H5.6M2.8 0V10'],
  U: [5.8, 'M0 0V7.6Q0 10 2.4 10H3.4Q5.8 10 5.8 7.6V0'],
  V: [6, 'M0 0L3 10L6 0'],
  W: [8.4, 'M0 0L2 10L4.2 2.4L6.4 10L8.4 0'],
  X: [5.6, 'M0 0L5.6 10M5.6 0L0 10'],
  Y: [5.6, 'M0 0L2.8 5.2L5.6 0M2.8 5.2V10'],
  Z: [5.4, 'M0 0H5.4L0 10H5.4'],
  0: [5.4, 'M2.7 0Q5.4 0 5.4 3V7Q5.4 10 2.7 10Q0 10 0 7V3Q0 0 2.7 0Z'],
  1: [2.6, 'M0 2.1L2.6 0V10'],
  2: [5.2, 'M0 2.4Q0 0 2.6 0Q5.2 0 5.2 2.5Q5.2 4.2 3.6 5.8L0 10H5.2'],
  3: [5.2, 'M0 1.8Q0.6 0 2.6 0Q5 0 5 2.4Q5 4.8 2.8 4.8H2M2.8 4.8Q5.2 4.8 5.2 7.4Q5.2 10 2.6 10Q0.5 10 0 8.2'],
  4: [5.6, 'M4.2 10V0L0 7H5.6'],
  5: [5.2, 'M4.9 0H0.7L0.3 4.5Q1.3 3.8 2.6 3.8Q5.2 3.8 5.2 6.9Q5.2 10 2.6 10Q0.6 10 0 8.3'],
  6: [5.2, 'M4.7 1.3Q4 0 2.7 0Q0 0 0 3.4V7Q0 10 2.6 10Q5.2 10 5.2 7.1Q5.2 4.3 2.7 4.3Q0.8 4.3 0 6'],
  7: [5, 'M0 0H5L1.8 10'],
  8: [5.2, 'M2.6 0Q0.4 0 0.4 2.4Q0.4 4.7 2.6 4.7Q4.8 4.7 4.8 2.4Q4.8 0 2.6 0ZM2.6 4.7Q0 4.7 0 7.4Q0 10 2.6 10Q5.2 10 5.2 7.4Q5.2 4.7 2.6 4.7Z'],
  9: [5.2, 'M0.5 8.7Q1.2 10 2.5 10Q5.2 10 5.2 6.6V3Q5.2 0 2.6 0Q0 0 0 2.9Q0 5.7 2.5 5.7Q4.4 5.7 5.2 4'],
  '.': [0, 'M0 9.9V10'],
  ',': [0.8, 'M0.8 9.7L0 11.7'],
  ':': [0, 'M0 2.9V3.6M0 9.3V10'],
  '-': [3.2, 'M0 5.4H3.2'],
  '/': [3.8, 'M0 11L3.8 -1'],
  '·': [0, 'M0 5V5.1'],
  '+': [4.4, 'M0 5.4H4.4M2.2 3.2V7.6'],
  "'": [0, 'M0 0V2'],
  '(': [2, 'M2 -1Q0 2 0 5Q0 8 2 11'],
  ')': [2, 'M0 -1Q2 2 2 5Q2 8 0 11'],
  '=': [4.4, 'M0 3.9H4.4M0 6.9H4.4'],
  '×': [3.8, 'M0 3.6L3.8 7.4M3.8 3.6L0 7.4'],
  '!': [0, 'M0 0V6.6M0 9.9V10'],
  '?': [4.8, 'M0 2.2Q0 0 2.4 0Q4.8 0 4.8 2.3Q4.8 3.8 3.4 4.6Q2.4 5.2 2.4 6.8M2.4 9.9V10'],
};
const GAP = 2.1, SPACE = 3.6;
const glyphUse = new Map();
function gid(ch) {
  if (!GLYPHS[ch]) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
  if (!glyphUse.has(ch)) glyphUse.set(ch, `g${glyphUse.size.toString(36)}`);
  return glyphUse.get(ch);
}
function measure(str) {
  let x = 0;
  for (const ch of str) x += ch === ' ' ? SPACE : GLYPHS[ch][0] + GAP;
  return x - GAP;
}
// One run of lettering. (x, y) is the cap-line corner; cap is the cap height in px; sw the stroke in px.
function text(str, x, y, cap, col, { anchor = 'start', sw = 0.9, rot = 0, op = 1 } = {}) {
  const s = cap / 10;
  const w = measure(str) * s;
  const ox = anchor === 'start' ? 0 : anchor === 'middle' ? -w / 2 : -w;
  let pen = 0, uses = '';
  for (const ch of str) {
    if (ch === ' ') { pen += SPACE; continue; }
    uses += `<use href="#${gid(ch)}"${pen ? ` x="${f(pen)}"` : ''}/>`;
    pen += GLYPHS[ch][0] + GAP;
  }
  const tf = rot
    ? `translate(${f(x)} ${f(y)}) rotate(${rot}) translate(${f(ox)} 0) scale(${f(s)})`
    : `translate(${f(x + ox)} ${f(y)}) scale(${f(s)})`;
  return `<g class="t" transform="${tf}" stroke="${col}" stroke-width="${f(sw / s)}"${op === 1 ? '' : ` opacity="${op}"`}>${uses}</g>`;
}
const textW = (str, cap) => measure(str) * cap / 10;
const diamond = (cx, cy, r) => `M${f(cx)} ${f(cy - r)}l${f(r)} ${f(r)}l${f(-r)} ${f(r)}l${f(-r)} ${f(-r)}z`;

// ------------------------------------------------------------------ the arrangement
// Phrase time t runs 0..300 s; a note sits at period y = P - t (bottom) .. P - t - dur (top).
const notes = [];       // { lane, t, dur, col, alt, recipe }
const labels = [];      // { lane, t, str, col }
const occ = Array.from({ length: LANES }, () => []);
const isFree = (lane, t0, t1) => lane >= 0 && lane < LANES && occ[lane].every(([a, b]) => t1 <= a || t0 >= b);
function reserve(lane, t0, t1, what) {
  if (!isFree(lane, t0, t1)) throw new Error(`collision in lane ${lane} at ${t0}..${t1}: ${what}`);
  if (t0 < 0 || t1 > PHRASE) throw new Error(`outside the phrase: ${what} ${t0}..${t1}`);
  occ[lane].push([t0, t1]);
}
const LABEL_CAP = 6, MARK_W = 7.4;
// The parts the Space Elevator asks for in Phases 1 to 4 (the app's Objectives tab). Phase 5's
// four parts have no machine recipe in the data, so they have no note.
const ELEVATOR = new Set(['Smart Plating', 'Versatile Framework', 'Automated Wiring', 'Modular Frame', 'Modular Engine',
  'Adaptive Control Unit', 'Assembly Director System', 'Magnetic Field Generator', 'Nuclear Pasta', 'Thermal Propulsion Rocket']);
function labelAt(lane, t, str, col, mark = false) {
  const len = textW(str, LABEL_CAP) + (mark ? MARK_W : 0);
  let t0 = t;
  const pad = 4;                                   // air between two labels in one lane
  while (!isFree(lane, Math.max(0, t0 - pad), t0 + len + pad)) t0 += 1;
  reserve(lane, Math.max(0, t0 - pad), Math.min(PHRASE, t0 + len + pad), `label ${str}`);
  if (t0 + len > PHRASE - 1) throw new Error(`label runs off the phrase: ${str}`);
  labels.push({ lane, t: t0, str, col, mark });
}
function find(mkey, pred, what) {
  const r = M[mkey].recipes.find((x) => !x.used && pred(x));
  if (!r) throw new Error(`${mkey}: nothing left matching ${what}`);
  return r;
}
function place(r, lane, t, { label = false, labelDy = 3, side = 1 } = {}) {
  const [a, n] = r.m.lanes;
  if (lane < a || lane >= a + n) throw new Error(`${r.name}: lane ${lane} is outside the ${r.m.key} register`);
  reserve(lane, t, t + r.dur, r.name);
  r.used = true;
  notes.push({ lane, t, dur: r.dur, col: r.m.col, alt: r.alt, recipe: r });
  if (label) labelAt(lane + side, t + labelDy, `${r.name.toUpperCase()} ${r.dur} S`, r.m.col, ELEVATOR.has(r.name));
  return t + r.dur;
}
const byName = (mkey, name, lane, t, opts) => place(find(mkey, (x) => x.name === name, name), lane, t, opts);
const byDur = (mkey, dur, lane, t, opts) => place(find(mkey, (x) => x.dur === dur, `${dur} s`), lane, t, opts);
// A monophonic line: durations in order, lane from laneOf(i), `rest` seconds between notes.
function line(mkey, durs, laneOf, t0, rest) {
  let t = t0;
  durs.forEach((d, i) => {
    const r = typeof rest === 'function' ? rest(i) : rest;
    t = byDur(mkey, d, laneOf(i), t) + r;
  });
  return t;
}
// A sweep: notes start `stagger` apart on successive lanes (a diagonal band). Slides later if a slot is taken.
function sweep(mkey, durs, lanes, t0, stagger) {
  durs.forEach((d, i) => {
    const lane = lanes[i % lanes.length];
    let t = t0 + i * stagger;
    while (!isFree(lane, t, t + d)) t += 1;
    byDur(mkey, d, lane, t);
  });
}
const tri = (i, n) => { const k = i % (2 * n - 2); return k < n ? k : 2 * n - 2 - k; };   // 0..n-1..0 zigzag
const range = (a, b, step = 1) => { const out = []; for (let i = a; step > 0 ? i <= b : i >= b; i += step) out.push(i); return out; };

// --- Particle Accelerator: one voice, three notes, exactly 300 s. A staircase.
{
  const k = 'Particle Accelerator';
  byName(k, 'Nuclear Pasta', 0, 0, { label: true });
  byName(k, 'Plutonium Pellet', 2, 120, { label: true });
  byName(k, 'Instant Plutonium Cell', 4, 180, { label: true });
}
// --- Manufacturer: six organ pipes (each a full 300 s voice) and two lighter voices.
{
  const k = 'Manufacturer', b = M[k].lanes[0];
  byName(k, 'Uranium Fuel Unit', b, 0, { label: true });
  byName(k, 'Modular Engine', b + 2, 0, { label: true });
  byName(k, 'Plutonium Fuel Rod', b + 2, 60, { label: true });
  byName(k, 'Adaptive Control Unit', b + 4, 0, { label: true });
  byName(k, 'Heavy Modular Frame', b + 4, 120);
  byName(k, 'Uranium Fuel Rod', b + 4, 150, { label: true });
  byName(k, 'Thermal Propulsion Rocket', b + 6, 0, { label: true });
  byName(k, 'Magnetic Field Generator', b + 6, 120, { label: true });
  byName(k, 'Automated Miner', b + 6, 240);
  byName(k, 'Radio Control Unit', b + 8, 0);
  byName(k, 'Crystal Oscillator', b + 8, 48, { label: true });
  byName(k, 'Explosive Rebar', b + 8, 168);
  byName(k, 'Crystal Beacon', b + 8, 180, { label: true });
  byName(k, 'Heavy Encased Frame', b + 10, 0);
  byName(k, 'Nuke Nobelisk', b + 10, 64, { label: true });
  byName(k, 'Turbo Electric Motor', b + 10, 184);
  byName(k, 'Super-State Computer', b + 10, 248);
  // voice 7: exactly 300 s of 32s, 40s and a 48, rocking across three keys
  line(k, [32, 32, 48, 40, 32, 32, 40, 32, 12], (i) => b + 12 + tri(i, 3), 0, 0);
  // voice 8: the short ones, with air between them
  line(k, [24, 16, 16, 8, 8, 8, 24, 16, 16, 16, 16, 12], (i) => b + 17 - tri(i, 3), 4, 10);
}
// --- Assembler: a labelled staircase of Space Elevator parts, long notes tucked around it, then four sweeps.
{
  const k = 'Assembler', b = M[k].lanes[0];
  byName(k, 'Smart Plating', b, 0, { label: true });
  byName(k, 'Versatile Framework', b + 2, 36, { label: true });
  byName(k, 'Automated Wiring', b + 4, 66, { label: true });
  byName(k, 'Modular Frame', b + 6, 96, { label: true });
  byName(k, 'Assembly Director System', b + 8, 168, { label: true });
  // above the staircase
  byName(k, 'Plutonium Fuel Unit', b, 172);
  byName(k, 'Crystal Computer', b + 2, 204);
  byName(k, 'Steeled Frame', b + 4, 232);
  byName(k, 'Electromagnetic Control Rod', b + 6, 262);
  // below it
  byName(k, 'Pressure Conversion Cube', b + 8, 4);
  byName(k, 'Pulse Nobelisk', b + 8, 84);
  byName(k, 'Caterium Circuit Board', b + 6, 16);
  byName(k, 'Stitched Iron Plate', b + 4, 8);
  // zone B: lanes b+10 .. b+23
  const zb = range(b + 10, b + 23);
  sweep(k, Array(14).fill(12), zb, 0, 4);                                   // up
  sweep(k, Array(7).fill(24), range(b + 23, b + 11, -2), 76, 8);            // down
  sweep(k, [12, 16, 15, 16, 15, 16, 15, 16, 15, 16], Array.from({ length: 10 }, (_, i) => b + 10 + Math.round(i * 13 / 9)), 150, 6);   // up
  sweep(k, [20, 20, 10, 8, 8, 8, 8, 6, 6, 6, 6, 4, 4, 4], range(b + 23, b + 10, -1), 226, 4);   // down, tapering
}
// --- Blender: one voice, an arch.
line('Blender', [40, 3, 12, 6, 24, 8, 12, 6, 32, 10, 12, 6, 20], (i) => M.Blender.lanes[0] + tri(i, 7), 2, 8);
// --- Foundry: seven notes, plenty of waiting.
line('Foundry', [4, 4, 3, 6, 12, 12, 16], (i) => M.Foundry.lanes[0] + tri(i, 5), 14, 32);
// --- Refinery: one voice, zigzag, with a little accelerando in the middle.
line('Refinery', [24, 6, 6, 6, 12, 6, 6, 6, 8, 8, 1, 2, 2, 3, 3, 4, 4, 5, 16, 6, 6, 6, 12, 6, 6, 6, 8, 8, 12],
  (i) => M.Refinery.lanes[0] + tri(i, 8), 3, (i) => (i % 3 === 2 ? 4 : 3));
// --- Constructor: one busy voice, 39 notes, hardly a rest.
line('Constructor', [24, 4, 4, 4, 4, 6, 6, 8, 12, 3, 3, 3, 3, 3, 5, 5, 5, 24, 4, 4, 4, 4, 6, 6, 8, 8, 1, 2, 2, 12, 4, 4, 4, 4, 6, 6, 6, 8, 24],
  (i) => M.Constructor.lanes[0] + tri(i, 10), 3, (i) => (i % 7 === 6 ? 2 : 1));
// --- Packager: four flurries. Packs going up, unpacks coming down.
{
  const k = 'Packager', b = M[k].lanes[0];
  const flurry = (names, t, dir) => names.forEach((n, i) => { t = byName(k, n, dir > 0 ? b + i : b + 4 - i, t) + 1; });
  flurry(['Packaged Water', 'Packaged Fuel', 'Packaged Oil', 'Packaged Heavy Oil Residue', 'Packaged Turbofuel'], 20, 1);
  flurry(['Unpackage Turbofuel', 'Unpackage Heavy Oil Residue', 'Unpackage Oil', 'Unpackage Fuel', 'Unpackage Water'], 96, -1);
  flurry(['Packaged Alumina Solution', 'Packaged Nitrogen Gas', 'Packaged Nitric Acid', 'Packaged Liquid Biofuel', 'Packaged Sulfuric Acid'], 172, 1);
  flurry(['Unpackage Nitric Acid', 'Unpackage Liquid Biofuel', 'Unpackage Sulfuric Acid', 'Unpackage Nitrogen Gas', 'Unpackage Alumina Solution'], 246, -1);
}
// --- Smelter: four notes, ten seconds. That is the whole part.
{
  const k = 'Smelter', b = M[k].lanes[0];
  byName(k, 'Iron Ingot', b, 0);
  byName(k, 'Copper Ingot', b + 1, 74);
  byName(k, 'Caterium Ingot', b + 2, 148);
  byName(k, 'Pure Aluminum Ingot', b + 3, 224);
  labelAt(b + 4, 40, 'SMELTER: 4 NOTES, 10 S. THAT IS THE WHOLE PART', M[k].col);
}
const unused = ALL.filter((r) => !r.used);
if (unused.length || notes.length !== N_RECIPES) throw new Error(`arrangement uses ${notes.length} of ${N_RECIPES}; unused: ${unused.map((r) => `${r.m.key}/${r.name}`).join(', ')}`);

// ------------------------------------------------------------------ the title card
// 4 x 7 note-block capitals (T, Y three wide, I one wide). One cell = one key x 10 s.
const TGLYPH = {
  U: ['#..#', '#..#', '#..#', '#..#', '#..#', '#..#', '.##.'],
  L: ['#...', '#...', '#...', '#...', '#...', '#...', '####'],
  T: ['###', '.#.', '.#.', '.#.', '.#.', '.#.', '.#.'],
  R: ['###.', '#..#', '#..#', '###.', '#.#.', '#..#', '#..#'],
  A: ['.##.', '#..#', '#..#', '####', '#..#', '#..#', '#..#'],
  S: ['.###', '#...', '#...', '.##.', '...#', '...#', '###.'],
  I: ['#', '#', '#', '#', '#', '#', '#'],
  F: ['####', '#...', '#...', '###.', '#...', '#...', '#...'],
  C: ['.###', '#...', '#...', '#...', '#...', '#...', '.###'],
  O: ['.##.', '#..#', '#..#', '#..#', '#..#', '#..#', '.##.'],
  Y: ['#.#', '#.#', '#.#', '.#.', '.#.', '.#.', '.#.'],
};
const TROW = 10, TTOP = 15;                       // row height, top gap inside the title zone
const titleNotes = [];                            // { lane, y0, y1, col } in period coordinates
{
  const words = [['ULTRA', C.cyan], ['SATISFACTORY', C.white]];
  const WORD_GAP = 4;
  const width = words.reduce((a, [w]) => a + [...w].reduce((s, ch) => s + TGLYPH[ch][0].length + 1, 0) - 1, 0) + WORD_GAP;
  let lane = Math.floor((LANES - width) / 2);
  if (lane < 0) throw new Error('title does not fit on 88 keys');
  for (const [word, col] of words) {
    for (const ch of word) {
      const g = TGLYPH[ch];
      for (let c = 0; c < g[0].length; c++) {
        for (let r = 0; r < 7;) {
          if (g[r][c] !== '#') { r++; continue; }
          const r0 = r;
          while (r < 7 && g[r][c] === '#') r++;
          titleNotes.push({ lane: lane + c, y0: TTOP + r0 * TROW, y1: TTOP + r * TROW, col });
        }
      }
      lane += g[0].length + 1;
    }
    lane += WORD_GAP - 1;
  }
}

// ------------------------------------------------------------------ bars -> geometry
const NOTE_IN = 0.8, NOTE_W = LW - 2 * NOTE_IN;
const bars = [];                                  // { lane, y0, y1, col, alt, recipe|null }
for (const n of notes) {
  const gap = n.dur >= 4 ? 1 : n.dur * 0.25;
  bars.push({ lane: n.lane, y0: P - n.t - n.dur + gap, y1: P - n.t, col: n.col, alt: n.alt, recipe: n.recipe, t: n.t });
}
for (const n of titleNotes) bars.push({ lane: n.lane, y0: n.y0 + 0.8, y1: n.y1, col: n.col, alt: false, recipe: null, title: true });

function barsSvg() {
  const solid = new Map(), hollow = new Map(), halo = new Map();
  let edge = '';
  for (const b of bars) {
    const x = lx(b.lane) + NOTE_IN, h = b.y1 - b.y0;
    if (b.title) halo.set(b.col, (halo.get(b.col) || '') + `M${f(x)} ${f(b.y0)}h${f(NOTE_W)}v${f(h)}h${f(-NOTE_W)}z`);
    if (b.alt && h >= 2.4) {
      const d = `M${f(x + 0.5)} ${f(b.y0 + 0.5)}h${f(NOTE_W - 1)}v${f(h - 1)}h${f(-(NOTE_W - 1))}z`;
      hollow.set(b.col, (hollow.get(b.col) || '') + d);
    } else {
      const d = `M${f(x)} ${f(b.y0)}h${f(NOTE_W)}v${f(h)}h${f(-NOTE_W)}z`;
      const key = b.alt ? `${b.col}|a` : b.col;
      solid.set(key, (solid.get(key) || '') + d);
    }
    if (h >= 4) edge += `M${f(x)} ${f(b.y1 - 1.5)}h${f(NOTE_W)}v1.5h${f(-NOTE_W)}z`;
  }
  let out = '';
  for (const [col, d] of halo) out += `<path fill="none" stroke="${col}" stroke-width="5" stroke-opacity=".16" stroke-linejoin="round" d="${d}"/>`;
  for (const [key, d] of solid) {
    const [col, a] = key.split('|');
    out += `<path fill="${col}"${a ? ' fill-opacity=".62"' : ''} d="${d}"/>`;
  }
  for (const [col, d] of hollow) out += `<path fill="${col}" fill-opacity=".26" stroke="${col}" d="${d}"/>`;
  out += `<path fill="#fff" fill-opacity=".42" d="${edge}"/>`;
  return out;
}

// ------------------------------------------------------------------ the roll (scrolling layer)
function rollLayer() {
  let out = '';
  // beat bands: alternate minutes of the phrase sit a shade lighter
  for (const t of [60, 180]) out += `<rect x="${X0}" y="${P - t - 60}" width="${X1 - X0}" height="60" fill="#fff" fill-opacity=".022"/>`;
  // beat lines every 10 s, bar lines every 60 s, a heavier one where the phrase ends and begins
  let minor = '', major = '';
  for (let t = 0; t < P; t += 10) {
    const y = P - t;
    if (t % 60 === 0 && t <= PHRASE) major += `M${X0 - 5} ${y - 0.5}H${X1}`;
    else minor += `M${X0} ${y - 0.5}H${X1}`;
  }
  out += `<path stroke="#fff" stroke-opacity=".045" d="${minor}"/><path stroke="#fff" stroke-opacity=".13" d="${major}"/>`;
  // the ruler: phrase time in the left gutter
  for (let t = 0; t <= PHRASE; t += 60) {
    out += text(`${t / 60}:00`, X0 - 3, P - t - 9, 5.6, C.rule, { anchor: 'end', sw: 0.85 });
  }
  out += barsSvg();
  let marks = '';
  for (const l of labels) {
    const cx = lx(l.lane) + LW / 2;
    if (l.mark) marks += diamond(cx + 0.2, P - l.t - 2.6, 2.6);
    out += text(l.str, cx - LABEL_CAP / 2 + 0.2, P - l.t - (l.mark ? MARK_W : 0), LABEL_CAP, l.col, { rot: -90, sw: 0.85 });
  }
  out += `<path fill="${C.objLight}" d="${marks}"/>`;
  return out;
}

// ------------------------------------------------------------------ keyboard
const pc = (lane) => (21 + lane) % 12;                       // key 0 is A0
const isBlack = (lane) => [1, 3, 6, 8, 10].includes(pc(lane));
function whiteRect(lane) {
  const l = lane > 0 && isBlack(lane - 1) ? lx(lane - 1) + LW / 2 : lx(lane);
  const r = lane < LANES - 1 && isBlack(lane + 1) ? lx(lane + 1) + LW / 2 : lx(lane + 1);
  return [l, r - l];
}
// Light intervals per key, as fractions of the loop, from the same bars the roll draws.
const keyHits = Array.from({ length: LANES }, () => []);
// (white bars light their keys gold: white on an ivory key would not show)
for (const b of bars) keyHits[b.lane].push({ on: (P - b.y1) / P, off: (P - b.y0) / P, col: b.col === C.white ? C.gold : b.col });
const MIN_ON = 0.2 / LOOP;                                   // a tick still gets a visible flash
function keyFrames(lane) {
  const hits = keyHits[lane].sort((a, b) => a.on - b.on);
  if (!hits.length) return null;
  const stops = [];
  hits.forEach((h, i) => {
    const next = i + 1 < hits.length ? hits[i + 1].on : 1;
    let off = Math.max(h.off, h.on + MIN_ON);
    if (off > next - 0.0008) off = next;                     // no room for a gap: retrigger straight into the next
    stops.push([h.on, h.col]);
    if (off < next) stops.push([off, null]);
  });
  let css = '';
  let last = null;
  for (const [fr, col] of stops) {
    const p = pct(fr);
    if (p === last) throw new Error(`key ${lane}: two keyframes at ${p}`);
    last = p;
    css += `${p}{fill:${col || '#0000'}}`;
  }
  return `@keyframes k${lane}{${css}}`;
}

// ------------------------------------------------------------------ the counter
// Count of recipe notes struck so far, as three digit strips stepped at each strike.
const DIG_H = 20;
function counterFrames() {
  const strikes = notes.map((n) => n.t / P).sort((a, b) => a - b);
  const steps = [];                                           // [frac, count]
  strikes.forEach((fr, i) => {
    if (steps.length && steps[steps.length - 1][0] === fr) steps[steps.length - 1][1] = i + 1;
    else steps.push([fr, i + 1]);
  });
  let css = '';
  [100, 10, 1].forEach((place, di) => {
    let body = '', last = 0;
    const digit = (c) => Math.floor(c / place) % 10;
    for (const [fr, c] of steps) {
      const d = digit(c);
      if (fr === 0) { body += `0%{transform:translateY(${-d * DIG_H}px)}`; last = d; continue; }
      if (d === last) continue;
      body += `${pct(fr)}{transform:translateY(${-d * DIG_H}px)}`;
      last = d;
    }
    if (!body.startsWith('0%')) body = `0%{transform:translateY(0px)}${body}`;
    css += `@keyframes c${di}{${body}}`;
  });
  return css;
}

// ------------------------------------------------------------------ assemble
const parts = [];
const roll = rollLayer();

// --- HUD
const hud = [];
{
  // emblem: a hexagon with a cog in it (drawn here; not the app's artwork)
  const cx = X0 + 13, cy = 23, R = 13;
  const hex = Array.from({ length: 6 }, (_, i) => { const a = (-90 + 60 * i) * Math.PI / 180; return `${f(cx + R * Math.cos(a))} ${f(cy + R * Math.sin(a))}`; }).join('L');
  let teeth = '';
  for (let i = 0; i < 8; i++) { const a = (i * 45 + 22.5) * Math.PI / 180; teeth += `M${f(cx + 5.4 * Math.cos(a))} ${f(cy + 5.4 * Math.sin(a))}L${f(cx + 8 * Math.cos(a))} ${f(cy + 8 * Math.sin(a))}`; }
  hud.push(`<path d="M${hex}Z" fill="#06202a" stroke="${C.cyan}" stroke-width="1.6" stroke-linejoin="round"/>`);
  hud.push(`<circle cx="${cx}" cy="${cy}" r="5.2" fill="none" stroke="${C.white}" stroke-width="1.7"/><path d="${teeth}" stroke="${C.white}" stroke-width="2.6"/><circle cx="${cx}" cy="${cy}" r="1.7" fill="${C.gold}"/>`);
  let x = X0 + 34;
  const cap = 14, y = 16;
  hud.push(text('ULTRA', x, y, cap, C.cyan, { sw: 2 }));
  x += textW('ULTRA', cap) + 5;
  hud.push(text('-', x, y, cap, C.faint, { sw: 2 }));
  x += textW('-', cap) + 5;
  hud.push(text('SATISFACTORY', x, y, cap, C.white, { sw: 2 }));
  x += textW('SATISFACTORY', cap) + 16;
  hud.push(text('EVERY RECIPE, BUILDING AND SPACE ELEVATOR OBJECTIVE, ONE CLICK APART', x, 12, 7.8, C.ink, { sw: 1.05 }));
  hud.push(text('A COMPANION APP FOR SATISFACTORY · UNOFFICIAL FAN PROJECT', x, 26, 6.6, C.dim, { sw: 0.9 }));
  hud.pitchEnd = x + textW('EVERY RECIPE, BUILDING AND SPACE ELEVATOR OBJECTIVE, ONE CLICK APART', 7.8);
  // counter, right-aligned
  const total = `/ ${N_RECIPES}`;
  const tw = textW(total, 9);
  hud.push(text(total, X1, 20.5, 9, C.dim, { anchor: 'end', sw: 1.2 }));
  const dcap = 14, dw = 5.4 * dcap / 10, dstep = dw + 3.4;
  const dx0 = X1 - tw - 8 - 3 * dstep + 3.4;
  // each digit centred in a cell as wide as a zero, so a 1 does not drift left
  const strip = Array.from({ length: 10 }, (_, d) => `<use href="#${gid(String(d))}" x="${f((5.4 - GLYPHS[d][0]) / 2)}" y="${f(d * DIG_H / (dcap / 10))}"/>`).join('');
  hud.push(`<g clip-path="url(#dc)">`);
  [0, 1, 2].forEach((di) => {
    hud.push(`<g transform="translate(${f(dx0 + di * dstep)} 16)"><g class="dg d${di}"><g class="t" transform="scale(${dcap / 10})" stroke="${C.gold}" stroke-width="${f(2 / (dcap / 10))}">${strip}</g></g></g>`);
  });
  hud.push('</g>');
  hud.push(text('RECIPES', dx0 - 7, 13.5, 5.6, C.dim, { anchor: 'end', sw: 0.85 }));
  hud.push(text('PLAYED', dx0 - 7, 24, 5.6, C.dim, { anchor: 'end', sw: 0.85 }));
  hud.dx0 = dx0; hud.dw = 3 * dstep;
  if (hud.pitchEnd > dx0 - 7 - textW('RECIPES', 5.6) - 14) throw new Error('HUD pitch runs into the counter');
}

// --- the three tabs, as pattern blocks
const tabs = [];
{
  const y = 42, h = 26, gap = 7;
  const bw = (X1 - X0 - 2 * gap) / 3;
  [
    ['OBJECTIVES', C.obj, C.objLight, 'PICK A SPACE ELEVATOR PHASE, SEE WHAT IT WANTS'],
    ['ITEMS', C.itm, '#ff86c0', 'SEARCH 140 ITEMS AS YOU TYPE, RATES PER MINUTE'],
    ['BUILDINGS', C.bld, '#7fd4ff', '477 BUILDINGS AND WHAT EACH ONE MAKES'],
  ].forEach(([name, col, light, blurb], i) => {
    const x = X0 + i * (bw + gap);
    tabs.push(`<rect x="${f(x)}" y="${y}" width="${f(bw)}" height="${h}" rx="3" fill="${col}" fill-opacity=".17" stroke="${col}" stroke-opacity=".6"/>`);
    tabs.push(`<rect x="${f(x)}" y="${y}" width="4" height="${h}" rx="1.5" fill="${col}"/>`);
    tabs.push(text(name, x + 11, y + 4, 7.6, light, { sw: 1.3 }));
    tabs.push(text(blurb, x + 11, y + 16, 5.8, C.ink, { sw: 0.85, op: 0.88 }));
    tabs.push(text(String(i + 1), x + bw - 8, y + 5, 6, col, { anchor: 'end', sw: 1 }));
  });
}

// --- keyboard
const kb = [];
let keyCss = '';
{
  let whites = '', seps = '', blacks = '', litW = '', litB = '', flares = '', names = '';
  for (let lane = 0; lane < LANES; lane++) {
    const kf = keyFrames(lane);
    if (kf) keyCss += `${kf}.k${lane}{animation-name:k${lane}}`;
    if (kf) flares += `<rect class="k k${lane}" x="${lx(lane)}" y="${KEY_Y - 34}" width="${LW}" height="34"/>`;
    if (isBlack(lane)) {
      blacks += `M${f(lx(lane) + 0.5)} ${KEY_Y}h${LW - 1}v${BK_H}h${-(LW - 1)}z`;
      if (kf) litB += `<rect class="k k${lane}" x="${f(lx(lane) + 1.5)}" y="${KEY_Y}" width="${LW - 3}" height="${BK_H - 2}"/>`;
    } else {
      const [x, w] = whiteRect(lane);
      whites += `M${f(x)} ${KEY_Y}h${f(w)}v${WK_H}h${f(-w)}z`;
      seps += `M${f(x + w)} ${KEY_Y}v${WK_H}`;
      if (kf) litW += `<rect class="k k${lane}" x="${f(x)}" y="${KEY_Y}" width="${f(w)}" height="${WK_H}"/>`;
      // every C carries its octave name, as piano-roll editors do (key 0 is A0, so the first C is C1)
      if (pc(lane) === 0) names += text(`C${Math.floor((21 + lane) / 12) - 1}`, x + w / 2, KEY_Y + WK_H - 9.5, 4.4, C.keyInk, { anchor: 'middle', sw: 0.8 });
    }
  }
  kb.push(`<g mask="url(#fm)" opacity=".6">${flares}</g>`);
  kb.push(`<path fill="${C.wkey}" d="${whites}"/>`);
  kb.push(`<g opacity=".9">${litW}</g>`);
  kb.push(`<rect x="${X0}" y="${KEY_Y}" width="${X1 - X0}" height="${WK_H}" fill="url(#ks)"/>`);
  kb.push(`<path stroke="${C.wkeyEdge}" stroke-width=".8" d="${seps}"/>`);
  kb.push(names);
  kb.push(`<path fill="${C.bkey}" d="${blacks}"/>`);
  kb.push(`<g opacity=".92">${litB}</g>`);
  kb.push(`<rect x="${X0}" y="${KEY_Y - 1}" width="${X1 - X0}" height="2" fill="${C.gold}"/>`);
}

// --- register tints, brackets and legend
const reg = [], legend = [];
{
  const by = KEY_Y + WK_H + 5;
  for (const m of MACHINES) {
    const [a, n] = m.lanes;
    reg.push(`<rect x="${lx(a)}" y="${ROLL_Y}" width="${n * LW}" height="${P}" fill="${m.col}" fill-opacity=".04"/>`);
    legend.push(`<path d="M${lx(a) + 1.5} ${by + 3}v-3h${n * LW - 3}v3" fill="none" stroke="${m.col}" stroke-width="1.4"/>`);
  }
  // chips: NAME count, spread across the roll width
  const cap = 5.8, chip = 6;
  const items = MACHINES.map((m) => ({ m, name: m.short, num: String(m.recipes.length) }));
  const widths = items.map((it) => chip + 4 + textW(it.name, cap) + 4 + textW(it.num, cap));
  const space = (X1 - X0 - widths.reduce((a, b) => a + b, 0)) / (items.length - 1);
  if (space < 6) throw new Error(`legend does not fit (gap ${space})`);
  let x = X0;
  const y = by + 12;
  items.forEach((it, i) => {
    legend.push(`<rect x="${f(x)}" y="${f(y - 0.2)}" width="${chip}" height="${chip}" rx="1" fill="${it.m.col}"/>`);
    legend.push(text(it.name, x + chip + 4, y, cap, C.ink, { sw: 0.85, op: 0.9 }));
    legend.push(text(it.num, x + chip + 4 + textW(it.name, cap) + 4, y, cap, it.m.col, { sw: 0.95 }));
    x += widths[i] + space;
  });
  // how to read it
  const y2 = y + 15;
  let kx = X0;
  const key = (draw, str) => { legend.push(draw(kx)); kx += 12; legend.push(text(str, kx, y2, 5.4, C.dim, { sw: 0.8 })); kx += textW(str, 5.4) + 16; };
  key((x0) => `<rect x="${f(x0)}" y="${f(y2 - 1.5)}" width="7.4" height="8.5" fill="${C.dim}"/><rect x="${f(x0)}" y="${f(y2 + 5.5)}" width="7.4" height="1.5" fill="#fff" fill-opacity=".5"/>`, 'ONE BAR = ONE RECIPE, AS LONG AS ITS CYCLE TIME');
  key((x0) => `<rect x="${f(x0 + 0.5)}" y="${f(y2 - 1)}" width="6.4" height="7.5" fill="${C.dim}" fill-opacity=".2" stroke="${C.dim}"/>`, `HOLLOW = ONE OF THE ${N_ALT} ALTERNATES`);
  key((x0) => `<path fill="${C.objLight}" d="${diamond(x0 + 3.7, y2 + 2.7, 3.2)}"/>`, 'SPACE ELEVATOR PART');
  key((x0) => `<path d="M${f(x0)} ${f(y2 + 2.7)}h7.4m-2.6 -2.6l2.6 2.6l-2.6 2.6" fill="none" stroke="${C.dim}" stroke-linecap="round" stroke-linejoin="round"/>`, 'SLOWEST MACHINE TO FASTEST');
  const tempo = `TEMPO: ALLEGRO MA NON TIDY (${f(P / LOOP)}×)`;
  legend.push(text(tempo, X1, y2, 5.4, C.dim, { anchor: 'end', sw: 0.8 }));
  if (kx - 16 > X1 - textW(tempo, 5.4) - 10) throw new Error('key line does not fit');
}

// the still frame (reduced motion) keeps the keys under the opening chord lit
const restKeys = keyHits.map((hits, lane) => { const h = hits.find((x) => x.on === 0); return h ? `.k${lane}{fill:${h.col}}` : ''; }).join('');

// --- glyph defs (after every text() call has registered what it needs)
const glyphDefs = [...glyphUse].map(([ch, id]) => `<path id="${id}" d="${GLYPHS[ch][1]}"/>`).join('');

const css = [
  '.t{fill:none;stroke-linecap:round;stroke-linejoin:round}',
  `.fall{animation:fall ${LOOP}s linear infinite}`,
  `@keyframes fall{to{transform:translateY(${P}px)}}`,
  `.k{fill:#0000;animation:${LOOP}s step-end infinite}`,
  keyCss,
  `.dg{animation:${LOOP}s step-end infinite}`,
  '.d0{animation-name:c0}.d1{animation-name:c1}.d2{animation-name:c2}',
  counterFrames(),
  `@media (prefers-reduced-motion:reduce){.fall,.k,.dg{animation:none}${restKeys}.d0{transform:translateY(${-Math.floor(N_RECIPES / 100) * DIG_H}px)}.d1{transform:translateY(${-(Math.floor(N_RECIPES / 10) % 10) * DIG_H}px)}.d2{transform:translateY(${-(N_RECIPES % 10) * DIG_H}px)}}`,
].join('');

// black-key lanes a shade darker, octave lines at every C
let laneShade = '', octave = '';
for (let lane = 0; lane < LANES; lane++) {
  if (isBlack(lane)) laneShade += `M${lx(lane)} ${ROLL_Y}h${LW}v${P}h${-LW}z`;
  if (pc(lane) === 0) octave += `M${lx(lane)} ${ROLL_Y}v${P}`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="ULTRA-SATISFACTORY: the app's 211 machine recipes as a falling-note piano roll">
<title>ULTRA-SATISFACTORY: every recipe as a falling note</title>
<defs>
<style>${css}</style>
${glyphDefs}
<clipPath id="rc"><rect x="0" y="${ROLL_Y}" width="${W}" height="${P}"/></clipPath>
<clipPath id="dc"><rect x="${f(hud.dx0 - 2)}" y="13" width="${f(hud.dw + 2)}" height="${DIG_H}"/></clipPath>
<linearGradient id="fg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset=".55" stop-color="#2a2a2a"/><stop offset="1" stop-color="#fff"/></linearGradient>
<mask id="fm"><rect x="${X0}" y="${KEY_Y - 34}" width="${X1 - X0}" height="34" fill="url(#fg)"/></mask>
<linearGradient id="ks" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".3"/><stop offset=".14" stop-color="#000" stop-opacity="0"/><stop offset=".86" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></linearGradient>
<linearGradient id="tf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.panel}"/><stop offset="1" stop-color="${C.panel}" stop-opacity="0"/></linearGradient>
<g id="roll">${roll}</g>
</defs>
<rect width="${W}" height="${H}" rx="10" fill="${C.panel}"/>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="9.5" fill="none" stroke="#fff" stroke-opacity=".09"/>
${hud.join('')}
${tabs.join('')}
<rect x="${X0}" y="${ROLL_Y}" width="${X1 - X0}" height="${P}" fill="${C.roll}"/>
<path fill="${C.rollDark}" d="${laneShade}"/>
${reg.join('')}
<path stroke="#fff" stroke-opacity=".06" d="${octave}"/>
<g clip-path="url(#rc)"><g transform="translate(0 ${ROLL_Y})"><g class="fall"><use href="#roll"/><use href="#roll" y="${-P}"/></g></g></g>
<rect x="0" y="${ROLL_Y}" width="${W}" height="9" fill="url(#tf)"/>
${kb.join('')}
<rect x="${X0 - 0.5}" y="${ROLL_Y - 0.5}" width="${X1 - X0 + 1}" height="${P + WK_H + 1}" fill="none" stroke="#fff" stroke-opacity=".14"/>
${legend.join('')}
</svg>
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
const kbytes = (Buffer.byteLength(svg) / 1024).toFixed(1);
console.log(`${path.relative(process.cwd(), OUT)}: ${kbytes} KB, ${notes.length} recipe notes (${N_ALT} alternates) + ${titleNotes.length} title notes, ${TOTAL_S} s of cycle time`);
for (const m of MACHINES) console.log(`  ${m.key.padEnd(21)} ${String(m.recipes.length).padStart(3)} recipes ${String(m.total).padStart(5)} s  avg ${m.avg.toFixed(1)} s  lanes ${m.lanes[0]}..${m.lanes[0] + m.lanes[1] - 1}`);
