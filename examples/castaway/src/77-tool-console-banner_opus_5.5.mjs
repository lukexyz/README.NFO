// Security-tool console header for the Castaway README (style catalogue entry hack-05).
// Plain Node, no dependencies, deterministic. Run:
//   node examples/castaway/src/77-tool-console-banner_opus_5.5.mjs [--seed=N] [--date=MM-DD]
// It rewrites examples/castaway/77-tool-console-banner_opus_5.5.md. Edit this file, not the .md.
//
// THE STYLE
// Penetration-testing consoles greet you with an ASCII banner drawn at random from a folder of
// text files (a cowsay-style animal, a FIGlet-style wordmark, a silhouette filled solid with one
// capital letter, a fake boxed dialog, a film parody), with a dated set that only turns up on
// certain days. Under it sits a fixed stats block: one line indented seven spaces opening "=[",
// then lines opening "+ -- --=[", every closing bracket padded into one column. Port scanners,
// meanwhile, print a report: a "scan report" line, "is up" with a latency, "Not shown: N closed
// ports", a PORT STATE SERVICE VERSION table separated by runs of spaces, script output hanging
// in a gutter of pipes with the last line marked "|_", and a closing "done" line with a count
// and the elapsed seconds. There is also a joke output mode that rewrites the report in
// leetspeak. Credited references, of which only the generic layout is used (no banner art, no
// tool names, no wording): the Metasploit Framework's data/logos banners and the stats lines in
// its console, and Nmap's normal and joke (-oS) output formats.
//
// WHAT CHANGED HERE
// Nothing is attacked, scanned or broken into. The "host" is the island in the video, the ports
// are the project's own numbers (8765 is the local port tools/serve.py really listens on, 1992 is
// the default seed, 80 is the theme's tempo), and every service links to one of the project's
// own files. The only address on the page is 127.0.0.1, the reader's own machine. The scanner
// ("shorescan"), the prompt and every banner are invented for Castaway.
//
// THE BANNER ROTATION is real, in this script: banners[] holds four, mulberry32(seed) picks one
// (seed 1992 by default, like the video's own default run), and --date=04-01 hands the console
// to the cat, which is the dated set. Every banner is original art.
//
// THE OUTPUT is 7-bit ASCII inside <pre>, at most 78 columns, with <b> and <a> only, plus a few
// lines of ordinary Markdown prose. The script refuses a line wider than 78 columns, a character
// outside printable ASCII, a tab or trailing whitespace.
//
// FACTS: counts are those of D:/python/castaway on AS_OF below (activities.toml: 94 activities,
// 81 on four timers and 13 chained; [life]: 4 always-on effects and 22 timed events; 181 files
// in media/audio/audio_catalog.json, quoted as "150+"; the per-tier counts are the medians of
// 200 simulated runs quoted in activities.toml's own header). The frame rate is 24 fps since the
// 2026-10-01 decision recorded in MUSING.md and activities.toml [video]; render_demo.py, the
// frozen reference renderer, still renders at 30, so its row is labelled by its 2-minute demo
// cut instead. Re-check all of this before reusing the header later.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '77-tool-console-banner_opus_5.5';
const OUT = path.resolve(HERE, '..', `${SLUG}.md`);
const MAXW = 78;

const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};
const SEED = Number(arg('seed', '1992'));
const DATE = arg('date', ''); // MM-DD; empty means no dated set

// ---------------------------------------------------------------------------------------------
// 0. Text helpers. A line is a string with inline markup made of control characters, so that
//    no character the art might use ({ } [ ] * _) can be mistaken for markup:
//      \u0001 ... \u0002          bold
//      \u0003 href \u0004 text \u0005   link
//    plain() strips the markup, html() turns it into <b>/<a> with everything else escaped.
// ---------------------------------------------------------------------------------------------
const B = (s) => `\u0001${s}\u0002`;
const L = (text, href) => `\u0003${href}\u0004${text}\u0005`;
const plain = (s) => s.replace(/\u0003[^\u0004]*\u0004/g, '').replace(/[\u0001\u0002\u0005]/g, '');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const html = (s) =>
  esc(s)
    .replace(/\u0001/g, '<b>')
    .replace(/\u0002/g, '</b>')
    .replace(/\u0003([^\u0004]*)\u0004/g, (m, href) => `<a href="${href}">`)
    .replace(/\u0005/g, '</a>');
