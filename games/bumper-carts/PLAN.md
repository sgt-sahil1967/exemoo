# Bumper Carts: build plan and contract

Status: plan only, nothing is built. Same shape as `games/bale-brawl/PLAN.md`, which is the closest
existing game (static three.js, custom sim, phone = `swing` layout) and the main source to copy from.

## 1. Name, pitch, look

- **Name** Bumper Carts. **id** `bumper-carts`. Served at `/play/bumper-carts/`. Tile subtitle: "Tilt, charge, bump".
- **Pitch** Up to four farm animals ride padded hay carts on a round barn-dance floor ringed by a picket
  fence, above a mud moat. Hold the phone flat like a tray: the cart drives the way you tilt. Hold the big
  Action button to wind up a charge (the cart slows and shakes), let go to ram. Hard bumps into the fence
  crack it, then break it, and a cart knocked through a gap lands in the mud. That is a KO for whoever
  bumped it last. Everyone respawns, nobody sits out. Most KOs when the 90 s bell rings wins.
- **Why this rule set** A plain walled rink has no goal; pure last-one-standing makes eliminated players
  watch. Breakable fence gives both: it opens as classic bumper cars and ends as a ring-out scramble.
- **Original only.** Farm animals in carts, Exemoo "Moo Moo Farm" toon look. No names, characters, arenas,
  music or UI from any existing game.
- **Art** Carts: chunky wooden hay cart with a fat rubber-tube bumper in the player colour, a pennant on a
  springy pole, the animal's head and arms poking out. Floor: polished plank disc with a painted star.
  Fence: 16 white picket panels on posts. Around it: mud moat, barn, string lights, hay-bale stands with a
  small animal crowd. Palette and UI rules as in Bale Brawl section 1. No emojis, no binary assets.
- **Cast** P1 red cow, P2 blue pig, P3 green sheep, P4 yellow chick (the party-kit seats). CPU carts use the
  free seats' animals with a small "CPU" tag.

## 2. Decisions (settled, do not reopen while coding)

| Topic | Decision | Reason |
|---|---|---|
| Phone layout | `swing` for every phone, all the time | Streams orientation at 60 Hz and has the one big Action button. No changes to `/pad` |
| Steering | Tray tilt, screen-relative: tilt direction = drive direction on the TV | One shared fixed camera with 4 carts. Wheel steering (the `kart` layout) is car-relative and confusing when a cart faces the camera; its DRIFT / BRAKE / ITEM / GAS labels are also fixed |
| Tilt maths | Gravity in the phone's own frame (pitch and roll only), never heading | Compass yaw drifts indoors; pitch and roll do not. Recenter only stores a neutral offset |
| Charge | Hold Action = charge, release = dash along the current tilt (or facing, if tilt is in the dead zone) | Matches "tilt to steer, charge and bump" with one button |
| Physics | Custom 2-D circles on the floor plane (x, z), fixed 1/120 s step, no library | Small, deterministic, Node-testable like `bale-brawl/js/combat.js` |
| Rendering | three@0.160.0 from the Bale Brawl import map, static ES modules, no build | Same as Bale Brawl and Moo Bowl |
| Party kit | `party.js` is not used (it is Canvas 2D). Pairing for 4 seats is `bale-brawl/js/players.js` widened from 2 to 4 | Same ScreenLink PIN-room pattern |
| Camera assist | Off (`NO_CAMERA`) | The shell camera tracks one body |
| Players | 1 to 4 humans, CPU fills to 4 by default (toggle), 3 CPU levels | A bumper floor needs a crowd |

## 3. Simulation model

Units metres, seconds, radians. Floor centre at the origin, +x = screen right, +z = toward the camera, so
"up the screen" is -z. Intent `y = +1` means up the screen.

- **Cart** circle, radius 0.55, equal mass. State: `pos, vel, facing, charge 0..1, dashT, cooldownT, stunT,
  safeT, lastHitBy, lastHitAt, state ('drive'|'charge'|'dash'|'stun'|'fall'|'out')`.
