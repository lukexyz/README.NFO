<p align="center">
  <img src="assets/10-arcade-attract_opus_5.5.svg" width="830" alt="ULTRA-SATISFACTORY as an arcade cabinet in attract mode. A lit marquee reads ULTRA SATISFACTORY: Throughput Amusement Co. presents a companion app for Satisfactory, unofficial fan project. The portrait monitor has a score header (ITEMS 000140, RECIPES 000211, BUILDINGS 000477) and hard-cuts between three screens: a title card with the pitch (every recipe, building and objective, one click apart) and an output-per-minute legend (Screw 40, Iron Ingot 30, Iron Plate 20, Iron Rod 15, Rotor 4, plus 88 alternates); a demo shift where one Smelter, two Constructors and three more Constructors turn 30 Iron Ore a minute into 120 Screws a minute on belts drawn to scale, while a small pioneer paces the aisle and a counter ticks up two screws a second, in real time; and a high-score table ranking the five Space Elevator phases by parts wanted: 3100, 1625, 1600, 800 and 650. INSERT NOTHING blinks above FREE PLAY: IT'S APACHE 2.0. Bezel cards explain the three tabs (Objectives, Items, Buildings) and the operator settings; the control panel has a joystick, three tab-coloured buttons, a coin slot taped over with the word FREE, and the two commands that start the app.">
</p>

<p align="center">
  ⚡ <b>ULTRA-SATISFACTORY</b>: a companion app for the factory-building game <i>Satisfactory</i>. Every recipe, building and Space Elevator objective, one click apart.<br>
  <sub>⚡ The cabinet is in attract mode because you left to fix one belt, four hours ago. An unofficial fan project, not affiliated with Coffee Stain Studios.</sub>
</p>

<p align="center">
  ⚡
  <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/"><kbd>1P START: play it in your browser</kbd></a>
  <a href="#run-it-locally"><kbd>2P START: run it locally</kbd></a>
  <a href="#whats-inside"><kbd>HOW TO PLAY</kbd></a>
  <a href="#how-its-built"><kbd>OPERATOR'S MANUAL</kbd></a>
  <kbd>COIN</kbd> <i>(rejected: free play)</i>
</p>

⚡ Three buttons, three tabs: **Objectives** (what each Space Elevator phase wants, and how many), **Items** (search as you type; recipes with per-minute rates) and **Buildings** (every building and what it makes). Everything links: a part is one click from its recipe, a machine one click from its building. Park it on a second monitor, a phone, or the far side of an alt-tab.

