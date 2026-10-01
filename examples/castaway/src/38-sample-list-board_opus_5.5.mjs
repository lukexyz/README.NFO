// Module sample list as message board (style trk-02) header for the Castaway README.
// Plain Node, no dependencies, deterministic. Run:
//   node examples/castaway/src/38-sample-list-board_opus_5.5.mjs
// It rewrites examples/castaway/38-sample-list-board_opus_5.5.md. Edit this file, not that.
//   --verify   also checks every activity id, def name and sample length against the
//              castaway project at D:/python/castaway (read-only), if that folder exists.
//
// The style: a MOD file has a 20-character song name and 31 sample slots of exactly 22
// characters, and since players showed those names to the listener, composers used them
// as a notice board: centred messages padded by hand, rules made of punctuation, lines
// starting with # (which one Amiga player printed for the listener), a greetings line at
// the bottom, real sample names in between and empty slots left empty. XM modules added
// an instrument list with the same 22-character names, and sometimes block-pixel
// lettering built from block characters across several names. The format is a fact;
// everything written in the slots here is new.
//
// How it maps onto Castaway (the jokes are true):
//   * instruments are the gags. The schedule plays them like notes: every activity starts
//     on the next bar of the music. Each name is a real activity id from activities.toml,
//     with its timer tier as the disk prefix, the way sample disks prefixed st-01:.
//   * samples are what you hear. Castaway has no samples: every sound is a Python function
//     in tools/make_audio.py. So each sample slot holds the def that makes a sound the gag
//     beside it cues (checked against the gag's own sound cues), cut to 22 characters like
//     any long sample name ever was, with the real length of the WAV it writes, in sample
//     frames at 48 kHz. Message slots are 0 frames long, as they always were.
//   * the ship's gag cues no sound at all, so its sample slot is empty.
//   * CAST and AWAY are block-pixel lettering, one word per list, so they read across.
//   * the picture is split the same way: she is in the instrument list, the ship is in
//     the sample list. She will not see it.
// Ids, defs and numbers were read from D:/python/castaway on 2026-10-01.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '38-sample-list-board_opus_5.5';
const OUT = path.resolve(HERE, '..', `${SLUG}.md`);
const PROJECT = 'D:/python/castaway';

const SLOT = 22;          // a sample name, in characters
const SLOTS = 31;         // sample slots in a MOD
const TITLE = 20;         // a song name, in characters
const fail = (m) => { throw new Error(m); };

// ------------------------------------------------------------------ slot markup
// A slot is a string of at most 22 visible characters. Inside it, {text|href} is a
// link (only the text counts towards the width) and ^text^ is bold.
const visible = (s) => s.replace(/\{([^|}]*)\|[^}]*\}/g, '$1').replace(/\^([^^]*)\^/g, '$1');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const html = (s) => esc(s)
  .replace(/\{([^|}]*)\|([^}]*)\}/g, (m, t, h) => `<a href="${h}">${t}</a>`)
  .replace(/\^([^^]*)\^/g, '<b>$1</b>');
// The only links allowed: files at the castaway root, and the local preview.
const LINKS = new Set(['MUSING.md', 'activities.toml', 'tools/serve.py', 'tools/schedule.py',
  'tools/make_audio.py', 'tools/render_demo.py', 'web/index.html', 'http://127.0.0.1:8765/']);
const checkLinks = (s) => {
  for (const m of s.matchAll(/\{[^|}]*\|([^}]*)\}/g)) if (!LINKS.has(m[1])) fail(`link not allowed: ${m[1]}`);
};
// MOD names are 7-bit ASCII. Block characters are allowed only in the XM-style
// lettering, pictures and bars: blocks only, or a bar followed by its plain label.
const BLOCKISH = /^[ ▀▄█▌]*$/;
const BAR = /^[█▌]+ [\x20-\x7e]+$/;
const checkChars = (s) => {
  const v = visible(s);
  if (!/^[\x20-\x7e]*$/.test(v) && !BLOCKISH.test(v) && !BAR.test(v)) fail(`slot mixes text and blocks: "${v}"`);
};

