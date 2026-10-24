# Table Slice

A 3D fruit-slicing game played on a laptop or TV, with your phone as the sword. Fruit is tossed up from behind a wooden dojo table. Swing the phone to cut them, and the halves tumble onto the table.

All models, textures, effects, music and sound effects are generated procedurally in code; the game has no asset files.

## Run

```bash
npm install
npm run dev
```

- Game: http://localhost:5190
- Phone controller: scan the QR code on the pairing screen, or open the `https://<lan-ip>:5191/controller/` URL it shows.

The phone page is served over HTTPS with a self-signed certificate, because phones only expose motion sensors to secure pages. On the first visit, tap **Advanced → Proceed**, then **TAP TO START**. The laptop and phone must be on the same Wi‑Fi.

Production:

```bash
npm run build
npm start
```

This serves the game on http :8080 and the phone page on https :8443 (override with `PORT` / `HTTPS_PORT`).

## Playing

- Hold the phone like a sword handle with the top pointing at the screen, and press **Recenter** (or double-tap) to aim at the centre.
- Swing to slice. To pick a menu item, slice its fruit or hold the blade on it. The phone's **Select** and **Pause** buttons also work.
- No phone? Use **Play with mouse**: hold the button and drag to slice.
- Keys: `Esc`/`P` pause, `C` recenter.

### Modes
| Mode | Rules |
|---|---|
| Classic | 3 lives. A missed fruit costs a life and a bomb ends the run. You get an extra life every 100 points. |
| Arcade | 60 seconds. Bombs cost 10 points. Power-ups: **Freeze** (slow time), **Frenzy** (fruit storm), **Double** (×2 score). |
| Zen | 90 seconds, no bombs, just slicing. |

Scoring features in every mode:
- **Combos:** 3 or more fruit in one swipe score a bonus.
- **Criticals:** random +10 points on a fast cut.
- **Pomegranate:** appears near the end of Arcade and Zen. Hit it as many times as you can before it bursts.

Best scores and settings (volumes, sensitivity, blade colour, shake, haptics, quality) are saved in the browser.

## Architecture

| Path | What |
|---|---|
| `src/contracts.ts` | Shared types and world layout |
| `src/game/` | Game loop, spawner, physics, hit-testing, scoring, modes |
| `src/assets/` | Procedural fruit/bomb models, skin & flesh textures, real-time mesh slicer |
| `src/fx/` | Table and dojo environment, bloom, blade trail, juice, stains, explosions, screen overlays, popups, camera rig |
| `src/audio/` | Web Audio SFX (pre-rendered offline) and sequenced music |
| `src/ui/` | DOM menus, HUD, pairing (QR), settings, game over |
| `src/net/`, `src/input/` | WebRTC phone link (with WebSocket relay fallback), IMU → pointer mapping |
| `server/` | Signaling hub (compatible with the sword-relay protocol), HTTPS phone server, production server |
| `public/controller/` | Phone controller page |
| `demos/` | Standalone module test pages (`/demos/assets.html`, `fx.html`, `audio.html`, `ui.html`) |

The phone sends the same 40-byte `SEN1` orientation packets as `sword-relay-main` at 60 Hz, so the original controller also works.
