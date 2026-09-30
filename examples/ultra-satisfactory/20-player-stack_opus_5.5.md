<p align="center">
  <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/"><img src="assets/20-player-stack_opus_5.5.svg" width="100%" alt="ULTRA-SATISFACTORY shown as FUSEBOX, an invented late-90s desktop media player in animated pixel art: five small dark windows with gold pinstriped title bars, snapped together. The player has a green LED clock, a bouncing spectrum analyser and a ticker scrolling the current track, starting with 'ULTRA-SATISFACTORY - What's inside'. Its readouts say 211 RECIPES and 88 ALT, and the SPAGHETTI lamp is lit while TIDY is not. The equaliser's ten sliders are real counts on a log scale: 3 tabs, 5 phases, 9 machines, 15 power, 26 decor, 59 logistics, 88 alts, 140 items, 211 recipes, 477 buildings, beside an OVERCLOCK slider pinned to the top. The visualiser window shows ULTRA in glowing cyan over SATISFACTORY in white, with 'recipe lookup for Satisfactory' and 'unofficial fan project'. The library window lists the three tabs: OBJECTIVES, ITEMS and BUILDINGS. The playlist is the table of contents: What's inside, Play it live, Run it locally, How it's built, Data and credits, License. The banner links to the live app."></a>
</p>

<h1 align="center">ULTRA-SATISFACTORY</h1>

⚡ A companion app for the factory-building game *Satisfactory*: **every recipe, building and Space Elevator objective, one click apart.** Park it on the second monitor, your phone, or the far side of an alt-tab, and look things up while the Assembler is still waiting on screws.

⚡ Three tabs. `OBJECTIVES`: pick a Space Elevator phase, see the parts it needs and how many. `ITEMS`: search as you type, get the recipe with per-minute rates, the machine, its cycle time and its power draw. `BUILDINGS`: every building and what it makes, plus Mk-by-Mk upgrade paths. Everything links, so each answer is one click from the next question.

⚡ The banner is FUSEBOX, a media player that does not exist, playing this README on repeat. Clicking the picture opens the live app, but its rows are only pixels, so here is the playlist again with working links:

1. ⚡ **ULTRA-SATISFACTORY** - [What's inside](#whats-inside) *(Three-Tab Anthem)* `0:12`
2. ⚡ **Second Monitor Sound System** - [Play it live](https://lukexyz.github.io/ULTRA-SATISFACTORY/) *(No-Install Browser Mix)* `0:12` nothing to install
3. ⚡ **Pip & The Requirements** - [Run it locally](#run-it-locally) *(Two-Command Edit)* `0:08` two commands, then `localhost:8501`
4. ⚡ **The Provisional Catwalks** - [How it's built](#how-its-built) *(One Big app.py Dub)* `0:08`
5. ⚡ **Waiting On Screws** - [Data & credits](#data--credits) *(feat. greeny/SatisfactoryTools)* `0:12`
6. ⚡ **The Fuse Blew Again** - [License](#license) *(Apache 2.0 Unplugged)* `0:08`

<sub>⚡ Unofficial fan project, not affiliated with Coffee Stain Studios. The bands are invented. The numbers are not.</sub>

<details>
<summary>⚡ <b>Equaliser settings</b>: what the ten sliders actually are</summary>

⚡ Every band is a real count from the app, sorted low to high like frequencies and drawn on a log scale. Nothing was tuned by ear.

```text
 FUSEBOX EQUALISER   preset: EVERYTHING, COUNTED

 BAND       COUNT  1         10        100       1000
 TABS           3  █████                          Objectives, Items, Buildings
 PHASES         5  ███████                        Space Elevator phases
 MACHINES       9  █████████▌                     production machines
 POWER         15  ████████████                   power buildings
 DECOR         26  ██████████████                 decor pieces
 LOGISTICS     59  █████████████████▌             logistics buildings
 ALTS          88  ███████████████████▌           alternate recipes
 ITEMS        140  █████████████████████▌         craftable items
 RECIPES      211  ███████████████████████        machine recipes
 BUILDINGS    477  ███████████████████████████    player-buildable buildings

 OVERCLOCK  pinned to the top. It shakes a little. That is how you know
            it is working.
```

⚡ The nine machines, for the record: Assembler, Blender, Constructor, Foundry, Manufacturer, Packager, Particle Accelerator, Refinery, Smelter. The 88 alternates are in the data. The item card plays the standard recipe.

</details>

<details>
<summary>⚡ <b>Bonus disc</b>: The Space Elevator Sessions (5 phases, 18 deliveries)</summary>

```text
 DISC 2 / THE SPACE ELEVATOR SESSIONS

 PHASE 1  Automation basics
    1. Smart Plating ...................................... x50
    2. Versatile Framework ............................... x100
    3. Automated Wiring .................................. x500

 PHASE 2  Logistics & steel
    4. Automated Wiring .................................. x500
    5. Modular Frame ..................................... x500
    6. Smart Plating ..................................... x100
    7. Versatile Framework ............................... x500

 PHASE 3  Oil & computers
    8. Versatile Framework .............................. x2500
    9. Modular Engine .................................... x500
   10. Adaptive Control Unit ............................. x100

 PHASE 4  Nuclear & endgame
   11. Assembly Director System ......................... x1000
   12. Magnetic Field Generator .......................... x500
   13. Nuclear Pasta ..................................... x100
   14. Thermal Propulsion Rocket .......................... x25

 PHASE 5  Alien tech & quantum
   15. Biochemical Sculptor .............................. x500
   16. AI Expansion Server ............................... x100
   17. Neural-Quantum Processor .......................... x100
   18. Ballistic Warp Drive .............................. x100
```

⚡ The `OBJECTIVES` tab does this per phase: click a part and its recipe opens. Track 13 comes off the Particle Accelerator at half a Nuclear Pasta a minute, so put the kettle on.

</details>

<details>
<summary>⚡ <b>Skin notes</b>: credits, small print and troubleshooting</summary>

- ⚡ **The player.** FUSEBOX is invented for this README. The skin is original pixel art drawn by a script: no fonts, no bitmaps, no real player's artwork. Official slogan: plays until something trips.
- ⚡ **The durations.** Real. Each track lasts exactly as long as its row says, and the banner loops in 1:00.
- ⚡ **The credits.** Game data from [greeny/SatisfactoryTools](https://github.com/greeny/SatisfactoryTools). Item and building images from the [Satisfactory Wiki](https://satisfactory.wiki.gg), CC BY-NC-SA 4.0. The code is [Apache 2.0](LICENSE): protection none, skins welcome.
- ⚡ **"The playlist will not click."** It is a picture. The working copy is the numbered list above.
- ⚡ **"SPAGHETTI is lit and TIDY is not."** It is an indicator lamp, not a judgement. It is also a judgement.
- ⚡ **"OVERCLOCK is stuck on."** Working as intended. Fuses are a consumable.
- ⚡ **"Can it play my MP3s?"** No. It can tell you a Rotor takes 15 seconds in an Assembler at 15 MW, which is catchier than most of them.

</details>
