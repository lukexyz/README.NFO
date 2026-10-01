#!/usr/bin/env node
// CASTAWAY as an Amiga description logo: the small outline logo that headed a file's description on
// an Amiga BBS, drawn from underscores, slashes and pipes while the upload ran.
//
// Regenerate:  node examples/castaway/src/44-amiga-description-logo_opus_5.5.mjs
// Writes ../assets/<slug>.svg (the animated banner), ../assets/<slug>-residents.svg (a static page
// of four more description logos) and ../<slug>.md (the README header, with the text twin).
//   --at=SECONDS  bake a head start into every animation (to check a later moment of the loop);
//                 use it only together with --out, never in place
//   --out=DIR     write the SVGs into DIR instead of ../assets (the .md is then not written)
//   --dump        print the text twin to stdout
//   --times       print the timeline
//
// Style reference (catalogue entry nfo-06): the compact Amiga description logos of 1992-94, the
// manner of the early Amiga ASCII groups and artists such as Rotox, Enforcer and Skin. They are
// named here as the reference only: no logo, tag, group name or letterform of theirs is copied.
// What is reused is the shared vocabulary: outline capitals that lean, made of _ / \ | with : . -
// as accents, letters that share walls so the word reads as one folded ribbon, a /\ peak breaking
// the roof line, a colon poking above the roof, a base rule that runs through the letters' feet
// and ends in angle brackets with the artist's tag in it, and a caption line of the form
// [-tag-]------> client. Every letter here was drawn for this file. The artist (Shorehand, tag
// shh.) and the crew (Pending Ink) are invented.
//
// How the SVG works (the "SVG twin" the catalogue suggests):
//   * No font. Every character of the logo is a stroke in an 8 x 16 Topaz-sized cell: the
//     underscore is the cell's floor, slash and backslash its diagonals, the pipe its centre line,
//     the hyphen its mid line. Ends then meet at cell corners the way they did in Topaz. The SVG
//     also closes the joins Topaz left open: an underscore that follows a slash, or comes before a
//     backslash, runs under it to meet its foot, and a hyphen reaches into a neighbouring slash.
//   * Small text (tag, caption, description) is an 8 x 8 Topaz-proportioned bitmap font on 1:2
//     pixels (glyph table adapted from the ULTRA-SATISFACTORY colly generator), merged into runs;
//     there is no <text> anywhere.
//   * The palm is the one thing not built from cells: in 8 x 16 cells every slash is so steep that
//     any character palm turns into a pagoda. It is an outline figure in the same ink and line
//     weight (a two-line trunk with bark ticks, six slim outlined fronds, curves cut into a few
//     straight facets), with two coconuts for the colon that pokes above the roof. The text twin
//     carries an ASCII palm in its place.
//   * One 30 second loop (ten bars of the 80 BPM theme). The logo is complete at time zero. Then
//     the tide comes in row by row, in hard steps, takes the ink, and goes out again; only the
//     wet imprint (a faint wide underlay) and the palm are left. A cursor retypes the logo row by
//     row, each character drawing itself on (stroke-dashoffset on a path of pathLength 1), the
//     base rule shoots out to both margins, the arrowheads and the tag drop in, and it holds. The
//     final state equals the first, so the loop has no seam.
//   * Each character has its own small @keyframes (four stops), so the whole draw needs no script.
//   * prefers-reduced-motion stops everything on the complete logo.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '44-amiga-description-logo_opus_5.5';
const argv = process.argv.slice(2);
const arg = (name) => {
  const hit = argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
};
const AT = Number(arg('at') || 0);
const OUTDIR = arg('out') ? path.resolve(arg('out')) : path.join(HERE, '..', 'assets');
const OUT_SVG = path.join(OUTDIR, `${SLUG}.svg`);
const OUT_MD = path.join(HERE, '..', `${SLUG}.md`);
const WRITE_MD = !arg('out');

const n = (v, d = 2) => String(+(+v).toFixed(d));

// ---------------------------------------------------------------------------------------------
// Palette: one ink on one ground, as the catalogue asks. Everything else is that ink at a lower
// opacity, or the ground a shade lighter (the water).
// ---------------------------------------------------------------------------------------------
const INK = '#f6dcaa';
const GROUND = '#0a2530';
const RIM = '#1d4652';
const WATER = '#0f3742';

// ---------------------------------------------------------------------------------------------
// The grid: 80 columns of 8 x 16 cells.
// ---------------------------------------------------------------------------------------------
const CW = 8, CH = 16;
const COLS = 80, ROWS = 17;
const PADX = 20, PADY = 14;
const VW = COLS * CW + PADX * 2, VH = ROWS * CH + PADY * 2;
const X = (c) => PADX + c * CW;
const Y = (r) => PADY + r * CH;

