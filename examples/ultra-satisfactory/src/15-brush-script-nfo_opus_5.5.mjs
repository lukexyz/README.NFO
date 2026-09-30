#!/usr/bin/env node
// ULTRA-SATISFACTORY as a brush-script .NFO: the PC release-scene look of 1992 onwards, where a
// flat, unshaded script logo with one oversized capital sits inside a die-cut contour above a
// single-line info box. (The style is best known from the logos JED of ACiD drew for Razor 1911
// and Fairlight. None of their letterforms, names or marks are used here: the lettering below is
// original, drawn by the little pen engine in this file.)
//
// Regenerate:  node examples/ultra-satisfactory/src/15-brush-script-nfo_opus_5.5.mjs
//   --text     also print the logo grid as plain text (handy when tuning the lettering)
//
// Plain Node, no dependencies, fully deterministic (no clock, no randomness). It writes two files:
// the SVG banner and the header markdown that embeds it, so the text copy of the logo inside the
// markdown can never drift from the picture.
//
// How the lettering is made: every letter is a list of pen strokes. A stroke is a run of nodes
// (x, y, width); an elliptical nib is stamped along it into a 1-bit canvas of 640 x 384 pixels.
// The canvas is then read back one 8 x 16 text cell at a time and each cell is snapped to the
// nearest of the six shapes a DOS artist had for this job: empty, full block, upper half, lower
// half, left half, right half. Slanted stems therefore come out as full blocks with a half block
// on the outer edge of every step, which is exactly how the hand-drawn originals were brushed.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '15-brush-script-nfo_opus_5.5';
const OUT_SVG = path.join(HERE, '..', 'assets', `${SLUG}.svg`);
const OUT_MD = path.join(HERE, '..', `${SLUG}.md`);

// ---------------------------------------------------------------------------------------------
// Screen geometry and palette
// ---------------------------------------------------------------------------------------------
const COLS = 80, CW = 8, CH = 16, PAD = 16;

// DOS greys plus the one accent the style allows: the app's own neon cyan.
const INK = '#AAAAAA';      // colour 7, the grey every .NFO was read in
const HI = '#FFFFFF';       // colour 15
const DIM = '#555555';      // colour 8
const ACC = '#00CFFF';      // the accent: "Ultra", the cursor, the live link
const ACC_DRY = '#0E566B';  // the accent before the brush has passed
const LOGO2 = '#E8E8E8';    // "Satisfactory": near white, as the app's own title has it
const LOGO2_DRY = '#5A5A5A';
const BG = '#000000';

// ---------------------------------------------------------------------------------------------
// The pen: a 1-bit canvas, an elliptical nib, strokes as splines or polylines
// ---------------------------------------------------------------------------------------------
const LROWS = 24;                       // rows of the screen the logo block owns
const BW = COLS * CW, BH = LROWS * CH;
const LY = 4 * CH;                      // the two tiers start four rows down; the capital climbs two rows above them
const canvas = [new Uint8Array(BW * BH), new Uint8Array(BW * BH)];   // [0] "Ultra", [1] "Satisfactory"

function stamp(bmp, cx, cy, a, b, ang) {
  const r = Math.max(a, b) + 1;
  const ca = Math.cos(ang), sa = Math.sin(ang);
  for (let y = Math.max(0, Math.floor(cy - r)); y <= Math.min(BH - 1, Math.ceil(cy + r)); y++) {
    for (let x = Math.max(0, Math.floor(cx - r)); x <= Math.min(BW - 1, Math.ceil(cx + r)); x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
      const u = dx * ca + dy * sa, v = -dx * sa + dy * ca;
      if ((u * u) / (a * a) + (v * v) / (b * b) <= 1) bmp[y * BW + x] = 1;
    }
  }
}
// nodes: [x, y, width] in canvas pixels. `nib` = { ang, flat, min }: the nib is an ellipse whose long
// axis is `width`, whose short axis is width * flat, turned by `ang`; nothing gets thinner than `min`.
// Splines (Catmull-Rom through the nodes) are for the script; `linear` polylines for the small tier.
function stroke(bmp, nodes, nib, linear = false) {
  const P = [nodes[0], ...nodes, nodes[nodes.length - 1]];
  for (let i = 1; i < P.length - 2; i++) {
    const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
    const n = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) * 1.5));
    for (let k = 0; k <= n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      const at = linear
        ? (j) => p1[j] + (p2[j] - p1[j]) * t
        : (j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3);
      const w = p1[2] + (p2[2] - p1[2]) * t;
      const a = Math.max(w / 2, nib.min / 2), b = Math.max(a * nib.flat, nib.min / 2);
      stamp(bmp, at(0), at(1), a, b, nib.ang);
    }
  }
}

// ---------------------------------------------------------------------------------------------
// The lettering (all original)
// ---------------------------------------------------------------------------------------------
// Tier 1, "ltra": a brush script. Coordinates are in x-heights (u to the right, v up from the
// baseline); the third number is the stroke width as a multiple of the stem.
const SCRIPT = {
  l: { adv: 0.58, s: [[[0.02, 1.42, .45], [0.12, 1.66, .8], [0.21, 1.75, 1], [0.22, 1.4, 1], [0.22, 0.38, 1], [0.27, 0.17, 1], [0.42, 0.10, .8], [0.62, 0.24, .62], [0.74, 0.5, .55]]] },
  t: { adv: 0.68, s: [[[0.22, 1.5, 1], [0.22, 0.38, 1], [0.27, 0.17, 1], [0.44, 0.10, .8], [0.64, 0.24, .62], [0.76, 0.5, .55]], [[-0.14, 1.0, .7], [0.74, 1.0, .7]]] },
  r: { adv: 0.80, s: [[[0.0, 0.72, .45], [0.12, 0.92, .7], [0.22, 1.0, 1], [0.22, 0.0, 1]], [[0.22, 0.70, .6], [0.36, 0.91, .9], [0.54, 0.96, 1.05], [0.66, 0.84, 1.1]]] },
  a: { adv: 1.0, s: [[[0.64, 0.84, .85], [0.44, 0.96, 1], [0.22, 0.82, 1], [0.15, 0.50, 1], [0.22, 0.18, 1], [0.38, 0.06, .9], [0.56, 0.18, .7], [0.68, 0.55, .6]], [[0.72, 1.0, 1], [0.72, 0.32, 1], [0.78, 0.15, 1], [0.92, 0.09, .75], [1.10, 0.22, .5]]] },
};
// Tier 2, "Satisfactory": a brush italic, hinted to the cell grid so twelve letters stay readable
// at five rows. u is in cells, v in rows above the baseline, optional third number is width in px.
const ITALIC = {
  S: { adv: 7, s: [[[5.2, 4.2], [4.4, 4.5], [2, 4.5], [1, 3.8], [1, 3.3], [1.8, 2.6], [4.2, 2.4], [5, 1.7], [5, 1.2], [4, 0.5], [1.6, 0.5], [0.8, 0.9]]] },
  a: { adv: 7, s: [[[5, 3.5], [2, 3.5], [1, 2.7], [1, 1.3], [2, 0.5], [4, 0.5], [5, 1.2]], [[5, 3.5], [5, 0.5], [6.2, 0.5, 10]]] },
  t: { adv: 4.5, s: [[[1, 4.5], [1, 1.0], [1.6, 0.5], [3.2, 0.5, 10]], [[-0.4, 3.75, 8], [3.2, 3.75, 8]]] },
  i: { adv: 3.5, s: [[[1, 3.5], [1, 1.0], [1.6, 0.5], [2.6, 0.5, 10]], [[0.6, 4.75, 8], [1.4, 4.75, 8]]] },
  s: { adv: 6, s: [[[4.2, 3.2], [3.6, 3.5], [1.8, 3.5], [1, 2.9], [1.4, 2.2], [3.6, 1.8], [4, 1.1], [3.4, 0.5], [1.4, 0.5], [0.8, 0.8]]] },
  f: { adv: 5, s: [[[3.6, 4.4], [2.8, 4.5], [1.7, 4.3], [1.2, 3.5], [1, 0.5], [1, -0.8]], [[-0.4, 2.75, 8], [3.4, 2.75, 8]]] },
  c: { adv: 5.5, s: [[[4.2, 3.1], [3.6, 3.5], [2, 3.5], [1, 2.7], [1, 1.3], [2, 0.5], [3.6, 0.5], [4.3, 0.9]]] },
  o: { adv: 7, s: [[[2, 3.5], [4, 3.5], [5, 2.7], [5, 1.3], [4, 0.5], [2, 0.5], [1, 1.3], [1, 2.7], [2, 3.5]]] },
  r: { adv: 5.4, s: [[[1, 3.5], [1, 0.5]], [[1, 2.6], [2, 3.4], [3.4, 3.5], [4, 3.1]]] },
  y: { adv: 7, s: [[[1, 3.5], [1, 1.3], [2, 0.5], [4, 0.5], [5, 1.2]], [[5, 3.5], [5, 0.0], [4.6, -0.8], [3.6, -1.0], [1.6, -1.0]]] },
};

