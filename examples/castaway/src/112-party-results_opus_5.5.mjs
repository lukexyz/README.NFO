// Demoparty results.txt header for the Castaway README (style catalogue entry demo-06).
// Plain Node, no dependencies, deterministic. Run:
//   node examples/castaway/src/112-party-results_opus_5.5.mjs
// It rewrites examples/castaway/112-party-results_opus_5.5.md. Edit this file, not the .md.
//
// THE STYLE
// When a demoparty ends, the organisers publish the votes as a plain 79-column text file, and
// that results.txt is how most of the scene learns who won. Its grammar has barely moved since
// 1993: an outline ASCII logo signed by its artist, the party name and the word "results" in
// letter-spaced capitals, sometimes a place and a URL set between two columns of dots, a short
// note on how the votes were counted, then one block per competition (the name on a plaque or
// over a rule of hyphens, then place, points, title and author, right-aligned numbers first),
// disqualified entries last, a one-letter flag column at the right margin with its legend in
// the footer, a vote count, an ASCII credit, and an embedded FILE_ID.DIZ between begin and end
// markers. The invitation text that comes before a party is its sibling: a tagline between
// bookends, place and dates, "organized by" and "sponsored by" boxes whose bottom edge fades
// out into dashes, then centred dash-spaced headings for the competitions (with sizes in kb),
// the prizes by place, the rules and general information.
// Credited references, none of whose logos, names, art or wording is reproduced here: the
// results files of Assembly 1993, The Party 1994, Breakpoint 2004, Main 2010, Chaos
// Constructions 2019, Forever 2019 and Revision 2023, the Wuhu party system's results
// printer, and the Assembly 1994 invitation text.
//
// THE JOKE, AND WHY THE NUMBERS ARE REAL
// The "party" is one ten-hour Castaway run: the default schedule, seed 1992. Nobody votes; an
// entry's points are the seconds it was on screen in that run, so the stray cat, who turns up
// on a crate and stays a while, wins the visitors' compo by a mile, and the ship that sails
// past while she is busy places second without ever being seen. Entries the seed never picked
// are listed last as DNS (did not show), where a real file puts its DSQ rows. The flag column
// is each entry's timer tier. Every figure comes from the project itself, read-only:
//   cd D:/python/castaway
//   python -B tools/schedule.py --json <scratch>/run1992.json      (writes only that file)
// then summing end - start per activity over the events (clipped at the run's end), and
// measuring the WAV files in media/audio (read-only, python -B). The schedule grows every few
// hours, so the figures are dated (AS_OF) and kept
// here as data rather than recomputed on every build. Only the project's wholesome gags are
// listed; the footer says how many events ran in all.
//
// Everything else is invented for this header: the logo and its alphabet (an upright outline
// face with chamfered corners and a dotted inner shadow, the T grown into a palm with two
// coconuts, standing on a sand bar in the sea with the raft moored alongside), the artist's
// tag (kelpie), the orga (Isobath), the compo names, the special awards, the prizes and the
// wording. 7-bit ASCII, 79 columns.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '112-party-results_opus_5.5';
const OUT = path.resolve(HERE, '..', `${SLUG}.md`);
const W = 79; // the results.txt page width

