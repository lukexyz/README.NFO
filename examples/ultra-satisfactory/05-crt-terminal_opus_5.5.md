<p align="center">
  <img src="assets/05-crt-terminal_opus_5.5.svg" width="100%" alt="ULTRA-SATISFACTORY on an amber phosphor CRT control terminal. A boot log types out: CONTROL TERMINAL V1.0, data.json: 140 items, 211 recipes (88 alternates), 477 buildings, space elevator: 5 phases. ACCESS GRANTED appears in block letters between hazard stripes. Then three queries: phase 2 lists the Space Elevator parts, item MODULAR FRAME opens its recipe card (3 Reinforced Iron Plate and 12 Iron Rod a minute in, 2 Modular Frame a minute out, Assembler, 60 s cycle, 15 MW) and starts two ASCII conveyor belts feeding an Assembler, and building ASSEMBLER opens the building card. A progress bar fills to 500 Modular Frames while the clock runs from 03:00 to 07:10.">
</p>

<p align="center">
  ⚡ <b>ULTRA-SATISFACTORY</b>: a companion app for <i>Satisfactory</i>. Every recipe, building and Space Elevator objective, one click apart.
</p>

<p align="center">
  ⚡
  <a href="#run-it-locally"><kbd>F1 run it</kbd></a>
  <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/"><kbd>F2 live in your browser</kbd></a>
  <a href="#whats-inside"><kbd>F3 what's inside</kbd></a>
  <a href="#how-its-built"><kbd>F4 how it's built</kbd></a>
  <kbd>F10 sleep</kbd> <i>(denied)</i>
</p>

```console
$ whoami
pioneer (groups: belts, spaghetti, denial). awake since 03:00.

$ cat README.1st
You are in the factory. You need a recipe. Do not open 40 wiki tabs.
Alt-tab here, type the item, read the card, click through to the machine.
Runs on a second monitor, a phone, or one alt-tab away from the belts.

  OBJECTIVES   pick a Space Elevator phase: the parts it wants, and how many
  ITEMS        search as you type: per-minute rates, machine, cycle, power
  BUILDINGS    every building: what it costs, what it makes, Mk upgrades

Unofficial fan project. Not affiliated with Coffee Stain Studios.

$ python -m pip install -r requirements.txt
$ python -m streamlit run app/app.py
  → http://localhost:8501   (Python 3.10+, run it from the repo root)

$ echo "$NO_INSTALL"
https://lukexyz.github.io/ULTRA-SATISFACTORY/   (the whole app, in a tab)
```

<details>
<summary>⚡ <b>CTRLTERM.NFO</b>: release info, protection: none, greetz</summary>

```text
╔══════════════════════════════════════════════════════════════════════════════╗
║ ░▒▓█  U L T R A - S A T I S F A C T O R Y  █▓▒░          CTRLTERM.NFO · 2026 ║
╠═════════════════════════════════[ release ]══════════════════════════════════╣
║                                                                              ║
║   release ......... ULTRA-SATISFACTORY, amber phosphor edition               ║
║   released by ..... the Spaghetti Logic night shift                          ║
║   supplied by ..... greeny/SatisfactoryTools (the game data)                 ║
║   images by ....... the Satisfactory Wiki (CC BY-NC-SA 4.0)                  ║
║   protection ...... none. the app is Apache 2.0: read it, fork it, ship it   ║
║   generates ....... recipes. only ever recipes                               ║
║   requires ........ Python 3.10+, or nothing but a browser tab               ║
║   the game ........ Satisfactory, by Coffee Stain Studios. sold separately   ║
║   affiliation ..... none. unofficial fan project. we just like belts         ║
║                                                                              ║
╠════════════════════════════════[ inventory ]═════════════════════════════════╣
║                                                                              ║
║   140 craftable items ........ searched on every keystroke                   ║
║   211 machine recipes ........ 88 of them alternates                         ║
║   477 buildings .............. 9 production machines, 333 structure pieces,  ║
║                                59 logistics, 26 decor, 15 power, 14 transit, ║
║                                7 special, 7 storage, 7 extraction            ║
║     5 Space Elevator phases .. parts and counts, one click from a recipe     ║
║                                                                              ║
╠══════════════════════════════[ space elevator ]══════════════════════════════╣
║                                                                              ║
║   1  Automation basics ..... Smart Plating x50, Versatile Framework x100,    ║
║                              Automated Wiring x500                           ║
║   2  Logistics & steel ..... Automated Wiring x500, Modular Frame x500,      ║
║                              Smart Plating x100, Versatile Framework x500    ║
║   3  Oil & computers ....... Versatile Framework x2500, Modular Engine x500, ║
║                              Adaptive Control Unit x100                      ║
║   4  Nuclear & endgame ..... Assembly Director System x1000,                 ║
║                              Magnetic Field Generator x500,                  ║
║                              Nuclear Pasta x100,                             ║
║                              Thermal Propulsion Rocket x25                   ║
║   5  Alien tech & quantum .. Biochemical Sculptor x500,                      ║
║                              AI Expansion Server x100,                       ║
║                              Neural-Quantum Processor x100,                  ║
║                              Ballistic Warp Drive x100                       ║
║                                                                              ║
╠══════════════════════════[ the clock is not lying ]══════════════════════════╣
║                                                                              ║
║   Phase 2 wants 500 Modular Frames. One Assembler makes 2 a minute.          ║
║   500 / 2 = 250 minutes = 4 h 10. Watch the clock in the title bar: it       ║
║   leaves 03:00 when the belts start and reads 07:10 when the bar is full.    ║
║   The belts are to scale too: 3, 12 and 2 items a minute.                    ║
║   Build a second Assembler. Then a third. This is how it starts.             ║
║                                                                              ║
║   Small print: the factory on screen is staged. The app looks things up;     ║
║   it does not count your frames or pull the lever. The arithmetic is real.   ║
║                                                                              ║
╠══════════════════════════════════[ greetz ]══════════════════════════════════╣
║                                                                              ║
║   the Mk.1 Belt Preservation Society · Manifold Truthers Local 477 ·         ║
║   Load Balancers Anonymous · the Floating Foundation Guild ·                 ║
║   everyone who said "I'll tidy the spaghetti later" and never did ·          ║
║   whoever is still hand-feeding a Biomass Burner at 03:00. we see you.       ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

</details>

<details>
<summary>⚡ <b>floorplan.txt</b>: how the factory is wired</summary>

```text
  data/data.json ═══> ultra_satisfactory/data.py ═══> app/app.py
  the game data       loads it, works out the         one Streamlit app,
                      per-minute rates                three tabs
                                                          ║
        ╔══════════════════════════╦══════════════════════╩═══════╗
        ║                          ║                              ║
    OBJECTIVES ═ click a part ═> ITEMS ═ click the machine ═> BUILDINGS
    5 phases,                    140 items,                   477 buildings,
    parts + counts               211 recipes                  cost + products

  ships three ways
    your machine ....... python -m streamlit run app/app.py   (port 8501)
    your browser ....... stlite build on GitHub Pages: no install, no server
    somebody's cloud ... modal_app.py: a full Streamlit server on Modal
```

</details>
