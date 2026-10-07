import {write} from './lib.mjs';
const text=String.raw`                 HERETIC / THE TYPE-IN PAGE
              A decorative listing, not a program

10 REM HERETIC                 100 REM DIRECTIONAL ABLATION
20 REM PYTHON                 110 REM TRANSFORMER MODELS
30 REM MODEL RESEARCH         120 REM OPTUNA SEARCH
40 REM OPEN DIRECTIONS        130 REM TPE PARAMETERS
50 REM AGPL-3.0               140 REM READ THE REAL README
60 REM ------------------     150 REM ------------------
70 REM NO POKES OR BYTES       160 REM NO INVENTED CHECKSUMS
80 REM JUST A HEADER          170 REM ORIGINAL LETTERING

Margin note: keep the research, change the direction.

https://github.com/p-e-w/heretic`;
write(10,{text,summary:'A two-column magazine type-in page whose REM comments describe Heretic without pretending to execute BASIC.',choices:['Heretic facts are typeset as BASIC comments','The listing explicitly omits invented machine bytes and checksums']});
