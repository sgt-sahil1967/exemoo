/**
 * Exemoo pairing over plain HTTP: pairs one game screen with one phone in a six-digit PIN room.
 *
 * It replaces the old WebSocket hub so Exemoo can run on serverless hosts (Vercel) where nothing
 * stays connected. Clients POST a batch of the same JSON messages the hub used, and get back every
 * message waiting for them (see public/js/poll-socket.js, which makes this look like a WebSocket to
 * the screen and phone links). The server only carries the WebRTC handshake; once the data channel
 * is open the phone talks to the screen directly over the local network. There is no relay, so a
 * phone that cannot reach the screen directly (e.g. on mobile data) cannot play.
 *
 * Request  {pin?, role?, token?, msgs: [...]}   (pin/role/token once the client has joined a room)
 * Response {msgs: [...]}
 *
 *   game  → {type:'create_room', pin?, resume?}  → {type:'joined', role:'game', room, token, resume, resumed, peer}
 *   game  → {type:'resume_room', room, token}    → same 'joined'
 *   phone → {type:'join_room', room, resume?}    → {type:'joined', role:'controller', room, token, resume, resumed, peer}
 *   both  ← {type:'peer_connected'|'peer_disconnected', role, resumed?}
 *   both  → {type:'offer'|'answer'|'candidate', ...}   delivered to the peer with `from`
 *   both  → {type:'leave'}                             the other side hears peer_disconnected
 *   both  → {type:'ping'}                              → {type:'pong', timestamp_ms}
 *   both  ← {type:'replaced'} | {type:'room_expired'} | {type:'error', code, message}
 *
 * Presence: each poll stamps `<role>Seen`; a side not seen for `peerFreshMs` counts as absent. The
 * room lives `roomTtlMs` after the screen's last poll (time to reload and resume the same PIN).
 *
 * Every poll is one store command (`step`), so the free Upstash tier goes a long way.
 */
import crypto from 'node:crypto';

const DEFAULTS = {
  /** A room expires this long after its screen last polled. */
  roomTtlMs: 5 * 60_000,
  /** A side that has not polled for this long is treated as gone. */
  peerFreshMs: 90_000,
  /** Per-IP limits (per minute). */
  createPerMinute: 30,
  joinFailPerMinute: 20,
  /** Max messages accepted in one request. */
  maxMsgs: 64,
  log: () => {},
};

const randomToken = () => crypto.randomBytes(16).toString('hex');
const randomPin = () => String(crypto.randomInt(100000, 1000000));
export const isPin = (p) => typeof p === 'string' && /^\d{6}$/.test(p);
const otherRole = (role) => (role === 'game' ? 'controller' : 'game');
const field = (role) => (role === 'game' ? 'game' : 'ctl');
const err = (code, message) => ({ type: 'error', code, message });

