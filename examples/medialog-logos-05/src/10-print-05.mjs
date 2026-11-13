// Scene paperwork: a photocopied tick-box slip for a book, a film and an album, ticked in red pen,
// with a dotted tear-off coupon edge.
import {P,L,R,C,G,f,rr,save} from './lib.mjs';
const INK='#18223a',PEN='#d8352a',SHEET='#fbfaf6';
const box=(x,y)=>R(x,y,22,22,'none',`stroke="${INK}" stroke-width="4"`);
const tick=(x,y)=>L(`M${x+2} ${y+12}Q${x+7} ${y+16} ${x+10} ${y+22}Q${x+18} ${y+4} ${x+30} ${y-6}`,PEN,6);
const cross=(x,y)=>L(`M${x+3} ${y+3}L${x+19} ${y+19}M${x+19} ${y+3}L${x+4} ${y+19}`,PEN,5);
// Media glyphs: open book, clapperboard, record.
const bookG=(x,y)=>P(`M${x+16} ${y+6}Q${x+9} ${y+1} ${x} ${y+3}V${y+20}Q${x+9} ${y+18} ${x+16} ${y+23}Z`,INK)+P(`M${x+18} ${y+6}Q${x+25} ${y+1} ${x+34} ${y+3}V${y+20}Q${x+25} ${y+18} ${x+18} ${y+23}Z`,INK);
const clapG=(x,y)=>R(x,y+9,34,15,INK,'rx="2"')+G(R(x,y,34,7,INK,'rx="1.5"')+P(`M${x+8} ${y+6}L${x+11} ${y+1}H${x+16}L${x+13} ${y+6}Z`,SHEET)+P(`M${x+20} ${y+6}L${x+23} ${y+1}H${x+28}L${x+25} ${y+6}Z`,SHEET),`rotate(-12 ${x} ${y+8})`);
const discG=(x,y)=>C(x+17,y+12,12,INK)+C(x+17,y+12,4,SHEET)+C(x+17,y+12,1.6,INK);
const dots=(x,y,w)=>{let s='';for(let i=0;i<w;i+=7)s+=R(x+i,y,3,3,INK,'opacity=".55"');return s;};
const rows=[[bookG,true],[clapG,true],[discG,false]];
let body='';
rows.forEach(([g,ok],i)=>{
 const y=110+i*40;
 body+=box(58,y)+g(92,y-1)+dots(134,y+16,54)+(ok?tick(58,y):cross(58,y));
});
// Header: a marker-drawn bar with a hand-lettered underline, as on a group's form letter.
const head=R(58,74,96,14,INK,'rx="3"')+L('M58 97Q90 92 124 96',PEN,4);
// Tear-off coupon: dotted rule and a small scissor notch.
const coupon=dots(52,228,140)+P('M44 222L52 229L44 236Z',INK);
// Photocopy grain and a faint toner streak.
let grain='';
for(const [x,y,r] of [[70,214,1.4],[150,100,1.1],[178,196,1.3],[110,232,1.1],[186,140,1.2],[64,150,1]])grain+=C(x,y,r,INK,'opacity=".35"');
const sheet=P(rr(40,60,160,190,6),SHEET,`stroke="${INK}" stroke-opacity=".25" stroke-width="2"`)
 +R(172,60,2,190,INK,'opacity=".06"')
 +P('M180 60H200V80Z','#e3dfd2');
const icon=P(rr(48,68,160,190,6),INK,'opacity=".18"')+G(sheet+head+body+coupon+grain,'','')
 +P('M180 60L200 80H184A4 4 0 0 1 180 76Z','#d8d3c4');
save(10,{icon:G(icon,'rotate(-4 120 156)'),name:'Review slip',description:'A photocopied tick-box slip lists a book, a film and an album; the first two are ticked in red pen and the album is crossed out, above a dotted tear-off coupon.',choices:['The swap-letter form becomes a media review card: one box per thing you read, watched or heard','Photocopier black on warm white, red pen marks, grain and a toner streak; no typed words are needed']});
