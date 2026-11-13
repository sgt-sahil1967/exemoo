import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { startServer } from '../index.js';

/** Start a server on a random port with a throwaway public/ and games/ folder. `env` feeds the API (auth, room TTL). */
export async function boot(env = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'exemoo-test-'));
  const publicDir = path.join(dir, 'public');
  const gamesDir = path.join(dir, 'games');
  fs.mkdirSync(publicDir);
  fs.mkdirSync(path.join(gamesDir, 'golf', 'assets'), { recursive: true });
  fs.writeFileSync(path.join(publicDir, 'index.html'), '<h1>landing</h1>');
  fs.writeFileSync(path.join(publicDir, 'controller.html'), '<h1>pad</h1>');
  fs.writeFileSync(path.join(publicDir, 'login.html'), '<h1>login</h1>');
  fs.writeFileSync(path.join(dir, 'secret.txt'), 'nope');
  fs.writeFileSync(path.join(gamesDir, 'golf', 'index.html'), '<h1>golf</h1>');
  fs.writeFileSync(path.join(gamesDir, 'golf', 'assets', 'main-abc123.js'), 'console.log("golf")');
  const app = await startServer({ port: 0, host: '127.0.0.1', quiet: true, publicDir, gamesDir, env });
  const base = `http://127.0.0.1:${app.port}`;
  return {
    app,
    base,
    dir,
    /** A pairing client (one side of a room) talking to /api/signal. */
    client: (opts) => new Client(`${base}/api/signal`, opts),
    async close() {
      await app.close();
      fs.rmSync(dir, { recursive: true, force: true });
    },
  };
}

/** Minimal pairing client: posts messages, remembers its room session, returns the replies. */
export class Client {
  constructor(url, { cookie = '', ip } = {}) {
    this.url = url;
    this.cookie = cookie;
    this.ip = ip;
    this.sess = null;
  }
  async post(...msgs) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.cookie) headers.Cookie = this.cookie;
    const res = await fetch(this.url, { method: 'POST', headers, body: JSON.stringify({ ...(this.sess || {}), msgs }) });
    const body = await res.json();
    for (const m of body.msgs || []) {
      if (m.type === 'joined') this.sess = { pin: m.room, role: m.role, token: m.token };
      if (m.type === 'replaced' || m.type === 'room_expired') this.sess = null;
    }
    return body.msgs || [];
  }
  /** Poll (no messages). */
  poll() {
    return this.post();
  }
}

export const find = (msgs, type) => msgs.find((m) => m.type === type);

/** Create a room as the game and join it as the phone. */
export async function pair(t) {
  const game = t.client();
  const gj = find(await game.post({ type: 'create_room' }), 'joined');
  const phone = t.client();
  const pr = await phone.post({ type: 'join_room', room: gj.room });
  return { game, phone, pin: gj.room, resume: gj.resume, phoneJoined: find(pr, 'joined'), phoneReplies: pr };
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const until = async (fn, ms = 8000, what = 'condition') => {
  const t0 = Date.now();
  while (!(await fn())) {
    if (Date.now() - t0 > ms) throw new Error(`timed out waiting for ${what}`);
    await sleep(20);
  }
};
