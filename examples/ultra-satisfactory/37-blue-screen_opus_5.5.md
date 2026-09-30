<p align="center">
  <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/"><img src="assets/37-blue-screen_opus_5.5.svg" width="100%" alt="ULTRA-SATISFACTORY as a white-on-blue fatal-error screen in 80 by 25 text mode. The inverted title bar reads ULTRA-SATISFACTORY. The error belongs to the factory, not the app: A belt has backed up at 008C:000000D3 in SCREWS(01) + 000001DD. Your factory has stopped. This app has not: it is how you fix it. ULTRA-SATISFACTORY is a companion app for Satisfactory: every recipe, building and Space Elevator objective, one click apart, in three tabs: OBJECTIVES, ITEMS and BUILDINGS. The recovery options are real: press F1 to open it live in your browser at lukexyz.github.io/ULTRA-SATISFACTORY, press F2 to run it with python -m pip install -r requirements.txt and python -m streamlit run app/app.py, or press CTRL+ALT+DEL to restart the factory, which will not help. Press any key to continue. The screen then changes to a stop-code dump whose hex numbers decode to the real counts (140 craftable items, 211 machine recipes, 88 alternates, 477 buildings, 5 Space Elevator phases) while a QR code for the live app prints row by row, and finally restarts into a black title screen: a gold hexagon-and-cog emblem, ULTRA in cyan block letters, SATISFACTORY in white, the three tabs in purple, pink and blue, and a roll call of the nine production machines. Then belt 07 backs up and it all starts again."></a>
</p>

<p align="center">
  <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/"><img src="assets/37-blue-screen_opus_5.5-anykey.svg" width="180" height="84" alt="The Any key: a beige keyboard key with the legend Any. Press it to open ULTRA-SATISFACTORY live in your browser."></a>
  <br>
  <sub>⚡ The Any key. People have hunted for it since the nineties. This one opens the app live in your browser.</sub>
  <br>
  <sub>⚡ Or continue to: <a href="#whats-inside">what's inside</a> · <a href="#run-it-locally">run it locally</a> · <a href="#how-its-built">how it's built</a> · <a href="#data--credits">data &amp; credits</a> · <a href="#license">license</a></sub>
</p>

<h1 align="center">ULTRA-SATISFACTORY</h1>

⚡ **Nothing here is broken.** The blue screen belongs to your factory, not to this repo. **ULTRA-SATISFACTORY** is a companion app for the factory-building game *Satisfactory*: **every recipe, building and Space Elevator objective, one click apart.** Keep it on a second monitor, a phone or the far side of an alt-tab, and the next time a belt backs up you will know what it wanted, how many a minute, and which machine to glare at.

⚡ Three tabs were loaded when the belt jammed. **OBJECTIVES**: pick a Space Elevator phase, see the parts it needs and how many. **ITEMS**: search on every keystroke; recipe cards show the ingredients with per-minute rates, the machine, its cycle time and its power draw. **BUILDINGS**: every building and what it makes, by tier, plus Mk-by-Mk upgrade paths. Everything links: click an ingredient for its recipe, click the machine for its building.

