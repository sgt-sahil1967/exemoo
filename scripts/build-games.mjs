#!/usr/bin/env node
/**
 * Build every game in games-src/<id>/ into games/<id>/ (served at /play/<id>/).
 *   node scripts/build-games.mjs            all games
 *   node scripts/build-games.mjs golf tennis  just these
 * Each game keeps its own package.json / node_modules; Vite runs from the game's folder.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'games-src');
const want = process.argv.slice(2);
const ids = fs
  .readdirSync(srcDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && fs.existsSync(path.join(srcDir, d.name, 'index.html')))
  .map((d) => d.name)
  .filter((id) => !want.length || want.includes(id));

let failed = 0;
for (const id of ids) {
  const cwd = path.join(srcDir, id);
  const run = (cmd, args) => spawnSync(cmd, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });
  console.log(`\n● ${id}`);
  if (!fs.existsSync(path.join(cwd, 'node_modules'))) {
    if (run('npm', ['install', '--no-audit', '--no-fund']).status !== 0) {
      failed++;
      continue;
    }
  }
  const hasTs = fs.existsSync(path.join(cwd, 'tsconfig.json'));
  if (hasTs && run('npx', ['tsc', '--noEmit']).status !== 0) {
    console.error(`  ✗ ${id}: type errors`);
    failed++;
    continue;
  }
  const out = path.join(root, 'games', id);
  if (run('npx', ['vite', 'build', '--base', `/play/${id}/`, '--outDir', out, '--emptyOutDir', '--logLevel', 'warn']).status !== 0) {
    console.error(`  ✗ ${id}: build failed`);
    failed++;
    continue;
  }
  console.log(`  ✓ games/${id}/`);
}
process.exit(failed ? 1 : 0);