const pad = (s, w = SLOT) => {
  const v = visible(s);
  if (v.length > w) fail(`slot too long (${v.length} > ${w}): "${v}"`);
  return s + ' '.repeat(w - v.length);
};
const centre = (s, w) => {
  const v = visible(s);
  if (v.length > w) fail(`too long to centre in ${w}: "${v}"`);
  const l = Math.floor((w - v.length) / 2);
  return ' '.repeat(l) + s + ' '.repeat(w - v.length - l);
};
// Line types, as the style has them.
const msg = (t) => `# ${centre(t, SLOT - 4)} #`;          // a # message, centred by hand
const mid = (t) => centre(t, SLOT);                       // a centred line with no #
const rule = (c) => c[0] + c[1].repeat(SLOT - 2) + c[2];  // *=====* and friends
const EMPTY = '';
// A real name longer than a slot is cut, as trackers always did. cut() insists the
// name really was too long, so nothing is shortened by accident.
const cut = (s) => (s.length > SLOT ? s.slice(0, SLOT) : fail(`cut() on a name that fits: ${s}`));
// A sample slot that holds a sound: the def's name and the length of the WAV it
// writes, in frames at 48 kHz (read from media/audio on 2026-10-01).
const snd = (name, frames, wav) => ({ name, frames, wav });

// ------------------------------------------------------------------ block pixels
// Two pixel rows per text row: upper half, lower half, both, neither.
const HALF = { '..': ' ', '#.': '▀', '.#': '▄', '##': '█' };
const blocks = (rows) => {
  if (rows.length % 2) rows = [...rows, '.'.repeat(rows[0].length)];
  const out = [];
  for (let y = 0; y < rows.length; y += 2) {
    let s = '';
    for (let x = 0; x < rows[y].length; x++) s += HALF[rows[y][x] + rows[y + 1][x]];
    out.push(s);
  }
  return out;
};

// A 6-pixel-tall alphabet, only the letters CASTAWAY needs. Strokes are one pixel.
const FONT = {
  C: ['.###', '#...', '#...', '#...', '#...', '.###'],
  A: ['.##.', '#..#', '#..#', '####', '#..#', '#..#'],
  S: ['.###', '#...', '.##.', '...#', '...#', '###.'],
  T: ['###', '.#.', '.#.', '.#.', '.#.', '.#.'],
  W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '.#.#.'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..'],
};
const word = (w) => {
  const rows = FONT.A.map(() => '');
  [...w].forEach((ch, i) => FONT[ch].forEach((r, y) => { rows[y] += (i ? '.' : '') + r; }));
  const width = rows[0].length;
  if (width > SLOT) fail(`${w} is ${width} pixels, wider than a slot`);
  const l = Math.floor((SLOT - width) / 2);
  return blocks(rows.map((r) => '.'.repeat(l) + r + '.'.repeat(SLOT - width - l)));
};

// The picture, 22 x 16 pixels a side. Left: the palm, her (headphones on, eyes shut,
// busy with the music), the raft with its scrap of sail, the sand. Right: open sea, the
// sun, a gull and a ship going past, bow first. The waves run through both.
const ISLAND = [
  '..........###..###....',
  '.......###...##...###.',
  '.....##.....####.....#',
  '....#......#.##.#.....',
  '...#......#..##..#....',
  '..........#..##...#...',
  '..#####......##.......',
  '.#.....#....##.....#..',
  '##.###.##...##.....##.',
  '##.###.##...##.....###',
  '...###.....##......#..',
  '....#......##......#..',
  '..#####...###......#..',
  '################.#####',
  '#.#.#.#.#.#.#.#.#.#.#.',
  '.#.#.#.#.#.#.#.#.#.#.#',
];
const SEA = [
  '...............#.....#',
  '.................###..',
  '................#####.',
  '..##...##.......#####.',
  '#...#.#...#......###..',
  '.....#.........#.....#',
  '......................',
  '......................',
  '........##......#.....',
  '...#....##......#.....',
  '...#..#######...#.##..',
  '..##################..',
  '...################...',
  '....##############....',
  '#.#.#.#.#.#.#.#.#.#.#.',
  '.#.#.#.#.#.#.#.#.#.#.#',
];
// For the greets fold: the bottle that came straight back, with her note still in it,
// bobbing on the same waves.
const BOTTLE = [
  '......................',
  '..##########..........',
  '.#..........##........',
  '#..######.....#######.',
  '#..######.....#...####',
  '#..######.....#######.',
  '.#..........##........',
  '..##########..........',
  '......................',
  '......................',
  '#.#.#.#.#.#.#.#.#.#.#.',
  '.#.#.#.#.#.#.#.#.#.#.#',
];
for (const [n, p, h] of [['ISLAND', ISLAND, 16], ['SEA', SEA, 16], ['BOTTLE', BOTTLE, 12]]) {
  if (p.length !== h || p.some((r) => r.length !== SLOT)) fail(`${n} must be 22 x ${h} pixels`);
}