// ---------------------------------------------------------------------------------------------
// 0. Facts. Checked AS_OF, read-only, in D:/python/castaway (see the note above).
// ---------------------------------------------------------------------------------------------
// First measured 2026-10-01, re-simulated 2026-10-02 with identical events (94 activities that
// day: 81 on timers, 13 chained; seed 1992 still picks the same 219 events).
const AS_OF = '2026-10-02';
const RUN = {
  length: '10:00:00',
  seed: 1992,
  events: 219, // 159 regular, 32 occasional, 13 rare, 1 super rare, 14 chained
  idlePct: 72, // she was busy 27.8% of the run
};
// activity: [points = whole seconds on screen inside the 10:00:00, times it ran, timer flag]
const RESULT = {
  // The cat's fifth visit starts at 9:44:09 and is scheduled to end at 10:01:43, after the
  // video does, so only the part inside the run counts: 6477 s (1:47:57), not the 6580 s
  // (1:49:40) that schedule.py's summary adds up. First arrival 0:44:06.
  cat_visit: [6477, 5, 'R'],
  ship_passes_unseen: [1107, 9, 'o'], // 18:27 on screen; 8 of 9 crossed while she was busy
  coconut_crab: [127, 1, 'o'],
  rescue_almost: [114, 1, 'S'], // started 5:14:06
  bottle_reply: [54, 1, 'c'], // washed up at 6:05:06, her bottle went out at 3:04:15
  fishing_quiet: [1857, 19, 'r'],
  coconut_sip: [1132, 29, 'r'],
  sandcastle: [840, 10, 'r'],
  jog_lap: [579, 19, 'r'],
  tide_takes_sandcastle: [64, 10, 'c'],
  hammock: [409, 2, 'R'],
  signal_hunt: [155, 1, 'R'],
  message_in_bottle: [107, 1, 'o'],
  hammock_comes_down: [24, 2, 'c'],
};
const pts = (key) => String(RESULT[key][0]);
const flag = (key) => RESULT[key][2];
const two = (n) => String(n).padStart(2, '0');
const hms = (s) => `${Math.floor(s / 3600)}:${two(Math.floor((s % 3600) / 60))}:${two(s % 60)}`;
const ms = (s) => `${Math.floor(s / 60)}:${two(s % 60)}`;
// Sound files as they sit in media/audio: bytes on disk and channels (48 kHz 16-bit WAV with a
// 44-byte header, so the length follows from the size; some are mono, some stereo), all written
// by tools/make_audio.py. Files: music/castaway_lofi_theme_loop_60s, sfx/ambience_ocean_loop_60s,
// ship_horn_distant, drone_fly_in, cat_purr_loop, phone_ping_one_bar, straw_slurp_ice and
// coconut_drop_crunch (.wav). Lengths agree with media/audio/audio_catalog.json.
const SOUND = [
  ['music', 11520044, 2, 'the theme: 20 bars of exactly 3 s'],
  ['ambient', 11520044, 2, 'the ocean, also without a seam'],
  ['ship horn', 1305644, 2, 'distant, for the one ship she sees'],
  ['drone', 960044, 2, 'arriving with more headphones'],
  ['cat purr', 691244, 1, 'a loop, for the guest of honour'],
  ['phone ping', 268844, 2, 'one bar, at the top of the palm'],
  ['ice slurp', 172844, 1, 'the iced coffee'],
  ['coconut', 57644, 1, 'landing on a hermit crab'],
];
const kb = (bytes) => Math.round(bytes / 1024);
const secs = (bytes, ch) => ((bytes - 44) / (48000 * 2 * ch)).toFixed(1);

// ---------------------------------------------------------------------------------------------
// 1. Markup. Lines are written with two tokens so widths are measured on the visible text:
//    {b:text} is bold, {a:href|text} is a link. Everything else is escaped for <pre>.
// ---------------------------------------------------------------------------------------------
const TOKEN = /\{b:([^{}]*)\}|\{a:([^|{}]*)\|([^{}]*)\}/g;
const vis = (line) => line.replace(TOKEN, (m, b, href, text) => (b !== undefined ? b : text));
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function html(line) {
  let out = '';
  let last = 0;
  for (const m of line.matchAll(TOKEN)) {
    out += esc(line.slice(last, m.index));
    if (m[1] !== undefined) out += `<b>${esc(m[1])}</b>`;
    else out += `<a href="${m[2]}">${esc(m[3])}</a>`;
    last = m.index + m[0].length;
  }
  return out + esc(line.slice(last));
}
const rep = (ch, n) => (n > 0 ? ch.repeat(n) : '');
const len = (s) => vis(s).length;
const padR = (s, n) => s + rep(' ', n - len(s));
const padL = (s, n) => rep(' ', n - len(s)) + s;
const center = (s, w = W) => rep(' ', Math.floor((w - len(s)) / 2)) + s;
const spaced = (s) => [...s].join(' ').replace(/ {3}/g, '   ');
const link = (href, text = href) => `{a:${href}|${text}}`;
const BS = String.fromCharCode(92);
// Art blocks are written raw (a backslash stays a backslash; a ¬ stands for a backtick, which a
// template literal cannot hold) and padded out to a rectangle.
const art = (s) => {
  const r = s.raw[0].replace(/¬/g, '`').split('\n').slice(1, -1);
  const w = Math.max(...r.map((l) => l.length));
  return r.map((l) => l.padEnd(w));
};
const MIRROR = { '/': BS, [BS]: '/', '(': ')', ')': '(', '<': '>', '>': '<', '[': ']', ']': '[' };
const mirror = (s) => [...s].reverse().map((c) => MIRROR[c] ?? c).join('');

