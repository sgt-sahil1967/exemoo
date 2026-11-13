/**
 * Vercel glue: one API instance per function instance, backed by Upstash Redis (add it from the
 * Vercel Marketplace; it sets KV_REST_API_URL and KV_REST_API_TOKEN). See DEPLOY.md.
 */
import { createApi, requestIp } from './api.js';
import { upstashStore } from './pairing.js';

let api = null;

/** Run `fn(api, ip)`; a missing Redis setup or a crash becomes a JSON error instead of a 500 page. */
export async function withApi(request, fn) {
  try {
    api ??= createApi({ store: upstashStore(), log: (lvl, m) => lvl !== 'debug' && console.log(m) });
    return await fn(api, requestIp(request));
  } catch (e) {
    console.error('[exemoo]', e?.stack || e);
    const setup = /not configured/.test(String(e?.message));
    return new Response(JSON.stringify({ error: setup ? 'Redis is not set up for this deployment (see DEPLOY.md).' : 'Server error' }), {
      status: setup ? 503 : 500,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }
}
