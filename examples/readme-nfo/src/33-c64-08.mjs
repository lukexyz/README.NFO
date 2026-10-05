import { svg, center, writeHeader } from './lib.mjs';

let balls='';
for(let i=0;i<30;i++) {
  const phase=-i*.34;
  const a=i*Math.PI*2/30,staticX=230*Math.sin(a),staticY=61*Math.sin(a*2),staticScale=.92+.26*Math.cos(a);
  balls+=`<g transform="translate(327 130)"><g class="bobx" style="--x:${staticX.toFixed(2)}px;animation-delay:${phase}s"><g class="boby" style="--y:${staticY.toFixed(2)}px;animation-delay:${phase}s"><g class="depth" style="--size:${staticScale.toFixed(2)};animation-delay:${phase-3}s"><circle r="15" fill="url(#ball)"/><circle cx="-5" cy="-6" r="2.4" fill="#fff"/></g></g></g></g>`;
}
const points=[];
for(let x=-1;x<=1;x+=.4) for(let y=-1;y<=1;y+=.4) for(let z=-1;z<=1;z+=.4) {
 if(Math.abs(Math.abs(x)-1)<.01||Math.abs(Math.abs(y)-1)<.01||Math.abs(Math.abs(z)-1)<.01)points.push([x,y,z]);
}
let cube='';
for(let f=0;f<8;f++) {
  const angle=f*Math.PI/4;
  const circles=points.map(([x,y,z])=>{
    const rx=x*Math.cos(angle)+z*Math.sin(angle),rz=-x*Math.sin(angle)+z*Math.cos(angle);
    const q=1/(1+rz*.16);const sx=rx*65*q,sy=(y*53+rz*20)*q;
    return `<circle cx="${sx.toFixed(2)}" cy="${sy.toFixed(2)}" r="${(1.4+(.8-rz*.4)).toFixed(2)}" fill="${rz<0?'#daeaff':'#587ca8'}"/>`;
  }).join('');
  cube+=`<g transform="translate(781 127)"><g class="frame frame${f}" style="animation-delay:${-f*2}s">${circles}</g></g>`;
}
const image=svg({height:350,background:'#000',
  defs:'<radialGradient id="ball" cx=".32" cy=".28"><stop stop-color="#d6f4ff"/><stop offset=".2" stop-color="#8ab5e9"/><stop offset=".45" stop-color="#497acf"/><stop offset=".72" stop-color="#19396f"/><stop offset="1" stop-color="#070f28"/></radialGradient><linearGradient id="rainbow"><stop stop-color="#f44"/><stop offset=".2" stop-color="#ffeb59"/><stop offset=".4" stop-color="#6fee68"/><stop offset=".6" stop-color="#67dfed"/><stop offset=".8" stop-color="#6579ff"/><stop offset="1" stop-color="#e469e8"/></linearGradient><linearGradient id="logo" x2="0" y2="1"><stop stop-color="#b76ae4"/><stop offset=".45" stop-color="#805bda"/><stop offset=".5" stop-color="#76d6f2"/><stop offset="1" stop-color="#b0f8ff"/></linearGradient>',
  css:'.bobx{transform:translateX(var(--x));animation:bx 12s cubic-bezier(.37,0,.63,1) infinite}.boby{transform:translateY(var(--y));animation:by 6s cubic-bezier(.37,0,.63,1) infinite}.depth{transform:scale(var(--size));animation:depth 12s ease-in-out infinite}.frame{opacity:0;animation:turn 16s steps(1) infinite}.frame0{opacity:1}@keyframes bx{0%,100%{transform:translateX(-230px)}50%{transform:translateX(230px)}}@keyframes by{0%,100%{transform:translateY(-61px)}50%{transform:translateY(61px)}}@keyframes depth{0%,100%{transform:scale(.65)}50%{transform:scale(1.18)}}@keyframes turn{0%,12%{opacity:1}12.5%,100%{opacity:0}}',
  description:'Thirty blue shaded bobs follow a figure-eight curve next to an original rotating dot lattice. Rainbow hairlines frame the effect, with a violet-to-cyan README.NFO title below.',
  body:`<rect x="25" y="25" width="910" height="2" fill="url(#rainbow)"/>${balls}${cube}<rect x="25" y="230" width="910" height="2" fill="url(#rainbow)"/>
  ${center('README.NFO',255,8,'url(#logo)')}${center('152 STYLES / 13 FAMILIES / MAKE IT YOURS / MIT',329,1.6,'#c0c4dc')}`
});
writeHeader(33,{image,summary:'A blue sphere chain follows a figure-eight beside a rotating dot lattice, framed by rainbow hairlines.',alt:'Blue shaded balls loop on a figure-eight curve alongside a rotating dot cube, above a violet and cyan README.NFO logo.'});