// ---------------------------------------------------------------------------------------------
// 2. The logo. Nine rows per letter: a roof of underscores, then eight rows of body. Stems are
//    two cells wide inside their walls, counters one, the T and the Y stand on three. Outer
//    corners are chamfered with slashes. A, W and A share walls, the way old outline logos
//    lock their letters together.
// ---------------------------------------------------------------------------------------------
const GLYPHS = {
  C: art`
  _____
 /  ___|
|  |
|  |
|  |
|  |
|  |
|  |___
 \_____|
`,
  A: art`
  _____
 /  _  \
|  | |  |
|  | |  |
|  |_|  |
|   _   |
|  | |  |
|  | |  |
|__| |__|
`,
  S: art`
  _____
 /  ___|
|  |
|  |___
 \___  \
     |  |
     |  |
 ____|  |
|______/
`,
  T: art`
 _______
|_     _|
  |   |
  |   |
  |   |
  |   |
  |   |
  |   |
  |___|
`,
  W: art`
 __       __
|  |     |  |
|  |     |  |
|  |     |  |
|  |  _  |  |
|  | | | |  |
|  | | | |  |
|  |_| |_|  |
 \_________/
`,
  Y: art`
 __   __
|  | |  |
|  | |  |
|  |_|  |
 \     /
  |   |
  |   |
  |   |
  |___|
`,
};
const GLYPH_ROWS = 9;
const WORD = 'CASTAWAY';
const GAPS = [1, 1, 1, 1, -1, -1, 1]; // after each letter; -1 = share a wall
const isWall = (c) => c === '|' || c === '/' || c === BS;

// Inner shadow: inside each stroke the cell against the right-hand wall takes a dot, then a
// colon, on the two rows above the feet, so the letters darken toward the waterline.
const SHADE = { 6: '.', 7: ':' };
function shade(g) {
  return g.map((row, y) => {
    const f = SHADE[y];
    if (!f) return row;
    const out = [...row];
    const walls = [];
    out.forEach((c, x) => isWall(c) && walls.push(x));
    for (let i = 0; i + 1 < walls.length; i += 2) {
      const x = walls[i + 1] - 1; // the last cell of an ink run
      if (x > walls[i] && out[x] === ' ') out[x] = f;
    }
    return out.join('');
  });
}

// The palm's crown, drawn as its left half up to the centre column and mirrored, so it is
// symmetric about the T's stem. The centre column carries the top of the trunk.
const CROWN = art`
        __     \ |
   _.-'¬  ¬'-.  \|
 .'  _.-~~-._ '._|
'  .'        '.  |
`;
const SAND = ' _/:::::::\\_ ';
const RAFT = ' [=====] ';
const TAG = '-kelpie';