- **Drive** `vel += intent * ACCEL * dt`, then `vel -= vel * DRAG * dt`. Slidey on purpose. Facing turns
  toward velocity (toward intent while charging).
- **Charge** while Action is held and `cooldownT == 0`: drive accel x0.25, drag x2, `charge` rises to 1 in
  `CHARGE_TIME`. Releases under `MIN_CHARGE` do nothing (a honk). A charging cart takes x1.25 knockback.
- **Dash** on release: `vel = aim * lerp(DASH_MIN, DASH_MAX, charge)`, `dashT = DASH_TIME` (drag x0.3 while
  it lasts), then `cooldownT = DASH_COOLDOWN`.
- **Cart vs cart** with `n` from a to b and `closing = (va - vb) . n > 0`:
  1. Bounce: `j = (1 + REST) / 2 * closing`, `va -= j n`, `vb += j n`.
  2. Ram bonus, for each cart `c` hit by `o`: `s = max(0, vo_before . dir(o to c))`, then
     `vc += dir * KNOCK * s * (o dashing ? 1.6 : 1) * (c charging ? 1.25 : 1) * (c stunned ? 1.3 : 1)`.
  3. A dashing attacker keeps 35 % of its pre-hit speed (it ploughs through instead of bouncing off).
  4. Both dashing and roughly head-on (`closing > 12`): CLASH, equal bounce, both stunned 0.4 s, no bonus.
  5. `power = clamp(closing / 15, 0, 1)`. Victim `stunT = 0.15 + 0.5 * power` (no drive, no charge).
     Above `power 0.25` the victim's `lastHitBy / lastHitAt` are set. Separate overlapping carts.
- **Fence** 16 panels on the circle `R = 7`, posts between them (static circles r 0.15, never break).
  Panel hp 2 (whole, cracked, gone). A cart reaching a standing panel bounces (`FENCE_REST`); outward
  normal speed above `FENCE_BREAK` takes 1 hp. A cart is `fall` when its centre passes `R + 0.3`.
- **KO** fall lasts 0.9 s (splash at the end), then `out` for `RESPAWN`, then it drops in at the spawn point
  farthest from the other carts with `safeT = 1.5` (blinks, takes and deals no ram bonus).
  Credit: `lastHitBy` within `CREDIT_WINDOW` gets +1. Nobody to credit: the faller loses 1 (never below 0).
- **Round** 90 s (60 / 90 / 120 selectable). At 25 s left, "BARN STORM": every remaining panel falls.
  Winner = most KOs. Tie: sudden death among the tied, next KO by one of them wins.

## 4. Files and owners

Fable plans and reviews only. Group HARD (Opus) and group BASIC (Sonnet) as in Bale Brawl. Nobody edits
the other group's file; a contract problem is reported, not patched around.

GROUP HARD
| File | Responsibility |
|---|---|
| `js/constants.js` | Every number of section 6 as frozen objects `ARENA, CART, CHARGE, BUMP, FENCE, MATCH, TILT, AI, SEATS`. Written first |
| `js/tilt-input.js` | Phone packets to `CartIntent` (5.2). Pure, no DOM |
| `js/sim.js` | Section 3, pure: no three, no DOM, seeded RNG only. Emits events |
| `js/ai.js` | CPU `Control` from a sim snapshot, 3 levels |
| `js/world.js` (+ `js/world/toon.js` copied from Bale Brawl) | Scene, lights, floor, fence panels (crack / fall states), moat, barn, crowd, camera |
| `js/cart.js` | Procedural cart and rider, driven by sim state: lean, charge shake, dash stretch, stun stars, fall, respawn drop, safe blink |
| `js/fx.js`, `js/audio.js` | Pooled particles and camera shake; Web Audio sfx and a loop (structure copied from Bale Brawl) |
| `js/engine.js` | The one module `main.js` talks to (5.3) |
| `dev/engine-test.html` | Engine alone, 4 CPU carts, event log |
| `server/test/bumper-carts-sim.test.js`, `bumper-carts-input.test.js` | Node tests |

