// The perspective floor plane becomes an unfolding diary with a path through time.
import {P,L,C,ink,paper,soft,accent,save} from './lib.mjs';
const icon=P('M26 187L68 85L119 108L176 85L216 187L124 226Z',ink)+P('M43 179L76 102L111 118V205Z',paper)+P('M127 118L169 103L198 179L129 205Z',soft)+L('M69 169L89 131M150 130L170 169',ink,7)+L('M116 211L124 177L119 145L124 113',accent,9)+C(124,103,10,accent);
save(7,{icon,name:'A path through it',description:'Pages unfold into a small landscape, with one warm route running from the foreground to the next chapter.',choices:['Perspective makes a timeline feel like a journey through a diary','The ground-plane reference becomes a solid page silhouette rather than a decorative scene']});
