// Fullwidth Text header (catalogue entry vap-02: vaporwave as plain text) for the Castaway README.
// Plain Node, no dependencies, deterministic. Run:
//   node examples/castaway/src/04-fullwidth_opus_5.5.mjs
// It rewrites examples/castaway/04-fullwidth_opus_5.5.md. Edit this file, not the .md.
//
// The whole header is text, laid out like the back of a record sleeve. The look comes from:
//   1. the title in fullwidth Latin (U+FF21..) with an ideographic space (U+3000) between words,
//      and one line of real Japanese under it;
//   2. a horizon band of shade blocks, dark at the horizon and dissolving towards the viewer,
//      under a palm, an island and a ship drawn with half blocks;
//   3. the facts set as an album track list: number, title, dot leader, running time, with
//      open-sided rules and a lot of empty space.
//
// Alignment. Measured in Chromium with GitHub's monospace stack on Windows (Consolas): ░▒▓█▀▄▌▐,
// the box-drawing rules and · are exactly one ASCII cell wide. Quadrant blocks (▖▗▘▝...) and the
// eighth blocks (▁▂▃...) are not in Consolas; they fall back to a font with a wider advance and the
// row drifts, so they are banned here. Fullwidth and Japanese glyphs also come from a fallback
// font, about 13.6 px where two cells are 15 px, so the generator enforces one rule: on any line
// with fullwidth or Japanese text, that text is the LAST thing on the line. Whatever drift there
// is happens off the right-hand end and cannot push anything else out of line.
//
// Facts. Every number is from D:/python/castaway (activities.toml, MUSING.md, tools/*), checked on
// 2026-10-01. Each running time is the real [shortest, longest] duration of that activity in
// activities.toml. Track 00 is the idle time: the file's header says she is busy about a third
// of the time (median of 200 runs), and `python -B tools/schedule.py` for seed 1992 said 28% busy
// on 2026-10-01, so idling is 6:40 to 7:12 of the 10 hours: "about 7:00:00".
// The number of activities is left out on purpose: it was 81 and then 92 on 2026-10-01 alone.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(HERE, '..', '04-fullwidth_opus_5.5.md');
const W = 80; // hard ceiling for any line

// ---------------------------------------------------------------- inline markup
// Bold and links are marker characters while lines are built, so widths can be measured
// exactly; the HTML is produced at the very end.
const links = [];
const B = (s) => `\u0001${s}\u0002`;
const A = (s, href = s) => {
  links.push(href);
  return `\u0003${String.fromCharCode(0xe000 + links.length - 1)}${s}\u0004`;
};
const visible = (s) => s.replace(/\u0003[\ue000-\uf8ff]/g, '').replace(/[\u0001\u0002\u0004]/g, '');
const WIDE_RE = /[\u3000-\u30ff\u4e00-\u9fff\uff01-\uff60]/u;
const len = (s) => [...visible(s)].reduce((n, ch) => n + (WIDE_RE.test(ch) ? 2 : 1), 0);
const sp = (n) => ' '.repeat(n);
const padR = (s, n) => s + sp(Math.max(0, n - len(s)));
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const toHtml = (s) => esc(s)
  .replace(/\u0001/g, '<b>').replace(/\u0002/g, '</b>')
  .replace(/\u0003([\ue000-\uf8ff])/g, (m, c) => `<a href="${links[c.charCodeAt(0) - 0xe000]}">`)
  .replace(/\u0004/g, '</a>');

// ASCII to fullwidth: U+FF01..FF5E map one-to-one onto 0x21..0x7E; a space becomes U+3000.
const fw = (s) => [...s].map((c) => (c === ' ' ? '\u3000' : String.fromCharCode(c.charCodeAt(0) + 0xfee0))).join('');

