// Braille-dot terminal graphics header (catalogue entry ansi-12) for the Castaway README.
// Plain Node, no dependencies, deterministic. Run:
//   node examples/castaway/src/55-braille-dot-graphics_opus_5.5.mjs          (add --dump to print the hero's dots)
// It rewrites examples/castaway/55-braille-dot-graphics_opus_5.5.md. Edit this file, not the .md.
//
// The whole header is text. Pictures and charts are drawn on a dot canvas and written out as
// Braille Patterns (U+2801..U+28FF): every character cell is a 2 x 4 grid of dots, so the
// 72-cell hero is a 144 x 68 dot picture. The rest is plain ASCII, box drawing and ■ · meters.
//
// Fonts, measured in Chromium on Windows with GitHub's monospace stack (Consolas first):
//   * Consolas has no Braille, so every Braille cell falls back to Segoe UI Symbol, where it is
//     10.25 px wide at GitHub's 13.6 px, against 7.48 px for an ASCII cell. So a Braille row is
//     wider than an ASCII row of the same length. Fonts that do carry Braille (Cascadia Mono,
//     DejaVu Sans Mono and friends) draw it at the normal cell width. Either way the rows of a
//     picture stay square with each other, as long as two rules hold:
//   * a picture row is Braille and nothing else (after the shared two-space margin), and
//   * U+2800, the blank pattern, is never used: in Segoe UI Symbol it is 8.85 px, narrower than
//     the other 255 patterns, so one blank cell drags the rest of its row out of line. A cell
//     with no dots gets one dot instead (the top-left one), which leaves a faint, level grid
//     behind everything, like plot paper.
//   Labels therefore live on their own ASCII lines, flush left with the pictures, and nothing
//   in an ASCII line has to line up with a Braille column.
//
// Facts. Every number is from D:/python/castaway, read on 2026-10-01: activities.toml (tiers,
// run length, seed, durations), tools/make_audio.py (the kalimba MELODY, chords, tempo) and one
// simulated run: `python -B tools/schedule.py --json <scratch file>` with the default seed 1992,
// whose events are baked in below (start+duration, seconds, base 36). The schedule grows every
// few hours, so a run made later will not match this one, and the header says so.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT_MD = path.resolve(HERE, '..', '55-braille-dot-graphics_opus_5.5.md');
const DEBUG = process.argv.includes('--dump');

// ---------------------------------------------------------------- dot canvas
// One Braille cell is 2 dots wide and 4 tall. Bits per dot (x, y) inside a cell:
const BIT = [[0x01, 0x08], [0x02, 0x10], [0x04, 0x20], [0x40, 0x80]];

class Dots {
  constructor(w, h) { this.w = w; this.h = h; this.a = new Uint8Array(w * h); }
  in(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
  get(x, y) { return this.in(x, y) ? this.a[y * this.w + x] : 0; }
  put(x, y, v = 1) { x = Math.round(x); y = Math.round(y); if (this.in(x, y)) this.a[y * this.w + x] = v ? 1 : 0; }
  // Fill every dot where inside(x, y) holds; tone(x, y) says dot (1) or gap (0).
  fill(inside, tone = () => 1) {
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (inside(x, y)) this.a[y * this.w + x] = tone(x, y) ? 1 : 0;
  }
  // Braille rows. A cell with no dots at all gets the top-left dot (see the note on fonts).
  braille() {
    const rows = [];
    for (let cy = 0; cy < this.h / 4; cy++) {
      let s = '';
      for (let cx = 0; cx < this.w / 2; cx++) {
        let b = 0;
        for (let dy = 0; dy < 4; dy++) for (let dx = 0; dx < 2; dx++) if (this.get(cx * 2 + dx, cy * 4 + dy)) b |= BIT[dy][dx];
        s += String.fromCodePoint(0x2800 + (b || 0x01));
      }
      rows.push(s);
    }
    return rows;
  }
  dump() { const o = []; for (let y = 0; y < this.h; y++) { let s = ''; for (let x = 0; x < this.w; x++) s += this.get(x, y) ? '#' : '.'; o.push(s); } return o.join('\n'); }
}

// ---------------------------------------------------------------- geometry
// Flat tones made for the 2 x 4 cell: n of the 8 dots in every cell, placed so that they never
// stack into columns (a square Bayer screen does, and reads as stripes). 4 is a checkerboard.
const TONES = { 2: [[0, 0], [1, 2]], 4: [[0, 0], [1, 1], [0, 2], [1, 3]] };
const tone = (n) => (x, y) => TONES[n].some(([ox, oy]) => ox === (x & 1) && oy === (y & 3));
const segDist = (px, py, [ax, ay], [bx, by]) => {
  const vx = bx - ax, vy = by - ay, l2 = vx * vx + vy * vy;
  const t = l2 ? Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / l2)) : 0;
  return Math.hypot(px - ax - t * vx, py - ay - t * vy);
};
const polyDist = (px, py, lines) => {
  let d = Infinity;
  for (const pl of lines) for (let i = 1; i < pl.length; i++) d = Math.min(d, segDist(px, py, pl[i - 1], pl[i]));
  return d;
};
// Arc with maths angles (degrees, counter-clockwise, 0 = east) on a y-down canvas.
const arc = (cx, cy, rx, ry, a0, a1, n = 24) => Array.from({ length: n + 1 }, (_, i) => {
  const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
  return [cx + rx * Math.cos(a), cy - ry * Math.sin(a)];
});
const quad = (p0, p1, p2, n = 32) => Array.from({ length: n + 1 }, (_, i) => {
  const t = i / n, u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]];
});
const line = (c, x0, y0, x1, y1, v = 1) => {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= n; i++) c.put(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n, v);
};
// Every dot within r of the centre lines gets tone(x, y).
function stroke(c, lines, r, tn = () => 1) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const pl of lines) for (const [x, y] of pl) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  for (let y = Math.floor(y0 - r - 1); y <= y1 + r + 1; y++) {
    for (let x = Math.floor(x0 - r - 1); x <= x1 + r + 1; x++) {
      if (c.in(x, y) && polyDist(x + 0.5, y + 0.5, lines) <= r) c.put(x, y, tn(x, y));
    }
  }
}
const inEllipse = (cx, cy, rx, ry) => (x, y) => ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1;
// Dots along an ellipse, one every `step` dots of arc length, between angles a0..a1.
function ring(c, cx, cy, rx, ry, a0 = 0, a1 = 360, step = 1, v = 1) {
  const len = (Math.abs(a1 - a0) / 360) * 2 * Math.PI * Math.sqrt((rx * rx + ry * ry) / 2);
  const n = Math.max(2, Math.round(len / step));
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    c.put(cx + rx * Math.cos(a) - 0.5, cy - ry * Math.sin(a) - 0.5, v);
  }
}
// Small hand-drawn bitmaps: '#' is a dot. halo > 0 first clears that many dots round each one.
function sprite(c, x0, y0, rows, halo = 0) {
  if (halo) {
    rows.forEach((row, y) => [...row].forEach((ch, x) => {
      if (ch === '#') for (let dy = -halo; dy <= halo; dy++) for (let dx = -halo; dx <= halo; dx++) c.put(x0 + x + dx, y0 + y + dy, 0);
    }));
  }
  rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === '#') c.put(x0 + x, y0 + y, 1); }));
}
// A panel: a one-dot frame with rounded corners round the whole canvas.
function panel(w, h) {
  const c = new Dots(w, h);
  for (let x = 2; x < w - 2; x++) { c.put(x, 0); c.put(x, h - 1); }
  for (let y = 2; y < h - 2; y++) { c.put(0, y); c.put(w - 1, y); }
  for (const [x, y] of [[1, 1], [w - 2, 1], [1, h - 2], [w - 2, h - 2]]) c.put(x, y);
  return c;
}

