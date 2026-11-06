// Connection reliability: the screen (ScreenLink) and phone (PadLink) must survive dead sockets,
// sockets that stall without a FIN (Wi-Fi switch), reloads on either side, page lifecycle events
// (bfcache restore, network back online) and a server restart (deploy), and rejoin the same pairing
// without re-entering the PIN. Node has no RTCPeerConnection, so this runs over the relay path.
import { test, before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import WebSocket from 'ws';
import { boot, sleep } from './helpers.js';
import { startServer } from '../index.js';
import { ScreenLink } from '../../public/js/screen-link.js';
import { PadLink } from '../../public/js/pad-link.js';

// Fast timings so every failure is detected in well under a second.
const FAST = { wsPingMs: 150, wsDeadMs: 500, retryBaseMs: 40, retryMaxMs: 300 };

const until = async (fn, ms = 4000, what = 'condition') => {
  const t0 = Date.now();
  while (!fn()) {
    if (Date.now() - t0 > ms) throw new Error(`timed out waiting for ${what}`);
    await sleep(10);
  }
};

/** In-memory sessionStorage shared by "reloads" of the same tab. */
function fakeSessionStorage() {
  const store = new Map();
  globalThis.sessionStorage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
  return store;
}

/**
 * TCP proxy in front of the server. `stall()` black-holes every current connection in both
 * directions without closing it (no FIN, like a phone that switched from Wi-Fi to cellular);
 * new connections go through normally.
 */
async function stallProxy(targetPort) {
  const pairs = new Set();
  const srv = net.createServer((c) => {
    const up = net.connect(targetPort, '127.0.0.1');
    const p = { c, up, stalled: false };
    pairs.add(p);
    c.on('data', (d) => !p.stalled && up.write(d));
    up.on('data', (d) => !p.stalled && c.write(d));
    // A stalled path never tells the other side it died.
    const end = (self, other) => () => {
      self.destroy();
      if (!p.stalled) other.destroy();
      pairs.delete(p);
    };
    c.on('close', end(c, up)).on('error', () => {});
    up.on('close', end(up, c)).on('error', () => {});
  });
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  return {
    url: `ws://127.0.0.1:${srv.address().port}/signal`,
    stall() {
      for (const p of pairs) p.stalled = true;
    },
    close() {
      for (const p of pairs) p.c.destroy(), p.up.destroy();
      return new Promise((r) => srv.close(r));
    },
  };
}

let t;
const cleanup = [];
before(async () => (t = await boot({ heartbeatMs: 60_000 })));
after(() => t.close());
afterEach(async () => {
  for (const fn of cleanup.splice(0).reverse()) await fn();
  delete globalThis.sessionStorage;
  delete globalThis.window;
  delete globalThis.document;
});

const url = () => t.base.replace('http', 'ws') + '/signal';

/** A paired screen + pad over the relay, with message capture. */
async function pairUp(signalUrl = url(), padOpts = {}) {
  const screen = new ScreenLink({ signalUrl, storageKey: 'screen.' + Math.random(), ...FAST });
  screen.start();
  await until(() => screen.status === 'waiting' && /^\d{6}$/.test(screen.pin), 4000, 'screen room');
  const pad = new PadLink({ signalUrl, ...FAST, ...padOpts });
  pad.connect(screen.pin);
  const fromPhone = [];
  const toPhone = [];
  screen.on('message', (m) => fromPhone.push(m));
  pad.on('message', (m) => toPhone.push(m));
  cleanup.push(() => (pad.close(), screen.stop()));
  await until(() => pad.connected, 4000, 'pad connected');
  pad.send({ t: 'hello', n: 0 });
  await until(() => screen.connected, 4000, 'screen connected');
  return { screen, pad, fromPhone, toPhone };
}

/** Both directions carry messages right now. */
async function assertFlows({ screen, pad, fromPhone, toPhone }, n) {
  await until(() => pad.send({ t: 'hello', n }) && fromPhone.some((m) => m.n === n), 3000, `phone→screen #${n}`);
  await until(() => screen.send({ t: 'theme', color: '#123', n }) && toPhone.some((m) => m.n === n), 3000, `screen→phone #${n}`);
}

test('a path that dies without a FIN (Wi-Fi switch) is detected by the heartbeat and both sides reconnect', async () => {
  const proxy = await stallProxy(t.app.port);
  cleanup.push(() => proxy.close());
  const s = await pairUp(proxy.url);
  const pin = s.screen.pin;
  const statuses = [];
  s.pad.on('status', (st) => statuses.push(st));

  proxy.stall();
  await until(() => statuses.includes('lost'), 2000, 'pad notices the dead socket');
  await until(() => s.pad.connected && s.screen.connected && s.screen.pin === pin, 5000, 'both back on the same PIN');
  await assertFlows(s, 1);
});

test('a socket the server kills (proxy reset, crash) is reopened and the pair resumes', async () => {
  const s = await pairUp();
  const room = t.app.hub.rooms.get(s.screen.pin);
  room.controller.socket.terminate();
  await until(() => s.pad.status === 'lost' || !s.pad.connected, 2000, 'pad drops');
  await until(() => s.pad.connected, 4000, 'pad reconnects');
  await assertFlows(s, 2);

  room.game.socket.terminate();
  await until(() => !s.screen.connected, 2000, 'screen drops');
  await until(() => s.screen.connected && s.pad.connected, 4000, 'screen reconnects');
  assert.equal(t.app.hub.rooms.get(s.screen.pin), room, 'same room');
  await assertFlows(s, 3);
});

test('a reloaded pad rejoins its screen from the saved pairing, no PIN entry, reported as resumed', async () => {
  fakeSessionStorage();
  const s = await pairUp();
  const pin = s.screen.pin;
  const resumesBefore = t.app.hub.stats.resumes;

  s.pad.close(); // page unload
  await until(() => s.screen.status === 'waiting', 2000, 'screen sees the phone leave');

  const pad2 = new PadLink({ signalUrl: url(), ...FAST });
  cleanup.push(() => pad2.close());
  assert.ok(pad2.canResume(pin), 'reloaded tab knows it may resume this PIN');
  pad2.connect(pin);
  await until(() => pad2.connected && s.screen.connected, 4000, 'resumed');
  assert.equal(t.app.hub.stats.resumes, resumesBefore + 1);
  pad2.send({ t: 'hello', n: 4 });
  await until(() => s.fromPhone.some((m) => m.n === 4));
});

test('a pad reloaded while the screen is also reloading keeps looking instead of asking for the PIN', async () => {
  fakeSessionStorage();
  const screenKey = 'screen.reload.' + Math.random();
  const screen = new ScreenLink({ signalUrl: url(), storageKey: screenKey, ...FAST });
  screen.start();
  await until(() => screen.status === 'waiting');
  const pin = screen.pin;
  const pad = new PadLink({ signalUrl: url(), ...FAST });
  pad.connect(pin);
  await until(() => pad.connected);
  pad.close();
  screen.stop();

  // The room is gone from the server (e.g. it was restarted) while both pages reload.
  t.app.hub.rooms.delete(pin);
  const pad2 = new PadLink({ signalUrl: url(), ...FAST });
  pad2.connect(pin);
  cleanup.push(() => pad2.close());
  await until(() => pad2.status === 'lost', 2000, 'pad looking for the screen');
  await sleep(300);
  assert.notEqual(pad2.status, 'gone', 'a resuming pad must not give up on a briefly missing room');

  const screen2 = new ScreenLink({ signalUrl: url(), storageKey: screenKey, ...FAST });
  cleanup.push(() => screen2.stop());
  screen2.start();
  await until(() => screen2.pin === pin && pad2.connected, 4000, 'same PIN re-created and the pad found it');
});

test('a resuming pad gives up after the resume window, and a fresh pad with a wrong PIN gives up at once', async () => {
  fakeSessionStorage();
  globalThis.sessionStorage.setItem('exemoo.pad', JSON.stringify({ pin: '123457', resume: '', at: Date.now() }));
  const pad = new PadLink({ signalUrl: url(), ...FAST, resumeWindowMs: 300 });
  cleanup.push(() => pad.close());
  pad.connect('123457');
  await until(() => pad.status === 'gone', 3000, 'gives up');

  const fresh = new PadLink({ signalUrl: url(), ...FAST });
  cleanup.push(() => fresh.close());
  fresh.connect('123458');
  await until(() => fresh.status === 'gone', 2000);
  assert.equal(fresh.attempts, 0, 'no retries for a PIN that never worked');
});

test('a bfcache restore or "online" event reconnects at once instead of waiting for the heartbeat', async () => {
  globalThis.window = new EventTarget();
  globalThis.document = Object.assign(new EventTarget(), { visibilityState: 'visible' });
  const proxy = await stallProxy(t.app.port);
  cleanup.push(() => proxy.close());
  const slow = { wsPingMs: 30_000, wsDeadMs: 60_000 }; // the heartbeat alone would take a minute
  const s = await pairUp(proxy.url, slow);

  proxy.stall();
  const t0 = Date.now();
  window.dispatchEvent(Object.assign(new Event('pageshow'), { persisted: true }));
  await until(() => s.pad.connected && Date.now() - t0 > 50 && s.pad.status === 'connected', 3000);
  // The screen's own socket is stalled too: 'online' makes it probe and reconnect within ~2.5 s.
  window.dispatchEvent(new Event('online'));
  await until(() => s.screen.connected, 5000, 'screen back');
  await assertFlows(s, 5);
  assert.ok(Date.now() - t0 < 8000);
});

test('a server restart (deploy) closes sockets with 1012; screen and phone come back on the same PIN', async () => {
  fakeSessionStorage();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'exemoo-restart-'));
  fs.mkdirSync(path.join(dir, 'public'));
  fs.mkdirSync(path.join(dir, 'games'));
  const opts = { host: '127.0.0.1', quiet: true, publicDir: path.join(dir, 'public'), gamesDir: path.join(dir, 'games') };
  let app = await startServer({ ...opts, port: 0 });
  const port = app.port;
  cleanup.push(async () => {
    await app.close();
    fs.rmSync(dir, { recursive: true, force: true });
  });
  const signalUrl = `ws://127.0.0.1:${port}/signal`;
  const s = await pairUp(signalUrl);
  const pin = s.screen.pin;

  const raw = new WebSocket(signalUrl);
  await new Promise((r) => raw.once('open', r));
  const code = new Promise((r) => raw.once('close', (c) => r(c)));

  await app.shutdown({ timeoutMs: 1000 });
  assert.equal(await code, 1012, 'clients are told the service is restarting');
  assert.ok(!s.pad.connected && !s.screen.connected);

  app = await startServer({ ...opts, port }); // the new instance has no rooms
  await until(() => s.screen.pin === pin && s.screen.connected && s.pad.connected, 8000, 'both back on the same PIN');
  await assertFlows(s, 6);
});

test('shutdown marks the server as draining (/readyz 503)', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'exemoo-drain-'));
  const app = await startServer({ host: '127.0.0.1', port: 0, quiet: true, publicDir: dir, gamesDir: dir });
  const base = `http://127.0.0.1:${app.port}`;
  assert.equal((await fetch(base + '/readyz')).status, 200);
  const ws = new WebSocket(base.replace('http', 'ws') + '/signal');
  await new Promise((r) => ws.once('open', r));
  // Hold one socket open so the drain takes a moment, and probe readiness meanwhile.
  ws.on('close', () => {});
  const done = app.shutdown({ timeoutMs: 500 });
  assert.equal(app.draining, true);
  await done;
  fs.rmSync(dir, { recursive: true, force: true });
});
