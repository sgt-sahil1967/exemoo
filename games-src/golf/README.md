# BIRDIE — phone-club golf

A Wii-Sports-style golf game for the browser where your **phone is the club**. The phone streams
its IMU (orientation quaternion, acceleration, gyro) to the game over a WebRTC data channel (with
a WebSocket relay fallback), using the six-digit PIN pairing from `sword-relay`. A mouse works too.

Everything — the course, golfer, trees, textures, logo, icons, sound effects and music — is
generated in code.

## Run

```bash
npm install
npm run dev
```

- Game: http://localhost:8090
- Phone: scan the QR code on the **Connect Phone** screen. It opens
  `https://<your-LAN-IP>:8453/controller.html?pin=…`. Both devices must be on the same Wi-Fi.
  The certificate is self-signed (generated into `server/.cert/`), so accept the browser warning
  once. Motion sensors only work over HTTPS, which is why the phone uses port 8453.

Production: `npm run build && npm start`. Tests: `npm test`.

## How to play

Hold the phone in both hands like a club grip, top of the phone pointing at the ball. Keep still
for a moment to calibrate (or tap **Recenter**).

| Action | Phone | Mouse / keyboard |
|---|---|---|
| Swing | Hold **SWING** and swing (without it = practice swing) | Hold the mouse button, drag down, flick up |
| Aim | D-pad ◀ ▶ | ← → |
| Change club | − / + | Q / E |
| Putter range | D-pad ▲ ▼ (on the green) | ↑ ↓ |
| Overhead map | MAP | M |
| Pause | PAUSE | Esc |

The backswing fills the power meter; swing speed sets the power. Going past 100% overswings —
more distance, less control. A twisted club face hooks or slices the ball.

## Modes

- **Round** — Beginner (holes 1–3), Intermediate (4–6), Expert (7–9) or all 9 holes, 1–4 players
  hot-seat, calm / normal / strong wind.
- **Training** — Putting challenge, Approach (closest to the pin), Long Drive.

## Layout

| Path | What |
|---|---|
| `server/index.js` | HTTP + HTTPS server, signalling/relay WebSocket, Vite dev middleware |
| `src/core/contracts.ts` | Shared types and constants every module builds against |
| `src/course/` | The nine holes: terrain, surfaces, hazards, trees |
| `src/physics/` | Ball flight (drag, lift, spin, wind), bounces, rolling, putting, cup |
| `src/input/` | Swing detection from phone IMU; mouse fallback |
| `src/controller/` | Phone controller page |
| `src/net/` | Phone link (WebRTC/relay) and the binary sensor packet format |
| `src/scene/` | Three.js world, golfer, cameras, effects |
| `src/ui/` | Menus, HUD, power meter, minimap, scorecard |
| `src/audio/` | Synthesized sound effects, music and ambience |
| `src/game/` | Round rules, training challenges, persistence, orchestration |
