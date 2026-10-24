# Cricket v2 — camera batting, phone as remote

Goal: bat with the laptop camera like Sportacle Cricket (livewebtennis.com/cricket). Shots are not picked
from a fixed list: **where the hands go** sets the direction, **how far and fast they go** sets the power,
and **when they go** (against the ball) sets the timing. Only well-timed hits go far. The phone becomes a
remote: menus, vibration and bat sounds. Fielders actually field.

## What Sportacle does (from their public page and bundle)

- **Model:** MediaPipe `pose_landmarker_lite` (≈5.5 MB, WASM in the browser). No custom model. Exemoo
  already loads the same model, so **no training is needed**.
- **Arm tracking:** shoulder → elbow → wrist chains for both arms. Limb lengths are learned per player, and when
  a fast swing blurs the wrist or elbow, the joint is coasted from its last angle and angular speed for ~0.1–0.2 s.
- **Shot intent from the wrist's stroke in the image:** direction = sideways vs. forward motion (mostly
  sideways strokes are pushed squarer), lift = how much of the stroke goes up, speed = stroke length
  relative to the frame. Intent is refined for ~0.12 s after the swing starts, until just before contact.
- **Timing:** contact time = swing onset + a stroke lead that shrinks for faster swings; error against the
  ball's arrival gives PERFECT / GOOD / EARLY / LATE / EDGED and a contact quality that scales the hit.
- **No calibration step.** Their fielding computes the ball path and sends a fielder who can reach it
  (pickup, fumble, throw, catch), and a "captain" moves fielders toward the batter's favourite areas.

We rebuild this approach ourselves (no copied code or art).

## Steps

### 1. Camera batting engine — `games/cricket/js/batcam.js` ✅ done
- Shell camera (`public/js/camera.js`) also sends raw (unsmoothed, mirrored) 2D shoulders, elbows, wrists
  and hips with visibility, plus the frame aspect, so the game can do its own tracking without lag.
- `ArmTracker`: both arms; learns upper-arm and forearm lengths; coasts a missing wrist/elbow for ≤ 0.2 s
  from its angular speed; hands point = mid-wrists (both hands on the bat).
- `SwingDetector`: hand speed in shoulder-widths/s; onset = where the hands left rest; intent =
  `{direction, lift, power, onsetAt, contactAt}` from the stroke vector, refined for 120 ms.
- Unit tests with synthetic landmark streams (straight, cover, pull, lofted, block, jitter, dropped frames).
- Also handled: a quick backlift that starts a "swing" restarts it from the turning point into the real
  stroke; one-frame jumps (tracking glitches) re-baseline instead of swinging; a swing ends only after 0.2 s
  at rest; the latest swing before the ball arrives is the one that counts.
- Wired into the game: camera swings drive the bat; the phone no longer swings (pad layout `remote`).
  The old phone-swing path, aim calibration and `aim.js` are gone (part of step 6).

### 2. Timing and dynamic shots ✅ done (`js/physics.js`, tested)
- Contact time = onset + lead(speed). Timing error → grade and quality (PERFECT ≤ 50 ms … EDGED).
- Ball exit velocity from direction, lift, power and quality: **only perfect hits go far**; early shots are
  dragged leg-side and lose distance, late shots are steered off-side and lose distance; edges fly fine.
- Blocks (slow, low strokes), drives, lofts, cuts and pulls emerge from the numbers; names are only labels.
- Camera latency compensation (frame age) so timing is fair.

### 3. Phone as remote, vibration and bat sounds ✅ done (`public/js/pad-sound.js`, pause)
- Pad layout `remote` in cricket (menu navigation, Action, Pause); the phone no longer starts swings.
- Graded haptics on contact (perfect / good / edge / wicket / boundary).
- New pad message `{t:'sound', name, gain}`: the phone plays a synthesized bat crack (WebAudio, unlocked by the
  Start tap), so the sound comes from the "bat" in your hand. The screen plays crowd and ball sounds.

### 4. Fielding AI ✅ done (`js/fielding.js`: acceleration, catches, drops, fumbles, keeper, captain)
- Predict the ball path (bounces, roll, friction) once at contact.
- For each fielder: earliest point on the path they can reach (run speed, reaction time); pick the best.
- Catch if they reach an airborne ball below catching height; otherwise intercept, pick up (fumble chance on
  hard hits), throw to the keeper. Runs = how many the batter completes before the throw arrives.
- Captain: after repeated shots into one area, move a fielder there; keep a gap open elsewhere.

### 5. Graphics — player models ✅ done; the rest on hold (as asked)
- ACES tone mapping, soft shadows, sky/environment lighting, mowing-stripe grass and pitch textures (generated in
  code), stadium stands and crowd, better ball trail, impact particles and camera moves.
- ✅ Player models, v2: Quaternius "Casual Character" (CC0, Ultimate Animated Character Pack) — dressed people
  with faces, hair, shirt, trousers and shoes; the kit recolours the model's own materials. Rig profiles let the
  game drive either skeleton. (v1 below, the bare mannequin, was replaced.)