const len = (s) => plain(s).length;
const pad = (s, n) => s + ' '.repeat(Math.max(0, n - len(s)));
const centre = (s, w) => ' '.repeat(Math.max(0, Math.floor((w - len(s)) / 2))) + s;
const art = (s) => s.replace(/^\r?\n/, '').replace(/\r?\n\s*$/, '').split(/\r?\n/).map((l) => l.replace(/\s+$/, ''));

// Seeded PRNG (mulberry32): the only randomness in the script.
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Two drawings of the same size laid one over the other, for the banners that are drawn rather
// than typed: the silhouette (printed bold) wins wherever it has ink, the scenery (plain) shows
// through everywhere else.
function layered(silhouette, scenery) {
  const S = art(silhouette), P = art(scenery);
  return Array.from({ length: Math.max(S.length, P.length) }, (_, r) => {
    const s = S[r] || '', p = P[r] || '';
    let out = '', on = false;
    for (let c = 0; c < Math.max(s.length, p.length); c++) {
      const b = (s[c] || ' ') !== ' ';
      const x = b ? s[c] : p[c] || ' ';
      if (b && !on) { out += '\u0001'; on = true; }
      if (!b && on && x !== ' ') { out += '\u0002'; on = false; }
      out += x;
    }
    if (on) out += '\u0002';
    return out.replace(/ +(\u0002?)$/, '$1');
  });
}

// ---------------------------------------------------------------------------------------------
// 1. The wordmark: an outline face drawn for this header (six rows, rounded corners made of
//    dots and ticks). Only the six letters the name needs.
// ---------------------------------------------------------------------------------------------
const FACE = {
  C: art(String.raw`
 .----.
/ .---'
| |
| |
\ '---.
 '----'`),
  A: art(String.raw`
 .----.
/ .--. \
| '--' |
| .--. |
| |  | |
'-'  '-'`),
  S: art(String.raw`
 .-----.
/ .----'
\ '----.
 '----. \
.-----' /
'------'`),
  T: art(String.raw`
.------.
'-.  .-'
  |  |
  |  |
  |  |
  '--'`),
  W: art(String.raw`
.-.      .-.
| |      | |
| |  /\  | |
| | /  \ | |
| |/ /\ \| |
'---'  '---'`),
  Y: art(String.raw`
.-.    .-.
\ \    / /
 \ '--' /
  '.  .'
   |  |
   '--'`),
};
function wordmark(word) {
  const glyphs = [...word].map((c) => {
    const g = FACE[c];
    const w = Math.max(...g.map((r) => r.length));
    return g.map((r) => r.padEnd(w));
  });
  return glyphs[0].map((_, r) => glyphs.map((g) => g[r]).join(' ').replace(/\s+$/, ''));
}

