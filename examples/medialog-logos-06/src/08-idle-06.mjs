// 3D Pipes: glossy tubes that only run along the three axes and turn at ball joints trace an open book
// in isometric view, its two pages rising from a yellow gutter pipe.
import {P,L,C,G,f,rg,save} from './lib.mjs';
const PIPES={red:['#7a120c','#e8352b','#ffb3a8'],blue:['#0b2a6e','#2a6be0','#b9d4ff'],yellow:['#7a5a00','#f6c20f','#fff2b0']};
const c30=Math.cos(Math.PI/6),s30=.5;
const H=96,Wd=96,gx=120,gt=110;// page height, page width along the iso axis, gutter x and top
const gb=gt+H;
const up=(x,y,s,d)=>[f(x+s*d*c30),f(y-d*s30)];// along an iso axis: s=-1 up-left, s=1 up-right
const [lx,ly]=up(gx,gt,-1,Wd),[rx,ry]=up(gx,gt,1,Wd);
// A tube: dark rim, body colour, then a highlight stripe nudged toward the light at the upper left.
function tube(d,k,nx,ny,w=19){const [dark,mid,hi]=PIPES[k];return L(d,dark,w)+L(d,mid,w*.71)+L(d,hi,w*.24,`transform="translate(${nx*w/19} ${ny*w/19})" opacity=".9"`);}
const ball=(x,y,k)=>C(x,y,13,`url(#ball-${k})`)+C(x,y,13,'none',`stroke="${PIPES[k][0]}" stroke-width="2.5"`);
const defs=Object.entries(PIPES).map(([k,[dark,mid,hi]])=>rg('ball-'+k,[[0,'#ffffff'],[.25,hi],[.6,mid],[1,dark]],{cx:.36,cy:.32,r:.7})).join('');
const page=(s,k,ox,oy)=>tube(`M${gx} ${gt}L${ox} ${oy}V${f(oy+H)}L${gx} ${gb}`,k,s<0?-2.6:-1.6,-3);
// Each page is a patch of the screensaver's black space, with two thinner pipes for lines of text.
const face=(ox,oy)=>P(`M${gx} ${gt}L${ox} ${oy}V${f(oy+H)}L${gx} ${gb}Z`,'#05070d');
const text=s=>[.34,.6].map(t=>{const y0=gt+H*t,a=up(gx+s*16,y0,s,0),b=up(gx+s*16,y0,s,Wd-34);return tube(`M${a[0]} ${f(a[1]-16*s30)}L${b[0]} ${f(b[1]-16*s30)}`,s<0?'red':'blue',-1.6,-3,9.5);}).join('');
const icon=
 face(lx,ly)+face(rx,ry)+text(-1)+text(1)
 +page(-1,'red',lx,ly)+page(1,'blue',rx,ry)
 +tube(`M${gx} ${gt}V${gb}`,'yellow',-3.2,0)
 +ball(lx,ly,'red')+ball(lx,f(ly+H),'red')+ball(rx,ry,'blue')+ball(rx,f(ry+H),'blue')
 +ball(gx,gt,'yellow')+ball(gx,gb,'yellow');
save(8,{icon,defs,name:'Pipe dream',description:'Glossy 3D pipes trace an open book in isometric view: a red pipe round the left page, a blue pipe round the right, a yellow gutter pipe between them and shiny ball joints at every corner, with the screensaver’s black space inside the pages and thinner pipes for the lines of text.',choices:['Pipes run only along the three axes and turn at ball joints, which is exactly what an isometric open book needs','No tangle of pipes: one book-shaped run, with the black space kept inside the pages']});
