// SID tracker in text mode: a README header for Castaway (style catalogue entry trk-06).
// Plain Node, no dependencies, deterministic. Run:
//   node examples/castaway/src/41-sid-tracker-text_opus_5.5.mjs
// It rewrites examples/castaway/41-sid-tracker-text_opus_5.5.md and its colour twin,
// examples/castaway/assets/41-sid-tracker-text_opus_5.5.svg. Edit this file, not those.
//
// THE STYLE
// The plain-text edit screen of a cross-platform three-voice SID music tracker: a solid title
// bar with the program and a build note at left and F12 = HELP at right; three pattern columns
// (CHN1 PATT00, CHN2 PATT01, CHN3 PATT02) of rows that read "row, note, instrument, command",
// rests drawn as --- and key-offs as ===, so an empty pattern looks like ruled paper; every
// fourth row number bright; one inverted cursor cell. On the right, the orderlist ending each
// line in RST00, an instrument block of SID envelope and pulse labels beside a small step
// table, a filter block, and the tune's NAME line. A status line at the bottom: OCTAVE,
// STOPPED, JAM MODE, a timer and per-channel position readouts.
// Credited reference, of which only the general layout and the SID parameter labels are used
// (no program name, version string, tune or instrument names): GoatTracker, the
// cross-platform C64 music editor credited on CSDb to Covert Bitops (v1.4b screenshot on
// Wikimedia Commons). SID-Wizard by Hermit is the native-C64 cousin it was compared with.
//
// THE IDEA
// One row is one bar of Castaway's theme (3 s at 80 BPM), so one 20-row pattern is exactly one
// pass of the 60-second loop, and a ten-hour run is 600 passes: the orderlist really does end
// in RST00. The three SID voices are three lanes: CHN1 is her, CHN2 is every visitor (cat,
// turtle, ship, drone and shark share one voice, as voices on a SID often had to), CHN3 is
// the theme, one chord a bar, with the chord shape in the instrument, the way C64 tunes play
// chords on one voice. The pattern is a real minute of the default run (seed 1992, as
// simulated by tools/schedule.py on 2026-10-01): she finishes a stroll on row 06 and a stray
// cat drifts in on a crate on row 13. Everything else is a rest. The instrument on screen is
// the cat, with its whole visit read as an envelope: attack on a crate, decay up the palm,
// sustain a nap, release floating away, and a step table that jumps back to the top because
// it comes back another time.
//
// THE OUTPUT
// 1. The .md: the 80x25 screen as plain text in <pre> (bold stands in for bright colours,
//    blocks either side of the title stand in for the blue bar, > and < bracket the cursor
//    cell), a pitch, and four F-key screens in <details>.
// 2. The .svg: the same screen drawn from the same cell model in the 16-colour VGA palette
//    with an 8x16 bitmap font (no <text>), playing: a blue play row steps down the pattern one
//    row per beat (four times real speed, 15 s a loop, wrapping 19 to 00 as the pattern does),
//    and the timer and position readouts run on a clipped film strip with the same steps.
//    prefers-reduced-motion parks both on row 13, the frame the text version shows.
// The script refuses a text line over 80 columns, a tab, trailing whitespace or a character
// outside ASCII, box drawing, block elements and the middle dot.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '41-sid-tracker-text_opus_5.5';
const MD_OUT = path.resolve(HERE, '..', `${SLUG}.md`);
const SVG_OUT = path.resolve(HERE, '..', 'assets', `${SLUG}.svg`);
const IMG_SRC = `assets/${SLUG}.svg`;

const COLS = 80, ROWS = 25, CW = 8, CH = 16;

