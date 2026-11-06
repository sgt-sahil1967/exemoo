# Rapids Row — build contract

Original 2-player co-op rowing game for Exemoo (static game at `games/rapids-row/`, served at `/play/rapids-row/`).
Two players share ONE canoe racing down ONE long river. Player 1 (red, #ff3b30) paddles the LEFT side,
player 2 (blue, #2f7cff) the RIGHT side. Each player paddles by moving their phone in circles: faster/bigger
circles = stronger strokes. Holding the phone's big Action button while circling = back-paddle (brake / reverse).
Only the left player paddling turns the boat RIGHT (and vice versa), so players must keep in sync to go straight.
Goal: reach the finish as fast as possible, collect coins, avoid rocks/logs, pass checkpoint gates.

No build step. Plain ES modules, `three@0.160.0` via the import map in index.html:
`import * as THREE from 'three'` and `three/addons/...`. No other dependencies. Everything procedural.

## Look
Exemoo "Moo Moo Farm" style: bright saturated cartoon, low-poly flat/toon shading (MeshToonMaterial or
MeshLambertMaterial with flatShading), chunky shapes, sunny day. Palette: ink #1b1b3a, red #ff3b30,
yellow #ffd21f, blue #2f7cff, green #2fc65a, water #2bb5e8 / deep #1679b8, foam #ffffff, grass #5fd03a,
sand #f3d58a, wood #b8763e. UI fonts: 'Lilita One' (display) and 'Baloo 2' (body), white text with thick
ink stroke, white cards with 5px ink border, 24px radius, `box-shadow: 0 8px 0 #1b1b3a`.

## World conventions
- Units are metres. Y is up. Ground/water level y = 0 (water surface at y = 0).
- The river runs roughly toward -Z (downstream = forward). Start near (0, 0, 0).
- `heading` h (radians): forward vector is (-sin h, 0, -cos h), i.e. a model built facing -Z then
  `object.rotation.y = h`. h = 0 faces -Z. Positive h turns LEFT (counter-clockwise seen from above).
- "lateral" offset: signed distance from centerline, + = to the RIGHT when facing downstream.

## Modules (one owner each)

### js/track.js  (owner: track agent)
```js
export function createTrack(): Track
Track = {
  length,                                   // centerline length in m (aim 1800–2400 m: ~3–4 min run)
  sample(s) -> {x, z, tx, tz, halfWidth, current}   // s clamped to [0,length]; (tx,tz) unit tangent downstream;
                                            // current = downstream flow speed m/s (1.5 calm … 5 rapids)
  locate(x, z, hintS?) -> {s, lateral, halfWidth, tx, tz, current}  // fast with hintS (local search)
  start: {x, z, heading, s},  finishS,
  obstacles: [{type:'rock'|'log'|'buoy', x, z, r, rot, scale, seed}], // r = collision radius (m)
  pickups:   [{type:'coin', x, z, y}],
  gates:     [{s, x, z, heading, halfWidth, label}],   // checkpoints across river, label like 'CP 1'
  zones:     [{s0, s1, name, rapids:boolean}],          // e.g. 'Lazy Bend', 'Cow Meadow', 'Whitewater', 'Log Jam', 'Canyon', 'Final Sprint'
}
export function buildScenery(scene, track, models, water) -> { update(dt, t, camera), collectPickup(i), pickupMeshes }
```
River halfWidth varies 9–22 m. Varied single map: calm intro straight, S-bends, narrow canyon with rapids,
slalom of rocks, log jam with gaps, wide lake section, cow meadow with cows cheering on the bank, finish.
`buildScenery` builds banks/terrain (raised ground beyond the water edge, sloping down to the water),
trees, bushes, cows, obstacle meshes, coins, gate flags, start + finish arches, using `models` factories
(below) and adds `water.mesh` from `createWater(track)` (water.js). Keep draw calls sane (InstancedMesh or
merged geometry for trees/grass; < ~400 draw calls).

### js/models.js and js/water.js  (owner: models agent)
All factories return objects in metres, facing -Z, base at y = 0 unless noted.
```js
export function makeBoat({ colors: ['#ff3b30', '#2f7cff'] }) -> {
  group,                                  // canoe ~5.2 m long, 2 cartoon rowers (cow-hat/helmet ok) in life vests
  setPaddle(side /*0 left,1 right*/, phase /*0..1 cycle*/, power /*0..1*/, reverse /*bool*/),
  setLean(x /* -1..1 roll for turning */), update(dt),
  paddleTip(side) -> THREE.Vector3        // world position of blade tip (for splash particles)
}
export function makeRock(seed, size), makeLog(length), makeBuoy(color), makeTree(kind /*'pine'|'round'|'birch'*/, seed),
       makeBush(seed), makeCow(seed) /* with .userData.cheer(t) animation */, makeCoin() /* gold, ~0.8 m, spins */,
       makeArch(text /*'START'|'FINISH'*/, width), makeGateFlags(halfWidth, label, color), makeReeds(seed)
export function makeSplashes(scene) -> { emit(x, y, z, strength /*0..1*/), update(dt) }   // pooled particles
export function makeSky(scene) -> { update(t) }   // gradient sky dome + sun + a few clouds + light setup helpers ok
```
```js
// water.js
export function createWater(track) -> { mesh, update(t, camera) }
```
Water: ribbon mesh following track.sample() with width halfWidth + ~3 m overlap under the banks, animated
toon shader: flow lines/stripes scrolling downstream at the local current speed, white foam at the edges and
faster/whiter in rapids zones. Uses only the Track API above.

### js/rowing.js and js/boat.js  (owner: physics agent)
Phone packet (~60 Hz) from Exemoo: `{seq, t, q:{x,y,z,w}, acc:{x,y,z}, gyro:{alpha,beta,gamma}, buttons, at}`
— acc = linear acceleration m/s^2 in device frame (gravity removed on most phones; may include gravity on
some — high-pass it), gyro in deg/s, q = device orientation quaternion. `buttons` bit 0 = Action held.
```js
export class StrokeDetector {          // one per player
  push(packet)                         // feed phone packets
  update(dt)
  recenter()
  power    // 0..1 smoothed paddling effort (0 when not circling)
  phase    // 0..1 paddle animation cycle (advances with the circle)
  reverse  // true when Action held (back-paddle)
  rate     // circles per second (for HUD)
  onStroke(cb)  // cb({strength 0..1}) once per completed circle — used for splash sfx/haptics
}
export class KeyStroker {               // keyboard fallback with the same interface
  constructor({ forward: 'KeyW', back: 'KeyS' })   // P1: W/S, P2: ArrowUp/ArrowDown; tap rhythmically
}
```
Circle detection must be orientation-agnostic: the motion is a circle in any plane; detect rotation of the
high-passed acceleration (and/or gyro) vector in its plane of max variance; reject random shaking (needs a
consistent rotation). Any circle direction counts as forward.
```js
export class Boat {
  constructor(track)
  reset()
  step(dt, [left, right])   // left/right = {power, reverse, phase}
  x, z, heading, speed, s, lateral, finished
  onHit(cb)                 // cb({kind:'bank'|'rock'|'log'|'buoy', strength 0..1, x, z})
}
```
Physics: each side's stroke gives thrust along heading and yaw torque (left paddle → turn right, i.e.
heading decreases). Reverse = negative thrust. Water drag, river current carries the boat downstream
(current from track), gentle auto-straightening toward downstream only when nobody paddles. Collide with banks
(lateral beyond halfWidth - 1.4) and obstacles (circle vs boat capsule) → bounce, lose speed, emit onHit.
Top speed ~9 m/s with both paddling hard; ~3 m/s drifting on current. Must feel good with keyboard too.

### js/audio.js + assets/audio/*.wav  (owner: audio agent; audio GENERATED BY GEMINI)
```js
export function createAudio(baseUrl = 'assets/audio/') -> {
  ready: Promise, unlock(), play(name, {volume, rate, pan}={}),
  loop(name, {volume}) -> {setVolume(v), setRate(r), stop()}, setMusic(on), setMaster(v)
}
```
Sound names: splash_1 splash_2 splash_3 (paddle strokes), rock_hit, log_hit, bank_scrape, coin, checkpoint,
beep (countdown), go, finish (fanfare), cheer, moo, river_loop (ambience), rapids_loop, music_loop, click.
Missing files must not throw.

### js/ui.js + style.css + cover.js  (owner: ui agent)
```js
export function createUI(root /* #ui */) -> {
  showTitle({ onPlay, onKeyboard }),  // logo "RAPIDS ROW", tagline, how-to (circle phone = paddle, hold button = back-paddle)
  showPairing({ p1, p2, onStart, onBack }),  // p = {connected, label, pin, qrSrc, url}; can re-call to update
  showCountdown(n /* 3,2,1,0='GO!' */),
  hud: { show(), hide(), update({ time, progress, speed, coins, coinsTotal, zone, p1:{power, rate, reverse}, p2:{...}, sync }) },
  toast(text, color?), banner(text) /* big zone name / CHECKPOINT */,
  showPause({ onResume, onRestart, onQuit }),
  showResults({ time, coins, coinsTotal, best, stars, hits, onAgain, onQuit }),
  hideAll()
}
```
All menu controls are real `<button>` elements (the phone d-pad focuses/clicks visible buttons). HUD: per-player
power meters on left (red) and right (blue) edges with a paddle icon, sync meter, timer, river progress bar with
boat marker + checkpoint ticks, coin count, speed. Readable on a TV. `cover.js` exports `rapidsRowCover()`
returning a 400x220 inline SVG string for the Exemoo menu card in the style of `public/covers.js`.

### js/main.js + index.html  (owner: Opus — stitching only)

---

# v2 additions (map 2, faster boat, moving obstacles, checkpoint resets)

## Speed
Paddling top speed is 2.5× v1: ~22 m/s with both paddling hard in sync (was ~9). Drift on current unchanged.

## Obstacles (both maps; map 1 only uses the v1 fields)
```js
track.obstacles[i] = {
  type,                       // v1: 'rock'|'log'|'buoy'; v2 adds e.g. 'barrel','croc','swinglog','lockgate','pillar','whirlpool','waterfall','spikes'
  shape: 'circle' | 'segment', // default 'circle' (x, z, r). 'segment' = capsule from (x1,z1) to (x2,z2) with radius r
  x, z, r, x1, z1, x2, z2,
  solid: true,                // false = no bounce (e.g. a whirlpool area)
  hazard: false,              // true = touching it WIPES OUT the crew → respawn at last checkpoint
  moving: false,              // true = track.update(t) rewrites x/z (and x1..z2) every frame and sets vx, vz
  vx: 0, vz: 0,
  ...v1 fields (rot, scale, seed, s, lat)
}
track.update(t)               // REQUIRED on every track (no-op for map 1): advances moving obstacles to time t (s since race start)
```
Boat: `onHit` cb also gets `hazard: boolean` and `type`; a hazard contact emits once and does not bounce (main
handles the respawn). `boat.reset(at?)` takes optional `{x, z, heading, s}` to respawn there with zero speed
plus a moment of drift, and a short (1.5 s) invulnerability to hazards after a respawn.

## Maps
`js/maps.js` (owner: Opus):
`MAPS = [{ id, name, blurb, sky, createTrack, buildScenery }]`. Map 1 = track.js, map 2 = track2.js.
Main respawns at the last passed `track.gates[i]` (position = track.sample(gate.s), heading from tangent),
or `track.start` if none passed.

## Sky
`js/sky.js` (owner: sky agent) exports `makeSky(scene, preset /* 'day' | 'sunset' | 'jungle' ... */) -> { update(t, camera) }`
— replaces models.makeSky (models.js keeps its old one but main stops using it).
