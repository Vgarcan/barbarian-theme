import { mkdir, rm } from 'node:fs/promises';
import { build } from 'esbuild';

const outdir = 'dist';
await rm(outdir, { recursive: true, force: true });
await mkdir(`${outdir}/effects`, { recursive: true });

const cssBase = {
  entryPoints: ['src/barbarian-theme.css'],
  bundle: true,
  charset: 'utf8',
  loader: { '.svg': 'dataurl' },
  logLevel: 'info'
};

await build({ ...cssBase, outfile: `${outdir}/barbarian-theme.css`, minify: false });
await build({ ...cssBase, outfile: `${outdir}/barbarian-theme.min.css`, minify: true });

const jsBase = {
  entryPoints: ['src/barbarian-theme.js'],
  bundle: true,
  charset: 'utf8',
  format: 'iife',
  globalName: 'BarbarianTheme',
  target: ['es2020'],
  logLevel: 'info'
};

await build({ ...jsBase, outfile: `${outdir}/barbarian-theme.js`, minify: false });
await build({ ...jsBase, outfile: `${outdir}/barbarian-theme.min.js`, minify: true });

const effectJsBase = {
  entryPoints: ['src/effects/desert/index.js'],
  bundle: true,
  charset: 'utf8',
  format: 'iife',
  globalName: 'BarbarianDesert',
  target: ['es2020'],
  logLevel: 'info'
};

await build({ ...effectJsBase, outfile: `${outdir}/effects/desert.js`, minify: false });
await build({ ...effectJsBase, outfile: `${outdir}/effects/desert.min.js`, minify: true });

const effectCssBase = {
  entryPoints: ['src/effects/desert/effect.css'],
  bundle: true,
  charset: 'utf8',
  logLevel: 'info'
};

await build({ ...effectCssBase, outfile: `${outdir}/effects/desert.css`, minify: false });
await build({ ...effectCssBase, outfile: `${outdir}/effects/desert.min.css`, minify: true });