// ---------------------------------------------------------------- wordmark font
// Centre lines of a bold rounded sans, in a w x h box, for a stroke of radius r.
const GLYPH = {
  C: (w, h, r) => [arc(w / 2, h / 2, w / 2 - r, h / 2 - r, 42, 318, 40)],
  A: (w, h, r) => {
    const rx = w / 2 - r, cy = r + rx;
    return [[[r, h - r], [r, cy], ...arc(w / 2, cy, rx, rx, 180, 0, 24), [w - r, cy], [w - r, h - r]], [[r, h * 0.6], [w - r, h * 0.6]]];
  },
  S: (w, h, r) => {
    const mid = h / 2 + 0.25, rx = w / 2 - r;
    const cy1 = (r + mid) / 2, ry1 = mid - cy1, cy2 = (mid + h - r) / 2, ry2 = cy2 - mid;
    return [[...arc(w / 2, cy1, rx, ry1, 28, 270, 30), ...arc(w / 2, cy2, rx, ry2, 90, -152, 30)]];
  },
  T: (w, h, r) => [[[r, r], [w - r, r]], [[w / 2, r], [w / 2, h - r]]],
  W: (w, h, r) => [[[r, r], [r + (w - 2 * r) * 0.22, h - r], [w / 2, h * 0.36], [w - r - (w - 2 * r) * 0.22, h - r], [w - r, r]]],
  Y: (w, h, r) => [[[r, r], [w / 2, h * 0.52]], [[w - r, r], [w / 2, h * 0.52]], [[w / 2, h * 0.52], [w / 2, h - r]]],
};
const WIDTH = { C: 12, A: 12, S: 12, T: 12, W: 17, Y: 12 };
function wordmark(word, x0, y0, h, r, gap) {
  const parts = [];
  let x = x0;
  for (const ch of word) {
    const w = WIDTH[ch];
    parts.push(GLYPH[ch](w, h, r).map((pl) => pl.map(([px, py]) => [px + x, py + y0])));
    x += w + gap;
  }
  return { lines: parts.flat(), width: x - gap - x0 };
}

// ---------------------------------------------------------------- sprites
// Her, front on, drawn in bands of four dot rows: each Braille line is one band, and the
// lines have a wide gap between them, so every band has to read on its own.
const HER = [
  '..#######..', // headphones over her head, cups on her ears
  '.##.....##.',
  '###.###.###',
  '###.###.###',
  '...#####...', // the low bun peeking out, neck, shoulders
  '##..###....',
  '##...#.....',
  '..#######..',
  '.#.#####.#.', // tank top, arms
  '.#.#####.#.',
  '.#.#####.#.',
  '...#####...',
  '...##.##...', // shorts, legs
  '...##.##...',
  '....#.#....',
  '....#.#....',
  '....#.#....', // bare feet
  '....#.#....',
  '...##.##...',
];
const GULL = ['##...##', '..#.#..', '...#...'];
// Lane icons, two Braille lines (8 dots) tall, standing on the lane's waterline.
const SHIP = ['...##......', '..#........', '...##......', '...##.#....', '.#########.', '###########', '.#########.'];
const CAT = ['#...#....', '##.##....', '#####....', '.###...#.', '.####..#.', '.#####.#.', '.######..'];
const CASTLE = ['#.#...#.#', '###.#.###', '#########', '#########', '####.####', '###...###', '###...###'];
const BARS = ['.........#', '......#..#', '......#..#', '...#..#..#', '...#..#..#', '##.#..#..#', '##.#..#..#'];

