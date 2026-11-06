/**
 * Exemoo signalling hub: pairs one game screen with one phone controller in a six-digit PIN room.
 *
 * Based on sword-relay-main/index.js (PIN rooms, per-socket tokens, offer/answer/candidate
 * forwarding), merged with what the existing games already rely on:
 *   - table-tennis / golf: create_room {pin, resume}, relay {payload}, binary frames
 *   - fruit-slice:         resume_room {room, token}, relay {data}, 'replaced' / 'room_closed'
 *
 * Protocol (JSON text frames):
 *   game  → {type:'create_room', pin?, resume?}  → {type:'joined', role:'game', room, token, resume, peer, expires_in, features}
 *   game  → {type:'resume_room', room, token}    → same 'joined' (token = the game's previous token or resume key)
 *   phone → {type:'join_room', room, resume?}    → {type:'joined', role:'controller', room, token, resume, resumed, peer, ...}
 *                                                  (resume = the controller key from an earlier 'joined': a reloaded
 *                                                  pad presents it and is reported as resumed)
 *   both  ← {type:'peer_connected'|'peer_disconnected', role, resumed?}
 *   both  → {type:'offer'|'answer'|'candidate', token, ...}   forwarded to the peer with `from`
 *   both  → {type:'relay', token, payload|data}               forwarded to the peer with `from` (WebRTC fallback)
 *   both  → binary frames                                     forwarded verbatim (sensor packets in fallback mode)
 *   both  → {type:'ping'}                                     → {type:'pong', timestamp_ms}
 *   both  ← {type:'replaced'} | {type:'room_closed'|'room_expired', reason} | {type:'error', code, message}
 *
 * Rooms live while their game screen is connected. When the game leaves, the room is kept for
 * `gameGraceMs` so a reloaded tab (or a laptop waking up) can resume the same PIN; after that it is
 * closed. A room with no game and no traffic for `idleTtlMs` is reaped.
 *
 * Abuse limits: per-IP room creation, failed PIN guesses and open sockets; a global socket cap;
 * frame size (`maxPayload`); a per-socket message rate (token bucket) that closes floods with 1008.
 * `close()` ends every socket with 1012 (service restart) so clients reconnect at once to the next
 * instance, where the screen re-creates its room with the same PIN.
 */
import crypto from 'node:crypto';
import { WebSocketServer } from 'ws';

const DEFAULTS = {
  /** Room whose game left is closed after this long (time to reload and resume). */
  gameGraceMs: 5 * 60_000,
  /** Room with no traffic at all is closed after this long. */
  idleTtlMs: 30 * 60_000,
  /** Heartbeat interval; a socket that misses one pong is terminated. */
  heartbeatMs: 15_000,
  /** Max inbound frame size (bytes). */
  maxPayload: 64 * 1024,
  /** Upper bound on rooms held in memory. */
  maxRooms: 10_000,
  /** Per-IP limits (sliding one-minute window). */
  createPerMinute: 30,
  joinFailPerMinute: 20,
  socketsPerIp: 60,
  /** Global cap on open signalling sockets. */
  maxSockets: 5000,
  /** Per-socket message rate: sustained messages/s and burst (sensor relay is ~60/s). */
  msgPerSecond: 200,
  msgBurst: 400,
  /** Max bytes queued to a peer before binary sensor frames are dropped. */
  maxBuffered: 256 * 1024,
  log: () => {},
};

const FEATURES = ['relay', 'binary_relay', 'resume', 'resume_room', 'rejoin', 'controller_resume'];
const SIGNAL_TYPES = new Set(['offer', 'answer', 'candidate']);

const randomToken = () => crypto.randomBytes(16).toString('hex');
const randomPin = () => String(crypto.randomInt(100000, 1000000));
const isPin = (p) => typeof p === 'string' && /^\d{6}$/.test(p);
const otherRole = (role) => (role === 'game' ? 'controller' : 'game');

function send(socket, message) {
  if (socket?.readyState === 1) socket.send(JSON.stringify(message));
}
const fail = (socket, code, message) => send(socket, { type: 'error', code, message });

