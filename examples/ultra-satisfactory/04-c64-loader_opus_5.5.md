<p align="center">
  <img src="assets/04-c64-loader_opus_5.5.svg" width="800" alt="ULTRA-SATISFACTORY on a Commodore 64: it boots to READY., types LOAD&quot;ULTRA-SATISFACTORY&quot;,8,1, lists 140 items, 211 recipes, 477 buildings and 5 phases coming off the disk while turbo stripes roll in the border, and types RUN. Then a demoscene intro screen: the colour-cycling ULTRA SATISFACTORY logo between two hexagon emblems with turning cogs, the line EVERY RECIPE AND BUILDING, ONE CLICK APART, and a pointer clicking through the three tabs: OBJECTIVES (Space Elevator phase 2 wants Modular Frame x500), ITEMS (the Modular Frame recipe) and BUILDINGS (the Assembler). Below, a conveyor feeds plates and rods into a stamping assembler and Modular Frames roll out; a SID panel plays Just One More Belt by DJ Splitter and MC Merger over a sine scroller.">
</p>

<h1 align="center">ULTRA-SATISFACTORY</h1>

<p align="center">
  ⚡ <b>A companion app for the factory-building game <i>Satisfactory</i>: every recipe, building and Space Elevator objective, one click apart.</b><br>
  ⚡ Park it on the second monitor, prop it up on your phone, or alt-tab out at 3 a.m. because you have forgotten what goes in a Modular Frame. Again.<br>
  ⚡ <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/"><b>Run it in your browser, nothing to install</b></a> · <a href="#run-it-locally">run it locally</a> · <a href="#whats-inside">what's inside</a>
</p>

<p align="center">
  ⚡ Three tabs: <kbd>OBJECTIVES</kbd> what each Space Elevator phase wants
  → <kbd>ITEMS</kbd> how to make it
  → <kbd>BUILDINGS</kbd> what makes it
</p>

```text
10 REM *** ULTRA-SATISFACTORY QUICK START ***  PROTECTION: NONE (APACHE 2.0)
20 REM PYTHON 3.10+, FROM THE REPO ROOT:
30 SYS "python -m pip install -r requirements.txt"
40 SYS "python -m streamlit run app/app.py"
50 OPEN "http://localhost:8501" : REM PARK IT ON THE SECOND MONITOR
60 PRINT "JUST ONE MORE BELT. "; : GOTO 60
RUN
JUST ONE MORE BELT. JUST ONE MORE BELT. JUST ONE MORE BELT. JUST ONE MORE BELT.
?OUT OF SLEEP  ERROR IN 60
READY.
```

<p align="center">
  <sub>⚡ Unofficial fan project, not affiliated with Coffee Stain Studios. Factory sold separately.</sub>
</p>

<details>
<summary>⚡ <b>ULTRASAT.NFO</b>: release notes, the click path, the Space Elevator's shopping list, greetz (protection: none)</summary>

```text
       ████    ████  ████          ████████████  ██████████        ████
       ████░░  ████░░████░░          ░░████░░░░░░████░░░░████    ████████
      ████░░░ ████░░████░░░           ████░░░   ████░░░ ████░░████ ░░░████░
      ████░░  ████░░████░░            ████░░    ██████████░░░░████████████░░
     ████░░░ ████░░████░░░           ████░░░   ████████░░░░░ ████░░░░████░░░
     ████░░  ████░░████░░            ████░░    ████░░████    ████░░  ████░░
      ████████ ░░░████████████      ████░░░   ████░░░ ████░ ████░░░ ████░░░
        ░░░░░░░░    ░░░░░░░░░░░░      ░░░░      ░░░░    ░░░░  ░░░░    ░░░░

        S  A  T  I  S  F  A  C  T  O  R  Y             control terminal v1.0

═════════════════════════════════════════════════════════════════════════════
  MANIFOLD DESTINY PRESENTS ............................ ULTRA-SATISFACTORY
═════════════════════════════════════════════════════════════════════════════

  RELEASE TYPE .. companion app / second-monitor furniture / 3 a.m. enabler
  GOES WITH ..... Satisfactory, the factory-building game (sold separately:
                  this is a lookup tool, the game is not in the box)
  CONTENTS ...... 140 items, 211 recipes (88 of them alternates),
                  477 buildings, 5 Space Elevator phases, 0 excuses
  PROTECTION .... none. it's Apache 2.0. go on, read the source
  PACKED WITH ... Python, one Streamlit app (app/app.py), streamlit-aggrid
  LOADER ........ python -m streamlit run app/app.py
  ALSO RUNS ..... in a browser tab (stlite: Streamlit on WebAssembly,
                  republished on every push to main) and as a server on Modal
  SUPPLIED BY ... greeny/SatisfactoryTools (game data)
                  Satisfactory Wiki (images, CC BY-NC-SA 4.0)
  FILENAME ...... 18 characters. a real 1541 takes 16. we asked nicely

─── ONE CLICK APART ─────────────────────────────────────────────────────────

   OBJECTIVES             ITEMS                         BUILDINGS
  ┌─────────────────┐    ┌─────────────────────────┐    ┌─────────────────┐
  │ PHASE 2 wants   │    │ 3 Reinforced Iron Plate │    │ ASSEMBLER       │
  │ Modular Frame   │═══>│ 12 Iron Rod             │    │ production, T2  │
  │ x500            │    │ Assembler, 60 s, 15 MW  │═══>│ 15 MW           │
  │                 │    │ = 2 Modular Frame       │    │ makes 39 items  │
  └─────────────────┘    └─────────────────────────┘    └─────────────────┘
    click the part         click the machine             click any of them

─── THE SPACE ELEVATOR WOULD LIKE ───────────────────────────────────────────

  1  AUTOMATION BASICS ...... Smart Plating x50, Versatile Framework x100,
                              Automated Wiring x500
  2  LOGISTICS & STEEL ...... Automated Wiring x500, Modular Frame x500,
                              Smart Plating x100, Versatile Framework x500
  3  OIL & COMPUTERS ........ Versatile Framework x2500, Modular Engine x500,
                              Adaptive Control Unit x100
  4  NUCLEAR & ENDGAME ...... Assembly Director System x1000,
                              Magnetic Field Generator x500,
                              Nuclear Pasta x100,
                              Thermal Propulsion Rocket x25
  5  ALIEN TECH & QUANTUM ... Biochemical Sculptor x500,
                              AI Expansion Server x100,
                              Neural-Quantum Processor x100,
                              Ballistic Warp Drive x100

     it does not say please. it has never said please.

─── GREETZ ──────────────────────────────────────────────────────────────────

  DJ Splitter & MC Merger * the night shift at Belt Fiction * Overclock
  Holmes * the Load Balancer Lads * everyone whose "temporary" starter base
  is now load-bearing * the pioneer who built a railway to avoid a 200 m
  walk * whoever said "I'll tidy the spaghetti later" (you won't) * lizard
  doggos everywhere

  NO RESPECT TO: belts that clip through walls. we see you.

─── unofficial fan project, not affiliated with Coffee Stain Studios ────────
───────────────────────────────── every crew and DJ name above is made up ───
```

</details>
