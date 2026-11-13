# Deploying Exemoo (Vercel, free Hobby plan)

Exemoo runs entirely on Vercel:

| Piece | On Vercel |
|---|---|
| Landing page, `/pad`, `/play/<id>/` | Static files. `scripts/build-vercel.mjs` lays them out in `dist/` (games come prebuilt from `games/`). |
| `/api/info` | Static `info.json` (game list), via a rewrite in `vercel.json`. |
| `/api/signal` | Pairing function (`api/signal.js` → `server/pairing.js`). Rooms live in **Upstash Redis**. |
| `/api/qr` | QR code function. |
| `/api/login`, `/api/auth`, `/api/logout` + `middleware.js` | Alpha sign-in (email allowlist, emailed link, cookie). |

Phones pair through the server, then talk to the screen **directly over the local Wi-Fi** (WebRTC
data channel). There is no relay and no TURN, so phones on mobile data can't play: Android phones
that report mobile data are told so before pairing, other phones after the direct connection fails.
Playing costs the server almost nothing: a connected pair makes about 7 requests a minute.

## One-time setup

1. **Push to GitHub** (this repo).
2. **Vercel → Add New → Project →** import the repo. Vercel reads `vercel.json` (no framework,
   build `node scripts/build-vercel.mjs`, output `dist/`). Deploy. It works without Redis for the
   pages, but pairing returns 503 until step 3.
3. **Storage → Marketplace → Upstash (Redis) → Create**, free plan, region close to the
   functions (Vercel's default is Washington, D.C. `iad1`, so pick `us-east-1`). Connect it to the
   project; Vercel adds `KV_REST_API_URL` and `KV_REST_API_TOKEN`. **Redeploy**.
4. Open `https://<project>.vercel.app` on the laptop/TV, scan the QR code with a phone on the same
   Wi-Fi.

### Alpha sign-in (optional, recommended)

5. Sign up at [resend.com](https://resend.com) (free: 3,000 emails/month), verify a domain you own,
   create an API key.
6. In Vercel → Settings → Environment Variables (Production) add:
   - `AUTH_SECRET`: a long random string (`openssl rand -hex 32`)
   - `ALPHA_EMAILS`: `friend@example.com, other@example.com` (or `@yourteam.com` for a whole domain)
   - `RESEND_API_KEY`: from step 5
   - `MAIL_FROM`: `Exemoo <alpha@your-verified-domain.com>`
7. Redeploy. Visitors now land on `/login.html`, enter their email, and get a sign-in link valid for
   15 minutes; the session lasts 30 days. Phones don't sign in: they join a signed-in screen's PIN.

To add or remove testers, edit `ALPHA_EMAILS` and redeploy. Removing an email also ends its existing
sessions. Changing `AUTH_SECRET` signs everyone out.

## Free-plan limits (as of Nov 2026)

| Service | Free allowance / month | Exemoo's use |
|---|---|---|
| Vercel Hobby | 1M function invocations, 4 CPU-hours | 1 invocation per pairing poll, QR and sign-in |
| Vercel Hobby | 1M edge requests (middleware) | 1 per page load of `/` or a game |
| Upstash Redis | 500K commands, 256 MB | 1 command per pairing poll |

Rough budget: a screen waiting for a phone polls every 2 s, backing off to every 15 s after 10 minutes
and every 30 s in a hidden tab; a playing pair makes about 7 polls a minute. 500K commands is
roughly 400 screen-hours of waiting or 1,000+ hours of play a month. Over a limit nothing is charged:
the feature stops until the month resets (Vercel can pause the project). Hobby is for
non-commercial use; charging money needs Vercel Pro.

## Checks

```bash
npm ci && npm test        # pairing, sign-in, phone-link and HTTP tests
npm run build             # rebuild the Vite games into games/ (commit the result)
npm run build:vercel      # what Vercel runs: dist/
npm run check:deploy      # sizes, local paths / LAN IPs, external hosts
```

When you change a Vite game in `games-src/` (or `public/js/screen-link.js`, which two of them
bundle), run `npm run build` and commit `games/`: Vercel copies `games/` as-is.

## Local play and self-hosting

`npm run dev` runs the same routes in one Node process with rooms in memory (and self-signed HTTPS
for phones on your LAN). The `Dockerfile` still builds that server if you ever want to self-host
(`docker build -t exemoo . && docker run -p 8080:8080 exemoo`, behind a TLS proxy); it keeps rooms in
memory, so run one instance.