// ---------------------------------------------------------------- the hero
// 144 x 68 dots = 72 cells x 17 rows. Whatever has to read at a glance is solid (title, sun,
// palm, her, raft), the sand is a checkerboard, and sky and sea are left to the grid, with the
// swell drawn as a few bold strokes.
const HW = 144, HH = 68, HORIZON = 34;
function hero() {
  const c = new Dots(HW, HH);

  // sun, top left, high in the sky: solid disc, a gap, then rays
  const S = [11, 10.5], SR = 4.6;
  c.fill(inEllipse(S[0], S[1], SR, SR));
  for (let k = 0; k < 12; k++) {
    const a = (k * 30 * Math.PI) / 180, r0 = SR + 2, r1 = SR + (k % 2 ? 4.2 : 5.6);
    line(c, S[0] - 0.5 + Math.cos(a) * r0, S[1] - 0.5 - Math.sin(a) * r0, S[0] - 0.5 + Math.cos(a) * r1, S[1] - 0.5 - Math.sin(a) * r1);
  }

  // cumulus over the horizon: round bumps on a flat base, a light stagger inside, a solid rim
  const cloud = (x0, yb, bumps) => {
    let x = x0;
    const shapes = bumps.map(([w, hgt]) => { const s0 = [x + w / 2, yb, w / 2, hgt]; x += w * 0.62; return s0; });
    const inside = (px, py) => py <= yb && shapes.some(([cx, cy, rx, ry]) => inEllipse(cx, cy, rx, ry)(px, py));
    c.fill(inside, tone(2));
    c.fill((px, py) => inside(px, py) && (!inside(px, py - 1) || !inside(px - 1, py) || !inside(px + 1, py) || py === yb));
  };
  cloud(18, 31, [[10, 5], [13, 9], [12, 7], [9, 4]]);
  cloud(124, 28, [[8, 4], [10, 7], [7, 4]]);

  sprite(c, 54, 22, GULL);
  sprite(c, 63, 25, GULL);

  // the horizon, and the swell as bold strokes that grow towards us
  for (let x = 0; x < HW; x++) c.put(x, HORIZON);
  const crest = (x0, y, L) => {
    const amp = 0.5 + (y - HORIZON) * 0.05;
    for (let i = 0; i <= L; i++) {
      const yy = y - amp * Math.sin((Math.PI * i) / L);
      c.put(x0 + i, yy);
      c.put(x0 + i, yy + 1);
    }
  };
  for (const [x, y, L] of [[6, 39, 6], [30, 38, 5], [50, 41, 6], [16, 45, 9], [42, 48, 8], [2, 53, 10], [26, 57, 12], [52, 62, 10], [6, 64, 12], [124, 39, 6], [136, 45, 6]]) crest(x, y, L);

  // a ship on the horizon, far off to the left, minding its own business
  sprite(c, 3, 29, ['....#.....', '...###....', '.#######..', '#########.', '.#######..'], 1);
  for (let x = 0; x < 16; x++) c.put(x, HORIZON);

  // the island: a clear band of foam round the shore, then sand with a firm edge
  const I = [97, 60], IRX = 40, IRY = 6.6;
  c.fill(inEllipse(I[0], I[1], IRX + 4.5, IRY + 3), () => 0);
  ring(c, I[0], I[1], IRX + 3.4, IRY + 2.2, 0, 360, 2);
  c.fill(inEllipse(I[0], I[1], IRX, IRY), tone(4));
  ring(c, I[0], I[1], IRX, IRY, 0, 180, 0.8);
  ring(c, I[0], I[1], IRX - 0.8, IRY - 0.8, 10, 170, 0.8);
  ring(c, I[0], I[1], IRX, IRY, 180, 360, 0.8);

  // the palm: tall, slightly curved trunk, notched bark
  const B = [108, 58], T = [99, 30], K = [111, 43];
  quad(B, K, T, 90).forEach(([x, y], i) => {
    const r = 2.1 - (i / 91) * 0.9;
    c.fill((px, py) => Math.abs(px - x) < 4 && Math.abs(py - y) < 4 && Math.hypot(px + 0.5 - x, py + 0.5 - y) <= r);
  });
  for (let y = T[1] + 4; y < B[1] - 1; y += 3) {
    let xl = 0;
    while (xl < HW && !c.get(xl, y)) xl++;
    c.put(xl, y, 0);
    c.put(xl + 1, y, 0);
  }
  // crown: slim solid leaves along explicit centre lines, each cut free of the one below
  const LEAVES = [
    [[1, -1], [-5, -4], [-12, -5], [-19, -3], [-25, 1], [-29, 7]],
    [[0, 1], [-6, 2], [-12, 5], [-16, 10], [-18, 15]],
    [[-1, 0], [-3, -5], [-7, -9]],
    [[-1, -1], [5, -4], [12, -5], [19, -3], [25, 1], [29, 7]],
    [[0, 1], [6, 2], [12, 5], [16, 10], [18, 15]],
    [[1, 0], [3, -5], [7, -9]],
  ];
  const crown = new Dots(HW, HH);
  LEAVES.forEach((f, li) => {
    const pts = [];
    for (let k = 1; k < f.length; k++) {
      const [ax, ay] = f[k - 1], [bx, by] = f[k], n = Math.ceil(Math.hypot(bx - ax, by - ay) * 4);
      for (let m = 0; m < n; m++) pts.push([T[0] + ax + ((bx - ax) * m) / n, T[1] + ay + ((by - ay) * m) / n]);
    }
    pts.push([T[0] + f[f.length - 1][0], T[1] + f[f.length - 1][1]]);
    const wmax = f.length > 4 ? 1.9 : 1.3;
    const mine = new Dots(HW, HH);
    for (let y = T[1] - 12; y <= T[1] + 18; y++) {
      for (let x = T[0] - 32; x <= T[0] + 32; x++) {
        let best = Infinity, bi = 0;
        pts.forEach(([px, py], k) => { const d = Math.hypot(x + 0.5 - px, y + 0.5 - py); if (d < best) { best = d; bi = k; } });
        const t = bi / (pts.length - 1);
        const wdt = 0.6 + (wmax - 0.6) * Math.sin(Math.PI * Math.min(1, t * 1.1)) ** 0.6;
        if (best <= wdt && t < 0.995) mine.put(x, y, 1);
      }
    }
    for (let y = 0; y < HH; y++) for (let x = 0; x < HW; x++) {
      if (mine.get(x, y) && li > 0) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (!mine.get(x + dx, y + dy)) crown.put(x + dx, y + dy, 0);
    }
    for (let y = 0; y < HH; y++) for (let x = 0; x < HW; x++) if (mine.get(x, y)) crown.put(x, y, 1);
  });
  for (let y = 0; y < HH; y++) for (let x = 0; x < HW; x++) if (crown.get(x, y)) c.put(x, y, 1);
  const NUTS = [[97.5, 31.5], [101, 32], [99.2, 34]];
  for (const [x, y] of NUTS) c.fill(inEllipse(x, y, 1.9, 1.9), () => 0);
  for (const [x, y] of NUTS) c.fill(inEllipse(x, y, 1.3, 1.3));

  // her, by the palm, nodding along
  const HX = 74, HY = 40;
  sprite(c, HX, HY, HER, 1);

  // the raft, pulled up on the right: solid logs, two lashings
  c.fill((x, y) => x >= 127 && y >= 56 && y <= 67, () => 0);
  for (let k = 0; k < 4; k++) {
    line(c, 132 - k, 58 + k * 2, 143, 58 + k * 2);
    c.put(131 - k, 58 + k * 2, 0);
  }
  for (const x of [135, 140]) for (let y = 57; y <= 65; y += 2) c.put(x - (y - 57) / 2, y, 1);

  // the title, with a clear halo so nothing touches it
  const H = 18, R = 2.0, GAP = 2, LEFT = 24;
  const probe = wordmark('CASTAWAY', 0, 0, H, R, GAP);
  const wm = wordmark('CASTAWAY', Math.round(LEFT + (HW - LEFT - probe.width) / 2), 1, H, R, GAP);
  stroke(c, wm.lines, R + 1.3, () => 0);
  stroke(c, wm.lines, R);
  return c;
}