const NIB = { ang: -0.35, flat: 0.6, min: 8 };      // a broad nib held about 20 degrees off level
const SLANT = 0.25;                                 // 4 px per 16 px row: half a cell a row

// The capital: twelve rows of U with an entry flick, standing two rows clear of the l beside it,
// and a tail that runs out under the rest of the word.
const BIG_U = { x: 24, base: LY + 160, strokes: [
  [[-18, 20, 12], [-2, -4, 20], [22, -19, 34], [42, 0, 44], [44, 84, 44], [54, 132, 44], [84, 150, 40], [112, 148, 36], [134, 124, 26], [142, 96, 16]],
  [[146, -19, 40], [146, 108, 44], [150, 140, 40], [168, 156, 30], [200, 163, 18], [240, 165, 13], [420, 165, 13], [572, 165, 13]],
] };
SCRIPT.A = { adv: 1.0, s: [SCRIPT.a.s[0], [[0.72, 1.0, 1], [0.72, 0.32, 1], [0.78, 0.15, 1], [0.88, 0.09, .8], [0.95, 0.12, .7]]] };   // the last a: no join to make
const TIER1 = { text: 'ltrA', x: 246, base: LY + 144, xh: 96, stem: 36, wx: 1.13, asc: 0.5, track: 8 };
const TIER2 = { text: 'Satisfactory', x: 26, base: LY + 256, w: 16, slant: 0.5, track: 0.3, nib: { ang: 0, flat: 1, min: 8 } };

for (const s of BIG_U.strokes) stroke(canvas[0], s.map(([x, y, w]) => [BIG_U.x + x + SLANT * (BIG_U.base - LY - y), LY + y, w]), NIB);
{
  const T = TIER1;
  let ox = T.x;
  for (const ch of T.text) {
    const g = SCRIPT[ch];
    for (const s of g.s) {
      stroke(canvas[0], s.map(([u, v, k]) => {
        const vv = v > 1 ? 1 + (v - 1) * T.asc : v;
        return [ox + u * T.xh * T.wx + SLANT * vv * T.xh, T.base - vv * T.xh, k * T.stem];
      }), NIB);
    }
    ox += g.adv * T.xh * T.wx + T.track;
  }
}
{
  const T = TIER2;
  let ox = T.x;
  for (const ch of T.text) {
    const g = ITALIC[ch];
    for (const s of g.s) stroke(canvas[1], s.map(([u, v, w]) => [ox + (u + T.slant * v) * CW, T.base - v * CH, w || T.w]), T.nib, true);
    ox += (g.adv + T.track) * CW;
  }
}

// Read the canvas back as text cells. Each cell's four quadrants are measured and the cell becomes
// whichever of the six shapes is closest.
const SHAPES = [[' ', [0, 0, 0, 0]], ['█', [1, 1, 1, 1]], ['▀', [1, 1, 0, 0]], ['▄', [0, 0, 1, 1]], ['▌', [1, 0, 1, 0]], ['▐', [0, 1, 0, 1]]];
const logo = Array.from({ length: LROWS }, () => new Array(COLS).fill(' '));
const tier = Array.from({ length: LROWS }, () => new Array(COLS).fill(0));
for (let r = 0; r < LROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const q = [0, 0, 0, 0];
    let n0 = 0, n1 = 0;
    for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) {
      const i = (r * CH + y) * BW + c * CW + x;
      if (canvas[0][i] || canvas[1][i]) q[(y >> 3) * 2 + (x >> 2)] += 1 / 32;
      n0 += canvas[0][i]; n1 += canvas[1][i];
    }
    let best = ' ', err = Infinity;
    for (const [ch, p] of SHAPES) {
      const e = p.reduce((s, pv, i) => s + Math.abs(pv - q[i]), 0);
      if (e < err - 1e-9) { err = e; best = ch; }
    }
    logo[r][c] = best;
    tier[r][c] = n1 > n0 ? 1 : 0;
  }
}