export function createPairing({ store, now = Date.now, ...options }) {
  const cfg = { ...DEFAULTS, ...options };
  const log = cfg.log;
  const fresh = (room, role) => !!room[`${field(role)}Token`] && now() - Number(room[`${field(role)}Seen`] || 0) < cfg.peerFreshMs;
  const limited = async (key, limit) => (await store.incr(key, 60_000)) > limit;

  /** Attach a (new or resumed) game screen to `pin`. */
  async function attachGame(pin, room, out, resumed) {
    const token = randomToken();
    await store.setRoom(pin, { gameToken: token, gameSeen: String(now()) }, cfg.roomTtlMs, ['game']);
    const peer = fresh(room, 'controller');
    out.push({ type: 'joined', role: 'game', room: pin, token, resume: room.resume, resumed, peer });
    if (peer) {
      out.push({ type: 'peer_connected', role: 'controller' });
      await store.push(pin, 'controller', [{ type: 'peer_connected', role: 'game', resumed }], cfg.roomTtlMs);
    }
    log(`room ${pin}: game ${resumed ? 'resumed' : 'joined'}`);
    return { pin, role: 'game', token };
  }

  /**
   * One request. `ip` keys the rate limits; `canCreate()` says whether this caller may open new rooms
   * (the alpha sign-in gate). Returns {msgs}.
   */
  async function handle(body, { ip = 'unknown', canCreate = () => true } = {}) {
    const out = [];
    if (!body || typeof body !== 'object') return { msgs: [err('invalid_message', 'Body must be a JSON object.')] };
    let sess =
      isPin(body.pin) && (body.role === 'game' || body.role === 'controller') && typeof body.token === 'string' && body.token
        ? { pin: body.pin, role: body.role, token: body.token }
        : null;
    const forward = [];
    const msgs = Array.isArray(body.msgs) ? body.msgs.slice(0, cfg.maxMsgs) : [];

    for (const m of msgs) {
      if (!m || typeof m !== 'object' || typeof m.type !== 'string') {
        out.push(err('invalid_message', 'Message must contain a type.'));
        continue;
      }
      switch (m.type) {
        case 'create_room': {
          if (sess) {
            out.push(err('already_joined', 'Already attached to a room.'));
            break;
          }
          const want = isPin(m.pin) ? m.pin : null;
          // Resume: a reloaded screen reclaims its room (the phone may still be in it).
          if (want && typeof m.resume === 'string' && m.resume) {
            const room = await store.getRoom(want);
            if (room && room.resume === m.resume) {
              sess = await attachGame(want, room, out, true);
              break;
            }
          }
          if (!(await canCreate())) {
            out.push(err('sign_in', 'Sign in to start a game.'));
            break;
          }
          if (await limited(`x:rl:c:${ip}`, cfg.createPerMinute)) {
            out.push(err('rate_limited', 'Too many rooms created. Try again in a minute.'));
            break;
          }
          let pin = want;
          for (let i = 0; i < 10 && !sess; i++, pin = null) {
            const p = pin ?? randomPin();
            const token = randomToken();
            const room = { resume: randomToken(), gameToken: token, gameSeen: String(now()), ctlResume: '', ctlToken: '', ctlSeen: '0' };
            if (!(await store.createRoom(p, room, cfg.roomTtlMs))) continue;
            sess = { pin: p, role: 'game', token };
            out.push({ type: 'joined', role: 'game', room: p, token, resume: room.resume, resumed: false, peer: false });
            log(`room ${p} created`);
          }
          if (!sess) out.push(err('server_full', 'The server is busy. Try again shortly.'));
          break;
        }
        case 'resume_room': {
          if (sess) {
            out.push(err('already_joined', 'Already attached to a room.'));
            break;
          }
          const pin = String(m.room ?? '');
          const room = isPin(pin) ? await store.getRoom(pin) : null;
          const key = String(m.token ?? m.resume ?? '');
          if (!room || !key || (key !== room.gameToken && key !== room.resume)) {
            out.push(err('room_not_found', 'That room cannot be resumed.'));
            break;
          }
          sess = await attachGame(pin, room, out, true);
          break;
        }
        case 'join_room': {
          if (sess) {
            out.push(err('already_joined', 'Already attached to a room.'));
            break;
          }
          const pin = String(m.room ?? '').replace(/\D/g, '');
          const room = isPin(pin) ? await store.getRoom(pin) : null;
          if (!room) {
            log(`join failed: PIN ${pin.slice(0, 8)} not found (${ip})`);
            // Limit failed guesses so PINs can't be brute-forced.
            if (await limited(`x:rl:j:${ip}`, cfg.joinFailPerMinute)) out.push(err('rate_limited', 'Too many attempts. Try again in a minute.'));
            else out.push(err('room_not_found', 'That pairing PIN is invalid or expired.'));
            break;
          }
          // The same phone coming back (reload) keeps its key; a different phone gets a new one, and the
          // old phone hears 'replaced' on its next poll.
          const resumed = typeof m.resume === 'string' && !!room.ctlResume && m.resume === room.ctlResume;
          const ctlResume = resumed ? room.ctlResume : randomToken();
          const token = randomToken();
          await store.setRoom(pin, { ctlResume, ctlToken: token, ctlSeen: String(now()) }, 0, ['controller']);
          sess = { pin, role: 'controller', token };
          const peer = fresh(room, 'game');
          out.push({ type: 'joined', role: 'controller', room: pin, token, resume: ctlResume, resumed, peer });
          if (peer) out.push({ type: 'peer_connected', role: 'game' });
          await store.push(pin, 'game', [{ type: 'peer_connected', role: 'controller', resumed }], cfg.roomTtlMs);
          log(`room ${pin}: controller ${resumed ? 'resumed' : 'joined'} (${ip})`);
          break;
        }
        case 'ping':
          out.push({ type: 'pong', timestamp_ms: now() });
          break;
        case 'offer':
        case 'answer':
        case 'candidate': {
          if (!sess) {
            out.push(err('unauthorized', 'Join a room before sending signalling messages.'));
            break;
          }
          const { token: _t, ...rest } = m;
          forward.push({ ...rest, from: sess.role });
          break;
        }
        case 'leave': {
          if (!sess) break;
          const room = await store.getRoom(sess.pin);
          const f = field(sess.role);
          if (room && room[`${f}Token`] === sess.token) {
            await store.setRoom(sess.pin, { [`${f}Token`]: '', [`${f}Seen`]: '0' }, 0, []);
            await store.push(sess.pin, otherRole(sess.role), [{ type: 'peer_disconnected', role: sess.role }], cfg.roomTtlMs);
            log(`room ${sess.pin}: ${sess.role} left`);
          }
          sess = null;
          break;
        }
        case 'relay':
          // No server relay: phones must reach the screen directly (same Wi-Fi).
          break;
        default:
          out.push(err('unknown_message', `Unknown message type: ${m.type.slice(0, 40)}`));
      }
    }

    if (sess) {
      const r = await store.step({ ...sess, out: forward, now: now(), ttlMs: cfg.roomTtlMs, refresh: sess.role === 'game' });
      if (r.status === 'gone') out.push({ type: 'room_expired', reason: 'expired' });
      else if (r.status === 'replaced') out.push({ type: 'replaced', role: sess.role });
      else out.push(...r.msgs);
    }
    return { msgs: out };
  }

  return { handle, config: cfg };
}

