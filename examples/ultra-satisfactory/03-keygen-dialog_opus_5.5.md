<p align="center">
  <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/"><img src="assets/03-keygen-dialog_opus_5.5.svg" width="100%" alt="ULTRA-SATISFACTORY recipe generator: an animated pixel-art parody of a mid-2000s keygen window, oddly shaped and dark, released by the made-up Dept. of Spaghetti Logistics, with a hexagon-and-cog emblem bolted over one corner. A neon cyan and chrome logo reads ULTRA SATISFACTORY above a ticker playing ultra_satisfactory.xm and a pumping spectrum analyser. It makes recipes, not keys: an item is typed in, GENERATE is clicked, and the RECIPE and MACHINE fields scramble and then settle on the real answer. First Modular Frame: 3 Reinforced Iron Plate + 12 Iron Rod, Assembler, 60 s, 15 MW, out 2/min; then Versatile Framework, Iron Plate and Rotor. A readout says PROTECTION: NONE, LICENCE: APACHE 2.0, and the EXIT button turns into NOPE when the mouse gets close. Below, conveyor belts link the three tabs: OBJECTIVES (Space Elevator, 5 phases), click a part, ITEMS (140 items, 211 recipes, 88 alternates), click the machine, BUILDINGS (477 buildings, 9 machines). The chin reads: makes recipes, not keys, unofficial fan tool."></a>
</p>

<h1 align="center">ULTRA-SATISFACTORY &middot; <code>recipegen.exe</code></h1>

<p align="center">
  <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/"><kbd>&nbsp;[ LIVE ]&nbsp;</kbd></a>&nbsp;
  <a href="#run-it-locally"><kbd>&nbsp;[ RUN ]&nbsp;</kbd></a>&nbsp;
  <a href="#whats-inside"><kbd>&nbsp;[ WHAT'S INSIDE ]&nbsp;</kbd></a>&nbsp;
  <a href="#how-its-built"><kbd>&nbsp;[ HOW IT'S BUILT ]&nbsp;</kbd></a>&nbsp;
  <a href="#data--credits"><kbd>&nbsp;[ CREDITS ]&nbsp;</kbd></a>
</p>

⚡ **ULTRA-SATISFACTORY** is a companion app for the factory-building game *Satisfactory*: **every recipe, building and Space Elevator objective, one click apart.** Park it on the second monitor, your phone, or the far side of an alt-tab, and look things up before the belt backs up. Yes, it is dressed as a keygen. It generates recipes, not keys: the app is free, open source and has nothing to unlock.

- ⚡ **Three tabs.** `OBJECTIVES`: pick a Space Elevator phase, see the parts it wants and how many. `ITEMS`: search as you type, get recipe cards with per-minute rates, the machine, its cycle time and its power draw. `BUILDINGS`: build costs, what each one makes, and Mk-by-Mk upgrade paths.
- ⚡ **Everything links.** Click a part to open its recipe, click the machine to open its building, lose forty minutes, call it planning.
- ⚡ **Zero install.** It runs live in your browser at [lukexyz.github.io/ULTRA-SATISFACTORY](https://lukexyz.github.io/ULTRA-SATISFACTORY/).
- ⚡ **Quick start.** `python -m pip install -r requirements.txt`, then `python -m streamlit run app/app.py`, then open `http://localhost:8501`. Python 3.10+, run from the repo root: see [Run it locally](#run-it-locally).
- ⚡ **Unofficial fan project**, not affiliated with Coffee Stain Studios. Protection: none. Licence: [Apache 2.0](LICENSE).

<details>
<summary>⚡ <b>[ ABOUT ]</b> read <code>ultra_satisfactory.nfo</code>: release info, install, the Space Elevator shopping list, greetz</summary>

```text
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║         ░▒▓█  DEPT. OF SPAGHETTI LOGISTICS   p r e s e n t s  █▓▒░         ║
║                                                                            ║
║                    U L T R A - S A T I S F A C T O R Y                     ║
║     recipe generator  ·  generates recipes  ·  that is the whole trick     ║
║                                                                            ║
╠══════════════════════════════[ RELEASE iNFO ]══════════════════════════════╣
║   RELEASE ....... ULTRA-SATISFACTORY, control terminal v1.0                ║
║   SUPPLIER ...... a pioneer at 3 a.m. who alt-tabbed "for a second"        ║
║   CRACKER ....... not needed. protection: none. licence: Apache 2.0        ║
║   TYPE .......... companion app. it generates recipes, never keys          ║
║   PAYLOAD ....... 140 items, 211 recipes (88 alternates), 477 buildings    ║
║   REQUIRES ...... a browser. Python 3.10+ to run it on your own machine    ║
║   THE GAME ...... not included, not ours, worth buying. unofficial fan     ║
║                   project, not affiliated with Coffee Stain Studios        ║
╠════════════════════════════════[ iNSTALL ]═════════════════════════════════╣
║   0. or skip all of this: https://lukexyz.github.io/ULTRA-SATISFACTORY/    ║
║   1. python -m pip install -r requirements.txt                             ║
║   2. python -m streamlit run app/app.py                                    ║
║   3. open http://localhost:8501 on the second monitor                      ║
║   4. alt-tab back. the belts did not stop while you were away              ║
╠══════════════════════[ SPACE ELEVATOR SHOPPiNG LiST ]══════════════════════╣
║   PHASE 1  Automation basics                                               ║
║              Smart Plating ............................. x50               ║
║              Versatile Framework ...................... x100               ║
║              Automated Wiring ......................... x500               ║
║   PHASE 2  Logistics & steel                                               ║
║              Automated Wiring ......................... x500               ║
║              Modular Frame ............................ x500               ║
║              Smart Plating ............................ x100               ║
║              Versatile Framework ...................... x500               ║
║   PHASE 3  Oil & computers                                                 ║
║              Versatile Framework ..................... x2500               ║
║              Modular Engine ........................... x500               ║
║              Adaptive Control Unit .................... x100               ║
║   PHASE 4  Nuclear & endgame                                               ║
║              Assembly Director System ................ x1000               ║
║              Magnetic Field Generator ................. x500               ║
║              Nuclear Pasta ............................ x100               ║
║              Thermal Propulsion Rocket ................. x25               ║
║   PHASE 5  Alien tech & quantum                                            ║
║              Biochemical Sculptor ..................... x500               ║
║              AI Expansion Server ...................... x100               ║
║              Neural-Quantum Processor ................. x100               ║
║              Ballistic Warp Drive ..................... x100               ║
║                                                                            ║
║   The OBJECTIVES tab does this per phase. Click a part, get its recipe.    ║
╠══════════════════════════════[ SUPPLiED BY ]═══════════════════════════════╣
║   GAME DATA ..... greeny/SatisfactoryTools                                 ║
║   iMAGES ........ the Satisfactory Wiki, CC BY-NC-SA 4.0                   ║
║   CODE .......... Apache 2.0. take it, fork it, overclock it               ║
╠═════════════════════════════════[ GREETZ ]═════════════════════════════════╣
║   everyone whose "temporary" belt is now load-bearing  ·  the manifold     ║
║   faithful  ·  the load-balancer purists (you are both right)  ·  anyone   ║
║   who opened a Hard Drive and got alternates they did not ask for  ·       ║
║   the AWESOME Sink, for eating our mistakes without judgement              ║
║                                                                            ║
║                    -=[ just one more belt, then bed ]=-                    ║
╚════════════════════════════════════════════════════════════════════════════╝
```

</details>
