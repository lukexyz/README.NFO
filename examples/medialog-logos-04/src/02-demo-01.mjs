// Demo opening titles: a letterboxed horizon fades up from black and pans in parallax, like part one of a PC demo.
import {P,R,C,G,f,lg,rim,save} from './lib.mjs';
const x0=16,x1=224,y0=66,y1=230,bar=24,W=x1-x0;
// Seamless ridge: sample a periodic function so the strip loops after exactly one tile width.
function ridge(base,amp,seed,step){
 const pts=[];
 for(let x=0;x<=2*W;x+=step){
  const t=2*Math.PI*x/W;
  pts.push([x0+x,base-amp*(.55*Math.sin(t*seed+1)+.3*Math.sin(t*(seed+2)+2.4)+.15*Math.cos(t*(seed+5)))]);
 }
 return 'M'+x0+' '+y1+pts.map(([x,y])=>'L'+f(x)+' '+f(y)).join('')+'L'+(x0+2*W)+' '+y1+'Z';
}
const sky=lg('sky',[[0,'#141d36'],[.55,'#3b4777'],[1,'#a9a6cf']]);
const glow=`<radialGradient id="sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#f3d9a8"/><stop offset=".55" stop-color="#e2a86a" stop-opacity=".55"/><stop offset="1" stop-color="#e2a86a" stop-opacity="0"/></radialGradient>`;
const clip=`<clipPath id="band"><rect x="${x0}" y="${y0+bar}" width="${W}" height="${y1-y0-2*bar}"/></clipPath><clipPath id="tile"><rect x="${x0}" y="${y0}" width="${W}" height="${y1-y0}" rx="16"/></clipPath>`;
const stars=[[40,104,2.4],[66,98,1.6],[92,112,2],[128,100,1.6],[150,118,2.2],[198,104,1.8],[210,124,1.4],[176,96,1.4]].map(([x,y,r])=>C(x,y,r,'#f6f3eb','class="tw"')).join('');
const scene=R(x0,y0+bar,W,y1-y0-2*bar,'url(#sky)')+stars
 +C(152,168,40,'url(#sun)')+C(152,168,15,'#f3d9a8')
 +G(P(ridge(178,16,2,8),'#6b6f9e'),'','class="far"')
 +G(P(ridge(190,13,3,6),'#3a4370'),'','class="mid"')
 +G(P(ridge(200,8,4,4),'#18223a')+R(x0,200,2*W,40,'#18223a'),'','class="near"')
 +R(x0,y0+bar,W,y1-y0-2*bar,'#000','class="fade" opacity="0"');
const icon=G(R(x0,y0,W,y1-y0,'#0c1222')+G(scene,'','clip-path="url(#band)"')
 // Three title-card ticks in the lower letterbox, as the part counter of an opening sequence.
 +R(104,y1-bar/2-2,8,4,'#5d6a92','class="c1"')+R(116,y1-bar/2-2,8,4,'#5d6a92','class="c2"')+R(128,y1-bar/2-2,8,4,'#e2a86a','class="c3"'),'','clip-path="url(#tile)"')
 +R(x0,y0,W,y1-y0,'none',`rx="16" stroke="${rim}" stroke-width="3"`);
const css=`.far{animation:pan 36s linear infinite}.mid{animation:pan 22s linear infinite}.near{animation:pan 13s linear infinite}@keyframes pan{to{transform:translateX(-${W}px)}}.fade{animation:fade 1.6s ease-out both}@keyframes fade{from{opacity:1}to{opacity:0}}.tw{animation:tw 3.2s ease-in-out infinite}.tw:nth-child(2n){animation-delay:-1.1s}.tw:nth-child(3n){animation-delay:-2.3s}@keyframes tw{50%{opacity:.35}}`;
save(2,{icon,defs:sky+glow+clip,css,name:'Opening titles',description:'A letterboxed horizon fades up from black and pans in three parallax layers under a low warm sun, like the first part of a PC demo.',choices:['Letterbox bars, a palette fade and a slow sideways pan carry the opening-titles grammar into a single frame','Steel-blue VGA ranges are pulled toward the brand navy; one warm sun is the only accent'],motion:'Fades up from black once, then the ridges pan slowly in parallax and the stars twinkle.'});