// ---------------------------------------------------------------------------------------------
// 2. The banners. Each returns an array of lines. island() is the silhouette genre: the palm,
//    the island and the sun filled solid with one capital letter (C, for the name), with a
//    small lowercase c where a shape only half covers a cell, and ' . _ for the edges.
// ---------------------------------------------------------------------------------------------
function island() {
  // The silhouette, printed bold: a palm whose two upper fronds arch out from a notch over the
  // trunk and droop to their tips, two lower fronds hanging either side of the coconuts (oCCo),
  // a trunk leaning down to the sand, the island, the sun, and her: {o} is a head between two
  // headphone cups, /|\ is the rest of her, nodding (you will have to take the nodding on trust).
  const silhouette = String.raw`
               _.cCCCCCCc._       _.cCCCCCCc._
          _.cCCCCCCCCCCCCCCCc.  .cCCCCCCCCCCCCCCCc._          .cCCCCCc.
       .cCCCCC''       ''CCCCCccCCCCC''       ''CCCCCc.      CCCCCCCCCCC
     .CCCC'          _.ccCCCCCCCCCCcc._          'CCCC.       'CCCCCCC'
    CCC'          .cCCCC'' oCCo ''CCCCc.          'CCC
   CC'          .CCC''      CCC     ''CCC.          'CC
   C'          CCC'         CCC        'CCC          'C
   '          CC'          CCC           'CC          '
              C'          CCC              'C
              '          CCCC        {o}    '
            __.ccccccccccCCCCCCcccccc/|\ccccccc.__
      _.ccCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCcc._
    cCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCc
`;
  // The scenery, plain: sun rays, two gulls, the horizon with a ship on it (minding its own
  // business), the raft, the sea, and a fin that has every right to be there.
  const scenery = String.raw`
                                                  v           \   |   /
                                                       v
                                                         --               --

                                                              /   |   \
                                                                   |\
                                                                   |_\
_______________________________________________________________\_____/_______



                                                           [=|=|=|=|=]
~~~~                                                      ~~~~~~~~~~~~~~~~~~~
   ~~~  ~~~~~~   ~~~~  ~~~~~~~~   ~~~  /| ~~~~~~   ~~~~~  ~~~~~~~   ~~~~  ~~
`;
  return [...layered(silhouette, scenery), '', ...wordmark('CASTAWAY').map(B)];
}

// cowsay's grammar (a bubble of underscores and hyphens, angle-bracket ends, a two-backslash
// tail), spoken by the sea turtle who visits.
function turtlesay(text) {
  const rows = Array.isArray(text) ? text : [text];
  const w = Math.max(...rows.map((r) => r.length));
  const bubble = [` ${'_'.repeat(w + 2)}`];
  if (rows.length === 1) bubble.push(`< ${rows[0]} >`);
  else rows.forEach((r, i) => {
    const [a, b] = i === 0 ? ['/', '\\'] : i === rows.length - 1 ? ['\\', '/'] : ['|', '|'];
    bubble.push(`${a} ${r.padEnd(w)} ${b}`);
  });
  bubble.push(` ${'-'.repeat(w + 2)}`);
  const turtle = art(String.raw`
        \
         \
           ___           _.--''''''''--._
          / o \_______.-'  /\    /\    /\'-.
          \___    ____/   /__\__/__\__/__\  \
              '--'    \    \  /  \  /  \  /   \__
                       \____\/____\/____\/____/  ''-.__
                        \   \                \  \      ''
                         \___\                '--'`);
  return [...bubble, ...turtle];
}

// The fake boxed dialog, with bracketed fields and a bracketed OK button. It is about her
// rarest routine: she stands up, walks away over the water, and comes back twenty seconds
// later with an iced coffee. Never explained.
function logoff() {
  const W = 78;
  const row = (s = '') => `|${pad(s, W - 2)}|`;
  const field = (label, value) => row(`      ${label.padEnd(12)}: [ ${value.padEnd(34)} ]`);
  return [
    `.${'-'.repeat(W - 2)}.`,
    row(` Log off the island${' '.repeat(W - 2 - 19 - 5)}[x] `),
    `|${'-'.repeat(W - 2)}|`,
    row(),
    row('   You can leave any time. You do not need a boat.'),
    row(),
    field('Leaving by', 'walking over the water'),
    field('Back in', 'about twenty seconds'),
    field('Bringing', 'one iced coffee'),
    field('Explanation', ''),
    row(),
    row(`                    ${B('[  OK  ]')}        [ After this song ]`),
    `'${'-'.repeat(W - 2)}'`,
  ];
}

// The film-parody genre: a trailer card for the coconut that fell on a hermit crab and then
// walked off with the crab wearing it.
function coconut() {
  const pic = art(String.raw`
                             _.-''''''''''-._
                          .-'  .   .    .    '-.
                         /   .   ()    ()  .    \
                        ;  .    .   ()   .    .  ;
                         \___.______.______.____/
                (\/)         |  o        o  |          (\/)
                  \ \________|_____\__/_____|_________/ /
                         /  /  /  /      \  \  \  \
                        /__/  /__/        \__\  \__\
`);
  return [
    centre('I N   A   W O R L D   W H E R E   C O C O N U T S   F A L L', 78),
    '',
    ...pic,
    '',
    centre(`${B('ONE COCONUT')}  . . .  ${B('GOT LEGS')}`, 78),
    centre('rated G, for gentle. in cinemas never.', 78),
  ];
}

