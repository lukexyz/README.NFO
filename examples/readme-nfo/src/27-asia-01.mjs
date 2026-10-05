import {svg,px,writeHeader} from './lib.mjs';

const channels=[['FM 01','STYLE CATALOGUE','152'],['FM 02','FAMILY INDEX','013'],['FM 03','TEXT + SVG','MIT'],['FM 04','EDITABLE SOURCES','NFO']];
let keyboards='';
for(const [index,row] of channels.entries()){
 const y=133+index*59;
 keyboards+=px(row[0],41,y,1.8,'#9384df')+px(row[1],138,y,1.8,'#c1b2f6')+px(row[2],456,y,1.8,'#c1b2f6');
 keyboards+=`<rect x="41" y="${y+21}" width="469" height="22" fill="#c2c2ca"/>`;
 for(let key=0;key<48;key++){
  keyboards+=`<path d="M${41+key*9.77} ${y+21}v22" stroke="#17172d"/>`;
  if([1,3,6,8,10].includes(key%12))keyboards+=`<rect x="${45+key*9.77}" y="${y+21}" width="5.5" height="13" fill="#131326"/>`;
 }
 keyboards+=`<g transform="translate(41 ${y+21})"><rect class="lit lit${index}" x="${[20,166,293,391][index]}" width="9" height="22" fill="#77ff22"/></g>`;
}
let bars='';
for(let index=0;index<23;index++){
 const h=22+(index*43%107),x=570+index*13;
 bars+=`<g transform="translate(${x} 322)"><g class="meter" style="animation-duration:${3.1+index*.19}s;animation-delay:${-index*.47}s">`;
 for(let segment=0;segment<Math.ceil(h/7);segment++)bars+=`<rect y="${-segment*7-5}" width="8" height="4" fill="${segment<8?'#664c9e':'#aa99ff'}"/>`;
 bars+=`<rect y="${-h-8}" width="8" height="2" fill="#ddd4ff"/></g></g>`;
}
const image=svg({height:465,background:'#030306',title:'README.NFO — FM archive monitor',
 description:'A lavender FM synthesizer-style status screen with one miniature piano keyboard per repository section, lime active keys, spectrum bars and a large README.NFO title.',
 css:`.lit{animation:key 7s steps(4,end) infinite}.lit1{animation-delay:-2s}.lit2{animation-delay:-4s}.lit3{animation-delay:-6s}.meter{animation:meter 5s steps(5,end) infinite;transform-origin:0 0}@keyframes key{0%,100%{transform:translateX(0)}25%{transform:translateX(19px)}50%{transform:translateX(-10px)}75%{transform:translateX(29px)}}@keyframes meter{0%,100%{transform:scaleY(.6)}25%{transform:scaleY(.92)}50%{transform:scaleY(.48)}75%{transform:scaleY(1)}}`,
 body:`<g shape-rendering="crispEdges"><rect x="23" y="22" width="914" height="422" fill="none" stroke="#5b4388" stroke-width="2"/>
  <path d="M23 104H937M543 104V362M23 362H937M23 415H937" stroke="#5b4388"/>
  ${px('README.NFO',41,39,7,'#b6a3ff')}${px('FM ARCHIVE MONITOR',574,41,2,'#b6a3ff')}${px('152 STYLES / 13 FAMILIES',574,72,1.7,'#8b79c8')}
  ${keyboards}${px('SPECTRUM / DEMO MODE',570,122,2,'#b6a3ff')}
  <rect x="570" y="154" width="288" height="35" fill="#17112a" stroke="#5b4388"/>
  ${px('PLAY  STOP  LOOP',592,164,2,'#b6a3ff')}${bars}
  ${px('28',570,340,1,'#8072b5')}${px('250',639,340,1,'#8072b5')}${px('1K',741,340,1,'#8072b5')}${px('4K',842,340,1,'#8072b5')}
  ${px('NOW PLAYING',41,378,1.8,'#8172bc')}${px('RETRO HEADERS / TEXT + SVG',224,375,3,'#c2b4f3')}
  ${px('STYLES  /  EXAMPLES  /  PREVIEW  /  MIT',41,429,1.6,'#9384df')}${px('AUTO  REPEAT',763,429,1.6,'#9384df')}
 </g>`});
writeHeader(27,{image,alt:'README.NFO lavender FM status display with four keyboards, lit green keys and spectrum bars',summary:'Four keyboard channels, lime key lights and a stepped lavender spectrum for the retro archive.'});
