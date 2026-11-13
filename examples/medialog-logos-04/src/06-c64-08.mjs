// Amiga bobs: a chain of shaded spheres rides an endless figure-eight, nearer balls larger, between two hairlines.
import {C,R,G,f,lg,save} from './lib.mjs';
const N=22,STEPS=60,DUR=11,CX=120,CY=148,AX=90,AY=50;
// Lissajous 1:2; the right lobe swings nearer (depth sin t), so both strands are the same size where they cross.
const at=t=>{const z=Math.sin(t);return {x:CX+AX*Math.sin(t),y:CY-AY*Math.sin(2*t)*.92,r:11.5+3.6*z,z};};
const balls=[];
for(let i=0;i<N;i++){
 const t0=2*Math.PI*i/N,frames=Array.from({length:STEPS+1},(_,k)=>at(t0+2*Math.PI*k/STEPS));
 balls.push({p:frames[0],frames});
}
// Draw far balls first in the resting pose.
balls.sort((a,b)=>a.p.z-b.p.z);
const anim=(name,fr)=>`<animate attributeName="${name}" dur="${DUR}s" repeatCount="indefinite" values="${fr.join(';')}"/>`;
let chain='';
for(const b of balls){
 const {x,y,r}=b.p;
 chain+=`<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="url(#bob)">${anim('cx',b.frames.map(q=>f(q.x)))}${anim('cy',b.frames.map(q=>f(q.y)))}${anim('r',b.frames.map(q=>f(q.r)))}</circle>`;
}
const bob='<radialGradient id="bob" cx=".5" cy=".5" r=".5" fx=".34" fy=".3"><stop offset="0" style="stop-color:var(--b0)"/><stop offset=".22" style="stop-color:var(--b1)"/><stop offset=".7" style="stop-color:var(--b2)"/><stop offset="1" style="stop-color:var(--b3)"/></radialGradient>';
const hair=lg('hair',[[0,'#74889a',0],[.2,'#74889a'],[.5,'#ae8660'],[.8,'#74889a'],[1,'#74889a',0]],[0,0,1,0]);
const icon=R(16,78,208,4,'url(#hair)')+R(16,216,208,4,'url(#hair)')+G(chain,'');
const css=':root{--b0:#ffffff;--b1:#9fb4d4;--b2:#2c3f66;--b3:#0f1729}@media(prefers-color-scheme:dark){:root{--b0:#ffffff;--b1:#c9d8ef;--b2:#5b76a8;--b3:#24355a}}';
save(6,{icon,defs:bob+hair,css,name:'Endless loop',description:'Twenty-two shaded spheres ride an endless figure-eight between two hairlines, larger as they swing nearer — a timeline that keeps going.',choices:['The blitter-bob chain on a Lissajous path becomes a loop with no beginning or end','One navy ramp with a white highlight replaces the copper blue; the rainbow hairlines become steel and tan'],motion:'The chain circulates continuously, one lap every eleven seconds.'});
