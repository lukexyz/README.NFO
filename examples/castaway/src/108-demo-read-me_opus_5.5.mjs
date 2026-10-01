// PC demo READ.ME header for the Castaway README (style catalogue entry demo-02).
// Plain Node, no dependencies, deterministic. Run:
//   node examples/castaway/src/108-demo-read-me_opus_5.5.mjs            (writes the .md)
//   node examples/castaway/src/108-demo-read-me_opus_5.5.mjs --print    (also prints it as plain text)
// It rewrites examples/castaway/108-demo-read-me_opus_5.5.md. Edit this file, not the .md.
//
// THE STYLE
// The long typed READ.ME that early-90s PC demo groups shipped beside the executable: closer to
// a club newsletter than to a release NFO, and with no logo art at all. The structure is the
// look: a full-width title card in single-line box characters, split by a divider (copyright
// line and the title between equals signs above it, centred status lines below); a centred
// "= MAIN INDEX =" whose entries run to two-digit page numbers along dot leaders; centred page
// markers of the form "- 03 -" with blank lines round them; capital headings indented eight
// spaces and underlined with equals signs (major) or hyphens (minor); body text indented eight
// and wrapped near column 72; a four-column member table (alias, real name, age, position) under
// one dashed rule; Q: and A: paragraphs; a three-column release list (title, date, note); a
// numbered list with a one-character flag in the left margin and a legend under it; and a
// tear-off form: CUT HERE! repeated across the width between two dashed rules, then labelled
// colon-and-underscore blanks and [ ] tick boxes.
// Credited reference, of which only those generic devices are used (no wording, names, people
// or details): the READ.ME in the Second Reality source tree (Future Crew, 1993).
//
// ON GITHUB: the first page (title card, index, opening words, how to run it) is one <pre>;
// pages 02 to 09 are each a <details> whose <summary> is that page's marker and index title,
// so the index is honest about where things are without needing anchor links.
//
// Everything named here is new and made up: the group "Idle Loop" and its membership form.
// Castaway is Luke's own project; the jokes are about it and nothing else. The schedule
// excerpt on page 03 is real: `python -B tools/schedule.py --show 1:00:00` in the Castaway
// repo, seed 1992, run on 2026-10-01 (it changes as activities are added, so it is dated).
//
// THE OUTPUT is 7-bit ASCII inside <pre>, at most 78 columns, with <b> and <a> only. Box
// characters appear in the title card and nowhere else. The script refuses a line wider than
// 78 columns, any other non-ASCII character, a tab or trailing whitespace, a heading whose
// underline does not match it, and an index whose page numbers do not match the pages.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '108-demo-read-me_opus_5.5';
const OUT = path.resolve(HERE, '..', `${SLUG}.md`);
const W = 78; // page width of the file, in columns
const IND = 8; // body indent
const WRAP = 72; // body text wraps at this column

// ---------------------------------------------------------------------------------------------
// 0. Helpers. Lines are written with light markup: **bold** and [text](href). Every width is
//    measured on the plain text, so markup costs no columns.
// ---------------------------------------------------------------------------------------------
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const MARK = /\*\*(.+?)\*\*|\[([^\]\n]+)\]\(([^)\s]+)\)/g;
const plain = (line) => line.replace(MARK, (m, b, t) => (b !== undefined ? b : t));
function html(line) {
  let out = '';
  let last = 0;
  line.replace(MARK, (m, b, t, href, at) => {
    out += esc(line.slice(last, at));
    if (b !== undefined) out += `<b>${esc(b)}</b>`;
    else out += `<a href="${href}">${esc(t)}</a>`;
    last = at + m.length;
    return m;
  });
  return out + esc(line.slice(last));
}
const sp = (n) => ' '.repeat(Math.max(0, n));
const padTo = (s, n) => s + sp(n - plain(s).length);
const centre = (s, width = W) => sp(Math.floor((width - plain(s).length) / 2)) + s;
const ind = (s, n = IND) => (s ? sp(n) + s : '');

