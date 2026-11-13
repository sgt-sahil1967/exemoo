/**
 * Vercel Routing Middleware: the alpha sign-in gate (server/auth.js). Runs only for the landing
 * page, game pages and the game list, so game assets and the phone pad cost nothing. Off while
 * AUTH_SECRET is unset.
 */
import { authConfig, gate } from './server/auth.js';

export const config = {
  matcher: ['/', '/index.html', '/info.json', '/api/info', '/play/:id/', '/play/:id/index.html'],
};

export default async function middleware(request) {
  return (await gate(request, authConfig(process.env))) ?? undefined;
}