// A bar for the schedule fold: one block per `per` events, a half block for a half.
const bar = (n, per) => {
  const halves = Math.max(1, Math.round((n / per) * 2));
  return '█'.repeat(Math.floor(halves / 2)) + (halves % 2 ? '▌' : '');
};

// ------------------------------------------------------------------ a board
// Two numbered lists side by side, as the lines of one <pre>. `right` slots may be
// snd() objects; with `lengths` they also fill a len column.
const GAP = '    ';
const LEN = 8;
const num = (i) => String(i + 1).padStart(2, '0');
const nameOf = (s) => (typeof s === 'string' ? s : s.name);
function board({ song, left, right, leftLabel, rightLabel, lengths = false }) {
  if (song.length > TITLE) fail(`song name over ${TITLE} characters: ${song}`);
  for (const [n, list] of [['left', left], ['right', right]]) {
    if (list.length !== SLOTS) fail(`${song} ${n}: ${list.length} slots, want ${SLOTS}`);
    list.forEach((s) => { checkLinks(nameOf(s)); checkChars(nameOf(s)); pad(nameOf(s)); });
  }
  const head = ` ${leftLabel.padEnd(3 + SLOT + GAP.length)}${lengths ? rightLabel.padEnd(3 + SLOT) + 'len'.padStart(LEN) : rightLabel}`;
  const rows = left.map((l, i) => {
    const r = right[i];
    let line = ` ${num(i)} ${html(pad(l))}${GAP}${num(i)} ${html(pad(nameOf(r)))}`;
    if (lengths && typeof r !== 'string') line += String(r.frames).padStart(LEN);   // messages: 0, left blank
    return line.replace(/\s+$/, '');
  });
  return [` song name  <b>${song}</b>`, '', head.replace(/\s+$/, ''), ...rows];
}

// ================================================================== the main board
// instruments: what she does. Disk prefix = timer tier (reg, occ, rare, super).
const INSTRUMENTS = [
  ...word('CAST'),
  rule('*=*'),
  ...blocks(ISLAND),
  rule('*=*'),
  msg('she nods along'),
  msg('for ten hours.'),
  msg('on the next bar,'),
  msg('now and then:'),
  EMPTY,
  'reg:fishing_quiet',
  'reg:sandcastle',
  'occ:message_in_bottle',
  'occ:turtle_visit',
  'occ:coconut_crab',
  '^occ:ship_passes_unseen^',
  'rare:delivery_drone',
  'rare:signal_hunt',
  'rare:cat_visit',
  'rare:shark_nod',
  'super:leave_any_time',
  msg('more than 90, in'),
  mid('{activities.toml|activities.toml}'),
];

// samples: what you hear. Each is the def in tools/make_audio.py that makes a sound the
// gag beside it cues, with the frame count of the WAV it writes.
const SAMPLES = [
  ...word('AWAY'),
  rule('*=*'),
  ...blocks(SEA),
  rule('*=*'),
  msg('every sound here'),
  msg('is a python def.'),
  msg('no samples at all.'),
  msg('(in a sample list)'),
  EMPTY,
  snd('def reel_wind():', 105600, 'reel_wind'),
  snd('def sand_pat():', 62400, 'sand_pat'),
  snd('def cork_squeak_in():', 33600, 'cork_squeak_in'),
  snd('def splash_small():', 28800, 'splash_small_plop'),
  snd(cut('def coconut_drop_crunch():'), 28800, 'coconut_drop_crunch'),
  EMPTY,
  snd('def parcel_thud():', 24000, 'parcel_thud_sand'),
  snd('def phone_ping():', 67200, 'phone_ping_one_bar'),
  snd('def crate_knock(seed):', 24000, 'crate_knock_01'),
  snd('def shark_surface():', 115200, 'shark_surface'),
  snd('def straw_slurp_ice():', 86400, 'straw_slurp_ice'),
  'python {tools/serve.py|tools/serve.py}',
  '{http://127.0.0.1:8765/|http://127.0.0.1:8765/}',
];

const all = [...INSTRUMENTS, ...SAMPLES];
const sounds = SAMPLES.filter((s) => typeof s !== 'string').length;
const empties = all.filter((s) => s === EMPTY).length;
const messages = all.length - sounds - empties;

