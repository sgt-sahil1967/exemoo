import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import WebSocket from 'ws';
import { startServer } from '../index.js';

/** Start a server on a random port with a throwaway public/ and games/ folder. */
export async function boot(hub = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'exemoo-test-'));
  const publicDir = path.join(dir, 'public');
  const gamesDir = path.join(dir, 'games');
  fs.mkdirSync(publicDir);
  fs.mkdirSync(path.join(gamesDir, 'golf', 'assets'), { recursive: true });
  fs.writeFileSync(path.join(publicDir, 'index.html'), '<h1>landing</h1>');
  fs.writeFileSync(path.join(publicDir, 'controller.html'), '<h1>pad</h1>');
  fs.writeFileSync(path.join(dir, 'secret.txt'), 'nope');
  fs.writeFileSync(path.join(gamesDir, 'golf', 'index.html'), '<h1>golf</h1>');
  fs.writeFileSync(path.join(gamesDir, 'golf', 'assets', 'main-abc123.js'), 'console.log("golf")');
  const app = await startServer({ port: 0, host: '127.0.0.1', quiet: true, publicDir, gamesDir, hub });
  const base = `http://127.0.0.1:${app.port}`;
  return {
    app,
    base,
    ws: (p = '/signal') => new Client(`ws://127.0.0.1:${app.port}${p}`),
    async close() {
      await app.close();
      fs.rmSync(dir, { recursive: true, force: true });
    },
  };
}

/** Tiny WebSocket client that queues messages and lets tests await a given type. */
export class Client {
  constructor(url) {
    this.queue = [];
    this.waiters = [];
    this.token = undefined;
    this.ws = new WebSocket(url);
    this.ws.binaryType = 'nodebuffer';
    this.ws.on('message', (data, isBinary) => {
      const msg = isBinary ? { type: '__binary', data } : JSON.parse(data.toString());
      const i = this.waiters.findIndex((w) => w.match(msg));
      if (i >= 0) this.waiters.splice(i, 1)[0].resolve(msg);
      else this.queue.push(msg);
    });
    this.closed = new Promise((r) => this.ws.once('close', (code) => r(code)));
    this.open = new Promise((resolve, reject) => {
      this.ws.once('open', resolve);
      this.ws.once('error', reject);
    });
  }
  async send(msg, { withToken = true } = {}) {
    await this.open;
    this.ws.send(JSON.stringify(withToken && this.token ? { token: this.token, ...msg } : msg));
  }
  async sendBinary(buf) {
    await this.open;
    this.ws.send(buf, { binary: true });
  }
  next(type, timeout = 1000) {
    const match = typeof type === 'function' ? type : (m) => m.type === type;
    const i = this.queue.findIndex(match);
    if (i >= 0) return Promise.resolve(this.queue.splice(i, 1)[0]);
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error(`timeout waiting for ${typeof type === 'string' ? type : 'message'}`)), timeout);
      this.waiters.push({ match, resolve: (m) => (clearTimeout(t), resolve(m)) });
    });
  }
  /** Resolves true if no message of this type arrives within `ms`. */
  async none(type, ms = 150) {
    try {
      await this.next(type, ms);
      return false;
    } catch {
      return true;
    }
  }
  async close() {
    this.ws.close();
    await this.closed;
  }
}

/** Create a room as the game and join it as the phone. */
export async function pair(t) {
  const game = t.ws();
  await game.send({ type: 'create_room' });
  const joined = await game.next('joined');
  game.token = joined.token;
  const phone = t.ws();
  await phone.send({ type: 'join_room', room: joined.room });
  const pj = await phone.next('joined');
  phone.token = pj.token;
  await game.next('peer_connected');
  await phone.next('peer_connected');
  return { game, phone, pin: joined.room, resume: joined.resume, gameToken: joined.token };
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
