# Bale Brawl: build plan and contract

## 1. Name, pitch, look

- **Name** Bale Brawl. **id** `bale-brawl`. Served at `/play/bale-brawl/`. Tile subtitle: "Bonk them into the pond".
- **Pitch** Two farm animals duel with foam "boppers" (pool-noodle bats) on a round stack of hay bales in
  the middle of a duck pond. The phone is the bopper: its angle is the blade angle, a swing is a strike, the
  big Action button held is guard. A guard only stops a swing that crosses it (upright bopper stops side
  slashes, level bopper stops chops). Every hit shoves the rival back; first one off the bales gets wet.
  First to 2 (or 3) rounds wins. 1 player vs a CPU rival (4 difficulties) or 2 players (2nd phone, own PIN).
- **Original only.** No names, characters, island, music, UI or look from any existing sword game. Nothing
  human-like or avatar-like: the fighters are Exemoo farm animals.
- **Art direction** Exemoo "Moo Moo Farm" toon style (as Rapids Row): bright low-poly, flat/toon shading,
  sunny day. Arena: round hay-bale stack (straw yellow, red twine bands, a wooden plank rim), pond with lily
  pads, reeds, ducks that scatter on a splash, a red barn, fence, windmill and a small crowd of animals on
  the bank. Fighters: chunky upright animals in padded overalls and a colander helmet. Boppers: fat foam
  tubes in the player colour with a white stripe band and a squashy wobble. Palette: ink #1b1b3a, red #ff3b30,
  yellow #ffd21f, blue #2f7cff, green #2fc65a, water #2bb5e8 / #1679b8, straw #f2c45a, wood #b8763e.
  UI: fonts 'Lilita One' + 'Baloo 2', white cards, 5px ink border, 24px radius, `box-shadow:0 8px 0 #1b1b3a`
  (copy the card/button rules from `games/bowling/ui.css`). No emojis, no binary assets.
- **Cast** P1 red cow, P2 blue pig. CPU rivals: Easy sheep "Woolsworth", Normal goat "Billy Bonk",
  Hard bull "Sir Loin", Champ rooster "Red Comb". `animal` is one of `cow pig sheep goat bull rooster`.

## 2. Tech approach

Static, no build, plain ES modules, `three@0.160.0` from the same import map as `games/bowling/index.html`.
No physics library: the duel is a small custom 1-D simulation (see 2.2). Everything procedural.
The party kit (`party.js`) is **not** used: it is Canvas 2D and built for 4-player score rounds. We reuse
only its pairing pattern (ScreenLink PIN room for extra phones), copied from `attachLink` in
`games/rapids-row/js/main.js` lines 100 to 185.
Node on this machine: use `/opt/homebrew/opt/node@24/bin/node --test server/test/bale-brawl-<name>.test.js`.

### 2.1 Files and owners

GROUP OPUS (hard)
| File | Responsibility |
|---|---|
| `js/constants.js` | All tuning numbers of section 4, exported as in 3.1. Written first. Read-only for Sonnet |
| `js/sword-input.js` | Phone packets to `SwordIntent` (recenter, blade pose, swing detect, direction, power) |
| `js/combat.js` | Pure simulation, no three, no DOM: positions, swings, block/clash/hit, knockback, ring-out |
| `js/ai.js` | CPU controller that produces `SwordIntent` from the combat state, 4 difficulties |
| `js/world.js` | Scene, lights, pond, bale stack (shrinkable), barn, crowd, cameras. May split into `js/world/*.js` |
| `js/fighter.js` | Procedural animal fighter + bopper, pose/animation driven by combat state |
| `js/fx.js` | Pooled particles: hay puffs, impact stars, splash, ripples, camera shake |
| `js/audio.js` | WebAudio procedural sfx and a short looping tune |
| `js/engine.js` | The only Opus module Sonnet imports besides `sword-input.js` and `constants.js`. Glues the above |
| `dev/engine-test.html` | Engine alone with two CPU fighters and on-screen event log |
| `server/test/bale-brawl-combat.test.js`, `bale-brawl-input.test.js` | Node tests for combat.js and sword-input.js |

