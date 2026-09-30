<p align="center">
  <img src="assets/42-aero-gloss_opus_5.5.svg" width="100%" alt="A glossy mid-2000s banner for ULTRA-SATISFACTORY. Under a sky-blue gradient with a lens flare, soft aurora ribbons and drifting soap bubbles, the name sits in big friendly lowercase jelly letters, ultra in glassy blue and satisfactory in glassy green, beside a blue orb holding a hexagon with a cog in it, all mirrored in a wet-floor reflection. An orange starburst badge in the corner says not even BETA, v0.0.1. The tagline reads: every recipe, building and space elevator objective, one click apart. Below it floats a translucent glass window titled ULTRA-SATISFACTORY, lukexyz.github.io/ULTRA-SATISFACTORY, holding three shiny buttons for the three tabs: objectives in purple (5 space elevator phases), items in pink (140 items, 211 recipes) and buildings in blue (477 buildings, by tier), and a green progress bar labelled moving the whole factory one foundation to the left, time remaining: about 4 years. Green hills and dewy blades of grass curve along the bottom with the line: free and open source, an unofficial fan project, not affiliated with Coffee Stain Studios.">
</p>

<p align="center">
  <a href="https://lukexyz.github.io/ULTRA-SATISFACTORY/"><img src="assets/42-aero-gloss_opus_5.5-btn-live.svg" width="186" height="66" alt="Glass button: open it live in your browser"></a>
  <a href="#run-it-locally"><img src="assets/42-aero-gloss_opus_5.5-btn-run.svg" width="186" height="66" alt="Glass button: run it locally"></a>
  <a href="#whats-inside"><img src="assets/42-aero-gloss_opus_5.5-btn-inside.svg" width="186" height="66" alt="Glass button: what's inside"></a>
  <a href="#how-its-built"><img src="assets/42-aero-gloss_opus_5.5-btn-built.svg" width="186" height="66" alt="Glass button: how it's built"></a>
</p>

<p align="center">
  ⚡ <b>ULTRA-SATISFACTORY</b>: every recipe, building and Space Elevator objective, one click apart.<br>
  <sub>⚡ mopped to a mirror finish by WET FLOOR LOGISTICS &middot; an unofficial fan project, not affiliated with Coffee Stain Studios &middot; <a href="#data--credits">data &amp; credits</a> &middot; <a href="#license">license</a></sub>
</p>

⚡ A companion app for the factory-building game *Satisfactory*. Keep it open beside the game (second monitor, phone, or one alt-tab away) and it answers the three questions a factory asks all day: what goes in, how many a minute, and which machine makes it. It answers them faster than you can find the spreadsheet you swore you would keep tidy.

- ⚡ **OBJECTIVES**: pick a Space Elevator phase, see the parts it needs and how many. Click a part, get its recipe.
- ⚡ **ITEMS**: search as you type. Recipe cards show ingredients per minute, the machine, its cycle time and its power draw.
- ⚡ **BUILDINGS**: every building and what it makes, grouped by tier, plus Mk-by-Mk upgrade paths.

⚡ Everything is a link: click an ingredient to open its recipe, click the machine to open its building.

⚡ Two commands and it is running on your own machine (Python 3.10+, from the repo root, then open `http://localhost:8501`):

```sh
python -m pip install -r requirements.txt
python -m streamlit run app/app.py
```

