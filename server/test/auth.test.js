// Alpha sign-in (server/auth.js): signed tokens, the allowlist, the emailed link, the session
// cookie and the gate on pages and room creation, through the local server.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { boot, find } from './helpers.js';
import { allowed, authConfig, signToken, verifyToken, readCookie, SESSION_COOKIE } from '../auth.js';

const env = { AUTH_SECRET: 'test-secret', ALPHA_EMAILS: 'Tester@Example.com, @team.dev' };
let t;
const logs = [];
before(async () => {
  t = await boot(env);
  // The server logs the sign-in link when no mail provider is configured.
  const info = t.app.log.info;
  t.app.log.info = (m, f) => (logs.push(String(m)), info(m, f));
});
after(() => t.close());

const get = (p, init) => fetch(t.base + p, { redirect: 'manual', ...init });
const login = (email) => get('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });

test('tokens are signed, typed and expire', async () => {
  const tok = await signToken('k', { k: 's', e: 'a@b.co', x: Date.now() + 1000 });
  assert.equal((await verifyToken('k', tok, 's')).e, 'a@b.co');
  assert.equal(await verifyToken('k', tok, 'l'), null, 'wrong kind');
  assert.equal(await verifyToken('other', tok, 's'), null, 'wrong secret');
  assert.equal(await verifyToken('k', tok.slice(0, -2) + 'xx', 's'), null, 'tampered');
  assert.equal(await verifyToken('k', tok, 's', Date.now() + 5000), null, 'expired');
});

test('the allowlist takes exact emails (any case) and whole @domains', () => {
  const cfg = authConfig(env);
  assert.ok(allowed(cfg, 'tester@example.com'));
  assert.ok(allowed(cfg, ' TESTER@example.COM '));
  assert.ok(allowed(cfg, 'anyone@team.dev'));
  assert.ok(!allowed(cfg, 'someone@example.com'));
  assert.ok(!allowed(cfg, 'not-an-email'));
});

test('signed out: the landing page redirects to sign-in, game pages are 401, the pad and login page are open', async () => {
  const r = await get('/');
  assert.equal(r.status, 302);
  assert.match(r.headers.get('location'), /\/login\.html$/);
  assert.equal((await get('/play/golf/')).status, 401);
  assert.equal((await get('/api/info')).status, 401);
  assert.equal((await get('/pad')).status, 200);
  assert.equal((await get('/login.html')).status, 200);
  // Game assets stay open (only pages are gated).
  assert.equal((await get('/play/golf/assets/main-abc123.js')).status, 200);
});

test('signed out: a screen cannot open a pairing room', async () => {
  const c = t.client();
  assert.equal(find(await c.post({ type: 'create_room' }), 'error').code, 'sign_in');
});

test('an unlisted email gets the same reply but no link', async () => {
  logs.length = 0;
  const r = await login('stranger@example.com');
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { ok: true });
  assert.ok(!logs.some((l) => l.includes('stranger')));
  assert.equal((await login('nope')).status, 400);
});

test('a listed email gets a link; the link sets a session cookie that opens pages and room creation', async () => {
  logs.length = 0;
  assert.equal((await login('tester@example.com')).status, 200);
  const line = logs.find((l) => l.includes('sign-in link for tester@example.com'));
  assert.ok(line, 'link logged in dev');
  const link = line.slice(line.indexOf('http'));
  const r = await fetch(link, { redirect: 'manual' });
  assert.equal(r.status, 302);
  assert.equal(new URL(r.headers.get('location')).pathname, '/');
  const setCookie = r.headers.get('set-cookie');
  assert.match(setCookie, /HttpOnly/);
  const cookie = `${SESSION_COOKIE}=${readCookie(setCookie.split(';')[0], SESSION_COOKIE)}`;

  assert.equal((await get('/', { headers: { Cookie: cookie } })).status, 200);
  assert.equal((await get('/play/golf/', { headers: { Cookie: cookie } })).status, 200);
  const c = t.client({ cookie });
  assert.equal(find(await c.post({ type: 'create_room' }), 'joined').role, 'game');

  // A phone joins that room without signing in.
  const phone = t.client();
  assert.equal(find(await phone.post({ type: 'join_room', room: c.sess.pin }), 'joined').role, 'controller');

  // Logging out clears the cookie.
  const out = await get('/api/logout', { headers: { Cookie: cookie } });
  assert.match(out.headers.get('set-cookie'), /Max-Age=0/);
});

test('a bad or expired sign-in link goes back to the login page', async () => {
  const r = await get('/api/auth?t=garbage');
  assert.equal(r.status, 302);
  assert.match(r.headers.get('location'), /login\.html\?expired=1/);
});

test('sign-in requests are rate limited', async () => {
  let last;
  for (let i = 0; i < 7; i++) last = await login('ratelimit@example.com');
  assert.equal(last.status, 429);
});
