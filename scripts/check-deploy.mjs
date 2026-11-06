#!/usr/bin/env node
/**
 * Pre-deploy audit of what the server ships (public/ and games/):
 *   - size of games/ per game and the largest files
 *   - every game in games-src/ has a build in games/
 *   - references that break on the public internet: local file paths (/Users/…, C:\…, file://)
 *     are errors; hard-coded LAN IPs and localhost URLs are warnings (fallbacks are fine)
 *   - the external hosts the pages load from (CDNs, fonts), which the CSP in server/index.js allows
 *
 *   node scripts/check-deploy.mjs          report; exit 1 only on errors
 *   node scripts/check-deploy.mjs --json   machine-readable report
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const asJson = process.argv.includes('--json');
const TEXT = new Set(['.html', '.js', '.mjs', '.css', '.json', '.webmanifest', '.svg', '.txt']);
const errors = [];
const warnings = [];
const hosts = new Map();

function walk(dir, out = []) {
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    if (d.name === 'node_modules' || d.name.startsWith('.')) continue;
    const p = path.join(dir, d.name);
    if (d.isDirectory()) walk(p, out);
    else out.push({ file: p, size: fs.statSync(p).size });
  }
  return out;
}
const rel = (f) => path.relative(root, f);
const mb = (n) => (n / 1048576).toFixed(1) + ' MB';

// ─────────────── sizes ───────────────
const gamesDir = path.join(root, 'games');
const files = walk(gamesDir).concat(walk(path.join(root, 'public')));
const perGame = {};
for (const { file, size } of files) {
  const r = rel(file).split(path.sep);
  if (r[0] === 'games' && r.length > 2) perGame[r[1]] = (perGame[r[1]] || 0) + size;
}
const total = files.reduce((a, f) => a + f.size, 0);
const largest = [...files].sort((a, b) => b.size - a.size).slice(0, 8).map((f) => ({ file: rel(f.file), size: f.size }));

// ─────────────── builds present ───────────────
const srcDir = path.join(root, 'games-src');
for (const d of fs.existsSync(srcDir) ? fs.readdirSync(srcDir, { withFileTypes: true }) : []) {
  if (!d.isDirectory() || !fs.existsSync(path.join(srcDir, d.name, 'index.html'))) continue;
  if (!fs.existsSync(path.join(gamesDir, d.name, 'index.html'))) errors.push(`games-src/${d.name} has no build in games/${d.name}/ (run npm run build)`);
}

// ─────────────── references ───────────────
const LOCAL_PATH = /(?:file:\/\/\/|\/Users\/[A-Za-z0-9._-]+\/|[A-Z]:\\\\Users\\\\)/g;
const LAN_IP = /(?<![.\w])(?:10\.\d{1,3}|192\.168|172\.(?:1[6-9]|2\d|3[01]))\.\d{1,3}\.\d{1,3}(?::\d+)?(?![.\w])/g;
const LOCALHOST_URL = /\b(?:https?|wss?):\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?[^\s"'`)]*/g;
const URL_HOST = /\bhttps:\/\/([a-z0-9.-]+\.[a-z]{2,})(?=[/"'`?:)\s])/gi;
// Hosts that only appear in comments, licences or error messages, not loaded at runtime.
const DOC_HOSTS = /^(github\.com|www\.w3\.org|developer\.mozilla\.org|tools\.ietf\.org|www\.ietf\.org|webkit\.org|bugzil\.la|jcgt\.org|www\.khronos\.org|en\.wikipedia\.org|kripken\.github\.io|pubs\.opengroup\.org|unicode\.org|goo\.gl|reactjs\.org|fb\.me|g\.co)$/;

for (const { file } of files) {
  if (!TEXT.has(path.extname(file).toLowerCase())) continue;
  const text = fs.readFileSync(file, 'utf8');
  const r = rel(file);
  for (const m of text.matchAll(LOCAL_PATH)) errors.push(`${r}: local file path "${m[0]}"`);
  for (const m of text.matchAll(LAN_IP)) {
    if (/^(10\.0\.0\.0|192\.168\.0\.0|172\.16\.0\.0)/.test(m[0])) continue; // CIDR docs
    warnings.push(`${r}: hard-coded LAN address ${m[0]}`);
  }
  const lh = [...text.matchAll(LOCALHOST_URL)].map((m) => m[0]);
  if (lh.length) warnings.push(`${r}: localhost URL ${[...new Set(lh)].slice(0, 2).join(', ')} (ok if only a fallback when there is no page location)`);
  for (const m of text.matchAll(URL_HOST)) {
    const h = m[1].toLowerCase();
    if (DOC_HOSTS.test(h)) continue;
    if (!hosts.has(h)) hosts.set(h, new Set());
    hosts.get(h).add(r.split(path.sep).slice(0, 2).join('/'));
  }
}

const report = {
  totalBytes: total,
  games: Object.fromEntries(Object.entries(perGame).sort((a, b) => b[1] - a[1])),
  largest,
  externalHosts: Object.fromEntries([...hosts].map(([h, s]) => [h, [...s]])),
  errors,
  warnings,
};

if (asJson) console.log(JSON.stringify(report, null, 2));
else {
  console.log(`Shipped files (public/ + games/): ${mb(total)}`);
  for (const [g, n] of Object.entries(report.games)) console.log(`  ${g.padEnd(14)} ${mb(n)}`);
  console.log('Largest files:');
  for (const f of largest) console.log(`  ${mb(f.size).padStart(8)}  ${f.file}`);
  console.log('External hosts loaded by the pages (allowed in the CSP):');
  for (const [h, where] of Object.entries(report.externalHosts)) console.log(`  ${h.padEnd(28)} ${where.join(', ')}`);
  for (const w of warnings) console.log(`  ! ${w}`);
  for (const e of errors) console.log(`  ✗ ${e}`);
  console.log(errors.length ? `\n✗ ${errors.length} error(s)` : `\n✓ no blocking problems (${warnings.length} warning(s))`);
}
process.exit(errors.length ? 1 : 0);
