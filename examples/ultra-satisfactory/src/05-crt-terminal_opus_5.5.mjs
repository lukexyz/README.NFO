#!/usr/bin/env node
// Amber Control Terminal: README header generator for ULTRA-SATISFACTORY.
//
//   node examples/ultra-satisfactory/src/05-crt-terminal_opus_5.5.mjs
//
// Writes examples/ultra-satisfactory/assets/05-crt-terminal_opus_5.5.svg.
// Plain Node, no dependencies, fully deterministic (seeded PRNG), so the art
// can be regenerated and tweaked. Every letter is drawn from the 5x7 bitmap
// font below as <path>/<use>; there is no <text> anywhere, so alignment is
// exact on every machine. Animation is CSS only and every keyframe is stepped,
// so one prefers-reduced-motion rule freezes it on a readable still frame.
//
// The story (one loop): boot log -> login -> ACCESS GRANTED -> "phase 2" (the
// OBJECTIVES tab) -> item "MODULAR FRAME" (the ITEMS tab: recipe card, and the
// stalled belt line starts running) -> building "ASSEMBLER" (the BUILDINGS
// tab) -> sleep: denied -> clear.
//
// Facts on screen were checked against data/data.json on 2026-09-30:
//   140 items, 211 recipes (88 alternates), 477 buildings, 5 phases;
//   Modular Frame = 3 Reinforced Iron Plate + 12 Iron Rod -> 2, Assembler,
//   60 s, 15 MW (3/min + 12/min in, 2/min out); Phase 2 parts and counts;
//   Assembler: production, tier 2 (Part Assembly), 15 MW, makes 39 items
//   (Modular Frame, Rotor, Motor, Smart Plating and Stator among them).
// The factory state (phase 1 shipped, phase 2 stuck on frames) is staged: the
// app is a lookup tool and does not track anybody's progress.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(HERE, '../assets/05-crt-terminal_opus_5.5.svg');

// ---------------------------------------------------------------- geometry
const W = 1080, H = 740;          // viewBox
const CW = 12, CH = 20;           // one terminal cell (glyph pixel = 2 units)
const GX = 60, GY = 60;           // top-left of the 80 x 30 character grid
const X = (c) => GX + c * CW;
const Y = (r) => GY + r * CH;
const GLASS = { x0: 36, y0: 36, x1: 1044, y1: 684, r: 26, bulge: 5 };
const TICK = 0.2;                 // belts, cog and spinner all step on this beat
const FRAMES_NEEDED = 500, FRAMES_PER_MIN = 2;   // Phase 2 wants 500; the recipe makes 2/min

// ---------------------------------------------------------------- PRNG
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(0x5a71f);

// ---------------------------------------------------------------- 5x7 font
// Rows top to bottom, '#' = lit. An optional 8th row is the descender.
const FONT_SRC = {
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
  a: '.....|.....|.###.|....#|.####|#...#|.####', b: '#....|#....|#.##.|##..#|#...#|#...#|####.',
  c: '.....|.....|.###.|#....|#....|#...#|.###.', d: '....#|....#|.##.#|#..##|#...#|#...#|.####',
  e: '.....|.....|.###.|#...#|#####|#....|.###.', f: '..##.|.#..#|.#...|###..|.#...|.#...|.#...',
  g: '.....|.....|.####|#...#|#...#|.####|....#|.###.', h: '#....|#....|#.##.|##..#|#...#|#...#|#...#',
  i: '..#..|.....|.##..|..#..|..#..|..#..|.###.', j: '...#.|.....|..##.|...#.|...#.|...#.|#..#.|.##..',
  k: '#....|#....|#..#.|#.#..|##...|#.#..|#..#.', l: '.##..|..#..|..#..|..#..|..#..|..#..|.###.',
  m: '.....|.....|##.#.|#.#.#|#.#.#|#.#.#|#...#', n: '.....|.....|#.##.|##..#|#...#|#...#|#...#',
  o: '.....|.....|.###.|#...#|#...#|#...#|.###.', p: '.....|.....|####.|#...#|#...#|####.|#....|#....',
  q: '.....|.....|.####|#...#|#...#|.####|....#|....#', r: '.....|.....|#.##.|##..#|#....|#....|#....',
  s: '.....|.....|.####|#....|.###.|....#|####.', t: '.#...|.#...|###..|.#...|.#...|.#..#|..##.',
  u: '.....|.....|#...#|#...#|#...#|#..##|.##.#', v: '.....|.....|#...#|#...#|#...#|.#.#.|..#..',
  w: '.....|.....|#...#|#...#|#.#.#|#.#.#|.#.#.', x: '.....|.....|#...#|.#.#.|..#..|.#.#.|#...#',
  y: '.....|.....|#...#|#...#|#...#|.####|....#|.###.', z: '.....|.....|#####|...#.|..#..|.#...|#####',
  0: '.###.|#...#|#..##|#.#.#|##..#|#...#|.###.', 1: '..#..|.##..|..#..|..#..|..#..|..#..|.###.',
  2: '.###.|#...#|....#|...#.|..#..|.#...|#####', 3: '#####|...#.|..#..|...#.|....#|#...#|.###.',
  4: '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.', 5: '#####|#....|####.|....#|....#|#...#|.###.',
  6: '..##.|.#...|#....|####.|#...#|#...#|.###.', 7: '#####|....#|...#.|..#..|.#...|.#...|.#...',
  8: '.###.|#...#|#...#|.###.|#...#|#...#|.###.', 9: '.###.|#...#|#...#|.####|....#|...#.|.##..',
  '!': '..#..|..#..|..#..|..#..|..#..|.....|..#..', '"': '.#.#.|.#.#.|.#.#.|.....|.....|.....|.....',
  '#': '.#.#.|.#.#.|#####|.#.#.|#####|.#.#.|.#.#.', $: '..#..|.####|#.#..|.###.|..#.#|####.|..#..',
  '%': '##...|##..#|...#.|..#..|.#...|#..##|...##', '&': '.##..|#..#.|#.#..|.#...|#.#.#|#..#.|.##.#',
  "'": '..#..|..#..|.#...|.....|.....|.....|.....', '(': '...#.|..#..|.#...|.#...|.#...|..#..|...#.',
  ')': '.#...|..#..|...#.|...#.|...#.|..#..|.#...', '*': '.....|..#..|#.#.#|.###.|#.#.#|..#..|.....',
  '+': '.....|..#..|..#..|#####|..#..|..#..|.....', ',': '.....|.....|.....|.....|.##..|..#..|.#...',
  '-': '.....|.....|.....|#####|.....|.....|.....', '.': '.....|.....|.....|.....|.....|.##..|.##..',
  '/': '....#|....#|...#.|..#..|.#...|#....|#....', '\\': '#....|#....|.#...|..#..|...#.|....#|....#',
  ':': '.....|.##..|.##..|.....|.##..|.##..|.....', ';': '.....|.##..|.##..|.....|.##..|..#..|.#...',
  '<': '...#.|..#..|.#...|#....|.#...|..#..|...#.', '=': '.....|.....|#####|.....|#####|.....|.....',
  '>': '.#...|..#..|...#.|....#|...#.|..#..|.#...', '?': '.###.|#...#|....#|...#.|..#..|.....|..#..',
  '@': '.###.|#...#|....#|.##.#|#.#.#|#.#.#|.###.', '[': '.###.|.#...|.#...|.#...|.#...|.#...|.###.',
  ']': '.###.|...#.|...#.|...#.|...#.|...#.|.###.', '^': '..#..|.#.#.|#...#|.....|.....|.....|.....',
  _: '.....|.....|.....|.....|.....|.....|.....|#####', '`': '.#...|..#..|...#.|.....|.....|.....|.....',
  '{': '...##|..#..|..#..|.#...|..#..|..#..|...##', '|': '..#..|..#..|..#..|..#..|..#..|..#..|..#..',
  '}': '##...|..#..|..#..|...#.|..#..|..#..|##...', '~': '.....|.....|.#...|#.#.#|...#.|.....|.....',
  '·': '.....|.....|.....|.##..|.##..|.....|.....', '■': '.....|#####|#####|#####|#####|#####|.....',
  '▶': '#....|##...|###..|####.|###..|##...|#....', '→': '.....|..#..|...#.|#####|...#.|..#..|.....',
  // Home-made: a hexagon for the title bar and an Iron Rod for the belts (the
  // plate and the frame are bigger sprites, drawn with the belts below).
  '⬡': '..#..|.#.#.|#...#|#...#|#...#|.#.#.|..#..', '╱': '....#|...##|..##.|.##..|##...|#....|.....',
};
const FONT = {};
for (const [ch, src] of Object.entries(FONT_SRC)) {
  const rows = src.split('|');
  if (rows.some((r) => r.length !== 5) || rows.length < 7 || rows.length > 8) throw new Error(`bad glyph ${ch}`);
  FONT[ch] = rows;
}

