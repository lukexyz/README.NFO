#!/usr/bin/env node
// CASTAWAY, logged into as a MUD: the README header as one telnet session transcript.
//
// Style: "MUD session transcript" (catalogue entry hack-09), after the text worlds of 1978-1991
// (MUD1, AberMUD, TinyMUD, LPMud, DikuMUD) and their still-distributed descendants. The grammar
// is the shared one of that whole family: a greeting with the title letter-spaced and centred,
// a year line, two credit lines naming the code it derives from, a name question, a Y/N
// confirmation, a password, the message of the day and its PRESS RETURN pause; then a room
// block (title, three-space-indented prose, one line per thing present, a bracketed exits
// line) and an H / M / V prompt with a short typed command after it.
//
// Every word here is original: no MUD's greeting art, room text, prompts or name is used. The
// engine named in the credits (AtollMUD) and its authors are invented, and the wizlist says so.
// The island picture in the greeting is drawn for this file.
//
// What lands where:
//   main <pre>  greeting, login, message of the day (the pitch), the first room, the sign
//               (how to run it), and a prompt with the cursor waiting.
//   folds       each <summary> is the next command typed at the prompt: exits (the repo map,
//               linked), score (the schedule), listen (the sound), help (how to run it),
//               who (the cast and credits), wait (one possible ten hours, abridged), quit.
//   prompt      H = hours of video left, M = the music's beats a minute, V = ships she has
//               spotted. H counts down through the long wait; V stays at 0 until the very end.
//               (Tour boats and hydrofoils are not ships, so V ignores them.)
//
// Regenerate:  node examples/castaway/src/80-mud-transcript_opus_5.5.mjs
// Writes ../80-mud-transcript_opus_5.5.md (text only; this style needs no image).
//
// Plain Node, no dependencies, deterministic. Builds every <pre> line from segments (plain,
// bold, link), so visible widths are measured without markup, and refuses to write if a line
// is wider than 78 columns, has trailing spaces or tabs, or is not 7-bit ASCII.
//
// Facts used, checked read-only against D:/python/castaway on 2026-10-02:
//   activities.toml: 94 activities that day (written as "more than 90"); tiers regular 2-5 min,
//   occasional 12-25 min, rare 30-60 min, super rare 3-6 h (max 3 a run); typical 10-hour run
//   (the file's own header, median of 200 simulated runs) about 155 / 30 / 13 / 2 plus about
//   20 chained follow-ups; she is busy about a third of the time; run 10:00:00, seed 1992,
//   starts snapped to the next 3 s bar. ship_passes_unseen: occasional tier, prefer_during her
//   busy routines, prefer_wait 0:10:00 ("wait up to this long for her to be busy").
//   Gag wording follows each activity's own `about` line and beats: coconut_sip, coconut_crab,
//   message_in_bottle (bottle_green) + bottle_reply, delivery_drone (the drone leaves before
//   she opens it), cat_visit (naps in the palm crown), shark_nod (it sinks), tour_boat_selfies
//   (she waves, hopeful; selfies with their backs to her), efoil_bro, sandcastle +
//   tide_takes_sandcastle, leave_any_time (off to the right, twenty seconds empty),
//   rescue_almost (waves, horn, sails on, she shrugs), spear_fishing (the gull drops a fish
//   out of pity), signal_hunt (one bar, top of the palm).
//   The ten hours in the `wait` fold are one possible run, not seed 1992's (which drifts as
//   activities are added); it says so in its summary.
//   Scene life: shore waves and cloud shadows built; birds, planes, whale pods, dolphins,
//   sailboats, sandpipers, a gecko and a rain shower planned.
//   Sound: tools/make_audio.py, code only, no samples, loops or recordings; more than 150 files
//   (181 in media/audio/audio_catalog.json that day); theme 60 s loop, 80 BPM, F major
//   ii-V-I-vi, 20 bars of 3 s, electric piano, kalimba, soft drums, vinyl crackle; ocean 60 s
//   loop; -14 LUFS, true peak <= -1 dBTP; levels in master and per routine. Not yet heard.
//   Renderer: python tools/serve.py, http://127.0.0.1:8765/, plain ES modules, no build step,
//   no npm; WebCodecs H.264 measured at 68-78 frames a second at 1080p in Chrome; the server
//   mixes the sound and joins both into an MP4. No frame rate is stated: activities.toml's
//   [video] says 24 fps since 2026-10-01, older notes say 30. tools/schedule.py validates and
//   simulates; tools/render_demo.py --dev renders a dev reel with a HUD.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '80-mud-transcript_opus_5.5';
const OUT_MD = path.join(HERE, '..', `${SLUG}.md`);

