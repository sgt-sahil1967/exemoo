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
| phone → | `{type:'join_room', room}` | `{type:'joined', role:'controller', ...}` |
| both ← | `peer_connected` / `peer_disconnected` `{role}` | |
| both → | `offer` / `answer` / `candidate` `{token, ...}` | Forwarded to the peer with `from` (token removed) |
| both → | `{type:'relay', token, payload \| data}` | Forwarded to the peer with `from` |
| both → | binary frame | Forwarded verbatim (dropped if the peer is backed up) |
| both → | `{type:'ping'}` | `{type:'pong', timestamp_ms}` |
| both ← | `replaced`, `room_closed` / `room_expired` `{reason}`, `error` `{code, message}` | |

Room rules:
- A room lives while its game screen is connected. The server pings every 20 s and drops dead sockets.
- If the game leaves, the room waits 60 s so a reloaded tab can resume the same PIN, then closes.
- A new phone joining a room replaces the old phone (reconnects just work).
- Rate limits per IP: 30 new rooms a minute, 20 wrong PINs a minute, 60 open sockets.

## HTTP routes

| Route | What |
|---|---|
| `/` | Landing page (`public/`) |
| `/pad` | Phone controller (`public/controller.html`) |
| `/sdk/exemoo.js` | Game SDK (`public/sdk/`), see `games/README.md` |
| `/js/*` | Shared browser modules: `protocol.js`, `screen-link.js`, `pad-link.js`, `shell.js`, `pad.js` |
| `/play/<id>/…` | Built game in `games/<id>/`, SPA fallback to its `index.html`, `assets/` cached forever |
| `/healthz` | `{ok, rooms, sockets}` for the host's health check |
| `/api/info` | `{padUrl, lan, lanIps, httpsPort, games}`: the URL to put in the QR code |
| `/api/qr?text=…` | QR code SVG (text up to 512 characters) |

## Deploy (Render)

`render.yaml` in the repo root is a ready blueprint: in Render choose **New → Blueprint** and
pick the repo. By hand it is: Web Service, Node, build `npm ci --omit=dev`, start `npm start`,
health check `/healthz`, env `TRUST_PROXY=1`.

Render gives the service HTTPS, so phones open `https://<service>.onrender.com/pad` and get
motion sensors with no certificate warning. Set `PUBLIC_URL` when you add a custom domain.

| Env | Default | |
|---|---|---|
| `PORT` | 8080 | Set by the host |
| `HOST` | 0.0.0.0 | |
| `HTTPS_PORT` | 8443 | LAN mode only |
| `PUBLIC_URL` | (from request) | Base URL put in the QR code |
| `ICE_SERVERS` | Google STUN | JSON list of RTCIceServer. Add a TURN server for networks that block direct WebRTC, e.g. `[{"urls":"turn:turn.example.com:3478","username":"u","credential":"p"}]`. Without TURN the phone falls back to the server relay. |
| `TRUST_PROXY` | on for Render/Fly | Read client IP from `X-Forwarded-For` (rate limits) |
| `EXEMOO_LAN` | | `1` = same as `--lan` |

Docker: `npm run build && docker build -t exemoo . && docker run -p 8080:8080 exemoo`. The
`games/` folder holds built game files and is deployed as-is (commit it, or build before deploying).

Note: rooms are in memory, so run a single instance. Scaling out needs sticky sessions or a shared
room store (later phase).