// "head ......... value", the value ending exactly at column `end`.
const leader = (head, value, end) => {
  const h = `${head} `;
  const t = ` ${value}`;
  const dots = end - len(h) - len(t);
  if (dots < 3) throw new Error(`no room for a dot leader: ${visible(head)} | ${visible(value)}`);
  return h + '.'.repeat(dots) + t;
};
// An open-sided rule: "── label ─────────── right", ending at column `end` (no corners, no box).
const rule = (indent, label, right, end) => {
  const h = `${sp(indent)}── ${label} `;
  const t = right ? ` ${right}` : '';
  const n = end - len(h) - len(t);
  if (n < 2) throw new Error(`rule too short: ${visible(label)}`);
  return h + '─'.repeat(n) + t;
};

// ---------------------------------------------------------------- the picture
// One character cell holds two "pixels", one above the other (▀ ▄ █), which makes a pixel about
// 7.5 x 8 px: close to square. L and R put a trunk segment in the left or right half of a cell
// (▌ ▐), so the palm can lean by half a column at a time. GitHub's <pre> has a 1.45 line height,
// so there is a thin gap under every text row; on the trunk it reads as segmented bark.
const halfRows = (bm) => {
  const w = Math.max(...bm.map((r) => r.length));
  const rows = bm.map((r) => r.padEnd(w, '.'));
  if (rows.length % 2) rows.push('.'.repeat(w));
  const out = [];
  for (let y = 0; y < rows.length; y += 2) {
    let s = '';
    for (let x = 0; x < w; x++) {
      const t = rows[y][x], b = rows[y + 1][x];
      if (t === 'L' || b === 'L') s += '▌';
      else if (t === 'R' || b === 'R') s += '▐';
      else s += t === '#' && b === '#' ? '█' : t === '#' ? '▀' : b === '#' ? '▄' : ' ';
    }
    out.push(s);
  }
  return out;
};

// The palm: tall and slender, fronds arching out and drooping at the tips, the trunk curving
// gently down to the sand. Drawn from scratch for this header.
const PALM = [
  '...........#######.....#######.............',
  '........############.############..........',
  '.....#####.......#######.......#####.......',
  '...####......################......####....',
  '..###......#####....###....#####.....###...',
  '.##.......###......##.##.......###....##...',
  '##.......##.......##..#.##.......##....#...',
  '#........#.......#....#..##.......#........',
  '......................R....................',
  '......................R....................',
  '......................L....................',
  '......................L....................',
  '.....................R.....................',
  '.....................R.....................',
];
const TRUNK_FOOT = 21; // column of the trunk's last segment, inside the palm drawing

// The island it stands on: a low mound of sand, sitting on the horizon.
const ISLAND = [
  '.........######.........',
  '...##################...',
];

// The ship that sails past while she is busy: funnel, superstructure, and a hull that narrows
// to the waterline.
const SHIP = [
  '....#....',
  '...####..',
  '#########',
  '.#######.',
];

// A small high sun with four short rays. It is always daytime on this island (a project rule).
const SUN_COL = 56;
const SUN = [
  '.....#.....',
  '...........',
  '...#####...',
  '#.#######.#',
  '...#####...',
  '...........',
  '.....#.....',
];

// The sea: light at the horizon, so the island and the ship stand out against it, and denser
// row by row towards the viewer. Each row fades in and out through the lighter shades at both
// ends, so no edge has to line up with anything.
const SHADES = ' ░▒▓';
function seaRow(level, width, step = 3) {
  let s = '';
  for (let x = 0; x < width; x++) {
    const edge = Math.min(x, width - 1 - x); // distance from the nearer end
    s += SHADES[Math.min(level, 1 + Math.floor(edge / step))];
  }
  return s;
}

// A canvas of text cells.
const canvas = (rows, cols) => Array.from({ length: rows }, () => new Array(cols).fill(' '));
const stamp = (cv, lines, row, col) => lines.forEach((l, r) => [...l].forEach((c, k) => { if (c !== ' ') cv[row + r][col + k] = c; }));
const put = (cv, s, row, col) => [...s].forEach((c, k) => { cv[row][col + k] = c; });
const rowsOf = (cv) => cv.map((r) => r.join('').replace(/\s+$/, ''));