// Wrap a paragraph to `width` columns starting at `indent`; `hang` indents the follow-on lines
// further (for Q:/A: and list items). Spaces inside **bold** never break.
function wrap(text, { indent = IND, width = WRAP, first = '', hang = 0 } = {}) {
  const words = text
    .replace(/\*\*(.+?)\*\*/g, (m) => m.replace(/ /g, '\u00a0'))
    .split(/\s+/)
    .filter(Boolean);
  const lines = [];
  let cur = sp(indent) + first;
  let empty = true;
  for (const w of words) {
    const len = plain(cur).length + (empty ? 0 : 1) + plain(w).length;
    if (!empty && len > width) {
      lines.push(cur);
      cur = sp(indent + hang) + w;
    } else cur += (empty ? '' : ' ') + w;
    empty = false;
  }
  lines.push(cur);
  return lines.map((l) => l.replace(/\u00a0/g, ' '));
}
const paras = (...ps) => ps.flatMap((p, i) => (i ? ['', ...wrap(p)] : wrap(p)));

// "label ........ value" with the value starting at column `at`.
function dots(label, value, at, { indent = IND, dot = '.' } = {}) {
  const n = at - indent - plain(label).length - 2;
  if (n < 2) throw new Error(`no room for dots after "${label}"`);
  return sp(indent) + label + ' ' + dot.repeat(n) + ' ' + value;
}
// A value that continues under the previous dotted line.
const under = (value, at) => sp(at) + value;

// Headings: capitals, indented eight, underlined to their own length.
const H1 = (t) => [ind(`**${t}**`), ind('='.repeat(t.length))];
const H2 = (t) => [ind(`**${t}**`), ind('-'.repeat(t.length))];
// Page markers, centred, with blank lines round them.
const marker = (n) => ['', '', centre(`- ${String(n).padStart(2, '0')} -`), '', ''];

// ---------------------------------------------------------------------------------------------
// 1. The title card: single-line box, copyright line and the title between equals signs above
//    the divider, centred status lines below it. The only place box characters appear.
// ---------------------------------------------------------------------------------------------
const BOX = { h: '\u2500', v: '\u2502', tl: '\u250c', tr: '\u2510', bl: '\u2514', br: '\u2518', lt: '\u251c', rt: '\u2524' };
const TITLE = 'C A S T A W A Y';
function titleCard() {
  const inner = W - 2;
  const row = (s = '') => BOX.v + padTo(centre(s, inner), inner) + BOX.v;
  const eq = '='.repeat(24);
  return [
    BOX.tl + BOX.h.repeat(inner) + BOX.tr,
    row(),
    row('Copyright (C) 2026 Luke  .  an Idle Loop production'),
    row(),
    row(`${eq}   **${TITLE}**   ${eq}`),
    row('(working title)'),
    row(),
    BOX.lt + BOX.h.repeat(inner) + BOX.rt,
    row('a ten-hour lo-fi video of one very small island,'),
    row('in which almost nothing happens, on purpose'),
    row(),
    row('in development  .  unreleased  .  every sound synthesized from code'),
    BOX.bl + BOX.h.repeat(inner) + BOX.br,
  ];
}

// ---------------------------------------------------------------------------------------------
// 2. The pages. Page 01 is above the fold; the rest fold away under their own markers.
// ---------------------------------------------------------------------------------------------
const L = (href, text = href) => `[${text}](${href})`;
const SERVE = L('tools/serve.py');
const LOCAL = L('http://127.0.0.1:8765/');

const PAGES = [];
const page = (title, lines) => PAGES.push({ title, lines });

