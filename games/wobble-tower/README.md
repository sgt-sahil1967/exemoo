# Exemoo party minigames

Three short, original party minigames for 1–4 players with phones in hand. Each is a static game
(no build step) served at `/play/<id>/`, drawn with Canvas 2D, with sound synthesised by Web Audio.
No image or sound files, no emojis.

| Game | id | Phone does | Keyboard (per player) |
|---|---|---|---|
| **Shake & Freeze** | `shake-freeze` | **Shake** to fill your milkshake; hold **still** when the lamp goes red | mash left / right keys, stop to freeze |
| **Wobble Tower** | `wobble-tower` | Held flat like a tray: **tilt** to balance an egg tower; big button **banks** it | hold left / right to tilt, action banks |
| **Flapjack Flip** | `flapjack-flip` | **Flick** the phone like a frying pan; snap strength = number of flips | hold action to charge, release on the target |

## Why these three
- **Different motions.** Exemoo's `swing` pad streams linear acceleration, gyro rate and orientation,
  plus a big Action button. Each game is built on a different one of those signals: acceleration energy
  (shake), orientation roll (tilt), peak gyro rate (flick). Nothing overlaps, so the trio feels varied.
- **Readable in one sentence**, rounds under a minute, and every player plays at the same time in their
  own lane, which is what makes party minigames work on one TV with 1–4 people.
- **Forgiving sensors.** None of them needs precise aim or camera tracking: shake and flick are
  thresholded energies, tilt is relative to "flat" (Recenter resets it). The camera was left out on
  purpose: the shell's camera tracks one body, which does not fit 4 simultaneous players.
- **Skill on top of the motion.** Shake & Freeze adds reaction (stop on red, with bluffs), Wobble Tower
  adds risk (taller tower = more points but harder to hold), Flapjack Flip adds calibration (exact flips).

## Shake & Freeze
Players whip milkshakes at the Milk Bar while the Gander (a goose in a sun hat) hums with her back
turned. Green lamp: shake. Yellow lamp and "Uh oh...": she is about to turn. Red lamp and "FREEZE!":
anyone still shaking after a short grace time spills 12 % of their glass. She sometimes bluffs. First
full glass wins at once; otherwise the fullest glass after 45 s.

## Wobble Tower
Each player's hen lays eggs onto the tray every ~2 s. The tower is an inverted pendulum: tilt toward the
lean to catch it. Gusts of wind push every tower at once. Banking a tower of n eggs scores
n(n+1)/2 (1, 3, 6, 10, 15, 21 ...), so tall towers are worth far more, but topple and they splat.
Eggs still on the tray at the bell count. 50 s round.

## Flapjack Flip
Six orders (1, 2 or 3 flips, the same for everyone). Flick the pan within 6 s: the peak rotation speed
sets the flips (about 450 deg/s = 1 flip, +330 deg/s per extra flip). Exact count and flat landing:
PERFECT 100 / GOOD 70; exact but crooked: WOBBLY 35; wrong count but flat: 30; messy 15; FLOP, TOO HIGH,
TOO SLOW: 0. The result shows the measured flips so players learn their snap.

## Shared kit (identical copy in each folder)
| File | What |
|---|---|
| `party.js` | Players and pairing, lobby, 3-2-1 countdown, pause, FINISH, results / winner, replay, exit |
| `art.js` | Cartoon animals (cow, pig, sheep, chick) with player-colour scarves, outlines, particles, backdrop |
| `sfx.js` | Synth one-shots (beeps, ding, splat, whistle, fanfare) and a lookahead-scheduled music loop |
| `party.css` | Title, lobby, HUD, countdown, banner, toast and results styles |

Players: P1 red cow, P2 blue pig, P3 green sheep, P4 yellow chick. In the Exemoo shell P1 is the
already-paired phone (`connectExemoo`, layout `swing`). P2–P4 each pair their own phone in the lobby by
QR / PIN (`ScreenLink` rooms `<id>.room.p2..p4`, pad URL `?pin=&layout=swing&title=`), like Rapids Row.
Opened outside the shell, P1 also gets a PIN room. Keys: P1 `A D W`, P2 `J L I`, P3 arrows `← → ↑`,
P4 `B M N` (left, right, action). P2–P4 join on keys by pressing their action key in the lobby.
"CPU rivals" fills the empty slots. Menus work with the phone d-pad + Action (`exemoo.nav`), mouse or
Tab / Enter. Esc or P (or phone Pause) pauses. Phone Recenter resets "flat" in Wobble Tower.

Tuning constants sit at the top of each `game.js` (`FREEZE_LIMIT`, `FILL_RATE`, `TOPPLE`, `MAX_TILT`,
`FLICK_START`, `PER_FLIP`). Not yet tried on real phones, so thresholds may need a pass.