GROUP SONNET (basic)
| File | Responsibility |
|---|---|
| `index.html`, `ui.css` | Page, import map, `<canvas id="scene">`, `<div id="ui">`, boot screen, styles |
| `js/main.js` | Boot, frame loop, flow (title, setup, lobby, countdown, round, results), wiring engine + rules + ui + players |
| `js/rules.js` | Pure `Match` class: rounds, best-of, timer, sudden death, draws. No DOM |
| `js/ui.js` | DOM screens and HUD |
| `js/players.js` | SDK P1, ScreenLink P2 (and P1 outside the shell), pairing data, buttons, haptics, picks phone or keys |
| `js/keys.js` | Keyboard and mouse to `SwordIntent` |
| `dev/stub-engine.js`, `dev/ui-test.html` | Fake Engine (same interface, scripted events) so UI work does not wait for Opus |
| `README.md`, `server/test/bale-brawl-rules.test.js` | Game readme, rules tests |
| Shared files | `public/js/shell.js`, `public/index.html`, `public/covers.js`, `games/README.md`, top `README.md` (section 3.7) |

Nobody edits a file of the other group. If the contract looks wrong, report it, do not patch around it.

### 2.2 Simulation model (decided)

- Units metres, seconds, radians. Y up. Bale top at y = 0, water at y = -2.4. Platform centre at origin.
- Fighters live on the **duel axis X**. Fighter 0 starts at x = -1.3 facing +X, fighter 1 at x = +1.3 facing -X.
  State per fighter is one number `x` plus a knock velocity. No sidestep, no player-controlled walking.
- Auto footwork: a fighter that is not stunned walks toward the rival until the gap is `ENGAGE_GAP`.
  It never retreats by itself. So a shoved fighter stays near the edge and must hit back to escape.
- Ring-out: `|x| > arenaRadius` (the radius shrinks in sudden death).
- Frontal-plane angles are always in the fighter's **own** frame: 0 = toward its right, PI/2 = up.

## 3. Interface contract

### 3.1 `js/constants.js` (Opus writes, values from section 4)
```js
export const ARENA, FIGHT, SWING, GUARD, AI, MATCH, PLAYERS, CPU_CAST;   // plain frozen objects
// PLAYERS = [{ name:'Red Cow', color:'#ff3b30', animal:'cow' }, { name:'Blue Pig', color:'#2f7cff', animal:'pig' }]
// CPU_CAST = { easy:{name:'Woolsworth',animal:'sheep',color:'#2fc65a'}, normal:{name:'Billy Bonk',animal:'goat',color:'#ffd21f'},
//              hard:{name:'Sir Loin',animal:'bull',color:'#7b4dff'}, champ:{name:'Red Comb',animal:'rooster',color:'#ff8a1f'} }
// MATCH = { bestOf:[3,5], roundSeconds:45, suddenShrinkSeconds:12, suddenMinScale:0.45, countdown:3, ringoutPause:2.2 }
```

### 3.2 `SwordIntent` and `Control` (shared data shape, both groups produce it)
```js
SwordIntent = {
  live: boolean,        // false = no input yet (fighter holds a neutral ready pose)
  yaw: number,          // blade pointing direction, rad, + = toward the fighter's right, clamp +-1.4
  pitch: number,        // rad, + = up, clamp -1.2 .. 1.4
  bladeAngle: number,   // blade line in the frontal plane, 0 .. PI (0 = level, PI/2 = upright)
  guard: boolean,       // guard held
  swing: null | { dir: number,     // travel direction of the tip in the frontal plane, -PI .. PI
                  power: number,   // 0 .. 1
                  windup?: number } // seconds before the strike lands; default SWING.humanDelay
}
Control = { read(dt) -> SwordIntent,   // called once per frame by the engine; `swing` is one-shot (cleared by read)
            recenter() }
```

