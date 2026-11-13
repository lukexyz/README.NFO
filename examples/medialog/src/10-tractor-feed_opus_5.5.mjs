// Tractor-feed printout header for the MediaLog README (catalogue style print-04), done as
// home banners printed in banner mode. Plain Node, no dependencies, deterministic (seeded
// PRNG, no clock). Run:
//   node examples/medialog/src/10-tractor-feed_opus_5.5.mjs
// It rewrites, relative to this file:
//   ../10-tractor-feed_opus_5.5.md               the header itself (markdown + HTML)
//   ../assets/10-tractor-feed_opus_5.5.svg       the desk: banner, printer, verbs (animated)
//   ../assets/10-tractor-feed_opus_5.5-cards.svg the card file: the log on punched cards (static)
// Edit this file, not those.
//
// The style: continuous stationery. A home banner is one line of giant letters printed
// sideways along fan-fold paper, sheet after sheet, with a small picture at one or both ends
// and the perforations left in. Here the paper is rainbow fan-fold (pink, sky, canary, mint:
// MediaLog's Movies, TV shows, Books and Games colours) and everything is seen from above,
// on a navy desk. The banner program, the printer and its VERB selector are invented and
// drawn from scratch: the banner face, the 3x5 dot font, every pictogram. No real program,
// printer, font or clip art is copied. MediaLog's own mark (an open book with a play
// triangle and a pen) is the owner's brand and is redrawn here as dot graphics.
//
// The scene: MEDIALOG, printed earlier, lies across the top of the desk. Below it the
// printer is busy with the line's verb. It prints WATCHED, someone tears it off at the
// perforation and takes it away; the VERB lamp moves on and it prints READ, then PLAYED,
// then LISTENED TO, each in its kind's colour with its own picture, then WATCHED again.
//
// How the animation works. The four verb banners are 4, 3, 4 and 5 sheets long: 16 sheets,
// so the four paper colours come round exactly and the loop is seamless. One cycle:
//   hold  : the finished verb banner lies on the desk, still joined to the paper in the
//           printer at its right end. The head is parked. (Under reduced motion everything
//           stops on this frame, with WATCHED.)
//   tear  : a separate copy of it lifts and leaves at the bottom of the desk. From that
//           moment a clip that travels with the paper hides everything left of the tear.
//   print : the paper steps out of the printer one head pass (7 dots) at a time, the head
//           sweeping across the paper between steps, each pass revealed behind the head,
//           until the next banner lies with its torn end at the printer.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '10-tractor-feed_opus_5.5';
const OUT_MD = path.resolve(HERE, '..', `${SLUG}.md`);
const OUT_SVG = path.resolve(HERE, '..', 'assets', `${SLUG}.svg`);
const SVG_REF = `assets/${SLUG}.svg`;
const OUT_CARDS = path.resolve(HERE, '..', 'assets', `${SLUG}-cards.svg`);
const CARDS_REF = `assets/${SLUG}-cards.svg`;

// ------------------------------------------------------------------ helpers
const f1 = (n) => String(Math.round(n * 10) / 10);
const f2 = (n) => String(Math.round(n * 100) / 100);
const f3 = (n) => String(Math.round(n * 1000) / 1000);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const hexToRgb = (h) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16));
const rgbToHex = (rgb) => '#' + rgb.map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => rgbToHex(hexToRgb(a).map((v, k) => lerp(v, hexToRgb(b)[k], t)));
const sum = (a) => a.reduce((x, y) => x + y, 0);

// ------------------------------------------------------------------ 3x5 dot font (silkscreen)
const F3 = {
  A: '.#.|#.#|###|#.#|#.#', B: '##.|#.#|##.|#.#|##.', C: '.##|#..|#..|#..|.##', D: '##.|#.#|#.#|#.#|##.',
  E: '###|#..|##.|#..|###', F: '###|#..|##.|#..|#..', G: '.##|#..|#.#|#.#|.##', H: '#.#|#.#|###|#.#|#.#',
  I: '###|.#.|.#.|.#.|###', J: '..#|..#|..#|#.#|.#.', K: '#.#|#.#|##.|#.#|#.#', L: '#..|#..|#..|#..|###',
  M: '#.#|###|###|#.#|#.#', N: '##.|#.#|#.#|#.#|#.#', O: '.#.|#.#|#.#|#.#|.#.', P: '##.|#.#|##.|#..|#..',
  Q: '.#.|#.#|#.#|##.|.##', R: '##.|#.#|##.|#.#|#.#', S: '.##|#..|.#.|..#|##.', T: '###|.#.|.#.|.#.|.#.',
  U: '#.#|#.#|#.#|#.#|###', V: '#.#|#.#|#.#|#.#|.#.', W: '#.#|#.#|###|###|#.#', X: '#.#|#.#|.#.|#.#|#.#',
  Y: '#.#|#.#|.#.|.#.|.#.', Z: '###|..#|.#.|#..|###',
  0: '###|#.#|#.#|#.#|###', 1: '.#.|##.|.#.|.#.|###', 2: '###|..#|###|#..|###', 3: '###|..#|.##|..#|###',
  4: '#.#|#.#|###|..#|..#', 5: '###|#..|###|..#|###', 6: '###|#..|###|#.#|###', 7: '###|..#|.#.|.#.|.#.',
  8: '###|#.#|###|#.#|###', 9: '###|#.#|###|..#|###', '-': '...|...|###|...|...', '.': '...|...|...|...|.#.',
  '/': '..#|..#|.#.|#..|#..', ':': '...|.#.|...|.#.|...', "'": '.#.|.#.|...|...|...', '?': '##.|..#|.#.|...|.#.',
};
// Solid pixels merged into runs, for silkscreened labels.
function pixText(text, x, y, px) {
  let d = '';
  [...text].forEach((ch, i) => {
    if (ch === ' ') return;
    const g = F3[ch];
    if (!g) throw new Error(`no glyph ${JSON.stringify(ch)}`);
    g.split('|').forEach((row, ry) => {
      let run = -1;
      for (let rx = 0; rx <= row.length; rx++) {
        const lit = row[rx] === '#';
        if (lit && run < 0) run = rx;
        if (!lit && run >= 0) {
          d += `M${f2(x + i * 4 * px + run * px)} ${f2(y + ry * px)}h${f2((rx - run) * px)}v${f2(px)}h${f2(-(rx - run) * px)}z`;
          run = -1;
        }
      }
    });
  });
  return d;
}
const pixWidth = (text, px) => text.length * 4 * px - px;

// ------------------------------------------------------------------ shapes for the dot raster
// Everything printed on a banner is a shape in dot units, sampled at dot centres: a dot is
// struck where its centre falls inside, so every edge steps dot by dot like the real thing.
const inRect = (x0, y0, x1, y1) => (x, y) => x >= x0 && x <= x1 && y >= y0 && y <= y1;
function inRRect(x0, y0, x1, y1, r) { // r: one radius or [tl, tr, br, bl]
  const [tl, tr, br, bl] = Array.isArray(r) ? r : [r, r, r, r];
  return (x, y) => {
    if (x < x0 || x > x1 || y < y0 || y > y1) return false;
    const corner = (cx, cy, rr) => (x - cx) ** 2 + (y - cy) ** 2 <= rr * rr;
    if (tl && x < x0 + tl && y < y0 + tl) return corner(x0 + tl, y0 + tl, tl);
    if (tr && x > x1 - tr && y < y0 + tr) return corner(x1 - tr, y0 + tr, tr);
    if (br && x > x1 - br && y > y1 - br) return corner(x1 - br, y1 - br, br);
    if (bl && x < x0 + bl && y > y1 - bl) return corner(x0 + bl, y1 - bl, bl);
    return true;
  };
}
function inPoly(pts) {
  return (x, y) => {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  };
}
const distSeg = (x, y, ax, ay, bx, by) => {
  const dx = bx - ax, dy = by - ay;
  const t = clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1), 0, 1);
  return Math.hypot(x - (ax + t * dx), y - (ay + t * dy));
};
const inCapsule = (ax, ay, bx, by, r) => (x, y) => distSeg(x, y, ax, ay, bx, by) <= r;
const onPolyline = (pts, r, closed = true) => (x, y) => {
  const n = pts.length;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % n];
    if (distSeg(x, y, ax, ay, bx, by) <= r) return true;
  }
  return false;
};
const inCircle = (cx, cy, r) => (x, y) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
const inRing = (cx, cy, r0, r1) => (x, y) => { const d = Math.hypot(x - cx, y - cy); return d >= r0 && d <= r1; };
const union = (...fs) => (x, y) => fs.some((f) => f(x, y));
const minus = (a, ...bs) => (x, y) => a(x, y) && !bs.some((b) => b(x, y));
const inter = (...fs) => (x, y) => fs.every((f) => f(x, y));
const flipY = (f, h) => (x, y) => f(x, h - y);

// ------------------------------------------------------------------ the banner face
// An original heavy condensed face, 28 dots tall, drawn for this header (MediaLog's own
// headings are heavy and condensed; no font is copied).
const GH = 28;
const M_SHAPE = inPoly([[0, 28], [0, 0], [6.6, 0], [10.5, 11.5], [14.4, 0], [21, 0], [21, 28], [15, 28], [15, 12], [12.4, 20.5], [8.6, 20.5], [6, 12], [6, 28]]);
const GLYPHS = {
  M: { w: 21, shape: M_SHAPE },
  W: { w: 21, shape: flipY(M_SHAPE, 28) },
  E: { w: 16, shape: union(inRect(0, 0, 6, 28), inRect(0, 0, 16, 5.5), inRect(0, 11.5, 14, 16.5), inRect(0, 22.5, 16, 28)) },
  D: { w: 18, shape: minus(inRRect(0, 0, 18, 28, [0, 8, 8, 0]), inRRect(6, 5.5, 12, 22.5, [0, 3, 3, 0])) },
  I: { w: 6, shape: inRect(0, 0, 6, 28) },
  A: { w: 19, shape: minus(inPoly([[0, 28], [4.6, 0], [14.4, 0], [19, 28], [12.9, 28], [12.2, 22.5], [6.8, 22.5], [6.1, 28]]), inPoly([[7.4, 17.5], [8.9, 5.5], [10.1, 5.5], [11.6, 17.5]])) },
  L: { w: 15, shape: union(inRect(0, 0, 6, 28), inRect(0, 22.5, 15, 28)) },
  O: { w: 18, shape: minus(inRRect(0, 0, 18, 28, 7.5), inRRect(6, 5.5, 12, 22.5, 2.5)) },
  G: { w: 18, shape: union(minus(inRRect(0, 0, 18, 28, 7.5), inRRect(6, 5.5, 12, 22.5, 2.5), inRect(11.5, 8, 18.5, 14.5)), inRect(9, 14.5, 18, 19.5)) },
  T: { w: 18, shape: union(inRect(0, 0, 18, 5.5), inRect(6, 0, 12, 28)) },
  C: { w: 17, shape: inter(inRRect(0, 0, 17, 28, 7.5), union(inRect(0, 0, 6, 28), inRect(0, 0, 17, 5.5), inRect(0, 22.5, 17, 28), inRect(11.5, 0, 17, 9), inRect(11.5, 19, 17, 28))) },
  H: { w: 18, shape: union(inRect(0, 0, 6, 28), inRect(12, 0, 18, 28), inRect(0, 11.5, 18, 16.5)) },
  R: { w: 18, shape: union(inRect(0, 0, 6, 28), minus(inRRect(0, 0, 17.5, 17.5, [0, 7, 7, 0]), inRRect(6, 5.5, 11.5, 12, [0, 2.5, 2.5, 0])), inPoly([[7, 14], [13, 14], [18, 28], [11.8, 28]])) },
  P: { w: 17, shape: union(inRect(0, 0, 6, 28), minus(inRRect(0, 0, 17, 18, [0, 7, 7, 0]), inRRect(6, 5.5, 11, 12.5, [0, 2.5, 2.5, 0]))) },
  Y: { w: 19, shape: union(inPoly([[0, 0], [6.2, 0], [9.5, 8.5], [12.8, 0], [19, 0], [12.5, 16.5], [6.5, 16.5]]), inRect(6.5, 14, 12.5, 28)) },
  S: { w: 17, shape: inter(inRRect(0, 0, 17, 28, 7), union(inRect(0, 0, 17, 5.5), inRect(11.5, 0, 17, 9), inRect(0, 0, 6, 16.5), inRect(0, 11.5, 17, 16.5), inRect(11, 11.5, 17, 28), inRect(0, 22.5, 17, 28), inRect(0, 19, 5.5, 28))) },
  N: { w: 18, shape: union(inRect(0, 0, 6, 28), inRect(12, 0, 18, 28), inPoly([[0, 0], [6.6, 0], [18, 28], [11.4, 28]])) },
  ' ': { w: 4, shape: () => false },
};
const KERN = 3;
const wordWidth = (w) => sum([...w].map((ch) => GLYPHS[ch].w)) + KERN * (w.length - 1);