const MAIN = [
  ...board({
    song: 'castaway....10:00:00', left: INSTRUMENTS, right: SAMPLES,
    leftLabel: 'instruments: what she does', rightLabel: 'samples: what you hear', lengths: true,
  }),
  '',
  ' timers  reg 2-5 min · occ 12-25 min · rare 30-60 min · super 3-6 hours',
  ` ${all.length} slots: ${sounds} sounds, ${messages} messages at 0 frames, ${empties} empty. no slot 32.`,
];

// ================================================================== fold: the timers
// The four timers and a typical run: medians of 200 simulated ten-hour runs, as the
// header of activities.toml states them (regular ~155, occasional ~30, rare ~13,
// super rare ~2, chained ~20). Busy about a third of the time.
const RUN = { reg: 155, occ: 30, rare: 13, super: 2, then: 20 };
const TIMERS_L = [
  rule('*=*'),
  msg('four timers'),
  rule('*=*'),
  msg('when one goes off,'),
  msg('it picks a gag by'),
  msg('weight, from those'),
  msg('free to go now.'),
  EMPTY,
  'reg:   every 2-5 min',
  'occ:   every 12-25 min',
  'rare:  every 30-60 min',
  'super: every 3-6 h',
  'then:  when told to',
  EMPTY,
  rule('*-*'),
  msg('every gag starts'),
  msg('on the next bar of'),
  msg('the music. a bar'),
  msg('is 3 s, so gags'),
  msg('land on the beat.'),
  rule('*-*'),
  msg('lanes let gags'),
  msg('overlap: one each'),
  msg('for her, the cat,'),
  msg('turtle, sea & sky,'),
  msg('shore and garden.'),
  rule('*-*'),
  msg('check it, and run'),
  msg('ten simulated'),
  msg('hours, with'),
  mid('{tools/schedule.py|tools/schedule.py}'),
];
const BUSY = '█'.repeat(7) + '▄'.repeat(SLOT - 7);   // a third of 22, rounded; idle sits low
const TIMERS_R = [
  rule('*=*'),
  msg('a typical run'),
  rule('*=*'),
  msg('seed 1992, ten'),
  msg('hours: the median'),
  msg('of 200 simulated'),
  msg('runs. a block = 10'),
  EMPTY,
  `${bar(RUN.reg, 10)} ~${RUN.reg}`,
  `${bar(RUN.occ, 10)} ~${RUN.occ}`,
  `${bar(RUN.rare, 10)} ~${RUN.rare}`,
  `${bar(RUN.super, 10)} ~${RUN.super}`,
  `${bar(RUN.then, 10)} ~${RUN.then}`,
  EMPTY,
  rule('*-*'),
  msg('busy a third of'),
  msg('the time, idle'),
  msg('the rest:'),
  BUSY,
  msg('busy  /  idle'),
  rule('*-*'),
  msg('a ship waits up to'),
  msg('10 min for her to'),
  msg('get busy (coconut,'),
  msg('fish, lap, castle)'),
  msg('then sails past.'),
  rule('*-*'),
  msg('super rare: three'),
  msg('a run, at most.'),
  msg('the rest of it:'),
  mid('{activities.toml|activities.toml}'),
];
const TIMERS = board({
  song: 'castaway....timers', left: TIMERS_L, right: TIMERS_R,
  leftLabel: 'instruments: the timers', rightLabel: 'samples: a typical run',
});