// --- 01 ------------------------------------------------------------------------------------
page('Opening words', [
  ...H1('OPENING WORDS'),
  '',
  ...paras(
    'A young woman sits on a very small island with one tall palm and a raft, ' +
      'nodding to the music in her cream headphones. Every 2 to 5 minutes, on ' +
      'the next bar, she does something: a spot of fishing, a lap of the island, ' +
      'a sandcastle for the tide. Now and then something else happens: the bottle she threw ' +
      'washes straight back, a drone delivers a parcel of more headphones, a ' +
      'coconut falls on a hermit crab and then walks off with the crab wearing ' +
      'it. Then back to nodding, which is the main part.',
    '**Castaway** is an unofficial remake, inspired by the 1992 screensaver ' +
      'Johnny Castaway. Sunny, hand-painted, 16:9, 1080p at 30 frames a second, ' +
      'and always daytime.'
  ),
  '',
  ind(`**TO RUN IT:**   python ${SERVE}   then open ${LOCAL}`),
]);

// --- 02 ------------------------------------------------------------------------------------
const opt = (tool, flag, what) => ind(padTo(tool, 22) + padTo(flag, 15) + what);
page('Hardware requirements, and how to run it', [
  ...H1('HARDWARE REQUIREMENTS'),
  '',
  dots('To watch the preview', 'a web browser', 36),
  dots('To export the MP4', 'a browser with WebCodecs (Chrome),', 36),
  under('ffmpeg on the PATH, NumPy and Pillow', 36),
  under(`(the mixer lives in ${L('tools/render_demo.py')})`, 36),
  dots('To run the tools', 'Python 3.11 or newer (they read', 36),
  under('TOML with tomllib)', 36),
  dots('To enjoy it', 'ten hours, and nowhere to be', 36),
  '',
  ...paras(
    'There is no sound card setup screen. Every sound was synthesized ahead ' +
      `of time by ${L('tools/make_audio.py')}, and the server mixes it into the ` +
      'video when you export.'
  ),
  '',
  '',
  ...H1('HOW TO RUN IT'),
  '',
  ind(`1.  python ${SERVE}`),
  ind(`2.  open ${LOCAL} for the live preview`),
  ...wrap(
    'Export from the page. The browser encodes frame-exact video (68 to 78 ' +
      'frames a second at 1080p30 in Chrome, which is faster than the video plays), ' +
      'the server mixes the sound and joins the two into a YouTube-ready MP4.',
    { first: '3.  ', hang: 4 }
  ),
  '',
  ...wrap(
    'The renderer is a web page, ' +
      L('web/index.html') +
      ': plain ES modules, no build step, no npm packages. Hard cuts and stepped ' +
      'movement are the defaults. She does not glide.'
  ),
  '',
  '',
  ...H2('COMMAND LINE OPTIONS'),
  '',
  opt(SERVE, '--port N', 'listen on another port'),
  opt(L('tools/schedule.py'), '', 'check it all, simulate ten hours'),
  opt('', '--seed N', 'another day (the default is 1992)'),
  opt('', '--length T', 'a shorter run, e.g. 2:00:00'),
  opt('', '--show T', 'how much timeline to print'),
  opt('', '--demo', 'lay out the scripted demo cut'),
  opt(L('tools/render_demo.py'), '--dev', 'a dev reel of every activity,'),
  opt('', '', 'with a heads-up display (the'),
  opt('', '', 'older Python reference renderer)'),
  opt('', '--music-db DB', 'one run\'s music level, or "off"'),
  opt('', '', 'likewise --ocean-db, --sfx-db'),
  opt('', '', 'and --life-db'),
  opt('', '--audio-only', 'only the soundtrack, quickly'),
  '',
  '',
  ...H2('KNOWN PROBLEMS'),
  '',
  ...wrap('Nothing is happening. This is correct. She idles about two thirds of ' +
    'the time, and something regular comes round every 2 to 5 minutes.', { first: '* ', hang: 2 }),
  ...wrap('A ship sailed past and she did not see it. This is also correct. ' +
    '(Headphones.)', { first: '* ', hang: 2 }),
  ...wrap('It is getting dark. It is not. It is always daytime on the island, by ' +
    'project rule. Check the lamp in your room.', { first: '* ', hang: 2 }),
]);