// ---------------------------------------------------------------------------------------------
// 8 x 8 bitmap font (Topaz-like proportions: two-pixel stems). Shown on 1:2 pixels.
// ---------------------------------------------------------------------------------------------
const FONT_SRC = {
  A: '..##....|.####...|##..##..|##..##..|######..|##..##..|##..##..|........',
  C: '.####...|##..##..|##......|##......|##......|##..##..|.####...|........',
  S: '.####...|##..##..|##......|.####...|....##..|##..##..|.####...|........',
  T: '######..|..##....|..##....|..##....|..##....|..##....|..##....|........',
  W: '##...##.|##...##.|##...##.|##.#.##.|#######.|###.###.|##...##.|........',
  Y: '##..##..|##..##..|##..##..|.####...|..##....|..##....|..##....|........',
  B: '#####...|##..##..|##..##..|#####...|##..##..|##..##..|#####...|........',
  D: '####....|##.##...|##..##..|##..##..|##..##..|##.##...|####....|........',
  E: '######..|##......|##......|####....|##......|##......|######..|........',
  F: '######..|##......|##......|####....|##......|##......|##......|........',
  G: '.####...|##..##..|##......|##.###..|##..##..|##..##..|.#####..|........',
  H: '##..##..|##..##..|##..##..|######..|##..##..|##..##..|##..##..|........',
  I: '.####...|..##....|..##....|..##....|..##....|..##....|.####...|........',
  K: '##..##..|##.##...|####....|###.....|####....|##.##...|##..##..|........',
  L: '##......|##......|##......|##......|##......|##......|######..|........',
  M: '##...##.|###.###.|#######.|##.#.##.|##...##.|##...##.|##...##.|........',
  N: '##...##.|###..##.|####.##.|##.####.|##..###.|##...##.|##...##.|........',
  O: '.####...|##..##..|##..##..|##..##..|##..##..|##..##..|.####...|........',
  P: '#####...|##..##..|##..##..|#####...|##......|##......|##......|........',
  R: '#####...|##..##..|##..##..|#####...|##.##...|##..##..|##..##..|........',
  U: '##..##..|##..##..|##..##..|##..##..|##..##..|##..##..|.####...|........',
  V: '##..##..|##..##..|##..##..|##..##..|##..##..|.####...|..##....|........',
  a:'........|........|.####...|....##..|.#####..|##..##..|.#####..|........',
  b: '##......|##......|#####...|##..##..|##..##..|##..##..|#####...|........',
  c: '........|........|.####...|##......|##......|##......|.####...|........',
  d: '....##..|....##..|.#####..|##..##..|##..##..|##..##..|.#####..|........',
  e: '........|........|.####...|##..##..|######..|##......|.####...|........',
  f: '..###...|.##.....|####....|.##.....|.##.....|.##.....|.##.....|........',
  g: '........|........|.#####..|##..##..|##..##..|.#####..|....##..|.####...',
  h: '##......|##......|#####...|##..##..|##..##..|##..##..|##..##..|........',
  i: '..##....|........|.###....|..##....|..##....|..##....|.####...|........',
  j: '....##..|........|...###..|....##..|....##..|....##..|##..##..|.####...',
  k: '##......|##......|##..##..|##.##...|####....|##.##...|##..##..|........',
  l: '.###....|..##....|..##....|..##....|..##....|..##....|...###..|........',
  m: '........|........|###.##..|#######.|##.#.##.|##.#.##.|##...##.|........',
  n: '........|........|#####...|##..##..|##..##..|##..##..|##..##..|........',
  o: '........|........|.####...|##..##..|##..##..|##..##..|.####...|........',
  p: '........|........|#####...|##..##..|##..##..|#####...|##......|##......',
  q: '........|........|.#####..|##..##..|##..##..|.#####..|....##..|....##..',
  r: '........|........|##.###..|###.....|##......|##......|##......|........',
  s: '........|........|.#####..|##......|.####...|....##..|#####...|........',
  t: '.##.....|.##.....|####....|.##.....|.##.....|.##.....|..###...|........',
  u: '........|........|##..##..|##..##..|##..##..|##..##..|.#####..|........',
  v: '........|........|##..##..|##..##..|##..##..|.####...|..##....|........',
  w: '........|........|##...##.|##.#.##.|##.#.##.|#######.|.##.##..|........',
  x: '........|........|##..##..|.####...|..##....|.####...|##..##..|........',
  y: '........|........|##..##..|##..##..|##..##..|.#####..|....##..|.####...',
  z: '........|........|######..|...##...|..##....|.##.....|######..|........',
  0: '.####...|##..##..|##.###..|###.##..|##..##..|##..##..|.####...|........',
  1: '..##....|.###....|..##....|..##....|..##....|..##....|.####...|........',
  2: '.####...|##..##..|....##..|...##...|..##....|.##.....|######..|........',
  3: '.####...|##..##..|....##..|..###...|....##..|##..##..|.####...|........',
  4: '...###..|..####..|.##.##..|##..##..|######..|....##..|....##..|........',
  5: '######..|##......|#####...|....##..|....##..|##..##..|.####...|........',
  6: '.####...|##......|#####...|##..##..|##..##..|##..##..|.####...|........',
  7: '######..|....##..|...##...|..##....|..##....|..##....|..##....|........',
  8: '.####...|##..##..|##..##..|.####...|##..##..|##..##..|.####...|........',
  9: '.####...|##..##..|##..##..|.#####..|....##..|....##..|.####...|........',
  '.': '........|........|........|........|........|..##....|..##....|........',
  ',': '........|........|........|........|........|..##....|..##....|.##.....',
  ':': '........|..##....|..##....|........|........|..##....|..##....|........',
  '!': '..##....|..##....|..##....|..##....|..##....|........|..##....|........',
  "'": '..##....|..##....|.##.....|........|........|........|........|........',
  '-': '........|........|........|######..|........|........|........|........',
  '(': '...##...|..##....|.##.....|.##.....|.##.....|..##....|...##...|........',
  ')': '.##.....|..##....|...##...|...##...|...##...|..##....|.##.....|........',
  '[': '.####...|.##.....|.##.....|.##.....|.##.....|.##.....|.####...|........',
  ']': '.####...|...##...|...##...|...##...|...##...|...##...|.####...|........',
  '<': '....##..|...##...|..##....|.##.....|..##....|...##...|....##..|........',
  '>': '.##.....|..##....|...##...|....##..|...##...|..##....|.##.....|........',
  '#': '.##.##..|.##.##..|#######.|.##.##..|#######.|.##.##..|.##.##..|........',
  '/': '.....##.|....##..|...##...|..##....|.##.....|##......|........|........',
  '_': '........|........|........|........|........|........|........|########',
  '=': '........|........|######..|........|######..|........|........|........',
  '+': '........|..##....|..##....|######..|..##....|..##....|........|........',
  '?': '.####...|##..##..|....##..|...##...|..##....|........|..##....|........',
};
const FONT = new Map();
for (const [ch, src] of Object.entries(FONT_SRC)) {
  const rows = src.split('|');
  if (rows.length !== 8 || rows.some((r) => r.length !== 8)) throw new Error(`bad glyph ${ch}`);
  FONT.set(ch, rows);
}
// One string of small text as one path: pixel runs merged per row, each pixel 1 x 2.
function textD(str, col, row) {
  let d = '';
  [...str].forEach((ch, i) => {
    if (ch === ' ') return;
    const g = FONT.get(ch);
    if (!g) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
    const ox = X(col + i), oy = Y(row);
    g.forEach((line, y) => {
      let x = 0;
      while (x < 8) {
        if (line[x] !== '#') { x++; continue; }
        let e = x; while (e < 8 && line[e] === '#') e++;
        d += `M${ox + x} ${oy + y * 2}h${e - x}v2h${x - e}z`;
        x = e;
      }
    });
  });
  return d;
}

