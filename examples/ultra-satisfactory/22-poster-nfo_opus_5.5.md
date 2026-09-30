<p align="center">
  <img src="assets/22-poster-nfo_opus_5.5.svg" width="830" alt="ULTRA-SATISFACTORY, a companion app for the game Satisfactory, drawn as a poster .NFO: a text file that opens with a painting made only of shaded block characters. A factory at night: a Space Elevator mast stands in front of a huge banded planet with a gold car climbing it; smokestacks and a sawtooth-roofed hall with lit windows on the left; a tank, a steaming cooling tower, a column and a flare stack on the right; a conveyor carrying gold parts across the full width. At the foot of the painting the name ULTRA SATISFACTORY stands in tall condensed block capitals, ULTRA in cyan and SATISFACTORY in white, their stems fading downwards through dark, medium and light shade. Below, between two pillars that carry the painting down the page: every recipe, building and Space Elevator objective, one click apart. Then five mirrored dot-leader rows. Type: a companion app, for the game Satisfactory. Payload: 140 items, 211 recipes; buildings: 477, nine of them machines. Tabs: Objectives, Items, Buildings; elevator: 5 phases, no refunds. Run: python -m streamlit run app/app.py; web: lukexyz.github.io/ULTRA-SATISFACTORY. Protection: none, it's Apache 2.0; affiliation: none, unofficial fan project. Signed: blocks by soot of HALF-PASTA.">
</p>

<p align="center">
  ⚡ <b>ULTRA-SATISFACTORY</b> · the .NFO so long that the whole factory fits inside it<br>
  <sub>⚡ 100 columns, four tones, every mark a character · blocks by soot of HALF-PASTA, a crew that exists only in this file</sub><br>
  <sub>⚡ an unofficial fan project, not affiliated with Coffee Stain Studios</sub>
</p>

⚡ **ULTRA-SATISFACTORY** is a companion app for the factory-building game *Satisfactory*: every recipe, building and Space Elevator objective, one click apart. Park it on a second monitor, a phone or the far side of an alt-tab, and look the thing up before the Assembler runs dry. Your spreadsheet may take the rest of the day off.

⚡ Three tabs, plumbed into each other like a manifold somebody actually finished: **Objectives** (pick a Space Elevator phase, see what it wants and how many), **Items** (search as you type; recipe cards with per-minute rates, the machine, its cycle time and power draw) and **Buildings** (what each one makes, tier by tier, with Mk-by-Mk upgrade paths). Click an ingredient and you are on its recipe. Click the machine and you are on its building.

