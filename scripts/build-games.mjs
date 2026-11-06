#!/usr/bin/env node
/**
 * Build every game in games-src/<id>/ into games/<id>/ (served at /play/<id>/).
 *   node scripts/build-games.mjs            all games
 *   node scripts/build-games.mjs golf tennis  just these
 *   node scripts/build-games.mjs --ci       clean, reproducible install first (`npm ci` from each
 *                                           game's package-lock.json); used by CI and the Dockerfile.
 *                                           Also on when the CI env var is set.
 * Each game keeps its own package.json / node_modules; Vite runs from the game's folder.
 * Games in games/ without a games-src/ folder (cricket, farm-dash, pad-test, rapids-row) are static
 * and committed as-is; this script never touches them.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'games-src');
const args = process.argv.slice(2);
const ci = args.includes('--ci') || (!!process.env.CI && process.env.CI !== 'false');
const want = args.filter((a) => !a.startsWith('--'));
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
  const hasLock = fs.existsSync(path.join(cwd, 'package-lock.json'));
  if (ci || !fs.existsSync(path.join(cwd, 'node_modules'))) {
    // npm ci = exactly the locked versions (reproducible); without a lockfile fall back to install.
    if (ci && !hasLock) console.warn(`  ! ${id}: no package-lock.json, versions are not pinned (run npm install there and commit the lockfile)`);
    const install = hasLock && ci ? ['ci', '--no-audit', '--no-fund'] : ['install', '--no-audit', '--no-fund'];
    if (run('npm', install).status !== 0) {
      console.error(`  ✗ ${id}: npm ${install[0]} failed`);
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
  if (!fs.existsSync(path.join(out, 'index.html'))) {
    console.error(`  ✗ ${id}: build produced no index.html`);
    failed++;
    continue;
  }
  console.log(`  ✓ games/${id}/`);
}
if (!ids.length) console.warn(want.length ? `No games-src/ folder matches: ${want.join(' ')}` : 'No games in games-src/');
console.log(failed ? `\n✗ ${failed} of ${ids.length} game(s) failed` : `\n✓ built ${ids.length} game(s)`);
process.exit(failed ? 1 : 0);
