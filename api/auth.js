// GET /api/auth?t=…: the emailed sign-in link; sets the session cookie.
import { authConfig, handleAuth } from '../server/auth.js';

export const GET = (request) => handleAuth(request, authConfig(process.env));
