// Original path lettering and geometry. MIT: ../LICENSE.README-NFO.txt.
// All artwork is vector; no character-grid or ASCII rendering is used.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const DIR=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const DRAW=JSON.parse(fs.readFileSync(path.join(DIR,'draw.json'),'utf8'));
export const E=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export const P=(d,fill,attrs='')=>`<path d="${d}" fill="${fill}" ${attrs}/>`;
export const L=(d,stroke,width=4,attrs='')=>P(d,'none',`stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${attrs}`);
export const R=(x,y,w,h,fill,attrs='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${attrs}/>`;
export const C=(x,y,r,fill,attrs='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${attrs}/>`;
export const G=(body,transform,attrs='')=>`<g transform="${transform}" ${attrs}>${body}</g>`;
// Proportional, original monoline lowercase. At native size the strokes are 2.5–4 px.
const round={
 M:[66,'M7 77V9L33 47L59 9V77'],
 e:[55,'M8 52H47C47 21 7 22 7 53C7 79 31 86 48 72'],
 d:[58,'M49 8V77M49 48C49 22 8 23 8 54C8 85 49 85 49 54'],
 i:[20,'M10 35V77M10 10V12'],
 a:[56,'M48 39V77M48 51C48 23 8 24 8 54C8 85 48 85 48 54'],
 L:[51,'M8 8V77H45'],
 o:[56,'M28 31C0 31 0 79 28 79C56 79 56 31 28 31Z'],
 g:[57,'M49 36V77Q49 106 14 96M49 53C49 23 8 24 8 54C8 85 49 85 49 54']
};
const tech={
 M:[66,'M7 77V9L33 42L59 9V77'],E:[53,'M46 9H8V77H46M8 43H39'],D:[59,'M8 77V9H36L51 25V61L36 77Z'],I:[24,'M12 9V77'],A:[60,'M6 77L23 9H37L54 77M16 49H45'],L:[50,'M8 9V77H45'],O:[60,'M20 9H40L52 22V65L40 77H20L8 65V22Z'],G:[60,'M51 23L39 9H20L8 22V65L20 77H49V45H33']
};
export function word({x=254,y=91,width=515,height=103,ink='var(--ink)',kind='round',weight=14,outline=null,outlineWidth=0,slant=0,wave=0,gap=7,value='MediaLog'}={}){
 const font=kind==='tech'?tech:round, chars=[...(kind==='tech'?value.toUpperCase():value)];
 const natural=chars.reduce((n,c)=>n+font[c][0]+gap,0)-gap;
 let cursor=0,body='';
 chars.forEach((ch,i)=>{const [advance,d]=font[ch],dy=Math.sin(i*.75)*wave;
  let p=outline?L(d,outline,weight+outlineWidth):'';p+=L(d,ink,weight);
  body+=G(p,`translate(${cursor} ${dy})`);cursor+=advance+gap;});
 return G(G(body,`skewX(${slant})`),`translate(${x} ${y}) scale(${width/natural} ${height/100})`);
}
export const star=(x,y,r,fill)=>P(`M${x} ${y-r}Q${x+3} ${y-3} ${x+r} ${y}Q${x+3} ${y+3} ${x} ${y+r}Q${x-3} ${y+3} ${x-r} ${y}Q${x-3} ${y-3} ${x} ${y-r}Z`,fill);
export function gradient(id,stops,{vertical=true,userSpace=false,start=0,end=100}={}){return `<linearGradient id="${id}" ${userSpace?'gradientUnits="userSpaceOnUse" ':''}x1="0" y1="${userSpace?start:0}" x2="${vertical?0:1}" y2="${userSpace?end:(vertical?1:0)}">${stops.map(([offset,c])=>`<stop offset="${offset}" stop-color="${c}"/>`).join('')}</linearGradient>`;}
export function save(n,{body,defs='',css='',name,description,choices}){
 const p=DRAW.options[n-1];
 const adaptive=':root{--ink:#172239;--paper:#ecf0f3;--subtle:#c4ccd5;--white:#ffffff}@media(prefers-color-scheme:dark){:root{--ink:#f1f6fb;--paper:#111722;--subtle:#394559;--white:#ffffff}}';
 const svg=motion=>`<svg xmlns="http://www.w3.org/2000/svg" width="203" height="74" viewBox="0 0 812 296" role="img" aria-labelledby="t d"><title id="t">MediaLog — ${E(name)}</title><desc id="d">${E(description)}. Original logo and wordmark for a shared media diary. Designed for 203 by 74 pixels; ${E(choices.join('; '))}.</desc><defs>${defs}</defs><style>${adaptive}\n${css}\n${motion?'':'*{animation:none!important;transition:none!important}'}\n@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}</style>${body}</svg>\n`;
 fs.writeFileSync(path.join(DIR,'assets',p.slug+'.svg'),svg(true));
 fs.writeFileSync(path.join(DIR,'assets',p.slug+'-still.svg'),svg(false));
 const md=`<!-- Original MediaLog identity. MIT: LICENSE.README-NFO.txt. Edit src/${p.slug}.mjs. -->\n\n<img src="assets/${p.slug}.svg" width="203" height="74" alt="MediaLog — ${E(name)}">\n\n# ${name}\n\n${description}\n\n**MediaLog — a media diary you share.** Everything you’ve watched, read, played and listened to, on one timeline.\n\n[SVG](assets/${p.slug}.svg) · [Static SVG](assets/${p.slug}-still.svg) · [Generator](src/${p.slug}.mjs) · [Style ${p.id}](../../styles/${p.family}.md#${p.id}) · [MIT notice](LICENSE.README-NFO.txt)\n\n<!-- LOGO-META ${JSON.stringify({name,description,choices,animated:!!css})} -->\n`;
 fs.writeFileSync(path.join(DIR,p.slug+'.md'),md);
 fs.writeFileSync(path.join(DIR,'src',p.slug+'.art.json'),JSON.stringify({id:p.id,name,description,choices,animated:!!css,format:'SVG',ascii:false,size:{width:203,height:74},transparent:true},null,2)+'\n');
}
