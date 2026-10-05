// Rebuild the saved draw without changing its selection or any other example sets.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, PROJECTS, STYLES, renderHeader, headerMarkdown, writeHeader } from './render.mjs';

const draw = JSON.parse(fs.readFileSync(path.join(ROOT, 'comparisons/pliny-first-draw/draw.json'), 'utf8'));
if (JSON.stringify(draw.styleIds) !== JSON.stringify(STYLES.map(s => s.id))) throw new Error('Renderer and saved draw disagree');
const scenes = {
  'naturalis-historia': [
    'An archive calibration plate: thirty-seven book marks circle a folio; the station ident wanders across the grid.',
    'An encyclopedia board directory: books, chapters and plates sit above a small reader discussion.',
    'A classical horizon becomes a VGA opening sequence, with the two-line title above Vesuvius and a drifting boat.',
    'A dial-in reading service: four numbered routes into the encyclopedia, with a book made from terminal cells.',
    'A bilingual reading desk: the library tree opens overlapping Latin and English windows, while Fortuna offers a page.'
  ],
  gl4ss: [
    'A temporal receiver has lost its lock on AD 79. The coastal feed and calibration strip sit beneath a roaming signal box.',
    'A field report from the Bay of Naples: coordinates, a selected year and an era preview occupy an article thread.',
    'Three small VGA windows show one place in AD 79, 1969 and 3050; the cue travels between them.',
    'A time-service form gives place, year and hour their own fields. The cursor waits for the next window to open.',
    'A desktop time instrument: a dial occupies its own settings window, beside a larger scene and a moving comparison slider.'
  ],
  st3gg: [
    'A full test transmission conceals the project inside the carrier: colour bars, an egg-lock emblem and a payload status box.',
    'A terminal file area lists image, audio, text and document carriers beside an egg emerging from a block preview.',
    'The carrier appears first. An interference band slowly uncovers ST3GG above a wireframe floor and original star field.',
    'A decoding service divides visible file and hidden reading: inspect the mosaic image, hear the audio or read the text.',
    'A carrier explorer puts section shortcuts beside a preview. A hidden layer appears in the picture while the progress strip cycles.'
  ]
};

function galleryGenerator(key) {
  const p = PROJECTS[key];
  // Keep this generator self-contained so the repository validator can rebuild it in isolation.
  const intro = `# ${p.name} — five scene studies\n\n${p.pitch}\n\n[Source repository](${p.url}) · [Live project](${p.live}) · [Compare all three repos](../../comparisons/pliny-first-draw/index.html) · [Shared draw](../pliny.md)\n\nThe same five catalogue styles were drawn once for NATURALIS-HISTORIA, GL4SS and ST3GG. Each project gets its own composition, scene and motion. These are unofficial header studies; source descriptions were checked on 2026-10-05.\n\nEach numbered Markdown file is a ready-to-copy header. Keep its matching SVG in an \`assets/\` folder. SVGs embed their artwork and Latin pixel lettering, scale to the available width, and support reduced motion. Terminal comments and file names are illustrative.\n\nTo rebuild this set from the repository root:\n\n\`\`\`sh\nnode tools/pliny-headers/build.mjs\n\`\`\`\n\nTo rebuild one header, run its matching \`src/NN-name.mjs\`. Project text lives in \`tools/pliny-headers/projects.json\`; the independent scene renderers live in \`tools/pliny-headers/render.mjs\`.\n\n`;
  const headers = STYLES.map((s, i) => ({ ...s, scene: scenes[key][i] }));
  const table = '| # | Header | Catalogue reference |\n| --- | --- | --- |\n' + STYLES.map((s, i) => `| ${String(i + 1).padStart(2, '0')} | [${s.name}](${s.slug}.md) | [${s.id}](../../styles/${s.id.split('-')[0]}.md#${s.id}) |`).join('\n') + '\n\n';
  return `// Generated gallery builder. Run from any directory; inputs are the five saved header files.\nimport fs from 'node:fs';\nimport path from 'node:path';\nimport { fileURLToPath } from 'node:url';\nconst directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');\nconst intro = ${JSON.stringify(intro + table)};\nconst headers = ${JSON.stringify(headers, null, 2)};\nlet output = intro;\nfor (const [index, header] of headers.entries()) {\n  output += '## ' + String(index + 1).padStart(2, '0') + ' · ' + header.name + ' · ' + header.id + '\\n\\n';\n  output += header.scene + '\\n\\n';\n  output += '[Copy the Markdown](' + header.slug + '.md) · [SVG](assets/' + header.slug + '.svg) · [Generator](src/' + header.slug + '.mjs)\\n\\n';\n  output += fs.readFileSync(path.join(directory, header.slug + '.md'), 'utf8').trim() + '\\n\\n---\\n\\n';\n}\nfs.writeFileSync(path.join(directory, 'README.md'), output);\nconsole.log('wrote ' + path.basename(directory) + '/README.md');\n`;
}

