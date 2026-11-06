# Deploying Exemoo

One Node process serves everything (landing page, `/pad`, `/play/<id>/`, pairing on `/signal`).
The host must provide **HTTPS**: phones only expose motion sensors to secure pages.

```bash
npm ci && npm test              # server, pairing and reconnect tests
npm run build:ci                # build every game in games-src/ into games/ from the lockfiles
npm run check:deploy            # sizes, local paths / LAN IPs, external hosts
docker build -t exemoo . && docker run --rm -p 8080:8080 exemoo
```

## How the pieces fit

| Piece | What |
|---|---|
| `Dockerfile` | Stage 1 builds the games from `games-src/` (`npm ci`, `tsc`, `vite`); stage 2 is `node:22-alpine` with the server, `public/` and `games/`. Static games already in `games/` (cricket, farm-dash, pad-test, rapids-row) are copied as-is. Runs as `node`, health check on `/healthz`. |
| `render.yaml` | Render blueprint using that Dockerfile, so Render, CI and a local `docker build` produce the same image. |
| `.github/workflows/ci.yml` | On every push/PR: `npm ci`, `npm test`, `npm run build:ci`, `npm run check:deploy`, a production-mode smoke test, then a Docker build + health check. |
| `.env.example` | Every environment variable, with defaults. |

`games/` stays committed: it holds the static games, and the prebuilt Vite games let `npm start` work
from a plain checkout. The image rebuilds the Vite games anyway, so a stale `games/` can't ship.

## Render (recommended)

1. Push the repo to GitHub.
2. In Render: **New → Blueprint**, pick the repo. It reads `render.yaml` (Docker, one instance,
   health check `/healthz`, `NODE_ENV=production`, `TRUST_PROXY=1`).
3. Render asks for the `sync: false` values. Leave them empty for a first deploy.
4. Open `https://<service>.onrender.com` on the laptop/TV and scan the QR code with a phone.

Plan: the free plan sleeps after inactivity (the first visit then takes ~1 min and drops everyone
connected). Use `starter` or above for real play.

Without Docker (Render “Node” runtime): build command
`npm ci && npm run build:ci && npm prune --omit=dev`, start command `npm start`, same env vars.

## Custom domain

1. Render → the service → **Settings → Custom Domains → Add**, e.g. `play.example.com`.
2. At your DNS provider add the record Render shows (CNAME `play` → `<service>.onrender.com`;
   for an apex domain, the A/ALIAS record it gives).
3. Wait for Render to issue the certificate (automatic).
4. Set `PUBLIC_URL=https://play.example.com` so QR codes and pad links use the domain.

HSTS is sent automatically once requests arrive over HTTPS.

## Docker anywhere else (Fly, a VPS, …)

```bash
docker build -t exemoo .
docker run -d --restart unless-stopped -p 8080:8080 \
  -e PUBLIC_URL=https://play.example.com -e TRUST_PROXY=1 exemoo
```

Put a TLS proxy in front (Caddy: `play.example.com { reverse_proxy localhost:8080 }`). It must pass
WebSocket upgrades on `/signal` and set `X-Forwarded-For` / `X-Forwarded-Proto`. Only set
`TRUST_PROXY=1` when a proxy really sits in front (otherwise clients could fake their IP for the
rate limits). On Fly, `FLY_APP_NAME` turns it on automatically.

## Phones on the open internet: WebRTC and TURN

The phone first tries a **direct WebRTC data channel** to the screen (lowest latency). If that does
not open within 5 s, or dies later, it uses the **server WebSocket relay** automatically, so play
always works; the relay just adds the round trip to the server. On home Wi-Fi both devices are
usually on the same network and connect directly. Across networks (phone on cellular, strict
corporate/hotel Wi-Fi) direct connections often need a **TURN** server:

