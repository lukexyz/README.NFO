#!/usr/bin/env node
// 87-file-system-landscape_opus_5.5.mjs
//
// Castaway README header in the "3D file-system landscape" style (catalogue entry hack-16):
// the early-90s idea that a file system is a place you fly over. Folders are pedestals standing
// on a ground plane, files are boxes standing on the pedestals (height = size, colour = age),
// wires run from each folder to its children with pulses travelling along them, and the code
// folders become a little city of glass towers covered in file names, with highlight bars
// scanning the lists and, once a minute, the gags tower's front face going to the alert colour
// for one bar. Everything is this file's own drawing and lettering; no real program, film, logo
// or wordmark is reproduced.
//
// The twist: it is always daytime on Castaway, so the ground plane is a sunny lagoon, the root
// folder is the island (sand on top, one tall palm, one raft moored alongside), and she sits on
// the root directory nodding to the beat. A HUD tours ten stops, one every two bars of the
// 80 BPM theme (6 s), so the whole loop is 60 s, the length of the theme loop.
//
// The landscape is real data: a read-only snapshot of D:/python/castaway taken 2026-10-01
// (sizes in bytes, ages in hours since last write). renders/, tmp/, .claude/ and __pycache__/
// are left out. Folders below the third level fold into their parent; the biggest folders show
// their largest files and stack the rest into one striped box. Only a few safe file names are
// kept; every other box is anonymous.
//
// Projection: one-point perspective with the camera looking straight down the +z axis (no yaw,
// no pitch, horizon set high by a shifted lens), so every front face is a flat rectangle and
// labels on it stay flat and legible. Solids are ordered back to front at build time with
// separating-plane tests. The slow "fly-through" is a CSS scale about the vanishing point
// (moving forward in one-point perspective is, near enough, scaling about that point) plus a
// half-degree bank.
//
// Run: node examples/castaway/src/87-file-system-landscape_opus_5.5.mjs
// Writes: examples/castaway/assets/87-file-system-landscape_opus_5.5.svg

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(here, '..', 'assets', '87-file-system-landscape_opus_5.5.svg');

// ---------------------------------------------------------------------------------------------
// Snapshot of the real tree (2026-10-01). Each entry: "size:ageHours", optionally "name=" first;
// "+N=size:age" is N smaller files stacked into one box (size summed, age of the newest).
// ---------------------------------------------------------------------------------------------
const SNAPSHOT = {
  '': { total: 1018363988, count: 2456, files: `
    activities.toml=178456:2.7 MUSING.md=139517:2.6 40009:31.2 18768:8.4 15395:32.4 14389:22.5
    13753:22.5 13681:31.4 12295:33.7 10867:35.4 10615:9.3 10033:36 9005:32.9
    HANDOFF.md=8224:2.6 7826:31.6 6196:6.6 4004:24.3 3503:25.7 2961:31.2 2768:31.3 2734:31.3` },
  'tools': { total: 777771, count: 61, files: `
    173470:27.7 make_audio.py=136457:2.7 render_demo.py=95580:27.7 36534:6.5 22531:20.8
    21835:7.9 schedule.py=21424:27.8 serve.py=17162:7.4 16513:27.6 14904:5.4 12578:9.7 12170:23
    10943:9.3 10804:27.8 10597:20.5 10068:3.1 9613:5.4 8687:23.1 8371:20.9 7593:2.8 7092:3.7
    6825:9.7 6728:9 5666:9.6 5591:27.8 5369:9.6 4827:10.8 4748:5.6 4207:8.1 3067:22.9 2911:5.6
    2786:6.3 2499:10.7 2180:5.8 2050:8.3 1592:11.5 1470:6.4 1337:5.4 1260:29.8 956:6.3 583:5.8
    559:5.5 510:5.5 340:5.4` },
  'tools/idle_rig': { total: 17479, count: 4, files: `
    5848:7.2 5242:7.2 3301:7.2 3088:6.6` },
  'tools/sprite_fit': { total: 27305, count: 13, files: `
    3832:7.8 3469:7.4 3416:7.9 3193:22.3 2677:7.4 2512:22.3 2355:8 2090:2.9 1267:22.9 1104:9.8
    723:7.9 402:5.4 265:8.2` },
  'web': { total: 40512942, count: 370, files: `
    index.html=3775:23.2` },
  'web/css': { total: 5966, count: 1, files: `
    5966:23.5` },
  'web/js': { total: 838789, count: 110, files: `
    26142:5.2 22891:3.1 19566:5.2 15745:3.1 8168:26.5 7236:27.3 7083:23.2 6538:27.2 4867:3.4
    3531:23.2 2367:27.4 1785:3.4` },
  'web/js/routines': { total: 712870, count: 98, files: '' },
  'web/assets': { total: 39664412, count: 258, files: `
    243598:2.9 236:2.9` },
  'web/assets/scenery': { total: 6509446, count: 11, files: `
    2918832:27.4 1985659:27.4 719103:27.4 261179:27.4 197614:27.4 194699:27.4 103664:27.4
    58053:27.4 37302:27.4 27996:27.4 5345:27.4` },
  'web/assets/sprites': { total: 32911132, count: 245, files: `
    1066987:27.4 843698:22.9 700965:6.6 690144:8.1 507466:8 458658:8 385678:27.4 332360:22.3
    329029:22.3 328825:8.1 320122:7.9 301719:27.4 242847:8.1 242748:22.3 231691:27.4
    229635:27.4 225938:7.9 225173:10.9 223124:22.3 219696:8.1 219190:7.9 216686:6.4 215424:22.3
    215230:22.3 214251:27.4 213936:8.1 212283:6.6 211004:7.9 209247:8.1 209070:7.9 208506:8
    207622:7.9 206097:27.4 204923:6.6 204151:8.1 +210=21637009:2.9` },
  'media': { total: 976548276, count: 2004, files: `
    2278023:39.8 2147720:39.8 1907358:5.4 781960:39.8 6951:39 697:3.8` },
  'media/audio': { total: 83350589, count: 184, files: `
    11520044:2.7 1525033:2.7 49519:2.7` },
  'media/audio/music': { total: 13113717, count: 2, files: `
    11520044:2.7 1593673:2.7` },
  'media/audio/sfx': { total: 57142276, count: 179, files: `
    11520044:2.7 2304044:2.7 2304044:2.7 1536044:2.7 1305644:2.7 1152044:2.7 1152044:2.7
    1152044:2.7 960044:2.7 960044:2.7 960044:2.7 768044:2.7 768044:2.7 768044:2.7 691244:2.7
    614444:2.7 614444:2.7 576044:2.7 576044:2.7 576044:2.7 537644:2.7 518444:2.7 518444:2.7
    499244:2.7 499244:2.7 433964:2.7 433964:2.7 422444:2.7 409004:2.7 403244:2.7 384044:2.7
    384044:2.7 384044:2.7 384044:2.7 384044:2.7 384044:2.7 384044:2.7 384044:2.7 384044:2.7
    384044:2.7 384044:2.7 384044:2.7 384044:2.7 384044:2.7 384044:2.7 311084:2.7 307244:2.7
    307244:2.7 +131=14521924:2.7` },
  'media/gags': { total: 573181673, count: 1224, files: `
    86596429:6.3 38955822:8.3 37890832:5.4 8692319:9.2 2268828:7.3 2232401:8.8 2229462:21.2
    2223156:7.7 2213573:21.2 2210842:7.3 2167800:32.2 2126662:34 2121558:8.9 2121558:8.9
    2103016:11.7 2084384:7.8 2057981:11.7 2018061:28.4 2000772:7.7 1973146:8.2 1969240:28.2
    1966614:35.3 1952212:7.9 1949626:7.8 1922584:8.1 1910206:7.9 1887204:6.3 1881807:29.6
    1869987:6.3 1864536:8.6 1858346:20.6 1838067:8.9 1826971:11.6 1816561:6.3 1808643:6.3
    1808219:21.3 1800968:21.3 1791168:34 1777345:21.6 1760130:32.1 +1184=329632637:5.4` },
  'media/sprites': { total: 185712258, count: 388, files: `
    2126662:34 1987746:23.1 1876607:22.6 1760130:32.1 1675958:28.6 1657134:34.8 1641660:34.8
    1596509:34.7 1591849:28.7 1583480:29.6 1580449:34.9 1578719:28.9 1555923:34.2 1548218:32.1
    1533270:34.9 1531849:30.9 1526711:28.6 1517827:32.1 1494670:23.1 1485577:23.1 1468693:29.3
    1456075:29.9 1450817:28.7 1434063:32.2 1423932:32.6 1410304:34.8 1397829:35.4 1381560:33.7
    1362803:33.8 1359271:35.2 1356390:33.7 1352206:35.4 1328883:32.1 1317761:35.2 1306632:33.7
    1298966:34.9 +352=130755125:5.4` },
  'media/props': { total: 59210156, count: 129, files: `
    2854262:6.5 2018061:28.4 1953780:27.7 1759485:33 1756744:33.9 1692772:35.2 1644870:32.9
    1625467:29.8 1533298:34.5 1521801:33.9 1502928:33.6 1462100:27.6 1371457:27.6 1370019:34.7
    1290493:31.2 1276844:35.2 1259807:35 1235295:33.6 1129276:33.9 1059100:29.8 1055123:28.8
    1039222:28.4 1036985:32.3 1003617:6.5 999970:34.3 965105:27.7 963342:31 953506:28.7
    951771:33.2 927282:28.2 +99=17996374:6.5` },
  'media/environment': { total: 47546572, count: 35, files: `
    8013952:39.1 7968566:39 5877393:39 3133229:27.7 2912677:39.1 2741085:27.5 2697005:27.5
    2183059:39.3 1769813:39.3 1349753:27.5 1329545:27.5 1235278:39.3 863836:39 862032:27.7
    813758:27.7 708147:27.7 646603:39 646603:39 515862:39.2 359011:34.9 251224:39.2 236683:6.5
    163767:39 157307:39.2 +11=110384:6.5` },
  'media/scenes': { total: 4425743, count: 2, files: `
    2278023:40 2147720:40` },
  'media/effects': { total: 3141825, count: 4, files: `
    1899121:28.8 1233126:30.3 5600:27.6 3978:28.8` },
  'media/references': { total: 11035677, count: 14, files: `
    2167800:32.2 1966614:35.3 1520942:40 1429628:35 1040907:35.2 976494:40.1 974065:9.1
    935602:22.5 4850:35.2 4598:34.7 4586:35.1 4234:32 4065:20.8 1292:8.4` },
  'media/tests': { total: 1821074, count: 18, files: `
    145236:24.3 145012:24.3 144252:24.3 143994:24.3 143989:24.3 143908:24.3 143734:24.3
    142968:24.3 84002:24.3 83269:24.3 83251:24.3 82841:24.3 82356:24.3 82346:24.3 82217:24.3
    81842:24.3 2947:24.3 2910:24.3` },
};

function parseFiles(s) {
  return s.trim().split(/\s+/).filter(Boolean).map((tok) => {
    let name = null; let stack = 0;
    const eq = tok.indexOf('=');
    if (eq >= 0) { const head = tok.slice(0, eq); tok = tok.slice(eq + 1); if (head.startsWith('+')) stack = +head.slice(1); else name = head; }
    const [size, age] = tok.split(':').map(Number);
    return { name, size, age, stack };
  });
}