/** Counts events per key over a sliding minute. */
export function rateLimiter() {
  const hits = new Map();
  return {
    take(key, limit) {
      const now = Date.now();
      const list = (hits.get(key) || []).filter((t) => now - t < 60_000);
      if (list.length >= limit) {
        hits.set(key, list);
        return false;
      }
      list.push(now);
      hits.set(key, list);
      return true;
    },
    sweep() {
      const now = Date.now();
      for (const [k, list] of hits) if (!list.some((t) => now - t < 60_000)) hits.delete(k);
    },
  };
}

export function createSignalingHub(options = {}) {
  const cfg = { ...DEFAULTS, ...options };
  const log = cfg.log;
  /** @type {Map<string, {pin:string, resume:string, game:any, controller:any, gameToken:string|null, gameLeftAt:number, lastActivity:number}>} */
  const rooms = new Map();
  const creates = rateLimiter();
  const joinFails = rateLimiter();
  const socketsByIp = new Map();
  const stats = { roomsCreated: 0, pairs: 0, resumes: 0, relayedJson: 0, relayedBinary: 0, droppedBinary: 0, floods: 0, refused: 0 };
  let closing = false;

  // ─────────────────────────────── rooms ───────────────────────────────
  function newRoom(wantPin) {
    let pin = isPin(wantPin) && !rooms.has(wantPin) ? wantPin : null;
    while (!pin || rooms.has(pin)) pin = randomPin();
    const room = { pin, resume: randomToken(), controllerResume: null, game: null, controller: null, gameToken: null, gameLeftAt: 0, lastActivity: Date.now() };
    rooms.set(pin, room);
    stats.roomsCreated++;
    log(`room ${pin} created`);
    return room;
  }

  function closeRoom(room, reason) {
    if (rooms.get(room.pin) !== room) return;
    rooms.delete(room.pin);
    log(`room ${room.pin} closed (${reason})`);
    for (const role of ['game', 'controller']) {
      const slot = room[role];
      if (!slot) continue;
      send(slot.socket, { type: reason === 'expired' ? 'room_expired' : 'room_closed', reason });
      slot.socket.session = null;
      room[role] = null;
    }
  }

  function roomAlive(room) {
    if (!room || rooms.get(room.pin) !== room) return false;
    const now = Date.now();
    if (!room.game && room.gameLeftAt && now - room.gameLeftAt > cfg.gameGraceMs) {
      closeRoom(room, 'game_left');
      return false;
    }
    // A connected game screen keeps its room (the heartbeat proves it is alive); idle TTL only reaps abandoned rooms.
    if (!room.game && now - room.lastActivity > cfg.idleTtlMs) {
      closeRoom(room, 'expired');
      return false;
    }
    return true;
  }

  function attach(socket, room, role, token, resumed = false) {
    const existing = room[role];
    if (existing && existing.socket !== socket) {
      // A newer connection replaces a stale one (phone or game reconnected before the old socket died).
      existing.socket.session = null;
      room[role] = null;
      send(existing.socket, { type: 'replaced', role });
      send(room[otherRole(role)]?.socket, { type: 'peer_disconnected', role });
      try {
        existing.socket.close(4001, 'replaced');
      } catch {
        /* ignore */
      }
    }
    room[role] = { socket, token };
    room.lastActivity = Date.now();
    if (role === 'game') {
      room.gameToken = token;
      room.gameLeftAt = 0;
    }
    socket.session = { room, role, token };
    const peer = room[otherRole(role)];
    send(socket, {
      type: 'joined',
      role,
      room: room.pin,
      token,
      resume: role === 'game' ? room.resume : room.controllerResume,
      resumed,
      peer: !!peer,
      expires_in: Math.floor(cfg.idleTtlMs / 1000),
      features: FEATURES,
    });
    log(`room ${room.pin}: ${role} ${resumed ? 'resumed' : 'joined'} (${socket.ip})`);
    if (resumed) stats.resumes++;
    if (peer) {
      stats.pairs++;
      send(peer.socket, { type: 'peer_connected', role, resumed });
      send(socket, { type: 'peer_connected', role: otherRole(role) });
    }
  }

  function detach(socket) {
    const session = socket.session;
    if (!session) return;
    socket.session = null;
    const { room, role } = session;
    if (room[role]?.socket !== socket) return;
    room[role] = null;
    room.lastActivity = Date.now();
    if (role === 'game') room.gameLeftAt = Date.now();
    send(room[otherRole(role)]?.socket, { type: 'peer_disconnected', role });
    log(`room ${room.pin}: ${role} left`);
    // A room whose controller left stays open for the game; a room whose game left waits out the grace period.
  }

  // ───────────────────────────── messages ─────────────────────────────
  function handleJson(socket, message) {
    if (!message || typeof message.type !== 'string') return fail(socket, 'invalid_message', 'Message must contain a type.');
    const { type } = message;
    const session = socket.session;
    if (session) session.room.lastActivity = Date.now();

    switch (type) {
      case 'create_room': {
        if (session) return fail(socket, 'already_joined', 'This socket is already attached to a room.');
        // Resume: a reloaded game reclaims its room (the phone may still be in it).
        const existing = isPin(message.pin) ? rooms.get(message.pin) : null;
        if (existing && roomAlive(existing) && typeof message.resume === 'string' && message.resume === existing.resume) {
          return attach(socket, existing, 'game', randomToken(), true);
        }
        if (!creates.take(socket.ip, cfg.createPerMinute)) return fail(socket, 'rate_limited', 'Too many rooms created. Try again in a minute.');
        if (rooms.size >= cfg.maxRooms) return fail(socket, 'server_full', 'The server is busy. Try again shortly.');
        return attach(socket, newRoom(existing ? null : message.pin), 'game', randomToken());
      }
      case 'resume_room': {
        if (session) return fail(socket, 'already_joined', 'This socket is already attached to a room.');
        const room = rooms.get(String(message.room ?? ''));
        const key = String(message.token ?? message.resume ?? '');
        if (!roomAlive(room) || !key || (key !== room.gameToken && key !== room.resume)) {
          return fail(socket, 'room_not_found', 'That room cannot be resumed.');
        }
        return attach(socket, room, 'game', room.gameToken || randomToken(), true);
      }
      case 'join_room': {
        if (session) return fail(socket, 'already_joined', 'This socket is already attached to a room.');
        const room = rooms.get(String(message.room ?? '').replace(/\D/g, ''));
        if (!roomAlive(room)) {
          log(`join failed: PIN ${String(message.room ?? '').slice(0, 8)} not found (from ${socket.ip})`);
          // Limit failed guesses so PINs can't be brute-forced.
          if (!joinFails.take(socket.ip, cfg.joinFailPerMinute)) return fail(socket, 'rate_limited', 'Too many attempts. Try again in a minute.');
          return fail(socket, 'room_not_found', 'That pairing PIN is invalid or expired.');
        }
        // Same phone coming back (reload, reconnect) keeps its key; a different phone gets a new one,
        // which invalidates the old phone's key.
        const resumed = typeof message.resume === 'string' && !!room.controllerResume && message.resume === room.controllerResume;
        if (!resumed) room.controllerResume = randomToken();
        return attach(socket, room, 'controller', randomToken(), resumed);
      }
      case 'ping':
        return send(socket, { type: 'pong', timestamp_ms: Date.now() });
      default:
        break;
    }

    if (!session || message.token !== session.token) {
      return fail(socket, 'unauthorized', 'Join a room before sending signalling messages.');
    }
    const peer = session.room[otherRole(session.role)];
    if (SIGNAL_TYPES.has(type)) {
      if (!peer) return fail(socket, 'peer_not_connected', 'The other device has not joined yet.');
      const { token: _t, ...rest } = message;
      return send(peer.socket, { ...rest, from: session.role });
    }
    if (type === 'relay') {
      if (!peer) return; // peer gone: drop silently, the sender will hear peer_disconnected
      stats.relayedJson++;
      const { token: _t, ...rest } = message;
      return send(peer.socket, { ...rest, from: session.role });
    }
    return fail(socket, 'unknown_message', `Unknown message type: ${type}`);
  }

  function handleBinary(socket, data) {
    const session = socket.session;
    if (!session) return;
    session.room.lastActivity = Date.now();
    const peer = session.room[otherRole(session.role)];
    if (peer?.socket.readyState !== 1) return;
    // Sensor frames are real-time: drop rather than queue when the peer is slow.
    if (peer.socket.bufferedAmount > cfg.maxBuffered) {
      stats.droppedBinary++;
      return;
    }
    stats.relayedBinary++;
    peer.socket.send(data, { binary: true });
  }

  // ───────────────────────────── sockets ──────────────────────────────
  const wss = new WebSocketServer({ noServer: true, maxPayload: cfg.maxPayload, perMessageDeflate: false });
  wss.on('connection', (socket, req) => {
    socket.ip = clientIp(req, cfg.trustProxy);
    socket.isAlive = true;
    socket.on('pong', () => (socket.isAlive = true));
    socket.bucket = cfg.msgBurst;
    socket.bucketAt = Date.now();
    socket.on('message', (raw, isBinary) => {
      socket.isAlive = true;
      // Token bucket: a client flooding messages is cut off (the real pad sends ~60 sensor frames/s).
      const now = Date.now();
      socket.bucket = Math.min(cfg.msgBurst, socket.bucket + ((now - socket.bucketAt) * cfg.msgPerSecond) / 1000);
      socket.bucketAt = now;
      if (--socket.bucket < 0) {
        stats.floods++;
        log(`flood from ${socket.ip}: closing socket`);
        return socket.close(1008, 'rate limit');
      }
      if (isBinary) return handleBinary(socket, raw);
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return fail(socket, 'invalid_json', 'Message must be valid JSON.');
      }
      handleJson(socket, msg);
    });
    const done = () => {
      detach(socket);
      const n = (socketsByIp.get(socket.ip) || 1) - 1;
      if (n <= 0) socketsByIp.delete(socket.ip);
      else socketsByIp.set(socket.ip, n);
    };
    socket.once('close', done);
  });

  /** Upgrade an HTTP request to a signalling socket (call from server 'upgrade'). */
  function handleUpgrade(req, socket, head) {
    const ip = clientIp(req, cfg.trustProxy);
    const n = socketsByIp.get(ip) || 0;
    const refuse = (status) => {
      stats.refused++;
      socket.write(`HTTP/1.1 ${status}\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`);
      socket.destroy();
    };
    if (closing) return refuse('503 Service Unavailable');
    if (n >= cfg.socketsPerIp) return refuse('429 Too Many Requests');
    if (wss.clients.size >= cfg.maxSockets) return refuse('503 Service Unavailable');
    socketsByIp.set(ip, n + 1);
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req));
  }

  const heartbeat = setInterval(() => {
    for (const socket of wss.clients) {
      if (!socket.isAlive) {
        socket.terminate();
        continue;
      }
      socket.isAlive = false;
      try {
        socket.ping();
      } catch {
        /* ignore */
      }
    }
  }, cfg.heartbeatMs);
  heartbeat.unref();

  const sweeper = setInterval(() => {
    for (const room of rooms.values()) roomAlive(room);
    creates.sweep();
    joinFails.sweep();
  }, Math.max(100, Math.min(30_000, Math.floor(cfg.gameGraceMs / 2))));
  sweeper.unref();

  return {
    rooms,
    stats,
    handleUpgrade,
    clientIp: (req) => clientIp(req, cfg.trustProxy),
    get clients() {
      return wss.clients.size;
    },
    /**
     * Stop. With `graceful`, sockets are closed with 1012 (service restart) so clients reconnect to
     * the next instance right away; stragglers are terminated after `graceMs`.
     */
    close({ graceful = false, graceMs = 1000 } = {}) {
      closing = true;
      clearInterval(heartbeat);
      clearInterval(sweeper);
      if (!graceful) {
        for (const s of wss.clients) s.terminate();
        wss.close();
        return Promise.resolve();
      }
      for (const s of wss.clients) s.close(1012, 'server restart');
      return new Promise((resolve) => {
        const t0 = Date.now();
        const check = setInterval(() => {
          if (wss.clients.size && Date.now() - t0 < graceMs) return;
          clearInterval(check);
          for (const s of wss.clients) s.terminate();
          wss.close();
          resolve();
        }, 25);
      });
    },
  };
}

/** Client IP; behind a proxy (Render, Fly) the first X-Forwarded-For entry is the real client. */
export function clientIp(req, trustProxy) {
  if (trustProxy) {
    const fwd = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    if (fwd) return fwd;
  }
  return req.socket.remoteAddress || 'unknown';
}
