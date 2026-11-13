// Handheld boot: a navy-tuned four-shade LCD where a pixel book drops in and lands, like a cartridge logo.
import {P,R,C,G,pixels,tile,rim,save} from './lib.mjs';
const S=['#cdd6b0','#8ea38a','#4a5c68','#18223a'];// four shades, pale sage to brand navy
const pitch=8,cols=19,rows=15,lx=56,ly=90;
// Bezel with the handheld's long bottom-right curve.
const bezel='M34 58H206A14 14 0 0 1 220 72V188A50 50 0 0 1 170 238H34A14 14 0 0 1 20 224V72A14 14 0 0 1 34 58Z';
let lcd=R(lx-3,ly-3,cols*pitch+6,rows*pitch+6,S[0],'rx="3"');
for(let j=0;j<rows;j++)for(let i=0;i<cols;i++)lcd+=R(lx+i*pitch+.75,ly+j*pitch+.75,pitch-1.5,pitch-1.5,'#c6d0a8');// faint dot-matrix grid
const book=[
 '333333...333333',
 '300000333000003',
 '301110030011103',
 '300000030000003',
 '301111030111103',
 '300000030000003',
 '301100030001103',
 '300000030000003',
 '333333030333333',
 '222222333222222',
 '...........2...',
];
const sprite=pixels(book,{0:S[0],1:S[1],2:S[2],3:S[3]},{x:lx+pitch*2,y:ly+pitch*2,size:pitch});
const icon=P(bezel,tile,`stroke="${rim}" stroke-width="3"`)
 +R(34,71,172,3,'#a8556a')+R(34,78,172,3,'#5d6f9c')
 +C(37,150,10,'#e0574b','opacity=".22"')+C(37,150,5.5,'#e0574b')
 +lcd
 +`<clipPath id="lcd"><rect x="${lx}" y="${ly}" width="${cols*pitch}" height="${rows*pitch}"/></clipPath>`
 +G(G(sprite,'','class="ghost"')+G(sprite,'','class="drop"'),'','clip-path="url(#lcd)"');
const css='.drop{animation:drop 2.2s steps(13,end) .3s both}.ghost{opacity:0;animation:drop 2.2s steps(13,end) .45s both,ghost 2.95s linear both}@keyframes drop{from{transform:translateY(-104px)}to{transform:none}}@keyframes ghost{0%,90%{opacity:.3}100%{opacity:0}}';
save(1,{icon,css,name:'Boot log',description:'A pixel book drops down a navy-tuned four-shade handheld screen and lands, the way a cartridge logo arrives at power-on.',choices:['The handheld bezel with its long bottom-right curve frames a dot-matrix screen; the classic olive shades are retuned from pale sage to brand navy','The book descends in whole-pixel steps with a faint LCD ghost, then holds'],motion:'Plays once on load: the book descends in whole-pixel steps for about two seconds and stays.'});
