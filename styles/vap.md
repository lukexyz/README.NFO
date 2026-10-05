# Vaporwave and internet-era aesthetics

<sub>Generated from <code>styles.json</code> by <code>tools/build-styles.mjs</code>. 18 styles, researched 2026-09-30. Checked by a second reviewer, who made 31 corrections. [Back to the catalogue](README.md) · [Full index](INDEX.md)</sub>

## Reviewer's summary

Checked result: 17 of the 18 researched styles survive, one is merged away (seapunk), and one is added (signalwave in the Weather Channel local-forecast manner). Most dates, names and hex values held up against the sources; the errors were mainly redirected URLs, details attributed to pages that do not contain them, and a few things stated from memory. All are listed in corrections.

The family splits into four schools:  
1. Vaporwave proper (2010-2016, Bandcamp/Tumblr): ironic pink-and-mint collage of early-90s corporate graphics, classical busts, Japanese text and Windows 95 chrome. Sub-scenes that change the picture are late-night lo-fi (worn VHS), signalwave (broadcast idents, especially The Weather Channel) and future funk (city pop sleeves). Mallsoft, seapunk, hardvapour, Simpsonwave and utopian virtual are recorded under dropped, because they depend on photos, 3D renders or borrowed footage.  
2. Synthwave / outrun: sincere, dark, neon sunset and laser grid. It is a different thing from vaporwave and is kept separate.  
3. Interface nostalgia: Windows 9x, the blue error screen, XP Luna, classic Mac OS, Winamp, instant messengers, the Geocities homepage. These are flat rectangles, 1px bevels and pixel type, so they are the most SVG-native styles here.  
4. Named design eras and treatments: Memphis, Y2K / cybercore, Frutiger Aero / Web 2.0 gloss, glitch art, cyberpunk neon signage.

The dividing line for README.NFO is photographic dependence. Anything defined by a photo or 3D render (marble bust, mall interior, anime still, chrome blob, aurora wallpaper) translates poorly. Anything defined by UI chrome, grids, type and scanline artefacts translates well.

Strongest candidates after checking:  
- Windows 9x desktop with a Defrag map or setup wizard.  
- Winamp three-window player: the best answer inside this family to the "chiptune" request, since it is a music player with no sound and the playlist doubles as a table of contents.  
- Geocities kit: the only style whose pieces are individually clickable, as separate 88x31 SVG badges wrapped in Markdown links.  
- Classic Mac 1-bit desktop, VHS on-screen display, the new signalwave forecast screen, and synthwave as the crowd-pleasing but overused option.  
- Text-only options are limited to the fullwidth header and the 80-column error-screen layout.

Fonts are the recurring engineering problem: an SVG shown through &lt;img&gt; cannot load web fonts. I read the source of readme-typing-svg, a widely used README tool, and it solves this by subsetting a Google Font to the characters used and embedding it as a base64 data: URI in the SVG's own &lt;style&gt;. That suggests three workable routes for every style: outline lettering to paths, draw pixel glyphs as rects, or embed a subsetted open-licence font. This matters most for Japanese text, where a subset of a few glyphs is only a few KB.

What I could not do:  
- Nothing was render-tested on GitHub: fullwidth alignment in &lt;pre&gt;, heavy filters and embedded fonts are all untested there.  
- The session's web-search budget ran out part-way, so a few items could not be double-sourced and are marked in caveats: the chrome-logo gradient recipe, the MSN nudge version, messenger colours, and mallsoft release dates other than Palm Mall.  
- Colour values marked "sampled" are my own pixel samples from reference images I downloaded and viewed, not published palettes.

## Styles

