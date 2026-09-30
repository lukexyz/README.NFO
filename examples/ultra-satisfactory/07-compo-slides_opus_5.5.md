<p align="center">
  <img src="assets/07-compo-slides_opus_5.5.svg" width="100%" alt="ULTRA-SATISFACTORY on the big screen at BOTTLENECK 2026, an invented demoparty, seen over the heads of the crowd in a dark hall. The beamer shows an entry slide: companion app compo, entry 01, ULTRA in neon cyan and SATISFACTORY in white next to a hexagon emblem with a turning cog, by lukexyz, with the comment: every recipe, building and Space Elevator objective, one click apart. A corner timer counts down to the next competition. Then the slides rotate: a huge timer counts 00:03, 00:02, 00:01, NOW for the tab compo; entry 01 OBJECTIVES, 5 Space Elevator phases; entry 02 ITEMS, 140 craftable items, with 211 machine recipes in the data; entry 03 BUILDINGS, 477 buildings; then an end-of-compo slide: voting is closed, it never opened, the belt decides. Last comes the prize-giving, revealed from last place up with score bars: 3rd OBJECTIVES 5 points, 2nd ITEMS 140 points, 1st BUILDINGS 477 points. Confetti falls and the crowd throws its arms in the air.">
</p>

<h3 align="center">⚡ ULTRA-SATISFACTORY: now showing on the big screen</h3>

<p align="center">
  ⚡ A companion app for the factory-building game <i>Satisfactory</i>: every recipe, building and Space Elevator objective, one click apart.<br>
  ⚡ Keep it on the second monitor, the phone, or one alt-tab away, for when it is 3&nbsp;a.m. and you need to know what goes into a Modular Frame. It is 3 Reinforced Iron Plates and 12 Iron Rods. You're welcome.<br>
  ⚡ <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/"><b>Watch the entry live in your browser</b></a>, nothing to install · <a href="#run-it-locally">run it locally</a> · <a href="#whats-inside">what's inside</a> · <a href="#how-its-built">how it's built</a> · <a href="#data--credits">credits</a>
</p>

⚡ **The tab compo: three entries, one app.** Everything links: click an ingredient or product to open its recipe, click the machine to open its building.

- ⚡ <kbd>01</kbd> **OBJECTIVES** by Elevator Pitch. Pick a Space Elevator phase, see the parts it needs and how many, click a part for its recipe.
- ⚡ <kbd>02</kbd> **ITEMS** by Ctrl+F Collective. Search as you type. Recipe cards show the ingredients with per-minute rates, the machine with its cycle time and power draw, and the products.
- ⚡ <kbd>03</kbd> **BUILDINGS** by Foundation Issues. Every building and what it makes, grouped by tier, plus Mk-by-Mk upgrade paths for miners, conveyors, pipelines and storage.

⚡ **Organisers: to run the entry on the compo machine** you need Python 3.10+ and two commands, typed from the repo root.

```sh
python -m pip install -r requirements.txt
python -m streamlit run app/app.py
```

