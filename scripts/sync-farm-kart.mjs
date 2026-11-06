#!/usr/bin/env node
/**
 * Copy the latest Farm Kart game code from ../farm-kart into games-src/farm-kart, then build it:
 *   node scripts/sync-farm-kart.mjs            sync + build
 *   node scripts/sync-farm-kart.mjs --no-build sync only
 *
 * Mirrored verbatim (never edit these in games-src, edit ../farm-kart and re-sync):
 *   ../farm-kart/src/**  → games-src/farm-kart/src/
 *   ../farm-kart/index.html → games-src/farm-kart/index.html
 * Exemoo's adapter layer lives in games-src/farm-kart/exemoo/ and is NOT touched by the sync:
 *   exemoo/phones.js   replaces src/phones.js (alias in vite.config.js) with the same Phones API: Exemoo pairing
 *                      (shell phone = P1, a PIN room per other seat), /pad kart + remote layouts, HUD, vibration,
 *                      Exemoo copy on the setup screen and an "Exemoo Menu" exit button
 *   exemoo/nav.js      phone d-pad → spatial navigation over the TV menus
 * The farm-kart phone server and public/pad/ are not copied: Exemoo's /pad (kart layout) replaces them.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const from = path.resolve(root, process.env.FARM_KART_DIR || '../farm-kart');
const to = path.join(root, 'games-src', 'farm-kart');

if (!fs.existsSync(path.join(from, 'src', 'main.js'))) {
  console.error(`✗ ${from}/src/main.js not found (set FARM_KART_DIR)`);
  process.exit(1);
}
fs.rmSync(path.join(to, 'src'), { recursive: true, force: true });
fs.cpSync(path.join(from, 'src'), path.join(to, 'src'), { recursive: true });
fs.copyFileSync(path.join(from, 'index.html'), path.join(to, 'index.html'));
console.log(`✓ synced ${path.relative(root, from) || from}/{src,index.html} → games-src/farm-kart/`);

// The adapter depends on these parts of the game: warn loudly when an upstream change moves them.
const main = fs.readFileSync(path.join(to, 'src', 'main.js'), 'utf8');
const html = fs.readFileSync(path.join(to, 'index.html'), 'utf8');
const checks = [
  [/from '\.\/phones\.js'/.test(main), "main.js imports './phones.js' (aliased to exemoo/phones.js)"],
  [/new Phones\(this\)/.test(main), 'main.js creates new Phones(this)'],
  [/src="\/src\/main\.js"/.test(html), 'index.html loads /src/main.js'],
];
const used = [...new Set([...main.matchAll(/this\.phones\.([a-zA-Z_]+)/g)].map((m) => m[1]))];
const known = ['list', 'info', 'online', 'send', 'get', 'bySlot', 'slotHolder', 'input', 'buzz', 'kick', 'drawQR', 'saveSeats', 'reclaim'];
const unknown = used.filter((n) => !known.includes(n));
if (unknown.length) checks.push([false, `main.js uses Phones members the adapter lacks: ${unknown.join(', ')}`]);
let bad = 0;
for (const [ok, what] of checks) if (!ok) (bad++, console.warn(`  ! adapter check failed: ${what}`));
if (bad) console.warn('  ! update games-src/farm-kart/exemoo/ before shipping this sync');

if (!process.argv.includes('--no-build')) {
  const r = spawnSync(process.execPath, [path.join(root, 'scripts', 'build-games.mjs'), 'farm-kart'], { stdio: 'inherit' });
  process.exit(r.status ?? 1);
}
