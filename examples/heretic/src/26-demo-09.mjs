import {R,T,W,write} from './lib.mjs';
let body='';
for(let y=0;y<400;y+=5)for(let x=0;x<960;x+=12){const hue=Math.floor(y/66)*52,lum=10+((Math.floor(x/12)+Math.floor(y/5))%16)*3.7;body+=R(x,y,12,5,`hsl(${hue} 63% ${lum}%)`);}
body+=R(0,70,960,138,'#06141d','fill-opacity=".9"')+`<g transform="translate(90 99) scale(1.7 .65)">${W(0,0,12,'#d5ffff')}</g>`+T('DISPLAY-LIST DIRECTIONS',480,248,25,'#fff','text-anchor="middle"')+R(0,294,960,66,'#07141e')+T('Ablation across transformer layers',480,335,24,'#b4dcdf','text-anchor="middle"');
write(26,{body,background:'#000',summary:'An Atari-style screen of four-wide pixels and hue-shifted luminance ramps, with a stretched original wordmark.',choices:['Colour bands correspond to conceptual transformer layers','A wide-pixel lettering construction follows the GTIA picture grain']});
