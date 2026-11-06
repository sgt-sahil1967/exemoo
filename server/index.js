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
 *   /healthz          liveness for the host: {ok, rooms, sockets, uptime}
 *   /readyz           readiness: 503 while shutting down
 *   /api/info         where the phone should go (pad URL), installed games, ICE servers
 *   /api/qr?text=…    QR code SVG
 *   POST /api/swings  cricket swing log (camera + IMU training data), appended as JSONL to
 *                     swing_logs/cricket-YYYY-MM-DD.jsonl. Only in LAN mode or with EXEMOO_SWING_LOG=1.
 *
 * Every environment variable is documented in .env.example and server/README.md.
 */
import crypto from 'node:crypto';
import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';
import { createSignalingHub, rateLimiter } from './signaling.js';
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
  '.tflite': 'application/octet-stream',
  '.bin': 'application/octet-stream',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};
const compressible = /^(text\/|application\/(json|javascript|manifest|wasm)|image\/svg|model\/gltf\+json|audio\/wav)/;

/**
 * Content-Security-Policy. The games load three.js / MediaPipe from jsDelivr and unpkg, the pose
 * models from storage.googleapis.com and fonts from Google Fonts; some static games use inline
 * scripts and import maps, and MediaPipe compiles WebAssembly. Everything else is same-origin.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' blob: https://cdn.jsdelivr.net https://unpkg.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "media-src 'self' data: blob: mediastream:",
  "connect-src 'self' ws: wss: data: blob: https://cdn.jsdelivr.net https://unpkg.com https://storage.googleapis.com https://odml.pa.googleapis.com",
  "worker-src 'self' blob:",
  "frame-src 'self'",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const BASE_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  // Pairing PINs travel in /pad?pin=… URLs: never leak them to other sites.
  'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'SAMEORIGIN',
  'Permissions-Policy': 'camera=(self), microphone=(), geolocation=(), accelerometer=(self), gyroscope=(self), magnetometer=(self), fullscreen=(self), screen-wake-lock=(self)',
};

/** ICE_SERVERS env → RTCIceServer[] (STUN only if unset or invalid). */
export function parseIce(raw, warn = () => {}) {
  const fallback = [{ urls: 'stun:stun.l.google.com:19302' }];
  if (!raw) return fallback;
  try {
    const list = JSON.parse(raw);
    if (Array.isArray(list) && list.every((s) => s && (typeof s.urls === 'string' || Array.isArray(s.urls)))) return list;
    warn('ICE_SERVERS must be a JSON array of RTCIceServer; using STUN only');
  } catch {
    warn('ICE_SERVERS is not valid JSON; using STUN only');
  }
  return fallback;
}

/**
 * Logger: JSON lines in production (one object per line, for the host's log search), short text
 * in development. Levels: debug < info < warn < error.
 */
export function createLogger({ format = 'text', level = 'info', quiet = false } = {}) {
  const order = { debug: 10, info: 20, warn: 30, error: 40 };
  const min = order[level] ?? 20;
  const out = (lvl, msg, fields = {}) => {
    if (quiet || order[lvl] < min) return;
    const stream = lvl === 'error' || lvl === 'warn' ? process.stderr : process.stdout;
    if (format === 'json') stream.write(JSON.stringify({ time: new Date().toISOString(), level: lvl, msg, ...fields }) + '\n');
    else {
      const extra = Object.keys(fields).length ? ' ' + Object.entries(fields).map(([k, v]) => `${k}=${typeof v === 'string' ? v : JSON.stringify(v)}`).join(' ') : '';
      stream.write(`${lvl === 'debug' ? '  · ' : `[${lvl}] `}${msg}${extra}\n`);
    }
  };
  return { debug: (m, f) => out('debug', m, f), info: (m, f) => out('info', m, f), warn: (m, f) => out('warn', m, f), error: (m, f) => out('error', m, f) };
}

const envInt = (name, def) => {
  const v = Number.parseInt(process.env[name] || '', 10);
  return Number.isFinite(v) && v >= 0 ? v : def;
};