// ---------------------------------------------------------------------------------------------
// The outline alphabet. Each letter is five rows: the roof (underscores sitting on the letter's
// top edge, and a /\ peak where the letter breaks the roof line) and four body rows. Verticals are
// slashes, so everything leans one column per row. Letters are overlaid at offsets chosen so that
// neighbours share a wall (A and S, T and A, A and W, W and A) and the roof runs on as one line.
// ---------------------------------------------------------------------------------------------
const LETTER = {
  C: String.raw`
    _____
   /  __/
  /  /
 /  /__
/_____/
`,
  A: String.raw`
    /\____
   / __  /
  / /_/ /
 / __  /
/_/ /_/
`,
  // the same A with a flat roof (two peaks per logo, not three)
  a: String.raw`
    ______
   / __  /
  / /_/ /
 / __  /
/_/ /_/
`,
  S: String.raw`
   _______
  /  ____/
 /  /____
 \_____  \
 /_______/
`,
  T: String.raw`
    ________
   /__   __/
     /  /
    /  /
   /__/
`,
  W: String.raw`
    __  __  __
   / / / / / /
  / / / / / /
 / /_/ /_/ /
/_________/
`,
  Y: String.raw`
 ___     ___
 \  \   /  /
  \  \_/  /
   \_   _/
    /__/
`,
  // the rest of the alphabet the residents' logos need (text only: see THE RESIDENTS below)
  H: String.raw`
    ___   ___
   /  /__/  /
  /  ___   /
 /  /  /  /
/__/  /__/
`,
  R: String.raw`
    ______
   / __  /
  / /_/ /
 / ____ \
/_/    \_\
`,
  K: String.raw`
    ___   ___
   /  /  /  /
  /  /__/  /
 /  /____  \
/__/     \__\
`,
  U: String.raw`
    ___  __
   /  / / /
  /  / / /
 /  /_/ /
/______/
`,
  L: String.raw`
    ___
   /  /
  /  /
 /  /____
/_______/
`,
  E: String.raw`
    _____
   /  __/
  /    /
 /  __/
/____/
`,
  M: String.raw`
    __________
   / __  __  /
  / / / / / /
 / / / / / /
/_/ /_/ /_/
`,
};
const glyphRows = (s) => s.replace(/^\n/, '').replace(/\n$/, '').split('\n');

// Overlay a word: [[letter, offset], ...] -> 5 rows of text. Where two letters put different marks
// in one cell, a slash or backslash beats an underscore (the underscore's join rule restores the
// floor), otherwise the first one wins.
function compose(plan) {
  const g = Array.from({ length: 5 }, () => []);
  for (const [k, o] of plan) {
    glyphRows(LETTER[k]).forEach((line, r) => {
      [...line].forEach((ch, i) => {
        if (ch === ' ') return;
        const cur = g[r][o + i];
        if (!cur || cur === ' ' || (cur === '_' && ch !== '_')) g[r][o + i] = ch;
      });
    });
  }
  return g.map((r) => Array.from(r, (c) => c || ' ').join('').replace(/\s+$/, ''));
}
const WORD = compose([['C', 0], ['A', 8], ['S', 15], ['T', 21], ['a', 29], ['W', 35], ['A', 45], ['Y', 54]]);

// The palm on the roof: two coconuts as the colon that pokes above the roof line.
const PALM = String.raw`
   __ _ __
 _/  \:/  \_
/    /|\    \
      |
`;

// ---------------------------------------------------------------------------------------------
// Banner layout (rows of the 80 x 17 grid)
// ---------------------------------------------------------------------------------------------
const ROW_TOP = 0;          // file line
const ROW_PALM = 1;         // palm crown (the twin's ASCII palm: 4 rows, down to the roof)
const ROW_ROOF = 5;         // roof and peaks
const ROW_RULE = 9;         // last body row = base rule
const ROW_CAPTION = 11;
const ROW_DESC = 13;
const ROW_CMD = 16;
const LOGO_COL = 7;
const PALM_COL = 36;        // palm crown's first column; the trunk lands on the flat-roofed A
const TAG = 'shh.';

// cell[r][c] = { ch, layer }  layer: 'logo' (typed, taken by the tide), 'rule' (shoots out),
// 'tag' (bitmap text in the rule). The palm is not in the grid: the SVG draws it as an outline
// figure of its own (the cell's steep diagonals turn any palm into a pagoda), and the text twin
// gets the ASCII PALM above.
const cell = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => null));
const put = (r, c, ch, layer) => { if (ch !== ' ') cell[r][c] = { ch, layer }; };
WORD.forEach((line, i) => [...line].forEach((ch, j) => put(ROW_ROOF + i, LOGO_COL + j, ch, 'logo')));
const TRUNK_COL = PALM_COL + glyphRows(PALM).at(-1).indexOf('|');
// corner marks: a middle dot at the roof's left end, a not sign at its right
put(ROW_ROOF, LOGO_COL + 1, '·', 'logo');
// base rule: dashes through every gap in the feet row, out to both margins
const ruleRow = cell[ROW_RULE];
const logoCols = ruleRow.map((x, c) => (x ? c : -1)).filter((c) => c >= 0);
const LOGO_L = Math.min(...logoCols), LOGO_R = Math.max(...logoCols);
const TAG_COL = LOGO_R + 3;
for (let c = 1; c < COLS - 1; c++) {
  if (ruleRow[c]) continue;
  const inside = c > LOGO_L && c < LOGO_R;
  ruleRow[c] = { ch: '-', layer: inside ? 'logo' : 'rule' };
}
ruleRow[0] = { ch: '<', layer: 'rule' };
ruleRow[COLS - 1] = { ch: '>', layer: 'rule' };
for (let i = -1; i <= TAG.length; i++) ruleRow[TAG_COL + i] = null;
[...TAG].forEach((ch, i) => (ruleRow[TAG_COL + i] = { ch, layer: 'tag' }));
{
  const roofEnd = Math.max(...cell[ROW_ROOF].map((x, c) => (x ? c : -1)));
  put(ROW_ROOF, roofEnd + 2, '¬', 'logo');
}

const at = (r, c) => (cell[r] && cell[r][c] ? cell[r][c].ch : ' ');

// ---------------------------------------------------------------------------------------------
// Stroke geometry of one character cell, in cell units (x across, y down). Returns a list of
// polylines; a polyline of one point is a dot.
// ---------------------------------------------------------------------------------------------
const SLANTS = '/\\|';
function strokes(r, c, get = at) {
  const ch = get(r, c), L = get(r, c - 1), R = get(r, c + 1);
  switch (ch) {
    case '_': {
      let a = c, b = c + 1;
      if (L === '/') a = c - 1; else if (L === '|') a = c - 0.5;
      if (R === '\\') b = c + 2; else if (R === '|') b = c + 1.5;
      return [[[a, r + 1], [b, r + 1]]];
    }
    case '/': return [[[c, r + 1], [c + 1, r]]];
    case '\\': return [[[c, r], [c + 1, r + 1]]];
    case '|': return [[[c + 0.5, r], [c + 0.5, r + 1]]];
    case '-': {
      let a = c, b = c + 1;
      if (SLANTS.includes(L)) a = c - 0.5; else if (L === '<') a = c - 0.85;
      if (SLANTS.includes(R)) b = c + 1.5; else if (R === '>') b = c + 1.85;
      return [[[a, r + 0.5], [b, r + 0.5]]];
    }
    case '<': return [[[c + 0.8, r + 0.22], [c + 0.15, r + 0.5], [c + 0.8, r + 0.78]]];
    case '>': return [[[c + 0.2, r + 0.22], [c + 0.85, r + 0.5], [c + 0.2, r + 0.78]]];
    case ':': return [[[c + 0.5, r + 0.34]], [[c + 0.5, r + 0.8]]];
    case '.': return [[[c + 0.5, r + 0.84]]];
    case '·': return [[[c + 0.5, r + 0.5]]];
    case '¬': return [[[c + 0.1, r + 0.42], [c + 0.85, r + 0.42], [c + 0.85, r + 0.7]]];
    default: throw new Error(`no stroke for ${JSON.stringify(ch)} at ${r},${c}`);
  }
}
const ptsD = (lines) => lines.map((pl) => {
  const [p0, ...rest] = pl.map(([x, y]) => [n(PADX + x * CW), n(PADY + y * CH)]);
  if (!rest.length) return `M${p0[0]} ${p0[1]}h0.01`;
  return `M${p0[0]} ${p0[1]}` + rest.map(([x, y]) => `L${x} ${y}`).join('');
}).join('');
const isDot = (ch) => ':.·'.includes(ch);

