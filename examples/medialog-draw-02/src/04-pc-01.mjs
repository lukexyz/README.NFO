// Flat DOS intro with original stepped, bevelled MediaLog letters and one reel effect.
import {R,P,L,C,B,save} from './lib.mjs';
let s='';
for(const [x,y,r] of [[115,341,87],[884,341,87]]){s+=`<g opacity=".14"><g class="reel" style="transform-origin:${x}px ${y}px">${C(x,y,r,'#e9c3a3')}${C(x,y,18,'#321341')}`;for(let i=0;i<6;i++){const a=i*Math.PI/3;s+=C(x+Math.cos(a)*r*.6,y+Math.sin(a)*r*.6,19,'#321341');}s+='</g></g>';}
s+=`<g transform="translate(29 0) skewX(-8)">${B('MEDIALOG',66,50,16.6,'#9d553d',810)}${B('MEDIALOG',60,42,16.6,'#e0a566',810)}${B('MEDIALOG',60,34,16.6,'#fce5ad',810)}</g>`;
s+=R(169,190,662,37,'#8c5144')+R(174,194,652,5,'#c98c68')+B('YOUR PERSONAL CULTURE COLLECTION',200,203,2.9,'#f4d5a6',610);
s+=B('*  FRIENDS & ME  *',307,267,3.7,'#ffceaf',400)+B('-------------------------------',174,313,3.5,'#a374a5')+B('PROUDLY REMEMBERING',267,352,4,'#fff2df');
s+=B('WATCHED / READ / PLAYED / LISTENED',126,404,2.95,'#fff2df')+B('* ALL ON ONE TIMELINE *',258,452,3.1,'#ffcba8');
save(4,{body:s,background:'#321341',height:506,css:'.reel{animation:turn 32s linear infinite}@keyframes turn{to{transform:rotate(360deg)}}',summary:'The personal-culture release',choices:['The presents screen celebrates your remembered media instead of a software release date','Two low-contrast film reels replace background cogs; a wooden plaque names the culture collection']});
