import {svg,px,center,writeHeader} from './lib.mjs';
let ribbons='';
const ramps=[['#22002f','#ba24b2','#ffbeef'],['#061b49','#1595d6','#c0ffff'],['#341c01','#f06b15','#fffdb1']];
for(let k=0;k<100;k++){
 const y=24+k*3;
 for(let lane=0;lane<3;lane++){
  const x=480+Math.sin(k*.095+lane*2.1)*240+Math.sin(k*.03)*110;
  ribbons+=`<g class="ribbon" style="animation-delay:${(-k*.12-lane*3).toFixed(2)}s"><rect x="${Math.round(x)}" y="${y}" width="20" height="${360-y}" fill="url(#ramp${lane})"/></g>`;
 }
}
const defs=ramps.map((v,i)=>`<linearGradient id="ramp${i}"><stop stop-color="${v[0]}"/><stop offset=".28" stop-color="${v[1]}"/><stop offset=".5" stop-color="${v[2]}"/><stop offset=".72" stop-color="${v[1]}"/><stop offset="1" stop-color="${v[0]}"/></linearGradient>`).join('');
const image=svg({height:385,background:'#04040b',defs,css:'.ribbon{animation:swing 10s cubic-bezier(.37,0,.63,1) infinite alternate}@keyframes swing{from{transform:translateX(-76px)}to{transform:translateX(76px)}}',title:'README.NFO — vertical copper ribbons',description:'Three coloured ramps form stepped scanline ribbons that curl and overlap over black. The title stays legible on a dark central plaque.',body:
ribbons+'<path d="M150 113H810v131H150z" fill="#04040b" fill-opacity=".87" stroke="#b7b7cb" stroke-opacity=".5"/>'+center('README.NFO',141,7,'#e5e5ed')+center('A FIRST IMPRESSION IN EVERY COLOUR',210,1.8,'#e6c5ea')+
px('152 STYLES',25,20,1.8,'#a0c6e4')+px('13 FAMILIES / MIT',720,20,1.8,'#a0c6e4')+
'<rect y="361" width="960" height="24" fill="#05060c"/>'+center('ORIGINAL TEXT + SVG / COPY A LOOK / MAKE IT YOURS',369,1.4,'#b5b7d0')});
writeHeader(38,{image,summary:'Three slowly swaying scanline ramps braid into copper ribbons behind a crisp, dark-backed title.'});