// ---------------------------------------------------------------------------------------------
// 1. Facts, each with where it came from
// ---------------------------------------------------------------------------------------------
// tools/make_audio.py: BPM = 80, BAR = 3.0 s, BARS = 20; PROGRESSION Gm9 C13 Fmaj9 Dm9, one
// chord a bar (chord_at(bar) = PROGRESSION[(bar - 1) % 4]); CHORDS gives the bass roots as MIDI
// 43, 36, 41, 38 = G2, C2, F2, D2. keys_cutoff(): a low-pass on the electric piano that opens
// 450 -> 7200 Hz over the first 6 s and closes through the last 12 s, every 60 s.
const BAR_SECS = 3;
const PATTERN_ROWS = 20;
const CHORD_CELLS = [ // [chord, root as a tracker note, instrument holding the chord shape]
  ['Gm9', 'G-2', '3D'],
  ['C13', 'C-2', '3E'],
  ['Fmaj9', 'F-2', '3F'],
  ['Dm9', 'D-2', '3D'],
];
// `python -B tools/schedule.py --show 10:00:00` (default run, seed 1992) on 2026-10-01:
//   2:55:54  stroll       0:00:24  castaway
//   2:56:39  cat_visit    0:22:40  cat
// and nothing else in either lane until 3:00:06. Minute 2:56 is pass 176 = $B0 of the theme.
const PASS = 176;
const hms = (s) => `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
const secsOf = (t) => t.split(':').reduce((a, v) => a * 60 + Number(v), 0);
const PASS_START = PASS * 60;
const STROLL_END = secsOf('2:55:54') + 24;
const CAT_IN = secsOf('2:56:39');
function rowOf(t) {
  const d = t - PASS_START;
  if (d < 0 || d >= 60 || d % BAR_SECS) throw new Error(`${hms(t)} is not on a bar of pass ${PASS}`);
  return d / BAR_SECS;
}
const STOP_ROW = rowOf(STROLL_END); // 6: she finishes the stroll
const CAT_ROW = rowOf(CAT_IN); // 13: the crate drifts in, cat aboard
const CURSOR = { ch: 1, row: CAT_ROW };

const REST = '--- 00 000';
const OFF = '=== 00 000';
function cell(ch, r) {
  if (ch === 0) return r === STOP_ROW ? OFF : REST;
  if (ch === 1) return r === CAT_ROW ? 'C-4 0D CA7' : REST; // instrument 0D, the cat. CA7, yes
  const [, note, ins] = CHORD_CELLS[r % 4];
  return `${note} ${ins} ${r === 0 ? 'A01' : '000'}`; // A01: start filter 01 on the downbeat
}
const hex2 = (n) => n.toString(16).toUpperCase().padStart(2, '0');
const POS = hex2(PASS);

// ---------------------------------------------------------------------------------------------
// 2. The screen as a cell model. Attributes: n grey body, w white heading, g bright green,
//    t title-bar text, d dark grey. `tx` is a character shown only in the text version.
// ---------------------------------------------------------------------------------------------
function buildScreen(mode) {
  const g = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => ({ ch: ' ', a: 'n' })));
  const put = (r, c, s, a = 'n', extra = {}) => {
    const chars = [...s];
    if (r < 0 || r >= ROWS || c < 0 || c + chars.length > COLS) throw new Error(`off screen at ${r},${c}: "${s}"`);
    chars.forEach((ch, i) => {
      const old = g[r][c + i];
      if (old.ch !== ' ' && ch !== ' ' && old.ch !== ch) throw new Error(`overlap at ${r},${c + i}: "${old.ch}" vs "${ch}"`);
      g[r][c + i] = { ch, a, ...extra };
    });
  };

  // Title bar (row 0). The text version fills the bar with full blocks either side of the words.
  const TITLE = 'CASTAWAY (WORKING TITLE) (1080P) (DAYLIGHT BUILD)';
  const HELP = 'F12 = HELP';
  const helpAt = COLS - 3 - HELP.length;
  if (mode === 'text') put(0, 0, '█'.repeat(COLS));
  for (let c = 0; c < COLS; c++) g[0][c].bar = true;
  const titleText = (c, s, extra = {}) => {
    // one cell of bar colour either side of the words, as the text version's gap in the blocks
    for (let i = -1; i <= s.length; i++) g[0][c + i] = { ch: ' ', a: 'n', bar: true };
    [...s].forEach((ch, i) => { g[0][c + i] = { ch, a: 't', bar: true, ...extra }; });
  };
  titleText(3, TITLE);
  titleText(helpAt, HELP, { href: 'MUSING.md' });

  // Pattern columns: channel k is 14 cells from 14k, a marker cell then "00 --- 00 000".
  const chx = (k) => 14 * k;
  for (let k = 0; k < 3; k++) put(1, chx(k) + 1, `CHN${k + 1} PATT${hex2(k)}`, 'w');
  for (let r = 0; r < PATTERN_ROWS; r++) {
    const y = 2 + r;
    for (let k = 0; k < 3; k++) {
      put(y, chx(k) + 1, String(r).padStart(2, '0'), r % 4 === 0 ? 'g' : 'n');
      const s = cell(k, r);
      put(y, chx(k) + 4, s);
      if (k === CURSOR.ch && r === CURSOR.row) {
        for (let i = 0; i < 3; i++) g[y][chx(k) + 4 + i].a = 'cur';
        g[y][chx(k)].tx = '>';
        g[y][chx(k + 1)].tx = '<';
      }
    }
  }
  // Under each column, the lane it plays.
  const brace = (name) => {
    const inner = ` ${name} `;
    const left = Math.floor((11 - inner.length) / 2);
    return '└' + '─'.repeat(left) + inner + '─'.repeat(11 - inner.length - left) + '┘';
  };
  ['HER', 'VISITORS', 'THE THEME'].forEach((name, k) => {
    const s = brace(name);
    [...s].forEach((ch, i) => put(22, chx(k) + 1 + i, ch, /[A-Z]/.test(ch) ? 'n' : 'd'));
  });

  // Right-hand side, from column 43.
  const X = 43;
  const lines = [];
  const L = (...segs) => lines.push(segs);
  L(['CHN ORDERLIST (SUBTUNE 00, POS ' + POS + ')', 'w']);
  const order = [
    ['python ', ['tools/serve.py', 'tools/serve.py']],
    ['', ['http://127.0.0.1:8765/', 'http://127.0.0.1:8765/']],
    ['nod along for 10:00:00', null],
  ];
  order.forEach(([pre, link], i) => {
    const body = pre + (link ? link[0] : '');
    const segs = [[`${i + 1} ${hex2(i)} `, 'n']];
    if (pre) segs.push([pre, 'n']);
    if (link) segs.push([link[0], 'n', link[1]]);
    segs.push([' '.repeat(24 - body.length) + 'RST00', 'n']);
    L(...segs);
  });
  L();
  L(['INSTRUMENT NUM. 0D  ', 'w'], ['STRAY CAT', 'n']);
  // The cat's visit as a SID envelope (activities.toml, cat_visit): it drifts in on a crate,
  // climbs the palm, naps, then hops back on the crate and floats away. It comes back.
  const INSTR = [
    ['Attack/Decay', 'CRATE/PALM', '01 CRATE'],
    ['Sustain/Release', 'NAP/FLOAT', '02 HOP OFF'],
    ['Pulse Width', '11-27 MIN', '03 PALM'],
    ['Pulse Speed', 'PURRING', '04 NAP'],
    ['Pulse Limit Min', '1:30:00', '05 HOP ON'],
    ['Pulse Limit Max', '1 CAT', '06 FLOAT'],
    ['Filter To Use', 'GREY TABBY', '07 FF 00'],
  ];
  INSTR.forEach(([label, value, step], i) => {
    if (value.length > 10 || step.length > 10) throw new Error(`instrument row too wide: ${value} / ${step}`);
    L([label.padEnd(16), i === 0 ? 'g' : 'n'], [value.padEnd(11), 'n'], [step, 'n']);
  });
  L();
  L(['FILTER NUM. 01  ', 'w'], ['ON THE KEYS', 'n']);
  const FILT = [
    ['Filt Control', 'E.PIANO ONLY'],
    ['Filt Type/Time', 'LOW-PASS, 60 S'],
    ['Filt Freq/Spd', '450-7200 HZ'],
    ['Filt Next Step', 'RST00, NO SEAM'],
  ];
  FILT.forEach(([label, value]) => L([label.padEnd(16), 'n'], [value, 'n']));
  L(['NAME:     ', 'w'], ['CASTAWAY', 'g'], [' (working title)', 'g']);
  L(['AUTHOR:   ', 'w'], ['make_audio.py', 'n', 'tools/make_audio.py'], [', 0 SAMPLES', 'n']);
  L(['RELEASED: ', 'w'], ['NOT YET. IN DEVELOPMENT', 'n']);
  if (lines.length !== 22) throw new Error(`right panel has ${lines.length} lines, wants 22`);
  lines.forEach((segs, i) => {
    let c = X;
    for (const [s, a, href] of segs) { put(1 + i, c, s, a, href ? { href } : {}); c += s.length; }
  });

  // Status and legend.
  const status = [
    ['OCTAVE 2', 'n'], ['  ', 'n'], [mode === 'text' ? 'STOPPED' : 'PLAYING', mode === 'text' ? 'n' : 'w'],
    ['  ', 'n'], ['JAM MODE', 'g'], ['  ', 'n'],
  ];
  let c = 1;
  for (const [s, a] of status) { put(23, c, s, a); c += s.length; }
  if (mode === 'text') put(23, c, readout(CURSOR.row));
  const legend = 'ONE ROW = ONE BAR = 3 S.   HER: 19 RESTS, 1 STOP.   VISITORS: 1 CAT, 1 CRATE.';
  put(24, 1, legend, mode === 'text' ? 'n' : 'd');
  return { grid: g, readoutCol: c };
}
// The timer and the three position readouts for a given row of the pattern.
function readout(r) {
  const pos = `0${POS}/${String(r).padStart(2, '0')}`;
  return `${hms(PASS_START + r * BAR_SECS)}   CHN1 ${pos}  CHN2 ${pos}  CHN3 ${pos}`;
}

// The legend's counts are checked, not typed.
{
  const her = Array.from({ length: PATTERN_ROWS }, (_, r) => cell(0, r));
  const vis = Array.from({ length: PATTERN_ROWS }, (_, r) => cell(1, r));
  const n = (arr, s) => arr.filter((x) => x === s).length;
  if (n(her, REST) !== 19 || n(her, OFF) !== 1 || n(vis, REST) !== 19) throw new Error('legend counts are wrong');
}

// ---------------------------------------------------------------------------------------------
// 3. Text output helpers ("rich" strings carry html and plain text side by side)
// ---------------------------------------------------------------------------------------------
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const T = (s) => ({ h: esc(s), p: s });
const B = (s) => ({ h: `<b>${esc(s)}</b>`, p: s });
const A = (s, href) => ({ h: `<a href="${href}">${esc(s)}</a>`, p: s });
const AB = (s, href) => ({ h: `<a href="${href}"><b>${esc(s)}</b></a>`, p: s });
const J = (...parts) => parts.map((x) => (typeof x === 'string' ? T(x) : x)).reduce((a, x) => ({ h: a.h + x.h, p: a.p + x.p }), { h: '', p: '' });
const PAD = (x, n) => {
  const r = typeof x === 'string' ? T(x) : x;
  if (r.p.length > n) throw new Error(`"${r.p}" is wider than ${n}`);
  return J(r, ' '.repeat(n - r.p.length));
};

function screenToPre(grid) {
  return grid.map((row) => {
    const cells = row.map((c) => ({ ch: c.tx || c.ch, bold: ['w', 'g', 't'].includes(c.a), href: c.href }));
    let last = cells.length - 1;
    while (last >= 0 && cells[last].ch === ' ') last--;
    let out = '';
    for (let i = 0; i <= last;) {
      const { bold, href } = cells[i];
      let j = i, s = '';
      while (j <= last && cells[j].bold === bold && cells[j].href === href) s += cells[j++].ch;
      let h = esc(s);
      if (bold && s.trim()) h = h.replace(/^( *)(.*?)( *)$/, '$1<b>$2</b>$3');
      if (href) h = `<a href="${href}">${h}</a>`;
      out += h;
      i = j;
    }
    return out;
  });
}

// ---------------------------------------------------------------------------------------------
// 4. The F-key screens (in <details>)
// ---------------------------------------------------------------------------------------------
const RULE = '─'.repeat(78);
function headLine(left, right) {
  return J(B(left), ' '.repeat(78 - left.length - right.length), right);
}

// F7: instruments. Numbers are this list's own; tiers, lanes and what happens come from
// activities.toml (the `tier`, `lanes` and `about` of each activity).
const INSTRUMENT_GROUPS = [
  ['regular', 'every 2 to 5 minutes', [
    ['01', 'COCONUT SIP', 'her', 'into the shade. a coconut. eyes shut'],
    ['02', 'STROLL', 'her', 'to the waterline and back (ended on row 06)'],
    ['03', 'JOG LAP', 'her', 'the length of the island, and back'],
    ['04', 'FISHING', 'her', 'nibbles. nothing. the usual'],
    ['05', 'SANDCASTLE', 'her', 'stands until the tide comes for it'],
  ]],
  ['occasional', 'every 12 to 25 minutes', [
    ['06', 'SHIP, UNSEEN', 'visitors', 'crosses while she is busy. she never sees it'],
    ['07', 'BOTTLE', 'her', 'thrown out to sea. washes straight back'],
    ['08', 'SEA TURTLE', 'visitors', 'crawls up beside her. they both doze off'],
    ['09', 'COCONUT, CRAB', 'her', 'falls on a hermit crab. the coconut walks off'],
    ['0A', 'KUMARA', 'her', 'planted once. grows for the rest of the video'],
  ]],
  ['rare', 'every 30 to 60 minutes', [
    ['0B', 'DRONE', 'visitors', 'lowers a parcel. inside: more headphones'],
    ['0C', 'SIGNAL HUNT', 'her', 'one bar of signal, at the top of the palm'],
    ['0D', 'STRAY CAT', 'visitors', 'crate, palm, nap, crate. comes back another time'],
    ['0E', 'SHARK', 'visitors', 'headphones on. nods to the beat. attack: none'],
    ['0F', 'TOUR BOAT', 'visitors', 'selfies with her in shot. nobody offers a lift'],
    ['10', 'E-FOIL', 'visitors', 'a bro on a hydrofoil board. a shaka, and gone'],
    ['11', 'FIRE BY FRICTION', 'her', 'one thin curl of smoke. a wave puts it out'],
    ['12', 'SPEAR FISHING', 'her', 'a heroic lunge, a miss. the fish jump the spear'],
    ['13', 'HAMMOCK', 'her', 'one end tied to the palm. no second tree'],
    ['14', 'LOOKOUT', 'her', 'a platform up the palm. it bends to the ground'],
  ]],
  ['super rare', 'every 3 to 6 hours, 3 a run at most', [
    ['15', 'RESCUE, ALMOST', 'her', 'waves at a ship. it sounds its horn. sails on'],
    ['16', 'LEAVE ANY TIME', 'her', 'walks off over the water. back with iced coffee'],
  ]],
  ['chained', 'only ever after another one', [
    ['17', 'TIDE', 'shore', 'follows every sandcastle'],
    ['18', 'BOTTLE REPLY', 'her', 'hours later, a different bottle. a reply'],
  ]],
  ['the theme', 'channel 3, one chord a bar', [
    ['3D', 'MINOR 9 ARP', 'chn 3', 'Gm9 and Dm9'],
    ['3E', 'DOMINANT 13 ARP', 'chn 3', 'C13'],
    ['3F', 'MAJOR 9 ARP', 'chn 3', 'Fmaj9'],
  ]],
];
function f7Screen() {
  const out = [];
  out.push(headLine('F7  INSTRUMENTS', 'a few of the 90-plus'));
  out.push(T(RULE));
  out.push(J(B('NUM NAME              LANE      WHAT IT DOES')));
  for (const [tier, every, items] of INSTRUMENT_GROUPS) {
    const label = J('── ', B(tier), ` · ${every} `);
    out.push(J(label, '─'.repeat(78 - label.p.length)));
    for (const [num, name, lane, what] of items) out.push(J(PAD(num, 4), PAD(B(name), 18), PAD(lane, 10), what));
  }
  out.push(T(RULE));
  out.push(T('Three voices, six lanes: her, the cat, the turtle, the sea and sky, the shore'));
  out.push(T('and the garden each have their own, so things overlap. In the tracker every'));
  out.push(T('visitor shares channel 2, and they have agreed to take turns.'));
  return out;
}

// F6: how ten hours are arranged.
function f6Screen() {
  const out = [];
  out.push(headLine('F6  ORDERLIST', `subtune 00: 10:00:00, seed 1992, ${PASS === 176 ? '600' : '?'} positions`));
  out.push(T(RULE));
  const row = (label, text) => out.push(J(PAD(B(label), 13), text));
  const more = (text) => out.push(J(' '.repeat(13), text));
  row('the theme', 'one pattern of 20 rows, played 600 times, then RST00. no seam');
  row('a row', 'one bar: 3 s at 80 BPM. every activity starts on one, so every gag');
  more('lands on the beat');
  row('four timers', J(PAD('regular', 13), PAD('every 2 to 5 min', 22), 'about 155 a run'));
  more(J(PAD('occasional', 13), PAD('every 12 to 25 min', 22), 'about 30'));
  more(J(PAD('rare', 13), PAD('every 30 to 60 min', 22), 'about 13'));
  more(J(PAD('super rare', 13), PAD('every 3 to 6 hours', 22), 'about 2, 3 at most'));
  more(J(PAD('chained', 13), PAD('after another one', 22), 'the tide, the reply'));
  row('her lane', 'busy about a third of the time. the rest is rests');
  row('counts', 'the median of 200 simulated runs, as the top of the file says');
  row('the file', J(A('activities.toml', 'activities.toml'), ': more than 90 activities, their beats, how long'));
  more('each lasts and how often it comes round');
  row('to check it', J('python ', A('tools/schedule.py', 'tools/schedule.py'), '   validates it, simulates a 10-hour run'));
  return out;
}

// F12: help, the tools, credits.
function f12Screen() {
  const out = [];
  out.push(headLine('F12  HELP', 'any key returns to the island'));
  out.push(T(RULE));
  const key = (k, what, how) => out.push(J(PAD(B(k), 5), PAD(what, 22), how));
  const more = (how) => out.push(J(' '.repeat(27), how));
  key('F1', 'play from the start', J('python ', A('tools/serve.py', 'tools/serve.py'), ', then open'));
  more(A('http://127.0.0.1:8765/', 'http://127.0.0.1:8765/'));
  key('F2', 'play from the cursor', J('the page in ', A('web/index.html', 'web/index.html'), ' previews live'));
  key('F3', 'export', 'a YouTube-ready MP4: frames encoded in the');
  more('browser, the server mixes in the sound');
  key('F4', 'stop', 'there is no F4. it is a ten-hour video');
  key('F5', 'edit the pattern', A('activities.toml', 'activities.toml'));
  key('F6', 'check the orderlist', J('python ', A('tools/schedule.py', 'tools/schedule.py')));
  key('F7', 'instruments', J(A('tools/make_audio.py', 'tools/make_audio.py'), ': every sound, from code'));
  key('F8', 'dev reel', J('python ', A('tools/render_demo.py', 'tools/render_demo.py'), ' --dev: every'));
  more('activity in turn, with a heads-up display');
  key('F10', 'load', J(A('MUSING.md', 'MUSING.md'), ': the project log. read "Current'));
  more('state" first');
  key('F12', 'help', 'you are here');
  out.push(T(''));
  out.push(T('No build step, no npm packages: plain ES modules, served by tools/serve.py.'));
  out.push(T('Hard cuts and stepped movement are the defaults. It is always daytime.'));
  out.push(T(''));
  out.push(T('This screen is laid out after the plain-text editors of cross-platform SID'));
  out.push(T('trackers, GoatTracker (Covert Bitops) above all. None of its names, versions,'));
  out.push(T('tunes or instruments are used, and it has nothing to do with this project.'));
  return out;
}

// ---------------------------------------------------------------------------------------------
// 5. Lint for text blocks
// ---------------------------------------------------------------------------------------------
const plainOf = (h) => h.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
function lint(where, htmlLines) {
  htmlLines.forEach((h, i) => {
    const p = plainOf(h);
    const n = [...p].length;
    if (n > 80) throw new Error(`${where} line ${i + 1} is ${n} columns: ${p}`);
    if (/\t/.test(p)) throw new Error(`${where} line ${i + 1} has a tab`);
    if (/ $/.test(p)) throw new Error(`${where} line ${i + 1} has trailing whitespace`);
    for (const ch of p) {
      const cp = ch.codePointAt(0);
      const ok = (cp >= 32 && cp < 127) || (cp >= 0x2500 && cp <= 0x259f) || cp === 0xb7;
      if (!ok) throw new Error(`${where} line ${i + 1}: character U+${cp.toString(16)} "${ch}"`);
    }
  });
}

// ---------------------------------------------------------------------------------------------
// 6. 8x16 bitmap font (CP437-style; base tables from castaway/12-bios-hijack, extended here)
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
  "'": [1, '...##.. ...##.. ..##...'],
  '-': [7, '#######'],
  '_': [14, '########'],
  '/': [4, '......# .....## ....##. ...##.. ..##... .##.... ##..... #......'],
  '(': [2, '....##. ...##.. ..##... ..##... ..##... ..##... ..##... ..##... ...##.. ....##.'],
  ')': [2, '.##.... ..##... ...##.. ...##.. ...##.. ...##.. ...##.. ...##.. ..##... .##....'],
  '=': [6, '####### ....... ....... #######'],
  '+': [5, '..##... ..##... ######. ..##... ..##...'],
  '>': [3, '.##.... ..##... ...##.. ....##. .....## ....##. ...##.. ..##... .##....'],
  '<': [3, '....##. ...##.. ..##... .##.... ##..... .##.... ..##... ...##.. ....##.'],
  '·': [7, '...##.. ...##..'],
};
for (const [ch, [top, rows]] of Object.entries(PUNCT)) def(ch, top, rows);
FONT.set(' ', new Array(16).fill(0));
// Single-line box drawing as the VGA ROM has it: one-pixel lines through column 3 and row 7,
// running to the cell edges so neighbours join up.
function plot(ops) {
  const g = new Array(16).fill(0);
  const H = (y, x0, x1) => { for (let x = x0; x <= x1; x++) g[y] |= 1 << (7 - x); };
  const V = (x, y0, y1) => { for (let y = y0; y <= y1; y++) g[y] |= 1 << (7 - x); };
  ops(H, V);
  return g;
}
FONT.set('─', plot((H) => H(7, 0, 7)));
FONT.set('└', plot((H, V) => { V(3, 0, 7); H(7, 3, 7); }));
FONT.set('┘', plot((H, V) => { V(3, 0, 7); H(7, 0, 3); }));

function glyphPath(g) {
  const rects = [];
  let open = [];
  for (let y = 0; y < 16; y++) {
    const runs = [];
    for (let x = 0; x < 8;) {
      if ((g[y] >> (7 - x)) & 1) { const s = x; while (x < 8 && ((g[y] >> (7 - x)) & 1)) x++; runs.push([s, x - s]); } else x++;
    }
    const next = [];
    for (const [x0, w] of runs) {
      const o = open.find((r) => r.x === x0 && r.w === w && r.y + r.h === y);
      if (o) { o.h++; next.push(o); } else { const r = { x: x0, w, y, h: 1 }; rects.push(r); next.push(r); }
    }
    open = next;
  }
  return rects.map((r) => `M${r.x} ${r.y}h${r.w}v${r.h}h${-r.w}z`).join('');
}
const glyphIds = new Map();
function gid(ch) {
  if (!FONT.has(ch)) throw new Error(`no glyph for ${JSON.stringify(ch)} (U+${ch.codePointAt(0).toString(16)})`);
  if (!glyphIds.has(ch)) glyphIds.set(ch, (glyphIds.size).toString(36));
  return glyphIds.get(ch);
}

// ---------------------------------------------------------------------------------------------
// 7. The colour twin (SVG)
// ---------------------------------------------------------------------------------------------
// 16-colour VGA, as the catalogue samples it: black, grey, white, bright green, blue.
const VGA = { black: '#000000', grey: '#AAAAAA', white: '#FFFFFF', green: '#55FF55', blue: '#0000AA', dark: '#555555' };
const FG = { n: null, w: 'w', g: 'g', t: 'w', d: 'd', cur: 'k' };
const STEP_SECS = 0.75; // one row a beat: four times real speed
const LOOP = STEP_SECS * PATTERN_ROWS;
const PAD_PX = 16;

function rowUses(cells, y) {
  // one <g> per colour per row, glyphs placed by x only
  const byClass = new Map();
  cells.forEach((c, x) => {
    if (c.ch === ' ' || c.ch === '█') return;
    const cls = FG[c.a] ?? null;
    const key = cls || '';
    if (!byClass.has(key)) byClass.set(key, []);
    byClass.get(key).push(`<use href="#${gid(c.ch)}" x="${x * CW}"/>`);
  });
  return [...byClass].map(([cls, uses]) => `<g${cls ? ` class="${cls}"` : ''} transform="translate(0 ${y})">${uses.join('')}</g>`).join('');
}

function buildSvg() {
  const { grid, readoutCol } = buildScreen('svg');
  const W = COLS * CW, H = ROWS * CH;
  const parts = [];
  // backgrounds: title bar, play row, cursor cell
  parts.push(`<rect width="${W}" height="${CH}" fill="${VGA.blue}"/>`);
  parts.push(`<rect class="play" y="${2 * CH}" width="${42 * CW}" height="${CH}" fill="${VGA.blue}"/>`);
  grid.forEach((row, r) => row.forEach((c, x) => {
    if (c.a === 'cur') parts.push(`<rect x="${x * CW}" y="${r * CH}" width="${CW}" height="${CH}" fill="${VGA.grey}"/>`);
  }));
  // text
  grid.forEach((row, r) => parts.push(rowUses(row, r * CH)));
  // the running timer and position readouts: a film strip of 20 rows behind a one-row window
  const strip = [];
  for (let k = 0; k < PATTERN_ROWS; k++) {
    const cells = Array.from({ length: COLS }, () => ({ ch: ' ', a: 'n' }));
    [...readout(k)].forEach((ch, i) => { cells[readoutCol + i] = { ch, a: 'n' }; });
    strip.push(rowUses(cells, (23 + k) * CH));
  }
  parts.push(`<g clip-path="url(#win)"><g class="strip">${strip.join('')}</g></g>`);

  const defs = [...glyphIds].map(([ch, id]) => `<path id="${id}" d="${glyphPath(FONT.get(ch))}"/>`).join('');
  const css = [
    `.w{fill:${VGA.white}}.g{fill:${VGA.green}}.k{fill:${VGA.black}}.d{fill:${VGA.dark}}`,
    `.play{animation:play ${LOOP}s steps(${PATTERN_ROWS},end) infinite}`,
    `@keyframes play{from{transform:translateY(0)}to{transform:translateY(${PATTERN_ROWS * CH}px)}}`,
    `.strip{animation:strip ${LOOP}s steps(${PATTERN_ROWS},end) infinite}`,
    `@keyframes strip{from{transform:translateY(0)}to{transform:translateY(-${PATTERN_ROWS * CH}px)}}`,
    `@media (prefers-reduced-motion:reduce){.play{animation:none;transform:translateY(${CURSOR.row * CH}px)}`
      + `.strip{animation:none;transform:translateY(-${CURSOR.row * CH}px)}}`,
  ].join('');
  const OW = W + 2 * PAD_PX, OH = H + 2 * PAD_PX;
  const title = 'CASTAWAY: the README header as a three-voice SID tracker screen, playing';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${OW} ${OH}" width="${OW}" height="${OH}" role="img" aria-label="${title}" shape-rendering="crispEdges">`
    + `<title>${title}</title><style>${css}</style>`
    + `<defs>${defs}<clipPath id="win"><rect y="${23 * CH}" width="${W}" height="${CH}"/></clipPath></defs>`
    + `<rect width="${OW}" height="${OH}" rx="10" fill="${VGA.black}" stroke="#30363d" stroke-width="1"/>`
    + `<g transform="translate(${PAD_PX} ${PAD_PX})" fill="${VGA.grey}">${parts.join('')}</g></svg>\n`;
}

