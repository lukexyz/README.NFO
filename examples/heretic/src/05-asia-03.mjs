import {R,T,W,write} from './lib.mjs';
let body=R(0,0,960,33,'#ddd')+T('【 HERETIC 】  open model research board',18,24,20,'#111')+T('[R] read  [D] directions  [S] search',24,67,18,'#ffdf67')+W(34,94,10,'#8de9b1');
body+=R(24,190,912,24,'#777')+T('AREA      CLASS       DESCRIPTION',37,208,15,'#000');
const rows=[['MODEL','PYTHON','Transformer language models'],['VECTOR','ABLATION','Directional intervention'],['SEARCH','OPTUNA','TPE parameter optimisation']];
rows.forEach((row,i)=>{const y=243+i*32;body+=T('◎ '+row[0].padEnd(10)+row[1].padEnd(12)+row[2],36,y,18,i%2?'#ffdc6d':'#e2e2e2');});
body+=T('推 research: Python tools for language-model experiments',35,346,16,'#bb8f35')+R(0,367,320,33,'#00abab')+R(320,367,320,33,'#b536ad')+R(640,367,320,33,'#ddd')+T('p-e-w/heretic   /   illustrative board, no user statistics',18,390,15,'#131313');
write(5,{body,background:'#000',summary:'A telnet research board with lenticular brackets, semantic ANSI colours and Heretic component areas.',choices:['Board areas correspond to model, ablation and Optuna research','An illustrative push line replaces invented community counts']});