// ---------------------------------------------------------------- words
const TITLE = fw('CASTAWAY 92');
const JAPANESE = '無人島で十時間\u3000ほとんど何も起きない';
const NAME_LINE = 'castaway · ten hours on one island';

// The double album: one side per tier, then the chained "hidden tracks". [title, shortest,
// longest] from activities.toml; `pick` marks the tracks shown on the main sleeve.
const ALBUM = [
  { side: 'side a', tier: 'regular', every: 'one track every 2 to 5 minutes', tracks: [
    ['coconut sipping, eyes closed', '0:27', '0:51', 'pick'],
    ['a slow lap to the waterline, and back', '0:22', '0:42'],
    ['jogging the length of the island', '0:21', '0:38'],
    ['fishing. nibbles, nothing. the usual', '0:55', '2:17'],
    ['a sandcastle, until the tide comes', '0:57', '1:54', 'pick'],
  ] },
  { side: 'side b', tier: 'occasional', every: 'one every 12 to 25 minutes', tracks: [
    ['a ship passes. she never sees it', '1:30', '2:30', 'pick'],
    ['message in a bottle, return to sender', '1:17', '2:17', 'pick'],
    ['a sea turtle visits. they both doze off', '3:13', '6:06'],
    ['coconut lands on hermit crab. coconut leaves', '1:11', '2:42'],
    ['planting a kumara', '0:25', '0:44'],
  ] },
  { side: 'side c', tier: 'rare', every: 'one every 30 to 60 minutes', tracks: [
    ['delivery drone. inside: more headphones', '0:39', '0:57', 'pick'],
    ['the signal hunt. one bar, top of the palm', '1:54', '4:10'],
    ['a stray cat arrives on a crate', '11:04', '26:46', 'pick'],
    ['a shark in headphones, nodding along', '0:49', '1:17'],
    ['tour boat. selfies. nobody offers a lift', '0:52', '1:21'],
    ['e-foil bro. one shaka, then gone', '0:30', '0:51'],
    ['fire by friction. a wave puts it out', '0:43', '1:11'],
    ['spear fishing. the gull takes pity', '0:39', '1:07'],
    ['a hammock, and no second tree', '1:35', '3:59'],
    ['a lookout. the palm bends to the sand', '0:47', '1:15'],
  ] },
  { side: 'side d', tier: 'super rare', every: 'one every 3 to 6 hours, 3 at most', tracks: [
    ['she could leave any time', '1:19', '1:59', 'pick'],
    ['almost rescued. the ship toots, sails on', '1:24', '2:05'],
    ['the cat naps on the turtle', '2:57', '5:38'],
  ] },
];
const HIDDEN = [
  ['after a sandcastle, a bigger wave', '0:05', '0:08'],
  ['after the drone, the box floats off', '0:19', '0:36'],
  ['hours after a bottle, a reply', '0:40', '1:07'],
  ['after a planting, the kumara grows leaves', '0:04', '0:04'],
  ['later still, the kumara flowers', '0:04', '0:04'],
];
// number the album straight through, 01..
{
  let n = 1;
  for (const s of ALBUM) for (const t of s.tracks) t.no = String(n++).padStart(2, '0');
}
const time = (a, b) => (a === b ? a : `${a}-${b}`);