// ------------------------------------------------------------------ pictograms (24 x 28 dots)
const PIC_W = 24;
// MediaLog's mark: an open book, a play triangle on the left page, a pen on the right page.
const PIC_MARK = union(
  onPolyline([[1.4, 5.6], [6, 5.1], [11.3, 6.9], [11.3, 23.2], [6, 21.6], [1.4, 22.1]], 0.95),
  onPolyline([[12.7, 6.9], [18, 5.1], [22.6, 5.6], [22.6, 22.1], [18, 21.6], [12.7, 23.2]], 0.95),
  onPolyline([[0.3, 22.6], [0.3, 24.8], [11, 26.6], [13, 26.6], [23.7, 24.8], [23.7, 22.6]], 0.85, false),
  inPoly([[3.6, 10.4], [3.6, 19], [9.4, 14.7]]),
  inCapsule(15.4, 18.8, 22.6, 2.6, 1.45),
  inPoly([[13.4, 22.2], [14, 18.6], [16.3, 19.7]]),
  (x, y) => y > 9.5 && y < 10.6 && x > 14 && x < 17.2,
  (x, y) => y > 12.6 && y < 13.7 && x > 14 && x < 15.6,
);
// a heart, with a little shine left unprinted
const PIC_HEART = minus(
  union(inCircle(7.2, 10, 5.9), inCircle(16.8, 10, 5.9), inPoly([[1.4, 11.8], [22.6, 11.8], [12, 24.6]])),
  inCapsule(5.2, 10.4, 7.6, 7.4, 0.75),
);
// WATCHED: a striped popcorn bucket, popcorn heaped over the rim
const PIC_POPCORN = (() => {
  const bucket = inPoly([[3.5, 12], [20.5, 12], [18, 27.5], [6, 27.5]]);
  const stripe = (x, y) => Math.floor((x - 3.5 + (y - 12) * 0.16) / 2.85) % 2 === 0;
  const rim = inter(bucket, (x, y) => y < 14.2);
  const outline = onPolyline([[3.5, 12], [20.5, 12], [18, 27.5], [6, 27.5]], 0.6);
  const puffs = [[5.2, 9.6, 3.1], [10, 7.6, 3.4], [15.2, 8.2, 3.3], [19.2, 10, 2.8], [7.6, 3.8, 2.7], [13, 3.1, 2.8], [17.6, 4.8, 2.2]];
  const puffRing = union(...puffs.map(([x, y, r]) => inRing(x, y, r - 0.85, r)));
  const puffFill = union(...puffs.map(([x, y, r]) => inCircle(x, y, r)));
  return union(outline, rim, inter(bucket, stripe), minus(puffRing, bucket), (x, y) => puffFill(x, y) && !bucket(x, y) && ((Math.floor(x) + Math.floor(y)) % 3 === 0));
})();
// READ: three books in a stack, a dot of daylight between them: solid covers, a pale band
// across each spine, and the page edges showing as stripes at one end
const book = (x0, y0, x1, y1, pagesRight) => minus(
  inRRect(x0, y0, x1, y1, 1),
  inRect(x0 + (pagesRight ? 4 : 9), y0 + 2, x0 + (pagesRight ? 7.5 : 12.5), y1 - 2),
  (x, y) => (pagesRight ? x > x1 - 4.2 && x < x1 - 0.8 : x > x0 + 0.8 && x < x0 + 4.2) && y > y0 + 0.9 && y < y1 - 0.9 && Math.floor(y - y0) % 2 === 1,
);
const PIC_BOOKS = union(book(0.5, 20, 23.5, 27, true), book(3, 12.5, 21.5, 19, false), book(1.5, 5, 19, 11.5, true));
// PLAYED: a game pad, the d-pad and two buttons left unprinted
const PIC_PAD = minus(
  union(inRRect(1.5, 9.5, 22.5, 20.5, 5), inCircle(6, 20, 4.2), inCircle(18, 20, 4.2)),
  inRect(4, 13.6, 9, 15.4), inRect(5.6, 12, 7.4, 17), inCircle(16, 13.6, 1.25), inCircle(19, 16.3, 1.25),
  inRect(10.6, 12.6, 13.4, 13.5),
);
// LISTENED TO: headphones
const PIC_PHONES = union(
  inter(inRing(12, 15.5, 8.6, 11), (x, y) => y < 16),
  inRRect(1, 14, 6.6, 26, 2), inRRect(17.4, 14, 23, 26, 2),
  inRect(6.6, 16.5, 8, 23.5), inRect(16, 16.5, 17.4, 23.5),
);

// ------------------------------------------------------------------ colours
// kind colours, sampled from the app (close, not exact)
const KIND = {
  movies: '#c23b3b', tv: '#2879b8', books: '#a96d12', comics: '#b8327f', games: '#5f8a14',
  podcasts: '#6c44bf', music: '#0e8a73', videos: '#5a2d4f',
};
// rainbow fan-fold: four tints, sheet after sheet
const NAVY = '#18223a';
const PAPER = ['#f6d5d2', '#d3e4f4', '#f6e6b4', '#dcebc6'];
const INK = '#1b2236', INK_FADE = '#5a6178';

// ------------------------------------------------------------------ geometry
const VB_W = 1280, VB_H = 466;
const P = 4; // dot pitch, user units
const S = 196; // one sheet, 11 inches along the banner: 49 dots
const W = 170; // paper width, sprocket strips included (9.5 inches)
const SW = 16; // sprocket strip
const DOT_Y = 29; // top of dot row 0, from the paper's top edge
const PASS = 7; // dot columns per head pass
const PASS_W = PASS * P; // 28
const XH = 22, YH = 22; // the MEDIALOG banner on the desk
const XE = 1010; // where the paper comes out of the printer
const Y0 = 238; // top edge of the paper in the printer
const HX = 1052; // the print line, centre of the head
const BAND_X0 = HX - PASS_W / 2, BAND_X1 = HX + PASS_W / 2; // 1038..1066
const SWEEP_Y0 = Y0 + 22, SWEEP_Y1 = Y0 + 148; // head travel across the paper
const HB = SWEEP_Y1 - SWEEP_Y0;
const LEAD_MIN = Math.ceil((BAND_X1 - XE) / P); // blank columns before anything is printed

// ------------------------------------------------------------------ the banners
// Each banner: sheets, and items laid out in dot columns from its torn left end.
function layout(nSheets, parts) {
  const cols = (nSheets * S) / P;
  const width = sum(parts.map((p) => p.w)) + sum(parts.map((p) => p.gap || 0));
  const free = cols - width - LEAD_MIN - 4;
  if (free < 0) throw new Error(`banner over by ${-free} columns`);
  let c = LEAD_MIN + Math.floor(free / 2);
  const items = [];
  for (const p of parts) {
    items.push({ ...p, c });
    c += p.w + (p.gap || 0);
  }
  return { nSheets, cols, items };
}
const pic = (shape, gap = 8) => ({ type: 'pic', shape, w: PIC_W, gap });
const word = (text, gap = 0) => ({ type: 'word', text, w: wordWidth(text), gap });
const HERO = layout(5, [pic(PIC_MARK, 9), word('MEDIALOG', 9), pic(PIC_HEART)]);
const VERBS = [
  { word: 'WATCHED', kind: 'MOVIES', ink: KIND.movies, b: layout(4, [pic(PIC_POPCORN, 7), word('WATCHED')]) },
  { word: 'READ', kind: 'BOOKS', ink: KIND.books, b: layout(3, [pic(PIC_BOOKS, 8), word('READ')]) },
  { word: 'PLAYED', kind: 'GAMES', ink: KIND.games, b: layout(4, [pic(PIC_PAD, 8), word('PLAYED')]) },
  { word: 'LISTENED TO', kind: 'MUSIC', ink: KIND.music, b: layout(5, [pic(PIC_PHONES, 8), word('LISTENED TO')]) },
];
const LEN = VERBS.map((v) => v.b.nSheets * S);
const CUM = [0]; // paper position of each verb banner's torn left end
for (const l of LEN) CUM.push(CUM[CUM.length - 1] + l);
const SHEETS_TOTAL = sum(VERBS.map((v) => v.b.nSheets));
if (SHEETS_TOTAL % PAPER.length) throw new Error('the paper colours must come round exactly');
const firstSheet = (k) => CUM[k] / S; // index of a verb banner's first sheet in the paper

// dots of a whole banner: solid letters and pictures, plus the offset halftone shadow
function bannerDots(b) {
  const solid = new Set(), shade = new Set();
  const stamp = (shape, c0, w, withShadow) => {
    for (let j = 0; j < GH + 2; j++) {
      for (let i = 0; i < w + 2; i++) {
        const x = i + 0.5, y = j + 0.5;
        if (j < GH && i < w && shape(x, y)) solid.add(`${c0 + i},${j}`);
        else if (withShadow && (c0 + i + j) % 2 === 0 && shape(x - 2, y - 2) && !shape(x, y)) shade.add(`${c0 + i},${j}`);
      }
    }
  };
  for (const it of b.items) {
    if (it.type === 'pic') stamp(it.shape, it.c, PIC_W, false);
    else {
      let c = it.c;
      for (const ch of it.text) {
        stamp(GLYPHS[ch].shape, c, GLYPHS[ch].w, true);
        c += GLYPHS[ch].w + KERN;
      }
    }
  }
  for (const k of solid) shade.delete(k);
  const toList = (set) => [...set].map((k) => k.split(',').map(Number));
  return { solid: toList(solid), shade: toList(shade) };
}

