# MediaLog — compact logo collection 06

[Open the actual-size gallery](gallery.html) · [Contact sheet](preview.png) · [Symbols](icons.png) · [Saved selection](draw.json) · [Project brief](project.json) · [Checks](qa.json)

Ten original graphic logos, designed for **203 × 74 pixels** (viewBox 812 × 296), each built around a book. Every style that MediaLog has not used yet is a text-screen style, which is ruled out, so this set returns to ten favourite graphic styles from collections 02 to 04 and redraws each one as a new, simpler symbol. Most symbols stand on their own with no tile or border. No ASCII or character art, and no animation. Primary #18223a and one plain wordmark throughout. The saved selection records the scope.

Each design includes a self-contained static SVG, a 64 × 64 icon-only SVG, and transparent 812 × 296 PNG exports for light and dark surroundings. Adaptive SVG colours follow the embedding page’s colour scheme. PNGs are browser exports of the SVG artwork.

| # | Logo | Book | Style | First used as | Files |
| --- | --- | --- | --- | --- | --- |
| 1 | [Chrome hardback](01-c64-12.md) | Closed book | [c64-12](../../styles/c64.md#c64-12) | [Chrome keepsake](../medialog-logos-02/17-c64-12.md), collection 02 | [SVG](assets/01-c64-12.svg) · [Icon](assets/01-c64-12-icon.svg) · [Light PNG](assets/01-c64-12-light.png) · [Dark PNG](assets/01-c64-12-dark.png) |
| 2 | [Sunset chapter](02-vap-05.md) | Open book | [vap-05](../../styles/vap.md#vap-05) | [The next chapter](../medialog-logos-03/01-vap-05.md), collection 03 | [SVG](assets/02-vap-05.svg) · [Icon](assets/02-vap-05-icon.svg) · [Light PNG](assets/02-vap-05-light.png) · [Dark PNG](assets/02-vap-05-dark.png) |
| 3 | [Glass pages](03-pc-13.md) | Open book | [pc-13](../../styles/pc.md#pc-13) | [Glass book](../medialog-logos-04/04-pc-13.md), collection 04 | [SVG](assets/03-pc-13.svg) · [Icon](assets/03-pc-13-icon.svg) · [Light PNG](assets/03-pc-13-light.png) · [Dark PNG](assets/03-pc-13-dark.png) |
| 4 | [Insert book](04-mach-02.md) | Closed book | [mach-02](../../styles/mach.md#mach-02) | [Pass it on](../medialog-logos-03/17-mach-02.md), collection 03 | [SVG](assets/04-mach-02.svg) · [Icon](assets/04-mach-02-icon.svg) · [Light PNG](assets/04-mach-02-light.png) · [Dark PNG](assets/04-mach-02-dark.png) |
| 5 | [First draft](05-pc-09.md) | Open book | [pc-09](../../styles/pc.md#pc-09) | [Leave a little note](../medialog-logos-03/11-pc-09.md), collection 03 | [SVG](assets/05-pc-09.svg) · [Icon](assets/05-pc-09-icon.svg) · [Light PNG](assets/05-pc-09-light.png) · [Dark PNG](assets/05-pc-09-dark.png) |
| 6 | [Glossy edition](06-vap-10.md) | Closed book | [vap-10](../../styles/vap.md#vap-10) | [Blue sky diary](../medialog-logos-02/05-vap-10.md), collection 02 | [SVG](assets/06-vap-10.svg) · [Icon](assets/06-vap-10-icon.svg) · [Light PNG](assets/06-vap-10-light.png) · [Dark PNG](assets/06-vap-10-dark.png) |
| 7 | [Copper shelf](07-c64-07.md) | Bookshelf | [c64-07](../../styles/c64.md#c64-07) | [Keep your place](../medialog-logos-03/13-c64-07.md), collection 03 | [SVG](assets/07-c64-07.svg) · [Icon](assets/07-c64-07-icon.svg) · [Light PNG](assets/07-c64-07-light.png) · [Dark PNG](assets/07-c64-07-dark.png) |
| 8 | [Pipe dream](08-idle-06.md) | Open book | [idle-06](../../styles/idle.md#idle-06) | [Growing pipes](../medialog-logos-04/08-idle-06.md), collection 04 | [SVG](assets/08-idle-06.svg) · [Icon](assets/08-idle-06-icon.svg) · [Light PNG](assets/08-idle-06-light.png) · [Dark PNG](assets/08-idle-06-dark.png) |
| 9 | [Read me](09-vap-11.md) | Open book | [vap-11](../../styles/vap.md#vap-11) | [System diary](../medialog-logos-04/05-vap-11.md), collection 04 | [SVG](assets/09-vap-11.svg) · [Icon](assets/09-vap-11-icon.svg) · [Light PNG](assets/09-vap-11-light.png) · [Dark PNG](assets/09-vap-11-dark.png) |
| 10 | [Paperback party](10-vap-17.md) | Closed book | [vap-17](../../styles/vap.md#vap-17) | [A little off-script](../medialog-logos-03/19-vap-17.md), collection 03 | [SVG](assets/10-vap-17.svg) · [Icon](assets/10-vap-17-icon.svg) · [Light PNG](assets/10-vap-17-light.png) · [Dark PNG](assets/10-vap-17-dark.png) |

## Use a logo

Copy the chosen SVG and [MIT notice](LICENSE.README-NFO.txt) into your project. The gallery’s Markdown uses `docs/brand/medialog-logos-06/assets/`; change the path if you save it elsewhere. Retain the font notice with the full wordmark. Keep the width and height at 203 × 74, or scale both proportionally. There is no unreadable tagline inside the mark.

Rebuild vector artwork and gallery with `node examples/medialog-logos-06/src/build.mjs`. Export PNGs with `node examples/medialog-logos-06/src/export-png.mjs` from this repository (Playwright and Chromium required). Source generators are independent compositions; `lib.mjs` contains drawing primitives and reads `wordmark.json`. The wordmark uses DejaVu Sans Bold, converted to paths; retain [its font notice](LICENSE.FONT.txt). To change the title, edit `src/outline-wordmark.py` and run it with Python and fontTools. The font is bundled for reproducibility.

[Other examples](../README.md)