### 3.3 `js/sword-input.js` (Opus) used by `players.js`
```js
export function createPhoneSword() -> PhoneSword
PhoneSword = { push(packet),            // every ExemooPacket of that phone
               setGuard(held: boolean), // optional override; default reads bit 0 (action) of packet.buttons
               recenter(),              // next packet's blade heading becomes "pointing at the screen"
               read(dt) -> SwordIntent, // Control
               debug }                  // { rate, peak, yaw0, qLive } for a dev overlay
```
Mapping (must be implemented exactly this way so tests can assert it):
- Blade = device +Y axis (top edge of the phone, held like a remote). `v = rotate({0,1,0}, q)` in the W3C
  world frame (X east, Y north, Z up), the same `rotate` as `games/straw-shot/game.js` line 309.
- Recenter stores `yaw0 = atan2(v.x, v.y)`. Forward `f = (sin yaw0, cos yaw0, 0)`, right `r = (cos yaw0, -sin yaw0, 0)`.
  `bx = v.r, by = v.z, bz = v.f`. `yaw = atan2(bx, bz)`, `pitch = asin(by)`,
  `bladeAngle = atan2(by, bx) mod PI` while `hypot(bx, by) > 0.35`, else keep the previous value.
  Auto recenter on the first live packet. Smooth yaw/pitch with a 35 ms one-pole filter.
- Swing rate `w = hypot(gyro.alpha, gyro.beta)` in deg/s (ignores twist about the blade, `gyro.gamma`).
  Start when `w > SWING.startRate` for 2 packets, track the peak, fire once when `w < 0.6 * peak` or after
  `SWING.maxMs`. `dir = atan2(dby, dbx)` of the blade-tip travel from 60 ms before the start to the peak.
  `power = clamp((peak - startRate) / (fullRate - startRate), 0, 1)`. Refractory `SWING.cooldown`.
  No swing fires while guard is held.
- No orientation sensor (`q` all zero): integrate the gyro like `straw-shot` does (`yaw -= beta*dt`,
  `pitch += alpha*dt`, slow spring back to 0), swing `dir` from the integrated deltas.

### 3.4 `js/engine.js` (Opus) used by `main.js`
```js
export async function createEngine({ canvas }) -> Engine
Engine = {
  on(event, cb) -> off(),
  setFighter(i /*0|1*/, { name, color, animal, control /*Control|null*/, cpu /*null|'easy'|'normal'|'hard'|'champ'*/ }),
                                   // cpu set = engine builds its own ai Control and ignores `control`
  resetRound(),                    // both fighters to start spots, stuns cleared, arena scale 1, idle stance
  setActive(on),                   // true = controls are read and the fight runs; false = fighters idle/breathe
  setPaused(on),                   // freeze sim, fx and audio loops
  setArenaScale(scale, seconds),   // sudden death: outer bale rings drop into the pond over `seconds`
  setKnockScale(k),                // multiplies knockback (1 normal, 1.5 sudden death)
  setCamera(mode),                 // 'title' orbit | 'duel1p' behind fighter 0's shoulder | 'duel2p' side-on
                                   // | 'results' (winner close-up). Ring-out camera is automatic
  celebrate(i | -1),               // winner dance, loser sulks dripping on the bank
  snapshot() -> { arenaRadius, fighters: [ { x, edge /*0 safe .. 1 on the rim*/, guard, stagger /*s left*/,
                                             bladeAngle, live } x2 ] },
  update(dt), render(), resize(),
  audio: { unlock(), play(name), setMuted(on), music(on) },   // names: 'click' 'count' 'go' 'round' 'win' 'lose' 'sudden'
                                   // combat sounds (whoosh, bonk, block, clash, splash, crowd) play by themselves
  dispose(),
}
```
Events (payload fields are exact):
| Event | Payload | When |
|---|---|---|
| `swing` | `{ i, dir, power }` | a strike starts |
| `hit` | `{ attacker, victim, power, knock /*m*/, edge /*victim, 0..1*/ }` | strike lands unblocked |
| `block` | `{ attacker, blocker, perfect }` | guard crossed the swing; attacker is staggered |
| `clash` | `{ }` | both strikes met; both pushed back |
| `edge` | `{ i }` | fighter starts teetering (within `ARENA.teeter` of the rim), at most once per second |
| `ringout` | `{ loser /*0|1, or -1 = both*/, winner /*0|1|-1*/ }` | feet leave the bales; engine sets itself inactive |
| `splash` | `{ loser }` | about 0.9 s later, fighter hits the water. Rules continue from here |

