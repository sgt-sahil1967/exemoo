# Moo Bowl: build contract

Ten-pin bowling for Exemoo. Static game at `games/bowling/`, served at `/play/bowling/`, id `bowling`.
The player stands in front of the laptop camera holding the phone in the bowling hand like a ball.
**Camera**: where the hand is sets the direction (start position and line) and the camera sees the
throw happen. **Phone IMU**: how fast the arm swings sets ball speed, wrist twist at release sets curve
(hook). Mouse and keyboard always work as a fallback. 1 to 4 players take turns (hot seat), full ten-pin rules.

No build step. Plain ES modules. `three@0.160.0` comes from the import map in `index.html`
(`import * as THREE from 'three'`, `three/addons/...`). Physics uses Rapier 3D
(`@dimforge/rapier3d-compat`), vendored in `vendor/` and injected into `physics.js`.
Everything else (models, textures, sounds, music) is generated in code. No binary assets, no emojis.

Node on this machine: plain `node` is broken. Use `/opt/homebrew/opt/node@24/bin/node`
(and `/opt/homebrew/opt/node@24/bin/npm`). Tests live in `server/test/bowling-*.test.js` and run with
`/opt/homebrew/opt/node@24/bin/node --test server/test/bowling-<name>.test.js` from the `exemoo/` folder.

Only touch the files you own (listed below). `js/constants.js` and this file are read-only; if you think
they are wrong, say so in your final report instead of editing them. Do not edit anything outside
`games/bowling/` except your own test file in `server/test/`.

