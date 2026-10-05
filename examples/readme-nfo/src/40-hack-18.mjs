import {DRAW,svg,px,center,writeHeader} from './lib.mjs';
const previous=DRAW.options.filter(p=>p.number<=20);
const counts=picks=>picks.reduce((map,p)=>(map[p.family]=(map[p.family]??0)+1,map),{});
const first=counts(previous),all=counts(DRAW.options);
const leaders=Object.entries(all).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,3);
const colours=['#5eddaa','#da9fff','#6ebcfa'];
const svgCount=DRAW.options.filter(p=>p.medium!=='text-only').length;
const rows=[['REFERENCE',[['CATALOGUE','152'],['FAMILIES','13']]],['CANDIDATES',[['HEADERS','40'],['SVG ART',String(svgCount)]]],['WORKSHOP',[['PREVIEW','READY'],['LICENCE','MIT']]]];
let tiles='',graph='',ranking='';
for(const [r,[name,entries]]of rows.entries()){
 tiles+=px(name,37,126+r*91,1.7,'#9dacbe');
 for(const [c,[label,value]]of entries.entries()){
 const x=37+c*224,y=150+r*91;
 tiles+=`<rect x="${x}" y="${y}" width="207" height="60" rx="5" fill="#19342e" stroke="#3c6f59"/><path d="M${x+181} ${y+13}l5 5 9-12" fill="none" stroke="#79df9a" stroke-width="2"/>`+px(label,x+13,y+12,1.7,'#d4eade')+px(value,x+13,y+35,2.4,'#7be29d');
 }
}
for(const [i,[family,count]]of leaders.entries()){
 const y0=258,scale=12,prior=first[family]??0;
 const d=`M557 ${y0}H620V${y0-prior*scale}H711V${y0-count*scale}H889`;
 graph+=`<path class="curve c${i}" d="${d}" fill="none" stroke="${colours[i]}" stroke-width="3" pathLength="1"/>`+px(family.toUpperCase(),565+i*107,289,1.5,colours[i]);
 ranking+=px(String(i+1).padStart(2,'0'),556,348+i*23,1.6,'#8d9ba8')+px(family.toUpperCase(),605,348+i*23,1.6,colours[i])+px(String(count).padStart(2,'0'),849,348+i*23,1.6,'#e6f4ed');
}
const image=svg({height:431,background:'#0b1017',css:'.curve{stroke-dasharray:1;stroke-dashoffset:0;animation:draw 4s ease-out both}.c1{animation-delay:.25s}.c2{animation-delay:.5s}@keyframes draw{0%{stroke-dashoffset:1}95%,100%{stroke-dashoffset:0}}',title:'README.NFO — challenge board of the saved headers',description:'A challenge board reports 152 catalogue styles, 13 families, 40 candidates and their SVG count. A stepped chart and family ranking use real counts from the two saved draws.',body:
'<path d="M25 99h910" stroke="#2f3b47"/>'+px('README.NFO',36,32,5,'#e9eef1')+px('THE FIRST-IMPRESSION CHALLENGE',422,38,2.2,'#8daaac')+px('TEXT + SVG / MIT / TWO SAVED DRAWS',422,67,1.4,'#93a4b4')+
tiles+px('BUILT CANDIDATES BY FAMILY',548,126,1.5,'#9dacbe')+
'<path d="M557 158v100h332M557 210h332M557 162h332" fill="none" stroke="#303e4c"/>'+graph+
px('START',556,268,1.2,'#8996a6')+px('BATCH 1',656,268,1.2,'#8996a6')+px('BATCH 2',830,268,1.2,'#8996a6')+
'<path d="M541 313h369M541 409h369" stroke="#303e4c"/>'+px('RANK    FAMILY               HEADERS',552,324,1.4,'#92a6b8')+ranking+
'<rect x="37" y="409" width="433" height="2" fill="#65d994"/>'+px('ALL COUNTS FROM THE SAVED DRAWS / CHOOSE YOUR FAVOURITES',37,417,1.2,'#718a99')});
writeHeader(40,{image,summary:'A challenge board and stepped scoreboard built from real counts in the two saved candidate draws.'});