// ---------------------------------------------------------------- data, 2026-10-01
const RUN = 36000; // 10:00:00, seed 1992
// Everything in her lane (the castaway lane) in the seed-1992 run: start+duration, seconds, base 36.
const HER_RUN = [
  'c+1d 6x+2l co+16 hc+v n6+x ql+15 wr+x 149+1f 1ax+m 1gx+x 1mo+x 1v0+x 21r+s 23c+1i',
  '25r+1b 2dr+2u 2hx+14 2p0+x 2t6+2b 2zi+3j 346+n 3a0+15 3e3+17 3m6+12 3or+16 3rl+4s 3yf+z',
  '429+3k 4a6+m 4dl+1d 4lx+13 4ti+u 4yl+s 52c+2g 573+v 5er+z 5j6+t 5ko+m 5qr+36 5xf+y',
  '60c+x 63r+r 6a9+y 6fo+11 6j6+v 6n9+1o 6tu+11 6yc+13 73c+r 7ao+x 7f6+13 7jr+y 7m6+91',
  '7wo+c 7xu+w 856+o 8c6+3f 8j3+2z 8mu+10 8u6+12 929+19 97x+14 9f6+3d 9kf+13 9p3+y 9tu+w',
  '9yo+s a03+3j a5x+z adf+1u ajc+14 ao9+l as3+y awx+16 azl+u b36+11 bbf+18 bhc+11 bof+v',
  'bsc+2p bw6+d bxi+z c4o+15 c9x+q cdl+v ch9+24 cmr+10 cor+x csu+28 cwo+12 d0f+10 d3l+6l',
  'dc3+o dif+10 dpl+16 ds6+1u dw9+28 e10+t e56+l ear+10 egf+15 eji+36 enl+w etf+v ez0+13',
  'f5c+14 f8f+4x ff6+19 fmu+u fqi+2g fvi+m fxo+s g5l+x g90+1a gcr+12 gi0+15 gp6+3r gtr+1x',
  'gwi+1i gz9+c h0c+4b h66+u hc3+v hk3+1x hro+p hul+1b hxx+26 i5u+p icr+y ihr+y ik0+1z',
  'inc+y isl+v iv0+34 j09+z j63+t jaf+w jic+q jpu+y jv9+av k7r+3l kec+r khl+1g kjx+x',
  'ks3+13 kzo+s l3r+17 l69+1k l9u+16 lef+10 llf+17 lt9+10 lzl+1f m2c+w maf+10 mgf+12 mkc+x',
  'mol+12 mtl+2u mxr+z n0o+17 n4u+t nb3+u nhu+2d np6+1e nsr+13 ny9+u o4l+10 oa6+16 odr+z',
  'og0+t olu+p otc+10 ozf+r p1r+26 p7i+2q pcl+z pgc+x pl0+v pol+w pt0+12 pvu+16 py0+10',
  'q1u+v q99+2f qhf+2p qmc+s qpu+s qy3+s r0r+e r2c+1c r9l+1p rhi+v roo+1d',
].join(' ').split(' ').map((t) => t.split('+').map((v) => parseInt(v, 36)));
// Every event in the run (all lanes), as tier letter + start (base 36): r regular, o occasional,
// R rare, S super rare, c chained follow-up.
const EVENTS = [
  'oc r6x rco rhc rn6 rql rwr r149 o14i r1ax r1gx r1mo r1v0 R21i r21r o23c r25r r2dr r2hx',
  'r2p0 o2p9 r2t6 r2zi r346 c359 r3a0 r3e3 r3m6 o3or R3rl r3yf r429 r4a6 r4dl r4lx r4ti',
  'o4u6 r4yl r52c r573 r5er r5j6 o5ko r5qr r5xf R60c r63r r6a9 c6d3 r6fo r6j6 r6n9 o6ni',
  'r6tu r6yc r73c r7ao r7f6 r7jr o7m6 c7wo r7xu r856 R86f r8c6 o8j3 r8mu r8u6 r929 r97x',
  'r9f6 o9fl r9kf r9p3 r9tu r9yo oa03 ra5x radf rajc rao9 ras3 Rawx razl rb36 ob5x rbbf',
  'cbfi rbhc rbof rbsc obw6 rbxi rc4o cc70 rc9x rcdl rch9 ocmr rcor rcsu rcwo rd0f Rd3l',
  'rdc3 rdif cdox odpl rds6 rdw9 re10 re56 ce9u rear regf Seji renl oeo6 retf rez0 rf5c',
  'of8f Rfau rff6 rfmu rfqi ofvi rfxo rg5l rg90 rgcr rgi0 rgp6 ogtr cgwi cgz9 Rh0c rh66',
  'rhc3 rhk3 rhro ohul rhxx ri5u ricr cigi rihr Rik0 rinc oisl riv0 rj09 rj63 rjaf rjic',
  'rjpu ojv9 ck3i rk7r rkec okhl Rkj6 rkjx rks3 rkzo ol3r rl69 rl9u rlef rllf rlt9 olzl',
  'rm2c rmaf rmgf rmkc rmol rmtl Rmxr rn0o on19 rn4u rnb3 rnhu onp6 rnsr rny9 ro4l roa6',
  'oodr rog0 rolu coq9 rotc rozf Rp1r rp7i op93 rpcl rpgc rpl0 rpol cprc rpt0 opvu rpy0',
  'rq1u rq99 rqhf rqmc rqpu rqy3 or0r Rr1l rr2c rr9l crgu rrhi rroo',
].join(' ').split(' ').map((t) => [t[0], parseInt(t.slice(1), 36)]);
const SHIPS = [[1458, 148], [3501, 137], [6270, 106], [8622, 118], [12225, 110], [14469, 137], [19014, 123], [29853, 106], [32727, 121]];
const CATS = [[2646, 1565], [10599, 1360], [19830, 1343], [26610, 1259], [35049, 1054]];
const CASTLES = [3642, 6564, 13443, 15276, 16590, 18009, 23253, 30450, 32670, 34029];
const TIDES = [4077, 8247, 14814, 15804, 17745, 18498, 23922, 32049, 33384, 35598];
const SIGNAL = [22044, 155];
// Median of 200 simulated 10-hour runs, from the header of activities.toml.
const TIERS = [['regular', 155, 'every 2 to 5 min'], ['occasional', 30, 'every 12 to 25 min'], ['rare', 13, 'every 30 to 60 min'], ['super rare', 2, 'every 3 to 6 h']];
// tools/make_audio.py, MELODY: (bar, beat, MIDI) for the kalimba, bars 7 to 20 of 20.
const MELODY = [
  [7, 0.5, 81], [7, 1.0, 84], [7, 1.5, 81], [7, 2.5, 79],
  [8, 1.0, 77], [8, 1.5, 79], [8, 2.0, 81],
  [9, 0.5, 86], [9, 1.0, 84], [9, 1.75, 81], [9, 2.5, 79],
  [10, 1.0, 81], [10, 2.0, 79], [10, 3.0, 76],
  [11, 0.0, 77], [11, 0.5, 81], [11, 1.0, 84], [11, 1.5, 88], [11, 2.0, 86], [11, 3.0, 84],
  [12, 0.5, 81], [12, 1.0, 84], [12, 1.75, 86], [12, 2.5, 89], [12, 3.0, 88], [12, 3.5, 86],
  [13, 0.0, 86], [13, 1.5, 84], [13, 2.0, 81], [13, 2.5, 82], [13, 3.0, 81], [13, 3.5, 79],
  [14, 0.0, 79], [14, 1.5, 81], [14, 2.0, 84], [14, 2.5, 86], [14, 3.0, 88],
  [15, 0.0, 89], [15, 2.0, 88], [15, 2.5, 84], [15, 3.0, 81],
  [16, 0.5, 79], [16, 1.0, 81], [16, 1.5, 84], [16, 3.5, 86],
  [17, 0.0, 86], [17, 2.0, 84],
  [18, 0.0, 81], [18, 2.0, 79],
  [19, 1.0, 84], [19, 2.5, 81],
  [20, 0.0, 84], [20, 0.5, 88], [20, 1.0, 91], [20, 2.0, 89],
];