// ---------------------------------------------------------------------------------------------
// The contour: a one-cell die-cut line traced round the whole word, one cell out from the letters
// ---------------------------------------------------------------------------------------------
const inGrid = (r, c) => r >= 0 && r < LROWS && c >= 0 && c < COLS;
// Grow or shrink a mask by a box of (rx, ry) cells; whatever lies beyond the mask counts as empty.
function morph(src, rx, ry, grow) {
  const at = (r, c) => r >= 0 && r < src.length && c >= 0 && c < src[0].length && src[r][c];
  return src.map((row, r) => row.map((_, c) => {
    for (let dy = -ry; dy <= ry; dy++) for (let dx = -rx; dx <= rx; dx++) {
      if (grow && at(r + dy, c + dx)) return true;
      if (!grow && !at(r + dy, c + dx)) return false;
    }
    return !grow;
  }));
}
let body = logo.map((row) => row.map((ch) => ch !== ' '));
body = morph(body, 2, 1, true);                            // the sticker's margin: two cells sideways, one row up and down
{
  // Close the narrow inlets between letters. Done on a padded copy so the edges of the screen
  // do not distort the result.
  const M = 6;
  const wide = Array.from({ length: LROWS + M * 2 }, (_, r) => Array.from({ length: COLS + M * 2 }, (_, c) => inGrid(r - M, c - M) && body[r - M][c - M]));
  const closed = morph(morph(wide, 4, 3, true), 4, 3, false);
  body = body.map((row, r) => row.map((_, c) => closed[r + M][c + M]));
}
{
  // fill anything the outside cannot reach, so the line only ever runs round the outside
  const out = body.map((row) => row.map(() => false));
  const todo = [];
  for (let r = 0; r < LROWS; r++) for (let c = 0; c < COLS; c++) if ((r === 0 || c === 0 || r === LROWS - 1 || c === COLS - 1) && !body[r][c]) { out[r][c] = true; todo.push([r, c]); }
  while (todo.length) {
    const [r, c] = todo.pop();
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const rr = r + dr, cc = c + dc;
      if (inGrid(rr, cc) && !body[rr][cc] && !out[rr][cc]) { out[rr][cc] = true; todo.push([rr, cc]); }
    }
  }
  body = body.map((row, r) => row.map((v, c) => v || !out[r][c]));
}
for (let r = 0; r < LROWS; r++) for (let c = 0; c < COLS; c++) {
  if (body[r][c] && (r === 0 || c === 0 || r === LROWS - 1 || c === COLS - 1)) throw new Error(`the lettering is too close to the edge at ${r},${c}: no room for the contour`);
}
const B = (r, c) => inGrid(r, c) && body[r][c];
const ring = Array.from({ length: LROWS }, () => new Array(COLS).fill(' '));
for (let r = 0; r < LROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    if (body[r][c]) continue;
    const n = B(r - 1, c), s = B(r + 1, c), e = B(r, c + 1), w = B(r, c - 1);
    const count = n + s + e + w;
    if (count === 0) continue;
    if (count >= 2) ring[r][c] = '█';
    else if (s) ring[r][c] = '▄';
    else if (n) ring[r][c] = '▀';
    else ring[r][c] = '█';
  }
}

// ---------------------------------------------------------------------------------------------
// CP437-style 8x16 bitmap font for the typed text. Rows are '#'/'.' strings, placed from row `top`
// of the cell. Capitals sit on rows 2-11 with the VGA habit of 2-pixel stems.
// ---------------------------------------------------------------------------------------------
const FONT = new Map();
function def(ch, top, rows) {
  const g = new Array(16).fill(0);
  rows.split(' ').forEach((r, i) => {
    let v = 0;
    for (let c = 0; c < 8; c++) if (r[c] === '#') v |= 1 << (7 - c);
    g[top + i] = v;
  });
  FONT.set(ch, g);
}
const CAPS = {
  A: '...#... ..###.. .##.##. ##...## ##...## ####### ##...## ##...## ##...## ##...##',
  B: '######. .##..## .##..## .##..## .#####. .##..## .##..## .##..## .##..## ######.',
  C: '..####. .##..## ##....# ##..... ##..... ##..... ##..... ##....# .##..## ..####.',
  D: '#####.. .##.##. .##..## .##..## .##..## .##..## .##..## .##..## .##.##. #####..',
  E: '####### .##..## .##...# .##.#.. .####.. .##.#.. .##.... .##...# .##..## #######',
  F: '####### .##..## .##...# .##.#.. .####.. .##.#.. .##.... .##.... .##.... ####...',
  G: '..####. .##..## ##....# ##..... ##..... ##.#### ##...## ##...## .##..## ..###.#',
  H: '##...## ##...## ##...## ##...## ####### ##...## ##...## ##...## ##...## ##...##',
  I: '.####.. ..##... ..##... ..##... ..##... ..##... ..##... ..##... ..##... .####..',
  J: '...#### ....##. ....##. ....##. ....##. ....##. ##..##. ##..##. ##..##. .####..',
  K: '###..## .##..## .##.##. .##.##. .####.. .####.. .##.##. .##..## .##..## ###..##',
  L: '####... .##.... .##.... .##.... .##.... .##.... .##.... .##...# .##..## #######',
  M: '##...## ###.### ####### ####### ##.#.## ##...## ##...## ##...## ##...## ##...##',
  N: '##...## ###..## ####.## ####### ##.#### ##..### ##...## ##...## ##...## ##...##',
  O: '.#####. ##...## ##...## ##...## ##...## ##...## ##...## ##...## ##...## .#####.',
  P: '######. .##..## .##..## .##..## .#####. .##.... .##.... .##.... .##.... ####...',
  R: '######. .##..## .##..## .##..## .#####. .##.##. .##..## .##..## .##..## ###..##',
  S: '.#####. ##...## ##...## .##.... ..###.. ....##. .....## ##...## ##...## .#####.',
  T: '.######. .######. .#.##.#. ...##... ...##... ...##... ...##... ...##... ...##... ..####..',
  U: '##...## ##...## ##...## ##...## ##...## ##...## ##...## ##...## ##...## .#####.',
  V: '##...## ##...## ##...## ##...## ##...## ##...## ##...## .##.##. ..###.. ...#...',
  W: '##...## ##...## ##...## ##...## ##.#.## ##.#.## ##.#.## ####### .##.##. .##.##.',
  X: '##...## ##...## .##.##. .#####. ..###.. ..###.. .#####. .##.##. ##...## ##...##',
  Y: '.##..##. .##..##. .##..##. .##..##. ..####.. ...##... ...##... ...##... ...##... ..####..',
  Z: '####### ##...## #...##. ...##.. ..##... .##.... ##..... ##....# ##...## #######',
  0: '..###.. .##.##. ##...## ##...## ##.#.## ##.#.## ##...## ##...## .##.##. ..###..',
  1: '..##... .###... ####... ..##... ..##... ..##... ..##... ..##... ..##... ######.',
  2: '.#####. ##...## .....## ....##. ...##.. ..##... .##.... ##..... ##...## #######',
  3: '.#####. ##...## .....## .....## ..####. .....## .....## .....## ##...## .#####.',
  4: '....##. ...###. ..####. .##.##. ##..##. ####### ....##. ....##. ....##. ...####',
  5: '####### ##..... ##..... ##..... ######. .....## .....## .....## ##...## .#####.',
  6: '..###.. .##.... ##..... ##..... ######. ##...## ##...## ##...## ##...## .#####.',
  7: '####### ##...## .....## ....##. ...##.. ..##... ..##... ..##... ..##... ..##...',
  8: '.#####. ##...## ##...## ##...## .#####. ##...## ##...## ##...## ##...## .#####.',
  9: '.#####. ##...## ##...## ##...## .###### .....## .....## .....## ....##. .####..',
};
for (const [ch, rows] of Object.entries(CAPS)) def(ch, 2, rows);
def('Q', 2, '.#####. ##...## ##...## ##...## ##...## ##...## ##...## ##.#.## ##.#### .#####. ....##. ....###');

