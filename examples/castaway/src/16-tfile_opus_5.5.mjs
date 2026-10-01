// BBS t-file header for the Castaway README (style catalogue entry hack-02).
// Plain Node, no dependencies, deterministic. Run:
//   node examples/castaway/src/16-tfile_opus_5.5.mjs
// It rewrites examples/castaway/16-tfile_opus_5.5.md. Edit this file, not the .md.
//
// THE STYLE
// A t-file is one numbered text file put out by a named group, wrapped in the same masthead
// and footer every time, so the file advertises the group wherever a board mirrors it. The
// layout borrowed here is the one the catalogue reads off cDc file #200 (1992): a double frame
// of underscores and pipes about 70 columns wide whose top edge is broken in the middle third,
// an emblem of slash strokes rising through that gap, one lower-case word letter-spaced along
// the inside bottom, a "...presents..." line, an over-long hyphen-chained title, the author
// pushed right, a centred imprint between triple chevrons with a dot leader to the year, the
// group's name between its initials, a two-row ruler with words sunk into it, body text
// indented five spaces with full-width underscore rules between scenes, and a boxed footer: a
// small mascot in a cell with rounded slash corners, a two-column board directory with dot
// leaders, a row of equals signs, a copyright line ending in a date and the file number, and a
// slogan. The bulletin block in #001-b borrows the sibling convention of the all-capitals BBS
// bulletin with a slash-drawn pager-hint funnel under a 39-hyphen rule.
// Credited references, of which nothing but the layout is used (no names, emblem, mascot,
// slogans or wording): cDc file #200 (1992), and the OSUNY bulletin on textfiles.com.
//
// Everything here is new: the group (the Society for the Prevention of Rescue, "sPr"), its
// bottle-mail series, the board names in the footer, the palm emblem and the coconut-and-crab
// mascot. Castaway is Luke's own project; the jokes are about it and nothing else.
//
// THE OUTPUT is 7-bit ASCII inside <pre>, at most 78 columns, with <b> and <a> only. The script
// refuses a line wider than 78 columns, a character outside printable ASCII, a tab or trailing
// whitespace, and it checks that the frame's letter-spaced word reads back as "castaway".
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SLUG = '16-tfile_opus_5.5';
const OUT = path.resolve(HERE, '..', `${SLUG}.md`);
const W = 78; // the page width of the file

// ---------------------------------------------------------------------------------------------
// 0. Small helpers
// ---------------------------------------------------------------------------------------------
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// String.raw blocks: drop the first and last newline, split into rows.
const art = (s) => s.replace(/^\r?\n/, '').replace(/\r?\n$/, '').split(/\r?\n/);
const pad = (s, n) => s + ' '.repeat(Math.max(0, n - s.length));
const centre = (s, width = W) => ' '.repeat(Math.max(0, Math.floor((width - s.length) / 2))) + s;
const right = (s, width = W) => ' '.repeat(Math.max(0, width - s.length)) + s;
const spaced = (word, gap = 3) => word.split('').join(' '.repeat(gap));
const leader = (name, value, width, dot = '.') => {
  const dots = width - name.length - value.length;
  if (dots < 2) throw new Error(`no room for a leader: "${name}" / "${value}" in ${width}`);
  return name + dot.repeat(dots) + value;
};

// A label, a dot leader, then the value starting at column `at` (measured on plain text).
const dotted = (label, at) => {
  const n = at - plain(label).length - 2;
  if (n < 2) throw new Error(`no room for dots after "${label}"`);
  return `${label} ${'.'.repeat(n)} `;
};
const hang = (at, text) => ' '.repeat(at) + text;
// The pager hint of the all-capitals bulletins: a 39-hyphen rule over a slash-drawn funnel.
function funnel(lines, w = 39) {
  const out = ['-'.repeat(w)];
  lines.forEach((t, i) => {
    const inner = w - 2 - 2 * i;
    const l = Math.floor((inner - t.length) / 2);
    if (l < 1) throw new Error(`funnel line too long: ${t}`);
    out.push(' '.repeat(i) + '\\' + ' '.repeat(l) + t + ' '.repeat(inner - l - t.length) + '/');
  });
  const i = lines.length;
  out.push(' '.repeat(i) + '\\' + '_'.repeat(w - 2 - 2 * i) + '/');
  return out;
}

