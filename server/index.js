#!/usr/bin/env node
/**
 * Exemoo server: one Node process for the landing page, the phone controller, every game build
 * and the phone pairing.
 *
 *   node server/index.js          production: HTTP on PORT (the host terminates TLS)
 *   node server/index.js --lan    local play: also HTTPS on HTTPS_PORT with a self-signed cert,
 *                                 so phones on the same Wi-Fi get motion sensors
 *
 * Routes
 *   /                 landing page (public/)
 *   /pad              phone controller (public/controller.html)
 *   /play/<id>/…      a game's built files (games/<id>/), SPA fallback to its index.html
 *   /signal  (ws)     signalling hub, see signaling.js   (also accepted on / for sword-relay clients)
 *   /healthz          health check for the host
 *   /api/info         where the phone should go (pad URL) + installed games
 *   /api/qr?text=…    QR code SVG
 *   POST /api/swings  cricket swing log (camera + IMU training data), appended as JSONL to
 *                     swing_logs/cricket-YYYY-MM-DD.jsonl. Only in LAN mode or with EXEMOO_SWING_LOG=1.
 *
 * Environment: PORT (8080), HTTPS_PORT (8443, LAN only), HOST (0.0.0.0), ICE_SERVERS (JSON list of
 * RTCIceServer, e.g. a TURN server for networks that block direct WebRTC), PUBLIC_URL
 * (e.g. https://exemoo.onrender.com, otherwise taken from the request), TRUST_PROXY=1
 * (read the client IP from X-Forwarded-For; on automatically on Render and Fly).
 */
import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';
import { createSignalingHub } from './signaling.js';
import { lanIps, loadCert } from './lan.js';

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(serverDir, '..');

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
  '.task': 'application/octet-stream',
  '.bin': 'application/octet-stream',
  '.glb': 'model/gltf-binary',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
};
const compressible = /^(text\/|application\/(json|javascript|manifest|wasm)|image\/svg)/;
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  // Pairing PINs travel in /pad?pin=… URLs: never leak them to other sites.
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(self), accelerometer=(self), gyroscope=(self), magnetometer=(self)',
};

/** ICE_SERVERS env → RTCIceServer[] (STUN only if unset or invalid). */
function parseIce(raw) {
  const fallback = [{ urls: 'stun:stun.l.google.com:19302' }];
  if (!raw) return fallback;
  try {
    const list = JSON.parse(raw);
    return Array.isArray(list) && list.every((s) => s && (typeof s.urls === 'string' || Array.isArray(s.urls))) ? list : fallback;
  } catch {
    console.warn('[exemoo] ICE_SERVERS is not valid JSON; using STUN only');
    return fallback;
  }
}