const W = 78;                                  // the widest a transcript line may be

// ---------------------------------------------------------------------------------------------
// Segments: a line is a string or an array of strings and {b} / {a, href} objects.
// ---------------------------------------------------------------------------------------------
const b = (text) => ({ b: text });
const a = (href, text = href) => ({ a: text, href });
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const segs = (line) => (Array.isArray(line) ? line : [line]);
const plain = (line) => segs(line).map((s) => (typeof s === 'string' ? s : s.b ?? s.a)).join('');
const width = (line) => plain(line).length;
function html(line) {
  return segs(line).map((s) => {
    if (typeof s === 'string') return esc(s);
    if (s.b !== undefined) return `<b>${esc(s.b)}</b>`;
    return `<a href="${s.href}">${esc(s.a)}</a>`;
  }).join('');
}
const pad = (n) => ' '.repeat(Math.max(0, n));
const center = (line, w = W) => [pad(Math.floor((w - width(line)) / 2)), ...segs(line)];
const spaced = (s) => s.split('').join('  ');
// Hard-wrap prose to `w` columns; the first line gets `first` spaces (rooms indent by three).
function wrap(text, w = 76, first = 0, rest = 0) {
  const out = [];
  let line = pad(first);
  let lead = first;
  for (const word of text.split(/\s+/)) {
    if (line.length > lead && line.length + 1 + word.length > w) {
      out.push(line);
      line = pad(rest) + word;
      lead = rest;
    } else {
      line += (line.length > lead ? ' ' : '') + word;
    }
  }
  out.push(line);
  return out;
}

// The prompt: H hours left, M beats a minute, V ships she has spotted.
const prompt = (h, v = 0, cmd = '') => (cmd ? [`${h}H 80M ${v}V > `, b(cmd)] : [`${h}H 80M ${v}V > _`]);

// ---------------------------------------------------------------------------------------------
// The greeting picture: sun, gulls, the palm, her (headphones, nodding), a raft, and a ship on
// the horizon that nobody on the island will look at. Drawn for this file, 7-bit ASCII.
// ---------------------------------------------------------------------------------------------
// One String.raw block, one row per line (no backticks in it: a template can't hold one).
const ISLAND = String.raw`
                       _.---._      _.---._                    \  :  /
        v           .-'  _.._ '-.  .-' _.._  '-.             '. .---. .'
            v     .'  .-'    '-.\\//.-'    '-.  '.          -- (     ) --
                 /  .'     _.--'(@@)'--._     '.  \         .' '---' '.
                /  /    .-'    //||\\    '-.    \  \           /  :  \
                ' /   .'      // || \\      '.   \ '
        __|__     '  '       '   ||   '       '  '
 ~  ~  ~\___/~  ~  ~  ~  ~  ~  ~  \\  ~  ~  ~  ~  ~  ~  ~  ~  ~  ~  ~  ~  ~
                                   \\         d(-_-)b
                                    ||          /|\
                      __..--''''''''||''''''''''/ \''''--..__
                 _.-''                                       ''-._  [oooooo]
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
`.split('\n').slice(1, -1);

// ---------------------------------------------------------------------------------------------
// The main screen
// ---------------------------------------------------------------------------------------------
const EXITS = [
  ['n', 'activities.toml'],
  ['e', 'tools/make_audio.py'],
  ['s', 'tools/serve.py'],
  ['w', 'MUSING.md'],
  ['u', 'web/index.html'],
  ['d', 'tools/render_demo.py'],
];
const exitsLine = ['[ Exits: ', ...EXITS.flatMap(([d, href], i) => [a(href, d), i < EXITS.length - 1 ? ' ' : '']), ' ]'];

