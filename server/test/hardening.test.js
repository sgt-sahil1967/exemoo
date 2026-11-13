// Production hardening: security headers, compression, ranges, readiness.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { boot } from './helpers.js';
import { startServer } from '../index.js';

let t;
before(async () => (t = await boot()));
after(() => t.close());
const get = (p, init) => fetch(t.base + p, { redirect: 'manual', ...init });

/** Raw GET (fetch hides Content-Encoding handling and forbids some headers). */
function raw(p, headers = {}) {
  return new Promise((resolve, reject) => {
    http.get(t.base + p, { headers }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c)).on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
    }).on('error', reject);
  });
}

test('pages carry a CSP that allows the game CDNs, frame protection and no HSTS on plain http', async () => {
  const r = await get('/');
  const csp = r.headers.get('content-security-policy');
  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /frame-ancestors 'self'/);
  assert.match(csp, /cdn\.jsdelivr\.net/);
  assert.equal(r.headers.get('x-frame-options'), 'SAMEORIGIN');
  assert.equal(r.headers.get('strict-transport-security'), null);
});

test('HSTS is sent when a trusted proxy says the request was https', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'exemoo-hsts-'));
  fs.writeFileSync(path.join(dir, 'index.html'), 'x');
  const app = await startServer({ host: '127.0.0.1', port: 0, quiet: true, publicDir: dir, gamesDir: dir, trustProxy: true });
  try {
    const base = `http://127.0.0.1:${app.port}`;
    const r = await fetch(base + '/', { headers: { 'X-Forwarded-Proto': 'https', 'X-Forwarded-Host': 'play.example.com' } });
    assert.match(r.headers.get('strict-transport-security'), /max-age=\d+/);
    const info = await (await fetch(base + '/api/info', { headers: { 'X-Forwarded-Proto': 'https', 'X-Forwarded-Host': 'play.example.com' } })).json();
    assert.equal(info.padUrl, 'https://play.example.com/pad', 'QR codes point at the public https URL');
  } finally {
    await app.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('text assets are brotli or gzip compressed; others support byte ranges', async () => {
  const big = 'console.log("golf");\n'.repeat(500);
  fs.writeFileSync(path.join(t.dir, 'games', 'golf', 'assets', 'main-abc123.js'), big);
  const br = await raw('/play/golf/assets/main-abc123.js', { 'Accept-Encoding': 'gzip, br' });
  assert.equal(br.headers['content-encoding'], 'br');
  assert.ok(br.body.length < big.length / 5);
  const gz = await raw('/play/golf/assets/main-abc123.js', { 'Accept-Encoding': 'gzip' });
  assert.equal(gz.headers['content-encoding'], 'gzip');
  const part = await raw('/play/golf/assets/main-abc123.js', { Range: 'bytes=0-6' });
  assert.equal(part.status, 206);
  assert.equal(part.body.toString(), 'console');
  assert.equal(part.headers['content-range'], `bytes 0-6/${big.length}`);
  assert.equal((await raw('/play/golf/assets/main-abc123.js', { Range: 'bytes=999999-' })).status, 416);
});

test('/readyz is 200 while serving', async () => {
  const r = await get('/readyz');
  assert.equal(r.status, 200);
  assert.equal((await r.json()).ready, true);
});

test('TURN_SECRET yields short-lived TURN REST credentials in /api/info', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'exemoo-turn-'));
  const app = await startServer({ host: '127.0.0.1', port: 0, quiet: true, publicDir: dir, gamesDir: dir, turnUrls: ['turn:turn.example.com:3478', 'turns:turn.example.com:5349'], turnSecret: 's3cret', turnTtlS: 600 });
  try {
    const info = await (await fetch(`http://127.0.0.1:${app.port}/api/info`)).json();
    const turn = info.iceServers.find((s) => Array.isArray(s.urls) && s.urls[0].startsWith('turn:'));
    assert.ok(turn, 'TURN entry present');
    const expiry = Number(turn.username.split(':')[0]);
    assert.ok(expiry > Date.now() / 1000 && expiry <= Date.now() / 1000 + 601);
    assert.match(turn.credential, /^[A-Za-z0-9+/]+=*$/);
  } finally {
    await app.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
