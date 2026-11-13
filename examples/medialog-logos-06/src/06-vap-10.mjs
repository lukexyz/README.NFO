// Frutiger Aero: a glossy sky-blue hardback with a leaf-green spine, a glass-button highlight across its
// top half, a wet-table reflection and one soap bubble.
import {P,L,R,C,G,f,rr,lg,rg,save} from './lib.mjs';
const x0=54,y0=50,w=130,h=152,sp=26,top=y0+h;
const body=rr(x0,y0,w,h,[16,10,10,16]);
const defs=lg('sky',[[0,'#a8e2ff'],[.5,'#3b9cf0'],[1,'#0f56c2']])
 +lg('leaf',[[0,'#a6ec6c'],[.55,'#4cbf3e'],[1,'#1f8a33']])
 +lg('gloss',[[0,'#ffffff',.95],[1,'#ffffff',.18]])
 +lg('fade',[[0,'#ffffff',.42],[.75,'#ffffff',0]])
 +rg('bubble',[[0,'#ffffff',0],[.62,'#d8f1ff',.12],[.9,'#8fd0ff',.7],[1,'#e9f7ff',.95]])
 +`<mask id="wet"><rect x="0" y="${top}" width="240" height="60" fill="url(#fade)"/></mask>`
 +`<clipPath id="book"><path d="${body}"/></clipPath>`;
// Page block peeking out on the fore-edge side, and a leaf-green ribbon hanging from the pages, both behind the cover.
const pages=P(`M${x0+w-40} ${top-10}H${x0+w-24}V${top+20}L${x0+w-32} ${top+13}L${x0+w-40} ${top+20}Z`,'url(#leaf)','stroke="#1f7a30" stroke-width="2.5" stroke-linejoin="round"')
 +P(rr(x0+w-14,y0+8,22,h-16,5),'#ffffff','stroke="#7aa6cf" stroke-width="2.5"')
 +L(`M${x0+w+2} ${y0+20}V${y0+h-20}M${x0+w+6} ${y0+22}V${y0+h-22}`,'#b5cbe0',2);
const book=pages
 +G(R(x0,y0,w,h,'url(#sky)')+R(x0,y0,sp,h,'url(#leaf)')
   +L(`M${x0+sp} ${y0}V${top}`,'#ffffff',2.5,'opacity=".55"')
   // Glass-button gloss: a pale band over the top 45 percent that ends in a hard, gently curved edge.
   +P(`M${x0+4} ${y0+4}H${x0+w-4}V${y0+h*.4}Q${x0+w/2} ${y0+h*.5} ${x0+4} ${y0+h*.42}Z`,'url(#gloss)'),'','clip-path="url(#book)"')
 +P(body,'none','stroke="#0b3f8f" stroke-width="3" stroke-opacity=".55"');

// Wet-table reflection: the book mirrored about its base and faded within half its height.
const reflection=G(G(book,`translate(0 ${2*top+4}) scale(1 -1)`),'','mask="url(#wet)"');
const bubble=C(190,56,20,'url(#bubble)','stroke="#4aa6e8" stroke-opacity=".55" stroke-width="2"')
 +P('M178 48Q183 39 193 40','none','stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity=".95"');
const icon=reflection+book+bubble;
save(6,{icon,defs,name:'Glossy edition',description:'A glossy sky-blue hardback with a leaf-green spine, a glass-button highlight across its top half and a ribbon bookmark, standing on its own wet-table reflection with a soap bubble at its corner.',choices:['Web 2.0 gloss: vertical gradient, a hard-edged highlight band, a mirrored reflection that fades out, and Frutiger Aero bubbles','Sky blue and leaf green with white, kept to one object']});
