# Exemoo server

One Node process serves everything: the landing page, the phone controller (`/pad`), every game
build (`/play/<id>/`) and the phone pairing. It is built on `sword-relay-main/index.js` and keeps
the same idea: the server only pairs devices and passes the WebRTC handshake, then the phone
streams motion straight to the screen over a data channel. A WebSocket relay is the fallback
when a direct connection can't be made.

## Run

```bash
npm install
npm run dev     # LAN mode: http://localhost:8080 for the screen, https://<LAN-IP>:8443/pad for phones
npm start       # production mode: HTTP only on $PORT, TLS comes from the host
npm test        # protocol, HTTP and phone-link tests (node:test)
```

In LAN mode the HTTPS certificate is self-signed (cached in `server/.cert/`), so a phone shows a
warning once. Motion sensors only work on HTTPS pages, which is why LAN mode exists.

## Files

| File | What |
|---|---|
| `index.js` | HTTP(S) server, static files, `/play/<id>/`, `/api/*`, WebSocket routing, CLI |
| `signaling.js` | PIN rooms + signalling hub (`/signal`, and `/` for sword-relay clients) |
| `lan.js` | LAN IP detection + self-signed certificate |
| `test/` | `npm test` |

## Signalling protocol (`/signal`)

Wire-compatible with sword-relay, table-tennis / golf and fruit-slice.

| Direction | Message | Reply / effect |
|---|---|---|
| game → | `{type:'create_room', pin?, resume?}` | `{type:'joined', role:'game', room, token, resume, peer, expires_in, features}`. With a matching `pin`+`resume` the game gets its old room back. |
| game → | `{type:'resume_room', room, token}` | Same `joined`, for fruit-slice (`token` = its previous token or the resume key) |
| phone → | `{type:'join_room', room, resume?}` | `{type:'joined', role:'controller', resume, resumed, ...}`. `resume` is the controller key from a previous `joined`; a reloaded pad that presents it is `resumed` (also in the game's `peer_connected`). A different phone gets a new key. |
| both ← | `peer_connected` / `peer_disconnected` `{role}` | |
| both → | `offer` / `answer` / `candidate` `{token, ...}` | Forwarded to the peer with `from` (token removed) |
| both → | `{type:'relay', token, payload \| data}` | Forwarded to the peer with `from` |
| both → | binary frame | Forwarded verbatim (dropped if the peer is backed up) |
| both → | `{type:'ping'}` | `{type:'pong', timestamp_ms}` |
| both ← | `replaced`, `room_closed` / `room_expired` `{reason}`, `error` `{code, message}` | |
| both ← | close code `1012` | Server restarting (deploy): reconnect right away. `1008` = message flood. |

Room rules:
- A room lives while its game screen is connected. The server pings every 15 s and drops dead sockets.
- If the game leaves, the room waits `ROOM_GRACE_MS` (5 min) so a reloaded tab or a waking laptop can
  resume the same PIN, then closes. After a server restart the screen re-creates the same PIN.
- A new phone joining a room replaces the old phone (reconnects just work).
- Rate limits per IP: 30 new rooms a minute, 20 wrong PINs a minute, 60 open sockets; globally
  `MAX_SOCKETS`; per socket 200 messages/s (burst 400); 64 KB frames; browser `Origin` must be this site.
- Clients (`public/js/pad-link.js`, `screen-link.js`, helpers in `net-watch.js`) send a heartbeat
  every 5 s, reopen a socket that stays silent 12 s, back off with jitter, and recheck on tab
  visible / online / bfcache restore. Tests: `test/reconnect.test.js`.

## HTTP routes

| Route | What |
|---|---|
| `/` | Landing page (`public/`) |
| `/pad` | Phone controller (`public/controller.html`) |
| `/sdk/exemoo.js` | Game SDK (`public/sdk/`), see `games/README.md` |
| `/js/*` | Shared browser modules: `protocol.js`, `screen-link.js`, `pad-link.js`, `shell.js`, `pad.js` |
| `/play/<id>/…` | Built game in `games/<id>/`, SPA fallback to its `index.html`, `assets/` cached forever |
| `/healthz` | `{ok, rooms, sockets, uptime}` for the host's health check |
| `/readyz` | 200, or 503 while shutting down |
| `/api/info` | `{padUrl, lan, lanIps, httpsPort, games}`: the URL to put in the QR code |
| `/api/qr?text=…` | QR code SVG (text up to 512 characters) |

## Deploy

See [`../DEPLOY.md`](../DEPLOY.md) (Render blueprint, Docker, custom domain, TURN) and
[`../.env.example`](../.env.example) for every environment variable.

| Env | Default | |
|---|---|---|
| `PORT` / `HOST` | 8080 / 0.0.0.0 | |
| `NODE_ENV` | | `production` → JSON logs at info level |
| `PUBLIC_URL` | (from request) | Base URL put in the QR code |
| `TRUST_PROXY` | on for Render/Fly | Read client IP/proto/host from `X-Forwarded-*` |
| `ICE_SERVERS` | Google STUN | JSON list of RTCIceServer (add TURN) |
| `TURN_URLS`, `TURN_SECRET`, `TURN_TTL_S` | | coturn REST credentials, handed out by `/api/info` |
| `ALLOWED_ORIGINS` | | Extra origins allowed to open `/signal` |
| `CSP` | `on` | `on`, `report-only`, `off` |
| `ROOM_GRACE_MS`, `ROOM_IDLE_TTL_MS` | 300000, 1800000 | Room lifetimes |
| `MAX_SOCKETS`, `MAX_ROOMS` | 5000, 10000 | Global caps |
| `LOG_FORMAT`, `LOG_LEVEL` | text/debug in dev, json/info in production | |
| `EXEMOO_LAN`, `HTTPS_PORT` | | LAN mode (self-signed HTTPS), local only |

Rooms are in memory, so run a single instance.