// ---------------------------------------------------------------------------------------------
// Timeline (seconds). One loop is ten bars of the theme: 30 s.
// ---------------------------------------------------------------------------------------------
const LOOP = 30;
const BEAT = 0.75;                       // 80 BPM
const TIDE_IN = 12.0, STEP = 0.3;        // the tide comes in one row per step
const TIDE_TOP = ROW_ROOF - 1;           // high water: up to the trunk, the crown stays dry
const TIDE_LOW = ROW_RULE + 1;           // the water's surface starts below the rule
const UP_STEPS = TIDE_LOW - TIDE_TOP;    // rows climbed
const T_HIGH = TIDE_IN + UP_STEPS * STEP;
const T_EBB = T_HIGH + 0.75;
const T_DRY = T_EBB + UP_STEPS * STEP;
const T_TYPE = T_DRY + 0.75;             // cursor starts typing
const DT = 0.027;                        // per cell
const RET = 0.12;                        // carriage return
const DRAW = 0.2;                        // one character drawing itself on
const SHOOT = 0.018;                     // base rule, per cell, outward

// typing order: rows top to bottom, each from its first to its last typed cell
const typed = [];        // { r, c, t } for every logo cell (spaces included, for the cursor)
let t = T_TYPE;
for (let r = ROW_ROOF; r <= ROW_RULE + 0; r++) {
  const cs = [];
  for (let c = 0; c < COLS; c++) if (cell[r][c] && cell[r][c].layer === 'logo') cs.push(c);
  if (!cs.length) continue;
  for (let c = cs[0]; c <= cs.at(-1); c++) {
    typed.push({ r, c, t, ink: !!(cell[r][c] && cell[r][c].layer === 'logo') });
    t += DT;
  }
  t += RET;
}
const T_TYPED = t;
const T_SHOOT = T_TYPED + 0.15;
const T_SHOT = T_SHOOT + Math.max(LOGO_L, COLS - 1 - LOGO_R) * SHOOT + DRAW;
const T_TAG = T_SHOT + 0.1;
if (T_TAG + 1 > LOOP) throw new Error(`timeline overruns the loop: ${T_TAG}`);
if (argv.includes("--times")) console.log({ T_HIGH, T_EBB, T_DRY, T_TYPE, T_TYPED, T_SHOOT, T_SHOT, T_TAG, cells: typed.length });

const pc = (s) => `${n((s / LOOP) * 100, 3)}%`;
const css = [];
const kf = [];
let kid = 0;
// a cell that is drawn at time zero, taken by the tide at high water, and drawn on again at t0
function drawKeyframes(t0, dur, prop = 'dash') {
  const name = `k${(kid++).toString(36)}`;
  const H = prop === 'dash' ? 'stroke-dashoffset:1.05' : 'opacity:0';
  const S = prop === 'dash' ? 'stroke-dashoffset:0' : 'opacity:1';
  kf.push(`@keyframes ${name}{0%,${pc(T_HIGH)}{${S}}${pc(T_HIGH + 0.01)},${pc(t0)}{${H}}${pc(t0 + dur)},100%{${S}}}`);
  return name;
}

// ---------------------------------------------------------------------------------------------
// Build the layers
// ---------------------------------------------------------------------------------------------
const imprint = [];      // the wet imprint: every logo and rule stroke, wide and faint, static
const ink = [];          // animated strokes
const typedAt = new Map(typed.map((e) => [`${e.r},${e.c}`, e.t]));
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const x = cell[r][c];
    if (!x || x.layer === 'tag') continue;
    const d = ptsD(strokes(r, c));
    imprint.push(d);
    let t0;
    if (x.layer === 'logo') t0 = typedAt.get(`${r},${c}`);
    else {
      // the rule shoots out from the logo's ends; the arrowheads land last
      const dist = c < LOGO_L ? LOGO_L - c : c - LOGO_R;
      t0 = T_SHOOT + dist * SHOOT;
      if (x.ch === '<' || x.ch === '>') t0 = T_SHOT;
    }
    const dot = isDot(x.ch);
    const name = drawKeyframes(t0, dot ? 0.01 : DRAW, dot ? 'op' : 'dash');
    css.push(`.${name}{animation-name:${name}}`);
    ink.push(dot ? `<path class="d ${name}" d="${d}"/>` : `<path class="s ${name}" pathLength="1" d="${d}"/>`);
  }
}
// the tag: bitmap letters, dropped in after the arrowheads
const tagName = drawKeyframes(T_TAG, 0.01, 'op');
const tagD = textD(TAG, TAG_COL, ROW_RULE);

// ---------------------------------------------------------------------------------------------
// The palm, drawn as an outline figure in the same ink and line: a tapering two-line trunk with
// bark ticks, six slim outlined fronds, and two coconuts, which are the colon that pokes above
// the roof. Curves are sampled into a few straight facets, so it keeps the logo's hard edges.
// It stands on the flat roof of the second A; the tide never takes it.
// ---------------------------------------------------------------------------------------------
const qp = (a, b, c, t) => [0, 1].map((k) => (1 - t) ** 2 * a[k] + 2 * (1 - t) * t * b[k] + t * t * c[k]);
const qt = (a, b, c, t) => [0, 1].map((k) => 2 * (1 - t) * (b[k] - a[k]) + 2 * t * (c[k] - b[k]));
const side = (a, b, c, steps, width, s) => Array.from({ length: steps + 1 }, (_, i) => {
  const t = i / steps, p = qp(a, b, c, t), d = qt(a, b, c, t), L = Math.hypot(d[0], d[1]) || 1;
  const w = width(t);
  return [p[0] - (d[1] / L) * w * s, p[1] + (d[0] / L) * w * s];
});
const poly = (pts) => 'M' + pts.map(([x, y]) => `${n(x)} ${n(y)}`).join('L');
const PALM_BASE = [X(TRUNK_COL + 0.5), Y(ROW_ROOF + 1)];
const CROWN = [PALM_BASE[0] + 9, PALM_BASE[1] - 61];
function palmD() {
  const [bx, by] = PALM_BASE;
  const a = [bx, by], b = [bx - 5, by - 32], c = [CROWN[0], CROWN[1] + 4];
  const tw = (t) => 3.6 - 1.6 * t;
  let trunk = poly(side(a, b, c, 5, tw, 1)) + poly(side(a, b, c, 5, tw, -1));
  for (const t of [0.13, 0.29, 0.45, 0.61, 0.77]) {
    const p = qp(a, b, c, t), w = tw(t);
    trunk += `M${n(p[0] - w)} ${n(p[1] + 1)}L${n(p[0] + w)} ${n(p[1] - 1)}`;
  }
  const FRONDS = [
    [[-20, -13], [-47, 8]], [[-12, 0], [-30, 22]], [[-10, -17], [-29, -12]],
    [[10, -18], [29, -11]], [[22, -12], [49, 7]], [[13, 1], [31, 22]],
  ];
  let crown = '';
  for (const [k, tip] of FRONDS) {
    const p0 = CROWN, p1 = [CROWN[0] + k[0], CROWN[1] + k[1]], p2 = [CROWN[0] + tip[0], CROWN[1] + tip[1]];
    const w = (t) => 3.8 * Math.sin(Math.PI * Math.min(1, t * 1.12)) * Math.min(1, t / 0.1);
    crown += poly([...side(p0, p1, p2, 6, w, 1), ...side(p0, p1, p2, 6, w, -1).reverse()]) + 'Z';
  }
  const nuts = `M${n(CROWN[0] - 3)} ${n(CROWN[1] + 6)}h0.01M${n(CROWN[0] + 3)} ${n(CROWN[1] + 7)}h0.01`;
  return { trunk, crown, nuts };
}
const PALM_SVG = palmD();