GROUP BASIC
| File | Responsibility |
|---|---|
| `index.html`, `ui.css` | Copy of Bale Brawl's page, boot screen and card / button styles |
| `js/main.js` | Boot, frame loop, flow (5.5), wiring |
| `js/rules.js` | Pure `Round` class: clock, storm trigger, scores, tie and sudden death |
| `js/ui.js` | Title, lobby (4 seat cards), HUD (4 score chips, clock), countdown, banners, pause, results podium |
| `js/players.js` | 4 seats: SDK phone for P1 in the shell, ScreenLink PIN rooms for the rest, phone-or-keys pick, haptics |
| `js/keys.js` | Keyboard to `CartIntent` (5.6) |
| `dev/stub-engine.js`, `dev/ui-test.html` | Fake engine with scripted events so UI work does not wait |
| `README.md`, `server/test/bumper-carts-rules.test.js` | Readme, rules tests |
| Shared files | Section 5.7 |

## 5. Interface contract

### 5.1 Shared shapes
```js
CartIntent = { live: boolean,   // false = no input yet, cart idles
               x: number,       // -1..1, + = screen right
               y: number,       // -1..1, + = up the screen. hypot(x, y) <= 1
               charge: boolean } // Action held
Control = { read(dt) -> CartIntent, recenter() }
```

### 5.2 `js/tilt-input.js`
```js
export function createPhoneTilt() -> { push(packet, actionHeld), recenter(), read(dt), debug }
```
- World up in the phone's frame from the packet quaternion: `ux = 2(xz - wy)`, `uy = 2(yz + wx)`.
  `raw = (-ux, -uy)`: right edge down = +x, top edge down (tipped away from the player) = +y. This is the
  same sign as the roll in `games/wobble-tower/game.js` line 62. Confirm both axes on a real phone with
  `/play/pad-test/` before tuning anything else.
- Recenter stores `raw0` (auto on the first live packet; ignored if `|raw| > 0.5`, i.e. phone not near flat).
- `t = raw - raw0`. Dead zone `TILT.dead`, full at `TILT.full`:
  `mag = clamp((|t| - dead) / (full - dead), 0, 1)`, output `t / |t| * mag`, 40 ms one-pole smoothing.
- No orientation sensor (`q` all zero): integrate `gyro.beta` and `gyro.alpha` with a slow spring back to
  zero, as `games/straw-shot/game.js` does.
- `live` goes false after 1.5 s without packets (keys take over, see `players.js`).

### 5.3 `js/engine.js`
```js
export async function createEngine({ canvas }) -> Engine
Engine = {
  on(event, cb) -> off(),
  setCart(i /*0..3*/, { name, color, animal, control /*Control|null*/, cpu /*null|'easy'|'normal'|'hard'*/ } | null), // null = empty seat
  resetRound(seed?),            // carts to spawn spots, fence whole, scores untouched (rules own them)
  setActive(on), setPaused(on),
  dropFence(),                  // barn storm
  setCamera(mode),              // 'title' orbit | 'play' fixed 3/4 view framing the whole floor | 'results'
  celebrate(order /*seat indices, best first*/),
  snapshot() -> { carts: [ { i, x, z, state, charge, safe, edge /*0 centre..1 rim*/ } ], fence: [hp x16] },
  update(dt), render(), resize(), dispose(),
  audio: { unlock(), play(name), setMuted(on), music(on) },  // 'click' 'count' 'go' 'storm' 'win' 'lose'
}
```
| Event | Payload | When |
|---|---|---|
| `charge` | `{ i, full }` | charge starts (`full:false`) and reaches 1 (`full:true`) |
| `dash` | `{ i, charge }` | released |
| `bump` | `{ a, b, power, by /*seat that rammed, or -1 = even*/ }` | cart hits cart, `power >= 0.1` |
| `clash` | `{ a, b }` | two dashes meet |
| `fence` | `{ panel, hp, i }` | panel cracked or broken by cart `i` |
| `fall` | `{ i, by /*seat or -1*/ }` | cart leaves the floor. Rules score here |
| `respawn` | `{ i }` | cart is back |