## World conventions (see `js/constants.js`, import from it, never copy numbers)
- Metres, kg, seconds, radians. Y up. Lane runs toward **-Z**. Foul line z = 0. Lane surface y = 0.
- Bowler stands at z > 0 facing -Z, so **+X is the bowler's right**. Pin 7 is at -X, pin 10 at +X.
- Head pin at z = -18.288. `PIN_SPOTS`, `PIN_PROFILE`, `LANE`, `BALL`, `PIN`, `THROW`, `PLAYERS`.
- A pin's transform is its **base centre**: local origin at the middle of the base, pin extends to local y = +0.381.
- A throw is `{ x, angle, speed, curve }`:
  - `x`: ball centre at the foul line, metres, |x| <= THROW.maxX.
  - `angle`: launch direction, radians, 0 = straight down the lane, **positive = toward +X** (right).
  - `speed`: m/s at release, THROW.minSpeed to THROW.maxSpeed.
  - `curve`: -1 to +1, side spin. **Positive makes the ball curve toward +X** (right) at the back end,
    negative toward -X (a right-hander's natural hook is negative). 0 = straight ball.

## Look
A polished, warm bowling alley inside a big barn ("Moo Bowl"): glossy maple lanes with real reflections,
timber beams, string lights, neon signs, hay bales, a cow or two watching. Exemoo palette for accents:
ink #1b1b3a, red #ff3b30, yellow #ffd21f, blue #2f7cff, green #2fc65a. UI uses fonts 'Lilita One'
(display) and 'Baloo 2' (body), white cards with a 5px ink border, 24px radius, `box-shadow: 0 8px 0 #1b1b3a`
(see `games/cricket/index.html` for the button and card style). High quality, 60 fps on a laptop GPU.

## Modules

### js/physics.js (physics agent). No three.js, no DOM. Also `vendor/` and `server/test/bowling-physics.test.js`
```js
export async function createPhysics({ RAPIER }) -> Physics   // calls `await RAPIER.init()` itself
Physics = {
  resetPins(standing = [1..10]),  // put exactly these pin ids upright and at rest on their spots; the others
                                  // leave the simulation (present = false). Also removes the ball.
  throwBall({ x, angle, speed, curve }),   // ball appears at the foul line (z = 0) and rolls
  step(dt),                       // advance dt seconds: fixed internal steps (1/240 s or finer), dt clamped to 0.05
  ball,                           // { present, x, y, z, qx, qy, qz, qw, vx, vy, vz, speed,
                                  //   state: 'none' | 'lane' | 'gutter' | 'pit' }   mutated in place
  pins,                           // Array(10), index = id - 1: { id, present, x, y, z, qx, qy, qz, qw, down }
                                  //   mutated in place. `down` = counts as knocked over right now.
  drainEvents(),                  // -> events since the last call, each { type, strength (0..1), x, y, z, id? }
                                  //   types: 'ballPin' 'pinPin' 'pinWall' 'pinFloor' 'ballGutter' 'ballPit' 'pinDown'
                                  //   (id = pin id where it applies; rate-limit so one contact is not 200 events)
  settled,                        // getter: true once the ball is gone (pit / stopped) and all pins have been at
                                  //   rest for 0.5 s. Must become true no later than 6 s after the ball reaches
                                  //   the pin deck or stops (force wobbling pins to a decision), and also for a
                                  //   gutter ball once it reaches the pit.
  standing(),                     // -> ids of pins that count as standing now (present, upright, on the deck)
  predictPath({ x, angle, speed, curve }, n = 48), // -> [{x, z}] ball path ignoring pins, to the pin deck or gutter
  dispose(),
}
```
Requirements:
- Ball on the lane: a real skid / hook / roll model. Sliding friction `mu(z)` is low on the oiled front part
  (to `LANE.oilEndZ`) and high on the dry back end, acting on the contact-point slip velocity with the ball's
  angular velocity (I = 2/5 m r^2). `curve` sets the side rotation at release. Tuning targets at 7.6 m/s:
  curve 0 goes dead straight; |curve| = 1 moves the ball about 0.40 to 0.55 m sideways by the head pin, mostly
  in the last third of the lane; faster balls hook less, slower balls hook more. The ball loses roughly 10 to
  15 percent of its speed down the lane. `predictPath` must match the live ball closely (share the code).
- Gutters: a ball whose centre passes the lane edge drops into the gutter, stays in it and rolls to the pit
  without touching any pin (event `ballGutter` once). Gutters run beside the pin deck too.
- Pins: 10 dynamic bodies with a collider that follows `PIN_PROFILE` (compound of convex pieces or
  cylinders/capsules is fine), mass 1.53 kg, centre of mass 0.147 m above the base, realistic restitution
  (pin-pin about 0.7, ball-pin about 0.65) and friction, so pins fly, spin, slide and take each other out.
  Kickback side walls beside the pin deck (`LANE.kickbackX`), a pit behind (`deckEndZ`, `pitFloorY`,
  `pitBackZ` with a soft cushion that kills speed). Use CCD on the ball. No tunnelling at 10.5 m/s.
- A pin is `down` when its axis tilts more than about 25 degrees, or its base centre leaves the pin deck
  (fell in the pit or gutter). Fallen pins lying on the deck stay as dead wood until `resetPins`.
- Believable results: a pocket hit (right-hander: ball centre about 0.06 m right of the head pin centre,
  entering at a 3 to 6 degree angle between pins 1 and 3; mirrored for 1 and 2) strikes most of the time; a dead
  centre straight ball often leaves a split or a few pins; a ball hitting only pin 10 or 7 takes 1 to 2 pins.
  Tests should assert this statistically over many seeded/varied throws, plus the tuning targets above,
  gutter behaviour, settle timing, `standing()` correctness and that `resetPins([..subset])` works.
- Deterministic for the same inputs (no Math.random inside the simulation).
- Performance: a full throw simulated at 60 fps real time must be cheap (well under 2 ms per frame average).
- Vendor Rapier: put the single-file ES build in `games/bowling/vendor/` (for example
  `rapier3d-compat.js`, the `rapier.es.js` of `@dimforge/rapier3d-compat`, wasm embedded) so the game loads it
  same-origin and Node tests import the same file. Report the exact file name and version.

### js/rules.js (rules + UI agent). Pure, no DOM. Also `server/test/bowling-rules.test.js`
```js
export class BowlingGame {
  constructor(numPlayers)                 // 1..4
  get current()   // { player (0-based), frame (0..9), ball (0..2), standingBefore: number[] } or null when over
  get over()
  roll(standingAfter: number[])           // ids of the pins still standing after this ball. Returns:
     // { player, frame, ball, knocked: number[], count, mark: 'strike'|'spare'|'split'|'gutter'|'open'|'washout'?,
     //   symbol: 'X' | '/' | '-' | '1'..'9', isSplit: boolean, streak: number (strikes in a row for this player,
     //   incl. this one), resetPins: boolean (true = full fresh rack before the next ball; false = only remove
     //   fallen pins), turnDone: boolean (next ball belongs to another player or another frame), gameDone }
  sheet(player)   // { frames: [ { rolls: number[], symbols: string[], split: boolean[], cumulative: number|null } x10 ],
                  //   total: number (score so far, counting only what is certain plus open pins), max: number
                  //   (best possible final score) }
  totals()        // number[] per player
  winners()       // player indices with the top score (when over)
}
```
Perfect ten-pin rules: 10 frames; strike = 10 + next two balls; spare = 10 + next ball; 10th frame gives a
third ball after a strike or spare (fresh rack after a strike or a spare in the 10th, standard fill-ball
logic: X then 7 leaves 3 pins for the third ball); cumulative score shows only when the frame can be fully
scored; 300 max. A split = first ball of a frame (or after a strike in the 10th on a fresh rack), head pin
down, and at least two standing pins that are not neighbours with a gap between them (standard definition:
standing pins form two or more groups separated by at least one fallen pin spot so that a pin is down
between or ahead of them; implement the usual adjacency rule and test 7-10, 4-6, 5-7, 3-10 is a split
(baby split), 2-4-5 is not, anything with pin 1 standing is not). Tests: perfect game 300, all spares
(9/ x10 + 9 = 190), all gutter 0, all 9- = 90, 10th frame variants, mid-game partial sheets, multi-player
turn order, `max`.

### js/ui.js + ui.css (rules + UI agent). DOM only, no three.js
```js
export function createUI({ root = document.body }) -> UI
UI = {
  on(event, cb),            // 'start' ({ players: 1..4, hand: 'right'|'left' }), 'pause', 'resume', 'restart',
                            // 'exit', 'camera' (toggle camera assist), 'mute' (toggle), 'continue' (results -> title)
  showTitle(), hideTitle(), // title screen: logo "MOO BOWL", player count 1..4, hand Right/Left, how-to-play
                            // (3 short cards: stand & aim with your hand, swing & let fly, twist for curve),
                            // Start button, camera and phone status chips
  setStatus({ camera: boolean, phone: boolean, source: 'camera+phone'|'camera'|'phone'|'mouse', muted }),
  setTurn({ player, frame, ball, name, color }),      // HUD: whose turn, frame n/10, ball n
  setSheets(game, currentPlayer),                     // the classic score sheet for every player (uses game.sheet),
                                                      // compact strip at the top during play, current frame highlighted
  setPinDeck(standingIds),                            // small 10-dot pin diagram (standing = filled)
  callout(text, kind),      // big animated call: kind 'strike'|'spare'|'split'|'gutter'|'turkey'|'info'|'foul'
  throwStats({ speedMph, curve, board } | null),      // small readout after a throw (speed, hook, board)
  hint(text | null),        // one-line coaching text near the bottom ("Swing your arm to bowl")
  meter({ visible, power: 0..1, aim: -1..1, curve: -1..1 }),  // fallback power / aim meter for keyboard play
  showPause(visible), showResults(game, players /* [{name,color}] */), hideResults(),
  nav(button)               // phone d-pad / action over the visible menu buttons; returns false if no menu is open
}
```
Keyboard: Escape / P emits 'pause'. Buttons must be real `<button>`s (the phone d-pad navigates them).
The score strip must stay readable on a 1280x720 screen with 4 players and must never cover the lane centre.
z-index of UI above the canvas (`#scene`, fixed, full screen). Exemoo look (see Look).

### js/world.js (world agent). three.js scene, all visuals. May split into js/world/*.js
```js
export async function createWorld({ canvas }) -> World
World = {
  resize(), update(dt), render(),
  syncPins(pins), syncBall(ball),     // physics objects exactly as in physics.js (ball.present false = hide)
  setHeldBall({ visible, x, swing, player }), // the ball in the bowler's hand on the approach before release:
                                      // x = metres across the lane, swing = -1 (top of backswing) .. 0 (hanging
                                      // by the leg) .. +1 (release point at the foul line). Smooth it visually.
  setAim({ visible, x, angle, path }),// aiming aid on the lane: path = [{x,z}] from physics.predictPath; draw a
                                      // tasteful animated guide (fades out after the arrows / first 8 m)
  setBallPlayer(i),                   // 0..3: ball colour/skin of the rolling ball (PLAYERS[i].color)
  setCamera(mode, opts),              // 'title' slow beauty orbit; 'address' behind the bowler at the foul line
                                      // looking down the lane (opts.x shifts it a little with the hand);
                                      // 'follow' chases the ball down the lane then settles on the pins;
                                      // 'pins' close view of the pin deck; 'results' wide happy shot. Blend smoothly.
  pinsetter(mode, { standing }) -> Promise,  // 'sweep': rack lowers, lifts the standing pins, sweep bar clears
                                      // dead wood into the pit, standing pins are set back on their exact spots.
                                      // 'rack': sweep everything, then lower a fresh full rack of 10.
                                      // While the promise is pending the world animates the pin meshes itself
                                      // (the game does not call syncPins). About 2.4 s for sweep, 3 s for rack.
  impact({ x, y, z, strength }),      // ball/pin hit: dust, sparks, small camera shake scaled by strength
  celebrate(kind),                    // 'strike' | 'spare' | 'turkey' | 'gutter' | 'split': lights, confetti, neon
  monitorCanvas,                      // a 1024x512 canvas the game draws scores on; shown on the overhead monitor
  monitorChanged(),                   // call after drawing on monitorCanvas
}
```
Requirements: procedural high-quality assets. Lathe pins from `PIN_PROFILE` with red neck stripes and a
glossy finish; balls with a swirled pearl texture, three finger holes and a visible roll (texture must show
rotation); maple lane with boards, arrows, dots, foul line, oil sheen and reflections of pins and ball;
gutters, pin deck, kickbacks, pit curtain, pinsetter housing with masking unit, sweep bar and rack; ball
return; neighbouring lanes so it reads as a real alley; barn architecture; soft shadows; tone mapping; a
quality fallback so it holds 60 fps (cap pixel ratio at 2). All collision-relevant visuals must match
`constants.js` exactly (the physics is invisible, the meshes are what the player sees).

### js/input.js (+ js/throwdetect.js, js/handcam.js) (input agent). Also `server/test/bowling-input.test.js`
```js
export function createInput({ exemoo, canvas }) -> Input
Input = {
  setHand('right' | 'left'),
  arm(), disarm(),            // armed = watching for a throw; a throw disarms it
  update(dt),                 // every frame
  aim,                        // { x (m at the foul line), angle (rad), swing (-1..1), tracked: boolean,
                              //   source: 'camera+phone' | 'camera' | 'phone' | 'mouse' }   mutated in place
  on('throw', cb),            // cb({ x, angle, speed, curve, source, detail: { camSpeed, imuPeak, twist, ... } })
                              // values already clamped to THROW limits
  on('status', cb),           // cb({ camera: boolean, phone: boolean, source })
  meter,                      // { visible, power, aim, curve } for keyboard play (UI draws it)
  handcam,                    // { setVisible(bool), flash(text, color) } small mirrored webcam panel with the
                              // tracked arm drawn on it (see games/cricket/js/handcam.js for how the game
                              // iframe reads the shell's <video id="camVideo">)
}
```
- `exemoo` is the SDK object from `/sdk/exemoo.js` (`on('packet')`, `on('pose')`, `on('camera')`,
  `on('status')`, `on('button')`, `held()`, `inShell`). Read `public/sdk/exemoo.js`, `public/js/camera.js`,
  `public/js/pad.js`, `public/js/protocol.js` and how cricket (`games/cricket/js/batcam.js`, `imu.js`) and
  golf (`games-src/golf/src/input/`) read hands and swings.
- Camera (pose events, about 30 fps; use the raw `img` landmarks for both arms and `world`): the bowling
  hand (`setHand`) relative to the body, in shoulder widths so distance to the camera does not matter, sets
  `aim.x` at address (hand out to the right = ball further right, one-euro filtered, full lane reachable
  with a comfortable reach) and the swing phase `aim.swing`. The sideways travel of the hand through the
  forward swing sets `angle`. The camera detects the throw: a real bowling swing (hand goes back/down then
  comes forward and up fast) and its release moment. A walk, a wave or lifting the phone to look at it must
  not throw the ball.
- Phone IMU (packets, about 60 Hz, `gyro` deg/s, `acc` m/s^2, `q` orientation): refines the release time
  (peak rotation of the swing), sets `speed` (peak swing rate x arm length, mapped so a gentle swing is
  about 5 m/s, a normal one about 7.6 and a hard one 10+) and `curve` from the forearm/wrist twist rate
  around release (rotation about the forearm axis; a right-hander turning the hand counter-clockwise =
  hook to the left = negative curve; mirror for left-handers; small twists must read as 0 so straight
  balls are easy). Fuse camera and phone within a short window like golf's `camSwing` + `phoneSwing`.
- Fallbacks, chosen automatically and reported in `source`: camera only (speed from hand speed in shoulder
  widths per second, curve from the sideways bend of the hand path); phone only (aim with d-pad left/right
  or phone tilt, hold Action, swing, release Action or swing peak = throw); mouse (move to aim, press and
  flick up to throw: flick speed = speed, sideways bend of the flick = curve); keyboard (Left/Right aim,
  Up/Down or A/D curve, Space starts a power meter, Space again throws).
- Put the pure detection maths in `throwdetect.js` (no DOM) and test it in Node with synthetic pose and
  packet streams: a clean throw fires once with sane values; straight vs twisted; slow vs fast; idle,
  walking and waving do not fire; left hand mirrored.

### js/audio.js (audio agent). Web Audio only, everything synthesised
```js
export function createAudio() -> Audio
Audio = {
  unlock(),                         // call from a user gesture
  setMuted(bool), muted,
  music(mode),                      // 'title' | 'game' | 'results' | 'off': generative, loops, crossfades
  roll({ active, speed, x, z, gutter }),  // continuous ball rumble, call every frame; louder/brighter with speed,
                                    // pans with x, gets quieter with distance (z from 0 to -19), hollow in gutter
  release(speed),                   // ball lands on the lane: thud
  pinHit(strength, x), pinClack(strength, x), pinFloor(strength),   // layered wooden pin crash; many may fire
                                    // per frame, so voice-limit and randomise pitch
  gutter(), ballPit(), sweep(), rack(),          // gutter drop, pit thump, pinsetter machine sounds (2.4 s / 3 s)
  call(kind),                       // 'strike' | 'spare' | 'turkey' | 'split' | 'gutter' | 'open' jingles
  crowd(kind),                      // 'cheer' | 'aww' | 'clap'
  ui(kind),                         // 'move' | 'select' | 'back' | 'start'
  ambience(on),                     // quiet alley background (distant pins, murmur)
}
```
Pin crashes must sound like real maple pins (short bright wood knocks with body resonance, not beeps).
Master chain with a compressor/limiter; nothing clips when ten pins crash at once.

### index.html, js/main.js (integrator)
Game loop and state machine: title -> per ball: address (input armed, aim guide) -> rolling (physics,
follow camera, sound) -> settle -> `rules.roll(physics.standing())` -> callout -> pinsetter -> next ball
or results. Phone layout, haptics, pause, shell integration, landing card and cover art.
