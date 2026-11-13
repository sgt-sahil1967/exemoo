// HTTP pairing (server/pairing.js through /api/signal): rooms, joining, forwarding, presence,
// resume, replacement, expiry and rate limits. Also the Upstash store's Redis commands.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { boot, pair, find, sleep } from './helpers.js';
import { createPairing, memoryStore, upstashStore } from '../pairing.js';

let t;
before(async () => (t = await boot()));
after(() => t.close());

test('a screen creates a six-digit room; a phone joins; both hear peer_connected', async () => {
  const { game, pin, phoneJoined, phoneReplies } = await pair(t);
  assert.match(pin, /^\d{6}$/);
  assert.equal(phoneJoined.role, 'controller');
  assert.equal(phoneJoined.peer, true);
  assert.ok(find(phoneReplies, 'peer_connected'));
  const g = await game.poll();
  assert.deepEqual(find(g, 'peer_connected'), { type: 'peer_connected', role: 'controller', resumed: false });
});

test('offer, answer and candidates reach the other side with `from`, in order, batched', async () => {
  const { game, phone } = await pair(t);
  await game.poll();
  await phone.post({ type: 'offer', sdp: 'o' }, { type: 'candidate', name: 'c1' }, { type: 'candidate', name: 'c2' });
  const g = await game.post({ type: 'answer', sdp: 'a' });
  assert.deepEqual(
    g.map((m) => [m.type, m.from]),
    [['offer', 'controller'], ['candidate', 'controller'], ['candidate', 'controller']],
  );
  assert.equal(g[1].name, 'c1');
  const p = await phone.poll();
  assert.deepEqual(find(p, 'answer'), { type: 'answer', sdp: 'a', from: 'game' });
  // Delivered once.
  assert.equal((await game.poll()).length, 0);
});

test('signalling without a room is refused; unknown types and relay are handled', async () => {
  const c = t.client();
  assert.equal(find(await c.post({ type: 'offer', sdp: 'x' }), 'error').code, 'unauthorized');
  assert.equal(find(await c.post({ type: 'bogus' }), 'error').code, 'unknown_message');
  assert.equal((await c.post({ type: 'relay', payload: {} })).length, 0, 'no relay: dropped silently');
  assert.equal(find(await c.post({ type: 'ping' }), 'pong').type, 'pong');
});

test('a wrong PIN is room_not_found; the same phone reloading resumes; a new phone replaces the old', async () => {
  const c = t.client();
  assert.equal(find(await c.post({ type: 'join_room', room: '000000' }), 'error').code, 'room_not_found');

  const { game, phone, pin, phoneJoined } = await pair(t);
  await game.poll();
  // Same phone after a reload: presents its resume key.
  const again = t.client();
  const r = find(await again.post({ type: 'join_room', room: pin, resume: phoneJoined.resume }), 'joined');
  assert.equal(r.resumed, true);
  assert.equal(find(await game.poll(), 'peer_connected').resumed, true);
  // The first tab's token is stale now.
  assert.equal(find(await phone.poll(), 'replaced').type, 'replaced');
  // A different phone gets a new key, so the old key no longer resumes.
  const other = t.client();
  assert.equal(find(await other.post({ type: 'join_room', room: pin }), 'joined').resumed, false);
  const late = t.client();
  assert.equal(find(await late.post({ type: 'join_room', room: pin, resume: phoneJoined.resume }), 'joined').resumed, false);
});

test('a reloaded screen reclaims its PIN with the resume key and the phone hears it', async () => {
  const { game, phone, pin, resume } = await pair(t);
  await game.poll();
  await phone.poll();
  const reloaded = t.client();
  const j = find(await reloaded.post({ type: 'create_room', pin, resume }), 'joined');
  assert.equal(j.room, pin);
  assert.equal(j.resumed, true);
  assert.equal(j.peer, true);
  assert.deepEqual(find(await phone.poll(), 'peer_connected'), { type: 'peer_connected', role: 'game', resumed: true });
  // Wrong resume key: a fresh room with a different PIN.
  const thief = t.client();
  const k = find(await thief.post({ type: 'create_room', pin, resume: 'nope' }), 'joined');
  assert.notEqual(k.room, pin);
});