// Real file names for the glass towers (a wholesome selection; the towers are texture).
const ROUTINE_NAMES = [
  'message_in_bottle.js', 'bottle_reply.js', 'delivery_drone.js', 'turtle_visit.js',
  'cat_visit.js', 'signal_hunt.js', 'shark_nod.js', 'tour_boat_selfies.js', 'coconut_crab.js',
  'leave_any_time.js', 'efoil_bro.js', 'fire_by_friction.js', 'hammock.js', 'lookout.js',
  'spear_fishing.js', 'sandcastle.js', 'tide_takes_sandcastle.js', 'bushcraft.js',
  'ship_passes_unseen.js', 'dolphin_visit.js', 'bottles.js', 'castle.js', 'index.js', 'common.js',
];
const JS_NAMES = ['main.js', 'scene.js', 'timeline.js', 'audio.js', 'export.js', 'hud.js', 'compose.js',
  'character.js', 'gl.js', 'util.js', 'assets.js', 'dances.js'];

// ---------------------------------------------------------------------------------------------
// Canvas, camera, palette
// ---------------------------------------------------------------------------------------------
const VW = 1280, VH = 640;
const VPX = 640, HY = 196;          // vanishing point
const F = 855, CZ = -18, CY = 8.67; // focal length (px), camera z, camera height (world units)
const d = (z) => z - CZ;
const P = (x, y, z) => [VPX + F * x / d(z), HY + F * (CY - y) / d(z)];
const S = (z) => F / d(z);          // px per world unit at depth z
const r1 = (v) => Math.round(v * 10) / 10;
const pt = (p) => `${r1(p[0])} ${r1(p[1])}`;
const poly = (pts) => 'M' + pts.map(pt).join('L') + 'Z';

const HAZE = [226, 243, 242];
function hex(c) { return '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); }
function rgb(h) { return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); }
function mix(a, b, t) { return a.map((v, i) => v + (b[i] - v) * t); }
const fogT = (z) => Math.max(0, Math.min(0.62, (d(z) - 34) / 95));
const fog = (h, z) => hex(mix(rgb(h), HAZE, Math.round(fogT(z) * 20) / 20));

const AGE = [ // colour = age since last write
  { max: 6, top: '#ffb39b', front: '#ff7a59', side: '#d85a43', label: 'UNDER 6 H' },
  { max: 24, top: '#ffe7a1', front: '#ffc94d', side: '#d9a12f', label: 'UNDER 1 DAY' },
  { max: 1e9, top: '#a6f0dc', front: '#3fcca8', side: '#24a487', label: 'OLDER' },
];
const ageOf = (h) => AGE.find((a) => h < a.max);
const PED = { top: '#b8cfe0', front: '#5a7896', side: '#46607c' };
const ROOT = { top: '#f3d9a2', front: '#33536f', side: '#29435c', lip: '#e9c584' };

// ---------------------------------------------------------------------------------------------
// The tree: where each folder stands
// ---------------------------------------------------------------------------------------------
// how many boxes the biggest folders show before stacking the rest into one striped box
const SHOW = { 'web/assets/sprites': 24, 'media/audio/sfx': 35, 'media/gags': 29, 'media/sprites': 24, 'media/props': 20, 'media/environment': 15 };
function capFiles(files, cap) {
  if (!cap || files.length <= cap) return files;
  const keep = files.slice(0, cap - 1), rest = files.slice(cap - 1);
  return [...keep, { name: null, size: rest.reduce((t, f) => t + f.size, 0), age: Math.min(...rest.map((f) => f.age)), stack: rest.reduce((t, f) => t + (f.stack || 1), 0) }];
}
const NODES = [
  // id, label, parent, x (centre), z (front), kind
  ['', 'castaway/', null, 0, 0, 'root'],
  ['web', 'web', '', -20, 22, 'boxes'],
  ['tools', 'tools', '', -6, 22, 'boxes'],
  ['media', 'media', '', 19.5, 22, 'boxes'],
  ['web/css', 'css', 'web', -33, 37, 'boxes'],
  ['web/js', 'js', 'web', -25.5, 37, 'tower'],
  ['web/assets', 'assets', 'web', -15, 37, 'boxes'],
  ['tools/idle_rig', 'idle_rig', 'tools', -8.5, 37, 'boxes'],
  ['tools/sprite_fit', 'sprite_fit', 'tools', 0.8, 37, 'boxes'],
  ['media/audio', 'audio', 'media', 11, 37, 'boxes'],
  ['media/gags', 'gags', 'media', 21, 37, 'boxes'],
  ['media/sprites', 'sprites', 'media', 32, 37, 'boxes'],
  ['media/props', 'props', 'media', 42, 37, 'boxes'],
  ['web/js/routines', 'routines', 'web/js', -37, 55, 'tower'],
  ['web/assets/scenery', 'scenery', 'web/assets', -24.5, 55, 'boxes'],
  ['web/assets/sprites', 'sprites', 'web/assets', -12, 55, 'boxes'],
  ['media/audio/music', 'music', 'media/audio', 1, 55, 'boxes'],
  ['media/audio/sfx', 'sfx', 'media/audio', 9, 55, 'boxes'],
  ['media/environment', 'environment', 'media', 18, 55, 'boxes'],
  ['media/scenes', 'scenes', 'media', 29, 55, 'boxes'],
  ['media/references', 'references', 'media', 36, 55, 'boxes'],
  ['media/effects', 'effects', 'media', 44, 55, 'boxes'],
  ['media/tests', 'tests', 'media', 51, 55, 'boxes'],
].map(([id, label, parent, x, z, kind]) => ({ id, label, parent, x, z, kind, ...SNAPSHOT[id], files: capFiles(parseFiles(SNAPSHOT[id].files), SHOW[id]) }));
const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));

const boxH = (bytes) => 0.22 + Math.max(0, Math.log10(bytes) - 2) * 0.46;  // file box height
const pedH = (bytes) => 0.5 + Math.max(0, Math.log10(bytes) - 3) * 0.36;   // pedestal height
const CELL = 1.0, BOX = 0.7, MARGIN = 0.45;

// ---------------------------------------------------------------------------------------------
// Items: every solid in the scene, with world bounds and a draw function
// ---------------------------------------------------------------------------------------------
const items = [];
const add = (it) => { items.push(it); return it; };
const named = {}; // name -> bounds, for the HUD tour

function boxFaces(b, col, z) {
  // b: {x0,x1,y0,y1,z0,z1}; returns path strings for visible faces in a sensible order
  // compact paths: front edges are horizontal, side edges vertical (one-point perspective)
  const out = [];
  const { x0, x1, y0, y1, z0, z1 } = b;
  const q = S(z0) < 30 ? Math.round : r1; // all but the nearest boxes: whole pixels are plenty
  const c = (p) => `${q(p[0])} ${q(p[1])}`;
  const side = (x) => { const A = P(x, y0, z0), B = P(x, y1, z0), C = P(x, y1, z1), D = P(x, y0, z1); return `M${c(A)}V${q(B[1])}L${c(C)}V${q(D[1])}Z`; };
  if (x0 > 0) out.push([col.side, side(x0)]);
  if (x1 < 0) out.push([col.side, side(x1)]);
  if (CY > y1) { const A = P(x0, y1, z0), B = P(x1, y1, z0), C = P(x1, y1, z1), D = P(x0, y1, z1); out.push([col.top, `M${c(A)}H${q(B[0])}L${c(C)}H${q(D[0])}Z`]); }
  { const A = P(x0, y0, z0), C = P(x1, y1, z0); out.push([col.front, `M${c(A)}H${q(C[0])}V${q(C[1])}H${q(A[0])}Z`]); }
  return out.map(([cc, dd]) => [fog(cc, z ?? z0), dd]);
}
const FILLS = new Map(); // colour -> class name
const fc = (h) => { if (!FILLS.has(h)) FILLS.set(h, 'f' + FILLS.size.toString(36)); return FILLS.get(h); };
const pathEl = (fill, dd, extra = '') => fill.startsWith('#') ? `<path class="${fc(fill)}" d="${dd}"${extra}/>` : `<path fill="${fill}" d="${dd}"${extra}/>`;

// glyph runs (filled in later by the font section)
let labelSvg = () => '';

// ---- pedestals and their file boxes
for (const n of NODES) {
  const tower = n.kind === 'tower';
  const files = n.files;
  if (n.kind === 'root') continue;
  let w, dep, cols = 0;
  if (tower) { w = n.id === 'web/js/routines' ? 3.6 : 3.0; dep = w; }
  else {
    const k = Math.max(1, files.length);
    cols = Math.ceil(Math.sqrt(k * 1.15));
    const rows = Math.ceil(k / cols);
    w = Math.max(2.4, cols * CELL - (CELL - BOX) + 2 * MARGIN);
    dep = Math.max(2.0, rows * CELL - (CELL - BOX) + 2 * MARGIN);
  }
  const h = pedH(n.total); // towers too: every pedestal's height is its folder's total size
  n.b = { x0: n.x - w / 2, x1: n.x + w / 2, y0: 0, y1: h, z0: n.z, z1: n.z + dep };
  n.w = w; n.dep = dep; n.h = h;
  const ped = n.b;
  add({ b: ped, kind: 'ped', draw: () => boxFaces(ped, PED).map(([c, dd]) => pathEl(c, dd)).join('') + labelSvg(n) });
  if (tower) continue;
  files.sort((a, b2) => (a.name ? 1 : 0) - (b2.name ? 1 : 0)); // named files last: front row, from the left
  files.forEach((f, i) => {
    const r = Math.floor(i / cols), c = i % cols;
    // biggest files at the back so short boxes are not hidden behind tall ones
    const rowsN = Math.ceil(files.length / cols);
    const zz = ped.z0 + MARGIN + (rowsN - 1 - r) * CELL;
    const xx = ped.x0 + MARGIN + c * CELL + (w - 2 * MARGIN - (cols * CELL - (CELL - BOX))) / 2;
    const bh = boxH(f.size);
    const b = { x0: xx, x1: xx + BOX, y0: h, y1: h + bh, z0: zz, z1: zz + BOX };
    const col = ageOf(f.age);
    const it = add({ b, kind: 'box', draw: () => {
      let s = boxFaces(b, col).map(([cc, dd]) => pathEl(cc, dd)).join('');
      if (f.stack) { // a stack of the rest: stripes across the front face
        let st = '';
        for (let yy = b.y0 + 0.18; yy < b.y1 - 0.05; yy += 0.18) st += `M${pt(P(b.x0, yy, b.z0))}H${r1(P(b.x1, yy, b.z0)[0])}`;
        s += `<path d="${st}" stroke="${fog('#7a3b2c', b.z0)}" stroke-width="${r1(Math.max(0.4, S(b.z0) * 0.035))}" opacity=".55"/>`;
      }
      return s;
    } });
    if (f.name) named[(n.id ? n.id + '/' : '') + f.name] = it.b;
  });
}

// ---- the root: the island itself
const root = byId[''];
const RW = 16, RD = 9, RH = pedH(root.total);
root.b = { x0: -RW / 2, x1: RW / 2, y0: 0, y1: RH, z0: 0, z1: RD };
named['castaway/'] = root.b;
add({ b: root.b, kind: 'root', draw: () => drawRoot() });

// root files: a 7 x 3 block on the front right of the island, biggest at the back
{
  const files = root.files; const cols = 7;
  files.forEach((f, i) => {
    const r = Math.floor(i / cols), c = i % cols;
    const rowsN = Math.ceil(files.length / cols);
    const zz = 0.9 + (rowsN - 1 - r) * 1.05;
    const xx = 0.9 + c * 0.95;
    const bh = boxH(f.size) * 0.8;
    const b = { x0: xx, x1: xx + 0.66, y0: RH, y1: RH + bh, z0: zz, z1: zz + 0.66 };
    const col = ageOf(f.age);
    const it = add({ b, kind: 'box', draw: () => boxFaces(b, col).map(([cc, dd]) => pathEl(cc, dd)).join('') });
    if (f.name) named[f.name] = it.b;
  });
}