// ───────────────────────────────── stores ─────────────────────────────────
// Keys: x:r:<pin> room hash · x:i:<pin>:<role> inbox list · x:rl:* rate-limit counters.
const roomKey = (pin) => `x:r:${pin}`;
const inboxKey = (pin, role) => `x:i:${pin}:${role}`;

/** In-memory store for the local server and tests (one process). */
export function memoryStore() {
  const data = new Map(); // key → {value, exp}
  const live = (key) => {
    const e = data.get(key);
    if (!e) return null;
    if (e.exp && e.exp <= Date.now()) {
      data.delete(key);
      return null;
    }
    return e;
  };
  const expire = (key, ms) => {
    const e = live(key);
    if (e && ms > 0) e.exp = Date.now() + ms;
  };
  const pushTo = (key, msgs, ttlMs) => {
    const e = live(key) || { value: [], exp: 0 };
    e.value.push(...msgs.map((m) => JSON.stringify(m)));
    data.set(key, e);
    expire(key, ttlMs);
  };
  const sweep = setInterval(() => {
    for (const k of data.keys()) live(k);
  }, 30_000);
  sweep.unref?.();
  return {
    data,
    get rooms() {
      let n = 0;
      for (const k of data.keys()) if (k.startsWith('x:r:') && live(k)) n++;
      return n;
    },
    async getRoom(pin) {
      const e = live(roomKey(pin));
      return e ? { ...e.value } : null;
    },
    async createRoom(pin, fields, ttlMs) {
      if (live(roomKey(pin))) return false;
      data.set(roomKey(pin), { value: { ...fields }, exp: Date.now() + ttlMs });
      data.delete(inboxKey(pin, 'game'));
      data.delete(inboxKey(pin, 'controller'));
      return true;
    },
    async setRoom(pin, fields, ttlMs, clear = []) {
      const e = live(roomKey(pin));
      if (!e) return;
      Object.assign(e.value, fields);
      expire(roomKey(pin), ttlMs);
      for (const role of clear) data.delete(inboxKey(pin, role));
    },
    async push(pin, role, msgs, ttlMs) {
      if (!live(roomKey(pin))) return;
      pushTo(inboxKey(pin, role), msgs, ttlMs);
    },
    async step({ pin, role, token, out, now, ttlMs, refresh }) {
      const e = live(roomKey(pin));
      if (!e) return { status: 'gone', msgs: [] };
      const f = field(role);
      if (e.value[`${f}Token`] !== token) return { status: 'replaced', msgs: [] };
      e.value[`${f}Seen`] = String(now);
      if (out.length) pushTo(inboxKey(pin, otherRole(role)), out, ttlMs);
      const inbox = live(inboxKey(pin, role));
      data.delete(inboxKey(pin, role));
      if (refresh) expire(roomKey(pin), ttlMs);
      return { status: 'ok', msgs: (inbox?.value || []).map((s) => JSON.parse(s)) };
    },
    async incr(key, windowMs) {
      const e = live(key) || { value: 0, exp: Date.now() + windowMs };
      e.value++;
      data.set(key, e);
      return e.value;
    },
    close() {
      clearInterval(sweep);
    },
  };
}