- ⚡ <kbd>F1</kbd> **[Open it live in your browser](https://lukexyz.github.io/ULTRA-SATISFACTORY/).** Nothing to install, nothing to reboot.
- ⚡ <kbd>F2</kbd> **[Run it on your own machine](#run-it-locally).** Python 3.10+, from the repo root, then open `http://localhost:8501`:

```
python -m pip install -r requirements.txt
python -m streamlit run app/app.py
```

- ⚡ <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>Del</kbd> Restart the factory. This will not help. The storage box will still be full of Screws.

<sub>⚡ An unofficial fan project, not affiliated with Coffee Stain Studios. The error screen is a joke and the app works. We cannot speak for your factory.</sub>

<details>
<summary>⚡ <b>STOP code, decoded</b>: every hex number on the second screen is a real count</summary>

```text
*** STOP: 0x0000008C (0x000000D3,0x00000058,0x000001DD,0x00000005)
*** BELT_BACKED_UP_AND_NOBODY_TOUCHED_ANYTHING

Nobody reads hex for fun. Every number on that line is a real count from the
app's data, written the hard way:

    0x0000008C ....  140   craftable items, searched on every keystroke
    0x000000D3 ....  211   machine recipes
    0x00000058 ....   88   of those recipes are alternates
    0x000001DD ....  477   buildings you can build
    0x00000005 ....    5   Space Elevator phases

*** Modules loaded when the belt jammed: the 9 production machines

    Base      Module         Power   Last seen making
    00000004  SMELTER.SYS     4 MW   Iron Ingot              30/min     2 s
    00000004  CONSTRUC.SYS    4 MW   Screw                   40/min     6 s
    00000010  FOUNDRY.SYS    16 MW   Steel Ingot             45/min     4 s
    0000000F  ASSEMBLR.SYS   15 MW   Reinforced Iron Plate    5/min    12 s
    00000037  MANUFACT.SYS   55 MW   Modular Engine           1/min    60 s
    0000001E  REFINERY.SYS   30 MW   Plastic                 20/min     6 s
    0000000A  PACKAGER.SYS   10 MW   Packaged Water          60/min     2 s
    0000004B  BLENDER.SYS    75 MW   Cooling System           6/min    10 s
    ????????  PARTACCL.SYS    ? MW   Nuclear Pasta          0.5/min   120 s

The base address is the power draw in megawatts, in hex. The Particle
Accelerator's draw is missing from the dump, so it gets question marks
instead of a guess.

*** Also resident: the other 468 buildings

    0x0000014D   333   structure pieces     0x0000000E   14   transit
    0x0000003B    59   logistics            0x00000007    7   special
    0x0000001A    26   decor                0x00000007    7   storage
    0x0000000F    15   power                0x00000007    7   extraction
```

</details>

<details>
<summary>⚡ <b>Stack trace</b>: how one backwards belt stops a Space Elevator</summary>

```text
*** Stack trace, most recent stop first

 #0  SPACE ELEVATOR   Phase 2 "Logistics & steel" wants Modular Frame x500
                      WAITING. It is very patient. You are not.

 #1  MODULAR FRAME    Assembler, 60 s cycle, 15 MW, 2/min
                      3 Reinforced Iron Plate + 12 Iron Rod -> 2 Modular Frame
                      STARVED: no Reinforced Iron Plate on the input belt

 #2  REINFORCED       Assembler, 12 s cycle, 15 MW, 5/min
     IRON PLATE       6 Iron Plate + 12 Screw -> 1 Reinforced Iron Plate
                      STARVED: it eats 30 Iron Plate a minute and is getting
                      none. Screws it has. Screws it has always had.

 #3  SCREW            Constructor, 6 s cycle, 4 MW, 40/min
                      1 Iron Rod -> 4 Screw
                      BACKED UP: #2 is not eating, so the belt is full

 #4  STORAGE BOX      "temporary". Now load-bearing.
                      FULL: Screws

 #5  IRON PLATE       Constructor, 6 s cycle, 4 MW, 20/min
                      3 Iron Ingot -> 2 Iron Plate
                      IDLE: its output belt was laid the wrong way round.
                      Nobody has looked at it since.

*** Resolution: turn one belt around. Then build a second Iron Plate
    Constructor if you want #2 at full speed: one makes 20 a minute
    and #2 eats 30.
```

⚡ Every frame of that trace is one click from the next in the app: click an ingredient to open its recipe, click the machine to open its building. The numbers are the standard recipes, exactly as the **ITEMS** tab shows them. The backwards belt is all yours.

</details>

<details>
<summary>⚡ <b>Storage box dump</b>: the QR code held still, plus who to blame</summary>

<p align="center">
  <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/"><img src="assets/37-blue-screen_opus_5.5-dump.svg" width="100%" alt="The stop-code screen held still. STOP: 0x0000008C (0x000000D3, 0x00000058, 0x000001DD, 0x00000005), BELT_BACKED_UP_AND_NOBODY_TOUCHED_ANYTHING. The hex is decoded underneath: 140 craftable items, 211 machine recipes, 88 of them alternates, 477 buildings, 5 Space Elevator phases. Tabs loaded when the belt jammed: OBJECTIV.TAB, ITEMS.TAB, BUILDING.TAB. On the right, a QR code drawn in text-mode half blocks that opens https://lukexyz.github.io/ULTRA-SATISFACTORY/"></a>
</p>

⚡ It is a real QR code, drawn in text-mode half blocks, two modules to every character cell. Point a phone at it and the app opens, which is handy, because a phone propped against the monitor is a fine second screen.

```text
*** Technical information

    Issued by ....... the Office of Unscheduled Stillness, night desk
    Any key ......... cast to order by the Any Key Foundry (16 MW, like
                      every Foundry)
    Typeface ........ drawn for this screen: 7 x 16 pixels in a 9 x 16 cell,
                      80 columns by 25 rows, two-pixel stems, no smoothing
    Game data ....... greeny/SatisfactoryTools
    Images .......... the Satisfactory Wiki, CC BY-NC-SA 4.0
    Code ............ Apache 2.0. Protection: none. Dump it, fork it, ship it.
    The game ........ Satisfactory, by Coffee Stain Studios. Not included and
                      not ours: this is an unofficial fan project.

    Greetings to .... the Second Storage Box Society; the Clip & Deny
                      Pipefitters (that pipe was always through that wall);
                      manifold people and load-balancer people, seated at
                      separate tables; and whoever overclocked the one
                      machine on the fuse that was already sweating.

    Press any key to continue _
```

</details>