⚡ Streamlit serves it at `http://localhost:8501`; the long version is under [Run it locally](#run-it-locally). No compo machine? The [browser build](https://lukexyz.github.io/ULTRA-SATISFACTORY/) is the whole app in a tab.

⚡ **Prizegiving, items-per-minute compo.** Last place first, as tradition demands. Nobody voted. The belt decided.

```text
 BOTTLENECK 2026 / ITEMS-PER-MINUTE COMPO / PRIZEGIVING        last place first

  #  TITLE                 BY           PTS  SHARE OF THE TOP SCORE
 10. Modular Engine        Manufacturer   1  █
  9. Modular Frame         Assembler      2  █▌
  8. Rotor                 Assembler      4  ███▌
  7. Reinforced Iron Plate Assembler      5  ████▌
  5. Caterium Ingot        Smelter       15  █████████████
  5. Iron Rod              Constructor   15  █████████████
  4. Iron Plate            Constructor   20  █████████████████
  2. Wire                  Constructor   30  █████████████████████████▌
  2. Iron Ingot            Smelter       30  █████████████████████████▌
  1. Screw                 Constructor   40  ██████████████████████████████████

 PTS = items per minute out of one machine on the standard recipe.
 Ten of the app's 211 recipes. The other 201 were too busy working to enter.
```

<p align="center">
  <sub>⚡ BOTTLENECK 2026 is an invented demoparty and its crews are made up. The numbers are real: they are what the app shows.<br>
  ⚡ Unofficial fan project, not affiliated with Coffee Stain Studios. The game is sold separately. The lookups are free.</sub>
</p>

<details>
<summary>⚡ <b>Timetable</b>: the Space Elevator stage, phase by phase, with what it wants and how many</summary>

```text
 BOTTLENECK 2026 / TIMETABLE / SPACE ELEVATOR STAGE         doors: never closed

 SLOT     COMPO                  WHAT THE ELEVATOR WANTS              HOW MANY
 PHASE 1  Automation basics      Smart Plating ......................      x50
                                 Versatile Framework ................     x100
                                 Automated Wiring ...................     x500
 PHASE 2  Logistics & steel      Automated Wiring ...................     x500
                                 Modular Frame ......................     x500
                                 Smart Plating ......................     x100
                                 Versatile Framework ................     x500
 PHASE 3  Oil & computers        Versatile Framework ................    x2500
                                 Modular Engine .....................     x500
                                 Adaptive Control Unit ..............     x100
 PHASE 4  Nuclear & endgame      Assembly Director System ...........    x1000
                                 Magnetic Field Generator ...........     x500
                                 Nuclear Pasta ......................     x100
                                 Thermal Propulsion Rocket ..........      x25
 PHASE 5  Alien tech & quantum   Biochemical Sculptor ...............     x500
                                 AI Expansion Server ................     x100
                                 Neural-Quantum Processor ...........     x100
                                 Ballistic Warp Drive ...............     x100
 AFTER    Sleep                  cancelled. PHASE 1 of the next save is on

 The OBJECTIVES tab is this timetable, except every part is a link to its
 recipe and nobody makes you sit on a folding chair.
```

</details>

<details>
<summary>⚡ <b>Entry form</b>: slide text, notes for the organisers, credits, greetings, house rules</summary>

```text
=== BOTTLENECK 2026 / ENTRY FORM ==============================================
 title ......... ULTRA-SATISFACTORY
 author ........ lukexyz
 compo ......... companion app (new this year. one entry. it is this one)
 platform ...... Python 3.10+ with Streamlit, or any browser tab
 contents ...... 140 craftable items
                 211 machine recipes, 88 of them alternates
                 477 buildings, 9 of them production machines
                 5 Space Elevator phases
 licence ....... Apache 2.0 for the code
 protection .... none. it is open source. there is nothing to unlock

=== SLIDE TEXT (this goes on the big screen) ==================================
 Every recipe, building and Space Elevator objective, one click apart.

=== NOTES FOR THE ORGANISERS (this does not) ==================================
 - It is a lookup tool. It will not build the factory for you. We asked.
 - No compo machine needed: the browser build is Streamlit running on
   WebAssembly (stlite), republished by GitHub Actions on every push to main.
 - It also deploys as a full Streamlit server on Modal (modal_app.py).
 - The 88 alternates are in the data. Item cards show the standard recipe.
 - One Streamlit app, app/app.py, with streamlit-aggrid for the searchable
   grids. The game data is loaded by ultra_satisfactory/data.py.
 - Unofficial fan project, not affiliated with Coffee Stain Studios.
   Satisfactory is their game and it is sold separately.

=== CREDITS ===================================================================
 game data ..... greeny/SatisfactoryTools
 images ........ the Satisfactory Wiki (CC BY-NC-SA 4.0)
 slides ........ drawn from scratch. the font, the crowd and the confetti too

=== GREETINGS =================================================================
 Elevator Pitch · Ctrl+F Collective · Foundation Issues · Headlift Anonymous ·
 the Hypertube Cannon Appreciation Society · Team Blueprint Regret ·
 everyone whose "temporary" test line is now load-bearing ·
 and whoever is still in the hall at 3 a.m. saying "results, then bed"

=== HOUSE RULES ===============================================================
 1. No sleeping in the main hall. Nobody was going to.
 2. Entries run from the repo root.
 3. The belt is always right.
```

</details>
