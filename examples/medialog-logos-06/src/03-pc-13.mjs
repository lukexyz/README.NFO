// Glenz vector book: an open book lying on its back with one page in mid-turn, every face a flat
// translucent pane, so the panes deepen where they overlap. Projected from 3D, one fixed pose.
import {P,L,G,f,poly,glint,save} from './lib.mjs';
const D=112,W=90,tilt=46*Math.PI/180,yaw=-50*Math.PI/180,TURN=84;
let cx=0,cy=0;
// World: x right, y up, z toward the viewer; the spine runs along z. Orthographic view from above and in front.
const view=([x,y,z])=>{const x1=x*Math.cos(yaw)+z*Math.sin(yaw),z1=-x*Math.sin(yaw)+z*Math.cos(yaw);return [cx+x1,cy-y*Math.cos(tilt)+z1*Math.sin(tilt)];};
const leaf=(deg,w=W)=>{const a=deg*Math.PI/180,ox=w*Math.cos(a),oy=w*Math.sin(a);return [[0,0,-D/2],[0,0,D/2],[ox,oy,D/2],[ox,oy,-D/2]].map(view);};
// Covers and page blocks lie open; one page turns between them. Back-to-front order.
const panes=[
 {deg:177,cls:'cover'},{deg:3,cls:'cover'},
 {deg:170,cls:'page',w:W-5},{deg:10,cls:'page',w:W-5},
 {deg:TURN,cls:'turn',w:W-7},
];
{const pts=panes.flatMap(p=>leaf(p.deg,p.w));const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);cx=120-(Math.min(...xs)+Math.max(...xs))/2;cy=152-(Math.min(...ys)+Math.max(...ys))/2;}
const css='.cover{fill:#3263e0;fill-opacity:.72}.page{fill:#dde7ff;fill-opacity:.86}.turn{fill:#6a4fe6;fill-opacity:.6}.edge{stroke:#1f3a8f}'
 +'@media(prefers-color-scheme:dark){.cover{fill:#5d8cff;fill-opacity:.5}.page{fill:#dce8ff;fill-opacity:.45}.turn{fill:#a58fff;fill-opacity:.5}.edge{stroke:#eef3ff}}';
const faces=panes.map(p=>P(poly(leaf(p.deg,p.w)),'',`class="${p.cls}"`)).join('');
const edges=panes.map(p=>P(poly(leaf(p.deg,p.w)),'none','class="edge" stroke-width="4" stroke-linejoin="round"')).join('')
 +L(`M${view([0,0,-D/2]).map(f).join(' ')}L${view([0,0,D/2]).map(f).join(' ')}`,'',6.5,'class="edge"');
const tip=view([(W-7)*Math.cos(TURN*Math.PI/180),(W-7)*Math.sin(TURN*Math.PI/180),-D/2]);
const icon=faces+edges+glint(tip[0]+4,tip[1]-6,15,'#ffffff');
save(3,{icon,css,name:'Glass pages',description:'An open book lies on its back in glenz glass: blue covers, pale page blocks and one violet page in mid-turn, each a flat translucent pane that deepens where it overlaps another.',choices:['Glenz vectors: flat translucent faces in one tint plus a pale partner, with crisp edges, from a single 3D pose','One object, no turntable, floor or frame']});