const main = [
  ...ISLAND,
  '',
  center(b(spaced('CASTAWAY'))),
  center(spaced('2026')),
  '',
  center('Based on AtollMUD 0.80, by the Coconut Standards Board'),
  center('An unofficial homage to a 1992 desert-island screensaver'),
  '',
  ['What shall the tide call you? ', b('visitor')],
  ['Did the gulls hear that right, Visitor (Y/N)? ', b('y')],
  'New face. Pick a password the gulls cannot pronounce:',
  '',
  center('~  MESSAGE OF THE TIDE  ~'),
  ...wrap('Welcome to CASTAWAY (working title): a ten-hour lo-fi video for YouTube where '
    + 'almost nothing happens, on purpose. One young woman, one tiny island, one palm, one '
    + 'raft, and more than 90 things that happen now and then, on the beat. Every sound is '
    + 'synthesized from code. Mind the coconuts.', 77, 2, 2),
  '',
  '*** PRESS RETURN:',
  '',
  b('The Island, All of It'),
  ...wrap('A scrap of warm sand barely big enough to pace on, with the sea all the way round, '
    + 'which you suspect is the point. Mostly, nothing happens here. Every so often, something '
    + 'does. It is always daytime. The management insists.', 77, 3, 0),
  'A young woman in cream headphones is standing here, nodding to the beat.',
  'A tall, slender palm grows here. At the very top: one bar of signal.',
  'A small raft is moored here, going nowhere at 80 beats a minute.',
  'A green bottle lies at the waterline. It keeps coming back.',
  'A hand-painted sign has been pushed into the sand.',
  exitsLine,
  '',
  prompt(10, 0, 'read sign'),
  ['The sign says:  ', b('python '), a('tools/serve.py'), '   then open  ', a('http://127.0.0.1:8765/')],
  '   (a live preview in your browser, and an export to a YouTube-ready MP4)',
  '',
  prompt(10, 0),
];

// ---------------------------------------------------------------------------------------------
// The folds: each one is the next command typed at the prompt
// ---------------------------------------------------------------------------------------------
const folds = [];
const fold = (cmd, note, lines, after = '') => folds.push({ cmd, note, lines, after });

fold('exits', 'where everything is', [
  prompt(10, 0, 'exits'),
  'Obvious exits:',
  ...[
    ['north', 'The Noticeboard', 'activities.toml', 'every activity and its timer'],
    ['east', 'The Sound Shack', 'tools/make_audio.py', 'every sound, made from code'],
    ['south', 'The Jetty', 'tools/serve.py', 'where the island starts'],
    ['west', 'The Thinking Rock', 'MUSING.md', 'decisions, lessons, notes'],
    ['up', 'The Lookout', 'web/index.html', 'the renderer, live preview'],
    ['down', 'Under the Sand', 'tools/render_demo.py', 'the older renderer, kept'],
  ].map(([dir, room, file, what]) => [`${dir.padEnd(5)} - ${room.padEnd(19)}`, a(file), `${pad(22 - file.length)}${what}`]),
  '',
  'Every exit is also the sea. It is that kind of island.',
]);

fold('score', 'the schedule, as a character sheet', [
  prompt(10, 0, 'score'),
  'You are Visitor, the Watcher of Very Small Islands.',
  'You have 10(10) hours left, 80(80) beats a minute and 0(0) ships spotted.',
  'Ships only: tour boats and hydrofoils do not count, however hard she waves.',
  '',
  ...wrap('This session runs 10:00:00 on seed 1992. Everything that happens starts on the next '
    + 'bar of the music, every 3 seconds, so the gags land on the beat.', 76),
  '',
  b('  timer        comes round every     in ten hours   for example'),
  '  regular      2 to 5 minutes        about 155      coconuts, jogs, fishing',
  '  occasional   12 to 25 minutes      about 30       a bottle, a turtle, a ship',
  '  rare         30 to 60 minutes      about 13       a drone, a cat, a shark',
  '  super rare   3 to 6 hours, max 3   about 2        she could leave any time',
  '  chained      after something else  about 20       the tide takes a castle',
  '',
  ['More than 90 activities in all, in ', a('activities.toml'), '. Counts are the median'],
  ['of 200 simulated runs; ', b('python '), a('tools/schedule.py'), ' checks the file and runs one.'],
  'Lanes let things overlap, so a ship can sail past while she is busy. The',
  'ship will even wait up to ten minutes for her to get busy first.',
  'She is busy about a third of the time and idles the rest.',
  '',
  'You are hungry. There is a coconut. You are no longer hungry.',
]);

