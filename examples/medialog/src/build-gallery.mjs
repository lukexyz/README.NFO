// Stitches the ten MediaLog header examples into examples/medialog/README.md
// (GitHub shows it when you open the folder).
//   node examples/medialog/src/build-gallery.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.resolve(HERE, '..');
// [slug, name, blurb, catalogue ID]: ten styles drawn at random from the catalogue in ../../styles
const OPTIONS = [
  ['01-text-mode-tracker_opus_5.5', 'DOS Text-Mode Tracker', 'Animated SVG: MediaLog as an olive-gold DOS text-mode tracker, its four channels (Watched, Read, Played, Listened to) scrolling an invented media diary from 2016 to today in kind colours. Orders are five-year blocks, a vague date is a "?? ???" row, and the song ends on today with a blinking cursor.', 'trk-04'],
  ['02-vhs-tape_opus_5.5', 'VHS Tape', 'Animated SVG: a purple VHS home video of one living room, rewound through four recordings that cycle the verb, with a camcorder date stamp that ends at SOMETIME IN 2015-2019, plus colour bars in the kind colours.', 'vap-03'],
  ['03-atari-8-bit-demo_opus_5.5', 'Atari 8-Bit Demo Screen', 'Animated SVG: an 8-bit demo screen with a wide-pixel chrome MediaLog logo in kind colours, a cycling verb, four friends on the grass and the log buried as five-year layers of fossils.', 'demo-09'],
  ['04-sysop-waiting-screen_opus_5.5', "Sysop's Waiting-for-Caller Screen", 'Animated SVG: MediaLog as a 1990s BBS sysop\'s waiting-for-caller console, grey stipple and cyan-framed windows, where friends dial in to log what they finished and the kind-coloured logo letters jump.', 'xfer-08'],
  ['05-shaded-block-nfo_opus_5.5', 'Shaded Block NFO', 'Animated SVG: a 1990s shaded block NFO screen for MediaLog, with a cycling verb that recolours the logo\'s shadow bands and a timeline that fades from solid to dots as the dates get vaguer. A text NFO is collapsed below.', 'nfo-02'],
  ['06-procedural-effects_opus_5.5', 'Full-Frame Procedural Effects', 'Animated SVG: a VGA-style voxel flight over hills striped in MediaLog\'s kind colours, with level-of-detail bands labelled as five-year blocks and a palette swap per verb. Past the last block there is only fog.', 'demo-03'],
  ['07-piano-roll_opus_5.5', 'Piano Roll and Falling Notes', 'Animated SVG: a dark piano-roll editor whose coloured notes spell MediaLog across 2015 to now in five-year bars, with lit keys, a cycling verb, pedal notes for "sometime in" and a status bar of invented diary entries.', 'trk-10'],
  ['08-arcade-attract_opus_5.5', 'Arcade Attract Mode', 'Animated SVG: a cocktail-table arcade seen from above, looping MediaLog\'s title, kind colours, a timeline demo and a high-score table where every score is a date. Player 2 is FRIENDS, and the picture flips for them.', 'mach-08'],
  ['09-chrome-spheres_opus_5.5', 'Chrome Spheres over a Checkerboard', 'Animated SVG: an italic chrome MEDIALOG logo over a receding checker floor, six kind-coloured mirror spheres on a carousel, a verb drum, a day-night sky and a horizon scroller.', 'pc-03'],
  ['10-tractor-feed_opus_5.5', 'Tractor-Feed Printout', 'Animated SVG: MEDIALOG as a dot-matrix home banner on rainbow fan-fold, a printer cycling through WATCHED, READ, PLAYED and LISTENED TO, a green-bar slip, and a drawer of punched cards holding one person\'s log.', 'print-04'],
];
const styleLink = (id) => `[${id}](../../styles/${id.split('-')[0]}.md#${id})`;

const parts = [
  '# MediaLog header examples',
  '',
  'Ten retro README headers for MediaLog, a media diary you share: log a film, a book, a show, a game, an album or a podcast, when, and how it was, then see what the people you know have been into. Each one replaces the title and pitch at the top of that README. The ten styles were drawn at random from the [style catalogue](../../styles), and each header is an original composition, not a template. Build times are in [../build-log.csv](../build-log.csv).',
  '',
  'Each example is its own `.md` in this folder. Animated art is in `assets/`, and the generator that rebuilds it is in `src/` (`node examples/medialog/src/<option>.mjs`). Rebuild this page with `node examples/medialog/src/build-gallery.mjs`. MediaLog is in development, so the headers carry no links, install commands or badges. The facts come from the owner\'s description and two screenshots of the app: the kinds and their colours, the five-year timeline, *sometime in*, reactions, notes, the feed and threads.',
  '',
  'Every title, creator, friend, studio and band in the pictures is invented; the only real works named are public-domain classics. Real trackers, computers and BBS programs are style references only: none of their names, logos or lettering is drawn. The open-book mark and the kind colours are MediaLog\'s own.',
  '',
  '| # | Option | Style | What it is |',
  '| --- | --- | --- | --- |',
  ...OPTIONS.map(([slug, name, blurb, id], i) => `| ${String(i + 1).padStart(2, '0')} | [${name}](${slug}.md) | ${styleLink(id)} | ${blurb} |`),
  '',
];
for (const [i, [slug, name]] of OPTIONS.entries()) {
  const body = fs.readFileSync(path.join(DIR, `${slug}.md`), 'utf8').replace(/\r\n/g, '\n').trim();
  parts.push('<br>', '', '---', '', `## ${String(i + 1).padStart(2, '0')} · ${name}`, '', `<sub><code>${slug}.md</code></sub>`, '', body, '');
}
fs.writeFileSync(path.join(DIR, 'README.md'), parts.join('\n'));
console.log(`wrote ${path.join(DIR, 'README.md')} (${OPTIONS.length} options)`);