// The dated set: on 1 April the cat gets the console. Grey tabby, white chest; it arrives on a
// crate, climbs the palm, naps, and one day floats away again.
function cat() {
  return art(String.raw`
         /\_/\
        ( -.- )  z z z
         )   (            the cat has the console today.
    .---(_)-(_)----.      it arrived on a crate. it will leave on a crate.
    |  THIS WAY UP |      it has not said when.
    |______________|
  ~~~~~~~~~~~~~~~~~~~~~~`);
}

const BANNERS = [
  { file: 'turtlesay.txt', lines: () => turtlesay('I came all this way for a nap. Budge up.') },
  { file: 'logoff.txt', lines: logoff },
  { file: 'coconut.txt', lines: coconut },
  { file: 'island.txt', lines: island },
];
const DATED = { '04-01': { file: 'cat.txt', lines: cat } };
const rng = mulberry32(SEED);
const pickIndex = Math.floor(rng() * BANNERS.length);
const picked = DATED[DATE] || BANNERS[pickIndex];

// ---------------------------------------------------------------------------------------------
// 3. The stats block, the run lines and the prompt.
// ---------------------------------------------------------------------------------------------
function statsBlock(first, rest) {
  const inner = Math.max(len(first), ...rest.map(len));
  return [
    `       =[ ${pad(first, inner)} ]`,
    ...rest.map((r) => `+ -- --=[ ${pad(r, inner)} ]`),
  ];
}
// The counts that drift. Re-measure them (read-only) before regenerating:
//   cd D:/python/castaway && python -B -c "import tomllib; d=tomllib.load(open('activities.toml','rb'));
//     from collections import Counter; print(Counter(a['tier'] for a in d['activities'].values()))"
const AS_OF = '2026-10-02';
const ACT = { timed: 81, chained: 13 };
ACT.total = ACT.timed + ACT.chained;
const STATS = statsBlock(`${B('castaway')} (working title) - in development - ${AS_OF}`, [
  `${ACT.total} activities - ${ACT.timed} on four timers - ${ACT.chained} chained follow-ups`,
  '10 h: ~155 regular - ~30 occasional - ~13 rare - ~2 super rare',
  '26 scene-life entries - 4 always on - 22 timed events',
  '150+ sounds - all synthesized from code - 0 samples',
  '1 island - 1 palm - 1 raft - 1 bar of signal (top of the palm)',
]);
const PROMPT = 'castaway(idle) > ';
const SERVE = L('tools/serve.py', 'tools/serve.py');
const LOCAL = L('http://127.0.0.1:8765/', 'http://127.0.0.1:8765/');

const top = [
  ...picked.lines(),
  '',
  ...STATS,
  '',
  `[*] Start the island:  python ${SERVE}`,
  `[*] Then open:         ${LOCAL}  (live preview, MP4 export)`,
  `[*] Banner ${DATED[DATE] ? 'of the day' : `${pickIndex + 1} of ${BANNERS.length}`}, drawn with seed ${SEED}. The cat has booked 1 April.`,
  '',
  `${PROMPT}_`,
];

