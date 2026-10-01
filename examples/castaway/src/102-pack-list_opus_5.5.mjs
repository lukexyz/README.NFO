// XDCC pack list header for the Castaway README (style catalogue entry xfer-03).
// Plain Node, no dependencies, deterministic. Run:
//   node examples/castaway/src/102-pack-list_opus_5.5.mjs
// It rewrites examples/castaway/102-pack-list_opus_5.5.md. Edit this file, not the .md.
//
// THE STYLE
// An XDCC bot is a file server that lives in an IRC channel. Every few minutes it pastes its
// catalogue into the channel: a summary line wrapped in bold double asterisks (pack count, then
// "N of M slots open", then Queue, Min, Max and Record speeds), a "Bandwidth Usage" line, the
// line telling you which message to send to request pack x (and one for details), then one row
// per pack: a bold hash and pack number, a right-aligned download count with a lower-case x,
// the size in square brackets with a one-letter unit, the file name, optional per-pack tags in
// brackets, and an indented note line that starts with a bold caret and hyphen. It ends with
// "Total Offered" and "Total Transferred". In the channel every line is a message from the
// bot's nick, with joins and parts from other users in between. The row and header formats here
// follow the ones in the iroffer bot's source (u_xdl_head, the pack row, the note line, the
// footer and the XDCC INFO fields); the client layout around it (timestamp, right-aligned nick
// column, a bar, the message) is the generic one of a 2000s terminal IRC client, unnamed.
//
// MEANING, CHANGED: nothing here is anybody's release. The bot offers Castaway itself, and its
// packs are the project's own activities and files. "Gets" in the channel list is how often
// each activity happens in the seed-1992 run; the bracketed size is how long it lasts. In the
// tools and sound lists the gets are honest zeros: nothing has been published, and nobody has
// listened to the synthesized sound yet. The request line is the real command to run it.
//
// Everything named here is invented for this banner: the network (ShoalNet), the bot ([Raft]),
// the server, every nick and host, and the greetz. Data was checked against the project on
// 2026-10-01: activities.toml, a read-only run of tools/schedule.py (seed 1992), the audio
// catalogue and the file sizes below. They will drift as the project grows; the page says so.
//
// THE OUTPUT is HTML <pre> blocks with <b> and <a> only, at most 80 columns. Allowed characters:
// printable ASCII plus a few box-drawing characters and the middle dot. The script refuses a
// wide line, a stray character, a tab, trailing whitespace, an em dash, or one of the words the
// brief keeps out of the header, and it checks that the logo reads back as CASTAWAY.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '102-pack-list_opus_5.5';
const OUT = path.resolve(HERE, '..', `${SLUG}.md`);
const W = 80; // window width in columns
const problems = []; // everything the lint finds; the script refuses to write if any

// ---------------------------------------------------------------------------------------------
// 0. Rich text: a line is a list of segments {t, b?, a?}. Width is measured on the plain text.
// ---------------------------------------------------------------------------------------------
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const T = (t) => ({ t });
const B = (t) => ({ t, b: true });
const A = (a, t = a) => ({ t, a });
const AB = (a, t = a) => ({ t, a, b: true });
const seg = (x) => (typeof x === 'string' ? [T(x)] : Array.isArray(x) ? x.flatMap(seg) : [x]);
const plain = (line) => seg(line).map((s) => s.t).join('');
const html = (line) =>
  seg(line)
    .map((s) => {
      let h = esc(s.t);
      if (s.b) h = `<b>${h}</b>`;
      if (s.a) h = `<a href="${s.a}">${h}</a>`;
      return h;
    })
    .join('');
const len = (line) => [...plain(line)].length;
const pad = (s, n) => s + ' '.repeat(Math.max(0, n - [...s].length));
const lpad = (s, n) => ' '.repeat(Math.max(0, n - [...s].length)) + s;

