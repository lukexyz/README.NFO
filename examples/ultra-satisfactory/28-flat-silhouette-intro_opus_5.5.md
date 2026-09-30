<p align="center">
  <img src="assets/28-flat-silhouette-intro_opus_5.5.svg" width="100%" alt="ULTRA-SATISFACTORY as an early-90s flat-colour Amiga intro. ULTRA and SATISFACTORY in heavy black capitals ride two waves across three flat bands, hot pink, mustard and green, whose edges are cut into stepped factory skylines that slide slowly sideways. On the right a Space Elevator stands in black silhouette in front of a sun of slowly expanding orange and violet rings, with a pod climbing its tether. A scroller of black capitals flows along a curve like parts on a belt: Stencil Shift presents ULTRA-SATISFACTORY, every recipe, building and Space Elevator objective, one click apart. 140 items, 211 recipes, 477 buildings, 0 gradients. Along the black ground stand a constructor feeding parts down a belt, storage boxes and a tiny supervisor with a clipboard. A two-tone tag in the top corner reads stencil shift, proudly presents. The small print lists the tabs, objectives, items and buildings, and the address lukexyz.github.io/ULTRA-SATISFACTORY">
</p>

<h3 align="center">⚡ ULTRA-SATISFACTORY: every recipe, building and Space Elevator objective, one click apart.</h3>

<p align="center">
  ⚡ A companion app for the factory-building game <i>Satisfactory</i>. Park it on the second monitor, the phone, or one alt-tab away, and look the thing up before the fuse blows.<br>
  ⚡ Three tabs, everything cross-linked: <b>OBJECTIVES</b> (what each Space Elevator phase wants, and how many), <b>ITEMS</b> (search as you type, recipe cards with per-minute rates) and <b>BUILDINGS</b> (what each one makes, plus Mk-by-Mk upgrade paths).<br>
  ⚡ <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/"><b>Run it live in your browser</b></a>, nothing to install · <a href="#run-it-locally">run it locally</a> · <a href="#whats-inside">what's inside</a> · <a href="#how-its-built">how it's built</a> · <a href="#data--credits">credits</a>
</p>

```sh
python -m pip install -r requirements.txt
python -m streamlit run app/app.py
```

<p align="center">
  ⚡ Python 3.10+, from the repo root, then open <b>http://localhost:8501</b>. It is a single Streamlit app, <a href="app/app.py"><code>app/app.py</code></a>, and the code is <a href="LICENSE">Apache 2.0</a>.<br>
  ⚡ <b>Notice from the Department of Visual Efficiency:</b> chrome, starfields, copper bars and gradients were audited and found not to be load-bearing. They have been removed. Output is unaffected.
</p>

<p align="center">
  <img src="assets/28-flat-silhouette-intro_opus_5.5-cubes.svg" width="100%" alt="Screen two of the intro: a grid of 140 turning cubes, one for each craftable item in the app, coloured across the rainbow row by row, with ULTRA in tall cyan outlined capitals running up the left edge. Small white text over the grid reads: 140 craftable items, one cube each. 211 machine recipes, 88 of them alternates. 477 buildings, 9 of them production machines. 5 space elevator phases, 0 gradients.">
</p>

<p align="center"><sub>⚡ Screen two: 140 cubes, one per craftable item. Count them if you like. The factory can run itself for a minute. It cannot, but count them anyway.</sub></p>

<details>
<summary>⚡ <b>SCROLLER.TXT</b>: the belt of words in plain text, the colour budget, greetings and credits</summary>

<!-- SCROLLER.TXT:BEGIN (generated: node src/28-flat-silhouette-intro_opus_5.5.mjs) -->