// ---------------------------------------------------------------------------------------------
// The cursor. Idle: a block after the run command, blinking on the beat. Typing: it walks the
// logo one cell at a time (hard steps), then goes home.
// ---------------------------------------------------------------------------------------------
const CMD = 'python tools/serve.py  then open 127.0.0.1:8765';
const homeX = X(2 + CMD.length + 1), homeY = Y(ROW_CMD);
const curStops = [];
curStops.push(`0%{transform:translate(${homeX}px,${homeY}px)}`);
curStops.push(`${pc(T_TYPE - 0.01)}{transform:translate(${homeX}px,${homeY}px)}`);
for (const e of typed) curStops.push(`${pc(e.t)}{transform:translate(${X(e.c)}px,${Y(e.r)}px)}`);
curStops.push(`${pc(T_TYPED)}{transform:translate(${homeX}px,${homeY}px)}`);
curStops.push(`100%{transform:translate(${homeX}px,${homeY}px)}`);
kf.push(`@keyframes cur{${curStops.join('')}}`);
// blink: on for half a beat, off for half a beat, but solid while typing
const blink = [];
for (let b = 0; b < LOOP / BEAT; b++) {
  const s = b * BEAT;
  if (s + BEAT <= T_TYPE - 0.0001 || s >= T_TYPED) {
    blink.push(`${pc(s)}{opacity:.85}${pc(s + BEAT / 2)}{opacity:0}`);
  } else {
    blink.push(`${pc(s)}{opacity:.85}`);
  }
}
kf.push(`@keyframes blink{${blink.join('')}100%{opacity:.85}}`);

// ---------------------------------------------------------------------------------------------
// The tide: a band of water the colour of the ground, a little lighter, with a wave line on top
// and a few specks of foam. It climbs from under the rule to the trunk in hard steps, stays a
// moment, and goes out the same way. A clip keeps it inside the logo's rows.
// ---------------------------------------------------------------------------------------------
const tideStops = [];
const tideY = (row) => `transform:translateY(${Y(row) - 2}px)`;
const offY = `transform:translateY(${Y(TIDE_LOW + 1)}px)`;
tideStops.push(`0%,${pc(TIDE_IN - 0.01)}{${offY}}`);
for (let i = 0; i <= UP_STEPS; i++) tideStops.push(`${pc(TIDE_IN + i * STEP)}{${tideY(TIDE_LOW - i)}}`);
for (let i = 0; i <= UP_STEPS; i++) tideStops.push(`${pc(T_EBB + i * STEP)}{${tideY(TIDE_TOP + i)}}`);
tideStops.push(`${pc(T_DRY + 0.01)},100%{${offY}}`);
kf.push(`@keyframes tide{${tideStops.join('')}}`);
// the wave line: one ~ per cell, a smooth sine, two phases swapped every half beat
const waveD = (phase) => {
  let d = `M${X(0)} 0`;
  for (let c = 0; c < COLS; c++) {
    const x0 = X(c), up = (c + phase) % 2 === 0 ? -3 : 3;
    d += `Q${x0 + 4} ${up} ${x0 + 8} 0`;
  }
  return d;
};
kf.push(`@keyframes sway{0%{transform:rotate(-1.5deg)}50%{transform:rotate(1.5deg)}100%{transform:rotate(-1.5deg)}}`);
kf.push(`@keyframes swell{0%{opacity:1}50%{opacity:0}100%{opacity:1}}`);
kf.push(`@keyframes swell2{0%{opacity:0}50%{opacity:1}100%{opacity:0}}`);

// beat lamps (top right): four squares, the lit one steps along with the beat
const LAMP_COL = COLS - 5;
kf.push(`@keyframes beat{0%{transform:translateX(0)}25%{transform:translateX(${CW}px)}50%{transform:translateX(${CW * 2}px)}75%{transform:translateX(${CW * 3}px)}100%{transform:translateX(0)}}`);

// ---------------------------------------------------------------------------------------------
// Text
// ---------------------------------------------------------------------------------------------
const TOP_LEFT = 'castaway  10:00:00  1080p30  seed 1992';
const TOP_RIGHT = 'gags land on the bar';
const CAPTION_L = `[-${TAG}-]`;
const CAPTION_R = '> CASTAWAY (working title)';
const DESC = [
  'ten hours, one island, one palm. she nods to the music. every few',
  'minutes something happens, on the bar. all sound synthesized from code.',
];

