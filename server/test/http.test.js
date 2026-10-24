import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from './helpers.js';

let t;
before(async () => (t = await boot()));
after(() => t.close());

const get = (p, init) => fetch(t.base + p, { redirect: 'manual', ...init });

test('/healthz reports ok', async () => {
  const r = await get('/healthz');
  assert.equal(r.status, 200);
  assert.equal((await r.json()).ok, true);
});

test('landing page and phone controller are served', async () => {
  assert.equal(await (await get('/')).text(), '<h1>landing</h1>');
  assert.equal(await (await get('/pad')).text(), '<h1>pad</h1>');
  assert.equal(await (await get('/pad/?pin=123456')).text(), '<h1>pad</h1>');
  assert.equal((await get('/controller.html')).status, 200);
});

test('security headers keep pairing PINs out of referrers', async () => {
  const r = await get('/pad');
  assert.equal(r.headers.get('referrer-policy'), 'no-referrer');
  assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
});

test('/api/info gives the pad URL from the request host and lists installed games', async () => {
  const info = await (await get('/api/info')).json();
  assert.equal(info.padUrl, `${t.base}/pad`);
  assert.deepEqual(info.games, ['golf']);
});

test('/api/qr returns an SVG and rejects empty or huge text', async () => {
  const r = await get('/api/qr?text=' + encodeURIComponent('https://exemoo.app/pad?pin=123456'));
  assert.equal(r.headers.get('content-type'), 'image/svg+xml');
  assert.match(await r.text(), /^<svg/);
  assert.equal((await get('/api/qr')).status, 400);
  assert.equal((await get('/api/qr?text=' + 'x'.repeat(600))).status, 400);
});

test('games are served under /play/<id>/ with SPA fallback and immutable assets', async () => {
  const redirect = await get('/play/golf');
  assert.equal(redirect.status, 301);
  assert.equal(redirect.headers.get('location'), '/play/golf/');
  assert.equal(await (await get('/play/golf/')).text(), '<h1>golf</h1>');
  assert.equal(await (await get('/play/golf/menu/settings')).text(), '<h1>golf</h1>');
  const asset = await get('/play/golf/assets/main-abc123.js');
  assert.match(asset.headers.get('cache-control'), /immutable/);
  assert.equal((await get('/play/golf/assets/missing.js')).status, 404);
  assert.equal((await get('/play/tennis/')).status, 404);
});

test('ETag revalidation returns 304', async () => {
  const r = await get('/');
  const r2 = await get('/', { headers: { 'If-None-Match': r.headers.get('etag') } });
  assert.equal(r2.status, 304);
});

test('path traversal cannot escape public/ or a game folder', async () => {
  for (const p of ['/../secret.txt', '/%2e%2e/secret.txt', '/play/golf/..%2f..%2fsecret.txt', '/play/golf/%2e%2e/%2e%2e/secret.txt']) {
    const r = await get(p);
    assert.notEqual(await r.text(), 'nope', p);
  }
});

test('only GET and HEAD are allowed for files', async () => {
  assert.equal((await get('/', { method: 'POST' })).status, 405);
  assert.equal((await get('/', { method: 'HEAD' })).status, 200);
});

test('unknown websocket paths are refused', async () => {
  const c = t.ws('/nope');
  await assert.rejects(c.open);
});
