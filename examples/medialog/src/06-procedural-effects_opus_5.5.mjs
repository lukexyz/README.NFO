#!/usr/bin/env node
// 06-procedural-effects_opus_5.5: MediaLog as a 1993 VGA voxel flight.
//
// Style: full-frame procedural effects of the early-90s PC demoscene
// (catalogue entry demo-03), here the voxel landscape: terrain drawn column
// by column from a height map and a colour map, shading baked in, darker and
// hazier with distance, the look that height-map flight sims and the demos
// after them made famous. The named productions in the catalogue are credited
// references only; every pixel, palette, letter and word here was made for
// this file, for MediaLog.
//
//   node examples/medialog/src/06-procedural-effects_opus_5.5.mjs
//   node examples/medialog/src/06-procedural-effects_opus_5.5.mjs --debug=some/dir
//
// Regenerates ../assets/06-procedural-effects_opus_5.5.svg. Plain Node, no
// dependencies, deterministic: all randomness is hashed from a fixed seed,
// never the clock. --debug also writes stills of the whole banner (one per
// palette) and the bitmaps it is made of, scaled up, into a folder.
//
// THE SCREEN. One 320 x 132 screen of square VGA pixels, drawn with
// nearest-neighbour scaling so every pixel stays a block.
//
// THE FLIGHT. Rolling hills, planted in stripes: one stripe per kind of
// media, each in that kind's colour (movies red, TV and anime blue, videos
// plum, books amber, comics and manga magenta, games green, podcasts violet,
// music teal). The camera flies forward along the stripes. Script-free SVG
// cannot raycast, so the flight is precomputed here: 30 frames, one hill
// apart from first to last, rendered by the classic algorithm (for every
// screen column, march away from the camera and draw only what rises above
// everything nearer), stacked into one sprite sheet and flipped through with
// a stepped CSS animation. The hills repeat every 120 units, so the last
// frame flows straight back into the first.
//
// LEVEL OF DETAIL. Like every voxel engine, this one gets lazier with
// distance: the nearest band is drawn at full resolution (blossoms and all),
// the next at half (2 x 2 blocks), the next at quarter (4 x 4 blocks), and
// past the draw distance there is only fog. A MediaLog entry does the same
// with dates: near now it has a day, further back a month, and further back
// still it goes under "sometime in". The ruler on the right labels the
// bands as five-year blocks, the way MediaLog's timeline groups them.
//
// THE PALETTE. The sheet is not stored in colour. Every pixel is a byte, an
// index into a palette (kind x shade x fog level, sorted by brightness), and
// an SVG filter (feComponentTransfer, type discrete) plays the VGA DAC that
// turns indices into colours. Swapping the palette recolours the whole
// landscape at once, the oldest trick of the 256-colour era: the tagline's
// verb changes every hill, and the palette keeps only the kinds that verb
// covers in colour (watched: movies, TV, anime, videos; read: books, comics,
// manga; played: games; listened to: podcasts, music). Everything else goes
// fallow. The play triangle in the mark changes with it.
//
// The loop is 14.4 seconds: six hills of 2.4 seconds, two with every kind in
// colour, then one per verb. prefers-reduced-motion holds the first frame,
// every kind in colour.

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '06-procedural-effects_opus_5.5';
const argv = process.argv.slice(2);
const opt = (k, d = null) => {
  const a = argv.find((s) => s.startsWith(`--${k}=`));
  return a ? a.slice(k.length + 3) : d;
};
const OUT = path.resolve(opt('out', path.join(HERE, '..', 'assets', `${SLUG}.svg`)));
const DEBUG = opt('debug');

// ------------------------------------------------------------------ screen and clock
const W = 320, H = 132;
const YH = 64;              // horizon row
const TH = H - YH;          // terrain rows (the sprite-sheet frame height)
const FOC = 160;            // focal length in pixels (a 90 degree view)
const CAMH = 48;            // camera height
const PER = 120;            // hills repeat every PER units along the flight
const NFR = 30;             // frames per hill
const HILL = 2.4;           // seconds per hill
const NSTATE = 5;           // palettes: all kinds, then one per verb
const STATE_HILLS = [2, 1, 1, 1, 1]; // how many hills each palette lasts
const LOOP = +(HILL * STATE_HILLS.reduce((a, b) => a + b, 0)).toFixed(3); // 14.4 s
const stateStart = (s) => HILL * STATE_HILLS.slice(0, s).reduce((a, b) => a + b, 0);
const Z1 = 180, Z2 = 340;   // level-of-detail bands: full, half, quarter resolution
const ZD = 900;             // draw distance: fog is total here
const SEED = 2015;

// ------------------------------------------------------------------ small maths
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const mod = (a, n) => ((a % n) + n) % n;
const f2 = (v) => (Math.round(v * 100) / 100).toString();
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => [0, 1, 2].map((k) => lerp(a[k], b[k], t));
const rgbHex = (c) => '#' + c.map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const bayer = (x, y) => BAYER[(y & 3) * 4 + (x & 3)];