const busyShare = (a, b) => {
  let busy = 0;
  for (const [s, d] of HER_RUN) busy += Math.max(0, Math.min(b, s + d) - Math.max(a, s));
  return busy / (b - a);
};
const BUSY_TOTAL = busyShare(0, RUN);

// ---------------------------------------------------------------- charts
const PW = 144; // every panel is as wide as the hero: 72 cells
const COLS = PW - 4; // inside the frame and a one-dot margin
const colOf = (t) => 2 + Math.min(COLS - 1, Math.floor((t / RUN) * COLS));

// The whole run as a skyline: one solid bar per cell (8 min 34 s), as tall as the rarest thing
// that started in it. Everyday routines and follow-ups barely clear the floor; gags stand up,
// taller the rarer their timer. Under the floor, a tick for every hour.
const SPIKE = { r: 2, c: 2, o: 6, R: 10, S: 14 };
function eventChart(h = 20) {
  const c = new Dots(PW, h);
  const base = h - 3, bars = PW / 2;
  const tall = new Array(bars).fill(0);
  for (const [tier, t] of EVENTS) {
    const i = Math.min(bars - 1, Math.floor((t / RUN) * bars));
    tall[i] = Math.max(tall[i], Math.min(SPIKE[tier], base));
  }
  tall.forEach((n, i) => { for (let k = 0; k < n; k++) { c.put(i * 2, base - k); c.put(i * 2 + 1, base - k); } });
  for (let x = 0; x < PW; x++) c.put(x, base + 1, 0);
  for (let hr = 0; hr <= 10; hr++) { const x = Math.min(PW - 1, Math.round((hr * PW) / 10)); c.put(x, base + 2); c.put(x, base + 1); }
  return c;
}
// How tall each column of the seismograph is, 0..1, for the three-symbol demo.
function spikeValues(n) {
  const v = new Array(n).fill(0);
  for (const [tier, t] of EVENTS) { const i = Math.min(n - 1, Math.floor((t / RUN) * n)); v[i] = Math.max(v[i], SPIKE[tier] / 14); }
  return v;
}

// One lane of the run: icons standing on a dotted waterline, two Braille lines tall.
function laneRow(marks, icon) {
  const c = new Dots(PW, 8);
  for (let x = 0; x < PW; x += 2) c.put(x, 7);
  for (const t of marks) sprite(c, Math.max(0, Math.min(PW - icon[0].length, colOf(t) - Math.floor(icon[0].length / 2))), 0, icon, 1);
  return c;
}

// The kalimba lead from tools/make_audio.py as a piano roll: 14 bars of 10 dots, two dot rows
// per semitone, each note held until the next one (two beats at most). Dotted bar lines mark
// where the four chords come round again.
function melodyChart() {
  const lo = 76, hi = 91, h = (hi - lo + 1) * 2 + 4, c = new Dots(PW, h);
  const yOf = (m) => 2 + (hi - m) * 2;
  const xOf = (bar, beat) => 2 + (bar - 7) * 10 + Math.round(beat * 2.5);
  for (const bar of [9, 13, 17]) for (let y = 0; y < h; y += 2) c.put(xOf(bar, 0) - 1, y);
  MELODY.forEach(([bar, beat, m], i) => {
    const x0 = xOf(bar, beat), next = MELODY[i + 1] ? xOf(MELODY[i + 1][0], MELODY[i + 1][1]) : x0 + 5;
    const x1 = Math.min(next - 1, x0 + 4);
    for (let x = x0; x <= Math.max(x0 + 1, x1); x++) { c.put(x, yOf(m)); c.put(x, yOf(m) + 1); }
  });
  return c;
}

// ---------------------------------------------------------------- the same graph, three ways
// Font coverage decides the symbols in a real terminal: Braille for full resolution, block
// characters at half of it, and three plain symbols for a bare console.
function blockRows(cols = 70, rows = 2) {
  const v = spikeValues(cols), out = [];
  for (let r = 0; r < rows; r++) {
    let s = '';
    for (let i = 0; i < cols; i++) {
      const lv = Math.round(v[i] * rows * 2) - (rows - 1 - r) * 2; // half cells filled in this row
      s += lv >= 2 ? '█' : lv === 1 ? '▄' : ' ';
    }
    out.push(s.replace(/\s+$/, ''));
  }
  return out;
}
function ttyRow(cols = 70) {
  return spikeValues(cols).map((x) => (x >= 0.7 ? '|' : x >= 0.4 ? '^' : '_')).join('');
}