### 3.5 Sonnet modules
```js
// rules.js (pure)
export class Match {
  constructor({ bestOf = 3, roundSeconds = 45 })
  get state()        // 'ready' | 'fight' | 'sudden' | 'roundOver' | 'matchOver'
  get round()        // 1-based
  get wins()         // [n, n]
  get need()         // wins needed
  get timeLeft()     // s, 0 in sudden death
  startRound()       // -> 'fight'
  tick(dt) -> null | 'sudden'            // returns 'sudden' once when the clock hits 0
  ringOut(loser /*0|1|-1*/) -> { draw, roundWinner, matchWinner /*0|1|null*/ }   // draw = replay, no point
  get winner()       // 0 | 1 | null
}
// keys.js
export function createKeySword({ keys, mouse = false, canvas }) -> Control & { active: boolean, dispose() }
// players.js
export function createPlayers({ exemoo, onButton(i, b), onChange() }) -> Players
Players = { list: [ { n, connected, pin, url, qrSrc, usingPhone, control /*Control*/, haptic(pattern) } x2 ],
            startPairing(n), stopPairing(n), recenter(n), dispose() }
// ui.js
export function createUI({ root }) -> UI
UI = { on(event, cb),   // 'start' ({mode:'cpu'|'versus', difficulty, bestOf}) 'pause' 'resume' 'restart' 'exit' 'mute'
                        // 'rematch' 'menu' 'lobbyReady' 'lobbyBack'
       showTitle(), showLobby(cards /*[{label,color,connected,pin,url,qrSrc,keysHelp}]*/), showPause(on),
       showResults({ winner, names, colors, wins, rounds }), hideAll(),
       hud({ names, colors, wins, need, round, timeLeft, sudden, edge:[a,b], guard:[a,b] } | null),
       countdown(n | 'GO'), banner(text, kind /*'round'|'ringout'|'sudden'|'draw'|'win'*/, ms),
       callout(i, text /*'BONK!' 'BLOCKED' 'CLASH'*/), hint(text | null), setStatus({ phones:[bool,bool], muted }),
       nav(button) -> boolean }
```
`players.js` owns one `createPhoneSword()` and one `createKeySword()` per player; `control.read` returns the
phone's intent while `usingPhone` (connected and a packet in the last 1.5 s), else the key sword's.

### 3.6 Flow (main.js, Sonnet)
1. Boot: `createEngine`, `setCamera('title')`, title screen: mode (vs CPU / 2 Players), difficulty, best of 3 / 5,
   three how-to cards (point and swing, hold to guard and cross the swing, shove them off), Start.
2. Versus: lobby with a card per player (P1 "uses your Exemoo phone" in the shell; otherwise QR + PIN, or "keys").
3. Round: `resetRound()`, `setCamera('duel1p'|'duel2p')`, hint "Point your bopper at the screen", recenter all
   phones at "1", banner "ROUND n", 3-2-1-GO, `match.startRound()`, `setActive(true)`.
4. Each frame: `match.tick(dt)`; on `'sudden'`: banner "SUDDEN DEATH", `setArenaScale(MATCH.suddenMinScale,
   MATCH.suddenShrinkSeconds)`, `setKnockScale(1.5)`. HUD from `engine.snapshot()`.
5. `ringout` then `splash`: `match.ringOut(loser)`; draw = "DRAW, again!"; else banner, `celebrate`, after
   `MATCH.ringoutPause` next round or results (`setCamera('results')`, Rematch / Menu / Exit).
6. Haptics: victim 60 ms on `hit`, attacker 25 ms; `[40,30,40]` on `block` for the attacker; 200 ms on `splash`.
7. Pause: phone Pause, Escape or P. Phone d-pad and Action go through `ui.nav` when a menu is open; Recenter
   button calls `players.recenter(n)`. Layout stays `swing` the whole time. `exemoo.exit()` on Exit.

