# Exemoo v1 — one platform, all games, phone as controller

> **Status: v1 complete (2026-10-23).** All phases below are done. Summary:
> - Phase 3: Table Tennis, Golf and Fruit Slice copied into `games-src/` and switched to the shell's phone through
>   drop-in adapters (`public/sdk/adapters.js`), so their own input code is unchanged. Golf gets Club -/+ and Map
>   pad buttons and a remapped button mask; Fruit Slice gets its legacy quaternion order and button names.
>   Fixed two Table Tennis bugs along the way (2-player screen crash, Phone/Mouse chip on first connect).
> - Phase 4: Tennis has a phone racket (`games-src/tennis/src/input/phone.ts`): aim from the phone's face, swing on the
>   gyro peak, chop = slice, plus phone menu navigation. Unit tested.
> - Phase 5: Pose Match (`games-src/pose-match`) and Farm Dash (`games/farm-dash`, static) use the phone as a remote;
>   Farm Dash also changes lane by tilting the phone. The SDK gained `keys` (phone buttons → keyboard) and `nav()`.
> - Phase 6: the Android controller and Python relay were dropped (web only). Cricket is a new web game
>   (`games/cricket`): 2-over chase, swing timing sets the shot, phone is the bat.
> - Phase 7: rate limits, heartbeat and caching (Phase 1), configurable TURN via `ICE_SERVERS`, `Dockerfile`,
>   `render.yaml`. Rooms are in memory, so run one instance.
> - Not verified on real phones yet: swing thresholds and tilt angles may need tuning on devices.

## 1. What exists today

| Game (Exemoo name) | Folder | Stack | Input today | Pairing / server |
|---|---|---|---|---|
| Table Tennis | `table-tennis/` (SPINSHOT) | Vite + TS + three.js | Phone IMU, mouse/keyboard | Own `server/index.js`: sword-relay protocol + resume, relay fallback, HTTPS :8443, QR, `/api/info` |
| Golf | `golf/` (BIRDIE) | Vite + TS + three.js | Phone IMU, mouse/keyboard | Copy of the table-tennis server (ports 8090/8453) |
| Fruit Slice | `fruit-slice/` (Table Slice) | Vite + TS + three.js | Phone IMU, mouse | Own `server/signaling.mjs` hub: sword-relay compatible, plus `resume_room` and `{relay, data}` (field is `data`, not `payload`) |
| Tennis | `tennis/` (Court Ace) | Vite + TS + three.js | Mouse only (has an `InputSource` interface ready for other inputs) | None |
| Pose Match | `pose-portal/` | Vite + TS + MediaPipe | **Laptop camera** (pose) | None |
| Farm Dash | `subway runner/` | Plain JS + MediaPipe from CDN | **Laptop camera** (pose) + keyboard | None |
| Cricket | `cricket/` | Android controller app (Kotlin) + Python relay | Native phone app | Dropped (web only). Cricket is now a new web game in `games/cricket/`. |

Reference: `sword-relay-main/index.js` is the production signalling server. It holds
six-digit PIN rooms with exactly one `game` and one `controller`, gives each socket a private
token, and forwards only `offer` / `answer` / `candidate` between them. Sensor data then flows
**directly phone → laptop over a WebRTC data channel**, so the server does almost no work and
one small Node instance on Render can serve many players. It serves the phone controller page
at `/` from `public/`.

Problems to fix:
- Three different servers, and three copies of very similar `PhoneLink` and controller code.
- Small protocol differences (`payload` vs `data`, `resume` vs `resume_room`, SEN1 vs SEN2 packets).
- Each game has its own phone page, so pairing is lost when you switch game.
- Self-signed HTTPS on the LAN only works at home. Production needs real HTTPS.

## 2. Target architecture (v1)

```
                        exemoo.app (one Node service, HTTPS from host)
                 ┌────────────────────────────────────────────────────┐
                 │  static: /            landing page (this repo)     │
                 │          /play/<game>/ each game's built dist/     │
                 │          /pad         the ONE phone controller     │
                 │  ws:     /signal      sword-relay rooms + relay    │
                 │  api:    /healthz  /api/qr                         │
                 └────────────────────────────────────────────────────┘
        laptop / TV tab                                     phone
   ┌──────────────────────────┐   WebRTC data channel  ┌──────────────────┐
   │ Exemoo shell (landing)   │◀──────────────────────▶│ /pad controller  │
   │  owns the PhoneLink      │  (WS relay fallback)   │  IMU + buttons   │
   │  └ <iframe /play/golf>   │                        │  changes layout  │
   │     gets input via       │                        │  per game        │
   │     postMessage          │                        └──────────────────┘
   └──────────────────────────┘
```

Key ideas:
1. **Pair once, play everything.** The landing page (the "shell") creates the room and keeps
   the phone link open. Games are loaded inside the shell in a full-screen iframe. The shell
   forwards phone packets to the game with `postMessage`, and the game sends haptics and screen
   state back the same way. Going back to the menu does not drop the phone.
2. **One phone controller.** A single `/pad` page streams IMU (SEN2 packets) and buttons. The
   shell tells it which layout to show (`{t:'layout', game:'golf'}`): menu d-pad, golf swing
   button, table-tennis paddle, and so on.
3. **One signalling server**, based on `sword-relay-main/index.js`, keeping its rules (PIN rooms,
   tokens, one game + one controller, TTL) and adding what the games already rely on:
   `resume`, a `relay` fallback for networks where WebRTC fails, and binary relay frames.
4. **Production HTTPS** comes from the host (Render / Fly / Railway give TLS on
   `https://<app>`), so phones get motion sensors without self-signed certificates. The
   LAN self-signed mode stays as `npm run dev:lan` for local testing.