// --- 03 ------------------------------------------------------------------------------------
const tiers = [
  ['regular', '2 to 5 min', 'about 155', 'coconut, fishing, jog'],
  ['occasional', '12 to 25 min', 'about 30', 'bottle, turtle, crab'],
  ['rare', '30 to 60 min', 'about 13', 'drone, cat, shark'],
  ['super rare', '3 to 6 hours', 'about 2', 'iced coffee, waving'],
  ['follow-up', 'chained', 'as needed', 'tide, reply bottle'],
];
const TC = [13, 15, 13]; // tier table column widths, after the indent
const trow = (r) => ind(r.slice(0, 3).map((c, i) => padTo(c, TC[i])).join('') + r[3]);
// Hour one of the default run (seed 1992, simulated 2026-10-01), routines not on this page left out.
const hour = [
  ['0:04:09', 'Fishing', 'nibbles, nothing. the usual'],
  ['0:07:36', 'Coconut', 'eyes closed, completely content'],
  ['0:24:09', 'Coconut', 'same again'],
  ['0:24:18', 'Ship (unseen)', 'nine seconds into the coconut'],
  ['0:28:09', 'Jog lap', 'the length of the island and back'],
  ['0:44:06', 'Cat', 'arrives on a crate. stays 26 min'],
  ['0:46:39', 'Coconut', 'the usual'],
  ['0:51:27', 'Fishing', 'nibbles, nothing. still the usual'],
  ['0:58:12', 'Coconut', 'eyes closed'],
  ['0:58:21', 'Ship (unseen)', 'nine seconds into the coconut. again'],
];
page('The schedule: what happens, and how often', [
  ...H1('THE SCHEDULE'),
  '',
  ...paras(
    `Everything she and her visitors can do is listed in ${L('activities.toml')}: ` +
      'more than 90 activities, each on one of four timers or chained to ' +
      'another as a follow-up. A new pick comes round when a timer goes off.'
  ),
  '',
  trow(['TIMER', 'EVERY', 'IN 10 HOURS', 'FOR EXAMPLE']),
  ind('-'.repeat(WRAP - IND)),
  ...tiers.map(trow),
  '',
  ...paras(
    'Counts are the median of 200 simulated ten-hour runs. Super rare is ' +
      'capped at 3 a run. She is busy about a third of the time and idles the rest.',
    '**ON THE BEAT.** Every activity starts on the next bar of the music, and a ' +
      'bar is exactly 3 seconds. A ten-hour run has 12,000 bars. About 200 of ' +
      'them start something on a timer. The rest are for nodding.',
    '**LANES.** Everyone has a lane, so things overlap. She does one thing at a ' +
      'time; the cat, the turtle, the tide and the kumara patch each have their ' +
      'own; the ship, the drone, the boats and the shark share the sea and sky. ' +
      'The ship prefers to cross while she is busy with a coconut, a rod, a jog ' +
      'or a sandcastle, and will wait up to ten minutes for her to start one.'
  ),
  '',
  '',
  ...H2('RELEASE LIST: HOUR ONE'),
  '',
  ...wrap('The default run is 10:00:00 with seed 1992: same seed, same video, ' +
    'event for event. As simulated on 2026-10-01, with the routines not ' +
    'mentioned in this file left out. The list grows every few hours.'),
  '',
  ind(padTo('TIME', 11) + padTo('TITLE', 17) + 'NOTE'),
  ind('-'.repeat(WRAP - IND)),
  ...hour.map(([t, a, n]) => ind(padTo(t, 11) + padTo(a, 17) + n)),
]);