// ---------------------------------------------------------------------------------------------
// 1. The bot's formats (after iroffer): sizes, durations, pack rows, note lines, star lines
// ---------------------------------------------------------------------------------------------
// iroffer-style size: 4 characters and a one-letter unit, base 1024.
const sizeStr = (bytes) => {
  const units = ['K', 'M', 'G'];
  let v = bytes / 1024;
  let u = 0;
  while (v >= 1000 && u < units.length - 1) { v /= 1024; u++; }
  const n = v < 10 ? v.toFixed(1) : String(Math.round(v));
  return lpad(n, 3) + units[u];
};
// The same 4-character slot for a length of time: seconds, then minutes.
const secs = (hms) => hms.split(':').map(Number).reduce((a, b) => a * 60 + b, 0);
const durStr = ([lo, hi]) => {
  const s = (secs(lo) + secs(hi)) / 2; // the middle of the range in activities.toml
  if (s < 10) return s.toFixed(1) + 's';
  if (s < 100) return lpad(String(Math.round(s)), 3) + 's';
  const m = s / 60;
  if (m < 10) return m.toFixed(1) + 'm';
  return lpad(String(Math.round(m)), 3) + 'm';
};
const NUMW = 2; // pack number column, as wide as the highest number (94)
const GETW = 2; // gets column, as wide as the highest count (34)
const DESC_AT = 1 + NUMW + 1 + GETW + 1 + 1 + 6 + 1; // where the file name starts
const packRow = (n, gets, size, name, opts = {}) => {
  const out = [B('#' + pad(String(n), NUMW)), T(` ${lpad(String(gets), GETW)}x [${size}] `)];
  out.push(opts.href ? A(opts.href, name) : T(name));
  if (opts.tag) out.push(T(' ' + opts.tag));
  return out;
};
const noteRows = (text, width) => {
  // " ^-" then the note, aligned under the file name and wrapped to `width`.
  const words = text.split(' ');
  const rows = [];
  let cur = '';
  const room = width - DESC_AT;
  for (const w of words) {
    if (cur && cur.length + 1 + w.length > room) { rows.push(cur); cur = w; }
    else cur = cur ? cur + ' ' + w : w;
  }
  if (cur) rows.push(cur);
  return rows.map((r, i) => (i === 0 ? [T(' '), B('^-'), T(' '.repeat(DESC_AT - 3) + r)] : [T(' '.repeat(DESC_AT) + r)]));
};
const stars = (...parts) => [B('**'), T(' '), ...parts.flatMap(seg), T(' '), B('**')];

