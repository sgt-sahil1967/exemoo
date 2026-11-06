import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { boot, pair, sleep } from './helpers.js';

let t;
before(async () => (t = await boot({ gameGraceMs: 300, heartbeatMs: 200, createPerMinute: 200, joinFailPerMinute: 5 })));
after(() => t.close());

test('game creates a room with a six-digit PIN and private token', async () => {
  const game = t.ws();
  await game.send({ type: 'create_room' });
  const m = await game.next('joined');
  assert.equal(m.role, 'game');
  assert.match(m.room, /^\d{6}$/);
  assert.match(m.token, /^[0-9a-f]{32}$/);
  assert.match(m.resume, /^[0-9a-f]{32}$/);
  assert.equal(m.peer, false);
  assert.ok(m.features.includes('relay'));
  await game.close();
});

test('phone joins by PIN and both sides hear peer_connected', async () => {
  const { game, phone } = await pair(t);
  await game.close();
  await phone.close();
});

test('unknown PIN is rejected', async () => {
  const phone = t.ws();
  await phone.send({ type: 'join_room', room: '000001' });
  assert.equal((await phone.next('error')).code, 'room_not_found');
  await phone.close();
});

test('offer / answer / candidate are forwarded with the sender role, token stripped', async () => {
  const { game, phone } = await pair(t);
  await phone.send({ type: 'offer', sdp: 'v=0 offer' });
  const offer = await game.next('offer');
  assert.equal(offer.sdp, 'v=0 offer');
  assert.equal(offer.from, 'controller');
  assert.equal(offer.token, undefined);
  await game.send({ type: 'answer', sdp: 'v=0 answer' });
  assert.equal((await phone.next('answer')).from, 'game');
  await phone.send({ type: 'candidate', name: 'candidate:1', media: '0', index: 0 });
  assert.equal((await game.next('candidate')).name, 'candidate:1');
  await game.close();
  await phone.close();
});

test('signalling without the right token is refused', async () => {
  const { game, phone } = await pair(t);
  await phone.send({ type: 'offer', sdp: 'x', token: 'wrong' });
  assert.equal((await phone.next('error')).code, 'unauthorized');
  assert.ok(await game.none('offer'));
  const stranger = t.ws();
  await stranger.send({ type: 'relay', payload: { t: 'button', b: 'a' } });
  assert.equal((await stranger.next('error')).code, 'unauthorized');
  await Promise.all([game.close(), phone.close(), stranger.close()]);
});

test('relay forwards both `payload` (table-tennis, golf, landing) and `data` (fruit-slice)', async () => {
  const { game, phone } = await pair(t);
  await phone.send({ type: 'relay', payload: { t: 'button', b: 'a' } });
  const r1 = await game.next('relay');
  assert.deepEqual(r1.payload, { t: 'button', b: 'a' });
  assert.equal(r1.from, 'controller');
  await game.send({ type: 'relay', data: '{"t":"haptic"}' });
  assert.equal((await phone.next('relay')).data, '{"t":"haptic"}');
  await game.close();
  await phone.close();
});

test('binary sensor frames are forwarded verbatim', async () => {
  const { game, phone } = await pair(t);
  const frame = Buffer.from([0x53, 0x45, 0x4e, 0x32, 1, 2, 3, 4]);
  await phone.sendBinary(frame);
  const got = await game.next('__binary');
  assert.deepEqual(Buffer.from(got.data), frame);
  await game.close();
  await phone.close();
});

test('ping works before and after joining', async () => {
  const c = t.ws();
  await c.send({ type: 'ping' });
  assert.equal(typeof (await c.next('pong')).timestamp_ms, 'number');
  await c.close();
});

test('phone leaving notifies the game; the room stays open for a new phone', async () => {
  const { game, phone, pin } = await pair(t);
  await phone.close();
  assert.equal((await game.next('peer_disconnected')).role, 'controller');
  const phone2 = t.ws();
  await phone2.send({ type: 'join_room', room: pin });
  assert.equal((await phone2.next('joined')).peer, true);
  await game.next('peer_connected');
  await game.close();
  await phone2.close();
});

test('a reconnecting phone replaces the stale one', async () => {
  const { game, phone, pin } = await pair(t);
  const phone2 = t.ws();
  await phone2.send({ type: 'join_room', room: pin });
  await phone2.next('joined');
  assert.equal((await phone.next('replaced')).role, 'controller');
  assert.equal(await phone.closed, 4001);
  await game.next('peer_connected');
  await game.close();
  await phone2.close();
});

test('reloaded game resumes its PIN with create_room {pin, resume} (table-tennis style)', async () => {
  const { game, phone, pin, resume } = await pair(t);
  await game.close();
  await phone.next('peer_disconnected');
  const game2 = t.ws();
  await game2.send({ type: 'create_room', pin, resume });
  const j = await game2.next('joined');
  assert.equal(j.room, pin);
  assert.equal(j.peer, true);
  await phone.next('peer_connected');
  await game2.close();
  await phone.close();
});