⚡ Two commands start it (Python 3.10+, from the repo root): `python -m pip install -r requirements.txt`, then `python -m streamlit run app/app.py`. No commands also works: it runs [live in your browser](https://lukexyz.github.io/ULTRA-SATISFACTORY/) with nothing to install. The signposts, mirrored as the file format demands:

<!-- nav:begin (this block is written by src/22-poster-nfo_opus_5.5.mjs) -->

<div align="center">
<pre>
<a href="#whats-inside">what's inside</a> ................ TABS &lt;-&gt; RUN .................. <a href="#run-it-locally">two commands</a>
<a href="#how-its-built">how it's built</a> ............... CODE &lt;-&gt; DATA ................. <a href="#data--credits">who to thank</a>
<a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/">live in your browser</a> .......... WEB &lt;-&gt; LICENCE ................ <a href="#license">Apache 2.0</a>
<a href="app/app.py">app/app.py</a> ................. SOURCE &lt;-&gt; CLOUD ................ <a href="modal_app.py">modal_app.py</a>
</pre>
</div>

<!-- nav:end -->

<details>
<summary>⚡ <b>SCROLL.NFO</b> · the rest of the file: a guide to the painting, the elevator's shopping list, six recipes, greetz</summary>

<!-- nfo:begin (this block is written by src/22-poster-nfo_opus_5.5.mjs) -->

```text
███                                                                          ███
███                   U L T R A - S A T I S F A C T O R Y                    ███
███   every recipe, building and Space Elevator objective, one click apart   ███
███                                                                          ███
███       (the painting is upstairs. this is the part with the words.)       ███
▓▓▓                                                                          ▓▓▓
 ▒░                                                                          ░▒
 ░  ░▒▓ THE FILE ▓▒░                                                          ░
▒▓▓                                                                          ▓▓▒
███  a companion app ............ TYPE <-> FOR ....... the game Satisfactory ███
███  140 items ............... PAYLOAD <-> RECIPES ....... 211, 88 alternate ███
███  477, all buildable .... BUILDINGS <-> MACHINES ..... 9 that do the work ███
███  Python + Streamlit ...... MADE OF <-> LICENCE .............. Apache 2.0 ███
███  none, it is open ..... PROTECTION <-> AFFILIATION ... none, fan project ███
▓▓▓                                                                          ▓▓▓
 ▒░                                                                          ░▒
 ░  ░▒▓ THE PAINTING, LEFT TO RIGHT ▓▒░                                       ░
▒▓▓                                                                          ▓▓▒
███   The stack on the left margin smokes all day and holds this text up.    ███
███   The hall with the sawtooth roof is where the Screws go. All of them.   ███
███   One window in the hall keeps going dark. That is the fuse. It picks    ███
███   its moments.                                                           ███
███   The mast in the middle is the Space Elevator. One car, going up.       ███
███   The planet is decorative. It is not in the data. Do not look it up.    ███
███   The conveyor runs the full width, left to right. Nothing is backed     ███
███   up. We would say.                                                      ███
███   The flare stack burns off whatever the Refinery did not want.          ███
███   The tower on the right margin holds up the other side. Teamwork.       ███
▓▓▓                                                                          ▓▓▓
 ▒░                                                                          ░▒
 ░  ░▒▓ THE ELEVATOR WANTS ▓▒░                                                ░
▒▓▓                                                                          ▓▓▒
███  Automation basics ....... PHASE 1 <-> x500 ........... Automated Wiring ███
███  Logistics & steel ....... PHASE 2 <-> x500 .............. Modular Frame ███
███  Oil & computers ......... PHASE 3 <-> x2500 ....... Versatile Framework ███
███  Nuclear & endgame ....... PHASE 4 <-> x1000 .. Assembly Director System ███
███  Alien tech & quantum .... PHASE 5 <-> x500 ....... Biochemical Sculptor ███
███                                                                          ███
███   One headline demand per phase. The full lists are in the Objectives    ███
███   tab, and every part on them is one click from its recipe.              ███
▓▓▓                                                                          ▓▓▓
 ▒░                                                                          ░▒
 ░  ░▒▓ SIX RECIPES, AS THE ITEMS TAB TELLS THEM ▓▒░                          ░
▒▓▓                                                                          ▓▓▒
███  Iron Plate ............... 20/min <-> 6 s ........... Constructor, 4 MW ███
███  Screw .................... 40/min <-> 6 s ........... Constructor, 4 MW ███
███  Modular Frame ............. 2/min <-> 60 s ........... Assembler, 15 MW ███
███  Versatile Framework ....... 5/min <-> 24 s ........... Assembler, 15 MW ███
███  Heavy Modular Frame ....... 2/min <-> 30 s ........ Manufacturer, 55 MW ███
███  Nuclear Pasta ........... 0.5/min <-> 120 s ...... Particle Accelerator ███
▓▓▓                                                                          ▓▓▓
 ▒░                                                                          ░▒
 ░  ░▒▓ INSTALL ▓▒░                                                           ░
▒▓▓                                                                          ▓▓▒
███   1. python -m pip install -r requirements.txt                           ███
███   2. python -m streamlit run app/app.py                                  ███
███   3. open http://localhost:8501                                          ███
███   or skip all three: https://lukexyz.github.io/ULTRA-SATISFACTORY/       ███
▓▓▓                                                                          ▓▓▓
 ▒░                                                                          ░▒
 ░  ░▒▓ NOTES FROM THE FLOOR ▓▒░                                              ░
▒▓▓                                                                          ▓▓▒
███   A manifold is a load balancer that stopped caring. Both welcome.       ███
███   The fuse blows while you are reading a recipe. Hence the recipe on     ███
███   the other monitor.                                                     ███
███   Every factory has one splitter facing the wrong way. This app will     ███
███   not find it. It will tell you what the machine behind it was hoping    ███
███   to receive.                                                            ███
███   A storage box full of Screws is a lifestyle, not a bug.                ███
███   The pipe that goes through the wall is structural now. Say nothing.    ███
███   "Temporary" is a tier.                                                 ███
▓▓▓                                                                          ▓▓▓
 ▒░                                                                          ░▒
 ░  ░▒▓ GREETZ ▓▒░                                                            ░
▒▓▓                                                                          ▓▓▒
███   The Flare Stack Ratepayers. The Observatory for a Planet That Is Not   ███
███   in the Data. The Grid Congregation and the Free-Range Conveyor         ███
███   Heretics, who read the same recipe card and draw different             ███
███   conclusions. The Dot Rationing Inspectorate, without whom these rows   ███
███   would not reach. The 88 alternate recipes: in the data, off the        ███
███   card, waiting for their moment. Whoever is in the elevator car. It     ███
███   has not come back down. Everyone whose power line was only meant to    ███
███   last the afternoon.                                                    ███
███                                                                          ███
███   Real thanks: game data from greeny/SatisfactoryTools, item and         ███
███   building images from the Satisfactory Wiki (CC BY-NC-SA 4.0).          ███
▓▓▓                                                                          ▓▓▓
 ▒░                                                                          ░▒
 ░  ░▒▓ SMALL PRINT ▓▒░                                                       ░
▒▓▓                                                                          ▓▓▒
███   Unofficial fan project, not affiliated with Coffee Stain Studios.      ███
███   The game is not in this file and never was: go and buy it, it is       ███
███   very good. The app is free and the code is Apache 2.0. HALF-PASTA      ███
███   and soot are made up. So is the planet.                                ███
███                                                                          ███
███                       blocks by soot of HALF-PASTA                       ███
███                  (0.5 a minute, like the Nuclear kind)                   ███
▓▓▓                                                                          ▓▓▓
▒▒▒                                                                          ▒▒▒
░░░                                                                          ░░░
```

<!-- nfo:end -->

</details>