const LOWER = {
  a: [5, '.####.. ....##. .#####. ##..##. ##..##. ##..##. .###.##'],
  b: [2, '###.... .##.... .##.... .####.. .##.##. .##..## .##..## .##..## .##..## .#####.'],
  c: [5, '.#####. ##...## ##..... ##..... ##..... ##...## .#####.'],
  d: [2, '...###. ....##. ....##. ..####. .##.##. ##..##. ##..##. ##..##. ##..##. .###.##'],
  e: [5, '.#####. ##...## ####### ##..... ##..... ##...## .#####.'],
  f: [2, '..###.. .##.##. .##..#. .##.... ####... .##.... .##.... .##.... .##.... ####...'],
  g: [5, '.###.## ##..##. ##..##. ##..##. ##..##. ##..##. .#####. ....##. ##..##. .####..'],
  h: [2, '###.... .##.... .##.... .##.##. .###.## .##..## .##..## .##..## .##..## ###..##'],
  i: [2, '..##... ..##... ....... .###... ..##... ..##... ..##... ..##... ..##... .####..'],
  j: [2, '....##. ....##. ....... ...###. ....##. ....##. ....##. ....##. ....##. ....##. .##.##. .##.##. ..###..'],
  k: [2, '###.... .##.... .##.... .##..## .##.##. .####.. .####.. .##.##. .##..## ###..##'],
  l: [2, '.###... ..##... ..##... ..##... ..##... ..##... ..##... ..##... ..##... .####..'],
  m: [5, '###.##. ####### ##.#.## ##.#.## ##.#.## ##.#.## ##...##'],
  n: [5, '##.###. .##..## .##..## .##..## .##..## .##..## .##..##'],
  o: [5, '.#####. ##...## ##...## ##...## ##...## ##...## .#####.'],
  p: [5, '##.###. .##..## .##..## .##..## .##..## .##..## .#####. .##.... .##.... ####...'],
  q: [5, '.###.## ##..##. ##..##. ##..##. ##..##. ##..##. .#####. ....##. ....##. ...####'],
  r: [5, '##.###. .###.## .##..## .##.... .##.... .##.... ####...'],
  s: [5, '.#####. ##...## .##.... ..###.. ....##. ##...## .#####.'],
  t: [2, '...#... ..##... ..##... ######. ..##... ..##... ..##... ..##... ..##.## ...###.'],
  u: [5, '##..##. ##..##. ##..##. ##..##. ##..##. ##..##. .###.##'],
  v: [5, '##...## ##...## ##...## ##...## .##.##. ..###.. ...#...'],
  w: [5, '##...## ##...## ##.#.## ##.#.## ##.#.## ####### .##.##.'],
  x: [5, '##...## .##.##. ..###.. ..###.. ..###.. .##.##. ##...##'],
  y: [5, '##...## ##...## ##...## ##...## ##...## ##...## .###### .....## ....##. #####..'],
  z: [5, '####### ##..##. ...##.. ..##... .##.... ##...## #######'],
};
for (const [ch, [top, rows]] of Object.entries(LOWER)) def(ch, top, rows);

const PUNCT = {
  '.': [10, '...##.. ...##..'],
  ',': [9, '...##.. ...##.. ...##.. ..##...'],
  ':': [5, '...##.. ...##.. ....... ....... ...##.. ...##..'],
  ';': [5, '...##.. ...##.. ....... ....... ...##.. ...##.. ..##...'],
  '!': [2, '...##.. ..####. ..####. ..####. ...##.. ...##.. ...##.. ....... ...##.. ...##..'],
  '?': [2, '.#####. ##...## ##...## ....##. ...##.. ...##.. ...##.. ....... ...##.. ...##..'],
  "'": [1, '...##.. ...##.. ..##...'],
  '"': [1, '.##..##. .##..##. ..#..#..'],
  '-': [7, '#######'],
  '_': [14, '########'],
  '/': [4, '......# .....## ....##. ...##.. ..##... .##.... ##..... #......'],
  '\\': [4, '#...... ##..... .##.... ..##... ...##.. ....##. .....## ......#'],
  '|': [2, '...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##..'],
  '(': [2, '....##. ...##.. ..##... ..##... ..##... ..##... ..##... ..##... ...##.. ....##.'],
  ')': [2, '.##.... ..##... ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ..##... .##....'],
  '[': [2, '.####.. .##.... .##.... .##.... .##.... .##.... .##.... .##.... .##.... .####..'],
  ']': [2, '.####.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. .####..'],
  '{': [2, '....### ...##.. ...##.. ...##.. .###... ...##.. ...##.. ...##.. ...##.. ....###'],
  '}': [2, '###.... ..##... ..##... ..##... ...###. ..##... ..##... ..##... ..##... ###....'],
  '<': [3, '....##. ...##.. ..##... .##.... ##..... .##.... ..##... ...##.. ....##.'],
  '>': [3, '.##.... ..##... ...##.. ....##. .....## ....##. ...##.. ..##... .##....'],
  '#': [2, '.##.##. .##.##. ####### .##.##. .##.##. .##.##. ####### .##.##. .##.##.'],
  '*': [5, '.##..##. ..####.. ######## ..####.. .##..##.'],
  '+': [5, '...##... ...##... .######. ...##... ...##...'],
  '=': [6, '.######. ........ ........ .######.'],
  '@': [2, '.#####. ##...## ##...## ##.#### ##.#### ##.#### ##.###. ##..... ##..... .#####.'],
  '&': [2, '.###... ##.##.. ##.##.. .###... .###.## ##.###. ##..##. ##..##. ##..##. .###.##'],
  '%': [4, '##....#. ##...##. ....##.. ...##... ..##.... .##..... ##...##. #....##.'],
  '~': [2, '.###.## ##.###.'],
  '♪': [3, '...##... ...###.. ...####. ...##.##. ...##..#. ...##... ...##... .####... #####... .###....'],
  '►': [3, '#....... ##...... ###..... ####.... #####... ####.... ###..... ##...... #.......'],
  '◄': [3, '....#... ...##... ..###... .####... #####... .####... ..###... ...##... ....#...'],
  '▼': [5, '#######. .#####.. ..###... ...#....'],
  '▲': [7, '...#.... ..###... .#####.. #######.'],
  '×': [6, '##...##. .##.##.. ..###... .##.##.. ##...##.'],
  '·': [7, '...##... ...##...'],
  '•': [6, '...##... ..####.. ..####.. ...##...'],
  '→': [5, '....##.. .....##. ######## .....##. ....##..'],
  '■': [5, '.######. .######. .######. .######. .######. .######.'],
  '♥': [4, '.##.##. ####### ####### ####### .#####. ..###.. ...#...'],
};
for (const [ch, [top, rows]] of Object.entries(PUNCT)) def(ch, top, rows);
FONT.set(' ', new Array(16).fill(0));

