// GET /api/qr?text=…: QR code SVG for a pad link.
import { withApi } from '../server/vercel.js';

export const GET = (request) => withApi(request, (api, ip) => api.qr(request, ip));