// ---- the palm, her, the raft, a shark in headphones
const PALM = { x: -1.45, z: 6.6 };
add({ b: { x0: PALM.x - 0.25, x1: PALM.x + 0.25, y0: RH, y1: RH + 9, z0: PALM.z - 0.25, z1: PALM.z + 0.25 }, kind: 'palm', draw: () => drawPalm() });
const HER = { x: -3.9, z: 2.9 };
named['castaway/her'] = { x0: HER.x - 0.55, x1: HER.x + 0.55, y0: RH, y1: RH + 1.2, z0: HER.z - 0.3, z1: HER.z + 0.3 };
add({ b: { x0: HER.x - 0.45, x1: HER.x + 0.45, y0: RH, y1: RH + 1.1, z0: HER.z - 0.2, z1: HER.z + 0.3 }, kind: 'her', draw: () => drawHer() });
const CASTLE = { x: -6.1, z: 6.2 };
add({ b: { x0: CASTLE.x - 0.62, x1: CASTLE.x + 0.62, y0: RH, y1: RH + 1.5, z0: CASTLE.z - 0.47, z1: CASTLE.z + 0.47 }, kind: 'castle', draw: () => drawCastle() });
// far enough back that the fly-through's zoom (scale 1.045 about the vanishing point, plus the
// half-degree bank) never pushes it into the frame's rounded bottom-left corner
const RAFT = { x0: -13.0, x1: -10.0, z0: 1.0, z1: 3.2 };
add({ b: { ...RAFT, y0: 0, y1: 0.3 }, kind: 'raft', draw: () => drawRaft() });
const TURTLE = { x: -16.5, z: 7.5 };
add({ b: { x0: TURTLE.x - 0.8, x1: TURTLE.x + 0.8, y0: 0, y1: 0.2, z0: TURTLE.z - 0.5, z1: TURTLE.z + 0.5 }, kind: 'turtle', draw: () => drawTurtle() });
const DRONE = { x: 11.6, y: 2.5, z: -0.7 };
add({ b: { x0: DRONE.x - 0.6, x1: DRONE.x + 0.6, y0: DRONE.y - 0.8, y1: DRONE.y + 0.2, z0: DRONE.z - 0.3, z1: DRONE.z + 0.3 }, kind: 'drone', draw: () => drawDrone() });
const BOTTLE = { x: -13.0, z: 5.6 }; // clear water behind the raft
add({ b: { x0: BOTTLE.x - 0.3, x1: BOTTLE.x + 0.3, y0: 0, y1: 0.2, z0: BOTTLE.z - 0.15, z1: BOTTLE.z + 0.15 }, kind: 'bottle', draw: () => drawBottle() });
const FIN = { z: 13.5 };
add({ b: { x0: -60, x1: 60, y0: 0, y1: 0.6, z0: FIN.z, z1: FIN.z + 0.3 }, kind: 'fin', draw: () => drawFin() });

// ---- towers (glass, covered in file names)
for (const n of NODES.filter((q) => q.kind === 'tower')) {
  const routines = n.id === 'web/js/routines';
  const th = routines ? 10.2 : 5.6;
  const inset = 0.15;
  const b = { x0: n.b.x0 + inset, x1: n.b.x1 - inset, y0: n.h, y1: n.h + th, z0: n.b.z0 + inset, z1: n.b.z1 - inset };
  add({ b, kind: 'tower', draw: () => drawTower(n, b, routines ? ROUTINE_NAMES : JS_NAMES, true) });
  named[n.id + '/'] = b;
}

// ---------------------------------------------------------------------------------------------
// Draw order: separating-plane tests between items whose screen boxes overlap, then a
// topological sort that prefers the farthest item when several are free.
// ---------------------------------------------------------------------------------------------
function screenBox(b, pad = 0) {
  const xs = [], ys = [];
  for (const x of [b.x0, b.x1]) for (const y of [b.y0, b.y1]) for (const z of [b.z0, b.z1]) { const p = P(x, y, z); xs.push(p[0]); ys.push(p[1]); }
  return [Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) + pad, Math.max(...ys) + pad];
}
function before(a, b) { // true: a must be painted before b
  const A = a.b, B = b.b;
  if (A.z0 >= B.z1) return true;
  if (B.z0 >= A.z1) return false;
  if (A.x1 <= B.x0) return 0 > A.x1;  // camera (x = 0) on B's side: B is nearer
  if (B.x1 <= A.x0) return !(0 > B.x1);
  if (A.y0 >= B.y1) return false;     // A stands on B: camera is above, A nearer
  if (B.y0 >= A.y1) return true;
  return (A.z0 + A.z1) > (B.z0 + B.z1);
}
function order(list) {
  const extra = { palm: [-140, -330, 140, 10], her: [-6, -6, 6, 6], fin: [0, -20, 0, 0] };
  const sb = list.map((it) => { const s = screenBox(it.b); const e = extra[it.kind]; return e ? [s[0] + e[0], s[1] + e[1], s[2] + e[2], s[3] + e[3]] : s; });
  const n = list.length; const indeg = new Array(n).fill(0); const out = list.map(() => []);
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const a = sb[i], b = sb[j];
    if (a[2] < b[0] || b[2] < a[0] || a[3] < b[1] || b[3] < a[1]) continue;
    if (before(list[i], list[j])) { out[i].push(j); indeg[j]++; } else { out[j].push(i); indeg[i]++; }
  }
  const done = new Array(n).fill(false); const res = [];
  for (let k = 0; k < n; k++) {
    let best = -1;
    for (let i = 0; i < n; i++) if (!done[i] && indeg[i] === 0 && (best < 0 || list[i].b.z1 > list[best].b.z1)) best = i;
    if (best < 0) for (let i = 0; i < n; i++) if (!done[i] && (best < 0 || list[i].b.z1 > list[best].b.z1)) best = i; // cycle: break it
    done[best] = true; res.push(list[best]);
    for (const j of out[best]) indeg[j]--;
  }
  return res;
}