test('reloaded game resumes with resume_room {room, token} (fruit-slice style)', async () => {
  const { game, phone, pin, gameToken } = await pair(t);
  await game.close();
  const game2 = t.ws();
  await game2.send({ type: 'resume_room', room: pin, token: gameToken }, { withToken: false });
  const j = await game2.next('joined');
  assert.equal(j.room, pin);
  assert.equal(j.token, gameToken);
  await game2.close();
  await phone.close();
});

test('resume with a wrong key gets a fresh PIN instead of hijacking the room', async () => {
  const { game, phone, pin } = await pair(t);
  const thief = t.ws();
  await thief.send({ type: 'create_room', pin, resume: 'f'.repeat(32) });
  assert.notEqual((await thief.next('joined')).room, pin);
  const thief2 = t.ws();
  await thief2.send({ type: 'resume_room', room: pin, token: 'f'.repeat(32) });
  assert.equal((await thief2.next('error')).code, 'room_not_found');
  assert.ok(await game.none('replaced'));
  await Promise.all([game.close(), phone.close(), thief.close(), thief2.close()]);
});

test('room closes after the game is gone past the grace period', async () => {
  const { game, phone, pin } = await pair(t);
  await game.close();
  const closed = await phone.next('room_closed', 2000);
  assert.equal(closed.reason, 'game_left');
  assert.equal(t.app.hub.rooms.has(pin), false);
  await phone.close();
});

test('a socket can only join one room', async () => {
  const { game, phone, pin } = await pair(t);
  await game.send({ type: 'create_room' });
  assert.equal((await game.next('error')).code, 'already_joined');
  await phone.send({ type: 'join_room', room: pin });
  assert.equal((await phone.next('error')).code, 'already_joined');
  await game.close();
  await phone.close();
});

test('invalid JSON and unknown types get errors', async () => {
  const { game, phone } = await pair(t);
  await game.open;
  game.ws.send('{nope');
  assert.equal((await game.next('error')).code, 'invalid_json');
  await game.send({ type: 'teleport' });
  assert.equal((await game.next('error')).code, 'unknown_message');
  await game.close();
  await phone.close();
});

test('the root path works for sword-relay clients', async () => {
  const game = t.ws('/');
  await game.send({ type: 'create_room' });
  assert.equal((await game.next('joined')).role, 'game');
  await game.close();
});

test('failed PIN guesses are rate limited per IP', async () => {
  const phone = t.ws();
  let limited = false;
  for (let i = 0; i < 8; i++) {
    await phone.send({ type: 'join_room', room: String(100000 + i) });
    const e = await phone.next('error');
    if (e.code === 'rate_limited') limited = true;
  }
  assert.ok(limited);
  await phone.close();
});

test('dead sockets are reaped by the heartbeat', async () => {
  const { game, phone } = await pair(t);
  // Stop answering pings: the server should terminate the socket and tell the game.
  phone.ws._socket.pause();
  phone.ws.pong = () => {};
  assert.equal((await game.next('peer_disconnected', 2000)).role, 'controller');
  await game.close();
  phone.ws.terminate();
  await sleep(10);
});

test('a phone that comes back with its controller resume key is reported as resumed; another phone is not', async () => {
  const { game, phone, pin } = await pair(t);
  await phone.close();
  await game.next('peer_disconnected');
  // The key came in the phone's 'joined' (pair() consumed it): ask again by rejoining once.
  const p1 = t.ws();
  await p1.send({ type: 'join_room', room: pin });
  const j1 = await p1.next('joined');
  assert.match(j1.resume, /^[0-9a-f]{32}$/);
  assert.equal(j1.resumed, false);
  assert.equal((await game.next('peer_connected')).resumed, false);
  await p1.close();
  await game.next('peer_disconnected');

  const p2 = t.ws();
  await p2.send({ type: 'join_room', room: pin, resume: j1.resume });
  const j2 = await p2.next('joined');
  assert.equal(j2.resumed, true);
  assert.equal(j2.resume, j1.resume);
  assert.equal((await game.next('peer_connected')).resumed, true);

  const other = t.ws();
  await other.send({ type: 'join_room', room: pin, resume: 'f'.repeat(32) });
  const j3 = await other.next('joined');
  assert.equal(j3.resumed, false);
  assert.notEqual(j3.resume, j1.resume, 'a different phone gets a new key');
  assert.equal((await p2.next('replaced')).role, 'controller');
  await Promise.all([game.close(), other.close()]);
});

test('a socket flooding messages is closed with 1008', async () => {
  const c = t.ws();
  await c.open;
  for (let i = 0; i < 2000; i++) c.ws.send('{"type":"ping"}');
  assert.equal(await c.closed, 1008);
});