// ---------------------------------------------------------------------------------------------
// Assemble the SVG
// ---------------------------------------------------------------------------------------------
const delay = () => `${n(-AT, 3)}s`;
const svg = [];
svg.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VW} ${VH}" width="${VW * 2}" height="${VH * 2}" role="img" aria-labelledby="t d">`);
svg.push(`<title id="t">CASTAWAY: an Amiga description logo</title>`);
svg.push(`<desc id="d">CASTAWAY drawn as a compact outline logo of slashes, underscores and pipes, with a palm on its roof and a base rule signed shh. The tide comes in, takes the ink, and a cursor draws it again.</desc>`);
svg.push(`<style>
.s{fill:none;stroke:${INK};stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1 2;stroke-dashoffset:0}
.d{fill:none;stroke:${INK};stroke-width:2.6;stroke-linecap:round}
.s,.d,.tg{animation-duration:${LOOP}s;animation-timing-function:linear;animation-iteration-count:infinite;animation-delay:${delay()}}
.cur{animation:cur ${LOOP}s step-end infinite ${delay()}}
.cur rect{animation:blink ${LOOP}s step-end infinite ${delay()}}
.tide{animation:tide ${LOOP}s step-end infinite ${delay()}}
.sw{animation:swell ${BEAT}s step-end infinite ${delay()}}
.sw2{animation-name:swell2}
.lamp{animation:beat ${BEAT * 4}s step-end infinite ${delay()}}
.sway{animation:sway ${BEAT * 4}s step-end infinite ${delay()}}
.tg{animation-name:${tagName};animation-timing-function:step-end}
${css.join('\n')}
${kf.join('\n')}
@media (prefers-reduced-motion:reduce){*{animation:none!important}.tide{transform:translateY(${Y(TIDE_LOW + 1)}px)}}
</style>`);
svg.push(`<defs>
<clipPath id="sea"><rect x="${PADX - 4}" y="${Y(ROW_PALM)}" width="${COLS * CW + 8}" height="${Y(TIDE_LOW) - Y(ROW_PALM) + 3}"/></clipPath>
<pattern id="foam" width="48" height="32" patternUnits="userSpaceOnUse"><g fill="${INK}"><rect x="6" y="9" width="2" height="2"/><rect x="29" y="5" width="2" height="2"/><rect x="38" y="22" width="2" height="2"/><rect x="17" y="27" width="2" height="2"/><rect x="45" y="13" width="2" height="2"/></g></pattern>
</defs>`);
svg.push(`<rect x="1" y="1" width="${VW - 2}" height="${VH - 2}" rx="10" fill="${GROUND}" stroke="${RIM}" stroke-width="2"/>`);
// file line
svg.push(`<path fill="${INK}" fill-opacity=".55" d="${textD(TOP_LEFT, 2, ROW_TOP)}${textD(TOP_RIGHT, LAMP_COL - TOP_RIGHT.length - 2, ROW_TOP)}"/>`);
svg.push(`<g fill="${INK}"><g fill-opacity=".22">${[0, 1, 2, 3].map((i) => `<rect x="${X(LAMP_COL + i) + 1}" y="${Y(ROW_TOP) + 4}" width="6" height="8"/>`).join('')}</g><rect class="lamp" x="${X(LAMP_COL) + 1}" y="${Y(ROW_TOP) + 4}" width="6" height="8" fill-opacity=".9"/></g>`);
// imprint, ink, palm
svg.push(`<path d="${imprint.join('')}" fill="none" stroke="${INK}" stroke-opacity=".1" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`);
svg.push(`<g>${ink.join('')}</g>`);
svg.push(`<path class="tg" fill="${INK}" d="${tagD}"/>`);
svg.push(`<g fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${PALM_SVG.trunk}"/><g class="sway" style="transform-origin:${n(CROWN[0])}px ${n(CROWN[1] + 4)}px"><path d="${PALM_SVG.crown}" fill="${GROUND}"/><path d="${PALM_SVG.nuts}" stroke-width="5"/></g></g>`);
// the tide
svg.push(`<g clip-path="url(#sea)"><g class="tide" style="transform:translateY(${Y(TIDE_LOW + 1)}px)">
<rect x="0" y="0" width="${VW}" height="${(TIDE_LOW - TIDE_TOP + 2) * CH}" fill="${WATER}"/>
<rect x="0" y="6" width="${VW}" height="${(TIDE_LOW - TIDE_TOP + 2) * CH}" fill="url(#foam)" fill-opacity=".35"/>
<path class="sw" d="${waveD(0)}" fill="none" stroke="${INK}" stroke-width="2" stroke-opacity=".8"/>
<path class="sw sw2" d="${waveD(1)}" fill="none" stroke="${INK}" stroke-width="2" stroke-opacity=".8"/>
</g></g>`);
// caption, description, command
svg.push(`<path fill="${INK}" d="${textD(CAPTION_L, 2, ROW_CAPTION)}${textD(CAPTION_R, COLS - 2 - CAPTION_R.length, ROW_CAPTION)}"/>`);
const dashFrom = 2 + CAPTION_L.length, dashTo = COLS - 2 - CAPTION_R.length;
svg.push(`<path fill="${INK}" d="${textD('-'.repeat(dashTo - dashFrom), dashFrom, ROW_CAPTION)}"/>`);
svg.push(`<path fill="${INK}" fill-opacity=".62" d="${DESC.map((s, i) => textD(s, 4, ROW_DESC + i)).join('')}"/>`);
svg.push(`<path fill="${INK}" fill-opacity=".8" d="${textD(CMD, 2, ROW_CMD)}"/>`);
svg.push(`<g class="cur" style="transform:translate(${homeX}px,${homeY}px)"><rect width="8" height="14" y="1" fill="${INK}" opacity=".85"/></g>`);
svg.push('</svg>');
const SVG = svg.join('\n') + '\n';
fs.mkdirSync(OUTDIR, { recursive: true });
fs.writeFileSync(OUT_SVG, SVG);
console.log(`wrote ${path.relative(process.cwd(), OUT_SVG)} (${(SVG.length / 1024).toFixed(1)} KB)`);

// ---------------------------------------------------------------------------------------------
// The text twin
// ---------------------------------------------------------------------------------------------
const twin = [];
const palmRows = glyphRows(PALM);
for (let r = ROW_PALM; r <= ROW_RULE; r++) {
  const line = Array.from({ length: COLS }, (_, c) => at(r, c));
  const pr = palmRows[r - ROW_PALM];
  if (pr) [...pr].forEach((ch, j) => { if (ch !== ' ') line[PALM_COL + j] = ch; });
  if (r === ROW_ROOF) line[TRUNK_COL] = '|';
  twin.push(line.join('').replace(/\s+$/, ''));
}
if (argv.includes('--dump')) console.log(twin.join('\n'));

// ---------------------------------------------------------------------------------------------
// The README header (.md). Text art goes in <pre> blocks (backslashes and underscores survive
// there, and GitHub's sanitizer keeps <pre>, <a> and <b>). {{href|text}} marks a link, added
// after escaping.
// ---------------------------------------------------------------------------------------------
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const LINK = /\{\{([^|}]+)\|([^}]+)\}\}/g;
const links = (s) => s.replace(LINK, (_, href, text) => `<a href="${href}">${text}</a>`);
const pre = (lines) => {
  for (const l of lines) {
    const plain = l.replace(LINK, '$2');
    if ([...plain].length > 80) throw new Error(`text line over 80 columns: ${plain}`);
    if (/\s$/.test(plain)) throw new Error(`trailing space: ${JSON.stringify(plain)}`);
  }
  return `<pre>\n${lines.map((l) => links(esc(l))).join('\n')}\n</pre>`;
};
const caption = (width, client) => {
  const head = `[-${TAG}-]`, tail = `> ${client}`;
  return head + '-'.repeat(Math.max(4, width - head.length - tail.length)) + tail;
};