⚡ Or install nothing at all: it runs **[live in your browser](https://lukexyz.github.io/ULTRA-SATISFACTORY/)**, a stlite build (Streamlit on WebAssembly) that GitHub Actions republishes on every push to `main`.

<details>
<summary>⚡ <b>Frequently unasked questions</b>: is it in beta, why is the logo standing in a puddle, will that progress bar ever finish</summary>

<br>

⚡ **Is it in beta?** Not even. The package version is 0.0.1 and nobody has declared a beta. In 2007 everything wore a BETA badge, some of it permanently, so we have applied for one. The Bureau of Perpetual Beta says to expect a decision in about 4 years.

⚡ **Why is the logo standing in a puddle?** That is the wet floor. Every logo of the period stood on one. Ours is mopped hourly by Wet Floor Logistics, who ask us to remind you that reflections are slippery.

⚡ **Will the progress bar in the banner ever finish?** It is moving the whole factory one foundation to the left, because somebody noticed it was off the grid. Time remaining: about 4 years. The estimate has not changed since we drew it, which makes it the most honest progress bar of its generation.

⚡ **Does it balance my manifold?** No. It tells you what goes in, what comes out, how fast, and in which machine. Whether you feed that machine from a manifold or a load balancer is between you, your splitters and whichever forum thread you are currently losing.

⚡ **One of my machines is starved of an input. Can it help?** Click the ingredient. Then click *its* ingredient. Keep going. At the bottom there is a Constructor you built in a hurry and never plugged in.

⚡ **Is it social? Can I poke my friends?** No. It is a lookup tool that happens to have rounded corners. There is a tag cloud further down, because the period demanded one.

⚡ **How much is the premium plan?** There is one plan and it is free: Apache 2.0, no sign-up, no invite code, no waiting list. We asked Finance about the business model and Finance turned out to be a gradient.

</details>

<details>
<summary>⚡ <b>One click apart, demonstrated</b>: from a Space Elevator phase down to the iron, clicking the whole way</summary>

<br>

| You click | The card says |
| :--- | :--- |
| ⚡&nbsp;**Phase&nbsp;2** "Logistics & steel" | Wants Versatile Framework x500, Modular Frame x500, Automated Wiring x500 and Smart Plating x100. |
| ⚡&nbsp;**Versatile&nbsp;Framework** | 5/min from an Assembler, 24 s cycle, 15 MW. In: 1 Modular Frame + 12 Steel Beam. Out: 2. |
| ⚡&nbsp;**Modular&nbsp;Frame** | 2/min from an Assembler, 60 s cycle, 15 MW. In: 3 Reinforced Iron Plate + 12 Iron Rod. Out: 2. |
| ⚡&nbsp;**Reinforced&nbsp;Iron&nbsp;Plate** | 5/min from an Assembler, 12 s cycle, 15 MW. In: 6 Iron Plate + 12 Screw. Out: 1. |
| ⚡&nbsp;**Screw** | 40/min from a Constructor, 6 s cycle, 4 MW. In: 1 Iron Rod. Out: 4. |
| ⚡&nbsp;**Iron&nbsp;Rod** | 15/min from a Constructor, 4 s cycle, 4 MW. In: 1 Iron Ingot. Out: 1. You know where the ingots are. |

⚡ 500 Versatile Framework at 5 a minute is 100 minutes of one Assembler, provided nothing upstream runs dry. Something upstream always runs dry. These are the standard recipes: the 88 alternates are in the data too, looking smug.

</details>

<details>
<summary>⚡ <b>Tag cloud</b>: legally required on any page with this many gradients</summary>

<br>

<p align="center">
  <img src="assets/42-aero-gloss_opus_5.5-tags.svg" width="100%" alt="A Web 2.0 tag cloud of 23 Satisfactory items, each sized by how many one machine makes per minute on the standard recipe. Largest to smallest: packaged water 60, steel ingot 45, screw 40, iron ingot, copper ingot, wire and cable 30, iron plate and plastic 20, iron rod, caterium ingot, steel beam and concrete 15, cooling system 6, reinforced iron plate and versatile framework 5, rotor 4, modular frame, smart plating and heavy modular frame 2, modular engine and adaptive control unit 1, nuclear pasta 0.5.">
</p>

⚡ Every tag is a real item, sized by how many one machine makes a minute on the standard recipe. Packaged Water shouts loudest at 60, Steel Ingot and Screw come next at 45 and 40 (check your storage boxes: it is always screws), and Nuclear Pasta whispers at one every two minutes.

</details>

<details>
<summary>⚡ <b>Small print, gloss budget and greetz</b></summary>

```text
  HOW TO MAKE ONE (1) GLASS BUTTON, 2007 METHOD

      .--------------------------------------.
     /    lighter band: the top 46 percent    \
    |==========================================|   <- hard edge. this is law.
     \    darker body, a little glow below    /
      '--------------------------------------'
        . : . : . : . : . : . : . : . : . :        <- wet floor. mind the
          .   .   .   .   .   .   .   .   .           reflection.

  GLOSS BUDGET FOR THIS README
    gradients ........ plenty         photographs ......... 0
    blur filters ..... 0              rounded corners ..... all of them
    starburst badges . 1              wet floors .......... 5
    soap bubbles ..... 22             bubbles that pop .... 0
    blades of grass .. 12             blades mown ......... 0
    dew drops ........ 5              dew drops wiped ..... 0

  GREETZ, IN NO PARTICULAR Z-ORDER
    The Rounded Corner Office  ·  Gradient Descent Landscaping
    The 46 Percent Highlight Appreciation Society
    Lens Flare Occupational Safety  ·  The Bureau of Perpetual Beta
    Dew Point Quality Assurance  ·  the tidy-factory people, who will
    straighten that progress bar  ·  the spaghetti people, who clipped a
    pipe through this window and are pretending not to have noticed

  SMALL PRINT
    An unofficial fan project, not affiliated with Coffee Stain Studios.
    The game is theirs. Game data: greeny/SatisfactoryTools. Item and
    building images: the Satisfactory Wiki (CC BY-NC-SA 4.0). Code:
    Apache 2.0. Wet Floor Logistics and everyone in the greetz are made
    up. No photographs were used: the sky, the grass and the bubbles are
    gradients, and the lettering is a font drawn for this banner.
```

</details>
