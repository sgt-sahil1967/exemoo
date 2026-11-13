// GET /api/logout: clears the session cookie.
import { authConfig, handleLogout } from '../server/auth.js';

export const GET = (request) => handleLogout(request, authConfig(process.env));
export const POST = GET;