// --- 04 ------------------------------------------------------------------------------------
const members = [
  ['She', 'not given', 'young adult', 'lead idler'],
  ['The Palm', 'one tall palm', 'tall', 'signal mast (1 bar)'],
  ['The Raft', 'a raft', 'unknown', 'the other tree'],
  ['The Cat', 'grey tabby, white chest', 'nine lives', 'napping, visiting'],
  ['The Turtle', 'sea turtle', 'unhurried', 'dozing, visiting'],
  ['The Crab', 'hermit crab', 'small', 'wears a coconut'],
  ['The Shark', 'shark', 'not saying', 'rhythm section'],
  ['The Gull', 'gull', 'kind', 'drops fish (pity)'],
  ['The Drone', 'delivery drone', 'new', 'headphones courier'],
  ['The Ship', 'a ship', 'punctual', 'sails past'],
  ['The Bro', 'bro on e-hydrofoil', 'stoked', 'shaka, carves off'],
  ['The Kumara', 'kumara', 'growing', 'grows on its own'],
];
const MC = [12, 25, 13];
const mrow = (r) => ind(r.slice(0, 3).map((c, i) => padTo(c, MC[i])).join('') + r[3]);
page('Members of the island', [
  ...H1('MEMBERS OF THE ISLAND'),
  '',
  mrow(['Alias', 'Real name', 'Age', 'Position']),
  ind('-'.repeat(W - IND)),
  ...members.map(mrow),
  '',
  ...paras(
    'Membership is closed: the island seats one. Visitors are welcome and do ' +
      'leave again. The cat drifts in on a crate, climbs the palm, naps, and one ' +
      'day floats away; it comes back another time. The turtle swims in and they ' +
      'both doze off. The shark surfaces in headphones and nods on the beat. The ' +
      'bro on the hydrofoil carves in close, waves a shaka and carves off.',
    'The Raft is listed as the other tree because there is only one tree. When ' +
      'she weaves a hammock, she ties the far end to the raft. The Kumara is ' +
      'planted during the video and grows over it, on its own lane, without ' +
      'remark. To apply for membership anyway, see page 08.'
  ),
]);

// --- 05 ------------------------------------------------------------------------------------
const MI = 24; // music info values start here
page('Credits and music information', [
  ...H1('CREDITS'),
  '',
  ind('Most of the credits go to files.'),
  '',
  dots('Renderer', `${L('web/index.html')} (a web page)`, 33),
  dots('Server and export', SERVE, 33),
  dots('Music and sound', L('tools/make_audio.py'), 33),
  dots('Schedule', L('activities.toml'), 33),
  dots('Simulation', L('tools/schedule.py'), 33),
  dots('Reference renderer', `${L('tools/render_demo.py')} (older, Python)`, 33),
  dots('Lessons learned', L('MUSING.md'), 33),
  dots('Organising', 'Luke', 33),
  '',
  '',
  ...H2('MUSIC INFORMATION'),
  '',
  dots('Title', 'the theme', MI),
  dots('Length', '60 seconds, a seamless loop (ten hours is', MI),
  under('600 laps of it)', MI),
  dots('Tempo', '80 BPM, so one bar is exactly 3 seconds', MI),
  dots('Key', 'F major, ii-V-I-vi, 20 bars', MI),
  dots('Instruments', 'electric piano, kalimba lead, soft drums,', MI),
  under('vinyl crackle', MI),
  dots('Ocean', 'a second seamless 60-second loop', MI),
  dots('Loudness', '-14 LUFS, true peak at or below -1 dBTP', MI),
  dots('Levels', 'adjustable in master and per routine', MI),
  dots('Sound files', 'more than 150, every one from code', MI),
  dots('Samples', 'none', MI),
  dots('Loops', 'none, except its own', MI),
  dots('Recordings', 'none', MI),
  dots('Licences', 'no third-party licence applies', MI),
  dots('Reviews', 'none yet. Nobody has listened to it.', MI),
]);

