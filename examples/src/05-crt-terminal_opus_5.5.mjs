#!/usr/bin/env node
// Green Phosphor Terminal: README header generator for dance-vision.
//
//   node examples/src/05-crt-terminal_opus_5.5.mjs
//
// Writes examples/assets/05-crt-terminal_opus_5.5.svg.
// Plain Node, no dependencies, fully deterministic (seeded PRNG), so the art
// can be regenerated and tweaked. Every letter is drawn from the 5x7 bitmap
// font below as <path>/<use>; there is no <text> anywhere, so alignment is
// exact on every machine. Animation is CSS only, so a single
// prefers-reduced-motion rule freezes it on a readable still frame.

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
const T = 20;                     // master loop, seconds
// First paint starts this far into the story, so a static first frame already
// shows "camera frames transmitted: 0" and the relay line, mid-typing.
const OFFSET = 3.6;
const GLASS = { x0: 36, y0: 36, x1: 1044, y1: 684, r: 26, bulge: 5 };

// ---------------------------------------------------------------- PRNG
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(0xda7ce);

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
  '▶': '#....|##...|###..|####.|###..|##...|#....', '♪': '..#..|..##.|..#.#|..#..|.##..|###..|.#...',
  '→': '.....|..#..|...#.|#####|...#.|..#..|.....',
};
const FONT = {};
for (const [ch, src] of Object.entries(FONT_SRC)) {
  const rows = src.split('|');
  if (rows.some((r) => r.length !== 5) || rows.length < 7 || rows.length > 8) throw new Error(`bad glyph ${ch}`);
  FONT[ch] = rows;
}