// Dots -> path data: vertical runs, one subpath per run, drawn with a dash pattern of
// zero-length dashes and round caps, so each run prints as a row of round dots. Grouped by
// head pass, so every pass gets its own ribbon shade and its own small misregistration.
const rnd = mulberry32(0x3ed1a106);
const SHADE = Array.from({ length: 64 }, (_, k) => 0.04 + rnd() * 0.12 + (k % 2) * 0.05);
function dotPaths(dots, step, colorFor, cls) {
  const cols = new Map();
  for (const [i, j] of dots) {
    if (!cols.has(i)) cols.set(i, []);
    cols.get(i).push(j);
  }
  const byPass = new Map();
  for (const [i, js] of [...cols.entries()].sort((a, b) => a[0] - b[0])) {
    js.sort((a, b) => a - b);
    const k = Math.floor(i / PASS);
    let d = byPass.get(k) || '';
    let r0 = js[0], prev = js[0];
    const flush = (a, b) => { d += `M${f1(i * P + P / 2)} ${f1(a * P + P / 2)}v${f2((b - a) * P + 0.02)}`; };
    for (let n = 1; n < js.length; n++) {
      if (js[n] === prev + step) { prev = js[n]; continue; }
      flush(r0, prev); r0 = prev = js[n];
    }
    flush(r0, prev);
    byPass.set(k, d);
  }
  let s = '';
  for (const [k, d] of byPass) s += `<path class="${cls}" stroke="${colorFor(k)}"${k % 2 ? ' transform="translate(0 .7)"' : ''} d="${d}"/>`;
  return s;
}
function bannerInk(b, ink, fadeTo) {
  const { solid, shade } = bannerDots(b);
  return dotPaths(shade, 2, (k) => mix(ink, fadeTo, 0.42 + SHADE[k % 64]), 'sd')
    + dotPaths(solid, 1, (k) => mix(ink, fadeTo, SHADE[(k + 7) % 64]), 'dt');
}

// ------------------------------------------------------------------ paper
// One sheet as a symbol: the sheet takes its colour from the <use>; strips, holes,
// perforations and the fold at its left edge are drawn over it. Folds alternate, mountain
// then valley. A torn end gets a sheet with no fold.
function sheetDefs() {
  const pitch = S / 16, r = 3.6;
  let holes = '';
  for (let k = 0; k < 16; k++) {
    const cx = (k + 0.5) * pitch;
    for (const cy of [SW / 2, W - SW / 2]) holes += `M${f2(cx - r)} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0z`;
  }
  const body = `<rect width="${S}" height="${W}"/>`
    + `<rect width="${S}" height="${SW}" fill="#fff" opacity=".3"/><rect y="${W - SW}" width="${S}" height="${SW}" fill="#fff" opacity=".3"/>`
    + `<path class="hl" d="${holes}"/>`
    + `<path class="pfh" d="M0 ${SW}h${S}M0 ${W - SW}h${S}"/>`;
  const fold = (g) => `<rect x="-10" width="20" height="${W}" fill="url(#${g})"/><path class="pfv" d="M0 0V${W}"/>`;
  const bowA = `<rect width="${S}" height="${W}" fill="url(#bowA)"/>`, bowB = `<rect width="${S}" height="${W}" fill="url(#bowB)"/>`;
  return `<g id="shA">${body}${bowA}${fold('crA')}</g><g id="shB">${body}${bowB}${fold('crB')}</g><g id="shE">${body}${bowA}</g>`;
}
// sheets n0..n1-1 of the paper, sheet n at x0 + n*S, coloured by n mod 4
function sheets(n0, n1, x0, y0, tornStart = false) {
  let s = '';
  for (let n = n0; n < n1; n++) {
    const id = tornStart && n === n0 ? 'shE' : n % 2 ? 'shB' : 'shA';
    s += `<use href="#${id}" x="${x0 + n * S}" y="${y0}" fill="${PAPER[n % PAPER.length]}"/>`;
  }
  return s;
}

// ------------------------------------------------------------------ timeline
const HOLD = 3.4; // the finished verb on the desk
const TEAR = 1.15; // torn off and carried away
const SWEEP = 0.16; // one pass of the head across the paper
const FEED = 0.05; // the feed between passes
const RET = 0.38; // the head goes home
const TAIL = 0.22;
const NP = LEN.map((l) => l / PASS_W); // passes per verb banner
const CYC = VERBS.map((v, k) => HOLD + TEAR + NP[(k + 1) % 4] * (SWEEP + FEED) + RET + TAIL);
const T0 = [0]; // start of each cycle
for (const c of CYC) T0.push(T0[T0.length - 1] + c);
const TT = T0[4]; // the whole loop
const printStart = (k) => T0[k] + HOLD + TEAR; // cycle k prints banner k+1
const passStart = (k, p) => printStart(k) + p * (SWEEP + FEED);
const pc = (t) => f3((t / TT) * 100) + '%';
const EPS = 0.002; // a near-instant jump, in seconds

function animCss() {
  const dur = `${f3(TT)}s`;
  let css = '';
  let feed = '0%{transform:translateX(0)}';
  let hd = `0%{transform:translateY(${SWEEP_Y0}px)}`;
  let rv = `0%{transform:translateY(${-HB}px)}`;
  let data = '0%{opacity:.18}';
  for (let k = 0; k < 4; k++) {
    const nb = (k + 1) % 4; // the banner printed in this cycle
    const base = LEN[0] - CUM[k + 1]; // strip position at the start of cycle k
    for (let p = 0; p < NP[nb]; p++) {
      const a = passStart(k, p), b = a + SWEEP, f = b + FEED / 2;
      feed += `${pc(f)}{transform:translateX(${base - (p + 1) * PASS_W}px)}`;
      const down = p % 2 === 0;
      hd += `${pc(a)}{transform:translateY(${down ? SWEEP_Y0 : SWEEP_Y1}px)}${pc(b)}{transform:translateY(${down ? SWEEP_Y1 : SWEEP_Y0}px)}`;
      const next = p + 1 < NP[nb] ? ((p + 1) % 2 === 0 ? -HB : HB) : -HB;
      rv += `${pc(a)}{transform:translateY(${down ? -HB : HB}px)}${pc(b)}{transform:translateY(0)}${pc(f - EPS)}{transform:translateY(0)}${pc(f)}{transform:translateY(${next}px)}`;
    }
    const end = passStart(k, NP[nb] - 1) + SWEEP + FEED;
    const endY = (NP[nb] - 1) % 2 === 0 ? SWEEP_Y1 : SWEEP_Y0;
    hd += `${pc(end)}{transform:translateY(${endY}px)}${pc(end + RET)}{transform:translateY(${SWEEP_Y0}px)}`;
    data += `${pc(printStart(k))}{opacity:1}${pc(end)}{opacity:.18}`;
  }
  feed += `100%{transform:translateX(${-CUM[4]}px)}`;
  hd += `100%{transform:translateY(${SWEEP_Y0}px)}`;
  rv += `100%{transform:translateY(${-HB}px)}`;
  data += '100%{opacity:.18}';
  css += `.feed{animation:feed ${dur} step-end infinite}@keyframes feed{${feed}}`;
  css += `.hd{animation:hd ${dur} linear infinite}@keyframes hd{${hd}}`;
  css += `.rv{animation:rv ${dur} linear infinite}@keyframes rv{${rv}}`;
  css += `.lpd{animation:lpd ${dur} step-end infinite}@keyframes lpd{${data}}`;
  // the keep clip, in paper coordinates: during cycle k only paper right of banner k's tear
  let keep = '0%{transform:translateX(0)}';
  for (let k = 1; k < 4; k++) keep += `${pc(T0[k])}{transform:translateX(${CUM[k + 1] - CUM[1]}px)}`;
  keep += `100%{transform:translateX(${CUM[4] - CUM[1]}px)}`;
  css += `.keep{animation:keep ${dur} step-end infinite}@keyframes keep{${keep}}`;
  // the torn copies: banner k lies on the desk in cycle k, then is lifted and carried off
  VERBS.forEach((v, k) => {
    const cx = XE - LEN[k] / 2, cy = Y0 + W / 2;
    const t = T0[k], h = t + HOLD, lift = h + 0.24, gone = h + TEAR;
    const vis = (on) => `opacity:${on ? 1 : 0}`;
    let kf = '';
    if (k === 0) kf += `0%{transform:none;${vis(1)};animation-timing-function:ease-out}`;
    else kf += `0%{transform:none;${vis(0)}}${pc(t - EPS)}{transform:none;${vis(0)}}${pc(t)}{transform:none;${vis(1)};animation-timing-function:ease-out}`;
    kf += `${pc(h)}{transform:none;${vis(1)};animation-timing-function:ease-out}`
      + `${pc(lift)}{transform:translate(-3px,-6px) rotate(-.5deg) scale(1.014);${vis(1)};animation-timing-function:ease-in}`
      + `${pc(gone)}{transform:translate(-50px,300px) rotate(3deg) scale(1.03);${vis(1)}}`
      + `${pc(gone + EPS)}{transform:none;${vis(0)}}100%{transform:none;${vis(0)}}`;
    css += `.tc${k}{transform-origin:${f1(cx)}px ${cy}px;animation:tc${k} ${dur} infinite}@keyframes tc${k}{${kf}}`;
    css += `.ts${k}{animation:ts${k} ${dur} infinite}@keyframes ts${k}{0%,${pc(h)}{transform:none;animation-timing-function:ease-out}${pc(lift)},100%{transform:translate(8px,10px)}}`;
    // VERB lamp k: lit while banner k prints and while it lies on the desk
    const on = k === 0 ? printStart(3) : printStart(k - 1), off = printStart(k);
    const lk = on < off
      ? `0%{opacity:.16}${pc(on)}{opacity:1}${pc(off)}{opacity:.16}100%{opacity:.16}`
      : `0%{opacity:1}${pc(off)}{opacity:.16}${pc(on)}{opacity:1}100%{opacity:1}`;
    css += `.vl${k}{animation:vl${k} ${dur} step-end infinite}@keyframes vl${k}{${lk}}`;
    // the pen ring round the same verb on the slip
    css += `.vr${k}{animation:vr${k} ${dur} step-end infinite}@keyframes vr${k}{${lk.replace(/opacity:.16/g, 'opacity:0')}}`;
  });
  return css;
}

