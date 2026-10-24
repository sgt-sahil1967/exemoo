# SPINSHOT — phone-paddle table tennis

A browser table-tennis game where your phone is the paddle. The phone streams its IMU
(orientation quaternion, linear acceleration, gyro) to the game over a WebRTC data channel,
with an automatic WebSocket relay fallback. Pairing works like the `sword-relay` server: a six-digit
PIN room, shown on screen with a QR code. A mouse or keyboard works too.

Everything (3D art, textures, logo, icons, sound effects, music) is generated in code.

## Run

```bash
npm install
npm run dev        # dev server with hot reload
```

- Game: http://localhost:8080
- Phone: scan the QR code on the **Connect Phone** screen. It opens
  `https://<your-LAN-IP>:8443/controller.html?pin=…`. Both devices must be on the same Wi-Fi.
  The certificate is self-signed (generated into `server/.cert/`), so accept the browser warning once.
  Motion sensors only work over HTTPS, which is why the phone uses port 8443.

Production:

```bash
npm run build && npm start
```

Environment overrides: `PORT` (8080), `HTTPS_PORT` (8443), `HOST`, `ROOM_TTL_MS`.

## How to play

Hold the phone **upright like a paddle, screen facing you**; the back of the phone is your rubber.
Keep still for a second to calibrate (or tap **Recenter**).

| Action | Phone | Mouse / keyboard |
|---|---|---|
| Hit / serve | Swing | Flick the mouse up, click, or Space |
| Aim left/right | Point the paddle | Mouse X |
| Depth | Tilt the face up/down | Mouse Y |
| Topspin | Closed face + upward swing | Ctrl/Alt while hitting |
| Backspin | Open face / chopping swing | Shift or right button |
| Slow-mo power-up | SLOW-MO button | E |
| Pause | Pause button | Esc / P |
| Recenter | Recenter button | R |
| Menus | Air pointer + Action, or the d-pad | Arrows + Enter, mouse |

Timing matters: hitting early pulls the ball cross-court, hitting late pushes it wide. The **Assist**
setting controls auto-positioning, timing window and paddle magnetism.

## 2 players (split screen)

Main menu → **2 Players**. Each player scans their own QR code (two separate PIN rooms) and
holds their phone like a paddle; Start unlocks when both are connected. The screen splits
side by side: Player 1 (coral) on the left plays the near end, Player 2 (teal) on the right plays
the far end. Either phone's Pause button pauses the game.

## Slow-mo power-up

In matches against the AI, press **SLOW-MO** on the phone (or `E`) to slow the ball to 35% speed
for 3 seconds. You get 2 per game; they refill at the start of each game. It is not available
in 2-player mode, practice or challenges.

## Features

- Full ITTF rules: 11 points, win by 2, serve rotation, deuce, lets, aces, best of 1/3/5
- Ball physics with drag, Magnus effect, spin-dependent bounces, net cord, edge balls
- Local 2-player split screen with two phones
- Slow-mo power-up (2 per game, vs AI)
- AI opponents at four levels (Pip / Max / Rina / Kaz) with reaction time, footwork, shot selection and pressure errors
- Practice mode (ball machine) and four challenges: Target Practice, Rally Master, Speed Demon, Spin Doctor
- Two arenas (sunny club hall, night arena with crowd), three graphics quality levels
- HUD: score, serve indicator, game/match point, rally counter, shot speed, swing meter, connection chip
- Phone controller: haptics, score mirror, d-pad, pause/recenter, handedness, wake lock, auto-reconnect
- Career stats and settings saved locally; generative music and synthesized sound effects

## Layout

| Path | What |
|---|---|
| `server/index.js` | HTTP + HTTPS server, PIN rooms, signalling, relay fallback, `/api/info` |
| `controller.html`, `src/controller/` | Phone controller page |
| `src/net/` | Game-side WebRTC link, SEN1/SEN2 packet codec |
| `src/input/` | Phone IMU → paddle state + swing detection; mouse fallback |
| `src/physics/` | Ball simulation, prediction, shot/serve solver |
| `src/game/` | Rules, AI, match flow, challenges, persistence |
| `src/scene/` | Three.js stage: arena, table, avatars, FX, camera |
| `src/ui/`, `src/audio/` | Menus, HUD, sound and music |
| `docs/API.md` | Module contracts |

Sensor packet `SEN2` (56 bytes, little-endian): magic, seq, t, quaternion xyzw, acceleration xyz,
rotation rate αβγ (deg/s), button bitmask. The older 40-byte `SEN1` packet from `sword-relay` is still accepted.

## Testing

```bash
npm test                      # 80 unit tests: physics, solver, rules, AI-vs-AI harness, input, packets
```

Debug URL flags: `?debug` (fps, `window.match`/`stage`/`advance(sec)`), `?play=match|practice|challenge&challenge=targets`,
`?auto=0.1` (the human side swings by itself; the number is timing jitter in seconds).
