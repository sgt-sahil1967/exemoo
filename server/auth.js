/**
 * Alpha access: only emails on an allowlist can start Exemoo on a screen.
 *
 *   1. /login.html posts an email to /api/login.
 *   2. If it is on ALPHA_EMAILS, a sign-in link (signed, 15 min) is emailed through Resend. The reply
 *      is the same either way, so the form can't be used to probe who is on the list.
 *   3. /api/auth?t=… checks the link and sets a signed session cookie (30 days, HttpOnly).
 *   4. The landing page, games and new pairing rooms need that cookie (middleware.js on Vercel,
 *      server/index.js locally). The phone pad stays open: it can only join a signed-in screen's PIN.
 *
 * No database: tokens are HMAC-signed with AUTH_SECRET. Removing an email from the list stops new
 * sign-ins and invalidates its sessions at the next check; changing AUTH_SECRET signs everyone out.
 * The gate is off while AUTH_SECRET is unset (local development).
 *
 * Web Crypto only, so the same file runs in Node, Vercel functions and Vercel's edge middleware.
 *
 * Env: AUTH_SECRET, ALPHA_EMAILS ("a@x.com, b@y.com, @team.com" — an @domain entry allows the
 * whole domain), RESEND_API_KEY, MAIL_FROM ("Exemoo <alpha@yourdomain.com>"), PUBLIC_URL (optional).
 */
export const SESSION_COOKIE = 'exemoo_session';
const LOGIN_TTL_MS = 15 * 60_000;
const SESSION_TTL_MS = 30 * 24 * 3600_000;