// ---------------------------------------------------------------------------------------------
// 2. The data (checked 2026-10-01). Pack numbers are the order of [activities] in
//    activities.toml; gets are the seed-1992 run printed by `python tools/schedule.py`;
//    durations are the [lo, hi] range from the file, shown at their middle.
// ---------------------------------------------------------------------------------------------
const PACKS = {
  coconut_sip:           { n: 1,  gets: 29, dur: ['0:00:27', '0:00:51'], note: 'wanders into the shade and sips a coconut, eyes closed.' },
  stroll:                { n: 2,  gets: 34, dur: ['0:00:22', '0:00:42'], note: 'a slow lap to the waterline to look at the sea. and back.' },
  jog_lap:               { n: 3,  gets: 19, dur: ['0:00:21', '0:00:38'] },
  fishing_quiet:         { n: 4,  gets: 19, dur: ['0:00:55', '0:02:17'], note: 'nibbles. nothing. the usual.' },
  sandcastle:            { n: 5,  gets: 10, dur: ['0:00:57', '0:01:54'], note: 'stays up until the tide wants it (#32).' },
  coconut_crab:          { n: 6,  gets: 1,  dur: ['0:01:11', '0:02:42'], note: 'a coconut falls on a hermit crab, who walks off wearing it.' },
  ship_passes_unseen:    { n: 9,  gets: 9,  dur: ['0:01:30', '0:02:30'], note: 'waits until she is busy, then crosses. she never looks up.' },
  message_in_bottle:     { n: 11, gets: 1,  dur: ['0:01:17', '0:02:17'], note: 'thrown out to sea. washes straight back to her feet.' },
  turtle_visit:          { n: 12, gets: 0,  dur: ['0:03:13', '0:06:06'], note: 'a sea turtle crawls up beside her. they both doze off.' },
  tide_takes_sandcastle: { n: 32, gets: 10, dur: ['0:00:05', '0:00:08'] },
  box_washed_away:       { n: 33, gets: 0,  dur: ['0:00:19', '0:00:36'], note: 'the empty parcel box floats off to sea.' },
  a3_kumara_planting:    { n: 36, gets: 0,  dur: ['0:00:25', '0:00:44'], note: 'plants a kumara. it grows over the course of the video.' },
  delivery_drone:        { n: 45, gets: 0,  dur: ['0:00:39', '0:00:57'], note: 'the parcel is another pair of headphones.' },
  signal_hunt:           { n: 46, gets: 1,  dur: ['0:01:54', '0:04:10'], note: 'one bar of signal, at the very top of the palm.' },
  cat_visit:             { n: 47, gets: 5,  dur: ['0:11:04', '0:26:46'], note: 'grey tabby, white chest. arrives on a crate, climbs the palm, naps. one day it floats away. it comes back another time.' },
  shark_nod:             { n: 48, gets: 0,  dur: ['0:00:49', '0:01:17'], note: 'wears headphones. nods on the beat. not in this run.' },
  tour_boat_selfies:     { n: 49, gets: 0,  dur: ['0:00:52', '0:01:21'], note: 'a boat of selfie-takers. she is in the background of every one.' },
  efoil_bro:             { n: 59, gets: 0,  dur: ['0:00:30', '0:00:51'], note: 'electric hydrofoil. a big smile, a shaka, and he carves off.' },
  fire_by_friction:      { n: 60, gets: 0,  dur: ['0:00:43', '0:01:11'] },
  spear_fishing:         { n: 62, gets: 0,  dur: ['0:00:39', '0:01:07'] },
  hammock:               { n: 68, gets: 2,  dur: ['0:01:35', '0:03:59'], note: 'one palm, no second tree. the other end goes on the raft.' },
  lookout:               { n: 70, gets: 0,  dur: ['0:00:47', '0:01:15'], tag: '[1 of 1 DL left]', note: 'a platform up the palm, with a ladder.' },
  rescue_almost:         { n: 78, gets: 1,  dur: ['0:01:24', '0:02:05'], tag: '[1 of 1 DL left]', note: 'she waves for rescue. it toots back. it sails on.' },
  leave_any_time:        { n: 82, gets: 0,  dur: ['0:01:19', '0:01:59'], tag: '[1 of 1 DL left]', note: 'walks out over the water. back with an iced coffee.' },
  bottle_reply:          { n: 84, gets: 1,  dur: ['0:00:40', '0:01:07'], note: 'hours later, a different bottle washes up. a reply.' },
};
const ACTIVITIES = 94; // [activities] entries in activities.toml on 2026-10-01

const rowFor = (id, opts = {}) => {
  const p = PACKS[id];
  if (!p) throw new Error(`no pack ${id}`);
  return packRow(p.n, p.gets, durStr(p.dur), id, { tag: p.tag, ...opts });
};