// Box drawing, generated from arm descriptions: single lines on row 7 / column 3,
// double lines on rows 6+9 / columns 2+5.
function box(ch, spec) {
  const g = new Array(16).fill(0);
  const set = (x, y) => { g[y] |= 1 << (7 - x); };
  const hline = (y, x0, x1) => { for (let x = x0; x <= x1; x++) set(x, y); };
  const vline = (x, y0, y1) => { for (let y = y0; y <= y1; y++) set(x, y); };
  spec({ hline, vline });
  FONT.set(ch, g);
}
box('─', ({ hline }) => hline(7, 0, 7));
box('│', ({ vline }) => vline(3, 0, 15));
box('┌', ({ hline, vline }) => { hline(7, 3, 7); vline(3, 7, 15); });
box('┐', ({ hline, vline }) => { hline(7, 0, 3); vline(3, 7, 15); });
box('└', ({ hline, vline }) => { hline(7, 3, 7); vline(3, 0, 7); });
box('┘', ({ hline, vline }) => { hline(7, 0, 3); vline(3, 0, 7); });
box('┴', ({ hline, vline }) => { hline(7, 0, 7); vline(3, 0, 7); });
box('├', ({ hline, vline }) => { hline(7, 3, 7); vline(3, 0, 15); });
box('┤', ({ hline, vline }) => { hline(7, 0, 3); vline(3, 0, 15); });

// Glyph bitmap -> compact path (greedy merge of horizontal runs into rectangles).
function bitmapPath(rows, width, scaleX = 1, scaleY = 1, ox = 0, oy = 0) {
  const rects = [];
  let open = [];
  for (let y = 0; y < rows.length; y++) {
    const runs = [];
    for (let x = 0; x < width;) {
      if (rows[y](x)) { const s0 = x; while (x < width && rows[y](x)) x++; runs.push([s0, x - s0]); } else x++;
    }
    const next = [];
    for (const [x0, w] of runs) {
      const o = open.find((r) => r.x === x0 && r.w === w && r.y + r.h === y);
      if (o) { o.h++; next.push(o); } else { const r = { x: x0, w, y, h: 1 }; rects.push(r); next.push(r); }
    }
    open = next;
  }
  return rects.map((r) => `M${ox + r.x * scaleX} ${oy + r.y * scaleY}h${r.w * scaleX}v${r.h * scaleY}h${-r.w * scaleX}z`).join('');
}
const glyphPath = (g) => bitmapPath(g.map((v) => (x) => (v >> (7 - x)) & 1), 8);
box('┬', ({ hline, vline }) => { hline(7, 0, 7); vline(3, 7, 15); });
const glyphIds = new Map();
function gid(ch) {
  if (!FONT.has(ch)) throw new Error(`no glyph for ${JSON.stringify(ch)} (U+${ch.codePointAt(0).toString(16)})`);
  if (!glyphIds.has(ch)) glyphIds.set(ch, `g${glyphIds.size.toString(36)}`);
  return glyphIds.get(ch);
}

// ---------------------------------------------------------------------------------------------
// The screen: 80 columns. Rows 0-23 are the logo block, the typed part of the file follows.
// ---------------------------------------------------------------------------------------------
const CREW = 'SECOND COAT';              // invented. the brush goes back over the logo every 18 seconds: that is the second coat.
const TAG = '2C';
const ARTIST = 'bristle';                // invented handle for whoever holds the brush
const LIVE = 'https://lukexyz.github.io/ULTRA-SATISFACTORY/';

const R = { presents: 2, caption: 22, pitch: 24, box: 25, notes: 33 };
const BOX_LEFT = [
  ['Title', 'ULTRA-SATISFACTORY', HI],
  ['Type', 'companion app (fan-made)'],
  ['Made for', 'the game Satisfactory'],
  ['Protection', "none. it's Apache 2.0"],
  ['Platform', 'Python 3.10+ / a browser'],
];
const BOX_RIGHT = [
  ['Tab 1', 'Objectives (5 phases)'],
  ['Tab 2', 'Items (140 craftable)'],
  ['Tab 3', 'Buildings (477)'],
  ['Recipes', '211, 88 of them alternates'],
  ['Version', '0.0.1 (the UI says v1.0)'],
];
const NOTES = [
  ['1. ', 'python -m pip install -r requirements.txt', '', ''],
  ['2. ', 'python -m streamlit run app/app.py', '   then ', 'http://localhost:8501'],
  ['3. ', 'Or install nothing: ', '', LIVE],
  ['4. ', 'Park it on the other monitor. Call the arrangement temporary.', '', ''],
];
const ROWS = R.notes + 2 + NOTES.length;
const VBW = COLS * CW + PAD * 2, VBH = ROWS * CH + PAD * 2;

const cells = [];                                    // { r, c, ch, fill }
const len = (s) => [...s].length;
function put(r, c, str, fill) {
  for (const ch of str) {
    if (c < 0 || c >= COLS || r < 0 || r >= ROWS) throw new Error(`off screen at ${r},${c}: ${str}`);
    if (r < LROWS && (logo[r][c] !== ' ' || ring[r][c] !== ' ')) throw new Error(`text over the logo at ${r},${c}: ${str}`);
    if (ch !== ' ') cells.push({ r, c, ch, fill });
    c++;
  }
  return c;
}
const LBL = '#808080';

// Top right, outside the contour, in the step it makes down from the capital: who is presenting.
// A block cursor blinks after it.
const PRESENTS = `${CREW} proudly presents`;
const presentsAt = COLS - 2 - len(PRESENTS) - 1;
put(R.presents, put(R.presents, presentsAt, CREW, HI), ' proudly presents', INK);
const CURSOR = { r: R.presents, c: presentsAt + len(PRESENTS) };

// In the notch the contour leaves between the f and the y: version, letter-spaced, and the artist tag.
const CAPTION = 'v 0 . 0 . 1';
{
  // the notch is the widest clear run on that row with contour on both sides of it
  const edges = [];
  for (let c = 0; c < COLS; c++) if (ring[R.caption][c] !== ' ') edges.push(c);
  let notch = [0, 0];
  for (let i = 1; i < edges.length; i++) if (edges[i] - edges[i - 1] > notch[1] - notch[0]) notch = [edges[i - 1], edges[i]];
  const sig = `${ARTIST}/${TAG}`;
  const at = notch[0] + 1 + Math.floor((notch[1] - notch[0] - 1 - (len(CAPTION) + 3 + len(sig))) / 2);
  put(R.caption, at, CAPTION, INK);
  put(R.caption, at + len(CAPTION) + 3, sig, LBL);
}

// Under the logo: the pitch.
{
  const a = 'every recipe, building and Space Elevator objective, ', b = 'one click apart';
  const at = Math.floor((COLS - len(a + b)) / 2);
  put(R.pitch, put(R.pitch, at, a, INK), b, HI);
}

// Then one single-line box, two columns, labels right-aligned to the colon.
{
  const c0 = 1, cm = 40, c1 = 78;
  put(R.box, c0, '┌' + '─'.repeat(cm - c0 - 1) + '┬' + '─'.repeat(c1 - cm - 1) + '┐', DIM);
  const n = BOX_LEFT.length;
  for (let i = 0; i < n; i++) {
    const r = R.box + 1 + i;
    for (const c of [c0, cm, c1]) put(r, c, '│', DIM);
    const col = (pairs, at, lw, room) => {
      const [label, value, fill] = pairs[i];
      if (lw + 2 + len(value) > room) throw new Error(`box line too long: ${label}: ${value}`);
      put(r, at + lw - len(label), label, LBL);
      put(r, at + lw, ':', DIM);
      put(r, at + lw + 2, value, fill || INK);
    };
    col(BOX_LEFT, c0 + 2, 10, cm - c0 - 3);
    col(BOX_RIGHT, cm + 2, 7, c1 - cm - 3);
  }
  put(R.box + 1 + n, c0, '└' + '─'.repeat(cm - c0 - 1) + '┴' + '─'.repeat(c1 - cm - 1) + '┘', DIM);
}

