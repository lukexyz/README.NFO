// Generated gallery builder. Run from any directory; inputs are the five saved header files.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const intro = "# GL4SS — five scene studies\n\nA place. A year. A window through time.\n\n[Source repository](https://github.com/elder-plinius/GL4SS) · [Live project](https://gl4ss.ai/) · [Compare all three repos](../../comparisons/pliny-first-draw/index.html) · [Shared draw](../pliny.md)\n\nThe same five catalogue styles were drawn once for NATURALIS-HISTORIA, GL4SS and ST3GG. Each project gets its own composition, scene and motion. These are unofficial header studies; source descriptions were checked on 2026-10-05.\n\nEach numbered Markdown file is a ready-to-copy header. Keep its matching SVG in an `assets/` folder. SVGs embed their artwork and Latin pixel lettering, scale to the available width, and support reduced motion. Terminal comments and file names are illustrative.\n\nTo rebuild this set from the repository root:\n\n```sh\nnode tools/pliny-headers/build.mjs\n```\n\nTo rebuild one header, run its matching `src/NN-name.mjs`. Project text lives in `tools/pliny-headers/projects.json`; the independent scene renderers live in `tools/pliny-headers/render.mjs`.\n\n| # | Header | Catalogue reference |\n| --- | --- | --- |\n| 01 | [Off-air test card](01-off-air.md) | [idle-10](../../styles/idle.md#idle-10) |\n| 02 | [Taiwanese BBS board](02-telnet-board.md) | [asia-03](../../styles/asia.md#asia-03) |\n| 03 | [PC demo opening titles](03-demo-titles.md) | [demo-01](../../styles/demo.md#demo-01) |\n| 04 | [Monochrome viewdata](04-viewdata.md) | [ansi-09](../../styles/ansi.md#ansi-09) |\n| 05 | [Luna desktop](05-luna-desktop.md) | [vap-09](../../styles/vap.md#vap-09) |\n\n";
const headers = [
  {
    "id": "idle-10",
    "slug": "01-off-air",
    "name": "Off-air test card",
    "note": "Calibration geometry, signal bars and an idle station ident, interpreted for this project.",
    "scene": "A temporal receiver has lost its lock on AD 79. The coastal feed and calibration strip sit beneath a roaming signal box."
  },
  {
    "id": "asia-03",
    "slug": "02-telnet-board",
    "name": "Taiwanese BBS board",
    "note": "Inverse-video terminal headers, project-specific records and illustrative push comments.",
    "scene": "A field report from the Bay of Naples: coordinates, a selected year and an era preview occupy an article thread."
  },
  {
    "id": "demo-01",
    "slug": "03-demo-titles",
    "name": "PC demo opening titles",
    "note": "Plain VGA pixel lettering, procedural scenery and a slowly changing title sequence.",
    "scene": "Three small VGA windows show one place in AD 79, 1969 and 3050; the cue travels between them."
  },
  {
    "id": "ansi-09",
    "slug": "04-viewdata",
    "name": "Monochrome viewdata",
    "note": "A monochrome service terminal with numbered choices, cell mosaics and a choice cursor.",
    "scene": "A time-service form gives place, year and hour their own fields. The cursor waits for the next window to open."
  },
  {
    "id": "vap-09",
    "slug": "05-luna-desktop",
    "name": "Luna desktop",
    "note": "Original rolling hills, blue window chrome and a desktop application for this project.",
    "scene": "A desktop time instrument: a dial occupies its own settings window, beside a larger scene and a moving comparison slider."
  }
];
let output = intro;
for (const [index, header] of headers.entries()) {
  output += '## ' + String(index + 1).padStart(2, '0') + ' · ' + header.name + ' · ' + header.id + '\n\n';
  output += header.scene + '\n\n';
  output += '[Copy the Markdown](' + header.slug + '.md) · [SVG](assets/' + header.slug + '.svg) · [Generator](src/' + header.slug + '.mjs)\n\n';
  output += fs.readFileSync(path.join(directory, header.slug + '.md'), 'utf8').trim() + '\n\n---\n\n';
}
fs.writeFileSync(path.join(directory, 'README.md'), output);
console.log('wrote ' + path.basename(directory) + '/README.md');
