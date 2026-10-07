import {R,T,W,write} from './lib.mjs';
let body=R(15,13,930,374,'#c5c5c5','stroke="#eee" stroke-width="3"')+R(21,19,918,28,'#00007f')+T('#heretic / open directions — illustrative channel',34,40,19,'#fff')+R(28,73,691,263,'#fff','stroke="#888"')+R(730,73,196,263,'#fff','stroke="#888"');
body+=T('* topic: Python / abliteration / Optuna',43,100,17,'#009393')+W(43,124,9,'#9c009c')+T('<model> transformer research',43,234,19,'#00007f')+T('<direction> remove one residual direction',43,267,19,'#009300')+T('<search> TPE parameter optimisation',43,300,18,'#9c009c');
['@model','+direction','search','python','optuna'].forEach((s,i)=>{body+=T(s,741,104+i*29,18,'#333');});
body+=R(28,349,898,25,'#fff','stroke="#888"')+T('No real messages or connected users are represented.',39,367,15,'#666');
write(30,{body,background:'#3b484f',summary:'A colour-coded IRC channel with an original Heretic art paste and fictional component nicks in a separate member pane.',choices:['Component nicks carry the model-direction-search conversation','The explicitly illustrative chat avoids invented user activity']});