// ================================================================== fold: the theme
// The 60-second theme, from tools/make_audio.py: the instrument defs (cut to 22, as
// names were), and what each one does in the arrangement.
const THEME_L = [
  cut('def epiano(midi, hold, vel):'),
  cut('def kalimba(midi, vel, r):'),
  cut('def bass(midi, hold, vel):'),
  cut('def pad(midis, dur, r):'),
  'def kick(r):',
  'def snare(r):',
  'def rim(r):',
  cut('def hat(r, open_=False):'),
  'def vinyl(n, r):',
  rule('*=*'),
  msg('80 bpm. f major.'),
  msg('ii-v-i-vi, a chord'),
  msg('a bar, then again:'),
  mid('gm9  c13  fmaj9  dm9'),
  rule('*=*'),
  msg('20 bars of 3 s:'),
  'bars  1-2   intro',
  'bars  3-10  groove',
  'bars 11-16  theme',
  'bars 17-20  breakdown',
  msg('then bar 1 again,'),
  msg('with no seam.'),
  rule('*=*'),
  cut('def ocean_loop(dur=60.0, xfade=6.0):'),
  msg('the sea: another'),
  msg('60 s loop, no seam'),
  rule('*=*'),
  msg('all of it made by'),
  mid('{tools/make_audio.py|tools/make_audio.py}'),
  EMPTY,
  EMPTY,
];
const THEME_R = [
  msg('every bar. chords'),
  msg('lead, from bar 7'),
  msg('in at bar 3'),
  msg('breakdown only'),
  msg('in at bar 3'),
  msg('beats 2 and 4'),
  msg('breakdown, w/ kick'),
  msg('16ths from bar 11'),
  msg('crackle, -26 db'),
  rule('*=*'),
  msg('mix: -14 lufs,'),
  msg('true peak at or'),
  msg('below -1 dbtp.'),
  msg('levels: per gag'),
  rule('*=*'),
  EMPTY,
  msg('keys, filter opens'),
  msg('drums and bass in'),
  msg('the kalimba tune'),
  msg('kick, rim and pad'),
  EMPTY,
  EMPTY,
  rule('*=*'),
  msg('more than 150'),
  msg('sound files, all'),
  msg('from code.'),
  rule('*=*'),
  msg('nobody has heard'),
  msg('any of it yet.'),
  msg('it is patient.'),
  EMPTY,
];
const THEME = board({
  song: 'castaway....theme', left: THEME_L, right: THEME_R,
  leftLabel: 'instruments: the band', rightLabel: 'samples: the notes',
});

// ================================================================== fold: greets
// Greetings and credits in the last slots, the old way.
const GREETS_L = [
  rule('*=*'),
  msg('greetings to'),
  rule('*=*'),
  'the sea turtle',
  'the cat. grey tabby,',
  '  white chest',
  'the shark. nice',
  '  headphones',
  'the hermit crab, and',
  '  his new coconut',
  'the delivery drone',
  'the hydrofoil bro.',
  '  shaka received',
  'the tour boat. she is',
  '  in your photos now',
  'the kumara, growing',
  'the bottle that came',
  '  straight back',
  'the ship. you know',
  '  what you did',
  rule('*=*'),
  msg('an unofficial'),
  msg('remake. inspired'),
  msg('by a 1992 desert'),
  msg('island screensaver'),
  msg('no affiliation.'),
  rule('*=*'),
  msg('contact: slot 32'),
  EMPTY,
  mid('the log: {MUSING.md|MUSING.md}'),
  msg('end of list'),
];
const GREETS_R = [
  rule('*=*'),
  msg('credits'),
  rule('*=*'),
  'every sound:',
  '  {tools/make_audio.py|tools/make_audio.py}',
  'the schedule:',
  '  {activities.toml|activities.toml}',
  'the renderer:',
  '  {web/index.html|web/index.html}',
  'the old dev reel:',
  '  {tools/render_demo.py|tools/render_demo.py}',
  EMPTY,
  rule('*-*'),
  msg('in development.'),
  msg('no video is out'),
  msg('yet. she is used'),
  msg('to waiting.'),
  rule('*-*'),
  EMPTY,
  msg('always daytime.'),
  msg('16:9 1080p 30 fps'),
  msg('exported in the'),
  msg('browser, frame by'),
  msg('frame, as an mp4.'),
  rule('*=*'),
  ...blocks(BOTTLE),
];
const GREETS = board({
  song: 'castaway....greets', left: GREETS_L, right: GREETS_R,
  leftLabel: 'instruments: greetings', rightLabel: 'samples: credits',
});

// ------------------------------------------------------------------ the page
const pre = (lines) => `<pre>\n${lines.join('\n')}\n</pre>`;