// Box drawing and blocks are drawn edge to edge so they join across cells.
const BOX = {
  '─': [[0, 9, 12, 2]], '│': [[5, 0, 2, 20]],
  '┌': [[5, 9, 7, 2], [5, 9, 2, 11]], '┐': [[0, 9, 7, 2], [5, 9, 2, 11]],
  '└': [[5, 9, 7, 2], [5, 0, 2, 11]], '┘': [[0, 9, 7, 2], [5, 0, 2, 11]],
  '├': [[5, 0, 2, 20], [5, 9, 7, 2]], '┤': [[5, 0, 2, 20], [0, 9, 7, 2]],
  '═': [[0, 7, 12, 2], [0, 11, 12, 2]], '║': [[3, 0, 2, 20], [7, 0, 2, 20]],
  '╔': [[3, 7, 9, 2], [3, 7, 2, 13], [7, 11, 5, 2], [7, 11, 2, 9]],
  '╗': [[0, 7, 9, 2], [7, 7, 2, 13], [0, 11, 5, 2], [3, 11, 2, 9]],
  '╚': [[3, 11, 9, 2], [3, 0, 2, 13], [7, 7, 5, 2], [7, 0, 2, 9]],
  '╝': [[0, 11, 9, 2], [7, 0, 2, 13], [0, 7, 5, 2], [3, 0, 2, 9]],
  '█': [[0, 0, 12, 20]],
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
const rectsD = (rs) => rs.map(([x, y, w, h]) => `M${x} ${y}h${w}v${h}h-${w}z`).join('');

function glyphD(rows) {
  const runs = [];
  rows.forEach((row, y) => {
    for (let x = 0; x < 5;) {
      if (row[x] !== '#') { x++; continue; }
      const s = x; while (x < 5 && row[x] === '#') x++;
      runs.push({ x: s, y, w: x - s, h: 1 });
    }
  });
  const merged = [];
  for (const r of runs) {
    const m = merged.find((o) => o.x === r.x && o.w === r.w && o.y + o.h === r.y);
    if (m) m.h++; else merged.push({ ...r });
  }
  return merged.map((r) => `M${1 + 2 * r.x} ${2 + 2 * r.y}h${2 * r.w}v${2 * r.h}h-${2 * r.w}z`).join('');
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

// A row of coloured segments starting at grid (col,row). 'inv' = inverse video.
function line(col, row, segs) {
  let c = col, out = '';
  for (const [s, cls] of segs) {
    if (cls.startsWith('inv')) {
      out += `<rect class="${{ inv: 'n', invm: 'm', invd: 'd' }[cls]}" x="${X(c)}" y="${Y(row)}" width="${len(s) * CW}" height="${CH}"/>`;
      out += text(X(c), Y(row), s, 'k');
    } else if (s.trim()) out += text(X(c), Y(row), s, cls);
    c += len(s);
  }
  return out;
}
const center = (c0, c1, s) => c0 + Math.floor((c1 - c0 + 1 - len(s)) / 2);

// Big block-pixel lettering (figlet style) from the same 5x7 font.
function bigRects(str, px, py) {
  const rs = [];
  [...str].forEach((ch, i) => {
    if (ch === ' ') return;
    FONT[ch].slice(0, 7).forEach((row, y) => [...row].forEach((v, x) => {
      if (v === '#') rs.push([(i * 6 + x) * px, y * py, px, py]);
    }));
  });
  return mergeRects(rs);
}

// ---------------------------------------------------------------- CSS animation
const css = [];
let animCount = 0;
const pct = (t, dur) => `${+((t / dur) * 100).toFixed(3)}%`;
// events: [[seconds, 'decl'], ...]; the first event must be at t = 0.
// base: the still-frame style used when animations are off (reduced motion).
function anim(events, base, { dur = T, delay = -OFFSET } = {}) {
  const name = 'a' + (animCount++).toString(36);
  const ev = events.slice().sort((a, b) => a[0] - b[0]);
  if (ev[0][0] !== 0) throw new Error(`${name}: first keyframe must be at 0`);
  const kf = [];
  for (const [t, d] of ev) {
    if (kf.length && kf[kf.length - 1][1] === d) continue;
    if (kf.length && kf[kf.length - 1][0] === t) kf.pop();
    kf.push([t, d]);
  }
  const groups = new Map();
  for (const [t, d] of kf) groups.set(d, [...(groups.get(d) || []), pct(t, dur)]);
  groups.set(kf[0][1], [...groups.get(kf[0][1]), '100%']);
  css.push(`@keyframes ${name}{${[...groups].map(([d, ps]) => `${ps.join(',')}{${d}}`).join('')}}`);
  css.push(`.${name}{${base ? base + ';' : ''}animation:${name} ${dur}s step-end ${r2(delay)}s infinite}`);
  return name;
}
const op = (v) => `opacity:${v}`;
const tx = (v) => `transform:translateX(${v}px)`;
const tr = (x, y) => `transform:translate(${x}px,${y}px)`;
// Visible only inside [a,b) windows of the master loop.
function windows(list, visibleBase = false) {
  const ev = [[0, op(0)]];
  for (const [a, b] of list) { ev.push([a, op(1)]); if (b < T) ev.push([b, op(0)]); }
  if (list.some(([a]) => a === 0)) ev.shift();
  return anim(ev, op(visibleBase ? 1 : 0));
}

// ================================================================= CONTENT
const S = [];            // screen content (bloomed)
const push = (...s) => S.push(...s);

// ---- row 0: title bar ------------------------------------------------------
{
  const left = ' ■ DVTERM 26.09 │ dancer@telly:~ │ hdmi0';
  const right = 'JOINTS 33 │ VIDEO OUT 0 B │ ~30 KB/S ';
  push(line(0, 0, [[left + ' '.repeat(80 - len(left) - len(right)) + right, 'invm']]));
}

// ---- rows 2-5: logo --------------------------------------------------------
const LOGO = 'DANCE VISION';
{
  const rs = bigRects(LOGO, 12, 10);
  const d = rectsD(rs);
  const shadow = `<path fill="url(#dith)" transform="translate(12 10)" d="${d}"/>`;
  const face = `<path fill="url(#lg)" d="${d}"/>`;
  S.defs = (S.defs || '') + `<g id="logo">${shadow}${face}</g>`;
  // Three horizontal bands so the logo can tear like a bad VHOLD, once a loop.
  const bands = [[-10, 30], [30, 50], [50, 100]];
  const glitch = [
    [[0, tx(0)], [16.08, tx(-6)], [16.2, tx(0)]],
    [[0, tx(0)], [16.0, tx(10)], [16.14, tx(0)], [16.3, tx(-4)], [16.36, tx(0)]],
    [[0, tx(0)], [16.1, tx(5)], [16.2, tx(0)]],
  ];
  let g = '';
  bands.forEach(([a, b], i) => {
    S.defs += `<clipPath id="lb${i}"><rect x="-30" y="${a}" width="920" height="${b - a}"/></clipPath>`;
    g += `<g clip-path="url(#lb${i})"><use href="#logo" class="${anim(glitch[i], tx(0))}"/></g>`;
  });
  push(`<g transform="translate(${X(4)} ${Y(2)})">${g}</g>`);
}

// ---- row 6: tagline --------------------------------------------------------
{
  const segs = [['no app', 'n'], [' · ', 'd'], ['no account', 'n'], [' · ', 'd'],
    ['no video leaves your phone', 'n'], [' · ', 'd'], ['just the joints', 'b']];
  const total = segs.reduce((n, [s]) => n + len(s), 0);
  push(line(center(0, 79, 'x'.repeat(total)), 6, segs));
}

// ---- panes -----------------------------------------------------------------
function box(c0, r0, c1, r1, title, cls = 'd', rightTitle = '') {
  const inner = c1 - c0 - 1;
  // Titles: brackets dim, words normal.
  let out = '';
  let c = c0;
  const put = (s, k) => { out += line(c, r0, [[s, k]]); c += len(s); };
  put('┌─', cls);
  if (title) { put('[ ', cls); put(title, 'n'); put(' ]', cls); }
  put('─'.repeat(inner - (title ? len(title) + 5 : 1) - (rightTitle ? len(rightTitle) + 5 : 0)), cls);
  if (rightTitle) { put('[ ', cls); put(rightTitle, 'n'); put(' ]─', cls); }
  put('┐', cls);
  out += `<path class="${cls}" d="M${X(c0) + 5} ${Y(r0) + 11}h2v${(r1 - r0) * CH - 2}h-2zM${X(c1) + 5} ${Y(r0) + 11}h2v${(r1 - r0) * CH - 2}h-2z"/>`;
  out += line(c0, r1, [['└' + '─'.repeat(inner) + '┘', cls]]);
  return out;
}
push(box(0, 8, 48, 18, 'intrusion.log'));
push(box(50, 8, 79, 18, '/studio', 'd', 'tv'));
push(box(0, 23, 79, 28, 'tail -f /dev/joints | xxd', 'd', 'video bytes: 0'));

// ---- log pane (typed) ------------------------------------------------------
const CLEAR = 18.5;
const PROMPT = 'dancer@telly:~$ ';
const OK = (rest, hi = '') => [['[ ', 'd'], ['OK', 'b'], [' ] ', 'd'], [rest, 'n'], [hi, 'b']];
const LOG = [
  { row: 9, prompt: [['> ', 'n']], cmd: 'ssh dancer@telly', at: 0, typeAt: 0.45 },
  { row: 10, segs: [['qr scanned. no app, no account, no drama.', 'n']], at: 2.2 },
  { row: 11, segs: OK('pose model loaded: ', '33 joints'), at: 2.65 },
  { row: 12, segs: OK('camera frames transmitted: ', '0'), at: 3.1 },
  { row: 13, segs: OK('joints → ws relay → telly, ~30 KB/s'), at: 3.55 },
  { row: 14, segs: [['[', 'd'], ['WARN', 'inv'], ['] ', 'd'], ['dad detected. rhythm not found.', 'n']], at: 4.4 },
  { row: 15, prompt: [[PROMPT, 'n']], cmd: 'sudo dance --no-dignity', at: 5.2, typeAt: 5.75 },
  { row: 16, segs: OK("access granted. you're on the telly."), at: 13.8 },
  { row: 17, prompt: [[PROMPT, 'n']], cmd: 'clear', at: 14.3, typeAt: 17.55, finalHidden: true },
];
{
  let g = '';
  const cursor = [[0, 4, 9]];
  const bump = (t, c, r) => cursor.push([r2(t), c, r]);
  for (const L of LOG) {
    if (L.segs) {
      const cls = windows([[L.at, CLEAR]], true);
      g += `<g class="${cls}">${line(2, L.row, L.segs)}</g>`;
      bump(L.at, 2, L.row + 1);
      continue;
    }
    const pc = 2 + L.prompt.reduce((n, [s]) => n + len(s), 0);
    const inner = line(2, L.row, L.prompt) + line(pc, L.row, [[L.cmd, 'b']]);
    // Typing: a cover in the screen colour slides right one cell per keystroke.
    const ev = [[0, tx(0)]];
    let t = L.typeAt;
    if (L.at > 0) bump(L.at, pc, L.row);
    [...L.cmd].forEach((_, i) => {
      t += 0.055 + rng() * 0.06;
      ev.push([r2(t), tx((i + 1) * CW)]);
      bump(t, pc + i + 1, L.row);
    });
    ev.push([CLEAR, tx(0)]);
    const cover = `<g transform="translate(${X(pc)} ${Y(L.row)})"><rect class="bg ${anim(ev, tx(L.finalHidden ? 0 : 600))}" width="${len(L.cmd) * CW}" height="${CH}"/></g>`;
    const vis = L.at === 0 ? '' : ` class="${windows([[L.at, CLEAR]], true)}"`;
    g += `<g${vis}>${inner}${cover}</g>`;
    if (!L.finalHidden) bump(t + 0.3, 2, L.row + 1);
  }
  bump(CLEAR, 4, 9);
  // Cursor: explicit keyframed positions + its own blink.
  const cEv = cursor.map(([t, c, r]) => [t, tr(X(c), Y(r))]);
  const cur = `<g class="${anim(cEv, tr(X(2 + len(PROMPT)), Y(17)))}"><rect class="n blink" x="1" y="2" width="10" height="16"/></g>`;
  S.defs += `<clipPath id="logclip"><rect x="${X(1)}" y="${Y(9)}" width="${47 * CW}" height="${9 * CH}"/></clipPath>`;
  push(`<g clip-path="url(#logclip)">${g}${cur}</g>`);
}

// ---- studio pane: three ASCII dancers --------------------------------------
const FRAMES = {
  R0: ['\\o/', ' | ', '/ \\'], R1: [' o ', '<|>', '/ \\'], R2: [' o/', '/| ', '/ \\'], R3: ['\\o ', ' |\\', '/ \\'],
  R4: ['_o_', ' | ', '/ \\'], R5: ['\\o_', ' | ', '/ >'], R6: ['_o/', ' | ', '< \\'], R7: [' o ', '/|\\', '| |'],
  C1: ['\\O/', ' | ', '/ \\'],
  S0: ['\\o/', ' | ', ' | '], S1: [' o/', '-| ', ' | '], S2: [' o ', '-|-', ' | '], S3: ['\\o ', ' |-', ' | '],
};
const DY = { C1: -4 };
const PITCH = 16; // tighter line pitch so the stick figures join up
{
  for (const [k, rows] of Object.entries(FRAMES)) {
    const inner = rows.map((r, i) => text(0, i * PITCH, r, 'b')).join('');
    S.defs += `<g id="f${k}"${DY[k] ? ` transform="translate(0 ${DY[k]})"` : ''}>${inner}</g>`;
  }
  const FIG = [53, 62, 71];
  const NAMES = ['KEZ', 'NAN', 'YOU'];
  const figY = Y(10) + 8;
  const ROUTINE = ['R0', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7'];
  css.push('@keyframes rt{0%{opacity:1}12.5%,100%{opacity:0}}@keyframes q4{0%{opacity:1}25%,100%{opacity:0}}@keyframes q2{0%{opacity:1}50%,100%{opacity:0}}');
  const modN = (v, m) => ((v % m) + m) % m;
  const routineMode = windows([[0, 14], [18, T]], true);
  const spotMode = windows([[14, 18]]);
  let g = '';
  FIG.forEach((col, d) => {
    const lag = d === 2 ? 1 : 0; // YOU are one beat behind, obviously
    let routine = '';
    ROUTINE.forEach((k, i) => {
      const delay = modN((i + lag) * 0.5 - OFFSET, 4) - 4;
      routine += `<use href="#f${k}" style="opacity:${i === 0 ? 1 : 0};animation:rt 4s step-end ${r2(delay)}s infinite"/>`;
    });
    const spot = d === 1 ? ['S0', 'S1', 'S2', 'S3'] : ['R0', 'C1'];
    const per = d === 1 ? 1 : 0.5;
    let sp = '';
    spot.forEach((k, i) => {
      const delay = modN(i * 0.25 - OFFSET, per) - per;
      sp += `<use href="#f${k}" style="opacity:0;animation:${d === 1 ? 'q4 1s' : 'q2 .5s'} step-end ${r2(delay)}s infinite"/>`;
    });
    g += `<g transform="translate(${X(col)} ${figY}) scale(2)"><g class="${routineMode}">${routine}</g><g class="${spotMode}">${sp}</g></g>`;
    // Pose-tracking corners, name tag.
    const corners = (k) => line(col - 1, 10, [['┌', k]]) + line(col + 6, 10, [['┐', k]]) + line(col - 1, 15, [['└', k]]) + line(col + 6, 15, [['┘', k]]);
    g += corners('d');
    // Name tags sit half a cell right of the grid so they centre under the
    // 6-cell-wide (scaled x2) figure rather than drifting left of it.
    const tag = (k) => `<g transform="translate(${CW / 2} 0)">${line(col + 1, 16, [[NAMES[d], k]])}</g>`;
    g += tag(d === 2 ? 'n' : 'd');
    if (d === 1) {
      g += `<g class="${spotMode}">${corners('b')}${tag('inv')}</g>`;
    }
  });
  g += line(center(51, 78, '3 of 6 on the floor'), 9, [['3', 'b'], [' of 6 on the floor', 'd']]);
  // Row 17: spotlight countdown (10 s, names the dancer), then the moment itself.
  const idle = 'spotlight every minute-ish';
  g += `<g class="${windows([[0, 4], [18, T]], true)}">${line(center(51, 78, idle), 17, [[idle, 'd']])}</g>`;
  for (let n = 10; n >= 1; n--) {
    const s = `SPOTLIGHT: NAN IN ${n}`;
    const a = 4 + (10 - n);
    g += `<g class="${windows([[a, a + 1]])}">${line(center(51, 78, 'SPOTLIGHT: NAN IN 10'), 17, [['SPOTLIGHT: ', 'd'], ['NAN', 'b'], [` IN ${n}`, 'n']])}</g>`;
  }
  const star = '* NAN IN THE SPOTLIGHT *';
  g += `<g class="${spotMode}">${line(center(51, 78, star), 17, [[star, 'inv']])}</g>`;
  push(g);
}

// ---- pipeline: phone -> pose model -> joints -> relay -> tv ---------------
const PACKET_LOOP = 3.2;
const RX = { at: 0 };     // when the packet reaches TV STUDIO (drives the RX LED)
{
  const nodes = [['PHONE', 6], ['POSE MODEL', 17], ['33 x {x,y,z}', 33], ['WS RELAY', 51], ['TV STUDIO', 65]];
  const arrows = [12, 28, 46, 60];
  let g = '';
  for (const [s, c] of nodes) g += line(c, 20, [[s, 'b']]);
  for (const c of arrows) g += line(c, 20, [['═══', 'd'], ['▶', 'n']]);
  const subs = [['camera', 8], ['on-device', 21], ['~1.6 KB, no pixels', 38], ['websocket', 54], ['three.js', 69]];
  for (const [s, mid] of subs) g += line(Math.round(mid - len(s) / 2 + 0.5), 21, [[s, 'd']]);
  // A packet hops along the wires; each stage lights up as it passes.
  const P = PACKET_LOOP, hop = 0.08, dwell = 0.3;
  let t = 0;
  const pev = [[0, `${op(0)};${tx(0)}`]];
  nodes.forEach(([s, c], i) => {
    if (i === nodes.length - 1) RX.at = r2(t);   // packet lands on the telly
    const lit = anim([[0, op(0)], [r2(t), op(1)], [r2(t + dwell), op(0)]], op(0), { dur: P, delay: 0 });
    g += `<g class="${lit}">${line(c, 20, [[s, 'inv']])}</g>`;
    t += dwell;
    if (i < arrows.length) {
      for (let k = 0; k < 4; k++) { pev.push([r2(t), `${op(1)};${tx((arrows[i] + k) * CW)}`]); t += hop; }
      pev.push([r2(t), `${op(0)};${tx((arrows[i] + 3) * CW)}`]);
    }
  });
  // The packet owns its cell: a screen-coloured backing hides the wire or
  // arrowhead underneath, the way a real terminal overwrites a character.
  g += `<g transform="translate(${GX} ${Y(20)})"><g class="${anim(pev, op(0), { dur: P, delay: 0 })}"><rect class="bg" width="${CW}" height="${CH}"/>${text(0, 0, '■', 'b')}</g></g>`;
  push(g);
}

// ---- hex dump of a real-looking pose packet --------------------------------
{
  // Hip-centred world landmarks in metres (MediaPipe order, 33 points), arms up.
  const base = [
    [0, -0.63, -0.3], [-0.02, -0.66, -0.29], [-0.03, -0.66, -0.29], [-0.04, -0.66, -0.29], [0.02, -0.66, -0.29],
    [0.03, -0.66, -0.29], [0.04, -0.66, -0.29], [-0.08, -0.64, -0.2], [0.08, -0.64, -0.2], [-0.03, -0.6, -0.27],
    [0.03, -0.6, -0.27], [-0.17, -0.46, -0.12], [0.17, -0.46, -0.12], [-0.31, -0.62, -0.1], [0.31, -0.62, -0.1],
    [-0.38, -0.82, -0.12], [0.38, -0.82, -0.12], [-0.4, -0.86, -0.13], [0.4, -0.86, -0.13], [-0.39, -0.87, -0.14],
    [0.39, -0.87, -0.14], [-0.38, -0.85, -0.12], [0.38, -0.85, -0.12], [-0.1, 0, 0.01], [0.1, 0, -0.01],
    [-0.13, 0.38, -0.02], [0.13, 0.38, 0.02], [-0.15, 0.76, 0.06], [0.15, 0.76, 0.08], [-0.16, 0.8, 0.07],
    [0.16, 0.8, 0.09], [-0.14, 0.85, -0.02], [0.14, 0.85, -0.01],
  ];
  const world = base.map((p) => p.map((v) => Number((v + (rng() - 0.5) * 0.04).toFixed(4))));
  const packet = JSON.stringify({ v: 1, type: 'pose', seq: 4242, captureMs: 88231, aspect: 0.5625, world });
  const buf = Buffer.from(packet, 'utf8');
  const N = 16, SHOW = 4;
  const rows = [];
  for (let i = 0; i < N + SHOW; i++) {
    const off = (i % N) * 16;
    const bytes = buf.subarray(off, off + 16);
    const hex = [];
    for (let j = 0; j < 16; j += 2) hex.push(bytes.subarray(j, j + 2).toString('hex'));
    const ascii = [...bytes].map((b) => (b >= 32 && b < 127 ? String.fromCharCode(b) : '.')).join('');
    rows.push([`${off.toString(16).padStart(8, '0')}: `, hex.join(' '), '  ' + ascii]);
  }
  let g = '';
  rows.forEach(([o, h, a], i) => {
    g += text(0, i * CH, o, 'd') + text(10 * CW, i * CH, h, 'n') + text(49 * CW, i * CH, a, 'b');
  });
  // One row every 0.25 s: busy enough to feel live, slow enough to read the
  // floats go by. 16 rows = 4 s, which divides the 20 s master loop.
  css.push(`.hx{animation:hx ${r2(N * 0.25)}s steps(${N}) infinite}@keyframes hx{to{transform:translateY(-${N * CH}px)}}`);
  S.defs += `<clipPath id="hexclip"><rect x="${X(1)}" y="${Y(24)}" width="${78 * CW}" height="${4 * CH}"/></clipPath>`;
  push(`<g clip-path="url(#hexclip)"><g transform="translate(${X(6)} ${Y(24)})"><g class="hx">${g}</g></g></g>`);
}

// ---- row 29: function-key bar (Midnight-Commander style) -------------------
{
  const labels = ['HELP', 'SPOTLT', 'VENUE', 'MAPPER', 'PARTY', 'BOOGIE', 'CHIPS', 'WINGS', 'NAN', 'QUIT'];
  const segs = [];
  labels.forEach((l, i) => {
    const key = String(i + 1);
    const width = 8; // ten 8-column slots = 80 columns
    segs.push([key, 'b'], [l.padEnd(width - key.length - (i === 9 ? 0 : 1)), 'invm']);
    if (i !== 9) segs.push([' ', 'n']);
  });
  push(line(0, 29, segs));
}

// ---- ACCESS GRANTED overlay -------------------------------------------------
{
  const A = 8.0, B = 9.6, E = 13.6;
  // Centred modal; edges chosen so the log's "[ OK ]" brackets and the YOU
  // name tag are never sliced in half by the frame.
  const c0 = 8, c1 = 71, r0 = 10, r1 = 16;
  const inner = c1 - c0 - 1;
  let o = `<rect class="bg" x="${X(c0)}" y="${Y(r0)}" width="${(c1 - c0 + 1) * CW}" height="${(r1 - r0 + 1) * CH}"/>`;
  const title = ' SECURITY OVERRIDE ';
  let frame = line(c0, r0, [['╔═[', 'b'], [title, 'n'], [']' + '═'.repeat(inner - len(title) - 3) + '╗', 'b']]);
  frame += `<path class="b" d="M${X(c0) + 3} ${Y(r0 + 1)}h2v${(r1 - r0 - 1) * CH}h-2zM${X(c0) + 7} ${Y(r0 + 1)}h2v${(r1 - r0 - 1) * CH}h-2zM${X(c1) + 3} ${Y(r0 + 1)}h2v${(r1 - r0 - 1) * CH}h-2zM${X(c1) + 7} ${Y(r0 + 1)}h2v${(r1 - r0 - 1) * CH}h-2z"/>`;
  frame += line(c0, r1, [['╚' + '═'.repeat(inner) + '╝', 'b']]);
  // Phase 1: the "hack".
  const msg = 'bypassing dignity firewall...';
  let p1 = line(center(c0, c1, msg), 12, [['> ', 'n'], [msg.slice(0, -3), 'b'], ['...', 'n']]);
  const bw = 48, bc = center(c0, c1, 'x'.repeat(bw + 2));
  p1 += line(bc, 14, [['[', 'n']]) + line(bc + bw + 1, 14, [[']', 'n']]);
  p1 += `<rect fill="url(#dithd)" x="${X(bc + 1)}" y="${Y(14) + 3}" width="${bw * CW}" height="14"/>`;
  const fill = [[0, 'transform:scaleX(0)']];
  for (let k = 1; k <= 24; k++) fill.push([r2(A + 0.2 + k * 0.05 + (k > 16 ? 0.12 : 0)), `transform:scaleX(${r2(k / 24)})`]);
  fill.push([E, 'transform:scaleX(0)']);
  p1 += `<g transform="translate(${X(bc + 1)} ${Y(14) + 3})"><rect class="b ${anim(fill, 'transform:scaleX(0)')}" width="${bw * CW}" height="14"/></g>`;
  o += `<g class="${windows([[A, B]])}">${p1}</g>`;
  // Phase 2: ACCESS GRANTED in block pixels, revealed a letter at a time.
  const big = 'ACCESS GRANTED';
  const d = rectsD(bigRects(big, 8, 8));
  const bwid = (len(big) * 6 - 1) * 8;
  const bx = X(c0) + Math.round(((c1 - c0 + 1) * CW - bwid) / 2), by = Y(11) + 2;
  let p2 = `<g transform="translate(${bx} ${by})"><path fill="url(#dith)" transform="translate(8 8)" d="${d}"/><path fill="url(#ag)" d="${d}"/>`;
  const rev = [[0, tx(0)]];
  for (let k = 1; k <= len(big); k++) rev.push([r2(B + 0.05 + k * 0.035), tx(k * 48)]);
  rev.push([E, tx(0)]);
  p2 += `<rect class="bg ${anim(rev, tx(0))}" x="-4" y="-4" width="${bwid + 20}" height="76"/></g>`;
  const sub = "welcome to the floor. act natural.";
  p2 += `<g class="${windows([[B + 0.7, E]])}">${line(center(c0, c1, sub), 15, [[sub, 'n']])}</g>`;
  o += `<g class="${windows([[B, E]])}">${p2}</g>` + frame;
  S.defs += `<clipPath id="ovclip"><rect x="${X(c0)}" y="${Y(r0)}" width="${(c1 - c0 + 1) * CW}" height="${(r1 - r0 + 1) * CH}"/></clipPath>`;
  push(`<g clip-path="url(#ovclip)" class="${windows([[A, E]])}">${o}</g>`);
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

// Bezel lettering, plus an RX lamp that blinks each time a joint packet lands
// on the telly (in step with the pipeline row above).
const rxOn = anim([[0, op(0)], [RX.at, op(1)], [r2(RX.at + 0.3), op(0)]], op(0), { dur: PACKET_LOOP, delay: 0 });
const bezel = [
  `<g transform="translate(64 709) scale(.8)">${text(0, 0, 'DALSTON DATAVISION', 'z')}${text(20 * CW, 0, 'DV-80 · P1 GREEN PHOSPHOR · 80x30', 'zd')}</g>`,
  `<g transform="translate(862 709) scale(.8)">${text(0, 0, 'RX', 'zd')}</g>`,
  `<circle cx="902" cy="716" r="4" fill="#123a22" stroke="#000" stroke-opacity=".5"/>`,
  `<g class="${rxOn}"><circle cx="902" cy="716" r="10" fill="url(#ledg)"/><circle cx="902" cy="716" r="3.2" fill="#d8ffe5"/></g>`,
  `<g transform="translate(948 709) scale(.8)">${text(0, 0, 'PWR', 'zd')}</g>`,
].join('');

const defsGlyphs = [...used].sort().map((ch) => `<path id="${gid(ch)}" d="${glyphD(FONT[ch])}"/>`).join('');

// Every animation is stepped (no linear/ease tweens). Inside <img> the browser
// re-rasterises the whole SVG, bloom filter included, whenever anything moves,
// so a continuous tween would force a full redraw every frame. The scan bar
// steps at 10 fps (invisible on a 5% gradient) and roughly halves the cost.
const style = `
.b{fill:#c9ffda}.n{fill:#47ee80}.m{fill:#33c466}.d{fill:#2aab5a}.k,.bg{fill:#03110a}
.z{fill:#8b948d}.zd{fill:#5c645e}
.blink{animation:blink 1.06s step-end infinite}@keyframes blink{50%{opacity:0}}
.roll{animation:roll 9s steps(90) infinite}@keyframes roll{from{transform:translateY(0)}to{transform:translateY(${H + 140}px)}}
.flick{opacity:0;animation:flick 5.3s step-end infinite}
@keyframes flick{0%{opacity:0}31%{opacity:.05}31.8%{opacity:0}58%{opacity:.035}58.9%{opacity:0}77%{opacity:.06}77.6%{opacity:0}}
${css.join('\n')}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
`.trim();

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
<title id="t">Dance Vision</title>
<desc id="d">A green phosphor CRT terminal. The DANCE VISION logo sits above a typed log: ssh dancer@telly, pose model loaded: 33 joints, camera frames transmitted: 0. ACCESS GRANTED appears, three ASCII stick figures dance in a studio pane, a packet travels phone, pose model, joints, websocket relay, TV studio, and a hex dump of a joint packet scrolls.</desc>
<style>${style}</style>
<defs>
<pattern id="dith" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 0h2v2H0zM2 2h2v2H2z" fill="#166a35"/></pattern>
<pattern id="dithd" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 0h2v2H0zM2 2h2v2H2z" fill="#1a5f33"/></pattern>
<pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect y="2.6" width="4" height="1.4" fill="#000" fill-opacity=".42"/></pattern>
<linearGradient id="lg" x1="0" y1="0" x2="0" y2="70" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#eafff0"/><stop offset=".45" stop-color="#74ffa4"/><stop offset="1" stop-color="#2fd66b"/></linearGradient>
<linearGradient id="ag" x1="0" y1="0" x2="0" y2="56" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#e4ffec"/><stop offset=".5" stop-color="#6dff9e"/><stop offset="1" stop-color="#2bd066"/></linearGradient>
<linearGradient id="body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#303632"/><stop offset=".08" stop-color="#232824"/><stop offset="1" stop-color="#141816"/></linearGradient>
<radialGradient id="vig" cx=".5" cy=".5" r=".72"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".72"/></radialGradient>
<radialGradient id="amb" cx=".5" cy=".46" r=".62"><stop offset="0" stop-color="#39ff85" stop-opacity=".075"/><stop offset="1" stop-color="#39ff85" stop-opacity="0"/></radialGradient>
<linearGradient id="refl" x1="0" y1="0" x2=".55" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".085"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="rollg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9dffc4" stop-opacity="0"/><stop offset=".5" stop-color="#9dffc4" stop-opacity=".05"/><stop offset="1" stop-color="#9dffc4" stop-opacity="0"/></linearGradient>
<radialGradient id="ledg"><stop offset="0" stop-color="#b8ffd0"/><stop offset=".4" stop-color="#3dff7f"/><stop offset="1" stop-color="#3dff7f" stop-opacity="0"/></radialGradient>
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
<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="34" fill="url(#body)" stroke="#3b423d" stroke-width="2"/>
<rect x="9" y="8" width="${W - 18}" height="${H - 16}" rx="29" fill="none" stroke="#fff" stroke-opacity=".05" stroke-width="1.5"/>
<rect x="20" y="20" width="${W - 40}" height="680" rx="30" fill="#070908" stroke="#000" stroke-opacity=".6" stroke-width="3"/>
<path d="${glass}" fill="none" stroke="#39ff85" stroke-opacity=".22" stroke-width="10" filter="url(#spill)"/>
<g clip-path="url(#glass)">
<rect x="0" y="0" width="${W}" height="${H}" class="bg"/>
<g filter="url(#bloom)">${S.join('')}</g>
<rect x="0" y="0" width="${W}" height="${H}" fill="url(#amb)"/>
<rect x="0" y="0" width="${W}" height="${H}" fill="url(#scan)"/>
<rect class="roll" x="0" y="-140" width="${W}" height="140" fill="url(#rollg)"/>
<rect x="${GLASS.x0}" y="${GLASS.y0}" width="${GLASS.x1 - GLASS.x0}" height="${GLASS.y1 - GLASS.y0}" fill="url(#vig)"/>
<ellipse cx="330" cy="70" rx="520" ry="190" fill="url(#refl)"/>
<rect class="flick" x="0" y="0" width="${W}" height="${H}" fill="#000"/>
</g>
<path d="${glass}" fill="none" stroke="#fff" stroke-opacity=".07" stroke-width="1.5"/>
${bezel}
<circle cx="1018" cy="716" r="12" fill="url(#ledg)"/>
<circle cx="1018" cy="716" r="3.6" fill="#d8ffe5"/>
</svg>
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB, ${animCount} keyframed animations)`);