// ---------------------------------------------------------------------------------------------
// 4. The scan report: the island as the host, the project's numbers as ports, its files as the
//    services, and the details hanging in the pipe gutter.
// ---------------------------------------------------------------------------------------------
// Listed in port order, as a scanner would. Every port number is one of the project's own:
// 0 nights, 1 bar of signal, 80 bpm, the activity count, the 120-second demo cut, the default
// seed, the year in the log, and the port tools/serve.py really listens on.
const PORTS = [
  { port: '0/night', state: 'closed', service: ['night', null], version: 'always daytime (house rule)' },
  { port: '1/bar', state: 'filtered', service: ['signal', null], version: 'only at the very top of the palm' },
  { port: '80/bpm', state: 'open', service: ['tools/make_audio.py', 'tools/make_audio.py'], version: 'theme in F major, ii-V-I-vi',
    gutter: [
      'theme:  seamless 60 s loop, 20 bars of exactly 3 s',
      'band:   electric piano, kalimba lead, soft drums, vinyl crackle',
      'sea:    ocean ambience, also a seamless 60 s loop',
      'levels: -14 LUFS, true peak <= -1 dBTP; master + per routine',
      'heard:  not yet. nobody has listened to any of it.',
    ] },
  { port: `${ACT.total}/toml`, state: 'open', service: ['activities.toml', 'activities.toml'], version: 'every routine and its timer' },
  { port: '120/demo', state: 'open', service: ['tools/render_demo.py', 'tools/render_demo.py'], version: 'the 2-min demo cut; --dev reel' },
  { port: '1992/seed', state: 'open', service: ['tools/schedule.py', 'tools/schedule.py'], version: 'validates, simulates 10 hours',
    gutter: [
      'regular     every 2-5 min    ~155 a run   coconut, fishing, a jog',
      'occasional  every 12-25 min   ~30 a run   turtle, bottle, a crab',
      'rare        every 30-60 min   ~13 a run   drone, shark, the cat',
      'super rare  every 3-6 hours    ~2 a run   she strolls off over the water',
      'every start snaps to the next bar of the music (every 3 s)',
    ] },
  { port: '2026/log', state: 'open', service: ['MUSING.md', 'MUSING.md'], version: 'what holds now, and why' },
  { port: '8765/http', state: 'open', service: ['tools/serve.py', 'tools/serve.py'], version: 'web renderer, preview + export',
    gutter: [
      `page:   ${L('web/index.html', 'web/index.html')}, plain ES modules, no build step, no npm`,
      'export: frame-exact H.264 via WebCodecs, 68-78 frames/s at 1080p (Chrome)',
      'mux:    the server mixes the sound and joins the two into an MP4',
    ] },
];
const PORT_NUMS = new Set(PORTS.map((p) => p.port.split('/')[0]));
if (PORT_NUMS.size !== PORTS.length) throw new Error('two rows share a port number');
const NOT_SHOWN = 65536 - PORTS.length; // ports 0 to 65535
function scanReport() {
  const C1 = 12, C2 = 10, C3 = 22;
  const out = [
    `${PROMPT}scan the-island --all-day`,
    '[*] shorescan 0.1: one island, all ports, ten hours. Get comfortable.',
    '',
    `shorescan report for ${B('the-island')} (one palm, one raft, no harbour)`,
    'Island is up (0.75s latency: one nod per beat at 80 bpm).',
    `Not shown: ${NOT_SHOWN} closed ports (desert island: nothing docks here)`,
    '',
    `${'PORT'.padEnd(C1)}${'STATE'.padEnd(C2)}${'SERVICE'.padEnd(C3)}VERSION`,
  ];
  for (const p of PORTS) {
    const [name, href] = p.service;
    const svc = href ? L(name, href) : name;
    out.push(`${p.port.padEnd(C1)}${p.state.padEnd(C2)}${pad(svc, C3)}${p.version}`);
    (p.gutter || []).forEach((g, i, all) => out.push(`${i === all.length - 1 ? '|_' : '| '}${g}`));
  }
  out.push(
    '',
    'Service Info: Palm: 1 (tall); Raft: 1; Cat: visiting, sometimes; Night: never',
    '',
    `shorescan done: 1 island (1 castaway up) watched in ${(10 * 3600).toFixed(2)} seconds`,
  );
  return out;
}

