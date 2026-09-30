<p align="center">
  <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/"><img src="assets/25-desktop-95_opus_5.5.svg" width="830" alt="ULTRA-SATISFACTORY as a mid-1990s desktop: teal background, grey bevelled windows, a taskbar along the bottom. The main window, titled ULTRA-SATISFACTORY - Defragmenting Factory (F:), has a banner with a gold hexagon-and-cog emblem, ULTRA in cyan, SATISFACTORY in white, and the line: Every recipe, building and Space Elevator objective, one click apart. Below it a defragmenter map of 828 blocks is sorted from confetti into tidy colour bands, while a status line reports things like Moving Iron Plate: 20/min, Constructor, 4 MW and Pipe clips through a wall. Pretending not to see. At 100% complete an error dialog arrives: Somebody built one temporary belt. Factory contents changed. Restarting at 0%. The pointer clicks OK and the map falls apart again. A Legend window counts the blocks: Items 140, Structure pieces 333, Logistics 59, Production machines 9, Other buildings 76, Standard recipes 123, Alternate recipes 88. An editor window, RUNME.BAT, holds the live link and the two run commands and says it is an unofficial fan app. On the taskbar: a Build button and the three tabs, Objectives, Items and Buildings."></a>
</p>

<h1 align="center">ULTRA-SATISFACTORY</h1>

<p align="center">
  <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/"><kbd>&nbsp;Open it live&nbsp;</kbd></a>&nbsp;
  <a href="#run-it-locally"><kbd>&nbsp;Run...&nbsp;</kbd></a>&nbsp;
  <a href="#whats-inside"><kbd>&nbsp;What's inside&nbsp;</kbd></a>&nbsp;
  <a href="#how-its-built"><kbd>&nbsp;How it's built&nbsp;</kbd></a>&nbsp;
  <a href="#data--credits"><kbd>&nbsp;Credits&nbsp;</kbd></a>&nbsp;
  <a href="#license"><kbd>&nbsp;License&nbsp;</kbd></a>
</p>

⚡ **ULTRA-SATISFACTORY** is a companion app for the factory-building game *Satisfactory*: **every recipe, building and Space Elevator objective, one click apart.** Park it on the second monitor, your phone, or the far side of an alt-tab, and look things up while the Constructors wait politely for you to come back.

⚡ The desktop above is defragmenting the lot. Each of its 828 blocks is something the app knows: 140 items, 211 recipes (88 of them alternates) and 477 buildings. It sorts them by real swaps (no block is invented or lost on the way), reaches 100%, somebody builds one "temporary" belt, and it starts again from 0%. Please do not switch off your factory.