function logo() {
  const rows = Array.from({ length: GLYPH_ROWS }, () => Array(W + 4).fill(' '));
  const starts = [];
  let x = 1;
  [...WORD].forEach((ch, i) => {
    if (!GLYPHS[ch] || GLYPHS[ch].length !== GLYPH_ROWS) throw new Error(`glyph ${ch} needs ${GLYPH_ROWS} rows`);
    const g = shade(GLYPHS[ch]);
    starts.push(x);
    for (let y = 0; y < GLYPH_ROWS; y++)
      for (let k = 0; k < g[y].length; k++) {
        const c = g[y][k];
        if (c === ' ') continue;
        const was = rows[y][x + k];
        // Letters may only meet on a shared wall, never draw over each other.
        if (was !== ' ' && was !== c) throw new Error(`${ch} collides with its neighbour at row ${y}`);
        rows[y][x + k] = c;
      }
    x += g[0].length + (GAPS[i] ?? 1);
  });
  if (x - 1 > W) throw new Error(`logo is ${x - 1} columns wide`);
  const t = starts[WORD.indexOf('T')];
  const mid = t + Math.floor(GLYPHS.T[1].length / 2); // centre of the T's stem
  // Two coconuts under the crown.
  rows[2][mid - 3] = 'o';
  rows[2][mid + 3] = 'o';
  const crown = CROWN.map((r) => r + mirror(r.slice(0, -1)));
  const cx = mid - (CROWN[0].length - 1);
  // The sea: the letters wade in it, the palm stands on a sand bar, the artist signs the end.
  const seaPattern = '~ ~~ ~~~ ~ ~~ ~~~~ ~~ ~ ';
  const sea = Array.from({ length: W }, (_, i) => seaPattern[i % seaPattern.length]);
  const sx = mid - Math.floor(SAND.length / 2);
  [...SAND].forEach((c, i) => (sea[sx + i] = c));
  const rx = sx + SAND.length + 3; // the raft, moored just off the sand
  [...RAFT].forEach((c, i) => (sea[rx + i] = c));
  const seaLine = `${sea.join('').slice(0, W - TAG.length - 1).trimEnd()} ${TAG}`;
  if (rx + RAFT.length >= W - TAG.length - 1) throw new Error('the raft has drifted into the signature');
  const lines = [...crown.map((r) => rep(' ', cx) + r), ...rows.map((r) => r.join('')), seaLine];
  return lines.map((l) => l.replace(/\s+$/, ''));
}

// ---------------------------------------------------------------------------------------------
// 3. Compo panels. A plaque sits on the panel's top edge; rows are place, points, entry, by and
//    the timer flag. DNS rows have no place and go last, as DSQ rows do in a real file.
// ---------------------------------------------------------------------------------------------
const COL = { place: 3, pts: 4, by: 14 };
const ENTRY = W - (1 + 2 + COL.place + 2 + COL.pts + 2 + 2 + COL.by + 2 + 1 + 2 + 1);
// Plain space-padded columns, as the results files print them (no dot leaders).
function entryRow(place, points, title, by, t) {
  if (len(title) + 1 > ENTRY) throw new Error(`entry too long: ${vis(title)} (${len(title)} > ${ENTRY - 1})`);
  const tt = padR(title, ENTRY);
  const line = `|  ${padR(place, COL.place)}  ${padL(points, COL.pts)}  ${tt}  ${padR(by, COL.by)}  ${t}  |`;
  if (len(line) !== W) throw new Error(`row width ${len(line)}: ${vis(line)}`);
  return line;
}
function noteRow(text) {
  const line = `|  ${padR(text, W - 6)}  |`;
  if (len(line) !== W) throw new Error(`note width ${len(line)}: ${vis(text)}`);
  return line;
}
function panel(name, entries, tally, notes = []) {
  const plaque = `  ${spaced(name)}  `;
  const pw = plaque.length;
  const out = [];
  out.push(`  .${rep('-', pw)}.`);
  out.push(` _|{b:${plaque}}|${rep('_', W - pw - 5)}`);
  out.push(`| '${rep('-', pw)}'${rep(' ', W - pw - 5)}|`);
  out.push(entryRow('pl.', 'pts', 'entry', 'by', 't'));
  out.push(entryRow('---', '----', rep('-', ENTRY - 2), rep('-', COL.by), '-'));
  for (const e of entries) out.push(entryRow(...e));
  for (const n of notes) out.push(noteRow(n));
  const end = ` ${tally} `;
  out.push(`|${rep('_', W - 4 - end.length)}${end}__|`);
  return out;
}
// A centred, dash-spaced heading from the invitation layout.
const heading = (s) => center(`- - - - - -   {b:${spaced(s)}}   - - - - - -`);