fold('listen', 'the sound, every bit of it from code', [
  prompt(10, 0, 'listen'),
  'You listen carefully.',
  ...wrap('An electric piano, a kalimba, soft drums and vinyl crackle, going round a seamless '
    + '60-second loop at 80 BPM in F major: ii-V-I-vi, twenty bars of exactly three seconds. '
    + 'Under it, the ocean, on a seamless 60-second loop of its own.', 76),
  '',
  ['Every sound on this island is synthesized from code by ', a('tools/make_audio.py'), ':'],
  'no samples, no borrowed loops, no recordings, so no third-party licence',
  'applies. More than 150 sound files so far. The mix sits at -14 LUFS with',
  'true peak at or below -1 dBTP, and every level can be set in master and',
  'per routine.',
  '',
  'Nobody has heard any of it yet. You cannot either: this is a text file.',
]);

fold('help start', 'how to run it', [
  prompt(10, 0, 'help start'),
  b('START  ISLAND  SERVE'),
  '',
  ['Usage:  ', b('python '), a('tools/serve.py')],
  ['        then open ', a('http://127.0.0.1:8765/')],
  '',
  ...wrap('The island is a web page with a live preview and an export to a YouTube-ready MP4, '
    + '16:9 at 1080p. Plain ES modules, no build step, no npm packages. It encodes frame-exact '
    + 'video in the browser (WebCodecs H.264, measured at 68 to 78 frames a second at 1080p in '
    + 'Chrome); the server mixes in the sound and joins the two into one MP4. Hard cuts and '
    + 'stepped movement are the defaults, much like this transcript.', 76),
  '',
  'Also on the island:',
  ['  ', b('python '), a('tools/schedule.py'), '          check the schedule, simulate ten hours'],
  ['  ', b('python '), a('tools/render_demo.py'), ' --dev  a dev reel of every activity, with a HUD'],
  ['  ', b('python '), a('tools/make_audio.py'), '        make every sound again, from code'],
  '',
  'See also: SCORE, LISTEN, WAIT',
], '```sh\npython tools/serve.py\n# then open http://127.0.0.1:8765/\n```');

fold('who', 'who is on the island, and who is to blame', [
  prompt(10, 0, 'who'),
  b('On the island right now'),
  '[ idle ] She ................ nodding to the beat; cream headphones, bare feet',
  '[ afk  ] Visitor ............ reading a README (that is you)',
  '',
  b('Drops in now and then'),
  '[ doze ] the sea turtle ..... visiting; no further business',
  '[ nap  ] the stray cat ...... grey tabby, white chest; arrives by crate',
  '[ nod  ] the shark .......... also wearing headphones',
  '[ hide ] the hermit crab .... lives in a coconut now',
  '[ snap ] the tour boat ...... selfies, yes; lifts, no',
  '[ wave ] the hydrofoil bro .. one shaka, then gone',
  '',
  '8 characters displayed. Nobody is in a hurry.',
  '',
  prompt(10, 0, 'wizlist'),
  center(b('The Powers That Be on This Island'), 76),
  ['  Implementor ...... whoever keeps writing ', a('MUSING.md')],
  '  Greater gods ..... the Tide (takes sandcastles), the Seed (1992)',
  '  Lesser god ....... the Gull (drops her a fish, out of pity)',
  '  Engine ........... AtollMUD 0.80, which does not exist. The island',
  '                     runs on plain ES modules and a little Python.',
  '  Inspired by ...... Johnny Castaway, the 1992 desert-island screensaver.',
  '                     This is an unofficial remake, with no affiliation.',
]);