### 5.4 BASIC modules
```js
// rules.js (pure)
export class Round {
  constructor({ seats /*[0..3] in play*/, seconds = 90, stormAt = 25 })
  get state()      // 'ready' | 'play' | 'storm' | 'sudden' | 'over'
  get timeLeft()
  get scores()     // [n x4]
  start()
  tick(dt) -> null | 'storm' | 'sudden' | 'over'
  fall(i, by) -> { scorer /*seat|-1*/, delta, over /*bool, sudden death decided*/ }
  get ranking()    // seats, best first; ties broken by fewer own falls
}
// keys.js
export function createKeyCart({ keys /*{up,down,left,right,charge}*/ }) -> Control & { active, dispose() }
// players.js
export function createPlayers({ exemoo, onButton(i, b), onChange() }) -> Players
Players = { list: [ { n, connected, pin, url, qrSrc, usingPhone, joined, control, haptic(pattern) } x4 ],
            startPairing(n), stopPairing(n), recenter(n), dispose() }
// ui.js: createUI({ root }) with the same style of API as bale-brawl/js/ui.js (showTitle, showLobby,
// hud, countdown, banner, callout, showPause, showResults, nav, on(...)). hud takes
// { seats:[{name,color,score,state}], timeLeft, storm }.
```

### 5.5 Flow (`main.js`)
1. Title over an orbiting arena: CPU rivals on / off, CPU level, round length, three how-to cards
   (hold flat and tilt, hold to charge and let go to ram, knock them through the fence), Start.
2. Lobby: 4 seat cards. P1 is the shell phone. Others show QR + PIN (`?pin=&layout=swing&title=`) and
   "or keys". A seat joins when its phone connects or its charge key is pressed. Empty seats become CPU.
3. "Hold your phone flat" hint, recenter every phone at "1" of the countdown, 3-2-1-GO, `round.start()`.
4. Per frame: `round.tick(dt)`; on `'storm'` banner + `engine.dropFence()`; HUD from scores and snapshot.
5. On `fall`: `round.fall`, callout on the scorer's chip ("KO!"), or "OOPS" for an own goal.
6. Over: `setCamera('results')`, `celebrate(ranking)`, podium, Play again / Change players / Exit.
7. Haptics: bump taken `20 + 60 * power` ms, bump given 20 ms, charge full 15 ms, fallen 200 ms,
   scored `[40, 30, 40]`. Phone colour via `{ t:'theme', color }` on connect.
8. Pause: phone Pause, Escape or P. Menus through `ui.nav` with the phone d-pad + Action. Recenter button
   calls `players.recenter(n)`. `exemoo.exit()` on Exit.

### 5.6 Keyboard
| Seat | Move | Charge (hold) |
|---|---|---|
| P1 | W A S D | Space |
| P2 | arrows | Enter |
| P3 | I J K L | U |
| P4 | numpad 8 4 5 6 | numpad 0 |
Keys give full-magnitude intent, diagonals normalised. Escape / P pause, M mute.

### 5.7 Shell registration (same four places as Bale Brawl 3.8)
- `public/js/shell.js`: `DEFAULT_LAYOUT['bumper-carts'] = 'swing'`; add to `NO_CAMERA`.
- `public/index.html`: tile after Bale Brawl, `--bg:#ff7a1f`, `data-g="Bumper Carts" data-id="bumper-carts"`,
  `data-cover="bumper"`, small text "Tilt, charge, bump".
- `public/covers.js`: cover `bumper` (two carts colliding, stars, a broken picket).
- Rows in `games/README.md` and the top `README.md`.

## 6. Tuning numbers (first guesses, expect a pass on real phones)

