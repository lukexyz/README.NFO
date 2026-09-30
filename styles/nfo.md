# NFO and ASCII art schools

<sub>Generated from <code>styles.json</code> by <code>tools/build-styles.mjs</code>. 11 styles, researched 2026-09-30. Checked by a second reviewer, who made 27 corrections. [Back to the catalogue](README.md) · [Full index](INDEX.md)</sub>

## Reviewer's summary

Checked against the sources: every one of the 67 reference URLs in the research is live, and I re-read the NFO, DIZ, colly, font and RTTY files themselves (decoded from CP437 or Latin-1). Most descriptions hold. The biggest error is about Razor 1911: the research said the group has no single NFO look and that it could not find the modern template. It has one, and it has barely changed in 30 years. Razor 1911's own release NFOs of October 2000, November 2011 and March 2023 all open with the same brush-script logo signed by JED of ACiD that appears in the group's NFO of June 1994, followed by a plain single-line box, tilde-underlined headings and a small triangle emblem. Fairlight does the same with its JED logo (in ACiD's August 1992 pack, in a Fairlight NFO of October 1993, and still tagged JED in March 2011). That is the 'Razor 1911 one' the owner asked for, and it is now style 1.

The family divides by character set and by the font the art was drawn for. (a) PC 'block' or 'high ASCII' uses the CP437 blocks and shades and decorated release NFOs: a flat brush school (JED), a shaded school with fades and debris (Superior Art Creations: Roy, Hetero, Creature of Hell who signs cH, Ferrex, nerv), and a poster school where a full shaded painting precedes the text (SKIDROW 2011, Ix's 133-column Paradox file). (b) 7-bit outline work: on the Amiga, drawn for Topaz from slashes, underscores and pipes, first as 45-column 'description' logos (the group Art: Rotox, Enforcer, Rat, Rip!; Skin) and then as full-width Latin-1 logos published in collys (Desoto, Stylez, stRAtOS, Mortimer Twang, Skin; crews DeZign, Arclite, Low Profile, Contra, Mo'Soul); on the PC, a minority of NFOs used the same outline manner with dot-leader field rows. (c) PC 'newschool' ASCII (Remorse 1981 and rivals) fills letters with dollar signs. (d) Outside the scene: generated FIGlet/TOIlet banners, Usenet line art (Joan Stark, 'jgs'), and teletype/typewriter pictures. The FILE\_ID.DIZ is a format constraint (45 by 10) that cuts across all of them.

For GitHub the rule is: 7-bit styles survive as plain text; block styles should be drawn as SVG geometry from the character grid, because GitHub's pre block is font-size 85% with line-height 1.45 (confirmed in the github-markdown-css copy of GitHub's stylesheet), which leaves a gap between rows of full blocks. Eleven styles are returned: ten checked and corrected, one added (poster NFO), one dropped (Shift\_JIS art and kaomoji). Defacto2 is still unreadable from here (HTTP 403 bot check), so nothing rests on it.

## Styles

