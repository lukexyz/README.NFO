// A real repository tree, aggregated into four isometric glass towers.
import fs from 'node:fs';
import path from 'node:path';
import { DIR, svg, px, center, writeHeader } from './lib.mjs';
const root=path.resolve(DIR,'../..');
function stats(dir){let bytes=0,files=0;for(const e of fs.readdirSync(dir,{withFileTypes:true})){
  if(e.name==='node_modules'||e.name==='.git'||e.name.startsWith('.preview'))continue;
  const f=path.join(dir,e.name);if(e.isDirectory()){const s=stats(f);bytes+=s.bytes;files+=s.files;}else if(e.isFile()){bytes+=fs.statSync(f).size;files++;}
}return {bytes,files};}
const dirs=['styles','tools','.github','examples'].map(name=>({name,...stats(path.join(root,name))}));
const positions=[[255,256],[464,268],[675,281],[538,351]];
let towers='',traces='',grid='';
for(let i=-7;i<11;i++){grid+=`<path d="M${480+i*65} 120l480 244M${480+i*65} 120l-480 244"/>`;}
const max=Math.max(...dirs.map(d=>d.bytes));
for(const [i,d]of dirs.entries()){
 const [x,y]=positions[i],h=50+Math.log1p(d.bytes)/Math.log1p(max)*110;
 traces+=`<path d="M480 393L${x} ${y+23}"/><path class="pulse p${i}" d="M480 393L${x} ${y+23}"/>`;
 towers+=`<g><path d="M${x-62} ${y-18-h}l62-31 62 31-62 31z" fill="#588cff" fill-opacity=".3" stroke="#749eff"/>
 <path d="M${x-62} ${y-18-h}l62 31v${h}l-62-31z" fill="#174cb0" fill-opacity=".36" stroke="#376cdf"/>
 <path d="M${x} ${y+13-h}l62-31v${h}l-62 31z" fill="#3c73da" fill-opacity=".23" stroke="#749eff"/>
 <path d="M${x-67} ${y-15}l67-34 67 34v15l-67 34-67-34z" fill="#161b38" stroke="#7757c8"/>
 <g transform="translate(${x-52} ${y-h}) skewY(26.565)">${px(d.name.toUpperCase(),0,0,1.2,'#dbe8ff')}${Array.from({length:5},(_,r)=>px(['ASSETS','INDEX','SOURCE','ENTRIES','PUBLIC'][r],0,20+r*18,1.2,'#7995c6')).join('')}
 <rect class="scan s${i}" x="-3" y="35" width="54" height="9" fill="#a4d7ff" opacity=".35"/></g></g>`;
}
const labels=dirs.map((d,i)=>{const x=32+i*237;return px(d.name.toUpperCase(),x,461,2,'#e2eaff')+px(`${d.files} FILES / ${(d.bytes/1048576).toFixed(2)} MB`,x,485,1.5,'#859bcd');}).join('');
const image=svg({height:520,background:'#060817',defs:'<radialGradient id="sky"><stop stop-color="#152453"/><stop offset="1" stop-color="#060817"/></radialGradient>',css:
'.pulse{stroke:#e2fbff!important;stroke-width:3!important;stroke-dasharray:8 42;animation:flow 8s linear infinite}.p1{animation-delay:-2s}.p2{animation-delay:-4s}.p3{animation-delay:-6s}.scan{animation:scan 7s ease-in-out infinite}.s1{animation-delay:-2s}.s2{animation-delay:-4s}@keyframes flow{to{stroke-dashoffset:-200}}@keyframes scan{50%{transform:translateY(60px)}}',
title:'README.NFO — repository as an isometric file city',description:'Glass towers represent the actual examples, styles, tools and GitHub workflow directories. Height encodes log-scaled byte size; each label reports a build-time file count and size.',body:
'<rect width="960" height="520" fill="url(#sky)"/>'+center('README.NFO',26,6,'#e2ecff')+center('A SMALL CITY OF BIG HEADER IDEAS',82,1.7,'#a0b5e0')+
`<g stroke="#1c2851" stroke-width="1" opacity=".5">${grid}</g><g stroke="#7253d1" stroke-width="2" fill="none">${traces}</g>`+towers+
'<path d="M320 402l160-58 160 58-160 58z" fill="#101c40" stroke="#8b6be2"/>'+center('ROOT / README.NFO',393,2,'#f3f3ff')+
labels+center('REAL TREE SNAPSHOT / HEIGHT = LOG BYTE SIZE / TEXT + SVG / MIT',510,1,'#6e84b8')});
writeHeader(17,{image,summary:'A glass-tower map of the real repository: directory sizes become height, and white data pulses connect them.'});
