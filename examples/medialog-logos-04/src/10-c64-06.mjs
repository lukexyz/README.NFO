// Megademo menu chrome: an open book cast in blue-white-grey chrome over a drifting starfield, with a sweeping glint.
import {P,R,C,G,f,lg,glint,rim,save} from './lib.mjs';
const x0=20,y0=56,W=200,H=184;
const left='M116 102Q84 84 40 92V196Q84 188 116 208Z',right='M124 102Q156 84 200 92V196Q156 188 124 208Z';
const chrome=lg('chrome',[[0,'#1c3a78'],[.3,'#5f8fd6'],[.5,'#d9e7fb'],[.53,'#ffffff'],[.555,'#28304a'],[.64,'#5d6782'],[.86,'#b9c1d1'],[1,'#eef1f6']],[0,84,0,210],'gradientUnits="userSpaceOnUse"');
const sweep=lg('sweep',[[0,'#ffffff',0],[.5,'#ffffff',.85],[1,'#ffffff',0]],[0,0,1,0]);
// Starfield: three layers, each drawn twice across so the drift loops after one tile width.
let stars='';
const layer=(n,r,o,cls,seed)=>{let s='';for(let i=0;i<n;i++){const x=x0+((i*73+seed*31)%W),y=y0+8+((i*47+seed*59)%(H-16));for(const k of [0,W])s+=C(x+k,y,r,'#f6f3eb',`opacity="${o}"`);}return G(s,'',`class="${cls}"`);};
stars=layer(9,1.6,.45,'l1',1)+layer(7,2.1,.7,'l2',2)+layer(4,2.8,1,'l3',3);
const defs=chrome+sweep+`<clipPath id="tile"><rect x="${x0}" y="${y0}" width="${W}" height="${H}" rx="18"/></clipPath><clipPath id="pages"><path d="${left}"/><path d="${right}"/></clipPath>`;
const book=P(left,'url(#chrome)')+P(right,'url(#chrome)')
 +G(R(0,70,34,160,'url(#sweep)','transform="skewX(-18)"'),'','class="sweep" clip-path="url(#pages)"')
 +P(left,'none','stroke="#f4f8ff" stroke-width="3" stroke-linejoin="round"')+P(right,'none','stroke="#f4f8ff" stroke-width="3" stroke-linejoin="round"')
 +P('M120 106V210','none','stroke="#0a0f1d" stroke-width="5"');
// Selection bar of the menu: a gold rule the book rests on.
const bar=R(x0,214,W,10,'#e2b04a')+R(x0,214,W,3,'#f6d58a');
const icon=G(R(x0,y0,W,H,'#0a0f1d')+stars+bar,'','clip-path="url(#tile)"')+book
 +G(glint(196,92,15,'#ffffff'),'','class="glint"')
 +R(x0,y0,W,H,'none',`rx="18" stroke="${rim}" stroke-width="3"`);
const css=`.l1{animation:drift 30s linear infinite}.l2{animation:drift 18s linear infinite}.l3{animation:drift 10s linear infinite}@keyframes drift{to{transform:translateX(-${W}px)}}.sweep rect{animation:sweep 5s ease-in-out infinite;transform-box:fill-box}.sweep{}@keyframes sweep{0%,55%{transform:translateX(-60px) skewX(-18deg)}85%,100%{transform:translateX(240px) skewX(-18deg)}}.glint{transform-box:fill-box;transform-origin:center;animation:glint 5s ease-in-out infinite}@keyframes glint{0%,70%{transform:scale(.25) rotate(0);opacity:.2}82%{transform:scale(1) rotate(45deg);opacity:1}100%{transform:scale(.25) rotate(90deg);opacity:.2}}`;
save(10,{icon,defs,css,name:'Chrome edition',description:'An open book cast in megademo chrome — deep blue above a white horizon, cool grey below — over a drifting starfield, resting on a gold selection bar.',choices:['The chrome logo treatment moves from the lettering to the symbol, so the wordmark stays plain','The menu’s selection bar becomes a gold shelf; three star layers drift at different speeds'],motion:'Stars drift in three layers; a highlight sweeps the chrome and the corner glint flares every five seconds.'});