// Box drawing is drawn edge to edge so it joins across cells.
const BOX = {
  '─': [[0, 9, 12, 2]], '│': [[5, 0, 2, 20]],
  '┌': [[5, 9, 7, 2], [5, 9, 2, 11]], '┐': [[0, 9, 7, 2], [5, 9, 2, 11]],
  '└': [[5, 9, 7, 2], [5, 0, 2, 11]], '┘': [[0, 9, 7, 2], [5, 0, 2, 11]],
  '═': [[0, 7, 12, 2], [0, 11, 12, 2]], '║': [[3, 0, 2, 20], [7, 0, 2, 20]],
  '╗': [[0, 7, 9, 2], [7, 7, 2, 13], [0, 11, 5, 2], [3, 11, 2, 9]],
  '╝': [[0, 11, 9, 2], [7, 0, 2, 13], [0, 7, 5, 2], [3, 0, 2, 9]],
  '╠': [[3, 0, 2, 20], [7, 0, 2, 9], [7, 11, 2, 9], [7, 7, 5, 2], [7, 11, 5, 2]],
};

// ---------------------------------------------------------------- helpers
const used = new Set();
const gid = (ch) => 'g' + ch.codePointAt(0).toString(36);
const len = (s) => [...s].length;
const r2 = (n) => +n.toFixed(2);

function mergeRects(rects) {
  const rs = rects.map((r) => [...r]).sort((a, b) => a[1] - b[1] || a[3] - b[3] || a[0] - b[0]);
  const out = [];
  for (const r of rs) {
    const p = out[out.length - 1];
    if (p && p[1] === r[1] && p[3] === r[3] && p[0] + p[2] >= r[0]) p[2] = Math.max(p[0] + p[2], r[0] + r[2]) - p[0];
    else out.push(r);
  }
  return out;
}
// Second pass: stack identical runs vertically (for bitmaps).
function mergeDown(rects) {
  const rs = mergeRects(rects).sort((a, b) => a[0] - b[0] || a[2] - b[2] || a[1] - b[1]);
  const out = [];
  for (const r of rs) {
    const p = out[out.length - 1];
    if (p && p[0] === r[0] && p[2] === r[2] && p[1] + p[3] === r[1]) p[3] += r[3];
    else out.push(r);
  }
  return out;
}
const rectsD = (rs) => rs.map(([x, y, w, h]) => `M${x} ${y}h${w}v${h}h-${w}z`).join('');

function glyphD(rows) {
  const rs = [];
  rows.forEach((row, y) => [...row].forEach((v, x) => { if (v === '#') rs.push([1 + 2 * x, 2 + 2 * y, 2, 2]); }));
  return rectsD(mergeDown(rs));
}

// One run of text at absolute (x, y), one colour class.
function text(x, y, str, cls, attrs = '') {
  let uses = '';
  const rects = [];
  [...str].forEach((ch, i) => {
    if (ch === ' ') return;
    const ox = i * CW;
    if (BOX[ch]) { for (const [a, b, c, d] of BOX[ch]) rects.push([ox + a, b, c, d]); return; }
    if (!FONT[ch]) throw new Error(`missing glyph ${JSON.stringify(ch)} in ${JSON.stringify(str)}`);
    used.add(ch);
    uses += `<use href="#${gid(ch)}"${ox ? ` x="${ox}"` : ''}/>`;
  });
  const d = rects.length ? `<path d="${rectsD(mergeRects(rects))}"/>` : '';
  return `<g class="${cls}"${attrs} transform="translate(${x} ${y})">${d}${uses}</g>`;
}

// A row of coloured segments starting at grid (col,row). 'inv*' = inverse video.
const INV = { inv: 'n', invm: 'm', invd: 'd', invb: 'b' };
function line(col, row, segs) {
  let c = col, out = '';
  for (const [s, cls] of segs) {
    if (INV[cls]) {
      out += `<rect class="${INV[cls]}" x="${X(c)}" y="${Y(row)}" width="${len(s) * CW}" height="${CH}"/>`;
      out += text(X(c), Y(row), s, 'k');
    } else if (s.trim()) out += text(X(c), Y(row), s, cls);
    c += len(s);
  }
  return out;
}
const segLen = (segs) => segs.reduce((n, [s]) => n + len(s), 0);
const center = (c0, c1, n) => c0 + Math.floor((c1 - c0 + 1 - n) / 2);
const plain = (segs) => segs.map(([s]) => [s, 'k']);

// Big block-pixel lettering from the same 5x7 font. `bold` widens every pixel
// so the vertical strokes are as heavy as the horizontal ones.
// `adv` is the letter advance in units (default: 6 pixels).
function bigRects(str, px, py, bold = 0, adv = 6 * px) {
  const rs = [];
  [...str].forEach((ch, i) => {
    if (ch === ' ') return;
    (BIG[ch] || FONT[ch]).slice(0, 7).forEach((row, y) => [...row].forEach((v, x) => {
      if (v === '#') rs.push([i * adv + x * px, y * py, px + bold, py]);
    }));
  });
  return mergeDown(rs);
}
const BIG = { '-': '.....|.....|.....|.###.|.....|.....|.....'.split('|') };

// ================================================================= SCHEDULE
// The whole loop is scripted here, in seconds, before anything is drawn.
const LOG = [];                   // { segs, at } output lines | { prompt, cmd, at, keys } typed lines
const say = (at, ...segs) => LOG.push({ segs, at: r2(at) });
function type(at, prompt, cmd, gap = 0.4) {
  let t = at + gap;
  const keys = [...cmd].map(() => (t = r2(t + 0.05 + rng() * 0.06)));
  LOG.push({ prompt, cmd, at: r2(at), keys });
  return keys[keys.length - 1];
}
const OK = (a, hi = '', b = '') => [['[ ', 'd'], ['OK', 'b'], [' ] ', 'd'], [a, 'n'], [hi, 'b'], [b, 'n']];
const SH = [['> ', 'n']];