export async function startServer(options = {}) {
  const production = process.env.NODE_ENV === 'production';
  const cfg = {
    port: envInt('PORT', 8080),
    httpsPort: envInt('HTTPS_PORT', 8443),
    host: process.env.HOST || '0.0.0.0',
    publicUrl: (process.env.PUBLIC_URL || '').replace(/\/+$/, ''),
    iceServers: undefined,
    /** TURN REST credentials (coturn `use-auth-secret`): short-lived username/password per /api/info. */
    turnUrls: (process.env.TURN_URLS || '').split(',').map((s) => s.trim()).filter(Boolean),
    turnSecret: process.env.TURN_SECRET || '',
    turnTtlS: envInt('TURN_TTL_S', 6 * 3600),
    trustProxy: ['1', 'true', 'yes'].includes(String(process.env.TRUST_PROXY).toLowerCase()) || !!process.env.RENDER || !!process.env.FLY_APP_NAME,
    /** Extra origins allowed to open /signal (comma-separated, or '*'); the page's own host is always allowed. */
    allowedOrigins: (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim().replace(/\/+$/, '')).filter(Boolean),
    /** 'on' | 'report-only' | 'off' */
    csp: (process.env.CSP || 'on').toLowerCase(),
    lan: false,
    /** Accept POST /api/swings (defaults to on in LAN mode). */
    swingLog: undefined,
    swingLogDir: path.join(rootDir, 'swing_logs'),
    publicDir: path.join(rootDir, 'public'),
    gamesDir: path.join(rootDir, 'games'),
    certDir: path.join(serverDir, '.cert'),
    hub: {},
    quiet: false,
    logFormat: process.env.LOG_FORMAT || (production ? 'json' : 'text'),
    logLevel: process.env.LOG_LEVEL || (production ? 'info' : 'debug'),
    ...options,
  };
  const log = options.logger || createLogger({ format: cfg.logFormat, level: cfg.logLevel, quiet: cfg.quiet });
  cfg.iceServers ??= parseIce(process.env.ICE_SERVERS, (m) => log.warn(m));
  cfg.swingLog ??= cfg.lan || process.env.EXEMOO_SWING_LOG === '1';
  if (production && cfg.lan) log.warn('LAN mode (self-signed HTTPS) is for local play; in production the host should terminate TLS');
  const hubOptions = {
    trustProxy: cfg.trustProxy,
    log: (m) => log.debug(m),
    ...(process.env.ROOM_GRACE_MS ? { gameGraceMs: envInt('ROOM_GRACE_MS', 300_000) } : {}),
    ...(process.env.ROOM_IDLE_TTL_MS ? { idleTtlMs: envInt('ROOM_IDLE_TTL_MS', 1_800_000) } : {}),
    ...(process.env.MAX_SOCKETS ? { maxSockets: envInt('MAX_SOCKETS', 5000) } : {}),
    ...(process.env.MAX_ROOMS ? { maxRooms: envInt('MAX_ROOMS', 10_000) } : {}),
    ...cfg.hub,
  };
  const hub = createSignalingHub(hubOptions);
  const compressCache = new Map(); // `${enc}:${file}` → {mtimeMs, buf} | Promise
  const qrLimit = rateLimiter();
  const startedAt = Date.now();
  let draining = false;

  // ───────────────────────────── helpers ─────────────────────────────
  const firstHeader = (v) => String(v || '').split(',')[0].trim();
  const isHttps = (req) => req.socket.encrypted || (cfg.trustProxy && firstHeader(req.headers['x-forwarded-proto']) === 'https');

  function headersFor(req, extra) {
    const h = { ...BASE_HEADERS };
    if (cfg.csp === 'on') h['Content-Security-Policy'] = CSP;
    else if (cfg.csp === 'report-only') h['Content-Security-Policy-Report-Only'] = CSP;
    // HSTS only for real certificates (not the LAN self-signed one).
    if (!cfg.lan && isHttps(req)) h['Strict-Transport-Security'] = 'max-age=15552000';
    return Object.assign(h, extra);
  }
  function sendJson(req, res, status, body) {
    res.writeHead(status, headersFor(req, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }));
    res.end(JSON.stringify(body));
  }
  function sendText(req, res, status, text, extra) {
    res.writeHead(status, headersFor(req, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', ...extra }));
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

  /** Compressed copy of a file, computed once off the main thread and cached until it changes. */
  function compressed(file, st, enc) {
    const key = `${enc}:${file}`;
    const c = compressCache.get(key);
    if (c && c.mtimeMs === st.mtimeMs) return c.buf ?? c.pending;
    const pending = fs.promises.readFile(file).then(
      (raw) =>
        new Promise((resolve, reject) => {
          const done = (err, buf) => {
            if (err) return reject(err);
            compressCache.set(key, { mtimeMs: st.mtimeMs, buf });
            resolve(buf);
          };
          if (enc === 'br') zlib.brotliCompress(raw, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 9, [zlib.constants.BROTLI_PARAM_SIZE_HINT]: raw.length } }, done);
          else zlib.gzip(raw, { level: 6 }, done);
        }),
    );
    compressCache.set(key, { mtimeMs: st.mtimeMs, pending });
    pending.catch(() => compressCache.delete(key));
    return pending;
  }

  async function serveFile(req, res, { file, st }, immutable) {
    const type = contentTypes[path.extname(file).toLowerCase()] || 'application/octet-stream';
    const etag = `W/"${st.size.toString(16)}-${Math.floor(st.mtimeMs).toString(16)}"`;
    const canCompress = compressible.test(type) && st.size > 1024;
    const headers = headersFor(req, {
      'Content-Type': type,
      // Hashed build assets never change; everything else revalidates (cheap 304 via ETag).
      'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
      'Last-Modified': st.mtime.toUTCString(),
      ETag: etag,
      'Accept-Ranges': 'bytes',
    });
    if (canCompress) headers.Vary = 'Accept-Encoding';
    if (req.headers['if-none-match'] === etag) {
      res.writeHead(304, headers);
      return res.end();
    }
    // Byte ranges (Safari needs them to play audio/video), served uncompressed.
    const range = /^bytes=(\d*)-(\d*)$/.exec(String(req.headers.range || ''));
    if (range && (range[1] || range[2])) {
      let start = range[1] ? Number(range[1]) : Math.max(0, st.size - Number(range[2]));
      let end = range[1] && range[2] ? Math.min(Number(range[2]), st.size - 1) : st.size - 1;
      if (start > end || start >= st.size) {
        res.writeHead(416, headersFor(req, { 'Content-Range': `bytes */${st.size}` }));
        return res.end();
      }
      res.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${st.size}`, 'Content-Length': end - start + 1 });
      if (req.method === 'HEAD') return res.end();
      return fs.createReadStream(file, { start, end }).on('error', () => res.destroy()).pipe(res);
    }
    const accept = String(req.headers['accept-encoding'] || '');
    const enc = !canCompress ? null : /\bbr\b/.test(accept) ? 'br' : /\bgzip\b/.test(accept) ? 'gzip' : null;
    if (enc) {
      const body = await compressed(file, st, enc);
      headers['Content-Encoding'] = enc;
      headers['Content-Length'] = body.length;
      res.writeHead(200, headers);
      return res.end(req.method === 'HEAD' ? undefined : body);
    }
    headers['Content-Length'] = st.size;
    res.writeHead(200, headers);
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).on('error', () => res.destroy()).pipe(res);
  }

  /** Appends one cricket swing record (a JSON object, ≤ 512 KB) as a JSONL line. */
  async function saveSwing(req, res) {
    if (!cfg.swingLog) return sendText(req, res, 404, 'Swing logging is off (LAN mode or EXEMOO_SWING_LOG=1)');
    const chunks = [];
    let size = 0;
    for await (const c of req) {
      size += c.length;
      if (size > 512 * 1024) return sendText(req, res, 413, 'Too large');
      chunks.push(c);
    }
    let rec;
    try {
      rec = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch {
      return sendText(req, res, 400, 'Body must be JSON');
    }
    if (!rec || typeof rec !== 'object' || Array.isArray(rec)) return sendText(req, res, 400, 'Body must be a JSON object');
    fs.mkdirSync(cfg.swingLogDir, { recursive: true });
    const file = path.join(cfg.swingLogDir, `cricket-${new Date().toISOString().slice(0, 10)}.jsonl`);
    await fs.promises.appendFile(file, JSON.stringify({ ...rec, receivedAt: Date.now() }) + '\n');
    res.writeHead(204, headersFor(req));
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
    const proto = isHttps(req) ? 'https' : 'http';
    const host = (cfg.trustProxy && firstHeader(req.headers['x-forwarded-host'])) || req.headers.host || `localhost:${cfg.port}`;
    return `${proto}://${host}/pad`;
  }

  /** ICE servers for a client; with TURN_SECRET, adds a TURN entry with fresh REST-API credentials. */
  function iceServersFor() {
    if (!cfg.turnSecret || !cfg.turnUrls.length) return cfg.iceServers;
    const username = `${Math.floor(Date.now() / 1000) + cfg.turnTtlS}:exemoo`;
    const credential = crypto.createHmac('sha1', cfg.turnSecret).update(username).digest('base64');
    return [...cfg.iceServers, { urls: cfg.turnUrls, username, credential }];
  }

  /** Browsers send Origin on WebSocket upgrades: only our own pages (and ALLOWED_ORIGINS) may pair. */
  function originAllowed(req) {
    const origin = req.headers.origin;
    if (!origin || cfg.lan || cfg.allowedOrigins.includes('*')) return true;
    let o;
    try {
      o = new URL(origin);
    } catch {
      return false;
    }
    if (cfg.allowedOrigins.includes(o.origin)) return true;
    if (cfg.publicUrl && new URL(cfg.publicUrl).host === o.host) return true;
    const host = (cfg.trustProxy && firstHeader(req.headers['x-forwarded-host'])) || req.headers.host;
    return !!host && o.host === host;
  }

  // ───────────────────────────── routing ─────────────────────────────
  async function handler(req, res) {
    const url = new URL(req.url || '/', 'http://x');
    let pathname = url.pathname;

    if (pathname === '/healthz') return sendJson(req, res, 200, { ok: true, rooms: hub.rooms.size, sockets: hub.clients, uptime: Math.round((Date.now() - startedAt) / 1000) });
    if (pathname === '/readyz') return sendJson(req, res, draining ? 503 : 200, { ready: !draining });
    if (pathname === '/api/info') {
      return sendJson(req, res, 200, { padUrl: padUrl(req), lan: cfg.lan, lanIps: cfg.lan ? lanIps() : [], httpsPort: cfg.lan ? cfg.httpsPort : null, games: installedGames(), iceServers: iceServersFor(), swingLog: cfg.swingLog });
    }
    if (pathname === '/api/swings' && req.method === 'POST') return saveSwing(req, res);
    if (pathname === '/api/qr') {
      const text = url.searchParams.get('text') || '';
      if (!text || text.length > 512) return sendText(req, res, 400, 'text must be 1-512 characters');
      if (!qrLimit.take(hub.clientIp(req), 120)) return sendText(req, res, 429, 'Too many requests', { 'Retry-After': '60' });
      const svg = await QRCode.toString(text, { type: 'svg', margin: 1, color: { dark: '#1b1b3a', light: '#ffffff' } });
      res.writeHead(200, headersFor(req, { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'private, max-age=3600' }));
      return res.end(svg);
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, headersFor(req, { Allow: 'GET, HEAD' }));
      return res.end();
    }

    // Phone controller.
    if (pathname === '/pad' || pathname === '/pad/') pathname = '/controller.html';

    // Game builds: /play/<id>/…  (redirect /play/<id> → /play/<id>/ so relative asset URLs resolve)
    const play = pathname.match(/^\/play\/([a-z0-9-]+)(\/.*)?$/);
    if (play) {
      const [, id, rest] = play;
      const base = path.join(cfg.gamesDir, id);
      if (!installedGames().includes(id)) return sendText(req, res, 404, `Game "${id}" is not installed`);
      if (!rest) {
        res.writeHead(301, headersFor(req, { Location: `/play/${id}/${url.search}` }));
        return res.end();
      }
      const target = safeJoin(base, rest);
      if (!target) return sendText(req, res, 400, 'Bad request');
      let found = statFile(target);
      // SPA fallback for extension-less routes; real missing assets 404.
      if (!found && !path.extname(rest)) found = statFile(path.join(base, 'index.html'));
      if (!found) return sendText(req, res, 404, 'Not found');
      // Vite puts content-hashed files in assets/: cache those forever.
      return serveFile(req, res, found, found.file.startsWith(path.join(base, 'assets') + path.sep));
    }

    const target = safeJoin(cfg.publicDir, pathname);
    if (!target) return sendText(req, res, 400, 'Bad request');
    const found = statFile(target);
    if (!found) return sendText(req, res, 404, 'Not found');
    return serveFile(req, res, found, false);
  }

  function onRequest(req, res) {
    handler(req, res).catch((err) => {
      log.error('request failed', { path: req.url, err: err?.stack || String(err) });
      if (!res.headersSent) sendText(req, res, 500, 'Server error');
      else res.destroy();
    });
  }

  function attachUpgrade(server) {
    server.on('upgrade', (req, socket, head) => {
      socket.on('error', () => {});
      const pathname = new URL(req.url || '/', 'http://x').pathname;
      if (pathname !== '/signal' && pathname !== '/') return socket.destroy();
      if (!originAllowed(req)) {
        log.warn('websocket origin refused', { origin: String(req.headers.origin).slice(0, 200) });
        socket.write('HTTP/1.1 403 Forbidden\r\nConnection: close\r\nContent-Length: 0\r\n\r\n');
        return socket.destroy();
      }
      return hub.handleUpgrade(req, socket, head);
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
  // Behind a proxy, keep idle keep-alive sockets open longer than the proxy does (avoids 502s).
  httpServer.keepAliveTimeout = 65_000;
  httpServer.headersTimeout = 66_000;
  attachUpgrade(httpServer);
  const port = await listen(httpServer, cfg.port, 'HTTP');
  let httpsServer = null;
  let httpsPort = null;
  if (cfg.lan) {
    httpsServer = https.createServer(await loadCert(cfg.certDir, (m) => log.info(m.trim())), onRequest);
    attachUpgrade(httpsServer);
    httpsPort = await listen(httpsServer, cfg.httpsPort, 'HTTPS');
    cfg.httpsPort = httpsPort;
  }
  cfg.port = port;
  const servers = [httpServer, httpsServer].filter(Boolean);
  const closeServers = () => Promise.all(servers.map((s) => new Promise((r) => s.close(r))));

  return {
    port,
    httpsPort,
    hub,
    log,
    get draining() {
      return draining;
    },
    /** Immediate stop (tests). */
    async close() {
      draining = true;
      await hub.close();
      for (const s of servers) s.closeAllConnections?.();
      await closeServers();
    },
    /**
     * Graceful stop for SIGTERM (deploys): /readyz turns 503, phones and screens get close code
     * 1012 and reconnect to the next instance, in-flight HTTP requests finish.
     */
    async shutdown({ timeoutMs = 10_000 } = {}) {
      if (draining) return;
      draining = true;
      log.info('shutting down', { rooms: hub.rooms.size, sockets: hub.clients });
      const force = setTimeout(() => servers.forEach((s) => s.closeAllConnections?.()), timeoutMs);
      force.unref();
      const closed = closeServers();
      for (const s of servers) s.closeIdleConnections?.();
      await hub.close({ graceful: true, graceMs: Math.min(2000, timeoutMs) });
      await closed;
      clearTimeout(force);
    },
  };
}

// ─────────────────────────────── CLI ───────────────────────────────
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2);
  const lan = argv.includes('--lan') || process.env.EXEMOO_LAN === '1';
  const quiet = argv.includes('--quiet');
  let app;
  try {
    app = await startServer({ lan, quiet });
  } catch (err) {
    console.error(`\n  EXEMOO server failed to start: ${err.message}\n`);
    process.exit(1);
  }
  const { log } = app;
  const pretty = (process.env.LOG_FORMAT || (process.env.NODE_ENV === 'production' ? 'json' : 'text')) === 'text';
  if (!quiet && pretty) {
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
  } else {
    log.info('listening', { port: app.port, httpsPort: app.httpsPort, lan, node: process.version, publicUrl: process.env.PUBLIC_URL || null, turn: !!process.env.TURN_SECRET || /turns?:/.test(process.env.ICE_SERVERS || '') });
  }
  let stopping = false;
  const shutdown = async (signal) => {
    if (stopping) return process.exit(1); // second Ctrl-C: quit now
    stopping = true;
    log.info('signal received', { signal });
    await app.shutdown().catch((err) => log.error('shutdown failed', { err: String(err) }));
    process.exit(0);
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('unhandledRejection', (err) => log.error('unhandled rejection', { err: err?.stack || String(err) }));
  process.on('uncaughtException', (err) => {
    log.error('uncaught exception', { err: err?.stack || String(err) });
    process.exit(1);
  });
}
