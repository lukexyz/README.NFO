// FM-synth status display: lavender spectrum bars with peak-hold ticks over a piano keyboard with one lit key.
import {P,R,G,f,rr,rim,save} from './lib.mjs';
const LAV='#8f8fff',PEAK='#d4d4ff',LIME='#86f53a',KEY='#c8c8d2',BG='#101032';
// Spectrum: twelve bars of thin slices, a music-shaped curve with peak ticks above.
const levels=[5,7,8,7,6,7,5,4,5,3,2,2],peaks=[7,8,9,8,7,8,7,5,6,4,3,3];
let spec='';
const bx=36,bwid=12.4,step=14.2,base=150,slice=7.4;
levels.forEach((n,i)=>{
 const x=bx+i*step;
 for(let k=0;k<n;k++)spec+=R(x,base-(k+1)*slice+1.6,bwid,slice-2.4,LAV,k>=n-1?'opacity=".75"':'');
 spec+=R(x,base-(peaks[i]+1)*slice+3,bwid,2.6,PEAK);
});
// Keyboard: ten white keys, black keys in the 2-3 pattern, one key lit lime.
const kx=34,ky=168,kw=17.2,kh=46;
let keys='';
for(let i=0;i<10;i++)keys+=R(kx+i*kw+1,ky,kw-2,kh,i===4?LIME:KEY,'rx="2"');
for(const i of [0,1,3,4,5,7,8])keys+=R(kx+(i+1)*kw-5.2,ky,10.4,kh*.6,'#0b0b24','rx="1.5"');
const icon=P(rr(16,62,208,170,16),BG,`stroke="${rim}" stroke-width="3"`)
 +P(rr(24,70,192,154,10),'none',`stroke="${LAV}" stroke-opacity=".45" stroke-width="2"`)
 +R(30,158,180,2,LAV,'opacity=".45"')
 +P('M206 70H216V80','none',`stroke="${LAV}" stroke-width="2"`)
 +spec+keys;
save(5,{icon,name:'Channel keys',description:'A synth status screen in lavender on deep navy: spectrum bars with peak-hold ticks above a piano keyboard where one key is lit green.',choices:['One keyboard strip, a sliced spectrum analyser and hairline frames keep the X68000 player look at icon size','The lit key is the only green on the screen, as on the original displays; tiny labels and counters are left out']});
