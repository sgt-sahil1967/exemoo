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

Deploy: `render.yaml` (Render blueprint) or the `Dockerfile`. Build the games first and deploy
`games/` with the server. Set `ICE_SERVERS` to add a TURN server.
