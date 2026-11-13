// Screensaver pipes: three glossy tubes grow at right angles through a navy disc, one segment at a time, and stay.
import {R,C,G,f,lg,rg,rim,save} from './lib.mjs';
const RAD=10,JOINT=13.5;
const tones={
 tan:['#7a5230','#d39a5c','#f6d4a6'],
 blue:['#2d4672','#6f93c6','#c6dbf6'],
 paper:['#8f897c','#e6e0d2','#ffffff'],
};
let defs='';
for(const [k,[dk,mid,hi]] of Object.entries(tones)){
 const stops=[[0,dk],[.3,mid],[.42,hi],[.58,mid],[1,dk]];
 defs+=lg(k+'H',stops,[0,0,0,1])+lg(k+'V',stops,[0,0,1,0]);
 defs+=rg(k+'J',[[0,hi],[.35,mid],[1,dk]],{fx:.36,fy:.32});
}
// Pipes as point lists; drawn back to front.
const pipes=[
 {tone:'blue',pts:[[150,20],[150,166],[44,166],[44,280]]},
 {tone:'tan',pts:[[-20,116],[92,116],[92,206],[260,206]]},
 {tone:'paper',pts:[[260,88],[184,88],[184,140],[116,140],[116,20]]},
];
let body='',t=0;const speed=210;// units per second
for(const p of pipes){
 for(let i=0;i<p.pts.length-1;i++){
  const [x0,y0]=p.pts[i],[x1,y1]=p.pts[i+1],len=Math.hypot(x1-x0,y1-y0),dur=len/speed;
  const horiz=y0===y1,origin=horiz?(x1>x0?'left':'right'):(y1>y0?'top':'bottom');
  const x=Math.min(x0,x1)-(horiz?0:RAD),y=Math.min(y0,y1)-(horiz?RAD:0),w=horiz?Math.abs(x1-x0):2*RAD,h=horiz?2*RAD:Math.abs(y1-y0);
  body+=R(x,y,w,h,`url(#${p.tone}${horiz?'H':'V'})`,`class="seg ${horiz?'h':'v'}" style="transform-origin:${origin};animation-delay:${f(t)}s;animation-duration:${f(dur)}s"`);
  t+=dur;
  if(i<p.pts.length-2)body+=C(x1,y1,JOINT,`url(#${p.tone}J)`,`class="joint" style="animation-delay:${f(t)}s"`);
 }
 t+=.15;
}
defs+=rg('disc',[[0,'#26365c'],[1,'#121a30']])+'<clipPath id="discClip"><circle cx="120" cy="148" r="96"/></clipPath>';
const icon=C(120,148,96,'url(#disc)')+G(body,'','clip-path="url(#discClip)"')+C(120,148,96,'none',`stroke="${rim}" stroke-width="3"`)
 +`<circle cx="120" cy="148" r="94" fill="none" stroke="#ffffff" stroke-opacity=".08" stroke-width="4"/>`;
const css='.seg{transform-box:fill-box;animation-timing-function:linear;animation-fill-mode:both}.h{animation-name:gx}.v{animation-name:gy}@keyframes gx{from{transform:scaleX(0)}}@keyframes gy{from{transform:scaleY(0)}}.joint{transform-box:fill-box;transform-origin:center;animation:pop .18s ease-out both}@keyframes pop{from{transform:scale(0)}to{transform:none}}';
save(8,{icon,defs,css,name:'Growing pipes',description:'Three glossy tubes in tan, steel blue and paper grow at right angles through a navy disc, with ball joints at every turn, after the classic pipes screensaver.',choices:['Right-angle growth, ball joints and over-under crossings carry the screensaver into a round badge','Primary colours are replaced with brand-friendly tan, steel and paper on navy'],motion:'Plays once on load: the pipes grow segment by segment over about four seconds, then hold.'});