// ---------------------------------------------------------------------------------------------
// Monoline stroke font (glyph box x 0..6, caps y 0..10, descenders to 13), as in the other
// Castaway headers' generators. Glyphs are <path>s in <defs>; text runs are <g>s of <use>s.
// ---------------------------------------------------------------------------------------------
const O_CAP = 'M2.6 0H3.4Q6 0 6 2.6V7.4Q6 10 3.4 10H2.6Q0 10 0 7.4V2.6Q0 0 2.6 0Z';
const GLYPHS = {
  A: 'M0 10L3 0L6 10M1 6.7H5', B: 'M0 0V10H3.8Q6 10 6 7.6Q6 5 3.6 5H0M3.4 5Q5.6 5 5.6 2.5Q5.6 0 3.4 0H0',
  C: 'M6 2Q5.4 0 3.2 0H2.6Q0 0 0 2.6V7.4Q0 10 2.6 10H3.2Q5.4 10 6 8', D: 'M0 0V10H2.8Q6 10 6 7V3Q6 0 2.8 0Z',
  E: 'M6 0H0V10H6M0 5H4.6', F: 'M6 0H0V10M0 5H4.6',
  G: 'M6 2Q5.4 0 3.2 0H2.6Q0 0 0 2.6V7.4Q0 10 2.6 10H3.4Q6 10 6 7.4V5.2H3.4', H: 'M0 0V10M6 0V10M0 5H6',
  I: 'M1.2 0H4.8M3 0V10M1.2 10H4.8', J: 'M2.4 0H6V7.4Q6 10 3.4 10H2.6Q0 10 0 7.6', K: 'M0 0V10M6 0L0.4 6M2.2 4.2L6 10',
  L: 'M0 0V10H6', M: 'M0 10V0L3 5.6L6 0V10', N: 'M0 10V0L6 10V0', O: O_CAP,
  P: 'M0 10V0H3.4Q6 0 6 2.8Q6 5.6 3.4 5.6H0', Q: O_CAP + 'M3.6 7.6L6.2 11.4',
  R: 'M0 10V0H3.4Q6 0 6 2.8Q6 5.6 3.4 5.6H0M3.2 5.6L6 10',
  S: 'M5.8 1.6Q5 0 3 0Q0.2 0 0.2 2.6Q0.2 4.6 3 5Q5.8 5.4 5.8 7.4Q5.8 10 3 10Q0.8 10 0 8.2',
  T: 'M0 0H6M3 0V10', U: 'M0 0V7.4Q0 10 2.6 10H3.4Q6 10 6 7.4V0', V: 'M0 0L3 10L6 0',
  W: 'M0 0L1.3 10L3 3.6L4.7 10L6 0', X: 'M0 0L6 10M6 0L0 10', Y: 'M0 0L3 5.2L6 0M3 5.2V10', Z: 'M0 0H6L0 10H6',
  0: O_CAP + 'M4.4 2.6L1.6 7.4', 1: 'M0.8 2.2L3.2 0V10M0.6 10H5.6',
  2: 'M0.2 2.2Q0.8 0 3 0Q5.8 0 5.8 2.8Q5.8 4.6 3.8 6L0 10H6',
  3: 'M0.2 1.6Q1 0 3 0Q5.6 0 5.6 2.5Q5.6 5 2.8 5H2M2.8 5Q6 5 6 7.5Q6 10 3 10Q0.8 10 0 8.2',
  4: 'M4.4 10V0L0 7H6', 5: 'M5.6 0H0.6L0.2 4.8Q1.4 3.8 3 3.8Q6 3.8 6 6.9Q6 10 3 10Q0.9 10 0 8.4',
  6: 'M5.2 0.8Q4.4 0 3 0Q0 0 0 4.2V7.2Q0 10 3 10Q6 10 6 7.1Q6 4.3 3 4.3Q0.9 4.3 0 6', 7: 'M0 0H6L2.2 10',
  8: 'M3 4.8Q0.5 4.8 0.5 2.4Q0.5 0 3 0Q5.5 0 5.5 2.4Q5.5 4.8 3 4.8Q0 4.8 0 7.4Q0 10 3 10Q6 10 6 7.4Q6 4.8 3 4.8Z',
  9: 'M0.8 9.2Q1.6 10 3 10Q6 10 6 5.8V2.8Q6 0 3 0Q0 0 0 2.9Q0 5.7 3 5.7Q5.1 5.7 6 4',
  a: 'M0.6 3.6Q1.4 3 3 3Q5.6 3 5.6 5.4V10M5.6 6.2H2.6Q0 6.2 0 8.1Q0 10 2.4 10Q4.6 10 5.6 8.4',
  b: 'M0 0V10H3.4Q6 10 6 7.4V5.6Q6 3 3.4 3H0', c: 'M5.8 3.8Q5 3 3.4 3H2.6Q0 3 0 5.6V7.4Q0 10 2.6 10H3.4Q5 10 5.8 9.2',
  d: 'M6 0V10H2.6Q0 10 0 7.4V5.6Q0 3 2.6 3H6', e: 'M0 6.6H6V5.6Q6 3 3.4 3H2.6Q0 3 0 5.6V7.4Q0 10 2.6 10H3.6Q5.1 10 5.8 9.2',
  f: 'M5.6 0.6Q5 0 4 0Q2.2 0 2.2 2V10M0.2 3.4H5', g: 'M6 3V10.6Q6 13 3.4 13H1M6 9.8H2.6Q0 9.8 0 7.4V5.4Q0 3 2.6 3H6',
  h: 'M0 0V10M0 3H3.4Q6 3 6 5.6V10', i: 'M0.8 3H3.2V10M0.6 10H5.6M3 0.1V0.8', j: 'M1.4 3H4.6V10.6Q4.6 13 2.2 13H0.6M4.6 0.1V0.8',
  k: 'M0.4 0V10M5.6 3L0.4 7.4M2.4 5.8L6 10', l: 'M0.6 0H3V7.6Q3 10 5 10H6', m: 'M0 10V3H4.4Q6 3 6 4.6V10M3 3V10',
  n: 'M0 10V3H3.4Q6 3 6 5.6V10', o: 'M2.6 3H3.4Q6 3 6 5.6V7.4Q6 10 3.4 10H2.6Q0 10 0 7.4V5.6Q0 3 2.6 3Z',
  p: 'M0 13V3H3.4Q6 3 6 5.6V7.4Q6 10 3.4 10H0', q: 'M6 13V3H2.6Q0 3 0 5.6V7.4Q0 10 2.6 10H6', r: 'M0.6 3V10M0.6 5.8Q0.6 3 3.4 3H5.8',
  s: 'M5.6 3.6Q4.8 3 3.2 3H2.6Q0.3 3 0.3 4.8Q0.3 6.4 3 6.4Q5.8 6.4 5.8 8.2Q5.8 10 3.2 10H2.6Q0.8 10 0 9.2',
  t: 'M2.2 0.6V7.6Q2.2 10 4.4 10H5.8M0 3H5.4', u: 'M0 3V7.4Q0 10 2.6 10H6V3', v: 'M0 3L3 10L6 3', w: 'M0 3L1.4 10L3 5L4.6 10L6 3',
  x: 'M0 3L6 10M6 3L0 10', y: 'M0 3L3 9.6M6 3L2.4 11.8Q1.9 13 0.6 13', z: 'M0 3H6L0 10H6',
  '.': 'M3 9.3V9.9', ',': 'M3.2 9.2V9.8L2.2 11.8', ':': 'M3 3.7V4.3M3 9.3V9.9', '!': 'M3 0V7M3 9.3V9.9',
  '?': 'M0.4 1.8Q1 0 3 0Q5.8 0 5.8 2.6Q5.8 4.2 3 5.2V7M3 9.3V9.9', "'": 'M3 0V3', '-': 'M1 6.2H5', '_': 'M0 12H6',
  '/': 'M5.6 -0.4L0.4 10.4', '(': 'M4.4 -0.6Q1.6 2 1.6 5Q1.6 8 4.4 10.6', ')': 'M1.6 -0.6Q4.4 2 4.4 5Q4.4 8 1.6 10.6',
  '<': 'M5.4 2.4L0.6 6.2L5.4 10', '>': 'M0.6 2.4L5.4 6.2L0.6 10', '+': 'M3 3.2V9.2M0 6.2H6', '=': 'M0.4 4.6H5.6M0.4 7.8H5.6',
  '·': 'M3 6V6.6', '→': 'M0 6.2H5.6M3.2 3.6L5.8 6.2L3.2 8.8', '▸': 'M1 2.4L5.6 6.2L1 10Z',
};
const ADV = 8; // advance per character, glyph units
const IDCH = [...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'];
const glyphIds = new Map();
const gid = (ch) => {
  if (!(ch in GLYPHS)) throw new Error(`stroke font has no glyph for ${JSON.stringify(ch)}`);
  if (!glyphIds.has(ch)) { const n = glyphIds.size; glyphIds.set(ch, n < IDCH.length ? IDCH[n] : 'g' + IDCH[n % IDCH.length]); }
  return glyphIds.get(ch);
};
const runIds = new Map();
const rid = (str) => { if (!runIds.has(str)) runIds.set(str, 'r' + runIds.size.toString(36)); return runIds.get(str); };
const runDefs = () => [...runIds].map(([str, id]) => `<g id="${id}">` + [...str].map((ch, i) => ch === ' ' ? '' : `<use href="#${gid(ch)}"${i ? ` x="${r1(i * ADV)}"` : ''}/>`).join('') + '</g>').join('');
const textW = (str, sc) => (str.length * ADV - (ADV - 6)) * sc;
// flat text at (x, y) = top-left of the caps box, scale sc (px per glyph unit)
function text(str, x, y, sc, cls, anchor = 'start') {
  const w = textW(str, sc);
  const xx = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  return `<use href="#${rid(str)}" class="${cls}" transform="translate(${r1(xx)} ${r1(y)}) scale(${+sc.toFixed(3)})"/>`;
}
// affine text: origin (screen point of glyph (0,0)), ax = screen vector per glyph unit along the
// line, ay = screen vector per glyph unit down the line
function textM(str, o, ax, ay, cls, extra = '') {
  const f3 = (v) => +v.toFixed(3);
  return `<use href="#${rid(str)}" class="${cls}"${extra} transform="matrix(${f3(ax[0])} ${f3(ax[1])} ${f3(ay[0])} ${f3(ay[1])} ${r1(o[0])} ${r1(o[1])})"/>`;
}

// folder label on a pedestal's front face (flat: front faces face the camera)
labelSvg = (n) => {
  const b = n.b; const s = S(b.z0);
  const faceW = (b.x1 - b.x0) * s, faceH = (b.y1 - b.y0) * s;
  let sc = Math.min(faceH * 0.5 / 10, (faceW * 0.86) / (n.label.length * ADV));
  if (sc * 10 < 2.2) return '';
  const [cx] = P(n.x, 0, b.z0); const [, yb] = P(0, 0, b.z0);
  const y = yb - faceH / 2 - sc * 6.5;
  const lw = textW(n.label, sc);
  if (cx - lw / 2 < 8 || cx + lw / 2 > VW - 8) return '';
  return text(n.label, cx, y, sc, fogT(b.z0) > 0.3 ? 'lbf' : 'lb', 'middle');
};

// ---------------------------------------------------------------------------------------------
// The big extruded title on the island's front face: chamfered block capitals designed on a
// 6.5 x 9 grid (W is 9 wide), outer outlines counter-clockwise, counters clockwise.
// ---------------------------------------------------------------------------------------------
const BIG = {
  C: { w: 6.5, p: [[[1.5, 0], [6.5, 0], [6.5, 2], [2, 2], [2, 7], [6.5, 7], [6.5, 9], [1.5, 9], [0, 7.5], [0, 1.5]]] },
  A: { w: 6.5, p: [[[0, 0], [2, 0], [2, 3.4], [4.5, 3.4], [4.5, 0], [6.5, 0], [6.5, 7.5], [5, 9], [1.5, 9], [0, 7.5]], [[2, 5.4], [2, 7], [4.5, 7], [4.5, 5.4]]] },
  S: { w: 6.5, p: [[[0, 0], [5, 0], [6.5, 1.5], [6.5, 4], [5, 5.5], [2, 5.5], [2, 7], [6.5, 7], [6.5, 9], [1.5, 9], [0, 7.5], [0, 5], [1.5, 3.5], [4.5, 3.5], [4.5, 2], [0, 2]]] },
  T: { w: 6.5, p: [[[2.25, 0], [4.25, 0], [4.25, 7], [6.5, 7], [6.5, 9], [0, 9], [0, 7], [2.25, 7]]] },
  W: { w: 9, p: [[[1.5, 0], [7.5, 0], [9, 1.5], [9, 9], [7, 9], [7, 2], [5.5, 2], [5.5, 6], [3.5, 6], [3.5, 2], [2, 2], [2, 9], [0, 9], [0, 1.5]]] },
  Y: { w: 6.5, p: [[[2.25, 0], [4.25, 0], [4.25, 4], [5, 4], [6.5, 5.5], [6.5, 9], [4.5, 9], [4.5, 6.5], [2, 6.5], [2, 9], [0, 9], [0, 5.5], [1.5, 4], [2.25, 4]]] },
};
const area = (pts) => pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0) / 2;
for (const g of Object.values(BIG)) g.p = g.p.map((pts, i) => { const ccw = area(pts) > 0; return (i === 0) === ccw ? pts : [...pts].reverse(); });

function bigTitle(str, k, y0, zf, depth) {
  const gap = 1.5;
  const total = [...str].reduce((s, ch) => s + BIG[ch].w, 0) + gap * (str.length - 1);
  let pen = -total / 2;
  const quads = []; let fronts = '';
  for (const ch of str) {
    const g = BIG[ch];
    let fd = '';
    for (const pts of g.p) {
      const W = pts.map(([u, v]) => [(pen + u) * k, y0 + v * k]);
      fd += poly(W.map(([x, y]) => P(x, y, zf - depth)));
      for (let i = 0; i < W.length; i++) {
        const a = W[i], b = W[(i + 1) % W.length];
        const n = [b[1] - a[1], -(b[0] - a[0])]; // outward for CCW outer / CW counter
        const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        if (n[0] * (0 - mx) + n[1] * (CY - my) <= 0) continue; // faces away from the camera
        const len = Math.hypot(n[0], n[1]);
        const up = n[1] / len;
        const shade = up > 0.6 ? 'tt' : up < -0.6 ? 'tb' : Math.abs(n[0] / len) > 0.9 ? 'ts' : 'tc';
        quads.push({ dist: Math.hypot(mx, my - CY), shade, dd: poly([P(a[0], a[1], zf), P(b[0], b[1], zf), P(b[0], b[1], zf - depth), P(a[0], a[1], zf - depth)]) });
      }
    }
    fronts += fd;
    pen += g.w + gap;
  }
  quads.sort((a, b) => b.dist - a.dist);
  // keep paint order but merge consecutive quads of one shade into one path
  let out = ''; let cur = null; let acc = '';
  for (const q of quads) { if (q.shade !== cur) { if (acc) out += `<path class="${cur}" d="${acc}"/>`; cur = q.shade; acc = ''; } acc += q.dd; }
  if (acc) out += `<path class="${cur}" d="${acc}"/>`;
  return out + `<path class="tf" fill-rule="evenodd" d="${fronts}"/>`;
}

// ---------------------------------------------------------------------------------------------
// Drawing: root island, palm, her, raft, fin, towers
// ---------------------------------------------------------------------------------------------
function drawRoot() {
  const b = root.b;
  let s = '';
  // the island is centred on the camera axis, so neither side face is visible
  // top: sand, with a darker lip and a few ripples of wind-blown sand
  s += pathEl(ROOT.top, poly([P(b.x0, b.y1, b.z0), P(b.x1, b.y1, b.z0), P(b.x1, b.y1, b.z1), P(b.x0, b.y1, b.z1)]));
  let ripples = '';
  for (const [x, z, w] of [[-6.8, 1.4, 1.6], [-3.6, 7.6, 1.8], [-7.2, 5.2, 1.1], [-1.2, 1.0, 1.2], [-0.6, 6.6, 1.0], [-5.6, 2.6, 0.8]]) {
    ripples += `M${pt(P(x, b.y1, z))}Q${pt(P(x + w / 2, b.y1, z - 0.18))} ${pt(P(x + w, b.y1, z))}`;
  }
  s += `<path d="${ripples}" fill="none" stroke="#dcbd84" stroke-width="1.6" stroke-linecap="round"/>`;
  // front face: slate, with a sand lip along the top edge
  const f0 = P(b.x0, 0, 0), f1 = P(b.x1, b.y1, 0);
  s += pathEl('url(#rootFront)', poly([P(b.x0, 0, 0), P(b.x1, 0, 0), P(b.x1, b.y1, 0), P(b.x0, b.y1, 0)]));
  s += `<rect x="${r1(f0[0])}" y="${r1(f1[1])}" width="${r1(f1[0] - f0[0])}" height="${r1(S(0) * 0.14)}" fill="${ROOT.lip}"/>`;
  // seam lines on the slate (a stack of rock strata, quietly)
  let seam = '';
  for (const yy of [0.62, 1.3, 1.95]) { const a = P(b.x0, yy, 0), c = P(b.x1, yy, 0); seam += `M${pt(a)}H${r1(c[0])}`; }
  s += `<path d="${seam}" stroke="#2b4862" stroke-width="1.2" opacity=".6"/>`;
  // the name, extruded off the front face
  s += bigTitle('CASTAWAY', 0.212, 0.3, 0, 0.55);
  return s;
}

