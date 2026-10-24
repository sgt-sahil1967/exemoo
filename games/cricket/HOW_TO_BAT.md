# How to bat (camera mode)

Everything below is read straight from the code (`js/batcam.js`, `js/physics.js`, `js/main.js`). Stand **facing the laptop** and hold an imaginary bat in both hands. The game only watches your **hands** (the midpoint of your two wrists).

## Left and right, once and for all

The camera image is mirrored like a mirror, so **your right hand is on the right of the screen**. The game's field uses the same convention: **screen right = off side (+), screen left = leg side (−)**, 0 = straight back past the bowler.

| You move your hands toward... | The ball goes... |
|---|---|
| **Your right / screen right** | **Off side** (cover, point, cut, third man) |
| **Your left / screen left** | **Leg side** (on drive, midwicket, pull, fine leg) |
| **Down** or **up** (no sideways) | **Straight** (down = along the ground, up = in the air) |

Up and down both count as "forward". There is no "backwards" shot: down and up give the same direction, only the lift differs.

## Setup

- Stand about **2 m back** so your head, both arms and both hands are in the frame all the time. Wrists that leave the frame or blur are only guessed for 0.2 s (`COAST_MS`, batcam.js:24).
- **Both arms visible**: shoulders, elbows and wrists are tracked. Face the camera square-on; side-on shoulders overlap and the game falls back on torso length for your scale.
- Good, even light on you, a plain background, sleeves that contrast with the wall. Blurred wrists are the main cause of lost swings.
- **Rest position matters.** A stroke is measured from the point where your hands *left rest*. Hold your hands in a ready position around **chest height** between balls, so you have room to go both down and up. If your hands rest by your hips, nearly every move is "up", and up means loft.
- Distances are measured in **body widths** (your shoulder width), so it does not matter how far from the camera you are, only that you stay in frame.

## The three controls

### 1. WHERE the hands go = direction and loft

The stroke is the line from where your hands left rest to the **furthest point they reach** (`#refine`, batcam.js:222). Call the sideways part `dx` (right = +) and the vertical part `up`.

- **Direction** (`strokeIntent`, batcam.js:131): `atan2(dx, forward)` where forward = `|up|`. Up or down both count as forward. If the stroke is mostly sideways (sideways share above 50%, full effect at 75%), the forward part is squashed by up to 65%, so cuts and pulls are pushed **squarer** than the raw angle. A purely sideways move is 90 degrees (point / square leg). Max from hands alone is about 90 degrees; going finer than that comes from mistiming (below).
- **Lift (loft)**: `(rise - 0.5) / 0.4` for an upward stroke, 0 for a downward one, where rise is the upward share of the stroke (sideways strokes count it at 60%). The shot is **lofted when lift is at least 0.35**, which means the hands travel about **45 degrees or more above horizontal** (a flat cut or pull that drifts up a little stays on the ground). A straight-up stroke is lift 1.0.

Quick reference (ratio `dx : |up|`, positive up = hands going up):

| Stroke | Direction | Lift |
|---|---|---|
| straight down | 0 (straight) | 0, ground |
| down at 45 deg right | +0.79 rad (45 deg, cover) | 0, ground |
| down at 45 deg left | -0.79 rad (on drive) | 0, ground |
| flat right | +1.57 rad (square, point) | 0 |
| flat left | -1.57 rad (square leg) | 0 |
| straight up | 0 | 1.0, lofted |
| up at 45 deg right | +0.79 | 0.9, lofted |
| up at 45 deg left | -0.79 | 0.9, lofted |

The shot name shown in game (main.js:454) comes from the final direction, including the timing push:

| Final direction (rad / deg) | Name |
|---|---|
| below -1.85 (about -106 deg) | Leg glance |
| -1.85 to -1.10 | Pull |
| -1.10 to -0.55 | On drive |
| -0.55 to +0.40 | Straight drive |
| +0.40 to +1.15 | Cover drive |
| +1.15 to +1.95 | Cut |
| above +1.95 | Late cut |

Lofted versions are named "Lofted ...". A block is "Forward defence" within 0.5 rad of straight, otherwise "Soft push".

### 2. HOW FAR and HOW FAST = power

`power = 0.55 * clamp((length - 0.3) / 1.5) + 0.45 * clamp((peak - 2) / 8)` (batcam.js, `#refine`)

- `length`: how far your hands travel (body widths) from rest to the furthest point reached.
- `peak`: your hands' top speed in body widths per second.
- Full power 1.0 comes from a **full, brisk swing: about 1.8 body widths of travel at about 10 body widths per second**. Use your whole arms, not just the wrists. A gentle push (well under a body width, slow) stays below 0.3.
- **Power under 0.3 is a block** (physics.js:60): the ball is only pushed, `4 + 14 * power * ...` m/s.
- Exit speed for a real shot: `(15 + 21 * power) * (0.4 + 0.6 * quality^2)` m/s (physics.js:65). Perfect power-1 hit is 36 m/s; power 0.6 is 27.6 m/s.
- The hands must exceed **3.5 body widths per second** to count as a swing at all (`SWING_ON`, batcam.js:27). Slower drifting is ignored, and so is a wiggle that never gets that fast. Hands count as "at rest" below 1.6.

