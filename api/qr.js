// GET /api/qr?text=…: QR code SVG for a pad link. Needs no Redis: the rate limit is per function
// instance (in memory), so the QR code shows even before the pairing store is set up.
import { qrResponse, requestIp } from '../server/api.js';
import { memoryStore } from '../server/pairing.js';

const limits = memoryStore();

export const GET = (request) => qrResponse(request, async () => (await limits.incr(`q:${requestIp(request)}`, 60_000)) > 120);