function drawPalm() {
  const [bx, by] = P(PALM.x, RH, PALM.z); const s = S(PALM.z);
  const H = 8.7 * s;
  const N = 22;
  const c = []; // trunk centre line
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    c.push([bx + s * (1.45 * t * t - 0.35 * t), by - H * t + s * 0.25 * Math.sin(t * Math.PI)]);
  }
  const wd = (t) => s * (0.2 - 0.075 * t);
  const L = [], R = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N; const a = c[Math.max(0, i - 1)], b = c[Math.min(N, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy);
    const nx = -dy / l, ny = dx / l;
    L.push([c[i][0] - nx * wd(t), c[i][1] - ny * wd(t)]); R.push([c[i][0] + nx * wd(t), c[i][1] + ny * wd(t)]);
  }
  let out = '';
  // shadow on the sand
  out += `<ellipse cx="${r1(bx + s * 0.9)}" cy="${r1(by + 2)}" rx="${r1(s * 1.5)}" ry="${r1(s * 0.22)}" fill="#c9a66b" opacity=".55"/>`;
  const top = c[N];
  const frond = (ang, len, droop, wid, col) => {
    const pts = []; const M = 16; const outl = [], inl = [];
    for (let i = 0; i <= M; i++) {
      const t = i / M;
      const x = top[0] + Math.cos(ang) * len * s * t;
      const y = top[1] + Math.sin(ang) * len * s * t + droop * s * t * t;
      pts.push([x, y]);
    }
    for (let i = 0; i <= M; i++) {
      const t = i / M; const a = pts[Math.max(0, i - 1)], b = pts[Math.min(M, i + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
      const nx = -dy / l, ny = dx / l;
      const w = wid * s * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.08)), 0.7) * (i % 2 ? 1 : 0.5);
      outl.push([pts[i][0] + nx * w, pts[i][1] + ny * w]); inl.push([pts[i][0] - nx * w * 0.8, pts[i][1] - ny * w * 0.8]);
    }
    const shape = poly([...outl, ...inl.reverse()]);
    const rib = 'M' + pts.map(pt).join('L');
    return `<path fill="${col}" d="${shape}"/><path d="${rib}" fill="none" stroke="#24603a" stroke-width="${r1(s * 0.035)}" opacity=".7"/>`;
  };
  // back fronds
  out += frond(-2.55, 2.7, 1.9, 0.5, '#2f7d48') + frond(-0.7, 2.6, 1.8, 0.48, '#2f7d48') + frond(-1.6, 2.0, 0.4, 0.42, '#2f7d48');
  // trunk
  out += pathEl('#b97a4e', poly([...L, ...R.reverse()]));
  R.reverse();
  // lit side and rings
  let lit = ''; let rings = '';
  for (let i = 0; i < N; i++) {
    lit += poly([c[i], R[i], R[i + 1], c[i + 1]]);
    if (i % 1 === 0 && i > 0) rings += `M${pt(L[i])}L${pt(R[i])}`;
  }
  out += pathEl('#d9a06c', lit, ' opacity=".8"');
  out += `<path d="${rings}" stroke="#8a5233" stroke-width="${r1(s * 0.03)}" opacity=".75"/>`;
  // coconuts
  for (const [dx, dy] of [[-0.16, 0.12], [0.12, 0.16], [0, 0.26]]) out += `<circle cx="${r1(top[0] + dx * s)}" cy="${r1(top[1] + dy * s)}" r="${r1(s * 0.15)}" fill="#7a4a26"/>`;
  // front fronds
  out += frond(-3.0, 2.9, 2.6, 0.52, '#46a65c') + frond(0.05, 3.0, 2.4, 0.52, '#46a65c') + frond(-2.05, 2.3, 0.9, 0.46, '#53b86a')
    + frond(-1.05, 2.4, 0.8, 0.46, '#53b86a') + frond(0.75, 1.9, 2.1, 0.4, '#3f9853') + frond(-3.7, 1.8, 2.0, 0.4, '#3f9853');
  return out;
}

function drawHer() {
  const [cx, cy] = P(HER.x, RH, HER.z); const s = S(HER.z) * 1.18;
  const X = (u) => r1(cx + u * s), Y = (v) => r1(cy - v * s);
  const pp = (pts) => 'M' + pts.map(([u, v]) => `${X(u)} ${Y(v)}`).join('L') + 'Z';
  const SK = '#eab48e', SKD = '#d49a74', CORAL = '#ee735a', CREAM = '#f6edd9', HAIR = '#5b3a27';
  let o = `<g class="her">`;
  o += `<ellipse cx="${X(0)}" cy="${Y(0)}" rx="${r1(0.5 * s)}" ry="${r1(0.07 * s)}" fill="#c9a66b" opacity=".6"/>`;
  // crossed legs: thighs out to the knees, shins crossing in front
  o += `<path fill="${SK}" d="${pp([[-0.46, 0.04], [-0.4, 0.17], [-0.14, 0.24], [0.14, 0.24], [0.4, 0.17], [0.46, 0.04], [0.18, 0.02], [0, 0.07], [-0.18, 0.02]])}"/>`;
  o += `<path fill="${SKD}" d="${pp([[-0.4, 0.06], [0.1, 0.12], [0.2, 0.08], [-0.3, 0.02]])}"/>`;
  o += `<path fill="${SK}" d="${pp([[0.4, 0.06], [-0.1, 0.13], [-0.2, 0.09], [0.3, 0.03]])}"/>`;
  // bare feet tucked in
  o += `<ellipse cx="${X(-0.2)}" cy="${Y(0.05)}" rx="${r1(0.07 * s)}" ry="${r1(0.035 * s)}" fill="${SKD}"/><ellipse cx="${X(0.21)}" cy="${Y(0.05)}" rx="${r1(0.07 * s)}" ry="${r1(0.035 * s)}" fill="${SKD}"/>`;
  // cream shorts
  o += `<path fill="${CREAM}" d="${pp([[-0.3, 0.15], [-0.08, 0.13], [0, 0.16], [0.08, 0.13], [0.3, 0.15], [0.22, 0.3], [-0.22, 0.3]])}"/>`;
  // arms, hands resting on the knees
  o += `<path fill="${SK}" d="${pp([[-0.16, 0.6], [-0.22, 0.6], [-0.3, 0.38], [-0.38, 0.2], [-0.31, 0.17], [-0.23, 0.36]])}"/>`;
  o += `<path fill="${SK}" d="${pp([[0.16, 0.6], [0.22, 0.6], [0.3, 0.38], [0.38, 0.2], [0.31, 0.17], [0.23, 0.36]])}"/>`;
  // coral tank top
  o += `<path fill="${CORAL}" d="${pp([[-0.18, 0.28], [0.18, 0.28], [0.19, 0.48], [0.15, 0.6], [0.1, 0.6], [0.06, 0.55], [-0.06, 0.55], [-0.1, 0.6], [-0.15, 0.6], [-0.19, 0.48]])}"/>`;
  o += `<path fill="#d65d47" d="${pp([[-0.18, 0.28], [0.18, 0.28], [0.18, 0.33], [-0.18, 0.33]])}"/>`;
  // neck
  o += `<path fill="${SKD}" d="${pp([[-0.04, 0.55], [0.04, 0.55], [0.045, 0.68], [-0.045, 0.68]])}"/>`;
  // head (nods to the beat)
  o += `<g class="nod">`;
  o += `<circle cx="${X(0.11)}" cy="${Y(0.71)}" r="${r1(0.06 * s)}" fill="${HAIR}"/>`; // low bun, peeking out
  o += `<circle cx="${X(0)}" cy="${Y(0.79)}" r="${r1(0.115 * s)}" fill="${SK}"/>`;
  o += `<path fill="${HAIR}" d="M${X(-0.122)} ${Y(0.77)}Q${X(-0.13)} ${Y(0.93)} ${X(0)} ${Y(0.925)}Q${X(0.13)} ${Y(0.93)} ${X(0.122)} ${Y(0.77)}Q${X(0.06)} ${Y(0.86)} ${X(-0.02)} ${Y(0.84)}Q${X(-0.08)} ${Y(0.83)} ${X(-0.122)} ${Y(0.77)}Z"/>`;
  // closed eyes, small smile
  o += `<path d="M${X(-0.06)} ${Y(0.785)}q${r1(0.025 * s)} ${r1(0.018 * s)} ${r1(0.05 * s)} 0M${X(0.012)} ${Y(0.785)}q${r1(0.025 * s)} ${r1(0.018 * s)} ${r1(0.05 * s)} 0M${X(-0.025)} ${Y(0.725)}q${r1(0.025 * s)} ${r1(0.014 * s)} ${r1(0.05 * s)} 0" fill="none" stroke="#5a3424" stroke-width="${r1(Math.max(0.7, 0.014 * s))}" stroke-linecap="round"/>`;
  // cream headphones: band and cups
  o += `<path d="M${X(-0.128)} ${Y(0.78)}Q${X(-0.14)} ${Y(0.985)} ${X(0)} ${Y(0.985)}Q${X(0.14)} ${Y(0.985)} ${X(0.128)} ${Y(0.78)}" fill="none" stroke="${CREAM}" stroke-width="${r1(0.035 * s)}" stroke-linecap="round"/>`;
  o += `<rect x="${X(-0.165)}" y="${Y(0.84)}" width="${r1(0.07 * s)}" height="${r1(0.11 * s)}" rx="${r1(0.025 * s)}" fill="${CREAM}" stroke="#cdbf9f" stroke-width=".6"/>`;
  o += `<rect x="${X(0.095)}" y="${Y(0.84)}" width="${r1(0.07 * s)}" height="${r1(0.11 * s)}" rx="${r1(0.025 * s)}" fill="${CREAM}" stroke="#cdbf9f" stroke-width=".6"/>`;
  o += `</g></g>`;
  return o;
}

function drawCastle() {
  // the sandcastle (the tide will take it, 5 to 30 minutes after it is built)
  const SAND = { top: '#fbe8c0', front: '#e4c184', side: '#caa266' };
  const { x, z } = CASTLE; const y = RH;
  const parts = [
    { x0: x - 0.6, x1: x + 0.6, y0: y, y1: y + 0.32, z0: z - 0.45, z1: z + 0.45 },
    { x0: x - 0.3, x1: x + 0.3, y0: y + 0.32, y1: y + 0.86, z0: z - 0.18, z1: z + 0.3 },
    { x0: x - 0.6, x1: x - 0.36, y0: y + 0.32, y1: y + 0.98, z0: z - 0.45, z1: z - 0.21 },
    { x0: x + 0.36, x1: x + 0.6, y0: y + 0.32, y1: y + 0.98, z0: z - 0.45, z1: z - 0.21 },
  ];
  let o = parts.map((b) => boxFaces(b, SAND).map(([c, dd]) => pathEl(c, dd)).join('')).join('');
  // a door, and a coral flag on the keep
  const s = S(z - 0.18);
  const [dx, dy] = P(x, y + 0.32, z - 0.18);
  o += `<path fill="#a9834c" d="M${r1(dx - s * 0.09)} ${r1(dy)}v${r1(-s * 0.2)}a${r1(s * 0.09)} ${r1(s * 0.09)} 0 0 1 ${r1(s * 0.18)} 0v${r1(s * 0.2)}Z"/>`;
  const [fx, fy] = P(x, y + 0.86, z + 0.06);
  o += `<path d="M${r1(fx)} ${r1(fy)}v${r1(-s * 0.55)}" stroke="#7a5a33" stroke-width="1.4"/><path fill="#ff7a59" d="M${r1(fx)} ${r1(fy - s * 0.55)}l${r1(s * 0.32)} ${r1(s * 0.09)}l${r1(-s * 0.32)} ${r1(s * 0.09)}Z"/>`;
  return o;
}