- v1 player models: Quaternius "Animated Base Character" (CC-BY 3.0, `games/cricket/models/`, credits in
  `models/CREDITS.md`). A smooth rigged human (≈8.5k vertices, Rigify skeleton) replaces the toy figures for all
  13 people on the field. The game's invisible driver skeleton keeps every pose, the run cycle and the bat-handle
  IK; each model bone follows its driver joint (rest-aligned retargeting), with a second IK pass on the model's
  arms so the gloves stay on the handle. Kits are vertex colours by body part (shirt, trousers, skin, shoes);
  helmets, caps, hats, pads and gloves are refitted to the model's measured head. Falls back to the toy figures
  if the model can't load. (No Gemini generation was needed: suitable free assets were found.)
- ✅ Lighting: image-based light from an outdoor scene (sky, sun disc, grass bounce) instead of the indoor preset;
  a warmer, lower afternoon sun with 4096 px shadows on desktop; a cool rim light from the far end.
- ✅ Ball trails (`js/trail.js`): camera-facing ribbon over the last 0.35 s; faint white for deliveries, gold for
  PERFECT, white GOOD, grey EARLY/LATE, orange EDGED. The ball spins in flight.
- ✅ Gemini artwork (`scripts/gen-cricket-assets.mjs` → `assets/gen/`, loaded by `js/genassets.js`), generated with
  `gemini-3.8-flash` (the key has no quota for `gemini-3.1-pro-preview`): ball leather with stitched seam, MOO WILLOW
  bat sticker, two team crests (chest badges: blue for the batter, yellow for the fielding side), six sponsor boards
  in the second set of boundary slots. Re-run with `GEMINI_MODEL=gemini-3.8-flash node scripts/gen-cricket-assets.mjs --force`.
- ✅ Players v3: male ("Man in Long Sleeves") and female ("Woman Casual") Quaternius CC0 models, picked with the
  menu's Players: Men / Women setting (default men). A third rig profile drives their skeleton (feet are IK bones,
  so they're placed as well as turned).
- ✅ Night game (menu Time: Day / Night): dark sky with stars, four floodlight spotlights (one per tower, each casting
  a faint shadow; two on phones), lamp banks tilted at the field with halos, glowing crowd, stand banners and LED
  boards, night reflections. Floodlight towers redone for day too (rings, tilted lamp bank).
- ✅ Soft contact shadows under every player.
- ✅ Runs: each run is the full 20 m between creases; the batters set off at contact; a non-striker at the bowler's
  end backs up and runs the other way; the next ball waits until the runs are done.
- Gemini (`gemini-3.8-flash` only, fixed in the script): stand banners added to the generated set.
- On hold until asked: grass and pitch textures.

### 6. Clean-up and logging ✅ done
- Remove the phone swing path, aim calibration (`ShotMap`) and `PhoneSwing`.
- Keep the swing log (`POST /api/swings`, dev only) with the new intent numbers for later tuning.

### 7. Making batting learnable ✅ done
- ✅ Hand-tracking overlay (`js/handcam.js`): mirrored camera feed with arms, hands, a hand trail and the swing
  arrow, plus a flash of the grade after each ball (bottom right).
- ✅ Timing bar (`js/timingbar.js`, right edge): the ball runs down from BOWL to the SWING! line. Its windows come
  from `GRADES` in physics.js. After each ball it marks where you were and the grade.
- ✅ How to bat (`js/howto.js`, `HOW_TO_BAT.md`): the mechanics sheet with 9 shot cards and diagrams. It opens on the
  first visit and from the menu button or the H key.
- ✅ Consistent swing timing: contact is always 0.2 s after the swing starts (`SWING_LEAD`); before this the gap
  depended on swing speed. Power was rescaled so a full swing can reach 1. The swing's start no longer includes a
  slow backlift, which used to make shots early.
- ✅ Loft needs a deliberate rise (about 45° or steeper; sideways strokes count the rise at 60%), so cuts and pulls
  that drift up stay on the ground.
- ✅ Edges follow the swing: deflected behind square on the side the hands were heading, no longer fixed.
- ✅ A ball that goes by untouched says why: no swing seen, hands not in view, swing too slow, or N ms early/late.
- ✅ IMU logging (no effect on play yet): the phone streams motion in cricket plus a compass heading (`{t:'compass'}`:
  iOS `webkitCompassHeading`, Android `deviceorientationabsolute`). Each logged swing (`v: 4`) now carries `imu`
  features (`js/imu.js`: pitch change, earth-frame up / flat acceleration, gyro peak, heading), the raw `imuFrames`
  and `compass` samples. Practice button now cycles OFF → target zones → shot types; shot-type mode asks for
  DRIVE / LOFT / BLOCK before each ball and logs `label: {type, source: 'practice-type'}`. Next: fit loft / defence / direction thresholds on real swings, then fuse.

## Checks for every step
- `npm test` (unit tests for batcam and fielding maths).
- Browser run with simulated camera frames; real webcam check by the user.