```text
 stencil shift proudly presents ........................ ULTRA-SATISFACTORY

 THE SCROLLER, FOR ANYONE WHO READS FASTER THAN 120 PIXELS A SECOND
 --------------------------------------------------------------------------
  * STENCIL SHIFT PRESENTS
  * ULTRA-SATISFACTORY
  * EVERY RECIPE, BUILDING AND SPACE ELEVATOR OBJECTIVE, ONE CLICK APART
  * 140 ITEMS. 211 RECIPES. 477 BUILDINGS. 0 GRADIENTS
  * NO CHROME. NO STARFIELD. NO COPPER BARS, ONLY COPPER INGOTS: 30 A MINUTE
    PER SMELTER
  * THIS IS NOT A SCROLLER, IT IS A CONVEYOR BELT FOR WORDS
  * MANIFOLD PEOPLE AND LOAD BALANCER PEOPLE MAY SHARE THIS TAB IN PEACE
  * PROTECTION: NONE. IT'S APACHE 2.0
  * UNOFFICIAL FAN PROJECT, NOT AFFILIATED WITH COFFEE STAIN STUDIOS

 THE COLOUR BUDGET, SCREEN ONE
 --------------------------------------------------------------------------
  Hot pink.........................................................the sky
  Mustard..................................................the far factory
  Leaf green..............................................the near factory
  Violet and orange...........................................the ring sun
  Black....................the letters, the Space Elevator, the supervisor
  White...........................half of one tag, one line of small print
  Purple, pink, blue.................three tab names, on loan from the app
  Grey.................................two slashes. nobody signed for them
  Gradients.......................................none. requisition denied

 GREETINGS TO
 --------------------------------------------------------------------------
  The Overprint Club............the pipe goes through the wall. what pipe?
  The Third Input................one ingredient short. always the same one
  Fuse & Excuse......................it tripped the second you walked away
  Wrong Way Mk.2....................the belt is fine. the arrows are wrong
  The Rounding Error......it balanced in the spreadsheet. not on the floor
  Probably Screws Ltd.............the box has no label. it never needs one
  The Set Square Set............every belt at ninety degrees. owns a ruler
  The Freehand Mob................it works. do not ask which belt is which

 CREDITS
 --------------------------------------------------------------------------
  Code.............................................................lukexyz
  Game data.......................................greeny/SatisfactoryTools
  Item & building images...............Satisfactory Wiki (CC BY-NC-SA 4.0)
  Graphics & design.......................Stencil Shift (an invented crew)
  Music..........................................none. hum something brisk
  Protection.........................................none. it's Apache 2.0
  Affiliation.................................none. unofficial fan project
```

<!-- SCROLLER.TXT:END -->

</details>

<details>
<summary>⚡ <b>ELEVATOR.TXT</b>: what the tower in the picture wants, phase by phase, and how many</summary>

<!-- ELEVATOR.TXT:BEGIN (generated: node src/28-flat-silhouette-intro_opus_5.5.mjs) -->

```text
 the space elevator requests ................................ the following

 PHASE 1: AUTOMATION BASICS
 --------------------------------------------------------------------------
  Smart Plating........................................................x50
  Versatile Framework.................................................x100
  Automated Wiring....................................................x500

 PHASE 2: LOGISTICS & STEEL
 --------------------------------------------------------------------------
  Automated Wiring....................................................x500
  Modular Frame.......................................................x500
  Smart Plating.......................................................x100
  Versatile Framework.................................................x500

 PHASE 3: OIL & COMPUTERS
 --------------------------------------------------------------------------
  Versatile Framework................................................x2500
  Modular Engine......................................................x500
  Adaptive Control Unit...............................................x100

 PHASE 4: NUCLEAR & ENDGAME
 --------------------------------------------------------------------------
  Assembly Director System...........................................x1000
  Magnetic Field Generator............................................x500
  Nuclear Pasta.......................................................x100
  Thermal Propulsion Rocket............................................x25

 PHASE 5: ALIEN TECH & QUANTUM
 --------------------------------------------------------------------------
  Biochemical Sculptor................................................x500
  AI Expansion Server.................................................x100
  Neural-Quantum Processor............................................x100
  Ballistic Warp Drive................................................x100

 Pick a phase in OBJECTIVES, click a part, get its recipe. The tower does
 not say thank you. The tower says PHASE 2.
```

<!-- ELEVATOR.TXT:END -->

</details>

<details>
<summary>⚡ <b>CREDITS.IFF</b>: screen three, the end credits on regulation grey-blue</summary>

<p align="center">
  <img src="assets/28-flat-silhouette-intro_opus_5.5-credits.svg" width="100%" alt="The credits screen: small bright green type with dotted leaders between two thin rules on a grey-blue field. Code: lukexyz. Game data: greeny/SatisfactoryTools. Item and building images: Satisfactory Wiki (CC BY-NC-SA 4.0). Graphics and design: Stencil Shift, an invented crew. Music: none, hum something brisk. Protection: none, it's Apache 2.0. Affiliation: none, unofficial fan project.">
</p>

</details>

<p align="center"><sub>⚡ Unofficial fan project, not affiliated with Coffee Stain Studios. Stencil Shift and everyone in the greetings are invented. The numbers are real: they are counted from the app's own data.</sub></p>