// ---------------------------------------------------------------- the colour twin (SVG)
// Half-block manner: one character cell holds two square pixels (the upper-half block, with
// a foreground and a background colour), so it needs colour, which plain text on GitHub does
// not have. This is the same island as the hero at half its resolution in both directions,
// 72 x 34 pixels = 72 cells x 17 lines, drawn as an SVG. Under it, the event skyline in
// Braille dots, tinted along its height from green through yellow to red, as terminal
// monitors do, and scrolling left one whole cell at a time, newest at the right.
const OUT_SVG = path.resolve(HERE, '..', 'assets', '55-braille-dot-graphics_opus_5.5-truecolor.svg');
class Pix {
  constructor(w, h) { this.w = w; this.h = h; this.c = new Array(w * h).fill(null); this.p = new Uint8Array(w * h); this.layer = 1; }
  in(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
  get(x, y) { return this.in(x, y) ? this.c[y * this.w + x] : null; }
  put(x, y, col) {
    x = Math.round(x); y = Math.round(y);
    if (col && this.in(x, y)) { this.c[y * this.w + x] = col; this.p[y * this.w + x] = this.layer; }
  }
  fill(inside, col) {
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (inside(x, y)) { const v = typeof col === 'function' ? col(x, y) : col; if (v) this.put(x, y, v); }
    }
  }
}
const mix = (a, b, t) => {
  const pa = a.match(/\w\w/g).map((h) => parseInt(h, 16)), pb = b.match(/\w\w/g).map((h) => parseInt(h, 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * Math.max(0, Math.min(1, t))).toString(16).padStart(2, '0')).join('');
};
const COL = {
  skyTop: '#3f97dc', skyLow: '#bfe6f7', sun: '#fff1b8', sunRim: '#ffd666', cloud: '#ffffff', cloudLow: '#d6e8f5',
  seaFar: '#2276c4', seaNear: '#1fb3c4', crest: '#d8f4fb', foam: '#f2fbff', sand: '#f4d9a4', sandLow: '#e4bd7c',
  bush: '#4c9a43', trunk: '#a8653f', bark: '#7b452a', leaf: '#3f9d3d', leafLit: '#6cc24b', nut: '#6e4a2b',
  ship: '#56616c', log: '#a66b3e', logGap: '#6f4024', title: '#fff8e8', titleShade: '#ff7f6b',
};
function heroColour() {
  const c = new Pix(HW, HH);
  c.layer = 1;
  c.fill((x, y) => y < HORIZON, (x, y) => mix(COL.skyTop, COL.skyLow, y / HORIZON));
  c.fill((x, y) => y >= HORIZON, (x, y) => mix(COL.seaFar, COL.seaNear, (y - HORIZON) / (HH - HORIZON)));
  c.layer = 2;
  for (let x = 0; x < HW; x++) c.put(x, HORIZON, COL.seaFar);
  const S = [11, 10.5];
  c.fill(inEllipse(S[0], S[1], 7.2, 7.2), COL.sunRim);
  c.fill(inEllipse(S[0], S[1], 5.4, 5.4), COL.sun);
  const cloud = (x0, yb, bumps) => {
    let x = x0;
    const shapes = bumps.map(([w, hgt]) => { const s0 = [x + w / 2, yb, w / 2, hgt]; x += w * 0.62; return s0; });
    c.fill((px, py) => py <= yb && shapes.some(([cx, cy, rx, ry]) => inEllipse(cx, cy, rx, ry)(px, py)), (px, py) => (py > yb - 3 ? COL.cloudLow : COL.cloud));
  };
  cloud(18, 31, [[10, 5], [13, 9], [12, 7], [9, 4]]);
  cloud(124, 28, [[8, 4], [10, 7], [7, 4]]);
  c.fill((x, y) => x >= 2 && x <= 13 && y >= 32 && y <= 33, COL.ship);
  c.fill((x, y) => x >= 5 && x <= 10 && y >= 30 && y <= 31, '#f4f6f8');
  c.fill((x, y) => x >= 8 && x <= 9 && y >= 28 && y <= 29, '#e05a4f');
  for (const [x, y, L] of [[6, 39, 6], [30, 38, 5], [50, 41, 6], [16, 45, 9], [42, 48, 8], [2, 53, 10], [26, 57, 12], [52, 62, 10], [6, 64, 12], [124, 39, 6], [136, 45, 6]]) {
    for (let i = 0; i <= L; i++) { c.put(x + i, y, COL.crest); c.put(x + i, y + 1, COL.crest); }
  }
  c.layer = 3;
  const I = [97, 60], IRX = 40, IRY = 6.6;
  c.fill(inEllipse(I[0], I[1], IRX + 3.6, IRY + 2.4), COL.foam);
  c.fill(inEllipse(I[0], I[1], IRX, IRY), (x, y) => (y > I[1] + 1 ? COL.sandLow : COL.sand));
  for (const [bx, by, bw] of [[95, 55, 11], [119, 56, 8]]) c.fill(inEllipse(bx, by, bw / 2 + 0.5, 3.2), COL.bush);
  c.layer = 4;
  const B = [108, 58], T = [99, 30], K = [111, 43];
  quad(B, K, T, 90).forEach(([x, y], i) => {
    const r = 2.6 - (i / 91) * 1.0;
    c.fill((px, py) => Math.abs(px - x) < 4 && Math.abs(py - y) < 4 && Math.hypot(px + 0.5 - x, py + 0.5 - y) <= r, (px, py) => (py % 4 === 0 ? COL.bark : COL.trunk));
  });
  const LEAVES = [
    [[1, -1], [-5, -4], [-12, -5], [-19, -3], [-25, 1], [-29, 7]],
    [[0, 1], [-6, 2], [-12, 5], [-16, 10], [-18, 15]],
    [[-1, 0], [-3, -5], [-7, -9]],
    [[-1, -1], [5, -4], [12, -5], [19, -3], [25, 1], [29, 7]],
    [[0, 1], [6, 2], [12, 5], [16, 10], [18, 15]],
    [[1, 0], [3, -5], [7, -9]],
  ];
  for (const f of LEAVES) {
    const pts = f.map(([dx, dy]) => [T[0] + dx, T[1] + dy]);
    stroke(c, [pts], f.length > 4 ? 2.2 : 1.6, (x, y) => (y < T[1] - 1 ? COL.leafLit : COL.leaf));
  }
  for (const [x, y] of [[97.5, 31.5], [101, 32], [99.2, 34]]) c.fill(inEllipse(x, y, 1.5, 1.5), COL.nut);
  for (let k = 0; k < 4; k++) {
    for (let x = 131 - k; x < HW; x++) { c.put(x, 58 + k * 2, COL.log); c.put(x, 59 + k * 2, COL.log); }
  }
  for (const x of [135, 140]) for (let y = 57; y <= 66; y++) c.put(x - (y - 57) / 2, y, COL.logGap);
  c.layer = 6;
  const H = 18, R = 1.75, GAP = 2, LEFT = 24;
  const probe = wordmark('CASTAWAY', 0, 0, H, 2.0, GAP);
  const wm = wordmark('CASTAWAY', Math.round(LEFT + (HW - LEFT - probe.width) / 2), 1, H, R, GAP);
  const shade = wm.lines.map((pl) => pl.map(([x, y]) => [x + 2, y + 2]));
  stroke(c, shade, R, () => COL.titleShade);
  stroke(c, wm.lines, R, () => COL.title);
  return c;
}
// Two dots across and two down become one pixel: the colour that covers most of the block,
// with ties going to whatever was drawn on the higher layer.
function halve(c) {
  const w = c.w / 2, h = c.h / 2, out = [];
  for (let y = 0; y < h; y++) {
    const row = [];
    for (let x = 0; x < w; x++) {
      const tally = new Map();
      for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
        const i = (y * 2 + dy) * c.w + x * 2 + dx, k = c.c[i];
        const e = tally.get(k) || { n: 0, p: 0 };
        e.n++; e.p = Math.max(e.p, c.p[i]); tally.set(k, e);
      }
      row.push([...tally.entries()].sort((a, b) => b[1].n - a[1].n || b[1].p - a[1].p)[0][0]);
    }
    out.push(row);
  }
  return out;
}
// Her, drawn by hand at half-block size: cream headphones, brown hair and low bun, coral tank
// top, cream shorts, bare feet.
const HER_COLOURS = { p: '#f3ead7', h: '#6b4226', s: '#e9b48e', t: '#ff7f6b', c: '#efe2c6' };
const HER_PIX = [
  '.ppppp.',
  'pp.h.pp',
  'pp.s.pp',
  '.h.s...',
  '.ttttt.',
  's.ttt.s',
  '..ccc..',
  '..c.c..',
  '..s.s..',
  '..s.s..',
];
const TINT = ['#3fb950', '#7fc34a', '#c3c63f', '#d29922', '#e8743a', '#f85149'];
function truecolorSvg() {
  const PX = 10, X0 = 20, Y0 = 20, IW = (HW / 2) * PX, IH = (HH / 2) * PX;
  const img = halve(heroColour());
  HER_PIX.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== '.') img[20 + y][37 + x] = HER_COLOURS[ch]; }));
  // runs of one colour per pixel row become one path per colour
  const byCol = new Map();
  img.forEach((row, y) => {
    for (let x = 0; x < row.length;) {
      let e = x;
      while (e < row.length && row[e] === row[x]) e++;
      const list = byCol.get(row[x]) || [];
      list.push(`M${X0 + x * PX} ${Y0 + y * PX}h${(e - x) * PX}v${PX}h-${(e - x) * PX}z`);
      byCol.set(row[x], list);
      x = e;
    }
  });
  const picture = [...byCol.entries()].map(([col, d]) => `<path fill="${col}" d="${d.join('')}"/>`).join('\n');
  // the skyline, in Braille dot positions: 10 x 20 px cells, dots 5 px apart across, 4.5 down
  const chart = eventChart(20);
  const CY0 = Y0 + IH + 30, rows = chart.h / 4, CH = rows * 20;
  const dotsByTint = TINT.map(() => []);
  for (const copy of [0, 1]) {
    for (let y = 0; y < chart.h; y++) for (let x = 0; x < chart.w; x++) {
      if (!chart.get(x, y)) continue;
      const cx = Math.floor(x / 2), cy = Math.floor(y / 4);
      const px = X0 + copy * IW + cx * PX + 2.75 + (x % 2) * 4.5, py = CY0 + cy * 20 + 3.5 + (y % 4) * 4.3;
      const t = Math.min(TINT.length - 1, Math.max(0, Math.floor(((chart.h - 4 - y) / (chart.h - 6)) * TINT.length)));
      dotsByTint[t].push(`M${px.toFixed(2)} ${py.toFixed(2)}m-1.6 0a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0`);
    }
  }
  const dots = dotsByTint.map((d, i) => (d.length ? `<path fill="${TINT[i]}" d="${d.join('')}"/>` : '')).join('\n');
  const W = IW + 2 * X0, Hh = CY0 + CH + 20;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${Hh}" width="${W}" height="${Hh}" role="img" aria-labelledby="t d">