function hash2(i, j, s) {
  let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(s, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
// value noise; px/py > 0 make it periodic (in lattice cells)
function vnoise(x, y, s, px = 0, py = 0) {
  const xi = Math.floor(x), yi = Math.floor(y);
  let fx = x - xi, fy = y - yi;
  fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
  const w = (i, j) => hash2(px ? mod(i, px) : i, py ? mod(j, py) : j, s);
  return lerp(lerp(w(xi, yi), w(xi + 1, yi), fx), lerp(w(xi, yi + 1), w(xi + 1, yi + 1), fx), fy);
}

// ------------------------------------------------------------------ PNG out
const CRC = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
// rows: packed scanlines; bpp: bytes per pixel for the filters. Each row gets
// whichever of the five PNG filters leaves the smallest residuals.
function pngRaw(w, h, depth, colorType, rows, bpp, extra = []) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = depth; ihdr[9] = colorType;
  const out = [];
  let prev = new Uint8Array(rows[0].length);
  for (const cur of rows) {
    let best = null, bestSum = Infinity;
    for (let f = 0; f < 5; f++) {
      const line = new Uint8Array(cur.length + 1);
      line[0] = f;
      let sum = 0;
      for (let i = 0; i < cur.length; i++) {
        const a = i >= bpp ? cur[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
        let pred = 0;
        if (f === 1) pred = a;
        else if (f === 2) pred = b;
        else if (f === 3) pred = (a + b) >> 1;
        else if (f === 4) {
          const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          pred = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
        }
        const v = (cur[i] - pred) & 255;
        line[i + 1] = v;
        sum += v < 128 ? v : 256 - v;
      }
      if (sum < bestSum) { bestSum = sum; best = line; }
    }
    out.push(best);
    prev = cur;
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr), ...extra,
    chunk('IDAT', zlib.deflateSync(Buffer.concat(out), { level: 9, memLevel: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}
// 8-bit greyscale from bytes
function pngGrey(w, h, bytes) {
  const rows = [];
  for (let y = 0; y < h; y++) rows.push(bytes.subarray(y * w, (y + 1) * w));
  return pngRaw(w, h, 8, 0, rows, 1);
}
// palette PNG from indices (<= 256 colours), packed to 1/2/4/8 bits
function pngPal(w, h, idx, pal) {
  const n = pal.length;
  const depth = n <= 2 ? 1 : n <= 4 ? 2 : n <= 16 ? 4 : 8;
  const perByte = 8 / depth;
  const rows = [];
  for (let y = 0; y < h; y++) {
    const r = new Uint8Array(Math.ceil(w / perByte));
    for (let x = 0; x < w; x++) {
      const v = idx[y * w + x];
      r[Math.floor(x / perByte)] |= v << (8 - depth * (1 + (x % perByte)));
    }
    rows.push(r);
  }
  const plte = Buffer.alloc(n * 3);
  pal.forEach((c, i) => { plte[i * 3] = c[0]; plte[i * 3 + 1] = c[1]; plte[i * 3 + 2] = c[2]; });
  return pngRaw(w, h, depth, 3, rows, 1, [chunk('PLTE', plte)]);
}
// RGB (debug stills), scaled up s times
function pngRGB(w, h, rgb, s = 1) {
  const rows = [];
  for (let y = 0; y < h * s; y++) {
    const r = new Uint8Array(w * s * 3);
    for (let x = 0; x < w * s; x++) {
      const i = (Math.floor(y / s) * w + Math.floor(x / s)) * 3;
      r[x * 3] = rgb[i]; r[x * 3 + 1] = rgb[i + 1]; r[x * 3 + 2] = rgb[i + 2];
    }
    rows.push(r);
  }
  return pngRaw(w * s, h * s, 8, 2, rows, 3);
}
const dataUri = (buf) => `data:image/png;base64,${buf.toString('base64')}`;
const sizes = [];

// ------------------------------------------------------------------ masks to paths
// A mask (Uint8Array, w x h) as one path of rectangles: runs per row, then
// identical runs on consecutive rows merged downward.
function maskPath(mask, w, h, ox = 0, oy = 0) {
  const open = new Map(); const rects = [];
  for (let y = 0; y <= h; y++) {
    const runs = [];
    if (y < h) {
      let x = 0;
      while (x < w) {
        if (!mask[y * w + x]) { x++; continue; }
        let e = x; while (e < w && mask[y * w + e]) e++;
        runs.push([x, e - x]); x = e;
      }
    }
    const next = new Map();
    for (const [x, len] of runs) {
      const k = `${x},${len}`;
      if (open.has(k)) { const r = open.get(k); r.h++; next.set(k, r); open.delete(k); }
      else { const r = { x, y, w: len, h: 1 }; rects.push(r); next.set(k, r); }
    }
    open.clear(); for (const [k, v] of next) open.set(k, v);
  }
  return rects.map((r) => `M${ox + r.x} ${oy + r.y}h${r.w}v${r.h}h${-r.w}z`).join('');
}
function dilate(m, w, h) {
  const o = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!m[y * w + x]) continue;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const X = x + dx, Y = y + dy;
      if (X >= 0 && Y >= 0 && X < w && Y < h) o[Y * w + X] = 1;
    }
  }
  return o;
}
const gridMask = (rows) => {
  const h = rows.length, w = rows[0].length, m = new Uint8Array(w * h);
  rows.forEach((r, y) => { for (let x = 0; x < w; x++) if (r[x] === '#') m[y * w + x] = 1; });
  return { m, w, h };
};

// ================================================================== THE KINDS
// Colours sampled from MediaLog's own screens (close, not exact), in stripe
// order, left to right: the verbs are dealt out in turn, so whichever verb
// is lit has a stripe within three of the one the camera flies along.
const KINDS = [
  { name: 'MOVIES', c: hex('#c23b3b') },
  { name: 'BOOKS', c: hex('#a96d12') },
  { name: 'GAMES', c: hex('#5f8a14') },
  { name: 'PODCASTS', c: hex('#6c44bf') },
  { name: 'TV, ANIME', c: hex('#2879b8') },
  { name: 'COMICS, MANGA', c: hex('#b8327f') },
  { name: 'MUSIC', c: hex('#0e8a73') },
  { name: 'VIDEOS', c: hex('#6e2b5c') },
];
const VERBS = [
  { word: 'WATCHED', kinds: [0, 4, 7], ink: '#ff8c7c' },
  { word: 'READ', kinds: [1, 5], ink: '#ffc861' },
  { word: 'PLAYED', kinds: [2], ink: '#b6e25c' },
  { word: 'LISTENED TO', kinds: [3, 6], ink: '#6fe6c8' },
];
// state 0 = every kind in colour; state i = VERBS[i - 1] only
const lit = (state, k) => state === 0 || VERBS[state - 1].kinds.includes(k);

const SOIL = hex('#2e2134');          // the paths between the stripes
const FOG = hex('#ecc9cf');           // the horizon glow: the draw distance
const FALLOW = hex('#77729a');        // a kind the current verb does not cover
const FALLOW_ROW = [1, 0.88, 1.02, 0.86, 0.98, 0.9, 1.04, 0.84];
const NSH = 6, NFOG = 5;              // shade levels, fog levels
const shadeMul = (s) => 0.44 + (s / (NSH - 1)) * 0.8;
const fogAmt = (f) => (f / NFOG) * 0.92;

// A pixel code: kind k (0-7, 8 = soil, 9 = pure fog), shade s, fog level f.
const code = (k, s, f) => k * 64 + s * 8 + f;
function colourOf(cd, state) {
  const k = cd >> 6, s = (cd >> 3) & 7, f = cd & 7;
  if (k === 9) return FOG;
  let base;
  if (k === 8) base = SOIL.map((v) => v * (0.75 + 0.25 * (s / (NSH - 1))));
  else {
    const kc = KINDS[k].c;
    if (lit(state, k)) {
      base = kc.map((v) => v * shadeMul(s));
      if (s === NSH - 1) base = mix(base, [255, 244, 236], 0.12);
    } else {
      // fallow: a lilac grey, every other stripe a shade apart so the rows
      // still read, cool in the shadows and warm where the light catches
      const t = s / (NSH - 1);
      const g = mix(FALLOW, kc, 0.14).map((v) => v * FALLOW_ROW[k]);
      base = mix(g.map((v) => v * (0.34 + t * 0.74)), mix(g, [255, 214, 200], 0.3), t > 0.9 ? 0.3 : 0);
    }
  }
  return mix(base, FOG, fogAmt(f)).map((v) => Math.round(clamp(v, 0, 255)));
}

// ================================================================== THE TERRAIN
// Rolling hills across the flight, their crests wandering left and right,
// with a little noise. Periodic along z (the flight) with period PER.
function height(x, z) {
  const ph = 0.22 * PER * Math.sin((2 * Math.PI * x) / 410) + 0.1 * PER * Math.sin((2 * Math.PI * x) / 157 + 1.3);
  const amp = 0.62 + 0.38 * Math.sin((2 * Math.PI * x) / 530 + 0.7);
  const r = 0.5 - 0.5 * Math.cos((2 * Math.PI * (z + ph)) / PER);
  const n = vnoise(x / 24, z / 24, SEED, 0, PER / 24) - 0.5;
  return HILL_A * amp * r * r * (3 - 2 * r) + 5 * n;
}
const HILL_A = 30;    // hill height
const SWP = 26;       // stripe pitch (stripe plus path), world units
const PATH = 0.11;    // share of the pitch that is path
const LIGHT = (() => { const v = [-0.7, 0.6, -0.4]; const l = Math.hypot(...v); return v.map((a) => a / l); })();
function sample(x, z, fine = false) {
  const sp = x / SWP + 0.5;
  const fr = sp - Math.floor(sp);
  const k = fr < PATH ? 8 : mod(Math.floor(sp), 8);
  const e = 0.7;
  const hx = (height(x + e, z) - height(x - e, z)) / (2 * e);
  const hz = (height(x, z + e) - height(x, z - e)) / (2 * e);
  const nl = Math.hypot(hx, 1, hz);
  const lam = clamp((-hx * LIGHT[0] + LIGHT[1] - hz * LIGHT[2]) / nl);
  let sh = clamp((lam - 0.15) / 0.85);
  // the odd blossom, one world cell across, only where the engine still
  // bothers with detail (the nearest band): they stream past as you fly
  if (fine && k < 8 && hash2(Math.floor(x / 2.2), Math.floor(z / 2.2), SEED + 7) > 0.95) sh += 0.4;
  return { k, sh: clamp(sh) };
}
const fogAt = (z) => clamp(Math.pow(clamp((z - 110) / (ZD - 110)), 0.8));
function codeFor(k, sh, fz) {
  if (fz >= 0.999) return code(9, 0, 0);
  const f = Math.min(NFOG, Math.round(fz * NFOG));
  if (f >= NFOG) return code(9, 0, 0);
  return code(k, Math.min(NSH - 1, Math.round(sh * (NSH - 1))), f);
}
// One frame: rows YH..H-1, camera at depth cz. Per screen column, march
// from the camera to the draw distance, front to back; each sample fills
// only the part of its column that rises above everything nearer. Past Z1
// a sample covers a 2 x 2 block, past Z2 a 4 x 4 block (its kind is the most
// common one under the block, its shade the mean).
function renderFrame(cz) {
  const img = new Uint16Array(W * TH).fill(code(9, 0, 0));
  for (let u = 0; u < W; u++) {
    let ybuf = H;
    let z = 4;
    while (z < ZD * 1.02 && ybuf > YH) {
      const b = z < Z1 ? 1 : z < Z2 ? 2 : 4;
      const bu = Math.floor(u / b);
      const zz = cz + z;
      const wx = ((bu * b + b / 2 - W / 2) / FOC) * z;
      const y = YH + ((CAMH - height(wx, zz)) * FOC) / z;
      const yq = Math.floor(y / b) * b;
      if (yq < ybuf) {
        let k, sh;
        if (b === 1) ({ k, sh } = sample(wx, zz, true));
        else {
          const cnt = new Array(9).fill(0); let ss = 0;
          for (let i = 0; i < 4; i++) {
            const s = sample(((bu * b + (i + 0.5) * (b / 4) - W / 2) / FOC) * z, zz);
            cnt[s.k]++; ss += s.sh;
          }
          k = cnt.indexOf(Math.max(...cnt)); sh = ss / 4;
        }
        const cd = codeFor(k, sh, fogAt(z));
        for (let yy = Math.max(YH, yq); yy < ybuf; yy++) img[(yy - YH) * W + u] = cd;
        ybuf = Math.max(YH, yq);
      }
      z += Math.max(0.25, z * 0.0025) * b;
    }
  }
  return img;
}

const frames = Array.from({ length: NFR }, (_, i) => renderFrame((PER * i) / NFR));
// The palette: every code the frames use, sorted by brightness (all kinds in
// colour), so neighbouring indices look alike and the sheet compresses well.
const usedCodes = [...new Set(frames.flatMap((f) => [...new Set(f)]))]
  .sort((a, b) => lum(colourOf(a, 0)) - lum(colourOf(b, 0)) || a - b);
const NPAL = usedCodes.length;
if (NPAL > 200) throw new Error(`palette too big: ${NPAL}`);
const indexOf = new Map(usedCodes.map((c, i) => [c, i]));
// index i is stored as the grey level in the middle of the i-th of NPAL equal
// bins, so a discrete lookup with NPAL entries lands on it exactly
const greyOf = (i) => Math.round(((i + 0.5) * 255) / NPAL);
const sheet = new Uint8Array(W * TH * NFR);
frames.forEach((f, n) => { for (let i = 0; i < f.length; i++) sheet[n * W * TH + i] = greyOf(indexOf.get(f[i])); });
const sheetPng = pngGrey(W, TH * NFR, sheet);
sizes.push(['sheet', sheetPng.length]);

// The palettes, one per state, as filter lookup tables.
const paletteOf = (state) => usedCodes.map((c) => colourOf(c, state));
const tableVals = (pal, ch) => pal.map((c) => {
  const v = Math.round((c[ch] / 255) * 100) / 100;
  return v === 0 ? '0' : v === 1 ? '1' : v.toString().replace(/^0\./, '.');
}).join(' ');
function paletteFilter(id, state) {
  const pal = paletteOf(state);
  return `<filter id="${id}" filterUnits="userSpaceOnUse" x="0" y="${YH}" width="${W}" height="${TH}" color-interpolation-filters="sRGB">`
    + `<feComponentTransfer><feFuncR type="discrete" tableValues="${tableVals(pal, 0)}"/>`
    + `<feFuncG type="discrete" tableValues="${tableVals(pal, 1)}"/>`
    + `<feFuncB type="discrete" tableValues="${tableVals(pal, 2)}"/></feComponentTransfer></filter>`;
}

// ================================================================== THE SKY
// Dusk: MediaLog's navy at the top down to the glow of the draw distance at
// the horizon, in hard bands with an ordered dither between them (palette
// banding), plus a few stars.
const SKY = ['#121a2e', '#18223a', '#1f2547', '#2b2a57', '#3d2f64', '#55366e', '#713f77', '#8f4c7f', '#ad5f86', '#c97a8f', '#de9c9f', '#ebbab8', rgbHex(FOG)].map(hex);
const SKY_STOPS = [0, 0.16, 0.3, 0.42, 0.52, 0.61, 0.69, 0.76, 0.82, 0.87, 0.92, 0.96, 1];
function makeSky() {
  const idx = new Uint8Array(W * YH);
  for (let y = 0; y < YH; y++) for (let x = 0; x < W; x++) {
    const t = y / (YH - 1);
    let i = 0; while (i < SKY_STOPS.length - 2 && t > SKY_STOPS[i + 1]) i++;
    const fr = (t - SKY_STOPS[i]) / (SKY_STOPS[i + 1] - SKY_STOPS[i]);
    // dither only in the last quarter of each band, so the bands stay hard
    idx[y * W + x] = clamp((fr - 0.72) / 0.28) > bayer(x, y) ? i + 1 : i;
  }
  return idx;
}
const skyIdx = makeSky();
const skyPng = pngPal(W, YH, skyIdx, SKY);
sizes.push(['sky', skyPng.length]);
// stars: three twinkle groups
const STARS = [[], [], []];
for (let i = 0, n = 0; n < 34 && i < 400; i++) {
  const x = Math.floor(hash2(i, 1, SEED) * W), y = Math.floor(hash2(i, 2, SEED) * 30);
  if (y > 3 + hash2(i, 3, SEED) * 30) continue;
  STARS[n % 3].push([x, y, hash2(i, 4, SEED) > 0.82 ? 2 : 1]);
  n++;
}

// ================================================================== LETTERING
// The display face: heavy, condensed, mixed case, drawn for this banner.
// Cap height 24, x-height 17, descender 5; stems 5 wide.
const X7 = 7; // first row of the x-height
const WM = {
  M: [
    '#######.......#######', '########.....########', '#########...#########', '##########.##########',
    '#####################', '#####################', '#####.#########.#####', '#####..#######..#####',
    '#####...#####...#####', '#####....###....#####', '#####.....#.....#####',
    ...Array(13).fill('#####...........#####'),
  ],
  e: [
    '...#######...', '.###########.', '#############', '#####...#####', '#####...#####', '#####...#####',
    '#############', '#############', '#############', '#####........', '#####........', '#####....####',
    '#####...#####', '#############', '.###########.', '..#########..', '....#####....',
  ],
  d: [
    ...Array(7).fill('........#####'),
    '...##########', '.############', '#############',
    ...Array(11).fill('#####...#####'),
    '#############', '.############', '...######.###',
  ],
  i: ['#####', '#####', '#####', '#####', '#####', '.....', '.....', ...Array(17).fill('#####')],
  a: [
    '..#########..', '.###########.', '#############', '#####...#####', '........#####', '..###########',
    '.############', '#############', '#####...#####', '#####...#####', '#####...#####', '#####...#####',
    '#####..######', '#############', '.############', '..#######.###', '....###......',
  ],
  L: [...Array(19).fill('#####.......'), ...Array(5).fill('############')],
  o: [
    '...#######...', '.###########.', '#############',
    ...Array(11).fill('#####...#####'),
    '#############', '.###########.', '...#######...',
  ],
  g: [
    '...##########', '.############', '#############',
    ...Array(10).fill('#####...#####'),
    '#############', '.############', '...######.###',
    '........#####', '#####...#####', '#############', '.###########.', '...#######...',
  ],
};
// rows above the baseline: caps and ascenders 24, x-height 17
const WM_TOP = { M: 0, e: X7, d: 0, i: 0, a: X7, L: 0, o: X7, g: X7 };
const WM_ROWS = 29, WM_GAP = 2;
function wordmarkMask(word) {
  const ws = [...word].map((c) => WM[c][0].length);
  const w = ws.reduce((a, b) => a + b, 0) + WM_GAP * (word.length - 1);
  const m = new Uint8Array(w * WM_ROWS);
  let x0 = 0;
  [...word].forEach((c, i) => {
    const g = WM[c];
    if (g.some((r) => r.length !== g[0].length)) throw new Error(`ragged glyph ${c}`);
    g.forEach((row, y) => { for (let x = 0; x < row.length; x++) if (row[x] === '#') m[(y + WM_TOP[c]) * w + x0 + x] = 1; });
    x0 += ws[i] + WM_GAP;
  });
  return { m, w, h: WM_ROWS };
}
// MediaLog's mark, redrawn in pixels: an open book with a play triangle on
// the left page and a pen on the right.
const BOOK_ROWS = [
  '#############...#############',
  '#############################',
  '#############################',
  '###..........###..........###',
  '###..........###.......##.###',
  '###..#.......###......###.###',
  '###..##......###......###.###',
  '###..###.....###.....###..###',
  '###..####....###.....###..###',
  '###..#####...###....###...###',
  '###..######..###....###...###',
  '###..#####...###...###....###',
  '###..####....###...###....###',
  '###..###.....###...##.....###',
  '###..##......###..##......###',
  '###..#.......###..#.......###',
  '###..........###..........###',
  '###..........###..........###',
  '######.......###.......######',
  '#########....###....#########',
  '.###########.###.###########.',
  '....#####################....',
  '.........###########.........',
  '.............###.............',
];
const bookMask = () => gridMask(BOOK_ROWS);

// The text face: bold, 7 rows, 2-pixel stems, proportional, drawn for this
// banner in the spirit of the chunky BIOS-era screen fonts.
const TF = {
  A: ['.####.', '##..##', '##..##', '######', '##..##', '##..##', '##..##'],
  B: ['#####.', '##..##', '##..##', '#####.', '##..##', '##..##', '#####.'],
  C: ['.####.', '##..##', '##....', '##....', '##....', '##..##', '.####.'],
  D: ['#####.', '##..##', '##..##', '##..##', '##..##', '##..##', '#####.'],
  E: ['######', '##....', '##....', '#####.', '##....', '##....', '######'],
  F: ['######', '##....', '##....', '#####.', '##....', '##....', '##....'],
  G: ['.####.', '##..##', '##....', '##.###', '##..##', '##..##', '.#####'],
  H: ['##..##', '##..##', '##..##', '######', '##..##', '##..##', '##..##'],
  I: ['####', '.##.', '.##.', '.##.', '.##.', '.##.', '####'],
  J: ['....##', '....##', '....##', '....##', '##..##', '##..##', '.####.'],
  K: ['##..##', '##.##.', '####..', '###...', '####..', '##.##.', '##..##'],
  L: ['##...', '##...', '##...', '##...', '##...', '##...', '#####'],
  M: ['##...##', '###.###', '#######', '##.#.##', '##...##', '##...##', '##...##'],
  N: ['##..##', '###.##', '######', '##.###', '##..##', '##..##', '##..##'],
  O: ['.####.', '##..##', '##..##', '##..##', '##..##', '##..##', '.####.'],
  P: ['#####.', '##..##', '##..##', '#####.', '##....', '##....', '##....'],
  Q: ['.####.', '##..##', '##..##', '##..##', '##.###', '##..##', '.###.#'],
  R: ['#####.', '##..##', '##..##', '#####.', '##.##.', '##..##', '##..##'],
  S: ['.####.', '##..##', '##....', '.####.', '....##', '##..##', '.####.'],
  T: ['######', '..##..', '..##..', '..##..', '..##..', '..##..', '..##..'],
  U: ['##..##', '##..##', '##..##', '##..##', '##..##', '##..##', '.####.'],
  V: ['##..##', '##..##', '##..##', '##..##', '##..##', '.####.', '..##..'],
  W: ['##...##', '##...##', '##...##', '##.#.##', '#######', '###.###', '##...##'],
  X: ['##..##', '##..##', '.####.', '..##..', '.####.', '##..##', '##..##'],
  Y: ['##..##', '##..##', '##..##', '.####.', '..##..', '..##..', '..##..'],
  Z: ['######', '....##', '...##.', '..##..', '.##...', '##....', '######'],
  0: ['.####.', '##..##', '##.###', '######', '###.##', '##..##', '.####.'],
  1: ['.##.', '###.', '.##.', '.##.', '.##.', '.##.', '####'],
  2: ['.####.', '##..##', '....##', '..###.', '.##...', '##....', '######'],
  3: ['.####.', '##..##', '....##', '..###.', '....##', '##..##', '.####.'],
  4: ['...###', '..####', '.##.##', '##..##', '######', '....##', '....##'],
  5: ['######', '##....', '#####.', '....##', '....##', '##..##', '.####.'],
  6: ['.####.', '##....', '##....', '#####.', '##..##', '##..##', '.####.'],
  7: ['######', '....##', '...##.', '..##..', '..##..', '..##..', '..##..'],
  8: ['.####.', '##..##', '##..##', '.####.', '##..##', '##..##', '.####.'],
  9: ['.####.', '##..##', '##..##', '.#####', '....##', '....##', '.####.'],
  '.': ['..', '..', '..', '..', '..', '##', '##'],
  ',': ['..', '..', '..', '..', '..', '##', '##', '#.'],
  "'": ['##', '##', '#.', '..', '..', '..', '..'],
  '-': ['....', '....', '....', '####', '....', '....', '....'],
  ':': ['..', '##', '##', '..', '##', '##', '..'],
  '!': ['##', '##', '##', '##', '##', '..', '##'],
  '?': ['.####.', '##..##', '....##', '..###.', '..##..', '......', '..##..'],
  '/': ['....##', '...##.', '...##.', '..##..', '.##...', '.##...', '##....'],
  '(': ['.##', '##.', '##.', '##.', '##.', '##.', '.##'],
  ')': ['##.', '.##', '.##', '.##', '.##', '.##', '##.'],
  '+': ['......', '..##..', '..##..', '######', '..##..', '..##..', '......'],
};
const TF_SPACE = 4, TF_GAP = 1, TF_ROWS = 8;
const tfWidth = (s) => [...s].reduce((a, ch, i) => a + (ch === ' ' ? TF_SPACE : TF[ch][0].length) + (i ? TF_GAP : 0), 0);
function tfMask(ch) {
  const g = TF[ch];
  if (!g) throw new Error(`no glyph for "${ch}"`);
  // a 1-pixel border all round, for the outline
  const w = g[0].length + 2, h = TF_ROWS + 2, m = new Uint8Array(w * h);
  g.forEach((row, r) => { for (let c = 0; c < row.length; c++) if (row[c] === '#') m[(r + 1) * w + 1 + c] = 1; });
  return { m, w, h };
}
const EDGE = '#0b1022';
// Text for one SVG: every glyph used becomes one symbol (a dark outline under
// the letter, which takes its colour from the run), placed with <use>.
// run(str, x, y) puts the top-left of the letters at (x, y); `log`, if
// given, collects what was drawn for the debug stills.
function textKit(log = null) {
  const used = new Set();
  const run = (str, x, y, { fill = '#fff6ee', cls = '' } = {}) => {
    const uses = [];
    let cx = 0;
    [...str].forEach((ch, i) => {
      if (i) cx += TF_GAP;
      if (ch === ' ') { cx += TF_SPACE; return; }
      if (!TF[ch]) throw new Error(`no glyph for "${ch}"`);
      used.add(ch);
      uses.push(`<use href="#g${ch.charCodeAt(0)}" x="${cx}"/>`);
      if (log) log.push(['glyph', { ch, x: x + cx, y, fill, cls }]);
      cx += TF[ch][0].length;
    });
    return `<g${cls ? ` class="${cls}"` : ''} fill="${fill}" transform="translate(${x} ${y})">${uses.join('')}</g>`;
  };
  const defs = () => [...used].sort().map((ch) => {
    const { m, w, h } = tfMask(ch);
    return `<g id="g${ch.charCodeAt(0)}"><path fill="${EDGE}" d="${maskPath(dilate(m, w, h), w, h, -1, -1)}"/><path d="${maskPath(m, w, h, -1, -1)}"/></g>`;
  }).join('');
  return { run, defs };
}
const stills = []; // [kind, payload] painted in order by the still renderer
const TXT = textKit(stills);
const textRun = TXT.run;

// ================================================================== ASSEMBLE
const css = [];
const defs = [];
const body = [];
css.push('.px{image-rendering:optimizeSpeed;image-rendering:pixelated}');

// --- sky and stars
body.push(`<image class="px" width="${W}" height="${YH}" href="${dataUri(skyPng)}"/>`);
css.push('.tw{animation:tw 4.8s step-end infinite}@keyframes tw{0%{opacity:1}30%{opacity:.35}45%{opacity:.8}70%{opacity:.5}}');
STARS.forEach((g, i) => {
  const d = g.map(([x, y, s]) => (s === 2 ? `M${x} ${y - 1}h1v3h-1zM${x - 1} ${y}h3v1h-3z` : `M${x} ${y}h1v1h-1z`)).join('');
  body.push(`<path class="tw" style="animation-delay:${f2(-1.6 * i)}s" fill="${i === 1 ? '#ffe9d6' : '#e8ecff'}" d="${d}"/>`);
});

// --- the flight: one sprite sheet, five palettes
defs.push(`<image id="sheet" class="px" y="${YH}" width="${W}" height="${TH * NFR}" href="${dataUri(sheetPng)}"/>`);
defs.push(`<clipPath id="ter"><rect y="${YH}" width="${W}" height="${TH}"/></clipPath>`);
for (let s = 0; s < NSTATE; s++) defs.push(paletteFilter(`p${s}`, s));
css.push(`.fly{animation:fly ${HILL}s steps(${NFR}) infinite}@keyframes fly{to{transform:translateY(-${TH * NFR}px)}}`);
// keyframes for "on during these states, off otherwise" (step-end holds each
// value until the next keyframe)
const pc = (s) => f2((stateStart(s) / LOOP) * 100);
function stateKeys(on, prop, vOn, vOff) {
  const k = [];
  for (let s = 0; s < NSTATE; s++) {
    const v = on.includes(s) ? vOn : vOff;
    if (!k.length || k[k.length - 1][1] !== v) k.push([pc(s), v]);
  }
  return k.map(([p, v]) => `${p}%{${prop}:${v}}`).join('') + `100%{${prop}:${k[k.length - 1][1]}}`;
}
for (let s = 0; s < NSTATE; s++) {
  css.push(`.s${s}{visibility:${s ? 'hidden' : 'visible'};animation:s${s} ${LOOP}s step-end infinite}@keyframes s${s}{${stateKeys([s], 'visibility', 'visible', 'hidden')}}`);
}
body.push(`<g clip-path="url(#ter)">`);
for (let s = 0; s < NSTATE; s++) body.push(`<g class="s${s}" filter="url(#p${s})"><use href="#sheet" class="fly px"/></g>`);
body.push('</g>');

// --- the wordmark and the mark
const WMK = wordmarkMask('MediaLog');
const BOOK = bookMask();
const BOOK_GAP = 6;
const TITLE_W = BOOK.w + BOOK_GAP + WMK.w;
const TX = Math.round((W - TITLE_W) / 2), TY = 5;
const BX = TX, BY = TY;
const WX = TX + BOOK.w + BOOK_GAP;
// the fill: hard bands down the letters, white to the colour of the glow
const BANDS = ['#ffffff', '#fff7f0', '#ffeee4', '#ffe2d8', '#ffd4cd', '#fbc4c3', '#f0b2b9'];
{
  const SH = 3; // the hard offset shadow, as under MediaLog's own search box
  const stops = BANDS.map((c, i) => `<stop offset="${f2(i / BANDS.length)}" stop-color="${c}"/><stop offset="${f2((i + 1) / BANDS.length)}" stop-color="${c}"/>`).join('');
  defs.push(`<linearGradient id="wg" gradientUnits="userSpaceOnUse" x1="0" y1="${TY}" x2="0" y2="${TY + WM_ROWS}">${stops}</linearGradient>`);
  const parts = [[BOOK, BX, BY], [WMK, WX, TY]];
  const shadow = parts.map(([mk, x, y]) => maskPath(mk.m, mk.w, mk.h, x + SH, y + SH)).join('');
  const outline = parts.map(([mk, x, y]) => {
    const pad = { w: mk.w + 2, h: mk.h + 2, m: new Uint8Array((mk.w + 2) * (mk.h + 2)) };
    for (let yy = 0; yy < mk.h; yy++) for (let xx = 0; xx < mk.w; xx++) pad.m[(yy + 1) * pad.w + xx + 1] = mk.m[yy * mk.w + xx];
    const d = dilate(pad.m, pad.w, pad.h);
    stills.push(['mask', { m: d, w: pad.w, h: pad.h, x: x - 1, y: y - 1, c: EDGE }]);
    return maskPath(d, pad.w, pad.h, x - 1, y - 1);
  }).join('');
  // the play triangle on the left page takes the colour of the current verb
  const play = new Uint8Array(BOOK.w * BOOK.h), rest = Uint8Array.from(BOOK.m);
  for (let y = 4; y <= 16; y++) for (let x = 4; x <= 11; x++) if (BOOK.m[y * BOOK.w + x]) { play[y * BOOK.w + x] = 1; rest[y * BOOK.w + x] = 0; }
  const fill = maskPath(rest, BOOK.w, BOOK.h, BX, BY) + maskPath(WMK.m, WMK.w, WMK.h, WX, TY);
  stills.unshift(...parts.map(([mk, x, y]) => ['mask', { m: mk.m, w: mk.w, h: mk.h, x: x + SH, y: y + SH, c: '#070a16' }]));
  parts.forEach(([mk, x, y]) => stills.push(['bands', { m: mk.m, w: mk.w, h: mk.h, x, y }]));
  stills.push(['play', { m: play, w: BOOK.w, h: BOOK.h, x: BX, y: BY }]);
  body.push(`<path fill="#070a16" d="${shadow}"/><path fill="${EDGE}" d="${outline}"/><path fill="url(#wg)" d="${fill}"/>`);
  const inks = [BANDS[2], ...VERBS.map((v) => v.ink)];
  css.push(`.pl{animation:pl ${LOOP}s step-end infinite}@keyframes pl{${inks.map((c, s) => `${pc(s)}%{fill:${c}}`).join('')}100%{fill:${inks[NSTATE - 1]}}}`);
  body.push(`<path class="pl" fill="${inks[0]}" d="${maskPath(play, BOOK.w, BOOK.h, BX, BY)}"/>`);
}
const PLAY_INKS = [BANDS[2], ...VERBS.map((v) => v.ink)];

// --- the tagline: the whole line, the current verb in its colour
const DIM = '#9c97b8';
{
  const L1 = ["EVERYTHING YOU'VE ", 'WATCHED', ', ', 'READ', ', ', 'PLAYED', ','];
  const L2 = ['LISTENED TO', ', ON ONE TIMELINE.'];
  const verbAt = { WATCHED: 1, READ: 2, PLAYED: 3, 'LISTENED TO': 4 };
  const line = (parts, y) => {
    const tw = tfWidth(parts.join(''));
    let x = Math.round((W - tw) / 2);
    const out = [];
    parts.forEach((p, i) => {
      const v = verbAt[p];
      out.push(textRun(p.trimEnd(), x, y, v ? { fill: VERBS[v - 1].ink, cls: `v${v}` } : {}));
      x += tfWidth(p) + TF_GAP;
      if (i < parts.length - 1 && p.endsWith(' ')) x += 0; // the trailing space is in tfWidth
    });
    return out.join('');
  };
  body.push(line(L1, 39), line(L2, 49));
  VERBS.forEach((v, i) => {
    const s = i + 1;
    css.push(`.v${s}{animation:v${s} ${LOOP}s step-end infinite}@keyframes v${s}{${stateKeys([0, s], 'fill', v.ink, DIM)}}`);
  });
}

// --- the ruler: the level-of-detail bands, as a MediaLog timeline
const rowAt = (z) => YH + (CAMH * FOC) / z;
const BANDS_LOD = [
  { label: '2025-2029', a: rowAt(Z1), b: H, note: 'to the day' },
  { label: '2020-2024', a: rowAt(Z2), b: rowAt(Z1), note: 'to the month' },
  { label: 'SOMETIME IN 2015-2019', a: rowAt(ZD), b: rowAt(Z2), note: 'roughly' },
];
{
  const RX = W - 9;
  let d = '', dd = '';
  const top = Math.round(BANDS_LOD[2].a) + 1, bottom = H;
  d += `M${RX} ${top}h1v${bottom - top}h-1z`;
  dd += `M${RX - 1} ${top - 1}h3v${bottom - top + 1}h-3z`;
  // and on into the fog, dotted: before 2015 it is anyone's guess
  for (let y = top - 3; y > YH + 1; y -= 3) { d += `M${RX} ${y}h1v1h-1z`; dd += `M${RX - 1} ${y - 1}h3v3h-3z`; }
  BANDS_LOD.forEach((bd, i) => {
    const cy = Math.round((bd.a + Math.min(bd.b, H - 6)) / 2);
    // a node on the line, like the ones on MediaLog's own timeline
    d += `M${RX - 1} ${cy - 1}h3v3h-3z`;
    dd += `M${RX - 2} ${cy - 2}h5v5h-5z`;
    const tw = tfWidth(bd.label);
    body.push(textRun(bd.label, RX - 5 - tw, cy - 3, { fill: i === 0 ? '#fff6ee' : i === 1 ? '#f4e6ee' : '#eadcea' }));
  });
  body.push(`<path fill="${EDGE}" d="${dd}"/><path fill="#fff6ee" d="${d}"/>`);
  stills.push(['path', { d: dd, c: EDGE }], ['path', { d, c: '#fff6ee' }]);
}

defs.push(TXT.defs());

const desc = 'MediaLog, as a 1993 VGA voxel flight at dusk. Under a navy sky with a few stars, the MediaLog mark (an open book with a play '
  + 'triangle and a pen) and the name in heavy condensed white letters with a hard dark shadow. Under them, the line: Everything you\'ve watched, '
  + 'read, played, listened to, on one timeline. Below, the camera flies low over rolling hills planted in stripes, one stripe per kind of media '
  + 'in its own colour: movies red, TV and anime blue, videos plum, books amber, comics and manga magenta, games green, podcasts violet, music teal. '
  + 'The nearest hills are drawn in fine pixels with blossoms streaming past, the middle distance in blocks twice the size, the far hills in blocks '
  + 'four times the size, and past that only a pink fog. A timeline ruler on the right labels the bands 2025-2029, 2020-2024 and SOMETIME IN '
  + '2015-2019, its line dotted on into the fog. Every hill after the first two, one verb in the line lights up in turn and the landscape '
  + 'recolours to match: only the kinds that verb covers stay in colour, the rest go grey, and the play triangle in the mark takes the verb\'s colour.';

const svg = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 3}" height="${H * 3}" role="img" aria-labelledby="t d">`,
  `<title id="t">MediaLog</title><desc id="d">${desc}</desc>`,
  `<style>${css.join('\n')}\n@media (prefers-reduced-motion:reduce){*{animation:none!important}}</style>`,
  `<defs>${defs.join('')}<clipPath id="scr"><rect width="${W}" height="${H}" rx="4"/></clipPath></defs>`,
  `<g clip-path="url(#scr)"><rect width="${W}" height="${H}" fill="#121a2e"/>`,
  ...body,
  `</g><rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="3.6" fill="none" stroke="#0b1022"/></svg>`,
].join('\n') + '\n';
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB), palette ${NPAL} entries`);
console.log(sizes.map(([n, b]) => `${n} ${b}`).join(', '));

// ================================================================== THE PALETTE CARD
// A second, still picture for the README: each kind's ramp (the six shades
// the flight lights it with), grouped under the verb whose palette keeps it
// in colour.
const OUT2 = OUT.replace(/\.svg$/, '-palette.svg');
{
  const LW = 320, LH = 70;
  const kit = textKit();
  const out = [];
  out.push(kit.run('EACH KIND HAS ITS COLOUR.', 7, 6));
  const note = 'PALETTE.PAL';
  out.push(kit.run(note, LW - 7 - tfWidth(note), 6, { fill: DIM }));
  out.push(`<path fill="#2b2a57" d="M7 18h${LW - 14}v1h${-(LW - 14)}z"/>`);
  VERBS.forEach((v, i) => {
    const y = 24 + i * 11;
    out.push(kit.run(v.word, 7, y, { fill: v.ink }));
    let x = 86;
    v.kinds.forEach((k) => {
      out.push(`<path fill="${EDGE}" d="M${x - 1} ${y - 1}h${NSH * 3 + 2}v9h${-(NSH * 3 + 2)}z"/>`);
      for (let s = 0; s < NSH; s++) out.push(`<path fill="${rgbHex(colourOf(code(k, s, 0), 0))}" d="M${x + s * 3} ${y}h3v7h-3z"/>`);
      x += NSH * 3 + 5;
      out.push(kit.run(KINDS[k].name, x, y));
      x += tfWidth(KINDS[k].name) + 9;
    });
    if (x > LW - 4) throw new Error(`palette card row ${v.word} is too wide (${x})`);
  });
  const desc2 = 'Each kind has its colour, and in the banner each verb lights up its own kinds. Watched: movies (red), TV shows and anime (blue), videos (plum). '
    + 'Read: books (amber), comics and manga (magenta). Played: games (green). Listened to: podcasts (violet), music (teal). '
    + 'Every kind is shown as a ramp of the six shades the banner lights it with.';
  const svg2 = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LW} ${LH}" width="${LW * 2}" height="${LH * 2}" role="img" aria-labelledby="t d">`,
    `<title id="t">MediaLog: each kind has its colour</title><desc id="d">${desc2}</desc>`,
    `<defs>${kit.defs()}</defs>`,
    `<rect width="${LW}" height="${LH}" rx="4" fill="#121a2e"/>`,
    ...out,
    `<rect x=".5" y=".5" width="${LW - 1}" height="${LH - 1}" rx="3.6" fill="none" stroke="#0b1022"/></svg>`,
  ].join('\n') + '\n';
  fs.writeFileSync(OUT2, svg2);
  console.log(`wrote ${path.relative(process.cwd(), OUT2)} (${(svg2.length / 1024).toFixed(1)} KB)`);
}

