// End-to-end: the browser-side ScreenLink (shell) and PadLink (phone) talking through the real
// server. Node has WebSocket but no RTCPeerConnection, so this exercises the relay fallback path;
// the WebRTC path is checked in a browser.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { boot, sleep } from './helpers.js';
import { ScreenLink } from '../../public/js/screen-link.js';
import { PadLink } from '../../public/js/pad-link.js';
import { encodeSen2, decodePacket, quatFromEuler, buttonBit, buttonsFromMask, normalizeButton, SEN1_MAGIC } from '../../public/js/protocol.js';

let t;
before(async () => (t = await boot()));
after(() => t.close());

const until = async (fn, ms = 3000) => {
  const t0 = Date.now();
  while (!fn()) {
    if (Date.now() - t0 > ms) throw new Error('timed out');
    await sleep(10);
  }
};
const url = () => t.base.replace('http', 'ws') + '/signal';

test('SEN2 round-trips and junk is rejected', () => {
  const q = quatFromEuler(30, 45, -20);
  const p = { seq: 7, t: 1234, q, acc: { x: 1, y: 2, z: 3 }, gyro: { alpha: 4, beta: 5, gamma: 6 }, buttons: buttonBit('action') | buttonBit('home') };
  const d = decodePacket(encodeSen2(p));
  assert.equal(d.seq, 7);
  assert.ok(Math.abs(d.q.x - q.x) < 1e-6 && Math.abs(d.q.w - q.w) < 1e-6);
  assert.deepEqual(buttonsFromMask(d.buttons), ['action', 'home']);
  assert.equal(decodePacket(new ArrayBuffer(10)), null);
  assert.equal(decodePacket(new Uint8Array(56).buffer), null);
  assert.equal(normalizeButton('a'), 'action');
});

test('legacy SEN1 decodes with zero gyro and buttons', () => {
  const buf = new ArrayBuffer(40);
  const v = new DataView(buf);
  v.setUint32(0, SEN1_MAGIC, true);
  v.setFloat32(24, 1, true); // identity quaternion
  const d = decodePacket(buf);
  assert.deepEqual(d.gyro, { alpha: 0, beta: 0, gamma: 0 });
  assert.equal(d.buttons, 0);
});

test('shell and pad pair over the relay, exchange control messages and sensor packets', async () => {
  const screen = new ScreenLink({ signalUrl: url(), storageKey: 'test.' + Math.random() });
  screen.start();
  await until(() => screen.status === 'waiting' && /^\d{6}$/.test(screen.pin));

  const pad = new PadLink({ signalUrl: url() });
  pad.connect(screen.pin);
  await until(() => pad.connected && pad.transport === 'relay');

  const fromPhone = [];
  screen.on('message', (m) => fromPhone.push(m));
  pad.send({ t: 'hello', ua: 'test' });
  await until(() => screen.connected && fromPhone.some((m) => m.t === 'hello'));
  assert.equal(screen.transport, 'relay');

  const packets = [];
  screen.on('packet', (p) => packets.push(p));
  pad.sendSensor(encodeSen2({ seq: 1, t: 1, q: quatFromEuler(0, 90, 0), acc: { x: 0, y: 0, z: 9 }, gyro: { alpha: 0, beta: 0, gamma: 0 }, buttons: buttonBit('action') }));
  await until(() => packets.length === 1);
  assert.deepEqual(buttonsFromMask(packets[0].buttons), ['action']);

  const toPhone = [];
  pad.on('message', (m) => toPhone.push(m));
  screen.send({ t: 'layout', layout: 'swing', title: 'Golf' });
  await until(() => toPhone.some((m) => m.t === 'layout'));
  assert.equal(toPhone.find((m) => m.t === 'layout').layout, 'swing');

  // Ping/pong runs both ways and is not surfaced as a message.
  await until(() => screen.latencyMs > 0, 3000);
  assert.ok(!fromPhone.some((m) => m.t === 'ping' || m.t === 'pong'));

  pad.close();
  await until(() => screen.status === 'waiting');
  screen.stop();
});

test('a reloaded screen gets the same PIN back and the phone reconnects', async () => {
  const key = 'test.' + Math.random();
  const store = new Map();
  globalThis.sessionStorage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v), removeItem: (k) => store.delete(k) };
  try {
    const screen = new ScreenLink({ signalUrl: url(), storageKey: key });
    screen.start();
    await until(() => screen.status === 'waiting');
    const pin = screen.pin;
    const pad = new PadLink({ signalUrl: url() });
    pad.connect(pin);
    await until(() => pad.connected);

    screen.stop(); // tab reload
    await until(() => pad.status === 'waiting');
    const screen2 = new ScreenLink({ signalUrl: url(), storageKey: key });
    screen2.start();
    await until(() => screen2.pin === pin && pad.connected);
    pad.send({ t: 'hello', ua: 'again' });
    await until(() => screen2.connected);
    pad.close();
    screen2.stop();
  } finally {
    delete globalThis.sessionStorage;
  }
});

test('the pad gives up cleanly on a PIN that does not exist', async () => {
  const pad = new PadLink({ signalUrl: url() });
  pad.connect('999999');
  await until(() => pad.status === 'gone');
  pad.close();
});