const md = `<!-- Header ${SLUG} for Castaway. Generated by src/${SLUG}.mjs: edit that, not this. -->

${pre(MAIN)}

**Castaway** (working title) is a ten-hour lo-fi video for YouTube in which almost nothing happens, on purpose: one young woman, one tiny island, one tall palm, one raft and a great deal of time. She sits under the palm in cream headphones, nodding to the music. It is an unofficial remake inspired by the small-island routines and visual comedy of the 1992 screensaver *Johnny Castaway*, repainted sunny, coastal and hand-painted: 16:9, 1080p, 30 fps, and always daytime.

Every so often, on the next bar of the music, something happens. More than 90 activities live in [activities.toml](activities.toml), most of them on four timers, from everyday things every few minutes (a spot of fishing, a sandcastle) to a super-rare stroll out across the water and back with an iced coffee: she could leave any time. In between, a bottle washes straight back, a drone delivers more headphones, a hermit crab walks off wearing a coconut and a shark in headphones nods along. A ship goes by as well. It makes no sound, and her eyes are shut.

Every sound is synthesized from code by [tools/make_audio.py](tools/make_audio.py): no samples, loops or recordings, so no third-party licence applies. That left the sample list with nothing to hold, so it took messages instead.

\`\`\`sh
python tools/serve.py      # then open http://127.0.0.1:8765/
\`\`\`

The page plays the run live and exports a YouTube-ready MP4: the browser encodes frame-exact H.264 and the server mixes in the sound. Plain ES modules, no build step, no npm packages.

<sub>In development: no video has been published yet, and nobody has heard the sound. Both are on the list.</sub>

<details>
<summary><b>how to read the list</b>: two lists, 31 slots each, 22 characters a slot</summary>

<br>

A tracker module keeps a name for each of its 31 samples, 22 characters apiece, and players showed those names to whoever was listening. So people wrote in them: messages centred by hand, lines starting with \`#\`, rules made of punctuation, greetings at the bottom, and between them the actual samples. Later modules added an instrument list beside it. This one is Castaway's.

- **Instruments are the gags.** Every activity starts on the next bar of the music, so the schedule plays them like notes. Each name is a real activity id from [activities.toml](activities.toml), with its timer as the disk prefix: \`reg\` every 2 to 5 minutes, \`occ\` every 12 to 25, \`rare\` every 30 to 60, \`super\` every 3 to 6 hours.
- **Samples are the sounds.** Castaway has none, so each slot holds the Python function that makes a sound for the gag beside it, cut at 22 characters like any long sample name. \`len\` is the real length of the file it writes, in frames at 48 kHz. Messages are 0 frames long, as they always were.
- **Slot 24 is empty on purpose.** The ship that sails past while she is busy cues no sound at all. She would not hear it anyway: headphones.
- **CAST and AWAY** are drawn in block pixels, one word per list, and so is the picture: she is in one list and the ship is in the other.

</details>

<details>
<summary><b>castaway....timers</b>: the schedule, as another pair of lists</summary>

${pre(TIMERS)}

</details>

<details>
<summary><b>castaway....theme</b>: the 60-second theme, instrument by instrument</summary>

${pre(THEME)}

</details>

<details>
<summary><b>castaway....greets</b>: the last slots, as is traditional</summary>

${pre(GREETS)}

</details>
`;

// ------------------------------------------------------------------ optional check
if (process.argv.includes('--verify')) {
  const toml = path.join(PROJECT, 'activities.toml');
  const py = path.join(PROJECT, 'tools', 'make_audio.py');
  if (!fs.existsSync(toml) || !fs.existsSync(py)) {
    console.log('verify: castaway project not found, skipped');
  } else {
    const t = fs.readFileSync(toml, 'utf8');
    const p = fs.readFileSync(py, 'utf8');
    for (const s of INSTRUMENTS.map(visible)) {
      const m = s.match(/^(reg|occ|rare|super):([a-z0-9_]+)$/);
      if (m && !t.includes(`[activities.${m[2]}]`)) fail(`verify: no activity ${m[2]}`);
    }
    for (const s of [...SAMPLES.map(nameOf), ...THEME_L].map(visible)) {
      const m = s.match(/^def ([a-z0-9_]+)/);
      const exact = s.includes('(');   // a cut name only has to match the start of a def
      if (m && !new RegExp(`^def ${m[1]}${exact ? '\\(' : ''}`, 'm').test(p)) fail(`verify: no def ${m[1]}`);
    }
    for (const s of SAMPLES.filter((x) => typeof x !== 'string')) {
      const b = fs.readFileSync(path.join(PROJECT, 'media', 'audio', 'sfx', `${s.wav}.wav`));
      // 16-bit PCM: frames = data bytes / (2 * channels). Walk the chunks to find data.
      const ch = b.readUInt16LE(22);
      let o = 12;
      while (o < b.length && b.toString('ascii', o, o + 4) !== 'data') o += 8 + b.readUInt32LE(o + 4);
      const frames = b.readUInt32LE(o + 4) / (2 * ch);
      if (frames !== s.frames) fail(`verify: ${s.wav} is ${frames} frames, not ${s.frames}`);
    }
    console.log('verify: every activity id, def name and length matches');
  }
}

fs.writeFileSync(OUT, md);
console.log(`wrote ${path.relative(process.cwd(), OUT)}`);