- Managed: Cloudflare Calls TURN, Twilio Network Traversal, Metered.ca. Put what they give you in
  `ICE_SERVERS` as JSON, e.g.
  `[{"urls":"stun:stun.l.google.com:19302"},{"urls":["turn:turn.example.com:3478","turns:turn.example.com:5349"],"username":"…","credential":"…"}]`.
  Prefer providers' short-lived credentials if they offer an API.
- Self-hosted coturn with `use-auth-secret` / `static-auth-secret=<secret>`: set
  `TURN_URLS=turn:turn.example.com:3478,turns:turn.example.com:5349` and `TURN_SECRET=<secret>`.
  The server then hands each page credentials valid for `TURN_TTL_S` (6 h), so no static password
  is ever published.

Without TURN nothing breaks; more phones simply end up on the relay (the pad shows “relay”).

## Connection reliability (what the code does)

- Both clients send a heartbeat on the signalling socket every 5 s; a socket silent for 12 s after
  a ping (Wi-Fi ↔ cellular switch, NAT timeout) is dropped and reopened with jittered backoff. The
  server pings every 15 s and drops sockets that miss a pong.
- The screen keeps its PIN across reloads (resume key in `sessionStorage`); after a server restart
  it re-creates the room with the **same PIN**. The pad keeps its pairing in `sessionStorage`, so a
  reloaded phone rejoins the same screen without the PIN and is reported as `resumed`; while
  resuming it keeps looking for a missing room for 10 minutes instead of giving up.
- A room waits `ROOM_GRACE_MS` (5 min) for its screen to come back; a room with no screen and no
  traffic is reaped after `ROOM_IDLE_TTL_MS` (30 min).
- Tab visible again, network back online, or an iOS back/forward-cache restore: the clients check or
  reopen their socket immediately.
- Deploys: on `SIGTERM` the server stops accepting connections, `/readyz` turns 503, and every
  socket is closed with code 1012 so clients reconnect to the new instance within a second.

## Hardening that is on by default

Security headers (CSP allowing only the CDNs the games use, `X-Frame-Options`, `nosniff`,
`Referrer-Policy: no-referrer` so PINs in URLs don't leak, `Permissions-Policy`, HSTS on HTTPS),
brotli/gzip, immutable caching for hashed `assets/`, `no-cache` + ETag for HTML and shared JS, byte
ranges for media. Pairing limits per IP (30 rooms/min, 20 wrong PINs/min, 60 sockets), a global
socket cap, 64 KB frames, a per-socket message-rate limit, a WebSocket `Origin` check, and a rate
limit on `/api/qr`. Logs are JSON lines in production.

External hosts the pages load from (allowed in the CSP): `fonts.googleapis.com`,
`fonts.gstatic.com`, `unpkg.com` and `cdn.jsdelivr.net` (three.js, MediaPipe),
`storage.googleapis.com` (pose models), `odml.pa.googleapis.com` (MediaPipe telemetry). If you add
a game that loads from elsewhere, add the host to `CSP` in `server/index.js` (or set
`CSP=report-only` while testing).

## Scaling

Rooms are in memory, so run **one instance**. One small instance handles thousands of paired
phones (the relay forwards ~60 small packets/s per relayed phone). Scaling out later needs sticky
routing by PIN plus a shared room store (e.g. Redis pub/sub).

## Checklist for you (needs your accounts)

- [ ] Push to GitHub; check the CI run is green (the first run also proves the Docker build works).
- [ ] Render: New → Blueprint → this repo; pick a paid plan for real play.
- [ ] Optional: custom domain + DNS record + `PUBLIC_URL`.
- [ ] Optional: TURN provider or coturn → `ICE_SERVERS` or `TURN_URLS` + `TURN_SECRET`.
- [ ] Test with a phone on cellular data (not the laptop's Wi-Fi): pad should say “direct” with
      TURN, “relay” without.
- [ ] Commit `games-src/farm-kart/package-lock.json` so its build is pinned like the others.