// ---------------------------------------------------------------------------------------------
// 4. The front page: logo, title, the place and address between two columns of dots, how the
//    votes were counted, and the first compo.
// ---------------------------------------------------------------------------------------------
const FRONT = [];
{
  const L = FRONT;
  for (const l of logo()) L.push(`{b:${l}}`);
  L.push('');
  L.push(center(`{b:${spaced('CASTAWAY 10H')}}   .   ${spaced('OFFICIAL RESULTS')}`));
  const dots = rep(': ', 9).trimEnd();
  const between = (s) => {
    const inner = 41;
    const side = Math.floor((W - inner) / 2);
    return `${padR(` ${dots}`, side)}${padR(center(s, inner), inner)}${padL(dots, side - 1)}`;
  };
  L.push(between('one island, one palm, one raft'));
  L.push(between(link('http://127.0.0.1:8765/')));
  L.push('');
  L.push(`  No votes were cast. Points are seconds on screen in the default ${RUN.length} run,`);
  L.push(`  seed ${RUN.seed}, simulated by ${link('tools/schedule.py')} on ${AS_OF}. Nobody was watching.`);
  L.push('');
  L.push(
    ...panel(
      'VISITORS COMPO',
      [
        ['01.', pts('cat_visit'), 'stray cat: five visits, arrives by crate', 'the cat', flag('cat_visit')],
        ['02.', pts('ship_passes_unseen'), 'ship: nine crossings, seen zero times', 'a ship', flag('ship_passes_unseen')],
        ['03.', pts('coconut_crab'), 'a coconut that walks off by itself', 'a hermit crab', flag('coconut_crab')],
        ['04.', pts('rescue_almost'), 'rescue ship: waved at, honks, sails on', 'a ship, again', flag('rescue_almost')],
        ['05.', pts('bottle_reply'), 'a reply, by bottle, three hours later', 'anonymous', flag('bottle_reply')],
        ['', 'DNS', 'drone delivery: more headphones', 'a drone', 'R'],
        ['', 'DNS', 'sea turtle, dozes off beside her', 'the turtle', 'o'],
        ['', 'DNS', 'shark in headphones, nods on the beat', 'the shark', 'R'],
        ['', 'DNS', 'tour boat of selfie-takers', 'a tour boat', 'R'],
        ['', 'DNS', 'electric hydrofoil, one shaka', 'a bro', 'R'],
      ],
      '5 shown . 5 DNS',
    ),
  );
  L.push('  t = timer: r every 2-5 min, o 12-25 min, R 30-60 min, S 3-6 h, c chained');
  L.push(`  DNS = did not show. ${RUN.events} events in all. Run it: python ${link('tools/serve.py')}`);
}