say(0.2, ['CONTROL TERMINAL V1.0', 'b']);
say(0.6, ...OK('data.json: ', '140 items'));
say(1.0, ...OK('', '211 recipes', ' (88 alternates)'));
say(1.4, ...OK('', '477 buildings'));
say(1.8, ...OK('space elevator: ', '5 phases'));
say(2.4, ['[', 'd'], ['WARN', 'inv'], ['] ', 'd'], ['03:00. pioneer still awake.', 'n']);
let end = type(3.0, [['login: ', 'n']], 'pioneer', 0.3);
const MODAL_A = r2(end + 0.35);             // band opens: "checking credentials"
const MODAL_B = r2(MODAL_A + 1.4);          // ACCESS GRANTED
const MODAL_E = r2(MODAL_B + 2.7);          // band closes
say(MODAL_E, ...OK("no password. it's Apache 2.0."));
end = type(MODAL_E + 0.5, SH, 'phase 2');
const PHASE_CLICK = r2(end + 0.25);         // phase row lights up
const PHASE_AT = r2(PHASE_CLICK + 0.4);     // OBJECTIVES view opens
say(PHASE_AT, ['4 parts. MODULAR FRAME: ', 'n'], ['0 of 500', 'b'], ['. oh.', 'n']);
end = type(PHASE_AT + 0.9, SH, 'item "MODULAR FRAME"');
const PART_CLICK = r2(end + 0.25);          // part row lights up
const CARD_AT = r2(PART_CLICK + 0.4);       // ITEMS: recipe card draws
const RUN_AT = r2(CARD_AT + 1.0);           // the line starts running
// (The data holds three Modular Frame recipes: this standard one and two
// alternates. The card shows the standard one, so the log does not count.)
say(CARD_AT, ['recipe found', 'b'], ['. 0 wiki tabs opened.', 'n']);
end = type(RUN_AT + 1.4, SH, 'building "ASSEMBLER"');
const MACH_CLICK = r2(end + 0.25);          // machine line lights up
const BLD_AT = r2(MACH_CLICK + 0.4);        // BUILDINGS: building card draws
say(BLD_AT, ['ASSEMBLER: 15 MW. you will want 40.', 'n']);
end = type(BLD_AT + 1.6, SH, 'sleep');
const DENIED_AT = r2(end + 0.3);
say(DENIED_AT, ['sleep: ', 'n'], ['denied', 'b'], ['. just one more belt.', 'n']);
const DONE_AT = r2(DENIED_AT + 1.2);        // Modular Frame bar hits 500
end = type(DONE_AT + 0.4, SH, 'clear', 1.7);
const CLEAR = r2(end + 0.3);
const T = Math.ceil((CLEAR + 0.9) * 5) / 5; // master loop, seconds
// First paint starts this far into the story, so a static first frame already
// shows the boot header and the first [ OK ] lines.
const OFFSET = 1.1;
// The still frame used when animations are off: recipe card up, belts loaded.
const BASE_T = r2(RUN_AT + 0.5);
const STILL_FILL = 0.4;           // ...with the Modular Frame bar this full

// ---------------------------------------------------------------- CSS animation
const css = [];
let animCount = 0;
const animCache = new Map();
const pct = (t, dur) => `${+((t / dur) * 100).toFixed(3)}%`;
// events: [[seconds, 'decl'], ...]; the first event must be at t = 0.
// base: the still-frame style used when animations are off (reduced motion);
// by default it is whatever the element looks like at BASE_T.
function anim(events, base = null, { dur = T, delay = -OFFSET } = {}) {
  const ev = events.slice().sort((a, b) => a[0] - b[0]);
  if (ev[0][0] !== 0) throw new Error('first keyframe must be at 0');
  const kf = [];
  for (const [t, d] of ev) {
    if (t > dur) throw new Error(`keyframe at ${t}s is past the ${dur}s loop`);
    if (kf.length && kf[kf.length - 1][1] === d) continue;
    if (kf.length && kf[kf.length - 1][0] === t) kf.pop();
    kf.push([t, d]);
  }
  if (base == null) { base = kf[0][1]; for (const [t, d] of kf) if (t <= BASE_T) base = d; }
  const key = JSON.stringify([kf, base, dur, delay]);
  if (animCache.has(key)) return animCache.get(key);
  const name = 'a' + (animCount++).toString(36);
  const groups = new Map();
  for (const [t, d] of kf) groups.set(d, [...(groups.get(d) || []), pct(t, dur)]);
  groups.set(kf[0][1], [...groups.get(kf[0][1]), '100%']);
  css.push(`@keyframes ${name}{${[...groups].map(([d, ps]) => `${ps.join(',')}{${d}}`).join('')}}`);
  css.push(`.${name}{${base};animation:${name} ${dur}s step-end ${r2(delay)}s infinite}`);
  animCache.set(key, name);
  return name;
}
const op = (v) => `opacity:${v}`;
const tx = (v) => `transform:translateX(${v}px)`;
const ty = (v) => `transform:translateY(${v}px)`;
const tr = (x, y) => `transform:translate(${x}px,${y}px)`;
// Visible only inside [a,b) windows of the master loop.
function windows(list, base = null) {
  const ev = [[0, op(0)]];
  for (const [a, b] of list) { ev.push([a, op(1)]); if (b < T) ev.push([b, op(0)]); }
  if (list.some(([a]) => a === 0)) ev.shift();
  return anim(ev, base);
}
const during = (a, b, inner) => `<g class="${windows([[a, b]])}">${inner}</g>`;
// Frame-by-frame sprite loop: n frames, each shown for TICK seconds.
const spriteLoops = new Set();
const loopFrames = (frames) => {
  const n = frames.length, per = r2(n * TICK);
  if (!spriteLoops.has(n)) { spriteLoops.add(n); css.push(`@keyframes q${n}{0%{opacity:1}${+(100 / n).toFixed(3)}%,100%{opacity:0}}`); }
  return frames.map((f, i) => `<g style="opacity:${i ? 0 : 1};animation:q${n} ${per}s step-end ${r2(i * TICK - per)}s infinite">${f}</g>`).join('');
};

// ================================================================= CONTENT
const S = [];            // screen content (bloomed)
S.defs = '';
const push = (...s) => S.push(...s);

