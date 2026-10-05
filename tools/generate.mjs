#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArguments, fetchProject, normaliseProject } from './generator/project.mjs';
import { designs } from './generator/designs.mjs';
import { createBundle, defaultOutput, writeBundle } from './generator/output.mjs';

const HELP = `README.NFO — generate headers for your GitHub project

  readme-nfo github.com/owner/repo -10
  readme-nfo --repo owner/repo --count 10 --out ./my-headers

  --count N       Pick N different designs (1–${designs.length}; default 10)
  --out PATH      Write to a new directory (default ./readme-headers/owner-repo)
  --seed TEXT     Repeat a selection; otherwise choose a fresh random seed
  --project FILE  Use a saved project.json instead of fetching GitHub
  --help          Show this help

Public repositories work directly. For private repositories or higher GitHub
rate limits, set GH_TOKEN or GITHUB_TOKEN in your environment.
Generates Markdown, self-contained SVGs, a gallery, metadata and an MIT notice.
`;

export async function main(args = process.argv.slice(2)) {
  const options = parseArguments(args, designs.length);
  if (options.help) { console.log(HELP); return; }
  if (options.out && fs.existsSync(path.resolve(options.out))) throw new Error('That output directory already exists. Choose a new --out directory.');
  let project;
  if (options.project) {
    project = normaliseProject(JSON.parse(fs.readFileSync(path.resolve(options.project), 'utf8')));
  } else {
    console.log(`Reading ${options.repository.fullName}...`);
    project = await fetchProject(options.repository, { warn: message => console.warn(message) });
  }
  const bundle = createBundle(project, { count: options.count, ...(options.seed ? { seed: options.seed } : {}) });
  const output = writeBundle(bundle, options.out || defaultOutput(project));
  console.log(`Created ${bundle.picks.length} headers in ${output}`);
  console.log(`Open ${path.join(output, 'index.html')} to choose one.`);
  console.log(`Selection seed: ${bundle.seed}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href) {
  main().catch(error => { console.error(`README.NFO: ${error.message}`); process.exitCode = 1; });
}