// ---------------------------------------------------------------- the sleeve (main block)
function sleeve() {
  const L = [];
  const IND = 3;
  // Rows 0-3: the palm's crown and the sun. Rows 4-6: the trunk, with the title beside it.
  // Row 7: the island and the ship on the horizon. Rows 8-10: the sea.
  const cv = canvas(11, W);
  stamp(cv, halfRows(PALM), 0, IND + 2);
  stamp(cv, halfRows(SUN), 0, SUN_COL);
  const foot = IND + 2 + TRUNK_FOOT;
  stamp(cv, halfRows(ISLAND), 7, foot - 11);
  stamp(cv, halfRows(SHIP), 6, 66);
  const SEA_W = 74;
  [1, 2, 3].forEach((lv, k) => put(cv, seaRow(lv, SEA_W), 8 + k, IND));
  // the sun's glitter path: broken ripple lines cut into the sea below it, widening towards the
  // viewer. Drawn with lines rather than a lighter shade, so it reads in light and dark themes
  // (a lighter shade turns into a dark notch on a dark page).
  const sunX = SUN_COL + 5;
  ['───', '─ ─── ─', '─ ─ ─── ─ ─'].forEach((g, k) => put(cv, g, 8 + k, sunX - (g.length >> 1)));
  // the title beside the trunk. The plain-text line goes into the canvas (nothing may be under
  // it); the two fullwidth lines are appended, and must have nothing to their right.
  const TX = foot + 5;
  if (cv[6].slice(TX - 1, TX + NAME_LINE.length + 1).some((c) => c !== ' ')) throw new Error('name line collides');
  put(cv, NAME_LINE, 6, TX);
  const scene = rowsOf(cv);
  for (const [r, t] of [[4, B(TITLE)], [5, JAPANESE]]) {
    if (len(scene[r]) > TX - 2) throw new Error(`row ${r} has art where the title goes`);
    scene[r] = padR(scene[r], TX) + t;
  }
  L.push('', ...scene);
  L.push(`${sp(IND)}fig. 1  the set, more or less. the ship will not stop. it never does.`);
  L.push('');
  // the track list
  const END = 74;
  L.push(rule(IND, B('selected tracks'), 'total 10:00:00', END));
  L.push('');
  L.push(leader(`${sp(IND + 7)}00  idling, nodding to the music`, 'about 7:00:00', END));
  for (const s of ALBUM) {
    s.tracks.filter((t) => t[3] === 'pick').forEach((t, i) => {
      const margin = i === 0 ? padR(`${sp(IND)}${s.side}`, IND + 7) : sp(IND + 7);
      L.push(leader(`${margin}${t.no}  ${t[0]}`, time(t[1], t[2]), END));
    });
  }
  L.push('');
  L.push(`${sp(IND)}── ${B('sides')} ── one per tier. a track every: a 2-5 min · b 12-25 min`);
  L.push(`${sp(IND + 12)}c 30-60 min · d 3-6 hours · the full list: ${A('activities.toml')}`);
  L.push('');
  L.push(leader(`${sp(IND)}── ${B('sound')} ── every sound synthesized from code`, A('tools/make_audio.py'), END));
  L.push(leader(`${sp(IND)}── ${B('play')} ─── python ${A('tools/serve.py')}, then`, A('http://127.0.0.1:8765/'), END));
  L.push('');
  return L;
}

// ---------------------------------------------------------------- the inner sleeve (details)
function doubleAlbum() {
  const L = [];
  const IND = 3, END = 76;
  L.push('');
  L.push(`${sp(IND)}${B(fw('CASTAWAY 92'))}`);
  L.push(`${sp(IND)}the double album, one side per tier. when a tier's timer goes off,`);
  L.push(`${sp(IND)}it plays one track from its side, picked by weight from the ones that`);
  L.push(`${sp(IND)}can go right now. a selection: the full list is in ${A('activities.toml')}`);
  for (const s of ALBUM) {
    L.push('');
    L.push(rule(IND, `${B(s.side)} · ${s.tier}`, s.every, END));
    L.push('');
    for (const t of s.tracks) L.push(leader(`${sp(IND + 3)}${t.no}  ${t[0]}`, time(t[1], t[2]), END));
  }
  L.push('');
  L.push(rule(IND, B('hidden tracks'), 'never on a timer. only ever after another', END));
  L.push('');
  for (const [t, a, b] of HIDDEN) L.push(leader(`${sp(IND + 3)}--  ${t}`, time(a, b), END));
  L.push('');
  L.push(rule(IND, B('between tracks'), '', END));
  L.push('');
  L.push(leader(`${sp(IND + 3)}00  idling, nodding to the music`, 'about 7:00:00', END));
  L.push(`${sp(IND + 7)}one of four idles at a time: nodding, sitting against the palm,`);
  L.push(`${sp(IND + 7)}writing in her journal, reading. 45 seconds to 3 minutes each.`);
  L.push('');
  return L;
}

