import {write} from './lib.mjs';
const text=`HERETIC(1)                 RESEARCH TOOLS                 HERETIC(1)

NAME
       heretic - automatic censorship removal for language models

SYNOPSIS
       heretic MODEL

DESCRIPTION
       Directional ablation with automatic parameter optimisation.
       The implementation uses Python and Optuna's TPE search.

SEE ALSO
       The actual project README, usage guide and AGPL-3.0 licence.

NOTE
       Decorative manual-style header, not the project's manual.

https://github.com/p-e-w/heretic`;
write(25,{text,summary:'A restrained man-page header whose hierarchy comes entirely from capitals, indentation and real Heretic facts.',choices:['The title uses the conventional NAME(section) repetition','The synopsis is the documented positional-model command']});
