// Original joined brush lettering rasterised into a 78-column half-block NFO.
import { svg, px, writeHeader } from './lib.mjs';
const W=78,H=40;
const strokes=[];
const line=(points,r=1.55)=>{for(let i=1;i<points.length;i++)strokes.push([points[i-1],points[i],r]);};
// Oversized R with a long leg; the lowercase letters join along the baseline.
line([[6,35],[9,7],[15,4],[22,6],[23,12],[20,17],[10,19]],2.35);
line([[11,19],[18,24],[23,33],[33,36],[56,36],[69,34]],2.0);
line([[24,26],[32,26],[32,22],[28,20],[24,23],[24,29],[27,32],[32,31],[35,28]]);
line([[43,22],[39,21],[35,24],[34,29],[36,32],[40,31],[43,22],[42,30],[45,31]]);
line([[53,10],[49,30],[46,32],[43,29],[44,24],[47,21],[51,22]]);
line([[52,31],[54,21],[55,26],[58,21],[60,23],[59,30],[63,21],[66,22],[65,29],[67,31]]);
line([[67,26],[74,26],[74,22],[71,20],[68,23],[67,29],[70,32],[75,29]]);
const distance=(x,y,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1];const t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);};
const grid=Array.from({length:H},(_,y)=>Array.from({length:W},(_,x)=>{
  const xx=x-.11*(H-y);return strokes.some(([a,b,r])=>distance(xx,y,a,b)<r);
}));
const lit=(x,y)=>grid[y]?.[x]??false;
let logo='',outline='';
for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  if(lit(x,y))logo+=`M${x*10} ${y*5}h10v5h-10z`;
  else if([[2,0],[-2,0],[0,2],[0,-2],[1,1],[-1,-1]].some(([dx,dy])=>lit(x+dx,y+dy)))outline+=`M${x*10} ${y*5}h10v5h-10z`;
}
const art=[];
for(let y=0;y<H;y+=2)art.push(Array.from({length:W},(_,x)=>lit(x,y)?(lit(x,y+1)?'█':'▀'):(lit(x,y+1)?'▄':' ')).join('').trimEnd());
const box=[
'┌────────────────────────────────────────────────────────────────────────────┐',
'│  COLLECTION : README.NFO              FORMAT : TEXT + SVG                   │',
'│  STYLE POOL : 152                     FAMILY : 13                           │',
'│  LICENCE    : MIT                     STATUS : READY TO CUSTOMISE           │',
'└────────────────────────────────────────────────────────────────────────────┘'];
const image=svg({height:390,background:'#050505',title:'README.NFO — original half-block brush NFO',description:'An oversized script R joins a brushed Readme wordmark, with NFO caption and a two-column release information box.',body:
px('ORIGINAL LETTERING / PUBLIC FILES',90,25,2,'#8b8b8b')+
`<g transform="translate(78 55)" shape-rendering="crispEdges"><path d="${outline}" fill="#383838"/><path d="${logo}" fill="#d3d3d3"/></g>`+
px('.NFO',642,258,4,'#d3d3d3')+
'<path d="M80 297h800v65H80zM477 297v65" fill="none" stroke="#858585"/>'+
px('COLLECTION: README.NFO',100,310,2,'#c0c0c0')+px('FORMAT: TEXT + SVG',500,310,2,'#c0c0c0')+
px('STYLE POOL: 152',100,339,2,'#c0c0c0')+px('LICENCE: MIT / COPY FREELY',500,339,2,'#c0c0c0')});
writeHeader(16,{image,summary:'An original oversized brush R, joined half-block lettering and a two-column NFO information panel.',markdown:[
'<p align="center"><img src="assets/16-nfo-01.svg" width="100%" alt="README.NFO brush-script release header"></p>',
'','Retro README headers, made to be copied and customised. **152 styles · 13 families · MIT.**',
'','<details><summary>Copy the half-block text version</summary>','','```text',...art,'                           R E A D M E . N F O',...box,'```','','</details>','',
'[Style catalogue](../../styles/INDEX.md) · [Example galleries](../README.md)'].join('\n')});
