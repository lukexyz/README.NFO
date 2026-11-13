// Glenz vector object: a translucent open book turning in space, its overlapping pages brightening like cut glass.
// Frames are projected here and interpolated by SVG animation; the static file holds frame zero.
import {P,L,C,G,f,glint,save} from './lib.mjs';
const FRAMES=72,DUR=16,CX=120,CY=150,SCALE=86,D=5,PITCH=.9,YAW0=-.24;
// Model: an open book lying on a turntable. Spine along z, leaves rise from it at small elevations.
const leaves=[
 {e:3,w:1.06,h:1.42,kind:'cover',side:1},{e:3,w:1.06,h:1.42,kind:'cover',side:-1},
 {e:12,w:1,h:1.32,kind:'page',side:1},{e:12,w:1,h:1.32,kind:'page',side:-1},
 {e:22,w:1,h:1.32,kind:'page',side:1,text:true},{e:22,w:1,h:1.32,kind:'page',side:-1,text:true},
];
const rad=d=>d*Math.PI/180;
function project([x,y,z],yaw){
 const cy=Math.cos(yaw),sy=Math.sin(yaw);
 [x,z]=[x*cy+z*sy,-x*sy+z*cy];
 const cp=Math.cos(PITCH),sp=Math.sin(PITCH);
 [y,z]=[y*cp-z*sp,y*sp+z*cp];
 const k=D/(D+z);
 return [CX+x*k*SCALE,CY-y*k*SCALE];
}
const quad=(pts,yaw)=>'M'+pts.map(p=>project(p,yaw).map(f).join(' ')).join('L')+'Z';
const seg=([a,b],yaw)=>'M'+project(a,yaw).map(f).join(' ')+'L'+project(b,yaw).map(f).join(' ');
function shapes(yaw){
 const out=[];
 for(const l of leaves){
  const dx=l.side*Math.cos(rad(l.e))*l.w,dy=Math.sin(rad(l.e))*l.w,h=l.h/2;
  out.push({cls:l.kind,d:quad([[0,0,-h],[0,0,h],[dx,dy,h],[dx,dy,-h]],yaw)});
  if(l.text)for(const [z,e] of [[.38,.82],[.14,.82],[-.1,.82],[-.34,.56]]){
   out.push({cls:'line',d:seg([[dx*.18,dy*.18,z],[dx*e,dy*e,z]],yaw)});
  }
 }
 // Ribbon bookmark from the spine, trailing past the near edge.
 out.push({cls:'ribbon',d:quad([[.02,.01,.2],[.1,.03,.2],[.16,-.02,-.86],[.08,-.04,-.82]],yaw)});
 return out;
}
const yaws=Array.from({length:FRAMES+1},(_,i)=>YAW0+2*Math.PI*i/FRAMES);
const frames=yaws.map(shapes);
const style={cover:'fill="var(--glass2)" stroke="var(--edge)" stroke-width="3" stroke-linejoin="round"',page:'fill="var(--glass)" stroke="var(--edge)" stroke-width="2.4" stroke-linejoin="round"',line:'fill="none" stroke="var(--lines)" stroke-width="3.2" stroke-linecap="round"',ribbon:'fill="var(--accent)" opacity=".9"'};
let body='';
frames[0].forEach((s,i)=>{
 const values=frames.map(fr=>fr[i].d).join(';');
 body+=`<path d="${s.d}" ${style[s.cls]}><animate attributeName="d" dur="${DUR}s" repeatCount="indefinite" values="${values}"/></path>`;
});
const icon=`<ellipse cx="${CX}" cy="${CY+46}" rx="86" ry="12" fill="var(--ink)" opacity=".08"/>`+G(body,'','class="obj"')
 +G(glint(198,86,13,'var(--spark)'),'','class="spark"')+G(glint(40,210,8,'var(--spark)'),'','class="spark s2"');
const css=':root{--glass:rgba(58,90,140,.2);--glass2:rgba(24,34,58,.42);--edge:#18223a;--lines:#5f7899;--spark:#ae8660}@media(prefers-color-scheme:dark){:root{--glass:rgba(214,228,255,.16);--glass2:rgba(150,178,222,.32);--edge:#e9eef7;--lines:#a9bede;--spark:#d0ac85}}.spark{transform-box:fill-box;transform-origin:center;animation:spark 4.6s ease-in-out infinite}.s2{animation-delay:-2.3s}@keyframes spark{0%,100%{transform:scale(.4);opacity:.3}50%{transform:scale(1);opacity:1}}';
save(4,{icon,css,name:'Glass book',description:'A translucent open book turns slowly in space. Where its pages overlap, the glass deepens, like a glenz object from a nineties demo.',choices:['The rotating glenz solid becomes a six-leaf open book with a tan ribbon, projected in true perspective','Translucent navy faces deepen where they overlap on light pages; on dark pages they brighten like glass'],motion:'The book turns once every sixteen seconds and two small glints pulse; the static file holds a three-quarter view.'});