// Then a plain heading underlined with tildes of the same length, and the typed lines.
{
  const h = 'Install Notes';
  put(R.notes, 1, h, HI);
  put(R.notes + 1, 1, '~'.repeat(len(h)), LBL);
  NOTES.forEach(([n, a, b, link], i) => {
    let c = put(R.notes + 2 + i, 2, n, LBL);
    c = put(R.notes + 2 + i, c, a, INK);
    c = put(R.notes + 2 + i, c, b, LBL);
    put(R.notes + 2 + i, c, link, ACC);
  });
}

// ---------------------------------------------------------------------------------------------
// Motion. One 18 second loop, and every frame of it is a readable screen with the name on it:
//   1.0 s  the brush goes back over the lettering, left to right in column steps: each column
//          dries out, then is re-inked with a white wet edge that settles back to colour
//   5.0 s  the die-cut contour is traced from its top-left corner, both ways round at once
//   7.2 s  the typed part of the file is redrawn a row at a time, the way a 2400 baud line would
// The block cursor after "presents" blinks throughout.
// ---------------------------------------------------------------------------------------------
const LOOP = 18;
const TM = { brush: 1.0, colStep: 0.036, dry: 0.3, wait: 0.75, settle: 0.45, trace: 5.0, traceStep: 0.016, rows: 7.2, rowDur: 0.3 };
const pct = (t) => `${+(t / LOOP * 100).toFixed(3)}%`;
const sec = (t) => `${+t.toFixed(3)}s`;

// A column of logo cells as one path: full and half blocks, merged where they stack.
function cellRects(list) {
  const rects = [];
  for (const { r, c, ch } of list) {
    let x = c * CW, y = r * CH, w = CW, h = CH;
    if (ch === '▀') h = CH / 2;
    else if (ch === '▄') { y += CH / 2; h = CH / 2; }
    else if (ch === '▌') w = CW / 2;
    else if (ch === '▐') { x += CW / 2; w = CW / 2; }
    const last = rects[rects.length - 1];
    if (last && last.x === x && last.w === w && last.y + last.h === y) last.h += h;
    else rects.push({ x, y, w, h });
  }
  // merge sideways too, where neighbours share top and height
  rects.sort((a, b) => a.y - b.y || a.h - b.h || a.x - b.x);
  const out = [];
  for (const q of rects) {
    const last = out[out.length - 1];
    if (last && last.y === q.y && last.h === q.h && last.x + last.w === q.x) last.w += q.w;
    else out.push({ ...q });
  }
  return out.map((q) => `M${q.x} ${q.y}h${q.w}v${q.h}h${-q.w}z`).join('');
}

let logoSvg = '';
{
  let cMin = COLS, cMax = 0;
  for (let r = 0; r < LROWS; r++) for (let c = 0; c < COLS; c++) if (logo[r][c] !== ' ') { cMin = Math.min(cMin, c); cMax = Math.max(cMax, c); }
  for (let c = cMin; c <= cMax; c++) {
    for (const k of [0, 1]) {
      const list = [];
      for (let r = 0; r < LROWS; r++) if (logo[r][c] !== ' ' && tier[r][c] === k) list.push({ r, c, ch: logo[r][c] });
      if (!list.length) continue;
      logoSvg += `<path class="${k ? 's' : 'u'}" style="animation-delay:${sec(TM.brush + (c - cMin) * TM.colStep)}" d="${cellRects(list)}"/>`;
    }
  }
}

// The contour, grouped by how far round it each cell is from the top-left corner.
let ringSvg = '';
{
  const dist = ring.map((row) => row.map(() => -1));
  let start = null;
  for (let r = 0; r < LROWS && !start; r++) for (let c = 0; c < COLS && !start; c++) if (ring[r][c] !== ' ') start = [r, c];
  let frontier = [start];
  dist[start[0]][start[1]] = 0;
  const groups = [];
  while (frontier.length) {
    groups.push(frontier);
    const next = [];
    for (const [r, c] of frontier) {
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        const rr = r + dr, cc = c + dc;
        if (inGrid(rr, cc) && ring[rr][cc] !== ' ' && dist[rr][cc] < 0) { dist[rr][cc] = groups.length; next.push([rr, cc]); }
      }
    }
    frontier = next;
  }
  for (let r = 0; r < LROWS; r++) for (let c = 0; c < COLS; c++) if (ring[r][c] !== ' ' && dist[r][c] < 0) throw new Error(`contour is not one piece at ${r},${c}`);
  groups.forEach((g, i) => {
    const list = g.map(([r, c]) => ({ r, c, ch: ring[r][c] })).sort((a, b) => a.c - b.c || a.r - b.r);
    ringSvg += `<path class="c" style="animation-delay:${sec(TM.trace + i * TM.traceStep)}" d="${cellRects(list)}"/>`;
  });
}

// Typed text: <use> of the font glyphs, grouped by colour. It is anti-aliased (the block art is
// not): the banner is rarely shown at a whole-number scale, and snapped 1 px stems come out uneven.
let textSvg = '';
{
  const by = new Map();
  for (const cell of cells) { if (!by.has(cell.fill)) by.set(cell.fill, []); by.get(cell.fill).push(cell); }
  for (const [fill, list] of by) {
    textSvg += `<g fill="${fill}" shape-rendering="geometricPrecision">${list.map(({ r, c, ch }) => `<use href="#${gid(ch)}" x="${c * CW}" y="${r * CH}"/>`).join('')}</g>`;
  }
}

// Row redraw (the typed rows under the logo): a black cover snaps over a row, then shrinks away to the right one cell per step,
// with a cursor block riding its left edge.
let redrawSvg = '';
{
  const rows = [...new Set(cells.filter((q) => q.r >= LROWS).map((q) => q.r))].sort((a, b) => a - b);
  rows.forEach((r, i) => {
    const d = sec(TM.rows + i * TM.rowDur);
    redrawSvg += `<rect class="cv" x="${CW}" y="${r * CH}" width="${78 * CW}" height="${CH}" style="animation-delay:${d}"/>`
      + `<rect class="cc" x="${CW}" y="${r * CH}" width="${CW}" height="${CH}" style="animation-delay:${d}"/>`;
  });
}

