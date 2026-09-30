<p align="center">
  <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/"><img src="assets/26-vaporwave_opus_5.5.svg" width="100%" alt="ULTRA-SATISFACTORY: an animated vaporwave collage in the manner of early-2010s album art. On a flat hot-pink ground, a white marble bust of a laurel-crowned head in profile stands on a plain block carved VLTRA MMXXVI. At the top right, the title ULTRA SATISFACTORY in wide-tracked mint capitals over a thin rule, then the Japanese line ウルトラ・サティスファクトリー 工場の友 (Ultra Satisfactory, the factory's friend) and a small hexagon-and-cog emblem. A black-and-pink checkerboard floor in perspective creeps toward the viewer in the lower right. A mid-1990s style window titled Ultra-Satisfactory reads: every recipe, building and Space Elevator objective, one click apart. A pointer clicks its three tabs in turn. Objectives: Space Elevator phase 1 of 5, Smart Plating x50, Versatile Framework x100, Automated Wiring x500. Items: find modular frame, 2 per minute from 3 Reinforced Iron Plate + 12 Iron Rod, Assembler, 60 s, 15 MW. Buildings: 477 buildings, Constructor 4 MW, Assembler 15 MW, Manufacturer 55 MW. The status bar says 140 items, 211 recipes, 477 buildings. A second window, overtime.bmp, holds a small pixel skyline of factory sheds and one very tall mast over water, fading from sunset to night with the lights still on. Late in the loop a dialog called screws.exe opens with a trail of copies: Storage is full of Screws. Make more Screws? Both buttons say Yes."></a>
</p>

<h1 align="center">ULTRA-SATISFACTORY</h1>

<p align="center">
  ⚡ <b>ウルトラ・サティスファクトリー</b> &nbsp;·&nbsp; 工場の友 &nbsp;·&nbsp; <i>the factory's friend</i><br>
  ⚡ A companion app for the factory-building game <i>Satisfactory</i>: <b>every recipe, building and Space Elevator objective, one click apart.</b>
</p>

<p align="center">
  ⚡ Would you like to look something up?<br>
  <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/"><kbd>&nbsp;&nbsp;Yes, live in my browser&nbsp;&nbsp;</kbd></a>&nbsp;
  <a href="#run-it-locally"><kbd>&nbsp;&nbsp;Yes, on my own machine&nbsp;&nbsp;</kbd></a>
</p>

⚡ Welcome to the atrium. **ULTRA-SATISFACTORY** sits beside the game on a second monitor, a phone, or the far side of an alt-tab, and answers the three questions a factory never stops asking: what goes into that, how many a minute, and which machine makes it. When an Assembler is sulking because one input ran dry, this is where you look up what it wanted. The fountain is decorative. The numbers are real: 140 craftable items, 211 machine recipes (88 of them alternates), 477 buildings, 5 Space Elevator phases.

- ⚡ **Objectives**: pick a Space Elevator phase, see the parts it wants and how many, click a part for its recipe.
- ⚡ **Items**: search as you type. Recipe cards show the ingredients with per-minute rates, the machine with its cycle time and power draw, and the products.
- ⚡ **Buildings**: every building and what it makes, grouped by tier, plus Mk-by-Mk upgrade paths for miners, conveyors, pipelines and storage.
- ⚡ **Everything links**: click an ingredient, arrive at its recipe. Click the machine, arrive at its building. The mall has no exits, only more departments.

⚡ To open a branch at home: Python 3.10+ and two commands, run from the repo root. Streamlit serves it at `http://localhost:8501`. The long version is under [Run it locally](#run-it-locally).

```
python -m pip install -r requirements.txt
python -m streamlit run app/app.py
```

⚡ Or install nothing at all. It runs [live in your browser](https://lukexyz.github.io/ULTRA-SATISFACTORY/): a stlite build (Streamlit on WebAssembly) that GitHub Actions republishes on every push to `main`.

<p align="center">
  ⚡ <a href="#whats-inside">what's inside</a> · <a href="#run-it-locally">run it locally</a> · <a href="#how-its-built">how it's built</a> · <a href="#data--credits">data &amp; credits</a> · <a href="#license">license</a><br>
  <sub>⚡ An unofficial fan project, not affiliated with Coffee Stain Studios. The bust is not affiliated with anyone. It has always been here.</sub>
</p>

<details>
<summary>⚡ <b>Plaza 477 directory</b>: the Space Elevator, floor by floor</summary>

```text
┌────────────────────────────────────────────────────────────────────────────┐
│   P L A Z A   4 7 7    ·    S P A C E   E L E V A T O R    ·    [^] [v]    │
│      directory of floors  ·  please mind the gap in your supply chain      │
├──────┬─────────────────────────────────────────────────────────────────────┤
│      │  ALIEN TECH & QUANTUM                                               │
│  5   │  Biochemical Sculptor x500  ·  AI Expansion Server x100             │
│      │  Neural-Quantum Processor x100  ·  Ballistic Warp Drive x100        │
├──────┼─────────────────────────────────────────────────────────────────────┤
│      │  NUCLEAR & ENDGAME                                                  │
│  4   │  Assembly Director System x1000  ·  Magnetic Field Generator x500   │
│      │  Nuclear Pasta x100  ·  Thermal Propulsion Rocket x25               │
├──────┼─────────────────────────────────────────────────────────────────────┤
│      │  OIL & COMPUTERS                                                    │
│  3   │  Versatile Framework x2500  ·  Modular Engine x500                  │
│      │  Adaptive Control Unit x100                                         │
├──────┼─────────────────────────────────────────────────────────────────────┤
│      │  LOGISTICS & STEEL                                                  │
│  2   │  Automated Wiring x500  ·  Modular Frame x500                       │
│      │  Smart Plating x100  ·  Versatile Framework x500                    │
├──────┼─────────────────────────────────────────────────────────────────────┤
│      │  AUTOMATION BASICS                                [ YOU ARE HERE ]  │
│  1   │  Smart Plating x50  ·  Versatile Framework x100                     │
│      │  Automated Wiring x500                                              │
├──────┴─────────────────────────────────────────────────────────────────────┤
│  The elevator does not move until the parts arrive. There are no stairs.   │
│  Information desk: the OBJECTIVES tab. Pick a floor, click a part,         │
│  get its recipe. The desk is always staffed. The desk is a web page.       │
└────────────────────────────────────────────────────────────────────────────┘
```

</details>

<details>
<summary>⚡ <b>Announcements from the mezzanine</b>: the public address, a glossary for the Japanese, credits</summary>

<br>

- ⚡ Attention, pioneers. A storage box on level 2 is full of Screws. It was full yesterday. Nobody is coming for it.
- ⚡ Would the owner of the pipe clipped through the east wall please continue to pretend not to notice.
- ⚡ The fuse in the food court will blow at the worst possible moment. This has been scheduled.
- ⚡ The "temporary" walkway by the fountain is now load-bearing and has been given a plaque.
- ⚡ A conveyor near the atrium is running the wrong way. It knows what it did.
- ⚡ Tidy-factory people and spaghetti people are reminded that the fountain is neutral ground.
- ⚡ Manifold or load balancer: both queues reach the same checkout. One of them looks nicer in a spreadsheet.
- ⚡ Overclocking the escalator is not permitted. Overclocking the Assembler is between you and your power grid.

⚡ **Glossary**, because Japanese on a vaporwave cover should mean something:

- ⚡ `ウルトラ・サティスファクトリー` (*urutora satisufakutorī*): "Ultra Satisfactory", spelled out in katakana.
- ⚡ `工場の友` (*kōjō no tomo*): "the factory's friend". A companion, in other words.
- ⚡ `VLTRA · MMXXVI`: the plinth. Roman stonecutters wrote U as V, *ultra* is Latin for "beyond", and MMXXVI is 2026.

⚡ **Credits**: game data from [greeny/SatisfactoryTools](https://github.com/greeny/SatisfactoryTools); item and building images from the [Satisfactory Wiki](https://satisfactory.wiki.gg), [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/); the code is [Apache 2.0](LICENSE).

⚡ **The banner** is a homage to early-2010s vaporwave album art, drawn from scratch by a plain Node script: the bust is an original drawing, the letters are strokes and pixels defined in the script, and the checker floor is a real perspective projection. No photos, no fonts, nothing borrowed. "Plaza 477" is not a real mall. You may still get lost in it.

</details>
