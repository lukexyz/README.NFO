import fs from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { escapeXml } from './svg.mjs';
import { renderDesign, selectDesigns } from './designs.mjs';

const markdownText = value => String(value).replace(/[\\`*_{}\[\]()#+.!|<>]/g, '\\$&');
export function createBundle(project, { count = 10, seed = randomBytes(16).toString('hex') } = {}) {
  const selected = selectDesigns(count, seed);
  const files = new Map(), picks = [];
  for (const [index, design] of selected.entries()) {
    const slug = `${String(index + 1).padStart(2, '0')}-${design.id}`;
    const markdown = `<p align="center">\n  <a href="${escapeXml(project.url)}"><img src="assets/${slug}.svg" width="100%" alt="${escapeXml(project.name)} — ${escapeXml(design.name)}"></a>\n</p>\n`;
    const image = renderDesign(design, project);
    files.set(`${slug}.md`, markdown);
    files.set(`assets/${slug}.svg`, image);
    picks.push({ id: design.id, name: design.name, slug, markdown });
  }
  files.set('project.json', JSON.stringify(project, null, 2) + '\n');
  files.set('manifest.json', JSON.stringify({ generator: 'README.NFO', version: 1, seed, count, project: project.fullName,
    options: picks.map(({ id, name, slug }) => ({ id, name, markdown: `${slug}.md`, image: `assets/${slug}.svg` })) }, null, 2) + '\n');
  files.set('LICENSE', fs.readFileSync(new URL('../../LICENSE', import.meta.url), 'utf8'));
  files.set('README.md', `# Headers for ${markdownText(project.name)}\n\n[Project](${project.url}) · [Open the visual gallery](index.html)\n\nChoose a header, copy its SVG into your repository's \`assets/\` folder and paste its matching Markdown at the top of your README. Keep the included [MIT notice](LICENSE). Image paths are relative to your README.\n\n` +
    picks.map(pick => `## ${pick.slug.slice(0, 2)} — ${pick.name}\n\n[Markdown](${pick.slug}.md) · [SVG](assets/${pick.slug}.svg)\n\n![${markdownText(project.name)} — ${pick.name}](assets/${pick.slug}.svg)\n`).join('\n'));
  files.set('index.html', gallery(project, picks));
  return { files, picks, seed };
}

function gallery(project, picks) {
  const cards = picks.map(pick => `<article><h2>${pick.slug.slice(0, 2)} · ${escapeXml(pick.name)}</h2>
<a href="assets/${pick.slug}.svg"><img src="assets/${pick.slug}.svg" alt="${escapeXml(project.name)} — ${escapeXml(pick.name)}"></a>
<p><a href="${pick.slug}.md">Markdown</a> · <a href="assets/${pick.slug}.svg" download>Save SVG</a></p>
<details><summary>Copy Markdown</summary><textarea readonly aria-label="Markdown for ${escapeXml(pick.name)}">${escapeXml(pick.markdown)}</textarea><button type="button">Copy</button></details></article>`).join('\n');
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeXml(project.name)} — header gallery</title><style>
:root{color-scheme:dark;--bg:#11151b;--card:#1b222c;--fg:#e9eff7;--muted:#a9bacd;--line:#38485b}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.55 system-ui,sans-serif;padding:32px}main{max-width:1500px;margin:auto}h1{font-size:30px;margin:0}h2{font-size:17px;margin:0 0 16px}p{color:var(--muted)}a{color:#8dc6ff}header{margin-bottom:28px}section{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}article{padding:20px;background:var(--card);border:1px solid var(--line);border-radius:12px}img{display:block;width:100%;height:auto}summary,button{cursor:pointer}textarea{display:block;width:100%;height:116px;margin:12px 0;padding:10px;border:1px solid var(--line);background:var(--bg);color:var(--fg);font:13px/1.5 monospace}button{padding:7px 16px;border:1px solid var(--line);border-radius:5px;background:var(--bg);color:var(--fg)}@media(max-width:780px){body{padding:16px}section{grid-template-columns:1fr}article{padding:14px}h1{font-size:24px}}
</style><main><header><h1>${escapeXml(project.name)} — ${picks.length} headers</h1><p><a href="${escapeXml(project.url)}">${escapeXml(project.fullName)}</a></p><p>Choose a look. Save its SVG to your repository's assets/ folder, then paste the matching Markdown into your README. Keep the <a href="LICENSE">MIT notice</a>.</p></header><section>${cards}</section></main>
<script>document.querySelectorAll('button').forEach(button=>button.addEventListener('click',async()=>{const area=button.previousElementSibling;try{await navigator.clipboard.writeText(area.value);button.textContent='Copied'}catch{area.focus();area.select();button.textContent='Selected — press Ctrl/Cmd+C'}}));</script></html>\n`;
}

export function defaultOutput(project, cwd = process.cwd()) {
  const base = path.join(cwd, 'readme-headers', `${project.owner}-${project.repo}`);
  let output = base, number = 2;
  while (fs.existsSync(output)) output = `${base}-${number++}`;
  return output;
}

export function writeBundle(bundle, output) {
  const target = path.resolve(output);
  if (fs.existsSync(target)) throw new Error(`Output already exists: ${target}. Choose a new --out directory.`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.mkdirSync(target); // Exclusive destination: an existing directory is never overwritten.
  for (const [relative, contents] of bundle.files) {
    const filename = path.join(target, relative);
    fs.mkdirSync(path.dirname(filename), { recursive: true });
    fs.writeFileSync(filename, contents, { flag: 'wx' });
  }
  return target;
}
