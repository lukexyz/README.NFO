// Stitches the twenty Castaway header examples into examples/castaway/README.md
// (GitHub shows it when you open the folder).
//   node examples/castaway/src/build-gallery.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.resolve(HERE, '..');
// [slug, name, one-line description, catalogue style id]: twenty styles drawn at random from ../../styles
const OPTIONS = [
  ["01-mode7-island_opus_5.5", "Mode 7 Island", "Animated SVG: a 256x144 early-90s rotating-floor title screen where one island map, redrawn in 48 depth-scaled strips, swings round a palm while she sips a coconut, a ship slips behind her head, and CASTAWAY is painted in the sand.", "mach-15"],
  ["02-bbs-stats_opus_5.5", "BBS Data Screens", "Animated SVG: Castaway as a 1990s BBS post-login screen, with a gradient logo, stats strip, a lightbar stepping through the island's visitors as last callers, hotkeys, a half-block island, and a ruled file-area table and FILE_ID.DIZ.", "ansi-05"],
  ["03-desktop-takeover_opus_5.5", "Fake Desktop Takeover", "Animated SVG: a period teal desktop with a castaway wallpaper and one dialog that an island takes over, where a ship sails past while she sips a coconut, with the gags, schedule and sound in pop-up dialog boxes below.", "pc-10"],
  ["04-fullwidth_opus_5.5", "Fullwidth Text", "Pure text: a vaporwave record sleeve in a pre block, with the name in fullwidth capitals and a Japanese subtitle beside a half-block palm, a shade-block sea, and the schedule set as a track list with real durations.", "vap-02"],
  ["05-shiftjis-aa_opus_5.5", "Shift_JIS AA", "Animated SVG: a 2channel-style thread with original Shift_JIS line art. CASTAWAY is spelled in the kanji 島, a girl in headphones sips a coconut under a palm, and a ship hoots past unnoticed.", "asia-04"],
  ["06-rfc-manpage_opus_5.5", "RFC / Man Page", "Pure text: a paginated 72-column RFC memo (Request for Calm 1992) plus a CASTAWAY(1) man page. Its tables, charts and diagrams are built from the real schedule's seed-1992 run.", "hack-03"],
  ["07-7bit-outline-nfo_opus_5.5", "7-bit Outline NFO", "Pure text: a 78-column 7-bit outline NFO with a slanted slash-and-underscore CASTAWAY logo, an ASCII island where a ship passes unseen, dot-leader fact rows and notched sections in details blocks.", "nfo-04"],
  ["08-tractor-feed_opus_5.5", "Tractor-Feed Printout", "Animated SVG: a nine-pin printer feeding green-bar tractor paper, printing a CASTAWAY banner page and an excerpt of the real schedule report beside a dot-matrix island picture, plus a static 80-column punched card with the run command.", "print-04"],
  ["09-pinball-dmd_opus_5.5", "Pinball Dot-Matrix Display", "Animated SVG: a 128x32 orange plasma pinball display by an invented maker. Its 60-second attract loop shows the title, the ship sailing past while she sips a coconut, a SHIP MISSED award, real schedule scores, gags and PRESS START.", "mach-11"],
  ["10-dir-art_opus_5.5", "C64 Directory Art", "Pure text: a Commodore 64 disk directory listing whose 0-block file names draw CASTAWAY, a palm island, a ship and her, with real project counts as block sizes, plus a blue-screen SVG twin.", "c64-04"],
  ["11-usenet-line-art_opus_5.5", "Usenet Line Art", "Pure text: a monochrome 7-bit ASCII Usenet post with a hand-drawn line-style picture of the island, palm, raft, turtle and an unseen passing ship, signed \"op\", plus folded follow-ups with nine more signed gag pictures and the facts.", "nfo-10"],
  ["12-bios-hijack_opus_5.5", "BIOS Setup Hijack", "Animated SVG: a navy 80x25 firmware setup screen whose menus are Castaway's real settings, until Save & Exit lets the island take over the panel, the divider becomes a palm, and a ship passes while she sips a coconut.", "pc-11"],
  ["13-bouncing-logo_opus_5.5", "Bouncing Idle Logo", "Animated SVG: a CASTAWAY wordmark with a palm-tree T bounces round a black 16:9 idle screen, changes colour at each bounce and hits a corner every 45 s, while a ship sails past unnoticed.", "idle-09"],
  ["14-off-air_opus_5.5", "Off-Air Idle", "Animated SVG: a 33-second off-air loop on an invented station, a circle test card whose picture is the island and the signal-hunt gag, then SMPTE colour bars with a hopping ident box, snow and a NO SIGNAL box.", "idle-10"],
  ["15-kefrens-bars_opus_5.5", "Vertical Copper Bars", "Animated SVG: Amiga-style vertical copper bars in sea, sun and coral braid behind CASTAWAY in sandcastle-brick capitals, with her nodding to the beat in the crook of the Y and a giant scroller of the gags.", "c64-07"],
  ["16-tfile_opus_5.5", "BBS T-File", "Pure text: a 78-column BBS t-file in the cDc tradition, with a slash-stroke palm emblem bursting through a double ASCII frame, a field guide to the schedule, gag bulletin and tool notes in folds, and a boxed board directory of project links.", "hack-02"],
  ["17-module-player_opus_5.5", "Text-Mode Module Player", "Animated SVG: Castaway's synthesized 60-second theme playing in an invented DOS text-mode module player, with the real score scrolling, a measured spectrum analyser, a CASTAWAY equaliser and a tiny unseen ship.", "trk-08"],
  ["18-tui-monitor_opus_5.5", "TUI Monitor", "Animated SVG: Castaway as a full-screen terminal process monitor, with lane meters as CPU cores, activities as a tree of processes, an F-key strip and a status line that watches a ship pass while she sips a coconut.", "hack-07"],
  ["19-megademo-menu_opus_5.5", "Megademo Menu", "Animated SVG: an Amiga megademo part-select menu with a chrome CASTAWAY logo, starfield, giant scroller and a blue-to-pink dotted-leader list of island gags whose cursor flips each pick to its timer, plus MAYBE.", "c64-06"],
  ["20-apple2-screen_opus_5.5", "Apple II Title Screen", "Animated SVG: an early-80s Apple II style six-colour hi-res title screen for Castaway, with block-capital CASTAWAY, an island scene where a ship passes unseen, 40-column credits and a stacked-panel credits page.", "demo-11"],
];
const styleLink = (id) => `[${id}](../../styles/${id.split('-')[0]}.md#${id})`;

const parts = [
  '# Castaway header examples',
  '',
  'Twenty retro README headers for Castaway (working title), a ten-hour lo-fi island video for YouTube: a young woman alone on a tiny island, idling to the music, while a schedule of gags plays out on the beat. It is an unofficial remake inspired by the 1992 screensaver *Johnny Castaway*, and is not affiliated with it or its owners. The project lives in `D:/python/castaway`, has no README or repository yet, and each header here is a candidate for the top of that future README.',
  '',
  'Every style was drawn at random from the [style catalogue](../../styles), excluding the ones already built for the other example sets. Each example is its own `.md` in this folder; animated art is in `assets/`, and the generator that rebuilds it is in `src/` (`node examples/castaway/src/<option>.mjs`). Rebuild this page with `node examples/castaway/src/build-gallery.mjs`. File links were written for the castaway project root, so they don\'t resolve here.',
  '',
  'Counts quoted (92 activities, 81 of them on four timers, 151 sound files) were checked against the project on 2026-10-01. The project is growing fast, so they will drift. Every crew, board, station, maker and person named is invented; real groups and products are style references only.',
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