- ⚡ **Three programs on the taskbar.** `OBJECTIVES`: pick a Space Elevator phase, see the parts it needs and how many. `ITEMS`: search on every keystroke; recipe cards show the ingredients with per-minute rates, the machine, its cycle time and its power draw. `BUILDINGS`: every building and what it makes, by tier, plus Mk-by-Mk upgrade paths. Everything links: click an ingredient for its recipe, click the machine for its building. No hourglass.
- ⚡ **Nothing to install.** It [runs live in your browser](https://lukexyz.github.io/ULTRA-SATISFACTORY/): no floppies, no reboot, no "please insert disk 2".
- ⚡ **Or type the two lines from the little editor window** (Python 3.10+, from the repo root, then open `http://localhost:8501`; more under [Run it locally](#run-it-locally)):

```
python -m pip install -r requirements.txt
python -m streamlit run app/app.py
```

<sub>⚡ An unofficial fan project, not affiliated with Coffee Stain Studios. The game is not on this drive: bring your own factory.</sub>

<details>
<summary>⚡ <b>Properties</b>: right-click the factory to see what the 828 blocks are</summary>

```text
┌─ Factory (F:) Properties ───────────────────────────────────────── [?][X] ─┐
│                                                                            │
│   Label ......... FACTORY              Type ......... Local factory        │
│   File system ... SPAGHETTI16          Tidiness ..... pending              │
│                                                                            │
│   Used space .... 828 blocks   ████████████████████████████████  100%      │
│   Free space .... 0 blocks     (the storage box is full of Screws)         │
│                                                                            │
│   What the 828 blocks are:                                                 │
│   ■ Items ............... 140   every craftable item, one search away      │
│   ■ Structure pieces .... 333   333 ways to put off the actual factory     │
│   ■ Logistics ............ 59   the parts that carry the other parts       │
│   ■ Production machines ... 9   Assembler, Blender, Constructor, Foundry,  │
│                                 Manufacturer, Packager, Particle           │
│                                 Accelerator, Refinery, Smelter             │
│   ■ Other buildings ...... 76   26 decor, 15 power, 14 transit, 7 special, │
│                                 7 storage, 7 extraction                    │
│   ■ Standard recipes .... 123   the kind an item card shows                │
│   ■ Alternate recipes .... 88   in the data, waiting for their moment      │
│                                                                            │
│   140 items + 211 recipes + 477 buildings = 828. It divides into 69 x 12.  │
│   Also on this drive: 5 Space Elevator phases (the OBJECTIVES tab).        │
│                                                                            │
│              [     OK     ]   [   Cancel   ]   [   Apply   ]               │
└────────────────────────────────────────────────────────────────────────────┘
```

</details>

<details>
<summary>⚡ <b>Command prompt</b>: the Space Elevator shopping list, in 8.3 file names</summary>

```text
F:\ELEVATOR>dir /s

 Volume in drive F is FACTORY
 Long part names are shown on the right, because it is 1995 now.

 Directory of F:\ELEVATOR\PHASE1      "Automation basics"
SMARTP~1 PRT       x50   Smart Plating
VERSAT~1 PRT      x100   Versatile Framework
AUTOMA~1 PRT      x500   Automated Wiring

 Directory of F:\ELEVATOR\PHASE2      "Logistics & steel"
AUTOMA~1 PRT      x500   Automated Wiring
MODULA~1 PRT      x500   Modular Frame
SMARTP~1 PRT      x100   Smart Plating
VERSAT~1 PRT      x500   Versatile Framework

 Directory of F:\ELEVATOR\PHASE3      "Oil & computers"
VERSAT~1 PRT     x2500   Versatile Framework
MODULA~1 PRT      x500   Modular Engine
ADAPTI~1 PRT      x100   Adaptive Control Unit

 Directory of F:\ELEVATOR\PHASE4      "Nuclear & endgame"
ASSEMB~1 PRT     x1000   Assembly Director System
MAGNET~1 PRT      x500   Magnetic Field Generator
NUCLEA~1 PRT      x100   Nuclear Pasta
THERMA~1 PRT       x25   Thermal Propulsion Rocket

 Directory of F:\ELEVATOR\PHASE5      "Alien tech & quantum"
BIOCHE~1 PRT      x500   Biochemical Sculptor
AIEXPA~1 PRT      x100   AI Expansion Server
NEURAL~1 PRT      x100   Neural-Quantum Processor
BALLIS~1 PRT      x100   Ballistic Warp Drive

       18 part(s) across 5 phase(s)
        0 bytes free. Somebody check the Screw box.

F:\ELEVATOR>_
```

⚡ The `OBJECTIVES` tab does this per phase, with the long names, and every part is a click away from its recipe.

</details>

<details>
<summary>⚡ <b>About</b>: credits, the licence, and who this copy is registered to</summary>

```text
┌─ About Factory Defragmenter ───────────────────────────────────────── [X] ─┐
│                                                                            │
│   Factory Defragmenter for ULTRA-SATISFACTORY                              │
│   A Please Wait Industrial utility. "Your time is important to us."        │
│                                                                            │
│   It is a README header. It defragments nothing. The app underneath is     │
│   real: three tabs, everything linked, your spaghetti left as found.       │
├────────────────────────────────────────────────────────────────────────────┤
│   Game data ....... greeny/SatisfactoryTools                               │
│   Images .......... the Satisfactory Wiki, CC BY-NC-SA 4.0                 │
│   Code ............ Apache 2.0. Protection: none. Take it, fork it.        │
│   The game ........ not included and not ours. This is an unofficial fan   │
│                     project, not affiliated with Coffee Stain Studios.     │
├────────────────────────────────────────────────────────────────────────────┤
│   This product is licensed to:                                             │
│       whoever left that belt there "for now"                               │
│                                                                            │
│   Tip of the day: click the machine on any recipe card to open its         │
│   building. Then tell people you planned the factory that way.             │
│                                                                            │
│                               [     OK     ]                               │
│                                                                            │
│                  It is now safe to turn off your factory.                  │
└────────────────────────────────────────────────────────────────────────────┘
```

</details>
