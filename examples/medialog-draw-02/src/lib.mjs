// Original MediaLog geometry and lettering helpers. MIT: see ../LICENSE.README-NFO.txt.
// Each numbered generator owns its composition; this file only supplies drawing primitives.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {lettering, escapeXml} from './drawing.mjs';
export const DIR=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const draw=JSON.parse(fs.readFileSync(path.join(DIR,'draw.json'),'utf8'));
export const E=escapeXml;
export const R=(x,y,w,h,fill,attrs='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${attrs}/>`;
export const P=(d,fill,attrs='')=>`<path d="${d}" fill="${fill}" ${attrs}/>`;
export const L=(d,color,width=2,attrs='')=>P(d,'none',`stroke="${color}" stroke-width="${width}" ${attrs}`);
export const C=(x,y,r,fill,attrs='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${attrs}/>`;
export const T=(s,x,y,size=20,fill='#19243c',attrs='')=>`<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" fill="${fill}" ${attrs}>${E(s)}</text>`;
export const B=(s,x,y,scale=2,fill='#fff',maxWidth=920)=>lettering(s,x,y,{scale,fill,maxWidth});
export const colors=['#df5355','#b58631','#378fc9','#7aa340','#5aa99c','#956ed3'];
export const media=['FILM','BOOK','SHOW','GAME','ALBUM','PODCAST'];
// A small original stroke alphabet, used for sleeve and pen lettering instead of a remote font.
const glyph={M:'M0 10V0L4 6L8 0V10',E:'M8 0H0V10H8M0 5H6',D:'M0 10V0H4Q9 0 9 5T4 10Z',I:'M0 0H6M3 0V10M0 10H6',A:'M0 10L4 0L8 10M2 6H6',L:'M0 0V10H8',O:'M4 0C-2 0 -2 10 4 10S10 0 4 0Z',G:'M8 2Q6 0 4 0C-2 0 -2 10 4 10Q8 10 8 6H4'};
export function word(x,y,h,color,style='round'){
 let out='';const sc=h/10;
 for(const [i,c] of [...'MEDIALOG'].entries())out+=`<g transform="translate(${x+i*sc*11} ${y}) scale(${sc})">${L(glyph[c],color,style==='marker'?1.7:1.2,'stroke-linecap="round" stroke-linejoin="round"')}</g>`;
 return out;
}
export function icon(kind,x,y,s,color){
 const paths=[
  'M2 6H22V21H2ZM2 6V1H22V6M5 1L9 6M13 1L17 6',
  'M12 5Q6 0 1 3V21Q6 18 12 22Q18 18 23 21V3Q18 0 12 5ZM12 5V22',
  'M2 6H22V21H2ZM6 1L12 6L18 1',
  'M6 5H18Q23 5 24 19L20 21L15 16H9L4 21L0 19Q1 5 6 5ZM6 8V14M3 11H9M18 10H18.1M21 13H21.1',
  'M12 1A11 11 0 1 0 12 23A11 11 0 1 0 12 1ZM12 8A4 4 0 1 0 12 16A4 4 0 1 0 12 8Z',
  'M8 2Q12 -1 16 2V13Q12 17 8 13ZM4 10V13Q4 21 12 21Q20 21 20 13V10M12 21V25M7 25H17'];
 return `<g transform="translate(${x} ${y}) scale(${s/24})">${L(paths[kind],color,1.8,'stroke-linejoin="round" stroke-linecap="round"')}</g>`;
}
export function bevel(x,y,w,h,face='#c0c0c0',sunken=false){return R(x,y,w,h,face)+L(`M${x} ${y+h}V${y}H${x+w}`,sunken?'#666':'#fff',3)+L(`M${x+w} ${y}V${y+h}H${x}`,sunken?'#fff':'#333',3);}
export function save(n,{body,background='#111',height=500,defs='',css='',summary,choices,text}){
 const pick=draw.options[n-1];
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="${height}" viewBox="0 0 1000 ${height}" role="img" aria-labelledby="title desc"><title id="title">MediaLog — ${E(summary)}</title><desc id="desc">${E(summary)}. A media diary you share: everything you have watched, read, played and listened to, on one timeline. ${E(choices.join('. '))}. Decorative interface examples.</desc><defs>${defs}</defs><style>${css}\n@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}</style>${R(0,0,1000,height,background)}${body}</svg>\n`;
 fs.writeFileSync(path.join(DIR,'assets',pick.slug+'.svg'),svg);
 let md=`<!-- MediaLog original artwork. Rebuild: node src/${pick.slug}.mjs. MIT: LICENSE.README-NFO.txt. -->\n\n<p align="center">\n  <img src="assets/${pick.slug}.svg" width="100%" alt="${E('MediaLog — '+summary)}">\n</p>\n\n**MediaLog — a media diary you share.**\n\nEverything you’ve watched, read, played, listened to, on one timeline. Log a film, a book, a show, a game, an album or a podcast: when, and how it was. Then see what the people you know have been into.\n`;
 if(text){fs.writeFileSync(path.join(DIR,pick.slug+'.txt'),text+'\n');md+='\n<details>\n<summary>Text / ASCII alternative</summary>\n\n```text\n'+text+'\n```\n\n</details>\n';}
 md+=`\n> **Candidate ${String(n).padStart(2,'0')} · ${pick.id}** · ${summary}\n\n[Generator](src/${pick.slug}.mjs) · [Style](../../styles/${pick.family}.md#${pick.id}) · [MIT notice](LICENSE.README-NFO.txt)\n`;
 fs.writeFileSync(path.join(DIR,pick.slug+'.md'),md);
 fs.writeFileSync(path.join(DIR,'src',pick.slug+'.art.json'),JSON.stringify({id:pick.id,summary,choices,formats:text?['svg','text']:['svg'],animated:!!css},null,2)+'\n');
}