| Group | Key | Value |
|---|---|---|
| ARENA | radius / fall line | 7 m / 7.3 m; spawn ring radius 3.5 m |
| CART | radius, accel, drag | 0.55 m, 14 m/s^2, 2.5 /s (top speed about 5.6 m/s) |
| CHARGE | time to full, min, dash speed | 1.0 s, 0.15, 7 to 15 m/s |
| CHARGE | dash time, cooldown | 0.35 s, 0.6 s |
| BUMP | restitution, knock | 0.9, 0.45 |
| BUMP | multipliers | dashing attacker x1.6, charging victim x1.25, stunned victim x1.3 |
| BUMP | stun, credit window | 0.15 to 0.65 s, 4 s |
| FENCE | panels, hp, break speed, restitution | 16, 2, 6 m/s, 0.7 |
| MATCH | round, storm, respawn, safe time | 90 s, at 25 s left, 2.0 s, 1.5 s |
| TILT | dead, full, smoothing | 0.07 (4 deg), 0.42 (25 deg), 40 ms |

| CPU | easy | normal | hard |
|---|---|---|---|
| Re-plan interval | 0.6 s | 0.35 s | 0.2 s |
| Aim error | 25 deg | 12 deg | 5 deg |
| Charges when lined up | 30 % | 60 % | 90 %, and leads a moving target |
| Lines the target up with a gap | never | sometimes | always |
| Backs off the rim / open gaps | late | yes | yes, and dodges incoming dashes |
| Targets | nearest | nearest to the rim | nearest to the rim, prefers the leader |

## 7. Build order and review gates

1. **Contract freeze** HARD writes `constants.js`; BASIC writes `dev/stub-engine.js`. Gate: both match section 5.
2. **Feel prototype** HARD: `tilt-input.js` + `sim.js` + a flat debug render (circles, top-down) in
   `dev/engine-test.html`, one phone. Gate: on a real phone, tilt directions are right, you can stop on the
   spot, a full charge sends a CPU cart across half the floor. Retune section 6 here, before any art.
3. **Parallel** HARD: `ai.js`, sim tests, then world / cart / fx / audio / engine. BASIC: rules + tests, ui,
   players, keys, main against the stub.
4. **Join** swap the stub for the real engine, shell registration, readmes.
5. **Playtest** 4 phones, checklist below, last tuning pass.

## 8. Acceptance checklist

Open `/play/bumper-carts/` directly (`npm run dev`) and once through the Exemoo tile.
1. Boot clears, title over the orbiting arena, no console errors, no emojis.
2. All menus work with mouse, Tab / Enter, and the phone d-pad + Action. Options are remembered.
3. Keys only, CPU on: 3 CPU carts fill in, 3-2-1-GO, clock runs from 90.
4. WASD drives in screen directions; the cart slides and can be stopped. Hold Space: slows, shakes, ring
   fills; release: dash with a whoosh. A tap does nothing but honk.
5. A dash into a CPU cart sends it clearly further than a drive-speed bump; head-on dashes give "CLASH".
6. A hard hit cracks a fence panel, a second breaks it; posts stay. A cart through the gap falls, splashes,
   the last bumper's chip gets +1 and "KO!". Driving out alone costs 1 and shows "OOPS".
7. The fallen cart drops back in after 2 s, blinks for 1.5 s and cannot be rammed out meanwhile.
8. At 25 s left: "BARN STORM", all panels fall. At 0: results podium in score order; a tie goes to sudden death.
9. Phone: flat = still; tilt left / right / away / toward drives left / right / up / down the screen;
   Recenter makes the current angle neutral; Action charges; haptics fire on bumps and KOs.
10. Four seats at once (phones or the four key sets) all drive independently; a phone dropping mid-round
    hands that seat to its keys.
11. Easy CPU falls for simple rams; Hard lines you up with gaps and backs away from the rim.
12. Pause (Escape, P, phone Pause) freezes sim, clock and sound. Resize and full screen refit; the whole
    floor stays in view at 1280x720 and the HUD never covers it.
13. In the shell: tile and cover show, the game opens, Exit returns, camera assist reports off.
14. `node --test server/test/bumper-carts-*.test.js` and `npm test` pass (node@24 path as in Bale Brawl 2).

## 9. Not in v1

Item pickups (oil slick, spring bumper), 2 v 2 teams, more floors (ice pond, tilting barn roof), a
`kart`-layout wheel option for players who prefer car-relative steering.
