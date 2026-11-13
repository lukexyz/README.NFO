// Off-air TV: a navy set with rabbit-ear antennas shows broadcast colour bars, castellations and a PLUGE band,
// with a station-ident box carrying a small open book.
import {P,L,R,C,G,f,rr,lg,tile,rim,save} from './lib.mjs';
const sx=36,sy=100,sw=140,sh=118;// screen
// 75 % bars, pulled toward brand-friendly tones: grey, ochre, teal, green, plum, brick, blue.
const bars=['#c9c6bd','#d8b450','#5fae9f','#67a157','#93608c','#c4473d','#3d5fae'];
const castle=['#3d5fae','#10141f','#93608c','#10141f','#5fae9f','#10141f','#c9c6bd'];
const bw=sw/7,top=sh*.66,mid=sh*.09;
let screen='';
bars.forEach((c,i)=>screen+=R(sx+i*bw,sy,bw+.5,top,c));
castle.forEach((c,i)=>screen+=R(sx+i*bw,sy+top,bw+.5,mid,c));
const by=sy+top+mid,bh=sh-top-mid;
screen+=R(sx,by,sw,bh,'#0c0f18')+R(sx,by,bw*1.25,bh,'#1d2c55')+R(sx+bw*1.25,by,bw*1.25,bh,'#f6f3eb')+R(sx+bw*2.5,by,bw*1.25,bh,'#3b2a5c')
 +R(sx+bw*5,by,bw*.33,bh,'#05070c')+R(sx+bw*5.66,by,bw*.33,bh,'#151a26');
// Station ident box with an open book.
screen+=R(84,124,44,30,'#0c0f18','rx="3"')
 +P('M106 147Q98 141 90 143V131Q98 129 106 135Z','#f6f3eb')+P('M106 147Q114 141 122 143V131Q114 129 106 135Z','#f6f3eb');
const defs=`<clipPath id="crt"><path d="${rr(sx,sy,sw,sh,16)}"/></clipPath>`+lg('sheen',[[0,'#ffffff',.22],[.45,'#ffffff',0]],[0,0,.8,1]);
const icon=L('M112 92L82 46','var(--ink)',5)+L('M118 92L152 52','var(--ink)',5)+C(82,46,6,'var(--accent)')+C(152,52,6,'var(--accent)')
 +P('M98 94Q115 76 132 94Z',tile)
 +P(rr(20,86,200,146,22),tile,`stroke="${rim}" stroke-width="3"`)
 +R(30,232,22,10,tile,'rx="3"')+R(188,232,22,10,tile,'rx="3"')
 +G(screen,'','clip-path="url(#crt)"')
 +P(rr(sx,sy,sw,sh,16),'url(#sheen)')+P(rr(sx,sy,sw,sh,16),'none','stroke="#05070c" stroke-opacity=".55" stroke-width="3"')
 +C(198,120,10,'#d9e0e5')+C(198,120,3,'#18223a')+C(198,152,10,'#d9e0e5')+C(198,152,3,'#18223a')
 +R(186,178,24,4,'#5d6f88','rx="2"')+R(186,188,24,4,'#5d6f88','rx="2"')+R(186,198,24,4,'#5d6f88','rx="2"');
save(2,{icon,defs,name:'Off air',description:'A navy television with rabbit-ear antennas shows broadcast colour bars, castellations and a black-level strip, with a station-ident box holding a small open book.',choices:['The colour-bar test pattern reads as television at any size; the ident box carries the diary as the channel logo','Bars are pulled toward ochre, teal, plum and brick so the screen stays clear of neon cyan and magenta']});