### 3. WHEN = timing

Covered in full below. Short version: the camera does not time the ball against your **hand arriving**, it times it against **when you started**. Contact always happens **0.2 s after your swing begins**.

## Shot table

All of these start from a ready position with hands at rest around chest height, facing the screen. "Screen" directions are what you see on screen, which equals your own left and right because the image is mirrored.

| Shot | Hand path (start to finish) | Speed | Where it goes | Common mistakes |
|---|---|---|---|---|
| **Straight drive** | Hands from your chest straight **down** to your belt, in front of your body | Firm, full swing (power 0.6+) | Straight, field angle -0.55 to +0.4. Ground ball | Drifting sideways turns it into a cover or on drive. Resting hands too low means you cannot go down, and any up move is a loft |
| **Cover drive** | Hands from your **left** shoulder, down and across to your **right** hip (about 45 deg down-right) | Firm, full | Off side, +0.4 to +1.15 (cover, mid-off) | Too flat becomes a cut. Too upright is a straight drive. Going up-right instead lofts it |
| **Square cut** | Hands from your left hip, **flat across to the right**, nearly horizontal, slightly down at most | Fast, wide | Square off side, +1.15 to +1.95 (point, gully) | Rising past about 45 deg lofts it into the air. Late timing pushes it further behind (third man), very late edges |
| **On drive** | Hands from your **right** shoulder, down and across to your **left** hip (about 45 deg down-left) | Firm, full | Leg side ahead of square, -1.1 to -0.55 (mid-on, midwicket) | Too flat becomes a pull. Too early drags it even squarer to leg |
| **Pull** | Hands from your right side **flat across to the left**, nearly horizontal, chest height | Fast, wide | Square leg side, -1.85 to -1.1 | Rising past about 45 deg makes it a lofted pull. Too early becomes a leg glance or inside edge |
| **Flick** (leg glance) | Same as a pull, short and quick, and a touch **early** (about 100 to 150 ms before the ball) | Medium to fast | Fine leg side, below -1.85, ground or lofted | Starting more than 180 ms early gives an inside edge behind you |
| **Lofted drive / six** | Hands from your hip or belt **up** to above the opposite shoulder. Straight up = lofted straight; up and right = over cover; up and left = over midwicket | Fast and big, timing must be close to PERFECT | Same direction as the matching drive, but in the air. Needs the hands to rise at least about 45 deg above horizontal | Anything but near-perfect timing: GOOD gives a high ball that lands short, MISTIMED climbs to about 55 deg and is caught. Too small a swing is just a loft that falls short |
| **Forward defence / block** | Short, gentle push of the hands **down and forward** (under about 0.8 body widths) | Slow but above the 3.5 body widths per second threshold | Dropped near the bat. Straight within 0.5 rad is "Forward defence" | Swinging too hard turns it into a drive. Moving too slowly means no swing is registered at all |

## Timing

The game compares **when your swing began** to **when the ball reaches the bat**:

- `contactAt = onset + 0.2 s` (`SWING_LEAD`, batcam.js). The lead is **fixed**: however hard you swing, your bat meets the ball 0.2 s after your hands leave rest.
- **Onset** is the moment your hands left rest (the game walks back up to 0.4 s to find it), not when you passed some line.
- So **start moving 0.2 s before the ball reaches the bat**: that is the moment the ball passes the blue **SWING!** line on the timing bar.
- **Only the first part of the stroke counts.** Direction, lift and power are read again at the instant the ball arrives (`judge()`, main.js:469), which is 0.2 s after you started. The rest of the follow-through is for show.
- The **latest** swing before the ball arrives is the one that counts, so a false start can be corrected.
- A quick backlift that then **turns into the real stroke** restarts the swing from the turning point (a reversal of more than about 120 deg after at least 0.4 body widths, at most twice, batcam.js:200). A backlift that does not reverse sharply (say, up then sideways) is read as one single stroke from where you started.
- A swing ends after 0.2 s at rest or 0.8 s total, then the detector ignores you for 0.15 s. Hold still between balls.

### Timing grades (`GRADES`, physics.js:22)

Error = your contact time minus the ball's arrival. Negative = early, positive = late.