function drawRaft() {
  const { x0, x1, z0, z1 } = RAFT; const y1 = 0.26;
  let o = '<g class="bob">';
  // logs run front to back: draw them as five thin boxes
  const n = 5; const lw = (x1 - x0) / n;
  for (let i = 0; i < n; i++) {
    const b = { x0: x0 + i * lw + 0.03, x1: x0 + (i + 1) * lw - 0.03, y0: 0, y1, z0: z0 + (i % 2) * 0.12, z1: z1 - ((i + 1) % 2) * 0.1 };
    o += boxFaces(b, { top: '#c98f58', front: '#9a6236', side: '#7e4d2a' }).map(([c, dd]) => pathEl(c, dd)).join('');
    const [ex, ey] = P((b.x0 + b.x1) / 2, y1 / 2, b.z0); const rr = S(b.z0) * (b.x1 - b.x0) * 0.32;
    o += `<circle cx="${r1(ex)}" cy="${r1(ey)}" r="${r1(rr)}" fill="none" stroke="#d6a36e" stroke-width="1"/>`;
  }
  // a lashing across the logs
  for (const zz of [z0 + 0.4, z1 - 0.4]) o += `<path d="M${pt(P(x0, y1 + 0.01, zz))}L${pt(P(x1, y1 + 0.01, zz))}" stroke="#efe0bd" stroke-width="2"/>`;
  // water line
  o += `<path d="M${pt(P(x0 - 0.3, 0, z0 - 0.05))}L${pt(P(x1 + 0.3, 0, z0 - 0.05))}" stroke="#e8fbff" stroke-width="2.2" stroke-linecap="round" opacity=".85"/>`;
  return o + '</g>';
}

function drawFin() {
  // a fin wearing headphones, swimming behind the island from left to right, nodding
  const s = S(FIN.z); const [, by] = P(0, 0, FIN.z);
  const h = 0.85 * s, w = 0.72 * s;
  let o = `<g class="swim"><g class="finnod" style="transform-origin:0px ${r1(by)}px">`;
  o += `<path d="M${r1(-w * 0.55)} ${r1(by)}Q${r1(-w * 0.1)} ${r1(by - h * 0.45)} ${r1(w * 0.2)} ${r1(by - h)}Q${r1(w * 0.16)} ${r1(by - h * 0.4)} ${r1(w * 0.5)} ${r1(by)}Z" fill="#5d6f80"/>`;
  o += `<path d="M${r1(w * 0.2)} ${r1(by - h)}Q${r1(w * 0.16)} ${r1(by - h * 0.4)} ${r1(w * 0.5)} ${r1(by)}L${r1(w * 0.2)} ${r1(by)}Z" fill="#4a5a69"/>`;
  // headphones: a cream band over the fin with a cup each side
  o += `<path d="M${r1(-w * 0.32)} ${r1(by - h * 0.32)}Q${r1(w * 0.05)} ${r1(by - h * 1.02)} ${r1(w * 0.4)} ${r1(by - h * 0.3)}" fill="none" stroke="#f6edd9" stroke-width="${r1(s * 0.055)}" stroke-linecap="round"/>`;
  o += `<rect x="${r1(-w * 0.42)}" y="${r1(by - h * 0.4)}" width="${r1(s * 0.12)}" height="${r1(s * 0.16)}" rx="${r1(s * 0.04)}" fill="#f6edd9"/>`;
  o += `<rect x="${r1(w * 0.33)}" y="${r1(by - h * 0.38)}" width="${r1(s * 0.12)}" height="${r1(s * 0.16)}" rx="${r1(s * 0.04)}" fill="#f6edd9"/>`;
  o += `</g><path d="M${r1(-w * 1.1)} ${r1(by + 1)}Q${r1(-w * 0.5)} ${r1(by - 2)} 0 ${r1(by + 1)}Q${r1(w * 0.5)} ${r1(by - 2)} ${r1(w * 1.1)} ${r1(by + 1)}" fill="none" stroke="#f2feff" stroke-width="1.6" stroke-linecap="round"/>`;
  return o + '</g>';
}

function drawTurtle() {
  // a sea turtle, visiting, swimming on the spot; flippers alternate on the beat
  const [cx, cy] = P(TURTLE.x, 0, TURTLE.z); const s = S(TURTLE.z);
  const e = (x, y, rx, ry, rot, fill) => `<ellipse cx="${r1(cx + x * s)}" cy="${r1(cy + y * s)}" rx="${r1(rx * s)}" ry="${r1(ry * s)}" transform="rotate(${rot} ${r1(cx + x * s)} ${r1(cy + y * s)})" fill="${fill}"/>`;
  const FL = '#7fb38a';
  let o = `<g>`;
  o += `<ellipse cx="${r1(cx)}" cy="${r1(cy + 0.04 * s)}" rx="${r1(0.95 * s)}" ry="${r1(0.3 * s)}" fill="none" stroke="#e9fdff" stroke-width="1.4" opacity=".7"/>`;
  o += `<g class="fa">${e(0.36, -0.2, 0.32, 0.09, -30, FL)}${e(0.36, 0.2, 0.32, 0.09, 30, FL)}${e(-0.42, -0.12, 0.17, 0.06, 25, FL)}${e(-0.42, 0.12, 0.17, 0.06, -25, FL)}</g>`;
  o += `<g class="fb">${e(0.3, -0.24, 0.32, 0.09, -60, FL)}${e(0.3, 0.24, 0.32, 0.09, 60, FL)}${e(-0.42, -0.15, 0.17, 0.06, 50, FL)}${e(-0.42, 0.15, 0.17, 0.06, -50, FL)}</g>`;
  o += e(0.62, 0, 0.14, 0.1, 0, '#8cc196');
  o += e(0, 0, 0.5, 0.25, 0, '#5c6f3a') + e(-0.02, -0.02, 0.42, 0.19, 0, '#86924d');
  // scutes
  o += `<path d="M${r1(cx - 0.3 * s)} ${r1(cy - 0.02 * s)}H${r1(cx + 0.3 * s)}M${r1(cx - 0.12 * s)} ${r1(cy - 0.18 * s)}V${r1(cy + 0.15 * s)}M${r1(cx + 0.12 * s)} ${r1(cy - 0.18 * s)}V${r1(cy + 0.15 * s)}" stroke="#5c6f3a" stroke-width="1.1" fill="none"/>`;
  o += `<circle cx="${r1(cx + 0.68 * s)}" cy="${r1(cy - 0.03 * s)}" r="1.1" fill="#24331c"/>`;
  return o + '</g>';
}

function drawDrone() {
  // the delivery drone, hovering on the beat; the parcel is another pair of headphones
  const [cx, cy] = P(DRONE.x, DRONE.y, DRONE.z); const s = S(DRONE.z);
  const [, gy] = P(DRONE.x, 0, DRONE.z);
  const u = s / 50;
  let o = `<ellipse cx="${r1(cx)}" cy="${r1(gy)}" rx="${r1(26 * u)}" ry="${r1(5 * u)}" fill="#0a4e66" opacity=".22"/>`;
  o += `<g class="hover"><g transform="translate(${r1(cx)} ${r1(cy)}) scale(${+u.toFixed(3)})">`;
  // string and parcel
  o += '<path d="M0 4V20" stroke="#5b4630" stroke-width="1.2"/>';
  o += '<path fill="#e3b277" d="M-11 20L-7 16H13L9 20Z"/><rect x="-11" y="20" width="20" height="15" fill="#c8915a"/><path fill="#a87442" d="M9 20L13 16V31L9 35Z"/>';
  o += '<path d="M-1 20V35M-11 26H9" stroke="#efd29d" stroke-width="1.6"/>';
  o += '<path d="M-6.5 30.5Q-6.5 22.5 -1 22.5Q4.5 22.5 4.5 30.5" fill="none" stroke="#fff4dc" stroke-width="1.6"/><rect x="-8" y="28.5" width="3.4" height="4.8" rx="1.2" fill="#fff4dc"/><rect x="2.6" y="28.5" width="3.4" height="4.8" rx="1.2" fill="#fff4dc"/>';
  // body, arms and rotors
  o += '<path d="M-22 -3H22" stroke="#3a4552" stroke-width="3" stroke-linecap="round"/>';
  o += '<rect x="-10" y="-6" width="20" height="10" rx="4" fill="#46525f"/><rect x="-8" y="-6" width="16" height="3.5" rx="1.75" fill="#7f8d9b"/><circle cx="0" cy="1.5" r="1.6" fill="#ff7a59"/>';
  o += '<g class="ra"><ellipse cx="-22" cy="-5" rx="11" ry="2" fill="#dfe8ef" opacity=".8"/><ellipse cx="22" cy="-5" rx="11" ry="2" fill="#dfe8ef" opacity=".8"/></g>';
  o += '<g class="rb"><ellipse cx="-22" cy="-5" rx="5" ry="1.6" fill="#dfe8ef" opacity=".8"/><ellipse cx="22" cy="-5" rx="5" ry="1.6" fill="#dfe8ef" opacity=".8"/></g>';
  return o + '</g></g>';
}

function drawBottle() {
  // a message in a bottle, bobbing (it always washes straight back)
  const [cx, cy] = P(BOTTLE.x, 0, BOTTLE.z); const s = S(BOTTLE.z);
  let o = `<g class="bob2"><g transform="translate(${r1(cx)} ${r1(cy)}) rotate(-14) scale(${+(s / 40).toFixed(3)})">`;
  o += '<rect x="-12" y="-9" width="18" height="10" rx="4" fill="#4fae7f" opacity=".85"/>';
  o += '<rect x="5" y="-6.5" width="7" height="5" rx="1.5" fill="#4fae7f" opacity=".85"/><rect x="11" y="-7" width="3.5" height="6" rx="1" fill="#b98a55"/>';
  o += '<rect x="-9" y="-6.5" width="12" height="4.5" rx="2" fill="#fff4dc"/><path d="M-10 -8.4H3" stroke="#d7fff0" stroke-width="1.2" opacity=".8"/>';
  o += '<path d="M-18 1.5Q-12 -1 -6 1.5T6 1.5T18 1.5" fill="none" stroke="#e9fdff" stroke-width="1.6" stroke-linecap="round" opacity=".85"/>';
  return o + '</g></g>';
}