<title id="t">Castaway, in colour, in half blocks and Braille</title>
<desc id="d">The CASTAWAY title over the island at two pixels per character cell, in colour, and under it the event chart of one 10-hour run in Braille dots, tinted green to red by height, scrolling left one cell at a time.</desc>
<style>
.scroll{animation:scroll 36s steps(72) infinite}
@keyframes scroll{to{transform:translateX(-${IW}px)}}
@media (prefers-reduced-motion:reduce){.scroll{animation:none}}
</style>
<defs><clipPath id="chart"><rect x="${X0}" y="${CY0 - 4}" width="${IW}" height="${CH + 8}"/></clipPath></defs>
<rect x="0.5" y="0.5" width="${W - 1}" height="${Hh - 1}" rx="12" fill="#0e1217" stroke="#30363d"/>
${picture}
<g clip-path="url(#chart)"><g class="scroll">
${dots}
</g></g>
</svg>
`;
}
fs.mkdirSync(path.dirname(OUT_SVG), { recursive: true });
fs.writeFileSync(OUT_SVG, truecolorSvg());

// ---------------------------------------------------------------- inline markup
// Bold and links are marker characters while lines are built, so widths can be measured
// exactly; the HTML is made at the very end.
const links = [];
const B = (s) => `\u0001${s}\u0002`;
const A = (s, href = s) => {
  links.push(href);
  return `\u0003${String.fromCharCode(0xe000 + links.length - 1)}${s}\u0004`;
};
const visible = (s) => s.replace(/\u0003[\ue000-\uf8ff]/g, '').replace(/[\u0001\u0002\u0004]/g, '');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const toHtml = (s) => esc(s)
  .replace(/\u0001/g, '<b>').replace(/\u0002/g, '</b>')
  .replace(/\u0003([\ue000-\uf8ff])/g, (m, ch) => `<a href="${links[ch.charCodeAt(0) - 0xe000]}">`)
  .replace(/\u0004/g, '</a>');
const M = '  '; // the shared left margin: pictures and text both start here
function pre(lines) {
  for (const l of lines) {
    const v = visible(l);
    if ([...v].length > 78) throw new Error(`line too wide (${[...v].length}): ${v}`);
    if (/\s$/.test(v)) throw new Error(`trailing space: ${v}`);
    if (/\u2800/.test(v)) throw new Error('blank Braille cell');
    if (/[\u2801-\u28ff]/.test(v) && /[^\u2801-\u28ff]/.test(v.slice(M.length))) throw new Error(`mixed Braille row: ${v}`);
  }
  return `<pre>\n${lines.map(toHtml).join('\n')}\n</pre>`;
}
const art = (c) => c.braille().map((r) => M + r);
const hms = (s) => `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(Math.round(s) % 60).padStart(2, '0')}`;
const pct = (x) => `${Math.round(x * 100)}%`;
const meter = (label, n, max, width, value, note) => {
  const k = n <= 0 ? 0 : Math.max(1, Math.round((n / max) * width));
  return `${M}${label.padEnd(12)}${'■'.repeat(k)}${'·'.repeat(width - k)} ${String(value).padStart(4)}  ${note}`;
};

// ---------------------------------------------------------------- the header
const h = hero();
if (DEBUG) console.log(h.dump());
const busy = pct(BUSY_TOTAL), idle = pct(1 - BUSY_TOTAL);
const colMin = `${Math.floor(RUN / COLS / 60)} min ${Math.round(RUN / COLS) % 60} s`;

const top = pre([
  `${M}lulltop · castaway · run 10:00:00 · seed 1992 · 1080p30 · daylight 100%`,
  '',
  ...art(h),
  '',
  `${M}${B('CASTAWAY')} · ten hours on one tiny island, one tall palm, one raft`,
  `${M}she idles. every so often, something happens. mostly, the lines stay flat.`,
  '',
  `${M}┌ events · one simulated 10-hour run, seed 1992 · the rarer, the taller`,
  ...art(eventChart()),
  `${M}└ ${EVENTS.length} events. she is busy ${busy} of the run and nodding along for ${idle}.`,
  '',
  `${M}┌ events per 10-hour run, by timer · median of 200 simulated runs`,
  ...TIERS.map(([name, n, every]) => meter(name, n, 155, 30, `~${n}`, every)),
  meter('samples', 0, 1, 30, 0, 'every sound is code'),
  '',
  `${M}$ python ${A('tools/serve.py')}     then open ${A('http://127.0.0.1:8765/')}`,
]);

// --- the run, lane by lane
// What lulltop logged, in plain words (only the wholesome bits, which is all of them here).
const LOG = [
  [1458, 'a ship crosses the horizon. she is sipping a coconut.'],
  [2646, 'a stray cat drifts in on a crate, climbs the palm, naps.'],
  [3642, 'a sandcastle.'],
  [4077, 'the tide comes for the sandcastle.'],
  [4881, 'a hammock. one end on the palm, the other on the raft.'],
  [11055, 'a message in a bottle. it washes straight back.'],
  [12963, 'a coconut lands on a hermit crab. later, the coconut leaves.'],
  [14469, 'a ship. she is not even busy. headphones.'],
  [21906, 'a different bottle washes up. it is a reply. she smiles.'],
  [22044, 'one bar of signal, at the top of the palm.'],
  [35049, 'the cat again. same crate.'],
  [RUN, `end of run. ${CASTLES.length} sandcastles, 0 standing. 0 ships seen.`],
];
const log = pre([
  `${M}lulltop --log · seed 1992 · simulated 2026-10-01 · ${HER_RUN.length} things she did`,
  '',
  `${M}┌ ships · ${SHIPS.length} crossed the horizon, ${SHIPS.length - 1} of them while she was busy`,
  ...art(laneRow(SHIPS.map(([s]) => s), SHIP)),
  `${M}┌ the cat · ${CATS.length} visits on a crate · 1:49:40 on the island in all`,
  ...art(laneRow(CATS.map(([s]) => s), CAT)),
  `${M}┌ sandcastles · ${CASTLES.length} built · ${TIDES.length} taken by the tide · standing now: 0`,
  ...art(laneRow(CASTLES, CASTLE)),
  `${M}┌ signal · 0 bars, except for ${Math.floor(SIGNAL[1] / 60)} min ${SIGNAL[1] % 60} s at the top of the palm`,
  ...art(laneRow([SIGNAL[0]], BARS)),
  `${M}└ 0:00:00 on the left, 10:00:00 on the right`,
  '',
  ...LOG.map(([t, what]) => `${M}${hms(t).padStart(8)}  ${what}`),
]);

const sound = pre([
  `${M}lulltop --sound · ${A('tools/make_audio.py')} · samples 0 · loops 0 · recordings 0`,
  '',
  `${M}┌ kalimba lead · bars 7 to 20 of the 60 s theme · E5 up to G6`,
  ...art(melodyChart()),
  `${M}└ dotted lines: Gm9 · C13 · Fmaj9 · Dm9 come round again, every 4 bars`,
  '',
  `${M}tempo ...... 80 bpm, F major, ii-V-I-vi, 20 bars of exactly 3 s`,
  `${M}players .... electric piano, kalimba, soft drums, vinyl crackle`,
  `${M}the sea .... its own seamless 60 s loop`,
  `${M}loudness ... -14 LUFS, true peak at or below -1 dBTP`,
  `${M}levels ..... a master, and one per routine`,
  `${M}heard by ... nobody yet. the plot is all we have.`,
]);

const symbols = pre([
  `${M}lulltop --symbols braille`,
  ...art(eventChart(16)),
  '',
  `${M}lulltop --symbols block`,
  ...blockRows().map((r) => M + r),
  '',
  `${M}lulltop --symbols tty`,
  M + ttyRow(),
]);

const md = `<!-- Header 55-braille-dot-graphics_opus_5.5 for Castaway. Generated by src/55-braille-dot-graphics_opus_5.5.mjs: edit that, not this. -->

