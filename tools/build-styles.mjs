// Builds the style catalogue pages from styles/styles.json.
//   node tools/build-styles.mjs
// Writes styles/INDEX.md (every style in one table) and styles/<family>.md (full entries).
// styles/README.md is written by hand and is not touched. Edit styles.json, then rerun.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.resolve(HERE, '..', 'styles');
const data = JSON.parse(fs.readFileSync(path.join(DIR, 'styles.json'), 'utf8'));

const MEDIUM = { 'text-only': 'Text', 'animated-svg': 'Animated SVG', 'static-svg': 'Static SVG', 'text-plus-svg': 'Text + SVG' };
const BUILD = { easy: 'Easy', medium: 'Medium', hard: 'Hard', 'not-possible': 'Not possible' };

// The research text is prose that mentions HTML tags, dollar signs and asterisks. Escape anything
// GitHub would treat as markup, but leave `code spans` alone (entities are not decoded inside them).
const escText = (s) => s
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/([\\*_$~|[\]#])/g, '\\$1');
const esc = (s) => String(s).replace(/\r\n?/g, '\n').split(/(`[^`\n]+`)/).map((part, i) => (i % 2 ? part : escText(part))).join('');
const para = (s) => esc(s).split(/\n{2,}/).map((p) => p.replace(/\n/g, '  \n')).join('\n\n');
const oneLine = (s) => esc(s).replace(/\s*\n\s*/g, ' ');
const firstSentence = (s, max = 170) => {
  const flat = String(s).replace(/\s+/g, ' ').trim();
  const m = flat.match(/^.*?[.!?](?=\s|$)/);
  const cut = m && m[0].length <= max ? m[0] : `${flat.slice(0, max).replace(/\s+\S*$/, '')}...`;
  return oneLine(cut);
};
const link = (what, url) => `[${oneLine(what)}](<${url.replace(/[<>]/g, '')}>)`;

const byId = new Map();
for (const f of data.families) for (const s of f.styles) byId.set(s.id, { ...s, file: `${f.key}.md` });
const ref = (id) => `[${id}](${byId.get(id).file}#${id})`;

// ---------- family pages ----------
for (const f of data.families) {
  const out = [
    `# ${f.title}`,
    '',
    `<sub>Generated from <code>styles.json</code> by <code>tools/build-styles.mjs</code>. ${f.styles.length} styles, researched ${data.researched}. ${f.second_check
      ? `Checked by a second reviewer, who made ${f.corrections_made} corrections.`
      : 'Added in a gap-filling pass: checked by its own researcher only, not by a second reviewer.'} [Back to the catalogue](README.md) · [Full index](INDEX.md)</sub>`,
    '',
    "## Reviewer's summary",
    '',
    para(f.overview),
    '',
    '## Styles',
    '',
    '| ID | Style | Medium | Build | Impact |',
    '| --- | --- | --- | --- | --- |',
    ...f.styles.map((s) => `| [${s.id}](#${s.id}) | ${oneLine(s.name)} | ${MEDIUM[s.medium]} | ${BUILD[s.feasibility]} | ${s.wow}/5 |`),
    '',
  ];
  for (const s of f.styles) {
    out.push('---', '', `<a name="${s.id}"></a>`, '', `## ${s.id} · ${oneLine(s.name)}`, '');
    out.push(`**${MEDIUM[s.medium]}** · build: **${BUILD[s.feasibility]}** · impact: **${s.wow}/5** · ${oneLine(s.era)}`, '');
    if (s.duplicate_of) out.push(`> Same style as ${ref(s.duplicate_of)}, researched twice. Kept here for the extra detail.`, '');
    if (s.also_see) out.push(`> Also researched as ${s.also_see.map(ref).join(', ')}.`, '');
    out.push(para(s.what_it_is), '');
    out.push('**What it looks like**', '', ...s.visual_signature.map((v) => `- ${oneLine(v)}`), '');
    out.push(`**Palette.** ${oneLine(s.palette)}`, '');
    out.push(`**Lettering.** ${oneLine(s.typography)}`, '');
    out.push(`**Motion.** ${oneLine(s.motion)}`, '');
    out.push(`**As a README header.** ${oneLine(s.readme_translation)}`, '');
    out.push(`**How to build it.** ${oneLine(s.feasibility_notes)}`, '');
    out.push(`**Do not copy / caveats.** ${oneLine(s.caveats)}`, '');
    out.push('**References**', '', ...s.references.map((r) => `- ${link(r.what, r.url)}`), '');
  }
  if (f.left_out.length) out.push('---', '', '## Considered and left out', '', ...f.left_out.map((d) => `- ${oneLine(d)}`), '');
  if (f.research_notes.length) out.push('---', '', '## Research notes', '', ...f.research_notes.map((d) => `- ${oneLine(d)}`), '');
  fs.writeFileSync(path.join(DIR, `${f.key}.md`), out.join('\n'));
}

// ---------- index ----------
const total = data.families.reduce((n, f) => n + f.styles.length, 0);
const dupes = [...byId.values()].filter((s) => s.duplicate_of).length;
const idx = [
  '# Style index',
  '',
  `<sub>Generated from <code>styles.json</code> by <code>tools/build-styles.mjs</code>. ${total} entries, ${total - dupes} distinct styles, in ${data.families.length} families. [Back to the catalogue](README.md)</sub>`,
  '',
  'Medium: **Text** is plain text art in a `<pre>` block. **SVG** is an image file, animated or static. **Text + SVG** works either way. Build is how hard it is to make within GitHub\'s limits. Impact is the researchers\' own 1 to 5 guess at how striking it would be at the top of a repo.',
  '',
];
for (const f of data.families) {
  idx.push(`## [${f.title}](${f.key}.md)`, '', '| ID | Style | Medium | Build | Impact | What it is |', '| --- | --- | --- | --- | --- | --- |');
  for (const s of f.styles) {
    const note = s.duplicate_of ? ` (same as ${ref(s.duplicate_of)})` : '';
    idx.push(`| [${s.id}](${f.key}.md#${s.id}) | ${oneLine(s.name)}${note} | ${MEDIUM[s.medium]} | ${BUILD[s.feasibility]} | ${s.wow}/5 | ${firstSentence(s.what_it_is)} |`);
  }
  idx.push('');
}
idx.push('## Overlaps and shared building blocks', '', 'Noted by the final reviewer. Styles that share a primitive should share one implementation.', '', ...data.overlaps.map((o) => `- ${oneLine(o)}`), '');
fs.writeFileSync(path.join(DIR, 'INDEX.md'), idx.join('\n'));
console.log(`wrote INDEX.md and ${data.families.length} family pages (${total} entries, ${total - dupes} distinct)`);