| Error | Grade | What happens |
|---|---|---|
| up to 45 ms | **PERFECT** | Full pace, aimed true (quality 1 within 30 ms) |
| up to 95 ms | **GOOD** | Pace drops to about 63%, aim wobbles a little |
| up to 180 ms | **EARLY** / **LATE** | Pace falls to about 40 to 60%. **Early drags the ball to the leg side, late steers it to the off side**, by `2.5 rad per second of error`, up to 0.45 rad (26 deg). More random aim |
| up to 250 ms | **EDGED** | Deflected behind square, on the side your hands were heading (60% of your direction plus 1.3 to 1.9 rad). Early: inside edge to the leg side. Late: outside edge to point, gully or third man. Speed 9 + 9 * power, goes up 8 to 30 deg: often caught behind |
| beyond 250 ms | MISS | Ball goes through to the keeper, or bowls you |

Contact quality is `1 - (|error| - 0.03) / 0.17` (clamped 0 to 1). Pace multiplies by `0.4 + 0.6 * quality^2`, so mistimed shots lose pace fast. Aim jitter is plus or minus `0.03 + 0.15 * (1 - quality)` rad, which is under 2 deg at PERFECT but about 10 deg when mistimed.

What distance means (measured with power 1.0, straight, `predictPath`):

| Error | Ground drive | Lofted |
|---|---|---|
| 0 ms | four | **six** |
| 45 ms | in play, long | **six** |
| 95 ms | about 40 m | about 68 m, lands, in play |
| 140 ms | about 25 m | about 39 m, high ball, catchable |

### The timing bar (right side of the screen)

The bar on the right edge shows the ball travelling toward the bat. The **green band is the PERFECT window**: your swing's contact time should land inside it as the ball reaches it. Because contact is predicted as "start + lead", the bar tells you the same thing as the formula above: **start your move when the ball is about a quarter of a second away from the green band**. If you are consistently early or late, shift your start by that much. (Early shows as a ball marker still above the band at contact; late as past it.)

## Fielders and runs (what happens after contact)

- Every ball hit is predicted along its path (`predictPath`, physics.js:123). Each of the 9 fielders and the keeper gets a reaction time (0.3 s, keeper 0.12 s) and then runs at 7.4 m/s with acceleration 5 m/s squared (fielding.js:12).
- A ball in the air between 0.15 m and 2.5 m high can be **caught** (reach 1.25 m, or 2.3 m with a dive). The fielder who can reach the ball path first takes it. A catch is held about 94% of the time (diving 50%); a hard hit is held less (minus 2% per m/s above 22).
- A ball on the ground is stopped (reach 1.0 m, dive 2.3 m). Stops can be fumbled (4%, 15% if hit very hard, 30% if diving).
- If no one reaches it before the boundary (a circle of radius 64 m centred 10 m up the ground), it is a **four**, or a **six** if it is still in the air.
- Otherwise the batters run: the number of runs, up to 3, is how many fit before the throw reaches the keeper (3.4 s per run, 0.6 s start delay, 0.35 s margin).
- To score: hit **into the gaps** between fielders, hard, with good timing. Hitting a fielder is almost always "stopped" or "caught".

## Troubleshooting

**"It went the wrong way"**
- Remember the mirror: **screen right is off side**, whatever it looks like on your own body. Move your hands toward the right of the screen to hit to the right.
- You were **early** (ball drags to leg) or **late** (ball steers to off) by up to 26 deg on top of your aim. Fix your timing before you fix your direction.
- The game reads the stroke from where your hands **left rest**, to the furthest point they get **at the instant of contact**. A big back swing first, or hands resting low, changes the measured line.
- Only the first 0.2 s of your swing counts, not the follow-through.

**"It always edges"**
- Edged means you were **more than 180 ms** off. The ball ignores your aim and goes behind: late edges go off side behind (third man, slips), early edges go to fine leg.
- Fix: start your swing as the ball passes the SWING! line (0.2 s before it reaches the bat). If edges go to the off side, start a bit **earlier**; if they go fine on the leg side, start a bit **later**. The tick on the timing bar shows exactly how far off you were.

**"Nothing happens"** (no shot, or the ball goes through)
- Hands must move faster than 3.5 body widths per second. Slow drifts are ignored.
- Are both arms (and wrists) in view? The status chip at the bottom right shows whether the camera is live. Poor light blurs wrists.
- You must be the right way round: squarely facing the camera, in frame, standing still before the ball.
- If your swing ends (rests for 0.2 s) before the ball arrives, wait for it to come close, then swing again; there is a 0.15 s dead time after each swing.
- More than 250 ms off in either direction is a MISS even if the swing was seen.
- No camera? Click or press Space; the mouse position picks the direction.

**"It just blocks"**
- Power under 0.3, from a short or slow stroke. Make your hands travel further and faster (about 1.8 body widths at 10 body widths per second for full power).

**"It goes up into the air"**
- Your stroke went more than about 45 deg above horizontal. Keep drives level or downward. Rest your hands higher so you have room to swing down.

**"It feels random"**
- Watch the timing bar: start on the SWING! line and read the tick after each ball. Contact is always 0.2 s after your hands start, so timing is learnable.
- Mistimed hits have up to 10 degrees of random scatter, plus the 26 deg early/late push. Only PERFECT/GOOD are accurate.