for (const key of draw.projects) {
  if (!PROJECTS[key]) throw new Error('Unknown saved project: ' + key);
  const directory = path.join(ROOT, 'examples', key);
  fs.mkdirSync(path.join(directory, 'src'), { recursive: true });
  STYLES.forEach((s, index) => {
    writeHeader(key, index);
    const wrapper = `// ${s.id}: original ${s.name} interpretation for ${PROJECTS[key].name}.\nimport { writeHeader } from '../../../tools/pliny-headers/render.mjs';\nwriteHeader(${JSON.stringify(key)}, ${index});\n`;
    fs.writeFileSync(path.join(directory, 'src', s.slug + '.mjs'), wrapper);
  });
  const generator = path.join(directory, 'src/build-gallery.mjs');
  fs.writeFileSync(generator, galleryGenerator(key));
  const result = spawnSync(process.execPath, [generator], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || 'Gallery build failed');
  process.stdout.write(result.stdout);
}

const data = {
  title: draw.title,
  checked: draw.sourceCheckedAt,
  projects: draw.projects.map(key => ({ key, ...PROJECTS[key] })),
  styles: STYLES,
  cards: STYLES.flatMap((style, index) => draw.projects.map(key => ({
    key, index, slug: style.slug, title: PROJECTS[key].name, scene: scenes[key][index],
    svg: renderHeader(key, index), markdown: headerMarkdown(key, index),
  })))
};
const template = fs.readFileSync(path.join(ROOT, 'tools/pliny-headers/comparison.html'), 'utf8');
const serialized = JSON.stringify(data).replaceAll('<', '\\u003c');
const comparison = template.replace('__DATA__', serialized);
fs.writeFileSync(path.join(ROOT, 'comparisons/pliny-first-draw/index.html'), comparison);

const hub = `# Pliny — one draw, three interpretations\n\nFifteen original README headers for three repositories by [elder-plinius](https://github.com/elder-plinius).\n\n**[Open the side-by-side comparison](../comparisons/pliny-first-draw/index.html)** — five rows, three repos per row, motion controls, enlarged views and SVG downloads. The page embeds every asset and works offline.\n\n| Repository | Saved gallery | Scene direction |\n| --- | --- | --- |\n${draw.projects.map(key => `| [${PROJECTS[key].name}](${PROJECTS[key].url}) | [Five headers](${key}/README.md) | ${PROJECTS[key].pitch} |`).join('\n')}\n\nThe same five references apply to every repository, with independent compositions and motion:\n\n${STYLES.map((s, i) => `${i + 1}. **${s.name}** — \`${s.id}\``).join('\n')}\n\nThe selection was drawn without replacement from the 152 non-duplicate catalogue entries and is saved in [draw.json](../comparisons/pliny-first-draw/draw.json). Rebuilding preserves that draw.\n\n\`\`\`sh\nnode tools/pliny-headers/build.mjs\n\`\`\`\n\nEdit project wording in [projects.json](../tools/pliny-headers/projects.json) and original SVG scenes in [render.mjs](../tools/pliny-headers/render.mjs). Individual generators sit beside each set in \`src/\`; gallery builders can also run independently.\n\nThese are unofficial design studies. Source README descriptions were checked on 2026-10-05. Terminal comments, sample file names and status activity are illustrative. SVGs support reduced motion and use no remote assets; Chinese terminal labels use a local system font fallback.\n`;
fs.writeFileSync(path.join(ROOT, 'examples/pliny.md'), hub);
console.log('wrote comparisons/pliny-first-draw/index.html and examples/pliny.md');
