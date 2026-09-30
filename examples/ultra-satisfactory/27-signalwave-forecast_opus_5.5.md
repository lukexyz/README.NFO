<p align="center">
  <img src="assets/27-signalwave-forecast_opus_5.5.svg" width="640" alt="ULTRA-SATISFACTORY as a 1990s cable forecast screen pointed at a factory: a 4:3 frame fading from indigo to burnt orange, a blue logo tile holding a hexagon with a cog in it, the name in chunky yellow pixel lettering with a hard black shadow, and a clock ticking from 2:11:00 PM above WED SEP 30. The Current Conditions page, for Your Factory Floor, reads an oversized 211, Recipes, beside a cartoon cog rising behind a cloud, then Items 140, Alternates 88, Buildings 477, Machines 9, Ceiling Phase 5, Visibility 1 click, Spaghetti Likely. Every eight seconds it cuts to the next page: the Factory Forecast (what the app is), the Tab Outlook (Objectives, Items, Buildings), Latest Observations (seven recipes with output per minute, machine and megawatts), a Spaghetti Radar and an Elevator Almanac of the five Space Elevator phases. A crawl along the bottom carries the two commands that run the app and the address of the live browser build.">
</p>

<h3 align="center">⚡ ULTRA-SATISFACTORY: your local factory forecast</h3>

<p align="center">
  ⚡ A companion app for the factory-building game <i>Satisfactory</i>: every recipe, building and Space Elevator objective, one click apart.<br>
  ⚡ Tonight: partly automated, with spaghetti moving in from wherever you last said "I'll tidy that later". Keep it on the second monitor, the phone, or one alt-tab away.<br>
  ⚡ <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/"><b>Watch it live in your browser</b></a>, nothing to install · <a href="#run-it-locally">run it locally</a> · <a href="#whats-inside">what's inside</a> · <a href="#how-its-built">how it's built</a> · <a href="#data--credits">credits</a>
</p>

⚡ **The three-tab outlook.** Everything links: click an ingredient or product to open its recipe, click the machine to open its building.

- ⚡ **OBJECTIVES**, ceiling: Phase 5. Pick a Space Elevator phase, see the parts it needs and how many, click a part for its recipe.
- ⚡ **ITEMS**, visibility: one click. Search as you type across every item. Recipe cards show the ingredients with per-minute rates, the machine with its cycle time and power draw, and the products.
- ⚡ **BUILDINGS**, conditions: settled. Every building and what it makes, grouped by tier, plus Mk-by-Mk upgrade paths for miners, conveyors, pipelines and storage.

⚡ **To receive this channel at home** you need Python 3.10+ and two commands, typed from the repo root. The crawl has them too, but the crawl does not wait for you.

```sh
python -m pip install -r requirements.txt
python -m streamlit run app/app.py     # then open http://localhost:8501
```