// ---------------------------------------------------------------------------------------------
// 1. Inline markup for text lines. **bold** becomes <b>, [text](href) becomes <a href>.
//    Width is measured on the plain text, so links and bold cost no columns.
// ---------------------------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------------------------
// 2. The masthead. A character grid with a bold mask: the frame is thin, the palm is bold.
// ---------------------------------------------------------------------------------------------
function masthead() {
  const ROWS = 21;
  const ch = Array.from({ length: ROWS }, () => Array(W).fill(' '));
  const bold = Array.from({ length: ROWS }, () => Array(W).fill(false));
  // Spaces in a sprite are transparent; a backtick writes a real space.
  const put = (r, c, s, b = false) => {
    for (let i = 0; i < s.length; i++) {
      if (s[i] === ' ') continue;
      ch[r][c + i] = s[i] === '`' ? ' ' : s[i];
      bold[r][c + i] = b;
    }
  };
  const sprite = (r, c, rows, b = false) => rows.forEach((s, i) => put(r + i, c, s, b));

  // The double frame. Outer box columns L..R, inner box one cell inside it. The top edge is
  // broken from G0 to G1, where the palm comes up through it.
  const L = 4, R = 73, T = 7, B = 20, G0 = 23, G1 = 54;
  for (let c = L + 1; c < R; c++) if (c < G0 || c > G1) ch[T][c] = '_';
  ch[T + 1][L] = '|';
  ch[T + 1][R] = '|';
  for (let c = L + 3; c <= R - 3; c++) if (c < G0 || c > G1) ch[T + 1][c] = '_';
  for (let r = T + 2; r < B; r++) for (const c of [L, L + 2, R - 2, R]) ch[r][c] = '|';
  for (let c = L + 3; c <= R - 3; c++) ch[B - 1][c] = '_';
  ch[B][L] = '|';
  ch[B][R] = '|';
  for (let c = L + 1; c < R; c++) ch[B][c] = '_';

  // The horizon, broken here and there like a far-off swell.
  const HZ = 12;
  for (let c = L + 3; c <= R - 3; c++) ch[HZ][c] = '_';
  for (const c of [9, 22, 31, 48, 57, 66]) ch[HZ][c] = ' ';

  // A ship, on the horizon, on time. Its hull sits in the horizon line.
  sprite(HZ - 2, 12, art(String.raw`
    _||_
___|____|___
\__________/
`));
  // Always daytime.
  sprite(9, 59, art(String.raw`
 \ | /
-- O --
 / | \
`));
  // Ripples.
  put(14, 10, '_  __');
  put(17, 60, '__  _');
  // The island: a sand top on row 16, sloping down to the waterline on row 17.
  for (let c = 16; c <= 51; c++) ch[16][c] = '_';
  put(17, 10, '_____/');
  put(17, 52, String.raw`\_____`);
  // Her, at the far end, in headphones ([o]), fishing out to sea with her back to the
  // horizon: rod up from her hand, line down into the water. Fishing is one of the four
  // things the schedule waits for before it sends the ship past, so this is the joke.
  sprite(14, 46, art(String.raw`
[o] ____
/|_/    |
`));
  put(16, 46, '/`\\     |'); // her legs, with real sand-free space between them
  // Two shrubs, as on the real island, and a coconut that has already fallen.
  put(15, 26, '/\\/\\/\\');
  put(15, 39, '/\\/\\');
  put(16, 22, 'o');
  // The raft, a band of logs drawn the same way as the fronds.
  sprite(15, 59, art(String.raw`
 _________
/_/_/_/_/
`));
  // The emblem: a palm in thick slash strokes, crown above the frame, trunk down through the
  // gap to the sand. Drawn last so it sits in front of the horizon.
  sprite(0, 0, art(String.raw`
                              __________  __________
                      _______/_/_/_/_/_/\/\_\_\_\_\_\_______
                _____/_/_/_/_/  ______ /\ ______  \_\_\_\_\_\_____
              _/_/_/_/_/   ____/_/_/_/\/\/\_\_\_\____   \_\_\_\_\_\_
             /_/_/_/     _/_/_/_/  _/_/\/\_\_  \_\_\_\_     \_\_\_\_\
            /_/_/       /_/_/     /_/_/||\_\_\     \_\_\       \_\_\
                       /_/       /_/  o||o  \_\       \_\
                                       ||
                                       ||
                                      //
                                     //
                                    //
                                   //
                                   ||
                                   ||
                                   ||
                                   ||
`), true);

  // The one lower-case word, three spaces between letters, along the inside bottom.
  const word = spaced('castaway');
  const wc = Math.round((L + R + 1) / 2 - word.length / 2);
  put(B - 2, wc, word, true);
  if (ch[B - 2].join('').replace(/[\s|]/g, '') !== 'castaway') throw new Error('frame word does not read castaway');

  // Render rows: runs of bold cells (bridging spaces between them) go in one <b>.
  const out = [];
  for (let r = 0; r < ROWS; r++) {
    const row = ch[r].join('').replace(/\s+$/, '');
    let s = '';
    let c = 0;
    while (c < row.length) {
      if (bold[r][c] && row[c] !== ' ') {
        let e = c;
        let k = c;
        while (k < row.length) {
          if (row[k] !== ' ' && !bold[r][k]) break;
          if (row[k] !== ' ') e = k;
          k++;
        }
        s += `<b>${esc(row.slice(c, e + 1))}</b>`;
        c = e + 1;
      } else {
        s += esc(row[c]);
        c++;
      }
    }
    out.push({ plain: row, html: s });
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// 3. The ruler: a row of short underscore runs over a pipe-to-pipe line with words sunk in it.
// ---------------------------------------------------------------------------------------------
function ruler(words) {
  const inner = W - 2;
  const letters = words.reduce((n, w) => n + w.length, 0);
  const gaps = words.length + 1;
  // Runs of four, as in the originals; whatever is left over lengthens the two end runs.
  let spare = inner - letters - gaps * 4;
  if (spare < 0) throw new Error('ruler words too long');
  const runs = Array(gaps).fill(4);
  for (let i = 0; spare > 0; i++, spare--) runs[i % 2 ? gaps - 1 : 0]++;
  let bottom = '|';
  const top = Array(W).fill(' ');
  let c = 1;
  runs.forEach((n, i) => {
    // The top run sits over the inner end of each bottom run, so the ends read as boxes.
    const at = i === 0 ? c + n - 4 : c;
    for (let k = 0; k < 4; k++) top[at + k] = '_';
    bottom += '_'.repeat(n);
    c += n;
    if (i < words.length) {
      top[c + Math.floor(words[i].length / 2)] = '_';
      bottom += words[i];
      c += words[i].length;
    }
  });
  bottom += '|';
  return [top.join('').replace(/\s+$/, ''), bottom];
}

// ---------------------------------------------------------------------------------------------
// 4. The footer box: mascot cell, two-column board directory, equals row, imprint, slogan.
// ---------------------------------------------------------------------------------------------
const BOARDS = [
  // [board name, what you dial (shown), href]
  ['Logbook', 'MUSING.md', 'MUSING.md'],
  ['Tide Tables', 'activities.toml', 'activities.toml'],
  ['Lighthouse', 'tools/serve.py', 'tools/serve.py'],
  ['Front Porch', 'web/index.html', 'web/index.html'],
  ['Coastguard', 'tools/schedule.py', 'tools/schedule.py'],
  ['Jukebox', 'tools/make_audio.py', 'tools/make_audio.py'],
  ['Darkroom', 'tools/render_demo.py', 'tools/render_demo.py'],
  ['Local Shore', '127.0.0.1:8765', 'http://127.0.0.1:8765/'],
];
const FILE_NO = '#001';
const DATE = '2026.10.01';

function footer() {
  const COL = 33;
  // The mascot: a hermit crab wearing a coconut, which is how the coconut walks off.
  const mascot = art(String.raw`
 _______
/  ___  \
| /:::\ |
| \o_o/ |
|<// \\>|
\_______/
`).map((s) => pad(s, 9));
  const cell = (b) => {
    const text = leader(` ${b[0]}`, `${b[1]} `, COL);
    const at = text.length - b[1].length - 1;
    return {
      plain: text,
      html: esc(text.slice(0, at)) + `<a href="${b[2]}">${esc(b[1])}</a>` + esc(text.slice(at + b[1].length)),
    };
  };
  const rows = [];
  // The top edge runs between the pipes, so it stops one short of the right-hand one.
  rows.push({ plain: pad(mascot[0], 10) + '_'.repeat(W - 11) });
  for (let i = 0; i < 4; i++) {
    const a = cell(BOARDS[i]);
    const b = cell(BOARDS[i + 4]);
    const m = mascot[i + 1];
    rows.push({ plain: `${m}|${a.plain}|${b.plain}|`, html: `${esc(m)}|${a.html}|${b.html}|` });
  }
  rows.push({ plain: `${mascot[5]}|${'_'.repeat(COL)}|${'_'.repeat(COL)}|` });
  rows.push({ plain: '='.repeat(W) });
  const left = '(c)2026 Luke and the sPr. all waiting reserved.';
  const tag = `${DATE}-${FILE_NO}`;
  rows.push({ plain: left + ' '.repeat(W - left.length - tag.length) + tag });
  rows.push({ plain: centre('-sPr-  the ship is patient. she is busy. nobody is rescued.  -sPr-') });
  return rows.map((r) => ({ plain: r.plain, html: r.html ?? esc(r.plain) }));
}

// ---------------------------------------------------------------------------------------------
// 5. The words.
// ---------------------------------------------------------------------------------------------
const RULE = '_'.repeat(W);

const PRESENTS = [
  '  ...presents...',
  '',
  '       The sPr #001 **CASTAWAY**-Ten-Whole-Hours-0n-One-Very-Small-Island-',
  '       With-One-Palm-One-Raft-And-Alm0st-N0thing-Happening-0n-Purp0se File',
  '',
  right('by Luke, at one bar of signal', W - 3),
  '',
  centre('>>> bottled by the sPr.......2026 <<<'),
  centre('-sPr- SOCIETY FOR THE PREVENTION OF RESCUE -sPr-'),
];

const BODY = [
  '',
  '     **Castaway** (working title) is a ten-hour lo-fi video for YouTube in',
  '     which almost nothing happens, on purpose. A young woman, a very small',
  '     island, one tall palm, a raft and a great deal of time. She nods to the',
  '     music on her cream headphones, and every few minutes, on the next bar,',
  '     something happens: a coconut, a sea turtle, a drone delivering more',
  '     headphones. Out at sea, a ship waits for her to get busy, then sails',
  '     past. She never sees it. This is the system working as intended.',
  '',
  '     An unofficial remake inspired by the 1992 screensaver Johnny Castaway.',
  '     Sunny, hand-painted, always daytime. Every sound is synthesized from',
  '     code. In development: no video has been published yet.',
  RULE,
  '',
  '     **TO RUN IT**   $ python [tools/serve.py](tools/serve.py)   then open [http://127.0.0.1:8765/](http://127.0.0.1:8765/)',
  RULE,
];

const SECTIONS = [
  {
    summary: '<b>sPr #001-a</b> &nbsp;how to wait for a ship that will sail past anyway (the schedule)',
    lines: [
      '     **HOW TO WAIT FOR A SHIP THAT WILL SAIL PAST ANYWAY**',
      '     a field guide for the very small island, in seven easy steps',
      '',
      '     STEP 1.  Sit under the palm. Nod on the beat. You will be doing this',
      '              about two thirds of the time, so get comfortable.',
      '',
      '     STEP 2.  Every 2 to 5 minutes, do something regular. Sip a coconut.',
      '              Fish (nibbles, nothing). Jog a lap. Build a sandcastle and',
      '              let the tide have it. About 155 of these in ten hours.',
      '',
      '     STEP 3.  Every 12 to 25 minutes, something occasional. A sea turtle',
      '              swims in for a doze. The bottle you threw washes straight',
      '              back. About 30 of these.',
      '',
      '     STEP 4.  Every 30 to 60 minutes, a set piece. A drone lowers a parcel:',
      '              more headphones. A shark surfaces in headphones and nods',
      '              along. A stray cat drifts in on a crate. About 13 of these.',
      '',
      '     STEP 5.  Every 3 to 6 hours, three at most, the big one. She walks',
      '              out over the water and comes back with an iced coffee: she',
      '              could leave any time. Or she finally spots a ship, waves like',
      '              mad, and it honks back and sails on. About 2 of these.',
      '',
      '     STEP 6.  About 20 times a video, one thing leads to another. The tide',
      '              takes the sandcastle. The empty parcel box floats off. Hours',
      '              later, a different bottle brings a reply.',
      '',
      '     STEP 7.  Be busy. The ship is patient: it waits up to ten minutes for',
      '              you to sip a coconut, fish, jog or build a sandcastle, then',
      '              crosses in its own lane. You do not look up. (Headphones.)',
      RULE,
      '',
      '     **HOUSE RULES**',
      '       * every activity starts on the next bar of the music: every 3 s',
      '       * she is busy about a third of the time and idles the rest',
      '       * the counts above are the median of 200 simulated ten-hour runs',
      '       * the default run is 10:00:00 with seed 1992. no night scenes, ever',
      '       * it all lives in [activities.toml](activities.toml). to check it and simulate',
      '         a ten-hour run:  $ python [tools/schedule.py](tools/schedule.py)',
      '',
    ],
  },
  {
    summary: '<b>sPr #001-b</b> &nbsp;bulletin: things that have washed up (the gags)',
    lines: [
      ...funnel(['[SPACE] TO END . [CTRL-S] TO PAUSE', 'NOTHING HAPPENS EITHER WAY']),
      '',
      '**THE ISLAND BULLETIN BOARD.** THE FOLLOWING HAVE WASHED UP. PLEASE READ',
      'ALL OF THEM. THERE IS TIME.',
      '',
      ' > A MESSAGE IN A BOTTLE. SHE THREW IT. IT WASHED STRAIGHT BACK. A',
      '   DIFFERENT BOTTLE, HOURS LATER, BRINGS A REPLY.',
      ' > A PARCEL, BY DRONE. CONTENTS: ANOTHER PAIR OF HEADPHONES.',
      ' > A SEA TURTLE. VISITING. NO FURTHER BUSINESS.',
      ' > A STRAY CAT ON A CRATE. GREY TABBY, WHITE CHEST. CLIMBS THE PALM,',
      '   NAPS, AND ONE DAY FLOATS AWAY AGAIN. IT COMES BACK ANOTHER TIME.',
      ' > ONE (1) BAR OF SIGNAL. LOCATION: THE VERY TOP OF THE PALM.',
      ' > A SHARK WEARING HEADPHONES. NODS ON THE BEAT. HAS TASTE.',
      ' > A TOUR BOAT OF SELFIE-TAKERS. SHE IS IN THE BACKGROUND OF ALL OF THEM.',
      ' > A COCONUT. IT FELL ON A HERMIT CRAB, THEN WALKED OFF WITH THE CRAB',
      '   WEARING IT.',
      ' > A BRO ON AN ELECTRIC HYDROFOIL. WAVED A SHAKA. CARVED OFF.',
      ' > A KUMARA, PLANTED. IT GROWS OVER THE COURSE OF THE VIDEO.',
      ' > BUSHCRAFT: FIRE BY FRICTION, A HAMMOCK, A LOOKOUT UP THE PALM, AND',
      '   SPEAR FISHING.',
      ' > A SANDCASTLE. THE TIDE HAS IT NOW.',
      ' > A SHIP. SHE WAS BUSY.',
      '',
      'ALSO ON THE HORIZON: SCENE LIFE, 26 ENTRIES IN ALL. BUILT SO FAR: SHORE',
      'WAVES AND DRIFTING CLOUD SHADOWS. PLANNED: DISTANT BIRDS, PLANES WITH',
      'VAPOUR TRAILS, WHALE PODS, DOLPHINS, SAILBOATS, SANDPIPERS, A GECKO AND',
      'A RAIN SHOWER (IN DAYLIGHT, OBVIOUSLY).',
      '',
      '<<< END OF BULLETIN. NEXT ITEM IN 2 TO 5 MINUTES, GIVE OR TAKE A SHIP. >>>',
      '',
    ],
  },
  {
    summary: '<b>sPr #001-c</b> &nbsp;the sound of nothing happening (all synthesized, none of it heard)',
    lines: [
      '     **THE SOUND OF NOTHING HAPPENING**',
      '',
      '     Every sound in Castaway is synthesized from code, in',
      '     [tools/make_audio.py](tools/make_audio.py). No samples, no pre-made loops, no recordings,',
      '     so no third-party licence applies. Not even to the gulls.',
      '',
      '       ' + dotted('the theme', 20) + 'a seamless 60-second loop, 80 BPM, F major',
      '       ' + dotted('the changes', 20) + 'ii-V-I-vi, a chord a bar, five times round',
      '       ' + dotted('the bars', 20) + '20 of them, exactly 3 seconds each',
      '       ' + dotted('the band', 20) + 'electric piano, kalimba lead, soft drums,',
      hang(27, 'vinyl surface noise'),
      '       ' + dotted('the ocean', 20) + 'also a seamless 60-second loop',
      '       ' + dotted('the level', 20) + '-14 LUFS, true peak at or below -1 dBTP',
      '       ' + dotted('the knobs', 20) + 'master levels, and one per routine',
      '       ' + dotted('the reviews', 20) + 'none. nobody has listened to it yet.',
      '',
      '     The bars are exactly 3 seconds long and every activity starts on the',
      '     next one, so the gags land on the beat, heard or not.',
      '',
    ],
  },
  {
    summary: '<b>sPr #001-d</b> &nbsp;the machine room (tools, renderer, how the MP4 gets made)',
    lines: [
      '     **THE MACHINE ROOM**',
      '',
      dotted('     $ python [tools/serve.py](tools/serve.py)', 45) + 'the renderer. then open',
      hang(45, '[http://127.0.0.1:8765/](http://127.0.0.1:8765/)'),
      dotted('     $ python [tools/schedule.py](tools/schedule.py)', 45) + 'validate the schedule and',
      hang(45, 'simulate a ten-hour run'),
      dotted('     $ python [tools/render_demo.py](tools/render_demo.py) --dev', 45) + 'a dev reel of every activity,',
      hang(45, 'with a heads-up display (the'),
      hang(45, 'older Python reference renderer)'),
      '',
      '     The renderer is a web page, [web/index.html](web/index.html), with a live preview.',
      '     Plain ES modules, no build step, no npm packages. It exports',
      '     frame-exact video in the browser (WebCodecs H.264, 68 to 78 frames a',
      '     second at 1080p30 in Chrome), then the server mixes the sound and',
      '     joins the two into a YouTube-ready MP4.',
      '',
      '     Motion: hard cuts and stepped movement, by default. She does not',
      '     glide. She has standards.',
      '',
    ],
  },
  {
    summary: '<b>sPr #001-e</b> &nbsp;greetz, and the fine print',
    lines: [
      '     **GREETZ** to the regulars: the sea turtle, the grey tabby with the',
      '     white chest, the hermit crab (and its coconut), the shark with the',
      '     good headphones, the bro on the hydrofoil, the selfie boat, the',
      '     drone, and the ship, for waiting politely until she was busy.',
      '',
      '     **THE FINE PRINT.** Castaway is an unofficial fan remake, inspired by',
      '     the 1992 screensaver Johnny Castaway, which belongs to its owners.',
      '     This project is not affiliated with them. The island, the art, the',
      '     code and every sound here are new. The Society for the Prevention of',
      '     Rescue is made up, and so are its boards. The waiting is real.',
      '',
    ],
  },
];

// ---------------------------------------------------------------------------------------------
// 6. Assemble, lint, write.
// ---------------------------------------------------------------------------------------------
const problems = [];
function lint(where, p) {
  if (p.length > W) problems.push(`${where}: ${p.length} columns: ${p}`);
  if (/[^\x20-\x7e]/.test(p)) problems.push(`${where}: non-ASCII or control character: ${p}`);
  if (/\s$/.test(p)) problems.push(`${where}: trailing whitespace: ${p}`);
}
const textBlock = (where, lines) =>
  lines.map((l, i) => {
    const p = plain(l);
    lint(`${where}:${i + 1}`, p);
    return html(l).replace(/\s+$/, '');
  });

const mast = masthead();
mast.forEach((r, i) => lint(`masthead:${i + 1}`, r.plain));
const rule = ruler(['one_island', 'one_palm', 'one_raft', 'one_bar', 'one_ship', 'missed']);
rule.forEach((r, i) => lint(`ruler:${i + 1}`, r));
const foot = footer();
foot.forEach((r, i) => lint(`footer:${i + 1}`, r.plain));

const md = [];
md.push(`<!-- Header ${SLUG} for Castaway. Generated by src/${SLUG}.mjs: edit that, not this. -->`);
md.push('');
md.push('<pre>');
md.push(...textBlock('top', [`sPr bottle-mail: t-file ${FILE_NO}`, '']));
md.push(...mast.map((r) => r.html));
md.push('');
md.push(...textBlock('presents', PRESENTS));
md.push(...rule.map(esc));
md.push(...textBlock('body', BODY));
md.push('</pre>');
md.push('');
for (const [i, s] of SECTIONS.entries()) {
  md.push('<details>');
  md.push(`<summary>${s.summary}</summary>`);
  md.push('');
  md.push('<pre>');
  md.push(...textBlock(`section${i + 1}`, s.lines));
  md.push('</pre>');
  md.push('');
  md.push('</details>');
  md.push('');
}
md.push('<pre>');
md.push(...foot.map((r) => r.html));
md.push('</pre>');
md.push('');

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
fs.writeFileSync(OUT, md.join('\n'));
console.log(`wrote ${path.relative(process.cwd(), OUT)}`);
if (process.argv.includes('--print')) {
  console.log([...mast.map((r) => r.plain), '', ...PRESENTS.map(plain), ...rule, ...BODY.map(plain), '', ...foot.map((r) => r.plain)].join('\n'));
}