// glass tower covered in names (front and back faces face the camera; side faces in perspective)
let towerN = 0;
const extraCss = [];
function drawTower(n, b, names, scan) {
  const id = towerN++;
  const LH = 0.4;            // line pitch (world)
  const g = 0.034;           // world units per glyph unit
  const m = 0.16;            // inset from the face edge
  const nLines = Math.floor((b.y1 - b.y0 - 2 * m) / LH);
  const lines = []; for (let i = 0; i < nLines; i++) lines.push(names[(i + id * 5) % names.length]);
  const faces = {
    front: { o: [b.x0, b.y1, b.z0], u: [1, 0, 0], w: b.x1 - b.x0 },
    back: { o: [b.x1, b.y1, b.z1], u: [-1, 0, 0], w: b.x1 - b.x0 },
    left: { o: [b.x0, b.y1, b.z1], u: [0, 0, -1], w: b.z1 - b.z0 },
    right: { o: [b.x1, b.y1, b.z0], u: [0, 0, 1], w: b.z1 - b.z0 },
  };
  const visSide = b.x1 < 0 ? 'right' : b.x0 > 0 ? 'left' : null;
  const hidSide = visSide === 'right' ? 'left' : 'right';
  const faceText = (f, cls) => {
    let s = '';
    lines.forEach((str, i) => {
      const maxChars = Math.floor((f.w - 2 * m) / (ADV * g));
      const t = str.length > maxChars ? str.slice(0, maxChars) : str;
      const o3 = [f.o[0] + f.u[0] * m, f.o[1] - m - i * LH, f.o[2] + f.u[2] * m];
      const p0 = P(...o3);
      const L = 20;
      const px = P(o3[0] + f.u[0] * L * g, o3[1], o3[2] + f.u[2] * L * g);
      const py = P(o3[0], o3[1] - 10 * g, o3[2]);
      s += textM(t, p0, [(px[0] - p0[0]) / L, (px[1] - p0[1]) / L], [(py[0] - p0[0]) / 10, (py[1] - p0[1]) / 10], cls);
    });
    return s;
  };
  const quad = (name) => {
    const { x0, x1, y0, y1, z0, z1 } = b;
    if (name === 'front') return poly([P(x0, y0, z0), P(x1, y0, z0), P(x1, y1, z0), P(x0, y1, z0)]);
    if (name === 'back') return poly([P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1)]);
    const x = name === 'left' ? x0 : x1;
    return poly([P(x, y0, z0), P(x, y1, z0), P(x, y1, z1), P(x, y0, z1)]);
  };
  const z = b.z0;
  let o = `<g>`;
  // through the glass: the far faces, their text reversed
  o += `<path fill="${fog('#1d4f9c', z)}" opacity=".35" d="${quad('back') + quad(hidSide)}"/>`;
  o += faceText(faces.back, 'gtr') + faceText(faces[hidSide], 'gtr');
  // the roof (seen from above) and the near faces
  o += `<path fill="${fog('#8fc4ff', z)}" opacity=".45" d="${poly([P(b.x0, b.y1, b.z0), P(b.x1, b.y1, b.z0), P(b.x1, b.y1, b.z1), P(b.x0, b.y1, b.z1)])}"/>`;
  if (visSide) o += `<path fill="${fog('#2462c4', z)}" opacity=".5" d="${quad(visSide)}"/>` + faceText(faces[visSide], 'gt');
  o += `<path fill="${fog('#2a6fdb', z)}" opacity=".42" d="${quad('front')}"/>`;
  if (names === ROUTINE_NAMES) o += `<path class="alert" fill="#ff3b30" d="${quad('front')}"/>`;
  o += faceText(faces.front, 'gt');
  if (scan) { // highlight bar scanning down the front list, one line per beat
    const [lx, ty] = P(b.x0 + 0.05, b.y1 - m + 0.06, b.z0); const [rx] = P(b.x1 - 0.05, 0, b.z0);
    const hpx = LH * S(b.z0);
    o += `<rect class="scan${id}" x="${r1(lx)}" y="${r1(ty)}" width="${r1(rx - lx)}" height="${r1(hpx)}" fill="#f2fdff" opacity=".68"/>`;
    extraCss.push(`.scan${id}{animation:scan${id} ${(nLines * 0.75).toFixed(2)}s steps(${nLines},end) infinite}@keyframes scan${id}{to{transform:translateY(${r1(hpx * nLines)}px)}}`);
  }
  // edges
  const e = [quad('front'), quad(visSide || 'left'), poly([P(b.x0, b.y1, b.z0), P(b.x1, b.y1, b.z0), P(b.x1, b.y1, b.z1), P(b.x0, b.y1, b.z1)])].join('');
  o += `<path d="${e}" fill="none" stroke="${fog('#d8efff', z)}" stroke-width="1" opacity=".9"/>`;
  return o + '</g>';
}

// ---------------------------------------------------------------------------------------------
// Ground: lagoon plane with a grid, wires with pulses, haze
// ---------------------------------------------------------------------------------------------
function ground() {
  let o = `<rect x="-200" y="${HY}" width="${VW + 400}" height="${VH - HY + 200}" fill="url(#sea)"/>`;
  // grid: lines of constant x converge on the vanishing point, lines of constant z are horizontal
  let gx = '', gz = '';
  for (let x = -96; x <= 96; x += 4) { const a = P(x, 0, -6), b = P(x, 0, 400); gx += `M${pt(a)}L${pt(b)}`; }
  for (let z = -4; z < 300; z += z < 40 ? 4 : z < 100 ? 8 : 20) { const a = P(-400, 0, z), b = P(400, 0, z); gz += `M${r1(Math.max(-300, a[0]))} ${r1(a[1])}H${r1(Math.min(VW + 300, b[0]))}`; }
  o += `<path d="${gx}${gz}" stroke="#effffd" stroke-width="1" opacity=".22" fill="none"/>`;
  // shadows: a high sun behind the scene, to the left, throws them forward and right
  const OX = 0.55, OZ = -0.5;
  let sh = '';
  for (const it of items) {
    if (!['ped', 'root', 'tower'].includes(it.kind)) continue;
    const { x0, x1, y1, z0, z1 } = it.b; const h = it.kind === 'ped' ? Math.max(y1, it.tall || 0) : y1;
    const ox = OX * h, oz = OZ * h;
    sh += poly([[x0, z1], [x1, z1], [x1 + ox, z1 + oz], [x1 + ox, z0 + oz], [x0 + ox, z0 + oz], [x0, z0]].map(([x, z]) => P(x, 0, z)));
  }
  o += `<path d="${sh}" fill="#0a4e66" opacity=".2"/>`;
  // sun glints on the lagoon, twinkling at their own pace
  const rnd = mulberry32(1992);
  let gl = '';
  for (let i = 0, n = 0; n < 18 && i < 400; i++) {
    const x = -34 + rnd() * 68, z = -1.5 + rnd() * 26;
    if (x > -9 && x < 9 && z < 10) continue;
    if (items.some((it) => (it.kind === 'ped' || it.kind === 'tower') && x > it.b.x0 - 1 && x < it.b.x1 + 1 && z > it.b.z0 - 1 && z < it.b.z1 + 2)) continue;
    const [gx2, gy2] = P(x, 0, z); const w = 0.5 * S(z);
    if (gy2 > VH - 4 || gx2 < 10 || gx2 > VW - 10) continue;
    gl += `<path class="gl" style="animation-delay:${(-rnd() * 4.5).toFixed(2)}s" d="M${r1(gx2 - w / 2)} ${r1(gy2)}h${r1(w)}M${r1(gx2)} ${r1(gy2 - w / 4)}v${r1(w / 2)}"/>`;
    n++;
  }
  return o + gl;
}
function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function wires() {
  let base = '', pulses = '';
  let k = 0;
  for (const n of NODES) {
    if (!n.parent && n.parent !== '') continue;
    const p = byId[n.parent];
    const pb = p.b, cb = n.b;
    const zm = (pb.z1 + cb.z0) / 2;
    const pts = [P(p.x, 0, pb.z1), P(p.x, 0, zm), P(n.x, 0, zm), P(n.x, 0, cb.z0)];
    const dd = 'M' + pts.map(pt).join('L');
    const sw = r1(Math.max(1, S(zm) * 0.12));
    base += `<path d="${dd}" stroke-width="${sw}"/>`;
    const dur = (3 + ((k * 7) % 5) * 0.75).toFixed(2);
    const del = (-((k * 1.9) % 3)).toFixed(2);
    pulses += `<path d="${dd}" pathLength="100" stroke-width="${r1(sw * 1.9)}" style="animation-duration:${dur}s;animation-delay:${del}s"/>`;
    k++;
  }
  return `<g class="wire">${base}</g><g class="pulse">${pulses}</g>`;
}

// ---------------------------------------------------------------------------------------------
// Sky: gradient, a few flat clouds drifting
// ---------------------------------------------------------------------------------------------
function cloud(x, y, sc) {
  const e = [[0, 0, 46, 12], [-30, 4, 30, 9], [30, 3, 34, 10], [-8, -9, 26, 12], [18, -6, 20, 9]];
  return e.map(([dx, dy, rx, ry]) => `<ellipse cx="${r1(x + dx * sc)}" cy="${r1(y + dy * sc)}" rx="${r1(rx * sc)}" ry="${r1(ry * sc)}"/>`).join('');
}

// ---------------------------------------------------------------------------------------------
// HUD: ten stops, one every 6 s (two bars at 80 BPM), and a legend
// ---------------------------------------------------------------------------------------------
const STOPS = [
  ['castaway/', 'ONE ISLAND. ONE PALM. ONE RAFT. TEN HOURS.', 'THE CAMERA NEVER MOVES. EXCEPT IN HERE.'],
  ['activities.toml', 'MORE THAN 90 ACTIVITIES, MOST ON FOUR TIMERS', '2-5 MIN · 12-25 MIN · 30-60 MIN · 3-6 HOURS'],
  ['web/js/routines/', 'THE GAGS, AS CODE', 'BOTTLE · DRONE · CAT · SHARK · CRAB · COCONUT'],
  ['tools/schedule.py', 'SIMULATES A TEN-HOUR RUN, SEED 1992', 'EVERY GAG STARTS ON THE NEXT BAR: EVERY 3 S'],
  ['castaway/her', 'NOT A FILE. JUST IDLING, ON THE BEAT.', 'BUSY A THIRD OF THE TIME. THE REST IS THIS.'],
  ['tools/make_audio.py', 'EVERY SOUND IS SYNTHESIZED FROM CODE', 'NO SAMPLES, NO LOOPS, NO RECORDINGS'],
  ['media/audio/', 'MORE THAN 150 SOUND FILES', 'THEME: 80 BPM, F MAJOR, KALIMBA LEAD. MIX: -14 LUFS.'],
  ['web/index.html', 'LIVE PREVIEW. EXPORTS A YOUTUBE-READY MP4.', 'PLAIN ES MODULES. NO BUILD STEP. NO NPM.'],
  ['tools/serve.py', 'RUN ME, THEN OPEN 127.0.0.1:8765', 'python tools/serve.py'],
  ['MUSING.md', 'THE PROJECT LOG. CURRENT STATE FIRST.', 'IN DEVELOPMENT. NOTHING PUBLISHED YET.'],
];
const STOP_S = 6, LOOP_S = STOPS.length * STOP_S;
const named2 = (key) => named[key] || named[key.replace(/\/$/, '')] || byId[key.replace(/\/$/, '')]?.b;