// --- 06 ------------------------------------------------------------------------------------
// [life] in activities.toml as of 2026-10-01: 4 always-on effects, 22 timed events.
const life = [
  ['*', 'Shore waves running up the sand', 'always on'],
  ['*', 'Cloud shadows drifting over the sea', 'always on'],
  ['-', 'The light moving, morning to afternoon', 'always on'],
  ['-', 'The tide, up and back over an hour', 'always on'],
  ['-', 'Distant birds', '3 to 8 min'],
  ['-', 'Jumping fish', '4 to 10 min'],
  ['-', 'Shapes in the shallows', '10 to 25 min'],
  ['-', 'Sand crabs', '10 to 25 min'],
  ['-', 'Turtle heads, out in the water', '15 to 40 min'],
  ['-', 'Sandpipers chasing the waves', '15 to 35 min'],
  ['-', 'A plane and its vapour trail', '20 to 45 min'],
  ['-', 'Flying fish', '20 to 50 min'],
  ['-', 'A gecko up the palm', '20 to 45 min'],
  ['-', 'Things drifting past (a rubber duck)', '25 to 60 min'],
  ['-', 'A frigatebird and its shadow', '30 to 60 min'],
  ['-', 'Heat shimmer on the horizon', '30 to 90 min'],
  ['-', 'A sailboat', '30 to 75 min'],
  ['-', 'A dolphin jump', '40 to 90 min'],
  ['-', 'A pod of whales', '1 to 2.5 hours'],
  ['-', 'One lost red balloon', '1 to 3 hours'],
  ['-', 'A rain shower, then a rainbow', '1.5 to 3 hours'],
  ['-', 'A trawler and its gulls', '1.5 to 3 hours'],
  ['-', 'A hot-air balloon (20 min to cross)', '2 to 4 hours'],
  ['-', 'A jellyfish bloom', '2 to 4 hours'],
  ['-', 'A whale breach, far out', '4 to 9 hours'],
  ['-', 'A nest in the palm; chicks, later', 'once'],
];
page('Scene life, and other things on the horizon', [
  ...H1('SCENE LIFE'),
  '',
  ...paras(
    'Behind the activities the scene keeps a life of its own: 26 entries, ' +
      'four always on and 22 that come round on their own timers, never more ' +
      'than two on screen at once. The flag in the margin says how far along ' +
      'each one is. Built so far: the first two.'
  ),
  '',
  ...life.map(([f, what, when], i) => sp(IND - 3) + f + '  ' + dots(String(i + 1).padStart(2, '0') + '  ' + what, when, 50, { indent: 0 })),
  '',
  ind('Legend:   * built, running in every frame'),
  ind('          - planned (some need code, some are waiting on art)'),
]);

// --- 07 ------------------------------------------------------------------------------------
const qa = (q, a) => [...wrap(q, { first: 'Q: ', hang: 3 }), ...wrap(a, { first: 'A: ', hang: 3 }), ''];
page('Questions and answers', [
  ...H1('QUESTIONS AND ANSWERS'),
  '',
  ...qa('Nothing is happening. Is it broken?',
    'No, that is the demo. Something regular is due every 2 to 5 minutes. ' +
      'Please continue to wait.'),
  ...qa('Can I skip to the good part?', 'You are in it.'),
  ...qa('When does it get dark?', 'It does not. Always daytime is a project rule.'),
  ...qa('Why does she not just leave?',
    'She could leave any time. Very rarely she stands, stretches and walks out ' +
      'over the water. The island sits empty for twenty seconds. She walks back ' +
      'with an iced coffee and sits down. It is never explained.'),
  ...qa('Is there any signal out there?', 'One bar, at the very top of the palm. She has found it.'),
  ...qa('Where is the other tree for the hammock?', 'There is not one. See The Raft, page 04.'),
  ...qa('Does a ship ever stop?',
    'Once in a long while she spots one and waves like mad, and it sounds its ' +
      'horn back. Then it sails on. She shrugs and puts the music back on.'),
  ...qa('Is the music any good?',
    'Unknown. Every sound is synthesized from code and nobody has listened to ' +
      'any of it yet. The loudness meter has no complaints.'),
  ...qa('Where can I watch it?',
    `Nowhere yet: no video has been published. Run it yourself (page 02) and watch it at ${LOCAL}.`),
  ...qa('Is this the 1992 screensaver?',
    'No. An unofficial remake, inspired by the small-island routines and visual ' +
      'comedy of Johnny Castaway, which belongs to its owners. The island, the ' +
      'castaway, the art, the code and every sound here are new.'),
]);