${top}

**Castaway** (working title) is a ten-hour lo-fi video for YouTube in which almost nothing happens, on purpose. A young woman sits on a very small island with one tall palm, a raft and her headphones, nodding to the music, and every so often something happens: a message in a bottle washes straight back, a coconut lands on a hermit crab and later walks off with the crab inside, a stray cat drifts in on a crate, climbs the palm and naps. It is an unofficial remake inspired by the small-island routines and visual comedy of the 1992 screensaver *Johnny Castaway*, repainted as a sunny, hand-painted coastal scene. 16:9, 1080p, 30 fps, and it is always daytime.

[\`activities.toml\`](activities.toml) lists more than 90 activities, most of them on four timers, from a coconut every few minutes to "she could leave any time", which some videos never get to see. Every one of them waits for the next bar of the music, so the gags land on the beat. Every sound is synthesized from code by [\`tools/make_audio.py\`](tools/make_audio.py): no samples, no loops, no recordings. The charts above were plotted from the project's own numbers on 2026-10-01, one simulated run with the default seed. By the time you read this the schedule will have grown, which is more than can be said for the sandcastles.

\`\`\`sh
python tools/serve.py      # then open http://127.0.0.1:8765/
python tools/schedule.py   # check the schedule, simulate 10 hours
\`\`\`

The page encodes frame-exact H.264 in the browser with WebCodecs (68 to 78 frames a second at 1080p30 in Chrome), and the server mixes in the sound and joins the two into a YouTube-ready MP4. Plain ES modules, no build step, no npm packages. [\`tools/render_demo.py --dev\`](tools/render_demo.py) is the older Python reference renderer, and draws a reel of every activity with a heads-up display. Working notes live in [\`MUSING.md\`](MUSING.md).

<details>
<summary><b>lulltop --log</b>: one whole ten-hour run, lane by lane, with timestamps</summary>

${log}

</details>

<details>
<summary><b>lulltop --sound</b>: the 60-second theme, plotted note by note</summary>

${sound}

</details>

<details>
<summary><b>lulltop --symbols</b>: the same run in Braille, in blocks, in three plain symbols, and in colour</summary>

${symbols}

Terminal plotters pick their symbols by what the font can draw: Braille gives 2 x 4 dots a cell, block characters give half of that, and a bare console gets three plain symbols. The same 10 hours, three times.

Given colour, a cell can also hold two square pixels, an upper-half block in one colour over a background in another. Text on GitHub has no colour, so that version has to be a picture: the island at half the resolution of the one at the top, and the chart tinted by height the way terminal monitors do it, scrolling one cell at a time.

<p align="center">
  <img src="assets/55-braille-dot-graphics_opus_5.5-truecolor.svg" width="760" alt="The same Castaway picture in colour, two square pixels to a character cell: the title CASTAWAY in cream with a coral shadow beside a yellow sun, white clouds, a small ship on the horizon, a blue sea, and a sand island with one tall palm, two bushes and a raft. She stands by the palm in cream headphones, a coral tank top and cream shorts. Below, the events of one simulated 10-hour run as Braille dots, green near the floor, yellow and red higher up, scrolling slowly to the left.">
</p>

</details>

<details>
<summary><b>about these dots</b>: how the header is drawn, and the small print</summary>

<br>

Everything above is text. Each Braille character is a 2 x 4 grid of dots, so the island picture is 144 x 68 dots in 72 characters by 17 lines, drawn by a script in plain Node and written out one character at a time.

Two rules keep it lined up in fonts nobody controls. A picture line holds Braille and nothing else, and it never uses the empty Braille cell, because on Windows that one character is narrower than the other 255 and would pull the rest of its line out of place. A cell with nothing in it gets a single dot instead, which is why a faint grid sits behind everything, like plot paper. On Windows the Braille also comes out a little wider than the plain text beside it. It is meant to.

Screen readers announce Braille as Braille, which here would be nonsense, so every name and number in the charts is also written out in plain text next to them.

*lulltop* is not a real program: it is a monitor for places where nothing happens, invented for this header. *Johnny Castaway* and its characters belong to their owners; Castaway is an unofficial, original project and is not affiliated with them.

</details>
`;

fs.writeFileSync(OUT_MD, md);
console.log(`wrote ${path.relative(process.cwd(), OUT_MD)} (${md.length} bytes)`);