// ---------------------------------------------------------------------------------------------
// 3. The logo: CASTAWAY in hash marks (the same mark as the pack numbers), 6 rows, strokes
//    two columns wide, set to fit the 62 columns a message may use
// ---------------------------------------------------------------------------------------------
const FONT = {
  C: [' ####', '##   ', '##   ', '##   ', '##   ', ' ####'],
  A: [' #### ', '##  ##', '##  ##', '######', '##  ##', '##  ##'],
  S: [' #####', '##    ', ' #### ', '    ##', '    ##', '##### '],
  T: ['######', '  ##  ', '  ##  ', '  ##  ', '  ##  ', '  ##  '],
  W: ['##   ##', '##   ##', '##   ##', '## # ##', '#######', ' ## ## '],
  Y: ['##  ##', '##  ##', ' #### ', '  ##  ', '  ##  ', '  ##  '],
};
const ROWS = FONT.C.length;
const logoRows = (word, gap) => {
  const rows = Array(ROWS).fill('');
  [...word].forEach((ch, i) => {
    const g = FONT[ch];
    for (let r = 0; r < ROWS; r++) rows[r] += (i ? ' '.repeat(gap) : '') + g[r];
  });
  return rows.map((r) => r.replace(/\s+$/, ''));
};
// Read the logo back: each glyph must match its own pattern at its own offset.
const readLogo = (rows, gap) => {
  let x = 0;
  let word = '';
  while (x < Math.max(...rows.map((r) => r.length))) {
    const hit = Object.entries(FONT).find(([, g]) => g.every((gr, r) => (rows[r] + ' '.repeat(99)).slice(x, x + gr.length) === gr));
    if (!hit) return word + '?';
    word += hit[0];
    x += hit[1][0].length + gap;
  }
  return word;
};