function linerNotes() {
  const L = [];
  const IND = 3, END = 76;
  const row = (k, v) => L.push(leader(`${sp(IND + 3)}${k}`, v, END));
  L.push('');
  L.push(rule(IND, B('sound'), A('tools/make_audio.py'), END));
  L.push('');
  row('samples, loops, recordings', 'none');
  row('third-party licences', 'none apply');
  row('theme', 'a seamless 60 s loop');
  row('tempo, key, changes', '80 bpm · F major · ii-V-I-vi');
  row('bars', '20, each exactly 3 s');
  row('players', 'electric piano · kalimba · soft drums');
  row('also on the record', 'vinyl crackle');
  row('the sea', 'its own seamless 60 s loop');
  row('loudness', '-14 LUFS · true peak <= -1 dBTP');
  row('levels', 'master, and per routine');
  row('listened to by', 'nobody, yet');
  L.push('');
  L.push(rule(IND, B('picture'), A('web/index.html'), END));
  L.push('');
  row('frame', '16:9 · 1080p · 30 fps');
  row('time of day', 'daytime. always');
  row('motion', 'hard cuts, stepped movement');
  row('renderer', 'a web page. ES modules, no build');
  row('export', 'frame-exact H.264, WebCodecs');
  row('export speed, 1080p30 in Chrome', '68 to 78 frames a second');
  row('then', 'the server adds the sound: one MP4');
  row('scene life', '26 entries');
  row('built', 'shore waves · drifting cloud shadows');
  row('planned', 'birds · planes with vapour trails');
  L.push(`${sp(IND + 7)}whales · dolphins · sailboats · sandpipers · a gecko · a rain shower`);
  L.push('');
  L.push(rule(IND, B('a typical 10-hour run'), 'median of 200 simulated runs', END));
  L.push('');
  row('regular', 'about 155');
  row('occasional', 'about 30');
  row('rare', 'about 13');
  row('super rare', 'about 2');
  row('chained follow-ups', 'about 20');
  row('busy', 'about a third of the time');
  row('idling', 'the rest');
  row('seed', '1992. same seed, same video');
  L.push('');
  L.push(rule(IND, B('tools'), '', END));
  L.push('');
  L.push(leader(`${sp(IND + 3)}python ${A('tools/serve.py')}`, 'live preview + MP4 export', END));
  L.push(leader(`${sp(IND + 3)}python ${A('tools/schedule.py')}`, 'validate, simulate 10 hours', END));
  L.push(leader(`${sp(IND + 3)}python ${A('tools/render_demo.py')} --dev`, 'every activity, with a HUD', END));
  L.push(leader(`${sp(IND + 3)}python ${A('tools/make_audio.py')}`, 'every sound', END));
  L.push(leader(`${sp(IND + 3)}${A('MUSING.md')}`, 'the working notes', END));
  L.push('');
  L.push(rule(IND, B('credits'), '', END));
  L.push('');
  row('label', 'Palm & Raft Leisure');
  row('holdings', 'one palm, one raft');
  row('catalogue no.', 'PRL-1992');
  row('sleeve', '░▒▓ and one palm');
  row('thanks', 'the turtle, for dozing');
  L.push(`${sp(IND + 7)}the shark, for keeping time · the hermit crab, now in a coconut`);
  L.push(`${sp(IND + 7)}the cat, whenever it is here · the ship, for never stopping`);
  L.push('');
  return L;
}