5. **Camera games** (Pose Match, Farm Dash) don't need the phone for gameplay. The phone stays
   paired as a pause / menu remote, and the laptop camera does the tracking.

## 3. Shared pieces to build

`packages/` inside one monorepo (npm workspaces):

| Package | Contents | Built from |
|---|---|---|
| `@exemoo/protocol` | Message types, SEN2 encode/decode, button names, layout names | `table-tennis/src/net/packets.ts` + `core/contracts.ts` |
| `@exemoo/link` | `PhoneLink` (game side) + `GameBridge` (iframe ↔ shell postMessage) | `table-tennis/src/net/phoneLink.ts` (the most complete one) |
| `@exemoo/pad` | The phone controller page | `table-tennis/src/controller/` merged with golf's extra buttons |
| `@exemoo/server` | Signalling + static hosting | `sword-relay-main/index.js` + features from `table-tennis/server/index.js` |

Game-side contract (each game implements this small surface):

```ts
// inside a game, running in the iframe
const input = connectExemoo();          // falls back to mouse/keyboard if not in the shell
input.on('packet', (p: SensorPacket) => ...);   // IMU 60–100 Hz
input.on('button', (b: ButtonName) => ...);
input.send({ t: 'haptic', pattern: 30 });
input.setLayout('golf');                // phone shows the golf controls
input.exit();                           // back to the Exemoo menu
```

## 4. Step-by-step plan

**Phase 0 — repo setup (½ day)**
- Create a monorepo `exemoo/` with `apps/shell`, `apps/pad`, `games/*`, `packages/*`, `server/`.
- Copy each game into `games/`. Set each Vite `base` to `/play/<id>/` so the builds can live side by side.

**Phase 1 — unified server (1 day)** — DONE (see `server/README.md`)
- Start from `sword-relay-main/index.js`. Add: `resume` on `create_room`, `relay` JSON
  forwarding (`payload` field), binary frame forwarding, a heartbeat, a room sweep, `/api/qr`
  and static hosting for `/`, `/pad`, `/play/*`.
- Write one protocol test file, ported from `fruit-slice/server/test-signaling.mjs`.
- Deploy to Render as-is (same steps as the sword-relay README). Health check: `/healthz`.
- Done: `server/signaling.js` (hub), `server/index.js` (HTTP + `/pad` + `/play/<id>/` + `/api/info` + `/api/qr`),
  `render.yaml`, tests (`npm test`).
  Landing page QR now uses `/api/info.padUrl` (`/pad`), so it works on the deployed HTTPS URL too.

**Phase 2 — shell + pad (1–2 days)** — DONE
- `public/js/protocol.js`: SEN2 encode/decode (table-tennis format), button names, layouts.
- `public/js/screen-link.js` (shell side, port of table-tennis `PhoneLink`) and `public/js/pad-link.js`
  (phone side): WebRTC data channels (`sensor` unreliable + `control` reliable) with automatic relay fallback.
- `/pad` (`public/controller.html` + `public/js/pad.js`): layouts `menu` (air pointer, calibration),
  `swing`, `slice`, `remote`; SEN2 streamed ~60 Hz in motion layouts; hold-Home to leave a game; haptics; wake lock.
- Shell (`public/js/shell.js`): owns the link for the whole session; game cards open `/play/<id>/` in a
  full-screen iframe (`#/play/<id>`, browser Back works), forwards phone input with postMessage, pauses the 3D scene.
- Game SDK `public/sdk/exemoo.js` (`connectExemoo()`), documented in `games/README.md`.
- `games/pad-test/`: built-in controller test that uses the SDK (footer → Test controller).
- Tests: `server/test/links.test.js` runs both links against the real server (relay path); 38 tests total.
  Checked in the browser: direct WebRTC pairing, 60 packets/s into the game, layouts, Home exit, menu pointer.

**Phase 3 — port the phone games (1 day each)**
- Table Tennis, Golf, Fruit Slice: replace each game's own `PhoneLink` and QR screen with
  `connectExemoo()`. Their `PhoneLink` already emits SEN-style packets, so this is mostly
  swapping the source. Delete their per-game controller pages and servers.
- Fruit Slice: convert `{relay, data}` to `{relay, payload}` and its SEN1 packets to SEN2
  (the decoder already accepts both).

**Phase 4 — new phone inputs (1–2 days)**
- Tennis: implement its `InputSource` interface with phone swing detection, reusing
  table-tennis `input/swing.ts`.

**Phase 5 — camera games (1 day)**
- Pose Match and Farm Dash run in the iframe with `allow="camera"`. They only use the phone for pause/exit.
- Farm Dash: also map phone tilt to lane changes, so it can be played without a camera.

**Phase 6 — Cricket (later)**
- Build the web game in the same stack. The Android app already works against the Exemoo server
  (`wss://<host>/cricket`, the Python relay's protocol). Later, move it to the main `/signal`
  protocol, or let players use `/pad` in the browser.

**Phase 7 — production hardening**
- Rate-limit `create_room` and `join_room` per IP, and cap rooms per IP.
- Add a TURN server (e.g. Cloudflare or Twilio TURN) for networks where WebRTC can't connect
  directly. The WS relay is the last fallback.
- Cache headers for hashed assets, gzip, and a CDN in front of `/play/*`.
- Accounts (the login placeholder) and saved progress come after v1.

## 5. Decisions for later
- Host: Render (matches sword-relay docs) vs Fly.io (WebSockets closer to users).
- iframe shell (recommended: simple, games stay independent) vs merging all games into one SPA.
- Whether the Android `Controller/` app stays, or the web `/pad` replaces it.
