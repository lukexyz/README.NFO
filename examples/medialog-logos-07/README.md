# MediaLog — compact logo collection 07

[Open the actual-size gallery](gallery.html) · [Contact sheet](preview.png) · [Symbols](icons.png) · [Saved selection](draw.json) · [Project brief](project.json) · [Checks](qa.json)

Ten original graphic logos, designed for **203 × 74 pixels** (viewBox 812 × 296), each built around a book. This set takes the ten styles of collection 05, picked again from its contact sheet, and redraws each one as a new, simpler symbol: where collection 05 drew a film, a television, an album or a game, these draw a book. Every symbol stands on its own with no tile or border. No ASCII or character art, and no animation. Primary #18223a and one plain wordmark throughout. The saved selection records the scope.

Each design includes a self-contained static SVG, a 64 × 64 icon-only SVG, and transparent 812 × 296 PNG exports for light and dark surroundings. Adaptive SVG colours follow the embedding page’s colour scheme. PNGs are browser exports of the SVG artwork.

| # | Logo | Book | Style | First used as | Files |
| --- | --- | --- | --- | --- | --- |
| 1 | [Now reading](01-mach-12.md) | Open book | [mach-12](../../styles/mach.md#mach-12) | [Now showing](../medialog-logos-05/01-mach-12.md), collection 05 | [SVG](assets/01-mach-12.svg) · [Icon](assets/01-mach-12-icon.svg) · [Light PNG](assets/01-mach-12-light.png) · [Dark PNG](assets/01-mach-12-dark.png) |
| 2 | [Test card](02-idle-10.md) | Closed book | [idle-10](../../styles/idle.md#idle-10) | [Off air](../medialog-logos-05/02-idle-10.md), collection 05 | [SVG](assets/02-idle-10.svg) · [Icon](assets/02-idle-10-icon.svg) · [Light PNG](assets/02-idle-10-light.png) · [Dark PNG](assets/02-idle-10-dark.png) |
| 3 | [Chapter select](03-c64-14.md) | Open book | [c64-14](../../styles/c64.md#c64-14) | [Jukebox](../medialog-logos-05/03-c64-14.md), collection 05 | [SVG](assets/03-c64-14.svg) · [Icon](assets/03-c64-14-icon.svg) · [Light PNG](assets/03-c64-14-light.png) · [Dark PNG](assets/03-c64-14-dark.png) |
| 4 | [Extra chapter](04-mach-11.md) | Closed book | [mach-11](../../styles/mach.md#mach-11) | [Extra ball](../medialog-logos-05/04-mach-11.md), collection 05 | [SVG](assets/04-mach-11.svg) · [Icon](assets/04-mach-11-icon.svg) · [Light PNG](assets/04-mach-11-light.png) · [Dark PNG](assets/04-mach-11-dark.png) |
| 5 | [Three channels](05-asia-01.md) | Book stack | [asia-01](../../styles/asia.md#asia-01) | [Channel keys](../medialog-logos-05/05-asia-01.md), collection 05 | [SVG](assets/05-asia-01.svg) · [Icon](assets/05-asia-01-icon.svg) · [Light PNG](assets/05-asia-01-light.png) · [Dark PNG](assets/05-asia-01-dark.png) |
| 6 | [Twisted spine](06-pc-05.md) | Closed book | [pc-05](../../styles/pc.md#pc-05) | [Final cut](../medialog-logos-05/06-pc-05.md), collection 05 | [SVG](assets/06-pc-05.svg) · [Icon](assets/06-pc-05-icon.svg) · [Light PNG](assets/06-pc-05-light.png) · [Dark PNG](assets/06-pc-05-dark.png) |
| 7 | [Light reading](07-idle-02.md) | Open book | [idle-02](../../styles/idle.md#idle-02) | [On air](../medialog-logos-05/07-idle-02.md), collection 05 | [SVG](assets/07-idle-02.svg) · [Icon](assets/07-idle-02-icon.svg) · [Light PNG](assets/07-idle-02-light.png) · [Dark PNG](assets/07-idle-02-dark.png) |
| 8 | [Colour clash](08-demo-08.md) | Open book | [demo-08](../../styles/demo.md#demo-08) | [Fire button](../medialog-logos-05/08-demo-08.md), collection 05 | [SVG](assets/08-demo-08.svg) · [Icon](assets/08-demo-08-icon.svg) · [Light PNG](assets/08-demo-08-light.png) · [Dark PNG](assets/08-demo-08-dark.png) |
| 9 | [Title card](09-demo-11.md) | Closed book | [demo-11](../../styles/demo.md#demo-11) | [Stacked](../medialog-logos-05/09-demo-11.md), collection 05 | [SVG](assets/09-demo-11.svg) · [Icon](assets/09-demo-11-icon.svg) · [Light PNG](assets/09-demo-11-light.png) · [Dark PNG](assets/09-demo-11-dark.png) |
| 10 | [Book swap](10-print-05.md) | Closed book | [print-05](../../styles/print.md#print-05) | [Review slip](../medialog-logos-05/10-print-05.md), collection 05 | [SVG](assets/10-print-05.svg) · [Icon](assets/10-print-05-icon.svg) · [Light PNG](assets/10-print-05-light.png) · [Dark PNG](assets/10-print-05-dark.png) |

## Use a logo

Copy the chosen SVG and [MIT notice](LICENSE.README-NFO.txt) into your project. The gallery’s Markdown uses `docs/brand/medialog-logos-07/assets/`; change the path if you save it elsewhere. Retain the font notice with the full wordmark. Keep the width and height at 203 × 74, or scale both proportionally. There is no unreadable tagline inside the mark.

Rebuild vector artwork and gallery with `node examples/medialog-logos-07/src/build.mjs`. Export PNGs with `node examples/medialog-logos-07/src/export-png.mjs` from this repository (Playwright and Chromium required). Source generators are independent compositions; `lib.mjs` contains drawing primitives and reads `wordmark.json`. The wordmark uses DejaVu Sans Bold, converted to paths; retain [its font notice](LICENSE.FONT.txt). To change the title, edit `src/outline-wordmark.py` and run it with Python and fontTools. The font is bundled for reproducibility.

[Other examples](../README.md)