// ---------------------------------------------------------------------------------------------
// 5. Below the fold: the gags listing, the other banners, joke mode, and the small print.
// ---------------------------------------------------------------------------------------------
const GAGS = [
  ['Regular', 'every 2 to 5 minutes, about 155 a run', [
    ['coconut_sip', 'excellent', 'sips a coconut in the shade, eyes closed'],
    ['fishing_quiet', 'low', 'nibbles, nothing. the usual'],
    ['jog_lap', 'normal', 'the length of the island and back'],
    ['sandcastle', 'good', 'it stays put until the tide comes for it'],
  ]],
  ['Occasional', 'every 12 to 25 minutes, about 30 a run', [
    ['ship_passes_unseen', 'excellent', 'she is busy. she never sees it'],
    ['message_in_bottle', 'low', 'thrown, and straight back to her feet'],
    ['turtle_visit', 'great', 'a sea turtle crawls up; they both doze'],
    ['coconut_crab', 'excellent', 'it lands on a hermit crab, then walks off'],
  ]],
  ['Rare', 'every 30 to 60 minutes, about 13 a run', [
    ['delivery_drone', 'great', 'the parcel: another pair of headphones'],
    ['signal_hunt', 'low', 'one bar, at the very top of the palm'],
    ['cat_visit', 'excellent', 'arrives on a crate, climbs the palm, naps'],
    ['shark_nod', 'great', 'surfaces in headphones; they nod; it goes'],
    ['tour_boat_selfies', 'average', 'she is in all the selfies. no lift'],
    ['efoil_bro', 'average', 'a shaka from a hydrofoil, and he is gone'],
    ['fire_by_friction', 'low', 'a flame, at last. then a wave'],
    ['hammock', 'manual', 'no second tree, so the raft will do'],
    ['lookout', 'low', 'the palm bends till the top is the bottom'],
    ['spear_fishing', 'manual', 'a miss; a gull drops a fish, out of pity'],
  ]],
  ['Super rare', 'every 3 to 6 hours, at most 3 a run', [
    ['leave_any_time', 'manual', 'over the water, back with an iced coffee'],
    ['rescue_almost', 'low', 'she waves; it honks back; it sails on'],
    ['cat_rides_turtle', 'excellent', 'the cat naps on the turtle\'s shell'],
  ]],
  ['Chained', 'never on a timer: only ever "then"', [
    ['tide_takes_sandcastle', 'normal', 'a bigger wave. no sandcastle'],
    ['bottle_reply', 'great', 'hours later, a different bottle. a reply'],
    ['kumara_leafs', 'good', 'the kumara she planted has gone leafy'],
  ]],
];
function showGags() {
  const out = [
    `${PROMPT}show gags`,
    '',
    'Gags',
    '====',
    '',
    `   ${'Name'.padEnd(23)}${'Rank'.padEnd(11)}Description`,
    `   ${'----'.padEnd(23)}${'----'.padEnd(11)}-----------`,
  ];
  for (const [tier, every, rows] of GAGS) {
    out.push(` ${B(tier)}: ${every}`);
    for (const [id, rank, what] of rows) out.push(`   ${id.padEnd(23)}${rank.padEnd(11)}${what}`);
    out.push('');
  }
  out.push(`[*] A sample, not the lot: ${L('activities.toml', 'activities.toml')} lists more than 90.`, '', `${PROMPT}_`);
  return out;
}

function otherBanners() {
  const out = [];
  const rest = [...BANNERS.filter((b) => b !== picked), DATED['04-01']].filter((b) => b !== picked);
  for (const b of rest) {
    out.push(`${PROMPT}banner${b === DATED['04-01'] ? '            (1 April only)' : ''}`, '', ...b.lines(), '');
  }
  out.push(`${PROMPT}_`);
  return out;
}

// Joke mode: the report again, with leetspeak swaps and random capitals from the same PRNG.
function leet(s, r) {
  const swap = { a: '4', e: '3', o: '0', s: '$', t: '7', i: '1', l: '1' };
  return [...s].map((c) => {
    const lc = c.toLowerCase();
    const x = r();
    if (swap[lc] && x < 0.55) return lc === 's' && x < 0.2 ? 'z' : swap[lc];
    if (/[a-z]/i.test(c) && x > 0.72) return c === lc ? c.toUpperCase() : lc;
    return c;
  }).join('');
}
function joke() {
  const r = mulberry32(SEED + 1);
  const row = (port) => {
    const p = PORTS.find((x) => x.port === port);
    return `${p.port.padEnd(11)}${p.state.padEnd(10)}${p.service[0]}`;
  };
  const src = [
    'shorescan report for the-island (one palm, one raft, no harbour)',
    'Island is up (0.75s latency: one nod per beat)',
    `Not shown: ${NOT_SHOWN} closed ports`,
    '',
    `${'PORT'.padEnd(11)}${'STATE'.padEnd(10)}SERVICE`,
    row('0/night'),
    row('80/bpm'),
    row('8765/http'),
    '',
    `shorescan done: 1 island (1 castaway up) watched in ${(10 * 3600).toFixed(2)} seconds`,
  ];
  return [`${PROMPT}set OUTPUT l33t`, 'OUTPUT => l33t', `${PROMPT}scan the-island --all-day`, '', ...src.map((l) => leet(l, r))];
}

