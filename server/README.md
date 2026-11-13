# Exemoo server

Exemoo's dynamic parts are small Web-standard handlers (`Request → Response`) that run in two places:

- **Vercel** (production): the static site is built into `dist/`, the handlers are the functions in
  `../api/`, rooms live in Upstash Redis, and `../middleware.js` is the alpha sign-in gate. See
  [`../DEPLOY.md`](../DEPLOY.md).
- **This Node server** (local play and tests): one process serves the same pages and routes, with
  rooms in memory.

The server only pairs devices and carries the WebRTC handshake. After that the phone streams motion
straight to the screen over a data channel on the local network. There is **no relay**: a phone that
can't reach the screen directly (mobile data, isolated guest Wi-Fi) can't play, and is told to join
the screen's Wi-Fi.

## Run

```bash
npm install
npm run dev     # LAN mode: http://localhost:8080 for the screen, https://<LAN-IP>:8443/pad for phones
npm start       # HTTP only on $PORT
npm test        # pairing, sign-in, HTTP and phone-link tests (node:test)
```

In LAN mode the HTTPS certificate is self-signed (cached in `server/.cert/`), so a phone shows a
warning once. Motion sensors only work on HTTPS pages, which is why LAN mode exists.

## Files

| File | What |
|---|---|
| `index.js` | Local HTTP(S) server: static files, `/play/<id>/`, the `/api/*` handlers, the sign-in gate, CLI |
| `api.js` | The `/api/*` handlers shared with Vercel: `signal`, `qr`, `login`, `auth`, `logout` |
| `pairing.js` | PIN rooms over HTTP polling, plus the in-memory and Upstash Redis stores |
| `auth.js` | Alpha allowlist, signed sign-in links and session cookie, the page gate |
| `vercel.js` | Vercel glue (one API instance per function, Upstash store) |
| `lan.js` | LAN IP detection + self-signed certificate |
| `test/` | `npm test` |

## Pairing protocol (`POST /api/signal`)

Clients POST `{pin?, role?, token?, msgs: [...]}` and get back `{msgs: [...]}`: the replies plus every
message queued for them. `public/js/poll-socket.js` wraps this in a WebSocket-like object, so the
screen and phone links (`screen-link.js`, `pad-link.js`) speak the same messages as before.

| Direction | Message | Reply / effect |
|---|---|---|
| game → | `{type:'create_room', pin?, resume?}` | `{type:'joined', role:'game', room, token, resume, resumed, peer}`. With a matching `pin`+`resume` the game gets its old room back. Needs sign-in when the gate is on. |
| game → | `{type:'resume_room', room, token}` | Same `joined`, for fruit-slice |
| phone → | `{type:'join_room', room, resume?}` | `{type:'joined', role:'controller', resume, resumed, peer}`. A reloaded pad presenting its key is `resumed`; a different phone gets a new key and the old one hears `replaced`. |
| both ← | `peer_connected` / `peer_disconnected` `{role}` | |
| both → | `offer` / `answer` / `candidate` | Queued for the peer with `from` |
| both → | `{type:'leave'}` | The peer hears `peer_disconnected` (sent on close and page unload) |
| both → | `{type:'ping'}` | `{type:'pong', timestamp_ms}` |
| both ← | `replaced`, `room_expired`, `error` `{code, message}` | |

Rules:
- Each poll stamps the side as present; a side silent for 90 s counts as gone. The room expires
  `ROOM_GRACE_MS` (5 min) after the screen's last poll, so a reloaded tab resumes the same PIN.
- Poll rates (set by the links): screen 0.5 s while a phone is pairing, 2 s waiting (5 s after 2 min,
  15 s after 10 min, 30 s in a hidden tab), 15 s once the phone is connected; phone 0.5 s
  negotiating, 20 s connected. Every poll is one Redis command.
- Rate limits per IP: 30 new rooms a minute, 20 wrong PINs a minute; 5 sign-in emails per 10 min.

## HTTP routes

| Route | What |
|---|---|
| `/` | Landing page (`public/`); sign-in required when the gate is on |
| `/login.html` | Alpha sign-in page |
| `/pad` | Phone controller (`public/controller.html`), always open |
| `/sdk/exemoo.js`, `/js/*` | Game SDK and shared browser modules |
| `/play/<id>/…` | Built game in `games/<id>/` |
| `/api/info` | `{padUrl, games, iceServers, ...}` (a static `info.json` on Vercel) |
| `/api/signal` | Pairing, see above |
| `/api/qr?text=…` | QR code SVG |
| `/api/login`, `/api/auth`, `/api/logout` | Alpha sign-in, see `auth.js` |
| `/healthz`, `/readyz` | Local server health |

Environment variables: see [`../.env.example`](../.env.example).
