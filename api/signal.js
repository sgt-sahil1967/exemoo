// POST /api/signal: phone ↔ screen pairing (server/pairing.js).
import { withApi } from '../server/vercel.js';

export const POST = (request) => withApi(request, (api, ip) => api.signal(request, ip));