const css = [
  `.u{fill:${ACC};animation:u ${LOOP}s linear infinite}`,
  `.s{fill:${LOGO2};animation:s ${LOOP}s linear infinite}`,
  `.c{fill:${INK};animation:c ${LOOP}s linear infinite}`,
  ...[['u', ACC, ACC_DRY], ['s', LOGO2, LOGO2_DRY]].map(([n, wet, dry]) =>
    `@keyframes ${n}{0%{fill:${wet}}${pct(TM.dry)}{fill:${dry}}${pct(TM.dry + TM.wait)}{fill:${dry}}${pct(TM.dry + TM.wait + 0.01)}{fill:#fff}${pct(TM.dry + TM.wait + TM.settle)}{fill:${wet}}100%{fill:${wet}}}`),
  `@keyframes c{0%{fill:${INK}}${pct(0.02)}{fill:#fff}${pct(0.25)}{fill:${ACC}}${pct(0.9)}{fill:${INK}}100%{fill:${INK}}}`,
  `.cur{fill:${ACC};animation:b 1.06s steps(1) infinite}`,
  '@keyframes b{0%{opacity:1}50%{opacity:0}100%{opacity:0}}',
  `.cv{fill:${BG};transform:scaleX(0);transform-origin:${79 * CW}px 0;animation:cv ${LOOP}s linear infinite}`,
  `@keyframes cv{0%{transform:scaleX(1);animation-timing-function:steps(78,end)}${pct(TM.rowDur)}{transform:scaleX(0)}100%{transform:scaleX(0)}}`,
  `.cc{fill:${ACC};opacity:0;animation:cc ${LOOP}s linear infinite}`,
  `@keyframes cc{0%{opacity:1;transform:translateX(0);animation-timing-function:steps(78,end)}${pct(TM.rowDur)}{opacity:1;transform:translateX(${78 * CW}px)}${pct(TM.rowDur + 0.001)}{opacity:0;transform:translateX(${78 * CW}px)}100%{opacity:0;transform:translateX(${78 * CW}px)}}`,
  '@media (prefers-reduced-motion:reduce){*{animation:none!important}}',
].join('');

const TITLE = 'ULTRA-SATISFACTORY: a brush-script .NFO header';
const DESC = 'An 80-column DOS text screen in grey on black. The word Ultra is brushed in flat block characters as a slanted script in neon cyan, with an oversized capital U twelve rows tall whose tail runs out under the other letters; Satisfactory sits beneath it in a bold near-white brush italic. A thin die-cut contour is traced round the whole logo, with the version 0.0.1 and the tag bristle/2C in a notch at its foot. Top right: SECOND COAT proudly presents, with a blinking block cursor. Below the logo: every recipe, building and Space Elevator objective, one click apart. Then a single-line box with two columns of label and value pairs (title, type, protection: none, platform, the three tabs, counts) and an Install Notes heading underlined with tildes above the two commands and the live link.';
const defs = [...glyphIds].map(([ch, id]) => `<path id="${id}" d="${glyphPath(FONT.get(ch))}"/>`).join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VBW} ${VBH}" width="${VBW}" height="${VBH}" shape-rendering="crispEdges" role="img" aria-labelledby="t d">
<title id="t">${TITLE}</title>
<desc id="d">${DESC}</desc>
<style>${css}</style>
<defs>${defs}</defs>
<rect width="${VBW}" height="${VBH}" rx="8" fill="${BG}" shape-rendering="geometricPrecision"/>
<g transform="translate(${PAD} ${PAD})">
${ringSvg}
${logoSvg}
${textSvg}
<rect class="cur" x="${CURSOR.c * CW}" y="${CURSOR.r * CH}" width="${CW}" height="${CH}"/>
${redrawSvg}
</g>
</svg>
`;
fs.mkdirSync(path.dirname(OUT_SVG), { recursive: true });
fs.writeFileSync(OUT_SVG, svg);

// ---------------------------------------------------------------------------------------------
// The markdown. The banner, a short pitch, then the rest of the .NFO as real text (collapsed),
// and the logo grid itself as text for anyone who wants it in a terminal.
// ---------------------------------------------------------------------------------------------
const logoText = logo.map((row, r) => row.map((ch, c) => (ch !== ' ' ? ch : ring[r][c])).join('').replace(/\s+$/, ''));
while (logoText[logoText.length - 1] === '') logoText.pop();
if (process.argv.includes('--text')) console.log(logoText.join('\n'));

const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const link = (href, text) => ({ href, text });
// A line is a string, or an array of strings and { href, text } / { b } parts. head() makes a
// heading underlined with tildes of the same length.
const head = (t) => [[' ', { b: t }], ' ' + '~'.repeat(len(t))];
// The footer emblem: the app's own mark, a hexagon with a cog in it, in 7-bit characters, with
// the crew on one side and its motto on the other.
const MOTTO = 'THE FiRST ONE NEVER DRiED';
function emblem(left, right) {
  const hex = ['  ____', ' / __ \\', '/ /**\\ \\', '\\ \\__/ /', ' \\____/'];
  const at = 35;
  return hex.map((h, i) => (i === 2
    ? `${' '.repeat(at - 6 - len(left))}${left}  --  ${h}  --  ${right}`
    : ' '.repeat(at) + h));
}
const NFO = [
  ...head('Release Notes'),
  '  ULTRA-SATISFACTORY is a lookup tool for the game Satisfactory. It lives on',
  '  the other monitor and answers the three questions a factory asks all day:',
  '  what does this need, what makes that, and how many of them does the Space',
  '  Elevator want before it will stop looming.',
  '',
  '  Everything is one click from everything else. Click a part for its recipe.',
  '  Click an ingredient for that recipe. Click the machine for the building.',
  '  Management notes that "I was only checking one thing" used to be an',
  '  excuse. It is now a feature.',
  '',
  ...head('The Three Tabs'),
  ['  ', { b: 'OBJECTIVES' }, ' .. pick a Space Elevator phase, see the parts and the counts'],
  ['  ', { b: 'ITEMS' }, ' ....... search as you type. every recipe card has the ingredients'],
  '                with per-minute rates, the machine, cycle time, power draw',
  ['  ', { b: 'BUILDINGS' }, ' ... every building and what it makes, grouped by tier, plus'],
  '                Mk-by-Mk upgrade paths for miners, belts, pipes and storage',
  ['  The long version is under ', link('#whats-inside', '#whats-inside'), '.'],
  '',
  ...head('What The Elevator Wants'),
  '  1  Automation basics ..... Smart Plating x50, Versatile Framework x100,',
  '                             Automated Wiring x500',
  '  2  Logistics & steel ..... Automated Wiring x500, Modular Frame x500,',
  '                             Smart Plating x100, Versatile Framework x500',
  '  3  Oil & computers ....... Versatile Framework x2500, Modular Engine x500,',
  '                             Adaptive Control Unit x100',
  '  4  Nuclear & endgame ..... Assembly Director System x1000, Magnetic Field',
  '                             Generator x500, Nuclear Pasta x100, Thermal',
  '                             Propulsion Rocket x25',
  '  5  Alien tech & quantum .. Biochemical Sculptor x500, AI Expansion Server',
  '                             x100, Neural-Quantum Processor x100, Ballistic',
  '                             Warp Drive x100',
  '',
  ...head('Screw Arithmetic'),
  '  Straight off the recipe cards, standard recipes only:',
  '',
  '    Smart Plating ........... 1 Reinforced Iron Plate + 1 Rotor',
  '    Reinforced Iron Plate ... 6 Iron Plate + 12 Screw',
  '    Rotor ................... 5 Iron Rod + 25 Screw',
  '    Versatile Framework ..... 1 Modular Frame + 12 Steel Beam, makes 2',
  '    Modular Frame ........... 3 Reinforced Iron Plate + 12 Iron Rod, makes 2',
  '    Screw ................... 1 Iron Rod makes 4. Constructor, 6 s, 4 MW',
  '',
  '  One Smart Plating is 37 Screws, and Phase 1 opens by asking for fifty:',
  '  1,850. Its 100 Versatile Framework need 50 Modular Frames, which need 75',
  '  more Reinforced Iron Plates: another 900. Automated Wiring, to its credit,',
  '  uses none. Total 2,750 Screws, which is 68 minutes 45 seconds of a single',
  '  Constructor at 40 a minute. Nobody ever plans a storage box full of',
  '  Screws. It is simply where the arithmetic leads.',
  '',
  ...head('Install Notes'),
  '  1. python -m pip install -r requirements.txt',
  '  2. python -m streamlit run app/app.py',
  '  3. Open http://localhost:8501. Python 3.10+, run it from the repo root.',
  ['  0. Or do none of that: ', link(LIVE, LIVE)],
  ['     The whole app runs in the browser tab. More under ', link('#run-it-locally', '#run-it-locally'), ','],
  ['     and how that works under ', link('#how-its-built', '#how-its-built'), '.'],
  '',
  ...head('Known Issues'),
  '  - Knows every recipe. Does not know which way round you laid the belt.',
  '  - Will tell you a Manufacturer draws 55 MW. Will not be standing next to',
  '    you when you switch on the fourth one and the fuse goes.',
  '  - Cannot see the pipe you clipped through that wall. Neither can we.',
  '    Nobody saw anything.',
  '  - Takes no side between manifolds and load balancers. It has seen what',
  '    both camps do to a clean floor.',
  '  - Overclocking the app has no effect. People keep trying.',
  '',
  ...head('Parts Supplied By'),
  ['  Game data ... ', link('https://github.com/greeny/SatisfactoryTools', 'greeny/SatisfactoryTools')],
  ['  Images ...... the Satisfactory Wiki, under ', link('https://creativecommons.org/licenses/by-nc-sa/4.0/', 'CC BY-NC-SA 4.0')],
  '  The game .... Coffee Stain Studios, who are not involved and not to blame',
  ['  Protection .. none. the code is ', link('LICENSE', 'Apache 2.0'), ': read it, fork it, rewire it'],
  ['  Small print . ', link('#data--credits', '#data--credits'), ' and ', link('#license', '#license')],
  '',
  ...head('Greets'),
  '  the Clipped Pipe Alibi Bureau, the Half-A-Pasta-A-Minute Club, Fuse Box',
  '  Five, Second Monitor Syndicate, the Tidy Grid Temperance League, Noodle',
  '  Union Local 477, the Mk.1 Loyalists, and whoever left forty boxes of',
  '  Screws by the door. It was a temporary arrangement. It is structural now.',
  '',
  ...emblem(CREW, MOTTO),
  '',
  ' SATISFACTORY IS MADE BY COFFEE STAIN STUDIOS. THIS APP IS AN UNOFFICIAL FAN',
  ' PROJECT. SUPPORT THE PEOPLE WHO MADE THE GAME. THE APP IS FREE: STAR IT.',
];
const plain = (line) => (typeof line === 'string' ? line : line.map((p) => (typeof p === 'string' ? p : p.b ?? p.text)).join(''));
const html = (line) => (typeof line === 'string' ? esc(line) : line.map((p) => (typeof p === 'string' ? esc(p) : p.b ? `<b>${esc(p.b)}</b>` : `<a href="${p.href}">${esc(p.text)}</a>`)).join(''));
NFO.forEach((line, i) => {
  const t = plain(line);
  if (len(t) > 78) throw new Error(`NFO line ${i + 1} is ${len(t)} columns: ${t}`);
  if (/\s$/.test(t)) throw new Error(`NFO line ${i + 1} has trailing whitespace`);
  if (/[^\x20-\x7E]/.test(t)) throw new Error(`NFO line ${i + 1} is not 7-bit: ${t}`);
});

const ALT = `ULTRA-SATISFACTORY as a brush-script .NFO file on an 80-column DOS screen. The word Ultra is lettered in flat cyan block characters as a slanted brush script, with an oversized capital U twelve rows tall whose tail runs out under the rest of the word; Satisfactory sits beneath it in a bold white brush italic, and a die-cut contour line is traced round the pair. Top right: ${CREW} proudly presents. Under the logo: every recipe, building and Space Elevator objective, one click apart. A single-line box lists Title: ULTRA-SATISFACTORY, Type: companion app (fan-made), Made for: the game Satisfactory, Protection: none, it is Apache 2.0, Platform: Python 3.10+ or a browser; and the three tabs, Objectives (5 phases), Items (140 craftable) and Buildings (477), with 211 recipes, 88 of them alternates, version 0.0.1. Install Notes: python -m pip install -r requirements.txt, then python -m streamlit run app/app.py, or install nothing and open lukexyz.github.io/ULTRA-SATISFACTORY. Every 18 seconds the brush goes back over the lettering, the contour is retraced and the text is redrawn a line at a time.`;
const md = `<!-- Header ${SLUG} for ULTRA-SATISFACTORY. Generated by src/${SLUG}.mjs: edit that, not this. -->

