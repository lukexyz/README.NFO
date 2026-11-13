// Moire recolouring, with a bold headphone silhouette instead of a historical dancer.
import {P,L,R,C,G,word,save} from './lib.mjs';
const silhouette='M69 183V139C69 66 177 66 177 139V183H151V135C151 101 95 101 95 135V183Z';
const defs=`<clipPath id="disc">${C(123,146,99,'#fff')}</clipPath><clipPath id="phones">${P(silhouette,'#fff')}</clipPath>`;
let rings='';for(let i=0;i<9;i++)rings+=C( 90,151,16+i*15,'none',`stroke="${i%2?'#dc628c':'#493d80'}" stroke-width="13"`);
let body=`<g clip-path="url(#disc)">${R(20,40,211,211,'#6f80c4')}${rings}</g>`+P(silhouette,'#f7ca62')+`<g clip-path="url(#phones)">${L('M50 130H195M50 162H195','#e88b69',10)}</g>`;
body+=R(61,145,31,51,'#f7ca62','rx="9"')+R(154,145,31,51,'#f7ca62','rx="9"');
body+=word({x:260,y:93,width:497,height:120,weight:18,ink:'var(--ink)'});
save(11,{body,defs,name:'Shared frequency',description:'A pair of golden headphones cuts through bold overlapping rings. Music, films and conversations share the same frequency.',choices:['The original headphone silhouette is readable even when the ring pattern becomes texture','The paired ear cups give the symbol a social reading as well as a music one']});
