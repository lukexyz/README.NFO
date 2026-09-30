// Stitches the twelve ULTRA-SATISFACTORY header examples into examples/ultra-satisfactory/README.md
// (GitHub shows it when you open the folder).
//   node examples/ultra-satisfactory/src/build-gallery.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.resolve(HERE, '..');
const OPTIONS = [
  ['01-nfo-release_opus_5.5', 'Scene Release NFO', 'Pure text: an 80-column .NFO with a block-character logo and hex-cog emblem, RELEASE INFO, PAYLOAD and INSTALL NOTES, and a three-tab flow diagram. Phase list, factory skyline, credits and greetz are collapsed. No images, works everywhere.'],
  ['02-amiga-cracktro_opus_5.5', 'Amiga Cracktro', 'Animated SVG: a chrome logo over copper bars and a starfield, above a pixel production line (Smelter, Constructor, Assembler, Space Elevator) and a sine scroller. Below it, a ProTracker pattern where the channels are machines and the notes are real per-minute recipe rates.'],
  ['03-keygen-dialog_opus_5.5', 'Keygen Dialog', 'Animated SVG: a skinned mid-2000s keygen window that generates recipes, not keys. It types an item, scrambles, and settles on four real recipes with machine, cycle time, power and rates, above a strip linking the three tabs.'],
  ['04-c64-loader_opus_5.5', 'C64 SID Loader', 'Animated SVG on a 15 s loop: the C64 boots, LOAD"ULTRA-SATISFACTORY",8,1, turbo-loader stripes, then a title screen where a pointer clicks through the three tabs while a conveyor feeds an Assembler. Quick start as a BASIC listing.'],
  ['05-crt-terminal_opus_5.5', 'Control Terminal', 'Animated SVG: an amber phosphor CRT that boots, shows ACCESS GRANTED, then looks up Space Elevator phase 2, the Modular Frame recipe and the Assembler. Quick start as a shell session.'],
  ['06-ansi-bbs_opus_5.5', 'ANSI BBS', 'Animated SVG: a 16-colour ANSI BBS login for THE CLOGGED MERGER BBS, with the Modular Frame recipe running through an Assembler, the five Space Elevator phases as the line-up and the nine production machines as the shift roster. Below it, a BBS menu with real links.'],
  // 07 to 12: styles drawn at random from the catalogue in ../../styles (the fourth field is the catalogue ID)
  ['07-compo-slides_opus_5.5', 'Demoparty Compo Slides', 'Animated SVG: a demoparty big screen seen over a crowd, cycling through a title slide, a countdown, one slide per app tab and a prize-giving with score bars. Below it, a text results table ranking ten real recipes by items per minute.', 'demo-07'],
  ['08-milkdrop-visualiser_opus_5.5', 'MilkDrop Visualiser', 'Animated SVG: an early-2000s music visualiser with nothing playing. Rings zoom out of a hex-cog behind the title and cross-fade through three presets, one per tab. A playlist of 16 real recipes is collapsed below.', 'idle-04'],
  ['09-oscilloscope_opus_5.5', 'Oscilloscope Channels', 'Animated SVG: the title as a glowing trace above a 3x3 grid of scopes, one per production machine, each with its own waveform and a real recipe readout (items per minute, cycle seconds, MW). Channel 10 is the Pioneer, flatlining.', 'trk-09'],
  ['10-arcade-attract_opus_5.5', 'Arcade Attract Mode', 'Animated SVG: an arcade cabinet front whose screen loops a title card, a to-scale screw-factory demo and a high-score table of the five Space Elevator phases. INSERT NOTHING: free play, it is Apache 2.0.', 'mach-08'],
  ['11-win32-cracktro_opus_5.5', 'Win32 Cracktro', 'Animated SVG: a mid-2000s Windows cracktro with a bevelled chrome logo on a mirror floor between two twisting steel girders, a three-page text-writer and a dot-matrix sine scroller. An 80-column NFO is collapsed below.', 'pc-05'],
  ['12-cassette-jcard_opus_5.5', 'Netlabel Cassette', 'Animated SVG: an orange cassette with turning reels beside its opened J-card and obi strip. The track list is twelve recipes whose running times are their real craft cycles, and the deck counter adds them up.', 'print-02'],
];
const styleLink = (id) => (id ? `[${id}](../../styles/${id.split('-')[0]}.md#${id})` : 'original six');

const parts = [
  '# ULTRA-SATISFACTORY header examples',
  '',
  'Twelve retro README headers for [ULTRA-SATISFACTORY](https://github.com/lukexyz/ULTRA-SATISFACTORY), a companion app for the game *Satisfactory*. Each one replaces the title and one-line pitch at the top of that README. 01 to 06 use the same six styles as the [Dance Vision examples](../dance-vision), redrawn around a factory. 07 to 12 use six styles drawn at random from the [style catalogue](../../styles).',
  '',
  'Each example is its own `.md` in this folder. Animated art is in `assets/`, and the generator that rebuilds it is in `src/` (`node examples/ultra-satisfactory/src/<option>.mjs`). Rebuild this page with `node examples/ultra-satisfactory/src/build-gallery.mjs`. Anchor and file links were written for the ULTRA-SATISFACTORY repo root, so they don\'t resolve here. Every number quoted (140 items, 211 recipes, 477 buildings, recipe rates and cycle times) was checked against that repo\'s data on 2026-09-30.',
  '',
  'Unofficial fan work, not affiliated with Coffee Stain Studios. The art is original. The keygen and cracktro styling is parody of the app itself, which is free and Apache 2.0: nothing here cracks, unlocks or offers a key for the game. Every crew, label, party and cabinet maker named is invented.',
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