// ---------------------------------------------------------------------------------------------
// 6. Lint, assemble, write.
// ---------------------------------------------------------------------------------------------
function lint(where, lines) {
  lines.forEach((l, i) => {
    const p = plain(l);
    if (p.length > MAXW) throw new Error(`${where}:${i + 1} is ${p.length} columns: ${p}`);
    if (/[^\x20-\x7e]/.test(p)) throw new Error(`${where}:${i + 1} has a character outside printable ASCII: ${p}`);
    if (/\s$/.test(p)) throw new Error(`${where}:${i + 1} has trailing whitespace`);
  });
  return lines;
}
const pre = (where, lines) => ['<pre>', ...lint(where, lines).map(html), '</pre>'].join('\n');

const md = [
  `<!-- Header ${SLUG} for Castaway. Generated by src/${SLUG}.mjs: edit that, not this. -->`,
  '',
  pre('top', top),
  '',
  '**Castaway** (working title) is a ten-hour lo-fi video for YouTube in which almost nothing happens, on purpose. A young woman, a tiny island, one tall palm, a raft and a great deal of time. She idles, nodding to the music on her headphones, and every few minutes, exactly on the next bar, something happens: her message in a bottle washes straight back, a sea turtle crawls up for a nap, a drone delivers more headphones. An unofficial remake inspired by the small-island routines and visual comedy of the 1992 screensaver Johnny Castaway. Sunny, hand-painted, always daytime, 1080p at 24 fps, and every sound is synthesized from code. In development: no video has been published yet.',
  '',
  pre('scan', scanReport()),
  '',
  '<details>',
  '<summary><b>show gags</b>: a sample of the routines, by timer, each with a rank it did not ask for</summary>',
  '',
  pre('gags', showGags()),
  '',
  '</details>',
  '',
  '<details>',
  '<summary><b>banner</b>: the rest of the rotation (the generator draws one by seed; the cat has booked 1 April)</summary>',
  '',
  pre('banners', otherBanners()),
  '',
  '</details>',
  '',
  '<details>',
  '<summary><b>set OUTPUT l33t</b>: the same report in joke mode, for nobody in particular</summary>',
  '',
  pre('joke', joke()),
  '',
  '</details>',
  '',
  '<details>',
  '<summary><b>about this console</b>: what it borrows, and what it is not</summary>',
  '',
  'This header borrows the start-up habits of security-tool consoles: a banner drawn at random, a block of counts with every closing bracket in one column, and a port-scan report with script output hanging in a gutter of pipes. Nothing here scans anything. The host is the island in the video, the ports are the project\'s own numbers, every service is one of its own files, and the only address on the page is `127.0.0.1`, your own machine, where `tools/serve.py` listens. The scanner, the prompt and the banners were made up for Castaway.',
  '',
  'The banner rotation is real, but it lives in the script that writes this header, not in Castaway: a seeded generator picks one of four banners (seed 1992, like the video\'s default run, draws the island), and asking it for 1 April hands the console to the cat.',
  '',
  `Castaway is an unofficial remake inspired by the 1992 screensaver Johnny Castaway, which belongs to its owners. Counts are as of ${AS_OF}; the schedule grows every few hours, so trust \`python tools/schedule.py\` over this page.`,
  '',
  '</details>',
  '',
].join('\n');

fs.writeFileSync(OUT, md);
console.log(`wrote ${path.relative(process.cwd(), OUT)} (banner: ${picked.file}, seed ${SEED})`);
