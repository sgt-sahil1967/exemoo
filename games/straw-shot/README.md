# Straw Shot

Archery on a farm range for 1–4 players, all shooting at the same time. Each player points their phone
at the screen to steer their own coloured crosshair, holds the big Action button to draw the bow, keeps
their hand still so the sway settles, and lets go to shoot. Static game (no build step) served at
`/play/straw-shot/`. Canvas 2D graphics and Web Audio sound, all procedural. No image or sound files, no emojis.

## How a round plays
Five **ends** of **3 arrows** each, 24 s per end. All players share the same targets:

| End | Name | What's new |
|---|---|---|
| 1 | Warm Up | one big straw-bale target close by, no wind |
| 2 | Near and Far | a near bale and a small far bale, light wind |
| 3 | Hay Cart | a bale on a cart sliding along a rail (lead your shot), plus a far bale |
| 4 | Windy Field | three bales at mixed distances, strong gusting wind |
| 5 | Balloon Finale | a fast cart bale, wind, and balloons floating up (5 points each) |

- **Scoring by ring:** gold 10, red 8, blue 6, green 4, white 2. Hitting the straw outside the
  painted rings: 1. Balloon: 5. Miss: 0. Most points after five ends wins; golds break ties.
- **Draw power:** the bow reaches full draw in about 1 s (the arc around your crosshair fills and
  flashes green). A weak draw makes the arrow drop low. Letting go below 20 % puts the arrow back.
- **Sway:** while drawing, the crosshair wobbles. It settles after about 1.3 s if your hand is
  still (a small sparkle shows when you're steady), grows when the phone moves, and comes back if you
  hold full draw for more than 4 s (tired arms).
- **Wind:** the windsock in the top-left shows the direction and strength (0–10). Wind pushes arrows
  sideways, more for far targets and weak draws, so aim a little into it. Straw bits blow across the sky.
- **Flight:** arrows fly with an arc and take 0.3–1.1 s to arrive, so aim ahead of moving targets.
- The end finishes when everyone has shot (or time runs out). A scorecard shows each player's end points,
  then the next end starts. After end 5: FINISH, results podium, Play again / Change players / Exit to Exemoo.

## Controls
**Phone** (`swing` layout): hold the phone like a remote with the top edge pointing at the screen.
Turning left and right and tilting up and down moves your crosshair (about ±26° covers the screen
width, ±16° the height). Hold **Action** to draw, release to shoot. **Recenter** makes where you are
pointing now the middle of the screen. Aim is read from the orientation quaternion relative to the
recentered pose, so it does not drift. If the phone is held upright with the top pointing at the
ceiling when it recenters, the back of the phone is used as the pointer instead. Phones that only send
gyro rates fall back to integrating the gyro, like the Exemoo menu pointer. Aim is smoothed (heavier
when nearly still, lighter when sweeping). The phone buzzes at full draw, on release and on hits.

**Keyboard** (each player):

| Player | Aim | Draw / shoot |
|---|---|---|
| P1 red cow | W A S D | Space (hold, release) |
| P2 blue pig | I J K L | U |
| P3 green sheep | Arrow keys | Enter |
| P4 yellow chick | T F G H | R |

The crosshair moves more slowly while drawing, and moving while drawing makes it sway more.
P2–P4 join on keys by pressing their shoot key in the lobby. Esc or P pauses.

**CPU rivals** fill empty slots (toggle in the lobby). They pick a target, lead moving ones, partly
allow for wind and miss by a random amount based on their skill.

## Players and phones
From the shared party kit: P1 is the phone the Exemoo shell already paired (`connectExemoo`, layout
`swing`). P2–P4 pair their own phone in the lobby by QR / PIN (`ScreenLink` rooms
`straw-shot.room.p2..p4`), like Rapids Row. Opened outside the shell, P1 also gets a PIN room.

## Files
| File | What |
|---|---|
| `index.html` | page shell (canvas + UI layer, fonts) |
| `game.js` | the archery game: aiming maths, bow draw / sway, arrows, targets, wind, balloons, ends, scoring, CPU, drawing |
| `party.js` | party kit copy (players and pairing, title + how-to, lobby, 3-2-1 countdown, pause, FINISH, results, replay, exit). Changed from the kit: each player has up / down keys too (`W A S D` + Space and so on), the held Action state is passed to `game.packet(p, pkt, held)`, and archery how-to icons (`aim`, `bow`, `target`, `wind`) are added |
| `art.js` | party kit copy, unchanged: farm animals, outlines, particles, backdrop |
| `sfx.js` | party kit copy, unchanged: synth one-shots and the music loop |
| `party.css` | party kit copy, unchanged |
| `INTEGRATION.md` | landing card, cover, README rows and shell settings for the coordinator |

Tuning constants are at the top of `game.js` (`AIM_YAW`, `AIM_PITCH`, `DRAW_TIME`, `MIN_POWER`,
`FATIGUE_AFTER`, `ARROWS`, `END_TIME`, ring points) and the `ENDS` table. Tested with the keyboard and a
headless run through all five ends; not yet tried on real phones, so the aim range and sway thresholds may need a pass.
