// Original emblems: MIT. Plain wordmark: DejaVu Sans; see ../LICENSE.FONT.txt.
// Static vector markup only: no animation, scripts, embedded images or text elements.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const DIR=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const DRAW=JSON.parse(fs.readFileSync(path.join(DIR,'draw.json'),'utf8'));
const lettering=JSON.parse(fs.readFileSync(path.join(DIR,'src','wordmark.json'),'utf8'));
export const ink='var(--ink)',paper='var(--paper)',accent='var(--accent)',soft='var(--soft)',blue='var(--blue)',tile='var(--tile)',rim='var(--rim)';
export const NAVY='#18223a',CREAM='#f6f3eb';
export const E=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export const f=n=>+(+n).toFixed(2);
export const P=(d,fill=ink,attrs='')=>`<path d="${d}" fill="${fill}" ${attrs}/>`;
export const L=(d,stroke=ink,width=9,attrs='')=>P(d,'none',`stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${attrs}`);
export const R=(x,y,w,h,fill=ink,attrs='')=>`<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${fill}" ${attrs}/>`;
export const C=(x,y,r,fill=ink,attrs='')=>`<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${fill}" ${attrs}/>`;
export const G=(body,transform,attrs='')=>`<g${transform?` transform="${transform}"`:''} ${attrs}>${body}</g>`;
export const poly=pts=>'M'+pts.map(([x,y])=>f(x)+' '+f(y)).join('L')+'Z';
export const glint=(x,y,r,fill='#fff')=>P(`M${x} ${y-r}Q${x+r*.16} ${y-r*.16} ${x+r} ${y}Q${x+r*.16} ${y+r*.16} ${x} ${y+r}Q${x-r*.16} ${y+r*.16} ${x-r} ${y}Q${x-r*.16} ${y-r*.16} ${x} ${y-r}Z`,fill);
// Rounded rectangle path, with an optional separate radius per corner [tl,tr,br,bl].
export function rr(x,y,w,h,r){
 const [a,b,c,d]=Array.isArray(r)?r:[r,r,r,r];
 return `M${f(x+a)} ${f(y)}H${f(x+w-b)}A${b} ${b} 0 0 1 ${f(x+w)} ${f(y+b)}V${f(y+h-c)}A${c} ${c} 0 0 1 ${f(x+w-c)} ${f(y+h)}H${f(x+d)}A${d} ${d} 0 0 1 ${f(x)} ${f(y+h-d)}V${f(y+a)}A${a} ${a} 0 0 1 ${f(x+a)} ${f(y)}Z`;
}
// Pixel art from string rows: each character maps to a fill; '.' is empty.
export function pixels(rows,map,{x=0,y=0,size=10,gap=0}={}){
 let out='';
 rows.forEach((row,j)=>[...row].forEach((ch,i)=>{if(map[ch])out+=R(x+i*size+gap/2,y+j*size+gap/2,size-gap,size-gap,map[ch]);}));
 return out;
}
export const lg=(id,stops,[x1,y1,x2,y2]=[0,0,0,1],extra='')=>`<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${extra}>${stops.map(([o,c,a=1])=>`<stop offset="${o}" stop-color="${c}"${a<1?` stop-opacity="${a}"`:''}/>`).join('')}</linearGradient>`;
export const rg=(id,stops,{cx=.5,cy=.5,r=.5,fx=cx,fy=cy,extra=''}={})=>`<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}" fx="${fx}" fy="${fy}" ${extra}>${stops.map(([o,c,a=1])=>`<stop offset="${o}" stop-color="${c}"${a<1?` stop-opacity="${a}"`:''}/>`).join('')}</radialGradient>`;
function word(){
 const [x0,y0,x1,y1]=lettering.bounds,s=514/(x1-x0),h=(y1-y0)*s;
 return `<g aria-label="MediaLog" fill="var(--ink)" transform="translate(${251-x0*s} ${148+h/2+y0*s}) scale(${s} ${-s})">${P(lettering.path)}</g>`;
}
const COLORS=':root{--ink:#18223a;--paper:#f6f3eb;--soft:#d9e0e5;--blue:#74889a;--accent:#ae8660;--tile:#18223a;--rim:#18223a}@media(prefers-color-scheme:dark){:root{--ink:#f6f3eb;--paper:#18223a;--soft:#53647a;--blue:#a4b3bf;--accent:#d0ac85;--tile:#1d2944;--rim:#5d6f88}}';
const BOOK={open:'open book',closed:'closed book',shelf:'bookshelf'};
const SET=c=>'collection '+c.slice(-2);
export function save(n,{icon,defs='',css='',name,description,choices}){
 const p=DRAW.options[n-1];
 const book=BOOK[p.book],first=p.firstUsed;
 const svg=iconOnly=>`<svg xmlns="http://www.w3.org/2000/svg" width="${iconOnly?64:203}" height="${iconOnly?64:74}" viewBox="${iconOnly?'0 28 240 240':'0 0 812 296'}" role="img" aria-labelledby="t d"><!-- Original MediaLog emblem: MIT. Wordmark: DejaVu Sans; retain LICENSE.FONT.txt. --><title id="t">MediaLog — ${E(name)}${iconOnly?' symbol':''}</title><desc id="d">${E(description)} Primary brand colour #18223a, plain MediaLog wordmark. ${E(choices.join('; '))}.</desc><defs>${defs}</defs><style>${COLORS}${css}</style>${icon}${iconOnly?'':word()}</svg>\n`;
 fs.writeFileSync(path.join(DIR,'assets',p.slug+'.svg'),svg(false));
 fs.writeFileSync(path.join(DIR,'assets',p.slug+'-icon.svg'),svg(true));
 const meta={name,description,choices,book,repeatOf:{style:p.id,collection:first.collection,slug:first.slug,name:first.name},animated:false,format:'SVG',ascii:false,brand:NAVY,typography:'DejaVu Sans Bold, plain outlined wordmark',size:{width:203,height:74},transparent:true};
 fs.writeFileSync(path.join(DIR,'src',p.slug+'.art.json'),JSON.stringify({id:p.id,...meta},null,2)+'\n');
 fs.writeFileSync(path.join(DIR,p.slug+'.md'),`<!-- Original MediaLog identity. MIT: LICENSE.README-NFO.txt; font: LICENSE.FONT.txt. -->\n\n<img src="assets/${p.slug}.svg" width="203" height="74" alt="MediaLog — ${E(name)}">\n\n# ${name}\n\n${description}\n\n**Book:** ${book}. **Style first used:** [${E(first.name)}](../${first.collection}/${first.slug}.md), ${SET(first.collection)}.\n\nMediaLog is a media diary you share: everything you’ve watched, read, played and listened to, on one timeline.\n\n[SVG](assets/${p.slug}.svg) · [Icon SVG](assets/${p.slug}-icon.svg) · [Light PNG](assets/${p.slug}-light.png) · [Dark PNG](assets/${p.slug}-dark.png) · [Generator](src/${p.slug}.mjs) · [Style ${p.id}](../../styles/${p.family}.md#${p.id}) · [MIT notice](LICENSE.README-NFO.txt) · [Font notice](LICENSE.FONT.txt)\n\nThe style reference informs the symbol; the navy brand colour and plain lettering take precedence over the catalogue palette and typography.\n\n<!-- LOGO-META ${JSON.stringify(meta)} -->\n`);
}