const enc = new TextEncoder();
const b64u = (bytes) => {
  let s = '';
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const fromB64u = (s) => {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64u(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}

/** Signed token `<payload>.<mac>`; payload carries `x` (expiry, epoch ms). */
export async function signToken(secret, payload) {
  const body = b64u(enc.encode(JSON.stringify(payload)));
  return `${body}.${await hmac(secret, body)}`;
}

/** The payload of a valid, unexpired token of kind `k`, else null. */
export async function verifyToken(secret, token, kind, now = Date.now()) {
  if (!secret || typeof token !== 'string') return null;
  const [body, mac, extra] = token.split('.');
  if (!body || !mac || extra !== undefined) return null;
  const want = await hmac(secret, body);
  if (want.length !== mac.length) return null;
  let diff = 0;
  for (let i = 0; i < want.length; i++) diff |= want.charCodeAt(i) ^ mac.charCodeAt(i);
  if (diff) return null;
  try {
    const p = JSON.parse(new TextDecoder().decode(fromB64u(body)));
    return p && p.k === kind && typeof p.x === 'number' && p.x > now ? p : null;
  } catch {
    return null;
  }
}

export const normalizeEmail = (e) => String(e || '').trim().toLowerCase();
const looksLikeEmail = (e) => e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export function authConfig(env = process.env) {
  const allow = String(env.ALPHA_EMAILS || '')
    .split(/[\s,;]+/)
    .map(normalizeEmail)
    .filter(Boolean);
  return {
    enabled: !!env.AUTH_SECRET,
    secret: env.AUTH_SECRET || '',
    allow,
    resendKey: env.RESEND_API_KEY || '',
    from: env.MAIL_FROM || 'Exemoo <onboarding@resend.dev>',
    publicUrl: String(env.PUBLIC_URL || '').replace(/\/+$/, ''),
  };
}

export function allowed(cfg, email) {
  const e = normalizeEmail(email);
  if (!looksLikeEmail(e)) return false;
  const domain = e.slice(e.lastIndexOf('@'));
  return cfg.allow.includes(e) || cfg.allow.includes(domain);
}

export function readCookie(header, name) {
  for (const part of String(header || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return '';
}

/** Signed-in email for this Cookie header, or null. With the gate off, everyone counts as signed in. */
export async function signedInEmail(cookieHeader, cfg) {
  if (!cfg.enabled) return 'dev';
  const p = await verifyToken(cfg.secret, readCookie(cookieHeader, SESSION_COOKIE), 's');
  return p && allowed(cfg, p.e) ? p.e : null;
}

const json = (status, body, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers } });

const page = (request, cfg) => cfg.publicUrl || new URL(request.url).origin;

/**
 * POST /api/login {email}. `limit(key)` → true when over the rate limit; `send(mail)` → Promise
 * (defaults to Resend); `log` gets the link when no mail provider is set (local development).
 */
export async function handleLogin(request, cfg, { limit = async () => false, send, log = () => {}, ip = 'unknown' } = {}) {
  if (request.method !== 'POST') return json(405, { error: 'POST only' }, { Allow: 'POST' });
  if (!cfg.enabled) return json(200, { ok: true, open: true });
  let email = '';
  try {
    email = normalizeEmail((await request.json())?.email);
  } catch {
    /* not JSON */
  }
  if (!looksLikeEmail(email)) return json(400, { error: 'Enter a valid email address.' });
  if ((await limit(`x:rl:l:${ip}`)) || (await limit(`x:rl:le:${email}`))) return json(429, { error: 'Too many attempts. Try again in a few minutes.' });
  if (allowed(cfg, email)) {
    const token = await signToken(cfg.secret, { k: 'l', e: email, x: Date.now() + LOGIN_TTL_MS });
    const link = `${page(request, cfg)}/api/auth?t=${encodeURIComponent(token)}`;
    const mail = {
      from: cfg.from,
      to: [email],
      subject: 'Your Exemoo sign-in link',
      text: `Open this link on the computer you play on to sign in to Exemoo (valid for 15 minutes):\n\n${link}\n\nIf you didn't ask for this, ignore this email.`,
      html: `<p>Open this link on the computer you play on to sign in to Exemoo (valid for 15 minutes):</p><p><a href="${link}">Sign in to Exemoo</a></p><p>If you didn't ask for this, ignore this email.</p>`,
    };
    try {
      if (send) await send(mail);
      else if (cfg.resendKey) await sendWithResend(cfg.resendKey, mail);
      else log(`sign-in link for ${email}: ${link}`);
    } catch (e) {
      log(`sign-in email to ${email} failed: ${e.message}`);
      return json(502, { error: 'Could not send the email. Try again shortly.' });
    }
  }
  return json(200, { ok: true });
}

async function sendWithResend(key, mail) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(mail),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

const cookie = (request, value, maxAgeS) =>
  `${SESSION_COOKIE}=${value}; Path=/; Max-Age=${maxAgeS}; HttpOnly; SameSite=Lax${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`;

/** GET /api/auth?t=… : sign-in link → session cookie → the landing page. */
export async function handleAuth(request, cfg) {
  const url = new URL(request.url);
  const base = page(request, cfg);
  if (!cfg.enabled) return Response.redirect(`${base}/`, 302);
  const p = await verifyToken(cfg.secret, url.searchParams.get('t') || '', 'l');
  if (!p || !allowed(cfg, p.e)) return Response.redirect(`${base}/login.html?expired=1`, 302);
  const session = await signToken(cfg.secret, { k: 's', e: p.e, x: Date.now() + SESSION_TTL_MS });
  return new Response(null, { status: 302, headers: { Location: `${base}/`, 'Set-Cookie': cookie(request, session, SESSION_TTL_MS / 1000), 'Cache-Control': 'no-store' } });
}

/** GET|POST /api/logout */
export function handleLogout(request, cfg) {
  return new Response(null, { status: 302, headers: { Location: `${page(request, cfg)}/login.html`, 'Set-Cookie': cookie(request, '', 0), 'Cache-Control': 'no-store' } });
}

/** Paths that need a signed-in screen (pages only; game assets and the phone pad stay open). */
export function gatedPath(pathname) {
  return pathname === '/' || pathname === '/index.html' || pathname === '/info.json' || pathname === '/api/info' || /^\/play\/[a-z0-9-]+\/(index\.html)?$/.test(pathname);
}

/** The gate: null to continue, or a Response (redirect to sign-in for pages, 401 inside a game frame). */
export async function gate(request, cfg) {
  if (!cfg.enabled) return null;
  const url = new URL(request.url);
  if (!gatedPath(url.pathname)) return null;
  if (await signedInEmail(request.headers.get('cookie'), cfg)) return null;
  if (url.pathname === '/' || url.pathname === '/index.html') return Response.redirect(new URL('/login.html', request.url).href, 302);
  return new Response('Sign in to Exemoo first.', { status: 401, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });
}