### 3.7 Keyboard and mouse (keys.js, Sonnet)
| | Player 1 | Player 2 |
|---|---|---|
| Swing right / left / up / chop down | D / A / W / S | Right / Left / Up / Down arrows |
| Diagonal swings | two keys together within 60 ms | same |
| Guard (hold) | Space | Enter |
| Guard blade | upright by default; hold W or S = level; Q / E = diagonals | upright; Up or Down = level |
| Mouse (P1 only) | move = blade pose; left-drag flick = swing along the flick (speed = power); right button hold = guard, blade line = centre to pointer | |
Key swings use power 0.75 (Shift held = 1.0), `dir` 0, PI, PI/2, -PI/2 and the diagonals. While idle the key
blade rests at yaw 0, pitch 0.5, and leans toward the last swing. Escape / P pause, M mute, R recenter.

### 3.8 Shell registration (Sonnet)
- `public/js/shell.js`: `DEFAULT_LAYOUT['bale-brawl'] = 'swing'`; add `'bale-brawl'` to `NO_CAMERA`.
- `public/index.html`: tile after Barn Blink, `--bg:#2bb5e8`, `data-g="Bale Brawl" data-id="bale-brawl"`,
  `data-cover="brawl"`, small text "Bonk them into the pond".
- `public/covers.js`: cover `brawl` with the file's helpers (cow and pig crossing boppers on a bale, splash).
- Rows in `games/README.md` and top `README.md` (phone: "swing: the phone is the bopper, hold Action to guard, Recenter").

## 4. Tuning numbers (go into constants.js)

| Group | Key | Value |
|---|---|---|
| ARENA | radius | 4.2 m (bale top), water y -2.4, start x +-1.3, teeter band 0.6 m |
| FIGHT | engageGap | 1.6 m; reach 2.0 m (a strike only lands if the gap is under this); walk speed 1.2 m/s |
| FIGHT | knockback | `0.45 + 0.60 * power` m (about 4 good hits from the centre) |
| FIGHT | multipliers | victim staggered x1.6; guard up but wrong angle x0.5; sudden death x1.5 (via setKnockScale) |
| FIGHT | knock slide | impulse applied as velocity, decays in 0.25 s; hit stun 0.35 s (victim cannot swing or guard) |
| FIGHT | clash | both strikes land within 0.12 s: both pushed 0.35 m, no stun |
| FIGHT | double ring-out | both off within 0.25 s = draw (`loser: -1`) |
| SWING | startRate / fullRate | 220 / 700 deg/s; maxMs 180; cooldown 0.38 s; humanDelay 0.09 s |
| GUARD | raise time | 0.06 s before it counts; cannot swing while guarding; lowering takes 0.08 s |
| GUARD | block rule | swing line seen by the defender `a = (PI - dir) mod PI`; blocked if the angle between `a` and `bladeAngle` (0..PI/2) is at least 50 deg (guard within 40 deg of crossing) |
| GUARD | on block | attacker staggered 0.7 s (1.0 s if perfect = guard raised under 0.25 s before the strike); blocker slides 0.12 m |
| MATCH | rounds | best of 3 (default) or 5; round 45 s; then sudden death: arena to 45 % over 12 s |
| MATCH | pacing | countdown 3 s; ring-out pause 2.2 s; splash 0.9 s after ring-out |

