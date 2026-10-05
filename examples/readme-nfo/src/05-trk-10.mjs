import { svg, px, center, writeHeader } from './lib.mjs';

const colours=['#55d8f4','#ffa058','#86e79a','#e67ce2','#efde75'];
let roll='';
for(let key=0;key<48;key++) {
  const x=24+key*19;
  roll+=`<rect x="${x}" y="56" width="19" height="262" fill="${key%2?'#0c1520':'#101d29'}"/><path d="M${x} 56V318" stroke="#385064" stroke-opacity=".24"/>`;
}
for(let y=66;y<=318;y+=28)roll+=`<path d="M24 ${y}H936" stroke="#57758d" stroke-opacity="${y%56===10?'.30':'.14'}"/>`;
const noteRects=[];
for(let i=0;i<40;i++) {
  const x=34+((i*17)%47)*19;
  const y=-240+(i*37)%540;
  const h=20+(i%4)*13;
  const c=colours[i%5];
  noteRects.push(`<rect x="${x}" y="${y}" width="13" height="${h}" rx="2" fill="${c}" fill-opacity=".72"/><rect x="${x}" y="${y+h-3}" width="13" height="3" fill="${c}"/>`);
}
let keyboard='';
for(let key=0;key<48;key++) {
  const x=24+key*19;
  keyboard+=`<rect x="${x}" y="321" width="18" height="59" fill="#e6e9e7" stroke="#8997a1" stroke-width=".5"/>`;
  if([0,1,3,4,5].includes(key%7))keyboard+=`<rect x="${x+12}" y="321" width="12" height="37" fill="#0e1822" stroke="#394750"/>`;
  if(key%6===2)keyboard+=`<rect class="key" x="${x}" y="359" width="18" height="21" fill="${colours[Math.floor(key/6)%5]}" fill-opacity=".42" style="animation-delay:-${key*.47}s"/>`;
}
const title= center('README.NFO',126,12,'url(#titlecolour)');
const image=svg({width:960,height:416,background:'#08111b',
  title:'README.NFO — falling-note piano roll',description:'Rainbow chip note bars descend toward a pale piano keyboard. The repository title is built from a fixed luminous block of notes; 152 styles and thirteen families are shown above.',
  defs:'<clipPath id="roll"><rect x="24" y="56" width="912" height="264"/></clipPath><pattern id="note-cut" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="10" height="9" fill="white"/></pattern><mask id="note-title"><rect width="960" height="416" fill="url(#note-cut)"/></mask><linearGradient id="titlecolour"><stop stop-color="#5cdef9"/><stop offset=".26" stop-color="#9decba"/><stop offset=".52" stop-color="#fff0ab"/><stop offset=".76" stop-color="#ffabbb"/><stop offset="1" stop-color="#b998ff"/></linearGradient>',
  css:'.notes{animation:fall 14s linear infinite}.key{animation:hit 7s ease-in-out infinite}@keyframes fall{from{transform:translateY(-130px)}to{transform:translateY(180px)}}@keyframes hit{0%,100%{opacity:.35}35%,55%{opacity:1}}',
  body:`${px('README.NFO / NOTE ARCHIVE',24,21,2,'#a9b9ce')}${px('152 STYLES',670,24,1.7,'#75d9e8')}${px('13 FAMILIES',806,24,1.7,'#dcd293')}<g clip-path="url(#roll)">${roll}<g class="notes">${noteRects.join('')}</g><rect x="80" y="110" width="800" height="132" fill="#08111b" fill-opacity=".64"/><g mask="url(#note-title)">${title}</g>${center('A FIRST IMPRESSION IN EVERY KEY',230,2,'#aabccb')}</g><path d="M24 319H936" stroke="#90edff" stroke-width="2"/>${keyboard}${px('PULSE',24,397,1.3,colours[0])}${px('TRIANGLE',164,397,1.3,colours[1])}${px('NOISE',340,397,1.3,colours[2])}${px('FM',510,397,1.3,colours[3])}${px('TEXT + SVG / MIT',741,397,1.3,colours[4])}`,
});
writeHeader(5,{image,summary:'Slow rainbow notes descend onto a piano keyboard; a luminous note mosaic spells README.NFO.',alt:'README.NFO formed from luminous note blocks over a rainbow piano roll and a pale keyboard.'});