// --- 08 ------------------------------------------------------------------------------------
const CUT = (() => {
  const unit = 'CUT HERE!';
  const n = 7;
  const gap = Math.floor((W - n * unit.length) / (n - 1));
  const s = Array(n).fill(unit).join(sp(gap));
  return centre(s);
})();
const FL = 30; // form colon column
const field = (label, rest) => ind(padTo(label, FL - IND) + ':' + rest);
// Tick boxes after the colon, each in a column `w` wide; `more` continues them on the next line.
const ticks = (items, w = 14) => ' ' + items.map((t, i) => (i < items.length - 1 ? padTo(`[ ] ${t}`, w) : `[ ] ${t}`)).join('');
const more = (rest) => ind(sp(FL - IND) + ' ' + rest);
const blank = (n) => '_'.repeat(n);
page('Contacting the island (form, cut here)', [
  ...H1('CONTACTING THE ISLAND'),
  '',
  dots('By bottle', 'throw it from the shore. It washes', 28),
  under('straight back. A different bottle may', 28),
  under('bring a reply, hours later.', 28),
  dots('By phone', 'one bar, at the top of the palm.', 28),
  dots('By drone', 'parcels accepted. She has two pairs of', 28),
  under('headphones now, thank you.', 28),
  dots('By ship', 'she will be busy.', 28),
  dots('By hydrofoil', 'expect a shaka.', 28),
  dots('By tour boat', 'she will be in the background of', 28),
  under('every selfie. Nobody offers a lift.', 28),
  '',
  ...wrap('To apply for membership, fill in the form below and send it by bottle.'),
  '',
  '-'.repeat(W),
  CUT,
  '-'.repeat(W),
  '',
  ind('**ISLAND MEMBERSHIP APPLICATION**') + sp(W - IND - 'ISLAND MEMBERSHIP APPLICATION'.length - 'form IL-1'.length - 1) + 'form IL-1',
  '',
  field('Alias', blank(36)),
  field('Species', blank(36)),
  field('Arriving by', ticks(['crate', 'drone', 'fin'])),
  more(ticks(['hydrofoil', 'on foot, over the water'])),
  field('Own headphones', ticks(['yes', 'no, please send some'])),
  field('Can you nod at 80 BPM', ticks(['yes', 'I will practise'])),
  field('Preferred spot', ticks(['under the palm', 'on the raft'], 20)),
  more(ticks(['up the palm (for the signal)'], 20)),
  field('Longest wait (hours)', blank(6) + '   (minimum 10:00:00)'),
  field('Night shifts', ticks(['no']) + '        (there is no night)'),
  field('Signature', blank(36)),
  '',
  ...wrap('Roll it up, put it in a bottle and throw it as far as you can. It will ' +
    'wash straight back. That is how you know it arrived.'),
]);

// --- 09 ------------------------------------------------------------------------------------
page('Greetings, and the small print', [
  ...H1('GREETINGS'),
  '',
  ...paras(
    'Hellos go out to the sea turtle, the grey tabby with the white chest, the ' +
      'hermit crab and its coconut, the shark with the good headphones, the ' +
      'selfie boat, the bro on the hydrofoil, the drone, the gull who dropped a ' +
      'fish at her feet out of pity, and the ship, for its timing.'
  ),
  '',
  '',
  ...H2('THE SMALL PRINT'),
  '',
  ...paras(
    'Castaway is an unofficial remake, inspired by the 1992 screensaver Johnny ' +
      'Castaway, which belongs to its owners. This project has no connection ' +
      'with them. Idle Loop is made up, and so is its form. The calm is real.',
    'No video has been published and there is no public link. This file will ' +
      'be updated when something happens, which, as you have read, takes a while.'
  ),
]);