// ---------------------------------------------------------------- checks
// Every character here except the Japanese and fullwidth ones is exactly one cell wide.
const SAFE = /^[\x20-\x7e─░▒▓█▀▄▌▐·\u3000-\u30ff\u4e00-\u9fff\uff01-\uff5e]*$/u;
const CJK = /[\u3000-\u30ff\u4e00-\u9fff\uff01-\uff5e]/u;
function check(name, lines) {
  lines.forEach((l, i) => {
    const v = visible(l);
    const where = `${name} line ${i + 1}`;
    if (len(l) > W) throw new Error(`${where} is ${len(l)} cols: ${v}`);
    if (!SAFE.test(v)) throw new Error(`${where} has a risky character: ${v}`);
    if (/\s$/.test(v)) throw new Error(`${where} has trailing whitespace`);
    if (/[—–]/.test(v)) throw new Error(`${where} has a dash the house style bans`);
    const first = [...v].findIndex((ch) => CJK.test(ch));
    if (first >= 0 && [...v].slice(first).some((ch) => !CJK.test(ch))) throw new Error(`${where}: something follows the fullwidth text: ${v}`);
  });
  return lines;
}
const pre = (lines) => `<pre>\n${lines.map(toHtml).join('\n')}\n</pre>`;
const prose = (s) => {
  if (/[—–]/.test(s)) throw new Error(`prose has a dash the house style bans: ${s.slice(0, 60)}`);
  return s;
};

// ---------------------------------------------------------------- the file
const md = `<!-- Header 04-fullwidth_opus_5.5 for Castaway. Generated by src/04-fullwidth_opus_5.5.mjs: edit that, not this. -->

${pre(check('sleeve', sleeve()))}

${prose(`**Castaway** (working title) is a ten-hour lo-fi video for YouTube in which almost nothing happens, on purpose. A young woman is alone on a very small island with one tall palm and a raft. She mostly sits there, nodding to the music on her headphones, and every so often something happens: a message in a bottle washes straight back, a drone delivers a parcel of more headphones, a shark in headphones nods along. It is an unofficial remake inspired by the small-island routines and visual comedy of the 1992 screensaver *Johnny Castaway*, with a new castaway, a sunny hand-painted look, and no night. It is always daytime.`)}

${prose(`Every gag waits for the next bar of the music, so it lands on the beat, and lanes let things overlap, which is how a ship gets to sail past exactly while she is busy with a coconut. She never sees it. Every sound is synthesized from code: no samples, no loops, no recordings, and so far no listeners. The renderer is a web page with a live preview that exports a YouTube-ready MP4.`)}

\`\`\`sh
python tools/serve.py      # then open http://127.0.0.1:8765/
python tools/schedule.py   # check the schedule and simulate a 10-hour run
\`\`\`

<sub>${prose('In development. No video has been published yet, so there is nothing to link to. The island is used to waiting.')}</sub>

<details>
<summary><b>the double album</b>: four sides, one per tier, and the hidden tracks</summary>

${pre(check('album', doubleAlbum()))}

</details>

<details>
<summary><b>liner notes</b>: the sound, the picture, a typical run, the tools, the credits</summary>

${pre(check('notes', linerNotes()))}

${prose(`**What the Japanese says.** \`無人島で十時間\` (*mujintō de jū-jikan*): "ten hours on a desert island". \`ほとんど何も起きない\` (*hotondo nani mo okinai*): "almost nothing happens". \`ＣＡＳＴＡＷＡＹ　９２\` is just the name in fullwidth letters, the way vaporwave sets its titles; 92 because the screensaver that inspired it came out in 1992, and 1992 is the default seed.`)}

${prose(`**The small print.** Castaway is an original, unofficial project. *Johnny Castaway* and its characters belong to their owners, and this project is not affiliated with them. Palm & Raft Leisure is not a real label. This header is plain text drawn by a script: the palm, the island, the ship and the sun are shade and half-block characters, and nothing in it was borrowed.`)}

</details>
`;
fs.writeFileSync(OUT, md);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (${md.length} bytes)`);