⚡ Keep your coin: the code is [Apache 2.0](LICENSE). Two commands (Python 3.10+, from the repo root), or none at all: it runs [live in your browser](https://lukexyz.github.io/ULTRA-SATISFACTORY/).

```sh
python -m pip install -r requirements.txt
python -m streamlit run app/app.py     # then open http://localhost:8501
```

<details>
<summary>⚡ <b>HIGH SCORES</b>: the whole score table, for monitors that only do one colour</summary>

```text
        ITEMS            RECIPES           BUILDINGS
       000140             000211              000477

                 - SPACE ELEVATOR ORDERS -
                  parts wanted, per phase

     RANK   SCORE    NAME   PHASE
     1ST    003100   BLT    3  OIL & COMPUTERS
                            Versatile Framework ....... x2500
                            Modular Engine ............  x500
                            Adaptive Control Unit .....  x100

     2ND    001625   SPG    4  NUCLEAR & ENDGAME
                            Assembly Director System .. x1000
                            Magnetic Field Generator ..  x500
                            Nuclear Pasta .............  x100
                            Thermal Propulsion Rocket .   x25

     3RD    001600   3AM    2  LOGISTICS & STEEL
                            Automated Wiring ..........  x500
                            Modular Frame .............  x500
                            Versatile Framework .......  x500
                            Smart Plating .............  x100

     4TH    000800   ALT    5  ALIEN TECH & QUANTUM
                            Biochemical Sculptor ......  x500
                            AI Expansion Server .......  x100
                            Neural-Quantum Processor ..  x100
                            Ballistic Warp Drive ......  x100

     5TH    000650   TAB    1  AUTOMATION BASICS
                            Automated Wiring ..........  x500
                            Versatile Framework .......  x100
                            Smart Plating .............   x50

                  THE ELEVATOR ALWAYS WINS

             INSERT NOTHING        CREDIT 00
              FREE PLAY: IT'S APACHE 2.0
```

⚡ The scores are real: each one is a phase's part counts added up, exactly as the Objectives tab lists them. The initials are not real. Nobody called BLT has ever finished Phase 3. Your factory is not on the board, and it knows why.

</details>

<details>
<summary>⚡ <b>DEMO SHIFT</b>: what the little factory on the screen is doing, with the maths</summary>

```text
   - OUTPUT PER MINUTE -      standard recipes, as the Items tab shows them

   SCREW ........ 40/MIN   Constructor, 6 s, 4 MW   1 Iron Rod -> 4 Screw
   IRON INGOT ... 30/MIN   Smelter, 2 s, 4 MW       1 Iron Ore -> 1 Iron Ingot
   IRON PLATE ... 20/MIN   Constructor, 6 s, 4 MW   3 Iron Ingot -> 2 Iron Plate
   IRON ROD ..... 15/MIN   Constructor, 4 s, 4 MW   1 Iron Ingot -> 1 Iron Rod
   ROTOR ........  4/MIN   Assembler, 15 s, 15 MW   5 Iron Rod + 25 Screw -> 1
   ? ............ ??/MIN   88 alternate recipes are in the data as well

   THE DEMO LINE
                                  30/min                30/min
   Iron Ore ═══> [ SMELTER x1 ] ═══════> [ CONSTRUCTOR x2 ] ═══════╗
                                Iron Ingot              Iron Rod   ║
                                                                   ║
   [ CRATE ] <═══════════════════════════ [ CONSTRUCTOR x3 ] <═════╝
                       Screw, 120/min

   6 machines, 24 MW, 30 Iron Ore a minute in, 120 Screws a minute out.
   Every belt on the screen moves at one speed, so the gap between items
   is the rate: an ingot every 2 s, a rod every 2 s, two screws a second.
   The counter is in real time too. It reaches 13 before the cut.
```

⚡ Small print: the demo is staged. The app looks recipes up; it does not run your factory, count your screws or judge your spaghetti. The arithmetic is real.

</details>

<details>
<summary>⚡ <b>SERVICE MENU</b>: operator settings, what's in the cabinet, credits, greetz</summary>

```text
  THROUGHPUT AMUSEMENT CO.            SERVICE MENU            CABINET REV 0.0.1
  ─────────────────────────────────────────────────────────────────────────────
  DIP SWITCHES
   COINAGE ........... free play. the code is Apache 2.0: read it, fork it
   PLAYERS ........... 1, and a spare monitor, a phone, or alt-tab
   DIFFICULTY ........ spaghetti
   SLEEP ............. disabled
   CONTINUE? ......... always
   ATTRACT SOUND ..... none. that hum is your factory

  IN THE CABINET
   140 craftable items ....... searched on every keystroke
   211 machine recipes ....... 88 of them alternates
   477 buildings ............. 9 production machines, 333 structure pieces,
                               59 logistics, 26 decor, 15 power, 14 transit,
                               7 special, 7 storage, 7 extraction
     5 Space Elevator phases . parts and counts, one click from a recipe

  BOARD SET
   app/app.py ................ the whole game board: one Streamlit app
   ultra_satisfactory/ ....... data.py loads data/data.json, works out rates
   streamlit-aggrid .......... the searchable grids
   GitHub Pages .............. a stlite build: Streamlit in your browser
   modal_app.py .............. the same app as a full server, on Modal

  CREDITS (REAL)
   game data ................. greeny/SatisfactoryTools
   item and building images .. the Satisfactory Wiki (CC BY-NC-SA 4.0)
   the game .................. Satisfactory, by Coffee Stain Studios.
                               not included, not ours, sold separately
   affiliation ............... none. unofficial fan project

  GREETZ (INVENTED, LIKE THE INITIALS)
   the Overflow Valve Appreciation Club · Night Shift at Pipe 4 ·
   the Society for Perfectly Straight Belts (membership: 0) ·
   everyone who typed "screw" into a search box at 3 a.m. ·
   BLT, SPG, 3AM, ALT and TAB, still on the board, still not asleep

  NO GREETZ
   the screw. it knows what it did

  Throughput Amusement Co. does not exist. Please do not send it coins.
  ─────────────────────────────────────────────────────────────────────────────
```

</details>