// The residents: four more description logos, drawn into a second SVG the same way as the
// banner (strokes in Topaz cells, small text in the bitmap font). Static: they are a page of a
// collection, not an intro. A browser's code font squeezes these past reading, so unlike the
// banner's logo they are not repeated as text.
const RESIDENT_DEFS = [
  { plan: [['S', 0], ['H', 10], ['A', 21], ['R', 29], ['K', 40]], client: 'THE SHARK, IN HEADPHONES', lines: [
    'a fin circles the island. the shark surfaces in headphones and',
    'nods along to the same beat she does. then it goes back under.',
  ] },
  { plan: [['C', 0], ['A', 8], ['T', 14]], client: 'THE GREY TABBY', lines: [
    'white chest. arrives on a crate, climbs the palm, naps. one day it',
    'hops back on the crate and floats off. another day it comes back.',
  ] },
  { plan: [['T', 0], ['U', 10], ['R', 18], ['T', 27], ['L', 36], ['E', 44]], client: 'THE SEA TURTLE', lines: [
    'swims in, crawls up beside her, and they both doze off.',
    'nobody is in a hurry about any of it.',
  ] },
  { plan: [['K', 0], ['U', 14], ['M', 22], ['A', 34], ['R', 42], ['A', 53]], client: 'THE KUMARA', lines: [
    'she plants it. hours later it is leafy. later still it flowers.',
    'nobody remarks on it. it does not seem to mind.',
  ] },
];
function residentsSVG() {
  const PER = 11, TOP = 2;
  const rows = TOP + RESIDENT_DEFS.length * PER - 2;
  const g = Array.from({ length: rows }, () => Array(COLS).fill(' '));
  const get = (r, c) => (g[r] && g[r][c]) || ' ';
  const text = [], dim = [];
  text.push(textD('pending ink', 2, 0));
  const right = 'the residents. paid in coconuts';
  dim.push(textD('description pack #1', 15, 0), textD(right, COLS - 2 - right.length, 0));
  RESIDENT_DEFS.forEach(({ plan, client, lines }, i) => {
    const top = TOP + i * PER;
    const word = compose(plan);
    const wide = Math.max(...word.map((l) => l.length));
    const off = Math.round((COLS - wide) / 2);
    word.forEach((l, r) => [...l].forEach((ch, j) => { if (ch !== ' ') g[top + r][off + j] = ch; }));
    const rule = g[top + 4];
    const feet = rule.map((ch, c) => (ch !== ' ' ? c : -1)).filter((c) => c >= 0);
    const tagAt = Math.max(...feet) + 3;
    for (let c = 1; c < COLS - 1; c++) if (rule[c] === ' ') rule[c] = '-';
    rule[0] = '<'; rule[COLS - 1] = '>';
    for (let c = tagAt - 1; c <= tagAt + TAG.length; c++) rule[c] = ' ';
    text.push(textD(TAG, tagAt, top + 4));
    const head = `[-${TAG}-]`, tail = `> ${client}`;
    text.push(textD(head + '-'.repeat(COLS - 4 - head.length - tail.length) + tail, 2, top + 6));
    lines.forEach((l, k) => dim.push(textD(l, 5, top + 7 + k)));
  });
  let ink = '';
  const dots = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < COLS; c++) {
    if (g[r][c] === ' ') continue;
    const d = ptsD(strokes(r, c, get));
    if (isDot(g[r][c])) dots.push(d); else ink += d;
  }
  const W = VW, H = rows * CH + PADY * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 2}" height="${H * 2}" role="img" aria-labelledby="t d">
