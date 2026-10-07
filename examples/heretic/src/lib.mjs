// MIT — README.NFO. Shared geometry and filing, never a shared header layout.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { lettering, escapeXml } from './drawing.mjs';

export const DIR=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const DRAW=JSON.parse(fs.readFileSync(path.join(DIR,'draw.json'),'utf8'));
export const PROJECT=JSON.parse(fs.readFileSync(path.join(DIR,'project.json'),'utf8'));
export const esc=escapeXml;
export const R=(x,y,w,h,fill,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
export const C=(x,y,r,fill,extra='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
export const L=(d,stroke,width=2,extra='')=>`<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}" ${extra}/>`;
export const T=(value,x,y,size=18,fill='#eee',extra='')=>`<text x="${x}" y="${y}" ${/font-family=/.test(extra)?'':'font-family="Consolas,monospace"'} font-size="${size}" fill="${fill}" ${extra}>${esc(value)}</text>`;
export const W=(x,y,scale=10,fill='#eee',extra={})=>lettering('HERETIC',x,y,{scale,fill,maxWidth:870,...extra});
export const SVG=(body,{background='#080d17',height=400,defs='',css='',title,description}={})=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 ${height}" role="img" aria-labelledby="title desc"><title id="title">${esc(title)}</title><desc id="desc">${esc(description)}</desc><defs>${defs}</defs><style>${css}\n@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}</style>${R(0,0,960,height,background)}${body}</svg>\n`;

export function write(number,{body,background,height,defs,css,text,summary,choices}) {
  const pick=DRAW.options.find(pick=>pick.number===number);
  if(!pick||!summary||choices?.length<2)throw new Error('Every candidate needs its saved style, description and artistic choices.');
  fs.mkdirSync(path.join(DIR,'assets'),{recursive:true});
  let header='';
  if(body) {
    fs.writeFileSync(path.join(DIR,'assets',pick.slug+'.svg'),SVG(body,{background,height,defs,css,title:PROJECT.name+' — '+pick.name,description:summary+' '+PROJECT.description}));
    header=`<p align="center"><a href="${PROJECT.url}"><img src="assets/${pick.slug}.svg" width="100%" alt="${esc(summary)}"></a></p>\n\n**Heretic** — ${PROJECT.description}. [Project](${PROJECT.url}) · Python · AGPL-3.0.\n`;
  }
  if(text) {
    fs.writeFileSync(path.join(DIR,pick.slug+'.txt'),text.trimEnd()+'\n');
    const block='```text\n'+text.trimEnd()+'\n```';
    header+=body?`\n<details>\n<summary>Text / ASCII companion</summary>\n\n${block}\n\n</details>\n`:`${block}\n\n[Heretic](${PROJECT.url}) — ${PROJECT.description}.\n`;
  }
  const links=`[Generator](src/${pick.slug}.mjs) · [All 40 candidates](README.md)${text?` · [Text / ASCII](${pick.slug}.txt)`:''}`;
  fs.writeFileSync(path.join(DIR,pick.slug+'.md'),`<!-- README.NFO candidate ${String(number).padStart(2,'0')}; original Heretic composition. -->\n\n${header}\n> **Candidate ${String(number).padStart(2,'0')}** · [${pick.id}](../../styles/${pick.family}.md#${pick.id}) · ${summary}\n\n${links}\n`);
  fs.writeFileSync(path.join(DIR,'src',pick.slug+'.art.json'),JSON.stringify({id:pick.id,summary,choices,formats:[...(body?['svg']:[]),...(text?['text']:[])]},null,2)+'\n');
  console.log('Wrote '+pick.slug);
}