<p align="center">
  <img src="assets/${SLUG}.svg" width="768" alt="${ALT.replace(/"/g, '&quot;')}">
</p>

<p align="center">
  ⚡ <b>ULTRA-SATISFACTORY</b> · a ${CREW} release · the first one never dried
</p>

⚡ **ULTRA-SATISFACTORY** is a companion app for the factory-building game *Satisfactory*: every recipe, building and Space Elevator objective, one click apart. Three tabs, all wired into each other: **Objectives** (pick a Space Elevator phase, see what it wants and how many), **Items** (search as you type; every recipe card has the per-minute rates, the machine, its cycle time and its power draw) and **Buildings** (what each one makes, tier by tier, with Mk-by-Mk upgrade paths). Keep it on the second monitor, a phone, or a well-worn alt-tab, and look things up before the Assembler notices it is starving.

⚡ [Open it live in your browser](${LIVE}), nothing to install, or [run it locally](#run-it-locally) with two commands. Copy protection: none, it is [Apache 2.0](LICENSE). Unofficial fan project, not affiliated with Coffee Stain Studios, who would have used a nicer font.

<details>
<summary>⚡ <b>ULTRA.NFO</b> · the rest of the file: release notes, all five phases, screw arithmetic, known issues, greets</summary>

<pre>
${NFO.map(html).join('\n')}
</pre>

</details>

<details>
<summary>⚡ <b>The logo as plain text</b> · 80 columns, six kinds of block, for your own terminal</summary>

<pre>
${logoText.join('\n')}
</pre>

⚡ GitHub spaces its code lines, so the blocks show seams here. Paste it into a real 80-column terminal and they close up. Lettering by ${ARTIST}/${TAG}, who is a pen engine in the generator script and not a person.

</details>
`;
fs.writeFileSync(OUT_MD, md);
console.log(`wrote ${path.relative(process.cwd(), OUT_SVG)} (${(svg.length / 1024).toFixed(1)} KB, ${COLS}x${ROWS} cells) and ${path.relative(process.cwd(), OUT_MD)}`);
