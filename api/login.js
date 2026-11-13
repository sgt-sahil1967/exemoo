// POST /api/login {email}: emails an alpha tester a sign-in link (server/auth.js).
import { withApi } from '../server/vercel.js';

export const POST = (request) => withApi(request, (api, ip) => api.login(request, ip));
