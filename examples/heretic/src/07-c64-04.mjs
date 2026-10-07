import {write} from './lib.mjs';
const names=['+--------------+','|   HERETIC    |','+--------------+','|  o---o---o   |','|      |       |','|  o---+---o   |','+--------------+','PYTHON','ABLITERATION','OPTUNA','AGPL-3.0'];
const text='0 "HERETIC         "  HN\n'+names.map(name=>'0 "'+name.padEnd(16)+'" PRG').join('\n')+'\n\nDECORATIVE DIRECTORY / NO FILE SIZES\nDirectional ablation for language models\nhttps://github.com/p-e-w/heretic';
write(7,{text,summary:'A narrow C64 directory picture of a branching model, constrained to quoted 16-character filename cells.',choices:['The directory art contains the model branch motif','Component and licence names replace invented project files or block counts']});