⚡ The long version is under [Run it locally](#run-it-locally). No aerial? The [browser build](https://lukexyz.github.io/ULTRA-SATISFACTORY/) is the whole app in a tab.

<p align="center">
  <sub>⚡ Cable 88 is not a real station and nobody called Sunny works there. The numbers are real: they are what the app shows.<br>
  ⚡ Unofficial fan project, not affiliated with Coffee Stain Studios. The game is sold separately. The forecast is free.</sub>
</p>

<details>
<summary>⚡ <b>Forecast discussion</b>: the long-range outlook, typed in capitals by a very tired office</summary>

```text
FACTORY FORECAST DISCUSSION
REGIONAL OFFICE OF EXPECTED OUTPUT, YOUR FACTORY FLOOR
211 PM WED SEP 30

.SYNOPSIS...
A LARGE STATIONARY COMPANION APP REMAINS PARKED OVER THE SECOND MONITOR.
140 CRAFTABLE ITEMS, 211 MACHINE RECIPES (88 OF THEM ALTERNATES), 477
BUILDINGS AND 5 SPACE ELEVATOR PHASES ARE ALL WITHIN ONE CLICK OF EACH
OTHER. NO MOVEMENT IS EXPECTED. THAT IS THE WHOLE IDEA.

.TONIGHT...OBJECTIVES TAB...
PICK A PHASE, SEE THE PARTS IT WANTS AND HOW MANY. CLICK A PART FOR ITS
RECIPE. CEILING PHASE 5. ORDERS RANGE FROM X25 TO X2500.

.TOMORROW...ITEMS TAB...
SEARCH UPDATES ON EVERY KEYSTROKE. EACH RECIPE CARD CARRIES THE INGREDIENTS
WITH PER-MINUTE RATES, THE MACHINE WITH ITS CYCLE TIME AND POWER DRAW, AND
THE PRODUCTS. THE 88 ALTERNATES ARE IN THE DATA. CARDS SHOW THE STANDARD
RECIPE.

.EXTENDED...BUILDINGS TAB...
EVERY BUILDING AND WHAT IT MAKES, GROUPED BY TIER, WITH MK-BY-MK UPGRADE
PATHS FOR MINERS, CONVEYORS, PIPELINES AND STORAGE. OF THE 477, NINE ARE
PRODUCTION MACHINES AND 333 ARE STRUCTURE PIECES. YOU KNOW WHICH PEOPLE
BUILT THE 333.

.HAZARDS...
FUSE WATCH...IN EFFECT FOR ANYONE OVERCLOCKING ON A "TEMPORARY" POWER LINE.
SPAGHETTI ADVISORY...SCATTERED THIS EVENING, WIDESPREAD BY PHASE 3.
STORAGE STATEMENT...THE BOX IS FULL OF SCREWS. IT WAS ALWAYS GOING TO BE.
STARVATION NOTICE...ONE MACHINE IS WAITING ON ONE INPUT. IT IS THE LAST ONE
YOU WILL CHECK.

.CONFIDENCE...
HIGH. THIS OFFICE DOES NOT PREDICT YOUR FACTORY. IT LOOKS THINGS UP.

&&

FORECASTER...UNDERCLOCK
```

</details>

<details>
<summary>⚡ <b>Latest observations</b>: nine stations reporting, twenty-one readings, with rates, cycle times and megawatts</summary>

```text
 LATEST OBSERVATIONS                     standard recipes, one machine each

 STATION              ITEM                   /MIN  CYCLE   MW  SKY
 Smelter              Iron Ingot               30    2 s    4  fair
                      Copper Ingot             30    2 s    4  fair
                      Caterium Ingot           15    4 s    4  light drizzle
 Foundry              Steel Ingot              45    4 s   16  warm
 Constructor          Iron Plate               20    6 s    4  steady
                      Iron Rod                 15    4 s    4  steady
                      Screw                    40    6 s    4  gusting, box full
                      Wire                     30    4 s    4  tangled
                      Cable                    30    2 s    4  breezy
 Assembler            Reinforced Iron Plate     5   12 s   15  calm
                      Rotor                     4   15 s   15  turning
                      Modular Frame             2   60 s   15  slow-moving front
                      Smart Plating             2   30 s   15  overcast
                      Versatile Framework       5   24 s   15  changeable
 Manufacturer         Heavy Modular Frame       2   30 s   55  heavy
                      Modular Engine            1   60 s   55  rumbling
                      Adaptive Control Unit     1  120 s   55  stalled
 Refinery             Plastic                  20    6 s   30  hazy
 Packager             Packaged Water           60    2 s   10  wet
 Blender              Cooling System            6   10 s   75  cold snap
 Particle Accelerator Nuclear Pasta           0.5  120 s  n/a  do not look up

 /MIN is output per minute, CYCLE is one craft, MW is the machine's power
 (n/a: the data has no usable figure for that one). The SKY column is made
 up. The rest is the app's own data, as the Items tab shows it.
 21 of the app's 211 recipes. The other 190 did not phone in.
```

</details>

<details>
<summary>⚡ <b>Elevator almanac</b>: all five phases, what each one wants and how many</summary>

```text
 ELEVATOR ALMANAC                          phases of the Space Elevator

 [#----]  PHASE 1  Automation basics
                   Smart Plating ...........................    x50
                   Versatile Framework .....................   x100
                   Automated Wiring ........................   x500

 [##---]  PHASE 2  Logistics & steel
                   Automated Wiring ........................   x500
                   Modular Frame ...........................   x500
                   Smart Plating ...........................   x100
                   Versatile Framework .....................   x500

 [###--]  PHASE 3  Oil & computers
                   Versatile Framework .....................  x2500
                   Modular Engine ..........................   x500
                   Adaptive Control Unit ...................   x100

 [####-]  PHASE 4  Nuclear & endgame
                   Assembly Director System ................  x1000
                   Magnetic Field Generator ................   x500
                   Nuclear Pasta ...........................   x100
                   Thermal Propulsion Rocket ...............    x25

 [#####]  PHASE 5  Alien tech & quantum
                   Biochemical Sculptor ....................   x500
                   AI Expansion Server .....................   x100
                   Neural-Quantum Processor ................   x100
                   Ballistic Warp Drive ....................   x100

 Sunrise: not observed. Sunset: not observed. You were indoors.
 The Objectives tab is this page, except every part is a link to its recipe.
```

</details>

<details>
<summary>⚡ <b>Station sign-off</b>: what is behind the picture, credits, and a word from our sponsors (there are none)</summary>

```text
 CABLE 88, THE ALTERNATE CHANNEL                     broadcasting since 0.0.1

 THE TRANSMITTER
  app/app.py ............ the whole station: one Streamlit app
  ultra_satisfactory/ ... data.py loads data/data.json and works out rates
  streamlit-aggrid ...... the searchable grids
  GitHub Pages .......... a stlite build: Streamlit in your browser, via
                          WebAssembly, republished on every push to main
  modal_app.py .......... the same app as a full server, on Modal
  licence ............... Apache 2.0. Descrambler not required

 CREDITS (REAL)
  game data ............. greeny/SatisfactoryTools
  images ................ the Satisfactory Wiki (CC BY-NC-SA 4.0)
  the game .............. Satisfactory, by Coffee Stain Studios.
                          not ours, not included, sold separately
  this screen ........... drawn from scratch: the lettering is a home-made
                          pixel font, rasterised by the generator script

 STAFF (INVENTED)
  Sunny Underclock ...... chief belt meteorologist. has never been outside
  the Regional Office of Expected Output ... two desks and a spreadsheet

 VIEWER MAIL
  "Your forecast said steady. My belt is running backwards."
      It is running steadily backwards.
  "Is the manifold front or the load-balancer front going to win?"
      This station does not take sides. This station uses manifolds.
  "There is a pipe through my wall."
      We have no record of a pipe.

 WE NOW RETURN YOU TO YOUR FACTORY, ALREADY IN PROGRESS.
```

</details>
