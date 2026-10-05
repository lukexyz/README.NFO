# Generate headers for a project

With Node.js 22+ and Git installed, run:

```sh
npx --yes github:lukexyz/README.NFO github.com/you/project -10
```

Replace the URL with any GitHub repository, including `owner/repo` shorthand. This creates ten different headers and a visual gallery in `readme-headers/owner-repo/`. Open `index.html`, choose a header, copy its SVG into your project's `assets/` folder and paste its matching `.md` into your README. Keep the included MIT notice. If you use a different asset folder, update the image path.

The command selects from twelve reusable designs: tracker, cassette, test card, copper ribbons, Luna desktop, vector objects, terminal, bulletin board, radar, neon horizon, starfield and zine. Each uses the target repository's name, description, languages, topics and metadata. The wider [style catalogue](../styles/INDEX.md) contains more handmade compositions to explore and adapt.

Public repositories work immediately. Set `GH_TOKEN` or `GITHUB_TOKEN` for private repositories or higher API limits. The generator reads GitHub metadata and README text; it doesn't need to install the target project's dependencies.

## Options

```sh
npx --yes github:lukexyz/README.NFO --repo you/project --count 6 --out ./my-headers --seed favourites
```

`--count` accepts 1–12. Every batch has distinct designs. `--seed` makes the selection repeatable; without it, each run draws a fresh selection. `--out` must be a new directory. Default output uses a numbered suffix when a previous batch already exists.

The output includes `project.json` with the project facts and `manifest.json` with the seed and selected designs. Edit `project.json` to adjust names, descriptions or facts, then generate an updated batch offline:

```sh
npx --yes github:lukexyz/README.NFO --project ./readme-headers/you-project/project.json --seed favourites --out ./updated-headers
```

Use the original seed from `manifest.json` to keep the same selection and numbering. Counts are snapshots of GitHub data; the animation and tracker notes are decorative. Headers have static content under reduced-motion preferences. Non-Latin names use the browser's Unicode font fallback.

## Run from this checkout

```sh
node tools/generate.mjs github.com/you/project -10
```

Generation uses only built-in Node.js modules. The repository's Chromium setup is for optional previews and validation; see [development instructions](development.md).
