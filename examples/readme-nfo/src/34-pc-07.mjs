import { svg, px, esc, writeHeader } from './lib.mjs';

// Original six-cell poster alphabet, horizontally doubled and packed on a 79-cell page.
const glyphs={R:['111110','100001','100001','111110','100100','100010','100001'],
 E:['111111','100000','100000','111110','100000','100000','111111'],
 A:['011110','110011','100001','100001','111111','100001','100001'],
 D:['111100','100110','100011','100001','100011','100110','111100'],
 M:['110011','111111','101101','100001','100001','100001','100001'],
 N:['100001','110001','111001','101101','100111','100011','100001'],
 F:['111111','100000','100000','111110','100000','100000','100000'],
 O:['011110','110011','100001','100001','100001','110011','011110'],
 '.':['000000','000000','000000','000000','000000','001100','001100']};
const ink=(word,row)=>[...word].map(ch=>glyphs[ch][row].replaceAll('1','██').replaceAll('0','  ')).join(' ');
const cols=79,inner=77;
const rows=[];
const edge='+'+'-'.repeat(inner)+'+';
const row=text=>'|'+text.padEnd(inner)+'|';
const centered=text=>row(text.padStart(Math.floor((inner+text.length)/2)));
rows.push(edge,row(' README.NFO / COPY-READY HEADER ART'),row(''));
for(let y=0;y<7;y++)rows.push(centered(ink('README',y)));
rows.push(row(''));
for(let y=0;y<7;y++)rows.push(centered(ink('.NFO',y)));
rows.push(row(''),row(' 152 STYLES / 13 FAMILIES / TEXT + SVG / MIT'),row(''));
rows.push(row(' COPY TO: your-next-repo/README.md'));
rows.push(row(''),row(' '.repeat(50)+'[ GALLERIES ] [ DOCS ]'),edge);
const cellW=12,cellH=13,pad=6,height=rows.length*cellH+pad*2;
let shapes='';
for(let y=0;y<rows.length;y++) {
  const line=rows[y];
  if(line.includes('█')) {
    let start=-1;
    for(let x=0;x<=line.length;x++) {
      if(line[x]==='█'&&start<0)start=x;
      else if(line[x]!=='█'&&start>=0){shapes+=`<rect x="${pad+start*cellW}" y="${pad+y*cellH}" width="${(x-start)*cellW}" height="${cellH}" fill="#923811"/>`;start=-1;}
    }
  }
}
let frame='';for(let x=0;x<cols;x++) for(const y of [0,rows.length-1])frame+=`<rect x="${pad+x*cellW}" y="${pad+y*cellH}" width="12" height="13" fill="${x%2?'#923811':'#e08040'}"/>`;
for(let y=1;y<rows.length-1;y++)for(const x of [0,cols-1])frame+=`<rect x="${pad+x*cellW}" y="${pad+y*cellH}" width="12" height="13" fill="${y%2?'#e08040':'#923811'}"/>`;
const image=svg({height,background:'#e0b080',
 description:'An original three-colour character-grid poster spells README.NFO in giant packed blocks. The title strip names copy-ready header art, with 152 styles, thirteen families and gallery and documentation controls.',
 body:`<g shape-rendering="crispEdges">${frame}${shapes}<rect x="18" y="19" width="924" height="24" fill="#923811"/>
 ${px('README.NFO / COPY-READY HEADER ART',30,26,1.9,'#e0b080')}
 ${px('152 STYLES / 13 FAMILIES / TEXT + SVG / MIT',30,pad+19*cellH+2,1.9,'#923811')}
 ${px('COPY TO: YOUR-NEXT-REPO/README.MD',30,pad+21*cellH+2,1.8,'#923811')}
 <rect x="605" y="302" width="330" height="22" fill="#e08040"/>
 ${px('[ GALLERIES ] [ DOCS ]',618,307,1.8,'#923811')}</g>`
});
let text=rows.map(esc).join('\n');
text=text.replace('[ GALLERIES ] [ DOCS ]','<a href="../README.md">[ GALLERIES ]</a> <a href="../../styles/INDEX.md">[ DOCS ]</a>');
const markdown=`<p align="center"><img src="assets/34-pc-07.svg" width="100%" alt="An orange, tan and brown README.NFO text-mode poster with giant block lettering."></p>\n\n<details>\n<summary>Text-only poster</summary>\n\n<pre>\n${text}\n</pre>\n\n</details>`;
writeHeader(34,{image,markdown,summary:'A flat tan-and-orange installer poster with giant packed character cells and a matching text version.'});
