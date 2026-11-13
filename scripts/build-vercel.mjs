#!/usr/bin/env node
/**
 * Vercel build: lays out the static site in dist/ the way the Node server serves it.
 *
 *   public/*         → dist/*               landing page, phone pad (/pad → controller.html), shared JS, SDK
 *   games/<id>/*     → dist/play/<id>/*     every game that has an index.html (prebuilt, committed)
 *   (generated)      → dist/info.json       what /api/info returns (rewritten in vercel.json)
 *
 * Docs, dev pages and tests inside games/ are left out. The Vite games are already built into games/
 * (`npm run build`), so the deploy only copies files; the dynamic routes are the functions in api/.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist');
const gamesDir = path.join(root, 'games');

/** Files and folders that are only for development. */
const skip = (name, isDir) =>
  name === '.DS_Store' ||
  name === 'node_modules' ||
  /\.md$/i.test(name) ||
  /\.test\.[cm]?js$/.test(name) ||
  /^dev(-.*)?\.html$/.test(name) ||
  (isDir && (name === 'dev' || name === 'test' || name === 'tests'));

let files = 0;
let bytes = 0;
function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (skip(e.name, e.isDirectory())) continue;
    const s = path.join(src, e.name);
    const d = path.join(dst, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else if (e.isFile()) {
      fs.copyFileSync(s, d);
      files++;
      bytes += fs.statSync(s).size;
    }
  }
}

fs.rmSync(out, { recursive: true, force: true });
copyDir(path.join(root, 'public'), out);

const games = fs
  .readdirSync(gamesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && /^[a-z0-9-]+$/.test(d.name) && fs.existsSync(path.join(gamesDir, d.name, 'index.html')))
  .map((d) => d.name)
  .sort();
for (const id of games) copyDir(path.join(gamesDir, id), path.join(out, 'play', id));

// Same shape as the Node server's /api/info. padUrl null → pages use <origin>/pad. STUN only: phones
// must be on the screen's Wi-Fi (no TURN, no relay).
const info = { padUrl: null, lan: false, lanIps: [], httpsPort: null, games, iceServers: [{ urls: 'stun:stun.l.google.com:19302' }], swingLog: false };
fs.writeFileSync(path.join(out, 'info.json'), JSON.stringify(info));

console.log(`dist/: ${games.length} games, ${files} files, ${(bytes / 1048576).toFixed(1)} MB`);