// ------------------------------------------------------------------ the printer, from above
// Its back faces left (the paper comes out of the back), its front and panel face right.
const rr = (x0, y0, x1, y1, r) => `M${x0 + r} ${y0}H${x1 - r}Q${x1} ${y0} ${x1} ${y0 + r}V${y1 - r}Q${x1} ${y1} ${x1 - r} ${y1}H${x0 + r}Q${x0} ${y1} ${x0} ${y1 - r}V${y0 + r}Q${x0} ${y0} ${x0 + r} ${y0}Z`;
const PR = { x0: XE, x1: 1266, y0: Y0 - 40, y1: Y0 + W + 40 };
const WIN = { x0: 1024, x1: 1098, y0: Y0 - 30, y1: Y0 + W + 30 };
function printerBody() {
  const { x0, x1, y0, y1 } = PR;
  let s = '';
  s += `<rect x="${x0 + 9}" y="${y0 + 11}" width="${x1 - x0}" height="${y1 - y0}" rx="18" fill="#0a0f1d" opacity=".55"/>`;
  // platen knob on the far side
  s += `<rect x="1075" y="${y0 - 15}" width="22" height="19" rx="4" fill="#3b3a37"/>`;
  s += `<path d="${[0, 1, 2, 3, 4].map((k) => `M${1078 + k * 4} ${y0 - 13}v13`).join('')}" stroke="#25241f" stroke-width="1.6"/>`;
  s += `<rect x="1075" y="${y0 - 15}" width="22" height="2" rx="1" fill="#fff" opacity=".18"/>`;
  // the case, with the window cut out
  s += `<path d="${rr(x0, y0, x1, y1, 16)}${rr(WIN.x0, WIN.y0, WIN.x1, WIN.y1, 6)}" fill="url(#case)" fill-rule="evenodd"/>`;
  s += `<path d="${rr(x0 + 1, y0 + 1, x1 - 1, y1 - 1, 15)}" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="1.4"/>`;
  s += `<path d="${rr(x0, y0, x1, y1, 16)}" fill="none" stroke="#8d846e" stroke-opacity=".6" stroke-width="1"/>`;
  // the slot the paper comes out of
  s += `<rect x="${x0}" y="${Y0 - 7}" width="9" height="${W + 14}" fill="url(#slot)"/>`;
  s += `<rect x="${x0 + 9}" y="${Y0 - 7}" width="1.6" height="${W + 14}" fill="#fff" opacity=".4"/>`;
  // window rim
  s += `<path d="${rr(WIN.x0 - 2, WIN.y0 - 2, WIN.x1 + 2, WIN.y1 + 2, 8)}" fill="none" stroke="#9b917c" stroke-width="2.2"/>`;
  // vents
  let vents = '';
  for (let k = 0; k < 15; k++) vents += `M1112 ${y0 + 30 + k * 13}h40`;
  s += `<path d="${vents}" stroke="#b0a790" stroke-width="5.4" stroke-linecap="round"/><path d="${vents}" stroke="#6f6754" stroke-width="2.6" stroke-linecap="round" transform="translate(0 -.6)"/>`;
  // panel
  const px0 = 1164, px1 = 1256, py0 = y0 + 14, py1 = y1 - 14;
  s += `<rect x="${px0}" y="${py0}" width="${px1 - px0}" height="${py1 - py0}" rx="7" fill="#2a2b2e"/>`;
  s += `<rect x="${px0}" y="${py0}" width="${px1 - px0}" height="2" rx="1" fill="#000" opacity=".5"/>`;
  s += `<rect x="${px0}" y="${py1 - 1.4}" width="${px1 - px0}" height="1.4" rx=".7" fill="#fff" opacity=".22"/>`;
  const label = (t, x, y, fill = '#d9d2c1') => `<path d="${pixText(t, x, y, 1.5)}" fill="${fill}"/>`;
  const lamp = (x, y, col, cls, op = 1) => `<circle cx="${x}" cy="${y}" r="4.3" fill="#131313"/><circle${cls ? ` class="${cls}"` : ''} cx="${x}" cy="${y}" r="3.3" fill="${col}"${op < 1 ? ` opacity="${op}"` : ''}/><circle cx="${x - 1}" cy="${y - 1.2}" r="1" fill="#fff" opacity=".5"/>`;
  let ly = py0 + 15;
  for (const [t, col, cls] of [['POWER', '#7bdc6a', ''], ['ON LINE', '#7bdc6a', ''], ['DATA', '#ffb347', 'lpd']]) {
    s += lamp(px0 + 11, ly, col, cls, cls ? 0.18 : 1) + label(t, px0 + 20, ly - 3.5);
    ly += 16;
  }
  ly += 2;
  s += `<path d="M${px0 + 7} ${ly}h${px1 - px0 - 14}" stroke="#4a4b4f" stroke-width="1"/>`;
  ly += 8;
  s += label('VERB:', px0 + 7, ly, '#f1c76a') + label('PICK ONE', px0 + 40, ly, '#8f8a7e');
  ly += 17;
  VERBS.forEach((v, j) => {
    s += lamp(px0 + 11, ly, mix(v.ink, '#ffffff', 0.3), `vl${j}`, j === 0 ? 1 : 0.16) + label(v.word, px0 + 20, ly - 3.5);
    ly += 16;
  });
  ly += 4;
  [['VERB', 0], ['LF', 1], ['FF', 2]].forEach(([t, k]) => {
    const kx = px0 + 6 + k * 28, kw = 24;
    s += `<rect x="${kx}" y="${ly}" width="${kw}" height="18" rx="3" fill="#d9d2c0"/><rect x="${kx}" y="${ly + 14}" width="${kw}" height="4" rx="2" fill="#a59c86"/>`;
    s += `<path d="${pixText(t, kx + kw / 2 - pixWidth(t, 1.2) / 2, ly + 5, 1.2)}" fill="#5f5848"/>`;
  });
  return s;
}
// inside the window, over the paper: tractors, rail, platen, the head, the smoked cover
function windowParts() {
  let s = '';
  for (const ty of [Y0 - 5, Y0 + W - SW - 5]) {
    s += `<rect x="1027" y="${ty}" width="54" height="${SW + 10}" rx="5" fill="#26282d"/>`;
    s += `<rect x="1031" y="${ty + 3}" width="46" height="${SW + 4}" rx="3" fill="#3b3e45"/>`;
    s += `<path d="M1036 ${ty + 8}h36M1036 ${ty + 13}h36M1036 ${ty + 18}h36" stroke="#2b2d33" stroke-width="1.6"/>`;
  }
  s += `<rect x="1072" y="${WIN.y0}" width="7" height="${WIN.y1 - WIN.y0}" fill="url(#rod)"/>`;
  s += `<rect x="1085" y="${WIN.y0}" width="13" height="${WIN.y1 - WIN.y0}" fill="url(#platen)"/>`;
  s += `<g class="hd" transform="translate(0 ${SWEEP_Y0})">`
    + `<rect x="1037" y="-12" width="30" height="24" rx="3" fill="url(#headMetal)"/>`
    + `<path d="M1041 -7h22M1041 -3h22M1041 1h22M1041 5h22" stroke="#4b5058" stroke-width="1.5"/>`
    + `<rect x="1037" y="-12" width="30" height="1.6" rx=".8" fill="#fff" opacity=".5"/>`
    + `<rect x="1066" y="-8" width="12" height="16" rx="2" fill="#2a2c31"/>`
    + `</g>`;
  s += `<path d="${rr(WIN.x0, WIN.y0, WIN.x1, WIN.y1, 6)}" fill="#2b1f19" opacity=".36"/>`;
  s += `<path d="M${WIN.x0 + 8} ${WIN.y1}l26 ${-(WIN.y1 - WIN.y0)}h14l-26 ${WIN.y1 - WIN.y0}z" fill="#fff" opacity=".07"/>`;
  return s;
}

