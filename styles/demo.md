# The demoscene proper

<sub>Generated from <code>styles.json</code> by <code>tools/build-styles.mjs</code>. 11 styles, researched 2026-09-30. Added in a gap-filling pass: checked by its own researcher only, not by a second reviewer. [Back to the catalogue](README.md) · [Full index](INDEX.md)</sub>

## Reviewer's summary

This family covers what demosceners themselves make and keep, as opposed to cracktros and menus. It has four schools. (1) The 1992-95 PC demo: a chain of separately coded VGA parts under one tracked soundtrack, framed by title cards, credit cards and a long typed READ.ME. (2) Size coding: 256-byte to 4k intros whose look comes from bit arithmetic and the default VGA palette, each shipped with an info text longer than the program. (3) Party artefacts: the invitation text, the big-screen compo slide and the results.txt, all fixed-layout documents that are already plain 80-column text. (4) The machines the catalogue skipped, each with a look forced by its video hardware: ZX Spectrum/Pentagon (two colours per 8x8 cell), Atari 8-bit (16-shade ramps recoloured per scanline), Amstrad CPC (double-wide pixels in a three-level RGB palette, drawn into the border) and the Apple II (six artifact colours and 40-column text). The party documents and info files are the most directly usable on GitHub because they need no SVG at all; the platform styles are the most visually distinct from the existing C64/Amiga entries.

## Styles

