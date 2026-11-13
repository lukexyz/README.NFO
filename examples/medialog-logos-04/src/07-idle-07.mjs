// Screensaver maze walk, reshelved: an endless corridor of book spines glides past toward a warm exit light.
// Every spine follows the same projected path; staggered start times make the walk loop seamlessly.
import {P,R,G,f,lg,rg,rim,save} from './lib.mjs';
const CX=120,CY=148,F=96,ZMIN=.62,ZMAX=3.92,T=12,K=24,N=11;
const pr=(x,y,z)=>[CX+F*x/z,CY-F*y/z];
const quad=pts=>'M'+pts.map(p=>p.map(f).join(' ')).join('L')+'Z';
const bays=[[-.9,-.1],[.1,.9]];
const tones=['#f6f3eb','#74889a','#ae8660','#3c4d78','#a4b3bf','#5d6f9c','#d0ac85','#9aa9bc'];
// Deterministic variety for heights and colours.
const rnd=(i)=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const span=ZMAX-ZMIN,step=span/N,depth=step*.66;
const track=(side,[lo,hi],h)=>Array.from({length:K+1},(_,k)=>{
 const z=ZMAX-span*k/K,top=lo+(hi-lo)*h;
 return quad([pr(side,lo,z),pr(side,top,z),pr(side,top,z+depth),pr(side,lo,z+depth)]);
});
let spines='',n=0;
for(const side of [-1,1])for(const bay of bays)for(let i=0;i<N;i++,n++){
 const h=.62+.36*rnd(n),fr=track(side,bay,h),phase=i/N,start=Math.round(phase*K);
 spines+=`<path d="${fr[start]}" fill="${tones[Math.floor(rnd(n+50)*tones.length)]}"><animate attributeName="d" dur="${T}s" begin="-${f(phase*T)}s" repeatCount="indefinite" values="${fr.join(';')}"/></path>`;
}
// Floor joints and ceiling beams move with the same rhythm.
let joints='';
for(let i=0;i<6;i++){
 const phase=i/6,beam=y=>Array.from({length:K+1},(_,k)=>{const z=ZMAX-span*k/K;return quad([pr(-1,y,z),pr(1,y,z),pr(1,y,z+.05),pr(-1,y,z+.05)]);});
 const fl=beam(-1),cl=beam(1),s=Math.round(phase*K);
 joints+=`<path d="${fl[s]}" fill="#5a4332"><animate attributeName="d" dur="${T}s" begin="-${f(phase*T)}s" repeatCount="indefinite" values="${fl.join(';')}"/></path>`;
 joints+=`<path d="${cl[s]}" fill="#2a3a5f"><animate attributeName="d" dur="${T}s" begin="-${f(phase*T)}s" repeatCount="indefinite" values="${cl.join(';')}"/></path>`;
}
const far=ZMAX+depth,[ex0,ey0]=pr(-1,1,far),[ex1,ey1]=pr(1,-1,far);
const shelves=[-1,-.94,-.06,.06,.94].map(y=>[-1,1].map(s=>P(quad([pr(s,y,.3),pr(s,y+.04,.3),pr(s,y+.04,far),pr(s,y,far)]),'#0b1120')).join('')).join('');
const defs=lg('floor',[[0,'#3b2e26'],[1,'#8c6a4c']])+rg('exit',[[0,'#fff3d6'],[.5,'#f0c98e'],[1,'#c98d55']],{r:.75})
 +`<clipPath id="hall"><rect x="24" y="52" width="192" height="192" rx="20"/></clipPath>`;
const room=R(24,52,192,192,'#141d35')
 +P(`M24 244L216 244L${f(ex1)} ${f(ey1)}L${f(ex0)} ${f(ey1)}Z`,'url(#floor)')
 +P(`M24 52L216 52L${f(ex1)} ${f(ey0)}L${f(ex0)} ${f(ey0)}Z`,'#1c2847')
 +R(ex0,ey0,ex1-ex0,ey1-ey0,'url(#exit)')
 +joints+shelves+spines;
const icon=G(room,'','clip-path="url(#hall)"')+`<circle cx="${CX}" cy="${CY}" r="34" fill="#f0c98e" opacity=".14"/>`+R(24,52,192,192,'none',`rx="20" stroke="${rim}" stroke-width="3"`);
save(7,{icon,defs,name:'Library walk',description:'A first-person walk down an endless corridor of book spines toward a warm exit light, after the old 3D maze screensaver.',choices:['Brick maze walls become shelves of spines in one-point perspective; the floating exit becomes a lit doorway','Spines use brand navy, steel, paper and tan; the floor keeps a wooden warmth'],motion:'A slow, continuous walk forward: shelves, floor joints and beams glide past and loop every twelve seconds.'});