// ---------------------------------------------------------------------------------------------
// 5. The rest of the results: special awards first, the other compos, the footer, the DIZ.
// ---------------------------------------------------------------------------------------------
const REST = [];
{
  const L = REST;
  L.push(heading('SPECIAL AWARDS'));
  L.push('');
  const award = (what, who) => L.push(`  ${what} ${rep('.', 26 - what.length)} ${who}`);
  award('most screen time', `the cat: ${hms(RESULT.cat_visit[0])} on screen in 5 visits`);
  award('best unseen performance', `the ship: ${ms(RESULT.ship_passes_unseen[0])} on screen, seen 0 times`);
  award('perfect record', 'the tide: 10 sandcastles built, 10 taken');
  award('most patient', `her: idle ${RUN.idlePct}% of the ten hours, nodding`);
  award('closest call', '5:14:06. she waved. it honked. it sailed on');
  award('longest wait for post', 'her bottle: the reply took about 3 hours');
  award('last to leave', `the cat. visit 5 was still going at ${RUN.length}`);
  L.push('');
  L.push(
    ...panel(
      'EVERYDAY COMPO',
      [
        ['01.', pts('fishing_quiet'), 'fishing: nibbles, nothing, the usual, x19', 'her', flag('fishing_quiet')],
        ['02.', pts('coconut_sip'), 'coconut sip in the shade, eyes closed, x29', 'her', flag('coconut_sip')],
        ['03.', pts('sandcastle'), 'sandcastle, x10', 'her', flag('sandcastle')],
        ['04.', pts('jog_lap'), 'jog lap: there, back, breath, x19', 'her', flag('jog_lap')],
        ['05.', pts('tide_takes_sandcastle'), 'sandcastle removal, x10', 'the tide', flag('tide_takes_sandcastle')],
      ],
      '5 shown',
    ),
  );
  L.push('');
  L.push(
    ...panel(
      'SURVIVAL COMPO',
      [
        ['01.', pts('hammock'), 'hammock: palm to raft, no second tree, x2', 'her', flag('hammock')],
        ['02.', pts('signal_hunt'), 'signal hunt: one bar, top of the palm', 'her', flag('signal_hunt')],
        ['03.', pts('message_in_bottle'), 'message in a bottle: washes straight back', 'her', flag('message_in_bottle')],
        ['04.', pts('hammock_comes_down'), 'hammock, taken down again, x2', 'her', flag('hammock_comes_down')],
        ['', 'DNS', 'fire by friction', 'her', 'R'],
        ['', 'DNS', 'spear fishing', 'her', 'R'],
        ['', 'DNS', 'lookout up the palm', 'her', 'R'],
        ['', 'DNS', 'kumara, planted, grows all video', 'her', 'o'],
        ['', 'DNS', 'walks off over the water, back with coffee', 'her', 'S'],
      ],
      '4 shown . 5 DNS',
    ),
  );
  L.push('');
  L.push(
    ...panel(
      'SOUNDTRACK COMPO',
      [
        ['--', 'n/a', 'theme: 60 s, 80 BPM, F major, ii-V-I-vi', link('tools/make_audio.py', 'make_audio.py'), ' '],
        ['--', 'n/a', 'ocean ambience: 60 s seamless loop', link('tools/make_audio.py', 'make_audio.py'), ' '],
        ['--', 'n/a', 'more than 150 sound files, from code', link('tools/make_audio.py', 'make_audio.py'), ' '],
      ],
      '0 samples',
      [
        '',
        'Points withheld: nobody has listened to any of it yet. Electric piano,',
        'kalimba lead, soft drums, vinyl crackle, all synthesized: no samples, no',
        'stock loops, no recordings, so no third-party licence. Mix at -14 LUFS.',
      ],
    ),
  );
  L.push('');
  L.push(` ${rep('-', W - 2)}`);
  L.push(`  votes cast: 0 . voters: 0 (headphones) . events in the run: ${RUN.events}`);
  L.push('  t = timer: r every 2-5 min, o 12-25 min, R 30-60 min, S 3-6 h, c chained');
  L.push(`  DNS = did not show with seed ${RUN.seed}. All of them are in ${link('activities.toml')};`);
  L.push('  another seed may well bring them. Same seed, same run, event for event.');
  L.push(`  results: ${link('tools/schedule.py')} . logo: kelpie . orga: Isobath, who did nothing`);
  L.push(` ${rep('-', W - 2)}`);
  L.push('');
  const diz = [
    `   ${spaced('CASTAWAY')}   ${spaced('RESULTS')}`,
    `  ${RUN.length} run . seed ${RUN.seed} . ${AS_OF}`,
    '  the cat wins by turning up. the ship',
    '  placed without being seen. the tide',
    '  went 10 for 10. nobody voted.',
  ];
  L.push('@BEGIN_FILE_ID.DIZ');
  L.push(`.${rep('-', 43)}.`);
  for (const d of diz) L.push(`|${padR(d, 43)}|`);
  L.push(`'${rep('-', 43)}'`);
  L.push('@END_FILE_ID.DIZ');
}