| ID | Style | Medium | Build | Impact |
| --- | --- | --- | --- | --- |
| [demo-01](#demo-01) | PC demo opening titles and part-credit cards (Second Reality manner) | Animated SVG | Easy | 4/5 |
| [demo-02](#demo-02) | PC demo READ.ME: paged info file with index, member table and cut-here form | Text / ASCII | Easy | 3/5 |
| [demo-03](#demo-03) | Full-frame procedural effects: fire, voxel landscape, shade bobs, fractal zoom | Animated SVG | Medium | 4/5 |
| [demo-04](#demo-04) | 256-byte intro: bit-pattern textures in the default VGA palette | Animated SVG | Medium | 4/5 |
| [demo-05](#demo-05) | Tiny-intro info file: the 40-column note that is longer than the program | Text / ASCII | Easy | 2/5 |
| [demo-06](#demo-06) | Demoparty results.txt (with the invitation text as its companion) | Text / ASCII | Easy | 4/5 |
| [demo-07](#demo-07) | Big-screen compo slide sequence (beamer) | Text / ASCII + SVG | Easy | 4/5 |
| [demo-08](#demo-08) | ZX Spectrum / Pentagon demo screen: effects in the attribute grid | Animated SVG | Medium | 4/5 |
| [demo-09](#demo-09) | Atari 8-bit demo screen: 16-shade GTIA ramps recoloured by display-list interrupts | Animated SVG | Easy | 4/5 |
| [demo-10](#demo-10) | Amstrad CPC demo screen: Mode 0 fat pixels, three-level RGB, full overscan | Animated SVG | Medium | 3/5 |
| [demo-11](#demo-11) | Apple II crack screen: six-colour hi-res panels and 40-column credits | Text / ASCII + SVG | Easy | 4/5 |

---

<a name="demo-01"></a>

## demo-01 · PC demo opening titles and part-credit cards (Second Reality manner)

**Animated SVG** · build: **Easy** · impact: **4/5** · 1992-1995, MS-DOS on 386/486 with VGA and Gravis UltraSound or Sound Blaster; the Finnish-led PC demoscene around the Assembly party

The early-90s PC demo is a chain of separately coded parts glued together by a loader and one soundtrack; Fabien Sanglard's code review of Second Reality describes 32 self-contained DOS executables started one after another by a loader and a 'demo interrupt server'. Second Reality won the PC demo competition at Assembly 1993 (381 vote points against 334 for the runner-up in the results file) and is remembered for syncing picture to music. Its opening titles and its closing credit cards are the two screens that are already header-shaped: centred words fading over a picture, and a roll-call that pairs a thumbnail of each part with who made it.

**What it looks like**

- Black screen, then three-line centred text cards that fade up, hold about five seconds and fade out (group + 'production', where it was first shown, a sound-format card); confirmed in the opening part's source
- A wide painted horizon picture scrolling sideways while role cards fade in on top of it: a role word on line one, two or three handles below (graphics, music, code, additional design)
- Closing credits as 18 cards: a small 160x100 thumbnail of one part on one side, one to four caps lines of the form ROLE - NAME on the other, the two halves sliding in from opposite edges with a decelerating ease, holding, then accelerating away
- 3D scenes letterboxed: black bars above and below a 320x200 frame (visible in the Pouet screenshot of the city fly-through)
- A numbered part list in the source (20 entries, each tagged with its coder): opening texts, glenz, dot tunnel, techno, a vector space battle, mirror-ball scroll, lens, rotozoomer, plasma, plasma cube, mini vector balls, mountain scroller, 3D sine field, second vector part, end picture flash, credits/greetings scroller
- An end scroller of short 45-column lines in a proportional bitmap font crawling upward
- On exit the demo drops back to the DOS prompt and prints a short plain contact block (mail, BBS numbers, fax)

**Palette.** 256-colour VGA with every transition done as a palette fade. The one screenshot I inspected (Pouet, city scene) is steel blue-grey buildings (\#9999CC, \#666699, \#333366) on mid-green ground (\#339966, \#66CC66) inside black letterbox bars. Title text is light on black; I did not confirm its exact colour.

**Lettering.** A custom proportional bitmap font about 32 pixels tall with its own glyph-order table. Opening cards use mixed case; the closing credit cards use capitals only, in the pattern ROLE - NAME. No outline, no chrome: plain anti-aliased letters that take their colour from the palette fade.

**Motion.** Opacity-style fades between black and text (palette interpolation), a slow horizontal pan of the horizon strip, and for the credit cards a slide-in whose remaining distance shrinks by a fixed ratio each frame (fast start, soft landing), a hold of about 200 frames, then an accelerating exit.

**As a README header.** One animated SVG banner, about 800x200, black. Three text cards cross-fade in sequence (owner + 'production'; what it is for; the project name held longest), then a procedural horizon strip pans behind a final held title. Under it, as real text in a &lt;pre&gt; block, the credit roll in the ROLE - NAME form (CODE - ..., DOCS - ..., TESTS - ...). The alternative layout is the credit card: one row per module with a small thumbnail rectangle on the left and its role lines on the right, which suits a repo with several components.

**How to build it.** Only opacity and translate keyframes on a few text and path elements: CSS @keyframes with staggered animation-delay gives the card sequence, a seamless tiling path translated in X gives the horizon pan, and a cubic-bezier ease-out reproduces the decaying slide-in. Text must be converted to paths or use a generic font stack because web fonts cannot load. File size is a few kilobytes.

**Do not copy / caveats.** Reference only: do not use the Future Crew name, the wording of their cards, their font bitmaps, pictures or music. One of the original cards shows a cinema-sound trademark; do not imitate that. The repository README places the 2013 source release in the public domain (Unlicense), but the original 1993 READ.ME describes the demo as freeware to be distributed unmodified, so treat the artwork as not reusable and rebuild everything. Dates differ by source: Wikipedia gives the party showing as 30 July 1993 and public release as October 1993, Demozoo lists 31 July 1993, Pouet lists October 1993. The exact text colours and the look of the horizon picture are not confirmed by an image I could inspect properly; only layout, wording pattern and timing come from the source code.

**References**

- [Wikipedia: Second Reality (Assembly 1993 winner, release history, Unlicense source release)](<https://en.wikipedia.org/wiki/Second_Reality>)
- [Pouet: Second Reality, with comments naming the city, chessboard, plasma cube and end 3D scenes](<https://www.pouet.net/prod.php?which=63>)
- [Demozoo: Second Reality credits (code Psi, Trug, Wildfire; graphics Marvel, Pixel; music Purple Motion, Skaven)](<https://demozoo.org/productions/108/>)
- [Source repository: PARTS file listing the 20 named parts with their coders](<https://raw.githubusercontent.com/mtuomi/SecondReality/master/MAIN/PARTS>)
- [Source of the opening titles: the fade-in text cards and the scrolling horizon picture](<https://raw.githubusercontent.com/mtuomi/SecondReality/master/ALKU/MAIN.C>)
- [Source of the closing credits: 18 thumbnail-plus-role cards and the slide-in code](<https://raw.githubusercontent.com/mtuomi/SecondReality/master/CREDITS/MAIN.C>)
- [Fabien Sanglard's Second Reality code review (loader, DIS, parts as separate executables)](<https://fabiensanglard.net/second_reality/index.php>)
- [Assembly 1993 results file (PC demo top ten with vote points)](<https://files.scene.org/view/parties/1993/assembly93/results.txt>)
- [Pouet: Unreal by Future Crew (1st at Assembly 1992), the predecessor](<https://www.pouet.net/prod.php?which=1274>)

---

<a name="demo-02"></a>

## demo-02 · PC demo READ.ME: paged info file with index, member table and cut-here form

**Text / ASCII** · build: **Easy** · impact: **3/5** · 1992-1995, the text file shipped beside a PC demo executable; 80 columns, CP437, read in a DOS viewer or on a BBS

PC demo groups shipped a long typed document with each demo, closer to a club newsletter than to a release NFO. The Second Reality READ.ME is 732 lines at exactly 80 columns: a boxed title card, a numbered index, then pages on hardware, membership, contact, a FAQ, a list of distribution boards and an application form. It is distinct from the existing scene-NFO style because it has no logo art at all: the structure (index, page numbers, tables, a tear-off form) is the look.

**What it looks like**

- A full-width title card drawn with single-line box characters, split by a horizontal divider: the title between equals signs and a copyright line above, centred status lines below
- A 'main index' of section names joined to two-digit page numbers by dot leaders, centred as a block
- Centred page markers of the form - 03 - separating pages, with many blank lines around them
- Section headings in capitals, indented eight spaces, underlined with equals signs for major sections and hyphens for minor ones
- A membership table with four columns (alias, real name, age, position) under one dashed rule
- A FAQ set as Q: and A: paragraphs, and a release list in three columns (title, date, one-line note)
- A tear-off line: the words CUT HERE! repeated across the full width between two dashed rules, followed by a form with labelled colon-and-underscore blanks and \[ \] tick boxes
- A numbered list with a one-character access flag in the left margin and a legend explaining the flags underneath

**Palette.** Monochrome text. Nothing depends on colour.

**Lettering.** Plain typed text. Box-drawing characters are used only for the title card; everything else is 7-bit ASCII: equals signs, hyphens, underscores, colons, square brackets and dot leaders. Body text is indented eight spaces and wrapped at about 70 columns.

**Motion.** static

**As a README header.** Entirely text, in one &lt;pre&gt; block at the top of the README. Above the fold: the boxed title card with the project name between equals signs and two centred status lines (what it is, licence), then the main index whose entries are real anchor links to the README's own sections, joined to 'page numbers' by dot leaders. Further down, reuse the member table for maintainers, Q:/A: for the FAQ and the CUT HERE form as a joke issue template. Example of the index device, my own wording: 'Installation.............................02'.

**How to build it.** 80 columns of box-drawing and ASCII render correctly in GitHub's monospace &lt;pre&gt;; links work inside &lt;pre&gt;, so the index can be functional. Generating it is string padding: centre, dot-fill to a fixed column, underline to heading length.

**Do not copy / caveats.** I opened one group's file, so calling this layout typical of the era is an inference from a single, very influential example. Do not copy Future Crew's wording. The original contains real names, ages, a home address and phone numbers: none of that may be reproduced. The devices themselves (boxed title, dot-leader index, page markers, underlined headings, cut line, form blanks) are generic and free to reuse. Eighty columns is wider than GitHub's mobile view, so expect horizontal scrolling on phones.

**References**

- [The READ.ME shipped in the Second Reality source tree (732 lines, 80 columns)](<https://raw.githubusercontent.com/mtuomi/SecondReality/master/MAIN/READ.ME>)
- [The demo's exit-to-DOS text block (19 lines of contact details)](<https://raw.githubusercontent.com/mtuomi/SecondReality/master/MAIN/ENDANSI>)
- [The development FILE\_ID.DIZ in the same tree: a 27-column box with the names set in letters separated by dots](<https://raw.githubusercontent.com/mtuomi/SecondReality/master/MAIN/FILE_ID.DIZ>)
- [Repository front page with the public-domain statement](<https://github.com/mtuomi/SecondReality>)
- [Wikipedia: Future Crew (members, Scream Tracker, Assembly co-organisers)](<https://en.wikipedia.org/wiki/Future_Crew>)

---

<a name="demo-03"></a>

## demo-03 · Full-frame procedural effects: fire, voxel landscape, shade bobs, fractal zoom

**Animated SVG** · build: **Medium** · impact: **4/5** · 1992-1996, MS-DOS VGA mode 13h (320x200, 256 colours, one byte per pixel); also Amiga and Atari ST for shade bobs

Once PCs had a byte-per-pixel frame buffer, demos filled the whole screen with effects computed per pixel rather than per object. Wikipedia's demo-effect article lists fire under 2D filters and feedback, the heightfield landscape under its scene name 'voxel landscape', shadebobs under old-school effects and the Mandelbrot zoomer under fractals. Pouet commenters still single these parts out: the fractal zoomer in Triton's Crystal Dream 2 (1st at The Computer Crossroad 1993), the voxel cave and morphing fractals in EMF's Verses (1st at Assembly 1994), the voxel tunnel in NoooN's Stars (1st at Assembly 1995), and the shadebobs part of Future Crew's Unreal (1st at Assembly 1992), which some of them call ugly.

**What it looks like**

- Fire: a white-hot bottom row, flames rising and cooling through yellow, orange and red to black, with ragged tongues drifting sideways; Fabien Sanglard's write-up of the classic algorithm uses a 37-step palette and a single white source line
- Fire has no outlines: it is one soft, low-resolution field, usually shown at half or quarter resolution so the pixels are visibly chunky
- Voxel landscape: terrain drawn as vertical columns from a height map and a colour map with shading baked in, giving blocky ridgelines that overlap toward a horizon; the Voxel Space write-up dates the look to NovaLogic's Comanche of 1992
- Shade bobs: a soft blob travels a looping path and brightens whatever it passes over, so its trail builds into glowing knots that climb a colour ramp (mechanism described from general scene knowledge, see caveats)
- Fractal zoom: an endless dive into Mandelbrot or Julia boundaries with banded, cycling colours
- All four use a continuous ramp of 64 to 256 palette entries, so they read as smooth gradients next to the hard-edged pixel logos elsewhere in the catalogue

**Palette.** Fire: black, dark red, red, orange, yellow, white in one ramp. Voxel landscape: earth browns and greens under a flat or gradient sky, darker with distance. Shade bobs: a single hue ramp from black to a saturated colour to white. Fractal zoom: a cycling rainbow or two-hue ramp in narrow bands.

**Lettering.** None inside the effect. Text is laid over it: a pixel logo cut out of the effect or a plain line of bitmap type on top, often with a one-pixel dark drop shadow so it stays legible on a bright field.

**Motion.** Fire rises continuously and flickers. The landscape scrolls toward the viewer or pans. The bob orbits on a Lissajous curve while its trail accumulates. The fractal scales up without end.

**As a README header.** Fire is the one to build: an SVG banner with the project name as solid dark letters standing in a strip of flame along the bottom edge, or letters cut out of the fire. Title and tagline above the fold inside the SVG; everything else is ordinary README text. The voxel landscape works as a second variant: a static stack of ridgelines behind the title, panning slowly. Shade bobs and the fractal zoom are better treated as accents than as the whole header.

**How to build it.** Judged one by one for script-free SVG. Fire, medium: feTurbulence noise multiplied by a vertical gradient mask, then feComponentTransfer with a table that maps brightness to the black-red-orange-yellow-white ramp; animate by scrolling the noise upward (SMIL on feOffset, or a translated tiling element under the filter). The browser refilters every frame, so keep the flame strip small and numOctaves low. Voxel landscape, medium: it cannot be computed live, so precompute 20 to 40 ridge silhouettes from a height map as filled paths drawn back to front, and pan them at different speeds for parallax; true forward flight is not possible. Shade bobs, medium and only approximate: SVG has no frame feedback, so the ever-accumulating trail cannot exist; 30 to 60 low-opacity copies of one blob on the same animateMotion path with staggered begin times give a finite glowing trail, which overlaps the bob chain already in the catalogue. Fractal zoom, hard for Mandelbrot (needs recomputation or a heavy image pyramid) but easy for exactly self-similar figures such as a Sierpinski carpet: scale by the similarity ratio and loop seamlessly.

**Do not copy / caveats.** The effects are generic techniques and free to reuse; the named demos are references only. The shade-bob mechanism is described from general knowledge: the sources I opened confirm the name and its presence in Unreal but do not explain it. Fire and fractal colour cycling flicker: keep contrast changes slow and add a prefers-reduced-motion rule that freezes the animation. Filter animation costs CPU on every README view, and fire on a header is a cliche to some eyes, so keep it to a strip.

**References**

- [Wikipedia: Demo effect (lists fire, heightfield/voxel landscape, shadebobs, Mandelbrot zoomer)](<https://en.wikipedia.org/wiki/Demo_effect>)
- [Fabien Sanglard: how the classic fire effect works (37-colour palette, white bottom row, upward propagation with random cooling and sideways drift)](<https://fabiensanglard.net/doom_fire_psx/>)
- [Sizecoding wiki: design tips and effect pseudo-code (pixel-summing fire, plasma, fractals, dot tunnels)](<http://www.sizecoding.org/wiki/Design_Tips_and_Demoscene_effects_with_pseudo_code>)
- [Voxel Space write-up: Comanche 1992, height map plus colour map, column rendering](<https://github.com/s-macke/VoxelSpace>)
- [Pouet: Crystal Dream 2 by Triton, comments on the fractal zoomer](<https://www.pouet.net/prod.php?which=462>)
- [Pouet: Verses by EMF, comments on the voxel cave and morphing IFS fractals](<https://www.pouet.net/prod.php?which=67>)
- [Pouet: Stars - Wonders of the World by NoooN, comments on the voxel tunnel](<https://www.pouet.net/prod.php?which=301>)
- [Pouet: Unreal by Future Crew, comments on the shadebobs part](<https://www.pouet.net/prod.php?which=1274>)
- [Demozoo: productions tagged shadebobs (only three, on Amiga and Atari ST)](<https://demozoo.org/productions/tagged/shadebobs/>)

---

<a name="demo-04"></a>

## demo-04 · 256-byte intro: bit-pattern textures in the default VGA palette

**Animated SVG** · build: **Medium** · impact: **4/5** · Late 1990s to today; MS-DOS .COM files run in DOSBox or FreeDOS, judged in 256-byte competitions at Revision, Function, Riverwash, Chaos Constructions and the dedicated Lovebyte party

Size coding is the discipline of making something watchable in 256 bytes or fewer; the sizecoding.org wiki defines its subject as programs of 1024 bytes or less and notes working effects in 16 and even 8 bytes. With no room for data, the picture is whatever falls out of arithmetic on the pixel's X and Y: XOR and AND patterns, Sierpinski triangles, circles without square roots, a plane made by dividing by the row number. HellMood's Memories (1st in PC 256 bytes at Revision 2020, and the public-choice winner) strings eight such effects together with transitions and MIDI music, and his write-up traces each one back through earlier 16-, 32- and 64-byte versions by named authors.

**What it looks like**

- The XOR texture: X xor Y drawn as colour, giving a quilt of nested squares that repeats at every power of two; in Memories it is masked so the screen becomes a grid of 8x8 chessboards
- The Sierpinski triangle produced by X and Y directly, used as the texture of a rotozoomer
- A tilted plane receding to a horizon, textured with the XOR pattern and scrolling toward the viewer
- Zooming concentric rings and layered see-through checkerboards sliding at different speeds (parallax)
- A ray-cast tunnel that bends, and a two-tone ocean under a sky that shifts from night to day
- Colour taken straight from the default 256-colour VGA palette instead of a custom one, because setting a palette costs bytes: effects are steered into its grey ramp or its hue bands
- Dissolve transitions made by offsetting time with a per-pixel pseudo-random value, so one effect speckles into the next
- Full 320x200 frame, no logo and no text at all: the name lives in the file name and the info file

**Palette.** The standard VGA mode 13h palette: the 16 CGA/EGA colours, a 16-step grey ramp, then bands of hues at three brightness and three saturation levels (layout from general knowledge; the Memories write-up only confirms that the standard palette and its dark and grey regions are used). Two famous exceptions that do set their own colours, as seen in their Pouet screenshots: tube by 3SC in browns and gold (\#996600, \#CC9900, \#663300) and Puls by Rrrola in olive and yellow-green (\#666600, \#999933, \#336600).

**Lettering.** None on screen. Letterforms exist only in the accompanying text file (see the info-file style).

**Motion.** Everything is a function of X, Y and a frame counter: textures scroll, zoom and rotate continuously, and the intro steps through its effects on a timer with speckled cross-dissolves. No easing, no pauses.

**As a README header.** A wide SVG strip filled edge to edge with one bit-pattern effect (the grid of chessboards, or the Sierpinski rotozoom), with the project name knocked out of it in plain block capitals and a small caption in the corner giving a byte count, as a joke or as a real size badge. No other ornament. The info-file style below supplies the text half.

**How to build it.** These patterns are unusually cheap in SVG because they decompose by bit. X xor Y is the weighted sum of eight checkerboards with cell sizes 1, 2, 4 ... 128, so eight &lt;pattern&gt; fills stacked additively (mix-blend-mode plus-lighter, or an feComposite arithmetic chain) reproduce it exactly; the Sierpinski figure is the product of eight tiles that each blank one quadrant, so eight patterns under mix-blend-mode multiply give it. A 256x256 greyscale PNG of either embedded as a data URI is the fallback and is only a few kilobytes. Recolour with feComponentTransfer tables and cycle with an animated hueRotate. Zooming rings are a repeating radialGradient with an animated scale. The tilted plane needs perspective, which SVG patterns lack: fake it with 30 to 40 horizontal strips whose pattern scale grows toward the bottom. Ray-cast tunnels and ray-marched surfaces like tube and Puls are not possible live; a static frame is the most that can be shown.

**Do not copy / caveats.** The arithmetic patterns are mathematics and free to use; the named intros, their titles and their authors are references only. I verified the look of Memories from its author's write-up and the Pouet comments, not from a clear image. The standard-palette layout is from general knowledge. The 4k and 64k classes (elevated, 1st at Breakpoint 2009, is a photorealistic mountain fly-over according to Pouet commenters) look nothing like this and cannot be reproduced in SVG at all, so this entry deliberately covers only the 256-byte end. High-frequency XOR patterns shimmer when scaled; render at integer pixel scale and keep motion slow.

**References**

- [sizecoding.org main page: scope of the wiki, platforms, the 1024-byte definition](<http://www.sizecoding.org/wiki/Main_Page>)
- [HellMood's write-up of Memories: the eight effects, their lineage, the framework and the use of the standard VGA palette](<http://www.sizecoding.org/wiki/Memories>)
- [Pouet: Memories by Desire/HellMood, 1st in PC 256b at Revision 2020](<https://www.pouet.net/prod.php?which=85227>)
- [Pouet: 256b productions sorted by thumbs up (tube, Puls, Memories at the top)](<https://www.pouet.net/prodlist.php?type%5B%5D=256b&order=thumbup>)
- [Pouet: tube by 3SC, layered ray-traced tunnels in 256 bytes](<https://www.pouet.net/prod.php?which=3397>)
- [Pouet: Puls by Rrrola, ray-marched implicit surfaces with fake ambient occlusion](<https://www.pouet.net/prod.php?which=53816>)
- [Pouet: 4k intros sorted by thumbs up (elevated by Rgba and TBC first), for the larger size classes](<https://www.pouet.net/prodlist.php?type%5B%5D=4k&order=thumbup>)
- [Revision 2023 256-byte intro directory on scene.org](<https://archive.scene.org/pub/parties/2023/revision23/256-byte-intro/>)

---

<a name="demo-05"></a>

## demo-05 · Tiny-intro info file: the 40-column note that is longer than the program

**Text / ASCII** · build: **Easy** · impact: **2/5** · 2000s to today; the .diz or .nfo packed with a 256-byte or 4k competition entry

Every competition entry travels with a small text file, and for a 256-byte intro that file is several times the size of the program. I read the ten info files in the Revision 2023 256-byte directory: they range from three lines of deadpan self-description to a boxed card with a logo. The shared content is fixed by the situation: what it is, how many bytes, which emulator settings the organisers must use, what to put on the big-screen slide, and who is greeted.

**What it looks like**

- A three-line centred header: title in quotes with size and platform, then author and group, then party and year
- Narrow measure: 38 to 44 columns, with rules of hyphens, underscores or equals signs cut to exactly that width
- Section labels in parentheses addressed to the organisers, one for run instructions and one for the text to show on the compo slide
- Run instructions as terse one-liners: emulator and version, CPU cycle count, sound device (MIDI, a parallel-port DAC, or none), screen mode, which key quits, how long to let it run
- A greetings block: a spaced-capitals heading, then dozens of handles separated by commas and wrapped to the measure
- Register varies from earnest to throwaway: one file is only title, author and a one-line joke; another apologises for the code
- The fancy variant: a small slanted ASCII logo signed by its artist, above a box with the title on a bracketed plaque in the top edge and labelled fields inside
- An explicit end marker on the last line

**Palette.** Monochrome text.

**Lettering.** Plain ASCII, occasionally CP437. Spaced capitals for the one heading, lower case for everything else, leet spellings of the year in some. Boxes are drawn with pipes, underscores, dots and backticks, not box-drawing characters.

**Motion.** static

**As a README header.** A single narrow &lt;pre&gt; card at the very top of the README, 40 columns wide so it also fits on a phone: name in quotes with size and platform, 'by', 'for'; a rule; three or four run instructions; a rule; a one-line remark; a rule; a greetings block listing contributors and dependencies. Everything in it is real README content, only compressed. Own illustration of the header device: line one '"tinytool" - 4k cli for linux', line two 'by someone / somewhere'.

**How to build it.** Pure ASCII at 40 columns renders everywhere, including GitHub mobile. Generation is centring and wrapping a comma list to a fixed measure.

**Do not copy / caveats.** The brief suggested that many tiny intros fit their whole source in the NFO. I could not confirm that: in the files I read the source is a separate file in the archive (one info file tells the organisers which source line to tweak), and the Memories source is reproduced on the wiki rather than in a .diz I opened. Do not copy anyone's wording, greetings list or logo; the layout is generic. The real files list real handles; a README should greet its own contributors, not borrow scene names.

**References**

- [Revision 2023 256-byte intro directory (twelve entries, ten with .diz files)](<https://archive.scene.org/pub/parties/2023/revision23/256-byte-intro/>)
- [Info file with header, organiser notes, slide text and a justified greetings block (HellMood / Desire)](<https://archive.scene.org/pub/parties/2023/revision23/256-byte-intro/atlantis.diz>)
- [Boxed info file with ASCII logo, bracketed title plaque and requirement fields (wiRe / Napalm)](<https://archive.scene.org/pub/parties/2023/revision23/256-byte-intro/terra256_wire_napalm.diz>)
- [Minimal underscored card with an end marker (sensenstahl)](<https://archive.scene.org/pub/parties/2023/revision23/256-byte-intro/sen_corroder.diz>)
- [Two-part info file: organiser note, then the public note between long underscore rules (Kuemmel)](<https://archive.scene.org/pub/parties/2023/revision23/256-byte-intro/circmod_revision_2023.diz>)
- [HellMood's Memories write-up, which reproduces the full release source and its NFO](<http://www.sizecoding.org/wiki/Memories>)

---

<a name="demo-06"></a>

## demo-06 · Demoparty results.txt (with the invitation text as its companion)

**Text / ASCII** · build: **Easy** · impact: **4/5** · 1992 to today; one results.txt per party in the scene.org parties archive, from Assembly 1993 to Revision 2023

When a demoparty ends the organisers publish the votes as a plain text file, and that file is how most of the scene learns who won. I read seven: Assembly 1993, The Party 1994, Breakpoint 2004, Main 2010, Chaos Constructions 2019, Forever 2019 and Revision 2023, plus the generator inside the Wuhu party system. The layout has barely moved in thirty years: a header, then one block per competition with rank, points and 'title by author', then a sign-off. The invitation text that precedes a party is its sibling: the same header idea followed by rules, size limits and prize tables.

**What it looks like**

- Header, plain form: two centred capital lines (results heading, party name and year), or a short paragraph explaining how votes were counted and how many were cast
- Header, art form: an Amiga-style outline ASCII logo signed with the artist's initials, with the party name, year and the word results set into or under it in letter-spaced capitals; Revision 2023 adds city and URL between two columns of dots
- One section per competition: the name alone on a line, then a rule of hyphens (cut to the title length in 1993, the full 79 columns in 2004, or a broken '- ---- -' rule in 2019)
- Rows of right-aligned numbers then text: place, points, title, author. 1993 adds the entry number and labelled columns; The Party 1994 uses Rank, Points, Entry, Title, Name over a 74-hyphen rule
- Ties shown by leaving the place blank, repeating it, or writing a range such as 06.-07.; disqualified entries listed last with DSQ in the points column
- Revision 2023 frames every section in a drawn panel with the competition name on a plaque, wraps long titles onto an indented second line, and keeps a one-letter flag column at the right margin with a legend in the footer
- Footer: a rule, the vote and voter counts, a credit for the ASCII artist or the party system, sometimes an embedded FILE\_ID.DIZ block between begin and end markers
- Invitation text (Assembly 1994, 468 lines at 79 columns): a half-block logo signed by an ANSI artist, a tagline between bookend symbols, place and dates, boxed 'organized by' and 'sponsored by' lists whose bottom edge fades out into dashes, then centred dash-spaced headings for opening words, competitions, prizes, features and general information, with right-aligned competition labels, maximum sizes in kb and prize tables by place

**Palette.** Monochrome text.

**Lettering.** Typed monospace at 74 to 79 columns. Headers range from none to a full Amiga-school outline logo built from slashes, underscores and pipes; section names are capitals or letter-spaced capitals; two-digit zero-padded places (01, 02) are common in modern files.

**Motion.** static

**As a README header.** Text only, one &lt;pre&gt; block. Header: project name and 'official results' or 'release notes' centred, optionally under a small outline logo. Then the README's own lists recast as competitions: FEATURES, BENCHMARKS, SUPPORTED PLATFORMS, CONTRIBUTORS, each a ruled section with ranked rows, the numbers being real (benchmark scores, commit counts, stars). Titles can be links. Footer: a rule and one line such as how many commits by how many contributors. Own illustration: '   01   412  fast path by core' under a section line and a hyphen rule. The invitation layout serves a CONTRIBUTING file: centred dash-spaced headings, a rules list with right-aligned labels, limits in a table.

**How to build it.** Fixed-width columns under 80 characters with right-aligned numbers: trivial to generate and robust in GitHub's &lt;pre&gt;. Links inside &lt;pre&gt; keep the alignment as long as padding is computed on the visible text. The framed Revision variant needs only ASCII.

**Do not copy / caveats.** Do not copy any party's logo, name or an artist's header; the Revision and Chaos Constructions headers are signed works. The column grammar is generic. The archived Assembly 1994 invitation has BBS advertisement banners glued to its top and bottom by boards it passed through (an ad-adder tool signs the last line); those are not part of the invitation and contain phone numbers, so leave them out. A 'results' framing implies a vote: use real numbers, or make the joke obvious. Non-sceners will read it simply as a tidy table, so its wow depends on the audience.

**References**

- [Assembly 1993 results (tab-aligned columns with place, votes, entry number, group, title)](<https://files.scene.org/view/parties/1993/assembly93/results.txt>)
- [The Party 1994 results (centred heading, Rank/Points/Entry/Title/Name columns)](<https://archive.scene.org/pub/parties/1994/theparty94/results.txt>)
- [Breakpoint 2004 results (ASCII logo, 79-hyphen rules, DSQ rows)](<https://archive.scene.org/pub/parties/2004/breakpoint04/results.txt>)
- [Revision 2023 results (767 lines at 79 columns, fully framed, ASCII credited in the footer to zNr/dS!, embedded FILE\_ID.DIZ)](<https://archive.scene.org/pub/parties/2023/revision23/results.txt>)
- [Chaos Constructions 2019 results (logo header, ZX Spectrum and AY competitions)](<https://archive.scene.org/pub/parties/2019/chaosconstructions19/results.txt>)
- [Forever 2019 results (special awards first, platform headings, tie ranges)](<https://archive.scene.org/pub/parties/2019/forever19/results.txt>)
- [Main 2010 results (the minimal form)](<https://archive.scene.org/pub/parties/2010/main10/results.txt>)
- [Wuhu party system: the code that prints results (header file, uppercase competition name, rank / entry number / points / title - author, 79-character rule, vote count footer)](<https://raw.githubusercontent.com/Gargaj/wuhu/master/www_admin/results_text.php>)
- [Assembly 1994 invitation text](<https://archive.scene.org/pub/parties/1994/assembly94/info/asm94inv.txt>)

---

<a name="demo-07"></a>

## demo-07 · Big-screen compo slide sequence (beamer)

**Text / ASCII + SVG** · build: **Easy** · impact: **4/5** · 1990s to today; the projector feed in the main hall of a demoparty, now usually a browser page driven by a party system such as Wuhu

Between entries the big screen shows a slide saying what is about to run. It is the scene's equivalent of a title card, and everyone who has sat in a party hall knows its rhythm: countdown, competition name, then entry number, title, author and a comment line, one slide per entry, and finally the results revealed from last place up. The entrants write their own slide comment: the info files at Revision 2023 carry a labelled block of slide text for the organisers.

**What it looks like**

- Five slide types, as defined in the Wuhu beamer code: announcement, competition or event countdown, competition display, prize-giving, and a rotation of general party slides (images, text or video)
- Countdown slide: the competition name with one large timer counting down to its start; the same timer can shrink into a corner overlay while other slides rotate
- Competition display: an intro slide with the competition name and a one-word 'now' cue, then one slide per entry, then an outro slide
- Entry slide fields, in order: number, title, author, comment. The author line is omitted for competitions judged anonymously
- Prize-giving: results walked in reverse order, each row carrying rank, title, author and points, with a horizontal bar whose width is that entry's share of the top score
- Everything is set very large and sparse, a handful of words per slide, because it is read from the back of a dark hall

**Palette.** Not fixed: each party supplies its own stylesheet (Wuhu ships a template to be customised), so there is no canonical scheme. The common denominator is light text on a dark ground for projector contrast.

**Lettering.** Party-specific. Structurally: one very large line (title or timer), one medium line (author or competition), one small line (comment), and a big ordinal number.

**Motion.** Slide-to-slide transitions, a ticking countdown, and the prize-giving reveal in which rows and their score bars appear one at a time from the bottom rank upward.

**As a README header.** An SVG 'now showing' slide as the header: a small competition line (the project's category), a big entry number, the project name as title, 'by' the owner, and the tagline as the comment line. Optionally it opens with a three-second countdown and the competition name before the entry slide settles and holds. Below it, in a &lt;pre&gt; block, the prize-giving: the feature or benchmark list as ranked rows with text bars proportional to the numbers, lowest first. Own illustration of a bar row: '03  parser      \#\#\#\#\#\#\#\#\#\#\#\#........  214 pts'.

**How to build it.** Text elements with opacity and transform keyframes; a countdown is a stack of digits shown in turn with steps() timing; prize-giving bars are rects with staggered scaleX animations, or plain text bars in &lt;pre&gt;. Use animation-fill-mode forwards so the final entry slide stays visible after one pass.

**Do not copy / caveats.** What I confirmed is the information architecture, from the Wuhu source; I did not see any real party's slide design, and those designs are made fresh by each party's artists, so there is nothing canonical to copy and nothing of theirs should be imitated. Do not use a real party's name or logo. The style needs the project to supply its own visual identity; on its own it is a layout, not a look.

**References**

- [Wuhu party system repository (beamer keyboard controls, slide rotation)](<https://github.com/Gargaj/wuhu>)
- [Wuhu beamer admin: the four modes and the data each one sends (competition name, start time, entry title/author/comment, reversed results)](<https://raw.githubusercontent.com/Gargaj/wuhu/master/www_admin/beamer.php>)
- [Wuhu slide viewer: slide classes and field order for countdown, entry and prize-giving slides, score bars](<https://raw.githubusercontent.com/Gargaj/wuhu/master/www_admin/slideviewer/wuhu.js>)
- [A Revision 2023 entry's info file with separate organiser notes and slide text blocks](<https://archive.scene.org/pub/parties/2023/revision23/256-byte-intro/atlantis.diz>)
- [Wikipedia: Demoscene (entries shown at night by projector, the demo competition as the main event)](<https://en.wikipedia.org/wiki/Demoscene>)

---

<a name="demo-08"></a>

## demo-08 · ZX Spectrum / Pentagon demo screen: effects in the attribute grid

**Animated SVG** · build: **Medium** · impact: **4/5** · Early 1990s to today; ZX Spectrum 128 and its clones, above all the Pentagon built by hobbyists across the former USSR from 1989; trackmos dominant from 1996; shown at Chaos Constructions in Saint Petersburg and at Forever, DiHalt, Multimatograf and CAFe

The Spectrum's picture is 256x192 pixels, but colour exists only on a 32x24 grid: each 8x8 cell has one ink and one paper from eight colours plus a shared bright bit. Wikipedia notes the machine reached cult status in the former Soviet territories, where the Pentagon clone became the standard competition machine, and that demos developed multicolour tricks on the 768 attribute cells and effects in the border. Demo coders turned the limit into the medium: whole effects are drawn by changing cell colours only. Pouet commenters on a 2021 intro praise it for using the limitation as a design element instead of fighting it. This differs from the catalogue's tape-loader entry, which is about border stripes and a loading picture, not about moving effects.

**What it looks like**

- Chunky 8x8 effects: plasma, tunnels, twisters and spirals drawn as 32x24 blocks of flat colour, which Pouet commenters call chunky or attribute-block effects
- Seven saturated colours plus black in two brightness levels, with no intermediate shades: pure blue, red, magenta, green, cyan, yellow, white
- Hard cell boundaries: fine one-colour pixel detail inside a cell, but colour changes only at cell edges, so pictures are composed to the grid
- Multicolour parts where attributes are rewritten during the frame to get cells 8 pixels wide but only 1, 2 or 4 lines tall, in a band about 20 columns wide
- Flicker blends: two screens alternated at 50 Hz (gigascreen) to suggest in-between colours; commenters argue about whether it looks good off a CRT
- Effects and rasters pushed into the wide border around the picture area, praised by commenters as breaking the borders
- Results files from Chaos Constructions 2019 list dedicated competitions for ZX Spectrum 640K demo, realtime AY music, ZX graphics and a format called 53c

**Palette.** Black, blue, red, magenta, green, cyan, yellow, white, each in normal and bright intensity (15 distinct colours, since bright black is black). Emulators conventionally render normal intensity at about 84 percent (\#D7 per channel, for example \#0000D7, \#D70000, \#D7D700) and bright at \#FF; treat the exact hex values as convention. Bright applies to the whole cell, ink and paper together.

**Lettering.** 8x8 pixel characters on the 32-column grid, one ink and one paper per character cell, so coloured text is naturally block-highlighted. Larger logos are built from whole cells or drawn in pixels but coloured per cell. Draw an original 8x8 font.

**Motion.** Cells change colour in steps, never smoothly: colour-cycling plasmas, rotating tunnels and twisters at cell resolution, scrollers that move in pixels while their colour bands stay locked to the grid, and bars moving through the border.

**As a README header.** An SVG banner built on the real grid: 32 cells wide by 8 to 12 cells tall, inside a plain coloured border. The project name is set in large letters made of whole cells or 8x8 pixel glyphs, in bright white on black; behind or beside it a cell-resolution plasma cycles through the fifteen colours. One line of 32-column text under the logo carries the tagline. Everything below the banner is normal README text.

**How to build it.** A 32x10 grid is 320 rects. Give each a class that selects one of a few shared step-timed colour keyframes and a computed animation-delay, and the grid plays a plasma or tunnel with no script; steps() timing keeps the changes abrupt, as on the hardware. Pixel detail inside cells is one path per colour. Expect 15 to 40 KB. Multicolour bands are just shorter rects. Gigascreen blending should be shown as the static mixed colour, not by flickering.

**Do not copy / caveats.** Reference only: group names, demo titles and pictures are not to be reused, and the Sinclair ROM character set should be replaced by an original 8x8 font. The technique (two colours per cell, bright flag, cell-resolution effects) is free to use. Unconfirmed: I could not reach zxart.ee, so the description of Russian-scene title pictures asked for in the brief is not covered, and my understanding of 53c (pictures made from attributes alone over a fixed chequer pattern, giving 53 blended colours) comes from memory; the sources I opened only confirm the competition name. I did not confirm the nationality of the named groups. Real 50 Hz flicker and fast cycling of saturated primaries are a photosensitivity risk: cycle slowly and honour prefers-reduced-motion.

**References**

- [Wikipedia: ZX Spectrum demos (Eastern European scene, Pentagon as competition machine, multicolour on the 768 attribute cells, border effects, Chaos Constructions)](<https://en.wikipedia.org/wiki/ZX_Spectrum_demos>)
- [Wikipedia: ZX Spectrum graphic modes (32x24 attribute cells, ink/paper/bright/flash bits, 8x1 and 8x2 multicolour, gigascreen, Pentagon modes, border)](<https://en.wikipedia.org/wiki/ZX_Spectrum_graphic_modes>)
- [Wikipedia: Pentagon (clone made by hobbyists across the former USSR, 1989, boards copied 1991-96)](<https://en.wikipedia.org/wiki/Pentagon_(computer)>)
- [Wikipedia: Attribute clash (the two-colours-per-cell rule and how it was worked around)](<https://en.wikipedia.org/wiki/Attribute_clash>)
- [Pouet: top ZX Spectrum productions by thumbs up](<https://www.pouet.net/prodlist.php?platform%5B%5D=ZX+Spectrum&order=thumbup>)
- [Pouet: delightful attributes by Darklite and Offence (2nd, oldskool intro, Revision 2021), praised for designing with the cell limit](<https://www.pouet.net/prod.php?which=88600>)
- [Pouet: aeon by Triebkraft and 4th Dimension (1st at The Ultimate Meeting 2008), comments on primary colours and attribute effects](<https://www.pouet.net/prod.php?which=52355>)
- [Pouet: across the edge by deMarche (1st at Chaos Constructions 2016), comments on multicolour and border effects](<https://www.pouet.net/prod.php?which=68035>)
- [Pouet: Megademica 4K by Serzhsoft (1st, oldskool intro, Revision 2019), chunky attribute tunnels and spirals](<https://www.pouet.net/prod.php?which=81065>)
- [Demozoo: Chaos Constructions 2019, Saint Petersburg, competition list](<https://demozoo.org/parties/3925/>)
- [Chaos Constructions 2019 results file](<https://archive.scene.org/pub/parties/2019/chaosconstructions19/results.txt>)

---

<a name="demo-09"></a>

## demo-09 · Atari 8-bit demo screen: 16-shade GTIA ramps recoloured by display-list interrupts

**Animated SVG** · build: **Easy** · impact: **4/5** · Late 1980s to today; Atari 800XL/130XE; a scene centred on Poland, with parties such as Silly Venture in Gdansk, Lato Ludzikow, Quast and Lost Party

The Atari 8-bit builds its screen from a display list: a program that chooses the graphics mode row by row and can fire an interrupt on any row to change colours. Its GTIA chip adds modes that are only 80 pixels wide but show 16 brightness levels of one hue, or 16 hues at one brightness, from a palette of up to 256 colours. Wikipedia records that Atari was the market leader in Poland in the mid-1980s, and Demozoo describes Taquart, one of the best-known groups on the platform, as of Polish origin. Their Numen (1st at Lato Ludzikow 2002) runs about fifteen minutes and is remembered by Pouet commenters for bump mapping, a 3D fly-by and what they call 256 colours.

**What it looks like**

- Very wide pixels: 80 across the screen, each four times wider than tall, so shaded pictures look like soft horizontal brick work
- Smooth 16-step brightness ramps in a single hue, giving shaded, almost greyscale-photo surfaces on an 8-bit machine
- The hue of that ramp changed from band to band down the screen by display-list interrupts, so one picture passes through several tints
- Backgrounds that are pure vertical gradients, one palette step per scanline, in any of 16 hues
- Mixed-mode screens: a band of wide-pixel shaded graphics, a band of high-resolution text, a band of four-colour bitmap, stacked because every row can choose its own mode
- Small single-colour overlays (the machine's player and missile objects) used to add extra colours or detail on top of a picture, which commenters on Cyberpunk by Lamers single out

**Palette.** 16 hues by 16 luminances: 256 colours in the 16-shade mode, 128 in the others (8 luminances). There are no fixed named colours as on the C64; any hue can be had at any brightness, and exact RGB values depend on the TV standard and the emulator palette. Build it as 16 evenly spaced hues, each with a 16-step black-to-near-white ramp.

**Lettering.** The system font is an 8x8 character set at 40 columns, which can be redefined; demo logos are usually drawn in the wide-pixel shaded modes, so letters have thick, stepped, softly shaded strokes. Draw an original set.

**Motion.** Colour washes: the hue bands slide vertically or rotate through the hue wheel while the picture stays still; rasters roll through text; shaded objects rotate at low horizontal resolution.

**As a README header.** An SVG banner whose background is a stack of horizontal bands, each a 16-step ramp in a different hue. The project name sits across it in fat 4:1 pixels shaded in 16 levels, taking its tint from whichever band it crosses. Under the logo band, a strip of 40-column text on a plain dark hue carries the tagline, imitating a mode change halfway down the screen.

**How to build it.** The whole look is rectangles: 4-unit-wide by 1-unit-tall rects in 16 grey levels for the logo, under a multiply or colour blend layer of hue bands, or simply pre-tinted. Animating the bands is one translateY loop on the tint layer or an animated hueRotate. Keep the logo on an 80-column pixel grid for authenticity. A few kilobytes.

**Do not copy / caveats.** Reference only: no group names, demo titles or the Atari logo and system font. Per-scanline colour changes and the ramp modes are hardware features anyone may imitate. It differs from the C64 and Amiga entries in that colour here is a continuous ramp and changes by row as a matter of course, not a fixed 16-colour palette with bars as decoration. I did not see clear screenshots; the description rests on the hardware documentation and on Pouet comments, and the party locations other than Silly Venture (Gdansk, per Demozoo) are unverified. Pouet and Demozoo list Numen's credits slightly differently.

**References**

- [Wikipedia: Atari 8-bit computers (ANTIC display list, per-row modes and interrupts, 128/256 colour palette, market leader in Poland)](<https://en.wikipedia.org/wiki/Atari_8-bit_computers>)
- [Wikipedia: CTIA and GTIA (the three GTIA modes: 16 shades of one hue at 80 pixels wide, 9 colours, 15 hues at one luminance)](<https://en.wikipedia.org/wiki/CTIA_and_GTIA>)
- [Pouet: Numen by Taquart, 1st at Lato Ludzikow 2002](<https://www.pouet.net/prod.php?which=9044>)
- [Demozoo: Numen (credits, about 15 minutes long, tags bump-mapping, phong, torus, rubik)](<https://demozoo.org/productions/53320/>)
- [Demozoo: Taquart (Polish origin, members, the group's own interlace picture mode)](<https://demozoo.org/groups/2260/>)
- [Pouet: Cyberpunk by Lamers, 1st at Silly Venture 2014, comments on pixel graphics and sprite overlays](<https://www.pouet.net/prod.php?which=64615>)
- [Pouet: top Atari XL/XE productions by thumbs up](<https://www.pouet.net/prodlist.php?platform%5B%5D=Atari+XL%2FXE&order=thumbup>)
- [Pouet: Mona by Ilmenit, a 256-byte picture built from 64 pseudo-random brush strokes](<https://www.pouet.net/prod.php?which=62917>)
- [Forever 2019 results file with its Atari section and a 'raster award'](<https://archive.scene.org/pub/parties/2019/forever19/results.txt>)

---

<a name="demo-10"></a>

## demo-10 · Amstrad CPC demo screen: Mode 0 fat pixels, three-level RGB, full overscan

**Animated SVG** · build: **Medium** · impact: **3/5** · 1988 to today; Amstrad CPC 464/6128, a machine sold with its own monitor across the UK, France, Spain and Germany; a scene with deep French roots (Logon System have been releasing since March 1988)

The CPC has no sprites and no copper: a 6845 video controller and a gate array, three modes, and 27 colours made from three levels of red, green and blue. Its demos are recognisable by double-wide 16-colour pixels, by pictures that spill into the border to fill the whole tube, and by colour splits timed in the middle of a line. Logon System, a French group on Demozoo's records since 1988, placed 2nd in oldskool demo at Revision 2017 with a 32k production that commenters said looked like an Atari ST; Batman Forever by Batman Group (1st at Forever 2011) is praised on Pouet as running entirely in overscan.

**What it looks like**

- Mode 0: 160x200 with 16 colours, so every pixel is twice as wide as it is tall; logos and pictures have a chunky, brick-like grain
- A palette of exactly 27 colours in which each channel is off, half or full, giving many muted half-tone colours (olive, teal, plum, mid grey) beside the pure primaries
- Mode 1 alternative: 320x200 with only 4 colours, stretched to 10 or 12 by changing inks at fixed screen positions (split rasters), which the coder of From Scratch describes in the Pouet comments
- Overscan: the picture extends over the border on all sides; Pouet screenshots of CPC demos are about 384x270 instead of 320x200
- Horizontal raster bands and mid-line colour splits used as backdrop and as a way to add colours
- Heavy ordered dithering in the pixel art to bridge the coarse three-level palette

**Palette.** 27 colours: every combination of 0, 50 and 100 percent on red, green and blue (\#000000, \#000080, \#0000FF, \#800000 ... \#FFFFFF). Mode 0 uses 16 of them at once, Mode 1 four. The coarse screenshot maps I made of Batman Forever, From Scratch and phX show deep blues with white highlights, violet and navy on black, and red and orange with plum, all consistent with those three levels.

**Lettering.** System text is 8x8 characters at 20, 40 or 80 columns depending on mode; in Mode 0 that means very wide 20-column letters. Demo logos are hand-pixelled in double-wide pixels with dithered shading. Draw an original font.

**Motion.** Scrollers and rasters moving at 50 Hz, colour splits sliding horizontally, and full-screen plasma or rotation at double-wide pixel resolution.

**As a README header.** An SVG banner with no border at all (that is the point of overscan): a dithered Mode 0 logo in double-wide pixels over a background of raster bands, using only the 27 colours. A single scroller line or a static tagline in wide 8x8 type runs along the bottom. Below it, normal README text.

**How to build it.** Technically simple (2x1 rects, flat fills, translate animations), but the look depends on hand-dithered pixel art in a fixed palette, which has to be drawn or generated with an ordered-dither routine; that is where the effort goes. Merge runs of same-coloured pixels into paths to keep a 160-pixel-wide dithered logo under about 60 KB.

**Do not copy / caveats.** Reference only: no group names, titles or the Amstrad name and logo. The hardware traits are free to imitate. Only Logon System's nationality is confirmed (Demozoo); I could not reach cpcwiki (403) or a CPC-specific history, so the French-scene framing rests on that one group plus Wikipedia's note that France was a core market, and I did not confirm where Batman Group, Vanity or Condense are from. To an outsider this is the least distinctive of the four platform looks: without the double-wide pixels and the half-level colours it reads as generic 8-bit.

**References**

- [Wikipedia: Amstrad CPC (modes 0/1/2, 27-colour three-level palette, CRTC reprogramming for larger screens, markets, bundled monitor)](<https://en.wikipedia.org/wiki/Amstrad_CPC>)
- [Demozoo: Logon System (France, active since March 1988)](<https://demozoo.org/groups/46351/>)
- [Pouet: Logon's Run by Logon System, 2nd in oldskool demo at Revision 2017](<https://www.pouet.net/prod.php?which=69651>)
- [Pouet: Batman Forever by Batman Group, 1st at Forever 2011, comments on full overscan](<https://www.pouet.net/prod.php?which=56761>)
- [Pouet: From Scratch by Vanity (2009), comments on Mode 1, overscan and split rasters](<https://www.pouet.net/prod.php?which=53596>)
- [Pouet: phX by Condense, 2nd in oldskool demo at Revision 2018, comments on colour and overscan](<https://www.pouet.net/prod.php?which=75725>)
- [Pouet: top Amstrad CPC productions by thumbs up](<https://www.pouet.net/prodlist.php?platform%5B%5D=Amstrad+CPC&order=thumbup>)

---

<a name="demo-11"></a>

## demo-11 · Apple II crack screen: six-colour hi-res panels and 40-column credits

**Text / ASCII + SVG** · build: **Easy** · impact: **4/5** · About 1981 to the mid-1980s; Apple II, II+ and IIe; North American BBS pirate groups. Dated screens in the textfiles.com archive run from 1982 to 1985, and Pouet lists a crack screen from September 1981

The oldest layer of the whole tradition. The introduction to the textfiles.com archive explains that Apple II pirates began giving themselves group names and turning a program's splash screen into a credit: who cracked it, who is thanked, which bulletin board to call. It suggests around 1981 as a starting point and calls the screens a likely root of the later art scenes. The archive holds 794 captures, in colour and in monochrome. Wikipedia's crack-intro article likewise places the first ones on the Apple II. Unlike the C64 and Amiga entries there is no music, no scroller and usually no animation: it is a still title card.

**What it looks like**

- Layout A, seen in the captures: a black screen with the release title in large block capitals, each word or letter in a different one of the hi-res colours, and small white credit lines centred beneath
- Layout B: stacked rectangular panels, each with a thick frame in one solid colour (blue, orange, green, violet) and white text inside
- Layout C: the game's own title picture with a credit line added over or under it
- Layout D: a bare 40-column text screen of centred lines, rendered green-on-black in the monochrome captures
- A fixed vocabulary in the archive's captions: presents; cracked, kracked or broken by; brought to you by; distributed by; thanks or thanx to; and the group's name for the release as its 'ware'
- Colour fringing: on a hi-res screen white text picks up green and violet edges because colour depends on pixel position
- Handles instead of names, usually with a definite article, and a bulletin-board name as the only contact

**Palette.** Six hi-res colours: black, white, green, violet, orange and blue, where green and orange can only appear on odd columns and violet and blue on even ones. In the archive's emulator captures these come out as roughly \#00FF00, \#FF00FF, \#FF9900 and \#0000FF. Monochrome variant: phosphor green on black. Lo-res mode offers 16 colours at 40x48 blocks.

**Lettering.** 40-column text, 24 rows. Hi-res pages are 280x192, stored as 40 seven-pixel bytes per row, so drawn lettering sits on a seven-pixel rhythm and effective colour resolution is 140 across. Titles are chunky block capitals a few cells tall; credits are small capitals. The original machines' text was capitals only with inverse and flashing variants (general knowledge, not from the pages I opened).

**Motion.** Essentially static. If anything moves it is a flashing line or a slow colour change; the modern Apple II demos on Pouet are a separate, much later development.

**As a README header.** A 280x192-proportioned SVG card on black: the project name in block capitals, each word in a different hi-res colour with a faint green or violet fringe, inside one or two thick colour-framed panels. Under it, in a &lt;pre&gt; block at exactly 40 columns, centred capital credit lines using the period's verbs: PRESENTS, WRITTEN BY, THANKS TO, DISTRIBUTED BY. The monochrome variant needs no SVG at all: the 40-column text alone, which is the narrowest text header in the catalogue and fits a phone.

**How to build it.** Flat rectangles and block letters in six colours; the fringe is a one-pixel offset duplicate in green or violet. Keep shapes on a 7-pixel horizontal module for authenticity. A static SVG of a few kilobytes; a single blinking line via a steps() opacity animation is the only motion worth adding.

**Do not copy / caveats.** Reference only: do not reuse any group or cracker handle, board name or the Apple name and logo, and do not present a project as a crack of someone's software; use the layout for credits, not the piracy framing. The panel layouts and colour rule are free to imitate. I inspected eight captures as coarse colour maps, not as readable images, so the four layouts are reliable as structure but fine detail is not. I could not open 4am's write-ups (the Wikipedia URL I tried does not exist and the archive.org collection page returned no description), so nothing here relies on them. The capitals-only claim is from general knowledge.

**References**

- [textfiles.com: Apple II crack screens archive, with Jason Scott's introduction and 794 captioned captures](<http://artscene.textfiles.com/intros/APPLEII/>)
- [Capture with stacked colour-framed panels (Apple Mafia credit screen)](<http://artscene.textfiles.com/intros/APPLEII/amaf.gif>)
- [Capture with a multi-coloured block title over white credit lines (Tass Times in Tonetown)](<http://artscene.textfiles.com/intros/APPLEII/tasstimesc.gif>)
- [Capture of a plain monochrome text credit screen (Agent USA)](<http://artscene.textfiles.com/intros/APPLEII/agentusa.gif>)
- [Wikipedia: Apple II graphics (280x192 hi-res, six colours, 7-pixel bytes, odd/even colour rule, 40x48 lo-res, mixed mode with four text lines)](<https://en.wikipedia.org/wiki/Apple_II_graphics>)
- [Wikipedia: Crack intro (first appeared on the Apple II in the late 1970s or early 1980s)](<https://en.wikipedia.org/wiki/Crack_intro>)
- [Pouet: a September 1981 Apple II crack screen credited to The Pirate, with comments on how early cracks carried only a text line](<https://www.pouet.net/prod.php?which=33926>)
- [Pouet: Apple-Vision by Bob Bishop (1978), a very early Apple II demo with music, scroller and animation](<https://www.pouet.net/prod.php?which=54410>)
- [Pouet: Apple II Megademo by VMW Productions (1st at Demosplash 2018), mixing text, lo-res and hi-res mid-screen](<https://www.pouet.net/prod.php?which=78718>)

---

## Research notes

- Count: the computed task asked for 7-10 styles in the brief, 6-10 in the rules and 2-5 in its last line. I returned 11 because the brief's four parts each required specific entries. If the orchestrator must cut to 5, my ranking is: (1) Demoparty results.txt, (2) ZX Spectrum attribute-grid demo screen, (3) PC demo opening titles and credit cards, (4) 256-byte intro bit-pattern textures, (5) Apple II crack screen. The weakest are the tiny-intro info file (wow 2) and the Amstrad CPC screen (wow 3, least distinctive to outsiders).
- WebSearch was unavailable for the whole run (session search budget already used: 200 of 200), so everything came from direct fetches of known or guessed URLs. That limited discovery of specialist write-ups.
- sizecoding.org: now confirmed reachable, but only over plain http with a browser user agent (https and the WebFetch tool both fail with a closed socket). Main page, the Memories case study, the design-tips page and the DOS page were read.
- Apple II archive at artscene.textfiles.com/intros/APPLEII: now confirmed reachable. It has an introduction by the site's owner and 794 captioned GIFs (colour and monochrome variants).
- Unreachable or empty: zxart.ee (connection failed twice), cpcwiki.eu (HTTP 403), speccy.info (403), Wikipedia page for 4am (404 at the URL tried), archive.org 4am collection (no description returned), files.scene.org 1997 Assembly results (404). Consequently: no description of Russian-scene ZX title pictures, no CPC-specific scene history, nothing from 4am.
- Images: the built-in browser could not capture screenshots (pane not compositing in a background tab, and the foreground tab is shared with other agents), so I inspected images in memory as coarse colour maps (dominant colours plus an 80x30 character grid). That is reliable for palette and gross layout, not for detail. No image or archive file was saved to disk. Helper scripts are in C:\\Users\\luked\\AppData\\Local\\Temp\\claude\\D--python-README-NFO\\ceb24e23-4d50-4a3b-af92-9f302ce95521\\scratchpad (peek.py, pshot.py, t.py).
- Strongest primary sources found: the Second Reality source tree (PARTS list of 20 named parts with coders, opening-title and credits code with the on-screen text, the 732-line READ.ME, the exit text), seven real results.txt files spanning 1993-2023, the Assembly 1994 invitation text, ten real 256-byte intro info files from Revision 2023, and the Wuhu party-system source for both the results text format and the beamer slide fields.
- Contested or inconsistent facts: Second Reality's date is 30 July 1993 (party showing) and October 1993 (release) on Wikipedia, 31 July 1993 on Demozoo, October 1993 on Pouet. Numen's credits differ slightly between Pouet and Demozoo. The Second Reality repository is Unlicense/public domain per its README, while the original 1993 READ.ME calls the demo freeware to be distributed unmodified; I advised treating the artwork as not reusable.
- Unconfirmed items, flagged in the relevant caveats: the meaning of the ZX '53c' graphics format (only the competition name is confirmed); how shade bobs work (only the name and its presence in Unreal are sourced); the default VGA palette layout; Apple II capitals-only text; nationalities of most ZX and CPC groups (only Logon System = France and Taquart = Polish origin are confirmed via Demozoo); the claim that tiny intros put their whole source in the NFO (not seen in the ten files read). Single-source attributions: tube by 3SC at Syndeecate 2001 and Puls by Rrrola at Riverwash 2009 rest on Pouet alone.
- Useful technique finding for the builders: the XOR texture is exactly the weighted sum of eight checkerboard patterns (cell sizes 1 to 128), and the Sierpinski AND pattern is exactly the product of eight quadrant-masked tiles, so both classic 256-byte looks can be built from SVG &lt;pattern&gt; elements with additive or multiply blending and no bitmap. Fire is feasible with feTurbulence plus a feComponentTransfer palette table but refilters every frame; true voxel flight, accumulating shade bobs, Mandelbrot zooms, and ray-marched 256-byte and 4k scenes are not possible without scripts.
- Overlap check against the existing catalogue: shade bobs partly overlap the existing 'Bobs and dot objects' entry and the rotozoomer/tunnel/plasma parts of PC demos are already covered, so I did not give those their own entries. The ZX entry is about moving effects in the attribute grid, not the tape loader already listed. The PC READ.ME entry is a typed, paged document with no logo art, which is how it differs from the existing scene-NFO style.
- Privacy: the Second Reality READ.ME and the archived Assembly 1994 invitation contain real names, a home address and phone numbers. None are reproduced here and the tool should never copy them.