| ID | Style | Medium | Build | Impact |
| --- | --- | --- | --- | --- |
| [vap-01](#vap-01) | Classic vaporwave: the Floral Shoppe manner | Animated SVG | Medium | 4/5 |
| [vap-02](#vap-02) | Fullwidth text header: vaporwave as plain text | Text / ASCII | Easy | 3/5 |
| [vap-03](#vap-03) | VHS tape and late-night lo-fi: OSD, tracking and chroma bleed | Animated SVG | Medium | 4/5 |
| [vap-04](#vap-04) | Signalwave: the Weather Channel local-forecast screen | Animated SVG | Easy | 4/5 |
| [vap-05](#vap-05) | Synthwave / outrun: sunset, laser grid, chrome logo | Animated SVG | Medium | 4/5 |
| [vap-06](#vap-06) | Future funk / city pop sleeve | Animated SVG | Medium | 3/5 |
| [vap-07](#vap-07) | Windows 95/98 desktop: dialogs, error cascade, setup wizard, Defrag | Animated SVG | Easy | 5/5 |
| [vap-08](#vap-08) | Blue Screen of Death / fatal exception | Text / ASCII + SVG | Easy | 3/5 |
| [vap-09](#vap-09) | Windows XP Luna: blue title bars and the green hill | Animated SVG | Medium | 4/5 |
| [vap-10](#vap-10) | Frutiger Aero and Web 2.0 gloss | Animated SVG | Medium | 3/5 |
| [vap-11](#vap-11) | Classic Mac OS: 1-bit System 6/7 desktop | Static SVG | Easy | 4/5 |
| [vap-12](#vap-12) | Geocities homepage / web 1.0 | Text / ASCII + SVG | Easy | 4/5 |
| [vap-13](#vap-13) | Winamp classic skin: player, equaliser, playlist | Animated SVG | Medium | 5/5 |
| [vap-14](#vap-14) | Instant messenger window: MSN, AIM, ICQ | Animated SVG | Easy | 4/5 |
| [vap-15](#vap-15) | Y2K / cybercore: techno type, orbit lines and chrome | Animated SVG | Hard | 3/5 |
| [vap-16](#vap-16) | Glitch art: databend, channel split, slice displacement | Animated SVG | Medium | 3/5 |
| [vap-17](#vap-17) | Memphis: squiggles, confetti and laminate | Static SVG | Easy | 3/5 |
| [vap-18](#vap-18) | Cyberpunk neon signage | Animated SVG | Medium | 4/5 |

---

<a name="vap-01"></a>

## vap-01 · Classic vaporwave: the Floral Shoppe manner

**Animated SVG** · build: **Medium** · impact: **4/5** · 2010-2013; Bandcamp, Tumblr, 4chan /mu/. Chuck Person's Eccojams Vol. 1 (August 2010) and Far Side Virtual (25 October 2011) are the forerunners; Floral Shoppe by Macintosh Plus (Ramona Langley, also known as Vektroid) came out 9 December 2011 on Beer on the Rug and set the template. The term is first recorded on 13 October 2011 (Know Your Meme).

A collage style that treats early-90s corporate computing as a lost luxury resort. Wikipedia lists its ingredients as 1990s web design, glitch art, anime, Greco-Roman statues, Memphis shapes, 3D-rendered objects, cyberpunk tropes, VHS degradation and fullwidth text. People remember it because one album cover became the meme template for the whole genre.

**What it looks like**

- Flat hot-pink ground with no gradient (sampled from the cover thumbnail at about \#ff819c)
- Black-and-pink checkerboard floor in one-point perspective, occupying only the lower-right third and running off the right edge
- A white marble classical head on a plain white block plinth, hard-edged cut-out, filling the left half of the frame (the cover uses the Helios head from the Archaeological Museum of Rhodes)
- Two-line title at top right in mint green (sampled at about \#6cffb9): Latin capitals plus katakana on line one, katakana, hiragana and kanji on line two, a thin green rule between them and a small square emblem of a warped green checker grid at the right end
- A small landscape rectangle pasted under the title like a low-resolution screenshot: a city skyline at sunset over water in orange, violet and purple
- Windows 95 window chrome used as picture frames: silver \#c0c0c0 bevels, navy \#000080 title bars, teal \#008080 desktop
- Fullwidth Latin lettering with wide tracking for any English words
- Optional props from the wider scene, used sparingly: palm trees, dolphins, pyramids and tori with iridescent marbled texture (the seapunk vocabulary), Memphis squiggles

**Palette.** Sampled by me from the Wikipedia cover thumbnail (approximate, not an official palette): ground \#ff819c, title green \#6cffb9, floor black \#141218, marble \#d9d6d0. From Windows 95/98 chrome (98.css): \#c0c0c0, \#000080, \#808080, \#ffffff; desktop teal \#008080. A widely circulated but non-canonical swatch set from Gridfiti: \#A653F5, \#8F8CF2, \#65B8BF, \#F96CFF, \#FA92FB. There is no canonical vaporwave palette.

**Lettering.** Fullwidth Unicode Latin (U+FF01-FF5E) for titles; Japanese katakana, hiragana and kanji in a plain gothic (sans) face; otherwise default system faces of the period inside window chrome. Deliberately un-designed: centred or ranged left, wide letter-spacing, no kerning care.

**Motion.** Slow and drifting, matching the slowed-down music: checker floor creeping toward the viewer, the inset 'screenshot' fading between two skies, a Windows-style window opening, an occasional one-frame horizontal tear. Nothing fast. It also works fully static, as the original cover is.

**As a README header.** One SVG banner, about 880x300. Above the fold: flat pink ground, a perspective checker floor in the lower right, the project name in wide-tracked capitals with a real Japanese subtitle in mint green at top right, an original statue drawing at the left, and one Windows 95 window holding the tagline and stats in place of the pasted skyline. Body text and links stay as ordinary Markdown below.

**How to build it.** Floor without 3D transforms: draw a static fan of wedges from the vanishing point and an animated stack of horizontal bands spaced by perspective (y = horizon + k/z). Show the band group twice with &lt;use&gt;: one copy clipped to the even wedges, the other phase-shifted by one band and clipped to the odd wedges. That yields a true perspective checker with clipPath only, no filters. Band positions move hyperbolically, so generate 8-12 keyframe values per band in the tool. Window chrome is rects plus 1px lines. The bust is the blocker: a marble photo can only come in as a heavy data: bitmap and the specific photo is not yours, so use a posterised 2-3 tone vector drawing of an original or clearly public-domain sculpture. Japanese glyphs: outline to paths, or embed a font subset as base64 (the readme-typing-svg method). I did not render-test any of this on GitHub.

**Do not copy / caveats.** Do not copy the Floral Shoppe layout one-to-one, the Macintosh Plus name, or the Helios photo; do not use Arizona, Fiji or Windows logos. The technique (pink ground, checker floor, statue, katakana, Win95 frames) is free to reuse. Japanese text must be real and correctly translated, not decorative filler. Cliches to ration: the bust, the dolphin, the word AESTHETIC. Avoid sun-wheel, rune and crusader motifs: Wikipedia records a far-right 'fashwave' offshoot that used them. Mint on pink fails contrast for body-size text, so keep anything that must be read on a solid panel. Sampled hex values are approximate.

**References**

- [Floral Shoppe article and cover image. I downloaded and viewed the cover: the title lettering is mint green, although the article prose describes it as pink.](<https://en.wikipedia.org/wiki/Floral_Shoppe>)
- [Vaporwave overview: visual ingredients, sub-genre list, dates, fullwidth styling](<https://en.wikipedia.org/wiki/Vaporwave>)
- [Know Your Meme timeline: New Dreams Ltd. album 1 July 2011, term first seen 13 October 2011, 'Vaporwave Album Covers' Tumblr 24 January 2013](<https://knowyourmeme.com/memes/cultures/vaporwave>)
- [Bandcamp Daily, 'Genre As Method' (Simon Chandler, 21 November 2016): the sub-genre family tree with key releases](<https://daily.bandcamp.com/lists/vaporwave-genres-list>)
- [Far Side Virtual (James Ferraro, 25 October 2011): the 'utopian virtual' strand; cover is two iPads over a low-resolution Street View image](<https://en.wikipedia.org/wiki/Far_Side_Virtual>)
- [Seapunk: the aquatic Tumblr precursor whose props (dolphins, palms, floating solids) vaporwave absorbed](<https://en.wikipedia.org/wiki/Seapunk>)
- [Gridfiti palette list: source of the quoted non-canonical swatch set](<https://gridfiti.com/aesthetic-color-palettes/>)

---

<a name="vap-02"></a>

## vap-02 · Fullwidth text header: vaporwave as plain text

**Text / ASCII** · build: **Easy** · impact: **3/5** · 2011 onward; track and album titles on Bandcamp, then Tumblr, Twitter and YouTube comments. The characters come from legacy CJK encodings (Unicode block U+FF00-FFEF).

Vaporwave's one purely typographic device: titles typed in fullwidth Latin, often beside Japanese text. Wikipedia notes the aesthetic itself is conventionally written in fullwidth characters. It reads as vaporwave with no image at all, which makes it the only member of this family that works as monochrome text.

**What it looks like**

- Latin letters from U+FF21-FF5A, each occupying a CJK-width cell, giving airy, even spacing without typed spaces
- Ideographic space U+3000 between words so the gaps match the letter cells
- One Japanese line (katakana or kanji) directly above or below the Latin title
- Titles shaped as NAME plus a year or a pseudo-corporate suffix (CORP, PLAZA, VIRTUAL, 95)
- A horizon band 3-5 rows tall built from the shade characters in order of density (U+2591, U+2592, U+2593, U+2588) to suggest a setting sun or gradient sky
- Body laid out as an album track list: two-digit number, title, dot leader, running time or value
- Thin single-line box-drawing rules with a lot of empty space; open-sided rather than closed frames

**Palette.** Monochrome: whatever the GitHub theme gives. The look is carried by spacing and character choice alone.

**Lettering.** Fullwidth Latin (U+FF01-FF5E maps one-to-one onto ASCII 0x21-0x7E), ideographic space U+3000, halfwidth katakana U+FF61-FF9F as texture, box-drawing U+2500 range, shade blocks U+2591-2593 and full block U+2588. My own illustration of the technique: a line such as 'ＲＥＡＤＭＥ　ＰＬＡＺＡ　９５' over a dotted rule.

**Motion.** static

**As a README header.** A &lt;pre&gt; block of roughly 16-20 lines: the project name in fullwidth capitals, a Japanese subtitle, a shade-block horizon band, then the repo facts laid out as a track list (number, name, dot leader, value) with real links inside the &lt;pre&gt;. Pairs well with a small SVG above it, but stands alone.

**How to build it.** Nothing to build; it is Unicode. The technical risk is alignment: a fullwidth character should be exactly two columns, but GitHub's monospace stack falls back to a different CJK font per operating system, so widths drift. Design so nothing depends on a right-hand edge lining up: open-sided rules, left-aligned or loosely centred lines, shade bands made only of ordinary-width block characters. Budget 40 fullwidth characters per 80 columns. Not tested on GitHub by me or by the original researcher.

**Do not copy / caveats.** Screen readers spell fullwidth text letter by letter and search cannot find it, so repeat the project name in normal text right below. Keep fullwidth to the title only. Do not reuse real album or artist names. Japanese must be meaningful. Differs from the existing NFO style: no block logo, no dense frames; the effect comes from spacing and emptiness.

**References**

- [Unicode block reference: block range, fullwidth ASCII range U+FF01-FF5E, halfwidth katakana U+FF61-FF9F, and why U+3000 is the fullwidth space](<https://en.wikipedia.org/wiki/Halfwidth_and_Fullwidth_Forms_(Unicode_block)>)
- [Vaporwave article: records the fullwidth styling as a marker of the scene, still common in YouTube comments in 2019](<https://en.wikipedia.org/wiki/Vaporwave>)
- [Floral Shoppe: Japanese titling as the model](<https://en.wikipedia.org/wiki/Floral_Shoppe>)

---

<a name="vap-03"></a>

## vap-03 · VHS tape and late-night lo-fi: OSD, tracking and chroma bleed

**Animated SVG** · build: **Medium** · impact: **4/5** · The look of 1980s-90s home video. Revived by late-night lo-fi (Luxury Elite is named by Wikipedia as its main progenitor) from about 2012, and by Simpsonwave: a Vine edit by Spicster in late 2015, developed on YouTube in 2016 by Midge and Lucien Hughes.

The picture as seen on a worn tape in a dark room: soft, smeared colour, a block-letter PLAY overlay and a band of noise along the bottom edge. Wikipedia describes late-night lo-fi as emulating programmes recorded off old 4:3 televisions, and Simpsonwave as cartoon clips under VHS-style distortion. This is the 'retrowave VHS' look the brief asked for.

**What it looks like**

- 4:3 frame with slightly rounded corners on a black surround
- Top-left on-screen display in a blocky capital bitmap face: PLAY with a right-pointing triangle, and SP below or beside it
- Bottom-left timestamp in two lines in the same face, for example a 12-hour time over a date with a three-letter month
- A horizontal tracking band 6-12px tall in which the image is shifted sideways 10-30px and streaked with white noise, drifting slowly up the frame
- Head-switching strip: the bottom 8-10 scanlines skewed sideways and noisy
- Chroma bleed: colour edges smeared to the right by several pixels while the luminance edge stays sharper, plus red/cyan fringing on high-contrast edges
- Lifted blacks (dark grey-blue, never pure black), fine horizontal scanlines at low opacity, occasional one-line white dropout streaks

**Palette.** OSD text white or pale green on picture. Simpsonwave-style grade: purple and magenta wash over a blue-black base. No hex values in the sources; Gridfiti's non-canonical 'Lofi' swatches (\#674AB3, \#A348A6, \#9F63C4, \#9075D8, \#CEA2D7) are a usable starting point for the purple grade.

**Lettering.** VCR OSD Mono by Riciery Leal (added to DaFont 14 April 2014, a 21px bitmap face, listed as 100% free) is the standard modern stand-in for VCR character generators. Capital-only, monospace, thick strokes.

**Motion.** Tracking band rises slowly and wraps; bottom noise strip jitters at about 8 fps; whole image shifts 1-2px sideways at irregular intervals; the PLAY indicator blinks at 1 Hz for the first few seconds then holds; tape counter or clock ticks.

**As a README header.** SVG banner framed as a 4:3 or letterboxed tape frame. Above the fold: the project name as a broadcast-style title card kept sharp in the centre, PLAY and SP top left, a bottom-left timestamp that carries the version or release date, and the defects layered around it. Links live below in Markdown.

**How to build it.** Chromatic fringing: duplicate the artwork group, tint the copies red and cyan with feColorMatrix, offset 1-2px with feOffset, recombine with feBlend screen. Tracking band: a clipPath strip translated by CSS keyframes, with the clipped copy shifted sideways. Bottom noise: feTurbulence in a narrow rect only; MDN's baseFrequency page marks the attribute animatable, but animated turbulence over a large area is CPU-heavy, so keep it to a thin strip and step the seed with discrete SMIL values. Scanlines: a 2px &lt;pattern&gt; at low opacity. OSD type: pixel rects, outlined paths, or an embedded subset of an open pixel font as base64.

**Do not copy / caveats.** Do not use Simpsons frames or any show footage. Free to reuse: the OSD convention, tracking and head-switch defects, the purple grade. Check VCR OSD Mono's licence text yourself before embedding it; DaFont's label is not a licence. Keep flicker slow and low-contrast (photosensitivity) and add a prefers-reduced-motion rule that freezes it. Blurred text fails legibility, so keep the project name sharp. Differs from existing style 5 (phosphor terminal): this is a video picture with tape defects, not a text console.

**References**

- [VHS: NTSC VHS is roughly 333x480 for luma against about 40x480 for chroma, which is why colour smears; SP/LP/EP; generation loss](<https://en.wikipedia.org/wiki/VHS>)
- [VCR OSD Mono font page: author, date, licence, 21px size](<https://www.dafont.com/vcr-osd-mono.font>)
- [ntsc-rs: free, open-source emulation of NTSC and VHS artefacts; useful as a reference for what the real defects look like (the landing page does not list them by name)](<https://ntsc.rs/>)
- [Vaporwave article, sections on late night lo-fi and Simpsonwave (the separate Simpsonwave URL is only a redirect to this)](<https://en.wikipedia.org/wiki/Vaporwave>)

---

<a name="vap-04"></a>

## vap-04 · Signalwave: the Weather Channel local-forecast screen

**Animated SVG** · build: **Easy** · impact: **4/5** · The on-air look of the WeatherStar 4000 (developed 1988, introduced early 1990, last units retired when the analogue feed ended on 26 June 2014). Adopted by signalwave / 'broken transmission' vaporwave from about 2012; Cat System Corp.'s News at 11 (2016) builds half an album on Weather Channel samples. Kept alive by the fan recreation WeatherStar 4000+ (Mike Battaglia; maintained by netbymatt since 2020).

Signalwave is the vaporwave sub-genre made from distorted broadcast idents, and Wikipedia singles out The Weather Channel as its main source. Its picture is the automated local-forecast screen: chunky shadowed text on blue panels over an orange-and-purple gradient, cycling through pages of data. It is remembered as the calmest thing on 1990s television, and unlike most vaporwave imagery it is pure broadcast graphics with no photograph in it. The earlier research mentioned this only as a variant inside the VHS entry; it deserves its own entry.

**What it looks like**

- 4:3 frame filled by a gradient running from dark indigo-purple at the top to burnt orange at the bottom, with a diagonal break near the top
- A centred navy data panel about two-thirds of the frame wide with a lighter blue, soft-glowing border
- Header row above the panel: a square logo tile at top left (blue with a white rounded outline), a two-line page title in yellow with a hard black drop shadow, and at top right a clock with seconds and a day-and-date line in white wide-tracked capitals
- Data as label-and-value rows: labels left-aligned with a colon, values right-aligned, in chunky white condensed lettering with a 2-3px black drop shadow; the location name in yellow
- One oversized reading at the top left of the panel with a one-word description under it, and beneath that a cartoon icon drawn with a thick black outline and flat yellow fill
- A full-width navy crawl bar along the bottom edge carrying a single line of white text, separated from the picture by a thin lighter line
- The screen works as a slideshow of named pages; the recreation lists Current Conditions, Latest Observations, Hourly, Local Forecast, Extended Forecast, Regional Forecast, Almanac, Travel, Radar and Hazards

**Palette.** Sampled by me from the WeatherStar 4000+ project image (approximate): background top \#180f57 to \#38194a, background bottom \#b9570d, panel \#1e295a, panel border \#1c4596, crawl bar \#1e3470, title yellow (pure \#ffff00 family), text white with black shadow. The project itself describes the look simply as blue and orange.

**Lettering.** A chunky condensed bitmap face with rounded terminals and a hard black drop shadow for data; a wide, extended capital face for the clock. The recreation uses fan-made 'Star4000' fonts credited to Nick Smith of TWCClassics. Mixed case for labels, capitals for the clock.

**Motion.** Pages replace one another every 8-10 seconds with a hard cut; the bottom crawl scrolls right to left continuously; the clock ticks each second; an icon alternates between two frames. Calm and mechanical.

**As a README header.** Animated SVG in a 4:3 frame. Page one is 'Current Conditions' for the repo: the oversized reading is the version or the star count, the label-and-value rows are real facts (language, licence, tests, last release), and the icon is an original drawing tied to the project. Page two is 'Local Forecast': the project description as a short paragraph. The bottom crawl carries the install command. The clock at top right can show the build date. Links go below in Markdown.

**How to build it.** Everything is rects, two linear gradients and text. Panel glow: one feGaussianBlur on a stroked rect. Text shadow: a black copy of each text group offset 2-3px (no filter needed). Pages: groups with opacity keyframes using steps() so they cut rather than fade. Crawl: a text group translated inside a clipPath. The lettering carries the recognition, so it must be outlined paths or an embedded subset of an open-licence font with similar chunky proportions; a system sans-serif will not read as the style. Small and cheap to render (well under 40 KB).

**Do not copy / caveats.** Do not use The Weather Channel name or logo, the NOAA emblem, the phrase used for its forecast segment, or the fan-made Star4000 fonts (they replicate a proprietary broadcast typeface and their licence is unclear). The README of the recreation states the unit and technology belong to The Weather Channel. Free to reuse: gradient backdrop, blue panel, shadowed label-and-value rows, crawl bar, paged slideshow. I viewed only the Current Conditions screen; the layouts of the other pages are not described here because I did not see them. Yellow and white on navy pass contrast; keep the shadow. North American viewers will recognise it instantly, others less so.

**References**

- [Vaporwave article, Signalwave section: samples radio, television and station idents, particularly from The Weather Channel; names Cat System Corp. and CT57](<https://en.wikipedia.org/wiki/Vaporwave>)
- [WeatherStar: history of the 4000 unit (1988 development, 1990 introduction, text over stylised graphical backgrounds, retired 2014)](<https://en.wikipedia.org/wiki/WeatherStar>)
- [WeatherStar 4000+ README: a fan recreation of the 1990s local forecast, its list of screens, font and icon credits, and its ownership disclaimer](<https://raw.githubusercontent.com/netbymatt/ws4kp/main/README.md>)
- [WeatherStar 4000+ Current Conditions image, which I downloaded and viewed; the visual signature above describes this screen](<https://raw.githubusercontent.com/netbymatt/ws4kp/main/server/images/social/1200x600.png>)
- [News at 11 (Cat System Corp., 2016): tracks 10-20 built on Weather Channel samples; cover seen through the channel's old logo shape](<https://en.wikipedia.org/wiki/News_at_11_(album)>)
- [Bandcamp Daily family tree: broken transmission / signalwave defined as piled-up radio and TV clips simulating channel-hopping](<https://daily.bandcamp.com/lists/vaporwave-genres-list>)

---

<a name="vap-05"></a>

## vap-05 · Synthwave / outrun: sunset, laser grid, chrome logo

**Animated SVG** · build: **Medium** · impact: **4/5** · Music scene from the mid-to-late 2000s in France (College, Kavinsky); breakthrough with the film Drive (2011) and Kavinsky's album OutRun (22 February 2013); name from Sega's 1986 arcade game Out Run (Yu Suzuki).

The sincere cousin of vaporwave: an idealised 1980s of sports cars, neon and sunsets. Wikipedia ties 'outrun' to VHS tracking artefacts, magenta neon and gridlines; Know Your Meme's icon for it is a neon pink grid landscape with a sunset between mountains. It is the single most recognisable retro header there is, and also the most overused.

**What it looks like**

- A magenta wireframe floor grid (about \#fc14fc in Wikipedia's illustration) receding to a horizon at roughly 55-60 percent of the height, flat or gently undulating
- A large sun disc centred on the horizon, orange to yellow (about \#ed9d16 to \#ecba16), cut by 5-7 horizontal slits that get thicker toward the base
- Dark desaturated purple sky (about \#40324d) or purple-to-navy gradient with a few stars; low-poly or wireframe mountain silhouettes either side of the sun
- Chrome logo: heavy italic sans capitals filled with a two-band gradient (light sky blue to white above a hard dark horizon line at mid-height, then brown-orange to yellow below), a thin bright outline and a four-point star glint on one corner
- A second word in loose brush script across the chrome word at a slight upward angle, in neon pink or mint green (mint, about \#12ed83, in Wikipedia's illustration)
- Palm tree silhouettes framing the sides; a soft glow behind every line

**Palette.** SynthWave '84 editor theme (Robb Owen): background \#262335, pink \#ff7edb, cyan \#36f9f6, yellow \#fede5d, orange \#ff8b39, green \#72f1b8, red \#fe4450. Sampled from Wikipedia's synthwave illustration: sky \#40324d, grid \#fc14fc, sun \#ed9d16 to \#ecba16, script \#12ed83. Gridfiti 'Outrun' swatches: \#362FBB, \#712275, \#F97698, \#FFB845.

**Lettering.** Two-layer logo: heavy italic geometric sans in chrome plus a loose brush script in neon. Small text in a wide, tracked-out sans. 1980s film-title and toy-packaging lettering is the model.

**Motion.** Grid lines flow toward the viewer at constant ground speed; sun slits slide downward and wrap; a highlight sweeps across the chrome logo every few seconds; stars twinkle; the script word flickers on once at load.

**As a README header.** One wide animated SVG (about 880x320). Above the fold: sky, striped sun, moving grid, and the project name as the chrome logo with the tagline in neon script across it. Stats sit as a thin tracked-out line on the horizon. Everything else is Markdown below.

**How to build it.** All vector. Sun: a circle with a linearGradient under a mask of rects (the slits) that translate down in a loop. Grid: a static fan of lines to the vanishing point plus 8-10 horizontal lines whose y values follow perspective spacing; generate keyframes in the tool so the motion accelerates toward the viewer and loops seamlessly. Chrome: a linearGradient with a hard stop at mid-height plus a stroke; the glint is a narrow white skewed rect clipped to the lettering and translated across. Glow: feGaussianBlur merged under the strokes, with the filter region kept tight. The logo must be outlined to paths or use an embedded font subset. Easily under 40 KB.

**Do not copy / caveats.** It is the biggest cliche in the family and common on GitHub profile pages, so on its own it reads as a template; I lowered its score from 5 for that reason. Avoid the Out Run logo and sprite car, a Testarossa likeness, and Kavinsky or Drive title lettering. The grid, striped sun and chrome gradient are generic and free. Differentiate by replacing the sun or the horizon with something from the project's subject. The chrome-gradient recipe is the common construction as I know it; I could not tie it to a cited source. Neon pink on dark purple is fine for display sizes only. Not vaporwave: keep it a separate option.

**References**

- [Synthwave: origins, outrun as VHS artefacts, magenta neon and gridlines, the Out Run game as namesake; its infobox illustration (which I viewed) shows the striped sun, magenta wireframe and script lettering](<https://en.wikipedia.org/wiki/Synthwave>)
- [Know Your Meme: Outrun as an aesthetic, key works (Drive, Hotline Miami, Far Cry 3: Blood Dragon, Kung Fury), Kavinsky's OutRun dated 22 February 2013](<https://knowyourmeme.com/memes/cultures/outrun>)
- [SynthWave '84 theme file: palette hex values](<https://raw.githubusercontent.com/robb0wen/synthwave-vscode/master/themes/synthwave-color-theme.json>)
- [SynthWave '84 README: credits the bands FM-84, Timecop 1983 and The Midnight and the artwork of James White as inspiration](<https://raw.githubusercontent.com/robb0wen/synthwave-vscode/master/README.md>)
- [Signalnoise (James White): illustrator whose 1980s-homage posters are a touchstone for the look](<https://signalnoise.com/info>)
- [Out Run (Sega, 1986): the namesake; Ferrari Testarossa convertible, palms and coastal scenery](<https://en.wikipedia.org/wiki/Out_Run>)

---

<a name="vap-06"></a>

## vap-06 · Future funk / city pop sleeve

**Animated SVG** · build: **Medium** · impact: **3/5** · Future funk from 2013 (Macross 82-99's Sailorwave series; Skylar Spence, formerly Saint Pepsi; Yung Bae; Night Tempo). Imagery borrowed from 1980s Japanese city pop LP sleeves and from 1980s-90s anime.

The upbeat, danceable offshoot of vaporwave built on city pop samples. Its visuals are either anime loops (Wikipedia names Urusei Yatsura, Macross, Kimagure Orange Road and Sailor Moon) or the sun-drenched resort illustration of Hiroshi Nagai, whose sleeve for Eiichi Ohtaki's A Long Vacation (21 March 1981) defined the city pop look.

**What it looks like**

- A flat, hard-edged resort scene with no outlines: a swimming-pool rectangle in perspective, a white building edge or wall, a razor-straight horizon and a cloudless sky graded from deep blue at the top to pale cyan at the horizon
- One or two palm trees with crisp, short midday shadows falling on white paving
- LP-sleeve framing: a square picture with a vertical paper 'obi' strip down the left edge carrying vertical text
- Katakana title with a smaller Latin subtitle in a rounded sans or brush script
- Four-point sparkle glints on water and on any chrome
- Pool water drawn as a flat turquoise with a net of thin white caustic lines

**Palette.** Saturated sky blue to pale cyan, swimming-pool turquoise, white, coral pink and sunset orange, with deep navy for night-drive variants. This is my description of the manner; the sources give no hex values.

**Lettering.** Katakana display lettering; rounded sans or brush script for Latin; track titles in fullwidth characters. Obi strips use tight vertical Japanese text on a plain colour.

**Motion.** Gentle: caustic lines drifting across the pool, sparkles popping on and off, a palm frond swaying a few degrees, equaliser bars bouncing at a steady dance tempo.

**As a README header.** SVG styled as a record sleeve lying on the page: a square illustration on the left with an obi strip naming the project, and a 'track list' panel on the right that is really the feature list. Animated sparkle and water only. The anime strand cannot be used.

**How to build it.** The resort scene is flat shapes and linear gradients, which SVG does well: pool as a polygon with a &lt;pattern&gt; of wavy white lines animated by translate, palms as a handful of paths, sparkles as four-point polygons with staggered opacity keyframes. The cost is illustration, not technology: it needs one good original drawing, which a generator cannot vary much per repo. What blocks the other half of the style is rights: anime frames are copyrighted and would need embedded bitmaps anyway. Katakana must be outlined or embedded as a font subset.

**Do not copy / caveats.** Do not trace a Nagai painting or reuse anime characters or stills; an original scene in the same flat manner is fine. Artist names are references only. Japanese text must be real. To viewers who do not know city pop it reads as a generic holiday poster, so it needs the sleeve framing (obi strip, track list) to make sense.

**References**

- [Vaporwave article, Future funk section: French-house-inspired offshoot, anime reference points, Macross 82-99's Sailorwave (2013) and other artists (the separate Future\_funk URL is only a redirect to this)](<https://en.wikipedia.org/wiki/Vaporwave>)
- [Hiroshi Nagai (born 1947): tropical, clear landscapes for Eiichi Ohtaki's sleeves; Hockney and Americana influences; acknowledged influence on vaporwave](<https://en.wikipedia.org/wiki/Hiroshi_Nagai>)
- [A Long Vacation: released 21 March 1981; Nagai's cover](<https://en.wikipedia.org/wiki/A_Long_Vacation>)
- [City pop: the music being sampled and its 2010s online rediscovery, listing vaporwave and future funk as derivatives](<https://en.wikipedia.org/wiki/City_pop>)

---

<a name="vap-07"></a>

## vap-07 · Windows 95/98 desktop: dialogs, error cascade, setup wizard, Defrag

**Animated SVG** · build: **Easy** · impact: **5/5** · 1995-2000 (Windows 95, 98, NT 4), with Windows 3.1's Program Manager (1992) as an older variant. Revived by vaporwave covers, the browser parody Windows 93 (jankenpopp and Zombectro, released 1 November 2014), 98.css (Jordan Scales, 2020) and the game Hypnospace Outlaw (2019).

The grey bevelled interface everyone over thirty used: silver surfaces, navy title bars, teal desktop. Its set pieces are memes in their own right: the error dialog dragged into a trail of copies, the setup wizard with a segmented progress bar, the Disk Defragmenter's grid of coloured blocks, and the Solitaire win with bouncing cards.

**What it looks like**

- Raised bevel built from 1px lines: window edges are \#dfdfdf then \#ffffff on the top and left, \#808080 then \#0a0a0a on the bottom and right; sunken fields reverse the order
- Navy title bar (\#000080; Windows 98 adds a horizontal gradient to \#1084d0) with a bold white caption and three small square bevelled buttons for minimise, maximise and close
- Flat teal desktop (\#008080) with a bottom taskbar, a Start button at the left and a sunken clock tray at the right
- Modal error dialog: red circle with a white cross, one line of text, a centred 75x23 OK button with a dotted focus rectangle 4px inside its edge; repeated along a diagonal as a cascade
- Setup wizard: a tall picture panel on the left, text on the right, a row of Back, Next and Cancel buttons, and a progress bar made of separate navy blocks
- Defrag map: a dense grid of small rectangles in a handful of flat colours with a legend, recolouring in reading order
- Solitaire win: cards dropping from the top stacks and bouncing, each leaving a trail of its earlier positions
- Windows 3.1 variant: no taskbar; a Program Manager window containing child group windows of 32x32 icons with captions

**Palette.** From 98.css source: surface \#c0c0c0, highlight \#ffffff, light face \#dfdfdf, shadow \#808080, frame \#0a0a0a, title bar \#000080 to \#1084d0 (the same end colour appears in Wine's Windows defaults as 16,132,208), inactive title \#808080 to \#b5b5b5, link \#0000ff, text \#222222. Desktop teal \#008080. Tooltip yellow 255,255,192 (Wine table).

**Lettering.** MS Sans Serif bitmap at 8pt (98.css uses a recreation it calls Pixelated MS Sans Serif at 11px); bold for title bars. No anti-aliasing.

**Motion.** Error dialogs appear one by one down a diagonal; progress blocks fill left to right; Defrag cells recolour in reading order behind a moving cursor cell; cards bounce and leave trails; an hourglass flips.

**As a README header.** Animated SVG showing a teal desktop strip with one main window whose title bar is the project name. Pick one set piece per repo: a setup wizard whose steps are the install instructions; a Defrag map whose cells are the project's items (one block per file, recipe or test) with a legend of real counts; or an error cascade for a joke header. Taskbar buttons name the README sections. Real links go below, or the header is cut into several SVG images in a row, each wrapped in a Markdown link.

**How to build it.** The most SVG-native style in the family: everything is axis-aligned rects and 1px lines with shape-rendering=crispEdges, so files are tiny (10-30 KB). Bevels are four lines per control. Cascade: one dialog in &lt;defs&gt;, reused with &lt;use&gt; at offsets with staggered opacity keyframes. Progress and Defrag: rects with staggered fill or opacity animations using steps() timing. Solitaire trail: many &lt;use&gt; copies of a card revealed in sequence along a precomputed bounce path. Type: pixel-rect glyphs or an embedded subset of an open pixel font for a faithful look, or accept a system sans-serif at 11px. Draw at 2x so 1px detail survives scaling.

**Do not copy / caveats.** Do not use the Windows flag logo, the word Windows as a wordmark, the real Start button artwork, the Clippit character or the original icons and fonts; draw generic equivalents. Bevels, the grey palette, dialog layout and block maps are generic interface conventions. The teal default desktop is universally remembered and Wikipedia's Teal article repeats it, but the Wine colour table I read lists the background as grey, so I have no primary source for teal as the default. The Office Assistant article does not describe its speech balloon; that detail is from memory. Differs from existing style 3 (keygen dialog): that is a skinned custom window, this is stock system chrome.

**References**

- [98.css stylesheet: exact hex values, bevel construction as inset 1px shadows, title gradient, segmented progress indicator](<https://raw.githubusercontent.com/jdan/98.css/main/style.css>)
- [98.css documentation: standard button 75px by 23px, dotted focus border set 4px inside, status bar](<https://jdan.github.io/98.css/>)
- [Disk Defragmenter history: the Windows 95/98/Me version was licensed from Symantec; colour graph removed in Vista](<https://en.wikipedia.org/wiki/Microsoft_Drive_Optimizer>)
- [Microsoft Solitaire: written by intern Wes Cherry in 1988, shipped from Windows 3.0 (1990), cards by Susan Kare, cards fall and bounce on a win](<https://en.wikipedia.org/wiki/Microsoft_Solitaire>)
- [Office Assistant: introduced in Office 97; Clippit designed by Kevan Atteberry; removed in Office 2007](<https://en.wikipedia.org/wiki/Office_Assistant>)
- [Windows 93: the browser parody of Windows 9x that turned this chrome into an art style](<https://en.wikipedia.org/wiki/Windows_93>)
- [Program Manager: the Windows 3.x shell of icon groups in child windows, replaced by the Start menu and taskbar in Windows 95](<https://en.wikipedia.org/wiki/Program_Manager>)
- [Wine source, Windows 95 default system colours: title 0,0,128, gradient end 16,132,208, face 192,192,192](<https://goma.googlesource.com/wine/+/refs/tags/wine-990704/windows/syscolor.c>)

---

<a name="vap-08"></a>

## vap-08 · Blue Screen of Death / fatal exception

**Text / ASCII + SVG** · build: **Easy** · impact: **3/5** · Windows 3.1 (1992) turned the text-mode system-message screen from black to blue; the stop screen proper first appeared in Windows NT 3.1 (1993); redesigned with a sad face in Windows 8 (2012); Microsoft announced a black version on 26 June 2025.

> Also researched as [mach-14](mach.md#mach-14).

The most famous error screen in computing: light text on solid blue, filling the whole display. The Windows 95/98/Me version is rendered in 80x25 text mode, so it is one of the few internet-era icons that is already text art.

**What it looks like**

- Solid blue field edge to edge, no window chrome at all
- 9x layout: a short product name centred in an inverted bar (blue text on a light grey block), then centred paragraphs and a final line asking for a key press, with a blinking underscore cursor
- NT/2000/XP layout: left-aligned, an error name in capitals joined by underscores, advisory paragraphs, then a technical block with a STOP code followed by four hexadecimal parameters in brackets
- Hex values in the form 0x0000007B and driver file names with addresses
- Windows 8 and later: a large sideways sad-face emoticon, one sentence in a light sans, a percentage counter, and from 2016 a QR code

**Palette.** From Wikipedia: background \#0000A8 for NT 3.1-4.0 and \#000080 for Windows 2000-7; text first silver \#A8A8A8, later white \#FFFFFF; Windows 8 to early Windows 10 \#1A67B3; Windows 10 from version 1607 \#0078D7; the 2025 redesign is black.

**Lettering.** 9x: the VGA text-mode font at 80x25 (720x400). NT family: 80x50 text mode, then 640x480 from Windows 2000; Lucida Console in Windows XP to 7; Segoe UI from Windows 8.

**Motion.** Almost none, which is the point: a blinking cursor, or for the modern variant a percentage counting from 0 to 100 and then the real header fading in as the 'reboot'.

**As a README header.** Two forms. Text-only: an 80-column &lt;pre&gt; with the project name in a centred inverted bar made of full-block characters, a mock error paragraph that is really the project description, and a 'technical information' block listing version, counts and links as hex-style lines. SVG: the same layout on a blue rect with a blinking cursor; optionally the screen 'recovers' into a second panel showing the real header.

**How to build it.** As text it needs nothing but layout; it loses the blue, so the inverted title bar and the hex block have to do the recognising, and it is weaker for it. As SVG it is one rect, a few lines of monospace text (pixel glyphs or an embedded open pixel font for the faithful look) and one blinking rect animated with steps(). Under 10 KB.

**Do not copy / caveats.** Write your own wording; do not paste Microsoft's error text or put the Windows name in the inverted bar. An error screen as the first thing on a repo can read as 'this project is broken', so make the joke obvious in the first line. The layout convention and the colours are free to use. The description of the 9x layout (inverted product-name bar, centred paragraphs) is from memory of the screen; the article confirms the text mode and colours but I did not find that layout described in its text. In text-only form the score drops to about 2. Differs from existing style 5 (phosphor terminal): static, centred, blue, and a single message rather than a boot log.

**References**

- [Blue screen of death: history, text modes and resolutions, fonts, hex colours per version, QR code, 2025 change](<https://en.wikipedia.org/wiki/Blue_screen_of_death>)

---

<a name="vap-09"></a>

## vap-09 · Windows XP Luna: blue title bars and the green hill

**Animated SVG** · build: **Medium** · impact: **4/5** · 2001-2007 (Windows XP). Later variants: Royale (Media Center Edition 2005, October 2004) and Zune.

The first mass-market 'candy' interface: rounded blue title bars, a green Start button, a red close button and a desktop photo of a green hill under blue sky. Critics at the time called it a Fisher-Price interface; it is now core early-2000s nostalgia, sitting between Y2K and Frutiger Aero.

**What it looks like**

- Title bar 28px tall with 8px rounded top corners and a vertical blue gradient that is lightest at the very top edge and darkest in the last 2px
- White bold caption with a 1px dark-blue drop shadow
- Three 21px rounded-square caption buttons with a thin white outline: blue minimise and maximise, red-orange close with a white cross
- Cream dialog surface (\#ece9d8) with rounded buttons that have a near-white face and a 1px dark navy outline
- A taskbar in the same blue with a green pill-shaped start button at the left and a lighter blue tray at the right
- Pale yellow balloon tip with a rounded outline, a small info icon and a close cross, its tail pointing at the tray
- Desktop backdrop: one smooth green hill, deep blue sky, a few soft white clouds
- Green progress bar of small rounded blocks sliding left to right in a loop

**Palette.** From XP.css source: dialog surface \#ece9d8; title gradient rgb(9,151,255) at 0 percent, rgb(0,83,238) at 8, rgb(0,80,238) at 40, rgb(0,102,255) at 88, rgb(0,61,215) at 96-100; frame blues \#0831d9, \#166aee, \#001ea0, \#00138c; caption-button base \#0050ee; caption shadow \#0f1089; input border \#789dbc. Start-button green and close-button red are named by Wikipedia without hex values.

**Lettering.** Trebuchet MS bold for title bars (13px in XP.css), Tahoma for controls, both named by Wikipedia.

**Motion.** Progress blocks marching left to right in a loop; balloon tip popping up with a slight scale; clouds drifting very slowly.

**As a README header.** Animated SVG: a simplified green-hill backdrop (two gradient shapes and three blurred cloud ellipses) with one XP window titled with the project name, a balloon tip carrying the tagline, and a taskbar whose buttons are the README sections.

**How to build it.** Everything is gradients and rounded rects. The hill is two paths with linear gradients; clouds are ellipses under feGaussianBlur. The work is in the many small gradients per control; define each once in &lt;defs&gt; and reuse. Trebuchet MS and Tahoma exist on Windows and macOS but not reliably on Linux or mobile, so outline the title caption or embed an open substitute; body text can fall back to a system sans.

**Do not copy / caveats.** Do not embed or trace the actual Bliss photograph, and do not use the Windows flag or Start-button artwork; an original hill-and-sky drawing is fine. Blue gradient title bars and balloon tips are generic. White text on the lighter blue stops is borderline for contrast at small sizes; keep the 1px shadow.

**References**

- [Windows XP visual styles: Luna and its blue, olive and silver schemes, fonts, green Start and red close buttons, Royale, Zune, the Fisher-Price criticism](<https://en.wikipedia.org/wiki/Windows_XP_visual_styles>)
- [XP.css window stylesheet: title gradient stops, frame colours, 8px corner radius, Trebuchet MS](<https://raw.githubusercontent.com/botoxparty/XP.css/main/themes/XP/_window.scss>)
- [XP.css variables: surface and control colours](<https://raw.githubusercontent.com/botoxparty/XP.css/main/themes/XP/_variables.scss>)
- [XP.css sample dialog image, which I downloaded and viewed (title bar, caption buttons, OK and Cancel)](<https://github.com/botoxparty/XP.css/blob/main/docs/window.png?raw=true>)

---

<a name="vap-10"></a>

## vap-10 · Frutiger Aero and Web 2.0 gloss

**Animated SVG** · build: **Medium** · impact: **3/5** · About 2005-2013: Windows Vista (2006) and 7 (2009), Nintendo Wii, early smartphone icons; on the web the 'Web 2.0 look' of 2005-2008. Named in 2018 by Sofi Xian (formerly Sofia Lee) of the Consumer Aesthetics Research Institute; revived as an internet aesthetic from 2023.

The optimistic glossy decade: glass, water, sky and grass wrapped around technology. CARI lists skeuomorphism, glossy and transparent materials, humanist sans type and nature photography (aurora, bokeh, macro grass). Its web branch is the Web 2.0 look that Jonathan Nicol catalogued in 2006: glass buttons, reflections, starburst badges, rounded corners, gradients, big type and a lot of green.

**What it looks like**

- Glass button: a rounded rectangle with a vertical gradient and a lighter band across the top 40-50 percent that ends in a hard edge
- 'Wet table' reflection: the logo or screenshot mirrored directly below itself and faded to nothing within about half its height
- Starburst badge (a seal with 12-24 points) rotated a few degrees, carrying a word such as BETA or FREE
- Translucent window frame with a blurred backdrop showing through and a soft outer glow (Aero glass)
- Floating bubbles with a rim highlight, water droplets, lens flare, bokeh circles
- Sky-blue to white gradient background with a curved strip of green along the bottom; blurred aurora ribbons
- A large, friendly lowercase wordmark in a rounded sans with generous white space

**Palette.** Named rather than specified in the sources: white, sky blue and leaf green with orange and pink accents; Nicol calls green the unofficial colour of Web 2.0. One fully specified glossy button from 24 ways (2008): \#e9ede8 at the top, \#8c1b0b at 40 percent, \#ce401c at the bottom, border \#882d13, white text with a 1px black shadow. 7.css demonstrates a custom glass tint of \#805ba5.

**Lettering.** Humanist sans: Segoe UI on Windows, Myriad on Apple material. Wikipedia notes the Frutiger typeface gave the style its name but was not actually used in the major interfaces associated with it. Web 2.0 logos: rounded sans, lowercase, often two-tone.

**Motion.** Bubbles rising and wobbling; a shine sweeping across a glass button or progress bar; aurora ribbons undulating slowly; a gentle pulse on the badge.

**As a README header.** Animated SVG: sky gradient with a green curve along the bottom, a lowercase glossy wordmark with a faded reflection, a rotated starburst carrying the version, and a row of glass buttons for install, docs and so on (each button can be its own small SVG image wrapped in a Markdown link). Bubbles drift behind.

**How to build it.** The vector half is easy: gloss is two stacked gradients with a hard stop, the reflection is a flipped &lt;use&gt; under a gradient mask, the starburst is a generated polygon, bubbles are circles with radial gradients. The photographic half (aurora, grass macro, water, tropical fish) is what the style is remembered for and cannot be carried; blurred gradient ribbons via feGaussianBlur are a passable aurora and the rest has to be dropped. Glass blur works as a filter on a duplicated background region clipped to the window frame.

**Do not copy / caveats.** Without the photos it can look like a 2007 startup template rather than a tribute; the starburst badge and the reflection are what sell it. Do not use Windows or Apple logos or wallpapers. The generic gloss technique is free. The usual rounded-face example for Web 2.0 logos (VAG Rounded) is not confirmed by any source I opened. Pale-on-pale contrast is a risk.

**References**

- [CARI entry: about 2005-2013, defining traits; attribution lists Froyo Tam and Sofi Xian](<https://cari.institute/aesthetics/frutiger-aero>)
- [Wikipedia: named in 2018 by Sofi Xian, examples (Vista, 7, Wii), also called Web 2.0 Gloss, 2023 revival, the note about the typeface](<https://en.wikipedia.org/wiki/Frutiger_Aero>)
- [Jonathan Nicol, 'The visual design of Web 2.0' (21 October 2006): a contemporary catalogue of the look](<https://jonathannicol.com/blog/2006/10/21/the-visual-design-of-web-20/>)
- [24 ways, 'Shiny Happy Buttons' (18 December 2008): how the glossy button gradient is built, with values](<https://24ways.org/2008/shiny-happy-buttons/>)
- [7.css: a working reconstruction of Windows 7 Aero glass frames, buttons, progress bars and balloons](<https://khang-nd.github.io/7.css/>)

---

<a name="vap-11"></a>

## vap-11 · Classic Mac OS: 1-bit System 6/7 desktop

**Static SVG** · build: **Easy** · impact: **4/5** · 1984-1997 (System 1 to System 7; System 7 released 13 May 1991, final version 7.6.1 in April 1997). Revived by Poolsuite FM (Marty Bell; founded 2014, relaunched in 2019 with a classic-Mac-styled desktop) and by system.css.

Susan Kare's black-and-white Macintosh: pinstriped title bars, Chicago type, 32x32 icons and dithered greys. It is the calm, elegant counterpart to Windows 95, and the look Poolsuite wrapped around summer music.

**What it looks like**

- Window with a black outline and a hard black drop shadow offset to the bottom-right (2px in system.css), no blur
- Title bar filled with evenly spaced thin horizontal black lines, broken by a white gap holding the centred title, with a small square close box at the left
- Desktop in mid grey made from a 1px black-and-white checker dither
- White menu bar across the full width at the top with bold menu titles; the selected item inverted to white on black
- Rounded-rectangle buttons with a black outline; the default button has a second, thicker outline around it
- Alert box with a double-outline frame and an icon at the left
- 32x32 1-bit icons in the Kare manner: a compact computer, a trash can, a document with a folded corner, a wristwatch cursor
- Scroll bar with a dithered track, arrow boxes at the ends and a plain white thumb

**Palette.** Black \#000000 and white \#ffffff; every grey is a dither pattern. system.css adds \#A5A5A5 and \#B6B7B8 only for inactive and disabled states. System 7 introduced a colourised interface on colour machines (Wikipedia; not quantified).

**Lettering.** Chicago 12pt for menus and titles, Geneva 9pt for body, Monaco for monospace, all originally by Susan Kare. system.css uses recreations of Chicago and Geneva credited to @blogmywiki.

**Motion.** Optional and sparse: a window zooming open as a few expanding outline rectangles, the watch cursor's hands ticking, a progress bar filling with a dither pattern, icons appearing one by one. It looks finished with no motion at all.

**As a README header.** SVG of a small desktop: a menu bar whose menu titles are the README sections, one document window titled with the project name holding the description, and a row of desktop icons labelled with key facts. A text-only echo is possible too: a box-drawn window whose title bar is a run of horizontal-line characters either side of the name.

**How to build it.** Two colours, no gradients: rects, 1px lines and two &lt;pattern&gt; dithers (checker and stripes) with shape-rendering=crispEdges. Icons are 32x32 grids drawn as paths. It is safe in GitHub dark mode if the desktop sits inside its own frame. Type is the only issue: Chicago is proprietary, so set titles in a small original bitmap alphabet drawn as paths, or embed a subset of an open recreation whose licence you have checked. Under 20 KB.

**Do not copy / caveats.** Do not use the Apple logo, the Happy Mac, Clarus the Dogcow, the Finder face or Kare's actual icon bitmaps; draw original icons in the same 1-bit manner. Do not ship Chicago. The pinstripe title bar, dithers and rounded buttons are generic. 1px detail vanishes if GitHub scales the image down, so design at the display width or at 2x. Poolsuite's pastel tint is my recollection; the article does not describe its colours. The imgur screenshot in the system.css README was blocked in my region, so the description rests on its documentation and stylesheet.

**References**

- [system.css: a CSS reconstruction of System 6 (title bars, buttons, dialogs, alert boxes, fonts)](<https://sakofchit.github.io/system.css/>)
- [system.css source: two-colour variables, 2px hard shadow, striped title bar, checker dither built from gradients](<https://raw.githubusercontent.com/sakofchit/system.css/main/style.css>)
- [Susan Kare: Chicago, Geneva and Monaco, the 32x32 icons including the Happy Mac, Clarus and the bomb, later the Windows 3.0 Solitaire deck](<https://en.wikipedia.org/wiki/Susan_Kare>)
- [System 7: release date, colourised interface, longevity](<https://en.wikipedia.org/wiki/System_7>)
- [Poolsuite (formerly Poolside FM): classic-Mac-styled desktop as a brand, from the 2019 relaunch](<https://en.wikipedia.org/wiki/Poolsuite>)

---

<a name="vap-12"></a>

## vap-12 · Geocities homepage / web 1.0

**Text / ASCII + SVG** · build: **Easy** · impact: **4/5** · 1994-2001 amateur web (GeoCities ran 1994-2009; the US service closed October 2009); revived on Neocities and as 'webcore' in the early 2020s.

The personal homepage before templates. Olia Lialina's 2005 essay A Vernacular Web calls the mid-90s web "bright, rich, personal, slow and under construction" and catalogues its parts in sections on construction signs, starry-night backgrounds and free collections of web elements. The 88x31 button, popularised by Netscape's and Microsoft's 'best viewed in' buttons during the browser wars, is its smallest unit.

**What it looks like**

- Tiled background: small white and coloured stars on black, with text in clashing bright colours on top
- 'Under construction' strip: yellow-and-black diagonal hazard stripes, a yellow diamond road sign with a digging figure, flashing amber lights
- A row or block of 88x31 buttons with 1px borders: 'best viewed with' notes, screen-resolution notes such as 800x600, software badges, site buttons
- Odometer hit counter: white or green digits in individual black cells after a line announcing the visitor number
- Webring navigation: a bordered box with Previous, Random and Next links around a ring name
- Horizontal rule made from an animated rainbow or flame bar; a spinning envelope for e-mail; a centred serif welcome line
- A scrolling marquee line and a blinking 'NEW!' starburst
- Guestbook links: Sign and View

**Palette.** Pure web-safe primaries on black: \#000000 background with \#FFFF00, \#00FF00, \#FF00FF, \#00FFFF, link blue \#0000FF, visited purple \#800080 and red \#FF0000 (standard HTML colours; my selection, not a sourced palette). Hazard yellow and black for construction.

**Lettering.** Browser defaults: Times New Roman for body, Comic Sans MS and Arial for the adventurous; centred, in several sizes and colours per line. 3D lettering from free logo generators. Tiny pixel type inside 88x31 buttons.

**Motion.** Everything that can move does, in 2-4 frame loops: blinking NEW, rotating envelope, marching hazard stripes, marquee scrolling right to left, counter digits rolling, twinkling star tile.

**As a README header.** Best as a kit rather than one image. A banner SVG (starfield tile, a centred serif welcome line, construction strip, marquee tagline); then real Markdown links wrapped around a row of separate 88x31 SVG badges (licence, language, a 'best viewed with a terminal' joke, build status); a hit-counter SVG showing a real number such as stars or items; and a webring-style box of Previous and Next links to related repos, which can be plain text in a &lt;pre&gt;. The badges being individually clickable is something no other style offers.

**How to build it.** 88x31 badges are trivial SVGs (a rect, a 1px border, pixel text, optionally a 2-frame blink using steps() keyframes) at 1-2 KB each. Starfield: a &lt;pattern&gt; tile with a few dots whose opacity animates. Hazard stripes: a diagonal pattern with an animated patternTransform. Marquee: a &lt;text&gt; translated across a clipPath. Counter: digit cells with vertically translating digit strips. GitHub strips the HTML marquee and blink tags, so all motion must live inside the SVGs.

**Do not copy / caveats.** Do not reuse real archived buttons, GIFs or site names (many carry brand logos such as Netscape or Internet Explorer); make original badges in the format. The format, the construction motif, counters and webrings are free. Taste risk is the point, but keep it to one screen: blinking everywhere is tiring and must respect prefers-reduced-motion. Clashing colours on black need a contrast check. Comic Sans exists only on some systems. The Web badge article does not connect 88x31 to GeoCities specifically.

**References**

- [Olia Lialina, 'A Vernacular Web' (January 2005): introduction, with sections on Under Construction, The Starry Night Background and Free Collections of Web Elements](<http://art.teleportacia.org/observation/vernacular/>)
- [One Terabyte of Kilobyte Age (Lialina's GeoCities Research Institute): ongoing research on the rescued GeoCities archive](<https://blog.geocities.institute/>)
- [Cameron's World (Cameron Askin, with Anthony Hughes and Robin Hughes): a collage built from archived GeoCities text and images](<https://www.cameronsworld.net/>)
- [The 88x31 GIF Collection: states 4540 buttons](<https://cyber.dabamos.de/88x31/>)
- [Web badge: 88x31 popularised by Netscape and Microsoft 'best viewed in' buttons; 80x15 as another common size; early-2020s revival via Neocities](<https://en.wikipedia.org/wiki/Web_badge>)
- [Jason Scott's under-construction wall: 940 images (my count of the page's image tags) saved from GeoCities by Archive Team; plain HTTP only](<http://www.textfiles.com/underconstruction/>)
- [Webring: Sage Weil's CGI script (May 1994) and WebRing company (June 1995); previous and next navigation](<https://en.wikipedia.org/wiki/Webring>)
- [GifCities: the Internet Archive's search engine over GeoCities GIFs](<https://gifcities.org/>)

---

<a name="vap-13"></a>

## vap-13 · Winamp classic skin: player, equaliser, playlist

**Animated SVG** · build: **Medium** · impact: **5/5** · Winamp 0.20a April 1997, 1.0 June 1997, 2.0 September 1998, 2.9x through 2003 (Justin Frankel and Dmitry Boldyrev, Nullsoft); classic bitmap skins. Preserved by Webamp and the Winamp Skin Museum (Jordan Eldredge, 2020; about 65,000 skins gathered with the Internet Archive).

> Same style as [trk-11](trk.md#trk-11), researched twice. Kept here for the extra detail.

The MP3-era player: three small windows, each a bitmap skin. Wikipedia describes the default as a dark grey rectangle with silver 3D transport buttons, a red and green volume slider and the time in a green LED font, with the track title scrolling as a marquee. It is the natural answer to 'where are the chiptune ones' inside this family: a music player with no sound.

**What it looks like**

- Main window at 275x116 pixels with a 14px title strip: the name centred between two runs of pale gold pinstripes, and tiny 9x9 buttons at the ends
- A black inset display at the left: a play-state glyph, large green segment-style time digits, and beneath them a spectrum analyser of narrow bars graded green to yellow to red with separate peak caps
- A black strip at top right with the scrolling title in tiny capitals 5 pixels wide, and below it small kbps and kHz readouts with mono and stereo indicators
- A long thin seek bar with a gold rectangular thumb; short volume and balance sliders whose groove colour changes with level (orange at the sampled setting)
- Five bevelled silver-grey transport buttons (previous, play, pause, stop, next) plus eject, shuffle and repeat toggles, and small EQ and PL toggles
- Equaliser window: ON, AUTO and PRESETS buttons, a preamp slider plus ten band sliders labelled 60, 170, 310, 600, 1K, 3K, 6K, 12K, 14K, 16K, with +12, 0 and -12 dB marks and a small response-curve graph
- Playlist window: a black list with bright green entries in the form number, artist, title and right-aligned time; the current track in white, the selected row under a solid blue bar; ADD, REM, SEL, MISC buttons and a total-time readout along the bottom

**Palette.** Sampled by me from the Webamp screenshot of the default skin (approximate): body dark blue-grey \#33344e to \#2e2e46, displays \#000000, playlist text bright green (about \#29fd2f as rendered), selection bar \#061ac3, volume groove \#d77c2d. Skins define 23 visualiser colours in viscolor.txt (skin creation guide).

**Lettering.** Bitmap fonts baked into the skin: text.bmp (tiny capitals for title, kbps, kHz; 5px character width in Webamp's source) and numbers.bmp (the time digits). All caps, no anti-aliasing.

**Motion.** Spectrum bars bouncing with slower-falling peak caps; title marquee scrolling right to left; time counting up; seek thumb creeping; stereo indicator lit; optionally the EQ sliders settling into a curve at load.

**As a README header.** Animated SVG of the three windows at 2x or 3x scale, stacked or with the playlist beside the player. The marquee scrolls 'project name - tagline', the kbps and kHz readouts become two real numbers (version, item count), the analyser dances, and the playlist is the table of contents: each line a README section with a 'duration' that is a real metric. If the playlist is cut into its own image rows, each row can be a Markdown link.

**How to build it.** All rects at integer coordinates with crispEdges, then scaled. Analyser: about 19 bars, each a rect with scaleY keyframes on different durations so the pattern never visibly loops; peak caps as separate rects with slower easing; the green-to-red grading is one gradient applied through a mask. Marquee: a text group translated inside a clipPath. Digits: segment or pixel glyphs as paths. The labour is drawing an original skin (bevels, pinstripes, tiny buttons) and a small pixel alphabet; size stays well under 60 KB.

**Do not copy / caveats.** Do not copy the Winamp base skin pixel for pixel, the lightning-bolt logo, the Winamp or Nullsoft names, the llama tagline, or anyone's custom skin from the museum. The three-window layout, LED time, analyser and playlist conventions are generic. Fast bar animation should be dampened or frozen under prefers-reduced-motion. Overlap with existing style 3 (keygen dialog with spectrum analyser) is real: keep this one as the full three-window player with the playlist as navigation, and do not give both an identical analyser. The museum page returned only its title to my fetcher, so the skin count comes from Eldredge's blog post.

**References**

- [Winamp: version dates, authors, description of the classic interface, skins, the llama tagline](<https://en.wikipedia.org/wiki/Winamp>)
- [Webamp screenshot of the default skin with main, equaliser and playlist windows, which I downloaded and viewed](<https://raw.githubusercontent.com/captbaritone/webamp/master/packages/webamp-demo/images/preview.png>)
- [Webamp source: main window 275px by 116px, 14px title bar, 9px caption buttons](<https://raw.githubusercontent.com/captbaritone/webamp/master/packages/webamp/css/main-window.css>)
- [Webamp constants: equaliser bands 60 Hz to 16 kHz, character width 5, window size](<https://raw.githubusercontent.com/captbaritone/webamp/master/packages/webamp/js/constants.ts>)
- [Jordan Eldredge on launching the Winamp Skin Museum: about 65,000 skins, collected with the Internet Archive](<https://jordaneldredge.com/blog/winamp-skin-musuem/>)
- [Winamp skin creation guide (archived on textfiles.com's Discmaster): what each skin bitmap is for, 23 visualiser colours](<https://discmaster.textfiles.com/file/22417/XENIATGM53.iso/WinAMP/Skin Creator/help/instruction.html>)

---

<a name="vap-14"></a>

## vap-14 · Instant messenger window: MSN, AIM, ICQ

**Animated SVG** · build: **Easy** · impact: **4/5** · ICQ November 1996 (Mirabilis), AIM May 1997, MSN Messenger 22 July 1999; MSN 6.0 (July 2003) and 7.0 (April 2005) are the remembered versions. AIM closed 15 December 2017, Messenger in 2013 (China 31 October 2014), ICQ on 26 June 2024.

The after-school chat window: a contact list with coloured status markers and a conversation pane with display pictures, emoticons and a line saying the other person is typing. It is pure 2000s nostalgia and, unlike most of this family, it is fundamentally about text, so it can carry real README content as dialogue.

**What it looks like**

- Two-part layout: a narrow contact-list window (collapsible groups with counts, names with a status marker and a short personal message) beside a wider conversation window
- Conversation pane: a grey line naming the speaker, with the message indented on the next line in that sender's chosen colour and font
- Two square display-picture frames stacked at the right edge, each with a rounded border
- A formatting strip above the input box (font, emoticon and similar small buttons) and a Send button at the right of the input
- Status line at the bottom saying the other person is typing, with a small pencil glyph
- Toast notification sliding up from the bottom-right corner announcing that a contact has signed in
- AIM variant: a Buddy List of collapsible groups and away messages
- Whole-window shake as a 'nudge'

**Palette.** MSN 6-7 era: pale blue-to-white gradients in a soft blue frame, with green, amber and red status markers; AIM: grey chrome with yellow and blue accents. These are my descriptions of well-known interfaces; the Wikipedia articles give no colours. The surrounding XP window chrome can take its values from XP.css (\#ece9d8 surface, blue title gradient).

**Lettering.** Tahoma or MS Sans Serif for chrome; message text in whatever the user picked, with Comic Sans MS in a bright colour as the period cliche. Text emoticons such as :) .

**Motion.** Messages appear one at a time with an 'is typing' pause between them; a toast slides up and fades; one nudge shakes the whole window for half a second; a status marker switches from away to online. The animation ends on a stable frame with all messages visible.

**As a README header.** Animated SVG conversation in which a fictional contact asks what this is and the project answers in three or four short messages (what it is, how to install, a number or two). The contact list at the side shows the README sections as 'online' contacts, with personal messages as one-line descriptions. Ends on a stable frame with everything visible, so a viewer who arrives late still reads it all.

**How to build it.** Rounded rects, light gradients and text. Message sequencing is opacity keyframes with staggered delays and animation-fill-mode: forwards so the final state persists. Nudge is a short translate shake on the root group. Text can be real &lt;text&gt; in a system sans since nothing depends on pixel-exact type; SVG text does not wrap, so the generator must break lines itself and keep them short.

**Do not copy / caveats.** Do not use the MSN butterfly, the two-figure Messenger logo, the AIM running man, the ICQ flower or the product names as wordmarks; draw a neutral status dot and a generic person glyph. Invent the contact names and avoid any suggestion that real people said these things. Unconfirmed: which MSN version introduced the nudge (the article does not say and Wikipedia's Nudge page is only a redirect), the ICQ flower status icon (not described in the article text I read), and all colours. Comic Sans is present only on some systems.

**References**

- [MSN Messenger: version timeline (1.0 in 1999; 6.0 custom emoticons, display pictures and backgrounds; 7.0 winks; 8.0 rebrand), shutdown dates](<https://en.wikipedia.org/wiki/MSN_Messenger>)
- [AIM: May 1997 release, Buddy List, away messages, the yellow running-figure mascot by JoRoan Lazaro, closure in December 2017](<https://en.wikipedia.org/wiki/AIM_(software)>)
- [ICQ: Mirabilis, November 1996, numeric UINs, shutdown 26 June 2024](<https://en.wikipedia.org/wiki/ICQ>)
- [XP.css: the window chrome these clients sat in](<https://raw.githubusercontent.com/botoxparty/XP.css/main/themes/XP/_window.scss>)

---

<a name="vap-15"></a>

## vap-15 · Y2K / cybercore: techno type, orbit lines and chrome

**Animated SVG** · build: **Hard** · impact: **3/5** · Roughly 1996-2004. Wikipedia says late 1990s and early 2000s; CARI's page says early to late 1990s; the Y2K Aesthetic Institute blog (Evan Collins and Froyo Tam) covers about 1992-2007. 'Cybercore' is the later tag used to separate the futurist look from general 2000s fashion.

The millennium's idea of the future: metallic and translucent materials, blobjects such as the iMac G3, and dense techno graphic design. Wikipedia describes bright colours such as lime, orange and hot pink against white and chrome. The Designers Republic, who designed Warp sleeves and the marketing and artwork for the game Wipeout, are the usual typographic reference.

**What it looks like**

- Liquid-metal blobs, rings and pills with hard white highlights and a dark reflected band
- Translucent candy-coloured plastic panels with visible inner structure
- Thin technical line work: crosshairs, concentric circles, registration marks, barcodes, arrows, tiny numerals
- Wide, squared, extended sans lettering with cut corners; tiny pixel captions; stacks of invented corporate marks and slogans
- White or silver backgrounds with lens flares and soft radial glows, or deep blue with thin orbit ellipses
- Lozenge and pill frames everywhere; icons inside circles

**Palette.** Wikipedia: lime, orange and hot pink against sleek white and metallic chrome. No hex values in the sources; icy blue and silver as equally typical is my addition.

**Lettering.** Extended squared techno sans, rounded 'bubble' display faces, and low-resolution pixel fonts for captions. Logotypes are wide, geometric and often set inside an ellipse.

**Motion.** Slow orbiting rings, a rotating crosshair, a highlight travelling around a chrome ring, scanning lines, numerals counting; smooth and weightless rather than glitchy.

**As a README header.** Animated SVG built from the graphic-design half of the style rather than the 3D half: white or pale-blue ground, the project name in wide squared capitals inside a lozenge, orbit rings and crosshairs turning behind it, a column of small technical captions carrying real data (version, counts, build), and one chrome ring as the accent.

**How to build it.** The defining objects are ray-traced: liquid chrome and translucent plastic depend on reflections an SVG cannot compute. A chrome ring or pill can be faked with a multi-stop gradient (white, light grey, a near-black band, mid grey, white), and feSpecularLighting adds a usable highlight to simple shapes, but free-form blobs look wrong. The line-work and type layer is easy and carries the period well. Embedding a rendered bitmap as a data: image is possible but heavy and static. Squared techno lettering needs outlining or an embedded open font.

**Do not copy / caveats.** Half the look is unavailable, so set expectations: this becomes 'techno poster', not 'chrome blob'. Do not imitate Designers Republic logos, Wipeout team marks or any real brand; invent the fake-corporate marks. The date range is genuinely inconsistent between sources. Thin grey lines on white need enough weight to survive scaling. The 'Eurostile tradition' label for the lettering is my description, not sourced here.

**References**

- [Y2K aesthetic: materials, colours, blobjects, the iMac G3 example, cybercore as a distinguishing term, The Designers Republic association](<https://en.wikipedia.org/wiki/Y2K_aesthetic>)
- [Y2K Aesthetic Institute blog: the primary image archive, run by Evan Collins and Froyo Tam](<https://y2kaestheticinstitute.tumblr.com/>)
- [CARI entry crediting Collins, Tam and Terrell Davis](<https://cari.institute/aesthetics/y2k-aesthetic>)
- [The Designers Republic: Sheffield studio, Warp Records sleeves (Autechre, LFO, Aphex Twin)](<https://en.wikipedia.org/wiki/The_Designers_Republic>)
- [Wipeout (1995): marketing and artwork by Keith Hopwood and The Designers Republic](<https://en.wikipedia.org/wiki/Wipeout_(video_game)>)

---

<a name="vap-16"></a>

## vap-16 · Glitch art: databend, channel split, slice displacement

**Animated SVG** · build: **Medium** · impact: **3/5** · Roots in video art (Nam June Paik's magnet on a television, 1965); a named scene from the 2000s (Oslo symposium 2002, GLI.TC/H in Chicago 2010); datamoshing in Takeshi Murata's Monster Movie (2005) and in 2009 music videos for Chairlift and Kanye West; Rosa Menkman's A Vernacular of File Formats and Kim Asendorf's pixel-sorting script, both 2010.

Using digital or analogue errors on purpose. Wikipedia lists the techniques: databending (editing a file's bytes), datamoshing (removing key frames so motion smears one image into another), misalignment, misregistration and compression-artefact abuse. Menkman's point, that each file format breaks in its own recognisable way, is what makes it a vocabulary rather than noise. For README.NFO it is a treatment laid over another style, not a style of its own.

**What it looks like**

- Horizontal slices of the image, 4-30px tall, displaced sideways by different amounts with hard edges
- RGB channel separation: red, green and blue copies offset a few pixels from one another
- JPEG-style 8x8 macroblocks: small squares of wrong colour or repeated texture in clusters
- Pixel-sort streaks: runs of pixels dragged vertically or horizontally into smooth comb-like smears starting at a brightness threshold
- Datamosh trails: a shape's colour dragging behind it in blocky steps as it moves
- Colour-table corruption: sudden bands of pure magenta, cyan and acid green
- Stutter: the same strip duplicated several times down the frame

**Palette.** Whatever the underlying style uses, plus the error colours: pure magenta \#FF00FF, cyan \#00FFFF, green \#00FF00 and black bands (standard primaries; my choice, not sourced).

**Lettering.** No native type; the treatment is applied to other lettering. Common pairing: a plain bold sans or monospace that is sliced and channel-split, with small hex or filename captions.

**Motion.** Bursts, not constant motion: the image is clean for 3-4 seconds, then 200-400 ms of slice displacement and channel split, then it snaps back. Step timing, never eased.

**As a README header.** A treatment more than a header: take a strong plain wordmark on a dark ground and glitch it on a timer. Above the fold is the project name, legible most of the time, with a burst every few seconds that slices it, splits its channels and drops a few macroblocks. It layers well on the VHS, terminal or neon styles and could be offered as a switch on any of them.

**How to build it.** Slice displacement: 6-10 &lt;use&gt; copies of the artwork, each clipped to a horizontal band and given translateX keyframes with steps() timing that are zero for most of the cycle. Channel split: feColorMatrix to isolate R, G and B into three copies, feOffset each, recombine with feBlend screen. Macroblocks: small rects toggled with opacity. feTurbulence plus feDisplacementMap gives organic tearing but is costly when animated; step it rather than tween it. Real pixel sorting and datamoshing operate on bitmaps and video and cannot be done live; they can only be imitated with pre-drawn streak shapes.

**Do not copy / caveats.** Accessibility is the main risk: rapid full-frame flashing can trigger photosensitive reactions, so keep bursts short, local and under three flashes per second, and freeze under prefers-reduced-motion. The techniques are free; do not reproduce specific artworks (Menkman, Murata, Asendorf and others). Overused as a lazy 'hacker' effect, and it overlaps the VHS entry's tearing and fringing, so use sparingly. I lowered its score from 4 because it is an overlay, not a header design.

**References**

- [Glitch art: definition, technique list, Paik 1965, Oslo 2002, GLI.TC/H 2010 and its organisers](<https://en.wikipedia.org/wiki/Glitch_art>)
- [Compression artifact, 'Artistic use' section (where the Datamoshing URL redirects): practitioners including Murata, and the Chairlift and Kanye West videos](<https://en.wikipedia.org/wiki/Compression_artifact>)
- [Takeshi Murata: Monster Movie (2005), made by datamoshing footage from a 1981 film](<https://en.wikipedia.org/wiki/Takeshi_Murata>)
- [Rosa Menkman: A Vernacular of File Formats (2010) and the Glitch Studies Manifesto](<https://en.wikipedia.org/wiki/Rosa_Menkman>)
- [ASDFPixelSort: Kim Asendorf's Processing script for threshold pixel sorting, dated 2010 in its README](<https://raw.githubusercontent.com/kimasendorf/ASDFPixelSort/master/README.md>)
- [MDN feTurbulence: the SVG noise primitive, with a displacement-map example](<https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feTurbulence>)
- [MDN baseFrequency: the attribute is marked animatable](<https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/baseFrequency>)

---

<a name="vap-17"></a>

## vap-17 · Memphis: squiggles, confetti and laminate

**Static SVG** · build: **Easy** · impact: **3/5** · Memphis Group founded by Ettore Sottsass in Milan on 6 December 1980; Sottsass left in 1985 and the group disbanded in 1987. Its graphics ran through pop culture from the mid 1980s to the mid 1990s and feed directly into vaporwave.

Postmodern Italian furniture design that became the wallpaper of a decade: clashing flat colours, asymmetric geometry and busy surface patterns on cheap plastic laminate. Sottsass's Bacterio squiggle print and the 1981 Carlton bookcase are the emblems. People remember it as the look of late-80s television sets, school folders and arcade carpets, and Wikipedia lists Memphis shapes among vaporwave's ingredients.

**What it looks like**

- Scattered short squiggles, zigzags and confetti dashes at random angles over a flat ground, none touching
- A dense field of small black worm-like marks on white or pastel (the manner of Sottsass's laminate print)
- Primitive shapes overlapping off-grid: circles, quarter-circles, triangles, stepped stairs, thick striped bars
- Black-and-white stripes or checks placed directly against saturated flat colour
- Terrazzo: irregular angular chips of several colours on a pale ground
- Hard offset drop shadows in solid black, 4-8px down and right; no gradients, no perspective

**Palette.** Flat and clashing: primary red, yellow and blue with pink, teal, mint and black-and-white patterning. The sources describe the palette without hex values. A common '80s' swatch set from Gridfiti: \#FF68A8, \#64CFF7, \#F7E752, \#CA7CD8, \#3968CB.

**Lettering.** Bold geometric sans capitals with letters individually tilted or coloured differently; heavy black outlines and offset shadows. Hand-cut and playful, never refined.

**Motion.** Optional: shapes jiggle or rotate a few degrees on staggered loops; confetti drifts; stripes scroll inside their shapes; letters bounce in one by one. It works fully static.

**As a README header.** SVG banner with a pastel ground covered in an original squiggle-and-confetti pattern, a few large overlapping primitives, and the project name in chunky tilted capitals with black offset shadows. Pattern tiles can be reused as section dividers. It needs a computing element (a window frame, a cursor, a floppy outline) to tie it to the tool.

**How to build it.** Pure flat vector: one &lt;pattern&gt; tile of short stroked paths for the squiggle field, a handful of shapes with solid fills, striped fills through a second pattern. No filters or gradients, so it is small (under 20 KB) and renders identically everywhere. Lettering should be outlined. A generator can vary it per repo by seeding the scatter.

**Do not copy / caveats.** Do not reproduce Bacterio or other named Memphis patterns or furniture designs: Bacterio is a current commercial product of Abet Laminati. Draw your own squiggle tile; the general vocabulary is free. On its own it reads as 1980s children's television rather than computing, which is off-theme for a scene-flavoured tool. It tips easily into the much-mocked Corporate Memphis illustration style; avoid people figures. Bacterio is usually dated 1978, before the group formed; I saw that date only in search results, not on a page I opened.

**References**

- [Memphis Group: founding date, members, traits, influence on mid-80s to mid-90s pop culture, vaporwave and 'Corporate Memphis'](<https://en.wikipedia.org/wiki/Memphis_Group>)
- [Ettore Sottsass: the Bacterio print and the Carlton bookcase (1981)](<https://en.wikipedia.org/wiki/Ettore_Sottsass>)
- [Abet Laminati: Bacterio is still sold as a current laminate, which is why it must not be copied](<https://abetlaminati.com/collections/bacterio-ettore-sottsass>)
- [CARI on Global Village Coffeehouse, the late-80s to mid-90s style that softened Memphis squiggles (useful for telling the two apart)](<https://cari.institute/aesthetics/global-village-coffeehouse>)

---

<a name="vap-18"></a>

## vap-18 · Cyberpunk neon signage

**Animated SVG** · build: **Medium** · impact: **4/5** · Blade Runner (1982) and the 1980s dense-city imagery it set; revived constantly since. Adjacent to hardvapour, whose cover art Wikipedia describes as cyberpunk, Matrix-inspired and built on surveillance-footage imagery.

Rain, darkness and stacked illuminated signs. Dave Addey's Typeset in the Future study of Blade Runner documents how much of that world is typography: real brand neon across the skyline, including a half-broken beer sign that appears twice; OCR-A on a video-phone booth; Eurostile Bold Extended on a police vehicle. The memorable device is the sign that is partly dead or flickering.

**What it looks like**

- Glass-tube lettering: a bright near-white core line 2-3px wide with a coloured halo, mounted on a dark panel with small standoffs
- Vertical signs stacked down the side of a building, mixing Latin capitals with kanji and katakana
- One letter or one stroke that is dead, or flickering irregularly while the rest stays steady
- Wet-street reflection: the signs mirrored below, stretched vertically and broken into streaks
- Dense small labels in a machine-readable face: serial numbers, warnings, arrows
- Rain as thin diagonal lines; haze that lifts the blacks toward blue-green
- One large billboard panel cycling two or three frames among the static signs

**Palette.** Near-black blue-green ground with saturated sign colours: hot pink or magenta, cyan, amber and red (my description; the source discusses type rather than colour values). SynthWave '84's \#ff7edb pink and \#36f9f6 cyan on \#262335 are a workable stand-in.

**Lettering.** Signage: single-stroke rounded script or monoline capitals, as the tube bending dictates. Labels: OCR-A and Eurostile Bold Extended, both identified in the film by Addey. CJK sign text in heavy gothic (sans) forms.

**Motion.** Irregular flicker on one tube (on, off, on, long on); a slow brightness wobble on the rest; rain streaks falling; reflection shimmering; a billboard cycling two or three frames.

**As a README header.** Animated SVG street-sign cluster: the project name as the main neon sign, two or three smaller vertical signs carrying the tagline and key numbers, a faint reflection below, light rain. One stroke of one letter flickers. Section headers further down can reuse a single small neon sign.

**How to build it.** Neon is a stroked path drawn three times: a wide blurred coloured copy (feGaussianBlur, stdDeviation 4-6), a narrower coloured stroke, and a thin white core. Flicker is an opacity keyframe list with uneven stops on one element. Reflection: a flipped &lt;use&gt; with a vertical scale, reduced opacity and a gradient mask. Rain: a pattern of short diagonal lines with an animated translate. Blur filters over large areas cost rendering time, so limit the filter region to each sign. Lettering must be monoline paths, which means a single-stroke alphabet drawn for the purpose; ordinary outlined fonts give a double line. CJK must be outlined or embedded as a subset.

**Do not copy / caveats.** Do not use real brand signs from the film, the Blade Runner title lettering, or Cyberpunk 2077's yellow-and-glitch branding. Decorative Japanese or Chinese on signs must be real, relevant text; using it as exotic texture is the genre's most criticised habit. The neon technique itself is free. Thin glowing strokes on dark pass contrast only at display sizes. Irregular flicker needs a prefers-reduced-motion rule.

**References**

- [Typeset in the Future: Blade Runner (Dave Addey, 19 June 2016), a frame-by-frame typographic study of the film's fonts, signage and brands](<https://typesetinthefuture.com/2016/06/19/bladerunner/>)
- [Hardvapour: the late-2015 vaporwave offshoot with cyberpunk, Matrix-inspired visuals](<https://en.wikipedia.org/wiki/Hardvapour>)
- [SynthWave '84 palette used here as a stand-in for sign colours](<https://raw.githubusercontent.com/robb0wen/synthwave-vscode/master/themes/synthwave-color-theme.json>)

---

## Considered and left out

- Seapunk (was a full entry; merged into classic vaporwave as optional props). Verified facts: a 2011 Tumblr subculture; term coined by Lil Internet in 2011; Ultrademon's album Seapunk in 2012; borrowed by Rihanna and Azealia Banks in November 2012; imagery described as rotating geometric shapes over bright blue or green water, drawn from 1990s 3D net art. Reason for dropping: the example image on Wikipedia, which I viewed, is a ray-traced ocean with iridescent marbled dolphins, a torus and a pyramid. That is a 3D render an SVG cannot carry, and a flat-vector homage reads as generic vaporwave. Its reusable props (dolphin, palm, floating primitives, aqua gradient) are listed in the classic vaporwave entry. One salvageable trick: an oil-slick texture from feTurbulence plus an animated hue rotation, clipped to a silhouette.
- Mallsoft (never a full entry; recorded here because the brief named it). Verified: Wikipedia defines it as the lounge-heavy strand themed on malls as empty spaces of consumerism, with Disconscious, Groceries, Hantasi and Cat System Corp. as its artists; Palm Mall (2014) is called the definitive release. Reason: its picture is a photograph or render of an empty 1980s-90s mall interior. An SVG could only offer a mall directory board or a storefront sign, which loses the point.
- Hardvapour (never a full entry; recorded because the brief named it). Verified: emerged late 2015 as a tongue-in-cheek, gabber-influenced reaction to vaporwave; visuals are cyberpunk, Matrix-inspired and surveillance-footage imagery with Eastern-European styling. Reason: visually it is a dark Cyrillic-lettered variant of the cyberpunk neon and glitch entries rather than a distinct look, and decorative Cyrillic with a fake Eastern-European persona is a taste risk. Not recommended as a header.
- Simpsonwave as its own style. It is copyrighted cartoon footage under a VHS grade; only the grade is reusable, and that is covered in the VHS entry.
- Utopian virtual (James Ferraro's Far Side Virtual, 2011). Its imagery is early 3D renders and device photos over low-resolution photography; what can be drawn overlaps Frutiger Aero / Web 2.0 gloss, so it is not a separate entry.
- Future funk's anime-loop strand. Looping clips from 1980s-90s anime are copyrighted and would need embedded bitmaps; only the city pop sleeve strand is kept.
- Fashwave. Wikipedia records a far-right offshoot from about 2015 that fused synthwave and vaporwave visuals with fascist symbols. It is excluded, and the vaporwave entry warns against sun-wheel, rune and crusader motifs so a header cannot be misread.
