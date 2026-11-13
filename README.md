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
| `server/` | Pairing (`/api/signal`), alpha sign-in and the local Node server. See `server/README.md` |
| `api/`, `middleware.js`, `vercel.json` | Vercel functions, sign-in gate and config |
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
| Moo Bowl | `bowling` | swing: the phone is the ball. Swing speed sets ball speed, wrist twist sets the hook; hold Action and let go to bowl when the camera is off | ten-pin bowling, 1–4 players in turns, full rules. The laptop camera reads the hand for line and the throw (mouse and keyboard also work); static, Rapier physics vendored, see `games/bowling/CONTRACT.md` |
| Rapids Row | `rapids-row` | swing: circle the phone to paddle, hold the button to back-paddle | 2-player co-op canoe (2nd phone pairs its own PIN); audio from `scripts/gen-rapids-audio.mjs` (Gemini) |
| Farm Kart | `farm-kart` | kart: tilt or ◀ ▶ wheel + Drift / Brake / Item / Gas; remote in menus | 3D kart racer, 1–4 phones (2nd–4th pair their own PIN on the setup screen). Mirrored from `../farm-kart` by `node scripts/sync-farm-kart.mjs` (re-sync + build); adapter in `games-src/farm-kart/exemoo/` |
| Back2Back | `back2back` | driver: tilt to steer, GAS / BRAKE / DRIFT / ITEM (nitro); shooter: point to aim, hold Action to fire | 2-player co-op 3D racer and shooter: outrun a growing storm, bandit-village bosses (2nd phone pairs its own PIN); Vite + three.js game from `games-src/back2back/` |
| Shake & Freeze | `shake-freeze` | swing: shake the phone, hold still on red | party minigame, 1–4 phones (2nd–4th pair their own PIN in the lobby), CPU rivals; static, see `games/shake-freeze/README.md` |
| Wobble Tower | `wobble-tower` | swing: hold flat, tilt to balance, Action banks | party minigame, 1–4 phones, CPU rivals; static |
| Flapjack Flip | `flapjack-flip` | swing: flick the phone like a pan | party minigame, 1–4 phones, CPU rivals; static |
| Peek-a-Barn | `peek-a-barn` | remote: d-pad moves the cursor, GO opens a door | party memory game, 1–4 phones (2nd–4th pair their own PIN in the lobby), turn-based, CPU rivals; static, see `games/peek-a-barn/README.md` |
| Straw Shot | `straw-shot` | swing: point the phone to aim, hold Action to draw, release to shoot; Recenter | party archery, 1–4 phones shoot at once (2nd–4th pair their own PIN in the lobby), CPU rivals; static, see `games/straw-shot/README.md` |
| Barn Blink | `barn-blink` | swing: big Action button to react; flick the phone in Flick rounds; buzz cues via haptics | party reaction-time game, 1–4 phones (2nd–4th pair their own PIN in the lobby), CPU rivals; static, see `games/barn-blink/README.md` |
| Barn Raiser | `barn-raiser` | laptop camera: hand steers the crane, raise the other hand to drop (or phone tilt + Action, or keys) | stacking party game, 1–4 players in turns (hot seat), CPU rivals; needs shell camera assist; static, see `games/barn-raiser/README.md` |
| Haystack Hideout | `haystack-hideout` | swing: sweep/tilt the phone to aim a cursor (gyro), Action picks, Recenter re-centres | party minigame (memory hide-and-seek), 1–4 phones (2nd–4th pair their own PIN in the lobby), CPU rivals; static, see `games/haystack-hideout/README.md` |
| Bale Brawl | `bale-brawl` | swing: the phone is the bopper, hold Action to guard, Recenter | 1v1 foam-bopper duel on a hay-bale stack, shove the rival into the pond; vs CPU (4 levels) or 2 players (2nd phone pairs its own PIN); static, three.js, see `games/bale-brawl/README.md` |
| Bumper Carts | `bumper-carts` | swing: tilt the phone flat like a tray to drive, hold Action to charge and release to ram, Recenter | 1 to 4 farm animals in hay carts bump each other through a breakable fence into the mud, most KOs wins; CPU fills empty seats (3 levels); static, three.js, see `games/bumper-carts/README.md` |

Deploy: see `DEPLOY.md`: Vercel (free Hobby plan) with Upstash Redis for pairing and an optional
alpha email allowlist. Phones must be on the same Wi-Fi as the screen (no relay). Env vars are in
`.env.example`. CI: `.github/workflows/ci.yml`.