// ------------------------------------------------------------------ props on the desk
// a mug of tea, and torn-off sprocket strips (the bit everyone tore off and left lying about)
function mug(cx, cy) {
  let s = '';
  s += `<circle cx="${cx + 9}" cy="${cy + 11}" r="44" fill="#0a0f1d" opacity=".55"/>`;
  s += `<rect x="${cx + 30}" y="${cy - 11}" width="36" height="22" rx="11" fill="#0a0f1d" opacity=".5" transform="translate(9 11)"/>`;
  s += `<path d="M${cx + 34} ${cy - 10}h20a11 11 0 0 1 0 22h-20" fill="none" stroke="#e9e3d6" stroke-width="8"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="44" fill="#e9e3d6"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="44" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2" stroke-dasharray="60 400" transform="rotate(200 ${cx} ${cy})"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="36.5" fill="#c9c0ae"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="35" fill="url(#tea)"/>`;
  s += `<ellipse cx="${cx - 12}" cy="${cy - 13}" rx="13" ry="6" fill="#fff" opacity=".18" transform="rotate(-35 ${cx - 12} ${cy - 13})"/>`;
  // the tea bag's tag, hanging over the rim, in the Music colour
  s += `<path d="M${cx + 8} ${cy - 6}C${cx + 18} ${cy - 22} ${cx + 30} ${cy - 30} ${cx + 38} ${cy - 46}" fill="none" stroke="#efe9db" stroke-width="1.1"/>`;
  s += `<rect x="${cx + 31}" y="${cy - 66}" width="16" height="20" rx="1.5" fill="${KIND.music}" transform="rotate(14 ${cx + 39} ${cy - 56})"/>`;
  return s;
}
// a curl of torn-off strip: a band along a cubic curve with holes down the middle
function curl(p0, p1, p2, p3, fill, w = SW) {
  const bez = (t) => [0, 1].map((k) => (1 - t) ** 3 * p0[k] + 3 * (1 - t) ** 2 * t * p1[k] + 3 * (1 - t) * t * t * p2[k] + t ** 3 * p3[k]);
  const N = 60;
  const pts = Array.from({ length: N + 1 }, (_, i) => bez(i / N));
  const lenAcc = [0];
  for (let i = 1; i <= N; i++) lenAcc.push(lenAcc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const nrm = (i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(N, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy);
    return [-dy / l, dx / l];
  };
  const left = pts.map((p, i) => [p[0] + (nrm(i)[0] * w) / 2, p[1] + (nrm(i)[1] * w) / 2]);
  const right = pts.map((p, i) => [p[0] - (nrm(i)[0] * w) / 2, p[1] - (nrm(i)[1] * w) / 2]);
  const poly = [...left, ...right.slice().reverse()].map((p, i) => `${i ? 'L' : 'M'}${f1(p[0])} ${f1(p[1])}`).join('') + 'Z';
  let holes = '';
  const pitch = S / 16, total = lenAcc[N];
  for (let d = pitch / 2; d < total - 2; d += pitch) {
    const i = lenAcc.findIndex((v) => v >= d);
    const [x, y] = pts[Math.max(0, i)];
    holes += `M${f1(x - 3.6)} ${f1(y)}a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0 -7.2 0z`;
  }
  const tornEdge = left.map((p, i) => `${i ? 'L' : 'M'}${f1(p[0])} ${f1(p[1])}`).join('');
  return `<path d="${poly}" fill="#0a0f1d" opacity=".5" transform="translate(5 6)"/>`
    + `<path d="${poly}" fill="${fill}"/><path d="${tornEdge}" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="1" stroke-dasharray="2 2"/>`
    + `<path d="${holes}" fill="#101729"/>`;
}

// a torn-off piece of green-bar listing paper lying on the desk at the left of the verb
// line, line-printed with the line itself; someone keeps circling a different verb in pen,
// in step with the printer's VERB lamp
const SLIP = { x: 16, y: 252, w: 224, h: 140, rot: -2.4, px: 1.6, lp: 20, tx: 25, ty: 13 };
const SLIP_LINES = ['** JOB: THE LINE **', "EVERYTHING YOU'VE", 'WATCHED, READ,', 'PLAYED, LISTENED TO,', 'ON ONE TIMELINE.'];
const SLIP_RINGS = [[2, 0, 7], [2, 9, 4], [3, 0, 6], [3, 8, 11]]; // [line, first column, length] of each verb
function dotText(text, x, y, px) {
  let d = '';
  [...text].forEach((ch, k) => {
    if (ch === ' ') return;
    F5[ch].split('|').forEach((row, ry) => [...row].forEach((c, rx) => {
      if (c === '#') d += `M${f2(x + (k * 6 + rx) * px)} ${f2(y + ry * px)}h0`;
    }));
  });
  return d;
}
function slip() {
  const { x, y, w, h, rot, px, lp, tx, ty } = SLIP;
  const cx = x + w / 2, cy = y + h / 2;
  let s = `<rect x="${x + 7}" y="${y + 9}" width="${w}" height="${h}" fill="#0a0f1d" opacity=".5" transform="rotate(${rot} ${cx} ${cy})"/>`;
  s += `<g transform="rotate(${rot} ${cx} ${cy}) translate(${x} ${y})">`;
  s += `<rect width="${w}" height="${h}" fill="#f4f5ee"/>`;
  // green bars, two lines deep, under the text
  for (let b = 0; b * 2 * lp < h; b += 2) s += `<rect x="${SW}" y="${ty - 5 + b * 2 * lp}" width="${w - SW}" height="${Math.min(2 * lp, h - (ty - 5 + b * 2 * lp))}" fill="#dcefd6"/>`;
  s += `<rect width="${SW}" height="${h}" fill="#fff" opacity=".5"/>`;
  let holes = '';
  for (let k = 0; (k + 0.5) * (S / 16) < h; k++) holes += `M${SW / 2 - 3.6} ${f2((k + 0.5) * (S / 16))}a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0 -7.2 0z`;
  s += `<path class="hl" d="${holes}"/><path class="pfh" d="M${SW} 0V${h}"/>`;
  // the tear along the perforation at the bottom
  s += `<path d="M0 ${h}h${w}" stroke="#0a0f1d" stroke-opacity=".25" stroke-width="1" stroke-dasharray="2 2"/>`;
  SLIP_LINES.forEach((t, k) => {
    s += `<path class="sl" stroke-width="${f2(px * 1.05)}" stroke="${k ? mix(INK, INK_FADE, 0.1 + k * 0.1) : INK_FADE}" d="${dotText(t, tx, ty + k * lp, px)}"/>`;
  });
  // pen rings, one per verb, a little more than one turn each and slightly wobbly
  SLIP_RINGS.forEach(([line, c0, n], k) => {
    const ex = tx + c0 * 6 * px + (n * 6 * px - px) / 2, ey = ty + line * lp + 3.5 * px;
    const rx = (n * 6 * px) / 2 + 6, ry = 10.5;
    const a0 = -2.3 + k * 0.7;
    let d = '';
    for (let i = 0; i <= 48; i++) {
      const a = a0 + (i / 48) * Math.PI * 2 * 1.12;
      const g = 1 + 0.05 * Math.sin(a * 3 + k) + i * 0.0015;
      d += `${i ? 'L' : 'M'}${f1(ex + Math.cos(a) * rx * g)} ${f1(ey + Math.sin(a) * ry * g)}`;
    }
    s += `<path class="vr${k}" d="${d}" fill="none" stroke="${VERBS[k].ink}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"${k ? ' opacity="0"' : ''}/>`;
  });
  s += '</g>';
  return s;
}

// ------------------------------------------------------------------ the main SVG
function buildSvg() {
  // ink, defined once, used wherever a banner appears
  const inkDefs = `<g id="inkH">${bannerInk(HERO, INK, INK_FADE)}</g>`
    + VERBS.map((v, k) => `<g id="ink${k}">${bannerInk(v.b, v.ink, '#ffffff')}</g>`).join('');

  // The moving strip, in paper coordinates: banner 0's torn end is u = 0, and the strip's
  // origin sits at screen x XE - LEN[0] when the feed is at 0. It carries banners 1, 2, 3 and
  // banner 0 again, plus a sheet more paper behind them.
  const SX = XE - LEN[0];
  const n0 = VERBS[0].b.nSheets, lastSheet = SHEETS_TOTAL + VERBS[0].b.nSheets + 1;
  const stripSheets = sheets(n0, lastSheet, 0, 0);
  const stripInk = [1, 2, 3, 0].map((k, n) => `<use href="#ink${k}" x="${CUM[n + 1]}" y="${DOT_Y}"/>`).join('');
  const keepW = CUM[4] + LEN[0] + 2 * S;
  const inStrip = (inner, clip = true) => `<g class="feed"><g transform="translate(${SX} ${Y0})"${clip ? ' clip-path="url(#keepc)"' : ''}>${inner}</g></g>`;
  const moving = `<g clip-path="url(#deskc)">${inStrip(`<rect x="8" y="10" width="${keepW}" height="${W}" fill="#0a0f1d" opacity=".5"/>`)}</g>`
    + `<g clip-path="url(#paperc)">${inStrip(stripSheets)}</g>`
    + `<g clip-path="url(#printedc)">${inStrip(stripInk)}</g>`
    + `<g clip-path="url(#bandc)">${inStrip(stripInk, false)}</g>`
    + `<rect x="1080" y="${Y0}" width="18" height="${W}" fill="url(#curl)"/>`;

  // the torn copies, one per verb banner
  const torn = VERBS.map((v, k) => {
    const x = XE - LEN[k];
    return `<g class="tc${k}"${k ? ' opacity="0"' : ''}><rect class="ts${k}" x="${x + 8}" y="${Y0 + 10}" width="${LEN[k] - 8}" height="${W}" fill="#0a0f1d" opacity=".5"/>`
      + `<g transform="translate(${x} ${Y0})">${sheets(firstSheet(k), firstSheet(k) + v.b.nSheets, -CUM[k], 0, true)}<use href="#ink${k}" y="${DOT_Y}"/></g></g>`;
  }).join('');

  // the MEDIALOG banner, printed earlier
  const hero = `<rect x="${XH + 8}" y="${YH + 10}" width="${HERO.nSheets * S}" height="${W}" fill="#0a0f1d" opacity=".5"/>`
    + `<g transform="translate(${XH} ${YH})">${sheets(0, HERO.nSheets, 0, 0, true)}<use href="#inkH" y="${DOT_Y}"/></g>`;

  const props = slip() + mug(1146, 86)
    + curl([1024, 52], [1050, 6], [1086, 96], [1108, 24], PAPER[2])
    + curl([-20, 446], [60, 420], [150, 470], [250, 440], PAPER[1]);

  const defs = `<defs>
<clipPath id="panel"><rect width="${VB_W}" height="${VB_H}" rx="18"/></clipPath>
<clipPath id="deskc"><rect x="-10" y="-10" width="${XE + 10}" height="${VB_H + 20}"/></clipPath>
<clipPath id="paperc"><rect x="-10" y="-10" width="${1098 + 10}" height="${VB_H + 20}"/></clipPath>
<clipPath id="printedc"><rect x="-10" y="-10" width="${BAND_X0 + 10}" height="${VB_H + 20}"/></clipPath>
<clipPath id="bandc"><rect class="rv" x="${BAND_X0}" y="${SWEEP_Y0}" width="${PASS_W}" height="${HB}" transform="translate(0 ${-HB})"/></clipPath>
<clipPath id="keepc"><rect class="keep" x="${CUM[1]}" y="-60" width="${keepW}" height="${W + 120}"/></clipPath>
<radialGradient id="deskg" cx=".4" cy=".35" r=".9"><stop offset="0" stop-color="#24325c"/><stop offset=".55" stop-color="#1b2546"/><stop offset="1" stop-color="#121a33"/></radialGradient>
<linearGradient id="crA" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".5" stop-color="#000" stop-opacity=".1"/><stop offset=".5" stop-color="#fff" stop-opacity=".34"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="crB" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".3"/><stop offset=".5" stop-color="#000" stop-opacity=".09"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
<linearGradient id="bowA" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".05"/></linearGradient>
<linearGradient id="bowB" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".05"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".16"/></linearGradient>
<linearGradient id="case" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eee7d6"/><stop offset=".6" stop-color="#ded5c0"/><stop offset="1" stop-color="#ccc2a9"/></linearGradient>
<linearGradient id="slot" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a251d"/><stop offset="1" stop-color="#6b6250"/></linearGradient>
<linearGradient id="rod" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d7dbe0"/><stop offset=".5" stop-color="#8b9098"/><stop offset="1" stop-color="#4b4f55"/></linearGradient>
<linearGradient id="platen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1b1c1f"/><stop offset=".45" stop-color="#3a3c41"/><stop offset="1" stop-color="#121315"/></linearGradient>
<linearGradient id="headMetal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c9ced4"/><stop offset=".5" stop-color="#959ba3"/><stop offset="1" stop-color="#5a5f67"/></linearGradient>
<linearGradient id="curl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient>
<radialGradient id="tea" cx=".45" cy=".42" r=".6"><stop offset="0" stop-color="#9a6a42"/><stop offset=".8" stop-color="#7a4e2c"/><stop offset="1" stop-color="#5e3a20"/></radialGradient>
${sheetDefs()}
${inkDefs}
</defs>`;

  const style = `
.pfv{stroke:#000;stroke-opacity:.2;stroke-width:1;stroke-dasharray:3 2.5;fill:none}
.pfh{stroke:#000;stroke-opacity:.15;stroke-width:.9;stroke-dasharray:2 2;fill:none}
.hl{fill:#101729}
.sl{fill:none;stroke-linecap:round}
.dt{fill:none;stroke-linecap:round;stroke-width:4.5;stroke-dasharray:0 4}
.sd{fill:none;stroke-linecap:round;stroke-width:3.3;stroke-dasharray:0 8}
${animCss()}
@media (prefers-reduced-motion:reduce){.feed,.hd,.rv,.lpd,.keep,[class^=tc],[class^=ts],[class^=vl],[class^=vr]{animation:none!important}}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB_W} ${VB_H}" width="${VB_W}" height="${VB_H}" role="img" aria-label="MEDIALOG printed as a home banner on rainbow fan-fold paper, and a dot-matrix printer below it printing the verbs WATCHED, READ, PLAYED and LISTENED TO">
<title>MEDIALOG, printed in banner mode</title>
<desc>Seen from above, on a navy desk. Across the top, a home banner reading MEDIALOG in giant dot-matrix letters, printed sideways across five joined sheets of fan-fold paper in pink, sky blue, canary and mint, with sprocket holes along both edges and perforations between the sheets, MediaLog's mark (an open book with a play triangle and a pen) at the left end and a heart at the right. Below it a dot-matrix printer with a VERB selector prints the next banner: WATCHED in red with popcorn, then READ in amber with a stack of books, PLAYED in green with a game pad, and LISTENED TO in teal with headphones, each torn off and carried away before the next. At the left of the verb, a torn-off slip of green-bar listing paper reads EVERYTHING YOU'VE WATCHED, READ, PLAYED, LISTENED TO, ON ONE TIMELINE, with the current verb circled in pen. A mug of tea and torn-off sprocket strips lie on the desk.</desc>
<style>${style}</style>
${defs}
<g clip-path="url(#panel)">
<rect width="${VB_W}" height="${VB_H}" fill="url(#deskg)"/>
${props}
${hero}
<rect x="${WIN.x0}" y="${WIN.y0}" width="${WIN.x1 - WIN.x0}" height="${WIN.y1 - WIN.y0}" fill="#17181b"/>
${moving}
${printerBody()}
${windowParts()}
${torn}
</g>
<rect x=".75" y=".75" width="${VB_W - 1.5}" height="${VB_H - 1.5}" rx="17.25" fill="none" stroke="#fff" stroke-opacity=".08" stroke-width="1.5"/>
</svg>
`;
}

// ------------------------------------------------------------------ the card file
// The log as a deck of 80-column cards in a drawer: one card per entry, a stripe in the
// entry's kind colour, the entry keypunched along the top edge and punched in the standard
// 12-row card code. Navy guide cards with tabs file it five years at a time, and a "sometime
// in" card simply has its date columns left unpunched. Cards are numbered in tens, the old
// way, so there is room to file more in between. The card face, the field layout and the
// drawer are invented; no computer maker's card form is copied.

// 5x7 capitals for the keypunch's printing (adapted from the 5x7 face in the castaway set),
// plus a heart and a thumbs-up for the two stock reactions.
const F5 = {
  A: '.###.|#...#|#...#|#####|#...#|#...#|#...#', B: '####.|#...#|#...#|####.|#...#|#...#|####.',
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
  Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..', Z: '#####|....#|...#.|..#..|.#...|#....|#####',
  0: '.###.|#...#|#..##|#.#.#|##..#|#...#|.###.', 1: '..#..|.##..|..#..|..#..|..#..|..#..|.###.',
  2: '.###.|#...#|....#|...#.|..#..|.#...|#####', 3: '#####|...#.|..#..|...#.|....#|#...#|.###.',
  4: '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.', 5: '#####|#....|####.|....#|....#|#...#|.###.',
  6: '..##.|.#...|#....|####.|#...#|#...#|.###.', 7: '#####|....#|...#.|..#..|.#...|.#...|.#...',
  8: '.###.|#...#|#...#|.###.|#...#|#...#|.###.', 9: '.###.|#...#|#...#|.####|....#|...#.|.##..',
  '.': '.....|.....|.....|.....|.....|.##..|.##..', ',': '.....|.....|.....|.....|.##..|.##..|.#...',
  ':': '.....|.##..|.##..|.....|.##..|.##..|.....', '-': '.....|.....|.....|.###.|.....|.....|.....',
  '*': '.....|..#..|#.#.#|.###.|#.#.#|..#..|.....', "'": '..#..|..#..|.#...|.....|.....|.....|.....',
  '?': '.###.|#...#|....#|...#.|..#..|.....|..#..', '/': '....#|....#|...#.|..#..|.#...|#....|#....',
  '&': '.##..|#..#.|#.#..|.#...|#.#.#|#..#.|.##.#', '(': '...#.|..#..|.#...|.#...|.#...|..#..|...#.', ')': '.#...|..#..|...#.|...#.|...#.|..#..|.#...',
  '♥': '.....|.#.#.|#####|#####|.###.|..#..|.....', // loved
  '☝': '..#..|..#..|.##..|#####|#####|#####|.####', // liked: a thumb up
  '☺': '.###.|#####|#.#.#|#####|#...#|##.##|.###.', // a custom verdict's little face
};
// the 12-row card code: zone rows 12, 11, 0 and digit rows 0-9
const HOL = { ' ': [] };
[...'ABCDEFGHI'].forEach((ch, i) => { HOL[ch] = [12, i + 1]; });
[...'JKLMNOPQR'].forEach((ch, i) => { HOL[ch] = [11, i + 1]; });
[...'STUVWXYZ'].forEach((ch, i) => { HOL[ch] = [0, i + 2]; });
[...'0123456789'].forEach((ch, i) => { HOL[ch] = [i]; });
Object.assign(HOL, { '-': [11], '&': [12], '/': [0, 1], '.': [12, 3, 8], ',': [0, 3, 8], ':': [2, 8], "'": [5, 8], '*': [11, 4, 8], '?': [0, 7, 8], '(': [12, 5, 8], ')': [11, 5, 8] });
// the reactions are not in the card code, so they print but punch nothing

const CARD_COLS = (fields) => fields.map(([t, w, right]) => (right ? t.padStart(w) : t.padEnd(w)).slice(0, w)).join(' ');
// fields fill columns 1-71; column 72 is left blank so the sequence number (73-80) stands clear
const entry = (year, date, kind, title, by, how) => CARD_COLS([[year, 4], [date, 6, true], [kind, 7], [title, 20], [by, 14], [how, 15]]) + ' ';
const stars = (s, n = 71) => { const k = n - s.length; return '*'.repeat(Math.floor(k / 2)) + s + '*'.repeat(k - Math.floor(k / 2)) + ' '; };
const DECK = [
  { guide: '2025-2029', tab: 0, line: stars(' 2025-2029 ***** 2 CARDS ***** FIVE YEARS PER DIVIDER '), seq: 'MLOG0010' },
  { kind: KIND.tv, line: entry('2026', '21 MAR', 'TV SHOW', 'GENTLE ROUNDABOUTS', 'M. FENNIMORE', 'S2 E1-10 ♥'), seq: 'MLOG0020' },
  { kind: KIND.books, line: entry('2026', 'FEB', 'BOOK', 'QUEUEING: A HISTORY', 'DR P. HALLOWAY', 'AUDIOBOOK ☝'), seq: 'MLOG0030' },
  { guide: '2015-2019', tab: 1, line: stars(' 2015-2019 ***** 1 CARD ***** AND SOMETIME IN, BEHIND '), seq: 'MLOG0040' },
  { kind: KIND.movies, line: entry('2016', '12 NOV', 'MOVIE', 'THE KETTLE THAT KNEW', 'A. OKONJO-PELL', '☺ GLORIOUS MESS'), seq: 'MLOG0050' },
  { guide: 'SOMETIME IN 2015-2019', tab: 2, line: stars(' SOMETIME IN 2015-2019 ***** DATE: ROUGHLY '), seq: 'MLOG0060' },
  { kind: KIND.games, line: entry('', '', 'GAME', 'TIDY THE MOON', 'WOBBLY SHELF', '☝'), seq: 'MLOG0070' },
];
for (const c of DECK) if ((c.line + c.seq).length !== 80) throw new Error(`card is ${(c.line + c.seq).length} columns: ${c.line}`);

function buildCards() {
  const VW = 1200;
  const CW = 1080, U = CW / 7.375, CH = 3.25 * U; // the card, 7 3/8 x 3 1/4 inches
  const XC = 60, TOP = 34, D = 50, TAB_H = 24;
  const colX = (c) => 0.251 * U + (c - 1) * 0.087 * U; // column centres, c = 1..80
  const rowY = (r) => (r === 12 ? 0.25 : r === 11 ? 0.5 : 0.75 + 0.25 * r) * U; // row centres
  const HW = 0.055 * U, HHt = 0.125 * U;
  const CUT_X = 30, CUT_Y = 44;
  const FRONT_VIS = rowY(1) - 6; // how much of the front card shows above the drawer
  const yCard = (i) => TOP + i * D;
  const DRAWER_Y = yCard(DECK.length - 1) + FRONT_VIS;
  const VH = Math.round(DRAWER_Y + 96);
  const MANILA = '#f2e6c6';
  const GUIDE = '#26355e';
  const TABS = [{ x: 70, w: 250 }, { x: 420, w: 250 }, { x: 640, w: 380 }];

  // glyphs once, as dot paths (zero-length segments with round caps)
  const pitch = 1.72;
  const used = new Set(DECK.flatMap((c) => [...(c.line + c.seq + (c.guide || ''))]).concat([...'EVERYTHING']));
  let glyphDefs = '';
  const gid = (ch) => 'g' + ch.codePointAt(0).toString(16);
  for (const ch of used) {
    if (ch === ' ') continue;
    const g = F5[ch];
    if (!g) throw new Error(`no 5x7 glyph ${JSON.stringify(ch)}`);
    let d = '';
    g.split('|').forEach((row, y) => [...row].forEach((c, x) => { if (c === '#') d += `M${f2(x * pitch)} ${f2(y * pitch)}h0`; }));
    glyphDefs += `<path id="${gid(ch)}" d="${d}"/>`;
  }
  const printLine = (text, y0) => [...text].map((ch, i) => (ch === ' ' ? '' : `<use href="#${gid(ch)}" x="${f2(colX(i + 1) - 2 * pitch)}" y="${f2(y0)}"/>`)).join('');

  // one card's outline, in card coordinates (top-left corner cut); guides get a tab
  const outline = (tab) => {
    if (tab === undefined) return `M${CUT_X} 0H${CW - 6}Q${CW} 0 ${CW} 6V${CH - 6}Q${CW} ${CH} ${CW - 6} ${CH}H6Q0 ${CH} 0 ${CH - 6}V${CUT_Y}Z`;
    const { x: tx, w: tw } = TABS[tab];
    const y = TAB_H; // the shoulder
    return `M${CUT_X} ${y}H${tx}V8Q${tx} 0 ${tx + 8} 0H${tx + tw - 8}Q${tx + tw} 0 ${tx + tw} 8V${y}H${CW - 6}Q${CW} ${y} ${CW} ${y + 6}V${CH + y - 6}Q${CW} ${CH + y} ${CW - 6} ${CH + y}H6Q0 ${CH + y} 0 ${CH + y - 6}V${y + CUT_Y}Z`;
  };
  const holesFor = (text, yOff) => {
    let d = '';
    [...text].forEach((ch, i) => {
      for (const r of HOL[ch] || []) d += `M${f2(colX(i + 1) - HW / 2)} ${f2(yOff + rowY(r) - HHt / 2)}h${f2(HW)}v${f2(HHt)}h${f2(-HW)}z`;
    });
    return d;
  };

  let deck = '';
  DECK.forEach((c, i) => {
    const y = yCard(i);
    const guide = c.guide !== undefined;
    const yOff = guide ? TAB_H : 0; // where the card's own top edge is
    const text = c.line + c.seq;
    const ol = outline(guide ? c.tab : undefined);
    let g = `<g transform="translate(${XC} ${y})">`;
    g += `<path d="${ol}" fill="#0a0f1d" opacity=".35" transform="translate(0 -3)"/>`;
    g += `<path d="${ol}" fill="${guide ? GUIDE : 'url(#manila)'}"/>`;
    if (!guide) g += `<path d="M${CUT_X + 1.5} 0H${CW - 6}Q${CW} 0 ${CW} 6V7H${CUT_X + 4.8}Z" fill="${c.kind}"/>`;
    else g += `<path d="M${CUT_X + 1} ${yOff + 1.2}H${CW - 3}" stroke="#9fb0d6" stroke-opacity=".5" stroke-width="1.2"/>`;
    g += `<path d="${holesFor(text, yOff)}" fill="${guide ? '#0d1424' : '#3b3225'}" opacity="${guide ? 0.9 : 0.62}"/>`;
    g += `<g fill="none" stroke="${guide ? '#f1e6c9' : '#25232a'}" stroke-linecap="round" stroke-width="1.55">${printLine(text, yOff + 9)}</g>`;
    if (guide) {
      const { x: tx, w: tw } = TABS[c.tab];
      const lab = c.guide, p2 = 2.25, w = lab.length * 6 * p2 - p2;
      g += `<g transform="translate(${f2(tx + tw / 2 - w / 2)} 5.2) scale(${f3(p2 / pitch)})" fill="none" stroke="#f6d08a" stroke-linecap="round" stroke-width="1.45">${[...lab].map((ch, k) => (ch === ' ' ? '' : `<use href="#${gid(ch)}" x="${f2(k * 6 * pitch)}"/>`)).join('')}</g>`;
    }
    g += '</g>';
    deck += g;
  });

  // the front card shows its face: preprinted digits in the rows, column numbers
  const front = DECK[DECK.length - 1];
  const fy = yCard(DECK.length - 1);
  const T3 = { 0: '###|#.#|#.#|#.#|###', 1: '.#.|##.|.#.|.#.|###', 2: '###|..#|###|#..|###', 3: '###|..#|.##|..#|###', 4: '#.#|#.#|###|..#|..#', 5: '###|#..|###|..#|###', 6: '###|#..|###|#.#|###', 7: '###|..#|.#.|.#.|.#.', 8: '###|#.#|###|#.#|###', 9: '###|#.#|###|..#|###' };
  const t3 = (id, ch, s) => { let p = ''; T3[ch].split('|').forEach((row, ry) => [...row].forEach((c, rx) => { if (c === '#') p += `M${f2(rx * s)} ${f2(ry * s)}h${f2(s)}v${f2(s)}h${f2(-s)}z`; })); return `<path id="${id}" d="${p}"/>`; };
  let digitDefs = '';
  for (let k = 0; k <= 9; k++) digitDefs += t3(`t${k}`, String(k), 1.3) + t3(`n${k}`, String(k), 0.8);
  let faceDigits = '';
  const punched = new Set();
  [...(front.line + front.seq)].forEach((ch, i) => { for (const r of HOL[ch] || []) punched.add(`${i + 1}:${r}`); });
  for (const r of [0, 1]) {
    for (let c = 1; c <= 80; c++) {
      if (punched.has(`${c}:${r}`)) continue;
      faceDigits += `<use href="#t${r}" x="${f2(colX(c) - 1.95)}" y="${f2(rowY(r) - 3.25)}"/>`;
    }
  }
  let colNums = '';
  for (let c = 1; c <= 80; c++) {
    const sN = String(c), w = sN.length * 3.2 - 0.8;
    [...sN].forEach((ch, k) => { colNums += `<use href="#n${ch}" x="${f2(colX(c) - w / 2 + k * 3.2)}" y="${f2(rowY(0) + 11.5)}"/>`; });
  }
  // field rules and names, preprinted in the stripe colour on the front card
  const fieldStarts = [1, 6, 13, 21, 42, 57, 73];
  const fieldNames = ['YEAR', 'DATE', 'KIND', 'TITLE', 'BY', 'HOW IT WAS', 'SEQ'];
  let rules = '', fieldLab = '';
  fieldStarts.forEach((c, k) => {
    const x = colX(c) - 0.0435 * U;
    if (k) rules += `M${f2(x)} ${f2(rowY(12) - 15)}V${f2(rowY(1) + 12)}`;
    fieldLab += `<path d="${pixText(fieldNames[k], x + 3.5, rowY(11) - 17, 1.6)}"/>`;
  });
  const frontFace = `<g transform="translate(${XC} ${fy})"><g fill="#a3916b" opacity=".75">${faceDigits}${colNums}</g>`
    + `<path d="${rules}" stroke="${front.kind}" stroke-width=".9" stroke-dasharray="3 2" opacity=".75"/><g fill="${front.kind}" opacity=".85">${fieldLab}</g></g>`;

  // the drawer: two side walls and a front with a label, a pull and a key to the colours
  const dx0 = 24, dx1 = VW - 24;
  const sideTop = yCard(0) + 40;
  let drawer = '';
  drawer += `<rect x="${dx0}" y="${sideTop}" width="${XC - dx0 - 4}" height="${DRAWER_Y - sideTop}" fill="url(#woodSide)"/>`;
  drawer += `<rect x="${XC + CW + 4}" y="${sideTop}" width="${dx1 - XC - CW - 4}" height="${DRAWER_Y - sideTop}" fill="url(#woodSideR)"/>`;
  drawer += `<rect x="${dx0}" y="${sideTop}" width="${XC - dx0 - 4}" height="3" fill="#e2b77f" opacity=".7"/><rect x="${XC + CW + 4}" y="${sideTop}" width="${dx1 - XC - CW - 4}" height="3" fill="#e2b77f" opacity=".7"/>`;
  const fy0 = DRAWER_Y, fh = 78;
  drawer += `<rect x="${dx0 + 8}" y="${fy0 + 10}" width="${dx1 - dx0}" height="${fh}" rx="9" fill="#0a0f1d" opacity=".55"/>`;
  drawer += `<rect x="${dx0}" y="${fy0}" width="${dx1 - dx0}" height="${fh}" rx="9" fill="url(#woodFront)"/>`;
  let grain = '';
  const gr = mulberry32(0x6a1e);
  for (let k = 0; k < 9; k++) {
    const yy = fy0 + 8 + k * 7.6 + gr() * 3;
    grain += `M${dx0 + 6} ${f1(yy)}C${f1(dx0 + 300 + gr() * 100)} ${f1(yy - 3 + gr() * 6)} ${f1(dx0 + 700 + gr() * 100)} ${f1(yy + 4 - gr() * 6)} ${dx1 - 6} ${f1(yy + gr() * 2)}`;
  }
  drawer += `<path d="${grain}" fill="none" stroke="#6b4423" stroke-opacity=".28" stroke-width="1.1"/>`;
  drawer += `<rect x="${dx0}" y="${fy0}" width="${dx1 - dx0}" height="2.5" rx="1.2" fill="#f0c48b" opacity=".75"/>`;
  // label holder
  const lw = 230, lh = 40, lx = VW / 2 - lw / 2, ly = fy0 + 10;
  drawer += `<rect x="${lx - 5}" y="${ly - 5}" width="${lw + 10}" height="${lh + 10}" rx="4" fill="url(#brass)"/><rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" fill="#f5eedb"/>`;
  const lab = 'EVERYTHING', p3 = 2.6, lwid = lab.length * 6 * p3 - p3;
  drawer += `<g transform="translate(${f2(VW / 2 - lwid / 2)} ${ly + 11}) scale(${f3(p3 / pitch)})" fill="none" stroke="${NAVY}" stroke-linecap="round" stroke-width="1.5">${[...lab].map((ch, k) => `<use href="#${gid(ch)}" x="${f2(k * 6 * pitch)}"/>`).join('')}</g>`;
  drawer += `<rect x="${lx - 5}" y="${ly - 5}" width="${lw + 10}" height="3" fill="#fff" opacity=".35"/>`;
  // the pull
  drawer += `<path d="M${VW / 2 - 34} ${fy0 + 60}a34 14 0 0 0 68 0" fill="none" stroke="#0a0f1d" stroke-opacity=".5" stroke-width="6" transform="translate(2 3)"/>`;
  drawer += `<path d="M${VW / 2 - 34} ${fy0 + 60}a34 14 0 0 0 68 0" fill="none" stroke="url(#brass)" stroke-width="6" stroke-linecap="round"/>`;
  // kind key: each kind has its colour
  const kinds = [['MOVIES', KIND.movies], ['TV SHOWS', KIND.tv], ['ANIME', KIND.tv], ['BOOKS', KIND.books], ['COMICS', KIND.comics], ['MANGA', KIND.comics], ['GAMES', KIND.games], ['PODCASTS', KIND.podcasts], ['MUSIC', KIND.music], ['VIDEOS', KIND.videos]];
  const CP = 2;
  const chipW = (t) => pixWidth(t, CP) + 30;
  const chip = (t, col, x, y) => `<rect x="${f1(x)}" y="${y}" width="${chipW(t)}" height="22" rx="11" fill="#f5eedb" opacity=".95"/><circle cx="${f1(x + 11.5)}" cy="${y + 11}" r="5.4" fill="${col}"/><path d="${pixText(t, x + 21, y + 6, CP)}" fill="${NAVY}"/>`;
  // two rows of chips each side of the label, packed and centred in their half
  const row = (list, x0, x1, y) => {
    const GAP = 12;
    const tot = sum(list.map(([t]) => chipW(t))) + GAP * (list.length - 1);
    let x = (x0 + x1) / 2 - tot / 2;
    for (const [t, col] of list) { drawer += chip(t, col, x, y); x += chipW(t) + GAP; }
  };
  row(kinds.slice(0, 3), dx0 + 16, lx - 16, fy0 + 12);
  row(kinds.slice(3, 5), dx0 + 16, lx - 16, fy0 + 42);
  row(kinds.slice(5, 8), lx + lw + 16, dx1 - 16, fy0 + 12);
  row(kinds.slice(8), lx + lw + 16, dx1 - 16, fy0 + 42);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VW} ${VH}" width="${VW}" height="${VH}" role="img" aria-label="MediaLog's log as a drawer of punched cards, filed five years at a time">
<title>The log, five years at a time</title>
<desc>A wooden drawer labelled EVERYTHING holds a deck of 80-column punched cards, one per log entry, each with a stripe in its kind's colour and the entry printed along the top edge. Navy guide cards with tabs read 2025-2029, 2015-2019 and SOMETIME IN 2015-2019. The cards read: 2026, 21 MAR, TV SHOW, GENTLE ROUNDABOUTS, M. FENNIMORE, S2 E1-10, loved. 2026, FEB, BOOK, QUEUEING: A HISTORY, DR P. HALLOWAY, AUDIOBOOK, liked. 2016, 12 NOV, MOVIE, THE KETTLE THAT KNEW, A. OKONJO-PELL, GLORIOUS MESS with a little face. And at the front, with no year and no date punched: GAME, TIDY THE MOON, WOBBLY SHELF, liked. A key on the drawer front gives each kind its colour: movies red, TV shows and anime blue, books amber, comics and manga magenta, games green, podcasts violet, music teal, videos plum.</desc>
<defs>
<clipPath id="cpanel"><rect width="${VW}" height="${VH}" rx="18"/></clipPath>
<clipPath id="indrawer"><rect x="0" y="0" width="${VW}" height="${DRAWER_Y + 30}"/></clipPath>
<radialGradient id="cdesk" cx=".45" cy=".3" r=".9"><stop offset="0" stop-color="#24325c"/><stop offset=".6" stop-color="#1b2546"/><stop offset="1" stop-color="#121a33"/></radialGradient>
<linearGradient id="manila" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6ecd2"/><stop offset=".25" stop-color="${MANILA}"/><stop offset="1" stop-color="#e6d6ad"/></linearGradient>
<linearGradient id="woodSide" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a4c26"/><stop offset=".6" stop-color="#9a6535"/><stop offset="1" stop-color="#5e3a1d"/></linearGradient>
<linearGradient id="woodSideR" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#7a4c26"/><stop offset=".6" stop-color="#9a6535"/><stop offset="1" stop-color="#5e3a1d"/></linearGradient>
<linearGradient id="woodFront" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9824a"/><stop offset=".5" stop-color="#a8723e"/><stop offset="1" stop-color="#8a5a2e"/></linearGradient>
<linearGradient id="brass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3d58e"/><stop offset=".5" stop-color="#c79a46"/><stop offset="1" stop-color="#8e6a28"/></linearGradient>
${glyphDefs}${digitDefs}
</defs>
<g clip-path="url(#cpanel)">
<rect width="${VW}" height="${VH}" fill="url(#cdesk)"/>
<rect x="${dx0 + 4}" y="${sideTop}" width="${dx1 - dx0 - 8}" height="${DRAWER_Y - sideTop}" fill="#2a1a0e"/>
<g clip-path="url(#indrawer)">${deck}
${frontFace}</g>
${drawer}
</g>
<rect x=".75" y=".75" width="${VW - 1.5}" height="${VH - 1.5}" rx="17.25" fill="none" stroke="#fff" stroke-opacity=".08" stroke-width="1.5"/>
</svg>
`;
}

// ------------------------------------------------------------------ the markdown
// The printout in the <details> is a job banner page and a log listing, as a line printer
// would put them out: capitals only, 80 columns, field lines above and below. The giant
// letters are each struck with one verb's initial, W R P L, because the printer could not
// decide either.
const BIG = {
  M: '#.....#|##...##|#.#.#.#|#..#..#|#.....#|#.....#|#.....#',
  E: '#######|#......|#......|#####..|#......|#......|#######',
  D: '######.|#.....#|#.....#|#.....#|#.....#|#.....#|######.',
  I: '.#####.|...#...|...#...|...#...|...#...|...#...|.#####.',
  A: '..###..|.#...#.|#.....#|#.....#|#######|#.....#|#.....#',
  L: '#......|#......|#......|#......|#......|#......|#######',
  O: '.#####.|#.....#|#.....#|#.....#|#.....#|#.....#|.#####.',
  G: '.#####.|#.....#|#......|#..####|#.....#|#.....#|.#####.',
};
function bigWord(w, inks) {
  const rows = Array.from({ length: 7 }, () => []);
  [...w].forEach((ch, i) => BIG[ch].split('|').forEach((r, y) => rows[y].push(r.replace(/#/g, inks[i % inks.length]).replace(/\./g, ' '))));
  return rows.map((r) => r.join('  ').replace(/\s+$/, ''));
}
const fieldLine = (t, n = 80, c = '*') => { const k = n - t.length; return c.repeat(Math.floor(k / 2)) + t + c.repeat(k - Math.floor(k / 2)); };
const LOG_ROW = (year, when, kind, title, by, how) => [year.padEnd(4), when.padStart(6), ' ' + kind.padEnd(8), title.padEnd(26), by.padEnd(16), how].join(' ').replace(/\s+$/, '');
const NOTE = (t) => ' '.repeat(13) + t;
const FEEDROW = (who, what, when) => { const a = `${who.padEnd(14)}${what}`; return a + ' '.repeat(Math.max(1, 80 - a.length - when.length)) + when; };
function printout() {
  const L = [];
  const rule = '#'.repeat(80);
  L.push(rule, fieldLine(' START *** JOB 2015-2019 *** USER: YOU *** WHEN: SOMETIME, ROUGHLY '), '');
  for (const r of bigWord('MEDIALOG', 'WRPL')) L.push('     ' + r);
  L.push('', fieldLine(' VERB: WATCHED / READ / PLAYED / LISTENED TO *** PICK ONE '), rule, '');
  L.push('MEDIALOG LOG LISTING        MY LOG        FIVE YEARS AT A TIME         PAGE 0001');
  L.push(LOG_ROW('YEAR', 'WHEN', 'KIND', 'TITLE', 'BY', 'HOW IT WAS'));
  L.push(LOG_ROW('----', '------', '--------', '-'.repeat(26), '-'.repeat(16), '-'.repeat(14)));
  const block = (t) => { L.push(''); L.push(fieldLine(` ${t} `, 80, '=')); };
  block('2025-2029');
  L.push(LOG_ROW('2026', '21 MAR', 'TV SHOW', 'GENTLE ROUNDABOUTS', 'M. FENNIMORE', 'LOVED'));
  L.push(NOTE('S2 E1-10. NOTE: THERE IS A MINI ONE IN EPISODE 6. I STOOD UP.'));
  L.push(LOG_ROW('2026', 'FEB', 'BOOK', 'QUEUEING: A HISTORY', 'DR P. HALLOWAY', 'LIKED'));
  L.push(NOTE('AUDIOBOOK. NOTE: LISTENED TO IT IN A QUEUE. FELT SEEN.'));
  L.push(LOG_ROW('2026', 'JAN', 'PODCAST', 'MOSTLY ABOUT GRAVEL', 'CLEMENTINE ROOK', 'ODDLY GRIPPING'));
  L.push(LOG_ROW('2025', '30 AUG', 'ANIME', 'LIGHTHOUSE CLUB', 'PENNYWHISTLE', 'LOVED'));
  L.push(NOTE('S1 E1-12. NOTE: NOBODY HAS EVER SWITCHED THE LIGHTHOUSE ON.'));
  L.push(LOG_ROW('2025', 'JUN', 'MUSIC', 'SONGS FOR FOLDING LAUNDRY', 'THE DAMP SOCKS', 'LIKED'));
  L.push(NOTE('NOTE: TRACK 4 IS THE FITTED SHEET ONE. SKIP TRACK 4.'));
  block('2020-2024');
  L.push(LOG_ROW('2022', '14 JAN', 'VIDEO', 'A VERY ORDINARY CHAIR', 'CAREFUL HANDS', 'LIKED'));
  L.push(NOTE('NOTE: FORTY MINUTES. IT IS STILL A VERY ORDINARY CHAIR.'));
  block('2015-2019');
  L.push(LOG_ROW('2016', '12 NOV', 'MOVIE', 'THE KETTLE THAT KNEW', 'A. OKONJO-PELL', 'GLORIOUS MESS'));
  L.push(NOTE('NOTE: THE KETTLE KNEW. WE ALL KNEW THE KETTLE KNEW.'));
  block('SOMETIME IN 2015-2019');
  L.push(LOG_ROW('', '', 'GAME', 'TIDY THE MOON', 'WOBBLY SHELF', 'LIKED'));
  L.push(NOTE('NOTE: PUT THE MOON BACK. SLIGHTLY TO THE LEFT.'));
  L.push(LOG_ROW('', '', 'BOOK', 'A THOUSAND STAIRS', 'O. TREADWELL', 'MOSTLY STAIRS'));
  L.push(NOTE('EBOOK. NOTE: FINISHED IT. DATE UNKNOWN. LEGS STILL GOING.'));
  L.push('', fieldLine(' FEED: FRIENDS *** RECENTLY LOGGED *** LOGGED YESTERDAY ', 80, '-'));
  L.push(FEEDROW('FERGAL M.', 'TIDY THE MOON, WOBBLY SHELF', '2026'));
  L.push(FEEDROW('', '"ALSO PUT THE MOON BACK. ALSO SLIGHTLY LEFT."', 'READ MORE'));
  L.push(FEEDROW('WENDELINE R.', 'THE KETTLE THAT KNEW, A. OKONJO-PELL', '2020-2024'));
  L.push(FEEDROW('', '"HOW DID IT KNOW."', 'READ MORE'));
  L.push('', rule, fieldLine(' END *** JOB 2015-2019 *** TEAR AT PERFORATION *** FILE UNDER: SOMETIME '), rule);
  for (const l of L) if (l.length > 80 || /\s$/.test(l)) throw new Error(`bad listing line (${l.length}): ${l}`);
  return L.join('\n');
}

function buildMd() {
  const alt = 'Animated. Seen from above on a navy desk: a home banner reading MEDIALOG in giant dot-matrix letters, '
    + 'printed sideways across five joined sheets of fan-fold paper in pink, sky blue, canary and mint, with sprocket '
    + 'holes along both edges and perforations between the sheets, MediaLog\'s open-book mark at the left end and a heart '
    + 'at the right. Below it, a dot-matrix printer with a VERB selector marked PICK ONE prints the next banner line by line: '
    + 'WATCHED in red with a popcorn bucket, READ in amber with a stack of books, PLAYED in green with a game pad, '
    + 'LISTENED TO in teal with headphones. Each is torn off at the perforation and carried away before the next one prints. '
    + 'To the left of the verb lies a torn-off slip of green-bar listing paper, printed: EVERYTHING YOU\'VE WATCHED, READ, PLAYED, LISTENED TO, ON ONE TIMELINE. '
    + 'Someone has circled the current verb on it in pen, and moves the circle each time the printer changes its mind. '
    + 'A mug of tea and torn-off sprocket strips lie on the desk.';
  const altCards = 'A wooden card-file drawer labelled EVERYTHING, full of 80-column punched cards, one per log entry, each with a '
    + 'stripe in its kind\'s colour and the entry printed along its top edge. Navy guide cards with tabs file them five years '
    + 'at a time: 2025-2029, 2015-2019, and SOMETIME IN 2015-2019. The cards read: 2026, 21 MAR, TV SHOW, GENTLE ROUNDABOUTS, '
    + 'M. FENNIMORE, S2 E1-10, loved. 2026, FEB, BOOK, QUEUEING: A HISTORY, DR P. HALLOWAY, AUDIOBOOK, liked. 2016, 12 NOV, '
    + 'MOVIE, THE KETTLE THAT KNEW, A. OKONJO-PELL, GLORIOUS MESS with a little face. At the front, with its year and date '
    + 'columns left unpunched: GAME, TIDY THE MOON, WOBBLY SHELF, liked. Chips on the drawer front give each kind its colour: '
    + 'movies red, TV shows and anime blue, books amber, comics and manga magenta, games green, podcasts violet, music teal, '
    + 'videos plum.';
  const fence = '`'.repeat(3);
  return `<!-- Header ${SLUG} for MediaLog. Generated by src/${SLUG}.mjs: edit that, not this. -->

<p align="center">
  <img src="${SVG_REF}" width="100%" alt="${esc(alt)}">
</p>

<h1 align="center">MediaLog</h1>

<p align="center">
  <b>Everything you've watched, read, played, listened to, on one timeline.</b><br>
  <sub>CONTINUOUS STATIONERY &nbsp;·&nbsp; ONE LIFE, FAN-FOLDED &nbsp;·&nbsp; FIVE YEARS PER DIVIDER &nbsp;·&nbsp; TEAR AT PERFORATION</sub>
</p>

MediaLog is a media diary you share. Log a film, a book, a show, a game, an album or a podcast: when, and how it was. Then see what the people you know have been into.

It keeps the record, not the thing. The film stays wherever you watched it; MediaLog writes down that you did, roughly when, and that you loved it, liked it or have a short verdict of your own, plus a note if you have one, which you always do. Each kind has its colour. The timeline files everything five years at a time, then by year, then by day if you know it, by month if you nearly know it, and under **sometime in** if all you know is that it was definitely the late 2010s and there was a kettle.

<p align="center">
  <img src="${CARDS_REF}" width="100%" alt="${esc(altCards)}">
</p>

The home page asks "What did you play?" and the sign-in page says "listened to". The verb changes, and so does the printer's mind, and so does the pen on the slip. Below the home page question is the Feed: friends and you, just friends, or everyone, recently logged or by date, beside your threads about titles and what has been talked about this month. Sign in with an email and a password, or carry on with Google or GitHub. MediaLog is in development, so there is nothing to install yet.

<details>
<summary><b>The whole print job</b>: a banner page, then one person's log, five years at a time, as a line printer would list it</summary>

<br>

${fence}text
${printout()}
${fence}

</details>

<details>
<summary><b>Colophon</b>: what is printed here, and what is not</summary>

<br>

- **The style** is continuous stationery: tractor-feed paper with sprocket holes down both edges, the home banner printed sideways across joined sheets with a picture at each end, a torn-off slip of green-bar listing paper, the job banner page and the 80-column punched card. Everything is drawn from scratch by one small Node script: the heavy banner face, the 3x5 and 5x7 dot fonts, the printer, every pictogram and the card file. No real program, printer, font, clip art or card form is copied.
- **The colours** are MediaLog's own: navy ink, and each kind's colour (movies red, TV shows and anime blue, books amber, comics and manga magenta, games green, podcasts violet, music teal, videos plum). The open book with the play triangle and the pen is MediaLog's mark, redrawn in dots.
- **The log is invented.** Every title, creator, studio, artist, verdict and friend here is made up. Any resemblance to a real stair is coincidental.
- **Under reduced motion** the banner holds one complete frame: MEDIALOG on the desk and WATCHED beside the printer.

</details>
`;
}

// ------------------------------------------------------------------ write
const svg = buildSvg();
const cardsSvg = buildCards();
const md = buildMd();
fs.mkdirSync(path.dirname(OUT_SVG), { recursive: true });
fs.writeFileSync(OUT_SVG, svg);
fs.writeFileSync(OUT_CARDS, cardsSvg);
console.log(`wrote ${path.relative(process.cwd(), OUT_CARDS)} (${(cardsSvg.length / 1024).toFixed(1)} KB)`);
fs.writeFileSync(OUT_MD, md);
console.log(`wrote ${path.relative(process.cwd(), OUT_SVG)} (${(svg.length / 1024).toFixed(1)} KB, loop ${TT.toFixed(2)} s; cycles ${CYC.map((c) => c.toFixed(2)).join(', ')})`);
console.log(`cycle starts: ${T0.map((t) => t.toFixed(2)).join(', ')}`);
console.log(`wrote ${path.relative(process.cwd(), OUT_MD)}`);
