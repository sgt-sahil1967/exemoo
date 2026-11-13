// SDK gyro menu cursor: pure stepping, plus the SDK wiring against a fake window/document.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stepAirCursor, layoutStreams } from '../../public/sdk/exemoo.js';

test('stepAirCursor: dead zone, axes, clamping', () => {
  const b = { w: 1000, h: 600 };
  const idle = stepAirCursor({ x: 500, y: 300 }, { alpha: 2, beta: -2, gamma: 0 }, 0.016, 9, b);
  assert.deepEqual(idle, { x: 500, y: 300, moving: false });
  // beta sweeps left/right (positive beta = left), alpha up/down (positive alpha = up)
  const left = stepAirCursor({ x: 500, y: 300 }, { alpha: 0, beta: 100, gamma: 0 }, 0.1, 9, b);
  assert.ok(left.x < 500 && left.y === 300 && left.moving);
  const up = stepAirCursor({ x: 500, y: 300 }, { alpha: 100, beta: 0, gamma: 0 }, 0.1, 9, b);
  assert.ok(up.y < 300 && up.x === 500);
  const edge = stepAirCursor({ x: 10, y: 10 }, { alpha: 900, beta: 900, gamma: 0 }, 0.1, 9, b);
  assert.deepEqual([edge.x, edge.y], [4, 4]);
  assert.equal(stepAirCursor({ x: 1, y: 1 }, undefined, 0.1, 9, b).moving, false);
});

test('layoutStreams', () => {
  assert.equal(layoutStreams('swing'), true);
  assert.equal(layoutStreams('slice'), true);
  assert.equal(layoutStreams('remote'), false);
  assert.equal(layoutStreams('kart'), false);
});

/** Run connectExemoo against a fake shell: returns the SDK plus what it posted and helpers to feed it. */
async function withShell(fn) {
  const posted = [];
  const handlers = [];
  const parent = { postMessage: (m) => posted.push(m) };
  const clicks = [];
  const btn = { disabled: false, isConnected: true, style: {}, click: () => clicks.push('btn'), closest() { return this; }, matches: () => false };
  const fakeEl = () => ({ style: {}, append() {} });
  const win = { parent, addEventListener: (t, h) => t === 'message' && handlers.push(h), innerWidth: 800, innerHeight: 600 };
  const saved = {};
  const set = (k, v) => ((saved[k] = Object.getOwnPropertyDescriptor(globalThis, k)), Object.defineProperty(globalThis, k, { value: v, configurable: true, writable: true }));
  win.window = win;
  set('window', win);
  set('location', { origin: 'http://x' });
  set('innerWidth', 800);
  set('innerHeight', 600);
  set('addEventListener', () => {});
  set('document', { body: { append() {} }, createElement: fakeEl, elementFromPoint: () => btn, querySelectorAll: () => [], activeElement: null });
  const timers = [];
  const realSetInterval = globalThis.setInterval;
  globalThis.setInterval = (f) => (timers.push(f), { unref() {} });
  try {
    const mod = await import('../../public/sdk/exemoo.js?fake=' + Math.random());
    const feed = (d) => handlers.forEach((h) => h({ source: parent, origin: 'http://x', data: { exemoo: 1, ...d } }));
    await fn({ mod, posted, feed, clicks, btn, tick: () => timers.forEach((f) => f()) });
  } finally {
    globalThis.setInterval = realSetInterval;
    for (const [k, d] of Object.entries(saved)) d ? Object.defineProperty(globalThis, k, d) : delete globalThis[k];
  }
}

test('menuCursor: remote layout streams only while the menu is up; Action clicks the hovered button', async () => {
  await withShell(async ({ mod, posted, feed, clicks, tick }) => {
    let menu = false;
    const buttons = [];
    const sdk = mod.connectExemoo({ layout: 'remote', title: 'T', menuCursor: () => menu });
    sdk.on('button', (b) => buttons.push(b));
    const streamMsgs = () => posted.filter((m) => m.type === 'stream').map((m) => m.on);
    tick();
    assert.deepEqual(streamMsgs(), []); // not in a menu: nothing sent
    menu = true;
    tick();
    assert.deepEqual(streamMsgs(), [true]);
    tick();
    assert.deepEqual(streamMsgs(), [true]); // no repeats
    // Phone moves: ring appears over the (fake) button -> hot; Action clicks it and the game never sees it
    feed({ type: 'packet', p: { t: 1000, gyro: { alpha: 0, beta: 50, gamma: 0 } } });
    feed({ type: 'packet', p: { t: 1016, gyro: { alpha: 0, beta: 50, gamma: 0 } } });
    feed({ type: 'button', b: 'action' });
    assert.deepEqual(clicks, ['btn']);
    assert.deepEqual(buttons, []);
    feed({ type: 'button', b: 'down' });
    assert.deepEqual(buttons, ['down']); // d-pad still reaches the game
    menu = false;
    tick();
    assert.deepEqual(streamMsgs(), [true, false]);
    feed({ type: 'button', b: 'action' });
    assert.deepEqual(buttons, ['down', 'action']); // cursor gone: Action is a normal press again
    // switching to a streaming layout while the menu is up keeps the stream on
    menu = true;
    tick();
    sdk.setLayout('swing', 'T');
    assert.equal(streamMsgs().at(-1), true);
  });
});

test('menuCursor: swing layout never turns the stream off', async () => {
  await withShell(async ({ mod, posted, tick }) => {
    let menu = true;
    mod.connectExemoo({ layout: 'swing', menuCursor: () => menu });
    tick();
    menu = false;
    tick();
    const on = posted.filter((m) => m.type === 'stream').map((m) => m.on);
    assert.ok(on.every(Boolean), JSON.stringify(on));
  });
});

test('every shell game wires gyro menu navigation', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const repo = path.resolve(import.meta.dirname, '../..');
  const walk = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? (['vendor', 'node_modules', 'assets', 'dist'].includes(e.name) ? [] : walk(path.join(d, e.name))) : /\.(js|ts|html)$/.test(e.name) ? [path.join(d, e.name)] : [])) : []);
  // Vite games are checked in games-src (the built bundles are minified). pad-test is a diagnostics page.
  // table-tennis has its own tilt pointer, golf calls airCursor directly, fruit-slice keeps its blade pointer live in menus.
  const own = { 'table-tennis': /ui\.pointer\(/, golf: /airCursor\(/, 'fruit-slice': /menuHold/ };
  const vite = new Set(fs.readdirSync(path.join(repo, 'games-src')));
  for (const id of fs.readdirSync(path.join(repo, 'games')).filter((n) => n !== 'pad-test' && fs.statSync(path.join(repo, 'games', n)).isDirectory())) {
    const src = walk(path.join(repo, vite.has(id) ? 'games-src' : 'games', id)).map((f) => fs.readFileSync(f, 'utf8')).join('\n');
    assert.match(src, own[id] ?? /menuCursor/, `${id}: no gyro menu navigation`);
  }
});