// ---------------------------------------------------------------------------------------------
// 6. The invitation to the next run: how to run it, the rules and the prizes.
// ---------------------------------------------------------------------------------------------
const INVITE = [];
{
  const L = INVITE;
  L.push(center(`- = (   {b:${spaced('CASTAWAY INVITATION')}}   ) = -`));
  L.push(center('to the next ten hours on the island'));
  L.push('');
  L.push(center('>>>   bring nothing. she already has a coconut.   <<<'));
  L.push('');
  const field = (k, v) => L.push(`${padL(k, 22)} :  ${v}`);
  field('place', link('http://127.0.0.1:8765/'));
  field('doors', `python ${link('tools/serve.py')}`);
  field('dates', 'whenever you like. it is always daytime');
  field('duration', `${RUN.length}, or a 2-minute cut`);
  L.push('');
  const box = (title, items) => {
    const w = 36;
    const out = [` .-- ${title} ${rep('-', w - title.length - 5)}.`];
    for (const it of items) out.push(` |  ${padR(it, w - 3)}|`);
    out.push(` '- --- -- - -  -   -    -     -`);
    return out;
  };
  const left = box('organized by', [
    `${link('activities.toml')}      the timers`,
    `${link('tools/make_audio.py')}  the sound`,
    `${link('web/index.html')}       the stage`,
  ]);
  const right = box('sponsored by', ['nobody. no npm packages,', 'no build step, no samples', 'and no night shifts']);
  for (let i = 0; i < left.length; i++) L.push(`${padR(left[i], 40)}${right[i]}`);
  L.push('');
  L.push(heading('OPENING WORDS'));
  L.push('');
  L.push('  You are invited to ten hours on a very small island. A young woman in');
  L.push('  cream headphones sits by one tall palm and a raft and nods to the music.');
  L.push('  Every so often, on the next bar, something happens. Then nothing does.');
  L.push('  More than 90 activities wait their turn, most of them on four timers.');
  L.push('  Bring a drink. Do not expect a plot. She does not.');
  L.push('');
  L.push(heading('COMPETITIONS'));
  L.push('');
  L.push(`${padL('compo', 12)}    ${padL('size', 8)}  ${padL('length', 6)}   notes`);
  L.push(`${padL('-----', 12)}    ${padL('----', 8)}  ${padL('------', 6)}   -----`);
  for (const [name, bytes, ch, note] of SOUND) L.push(`${padL(name, 12)} :  ${padL(`${kb(bytes)} kb`, 8)}  ${padL(`${secs(bytes, ch)} s`, 6)}   ${note}`);
  L.push(`${padL('and', 12)} :  more than 150 entries in all, every one written from code`);
  L.push(`${padL('', 12)}    by ${link('tools/make_audio.py')} as a 48 kHz, 16-bit WAV.`);
  L.push('');
  L.push(heading('PRIZES'));
  L.push('');
  L.push('           1st  one bar of signal, at the very top of the palm');
  L.push('           2nd  another pair of headphones, delivered by drone');
  L.push('           3rd  an iced coffee. she will walk over the water for it');
  L.push('');
  L.push(heading('RULES'));
  L.push('');
  L.push('    1. 16:9 at 1080p, one fixed shot. Always daytime: no night entries.');
  L.push('    2. Every entry starts on the next bar of the music: every 3 seconds.');
  L.push('    3. Hard cuts and stepped movement by default. Machine in-betweening');
  L.push('       entered once and was disqualified.');
  L.push('    4. Four timers: every 2-5 min, 12-25 min, 30-60 min and 3-6 hours.');
  L.push('    5. Lanes let entries overlap, so a ship may sail past while she is');
  L.push('       busy with a coconut. Complaints will not be heard (headphones).');
  L.push('    6. Same seed, same run. The default is 1992.');
  L.push('');
  L.push(heading('GENERAL INFO'));
  L.push('');
  const info = (cmd, what) => L.push(`  ${padR(cmd, 36)} ${what}`);
  info(`python ${link('tools/serve.py')}`, 'live preview and MP4 export');
  info(`python ${link('tools/schedule.py')}`, 'checks the schedule, simulates 10 h');
  info(`python ${link('tools/render_demo.py')} --dev`, 'a dev reel of every activity');
  info(`python ${link('tools/make_audio.py')}`, 'writes every sound, from code');
  L.push('');
  L.push('  The renderer is a web page: plain ES modules, no build step. It exports');
  L.push('  frame-exact video in the browser (WebCodecs H.264, 68 to 78 frames a');
  L.push('  second at 1080p30 in Chrome), and the server mixes the sound in and joins');
  L.push(`  the two into a YouTube-ready MP4. Working notes: ${link('MUSING.md')}.`);
  L.push('');
  L.push(center('see you on the island. it will be exactly as you left it.'));
}