// ---------------------------------------------------------------------------------------------
// 3. The index, built from the pages so the numbers cannot drift.
// ---------------------------------------------------------------------------------------------
const INDEX_W = 56;
const nn = (i) => String(i + 1).padStart(2, '0');
function mainIndex() {
  const left = Math.floor((W - INDEX_W) / 2);
  return [
    centre('= MAIN INDEX ='),
    '',
    ...PAGES.map((p, i) => {
      const dotsN = INDEX_W - p.title.length - 2;
      if (dotsN < 3) throw new Error(`index title too long: ${p.title}`);
      return sp(left) + p.title + '.'.repeat(dotsN) + nn(i);
    }),
  ];
}

// ---------------------------------------------------------------------------------------------
// 4. Assemble, lint, write.
// ---------------------------------------------------------------------------------------------
const problems = [];
const BOXCH = /[\u2500-\u257f]/;
function lint(where, line, allowBox) {
  const p = plain(line);
  if (p.length > W) problems.push(`${where}: ${p.length} columns: ${p}`);
  for (const ch of p) {
    if (/[\x20-\x7e]/.test(ch)) continue;
    if (allowBox && BOXCH.test(ch)) continue;
    problems.push(`${where}: character U+${ch.codePointAt(0).toString(16)}: ${p}`);
    break;
  }
  if (/\s$/.test(p)) problems.push(`${where}: trailing whitespace: ${p}`);
  if (/\t/.test(p)) problems.push(`${where}: tab: ${p}`);
}
const block = (where, lines, allowBox = false) =>
  lines.map((l, i) => {
    lint(`${where}:${i + 1}`, l, allowBox);
    return html(l).replace(/\s+$/, '');
  });

// Headings must be underlined to their own length.
for (const [i, p] of PAGES.entries()) {
  p.lines.forEach((l, k) => {
    const u = /^ {8}([=-])\1+$/.exec(l);
    if (!u || !/^ {8}\*\*/.test(p.lines[k - 1] || '')) return;
    const above = plain(p.lines[k - 1]).trim();
    if (above.length !== l.trim().length) problems.push(`page ${nn(i)}: underline does not match "${above}"`);
  });
}
const card = titleCard();
if (!card.some((r) => plain(r).includes(TITLE))) problems.push('title card lost its title');
if (TITLE.replace(/ /g, '') !== 'CASTAWAY') problems.push('title does not read CASTAWAY');

const first = [
  ...card,
  '',
  centre('This file is nine pages long. The demo is ten hours long. Pace yourself.'),
  '',
  ...mainIndex(),
  ...marker(1).slice(1, 4),
  ...PAGES[0].lines,
];
const md = [];
md.push(`<!-- Header ${SLUG} for Castaway. Generated by src/${SLUG}.mjs: edit that, not this. Facts checked 2026-10-01. -->`);
md.push('');
md.push('<pre>');
md.push(...block('page01', first, true));
md.push('</pre>');
md.push('');
for (const [i, p] of PAGES.entries()) {
  if (i === 0) continue;
  md.push('<details>');
  md.push(`<summary><b>- ${nn(i)} -</b> &nbsp;${esc(p.title)}</summary>`);
  md.push('');
  md.push('<pre>');
  md.push(...block(`page${nn(i)}`, [...marker(i + 1).slice(1, 4), ...p.lines, '']).filter((l, k, a) => !(k === a.length - 1 && l === '')));
  md.push('</pre>');
  md.push('');
  md.push('</details>');
  md.push('');
}
const footer = [
  '-'.repeat(W),
  centre('END OF READ.ME  .  something regular is due in 2 to 5 minutes'),
  '-'.repeat(W),
];
md.push('<pre>');
md.push(...block('footer', footer));
md.push('</pre>');
md.push('');

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
fs.writeFileSync(OUT, md.join('\n'));
console.log(`wrote ${path.relative(process.cwd(), OUT)}`);
if (process.argv.includes('--print')) {
  const all = [...first, ...PAGES.slice(1).flatMap((p, i) => [...marker(i + 2), ...p.lines]), '', ...footer];
  console.log(all.map(plain).join('\n'));
}
