/**
 * The dynamic routes, as Web-standard handlers (Request → Response), shared by the Vercel functions
 * in api/ and the local Node server:
 *
 *   POST /api/signal   pairing (server/pairing.js)
 *   GET  /api/qr       QR code SVG for a pad link
 *   POST /api/login    email a sign-in link (server/auth.js)
 *   GET  /api/auth     sign-in link → session cookie
 *   GET  /api/logout
 */
import QRCode from 'qrcode';
import { createPairing } from './pairing.js';
import { authConfig, handleAuth, handleLogin, handleLogout, signedInEmail } from './auth.js';

const MAX_BODY = 64 * 1024;

const json = (status, body, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers } });

const envInt = (env, name, def) => {
  const v = Number.parseInt(env[name] || '', 10);
  return Number.isFinite(v) && v > 0 ? v : def;
};

/** Client IP from the request headers (Vercel sets x-real-ip; proxies set x-forwarded-for). */
export function requestIp(request, fallback = 'unknown') {
  const h = request.headers;
  return h.get('x-real-ip') || String(h.get('x-forwarded-for') || '').split(',')[0].trim() || fallback;
}

/** GET /api/qr?text=… → QR code SVG. `limited()` → true when the caller is over its rate limit. */
export async function qrResponse(request, limited = async () => false) {
  const text = new URL(request.url).searchParams.get('text') || '';
  if (!text || text.length > 512) return new Response('text must be 1-512 characters\n', { status: 400 });
  if (await limited()) return new Response('Too many requests\n', { status: 429, headers: { 'Retry-After': '60' } });
  const svg = await QRCode.toString(text, { type: 'svg', margin: 1, color: { dark: '#1b1b3a', light: '#ffffff' } });
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'private, max-age=3600' } });
}

export function createApi({ store, env = process.env, log = () => {} }) {
  const pairing = createPairing({
    store,
    log: (m) => log('debug', m),
    roomTtlMs: envInt(env, 'ROOM_GRACE_MS', 5 * 60_000),
  });
  const auth = authConfig(env);
  const over = (limit, windowMs) => async (key) => (await store.incr(key, windowMs)) > limit;

  return {
    pairing,
    auth,

    async signal(request, ip = requestIp(request)) {
      if (request.method !== 'POST') return json(405, { error: 'POST only' }, { Allow: 'POST' });
      const text = await request.text();
      if (text.length > MAX_BODY) return json(413, { error: 'Too large' });
      let body;
      try {
        body = JSON.parse(text);
      } catch {
        return json(400, { msgs: [{ type: 'error', code: 'invalid_json', message: 'Body must be JSON.' }] });
      }
      const cookie = request.headers.get('cookie');
      const reply = await pairing.handle(body, { ip, canCreate: async () => !!(await signedInEmail(cookie, auth)) });
      return json(200, reply);
    },

    qr: (request, ip = requestIp(request)) => qrResponse(request, () => over(120, 60_000)(`x:rl:q:${ip}`)),

    login(request, ip = requestIp(request)) {
      return handleLogin(request, auth, { ip, limit: over(5, 10 * 60_000), log: (m) => log('info', m) });
    },
    signIn: (request) => handleAuth(request, auth),
    logout: (request) => handleLogout(request, auth),
  };
}
