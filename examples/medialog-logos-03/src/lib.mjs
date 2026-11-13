// Original emblems: MIT. Plain wordmark: DejaVu Sans; see ../LICENSE.FONT.txt.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const DIR=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const DRAW=JSON.parse(fs.readFileSync(path.join(DIR,'draw.json'),'utf8'));
const lettering=JSON.parse(fs.readFileSync(path.join(DIR,'src','wordmark.json'),'utf8'));
export const ink='var(--ink)',paper='var(--paper)',accent='var(--accent)',soft='var(--soft)',blue='var(--blue)';
export const E=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export const P=(d,fill=ink,attrs='')=>`<path d="${d}" fill="${fill}" ${attrs}/>`;
export const L=(d,stroke=ink,width=9,attrs='')=>P(d,'none',`stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${attrs}`);
export const R=(x,y,w,h,fill=ink,attrs='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${attrs}/>`;
export const C=(x,y,r,fill=ink,attrs='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${attrs}/>`;
export const G=(body,transform,attrs='')=>`<g transform="${transform}" ${attrs}>${body}</g>`;
export const star=(x,y,r,fill=accent)=>P(`M${x} ${y-r}L${x+3} ${y-3}L${x+r} ${y}L${x+3} ${y+3}L${x} ${y+r}L${x-3} ${y+3}L${x-r} ${y}L${x-3} ${y-3}Z`,fill);
function word(){
 const [x0,y0,x1,y1]=lettering.bounds,s=514/(x1-x0),h=(y1-y0)*s;
 return `<g aria-label="MediaLog" fill="var(--ink)" transform="translate(${251-x0*s} ${148+h/2+y0*s}) scale(${s} ${-s})">${P(lettering.path)}</g>`;
}
export function save(n,{icon,defs='',name,description,choices}){
 const p=DRAW.options[n-1];
 const css=':root{--ink:#18223a;--paper:#f6f3eb;--soft:#d9e0e5;--blue:#74889a;--accent:#ae8660}@media(prefers-color-scheme:dark){:root{--ink:#f6f3eb;--paper:#18223a;--soft:#53647a;--blue:#a4b3bf;--accent:#d0ac85}}';
 const svg=(iconOnly=false)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${iconOnly?64:203}" height="${iconOnly?64:74}" viewBox="${iconOnly?'0 28 240 240':'0 0 812 296'}" role="img" aria-labelledby="t d"><!-- Original MediaLog emblem: MIT. Wordmark: DejaVu Sans; retain LICENSE.FONT.txt. --><title id="t">MediaLog — ${E(name)}${iconOnly?' symbol':''}</title><desc id="d">${E(description)}. Primary brand colour #18223a, plain MediaLog wordmark. ${E(choices.join('; '))}.</desc><defs>${defs}</defs><style>${css}</style>${icon}${iconOnly?'':word()}</svg>\n`;
 for(const suffix of ['', '-still'])fs.writeFileSync(path.join(DIR,'assets',p.slug+suffix+'.svg'),svg());
 fs.writeFileSync(path.join(DIR,'assets',p.slug+'-icon.svg'),svg(true));
 const meta={name,description,choices,animated:false,format:'SVG',ascii:false,brand:'#18223a',typography:'DejaVu Sans Bold, plain outlined wordmark',size:{width:203,height:74},transparent:true};
 fs.writeFileSync(path.join(DIR,'src',p.slug+'.art.json'),JSON.stringify({id:p.id,...meta},null,2)+'\n');
 fs.writeFileSync(path.join(DIR,p.slug+'.md'),`<!-- Original MediaLog identity. MIT: LICENSE.README-NFO.txt; font: LICENSE.FONT.txt. -->\n\n<img src="assets/${p.slug}.svg" width="203" height="74" alt="MediaLog — ${E(name)}">\n\n# ${name}\n\n${description}\n\nMediaLog is a media diary you share: everything you’ve watched, read, played and listened to, on one timeline.\n\n[SVG](assets/${p.slug}.svg) · [Icon SVG](assets/${p.slug}-icon.svg) · [Generator](src/${p.slug}.mjs) · [Style ${p.id}](../../styles/${p.family}.md#${p.id}) · [MIT notice](LICENSE.README-NFO.txt) · [Font notice](LICENSE.FONT.txt)\n\nThe style reference informs the symbol; the user’s navy brand colour and plain lettering take precedence over the catalogue palette and typography.\n\n<!-- LOGO-META ${JSON.stringify(meta)} -->\n`);
}
