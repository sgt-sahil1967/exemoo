# Exemoo

Motion games for the web. Open Exemoo on a laptop or TV, scan the QR code, and your phone becomes
the controller for every game. No app, and keyboard and mouse always work too.

```bash
npm install
npm run dev      # local play: screen http://localhost:8080, phones via the HTTPS LAN link in the QR
npm run build    # build the games in games-src/ into games/ (served at /play/<id>/)
npm test         # server, pairing and phone-link tests
npm start        # production (HTTP on $PORT; the host provides HTTPS)
```

| Folder | What |
|---|---|
| `server/` | One Node server: landing page, `/pad`, `/play/<id>/`, PIN pairing (`/signal`). See `server/README.md` |
| `public/` | Landing page (shell), phone controller (`/pad`), shared browser modules (`js/`), game SDK (`sdk/`) |
| `games-src/` | Sources of the Vite games, ported onto the SDK (originals in `../<game>/` are untouched) |
| `games/` | Built / static games served at `/play/<id>/`. `cricket`, `farm-dash` and `pad-test` are static, no build |
| `PLAN.md` | The v1 plan and what was done |

| Game | id | Phone | Notes |
|---|---|---|---|
| Fruit Slice | `fruit-slice` | slice: whole phone is the blade | from `../fruit-slice` |
| Table Tennis | `table-tennis` | swing: phone is the paddle | from `../table-tennis`; 2-player pairs a 2nd phone |
| Pose Match | `pose-match` | remote (menus, pause) | laptop camera tracks the body; from `../pose-portal` |
| Tennis | `tennis` | swing: phone is the racket | from `../tennis`, phone input added |
| Farm Dash | `farm-dash` | remote + tilt for lanes | camera or phone; from `../subway runner` |
| Golf | `golf` | swing + Club -/+ and Map | from `../golf` |
| Cricket | `cricket` | remote: menus, pause, vibration and bat sounds | bat with the laptop camera (hands set direction, power, timing); see `CRICKET_PLAN.md` |
| Rapids Row | `rapids-row` | swing: circle the phone to paddle, hold the button to back-paddle | 2-player co-op canoe (2nd phone pairs its own PIN); audio from `scripts/gen-rapids-audio.mjs` (Gemini) |
| Farm Kart | `farm-kart` | kart: tilt or ◀ ▶ wheel + Drift / Brake / Item / Gas; remote in menus | 3D kart racer, 1–4 phones (2nd–4th pair their own PIN on the setup screen). Mirrored from `../farm-kart` by `node scripts/sync-farm-kart.mjs` (re-sync + build); adapter in `games-src/farm-kart/exemoo/` |
| Shake & Freeze | `shake-freeze` | swing: shake the phone, hold still on red | party minigame, 1–4 phones (2nd–4th pair their own PIN in the lobby), CPU rivals; static, see `games/shake-freeze/README.md` |
| Wobble Tower | `wobble-tower` | swing: hold flat, tilt to balance, Action banks | party minigame, 1–4 phones, CPU rivals; static |
| Flapjack Flip | `flapjack-flip` | swing: flick the phone like a pan | party minigame, 1–4 phones, CPU rivals; static |

Deploy: see `DEPLOY.md` (Render blueprint / Docker image that builds the games itself, custom
domain, TURN, env vars in `.env.example`). CI: `.github/workflows/ci.yml`.