fold('wait', 'one possible ten hours, abridged', [
  prompt(10, 0, 'wait'),
  'Time passes. She nods to the beat.',
  '',
  prompt(10, 0, 'look sea'),
  ...wrap('The sea goes all the way round. Small waves run up the sand and back, and cloud shadows '
    + 'drift slowly across the water. In time there will also be birds, planes with vapour trails, '
    + 'whale pods, dolphins, sailboats, sandpipers, a gecko and a rain shower. They are on their '
    + 'way. Nobody here minds waiting.', 76),
  '',
  prompt(10, 0, 'wait'),
  'She sips a coconut in the shade, eyes closed, completely content.',
  'A ship, which has been waiting for exactly this, sails along the horizon.',
  '',
  prompt(9, 0, 'look ship'),
  'You do not see that here. It has gone.',
  '',
  prompt(9, 0, 'wait'),
  'She writes a note, bottles it, and throws it into the sea.',
  'A green bottle washes up at her feet. It is the same bottle.',
  '',
  prompt(8, 0, 'wait'),
  'She builds a sandcastle.',
  'A bigger wave arrives. The sandcastle leaves with it.',
  '',
  prompt(8, 0, 'wait'),
  'She sits against the palm with a book. A hermit crab shuffles past.',
  'A coconut falls from the palm, squarely onto the hermit crab.',
  'She peeks over her book, winces, and hides behind it.',
  'A coconut leaves west, slowly, on legs.',
  '',
  prompt(7, 0, 'wait'),
  'A delivery drone arrives from above, lowers a parcel, and leaves up.',
  'She opens the parcel. It contains a pair of headphones.',
  'She is already wearing a pair of headphones.',
  '',
  prompt(6, 0, 'wait'),
  'A stray cat drifts in on a crate.',
  'The stray cat climbs the palm and falls asleep at the top,',
  'right next to the one bar of signal. It does not use it.',
  '',
  prompt(5, 0, 'wait'),
  'A fin circles the island.',
  'A shark surfaces, wearing headphones, nodding to the same beat.',
  'She nods. The shark nods. The shark leaves down.',
  '',
  prompt(4, 0, 'wait'),
  'A small tour boat pulls up. She waves, hopefully.',
  'Everyone turns round and takes a selfie with her in the background.',
  'Nobody offers a lift. The tour boat leaves south.',
  '',
  prompt(4, 0, 'wait'),
  'A bro on an electric hydrofoil carves in close. She runs over to wave.',
  'He waves back with a big smile and a shaka, and carves away east.',
  'She stands there with her hands in the air. Double face palm.',
  '',
  prompt(3, 0, 'wait'),
  'A different bottle washes up. It is a reply. She smiles.',
  '',
  prompt(2, 0, 'wait'),
  'She stands, stretches, and walks out over the water.',
  'She leaves east.',
  'The island is empty for twenty seconds.',
  'She arrives from the east, carrying an iced coffee, and sits back down.',
  '',
  prompt(2, 0, 'ask her about that'),
  'She nods to the beat.',
  '',
  prompt(1, 0, 'wait'),
  'She spots a ship, at last, and waves like mad.',
  'The ship sounds its horn...',
  '...and sails on. She shrugs, and puts the music back on.',
  '',
  prompt(0, 1, 'wait'),
  'She jogs a lap of the island.',
  'Behind her, another ship sails past.',
  '',
  prompt(0, 1, 'wait'),
  'The video ends. Somebody, somewhere, presses replay.',
  '',
  prompt(10, 0),
]);

fold('quit', 'leaving', [
  prompt(10, 0, 'quit'),
  'You cannot leave now: she is in the middle of a coconut.',
  '',
  prompt(10, 0, 'quit'),
  'She could leave any time, you know. She walked out over the water once',
  'and came back with an iced coffee. She is still here. So are you.',
  'The tide will keep your place. Goodbye, Visitor.',
  '',
  'Connection closed by foreign host.',
]);

// ---------------------------------------------------------------------------------------------
// Lint and write
// ---------------------------------------------------------------------------------------------
const problems = [];
function check(lines, where) {
  lines.forEach((line, i) => {
    const p = plain(line);
    if (p.length > W) problems.push(`${where}:${i + 1} is ${p.length} columns: ${p}`);
    if (/[ \t]$/.test(p) || /\t/.test(p)) problems.push(`${where}:${i + 1} has a tab or trailing space`);
    if (/[^\x20-\x7E]/.test(p)) problems.push(`${where}:${i + 1} is not 7-bit ASCII: ${p}`);
  });
}
const pre = (lines) => `<pre>\n${lines.map(html).join('\n')}\n</pre>`;
check(main, 'main');
folds.forEach((f) => check(f.lines, f.cmd));
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}

const out = [
  `<!-- Header ${SLUG} for Castaway. Generated by src/${SLUG}.mjs: edit that, not this. -->`,
  '',
  pre(main),
  '',
  ...folds.flatMap((f) => [
    '<details>',
    `<summary><code>${esc(`10H 80M 0V > ${f.cmd}`)}</code> &nbsp;${esc(f.note)}</summary>`,
    '',
    pre(f.lines),
    ...(f.after ? ['', f.after] : []),
    '',
    '</details>',
    '',
  ]),
];
fs.writeFileSync(OUT_MD, out.join('\n').replace(/\n+$/, '\n'));
console.log(`wrote ${path.relative(process.cwd(), OUT_MD)}`);