CPU (ai.js). All blocks are geometric like a human's; skill is how well the CPU reads the player's blade pose
(blade high = chop coming, blade to a side = slash coming) and how often it guards. CPU strikes have a visible
wind-up (`windup`) so a human can cross it in time.
| | easy | normal | hard | champ |
|---|---|---|---|---|
| Read delay (re-aims its guard after the player's blade moves) | 0.55 s | 0.38 s | 0.26 s | 0.18 s |
| Read accuracy (picks the crossing angle) | 55 % | 72 % | 86 % | 94 % |
| Guard uptime while the player is in reach | 30 % | 50 % | 68 % | 80 % |
| Time between attacks | 1.6 to 2.6 s | 1.1 to 1.9 s | 0.8 to 1.4 s | 0.6 to 1.1 s |
| Strike wind-up (telegraph) | 0.50 s | 0.40 s | 0.32 s | 0.26 s |
| Power | 0.4 to 0.7 | 0.5 to 0.85 | 0.6 to 1.0 | 0.7 to 1.0 |
| Counter while the player is staggered | 25 % | 55 % | 85 % | 100 % |
| Aims along the player's guard (to slip past it) | never | 30 % | 60 % | 85 % |
| Combo (second strike after a hit) | no | 15 % | 40 % | 60 % |
Hard and champ press harder when the player is in the teeter band. AI uses a seeded RNG (tests).

## 5. Quality bar (Opus)

- 60 fps on a laptop GPU, pixel ratio capped at 2, under 250 draw calls, soft shadows, tone mapping.
- Fighter animation: ready bounce, bopper follows the intent 1:1 (two-bone arm IK is enough), strike arc with
  foam wobble, guard pose, block recoil, stagger wobble, hit flinch, teeter with arm windmill, fall, splash,
  winner dance, loser sulk. Water: toon shader with ripples and a splash ring.
- `duel1p` camera sits behind and above fighter 0's right shoulder so the on-screen blade matches the hand.
  `duel2p` is side-on, both fighters equal size.
- combat.js tests: knockback formula, block rule at 0 / 45 / 90 deg, perfect block, clash, stagger bonus,
  ring-out and draw, arena shrink, determinism. input tests: recenter, bladeAngle, 8 swing directions,
  power scaling, no swing while guarding, gyro-only fallback.

## 6. Acceptance checklist (keyboard and mouse, no phone)

Open `http://localhost:8080/play/bale-brawl/` directly (`npm run dev`), and once through the Exemoo tile.
1. Boot screen clears, title shows over a slowly orbiting arena. No console errors. No emojis anywhere.
2. Tab / arrows / Enter work on every menu button; mouse clicks too. Mode, difficulty and best-of are remembered.
3. vs CPU, Easy: 3-2-1-GO runs, timer counts down from 45, HUD shows names, round pips, edge meters.
4. Mouse move tilts P1's bopper smoothly. A, D, W, S each swing in the right direction with a whoosh.
5. A swing in reach shoves the CPU back (callout "BONK!", hay puff, bonk sound). Out of reach it whiffs.
6. Hold Space: guard pose. An upright guard stops a CPU side slash ("BLOCKED", CPU wobbles); a CPU chop gets
   through it at half knockback. Space + W (level blade) stops the chop.
7. Hitting a staggered CPU sends it clearly further than a normal hit.
8. Left-drag flick swings along the flick; right mouse button guards with the blade following the pointer.
9. Shoving the CPU past the rim: teeter, fall, splash, ducks scatter, "RING OUT" banner, P1 gets a pip, next
   round starts with both back in the middle. Being shoved off gives the CPU the pip.
10. Standing idle for 45 s: "SUDDEN DEATH", outer bales drop away, the round still ends by ring-out.
11. Best of 3 ends at 2 wins; results show the winner dance, Rematch, Menu and Exit all work. Best of 5 needs 3.
12. Easy is beatable by mashing; Champ blocks most plain repeats and punishes blocked swings.
13. 2 Players: lobby shows a QR + PIN card for P2 and "or keys: arrows + Enter". Start with keys only: side-on
    camera, WASD/Space vs arrows/Enter both work at once, simultaneous swings give "CLASH".
14. Escape and P pause and resume (sim, timer and sound stop). M mutes. Restart and Exit from pause work.
15. Resize the window and go full screen: canvas and HUD refit; HUD never covers the fighters at 1280x720.
16. In the shell: tile and cover show on the landing page, the game opens, Exit returns to the menu, the
    camera-assist toggle reports that it is off for this game.
17. `node --test server/test/bale-brawl-*.test.js` passes (node@24 path above); `npm test` still passes.