// ---- row 0: title bar ------------------------------------------------------
{
  const left = ' ⬡ CONTROL TERMINAL V1.0 │ 03:00';
  const right = '140 ITEMS │ 211 RECIPES │ 477 BUILDINGS ';
  const bar = left + ' '.repeat(80 - len(left) - len(right)) + right;
  // '│' separators are drawn as plain rects so the bar stays one inverse strip.
  let o = `<rect class="m" x="${X(0)}" y="${Y(0)}" width="${80 * CW}" height="${CH}"/>`;
  o += text(X(0), Y(0), bar.replace(/│/g, ' ').replace('03:00', '     '), 'k');
  [...bar].forEach((ch, i) => { if (ch === '│') o += `<rect class="k" x="${X(i) + 5}" y="${Y(0) + 3}" width="2" height="14"/>`; });
  // The clock is honest: 500 Modular Frames at 2 a minute is 250 minutes, so
  // while the bar fills it runs from 03:00 to 07:10, in step with the bar.
  const CK = 10, cc = bar.indexOf('03:00');
  for (let k = 0; k <= CK; k++) {
    const min = 180 + (FRAMES_NEEDED / FRAMES_PER_MIN) * (k / CK);
    const hhmm = `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
    const tk = (j) => r2(RUN_AT + (DONE_AT - RUN_AT) * (j / CK));
    const win = k === 0 ? [[0, tk(1)], [CLEAR, T]] : [[tk(k), k === CK ? CLEAR : tk(k + 1)]];
    // The still frame shows the bar 40% full, so its clock reads 04:40 to match.
    o += `<g class="${windows(win, op(k === Math.round(STILL_FILL * CK) ? 1 : 0))}">${text(X(cc), Y(0), hhmm, 'k')}</g>`;
  }
  push(o);
}

// ---- rows 2-5: logo --------------------------------------------------------
{
  // 18 letters, 8 x 10 unit pixels, strokes and letter gaps both 10 units.
  const PX = 8, PY = 10, BOLD = 2, ADV = 52;
  const dU = rectsD(bigRects('ULTRA', PX, PY, BOLD, ADV));
  const dS = rectsD(bigRects('      SATISFACTORY', PX, PY, BOLD, ADV));
  const dH = rectsD(bigRects('     -', PX, PY, BOLD, ADV));
  const wid = 17 * ADV + 5 * PX + BOLD;
  const shadow = `<path fill="url(#dith)" transform="translate(8 8)" d="${dU}${dH}${dS}"/>`;
  S.defs += `<g id="logo">${shadow}<path fill="url(#lgu)" d="${dU}"/><path fill="url(#lgs)" d="${dH}${dS}"/></g>`;
  // Three horizontal bands so the logo can tear for a moment when the
  // Assembler kicks in and the whole line draws its 15 MW.
  const bands = [[-10, 30], [30, 50], [50, 100]];
  const g0 = RUN_AT;
  const glitch = [
    [[0, tx(0)], [g0 + 0.08, tx(-6)], [g0 + 0.2, tx(0)]],
    [[0, tx(0)], [g0, tx(10)], [g0 + 0.14, tx(0)], [g0 + 0.3, tx(-4)], [g0 + 0.36, tx(0)]],
    [[0, tx(0)], [g0 + 0.1, tx(5)], [g0 + 0.2, tx(0)]],
  ];
  let g = '';
  bands.forEach(([a, b], i) => {
    S.defs += `<clipPath id="lb${i}"><rect x="-30" y="${a}" width="${wid + 60}" height="${b - a}"/></clipPath>`;
    g += `<g clip-path="url(#lb${i})"><use href="#logo" class="${anim(glitch[i], tx(0))}"/></g>`;
  });
  push(`<g transform="translate(${X(0) + Math.round((80 * CW - wid) / 2)} ${Y(2) + 2})">${g}</g>`);
}

// ---- row 6: tagline --------------------------------------------------------
{
  const segs = [['every recipe', 'n'], [' · ', 'd'], ['building', 'n'], [' · ', 'd'],
    ['space elevator objective', 'n'], [' · ', 'd'], ['one click apart', 'b']];
  push(line(center(0, 79, segLen(segs)), 6, segs));
}

// ---- panes -----------------------------------------------------------------
// A frame with a plain top border; titles are laid over it per state.
function frame(c0, r0, c1, r1, cls = 'd') {
  const inner = c1 - c0 - 1;
  let out = line(c0, r0, [['┌' + '─'.repeat(inner) + '┐', cls]]);
  out += `<path class="${cls}" d="M${X(c0) + 5} ${Y(r0) + 11}h2v${(r1 - r0) * CH - 2}h-2zM${X(c1) + 5} ${Y(r0) + 11}h2v${(r1 - r0) * CH - 2}h-2z"/>`;
  out += line(c0, r1, [['└' + '─'.repeat(inner) + '┘', cls]]);
  return out;
}
// "[ title ]" punched into a top border, left-anchored at col or right-anchored.
function title(col, row, str, { right = false, cls = 'n' } = {}) {
  const n = len(str) + 4, c = right ? col - n + 1 : col;
  return `<rect class="bg" x="${X(c)}" y="${Y(row)}" width="${n * CW}" height="${CH}"/>`
    + line(c, row, [['[ ', 'd'], [str, cls], [' ]', 'd']]);
}
const LP = { c0: 0, c1: 40, r0: 8, r1: 16 };      // log pane
const RP = { c0: 42, c1: 79, r0: 8, r1: 16 };     // card pane
const EP = { c0: 0, c1: 79, r0: 22, r1: 28 };     // space elevator pane
push(frame(LP.c0, LP.r0, LP.c1, LP.r1), title(LP.c0 + 2, LP.r0, 'tty0'));
push(frame(RP.c0, RP.r0, RP.c1, RP.r1));
push(frame(EP.c0, EP.r0, EP.c1, EP.r1));

// ---- log pane: typed, scrolling --------------------------------------------
{
  const ROWS = LP.r1 - LP.r0 - 1, COL = LP.c0 + 2, R0 = LP.r0 + 1;
  let g = '';
  const cur = [[0, COL, 0]], scr = [[0, 0]];
  const scrollFor = (row) => Math.max(0, row - (ROWS - 1));
  LOG.forEach((L, i) => {
    const row = R0 + i;
    if (L.segs) {
      g += during(L.at, CLEAR, line(COL, row, L.segs));
      cur.push([L.at, COL, i + 1]);
      scr.push([L.at, scrollFor(i + 1)]);
      return;
    }
    const pc = COL + segLen(L.prompt);
    const inner = line(COL, row, L.prompt) + line(pc, row, [[L.cmd, 'b']]);
    // Typing: a cover in the screen colour slides right one cell per keystroke.
    const ev = [[0, tx(0)]];
    cur.push([L.at, pc, i]);
    scr.push([L.at, scrollFor(i)]);
    L.keys.forEach((t, k) => { ev.push([t, tx((k + 1) * CW)]); cur.push([t, pc + k + 1, i]); });
    ev.push([CLEAR, tx(0)]);
    const cover = `<g transform="translate(${X(pc)} ${Y(row)})"><rect class="bg ${anim(ev)}" width="${len(L.cmd) * CW}" height="${CH}"/></g>`;
    g += during(L.at, CLEAR, inner + cover);
  });
  cur.push([CLEAR, COL, 0]);
  scr.push([CLEAR, 0]);
  const cursor = `<g class="${anim(cur.map(([t, c, r]) => [t, tr(X(c), Y(R0 + r))]))}"><rect class="n blink" x="1" y="2" width="10" height="16"/></g>`;
  S.defs += `<clipPath id="logclip"><rect x="${X(LP.c0 + 1)}" y="${Y(R0)}" width="${(LP.c1 - LP.c0 - 1) * CW}" height="${ROWS * CH}"/></clipPath>`;
  push(`<g clip-path="url(#logclip)"><g class="${anim(scr.map(([t, n]) => [t, ty(-n * CH)]))}">${g}${cursor}</g></g>`);
}

// ---- the hexagon-and-cog emblem, rasterised to 2-unit pixels ---------------
// Echoes the app's emblem (hexagon, dashed gear ring, cog with a centre hole,
// a node on each corner), redrawn as a phosphor bitmap. The cog turns one way,
// the dashed ring the other.
const EMBLEM = (() => {
  const N = 60, P = 2, C = 60, FR = 6, rad = Math.PI / 180;
  const hex = [...Array(6)].map((_, k) => [C + 55 * Math.sin(k * 60 * rad), C - 55 * Math.cos(k * 60 * rad)]);
  const segDist = (px, py, [ax, ay], [bx, by]) => {
    const dx = bx - ax, dy = by - ay;
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(px - ax - t * dx, py - ay - t * dy);
  };
  const mod = (v, m) => ((v % m) + m) % m;
  const raster = (test) => {
    const rs = [];
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      let hit = 0;
      for (let sy = 0; sy < 3; sy++) for (let sx = 0; sx < 3; sx++) if (test((x + (sx + 0.5) / 3) * P, (y + (sy + 0.5) / 3) * P)) hit++;
      if (hit >= 5) rs.push([x * P, y * P, P, P]);
    }
    return rectsD(mergeDown(rs));
  };
  const outline = raster((x, y) => hex.some((a, k) => segDist(x, y, a, hex[(k + 1) % 6]) <= 1.5));
  const nodes = raster((x, y) => hex.some(([hx, hy]) => Math.max(Math.abs(x - hx), Math.abs(y - hy)) <= 4));
  const cog = (f) => raster((x, y) => {
    const r = Math.hypot(x - C, y - C), a = Math.atan2(y - C, x - C) / rad;
    if (r < 8) return false;                                  // centre hole
    if (r > 13 && r < 15.2) return false;                     // groove in the body
    if (r <= 20.5) return true;                               // body
    const off = Math.abs(mod(a - f * 7.5 + 22.5, 45) - 22.5); // 8 teeth
    return r <= 31 && off <= 10.5 - (r - 20.5) * 0.3;
  });
  const ring = (f) => raster((x, y) => {
    const r = Math.hypot(x - C, y - C), a = Math.atan2(y - C, x - C) / rad;
    return Math.abs(r - 38.5) <= 1.3 && mod(a + f * 5, 30) < 18; // 12 dashes
  });
  const frames = [...Array(FR)].map((_, f) => `<path class="n" d="${cog(f)}"/><path class="m" d="${ring(f)}"/>`);
  return { still: `<path class="m" d="${outline}"/><path class="b" d="${nodes}"/>`, frames };
})();

// ---- card pane: standby -> recipe card (ITEMS) -> building card (BUILDINGS) -
{
  const C = RP.c0 + 2, R = RP.r0 + 1, WID = RP.c1 - RP.c0 - 3;      // 34 text columns
  const rule = [['─'.repeat(WID), 'd']];
  const spread = (a, b) => [a, [' '.repeat(WID - len(a[0]) - len(b[0])), 'd'], b];

  // Standby: the emblem idles until somebody asks for an item.
  let idle = title(RP.c0 + 2, RP.r0, 'standby', { cls: 'd' });
  idle += `<g transform="translate(${X(RP.c0 + 1) + 6} ${Y(R) + 10})">${EMBLEM.still}${loopFrames(EMBLEM.frames)}</g>`;
  idle += line(C + 12, R + 1, [['NO ITEM SELECTED', 'b']]);
  idle += line(C + 12, R + 3, [['type an item name.', 'n']]);
  idle += line(C + 12, R + 4, [['the wiki can wait.', 'n']]);
  idle += line(C + 12, R + 5, [['it has waited before.', 'd']]);
  push(`<g class="${windows([[0, CARD_AT], [CLEAR, T]])}">${idle}</g>`);

  // Rows draw top to bottom, a row every 0.1 s, like a slow serial link.
  const card = (rows, a, b) => rows.map((segs, i) => during(r2(a + i * 0.1), b, line(C, R + i, segs))).join('');

  // ITEMS: the recipe card. Verified against data.json.
  const MACH = [['▶ ', 'n'], ['ASSEMBLER', 'b'], ['   60 s cycle   ', 'n'], ['15 MW', 'b']];
  const recipe = [
    spread(['MODULAR FRAME', 'b'], ['standard recipe', 'd']),
    rule,
    [['IN  ', 'd'], [' 3/min', 'b'], ['  Reinforced Iron Plate', 'n']],
    [['IN  ', 'd'], ['12/min', 'b'], ['  Iron Rod', 'n']],
    [['OUT ', 'd'], [' 2/min', 'b'], ['  Modular Frame', 'n']],
    rule,
    MACH,
  ];
  let item = title(RP.c0 + 2, RP.r0, 'recipe') + title(RP.c1 - 2, RP.r0, 'ITEMS', { right: true, cls: 'b' });
  item += card(recipe, CARD_AT, BLD_AT);
  // "Click" on the machine: its line goes inverse just before the card swaps.
  item += during(MACH_CLICK, BLD_AT, `<rect class="n" x="${X(C) - 6}" y="${Y(R + 6)}" width="${WID * CW + 12}" height="${CH}"/>` + line(C, R + 6, plain(MACH)));
  push(during(CARD_AT, BLD_AT, item));

  // BUILDINGS: the building card. Verified against data.json.
  const building = [
    spread(['ASSEMBLER', 'b'], ['production', 'd']),
    rule,
    [['UNLOCK  ', 'd'], ['Tier 2', 'b'], [': Part Assembly', 'n']],
    [['POWER   ', 'd'], ['15 MW', 'b']],
    [['MAKES   ', 'd'], ['39 items', 'b'], [', including', 'n']],
    [['  Modular Frame · Rotor · Motor', 'n']],
    [['  Smart Plating · Stator · ...', 'n']],
  ];
  let bld = title(RP.c0 + 2, RP.r0, 'building') + title(RP.c1 - 2, RP.r0, 'BUILDINGS', { right: true, cls: 'b' });
  bld += card(building, BLD_AT, CLEAR);
  push(during(BLD_AT, CLEAR, bld));
}

// ---- rows 18-20: line 01, two belts into an Assembler, one belt out --------
// Belt traffic is to scale: 3, 12 and 2 items a minute become one item every
// 12, 3 and 18 cells, all belts moving one cell per tick.
{
  const live = [CARD_AT, CLEAR], run = [RUN_AT, CLEAR];
  const idleW = [[0, CARD_AT], [CLEAR, T]], stopW = [[0, RUN_AT], [CLEAR, T]];
  const CORNER = 44, B0 = 29, BN = CORNER - B0;        // input belts: cols 29..43
  const M0 = 47, O0 = 58, ON = 21;                     // machine label; output belt: cols 58..78
  let g = '';
  g += line(0, 18, [['REINFORCED IRON PLATE', 'n']]) + line(13, 20, [['IRON ROD', 'n']]);
  g += line(B0, 18, [['═'.repeat(BN) + '╗', 'd']]) + line(B0, 20, [['═'.repeat(BN) + '╝', 'd']]);
  g += line(CORNER, 19, [['╠═', 'd'], ['▶', 'n']]);
  // The product rides a long belt off the right edge, labelled above and below.
  g += line(O0, 19, [['═'.repeat(ON), 'd'], ['▶', 'n']]) + line(67, 18, [['MODULAR FRAME', 'b']]);
  // Rates: unknown until the recipe is looked up.
  const q = [[' ?/min', 'd']];
  g += `<g class="${windows(idleW)}">${line(22, 18, q)}${line(22, 20, q)}${line(74, 20, q)}</g>`;
  g += `<g class="${windows([live])}">${line(22, 18, [[' 3/min', 'b']])}${line(22, 20, [['12/min', 'b']])}${line(74, 20, [[' 2/min', 'b']])}`
    + line(M0, 18, [['60 s', 'n'], [' · ', 'd'], ['15 MW', 'n']]) + '</g>';
  // The machine: idle, then inverse video with a spinning ASCII cog.
  g += `<g class="${windows(stopW)}">${line(M0, 19, [['[', 'd'], ['ASSEMBLER', 'n'], [']', 'd']])}</g>`;
  g += `<g class="${windows(idleW)}">${line(M0, 20, [['IDLE: recipe?', 'd']])}</g>` + during(CARD_AT, RUN_AT, line(M0, 20, [['SPINNING UP', 'n']]));
  const spin = loopFrames(['|', '/', '-', '\\'].map((ch) => text(X(M0), Y(20), ch, 'b')));
  g += `<g class="${windows([run])}">${line(M0, 19, [[' ASSEMBLER ', 'inv']])}${spin}${line(M0 + 2, 20, [['RUNNING', 'n']])}</g>`;
  // The parts: home-made 2-unit-pixel sprites. A riveted plate and an X-braced
  // frame are two cells wide; a rod is a one-cell diagonal stroke.
  const sprite = (id, rows) => {
    const rs = [];
    rows.forEach((row, y) => [...row].forEach((v, x) => { if (v === '#') rs.push([2 * x, 2 * y, 2, 2]); }));
    S.defs += `<path id="${id}" d="${rectsD(mergeDown(rs))}"/>`;
    return { w: rows[0].length / 6, svg: `<use href="#${id}" class="b"/>` };
  };
  const PLATE = sprite('ipl', [
    '............', '............', '.##########.', '.#.######.#.', '.##########.',
    '.##########.', '.#.######.#.', '.##########.', '............', '............']);
  const FRAME = sprite('ifr', [
    '............', '.##########.', '.##......##.', '.#.##..##.#.', '.#...##...#.',
    '.#...##...#.', '.#.##..##.#.', '.##......##.', '.##########.', '............']);
  const ROD = { w: 1, svg: text(0, 0, '╱', 'b') };
  // Items ride the belts. Each owns its cells: a screen-coloured backing hides
  // the belt underneath, the way a real terminal overwrites a character.
  const belt = (id, col, row, cells, item, period, phase) => {
    let items = '';
    for (let c = phase - period; c < cells + period; c += period) {
      if (c + period + item.w <= 0) continue;
      items += `<g transform="translate(${c * CW} 0)"><rect class="bg" width="${item.w * CW}" height="${CH}"/>${item.svg}</g>`;
    }
    css.push(`.${id}{animation:${id} ${r2(period * TICK)}s steps(${period}) infinite}@keyframes ${id}{to{transform:translateX(${period * CW}px)}}`);
    S.defs += `<clipPath id="c${id}"><rect x="${X(col)}" y="${Y(row)}" width="${cells * CW}" height="${CH}"/></clipPath>`;
    return `<g clip-path="url(#c${id})"><g transform="translate(${X(col)} ${Y(row)})"><g class="${id}">${items}</g></g></g>`;
  };
  g += `<g class="${windows([run])}">${belt('bp', B0, 18, BN, PLATE, 12, 5)}${belt('br', B0, 20, BN, ROD, 3, 1)}${belt('bf', O0, 19, ON, FRAME, 18, 7)}</g>`;
  push(g);
}

// ---- rows 22-28: Space Elevator (the OBJECTIVES tab) ------------------------
{
  const R = EP.r0 + 1;
  // Segmented progress bar: dither track, solid fill, a grille on top.
  const bar = (col, row, cells, fill, cls = 'n') => {
    const x = X(col + 1), y = Y(row) + 4, w = cells * CW;
    let o = line(col, row, [['[', 'd']]) + line(col + cells + 1, row, [[']', 'd']]);
    o += `<rect fill="url(#dithd)" x="${x}" y="${y}" width="${w}" height="12"/>`;
    if (typeof fill === 'number') { if (fill) o += `<rect class="${cls}" x="${x}" y="${y}" width="${fill * CW}" height="12"/>`; }
    else o += `<g transform="translate(${x} ${y})"><rect class="${cls} ${fill}" width="${w}" height="12"/></g>`;
    return o + `<rect fill="url(#gr)" x="${x}" y="${y}" width="${w}" height="12"/>`;
  };

  // Overview: the five phases, as the app names them.
  const PHASES = [
    ['AUTOMATION BASICS', 3, 24, 'SHIPPED', 'n'],
    ['LOGISTICS & STEEL', 4, 17, 'IN PROGRESS', 'b'],
    ['OIL & COMPUTERS', 3, 0, 'LOCKED', 'd'],
    ['NUCLEAR & ENDGAME', 4, 0, 'LOCKED', 'd'],
    ['ALIEN TECH & QUANTUM', 4, 0, 'LOCKED', 'd'],
  ];
  const phaseRow = (i) => {
    const [name, parts, , status, cls] = PHASES[i];
    return [[`${i + 1}  `, cls === 'd' ? 'd' : 'b'], [name.padEnd(23), cls === 'd' ? 'd' : 'n'], [`${parts} parts`, 'd'], [' '.repeat(30), 'd'], [status, cls]];
  };
  let ov = title(EP.c0 + 2, EP.r0, '// SPACE ELEVATOR //') + title(EP.c1 - 2, EP.r0, '5 PHASES', { right: true, cls: 'd' });
  PHASES.forEach((p, i) => { ov += line(2, R + i, phaseRow(i)) + bar(37, R + i, 24, p[2], p[4] === 'b' ? 'b' : 'n'); });
  // "Click" on phase 2: the row goes inverse just before the view swaps.
  ov += during(PHASE_CLICK, PHASE_AT, `<rect class="n" x="${X(1)}" y="${Y(R + 1)}" width="${78 * CW}" height="${CH}"/>` + line(2, R + 1, plain(phaseRow(1))));
  push(`<g class="${windows([[0, PHASE_AT], [CLEAR, T]])}">${ov}</g>`);

  // Phase 2: its four parts and how many, as the OBJECTIVES tab lists them.
  const PARTS = [['AUTOMATED WIRING', 500], ['MODULAR FRAME', 500], ['SMART PLATING', 100], ['VERSATILE FRAMEWORK', 500]];
  const BAR = 30, STEPS = 30, MF = 1;
  const partRow = (i, k = null) => [[PARTS[i][0].padEnd(21), k || (i === MF ? 'b' : 'n')], [`x${PARTS[i][1]}`, k || 'b']];
  const fill = [[0, 'transform:scaleX(0)']];
  for (let k = 1; k <= STEPS; k++) fill.push([r2(RUN_AT + (DONE_AT - RUN_AT) * (k / STEPS)), `transform:scaleX(${r2(k / STEPS)})`]);
  fill.push([CLEAR, 'transform:scaleX(0)']);
  let ph = title(EP.c0 + 2, EP.r0, '// SPACE ELEVATOR - PHASE 2 //') + title(EP.c1 - 2, EP.r0, 'OBJECTIVES', { right: true, cls: 'b' });
  PARTS.forEach((p, i) => {
    ph += line(2, R + i, partRow(i)) + bar(29, R + i, BAR, i === MF ? anim(fill, `transform:scaleX(${STILL_FILL})`) : BAR, i === MF ? 'b' : 'n');
    if (i !== MF) ph += line(63, R + i, [['DONE', 'n']]);
  });
  ph += during(PHASE_AT, RUN_AT, line(63, R + MF, [['0 of 500', 'inv']]));
  ph += during(RUN_AT, DONE_AT, line(63, R + MF, [['FILLING...', 'b']]));
  ph += during(DONE_AT, CLEAR, line(63, R + MF, [['DONE', 'b']]));
  // "Click" on the part: its row goes inverse just before the recipe opens.
  ph += during(PART_CLICK, CARD_AT, `<rect class="n" x="${X(1)}" y="${Y(R + MF)}" width="${78 * CW}" height="${CH}"/>` + line(2, R + MF, partRow(MF, 'k')));
  const hint = [['> item "<part>"', 'n'], [' opens its recipe. the recipe opens its machine.', 'd']];
  ph += during(PHASE_AT, DONE_AT, line(2, R + 4, hint));
  const ship = ' PHASE 2 READY TO SHIP. PULL THE LEVER. ';
  ph += during(DONE_AT, CLEAR, `<g class="slow">${line(center(1, 78, len(ship)), R + 4, [[ship, 'inv']])}</g>`);
  push(during(PHASE_AT, CLEAR, ph));
}

// ---- row 29: function-key bar ----------------------------------------------
{
  const labels = ['HELP', 'OBJCTV', 'ITEMS', 'BUILDS', 'ALTTAB', 'BELT+1', 'PASTA', 'SINK', 'COFFEE', 'SLEEP'];
  const lit = { 1: [PHASE_CLICK, PART_CLICK], 2: [PART_CLICK, MACH_CLICK], 3: [MACH_CLICK, CLEAR], 5: [DENIED_AT, CLEAR] };
  const segs = [];
  let hot = '', c = 0;
  labels.forEach((l, i) => {
    const key = String(i + 1);
    const lab = l.padEnd(8 - key.length - (i === 9 ? 0 : 1)); // ten 8-column slots = 80 columns
    segs.push([key, 'b'], [lab, 'invm']);
    if (lit[i]) hot += during(lit[i][0], lit[i][1], line(c + key.length, 29, [[lab, 'invb']]));
    if (i !== 9) segs.push([' ', 'n']);
    c += 8;
  });
  push(line(0, 29, segs) + hot);
}

// ---- ACCESS GRANTED: a hazard-striped band across the whole tube ------------
{
  const A = MODAL_A, B = MODAL_B, E = MODAL_E;
  const r0 = 8, r1 = 16, yT = Y(r0), yB = Y(r1 + 1), cy = (yT + yB) / 2;
  let o = `<rect class="bg" x="0" y="${yT}" width="${W}" height="${yB - yT}"/>`;
  // Marching hazard stripes, top and bottom.
  css.push('.hz{animation:hz 1.6s steps(8) infinite}@keyframes hz{to{transform:translateX(40px)}}');
  for (const y of [yT + 2, yB - 18]) o += `<g transform="translate(0 ${y})"><rect class="hz" x="-40" y="0" width="${W + 80}" height="16" fill="url(#hz)"/></g>`;
  o += line(center(0, 79, 44), r0 + 1, [['FACILITY ACCESS CONTROL', 'n'], [' · ', 'd'], ['CLEARANCE: PIONEER', 'n']]);
  // Phase 1: the "hack". There is nothing to hack.
  const msg = [['> ', 'n'], ['checking credentials for pioneer', 'b'], ['...', 'n']];
  let p1 = line(center(0, 79, segLen(msg)), r0 + 3, msg);
  const bw = 48, bc = center(0, 79, bw + 2);
  p1 += line(bc, r0 + 5, [['[', 'n']]) + line(bc + bw + 1, r0 + 5, [[']', 'n']]);
  p1 += `<rect fill="url(#dithd)" x="${X(bc + 1)}" y="${Y(r0 + 5) + 4}" width="${bw * CW}" height="12"/>`;
  const fill = [[0, 'transform:scaleX(0)']];
  for (let k = 1; k <= 24; k++) fill.push([r2(A + 0.25 + k * 0.035 + (k > 17 ? 0.15 : 0)), `transform:scaleX(${r2(k / 24)})`]);
  fill.push([E, 'transform:scaleX(0)']);
  p1 += `<g transform="translate(${X(bc + 1)} ${Y(r0 + 5) + 4})"><rect class="b ${anim(fill)}" width="${bw * CW}" height="12"/></g>`;
  p1 += `<rect fill="url(#gr)" x="${X(bc + 1)}" y="${Y(r0 + 5) + 4}" width="${bw * CW}" height="12"/>`;
  const none = [['credentials required: ', 'n'], ['none', 'b'], ['. carry on.', 'n']];
  p1 += during(r2(A + 0.92), B, line(center(0, 79, segLen(none)), r0 + 6, none));
  o += during(A, B, p1);
  // Phase 2: ACCESS GRANTED in block pixels, revealed a letter at a time.
  const big = 'ACCESS GRANTED', PX = 10;
  const d = rectsD(bigRects(big, PX, PX, 2));
  const bwid = (len(big) * 6 - 1) * PX + 2;
  const bx = Math.round((W - bwid) / 2), by = Y(r0 + 3) + 2;
  let p2 = `<g transform="translate(${bx} ${by})"><path fill="url(#dith)" transform="translate(6 6)" d="${d}"/><path fill="url(#ag)" d="${d}"/>`;
  const rev = [[0, tx(0)]];
  for (let k = 1; k <= len(big); k++) rev.push([r2(B + 0.05 + k * 0.04), tx(k * 6 * PX)]);
  rev.push([E, tx(0)]);
  p2 += `<rect class="bg ${anim(rev)}" x="-4" y="-4" width="${bwid + 16}" height="84"/></g>`;
  const sub = [['no password. no paywall. no excuses. ', 'n'], ['back to work.', 'b']];
  p2 += during(r2(B + 0.8), E, line(center(0, 79, segLen(sub)), r1 - 1, sub));
  o += during(B, E, p2);
  // The band snaps open from its centre line and shut again.
  const sc = (v) => `transform:scaleY(${v})`;
  const snap = anim([[0, sc(0)], [A, sc(0.12)], [r2(A + 0.06), sc(0.55)], [r2(A + 0.12), sc(1)], [r2(E - 0.12), sc(0.55)], [r2(E - 0.06), sc(0.12)], [E, sc(0)]]);
  push(`<g transform="translate(0 ${cy})"><g class="${snap}"><g transform="translate(0 ${-cy})">${o}</g></g></g>`);
}

// ================================================================= FRAME / CRT
function glassPath({ x0, y0, x1, y1, r, bulge: b }) {
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  return `M${x0 + r} ${y0}Q${cx} ${y0 - 2 * b} ${x1 - r} ${y0}A${r} ${r} 0 0 1 ${x1} ${y0 + r}`
    + `Q${x1 + 2 * b} ${cy} ${x1} ${y1 - r}A${r} ${r} 0 0 1 ${x1 - r} ${y1}`
    + `Q${cx} ${y1 + 2 * b} ${x0 + r} ${y1}A${r} ${r} 0 0 1 ${x0} ${y1 - r}`
    + `Q${x0 - 2 * b} ${cy} ${x0} ${y0 + r}A${r} ${r} 0 0 1 ${x0 + r} ${y0}Z`;
}
const glass = glassPath(GLASS);

// A brownout: the picture dips for a moment when the Assembler starts.
const dip = anim([[0, op(0)], [RUN_AT, op(0.2)], [r2(RUN_AT + 0.1), op(0.08)], [r2(RUN_AT + 0.2), op(0)]], op(0));

// Bezel: maker's plate, a LINE lamp that is lit while the belts run, a power
// lamp, and a screw in every corner (they cost 1 Iron Rod per 4).
const lineOn = windows([[RUN_AT, CLEAR]]);
const screw = (x, y) => `<circle cx="${x}" cy="${y}" r="5.5" fill="#0d0b09" stroke="#4a443c" stroke-width="1.2"/><path d="M${x - 3.4} ${y - 1.6}l6.8 3.2" stroke="#5d564c" stroke-width="1.6" stroke-linecap="round"/>`;
const bezel = [
  `<g transform="translate(64 709) scale(.8)">${text(0, 0, 'SPAGHETTI LOGIC', 'z')}${text(17 * CW, 0, 'MK.1 · P3 AMBER · 80x30 · UNOFFICIAL FAN PROJECT', 'zd')}</g>`,
  `<g transform="translate(836 709) scale(.8)">${text(0, 0, 'LINE', 'zd')}</g>`,
  `<circle cx="894" cy="716" r="4" fill="#3a2608" stroke="#000" stroke-opacity=".5"/>`,
  `<g class="${lineOn}"><circle cx="894" cy="716" r="10" fill="url(#ledg)"/><circle cx="894" cy="716" r="3.2" fill="#fff3d6"/></g>`,
  `<g transform="translate(944 709) scale(.8)">${text(0, 0, 'PWR', 'zd')}</g>`,
  `<circle cx="996" cy="716" r="12" fill="url(#ledg)"/><circle cx="996" cy="716" r="3.6" fill="#fff3d6"/>`,
  screw(19, 19), screw(W - 19, 19), screw(19, H - 19), screw(W - 19, H - 19),
].join('');

const defsGlyphs = [...used].sort().map((ch) => `<path id="${gid(ch)}" d="${glyphD(FONT[ch])}"/>`).join('');

// Every animation is stepped (no linear/ease tweens). Inside <img> the browser
// re-rasterises the whole SVG, bloom filter included, whenever anything moves,
// so a continuous tween would force a full redraw every frame. The scan bar
// steps at 10 fps, which is invisible on a 5% gradient.
const style = `
.b{fill:#fff0c4}.n{fill:#ffb534}.m{fill:#dc9222}.d{fill:#ad701d}.k,.bg{fill:#120a02}
.z{fill:#9a9186}.zd{fill:#675f55}
.blink{animation:blink 1.06s step-end infinite}@keyframes blink{50%{opacity:0}}
.slow{animation:slow 1.2s step-end infinite}@keyframes slow{70%{opacity:.35}}
.roll{animation:roll 9s steps(90) infinite}@keyframes roll{from{transform:translateY(0)}to{transform:translateY(${H + 140}px)}}
.flick{opacity:0;animation:flick 6.1s step-end infinite}
@keyframes flick{0%{opacity:0}23%{opacity:.05}23.7%{opacity:0}49%{opacity:.03}49.8%{opacity:0}81%{opacity:.06}81.6%{opacity:0}}
${css.join('\n')}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
`.trim();

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
<title id="t">ULTRA-SATISFACTORY</title>
<desc id="d">An amber phosphor CRT control terminal. Under the ULTRA-SATISFACTORY logo a boot log types out: data.json: 140 items, 211 recipes (88 alternates), 477 buildings, space elevator: 5 phases. ACCESS GRANTED appears in block letters between hazard stripes. Then three queries: phase 2 lists the Space Elevator parts, item MODULAR FRAME opens its recipe card (3 Reinforced Iron Plate and 12 Iron Rod a minute in, 2 Modular Frame a minute out, Assembler, 60 second cycle, 15 MW) and starts two ASCII conveyor belts feeding an Assembler, and building ASSEMBLER opens the building card. A progress bar fills to 500 Modular Frames. Unofficial fan project.</desc>
<style>${style}</style>
<defs>
<pattern id="dith" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 0h2v2H0zM2 2h2v2H2z" fill="#7d4a0d"/></pattern>
<pattern id="dithd" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 0h2v2H0zM2 2h2v2H2z" fill="#6b420f"/></pattern>
<pattern id="gr" width="${CW}" height="12" patternUnits="userSpaceOnUse"><rect x="10" width="2" height="12" fill="#120a02"/></pattern>
<pattern id="hz" width="40" height="16" patternUnits="userSpaceOnUse"><path d="M0 16L16 0H36L20 16z" fill="#ffb534"/></pattern>
<pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect y="2.6" width="4" height="1.4" fill="#000" fill-opacity=".42"/></pattern>
<linearGradient id="lgu" x1="0" y1="0" x2="0" y2="70" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fffdf2"/><stop offset=".55" stop-color="#ffedb8"/><stop offset="1" stop-color="#ffc964"/></linearGradient>
<linearGradient id="lgs" x1="0" y1="0" x2="0" y2="70" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffd27a"/><stop offset=".5" stop-color="#ffb534"/><stop offset="1" stop-color="#e88c12"/></linearGradient>
<linearGradient id="ag" x1="0" y1="0" x2="0" y2="70" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fffbe8"/><stop offset=".5" stop-color="#ffd27a"/><stop offset="1" stop-color="#f09a1a"/></linearGradient>
<linearGradient id="body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#38332d"/><stop offset=".08" stop-color="#29251f"/><stop offset="1" stop-color="#171411"/></linearGradient>
<radialGradient id="vig" cx=".5" cy=".5" r=".72"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".72"/></radialGradient>
<radialGradient id="amb" cx=".5" cy=".46" r=".62"><stop offset="0" stop-color="#ffab1f" stop-opacity=".07"/><stop offset="1" stop-color="#ffab1f" stop-opacity="0"/></radialGradient>
<linearGradient id="refl" x1="0" y1="0" x2=".55" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".085"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="rollg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd48a" stop-opacity="0"/><stop offset=".5" stop-color="#ffd48a" stop-opacity=".05"/><stop offset="1" stop-color="#ffd48a" stop-opacity="0"/></linearGradient>
<radialGradient id="ledg"><stop offset="0" stop-color="#ffe2a6"/><stop offset=".4" stop-color="#ffab1f"/><stop offset="1" stop-color="#ffab1f" stop-opacity="0"/></radialGradient>
<filter id="bloom" x="-3%" y="-3%" width="106%" height="106%" color-interpolation-filters="sRGB">
<feGaussianBlur in="SourceGraphic" stdDeviation="2" result="a"/>
<feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b"/>
<feMerge><feMergeNode in="b"/><feMergeNode in="a"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
<filter id="spill" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="10"/></filter>
<clipPath id="glass"><path d="${glass}"/></clipPath>
${defsGlyphs}
${S.defs}
</defs>
<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="30" fill="url(#body)" stroke="#47413a" stroke-width="2"/>
<rect x="9" y="8" width="${W - 18}" height="${H - 16}" rx="25" fill="none" stroke="#fff" stroke-opacity=".05" stroke-width="1.5"/>
<rect x="20" y="20" width="${W - 40}" height="680" rx="30" fill="#090706" stroke="#000" stroke-opacity=".6" stroke-width="3"/>
<path d="${glass}" fill="none" stroke="#ffab1f" stroke-opacity=".2" stroke-width="10" filter="url(#spill)"/>
<g clip-path="url(#glass)">
<rect x="0" y="0" width="${W}" height="${H}" class="bg"/>
<g filter="url(#bloom)">${S.join('')}</g>
<rect x="0" y="0" width="${W}" height="${H}" fill="url(#amb)"/>
<rect x="0" y="0" width="${W}" height="${H}" fill="url(#scan)"/>
<rect class="roll" x="0" y="-140" width="${W}" height="140" fill="url(#rollg)"/>
<rect x="${GLASS.x0}" y="${GLASS.y0}" width="${GLASS.x1 - GLASS.x0}" height="${GLASS.y1 - GLASS.y0}" fill="url(#vig)"/>
<ellipse cx="330" cy="70" rx="520" ry="190" fill="url(#refl)"/>
<rect class="flick" x="0" y="0" width="${W}" height="${H}" fill="#000"/>
<rect class="${dip}" x="0" y="0" width="${W}" height="${H}" fill="#000"/>
</g>
<path d="${glass}" fill="none" stroke="#fff" stroke-opacity=".07" stroke-width="1.5"/>
${bezel}
</svg>
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
const at = (o) => Object.entries(o).map(([k, v]) => `${k} ${v}`).join(', ');
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB, ${animCount} keyframed animations, ${T}s loop)`);
console.log(`  ${at({ MODAL_A, MODAL_B, MODAL_E, PHASE_AT, CARD_AT, RUN_AT, BLD_AT, DENIED_AT, DONE_AT, CLEAR })}`);