// ---------------------------------------------------------------------------------------------
// 8. The markdown
// ---------------------------------------------------------------------------------------------
function buildMd() {
  const { grid } = buildScreen('text');
  const pre = screenToPre(grid);
  lint('screen', pre);
  const f7 = f7Screen().map((r) => r.h);
  const f6 = f6Screen().map((r) => r.h);
  const f12 = f12Screen().map((r) => r.h);
  lint('F7', f7); lint('F6', f6); lint('F12', f12);
  if (!pre.some((l) => plainOf(l).includes('CASTAWAY'))) throw new Error('the name is missing');

  const alt = 'CASTAWAY, the same tracker screen on a colour monitor: black, with a blue title bar reading '
    + 'CASTAWAY (working title) (1080p) (daylight build) and F12 = HELP. Three pattern columns of grey rests '
    + 'like ruled paper, with every fourth row number in bright green, play the minute from 2:56:00 of the '
    + 'default run: a blue play row steps down a row each beat while the timer counts up to 2:56:57. '
    + 'Channel 1, her, finishes a stroll on row 06 with a key-off; channel 2, the visitors, has a stray cat '
    + 'drifting in on a crate on row 13 under a grey cursor; channel 3 plays the theme, one chord a bar. On '
    + 'the right: the run steps as an orderlist ending in RST00, the cat as an instrument (attack and decay: '
    + 'crate and palm; sustain and release: nap and float; filter: grey tabby), the keys filter, and '
    + 'NAME: CASTAWAY in green.';

  const md = [];
  md.push(`<!-- Header ${SLUG} for Castaway. Generated by src/${SLUG}.mjs: edit that, not this. -->`);
  md.push('');
  md.push('<pre>');
  md.push(...pre);
  md.push('</pre>');
  md.push('');
  md.push('<p><sub>Above, in plain text: the header as the edit screen of a three-voice SID music tracker. '
    + 'Channel 1 is her, channel 2 is every visitor, channel 3 is the theme, and one row is one bar: three '
    + 'seconds. The pattern is a real minute of the default ten-hour run (seed 1992, simulated on '
    + '2026-10-01). She finishes a stroll on row 06, a stray cat drifts in on a crate on row 13, and her '
    + 'column is otherwise nineteen rests.</sub></p>');
  md.push('');
  md.push('**Castaway** (working title) is a ten-hour lo-fi video for YouTube in which almost nothing '
    + 'happens, on purpose. A young woman, a tiny island, one tall palm, a raft and her headphones. She '
    + 'idles, nodding along, and every so often, always on the next bar of the music, something happens. '
    + 'A bottle she throws washes straight back. A drone delivers a parcel, and the parcel is more '
    + 'headphones. A shark surfaces in headphones and nods to the same beat. It is an unofficial remake '
    + 'inspired by the 1992 screensaver *Johnny Castaway*: sunny, hand-painted and always daytime. In '
    + 'development, with nothing published yet.');
  md.push('');
  md.push('Who turns up, and when, is [activities.toml](activities.toml): more than 90 activities on four '
    + 'timers, from *regular* (every 2 to 5 minutes) to *super rare* (every 3 to 6 hours, three at most). '
    + 'She is busy about a third of the time. The rest is rests. Every sound is synthesized from code by '
    + '[tools/make_audio.py](tools/make_audio.py), with no samples, loops or recordings, which is how a '
    + 'SID chip would have wanted it. The theme is a seamless 60-second loop at 80 BPM in F major, 20 bars '
    + 'of exactly 3 seconds: one pattern up there. Nobody has listened to it yet, so the tracker is '
    + 'reserving judgement.');
  md.push('');
  md.push('```sh');
  md.push('python tools/serve.py        # then open http://127.0.0.1:8765/');
  md.push('python tools/schedule.py     # validate the schedule, simulate a 10-hour run');
  md.push('```');
  md.push('');
  md.push('<details>');
  md.push('<summary><b>F1 = PLAY</b> &nbsp;the same screen on a colour monitor, playing that minute at one row a beat</summary>');
  md.push('');
  md.push('<p align="center">');
  md.push(`  <img src="${IMG_SRC}" width="100%" alt="${alt}">`);
  md.push('</p>');
  md.push('');
  md.push('<sub>Drawn from the same cell model as the text above, in the 16-colour VGA palette, with every '
    + 'letter a bitmap glyph. It plays four times faster than the video would: one row a beat instead of '
    + 'one a bar, so the minute takes 15 seconds and then starts again, like the theme.</sub>');
  md.push('');
  md.push('</details>');
  md.push('');
  md.push('<details>');
  md.push('<summary><b>F7 = INSTRUMENTS</b> &nbsp;who and what turns up, how often, and in which lane</summary>');
  md.push('');
  md.push('<pre>');
  md.push(...f7);
  md.push('</pre>');
  md.push('');
  md.push('</details>');
  md.push('');
  md.push('<details>');
  md.push('<summary><b>F6 = ORDERLIST</b> &nbsp;how ten hours are arranged: one pattern, four timers, a lot of rests</summary>');
  md.push('');
  md.push('<pre>');
  md.push(...f6);
  md.push('</pre>');
  md.push('');
  md.push('</details>');
  md.push('');
  md.push('<details>');
  md.push('<summary><b>F12 = HELP</b> &nbsp;the keys, the tools, and where this screen comes from</summary>');
  md.push('');
  md.push('<pre>');
  md.push(...f12);
  md.push('</pre>');
  md.push('');
  md.push('</details>');
  md.push('');
  return md.join('\n');
}

const md = buildMd();
const svg = buildSvg();
if (/—/.test(md)) throw new Error('em dash in the markdown');
fs.mkdirSync(path.dirname(SVG_OUT), { recursive: true });
fs.writeFileSync(MD_OUT, md);
fs.writeFileSync(SVG_OUT, svg);
console.log(`wrote ${path.relative(process.cwd(), MD_OUT)} (${md.length} bytes)`);
console.log(`wrote ${path.relative(process.cwd(), SVG_OUT)} (${svg.length} bytes)`);
