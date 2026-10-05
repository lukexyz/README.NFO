import { svg, px, writeHeader } from './lib.mjs';

const lines=[
 {s:'README.NFO',x:94,y:95,size:9},
 {s:'RETRO HEADERS. READY TO REWRITE.',x:98,y:188,size:2.5},
 {s:'152 STYLES   13 FAMILIES   TEXT + SVG',x:98,y:235,size:2},
 {s:'COPY / CUSTOMISE / SHARE UNDER MIT',x:98,y:268,size:2},
];
const symbols='0123456789#/?%+*=<>[]';
let cells='';let counter=0;
for (const line of lines) for(let i=0;i<line.s.length;i++) {
  const ch=line.s[i];if(ch===' ')continue;
  const delay=1+((counter*29+7)%37)/10;
  const attrs=`style="animation-delay:${delay}s"`;
  cells+=px(ch,line.x+i*6*line.size,line.y,line.size,'#86c7ff',`class="truth" ${attrs}`);
  cells+=px(symbols[(counter*11+3)%symbols.length],line.x+i*6*line.size,line.y,line.size,'#526176',`class="noise" ${attrs}`);
  counter++;
}
const image=svg({height:340,background:'#090e15',
 css:'.truth{opacity:1;animation:resolve .12s steps(1) both}.noise{opacity:0;animation:erase .12s steps(1) both}@keyframes resolve{0%,49%{opacity:0}50%,100%{opacity:1}}@keyframes erase{0%,49%{opacity:1}50%,100%{opacity:0}}',
 description:'A scrambled block resolves once into README.NFO, retro headers ready to rewrite, 152 styles and thirteen families. Copy, customise and share under MIT. Reduced motion displays the complete message.',
 body:`<rect x="26" y="26" width="908" height="288" rx="3" fill="#0a111b" stroke="#263648"/>
 <path d="M27 63H933M66 64V313" stroke="#233345"/>
 ${px('READONLY STREAM / HEADER.NFO',45,42,1.6,'#778da6')}
 ${px('UTF8',847,42,1.6,'#86c7ff')}
 ${px('01',39,102,1.2,'#41536a')}${px('02',39,195,1.2,'#41536a')}${px('03',39,241,1.2,'#41536a')}${px('04',39,275,1.2,'#41536a')}
 ${cells}<rect x="913" y="26" width="21" height="37" fill="#20324a"/>
 <rect x="49" y="297" width="6" height="6" fill="#86c7ff"/>`
});
const markdown=`<p align="center"><img src="assets/13-hack-15.svg" width="100%" alt="A scrambled text panel decrypts once into the README.NFO title and library details."></p>

\`\`\`text
README.NFO
Retro headers. Ready to rewrite.
152 styles / 13 families / text + SVG
Copy, customise, share under MIT.
\`\`\`

[Style catalogue](../../styles/INDEX.md) · [Example galleries](../README.md) · [MIT licence](../../LICENSE)`;
writeHeader(13,{image,markdown,summary:'A one-shot scatter of scrambled cells decrypts into a quiet blue title block, then settles permanently.'});