export async function startServer(options = {}) {
  const cfg = {
    port: Number.parseInt(process.env.PORT || '8080', 10),
    httpsPort: Number.parseInt(process.env.HTTPS_PORT || '8443', 10),
    host: process.env.HOST || '0.0.0.0',
    publicUrl: (process.env.PUBLIC_URL || '').replace(/\/+$/, ''),
    iceServers: parseIce(process.env.ICE_SERVERS),
    trustProxy: process.env.TRUST_PROXY === '1' || !!process.env.RENDER || !!process.env.FLY_APP_NAME,
    lan: false,
    /** Accept POST /api/swings (defaults to on in LAN mode). */
    swingLog: undefined,
    swingLogDir: path.join(rootDir, 'swing_logs'),
    publicDir: path.join(rootDir, 'public'),
    gamesDir: path.join(rootDir, 'games'),
    certDir: path.join(serverDir, '.cert'),
    hub: {},
    quiet: false,
    ...options,
  };
  cfg.swingLog ??= cfg.lan || process.env.EXEMOO_SWING_LOG === '1';
  const log = cfg.quiet ? () => {} : (...a) => console.log(...a);
  const hub = createSignalingHub({ trustProxy: cfg.trustProxy, ...cfg.hub });
  const gzipCache = new Map(); // file → {mtimeMs, buf}

  // ───────────────────────────── helpers ─────────────────────────────
  function sendJson(res, status, body) {
    res.writeHead(status, { ...SECURITY_HEADERS, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(body));
  }
  function sendText(res, status, text) {
    res.writeHead(status, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(text + '\n');
  }

  /** Resolve a URL path inside `base`, refusing anything that escapes it. */
  function safeJoin(base, urlPath) {
    let p;
    try {
      p = decodeURIComponent(urlPath);
    } catch {
      return null;
    }
    if (p.includes('\0')) return null;
    const file = path.resolve(base, '.' + path.posix.normalize('/' + p));
    return file === base || file.startsWith(base + path.sep) ? file : null;
  }

  function statFile(file) {
    try {
      let st = fs.statSync(file);
      if (st.isDirectory()) {
        file = path.join(file, 'index.html');
        st = fs.statSync(file);
      }
      return st.isFile() ? { file, st } : null;
    } catch {
      return null;
    }
  }

  function serveFile(req, res, { file, st }, immutable) {
    const type = contentTypes[path.extname(file).toLowerCase()] || 'application/octet-stream';
    const etag = `W/"${st.size.toString(16)}-${Math.floor(st.mtimeMs).toString(16)}"`;
    const headers = {
      ...SECURITY_HEADERS,
      'Content-Type': type,
      'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
      'Last-Modified': st.mtime.toUTCString(),
      ETag: etag,
    };
    if (req.headers['if-none-match'] === etag) {
      res.writeHead(304, headers);
      return res.end();
    }
    let body = fs.readFileSync(file);
    if (compressible.test(type) && body.length > 1024 && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
      const c = gzipCache.get(file);
      if (c && c.mtimeMs === st.mtimeMs) body = c.buf;
      else {
        const buf = zlib.gzipSync(body, { level: 6 });
        gzipCache.set(file, { mtimeMs: st.mtimeMs, buf });
        body = buf;
      }
      headers['Content-Encoding'] = 'gzip';
      headers.Vary = 'Accept-Encoding';
    }
    headers['Content-Length'] = body.length;
    res.writeHead(200, headers);
    res.end(req.method === 'HEAD' ? undefined : body);
  }

  /** Appends one cricket swing record (a JSON object, ≤ 512 KB) as a JSONL line. */
  async function saveSwing(req, res) {
    if (!cfg.swingLog) return sendText(res, 404, 'Swing logging is off (LAN mode or EXEMOO_SWING_LOG=1)');
    const chunks = [];
    let size = 0;
    for await (const c of req) {
      size += c.length;
      if (size > 512 * 1024) return sendText(res, 413, 'Too large');
      chunks.push(c);
    }
    let rec;
    try {
      rec = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch {
      return sendText(res, 400, 'Body must be JSON');
    }
    if (!rec || typeof rec !== 'object' || Array.isArray(rec)) return sendText(res, 400, 'Body must be a JSON object');
    fs.mkdirSync(cfg.swingLogDir, { recursive: true });
    const file = path.join(cfg.swingLogDir, `cricket-${new Date().toISOString().slice(0, 10)}.jsonl`);
    await fs.promises.appendFile(file, JSON.stringify({ ...rec, receivedAt: Date.now() }) + '\n');
    res.writeHead(204, SECURITY_HEADERS);
    return res.end();
  }

  /** Games are folders in games/ that contain an index.html (each game's built dist/). */
  function installedGames() {
    try {
      return fs
        .readdirSync(cfg.gamesDir, { withFileTypes: true })
        .filter((d) => d.isDirectory() && /^[a-z0-9-]+$/.test(d.name) && fs.existsSync(path.join(cfg.gamesDir, d.name, 'index.html')))
        .map((d) => d.name);
    } catch {
      return [];
    }
  }

  /** The URL a phone should open, as seen from this request. */
  function padUrl(req) {
    if (cfg.publicUrl) return `${cfg.publicUrl}/pad`;
    if (cfg.lan) {
      const ip = lanIps()[0];
      if (ip) return `https://${ip}:${cfg.httpsPort}/pad`;
    }
    const proto = (cfg.trustProxy && String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim()) || (req.socket.encrypted ? 'https' : 'http');
    return `${proto}://${req.headers.host || `localhost:${cfg.port}`}/pad`;
  }

  // ───────────────────────────── routing ─────────────────────────────
  async function handler(req, res) {
    const url = new URL(req.url || '/', 'http://x');
    let pathname = url.pathname;

    if (pathname === '/healthz') return sendJson(res, 200, { ok: true, rooms: hub.rooms.size, sockets: hub.clients });
    if (pathname === '/api/info') {
      return sendJson(res, 200, { padUrl: padUrl(req), lan: cfg.lan, lanIps: cfg.lan ? lanIps() : [], httpsPort: cfg.lan ? cfg.httpsPort : null, games: installedGames(), iceServers: cfg.iceServers, swingLog: cfg.swingLog });
    }
    if (pathname === '/api/swings' && req.method === 'POST') return saveSwing(req, res);
    if (pathname === '/api/qr') {
      const text = url.searchParams.get('text') || '';
      if (!text || text.length > 512) return sendText(res, 400, 'text must be 1-512 characters');
      const svg = await QRCode.toString(text, { type: 'svg', margin: 1, color: { dark: '#1b1b3a', light: '#ffffff' } });
      res.writeHead(200, { ...SECURITY_HEADERS, 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store' });
      return res.end(svg);
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { ...SECURITY_HEADERS, Allow: 'GET, HEAD' });
      return res.end();
    }

    // Phone controller.
    if (pathname === '/pad' || pathname === '/pad/') pathname = '/controller.html';

    // Game builds: /play/<id>/…  (redirect /play/<id> → /play/<id>/ so relative asset URLs resolve)
    const play = pathname.match(/^\/play\/([a-z0-9-]+)(\/.*)?$/);
    if (play) {
      const [, id, rest] = play;
      const base = path.join(cfg.gamesDir, id);
      if (!installedGames().includes(id)) return sendText(res, 404, `Game "${id}" is not installed`);
      if (!rest) {
        res.writeHead(301, { ...SECURITY_HEADERS, Location: `/play/${id}/${url.search}` });
        return res.end();
      }
      const target = safeJoin(base, rest);
      if (!target) return sendText(res, 400, 'Bad request');
      let found = statFile(target);
      // SPA fallback for extension-less routes; real missing assets 404.
      if (!found && !path.extname(rest)) found = statFile(path.join(base, 'index.html'));
      if (!found) return sendText(res, 404, 'Not found');
      // Vite puts content-hashed files in assets/: cache those forever.
      return serveFile(req, res, found, found.file.startsWith(path.join(base, 'assets') + path.sep));
    }

    const target = safeJoin(cfg.publicDir, pathname);
    if (!target) return sendText(res, 400, 'Bad request');
    const found = statFile(target);
    if (!found) return sendText(res, 404, 'Not found');
    return serveFile(req, res, found, false);
  }

  function onRequest(req, res) {
    handler(req, res).catch((err) => {
      console.error('[exemoo] request failed', err);
      if (!res.headersSent) sendText(res, 500, 'Server error');
      else res.destroy();
    });
  }

  function attachUpgrade(server) {
    server.on('upgrade', (req, socket, head) => {
      const pathname = new URL(req.url || '/', 'http://x').pathname;
      if (pathname === '/signal' || pathname === '/') return hub.handleUpgrade(req, socket, head);
      socket.destroy();
    });
  }

  function listen(server, port, label) {
    return new Promise((resolve, reject) => {
      server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') reject(new Error(`${label} port ${port} is already in use. Set ${label === 'HTTPS' ? 'HTTPS_PORT' : 'PORT'}=… or stop the other process.`));
        else reject(err);
      });
      server.listen(port, cfg.host, () => resolve(server.address().port));
    });
  }

  // ───────────────────────────── start ─────────────────────────────
  const httpServer = http.createServer(onRequest);
  attachUpgrade(httpServer);
  const port = await listen(httpServer, cfg.port, 'HTTP');
  let httpsServer = null;
  let httpsPort = null;
  if (cfg.lan) {
    httpsServer = https.createServer(await loadCert(cfg.certDir, log), onRequest);
    attachUpgrade(httpsServer);
    httpsPort = await listen(httpsServer, cfg.httpsPort, 'HTTPS');
    cfg.httpsPort = httpsPort;
  }
  cfg.port = port;

  return {
    port,
    httpsPort,
    hub,
    close() {
      hub.close();
      httpServer.closeAllConnections?.();
      httpsServer?.closeAllConnections?.();
      return Promise.all([new Promise((r) => httpServer.close(r)), httpsServer ? new Promise((r) => httpsServer.close(r)) : null]);
    },
  };
}

// ─────────────────────────────── CLI ───────────────────────────────
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2);
  const lan = argv.includes('--lan') || process.env.EXEMOO_LAN === '1';
  const quiet = argv.includes('--quiet');
  try {
    const app = await startServer({ lan, quiet, hub: quiet ? {} : { log: (m) => console.log(`  · ${m}`) } });
    if (!quiet) {
      const yellow = (s) => `\x1b[38;2;255;210;31m${s}\x1b[0m`;
      const bold = (s) => `\x1b[1m${s}\x1b[0m`;
      const dim = (s) => `\x1b[2m${s}\x1b[0m`;
      console.log(`\n  ${yellow(bold('● EXEMOO'))} ${dim(lan ? 'LAN mode' : 'server')}\n`);
      console.log(`  ${bold('Screen')}   http://localhost:${app.port}/`);
      if (lan) {
        const ips = lanIps();
        console.log(`  ${bold('Phone')}    ${ips.length ? ips.map((ip) => `https://${ip}:${app.httpsPort}/pad`).join('\n           ') : `https://<LAN-IP>:${app.httpsPort}/pad`}`);
        console.log(dim('\n  Scan the QR code on the screen. Accept the self-signed certificate warning once.'));
      }
      console.log('');
    }
    const shutdown = () => {
      app.close();
      setTimeout(() => process.exit(0), 500).unref();
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error(`\n  EXEMOO server failed to start: ${err.message}\n`);
    process.exit(1);
  }
}