// Lua scripts: each store call is a single EVAL, i.e. one billed command on Upstash.
const LUA_CREATE = `
if redis.call('EXISTS', KEYS[1]) == 1 then return 0 end
redis.call('HSET', KEYS[1], unpack(ARGV, 2))
redis.call('PEXPIRE', KEYS[1], ARGV[1])
redis.call('DEL', KEYS[2], KEYS[3])
return 1`;
const LUA_SET = `
if redis.call('EXISTS', KEYS[1]) == 0 then return 0 end
local nclear = tonumber(ARGV[2])
for i = 1, nclear do redis.call('DEL', KEYS[1 + i]) end
if #ARGV > 2 then redis.call('HSET', KEYS[1], unpack(ARGV, 3)) end
if tonumber(ARGV[1]) > 0 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end
return 1`;
const LUA_PUSH = `
if redis.call('EXISTS', KEYS[1]) == 0 then return 0 end
redis.call('RPUSH', KEYS[2], unpack(ARGV, 2))
redis.call('PEXPIRE', KEYS[2], ARGV[1])
return 1`;
// KEYS: room, own inbox, peer inbox · ARGV: tokenField, token, seenField, now, ttlMs, refresh, msgs...
const LUA_STEP = `
if redis.call('EXISTS', KEYS[1]) == 0 then return {'gone'} end
if redis.call('HGET', KEYS[1], ARGV[1]) ~= ARGV[2] then return {'replaced'} end
redis.call('HSET', KEYS[1], ARGV[3], ARGV[4])
if #ARGV > 6 then
  redis.call('RPUSH', KEYS[3], unpack(ARGV, 7))
  redis.call('PEXPIRE', KEYS[3], ARGV[5])
end
local msgs = redis.call('LRANGE', KEYS[2], 0, -1)
if #msgs > 0 then redis.call('DEL', KEYS[2]) end
if ARGV[6] == '1' then redis.call('PEXPIRE', KEYS[1], ARGV[5]) end
table.insert(msgs, 1, 'ok')
return msgs`;
const LUA_INCR = `
local c = redis.call('INCR', KEYS[1])
if c == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end
return c`;

/**
 * An env var by name, or with any prefix (Vercel lets you prefix a connected store's variables,
 * e.g. STORAGE_KV_REST_API_URL).
 */
export function findEnv(env, names) {
  for (const n of names) if (env[n]) return env[n];
  for (const [k, v] of Object.entries(env)) if (v && names.some((n) => k.endsWith(`_${n}`))) return v;
  return '';
}

/**
 * Upstash Redis over its REST API (works from Vercel functions; no TCP connection to keep).
 * Reads KV_REST_API_URL / KV_REST_API_TOKEN (Vercel marketplace names, with or without a prefix) or
 * UPSTASH_REDIS_REST_*.
 */
export function upstashStore({ url, token, fetchImpl = fetch, env = process.env } = {}) {
  url ||= findEnv(env, ['KV_REST_API_URL', 'UPSTASH_REDIS_REST_URL']);
  token ||= findEnv(env, ['KV_REST_API_TOKEN', 'UPSTASH_REDIS_REST_TOKEN']);
  if (!url || !token) throw new Error('Upstash Redis is not configured (KV_REST_API_URL / KV_REST_API_TOKEN)');
  async function cmd(args) {
    const res = await fetchImpl(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args.map(String)),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body.error) throw new Error(`Upstash: ${body.error || res.status}`);
    return body.result;
  }
  const evalLua = (script, keys, args) => cmd(['EVAL', script, keys.length, ...keys, ...args]);
  const flat = (obj) => Object.entries(obj).flatMap(([k, v]) => [k, v]);
  return {
    async getRoom(pin) {
      const r = await cmd(['HGETALL', roomKey(pin)]);
      if (!r || (Array.isArray(r) && !r.length)) return null;
      if (!Array.isArray(r)) return r;
      const o = {};
      for (let i = 0; i < r.length; i += 2) o[r[i]] = r[i + 1];
      return o;
    },
    async createRoom(pin, fields, ttlMs) {
      return (await evalLua(LUA_CREATE, [roomKey(pin), inboxKey(pin, 'game'), inboxKey(pin, 'controller')], [ttlMs, ...flat(fields)])) === 1;
    },
    async setRoom(pin, fields, ttlMs, clear = []) {
      await evalLua(LUA_SET, [roomKey(pin), ...clear.map((r) => inboxKey(pin, r))], [ttlMs, clear.length, ...flat(fields)]);
    },
    async push(pin, role, msgs, ttlMs) {
      if (!msgs.length) return;
      await evalLua(LUA_PUSH, [roomKey(pin), inboxKey(pin, role)], [ttlMs, ...msgs.map((m) => JSON.stringify(m))]);
    },
    async step({ pin, role, token, out, now, ttlMs, refresh }) {
      const f = field(role);
      const r = await evalLua(
        LUA_STEP,
        [roomKey(pin), inboxKey(pin, role), inboxKey(pin, otherRole(role))],
        [`${f}Token`, token, `${f}Seen`, now, ttlMs, refresh ? 1 : 0, ...out.map((m) => JSON.stringify(m))],
      );
      const [status, ...rest] = Array.isArray(r) ? r : ['gone'];
      if (status !== 'ok') return { status, msgs: [] };
      return {
        status,
        msgs: rest.flatMap((s) => {
          try {
            return [JSON.parse(s)];
          } catch {
            return [];
          }
        }),
      };
    },
    async incr(key, windowMs) {
      return Number(await evalLua(LUA_INCR, [key], [windowMs]));
    },
  };
}
