import {writeHeader} from './lib.mjs';

// Original 5x7 capitals, expanded onto a 118x28-dot canvas. Every art row
// contains only Braille cells, including U+2800 blanks, so fallback fonts do
// not mix ASCII widths into the stippled wordmark.
const glyphs={
 R:[30,17,17,30,20,18,17],E:[31,16,16,30,16,16,31],A:[14,17,17,31,17,17,17],
 D:[30,17,17,17,17,17,30],M:[17,27,21,21,17,17,17],N:[17,25,25,21,19,19,17],
 F:[31,16,16,30,16,16,16],O:[14,17,17,17,17,17,14],'.':[0,0,0,0,0,12,12],
};
const dots=Array.from({length:28},()=>Array(118).fill(false));
for(const [index,letter] of [...'README.NFO'].entries()) for(let y=0;y<7;y++)for(let x=0;x<5;x++){
 if(!(glyphs[letter][y]&(1<<(4-x))))continue;
 for(let sy=0;sy<4;sy++)for(let sx=0;sx<2;sx++){
  const dx=index*12+x*2+sx,dy=y*4+sy;
  // Leave a diagonal paper-like stipple without breaking the letter silhouette.
  dots[dy][dx]=(dx+dy)%5!==1;
 }
}
const bitMap=[[1,8],[2,16],[4,32],[64,128]];
function braille(canvas){
 const height=canvas.length,width=canvas[0].length,lines=[];
 for(let y=0;y<height;y+=4){
  let line='';
  for(let x=0;x<width;x+=2){
   let mask=0;
   for(let sy=0;sy<4;sy++)for(let sx=0;sx<2;sx++)if(canvas[y+sy]?.[x+sx])mask|=bitMap[sy][sx];
   line+=String.fromCodePoint(0x2800+mask);
  }
  lines.push(line);
 }
 return lines;
}
const orbit=Array.from({length:12},()=>Array(118).fill(false));
for(let x=0;x<118;x++){
 const y=Math.round(5+3*Math.sin(x*.095));
 orbit[y][x]=true;
 if(x%3===0&&y<10)orbit[y+1][x]=true;
}
const art=[...braille(dots),String.fromCodePoint(0x2800).repeat(59),...braille(orbit)].join('\n');
const columns=[18,19,18];
const panelWidth=columns.reduce((a,b)=>a+b)+2;
const rule=(left,middle,right)=>left+columns.map(w=>'─'.repeat(w)).join(middle)+right;
const panelRow=values=>'│'+values.map((value,i)=>` ${value}`.padEnd(columns[i])).join('│')+'│';
const heading='─ README.NFO ';
const panel=[
  '┌'+heading+'─'.repeat(panelWidth-heading.length)+'┐',
  '│'+' RETRO HEADERS / TEXT + SVG'.padEnd(panelWidth)+'│',
  rule('├','┬','┤'),panelRow(['152 STYLES','13 FAMILIES','MIT LICENCE']),
  panelRow(['RESEARCHED','VISUAL CATALOGUE','COPY + REUSE']),rule('└','┴','┘'),
].join('\n');
const markdown=`**README.NFO** — retro headers in text and SVG.\n\n\`\`\`text\n${art}\n\`\`\`\n\n\`\`\`text\n${panel}\n\`\`\`\n\n[152 researched styles](../../styles/INDEX.md) · [Example galleries](../README.md) · [MIT licence](../../LICENSE)`;
writeHeader(30,{markdown,summary:'A stippled Braille-dot wordmark and decorative sine trace with ordinary text labels.'});
