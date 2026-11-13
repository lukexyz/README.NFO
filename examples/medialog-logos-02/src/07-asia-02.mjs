// Original sixteen-colour character vignette, avoiding text-heavy visual-novel UI.
import {P,L,R,C,G,word,star,save} from './lib.mjs';
let body=R(34,45,181,207,'#243657','rx="23"')+C(160,87,35,'#f3d9a9')+C(174, 70,30,'#243657');

body+=P('M55 181H188V216H55Z','#a78cb8')+P('M67 178Q70 146  90 144L83 101L116 122L148 105L150 151Q178 155 182 184Z','#eed6be','stroke="#171f37" stroke-width="6"');
body+=L('M102 153h2M135 151h2','#1e2942',8)+L('M115 168Q122 176 129 167','#9a6679',4)+P('M154 189Q186 209 192 180Q194 166 181 162','#b18bab')+L('M68 197H148','#f6e6ce',5)+star(65,85,10,'#dba9be');
body+=word({x:259,y:95,width:496,height:118,weight:16,ink:'var(--ink)'})+C(734, 70+7,7,'#bc92b9');
save(7,{body,name:'One more chapter',description:'A tiny original cat curls up on a book under a crescent moon. A quiet visual-novel vignette for the stories you keep returning to.',choices:['A reader’s companion combines the social and reading sides of MediaLog','Moon, face and book are reduced to large silhouettes so the mascot survives at small size']});
