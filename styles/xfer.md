# How the files moved

<sub>Generated from <code>styles.json</code> by <code>tools/build-styles.mjs</code>. 10 styles, researched 2026-09-30. Added in a gap-filling pass: checked by its own researcher only, not by a second reviewer. [Back to the catalogue](README.md) · [Full index](INDEX.md)</sub>

## Reviewer's summary

This family is the plumbing around a release, not the release itself: the screens people watched while files travelled. It falls into four schools. Dial-up (1984-1996) is 80x25 DOS text: the caller's terminal program with modem lines and a Zmodem box, the sysop's waiting-for-caller dashboard, and FidoNet echomail read in GoldED with its kludge, tear, origin and SEEN-BY lines. The topsite school (1998-2008) is pure ASCII over FTP and IRC: zipscript boxes, progress-bar directories, sitebot race lines and XDCC pack lists. The desktop school (1998-2008) is Windows grids: the two-pane FXP client, the P2P transfer window with per-file progress bars and chunk maps, and the SFV check. Forum signatures (userbars, 350x19) close the period and are the direct ancestor of README badges. Most of these are tables of names, sizes and counts, so they carry real README data with little invention.

## Styles

| ID | Style | Medium | Build | Impact |
| --- | --- | --- | --- | --- |
| [xfer-01](#xfer-01) | Topsite race: zipscript box, progress-bar directory and complete bar | Text / ASCII | Easy | 4/5 |
| [xfer-02](#xfer-02) | FidoNet echomail message in a GoldED reader (with the Russian CP866 variant) | Text / ASCII + SVG | Easy | 4/5 |
| [xfer-03](#xfer-03) | XDCC pack list: numbered packs, gets, sizes and the slots line | Text / ASCII | Easy | 3/5 |
| [xfer-04](#xfer-04) | Userbar kit: the 350x19 forum signature strip | Static SVG | Easy | 3/5 |
| [xfer-05](#xfer-05) | Terminal program session: modem lines, dialing directory and the Zmodem transfer box | Animated SVG | Easy | 4/5 |
| [xfer-06](#xfer-06) | Sitebot announce: bracketed race lines in the site channel | Animated SVG | Easy | 3/5 |
| [xfer-07](#xfer-07) | P2P client transfer window: results grid, per-file bars, chunk map and status bar | Animated SVG | Medium | 4/5 |
| [xfer-08](#xfer-08) | Sysop's waiting-for-caller screen: the BBS status dashboard | Text / ASCII + SVG | Easy | 3/5 |
| [xfer-09](#xfer-09) | FXP client: two site panes, a queue and a raw log | Animated SVG | Medium | 3/5 |
| [xfer-10](#xfer-10) | SFV file and check result (with an NFO viewer frame) | Text / ASCII + SVG | Easy | 2/5 |

---

<a name="xfer-01"></a>

## xfer-01 · Topsite race: zipscript box, progress-bar directory and complete bar

**Text / ASCII** · build: **Easy** · impact: **4/5** · 1998-2008, private FTP topsites running glFTPd (first public release early 1998) with the Project-ZS zipscript (development stopped 2002) and its successor pzs-ng (from April 2004)

A topsite is a private high-bandwidth FTP server where release groups pre and couriers race files for upload credits. After every uploaded file the server's zipscript checks it against the release's SFV and answers with a small ASCII box, and it keeps a fake directory in the listing whose name is a progress bar. Racers never saw a GUI for this: the site spoke to them in framed monospace text inside their FTP client's log.

**What it looks like**

- Per-file reply box about 52 columns wide: a top rule that starts with a full stop and carries the zipscript's name between '-==' and '==-', body rows that start with '\| + ' (SFV-file ok, CRC-Check ok, written in mixed case such as 'oK!'), and a closing rule that starts with a backtick and ends with an apostrophe
- The closing rule of the box embeds a bracketed bar built from '\#' for files present and ':' for files missing, followed by a bracketed done/total file counter
- A pseudo-directory in the file listing named as a progress meter: bracketed '\#'/':' bar, then 'NN% Complete', then the site's short name in brackets
- When the last file lands it is replaced by the complete bar: site tag, then in parentheses total megabytes with an M suffix, file count with an F suffix and the word COMPLETE, then the site tag again (audio releases add genre and year)
- Marker entries beside unfinished releases named '(incomplete)-&lt;release&gt;' and '(no-nfo)-&lt;release&gt;'
- Race statistics tables in a 70-column frame with letter-spaced headings ('U S E R T O P', 'G R O U P T O P'), rows of rank, name, megabytes, files, percent and KB/s, a dash-space-dash divider and a Total row
- Release directory names written as dotted words ending in a hyphen and the group tag
- Raw SITE commands typed by hand: site nuke &lt;dir&gt; &lt;multiplier&gt; &lt;reason&gt;, site dupe, site new, site who, site stat

**Palette.** Monochrome. It is FTP reply text, so it took whatever colours the client's log window used; nothing in the style depends on colour.

**Lettering.** 7-bit ASCII only, fixed width. Frames use . - = \| ` ' and the bar uses \# and : inside square brackets. Headings are capitals with a space between every letter; status words use scene mixed case. Numbers are right-aligned with unit suffixes M, F and KBs.

**Motion.** Static as text. An optional SVG version can fill the bar one '\#' at a time while the file counter ticks up, then swap the progress line for the complete bar.

**As a README header.** One &lt;pre&gt; block. First line is the repository written as a release directory (project.name.v1.4.0-AUTHOR). Under it a short listing of the real top-level files with sizes, then the complete bar carrying the true total size and file count, or a progress-meter line carrying a real percentage (test coverage, milestone progress). Below that a framed table in the USERTOP layout listing top contributors with commits, files touched and share, and a GROUPTOP table for languages or packages. File names can be links inside the &lt;pre&gt;. No SVG needed.

**How to build it.** Pure ASCII, under 72 columns, no box-drawing or block characters, so it renders identically in any font GitHub uses for &lt;pre&gt;. All the numbers come straight from the repository. The only design work is aligning the fixed-width columns.

**Do not copy / caveats.** Invent the site tag and every name: no real group tags, site names or release names, and replace the zipscript's product name in the box header with the project's own. The listing must contain only the project's own files so it cannot be read as an offer of pirated material. The frame and bar technique, the COMPLETE wording and the table layout are generic and free to reuse. I read the templates in source, not a captured session, so the way a given FTP client wrapped these lines with reply codes is not confirmed. Screen readers will read every punctuation mark.

**References**

- [Wikipedia, Topsite (warez): daemons used (glFTPd, DrFTPD, ioFTPD, RaidenFTPD), FlashFXP, Eggdrop sitebots, credit ratios (15 MiB upload earning 45 MiB), pre, nuke multipliers](<https://en.wikipedia.org/wiki/Topsite_(warez)>)
- [pzs-ng zipscript defaults: the exact default templates for the reply box, progress meter, complete bar, incomplete markers and USERTOP/GROUPTOP tables, and the '\#' and ':' bar characters](<https://raw.githubusercontent.com/pzs-ng/pzs-ng/master/zipscript/include/zsconfig.defaults.h>)
- [pzs-ng README: what a zipscript is, Project-ZS by Dark0n3 stopping in 2002, daxxar and psxc starting pzs-ng in April 2004](<https://raw.githubusercontent.com/pzs-ng/pzs-ng/master/README>)
- [glFTPd documentation: SITE command list (nuke with multiplier and reason, dupe, new, who, stat/statline, alup, wkup, gpal), ratio and credit rules](<https://glftpd.io/files/docs/glftpd.docs>)
- [Wikipedia, glFTPd: named after GreyLine, first public release early 1998, FXP and Eggdrop integration](<https://en.wikipedia.org/wiki/Glftpd>)
- [Wikipedia, Warez scene: NFO and SFV required in each release, nukes, dupes, PROPER and REPACK](<https://en.wikipedia.org/wiki/Warez_scene>)

---

<a name="xfer-02"></a>

## xfer-02 · FidoNet echomail message in a GoldED reader (with the Russian CP866 variant)

**Text / ASCII + SVG** · build: **Easy** · impact: **4/5** · 1986-2008. FidoNet software June 1984 (Tom Jennings), echomail February 1986 (Jeff Rush), echomail spec derived from Bob Hartman's Conference Mail manual of 12 December 1987; GoldED by Odinn Sorensen until 1999, then GoldED+; Russian Region 50 from 1990

Echomail was FidoNet's public conferencing: messages hopped between hobbyist BBSes overnight by modem, each system appending its address to the control lines at the bottom. The message therefore ends in a stack of machine-written lines (tear line, origin line, SEEN-BY, PATH) that every reader learned to recognise, usually with a one-line joke tagline just above them. In Russia and Ukraine the network outlived its Western peak by a decade and GoldED was the standard editor, nicknamed 'naked grandfather' from the sound of its name.

**What it looks like**

- Header window at the top of the screen with a thin border and titles set into the border: message number, From and To names starting at column 8 (36 wide), the node address at column 44 (16 wide), the date right-aligned in the last 20 columns, then the Subj line
- Addresses in the form zone:net/node.point, and dates in the fixed 'DD Mon YY  HH:MM:SS' form with two spaces before the time
- Quoted text prefixed by the quoted person's initials and a chevron (default pattern space, first initial, last initial, chevron, space), odd and even quote levels in two different colours
- Kludge lines, hidden by default and shown dimmed when switched on: MSGID with an address and an eight-digit hexadecimal serial, REPLY, PID, and CHRS naming the character set (for Russian mail 'CP866 2', formerly '+7\_FIDO')
- A tagline beginning with three dots directly above the tear line
- Tear line: three dashes, then optionally the editor's name and version
- Origin line: a space, an asterisk, 'Origin:', the system's name or slogan, and the full address in parentheses
- SEEN-BY lines listing net/node pairs (the net is dropped when it repeats) and a final PATH line of the systems the message passed through; a white-on-blue status row along the bottom

**Palette.** GoldED's shipped default: light grey text on black, light blue window borders, yellow titles on the borders, quotes alternating yellow and white, kludges, hidden lines and tagline in dark grey, tear line and origin in bright white, URLs light blue, selection bar and status line white on blue.

**Lettering.** 80-column DOS text mode. Western mail is CP437; Russian mail is CP866, which the FTSC charset standard lists as 'IBM codepage 866 (Cyrillic Russian)'. Echo names are upper case with dots (the GoldED+ screenshot shows tags such as RU.GOLDED and R50.SYSOP.INFO). Borders are single-line box-drawing characters.

**Motion.** Static. An optional SVG touch is the header window 'coming to life' field by field, which is how the GoldED manual describes starting a reply.

**As a README header.** The whole header is one message. Area = the repository name as an upper-case dotted echo tag; From = the author with an invented address; To = All; Subj = the one-line description; date = last release. The body is the README introduction, optionally with a quoted question ('what does it do?') in initials-and-chevron style. MSGID carries the short commit hash, which is already eight hex digits. Tear line = tool name and version; origin line = project slogan with the version number dressed as an address; SEEN-BY = supported platforms or runtime versions; PATH = the build pipeline stages; the tagline is the joke. As plain text it is a &lt;pre&gt; of about 20 lines; an SVG version adds the GoldED colours and the bordered header.

**How to build it.** The message is plain text by definition and fits 80 columns. Show the control-A as a caret-a or an at-sign, since the real control character cannot be displayed. Cyrillic is ordinary UTF-8 inside &lt;pre&gt;. The coloured version is a fixed character grid in SVG with about eight fills.

**Do not copy / caveats.** FidoNet is still a live network: do not use real node numbers or a real system's origin line. Use an invented zone outside the real ones (othernets did exactly this). The FTSC documents state that Fido and FidoNet are registered marks of Tom Jennings, so use neither the name as a brand nor the dog-with-diskette logo; put the project's own name on the tear line, not GoldED's. The line formats are published standards and free to use. That CP866 keeps its box-drawing characters at the same code points as CP437 is general knowledge I did not confirm from a source in this session. The Novosibirsk 1990 detail rests on Russian Wikipedia alone. I did not see a screenshot of GoldED's message view, only its area list, so the header layout comes from the manual's field positions.

**References**

- [FTS-0004 EchoMail Specification: AREA line, tear line, origin line, SEEN-BY and PATH lines with the control-A prefix](<http://ftsc.org/docs/fts-0004.001>)
- [FTS-0001: message header fields (fromUserName 36, toUserName 36, subject 72, 20-character DateTime)](<http://ftsc.org/docs/fts-0001.016>)
- [FTS-0009: MSGID and REPLY kludges with the eight-character hexadecimal serial](<http://ftsc.org/docs/fts-0009.001>)
- [FTS-5003: CHRS kludge and the list of character set identifiers including CP866 and the deprecated +7\_FIDO](<http://ftsc.org/docs/fts-5003.001>)
- [GoldED+ reference manual: header field positions, QUOTESTRING, TEARLINE length, VIEWKLUDGE/VIEWHIDDEN, the list of colourable reader elements](<https://raw.githubusercontent.com/golded-plus/golded-plus/master/manuals/gold_ref.txt>)
- [GoldED+ user manual: the chapter on tagline support and how the tagline sits above the origin line](<https://raw.githubusercontent.com/golded-plus/golded-plus/master/manuals/gold_usr.txt>)
- [GoldED+ default colour configuration](<https://raw.githubusercontent.com/golded-plus/golded-plus/master/cfgs/config/gedcolor.cfg>)
- [GoldED+ Russian CP866 message template shipped with the editor](<https://raw.githubusercontent.com/golded-plus/golded-plus/master/cfgs/template/rusCP866.tpl>)
- [Screenshot of the GoldED+ area list with Russian interface (2006)](<https://commons.wikimedia.org/wiki/Special:FilePath/Goldedplus-20060327-arealist.ru3.png>)
- [Russian Wikipedia, GoldED: Sorensen and Mueller, development ended 1999, Aganichev's GoldED+, the nickname](<https://ru.wikipedia.org/wiki/GoldED>)
- [Russian Wikipedia, FidoNet: first Soviet node in Novosibirsk in 1990, Region 50, nets 5000/5010/5020/5030](<https://ru.wikipedia.org/wiki/Фидонет>)
- [Wikipedia, FidoNet: founding dates, address format, echomail 1986, about 39,000 systems at peak, 50,000 points in 2006 mostly in Russia and Ukraine](<https://en.wikipedia.org/wiki/FidoNet>)
- [Wikipedia, Signature block: FidoNet origin lines, taglines and tear lines as the network's signature system](<https://en.wikipedia.org/wiki/Signature_block>)

---

<a name="xfer-03"></a>

## xfer-03 · XDCC pack list: numbered packs, gets, sizes and the slots line

**Text / ASCII** · build: **Easy** · impact: **3/5** · 1994-2008, IRC. XDCC began in 1994 as a script for the ircII client by Xabi; the listing format described here is the one produced by the iroffer bot

An XDCC bot is a file server living in an IRC channel. It periodically pastes its catalogue into the channel as numbered 'packs' with a download counter and size, and users fetch one by messaging the bot a pack number; if all slots are busy they wait in a queue. For anyone who downloaded from IRC, the double-asterisk header and the hash-numbered rows are instantly familiar.

**What it looks like**

- Every header line is wrapped in a pair of bold double asterisks
- Summary line: pack count, then 'N of M slots open', then optional comma-separated Queue a/b, Min and Max speeds and a transfer Record in kB/s
- A second line headed 'Bandwidth Usage' giving Current, an optional Cap and a Record
- An instruction line telling the reader which message to send to the bot to request pack x, and optionally a second one for pack details
- Pack rows: a bold hash and pack number, a right-aligned download count followed by a lower-case x, the size in square brackets with a one-letter unit, then the file name
- Optional per-pack tags in brackets (a minimum speed, downloads left) and an indented note line beginning with a caret and hyphen
- Footer: 'Total Offered' and 'Total Transferred' with byte totals on one line
- In the channel each line is a message from the bot's nickname, interleaved with join and part lines from users

**Palette.** Monochrome text with bold. The 2008 mIRC screenshot I viewed shows black text on white, the bot's advertising headlines in bold dark red and join/part lines in green.

**Lettering.** Whatever fixed or proportional font the IRC client used; the structure is carried by bold, asterisks, hash signs, square brackets and right-aligned numbers, so it survives as plain monospace. File names are dotted words.

**Motion.** Static as text. In SVG the rows can arrive one at a time as bot messages, and one download counter can tick up by one.

**As a README header.** A &lt;pre&gt; block that is the project's download table. Packs are the real release artefacts (wheel, source tarball, binaries per platform); the gets column is the real download count per asset; the bracketed size is the asset size; each file name links to its release asset. The instruction line becomes the actual install command. 'Slots open' can carry open issues over a limit, 'Record' the fastest CI run, 'Total Offered' the combined asset size and 'Total Transferred' lifetime downloads. It pairs with the existing mIRC window style if colour is wanted, but needs no window chrome.

**How to build it.** Pure ASCII rows under 80 columns. Bold cannot be relied on inside a code block, so either use &lt;pre&gt; with &lt;b&gt; tags, which GitHub allows, or let the asterisks and hash signs carry the structure. Data maps one to one onto GitHub release assets.

**Do not copy / caveats.** The Wikipedia screenshot shows real bot names and real film release names: copy none of them. List only the project's own files and make the request line a genuine install command, so the block cannot be mistaken for a warez advert. The listing layout is generic bot output and free to imitate. I confirmed the format from iroffer's source; the format of the original 1994 script was not examined.

**References**

- [Wikipedia, XDCC: 1994 ircII script by Xabi, bots advertising packs, the list and send commands, queues](<https://en.wikipedia.org/wiki/XDCC>)
- [iroffer source: the code that prints the summary, bandwidth and request-instruction lines](<https://raw.githubusercontent.com/dinoex/iroffer-dinoex/master/src/iroffer_admin.c>)
- [iroffer source: the pack row format (number, gets, size, description, per-pack tags, note line) and the Total Offered / Total Transferred footer](<https://raw.githubusercontent.com/dinoex/iroffer-dinoex/master/src/dinoex_admin.c>)
- [iroffer README: what the program is and that it serves files over IRC's DCC protocol](<https://raw.githubusercontent.com/dinoex/iroffer-dinoex/master/README>)
- [Wikipedia's screenshot of XDCC bots listing packs in a channel (layout and colour reference only)](<https://en.wikipedia.org/wiki/Special:FilePath/Xdccpacks.gif>)
- [Wikipedia, Timeline of file sharing: IRC 1988, client-to-client protocol added to ircII in 1990](<https://en.wikipedia.org/wiki/Timeline_of_file_sharing>)

---

<a name="xfer-04"></a>

## xfer-04 · Userbar kit: the 350x19 forum signature strip

**Static SVG** · build: **Easy** · impact: **3/5** · About 2005-2009, web forum signatures (the period is inferred from the examples; no dated origin was found)

Userbars were tiny banner images stacked in forum signatures to declare what you used, played or belonged to. Communities settled on a common template so that bars from different makers lined up, which makes them the direct ancestor of the row of badges at the top of a README. Anyone who posted on a forum in the mid-2000s remembers signatures that were five of these deep.

**What it looks like**

- A strip 350 pixels wide and 19 pixels high with a 1-pixel black border (I measured Commons examples at 350x19, 350x20 and 380x20, so the standard was loosely kept)
- A saturated left-to-right colour gradient as the background
- A logo or picture at the left, cropped by the strip and fading into the gradient
- Semi-transparent diagonal stripes running from lower left to upper right at 45 degrees across the whole bar
- A pale half-ellipse across the upper half giving a glass highlight
- A short upper-case caption at the right in a small pixel font, white with a 1-pixel black outline, not anti-aliased; the caption is nearly always '&lt;SOMETHING&gt; USER'

**Palette.** One hue per bar, usually a bright two-stop gradient (orange to red, cyan to blue, grey to silver), with white caption, black outline and black border. The stripes and gloss are white at low opacity.

**Lettering.** German and Polish Wikipedia both name the font as Visitor TT2 BRK at 13 pixels (12 pt), white, 1-pixel black outline, no bold, no anti-aliasing. It is a wide, square, all-capitals pixel face; letters are about 5 pixels tall with 1-pixel gaps.

**Motion.** Usually static PNG. Animated GIF versions existed; a restrained SVG equivalent is a highlight that sweeps across the bar once.

**As a README header.** A stack of two to five small SVGs directly under the title, each wrapped in a link, replacing shields-style badges: language and version, licence, build state, latest release, 'made with' the tool itself. Each is its own SVG file shown through &lt;img&gt; at 350x19 or exactly doubled. The caption holds the fact; the left-hand picture is a simple glyph drawn for the project, not a brand logo. A 150x19 short form suits narrow columns.

**How to build it.** One rect with a linear gradient, one &lt;pattern&gt; of diagonal lines at low opacity, one ellipse clipped to the bar for the gloss, a 1-pixel stroke, and the caption. The font cannot be loaded, so the caption must be drawn as small rectangles from a home-made 5-pixel-high capital alphabet, with the outline made by drawing the same shapes offset in black underneath. Use shape-rendering crispEdges and integer scaling so it stays sharp. Each file is a few kilobytes.

**Do not copy / caveats.** Both written sources are Wikipedia articles flagged as unsourced, and they agree with each other and with the files I measured, but no primary userbar-community page could be reached (the userbars.be domain no longer resolves). Do not embed or trace the Visitor font; draw original pixel letters. Real userbars nearly always carried a trademarked product logo: leave those out. At 19 pixels the text is too small on high-density screens, so ship a 2x version and keep strong contrast; give every image alt text since the caption is not selectable.

**References**

- [German Wikipedia, Userbar: 350 px wide, 19 px high, semi-transparent 45-degree stripes, Visitor TT2 (BRK) white 12 pt with 1 px black outline, PNG or GIF (the article is flagged as lacking citations)](<https://de.wikipedia.org/wiki/Userbar>)
- [Polish Wikipedia, Userbar: 350x19 or less often 150x19 with a 1-pixel black border, Visitor TT2 BRK 13 px, half-ellipse glass highlight on the top edge (flagged since 2009 as needing sources)](<https://pl.wikipedia.org/wiki/Userbar>)
- [Example userbar on Wikimedia Commons, measured at exactly 350x19, showing the stripes, pixel caption and border](<https://commons.wikimedia.org/wiki/Special:FilePath/Wikipedia-userbar.png>)
- [Example on Commons showing the half-ellipse gloss clearly (350x19)](<https://commons.wikimedia.org/wiki/Special:FilePath/Userbar_TiliX.png>)
- [Example on Commons measured at 350x20, showing gradient, left-hand picture and right-aligned caption](<https://commons.wikimedia.org/wiki/Special:FilePath/MacOsX-userbar.png>)

---

<a name="xfer-05"></a>

## xfer-05 · Terminal program session: modem lines, dialing directory and the Zmodem transfer box

**Animated SVG** · build: **Easy** · impact: **4/5** · 1984-1996, DOS. Hayes command set 1981; Qmodem by John Friel III from 1984; Telix by Colin Sampaleanu from 1986 (3.22 in January 1994, last DOS version 3.51 in May 1996); ZMODEM by Chuck Forsberg, 1986

This is the caller's side of a BBS: the program you ran at home to make the modem dial, show the remote screen and pull files down. Its three memorable moments are typing AT commands and reading the modem's one-word answers, picking a board from the dialing directory and watching the redial counter, and the pop-up box that counted bytes and characters per second during a Zmodem download. Telix's fast built-in Zmodem is what Wikipedia credits for its popularity.

**What it looks like**

- A black 80x25 screen where the program's start-up banner is followed by typed modem commands and their answers on separate lines: an init string, OK, a dial command, then CONNECT with a speed, or BUSY or NO CARRIER
- A one-row status bar across the bottom in a contrasting colour, divided into cells: a help-key reminder, the terminal emulation, speed and framing written as a compact code (for example 38400 N81) with FDX or HDX, and Online or Offline at the right
- Qmodem's version of that bar has seven areas: emulation, online state, speed and framing, a menu-key reminder, duplex, a group of nine single toggles, and a clock that shows elapsed time when connected
- An Alt-key command menu in a double-line frame, keys in bright yellow and labels in cyan on blue, grouped under centred rule headings Before, During, After, Setup and Toggles
- A dialing directory: numbered rows with name, number, connection method and line settings, tag marks on chosen entries, and a hint row along the bottom naming the keys
- A redial window with labelled lines for name, number, script, last connection and attempt count, plus a seconds-remaining countdown and single-letter keys to cycle, kill or extend
- The transfer box: a framed window titled with direction and protocol, holding a column of label and value pairs (file, path, bytes total, bytes received, blocks, block size, error count, efficiency, characters per second, time elapsed, time remaining, status messages) and a completion bar
- Just before the box opens, the raw Zmodem start string flashes on the terminal: the letters rz, then two asterisks and a header beginning B00

**Palette.** Telix 3.22 as seen in the screenshot: light grey text on black with a red status bar carrying yellow and white text. The Qmodem lineage: blue windows with white double-line frames, yellow key names, cyan labels and a grey hint row.

**Lettering.** IBM PC text mode, CP437, 80 columns. Single- and double-line box drawing for windows; label and value pairs aligned on a colon or a fixed column; modem dialogue in capitals.

**Motion.** Characters of the AT command typed one by one, a pause, the result word appearing, then the transfer box opening with its bar filling and the byte and CPS figures changing. All of it is stepped CSS animation on a character grid.

**As a README header.** Above the fold: an animated SVG of a short session. The 'modem' lines are the install command and its answer (typed command, OK, then CONNECT). The transfer box then opens with File set to the real release artefact, bytes total set to its real size, and the bar running to 100 percent. The bottom status bar holds version, licence and build state in its cells. Below the image, a plain-text dialing directory in &lt;pre&gt; lists the project's links (docs, issues, changelog, package index) as numbered entries with their addresses.

**How to build it.** A character grid with two or three colours. Typing is a stepped clip or per-character opacity keyframes; the progress bar is a rect whose width animates; changing numbers are stacked text elements shown in turn. The directory half is plain text and needs no SVG.

**Do not copy / caveats.** Telix and Qmodem are product names (the Qodem site states Qmodem is a trademarked commercial program): do not use either name or copy the Telix banner, which also shows real phone numbers. The transfer-box and redialer labels were read from Qodem, the modern reimplementation; I did not see the original Qmodem or Telix transfer windows, so treat the exact field set as the lineage's, not as a quotation of either program. Terminate, named in the brief, could not be confirmed from any source and is left out. AT commands and result words are a de facto standard and free to use.

**References**

- [Wikipedia, Telix: Colin Sampaleanu 1986, fast built-in Zmodem, SALT scripting, version dates](<https://en.wikipedia.org/wiki/Telix>)
- [Screenshot of Telix 3.22: banner, modem init lines with OK answers, red status bar with its cells](<https://en.wikipedia.org/wiki/Special:FilePath/Telix_3.22_screenshot.png>)
- [Wikipedia, Qmodem: John Friel III 1984, sold to Mustang Software 1991, protocols, QmodemPro 2.1 in 1997, the Qodem reimplementation](<https://en.wikipedia.org/wiki/Qmodem>)
- [Qmodem 4.6 test-drive user guide hosted by the Qodem project: the seven status-line areas and the modem result words the program recognises](<https://qodem.sourceforge.io/qmodem/qmodemtd.html>)
- [Qodem project page: a public-domain reimplementation of Qmodem, with phone book, Zmodem and status line described](<https://qodem.sourceforge.io/>)
- [Qodem source: the field labels of the upload and download status window](<https://codeberg.org/AutumnMeowMeow/qodem/raw/branch/main/source/protocols.c>)
- [Qodem source: phone book column header, redialer labels and key hints](<https://codeberg.org/AutumnMeowMeow/qodem/raw/branch/main/source/phonebook.c>)
- [Screenshot of the Qodem Alt-key command menu (frame, colours, grouping)](<https://en.wikipedia.org/wiki/Special:FilePath/Qodem_menu.png>)
- [Wikipedia, ZMODEM: Chuck Forsberg 1986, streaming, crash recovery, auto-start, 32-bit CRC](<https://en.wikipedia.org/wiki/ZMODEM>)
- [Forsberg's ZMODEM specification: the sender's rz string and the B00 header that triggers automatic download](<http://gallium.inria.fr/~doligez/zmodem/zmodem.txt>)
- [Wikipedia, Hayes AT command set: Heatherington and Hayes 1981, basic commands and result codes](<https://en.wikipedia.org/wiki/Hayes_AT_command_set>)

---

<a name="xfer-06"></a>

## xfer-06 · Sitebot announce: bracketed race lines in the site channel

**Animated SVG** · build: **Easy** · impact: **3/5** · About 2002-2008, invite-only IRC channels attached to topsites; the bot is an Eggdrop (first written December 1993 by Robey Pointer) running a Tcl announce script such as pzs-ng's dZSbot

Every topsite had a private IRC channel where a bot narrated the site's life one line at a time: a new directory appears, someone starts racing, the halfway mark, a new leader, completion with a hall of fame, a pre, a nuke. It is a sports commentary for file transfers, and the fixed-width tags in square brackets make a channel log read like a results ticker.

**What it looks like**

- Each line opens with the site's short name in bold, then a double colon separator
- A first bracket holding a lower-case event tag padded to six characters so the brackets align: new, racer, sfv, update, 50%, leader, done, stats, pre, nuke, unnuke, delete, wipe, req, filled, bwinfo, space, plus a jokey tag for a release going incomplete
- A second bracket holding the section name
- The release name, user names, counts and speeds in bold; connecting words in normal weight; clauses separated by double colons
- Race sentences in a fixed grammar: who is racing whom at what speed, who got the first file and how many megabytes are now expected, who leads with how many files and what percentage, the estimated time left
- The completion line (files, megabytes, duration, average speed, number of users and groups) followed by separate 'Users hall of fame' and 'Groups hall of fame' lines listing position, name, files, megabytes, percent and speed
- Nuke lines carrying a factor, the nuker, a bracketed reason label and a bracketed nukees label with each victim's megabytes
- Status lines on request: bandwidth in use (uploads, downloads, idlers, logins out of the maximum) and free space per section

**Palette.** mIRC's 16-colour palette on the client's own background. The default theme uses three colours, numbers 04, 07 and 11, which the mIRC colour table gives as red (255,0,0), orange (252,127,0) and light cyan (0,255,255), and lets each section override them (the shipped examples give games 05, 08, 12 and apps 06, 09, 13: brown, yellow, light blue and purple, light green, pink).

**Lettering.** Monospace or the IRC client's font; the alignment comes from the six-character padded tags. Bold and colour are IRC control codes. No art, no frames: only square brackets, double colons, slashes between user and group, and unit suffixes.

**Motion.** Lines arrive one after another from the bottom, as in any chat log: new, then racer, then the halfway line, then done and the hall of fame. A slow loop of six to ten lines is enough.

**As a README header.** A short ticker of real project events in the announce grammar: a 'pre' line for the latest release with its file count and size, a 'new' line for the newest pull request, a 'racer' line naming the contributors active this month, a 'done' line for the last CI run with its duration, a hall-of-fame line for top contributors, and a 'nuke' line for a deprecated version with its reason. Section brackets hold the component or package name. It works as monochrome text in &lt;pre&gt;; the SVG version adds the three theme colours and the line-by-line arrival. It should sit inside the existing mIRC window style or stand alone without chrome.

**How to build it.** Eight to ten text lines with tspans for bold and colour, each revealed by a delayed opacity keyframe and a stepped upward shift. No shapes at all. The plain-text fallback keeps all the information because the tags carry the meaning.

**Do not copy / caveats.** Invent the site tag, sections, users and groups; never use a real group or site name, and announce only the project's own releases so it cannot be read as a real pre channel. Drop the theme's cruder stock phrases. The bracketed-tag grammar is a generic convention and free to reuse. I read the templates, not a captured channel log, so how other bots (DrFTPD's, ioFTPD's) phrased their lines is not covered. Red and light cyan on a white background fail contrast; use a dark background.

**References**

- [pzs-ng default sitebot theme: every announce template (new, race, sfv, update, halfway, leader, complete with hall of fame, pre, nuke, bandwidth, free space) and the default colour numbers](<https://raw.githubusercontent.com/pzs-ng/pzs-ng/master/sitebot/themes/default.zst>)
- [Wikipedia, Topsite (warez): sitebots announce activity in private IRC channels and typically run Eggdrop](<https://en.wikipedia.org/wiki/Topsite_(warez)>)
- [Wikipedia, Eggdrop: written by Robey Pointer in December 1993, C core with Tcl scripts, oldest IRC bot still maintained](<https://en.wikipedia.org/wiki/Eggdrop>)
- [mIRC colour code table: the sixteen numbered colours and their RGB values](<https://www.mirc.com/colors.html>)
- [Wikipedia, Warez scene: pre, dupe, nuke, PROPER and REPACK as the events being announced](<https://en.wikipedia.org/wiki/Warez_scene>)

---

<a name="xfer-07"></a>

## xfer-07 · P2P client transfer window: results grid, per-file bars, chunk map and status bar

**Animated SVG** · build: **Medium** · impact: **4/5** · 1999-2008, Windows. Three generations: Napster (1 June 1999 to July 2001) and its contemporaries; the eDonkey network (2000) with eMule (13 May 2002), alongside Kazaa (March 2001) and Soulseek (April 2001); then BitTorrent (protocol released 2 July 2001) with Azureus and uTorrent (18 September 2005)

The window a generation left running overnight: a list of files, each with a progress bar, a speed and an estimate, above a second list of what you were giving back. Each generation added a layer of visible machinery: Napster showed one bar per file from one user, eMule painted every 9.28 MB chunk of the file by availability, and torrent clients added seeds, peers, ratio and a tabbed detail pane. People remember the colours of the bars as well as they remember the music.

**What it looks like**

- Shared skeleton: a row of section buttons or tabs at the top, the window split horizontally into downloads above and uploads below, sortable column grids, and a status bar of counts and rates
- 1999 generation, from the Napster 2.0 beta 7 screenshot: buttons for home, chat, library, search, hot list, transfer, discover and help; columns for file name, size written as bytes received of bytes total, user, status, the other user's line speed (14.4, 56K, Cable, DSL, Unknown), a boxed progress bar with the percentage centred in it, rate and time left; download bars blue, upload bars yellow
- The same screenshot's footer: concurrent download and upload counts, a 'clear finished' button, and a status bar giving files shared by you and the totals of files, gigabytes and libraries on the network
- ed2k generation, from the eMule 0.50a screenshot: large icon toolbar; columns for file name, size, completed, speed, progress, sources written as a number with a second number in parentheses, priority, status and remaining time; an upload pane with user, file, speed, transferred, waited and obtained parts; a 'clients on queue' counter
- eMule's chunk bar, per the official help: black for parts you have, red for parts missing in every known source, shades of blue for availability (darker means more sources), yellow for a part being downloaded, a thin green line along the top for total progress; a finished file turns solid green
- Soulseek's variant: no bars, whole rows of text coloured by state (finished, transferring with a percentage, remotely queued), with a 'place in line' column and a side list of chat rooms with user counts
- BitTorrent generation, from the uTorrent 1.8.3 screenshot: a category sidebar (all, downloading, completed, active, inactive, labels, feeds); columns for name, queue number, size, done, status, seeds, peers, down speed, up speed, ETA, uploaded, ratio, availability, label, added; a bottom pane with tabs General, Trackers, Peers, Pieces, Files, Speed, Logger; a status bar with a DHT node count and download and upload rates with totals
- Azureus splits incomplete torrents above complete ones and adds seeding rank and share ratio columns and round green status lights in the status bar

**Palette.** White list backgrounds with black text inside grey Windows chrome. Napster: mid-blue and yellow bars in a sunken white box. eMule: black, red, blue range, yellow and green in the chunk bar. Soulseek: green, blue and pale lilac row text. Kazaa: green and orange toolbar accents.

**Lettering.** Windows system sans-serif at small size (Tahoma or MS Sans Serif), plain column headers, right-aligned numbers, units as KB/s and MB. No display lettering anywhere: the data is the design.

**Motion.** Bars creep rightwards at different speeds, rate figures flicker between values, one row flips its status to complete and a queued row starts. In the chunk-map variant individual segments change from blue to yellow to black.

**As a README header.** One SVG window above the fold. Rows are the project's own parts: packages, modules or milestone items, each with its true size and a bar showing something real (test coverage, milestone completion, documentation coverage). 'Sources' becomes contributors per module; the chunk map becomes a strip with one segment per test or per file, coloured passed, failing, running and missing. The lower pane lists what the project 'uploads': releases with download counts. The status bar carries stars, forks and total downloads in the 'users online, files shared' slot. Three presets select the generation: single-bar, chunk-map, or seeds-and-ratio.

**How to build it.** Everything is rectangles and small text: a grid with header cells, one rect per bar with an animated width, and for the chunk map a row of 40 to 100 thin rects with staggered fill keyframes. The work is in the amount of small text and keeping it legible at README width (keep to five or six columns and four to six rows). Generic window chrome can be borrowed from the existing Windows 95/98 style.

**Do not copy / caveats.** Use no client name, logo or mascot, and none of the toolbar icons; the grid, bar and status-bar arrangement is generic. Rows must be the project's own files with no media-style file names, no tracker or server names and no real user names, so the header cannot look like a list of pirated downloads. The screenshots are of particular versions (eMule 0.50a, uTorrent 1.8.3 in Spanish, a Mac build of Azureus), so column sets varied by version. Small grey text on white needs care for contrast, and the eMule colour code relies on hue alone, so add a text percentage.

**References**

- [Wikipedia, Napster: Fanning and Parker, launched 1 June 1999, shut down July 2001, 26.4 million verified users in February 2001](<https://en.wikipedia.org/wiki/Napster>)
- [Screenshot of Napster 2.0 beta 7's transfer tab (columns, bars, footer and status bar)](<https://en.wikipedia.org/wiki/Special:FilePath/Napster_download_section.webp>)
- [Wikipedia, eMule: released 13 May 2002 by Merkur, 9,728,000-byte chunks, queue and credit system, High ID and Low ID](<https://en.wikipedia.org/wiki/EMule>)
- [eMule official help, 'Colors of the download bar': the meaning of black, red, blue shades, yellow and the green line](<https://www.emule-project.com/home/perl/help.cgi?l=1&rm=show_topic&topic_id=101>)
- [Screenshot of eMule 0.50a's Transfers window](<https://en.wikipedia.org/wiki/Special:FilePath/Emule_screenshot.png>)
- [Wikipedia, eDonkey network: created 2000 by Jed McCaleb and Sam Yagan, chunk hashing, overtaken by BitTorrent by 2007](<https://en.wikipedia.org/wiki/EDonkey_network>)
- [Screenshot of the Soulseek transfers window (colour-coded rows, place in line, rooms list)](<https://en.wikipedia.org/wiki/Special:FilePath/Soulseek.png>)
- [Wikipedia, Soulseek: Nir Arbel, April 2001, single-source downloads, rooms, wishlist](<https://en.wikipedia.org/wiki/Soulseek>)
- [Screenshot of Kazaa Media Desktop's search results grid and status bar](<https://en.wikipedia.org/wiki/Special:FilePath/Kazaa_screenshot.jpg>)
- [Wikipedia, BitTorrent: Bram Cohen, protocol designed April 2001 and released 2 July 2001; seeds, peers, swarm, tracker, pieces, rarest first](<https://en.wikipedia.org/wiki/BitTorrent>)
- [Wikipedia, uTorrent: Ludvig Strigeus, first public version 18 September 2005, acquired by BitTorrent Inc. in December 2006](<https://en.wikipedia.org/wiki/ΜTorrent>)
- [Screenshot of uTorrent 1.8.3 (sidebar, columns, detail tabs, status bar)](<https://commons.wikimedia.org/wiki/Special:FilePath/Utorrent_example.png>)
- [Screenshot of Azureus 2.5 (incomplete over complete lists, seeding rank, share ratio, status lights)](<https://commons.wikimedia.org/wiki/Special:FilePath/Azureus_2.5.0.0_screenshot.png>)

---

<a name="xfer-08"></a>

## xfer-08 · Sysop's waiting-for-caller screen: the BBS status dashboard

**Text / ASCII + SVG** · build: **Easy** · impact: **3/5** · 1989-1996, DOS BBS packages: RemoteAccess (Andrew Milner, Australia, 1989), Renegade (Cott Lang, June 1991, descended from Telegard and WWIV), WWIV

When nobody was connected, the BBS machine showed its owner a local console: today's numbers, lifetime totals, the last thing the modem said, and a grid of keys for maintenance. Callers never saw it; sysops stared at it for hours waiting for the phone to ring. It is a ready-made status dashboard, and the opposite view from the login and data screens already in the catalogue.

**What it looks like**

- Renegade: a solid blue screen with the clock at top left, the package title centred and the date at top right
- Four bordered panels in a row headed Today's Stats, System Averages, System Totals and Other Info, each a column of short labels with right-aligned numbers
- A black inset window titled Modem showing the raw initialisation string sent to the modem and its replies
- A centred one-line state message under it (initialising the modem, then waiting)
- A five-column grid at the bottom of commands with the hotkey letter in square brackets inside each word
- RemoteAccess: a stippled backdrop of shade characters with black windows framed in cyan double lines, each window's title set into the right end of its top border: Status (a single sentence), Modem (the last result word), Time, and a tall System window of label-colon-value lines ending in a block of ON/OFF switches
- RemoteAccess's bottom row is a key legend in letter-hyphen-word form, with an ALT group
- WWIV's version has three panels (activity and statistics, commands and last user, instance monitor) and a space-bar local logon

**Palette.** Renegade: blue background, green panel headings, white labels, cyan values, one value in red to flag waiting mail, yellow bracketed hotkeys, black modem window with grey text. RemoteAccess: black windows on a grey stipple, cyan frames, light grey text, white title row.

**Lettering.** 80x25 CP437 text. Single-line frames in Renegade, double-line in RemoteAccess. Labels are clipped abbreviations (Newusers, \# UL, Kb DL, Megs Free). Values right-aligned in a fixed column.

**Motion.** Mostly still. The clock ticks, the modem window prints its init string and OK, the state line changes from initialising to waiting, and optionally one counter increments as if a call had just ended.

**As a README header.** A dashboard header. Today's Stats holds commits, issues opened and closed, and pull requests merged in the last day or week; System Totals holds stars, forks, releases and downloads; System Averages holds per-week rates; Other Info holds version, licence, platform and open-issue count, with one number in the alert colour. The modem window shows the last CI command and its result. The state line reads as waiting for contributors. The hotkey grid becomes the README's navigation, with bracketed initials on Install, Usage, Config, Changelog and Licence; as plain text in &lt;pre&gt; those words can be links.

**How to build it.** A fixed character grid with five or six colours. The text version is a framed table of label and number pairs under 80 columns using Unicode box drawing; the SVG version adds the blue field and coloured values. Numbers can be regenerated by a scheduled workflow.

**Do not copy / caveats.** Put the project's name, not a BBS package's, in the title row, and do not copy the real board name visible in the RemoteAccess screenshot. The panel arrangement and bracketed-hotkey grid are generic. The WWIV layout comes from its documentation and was not seen as an image. PCBoard and Wildcat, the other big packages, were not researched. Cyan on blue is low contrast for small text; brighten the values.

**References**

- [Screenshot of Renegade's waiting-for-caller screen (panels, modem window, hotkey grid, colours)](<https://en.wikipedia.org/wiki/Special:FilePath/Renegade_BBS_Waiting_for_Caller_(WFC)_screen.png>)
- [Wikipedia, Renegade (BBS): Cott Lang, Turbo Pascal, June 1991, based on Telegard which was based on WWIV](<https://en.wikipedia.org/wiki/Renegade_(BBS)>)
- [Screenshot of RemoteAccess 2.62 waiting for a call (Status, Modem, Time and System windows, key legend)](<https://en.wikipedia.org/wiki/Special:FilePath/Remoteaccess.gif>)
- [Wikipedia, RemoteAccess: Andrew Milner, Wantree Development, 1989, JAM message base, last version 2.62 in 2000](<https://en.wikipedia.org/wiki/RemoteAccess>)
- [WWIV documentation, WFC page: the three panels, the list of statistics shown, function-key commands](<https://docs.wwivbbs.org/en/latest/wfc/>)

---

<a name="xfer-09"></a>

## xfer-09 · FXP client: two site panes, a queue and a raw log

**Animated SVG** · build: **Medium** · impact: **3/5** · 1998-2008, Windows. FlashFXP was started on 24 June 1998 by Charles DeWeese and first released on 23 July 1998

FXP is the trick of making one FTP server send a file straight to another while your own slow connection only issues the commands. The client built for it shows two remote sites side by side instead of 'local' and 'remote', a queue of pending transfers beneath one and a scrolling log of raw FTP dialogue beneath the other. Wikipedia's topsite article illustrates racing with exactly this: two sites lined up in FlashFXP.

**What it looks like**

- A four-quadrant window: two file lists on top, a transfer queue at bottom left and a status log at bottom right
- Each file pane has its own small toolbar and path box, and columns for name, size and date (the right pane adds attributes)
- A one-line summary strip under each pane giving counts of files and folders and naming the pane; the strip of the active side is tinted pale yellow
- Queue columns for name, target, size and remark
- Log lines each stamped with a bracketed time, showing library versions at start and then the raw command and numbered-reply exchange
- The characteristic FXP exchange in the log: a passive-mode request to one server, its 227 reply carrying six comma-separated numbers, then a port command carrying the same numbers to the other server
- A conventional menu bar whose entries include Session, Sites, Queue, Commands and Directory

**Palette.** Standard Windows greys with white list backgrounds and black text; small coloured toolbar icons; the pale yellow active strip. The log is plain black on white in the screenshot viewed.

**Lettering.** Windows system sans-serif for lists and menus; the log is the one place where monospace text suits. Sizes right-aligned; dates in numeric form.

**Motion.** Items leave the top of the queue one at a time while matching rows appear in the right-hand pane and the log scrolls a few command and reply lines per item.

**As a README header.** The left pane lists the repository's source tree (top-level folders and key files with sizes and dates); the right pane lists what a user ends up with (the installed package, the built output, or the release assets). The queue holds the roadmap or the install steps, with status in the remark column. The log is the quick-start: each install or build command shown as a command line and a numbered OK reply. Pane titles are invented site names for 'source' and 'dist'.

**How to build it.** Rectangles, lines and small text only, but there are four panes to fit into README width, so keep each list to five or six rows and three columns. Queue-to-pane movement is a set of delayed opacity keyframes. A text-only reduction is possible as two side-by-side columns in &lt;pre&gt; with the log underneath, in the manner of the existing twin-panel commander style, which is its closest relative.

**Do not copy / caveats.** Do not reproduce FlashFXP's name, logo, icons or exact toolbar; a two-pane layout with queue and log is generic. The only screenshot I could open is of version 4 from 2011, so the look of the 1998-2005 versions that racers used was not verified, and the vendor's own site refused the fetch. Use invented site names and list only the project's files. It overlaps with the catalogue's twin-panel DOS commander; its distinct parts are the queue and the raw log.

**References**

- [Wikipedia, FlashFXP: Charles DeWeese, started 24 June 1998, first release 23 July 1998, queue, site manager, later owners](<https://en.wikipedia.org/wiki/FlashFXP>)
- [Screenshot of FlashFXP 4 (four-quadrant layout, pane columns, queue columns, timestamped log)](<https://en.wikipedia.org/wiki/Special:FilePath/FlashFXP_4.png>)
- [Wikipedia, File eXchange Protocol: server-to-server transfer, the PASV and PORT sequence, the FTP bounce risk](<https://en.wikipedia.org/wiki/File_eXchange_Protocol>)
- [Wikipedia, Topsite (warez): racers line up two topsites in FlashFXP to move files between them](<https://en.wikipedia.org/wiki/Topsite_(warez)>)

---

<a name="xfer-10"></a>

## xfer-10 · SFV file and check result (with an NFO viewer frame)

**Text / ASCII + SVG** · build: **Easy** · impact: **2/5** · About 1996-2010. The .sfv file travelled with scene releases and Usenet posts; QuickSFV's site lists versions 2.35 and 2.36 in early 2008 and a rewritten 3.0 in July 2010; dedicated NFO viewers appeared because Windows editors mangled CP437 art

The last two steps after a download: open the NFO to read it, and run the SFV to prove every part arrived intact. An SFV is a tiny text file listing each file of a release with an eight-digit CRC-32 checksum, and a missing one got a release nuked. The file itself is the recognisable object: a few comment lines starting with semicolons, then a neat column of file names and hex.

**What it looks like**

- Comment lines beginning with a semicolon at the top of the file, used for a generator credit and date
- One line per file: the file name, whitespace, then eight hexadecimal digits
- File names that differ only in a numbered extension, so the left column is nearly identical down the page and the right column is the only thing that changes
- The check result as one row per file with a status word (OK, bad, missing) and a final tally of files checked
- The server-side equivalent on a topsite: the zipscript's one-line 'CRC-Check' verdict per uploaded file
- An NFO viewer as the frame: a plain window with a dark background, a fixed-width DOS font and the text centred in it, with clickable links

**Palette.** The file is monochrome text. Check results traditionally use green for good and red for bad or missing. Viewers default to light text on a dark ground; iNFekt lets text, background and block-art colours be set separately.

**Lettering.** Fixed width. Wikipedia notes that on Windows 95 the Terminal font at 11 pt in Notepad gave a good rendering of NFO art, and that viewers exist because browsers and proportional fonts break it. Checksums are eight hex digits, conventionally upper case in listings.

**Motion.** Static as text. In SVG the rows can be verified top to bottom, each gaining its status word in turn, ending on the tally line.

**As a README header.** A &lt;pre&gt; block that is a real checksum manifest of the latest release: semicolon comment lines give the project name, version and date, then each release asset with its true CRC-32 (or the first eight hex digits of its SHA-256, labelled as such). A closing line reports all files OK. It doubles as useful information for anyone verifying a download. The optional SVG wraps it in a simple viewer window and ticks the rows off. It sits naturally under the existing pure-text NFO style as its companion block.

**How to build it.** Two columns of ASCII; the checksums can be generated in the release workflow. The animated version is one text row per file with a delayed status word. Nothing here needs block or box characters.

**Do not copy / caveats.** DAMN NFO Viewer, named in the brief, could not be confirmed: its domain is parked and the download-site pages returned errors, so it is not used as a reference. I did not see a screenshot of QuickSFV's window, so the check-result layout is described only in general terms and should be designed fresh, not presented as that program's interface. If real checksums are shown they must be correct, and if a truncated SHA is used instead of CRC-32 say so. List only the project's own files.

**References**

- [Wikipedia, Simple file verification: the line format, semicolon comments, CRC-32, QuickSFV among the tools](<https://en.wikipedia.org/wiki/Simple_file_verification>)
- [QuickSFV's own site: a utility for creating and verifying SFV and MD5 files, with version history](<https://www.quicksfv.org/>)
- [iNFekt's site: an NFO viewer with rendered, classic and text-only modes, CP437 support, adjustable colours, clickable links and PNG export](<https://infekt.ws/>)
- [Wikipedia, .nfo: why dedicated viewers were needed, the Terminal font note, code page 437](<https://en.wikipedia.org/wiki/.nfo>)
- [Wikipedia, Warez scene: every release must include an NFO and an SFV or it is nuked](<https://en.wikipedia.org/wiki/Warez_scene>)
- [pzs-ng zipscript defaults: the server-side SFV and CRC verdict lines](<https://raw.githubusercontent.com/pzs-ng/pzs-ng/master/zipscript/include/zsconfig.defaults.h>)

---

## Research notes

- The task text gave two different counts (the brief asks for 7-10 styles, the closing line for 2-5). I returned ten, ordered by my own priority, strongest and most distinct first. If only five are wanted, take the first five: topsite race, FidoNet echomail, XDCC pack list, userbar kit, terminal session.
- The WebSearch budget for the session was already used up (200 of 200), so no searches were run. Everything was found by fetching known URLs directly, reading source files and documentation, and viewing screenshots downloaded from Wikipedia and Wikimedia Commons.
- Userbars, the item flagged as unconfirmed: the English Wikipedia article and the Russian one return 404, userbars.be no longer resolves, Know Your Meme returned 403 and web.archive.org could not be used. The German and Polish Wikipedia articles both exist and agree (350x19, Visitor TT2 BRK 13 px with a 1 px black outline, 45-degree stripes, half-ellipse gloss), but both are flagged as lacking citations. I measured five Commons examples: two are exactly 350x19, two are 350x20 and two are 380x20. No origin date or founding community was found.
- Not confirmed and left out: the Terminate terminal program (no page found at any URL tried) and DAMN NFO Viewer (domain parked, download-site pages 403 or 404). iNFekt and QuickSFV were confirmed from their own sites.
- Sources that refused fetches: flashfxp.com (403), softpedia (403), gitlab.com for Qodem (sign-in wall), and qodem.sourceforge.io for direct file downloads (bot challenge, not bypassed; its pages were readable through the normal fetch tool, and the source was read from Codeberg).
- The transfer-box and redialer field labels in the terminal style come from Qodem, a public-domain reimplementation of Qmodem, not from the original Qmodem or Telix binaries. The Qmodem status-line description comes from the original Qmodem 4.6 user guide hosted by the Qodem project.
- The topsite and sitebot styles rest on primary sources: the pzs-ng repository's default zipscript templates and default sitebot theme, and glFTPd's own documentation. No captured FTP session or channel log was available, so client-side wrapping of those lines is not verified.
- The XDCC format was confirmed twice: from the iroffer source code and from Wikipedia's screenshot of bots listing packs. That screenshot contains real bot and release names, which must not be copied.
- Russian FidoNet details (first node in Novosibirsk in 1990, Region 50, the GoldED nickname) come from Russian Wikipedia only. The CP866 charset identifier and the shipped Russian GoldED template are confirmed from the FTSC standard and the GoldED+ repository.
- Overlaps to watch when merging: the FXP client is close to the catalogue's twin-panel DOS commander; the sitebot and XDCC entries are meant to sit inside the existing mIRC window style without repeating its chrome; the P2P window can reuse the Windows 95/98 chrome; the SFV block is a companion to the existing pure-text NFO style.
- Working files and downloaded screenshots are in C:\\Users\\luked\\AppData\\Local\\Temp\\claude\\D--python-README-NFO\\ceb24e23-4d50-4a3b-af92-9f302ce95521\\scratchpad\\xfer (images in the img subfolder).