<title id="t">The residents: four Amiga description logos for Castaway</title>
<desc id="d">SHARK, CAT, TURTLE and KUMARA as leaning outline logos of slashes and underscores, each with a base rule signed shh., a caption and a two-line description.</desc>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="10" fill="${GROUND}" stroke="${RIM}" stroke-width="2"/>
<path d="${ink}" fill="none" stroke="${INK}" stroke-opacity=".1" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="${ink}" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="${dots.join('')}" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
<path fill="${INK}" d="${text.join('')}"/>
<path fill="${INK}" fill-opacity=".6" d="${dim.join('')}"/>
</svg>
`;
}
const OUT_RES = path.join(OUTDIR, `${SLUG}-residents.svg`);
{
  const res = residentsSVG();
  fs.writeFileSync(OUT_RES, res);
  console.log(`wrote ${path.relative(process.cwd(), OUT_RES)} (${(res.length / 1024).toFixed(1)} KB)`);
}
const RESIDENTS_ALT = [
  'A second dark panel in the same cream line art, headed pending ink, description pack #1, the residents, paid in coconuts.',
  'Four more description logos, one under another, each in leaning outline capitals with a base rule through its feet signed shh., a caption arrow to its client and two lines of description.',
  'SHARK, for the shark in headphones: a fin circles the island, the shark surfaces in headphones and nods along to the same beat she does, then it goes back under.',
  'CAT, for the grey tabby: white chest, arrives on a crate, climbs the palm, naps; one day it hops back on the crate and floats off, another day it comes back.',
  'TURTLE, for the sea turtle: swims in, crawls up beside her, and they both doze off; nobody is in a hurry about any of it.',
  'KUMARA, for the kumara: she plants it, hours later it is leafy, later still it flowers; nobody remarks on it, it does not seem to mind.',
].join(' ');

const BANNER_ALT = [
  'CASTAWAY as an Amiga description logo: cream line art on a dark sea-green panel.',
  'Along the top, in small pixel letters: castaway, 10:00:00, 1080p30, seed 1992, and on the right, gags land on the bar, with four little beat lamps stepping along at 80 beats a minute.',
  'In the middle, the word CASTAWAY in leaning outline capitals built from slashes, underscores and pipes, the letters sharing walls so the word reads as one folded ribbon, with a peak breaking the roof line over the first and the last A.',
  'A palm with two coconuts stands on the roof. A base rule runs through the letters\' feet out to both margins, ends in angle brackets and is signed shh.',
  'Under it, the caption [-shh.-] and a long dashed arrow to CASTAWAY (working title), then two lines of description: ten hours, one island, one palm. she nods to the music. every few minutes something happens, on the bar. all sound synthesized from code.',
  'Last, the command python tools/serve.py then open 127.0.0.1:8765, with a cursor blinking on the beat.',
  'Every thirty seconds the tide comes in row by row, covers the logo up to the palm\'s crown and goes out again, taking the ink and leaving only a faint imprint. Then the cursor types the logo back one character at a time, each stroke drawing itself on, and the base rule shoots out to both margins.',
].join(' ');

const twinBlock = [
  ...twin,
  '',
  `${CAPTION_L}${'-'.repeat(COLS - 4 - CAPTION_L.length - CAPTION_R.length)}${CAPTION_R}`,
  ...DESC.map((l) => `   ${l}`),
];

const FENCE = '```';
const md = `<!-- Header ${SLUG} for Castaway. Generated by src/${SLUG}.mjs: edit that, not this. -->

<p align="center">
  <img src="assets/${SLUG}.svg" width="100%" alt="${esc(BANNER_ALT).replace(/"/g, '&quot;')}">
</p>

<h1 align="center">Castaway</h1>

<p align="center">
  <b>Ten hours on a very small island. She waits. Every few minutes, on the bar, something happens.</b><br>
  <sub>working title · in development · an unofficial homage to the 1992 screensaver <i>Johnny Castaway</i></sub>
</p>

**Castaway** is a stationary-frame lo-fi video for YouTube, in the spirit of the ten-hour lofi streams: one young woman, one tiny island, one tall palm, one raft and a great deal of time. She mostly idles, nodding to the music in her headphones, and every few minutes something happens, always on the next bar of the music. A message in a bottle washes straight back. A delivery drone brings a parcel, and the parcel is more headphones. A coconut lands on a hermit crab, who walks off wearing it. Then she goes back to waiting, which is most of the video, on purpose. It is sunny, hand-painted and always daytime, it renders at 1080p and 30 fps, and every sound in it is synthesized from code.

${FENCE}sh
python tools/serve.py      # then open http://127.0.0.1:8765/
python tools/schedule.py   # check the schedule, simulate a 10-hour run
${FENCE}

Amiga description logos were often drawn while an upload ran, in whatever time that took. This one was drawn while waiting for something to happen, which on this island takes two to five minutes. Every thirty seconds the tide takes it and the cursor draws it back. That is roughly the plot.

<details>
<summary><b>[-${TAG}-]</b> the description, as text</summary>

<br>

The banner's logo as the text file it is, ready to sit under a file name on a board. It was drawn for Topaz, the Amiga's screen font, where an underscore runs straight into the slash beside it and stacked slashes make one unbroken line. A browser's code font leaves gaps between the rows, which is why the banner is an SVG: there every character is one stroke in an 8 by 16 cell, so the joins close.

${pre(twinBlock)}

</details>

<details>
<summary><b>the residents</b>: four more description logos, commissioned by their subjects</summary>

<br>

Once the island had a logo, everyone on it wanted one.

<p align="center">
  <img src="assets/${SLUG}-residents.svg" width="100%" alt="${esc(RESIDENTS_ALT).replace(/"/g, '&quot;')}">
</p>

</details>

<details>
<summary><b>the schedule</b>: more than 90 activities, four timers, every start on the bar</summary>

${pre([
  '{{activities.toml|activities.toml}} lists more than 90 activities (94 on 2026-10-01),',
  'each with its beats, how long it lasts and how often it comes round.',
  '',
  'timer          comes round every       in a typical 10-hour run',
  'regular ...... 2 to 5 minutes ........ about 155',
  'occasional ... 12 to 25 minutes ...... about 30',
  'rare ......... 30 to 60 minutes ...... about 13',
  'super rare ... 3 to 6 hours .......... about 2, and never more than 3',
  'chained ...... when another says so .. about 20 follow-ups',
  '',
  'typical: the median of 200 simulated runs, as the file\'s own header says.',
  '',
  'every start snaps to the next bar of the music, and a bar is 3 seconds,',
  'so the coconut lands on the beat. the crab under it is, at least, in time.',
  'she is busy about a third of the time. the rest is idling, on purpose.',
  'lanes let things overlap: a ship can cross the horizon while she is busy',
  'with a coconut. it even waits until she is.',
  '',
  'default run ...... 10:00:00, seed 1992',
  'python {{tools/schedule.py|tools/schedule.py}} ... validates the file, simulates a run',
])}

</details>

<details>
<summary><b>the sound</b>: more than 150 files, all of them code</summary>

${pre([
  'every sound in castaway is synthesized by {{tools/make_audio.py|tools/make_audio.py}}:',
  'no samples, no borrowed loops, no recordings, so no third-party licence',
  'applies. more than 150 sound files so far.',
  '',
  'theme ......... a seamless 60-second loop, 80 BPM, F major',
  'chords ........ ii-V-I-vi, 20 bars of exactly 3 seconds',
  'band .......... electric piano, kalimba lead, soft drums, vinyl crackle',
  'ocean ......... also a seamless 60-second loop',
  'loudness ...... -14 LUFS, true peak at or below -1 dBTP',
  'levels ........ adjustable in master and per routine',
  'heard by ...... nobody yet. reviews pending.',
])}

</details>

<details>
<summary><b>the tools</b>: one page renders it, one script checks it</summary>

${pre([
  'python {{tools/serve.py|tools/serve.py}}',
  '    the renderer: a web page with live preview and export to a',
  '    YouTube-ready MP4. open {{http://127.0.0.1:8765/|http://127.0.0.1:8765/}}',
  'python {{tools/schedule.py|tools/schedule.py}}',
  '    validates the schedule and simulates a 10-hour run',
  'python {{tools/render_demo.py|tools/render_demo.py}} --dev',
  '    a dev reel of every activity with a heads-up display',
  '    (the older Python reference renderer)',
  '{{web/index.html|web/index.html}} ...... the page itself',
  '{{MUSING.md|MUSING.md}} ........... the working notes',
  '',
  'plain ES modules, no build step, no npm packages. the browser encodes',
  'frame-exact H.264 with WebCodecs, 68 to 78 frames a second at 1080p30 in',
  'Chrome, and the server mixes the sound and joins the two into an MP4.',
  'hard cuts and stepped movement are the motion defaults.',
])}

</details>

<details>
<summary><b>greetz &amp; respect</b></summary>

${pre([
  'greetz .... the hermit crab, who wears a coconut well. the grey tabby,',
  '            who arrives by crate and leaves the same way. the shark, who',
  '            keeps time. the turtle, who naps on cue. the drone, for the',
  '            spare headphones. the bro on the hydrofoil: shaka received.',
  '            and the tide, for all the extra work.',
  '',
  'respect ... to a certain 1992 desert-island screensaver, for showing that',
  '            a very small island and a lot of waiting can be enough. this',
  '            is an unofficial homage with its own character, art and music,',
  '            and no affiliation with it or its owners.',
  '            to the amiga description-logo artists of 1992 to 1994, who',
  '            drew whole words from ten different characters while the',
  '            modem ran. the style is theirs. every letter here is new.',
  '',
  `credits ... logo, letters and palm by shorehand (${TAG}) of pending ink.`,
  '            the artist, the tag and the crew exist only in this file.',
])}

</details>
`;
if (WRITE_MD) {
  fs.writeFileSync(OUT_MD, md);
  console.log(`wrote ${path.relative(process.cwd(), OUT_MD)}`);
}