| ID | Style | Medium | Build | Impact |
| --- | --- | --- | --- | --- |
| [nfo-01](#nfo-01) | PC NFO: brush-script block logo (the Razor 1911 and Fairlight look, after JED) | Text + SVG | Medium | 4/5 |
| [nfo-02](#nfo-02) | PC NFO: shaded block logo with fades and debris (SAC school) | Animated SVG | Medium | 5/5 |
| [nfo-03](#nfo-03) | Poster NFO: full-canvas shaded illustration with the text set inside it | Animated SVG | Hard | 5/5 |
| [nfo-04](#nfo-04) | 7-bit outline NFO with dot-leader fields | Text | Easy | 3/5 |
| [nfo-05](#nfo-05) | FILE\_ID.DIZ miniature | Text | Easy | 2/5 |
| [nfo-06](#nfo-06) | Amiga description logos: compact Topaz outline (1992-94) | Text + SVG | Medium | 4/5 |
| [nfo-07](#nfo-07) | Amiga colly era: full-width Latin-1 logos and page layout | Text + SVG | Medium | 4/5 |
| [nfo-08](#nfo-08) | PC newschool ASCII: dollar-fill blob lettering (Remorse 1981 school) | Text | Medium | 3/5 |
| [nfo-09](#nfo-09) | FIGlet and TOIlet generated banners | Text | Easy | 2/5 |
| [nfo-10](#nfo-10) | Usenet line art and the signed picture (jgs school) | Text | Medium | 3/5 |
| [nfo-11](#nfo-11) | Teletype, line-printer and typewriter pictures | Animated SVG | Medium | 3/5 |

---

<a name="nfo-01"></a>

## nfo-01 · PC NFO: brush-script block logo (the Razor 1911 and Fairlight look, after JED)

**Text + SVG** · build: **Medium** · impact: **4/5** · 1992 to the present, PC release scene. Logos drawn 1992-94 by JED of ACiD in the BBS era; Razor 1911 and Fairlight still ship them (files checked: 1993, 1994, 2000, 2011, 2023).

By 1992-93 release groups were commissioning ANSI-group artists for a logo above the typed NFO (the NFO itself dates to a Humble Guys release of January 1990). JED of ACiD drew flat, unshaded brush-script logos for Fairlight and Razor 1911; both groups kept them, so this silhouette is what most people picture as 'a Razor NFO'. It differs from the tool's existing NFO style in being a hand-lettered script silhouette with an oversized initial, not upright block capitals.

**What it looks like**

- Flat silhouette: strokes built only from full blocks, with upper-half, lower-half, left-half and right-half blocks finishing the ends; no shade characters anywhere in the logo
- Script construction: one oversized capital 12-15 rows tall whose leg or tail runs under the rest of the word; the following letters are 6-8 rows tall, joined along the baseline, with stems 3 cells wide and thin joins made from half-width blocks
- Diagonals step one cell per row and each step carries a half block on its outer edge, so curves look brushed instead of staircased
- Two-tier composition in the 1994 file: four 6-row numerals sit on the top line and the script word hangs beneath, the big initial overlapping both tiers
- House frame in the 2000, 2011 and 2023 files: a one-cell contour of half blocks traced around the whole word one cell away from the letters, like a die-cut sticker; the numerals become a letter-spaced caption at lower right beside the artist tag
- Hollow variant: the same kind of letterform drawn only as a half-block contour with empty interior (JED's Fairlight logo in ACiD's August 1992 pack; Drink or Die's two ring letters, March 1996; the Deviance logo of October 2003 signed asC/Strick9 sets a solid core inside a separate contour with a one-cell gap)
- Info panel straight under the logo at 78 columns: double verticals with single horizontals in Razor 1994; two columns split by a narrow three-line gutter with labels right-aligned to the colon in Fairlight 1993; plain single-line box with 'Label: value' pairs in Razor 2000-2023
- Below the box: plain-text headings underlined by a row of tildes of the same length, a one-line greets paragraph, a small centred 7-bit emblem with the group name and founding year either side, and a two-line 'support the authors' notice in capitals

**Palette.** Monochrome. In DOS this was light grey on black; for SVG use \#AAAAAA (or \#C0C0C0) on \#000000 and at most one accent. As README text it simply takes the viewer's theme colours.

**Lettering.** Hand-lettered script built from the five CP437 block shapes. Eight to nine letters fit in 78 columns. Counters are one or two cells. Captions are letter-spaced digits or capitals. Body text is ordinary DOS text at a one-space or two-space indent, 76-78 columns, headings underlined with tildes or equals signs.

**Motion.** Static as text. In SVG: the word writes on left to right in column steps (a cover rectangle sliding away with a stepped timing function, or a clip rectangle whose width steps through 78 values), the contour frame traces last, a block cursor blinks after the 'presents' line, then the info box appears line by line as a 2400-baud terminal would draw it.

**As a README header.** Above the fold: the project name as a 14-16 row brush-script silhouette at 78 columns inside a contour frame, a letter-spaced caption (version or year) at lower right, then one single-line box whose two columns hold date, version, licence and platform in place of supplier and protection. Tilde-underlined headings lead into the normal Markdown. Logo and box are one SVG; the same grid can be offered as text in a collapsed details block for copy and paste. Greets become contributors; the emblem is the project's own mark.

**How to build it.** Rendering is easy and font-free: treat the art as an 80-column grid of 8 by 16 unit cells and emit SVG geometry, one subpath per horizontal run of full blocks, half-height runs for upper and lower halves, half-width for left and right halves, thin rectangles for box lines, with shape-rendering crispEdges. An 80 by 25 screen is at most 2,000 cells and merges to a few hundred runs, which I estimate at 10-25 KB (not built or measured here). Stepped reveal works with CSS keyframes or SMIL; no script needed. The harder part is lettering: a script logo for an arbitrary name needs either a hand-designed joined alphabet with an oversized-initial form per letter, or a build-time step that rasterises a bold open-licensed script font to a 78 by 2N one-bit grid and maps each vertical pixel pair to full, upper-half, lower-half or empty. As plain text it stays legible but GitHub's 1.45 line-height puts a gap between rows, so solid strokes turn into stripes (arithmetic from the stylesheet, not tested on a live README). Keep body text as real Markdown: at phone width an 80-column SVG shrinks each cell to about 4.5 px.

**Do not copy / caveats.** Do not trace or imitate the actual Razor 1911 or Fairlight letterforms, their names, the founding-year line, the triangle emblem or JED's tag: those are the groups' identity. What is free to reuse is the technique: flat half-block brush lettering, an oversized initial, a contour frame, a single-line two-column box, tilde-underlined headings. Field names come from software piracy releases, so rename them. Who is behind the tags -BS- and asC/Strick9 was not confirmed beyond the tags themselves. Eight or nine letters is the practical limit per line. Give the img an alt text and the SVG a title.

**References**

- [Razor 1911 docs NFO, version line dated 06/13/94; brush logo tagged JED of ACiD; double-walled boxes](<http://artscene.textfiles.com/asciiart/NFOS/razor.nfo>)
- [Razor 1911 release NFO dated 30 October 2000: the same JED logo inside a contour frame, single-line box, tilde headings, triangle emblem footer (direct text file)](<https://www.srrdb.com/download/file/4x4_Evolution-Razor1911/rzr-4x4.nfo>)
- [Razor 1911 release NFO dated 2011-11-10, same template (direct text file)](<https://www.srrdb.com/download/file/The_Elder_Scrolls_V_Skyrim-Razor1911/rzr-skrm.nfo>)
- [Razor 1911 release NFO dated 2023-03, same template (direct text file)](<https://www.srrdb.com/download/file/9_Years_of_Shadows-Razor1911/rzr-9yearsofshadows.nfo>)
- [Fairlight trainer NFO dated 10/27/93, logo tagged JED of ACiD, two-column box with right-aligned labels](<http://artscene.textfiles.com/asciiart/NFOS/flt.nfo>)
- [JED's hollow-contour version of the Fairlight logo in ACiD's August 1992 pack](<https://16colo.rs/pack/acdu0892/raw/FLT-ACD2.TXT>)
- [Fairlight release NFO dated 24/03/2011, still carrying the JED logo and tag (direct text file)](<https://www.srrdb.com/download/file/Crysis_2-FLT/fairlight.nfo>)
- [Hetero of SAC, a Razor 1911 brush-script header in the same manner, SAC pack of March 1997](<https://16colo.rs/pack/sac0397a/raw/HT-RZR1.ASC>)
- [Drink or Die NFO, March 1996: two hollow ring letters, letter-spaced lowercase tagline, rules that taper at both ends](<http://artscene.textfiles.com/asciiart/NFOS/dod0396.nfo>)
- [Deviance NFO, October 2003, logo tagged asC/Strick9: solid cores inside separate contours (direct text file)](<https://www.srrdb.com/download/file/MAX.PAYNE.2.THE.FALL.OF.MAX.PAYNE-DEViANCE/deviance.nfo>)
- [JED artist record: released in ACiD, iCE and Mistigris packs, 1990/09 to 1997/07, 119 artworks](<https://16colo.rs/artist/jed>)
- [Origin of the .nfo file: The Humble Guys, Knights of Legend, 23 January 1990](<https://en.wikipedia.org/wiki/.nfo>)
- [A Humble Guys NFO with no art at all, for contrast](<http://artscene.textfiles.com/asciiart/NFOS/trump2.nfo>)

---

<a name="nfo-02"></a>

## nfo-02 · PC NFO: shaded block logo with fades and debris (SAC school)

**Animated SVG** · build: **Medium** · impact: **5/5** · 1992 to the 2010s, PC release scene; from December 1994 dominated by Superior Art Creations (Germany), whose packs on 16colo.rs run 1994/12 to 2009/12

The other NFO school uses the three CP437 shade characters as paint: carved letters, gradients and rubble. SAC was founded in December 1994 at The Party in Herning by Roy, Hetero, Dream Design, Kaethe, Raiser and Toxic Trancer and became the main supplier of NFO and FILE\_ID.DIZ logos to release groups. The same kit, with a small half-block heading font added, is still visible in RELOADED, CODEX and CPY NFOs of 2012-2018.

**What it looks like**

- Tonal ramp used as a gradient: stems that dissolve downward through dark, medium and light shade and then into single dots over four or five rows (TRSI header signed roy, July 1994)
- Two-tone modelling: each stroke has a solid body and a dark-shade band on its shadow side (Paradigm header tagged cH!SAC/PDM, October 1997; 16colo.rs files the cH pieces under Creature of Hell)
- Debris: isolated small squares, half blocks and 2-4 cell shards within about six cells of the logo, plus broken bands of light shade across the full width behind it (Hoodlum header tagged ROY of SAC, August 1995)
- Letter tiles: each letter is a solid slab in its own block frame with a three-step light-to-dark fade in the lower-left corner (CLASS first-release NFO, 8 January 1997, unsigned); or rounded tiles with a dark-to-light inner rim (Roy's 1994 Razor header in his own royart2 pack)
- A pyramid of three triangles, each filled with rows of dark, then medium, then light shade, a letter-spaced 'since' line in the gap, and 6-cell letters with a left-to-right medium-dark-solid ramp (Razor 1911 trainer NFO, 2 October 1992, tagged -BS-)
- Frames that continue the artwork: Ferrex (SAC pack 19, 2000) builds box walls from stacked solid, dark, medium and light cells fading in and out down each margin; Roy (template carrying a release date of 26 November 1999) nests thin single-line boxes with plus, pipe and colon corner ticks and symmetrical light-to-solid-to-light end caps
- Late template kit: section headings set in a three-row mini font built from half blocks, each letter 3-4 cells wide (RELOADED 2012 tagged nERv; CODEX 2016); field rows with leaders, either dots ('value :..... LABEL .. LABEL .....: value') or box-line leaders ending in a small square before the value (CPY 2018)
- Artist tag set into the art at lower right or inside a rule; caption in letter-spaced capitals ('P R E S E N T S' style)

**Palette.** Monochrome with four tones: black plus one ink at roughly 25, 50, 75 and 100 percent coverage through the shade glyphs. In SVG use one colour at fill-opacity 0.25, 0.5, 0.75 and 1, or three small dither pattern tiles to keep the dotted texture of the originals.

**Lettering.** Italic or upright display capitals 8-12 rows tall and 7-10 cells wide with wedge ends cut by half blocks; Ferrex's Razor header uses tall condensed slab letters with a solid-plus-dark column on the left edge; CPY's logo uses tall condensed letters whose feet fade to light shade. Small headings in the three-row half-block font. Body text is plain DOS text.

**Motion.** Static as text. In SVG: a diagonal highlight sweeps across the logo through a gradient mask; debris cells drift a cell or two and fade; the background shade bands scroll slowly sideways; the dissolve at the foot of each letter animates by stepping opacity row by row.

**As a README header.** Above the fold: a 12-16 row shaded logo with debris and a background shade band, a letter-spaced caption, then an info panel whose frame grows out of the logo. README section titles can be rendered as small SVG strips in the three-row half-block font with a rule either side. Everything above the first heading is one SVG; the body stays ordinary Markdown.

**How to build it.** Rendering: character grid to SVG geometry as in the brush style, plus the three shades as fill-opacity or as pattern tiles; gradients, masks and keyframes are all permitted in an SVG shown through img. A full 80 by 25 shaded screen should stay well under 100 KB (estimate, not measured). Drawing is the hard part: shading that reads as form needs a generator with rules (light from upper left, dark band on the right third of each stroke, fade length 3-5 rows, debris density falling with distance) on top of a base alphabet. The three-row half-block heading font is easy: about 40 glyphs on a 4 by 3 grid. As plain text this style fails on GitHub: shade glyphs render as dots, hatching or flat grey depending on the viewer's font and rows separate, so text can only be a fallback.

**Do not copy / caveats.** Artist tags, group names and their logos must not be reproduced; the technique (shade ramps, debris, tiles, shaded frames, mini heading font, leader rows) is free to reuse. Attributions are as signed in the files; -BS- is unidentified, and the CLASS tile logo is unsigned. Heavy debris hurts legibility, so repeat the project name in plain text. The dotted shade texture can shimmer when scaled; test at phone width. Add a reduced-motion rule inside the SVG.

**References**

- [Razor 1911 trainer NFO, 2 October 1992, tagged -BS-: shaded pyramid and gradient letters](<http://artscene.textfiles.com/asciiart/NFOS/razortrn.nfo>)
- [TRSI NFO, release date 07-06-1994, signed roy: letters dissolving into dots (predates SAC's founding)](<http://artscene.textfiles.com/asciiart/NFOS/trsi.nf1>)
- [Hoodlum NFO, 08/31/95, tagged ROY of SAC](<http://artscene.textfiles.com/asciiart/NFOS/hoodlum2.nfo>)
- [Paradigm NFO, 10/20/97, tagged cH!SAC/PDM: two-tone letters and debris](<http://artscene.textfiles.com/asciiart/NFOS/defiance.nfo>)
- [CLASS first release NFO, 8 January 1997: five letter tiles with corner fades (unsigned)](<http://artscene.textfiles.com/asciiart/NFOS/1st.nfo>)
- [Roy, 1994 Razor 1911 header with rounded tiles, from his royart2 pack](<https://16colo.rs/pack/royart2/raw/RAZOR.NFO>)
- [Roy of SAC, Razor 1911 trainer NFO template with nested thin frames, dated Nov 26 1999 (SAC pack 19)](<https://16colo.rs/pack/sac-19/raw/ROY-RZR7.ASC>)
- [Ferrex, Razor 1911 NFO template with shaded frame walls (SAC pack 19, 2000)](<https://16colo.rs/pack/sac-19/raw/Frx-Rzr2.asc>)
- [RELOADED NFO, November 2012, logo tagged nERv: mini half-block headings and dot-leader rows (direct text file)](<https://www.srrdb.com/download/file/Far.Cry.3-RELOADED/reloaded.nfo>)
- [CPY NFO, 2018: tall fading letters and line leaders ending in a small square (direct text file)](<https://www.srrdb.com/download/file/Assassins.Creed.Origins-CPY/cpy-aco.nfo>)
- [SAC group record: 45 packs, 1994/12 to 2009/12, 4,719 artworks, most productive member Roy](<https://16colo.rs/group/sac>)
- [Creature of Hell artist record (the cH tag): SAC and others, 1995/09 to 2009/12](<https://16colo.rs/artist/creature%20of%20hell>)
- [Superior Art Creations: founding, founders, role in NFO art](<https://en.wikipedia.org/wiki/Superior_Art_Creations>)
- [Roy/SAC block ASCII tutorial: character codes 176-178 and 219-223, fades, rounded corners, 79 usable columns](<https://www.roysac.com/tutorial/roy-blockasciitutorial.html>)
- [All 94 items tagged Razor 1911 on 16colo.rs (includes colour ANSIs and images, not only NFO headers)](<https://16colo.rs/tags/content/razor%201911>)

---

<a name="nfo-03"></a>

## nfo-03 · Poster NFO: full-canvas shaded illustration with the text set inside it

**Animated SVG** · build: **Hard** · impact: **5/5** · 2000 to the 2010s, PC ISO-era release scene

The most extravagant NFOs stop being a logo over a text file and become a painting you scroll through: dozens of rows of shaded block art before the first word, with the release details set into gaps in the picture. It is the closest the block school comes to a poster, and the most striking thing in the family.

**What it looks like**

- A figurative or abstract shaded painting about 45 rows tall fills the first two screens before any text (SKIDROW's Portal 2 NFO, 19 April 2011)
- The logo sits at the foot of the painting in tall condensed letters whose stems are vertical ramps, solid at one end and running through dark and medium to light shade at the other
- Group name and slogan repeated beneath as letter-spaced plain text, centred
- Field rows mirrored around a centre marker: value, a run of dots, label, a two-headed arrow, label, dots, value
- Body text runs between two solid pillars three cells wide at the left and right margins, which continue the painting down the page and break into shade fragments at section changes
- Tendril frame: Creature of Hell's Razor 1911 template (SAC pack 20, 2000) runs flame-like strands of dark shade and solid block from the logo down both margins for 60 rows and more, leaving a ragged centre column for text
- Mega-canvas: Ix's Paradox infofile (SAC pack 33, 2005) is 133 columns wide and continuous shading, wider than any 80-column viewer

**Palette.** Monochrome, four tones, as the shaded school. An SVG version can tint the whole canvas with one hue or map the four tones to a two-colour gradient, which the originals could not do.

**Lettering.** The painting dominates; lettering is secondary: tall condensed block capitals with faded stems for the logo, letter-spaced capitals for the name, plain text for everything else.

**Motion.** In SVG: the painting reveals top to bottom in row steps like a slow terminal draw, then holds; optionally a slow light sweep through a gradient mask, or individual shade cells flickering between two tones. A vertical pan of a tall canvas inside a fixed window is possible with a translate keyframe on a clipped group.

**As a README header.** A hero image, not a header strip: one tall SVG (80 columns by 30-45 rows) showing an original shaded picture of the project's subject with the name set into its foot and two mirrored leader rows for version and licence. Everything else is normal Markdown below it. For a factory project the picture is the factory.

**How to build it.** The SVG side is routine: grid to geometry with four tones; 80 by 45 is at most 3,600 cells and should stay under roughly 100 KB after run merging (estimate). An alternative is a tiny embedded data-URI PNG at two pixels per cell scaled up with pixelated rendering, only a few KB; embedded data images are known from generated profile cards but I did not test one on GitHub here. The hard part is the picture: it must be original. A build-time converter can quantise a supplied image to four tones on a half-block grid, but converter output lacks the deliberate edges of hand work, so it needs cleanup rules or an artist. Cannot be shown as README text at all.

**Do not copy / caveats.** Copy no group's painting, logo or slogan; the idea of a full-canvas block painting with text set inside is free. The SKIDROW artist was not identified in the part of the file I read. A tall image pushes real content below the fold, which is a usability cost on a README; cap the height. The 133-column variant is unusable on GitHub. Provide alt text that states the project name and purpose, and a reduced-motion rule.

**References**

- [SKIDROW NFO for Portal 2, 19-04-2011: about 45 rows of shaded painting, faded-stem logo, mirrored dot-leader rows, text between solid pillars (direct text file)](<https://www.srrdb.com/download/file/Portal.2-SKIDROW/skidrow.nfo>)
- [Ix, Paradox infofile, 133 columns of continuous shading (SAC pack 33, 2005)](<https://16colo.rs/pack/sac-33/raw/Ix-paradox.nfo>)
- [Creature of Hell (cH), Razor 1911 NFO template with tendril frame (SAC pack 20, 2000)](<https://16colo.rs/pack/sac-20/raw/CH-RZR.ASC>)
- [CODEX NFO, 05/2016: large shaded emblem with letter-spaced 'presents' lines set into it (direct text file)](<https://www.srrdb.com/download/file/The.Witcher.3.Wild.Hunt.Blood.and.Wine-CODEX/The.Witcher.3.Wild.Hunt.Blood.and.Wine.NFOFiX-CODEX/codex.nfo>)

---

<a name="nfo-04"></a>

## nfo-04 · 7-bit outline NFO with dot-leader fields

**Text** · build: **Easy** · impact: **3/5** · 1997-2014, PC release scene; a minority branch beside the block templates

Some PC groups and divisions used plain keyboard characters instead of CP437 blocks: a slanted outline logo in the Amiga manner over release data set with rows of dots. It reads correctly in any editor or web page, which block art does not. It was never the norm: the mainstream NFOs I opened from 2000 to 2023 are all block art.

**What it looks like**

- Letters as leaning parallelograms drawn with underscore roofs, slash walls and pipe stems; neighbouring letters share a wall
- Roof line drawn on the row above the letter, often with a spike where a slash meets an opening bracket and a run of underscores
- A long rule under the logo that passes through the letters' feet and ends in angle brackets like arrowheads, with the artist's initials set inside the rule
- Field rows built from dot leaders: value, colon, a run of dots, the label in capitals with full stops in place of spaces, then the mirrored pair on the right
- Section headings as letter-spaced capitals joined by full stops, sitting in a notch between two small empty boxes
- Frames from pipes and underscores only, corners marked with a full stop or an apostrophe, one edge left open
- Closing rule that carries a slogan between square brackets and ends in an arrowhead or apostrophe
- Older variant (Quartex, June 1997): outline logo over a plain table drawn with pipes, hyphens and full-stop corners, labels right-aligned to a colon

**Palette.** Monochrome; whatever the viewer's theme gives. No tones, so it survives light and dark themes unchanged.

**Lettering.** Outline italic capitals 6-8 rows tall and 9-12 columns wide, every stroke one character thick. Characters: underscore, slash, backslash, pipe, full stop, colon, apostrophe, backtick, hyphen, angle brackets, exclamation mark as a broken pipe. Body text is sentence case at a two-space indent, 76-78 columns.

**Motion.** static

**As a README header.** A pre block at the very top: 8-10 rows of outline logo, a rule with arrowheads, then four dot-leader rows for version, licence, language and status, then one notched heading leading into the normal Markdown. Links work inside pre when written as HTML anchors. A leader row in my own words: 'v1.4.2 :......... VERSION .. LICENCE .........: MIT'.

**How to build it.** Pure ASCII at 78 columns with no dependence on block glyphs, so it renders alike in every monospace font. The one loss on GitHub is that an underscore and the slash on the next row no longer touch because of the 1.45 line-height; the style tolerates that, since it was already read in Notepad. Inside a Markdown code fence nothing needs escaping but links are impossible; inside an HTML pre block, escape angle brackets and ampersands and links work. An optional SVG twin can draw each character as a stroke in an 8 by 16 cell so the joins close (see the Amiga style). A generator needs only an outline alphabet and a row formatter.

**Do not copy / caveats.** Do not reuse a group's name, slogan or an artist's initials; the layout devices (dot leaders, notched headings, arrow rules) are generic and free. The tag S! also appears on a 1990s Pentagram FILE\_ID.DIZ; whether it is the same artist is not confirmed. The Quartex file fills its header with song lyrics; do not carry that habit over. On a phone 78 columns scrolls sideways.

**References**

- [RELOADED DOX division infofile, 11/2009, rule tagged S!: outline logo, dot-leader fields, notched headings](<https://16colo.rs/pack/sac-36/raw/S%21-rldox.nfo>)
- [nerv, Razor1911 outline logo (SAC pack 36, 2009)](<https://16colo.rs/pack/sac-36/raw/nerv-razor.txt>)
- [sns of SAC, Razor 1911 outline logo with spike roofs (SAC pack 18, 1999)](<https://16colo.rs/pack/sac-18/raw/SNS-RZR.ASC>)
- [Quartex NFO, 06/12/97: outline logo tagged &lt;e&gt; over a pipe-and-hyphen table](<http://artscene.textfiles.com/asciiart/NFOS/redline.nfo>)
- [griskokare, Razor tribute in Amiga style, 2013/2014, with a note recommending Topaz (Impure pack 53, 2014)](<https://16colo.rs/pack/impure53/raw/grk-rzr1.asc>)

---

<a name="nfo-05"></a>

## nfo-05 · FILE\_ID.DIZ miniature

**Text** · build: **Easy** · impact: **2/5** · 1993-2000s, BBS file listings on PC and Amiga

FILE\_ID.DIZ was created by Clark Development for its PCBDescribe utility as a plain description of up to 10 lines of 45 characters, shown automatically in BBS file lists; the shareware guidance said no high ASCII and no formatting. Release groups ignored that from about 1993 and squeezed a logo, a title and a disk counter into the stamp-sized space. It is the scene's business card.

**What it looks like**

- Hard width of 45 columns; the spec says 10 rows and real release examples use 6-9, though art-group packs overran (Remorse's pack 15 DIZ is 39 columns by 19 rows)
- A 4-6 row logo across the full width, then one rule, then two or three centred text lines
- Disk or part counter in square brackets at the end of the title line
- Rule under the logo made of equals signs or hyphens with the artist's initials or a 'presents' word set into it
- Outline variant: underscore roofs and slash walls exactly as in Amiga logos (Razor 1911 and The Humble Guys examples)
- Block variant (INC): solid half-block letters where every empty cell is filled with capital letters, so the negative space is text and hides a message and credits
- Framed variant (Pentagram): arrow rules of angle brackets and equals signs above and below, columns of colons padding both sides of the logo

**Palette.** Monochrome text in the viewer's theme.

**Lettering.** Compressed outline or block capitals 4-5 rows high, each letter 6-8 columns wide, five or six letters at most. Title lines in capitals; the counter numeric, as \[1/4\].

**Motion.** static

**As a README header.** A small centred card, not a full header: 45 columns, a 5-row logo, one rule, a one-line description and the version as a bracketed counter. It suits a package README, a release note, or a badge-sized companion to a larger header from another style.

**How to build it.** 45 columns fits a phone without sideways scrolling. Use the outline variant for text; if the block variant is wanted, render it as SVG geometry. A generator needs a 5-row outline alphabet at about 7 columns per letter and a centring rule. Keep to 45 by 10 or it stops being a DIZ.

**Do not copy / caveats.** Small and quiet; it will not stop anyone scrolling. Do not copy group names, slogans or initials; the format and its layout are free. The tags aBn, RD and S! are unidentified.

**References**

- [Razor 1911 FILE\_ID.DIZ: 5-row outline logo tagged aBn, rule, title with disk count, 45 columns](<http://artscene.textfiles.com/asciiart/NFOS/razor.diz>)
- [Two early Razor DIZ tags, one with a slogan line](<http://artscene.textfiles.com/asciiart/NFOS/razor92.diz>)
- [The Humble Guys DIZ with outline logo tagged RD and a disk counter](<http://artscene.textfiles.com/asciiart/NFOS/file_id.thg>)
- [INC DIZ: block letters with capitals filling the gaps](<http://artscene.textfiles.com/asciiart/NFOS/file_id.inc>)
- [Pentagram DIZ framed by arrow rules, tagged S!](<http://artscene.textfiles.com/asciiart/NFOS/classic.diz>)
- [Remorse pack 15 DIZ, September 1997 (39 by 19, over the spec)](<https://16colo.rs/pack/rmrs-15/raw/FILE_ID.DIZ>)
- [The FILE\_ID.DIZ FAQ (Richard Holler, v1.9, 1994) with Roy's note that warez groups used high ASCII from 1993](<https://www.roysac.com/file_iddesc.html>)
- [Gleb J. Albert, WiderScreen 1-2/2017: the DIZ as release packaging, 45 wide and 10 to 15 lines in practice](<https://widerscreen.fi/?p=3603>)

---

<a name="nfo-06"></a>

## nfo-06 · Amiga description logos: compact Topaz outline (1992-94)

**Text + SVG** · build: **Medium** · impact: **4/5** · 1992-1994, Amiga BBS scene. Wikipedia dates the Amiga ASCII scene to 1992 and names Art, Epsilon Design, Upper Class and Unreal (later DeZign) among the first groups.

The Amiga character set is ASCII plus Latin-1 with no block or box characters, and Topaz is spaced so tightly that an underscore followed by a slash looks like one line, so Amiga artists drew logos as outlines. They began as file-description logos drawn while uploads ran (Rotox's own account, quoted by Albert). Art's 'Description Art Volume One!' holds 66 of them by Rotox, Enforcer, Rat and Rip!. Albert likens the result to graffiti throw-ups.

**What it looks like**

- Drawn almost entirely from underscore, slash, backslash and pipe, with colon, full stop and hyphen as accents; Skin told Lotvonen he never uses more than ten characters
- Logos 40-45 columns wide and 5-6 rows high, the size of a file description
- Letters share walls and lean, so the word reads as one folded ribbon instead of separate glyphs
- A peak made of slash and backslash breaking the roof line once or twice per logo
- A base rule that runs through the letters' feet, ends in angle brackets, and carries the artist's three-letter tag
- One colon or a short dotted stub poking above the roof as an ornament; the not sign and middle dot appear as small corner marks
- A caption line after each logo: artist in square brackets, a long dashed arrow, then the client's name

**Palette.** Monochrome. No period colour was verified; archive viewers add their own site theme. Choose any single ink on a dark ground for SVG.

**Lettering.** Outline capitals with open counters; horizontals are underscores on the row above, verticals are slashes so everything leans. Drawn for Topaz; the modern remade scene fonts (Topaz, MicroKnight, P0T-NOoDLE, mO'sOul by dMG) use an 8 by 16 cell. Artist tags are lowercase with one punctuation mark.

**Motion.** Static as text. In SVG with the stroke-per-character method: the outline draws itself stroke by stroke (dash offset running from full to zero) and the base rule shoots out to both margins last.

**As a README header.** Above the fold: the project name as a 45-78 column outline logo 5-7 rows high, a base rule carrying the maintainer's tag, and a bracketed caption line with an arrow to the project's one-line description. Works as text in a code fence; an SVG twin closes the joins and can animate.

**How to build it.** As text it is legible but not seamless: GitHub's monospace fonts and 1.45 line-height leave gaps where an underscore meets a slash, and the cell is taller than Topaz's (the research estimated a fifth to a quarter; not measured). The faithful SVG route needs no font: place each character in an 8 by 16 cell and draw it as a stroke, underscore as the cell's bottom edge, slash and backslash as the cell's diagonals, pipe as a centre vertical, hyphen as a mid horizontal, dots as short strokes. Ends then meet exactly at cell corners, which reproduces the Topaz join, and a path with a normalised length animates as a draw-on. This is my proposed method and was not built here. Tags and captions need a few pixel glyphs of your own or plain SVG text. Embedding the remade Topaz as a data-URI font is possible in principle but adds weight and brings a GPL font into the file; not tested on GitHub. Drawing needs an outline alphabet with shared-wall rules, which is the real work.

**Do not copy / caveats.** Do not copy logos, group names or artists' tags; outline lettering from slashes and underscores is free. The remade fonts are copyright their designers and dMG under GPL with font exception; original Topaz belongs to the Amiga rights holders. Sources disagree on the first collection's date: asciiarena says 1993, Lotvonen says Art's 1992 'Collection volume 1' gave the colly its name. The style is deliberately hard to read, so print the name in plain text beneath. Backslashes and underscores need a code fence or pre block.

**References**

- [Art, 'Description Art Volume One!': 66 logos by Rotox, Enforcer, Rat and Rip! (dated 1993 by the archive)](<https://www.asciiarena.se/release/art01.txt>)
- [Skin (Germany; Dytec, Fantasy Project, Unreal, DeZign): releases from 1992 to 2022](<https://www.asciiarena.se/artist/skin>)
- [Enforcer (Art, Germany) artist record](<https://www.asciiarena.se/artist/enforcer>)
- [Rotox (Art, Anthrox, Capital; United Kingdom) artist record](<https://www.asciiarena.se/artist/rotox>)
- [Heikki Lotvonen's thesis on Amiga ASCII: character set, Topaz joins, colly structure, interviews with Skin (Michael Hischer) and h7 (Antti Kiuru)](<https://blog.glyphdrawing.club/amiga-ascii-art/>)
- [Gleb J. Albert, WiderScreen 2017: outlines compared to graffiti throw-ups, Topaz spacing, Rotox on drawing during uploads](<https://widerscreen.fi/?p=3603>)
- [Remade Amiga fonts, 8 by 16 pixels, GPL with font exception, by dMG](<https://github.com/rewtnull/amigafonts>)
- [Amiga or 'oldskool' style summary and first groups](<https://en.wikipedia.org/wiki/ASCII_art>)
- [Roy/SAC on the three scene ASCII styles and why the Amiga font made line art join](<https://www.roysac.com/roy-sac_styles_of_underground_text_art.html>)

---

<a name="nfo-07"></a>

## nfo-07 · Amiga colly era: full-width Latin-1 logos and page layout

**Text + SVG** · build: **Medium** · impact: **4/5** · 1994-1998, with a revival from 2010; Amiga ASCII crews releasing collections ('collys')

By the mid-90s the logo had grown to the full 80 columns and the colly, one text file of logos with title, index, greets and respects, was the unit of competition. asciiarena holds 3,993 of them; its top-rated artists are Skin, Desoto, Enforcer, Stylez and nUP!, its top crews Arclite, DeZign, Low Profile, G-Style and Contra. This is the Amiga answer to 'epic'.

**What it looks like**

- Logos 70-78 columns wide and 8-12 rows tall, letters sheared into long parallelograms whose tails run off into rules
- Latin-1 extras beyond ASCII: the macron as a ceiling line paired with the underscore floor (over 19,000 macrons in Skin's 2013 collection), plus broken bar, not sign, degree, middle dot, copyright sign, inverted exclamation mark
- Fraction or multiplication signs packed together as a dense fill inside an otherwise outline logo (Desoto's 'Cream' for Mo'Soul, 1994, uses the three-quarters sign nearly 2,900 times)
- Captions in inverted case and letter-spaced: first letter lowercase, the rest capitals
- Vertical rails of colons or pipes running for dozens of lines to tie logos together; stRAtOS's 1997 outline collection for Low Profile keeps a dotted column down the page
- Each logo followed by a credit rule with initials, the client and a 'requested by' note
- Fixed document order (Lotvonen): BBS advert, title with artist and crew logos, index, introduction, the logos, credits, greetings, respects
- Later Skin work (DeZign, 2011-2015) builds whole illustrated scenes from the same marks with macron-and-underscore hatching

**Palette.** Monochrome; no period colour verified. For SVG pick one ink on a dark ground.

**Lettering.** Outline capitals with exaggerated horizontals; tops are macrons or underscores on the row above, sides are slashes. Initials as tags. Small text is set in scene case with single spaces between letters. Drawn for Topaz or mO'sOul at line-height 1; asciiarena serves collys in those remade fonts.

**Motion.** Static as text. In SVG: rails draw downward first, then each logo strokes in beside its rail; or a slow vertical scroll of a short colly inside a fixed window, like paging a text viewer.

**As a README header.** Treat the top of the README as a colly opening: a full-width logo, a title frame with a release line, then an index that is the table of contents, with a rail of colons down the left margin and each entry a link. Logo as SVG; index as a pre block with HTML anchors so the entries are clickable.

**How to build it.** Every character exists in Unicode and in GitHub's monospace fonts, so text works, with the same join and stretch problems as the description logos; the macron-over-underscore pairing suffers most because the two no longer meet. Save as UTF-8, not Latin-1. SVG route: the stroke-per-character method, with the macron drawn as the cell's top edge and the broken bar as two short verticals; dense fraction fills become a hatch pattern. A scrolling window needs only a translate keyframe on a group inside a clip path. A generator needs a wide outline alphabet plus rail, index and credit-rule formatters.

**Do not copy / caveats.** Collys are personal portfolios: copy no logo, tag, crew name or BBS advert; the page structure and the mark vocabulary are free. Several collys open with song lyrics or crude language; leave that behind. The Amiga artists did not call their own style 'oldschool'; Wikipedia says that label was coined on the PC. Unreadable lettering needs a plain caption, and wide logos scroll sideways on phones.

**References**

- [Mo'Soul, 'Cream' (1994), logos by Desoto](<https://www.asciiarena.se/release/m%27s-crm%21.txt>)
- [Low Profile, 'Brooklyn's Finest - The Outline Project' (1997), by stRAtOS](<https://www.asciiarena.se/release/lp%21-brok.txt>)
- [Artcore, 'Nuke Proof' (August 1995) by Stylez](<https://www.asciiarena.se/release/AC%21-NUKE.TXT>)
- [DeZign, 'The ART of SK!N' (14 December 2013)](<https://www.asciiarena.se/release/dZ-taos1.txt>)
- [House of Style, 'Return of the Killer Afros' by Mortimer Twang, the archive's top-rated colly (undated there)](<https://www.asciiarena.se/release/hos-afro.txt>)
- [Desoto (Sweden; Epsilon Design, Mo'Soul, Unreal)](<https://www.asciiarena.se/artist/desoto>)
- [Stylez (Germany; Contra, Wetworks, Artcore)](<https://www.asciiarena.se/artist/stylez>)
- [Low Profile crew page: members and 53 releases](<https://www.asciiarena.se/crew/low-profile>)
- [Arclite crew page: members and 73 releases](<https://www.asciiarena.se/crew/arclite>)
- [Archive statistics: 3,993 collys, top artists and crews, most-drawn artists](<https://www.asciiarena.se/stats>)
- [Colly structure and status economy](<https://blog.glyphdrawing.club/amiga-ascii-art/>)

---

<a name="nfo-08"></a>

## nfo-08 · PC newschool ASCII: dollar-fill blob lettering (Remorse 1981 school)

**Text** · build: **Medium** · impact: **3/5** · 1994-2005, PC ASCII-only art groups

Katharsis!Ascii, started by Tinyz in March 1994, was the first ASCII-only group on the PC; Remorse followed in October 1994, founded by Necromancer and Necronite, and released 57 packs to June 2005. Their 'newschool' went beyond outline to filling and shading: letters poured solid from heavy characters with edges softened by punctuation. Roy of SAC argues the label is a misnomer for classic text art making a comeback.

**What it looks like**

- Solid fill from runs of the dollar sign; The Upright Man fills with the CP437 double-cross line character instead
- Stroke tops opened with lowercase d and b and bottoms closed with P, Y and 7, so corners look rounded
- Edge softening with comma, full stop, backtick, apostrophe, double quote and caret used as half-height pixels
- Thin joins and highlights from lowercase l, i, j and the colon
- Letters swell and pinch like liquid; counters are small irregular holes
- Wedge shapes built as a triangle of fill between a d and a b, widening one cell per row (the Kresile and Discyple joint piece)
- Full-screen texture pieces using a five-step ramp of semicolon, lowercase i, capital I, S and dollar sign (Axel Barebones, 1997)
- A lowercase signature and date line beneath; some files carry ANSI bold and normal codes for a two-tone highlight

**Palette.** Monochrome. The bold and normal intensity two-tone in some files is lost in plain text and needs SVG to reproduce.

**Lettering.** Heavy rounded capitals 9-12 rows tall and 10-14 columns wide, four or five letters per 80 columns, often overlapping. The pure 7-bit variant uses only keyboard characters; the high-ASCII variant adds CP437 line fragments and superscripts as corner specks.

**Motion.** static

**As a README header.** A pre block with a 10-12 row blob logo of a short project name (four to six letters, or an acronym), a lowercase signature line, then normal Markdown. Best for short names where block art would look empty.

**How to build it.** Use the 7-bit variant and it renders alike in every monospace font. On GitHub the 1.45 line-height lightens the fill into rows of dollar signs with gaps, but the silhouette still reads because these glyphs never touched anyway (reasoned from the stylesheet, not tested live). A generator can rasterise a bold rounded typeface at build time to a grid with two vertical samples per cell, then choose each cell's character by neighbourhood: fill, top-only, bottom-only, left or right edge, corner. Getting the edge characters to look hand-placed is the work; naive conversion looks like converter output. Avoid superscripts and CP437 characters, which fall back to other fonts and can shift columns.

**Do not copy / caveats.** Do not reuse the Remorse name or any artist's logo or tag; the fill-and-edge technique is free. Dense dollar signs read as noise at small sizes and to screen readers, so give the block an accessible text title. The term 'newschool' is contested. The claim that this style supplied many release-group NFO headers was not evidenced and has been removed.

**References**

- [Remorse 1981 group record: 1994/11 to 2005/06, 57 packs, 3,068 artworks](<https://16colo.rs/group/remorse>)
- [Remorse pack 15 (1997) file list and artists](<https://16colo.rs/pack/rmrs-15/>)
- [The Upright Man, Remorse logo with double-cross fill and bold highlights](<https://16colo.rs/pack/rmrs-15/raw/TUM-RMRS.ASC>)
- [Kresile and Discyple joint: dollar fill with d and b wedges](<https://16colo.rs/pack/rmrs-15/raw/US-JUST.ASC>)
- [Axel Barebones, full-screen tonal texture](<https://16colo.rs/pack/rmrs-15/raw/AXB-MTRX.ASC>)
- [Necromancer, 'History of the PC Ascii Scene' (6 March 1998): Katharsis, Remorse, Trank, the oldschool and newschool split, named artists](<https://cdimage.debian.org/mirror/archive/ftp.sunet.se/pub/pictures/ACiD-artpacks/www/html/apx_history_of_pc_ascii_scene.html>)
- [Roy/SAC on the three styles and why 'newskool' is a misnomer](<https://www.roysac.com/roy-sac_styles_of_underground_text_art.html>)
- [Newskool section: strings such as dollar, hash, X, x, o; renamed on its late-1990s comeback](<https://en.wikipedia.org/wiki/ASCII_art>)

---

<a name="nfo-09"></a>

## nfo-09 · FIGlet and TOIlet generated banners

**Text** · build: **Easy** · impact: **2/5** · 1991 to the present; Unix, Usenet signatures, later open-source READMEs and CLI splash screens

FIGlet began in spring 1991 as a 170-line C program called newban by Glenn Chappell, inspired by Frank Sheeran's email signature and urged on by Ian Chai; FIGlet 2.0 in 1993 shipped 13 fonts and contributed fonts later passed 400. TOIlet (Sam Hocevar, 2006) adds Unicode fonts, colour filters and export formats. It is the look of the open-source world, not the scene, and the banner most READMEs already use.

**What it looks like**

- Standard (March 1993): upright letters in a 6-row cell from underscore, pipe, slash, backslash and parentheses, smushed so neighbours share a column
- Slant: the same alphabet sheared right, all stems as slashes
- Banner: 7 drawn rows made only of hash signs, taken from the Unix banner program
- Lean and Block (April 1993): strokes made from a repeated underscore-slash or underscore-pipe pair, giving a stitched texture
- Small, Mini, Shadow, Script, Bubble, Digital: 3-7 row variants, the last two setting each letter in a circle or a box
- TOIlet Future and Emboss: 3-row letters from heavy box-drawing lines
- TOIlet Small Block: quadrant block characters giving 2 by 2 pixels per cell; Pagga (2010): half blocks on a light-shade ground
- Mechanical regularity: every repeated letter is identical and spacing is uniform, which is what separates it from hand work

**Palette.** Monochrome text. TOIlet's rainbow and metal filters (both named in its man page) colour output in a terminal; on GitHub that would need SVG.

**Lettering.** Font files (.flf, .tlf) define each character on a fixed-height grid. Cell heights from the file headers: Digital 3, Mini 4, Bubble 4, Small 5, Shadow 5, Standard 6, Slant 6, Script 7, Big 8, Banner 8 (7 drawn rows), Block 8, Lean 8; TOIlet Future, Emboss and Pagga 3, Small Block 4. Kerning and smushing rules merge touching edges.

**Motion.** static

**As a README header.** One code fence with the project name in a chosen font, 3-8 rows, then Markdown. Its better use in this tool is as an engine: ship original .flf fonts drawn in the manner of the other schools (an outline alphabet, a dollar-fill alphabet, a three-row half-block heading font) so any project name can be set in them, and use Small or Mini for secondary headings under a hand-style main logo.

**How to build it.** Generate at build time with any FIGlet implementation and paste. The 7-bit fonts render identically everywhere. TOIlet's box-drawing and quadrant fonts depend on the viewer's font having those glyphs at cell width and show row gaps on GitHub; render those as SVG geometry if wanted. The .flf format is simple and documented, which makes it a practical container for the tool's own alphabets.

**Do not copy / caveats.** Fonts carry their own notices: the stock FIGlet fonts permit modification if the modifier's name is added, TOIlet's are WTFPL, contributed fonts vary, so check each header before redistributing. It is already the most common README header, so stock fonts do nothing to set a project apart. Do not present generated output as hand-drawn scene art.

**References**

- [FIGlet history by Glenn Chappell (1995) with later editor's notes](<http://www.figlet.org/figlet_history.html>)
- [Standard font file with authorship and modification notice](<https://raw.githubusercontent.com/cmatsuoka/figlet/master/fonts/standard.flf>)
- [TOIlet Future font file (Sam Hocevar, October 2006, WTFPL)](<https://raw.githubusercontent.com/cacalabs/toilet/master/fonts/future.tlf>)
- [TOIlet man page (2006-11-10): Unicode, colour fonts, filters including rainbow and metal, export formats](<https://raw.githubusercontent.com/cacalabs/toilet/master/doc/toilet.1.in>)
- [FIGlet overview: authors, 1991 and 1993 releases, licence](<https://en.wikipedia.org/wiki/FIGlet>)
- [Archive directory listing early contributed .flf fonts and the FIGlet manual](<http://www.textfiles.com/art/>)

---

<a name="nfo-10"></a>

## nfo-10 · Usenet line art and the signed picture (jgs school)

**Text** · build: **Medium** · impact: **3/5** · 1990s-2003, Usenet alt.ascii-art, email signatures, GeoCities

On Usenet, ASCII art meant small figurative drawings in plain ASCII posted in messages and signatures. Joan G. Stark (Spunk, signing jgs) met the form in 1995, was drawing by July 1996 and made several hundred pieces to 2003, mostly freehand in 15-20 minutes each; her site drew over 250,000 visitors between 1996 and 1998. Her line style, a small picture with initials in the corner, is what most people outside the scene mean by ASCII art.

**What it looks like**

- Small pictures, typically 10-25 rows and under 72 columns, of animals, objects, seasonal scenes and folklore figures
- Line style: contours only, each mark chosen by where its ink sits in the character cell
- Low marks (underscore, full stop, comma), middle marks (hyphen, equals, plus) and high marks (apostrophe, double quote, caret) strung in sequence to make a gentle slope; fewer marks per step for a steeper one
- Parentheses, slashes and pipes for steep edges; lowercase o, capital O, the digit 6 and the at sign for eyes and dots
- Solid style as the contrast (Stark names Allen Mullen and The Dutch Dude): dense hashes, 8s and letters as fill with lighter marks at the edge
- The artist's two or three lowercase initials placed against the drawing's lower edge
- A picture paired with one line of lettering; Stark says she stopped drawing letters by hand once she found FIGlet

**Palette.** Monochrome. Stark worked mainly white on black, with some colour work.

**Lettering.** No logo lettering as such; any title is plain text or a FIGlet line. Jgs Font by Adel Faure (Velvetyne, 30 May 2023, SIL Open Font License 1.1) is a tribute typeface whose glyphs are shaped to match across cells; it includes ASCII, Latin-1 Supplement and the CP437 glyphs. It is a drawing font, not her handwriting.

**Motion.** static

**As a README header.** A friendly header, not a show of force: a 12-20 row line drawing of the project's mascot or subject on the left, the name and one-line description in plain text on the right, the maintainer's initials in the corner. For a factory project that is a small conveyor and machine in line style.

**How to build it.** Rendering is trivial: pure ASCII, under 72 columns, identical everywhere and phone-friendly. The cost is content: a picture cannot be generated from a project name. It must be drawn by hand, or by a careful model following the vertical-position rule, once per project; image-to-ASCII converters give solid style, which is the wrong look. An SVG twin could set the drawing in Jgs Font converted to outlines at build time (the OFL permits that); embedding the font itself as a data URI was not tested on GitHub.

**Do not copy / caveats.** The community rule is strict: never remove an artist's initials and never pass off their picture as your own. Draw new art and sign it with your own initials, not 'jgs'. The mark-placement technique is free. The tone is gentle and hobbyist and may sit oddly beside scene styles. Wikipedia names the newsgroup alt.ascii.art; the FAQ's own spelling is alt.ascii-art.

**References**

- [Joan Stark biography, dates and working method](<https://en.wikipedia.org/wiki/Joan_Stark>)
- [Joan Stark's own tutorial: line style versus solid style, choosing characters by vertical position](<https://ludd.ltu.se/~vk/q/asciitutorials/Joan_Stark.html>)
- [Matthew Thomas's alt.ascii-art FAQ v2.0.2 (1998-09-19): under 72 columns, never remove the artist's initials, signatures of four lines or fewer](<https://ludd.ltu.se/~vk/pics/ascii/junkyard/techstuff/FAQ/FAQ_Matthew_Thomas.html>)
- [Adel Faure on ASCII traditions and the Jgs Font](<https://velvetyne.fr/news/about-ascii-art-and-jgs-font/>)
- [Jgs Font specimen and licence](<https://velvetyne.fr/fonts/jgs-font/>)

---

<a name="nfo-11"></a>

## nfo-11 · Teletype, line-printer and typewriter pictures

**Animated SVG** · build: **Medium** · impact: **3/5** · 1890s typewriter art; radioteletype art from at least the 1940s, common in the 1960s-80s; line-printer art from the 1960s

Before home computers, pictures were typed: ornaments in Pitman's Typewriter Manual of 1893, Flora Stacey's butterfly of 1898, concrete poetry in the 1950s-70s, radio amateurs sending pictures over teletype, and Knowlton and Harmon's 1966 Bell Labs mosaics printed by overstriking. These are tonal pictures, not logos, and the black came from striking the same line twice.

**What it looks like**

- Capital letters, digits and a few punctuation marks only: radioteletype was often 5-bit and had no lowercase
- Tone from letter weight: a field of H with X and M for dark, colon, semicolon, apostrophe and full stop along the edges (the Edison portrait in the RTTY.COM set)
- Overstrike: each line sent twice with a bare carriage return between, heavy letters such as M on the first pass and W and I on the second, so ink piles up into near-solid black (the dog picture in the same set)
- Pictures 70-160 columns wide on continuous paper
- A solid rectangular ground of one letter with the subject left as bare paper
- Slightly misregistered second strikes and uneven ink density, the tell-tale of a mechanical printer
- Subjects listed by the archive: cartoon characters, landscapes, slogans, holidays, pin-ups and portraits

**Palette.** Black ink on off-white paper. For SVG: ink \#1A1A1A on paper \#F3EFE4 (my choice of values). A red second ribbon colour for typewriter work is a common convention but was not confirmed in the sources read.

**Lettering.** Whatever the machine had: teletype capitals or a typewriter face. Lettering, when present, is large capitals built from fields of one repeated letter.

**Motion.** In SVG: lines print one at a time from the top with a stepped reveal, the overstrike pass following a moment later and darkening each line; the sheet advances upward like paper feed.

**As a README header.** A paper-coloured SVG strip at the top: the project name as large capitals made of one repeated letter, or a tonal picture of the subject, with a sender-and-date credit line beneath in the manner of a radio operator's sign-off. A single-strike version can also be given as plain text in capitals.

**How to build it.** Single-strike capitals work as plain text at 72-80 columns. Overstrike is impossible in a pre block but simple in SVG: two text layers at the same position, the second offset by a fraction of a pixel, with a turbulence and displacement filter for uneven ink (filters are allowed in an SVG shown through img). SVG text falls back to the viewer's monospace font, so set textLength on every row to lock the column pitch, or draw a small capitals-only pixel alphabet as geometry if exact registration matters. Line-by-line printing is a clip rectangle with stepped keyframes. A tonal picture needs a build-time converter that maps luminance to a letter ramp, which suits this style better than any other here because the originals were also transcriptions.

**Do not copy / caveats.** Many surviving teletype pictures are pin-ups; choose subjects accordingly. Do not copy a specific picture or reuse a real amateur-radio call sign; the technique is free. It reads as mainframe and ham-radio nostalgia, not cracker scene, so it widens the set but leaves the NFO theme. Wikipedia's 1923 date for teletype images comes with the note that no early examples have been found. The claim about Snoopy and Mona Lisa line-printer prints was not in any source opened and has been removed.

**References**

- [The RTTY collection on textfiles.com, with Jason Scott's note on 5-bit capitals, contests and dates back to the 1940s](<http://artscene.textfiles.com/rtty/>)
- [Overstrike picture with bare carriage returns (each line struck twice)](<http://artscene.textfiles.com/rtty/RTTYCOM/dog.pox>)
- [Single-strike portrait using H fill and punctuation edges](<http://artscene.textfiles.com/rtty/RTTYCOM/edison.pix>)
- [History section: typewriter art, teletype images reported from 1923, Knowlton and Harmon 1966, overprinting](<https://en.wikipedia.org/wiki/ASCII_art>)
- [Survey of typewriter art from the 1893 Pitman manual and Flora Stacey to concrete poetry, after Barrie Tullett's anthology](<https://www.themarginalian.org/2014/05/23/typewriter-art-laurence-king>)

---

## Considered and left out

- 2channel Shift\_JIS art and kaomoji rows: dropped as a style. The facts check out (Wikipedia: designed around the proportional MS PGothic font, free Mona Font with matching widths, Giko 1997 and 1999, Mona 2000; kaomoji credited to Yasushi Wakabayashi, 1986, on ASCII NET). But it cannot become a README header: GitHub renders pre in a monospace font, which destroys the proportional alignment, and an SVG cannot load MS PGothic, so a large piece would need every glyph outlined at proprietary advance widths. What remains, a single line of kaomoji, is a one-line ornament that any other style can add as a divider, not a header style. The research itself rated it hard and called it one of the two weakest fits.
- Not dropped but renamed and re-scoped: 'ISO-era NFO: 7-bit outline logo with dotted field leaders' is now '7-bit outline NFO with dot-leader fields', because the ISO era was mostly block art.
- Not dropped but merged in: hollow and contour block lettering (Drink or Die 1996, JED's 1992 Fairlight outline, Strick9's 2003 Deviance logo) is kept as a variant inside the brush-script style, not as a separate entry.
- Considered and left out, as in the research: PETSCII (belongs with the C64 family), colour ANSI and TheDraw fonts (covered by the existing ANSI BBS style), Unicode Braille drawing (not named in the brief and dependent on fallback fonts).