// ---------------------------------------------------------------------------------------------
// 4. The channel window: a title bar, the buffer, a status bar and an input line
// ---------------------------------------------------------------------------------------------
const NICKW = 6; // the nick column, right-aligned
const GUTTER = 8 + 1 + NICKW + 3; // "00:00:03 [Raft] | "
const ROOM = W - GUTTER; // what a message may use
const clock = (s) => [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map((v) => String(v).padStart(2, '0')).join(':');
const buffer = [];
const say = (t, nick, ...msgs) => {
  // each msg is one IRC line; the first carries time and nick, wraps get a bare gutter
  msgs.forEach((m, i) => {
    const prefix = i === 0 ? `${clock(t)} ${lpad(nick, NICKW)} │ ` : `${' '.repeat(GUTTER - 2)}│ `;
    buffer.push([T(prefix), ...seg(m)]);
  });
};
// The bot pastes one line per bar of the music (3 s): its flood limit and the beat agree.
let now = 0;
const bot = (...msgs) => { now += 3; say(now, '[Raft]', ...msgs); };
const event = (dt, mark, msg) => say(now + dt, mark, msg);

const LOGO_GAP = 2;
const LOGO = logoRows('CASTAWAY', LOGO_GAP);
const LOGO_W = Math.max(...LOGO.map((r) => r.length));

say(0, '-->', [T('reader (~idle@a.readme) has joined '), B('#castaway')]);
say(0, '--', 'Topic for #castaway is "she idles. now and then, a pack."');
for (const r of LOGO) bot([B(r)]);
bot([T(lpad('', Math.floor((LOGO_W - 56) / 2))), ...stars(T('a ten-hour lo-fi island, sent at 1 second per second'))]);
bot(
  [B('**'), T(` ${ACTIVITIES} packs `), B('**'), T('  1 of 1 slots open, Queue: 24/26,')],
  'Min: 1.0s/s, Max: 1.0s/s, Record: 1.0s/s',
);
bot(
  [B('**'), T(' Bandwidth Usage '), B('**'), T(' Current: 0 bars, Cap: 1 bar,')],
  'Record: 1 bar (at the very top of the palm)',
);
bot(stars(T('To request the island, type "python '), A('tools/serve.py'), T('"')));
bot(stars(T('then open "'), A('http://127.0.0.1:8765/'), T('" and wait. that is it')));
bot(stars(T('To request details, type "python '), A('tools/schedule.py'), T('"')));
// The channel list is the restricted one a bot pastes into the channel: a few packs, with
// short notes that fit one IRC line each (the full list is in the first fold).
const MAIN = [
  ['coconut_sip'],
  ['fishing_quiet', 'nibbles. nothing. the usual.'],
  ['ship_passes_unseen', 'waits until she is busy. she never looks up.'],
  ['message_in_bottle', 'thrown out to sea. washes straight back.'],
  ['delivery_drone', 'the parcel is another pair of headphones.'],
  ['signal_hunt'],
  ['cat_visit'],
  ['shark_nod', 'wears headphones. nods on the beat. not today.'],
  ['leave_any_time', 'walks over the water. back with an iced coffee.'],
];
MAIN.forEach(([id, note]) => {
  bot(rowFor(id));
  if (note) {
    const rows = noteRows(note, ROOM);
    if (rows.length > 1) problems.push(`channel note for ${id} wraps: "${note}"`);
    for (const nr of rows) bot(nr);
  }
  if (id === 'ship_passes_unseen') event(1, '<--', 'ship (~horn@far.out) has left #castaway ("she looked busy")');
  if (id === 'signal_hunt') event(2, '-->', 'stray_cat (~napper@crate.ahoy) has joined #castaway');
});
bot(stars(T('gets: times in a 10-hour run, seed 1992 · [size]: length')));
bot([T('Total Offered: 10:00:00  Total Transferred: 0B')]);
const END = now + 3;
const xferPct = ((END / 36000) * 100).toFixed(2);

const titleBar = (() => {
  const left = ' #castaway · Castaway (working title) · one island, one slot';
  const right = '[+nt] ';
  return pad(left, W - right.length) + right;
})();
const ruleTop = '─'.repeat(GUTTER - 2) + '┬' + '─'.repeat(W - GUTTER + 1);
const ruleBot = '─'.repeat(GUTTER - 2) + '┴' + '─'.repeat(W - GUTTER + 1);
const status = `[${clock(END)}] [ShoalNet] #castaway{5}  [xfer: island ${xferPct}% 1.0s/s ETA ${clock(36000 - END).replace(/^0/, "")}]`;
const WINDOW = [
  [B(titleBar.trimEnd())],
  ruleTop,
  ...buffer,
  ruleBot,
  status,
  '[reader] is it done yet_',
];

// ---------------------------------------------------------------------------------------------
// 5. The folds: the full list, the tools, the sound, the queue, and the whois
// ---------------------------------------------------------------------------------------------
const cmd = (c) => [T('reader │ '), B(c)];
const LIST_ROOM = W;
const group = (name, about) => [T('group: '), B(pad(name, 12)), T(about)];
const listRows = (ids) => {
  const out = [];
  for (const id of ids) {
    out.push(rowFor(id));
    if (PACKS[id].note) out.push(...noteRows(PACKS[id].note, LIST_ROOM));
  }
  return out;
};
const FULL_LIST = [
  cmd('/msg [Raft] xdcc list'),
  '',
  [B('**'), T(` ${ACTIVITIES} packs `), B('**'), T('  1 of 1 slots open, Queue: 24/26, Min: 1.0s/s, Max: 1.0s/s,')],
  '   Record: 1.0s/s',
  [B('**'), T(' Bandwidth Usage '), B('**'), T(' Current: 0 bars, Cap: 1 bar, Record: 1 bar')],
  '   (at the very top of the palm)',
  stars(T('To request the island, type "python '), A('tools/serve.py'), T('"')),
  stars(T('To request details, type "python '), A('tools/schedule.py'), T('"')),
  '',
  group('regular', 'every 2 to 5 minutes'),
  ...listRows(['coconut_sip', 'stroll', 'jog_lap', 'fishing_quiet', 'sandcastle']),
  '',
  group('occasional', 'every 12 to 25 minutes'),
  ...listRows(['coconut_crab', 'ship_passes_unseen', 'message_in_bottle', 'turtle_visit', 'a3_kumara_planting']),
  '',
  group('rare', 'every 30 to 60 minutes'),
  ...listRows(['delivery_drone', 'signal_hunt', 'cat_visit', 'shark_nod', 'tour_boat_selfies', 'efoil_bro', 'fire_by_friction', 'spear_fishing', 'hammock', 'lookout']),
  '',
  group('super rare', 'every 3 to 6 hours, at most 3 a run'),
  ...listRows(['rescue_almost', 'leave_any_time']),
  '',
  group('chained', 'never on a timer: started by another pack'),
  ...listRows(['tide_takes_sandcastle', 'box_washed_away', 'bottle_reply']),
  '',
  stars(T(`${ACTIVITIES} packs in all, as of 2026-10-01. the rest are in `), A('activities.toml')),
  stars(T('gets: times in the seed-1992 run. [size]: the middle of its range')),
  stars(T('every pack starts on the next bar of the music: every 3 seconds')),
  'Total Offered: 10:00:00  Total Transferred: 0B',
];

const FILES = [
  { p: 'tools/serve.py', b: 17162, note: 'the renderer: a web page with a live preview at http://127.0.0.1:8765/ and an export to a YouTube-ready MP4. the server mixes the sound in.' },
  { p: 'web/index.html', b: 3775, note: 'the page itself. plain ES modules, no build step, no npm packages. frame-exact export in the browser (WebCodecs H.264).' },
  { p: 'tools/schedule.py', b: 21424, note: 'validates the schedule and simulates a 10-hour run.' },
  { p: 'activities.toml', b: 178456, note: 'every activity: its timer, its lane, its beats.' },
  { p: 'tools/make_audio.py', b: 136457, note: 'every sound, from code.' },
  { p: 'tools/render_demo.py', b: 95580, note: 'the older Python reference renderer. --dev renders a reel of every activity with a heads-up display.' },
  { p: 'MUSING.md', b: 139517, note: 'decisions, lessons and notes.' },
];
const kb = (bytes) => `${Math.round(bytes / 1024)}KB`;
const TOOLS_LIST = [
  cmd('/msg [Raft] xdcc list tools'),
  '',
  group('tools', "the project's own files. each name is a link"),
  ...FILES.flatMap((f, i) => [
    packRow(i + 1, 0, sizeStr(f.b), f.p, { href: f.p }),
    ...noteRows(f.note, LIST_ROOM),
  ]),
  '',
  stars(T('nothing has been published yet, so every gets counter is an honest 0')),
  stars(T('sizes as of 2026-10-01')),
  `Total Offered: ${kb(FILES.reduce((a, f) => a + f.b, 0))}  Total Transferred: 0B`,
];

const SOUNDS = [
  { p: 'music/castaway_lofi_theme_loop_60s.wav', b: 11520044, note: 'the theme. a seamless 60-second loop at 80 BPM, in F major.' },
  { p: 'sfx/ambience_ocean_loop_60s.wav', b: 11520044, note: 'the ocean. also a seamless 60-second loop.' },
  { p: 'sfx/ship_horn_distant.wav', b: 1305644 },
  { p: 'sfx/phone_ping_one_bar.wav', b: 268844, note: 'one bar of signal, as heard at the top of the palm.' },
  { p: 'sfx/shark_surface.wav', b: 230444 },
  { p: 'sfx/straw_slurp_ice.wav', b: 172844, note: 'the iced coffee.' },
  { p: 'sfx/cork_squeak_in.wav', b: 67244 },
  { p: 'sfx/coconut_drop_crunch.wav', b: 57644 },
  { p: 'sfx/parcel_thud_sand.wav', b: 48044 },
  { p: 'sfx/cat_mrrp.wav', b: 30764 },
];
const info = (k, v) => ` ${pad(k, 14)} ${v}`;
const SOUND_LIST = [
  cmd('/msg [Raft] xdcc list sound'),
  '',
  [T('group: '), B(pad('sound', 12)), T('synthesized by '), A('tools/make_audio.py'), T(' from code')],
  ...SOUNDS.flatMap((s, i) => [packRow(i + 1, 0, sizeStr(s.b), s.p), ...(s.note ? noteRows(s.note, LIST_ROOM) : [])]),
  stars(T('...and more than 140 others. gets: times heard by a human so far')),
  '',
  cmd('/msg [Raft] xdcc info #1'),
  '',
  'Pack Info for Pack #1:',
  info('Filename', 'castaway_lofi_theme_loop_60s.wav'),
  info('Description', 'the theme: a seamless 60-second loop, made from code'),
  info('Note', '80 BPM, F major, ii-V-I-vi. 20 bars of exactly 3 s.'),
  info('', 'electric piano, kalimba lead, soft drums, vinyl crackle'),
  info('Filesize', '11520044 [11MB]'),
  info('Gets', '0'),
  info('Minspeed', '1.0s/s'),
  info('Maxspeed', '1.0s/s'),
  '',
  stars(T('more than 150 sound files. samples: 0. loops borrowed: 0. recordings: 0')),
  stars(T('so no third-party licence applies to any of it')),
  stars(T('the mix sits at -14 LUFS, true peak at or below -1 dBTP')),
  stars(T('levels: adjustable in master and per routine')),
  stars(T('heard by: nobody yet. the meters are happy. ears pending')),
  'Total Offered: more than 150 files  Total Transferred: 0B',
];

const QUEUE_EVENTS = [
  ['distant_birds', 3], ['plane_vapour_trail', 4], ['rain_shower', 5], ['whale_pod', 9],
  ['dolphin_jump', 11], ['sailboat', 12], ['sandpipers', 21], ['gecko', 23],
];
const QUEUE = [
  cmd('/msg [Raft] xdcc queue'),
  '',
  stars(T('Scene life: 26 entries, 4 always on and 22 timed events')),
  stars(T('Sending now: shore_waves (always on, built)')),
  stars(T('Sending now: cloud_shadows (always on, built)')),
  ...QUEUE_EVENTS.map(([id, pos]) => `Queued for "${id}", in position ${pos} of 24. planned.`),
  stars(T('16 more in the queue. estimated wait: until they are built')),
  stars(T('the rain shower comes in daylight. it is always daytime here')),
];

const WHOIS = [
  cmd('/whois [Raft]'),
  '',
  [B('[Raft]'), T(' (~packs@the.raft): one island, one slot, no hurry')],
  [B('[Raft]'), T(' is on #castaway')],
  [B('[Raft]'), T(' server: shore.shoalnet (a sandbar, mostly)')],
  [B('[Raft]'), T(' idle: 3 seconds. it pastes a line on every bar')],
  [B('[Raft]'), T(' of the music, which is every 3 seconds: its flood')],
  [B('[Raft]'), T(' limit and the beat agree, for once')],
  'End of WHOIS',
  '',
  'ShoalNet, shore.shoalnet, [Raft] and every nick and host in this window',
  'are made up. The layout is the generic one an XDCC bot printed, and the',
  "packs are this project's own activities and files: nothing else is",
  'offered, and the request line is the real command to run it.',
  '',
  'Greetz to the Slow Lane Society, the Pack Rats of #kumara, the Half Tide',
  'Collective, and the Sand Timer Appreciation Society. Patience, all.',
  '',
  'Unofficial. Inspired by a 1992 desert-island screensaver, and not',
  'affiliated with it or its owners. Always daytime.',
];

// ---------------------------------------------------------------------------------------------
// 6. Lint, then write
// ---------------------------------------------------------------------------------------------
const OK_CHARS = /^[\x20-\x7e│─┬┴·]*$/;
const BANNED = /\b(crack|cracked|trainer|cheat|warez|keygen|pirate|rip|virus)\b/i;
const lint = (where, line) => {
  const p = plain(line);
  if (len(line) > W) problems.push(`${where}: ${len(line)} cols: ${p}`);
  if (/\s$/.test(p)) problems.push(`${where}: trailing whitespace: "${p}"`);
  if (!OK_CHARS.test(p)) problems.push(`${where}: stray character: ${p}`);
  if (BANNED.test(p)) problems.push(`${where}: banned word: ${p}`);
  if (/—/.test(p)) problems.push(`${where}: em dash`);
};
const block = (name, lines) => lines.map((l, i) => { lint(`${name}:${i + 1}`, l); return html(l); });
if (readLogo(LOGO, LOGO_GAP) !== 'CASTAWAY') problems.push(`logo reads "${readLogo(LOGO, LOGO_GAP)}"`);
if (LOGO_W > ROOM) problems.push(`logo is ${LOGO_W} wide, room is ${ROOM}`);

const details = (summary, lines, name) => [
  '<details>',
  `<summary>${summary}</summary>`,
  '',
  '<pre>',
  ...block(name, lines),
  '</pre>',
  '',
  '</details>',
  '',
];

const PITCH = [
  '**Castaway** (working title) is a ten-hour lo-fi video for YouTube in which almost nothing happens, on purpose. A young woman sits on a tiny island with one tall palm and a raft, nods to the music on her headphones, and waits. Every so often, on the next bar of the music, a pack lands: a coconut, a bottle that washes straight back, a stray cat on a crate, a drone delivering another pair of headphones. Then she goes back to nodding. It is an unofficial remake inspired by the small-island routines and visual comedy of *Johnny Castaway*, the 1992 desert-island screensaver, repainted sunny and hand-painted, and it is always daytime.',
  '',
  'More than 90 activities wait their turn in [`activities.toml`](activities.toml), on four timers: every 2 to 5 minutes, 12 to 25 minutes, 30 to 60 minutes, and 3 to 6 hours. The numbers in the window are the project\'s own: the gets are how often each activity came up in the seed-1992 run on 2026-10-01 (the shark sat this one out), and the sizes are how long each one lasts. Every sound is synthesized from code by [`tools/make_audio.py`](tools/make_audio.py): no samples, no loops, no recordings. The project is in development and no video has been published, which is why the honest transfer total is 0B.',
  '',
  '```sh',
  'python tools/serve.py',
  '# then open http://127.0.0.1:8765/ for the live preview and the MP4 export',
  '```',
];
for (const p of PITCH) {
  if (/—/.test(p)) problems.push('pitch: em dash');
  if (BANNED.test(p)) problems.push('pitch: banned word');
}

const md = [];
md.push(`<!-- Header ${SLUG} for Castaway. Generated by src/${SLUG}.mjs: edit that, not this. Counts checked 2026-10-01. -->`);
md.push('');
md.push('<pre>');
md.push(...block('window', WINDOW));
md.push('</pre>');
md.push('');
md.push(...PITCH);
md.push('');
md.push(...details('<b>/msg [Raft] xdcc list</b> &nbsp;the island, pack by pack (with notes)', FULL_LIST, 'list'));
md.push(...details('<b>/msg [Raft] xdcc list sound</b> &nbsp;all synthesized, none of it heard yet', SOUND_LIST, 'sound'));
md.push(...details('<b>/msg [Raft] xdcc list tools</b> &nbsp;the files, and how to run them', TOOLS_LIST, 'tools'));
md.push(...details('<b>/msg [Raft] xdcc queue</b> &nbsp;scene life, waiting its turn', QUEUE, 'queue'));
md.push(...details('<b>/whois [Raft]</b> &nbsp;credits and small print', WHOIS, 'whois'));

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
fs.writeFileSync(OUT, md.join('\n'));
console.log(`wrote ${path.relative(process.cwd(), OUT)}`);
if (process.argv.includes('--print')) console.log(WINDOW.map(plain).join('\n'));
