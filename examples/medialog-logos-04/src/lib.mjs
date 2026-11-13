// Original emblems: MIT. Plain wordmark: DejaVu Sans; see ../LICENSE.FONT.txt.
// Each generator returns vector markup; nothing is fetched, rasterised or rendered as text.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const DIR=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const DRAW=JSON.parse(fs.readFileSync(path.join(DIR,'draw.json'),'utf8'));
const lettering=JSON.parse(fs.readFileSync(path.join(DIR,'src','wordmark.json'),'utf8'));
export const ink='var(--ink)',paper='var(--paper)',accent='var(--accent)',soft='var(--soft)',blue='var(--blue)',tile='var(--tile)',rim='var(--rim)';
export const NAVY='#18223a';
export const E=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export const f=n=>+n.toFixed(2);
export const P=(d,fill=ink,attrs='')=>`<path d="${d}" fill="${fill}" ${attrs}/>`;
export const L=(d,stroke=ink,width=9,attrs='')=>P(d,'none',`stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${attrs}`);
export const R=(x,y,w,h,fill=ink,attrs='')=>`<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${fill}" ${attrs}/>`;
export const C=(x,y,r,fill=ink,attrs='')=>`<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${fill}" ${attrs}/>`;
export const G=(body,transform,attrs='')=>`<g${transform?` transform="${transform}"`:''} ${attrs}>${body}</g>`;
export const poly=pts=>'M'+pts.map(([x,y])=>f(x)+' '+f(y)).join('L')+'Z';
export const glint=(x,y,r,fill='#fff')=>P(`M${x} ${y-r}Q${x+r*.16} ${y-r*.16} ${x+r} ${y}Q${x+r*.16} ${y+r*.16} ${x} ${y+r}Q${x-r*.16} ${y+r*.16} ${x-r} ${y}Q${x-r*.16} ${y-r*.16} ${x} ${y-r}Z`,fill);
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
const STILL='*{animation:none!important;transition:none!important}';
const stripSmil=s=>s.replace(/<animate(?:Transform|Motion)?\b[^>]*\/>/g,'');
const stripKeyframes=s=>s.replace(/@keyframes[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g,'');
// art: {icon, defs, css, still?}. The still build removes SMIL and CSS motion, leaving the designed resting pose.
export function save(n,{icon,defs='',css='',stillIcon,name,description,choices,motion=''}){
 const p=DRAW.options[n-1],animated=Boolean(motion);
 const svg=({live,iconOnly})=>{
  const body=live?icon:stripSmil(stillIcon??icon);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${iconOnly?64:203}" height="${iconOnly?64:74}" viewBox="${iconOnly?'0 28 240 240':'0 0 812 296'}" role="img" aria-labelledby="t d"><!-- Original MediaLog emblem: MIT. Wordmark: DejaVu Sans; retain LICENSE.FONT.txt. --><title id="t">MediaLog — ${E(name)}${iconOnly?' symbol':''}</title><desc id="d">${E(description)} Primary brand colour #18223a, plain MediaLog wordmark. ${E(choices.join('; '))}.</desc><defs>${defs}</defs><style>${COLORS}${live?css:stripKeyframes(css)}${live?'@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}':STILL}</style>${body}${iconOnly?'':word()}</svg>\n`;
 };
 fs.writeFileSync(path.join(DIR,'assets',p.slug+'.svg'),svg({live:true}));
 fs.writeFileSync(path.join(DIR,'assets',p.slug+'-still.svg'),svg({live:false}));
 fs.writeFileSync(path.join(DIR,'assets',p.slug+'-icon.svg'),svg({live:false,iconOnly:true}));
 const meta={name,description,choices,animated,motion:motion||'Static',format:'SVG',ascii:false,brand:NAVY,typography:'DejaVu Sans Bold, plain outlined wordmark',size:{width:203,height:74},transparent:true};
 fs.writeFileSync(path.join(DIR,'src',p.slug+'.art.json'),JSON.stringify({id:p.id,...meta},null,2)+'\n');
 fs.writeFileSync(path.join(DIR,p.slug+'.md'),`<!-- Original MediaLog identity. MIT: LICENSE.README-NFO.txt; font: LICENSE.FONT.txt. -->\n\n<img src="assets/${p.slug}.svg" width="203" height="74" alt="MediaLog — ${E(name)}">\n\n# ${name}\n\n${description}\n\n${animated?`**Motion:** ${motion} The [static SVG](assets/${p.slug}-still.svg) holds the resting pose.\n\n`:''}MediaLog is a media diary you share: everything you’ve watched, read, played and listened to, on one timeline.\n\n[SVG](assets/${p.slug}.svg) · [Static SVG](assets/${p.slug}-still.svg) · [Icon SVG](assets/${p.slug}-icon.svg) · [Generator](src/${p.slug}.mjs) · [Style ${p.id}](../../styles/${p.family}.md#${p.id}) · [MIT notice](LICENSE.README-NFO.txt) · [Font notice](LICENSE.FONT.txt)\n\nThe style reference informs the symbol; the navy brand colour and plain lettering take precedence over the catalogue palette and typography.\n\n<!-- LOGO-META ${JSON.stringify(meta)} -->\n`);
}