test('leave tells the other side; a phone that stops polling counts as gone', async () => {
  const { game, phone } = await pair(t);
  await game.poll();
  await phone.post({ type: 'leave' });
  assert.deepEqual(find(await game.poll(), 'peer_disconnected'), { type: 'peer_disconnected', role: 'controller' });

  let now = 1_000_000;
  const store = memoryStore();
  const p = createPairing({ store, now: () => now, peerFreshMs: 90_000 });
  const g = (await p.handle({ msgs: [{ type: 'create_room' }] })).msgs[0];
  await p.handle({ msgs: [{ type: 'join_room', room: g.room }] });
  now += 120_000; // the phone went quiet
  const again = (await p.handle({ msgs: [{ type: 'create_room', pin: g.room, resume: g.resume }] })).msgs[0];
  assert.equal(again.peer, false);
  store.close();
});

test('a room expires when its screen stops polling', async () => {
  const short = await boot({ ROOM_GRACE_MS: '150' });
  try {
    const { game, phone } = await pair(short);
    await sleep(250);
    assert.equal(find(await phone.poll(), 'room_expired').type, 'room_expired');
    assert.equal(find(await game.poll(), 'room_expired').type, 'room_expired');
  } finally {
    await short.close();
  }
});

test('PIN guessing is rate limited per IP', async () => {
  const store = memoryStore();
  const p = createPairing({ store, joinFailPerMinute: 3 });
  const codes = [];
  for (let i = 0; i < 5; i++) codes.push((await p.handle({ msgs: [{ type: 'join_room', room: '123456' }] }, { ip: '9.9.9.9' })).msgs[0].code);
  assert.deepEqual(codes, ['room_not_found', 'room_not_found', 'room_not_found', 'rate_limited', 'rate_limited']);
  store.close();
});

test('creating a room needs sign-in when the gate says no; resuming does not', async () => {
  const store = memoryStore();
  const p = createPairing({ store });
  const open = (await p.handle({ msgs: [{ type: 'create_room' }] })).msgs[0];
  const denied = (await p.handle({ msgs: [{ type: 'create_room' }] }, { canCreate: () => false })).msgs[0];
  assert.equal(denied.code, 'sign_in');
  const resumed = (await p.handle({ msgs: [{ type: 'create_room', pin: open.room, resume: open.resume }] }, { canCreate: () => false })).msgs[0];
  assert.equal(resumed.type, 'joined');
  store.close();
});

test('the Upstash store sends one EVAL per poll and parses replies', async () => {
  const calls = [];
  const fake = async (url, init) => {
    const args = JSON.parse(init.body);
    calls.push(args);
    let result = null;
    if (args[0] === 'EVAL' && args[1].includes("table.insert(msgs, 1, 'ok')")) result = ['ok', JSON.stringify({ type: 'offer', sdp: 'x', from: 'controller' })];
    else if (args[0] === 'HGETALL') result = ['resume', 'r1', 'gameToken', 'g1'];
    else result = 1;
    return { ok: true, status: 200, json: async () => ({ result }) };
  };
  const store = upstashStore({ url: 'https://redis.example', token: 'tok', fetchImpl: fake });
  const step = await store.step({ pin: '123456', role: 'game', token: 'g1', out: [], now: 1, ttlMs: 1000, refresh: true });
  assert.deepEqual(step, { status: 'ok', msgs: [{ type: 'offer', sdp: 'x', from: 'controller' }] });
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], 'EVAL');
  assert.deepEqual(calls[0].slice(2, 6), ['3', 'x:r:123456', 'x:i:123456:game', 'x:i:123456:controller']);
  assert.deepEqual(await store.getRoom('123456'), { resume: 'r1', gameToken: 'g1' });
  assert.throws(() => upstashStore({ url: '', token: '' }), /not configured/);
});
