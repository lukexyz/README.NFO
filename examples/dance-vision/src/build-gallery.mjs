// Stitches the six header examples into examples/dance-vision/README.md (GitHub shows it when you open the folder).
//   node examples/dance-vision/src/build-gallery.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.resolve(HERE, '..');
const OPTIONS = [
  ['01-nfo-release_opus_5.5', 'Scene Release NFO', 'Pure text: an 80-column .NFO with a shaded block logo, RELEASE INFO, INSTALL NOTES and GREETZ. No images, works everywhere, copy-pasteable.'],
  ['02-amiga-cracktro_opus_5.5', 'Amiga Cracktro', 'Animated SVG: chrome logo on copper bars, starfield, seven stick-figure dancers and a sine scroller. Below it, a ProTracker pattern where the channels are body joints.'],
  ['03-keygen-dialog_opus_5.5', 'Keygen Dialog', 'Animated SVG: a skinned mid-2000s keygen window with an LED spectrum analyser, a scrambling SERIAL field and a phone → relay → telly strip.'],
  ['04-c64-loader_opus_5.5', 'C64 SID Loader', 'Animated SVG: the C64 boots, LOAD"DANCE VISION",8,1, turbo-loader stripes, then a cracktro title with SID tune info. Quick start as a BASIC listing.'],
  ['05-crt-terminal_opus_5.5', 'Green Phosphor Terminal', 'Animated SVG: a CRT intrusion log, ACCESS GRANTED, a live hex dump of a joint packet and an F-key bar. Quick start as a shell session.'],
  ['06-ansi-bbs-pirate-fm_opus_5.5', 'ANSI BBS × Pirate Radio', 'Animated SVG: a 16-colour ANSI BBS login for DANCE VISION 87.87 FM (after port 8787), with a caller panel and a line-up of the venues. Below it, a BBS menu with real links.'],
];

const parts = [
  '# Dance Vision header examples',
  '',
  'Six chiptune / keygen / cracktro README headers, first made for the Dance Vision project. Each one replaces the title and pitch at the top of a README.',
  '',
  'Each example is its own `.md` in this folder. Animated art is in `assets/`, and the generator that rebuilds it is in `src/` (`node examples/dance-vision/src/<option>.mjs`). Rebuild this page with `node examples/dance-vision/src/build-gallery.mjs`. Anchor and doc links were written for the Dance Vision repo root, so they don\'t resolve here.',
  '',
  '| # | Option | What it is |',
  '| --- | --- | --- |',
  ...OPTIONS.map(([slug, name, blurb], i) => `| ${String(i + 1).padStart(2, '0')} | [${name}](${slug}.md) | ${blurb} |`),
  '',
];
for (const [i, [slug, name]] of OPTIONS.entries()) {
  const body = fs.readFileSync(path.join(DIR, `${slug}.md`), 'utf8').replace(/\r\n/g, '\n').trim();
  parts.push('<br>', '', '---', '', `## ${String(i + 1).padStart(2, '0')} · ${name}`, '', `<sub><code>${slug}.md</code></sub>`, '', body, '');
}
fs.writeFileSync(path.join(DIR, 'README.md'), parts.join('\n'));
console.log(`wrote ${path.join(DIR, 'README.md')} (${OPTIONS.length} options)`);