// ================================================================== DEBUG STILLS
if (DEBUG) {
  fs.mkdirSync(DEBUG, { recursive: true });
  const S = 3;
  const paint = (rgb, x, y, c) => { if (x >= 0 && y >= 0 && x < W && y < H) { const i = (y * W + x) * 3; rgb[i] = c[0]; rgb[i + 1] = c[1]; rgb[i + 2] = c[2]; } };
  const pathRects = (d) => [...d.matchAll(/M(-?[\d.]+) (-?[\d.]+)h(-?[\d.]+)v(-?[\d.]+)/g)].map((m) => m.slice(1, 5).map(Number));
  for (const [frame, state] of [[0, 0], [12, 1], [20, 2], [5, 3], [25, 4]]) {
    const rgb = new Uint8Array(W * H * 3);
    for (let y = 0; y < YH; y++) for (let x = 0; x < W; x++) paint(rgb, x, y, SKY[skyIdx[y * W + x]]);
    STARS.flat().forEach(([x, y]) => paint(rgb, x, y, [232, 236, 255]));
    const pal = paletteOf(state);
    const fr = frames[frame];
    for (let y = 0; y < TH; y++) for (let x = 0; x < W; x++) paint(rgb, x, y + YH, pal[indexOf.get(fr[y * W + x])]);
    for (const [kind, p] of stills) {
      if (kind === 'mask' || kind === 'bands') {
        for (let yy = 0; yy < p.h; yy++) for (let xx = 0; xx < p.w; xx++) {
          if (!p.m[yy * p.w + xx]) continue;
          const c = kind === 'mask' ? hex(p.c) : hex(BANDS[Math.min(BANDS.length - 1, Math.floor(((p.y + yy - TY) / WM_ROWS) * BANDS.length))]);
          paint(rgb, p.x + xx, p.y + yy, c);
        }
      } else if (kind === 'glyph') {
        const { m, w, h } = tfMask(p.ch), dm = dilate(m, w, h);
        let fill = p.fill;
        const v = p.cls ? Number(p.cls.slice(1)) : 0;
        if (v && state !== 0 && state !== v) fill = DIM;
        for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
          if (m[yy * w + xx]) paint(rgb, p.x + xx - 1, p.y + yy - 1, hex(fill));
          else if (dm[yy * w + xx]) paint(rgb, p.x + xx - 1, p.y + yy - 1, hex(EDGE));
        }
      } else if (kind === 'play') {
        for (let yy = 0; yy < p.h; yy++) for (let xx = 0; xx < p.w; xx++) if (p.m[yy * p.w + xx]) paint(rgb, p.x + xx, p.y + yy, hex(PLAY_INKS[state]));
      } else if (kind === 'path') {
        for (const [x, y, w, h] of pathRects(p.d)) for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) paint(rgb, xx, yy, hex(p.c));
      }
    }
    fs.writeFileSync(path.join(DEBUG, `still-state${state}-f${frame}.png`), pngRGB(W, H, rgb, S));
    // and a close-up of the title, 6x
    const [cx0, cy0, cw, ch] = [TX - 6, 0, TITLE_W + 14, 60];
    const crop = new Uint8Array(cw * ch * 3);
    for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) for (let c = 0; c < 3; c++) crop[(y * cw + x) * 3 + c] = rgb[((y + cy0) * W + x + cx0) * 3 + c];
    if (state === 0) fs.writeFileSync(path.join(DEBUG, 'title-zoom.png'), pngRGB(cw, ch, crop, 6));
  }
  console.log(`debug stills in ${DEBUG}`);
}