// ---------------------------------------------------------------------------------------------
// 7. Checks (width, characters, trailing space) and the page.
// ---------------------------------------------------------------------------------------------
function check(lines, where) {
  lines.forEach((l, i) => {
    const v = vis(l);
    if (v.length > W) throw new Error(`${where} line ${i + 1} is ${v.length} wide: ${v}`);
    if (/[^\x20-\x7e]/.test(v)) throw new Error(`${where} line ${i + 1} has a non-ASCII character: ${v}`);
    if (/\s$/.test(v)) throw new Error(`${where} line ${i + 1} has trailing whitespace: ${v}`);
  });
}
const pre = (lines, where) => {
  const clean = lines.map((l) => l.replace(/\s+$/, ''));
  check(clean, where);
  return ['<pre>', ...clean.map(html), '</pre>'].join('\n');
};

const md = [
  `<!-- Header ${SLUG} for Castaway: a demoparty results.txt. Generated by src/${SLUG}.mjs: edit that, not this. Figures checked ${AS_OF}. -->`,
  '',
  pre(FRONT, 'front'),
  '',
  `**Castaway** (working title) is a ten-hour lo-fi video for YouTube in which almost nothing happens, on purpose. A young woman sits on a tiny island with one tall palm and a raft and nods to the music on her headphones. Every so often, on the next bar of the music, something happens: a stray cat drifts in on a crate, her message in a bottle washes straight back, a coconut lands on a hermit crab and the crab walks off wearing it. Then she goes back to nodding. It is an unofficial remake inspired by the small-island routines and visual comedy of *Johnny Castaway*, the 1992 desert-island screensaver, in a sunny, hand-painted style where it is always daytime.`,
  '',
  `The results above are real screen time from one simulated run. More than 90 activities wait their turn in [activities.toml](activities.toml), most of them on four timers (from every few minutes to every few hours), and every sound is synthesized from code by [tools/make_audio.py](tools/make_audio.py): more than 150 files, no samples, no recordings. In development: no video has been published yet.`,
  '',
  '```sh',
  'python tools/serve.py',
  '# then open http://127.0.0.1:8765/ for the live preview and the MP4 export',
  '```',
  '',
  '<details>',
  '<summary><b>F U L L &nbsp; R E S U L T S</b> &nbsp;special awards, the other compos and the FILE_ID.DIZ</summary>',
  '',
  pre(REST, 'rest'),
  '',
  '</details>',
  '',
  '<details>',
  '<summary><b>I N V I T A T I O N</b> &nbsp;to the next ten hours: how to run it, the rules, the prizes</summary>',
  '',
  pre(INVITE, 'invite'),
  '',
  '</details>',
  '',
].join('\n');
if (/\u2014/.test(md)) throw new Error('house style: no em dashes');
fs.writeFileSync(OUT, md);
console.log(`wrote ${OUT}`);