function marker(key, i) {
  const b = named2(key); if (!b) throw new Error('no marker target ' + key);
  const pad = key === 'castaway/' ? 0.1 : 0.12;
  const bb = { x0: b.x0 - pad, x1: b.x1 + pad, y0: b.y0, y1: b.y1 + pad, z0: b.z0 - pad, z1: b.z1 + pad };
  const fr = poly([P(bb.x0, bb.y0, bb.z0), P(bb.x1, bb.y0, bb.z0), P(bb.x1, bb.y1, bb.z0), P(bb.x0, bb.y1, bb.z0)]);
  const tp = poly([P(bb.x0, bb.y1, bb.z0), P(bb.x1, bb.y1, bb.z0), P(bb.x1, bb.y1, bb.z1), P(bb.x0, bb.y1, bb.z1)]);
  const [cx] = P((bb.x0 + bb.x1) / 2, 0, bb.z0);
  const topY = Math.min(P(0, bb.y1, bb.z1)[1], P(0, bb.y1, bb.z0)[1]);
  const wTop = Math.abs(P(bb.x1, bb.y1, bb.z1)[0] - P(bb.x0, bb.y1, bb.z1)[0]);
  let o = `<g class="st st${i}">`;
  if (key !== 'castaway/') {
    // a spotlight from above
    o += `<path fill="url(#beam)" d="M${r1(cx - 5)} -4L${r1(cx + 5)} -4L${r1(cx + wTop / 2 + 2)} ${r1(topY)}L${r1(cx - wTop / 2 - 2)} ${r1(topY)}Z"/>`;
  }
  // the selection: a soft yellow halo under a white outline of the front and top faces
  o += `<path d="${fr}${tp}" class="selg"/><path d="${fr}${tp}" class="sel"/>`;
  return o + '</g>';
}

function hud() {
  const x = 20, y = 18, w = 532, h = 118;
  let o = `<g class="hud">`;
  o += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#0d2c47" opacity=".9"/>`;
  o += `<rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}" rx="7.5" fill="none" stroke="#9fe3ff" stroke-opacity=".55"/>`;
  o += `<path d="M${x} ${y + 24}H${x + w}" stroke="#9fe3ff" stroke-opacity=".35"/>`;
  o += text('FLYOVER', x + 14, y + 7.5, 1.0, 'hk');
  STOPS.forEach(([p, a, b], i) => {
    o += `<g class="st st${i}">`;
    o += text(`${String(i + 1).padStart(2, '0')}/${STOPS.length}`, x + w - 14, y + 7.5, 1.0, 'hk', 'end');
    o += text('▸', x + 14, y + 35, 1.35, 'hp');
    o += text(p, x + 32, y + 33, 1.65, 'hp');
    o += text(a, x + 14, y + 64, 1.36, 'ha');
    o += text(b, x + 14, y + 91, 1.12, b === 'python tools/serve.py' ? 'hc' : 'hb');
    o += `</g>`;
  });
  return o + '</g>';
}

function legend() {
  const x = 878, y = 18, w = 382, h = 118;
  let o = `<g>`;
  o += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#0d2c47" opacity=".9"/>`;
  o += `<rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}" rx="7.5" fill="none" stroke="#9fe3ff" stroke-opacity=".55"/>`;
  o += `<path d="M${x} ${y + 24}H${x + w}" stroke="#9fe3ff" stroke-opacity=".35"/>`;
  o += text('LEGEND', x + 14, y + 7.5, 1.0, 'hk');
  o += text('SNAPSHOT 2026-10-01', x + w - 14, y + 7.5, 1.0, 'hk', 'end');
  // little boxes for age
  AGE.forEach((a, i) => {
    const bx = x + 16 + i * 124, by = y + 38;
    o += `<path fill="${a.top}" d="M${bx} ${by + 4}L${bx + 4} ${by}H${bx + 16}L${bx + 12} ${by + 4}Z"/><rect x="${bx}" y="${by + 4}" width="12" height="12" fill="${a.front}"/><path fill="${a.side}" d="M${bx + 12} ${by + 4}L${bx + 16} ${by}V${by + 12}L${bx + 12} ${by + 16}Z"/>`;
    o += text(a.label, bx + 22, by + 3.5, 1.0, 'hb');
  });
  o += text('BOX = FILE. STRIPED BOX = MANY FILES.', x + 16, y + 64, 1.0, 'hb');
  o += text('HEIGHT = SIZE (LOG). PEDESTAL = FOLDER.', x + 16, y + 82, 1.0, 'hb');
  o += text('WIRE = PARENT TO CHILD. RED GLASS = ALERT.', x + 16, y + 100, 1.0, 'hb');
  return o + '</g>';
}

// ---------------------------------------------------------------------------------------------
// Assemble
// ---------------------------------------------------------------------------------------------
const ordered = order(items);
let scene = ordered.map((it) => it.draw()).join('\n');

const css = [
  `.lb{fill:none;stroke:#f4fbff;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}`,
  `.lbf{fill:none;stroke:#eef7fb;stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round;opacity:.8}`,
  `.gt{fill:none;stroke:#ffffff;stroke-width:1.1;stroke-linecap:round;opacity:.92}`,
  `.gtr{fill:none;stroke:#e6f3ff;stroke-width:1.1;stroke-linecap:round;opacity:.38}`,
  `.hk{fill:none;stroke:#8fd9f5;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}`,
  `.hp{fill:none;stroke:#ffffff;stroke-width:1.35;stroke-linecap:round;stroke-linejoin:round}`,
  `.ha{fill:none;stroke:#ffd166;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}`,
  `.hb{fill:none;stroke:#cfe9f5;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}`,
  `.hc{fill:none;stroke:#9ff5c9;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}`,
  `.tf{fill:url(#titleFront);stroke:#fff8ea;stroke-width:1}`,
  `.tt{fill:#ffb08f}.ts{fill:#d9573f}.tc{fill:#e8694e}.tb{fill:#a8402f}`,
  `.wire path{fill:none;stroke:#f2fffe;opacity:.75;stroke-linejoin:round}`,
  `.pulse path{fill:none;stroke:#fff3a6;stroke-linecap:round;stroke-dasharray:3 97;animation:pulse 4s linear infinite}`,
  `@keyframes pulse{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}`,
  `.sel{fill:#ffffff;fill-opacity:.14;stroke:#ffffff;stroke-width:2;stroke-linejoin:round}`,
  `.selg{fill:none;stroke:#fff3a6;stroke-width:6;stroke-linejoin:round;opacity:.45}`,
  `.st{opacity:0;animation:st ${LOOP_S}s step-end infinite}.st0{opacity:1}`,
  `@keyframes st{0%{opacity:1}${(100 / STOPS.length).toFixed(3)}%{opacity:0}100%{opacity:0}}`,
  ...STOPS.map((_, i) => `.st${i}{animation-delay:${i ? -(LOOP_S - i * STOP_S) : 0}s}`),
  `.world{transform-origin:${VPX}px ${HY}px;animation:fly 30s ease-in-out infinite}`,
  `@keyframes fly{0%,100%{transform:none}50%{transform:scale(1.045) rotate(-.5deg)}}`,
  `.nod{animation:nod .75s steps(1,end) infinite}@keyframes nod{50%{transform:translateY(1.4px)}}`,
  `.bob{animation:bob 3s steps(1,end) infinite}@keyframes bob{50%{transform:translateY(1.2px)}}`,
  `.bob2{animation:bob 1.5s steps(1,end) infinite}`,
  `.hover{animation:hover .75s steps(1,end) infinite}@keyframes hover{50%{transform:translateY(-2px)}}`,
  `.rb{opacity:0}.ra,.rb{animation:fl .5s steps(1,end) infinite}.rb{animation-delay:-.25s}`,
  `.gl{fill:none;stroke:#ffffff;stroke-width:1.6;stroke-linecap:round;opacity:0;animation:gl 4.5s steps(1,end) infinite}@keyframes gl{0%{opacity:.9}12%{opacity:.35}24%{opacity:0}}`,
  `.fb{opacity:0}.fa,.fb{animation:fl 1.5s steps(1,end) infinite}.fb{animation-delay:-.75s}@keyframes fl{0%{opacity:1}50%{opacity:0}}`,
  `.swim{animation:swim ${LOOP_S}s linear infinite}@keyframes swim{from{transform:translateX(-120px)}to{transform:translateX(${VW + 120}px)}}`,
  `.finnod{animation:finnod .75s steps(1,end) infinite}@keyframes finnod{50%{transform:rotate(-7deg)}}`,
  `.alert{opacity:0;animation:alert ${LOOP_S}s linear infinite}@keyframes alert{0%,25%{opacity:0}25.667%,28.5%{opacity:.62}30%,100%{opacity:0}}`,
  `.cl{fill:#ffffff;opacity:.88}`,
  `.drift{animation:drift 120s linear infinite}@keyframes drift{from{transform:translateX(-260px)}to{transform:translateX(${VW + 260}px)}}`,
  ...extraCss,
  ...[...FILLS].map(([h, k]) => `.${k}{fill:${h}}`),
  `@media (prefers-reduced-motion:reduce){*{animation:none!important}.st{opacity:0}.st0{opacity:1}.swim{transform:translateX(250px)}}`,
].join('\n');

const clouds = [[0.0, 60, 0.9], [0.38, 140, 0.7], [0.7, 96, 1.1]].map(([ph, y, sc], i) =>
  `<g class="drift cl" style="animation-delay:${-(ph * 120).toFixed(1)}s">${cloud(0, y, sc)}</g>`).join('');

// build HUD etc. first so their glyphs are registered before defs are emitted
const hudSvg = hud();
const legendSvg = legend();
const markers = STOPS.map(([k], i) => marker(k, i)).join('');
const groundSvg = ground();
const wireSvg = wires();
const runSvg = runDefs(); // registers every glyph it uses

const defs = `<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d8bd9"/><stop offset=".55" stop-color="#8fcaee"/><stop offset="1" stop-color="#e2f3f2"/></linearGradient>
<linearGradient id="sea" gradientUnits="userSpaceOnUse" x1="0" y1="${HY}" x2="0" y2="${VH}"><stop offset="0" stop-color="#bfe9e6"/><stop offset=".12" stop-color="#7fd0d2"/><stop offset=".55" stop-color="#2fa4b6"/><stop offset="1" stop-color="#147f98"/></linearGradient>
<linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2f3f2" stop-opacity="0"/><stop offset=".5" stop-color="#e8f7f5" stop-opacity=".95"/><stop offset="1" stop-color="#e2f3f2" stop-opacity="0"/></linearGradient>
<linearGradient id="rootFront" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a5d7d"/><stop offset="1" stop-color="#25415a"/></linearGradient>
<linearGradient id="titleFront" gradientUnits="userSpaceOnUse" x1="0" y1="${r1(P(0, 2.3, -0.55)[1])}" x2="0" y2="${r1(P(0, 0.3, -0.55)[1])}"><stop offset="0" stop-color="#fffaf0"/><stop offset=".55" stop-color="#ffe7bf"/><stop offset="1" stop-color="#ffc98f"/></linearGradient>
<linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#ffffff" stop-opacity=".38"/></linearGradient>
<clipPath id="frame"><rect width="${VW}" height="${VH}" rx="18"/></clipPath>
${[...glyphIds].map(([ch, id]) => `<path id="${id}" d="${GLYPHS[ch]}"/>`).join('')}
${runSvg}
</defs>`;


const body = `<g clip-path="url(#frame)">
<rect width="${VW}" height="${HY + 2}" fill="url(#sky)"/>
${clouds}
<g class="world">
${groundSvg}
<rect x="-200" y="${HY - 26}" width="${VW + 400}" height="52" fill="url(#haze)"/>
${wireSvg}
${scene}
${markers}
</g>
${hudSvg}
${legendSvg}
</g>
<rect x="1" y="1" width="${VW - 2}" height="${VH - 2}" rx="17" fill="none" stroke="#0b2236" stroke-width="2"/>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VW} ${VH}" width="${VW}" height="${VH}" role="img" aria-labelledby="ttl">
<title id="ttl">CASTAWAY: the project's own folders as a sunny 3D file-system landscape</title>
<style>
${css}
</style>
${defs}
${body}
</svg>
`;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${(svg.length / 1024).toFixed(1)} KB, ${items.length} solids)`);
