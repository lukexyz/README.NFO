import { svg, px, center, writeHeader } from './lib.mjs';

const cells=[{name:'STYLES',x:26,y:122,kind:'square',color:'#fff'},
  {name:'EXAMPLES',x:493,y:122,kind:'triangle',color:'#fff'},
  {name:'GALLERY',x:26,y:233,kind:'fm',color:'#fff'},
  {name:'TOOLS',x:493,y:233,kind:'noise',color:'#fff'}];
let defs='',body='';
for(const [i,c] of cells.entries()) {
  const width=441,height=98,mid=height/2+9;
  defs+=`<clipPath id="scope${i}"><rect x="0" y="0" width="${width}" height="${height}"/></clipPath>`;
  let points=[];
  for(let x=0;x<=width+160;x+=2) {
    const a=(x%160)/160;let y;
    if(c.kind==='square')y=a<.26?-20:20;
    else if(c.kind==='triangle')y=4*20*Math.abs(a-.5)-20;
    else if(c.kind==='fm')y=19*Math.sin(a*Math.PI*2+.7*Math.sin(a*Math.PI*6));
    else y=19*(Math.sin(x*12.9898+4)*43758.5453%1);
    points.push(`${x},${(mid+y).toFixed(2)}`);
  }
  body+=`<g transform="translate(${c.x} ${c.y})"><rect width="${width}" height="${height}" fill="#000" stroke="#55aaff" stroke-opacity=".62"/><path d="M0 ${mid}H${width}M${width/2} 0V${height}" stroke="#404040" stroke-width="1"/>
  ${px(c.name,12,11,1.8,'#9dc8ec')}<g clip-path="url(#scope${i})"><g class="${c.kind==='noise'?'hash':'trace'}" style="animation-duration:${c.kind==='fm'?7:c.kind==='triangle'?9:6}s"><polyline points="${points.join(' ')}" fill="none" stroke="${c.color}" stroke-width="2" vector-effect="non-scaling-stroke"/></g></g></g>`;
}
const image=svg({height:374,background:'#000',defs,
  css:'.trace{animation:run 7s linear infinite}.hash{animation:run 6s steps(24) infinite}@keyframes run{to{transform:translateX(-160px)}}',
  description:'README.NFO in white above four oscilloscope cells. Styles use a pulse wave, examples a triangle, gallery an FM waveform and tools a noise trace. The collection has 152 styles and thirteen families.',
  body:`${center('README.NFO',28,8,'#fff')}${center('152 STYLES / 13 FAMILIES / TEXT + SVG / MIT',96,1.8,'#9dc8ec')}${body}`
});
writeHeader(32,{image,summary:'Four clean white scopes give the styles, examples, gallery and tools their own waveform personality.',alt:'README.NFO with four white oscilloscope traces labelled styles, examples, gallery and tools on a black background.'});
