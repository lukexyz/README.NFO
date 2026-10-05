# Development and manual customisation

For the quick generation command, see [generation](generation.md).

## Copy one into your project

1. Open the individual `.md` linked from a gallery, then view its raw source. Copy the header and the parts of its introduction you want to adapt into your own README.
2. For an SVG header, copy **every image referenced by that Markdown** from the example's `assets/` folder into your repository. Some options include separate dividers, buttons or badges. Text-only headers need no image files.
3. Adjust each image path relative to your README. For example, if you put a banner in `docs/readme-assets/`, use:

   ```html
   <p align="center">
     <img src="docs/readme-assets/header.svg" width="100%"
          alt="Describe your project's banner">
   </p>
   ```

4. Replace project names, descriptions, statistics, commands and links with your own. Example links to files and section anchors belong to the original project and may deliberately lead nowhere in this gallery.
5. Include the [MIT licence notice](LICENSE) with copied work. Preview your finished README at desktop and mobile widths.

Keep SVGs as image files referenced by `<img>` or Markdown image syntax. GitHub README pages strip inline SVG, scripts and custom page CSS. The animation lives inside the image; links belong in the Markdown around it.

## Customise the artwork

The matching source lives in `examples/<set>/src/<same-filename>.mjs`. Read the comments at the top for the layout, palette, animation and rebuild instructions. Most generators use plain Node.js and contain their own fonts, geometry and project data.

Edit the generator and run it from this repository's root, for example:

```sh
node examples/ultra-satisfactory/src/17-amiga-tracker_opus_5.5.mjs
npm run gallery
```

Check the comment in the individual Markdown before editing it: some pages are generated, while others have handwritten prose alongside generated art. Gallery pages and the shortlist are generated and will be overwritten by their build commands. Project facts are dated snapshots; check them again when adapting a header. A few generators offer a live-data mode that needs the original project's files; follow that generator's instructions.

## Preview and validate

Use Node.js 22 or newer. Install the development dependency and Chromium once:

```sh
npm ci
npx playwright install chromium
```

The preview tool creates light and dark screenshots and reports text-width, character, image and GitHub-sanitizer issues. It approximates GitHub's rendering; check the final result on GitHub too.

```sh
npm run preview -- examples/castaway/01-mode7-island_opus_5.5.md .preview/demo
```

Append `--times=0,1500` to capture two moments in the animation, or `--mobile` to check a phone-width layout. Use a different output directory for each example you want to keep.

Run the complete repository check with:

```sh
npm run validate
```

It runs the validation tests, checks JavaScript syntax, catalogue coverage, gallery membership, documentation links and image paths, then parses and loads every SVG as a Chromium image. It also checks SVG image restrictions and reduced-motion rules, and rebuilds generated pages in a temporary directory to detect stale output. It leaves your working files untouched. The same command runs in GitHub Actions on pushes and pull requests.

| Command | Purpose |
| --- | --- |
| `npm run gallery` | Rebuild all seven project galleries and the curated shortlist |
| `npm run gallery:pliny` | Rebuild the fifteen Pliny headers, their galleries and the portable comparison |
| `npm run gallery:readme-nfo` | Rebuild the forty README.NFO candidates' index, four gallery pages and favourite picker |
| `npm run shortlist` | Rebuild the shortlist from `examples/shortlist.json` |
| `npm run styles` | Rebuild catalogue family pages and the index from `styles/styles.json` |
| `npm run preview -- <file.md-or.svg> <output-dir>` | Render a single example; screenshots belong in ignored `.preview/` |
| `npm run validate` | Run the tests and check the repository without rewriting its files |

## What is where

```text
examples/
  START-HERE.md       curated picks with animated previews
  shortlist.json     the selection and the reason for each pick
  <set>/
    <option>.md      individual headers
    assets/          SVG banners, dividers, buttons and badges
    src/             source generators and gallery builder
styles/
  styles.json        catalogue source data
  INDEX.md           every style, grouped by family
  <family>.md        descriptions, build notes and source links
tools/               preview, generation and validation commands
```

[examples/build-log.csv](examples/build-log.csv) records the original build sessions. Its importer, `tools/build-log.mjs`, needs those sessions' transcripts; they are not required to use or validate this repository.
