import { svg, px, writeHeader } from './lib.mjs';

const phi=(1+Math.sqrt(5))/2;
const vertices=[[-1,phi,0],[1,phi,0],[-1,-phi,0],[1,-phi,0],[0,-1,phi],[0,1,phi],[0,-1,-phi],[0,1,-phi],[phi,0,-1],[phi,0,1],[-phi,0,-1],[-phi,0,1]];
const faces=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
const frames=48;
function project([x,y,z],angle){
  const c=Math.cos(angle),s=Math.sin(angle);
  const xx=x*c+z*s, zz=-x*s+z*c;
  const tilt=.48+.22*Math.sin(angle);
  const yy=y*Math.cos(tilt)-zz*Math.sin(tilt);
  const depth=y*Math.sin(tilt)+zz*Math.cos(tilt);
  const perspective=1/(1-depth*.12);
  return [230+xx*63*perspective,180+yy*63*perspective];
}
const geometry=Array.from({length:frames+1},(_,frame)=>vertices.map(v=>project(v,frame/frames*Math.PI*2)));
const points=(frame,face)=>face.map(index=>geometry[frame][index].map(n=>n.toFixed(1)).join(',')).join(' ');
function object(animated){
  return faces.map((face,i)=>`<polygon points="${points(0,face)}" fill="${i%3===0?'#e0faff':i%3===1?'#62dcf2':'#3691bb'}" fill-opacity="${i%3===0?'.12':'.22'}" stroke="#a5f0ff" stroke-opacity=".55" stroke-width="1">${animated?`<animate attributeName="points" dur="18s" repeatCount="indefinite" values="${Array.from({length:frames+1},(_,f)=>points(f,face)).join(';')}"/>`:''}</polygon>`).join('');
}
const image=svg({width:960,height:360,background:'#031c27',
  title:'README.NFO — glenz vector object',description:'A slowly rotating translucent icosahedron with cyan wire edges, orbit dots and a pale pixel wordmark on a flat deep-teal field. An original vector-object demoscene header.',
  css:'.moving{display:block}.still{display:none}.orbit{animation:orbit 24s linear infinite;transform-origin:230px 180px}@keyframes orbit{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.moving{display:none}.still{display:block}}',
  body:`<path d="M36 305H420" stroke="#257b91"/><ellipse cx="230" cy="180" rx="174" ry="68" fill="none" stroke="#2a6679" stroke-width="1"/><ellipse cx="230" cy="180" rx="170" ry="65" transform="rotate(-35 230 180)" fill="none" stroke="#173d4b"/><g class="orbit"><circle cx="58" cy="180" r="5" fill="#defbff"/><circle cx="397" cy="180" r="3" fill="#63c9dc"/></g><g class="moving">${object(true)}</g><g class="still">${object(false)}</g>${px('README.NFO',474,116,7,'#edfcff')}${px('RETRO HEADERS IN EVERY DIMENSION',475,180,1.8,'#89d5e3')}${px('152 STYLES / 13 FAMILIES',475,230,2.3,'#6abccc')}${px('TEXT ART + SVG / MIT',475,268,1.7,'#77a9b7')}${px('VECTOR OBJECT 025',42,322,1.4,'#4b9aae')}${px('COPY. CUSTOMISE. SHARE.',644,322,1.5,'#4b9aae')}`,
});
writeHeader(25,{image,summary:'A slow, genuinely projected 3D glenz icosahedron with translucent faces, wire edges and orbiting dots.',alt:'README.NFO beside a translucent rotating cyan icosahedron, with 152 styles, thirteen families and MIT licence.'});
