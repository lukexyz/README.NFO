import fs from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { escapeXml } from './svg.mjs';
import { renderDesign, renderTextHeader, selectDesigns } from './designs.mjs';
import { catalogue } from './catalogue.mjs';
import { checkSvgXml } from './svg-xml.mjs';
import { runtime } from './terminal.mjs';

const md = value => String(value).replace(/[\\`*_{}\[\]()#+.!|<>]/g, '\\$&');
const fence = value => '`'.repeat(Math.max(3, ...[...value.matchAll(/`+/g)].map(match=>match[0].length+1)));

export function createBundle(project, { count=10, seed=randomBytes(16).toString('hex'), format='all', exclude=[], styles, creativity=0, onProgress=()=>{} }={}) {
  const started=performance.now(), selected=selectDesigns(count,seed,{format,exclude,styles});
  const files=new Map(), picks=[];
  onProgress(0,count,'Drawing styles');
  for(const [index,design] of selected.entries()) {
    const number=String(index+1).padStart(Math.max(2,String(count).length),'0'), slug=`${number}-${design.id}`;
    const actualFormat=format==='text'||design.medium==='text-only'?'text':'svg';
    const target=creativity?{...project,designSeed:`${seed}/${design.id}/${creativity}`}:project;
    let markdown,asset,text;
    if(actualFormat==='text') {
      text=renderTextHeader(design,target); const marker=fence(text);
      markdown=`${marker}text\n${text}${marker}\n\n[${md(project.name)}](${project.url})\n`;
      asset=`assets/${slug}.txt`; files.set(asset,text);
    } else {
      const image=renderDesign(design,target), issues=checkSvgXml(image);
      if(issues.length)throw new Error(`${design.id}: ${issues.join('; ')}`);
      asset=`assets/${slug}.svg`; files.set(asset,image);
      markdown=`<p align="center">\n  <a href="${escapeXml(project.url)}"><img src="${asset}" width="100%" alt="${escapeXml(project.name)} — ${escapeXml(design.name)}"></a>\n</p>\n`;
    }
    files.set(`${slug}.md`,markdown);
    files.set(`prompts/${slug}.txt`,[`Create an original ${actualFormat==='text'?'text / ASCII':'SVG'} README header for ${project.fullName}.`,
      `Verified repository data: ${JSON.stringify(project)}`,design.sampler_prompt||design.readme_translation,
      'Visual signature:',...design.visual_signature.map(signature=>'- '+signature),`Palette: ${design.palette}`,
      `Lettering: ${design.typography}`,`Caveats: ${design.caveats}`].join('\n')+'\n');
    picks.push({id:design.id,name:design.name,number,slug,format:actualFormat,formats:design.formats,asset,markdown,text,references:design.references});
    onProgress(index+1,count,`${design.id} / ${actualFormat.toUpperCase()}`);
  }
  const manifest={generator:'README.NFO',version:2,seed,count,format,creativity,project:project.fullName,catalogue_size:catalogue.length,runtime,
    rendering:'Original portable catalogue interpretations; no AI generation',elapsed_render_ms:Math.round(performance.now()-started),
    options:picks.map(({id,name,slug,format,formats,asset})=>({id,name,slug,format,formats,markdown:`${slug}.md`,asset,prompt:`prompts/${slug}.txt`}))};
  files.set('project.json',JSON.stringify(project,null,2)+'\n'); files.set('manifest.json',JSON.stringify(manifest,null,2)+'\n');
  files.set('LICENSE',fs.readFileSync(new URL('../../LICENSE',import.meta.url),'utf8'));
  files.set('CREDITS.md',`# Credits and runtime\n\nREADME.NFO by Luke Woods, MIT licensed.\n\nEngine: ${runtime.engine}. Model: none. AI provider: none. AI credits: 0. No AI account is billed; rendering runs on your computer. GitHub authentication is only for reading repository metadata.\n\nThese are original portable interpretations of the catalogue. Reference productions and artists are credited as sources.\n\n`+
    picks.map(pick=>`## ${pick.id} — ${pick.name}\n\n${pick.references.length?pick.references.map(ref=>'- ['+md(ref.what)+'](<'+ref.url.replace(/[<>]/g,'')+'>)').join('\n'):'User-provided visual reference; see the bundled style specification.'}\n`).join('\n'));
  files.set('README.md',`# Headers for ${md(project.name)}\n\n[Project](${project.url}) · [Open the gallery](index.html) · [Runtime and credits](CREDITS.md)\n\nCopy text / ASCII directly into your README, or copy an SVG into your assets folder and paste its matching Markdown. Keep the [MIT notice](LICENSE). Rebuild this draw with \`node src/rebuild.mjs\`.\n\n`+
    picks.map(pick=>`## ${pick.number} — ${pick.name}\n\n**${pick.format==='text'?'Text / ASCII':'SVG'}** · [Markdown](${pick.slug}.md) · [Asset](${pick.asset}) · [Sampler prompt](prompts/${pick.slug}.txt)\n\n${pick.format==='svg'?`![${md(project.name)} — ${pick.name}](${pick.asset})`:pick.markdown}\n`).join('\n'));
  files.set('index.html',gallery(project,picks));
  for(const file of fs.readdirSync(import.meta.dirname).filter(file=>file.endsWith('.mjs')))files.set(`src/generator/${file}`,fs.readFileSync(new URL(file,import.meta.url),'utf8'));
  files.set('styles/styles.json',fs.readFileSync(new URL('../../styles/styles.json',import.meta.url),'utf8'));
  files.set('src/rebuild.mjs',`import fs from 'node:fs';\nimport path from 'node:path';\nimport { fileURLToPath } from 'node:url';\nimport { createBundle } from './generator/bundle.mjs';\nimport { normaliseProject } from './generator/project.mjs';\nconst root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');\nconst saved=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));\nconst project=normaliseProject(JSON.parse(fs.readFileSync(path.join(root,'project.json'),'utf8')));\nconst bundle=createBundle(project,{count:saved.count,seed:saved.seed,format:saved.format,creativity:saved.creativity,styles:saved.options.map(pick=>pick.id)});\nfor(const [relative,contents] of bundle.files){const file=path.join(root,relative);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,contents);}\nconsole.log('Rebuilt '+bundle.picks.length+' saved headers. Open '+path.join(root,'index.html'));\n`);
  return {files,picks,seed,manifest};
}

function gallery(project,picks) {
  const cards=picks.map(pick=>`<article data-format="${pick.format}"><header><h2>${pick.number} · ${escapeXml(pick.name)}</h2><span>${pick.format==='text'?'TEXT / ASCII':'SVG'}</span></header>
${pick.format==='svg'?`<a href="${pick.asset}"><img src="${pick.asset}" alt="${escapeXml(project.name)} — ${escapeXml(pick.name)}" loading="lazy"></a>`:`<pre>${escapeXml(pick.text)}</pre>`}
<p><a href="${pick.slug}.md">Markdown</a> · <a href="${pick.asset}" download>Save ${pick.format==='text'?'text':'SVG'}</a> · <a href="prompts/${pick.slug}.txt">Sampler prompt</a></p>
<details><summary>Copy Markdown</summary><textarea readonly aria-label="Markdown for ${escapeXml(pick.name)}">${escapeXml(pick.markdown)}</textarea><button type="button" data-copy>Copy</button></details></article>`).join('\n');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeXml(project.name)} — header gallery</title><style>
:root{color-scheme:dark;--bg:#080c10;--card:#111b22;--fg:#e6edf3;--muted:#a0b9bf;--line:#2d4a50;--accent:#65dcd0}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.55 system-ui,sans-serif;padding:32px}main{max-width:1500px;margin:auto}h1{font-size:32px;margin:12px 0}h2{font-size:16px;margin:0}p{color:var(--muted)}a{color:var(--accent)}main>header{margin-bottom:28px}.brand{font:13px/1.5 monospace;letter-spacing:3px;color:var(--accent)}nav{display:flex;gap:12px;flex-wrap:wrap;margin-top:18px}section{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}article{min-width:0;padding:20px;background:var(--card);border:1px solid var(--line);border-radius:10px}article header{display:flex;justify-content:space-between;gap:15px;margin-bottom:16px}article header span{font:11px/1.5 monospace;color:var(--accent);white-space:nowrap}img{display:block;width:100%;height:auto}pre{overflow:auto;font:12px/1.45 ui-monospace,Consolas,monospace;white-space:pre;padding:16px;background:#060a0d;max-height:400px}summary,button{cursor:pointer}textarea{display:block;width:100%;height:116px;margin:12px 0;padding:10px;border:1px solid var(--line);background:var(--bg);color:var(--fg);font:13px/1.5 monospace}button{padding:8px 16px;border:1px solid var(--line);border-radius:5px;background:var(--bg);color:var(--fg)}[aria-pressed="true"]{border-color:var(--accent);color:var(--accent)}[hidden]{display:none!important}button:focus-visible,a:focus-visible,summary:focus-visible{outline:2px solid var(--accent);outline-offset:3px}@media(max-width:780px){body{padding:16px}section{grid-template-columns:1fr}article{padding:14px}h1{font-size:24px}}
</style></head><body><main><header><div class="brand">README.NFO / HEADER FOUNDRY</div><h1>${escapeXml(project.name)} — ${picks.length} headers</h1><p><a href="${escapeXml(project.url)}">${escapeXml(project.fullName)}</a> · <a href="CREDITS.md">Runtime and credits</a> · <a href="README.md">Copying and rebuilding</a></p><p>Made locally. Model: none. AI credits: 0. Choose a header and copy its matching Markdown and assets. Keep the <a href="LICENSE">MIT notice</a>.</p><nav aria-label="Header format"><button data-format-filter="all" aria-pressed="true">All ${picks.length}</button><button data-format-filter="text" aria-pressed="false">Text / ASCII (${picks.filter(pick=>pick.format==='text').length})</button><button data-format-filter="svg" aria-pressed="false">SVG (${picks.filter(pick=>pick.format==='svg').length})</button></nav></header><p id="empty" hidden>No headers in this format were drawn.</p><section>${cards}</section></main><script>
document.querySelectorAll('[data-format-filter]').forEach(button=>button.addEventListener('click',()=>{const format=button.dataset.formatFilter;document.querySelectorAll('article').forEach(card=>card.hidden=format!=='all'&&card.dataset.format!==format);document.querySelectorAll('[data-format-filter]').forEach(control=>control.setAttribute('aria-pressed',String(control===button)));document.getElementById('empty').hidden=!!document.querySelector('article:not([hidden])')}));
document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{const area=button.previousElementSibling;try{await navigator.clipboard.writeText(area.value);button.textContent='Copied'}catch{area.focus();area.select();button.textContent='Selected — press Ctrl/Cmd+C'}}));
</script></body></html>\n`;
}

export function defaultOutput(project,cwd=process.cwd()) {
  const base=path.join(cwd,'readme-headers',`${project.owner}-${project.repo}`);
  let output=base,number=2;
  while(fs.existsSync(output))output=`${base}-${number++}`;
  return output;
}

export function writeBundle(bundle,output,{resume=false}={}) {
  const target=path.resolve(output);
  if(fs.existsSync(target)&&!resume)throw new Error(`Output already exists: ${target}. Choose a new --out directory.`);
  fs.mkdirSync(path.dirname(target),{recursive:true});
  if(!resume)fs.mkdirSync(target);
  for(const [relative,contents] of bundle.files) {
    const filename=path.join(target,relative),contained=path.relative(target,filename);
    if(contained.startsWith('..')||path.isAbsolute(contained))throw new Error('Output path escapes the bundle.');
    if(resume&&fs.existsSync(filename))continue;
    fs.mkdirSync(path.dirname(filename),{recursive:true});fs.writeFileSync(filename,contents,{flag:'wx'});
  }
  return target;
}
