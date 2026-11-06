# Haystack Hideout

Original Exemoo party minigame for 1–4 players: a farmyard hide-and-seek that tests memory and speed.
Static game (no build) served at `/play/haystack-hideout/`, Canvas 2D, Web Audio synth. No image or
sound files, no emojis.

## Concept
Farm critters (calves, piglets, lambs, chicks, each wearing a pink, purple, orange or teal scarf) run
into the yard, stand in front of their hiding spots for a few seconds (haystacks, barrels, bushes,
crates, little barn hutches with double doors, giant pumpkins), then dive in. The spots shuffle, the
farmer calls out one critter ("FIND THE Teal-scarf Chick") with its picture, and every player races to
point their coloured cursor at the right spot and press Action.

- **First find scores 3** (+1 FAST bonus if within 3 s), second 2, later finds 1.
- **Wrong pick**: 1.8 s lockout, and the spot pops up for everyone to see what was really there
  (an empty spot shows a question mark). CPU rivals learn from these peeks too.
- After the first find the others have at most 4 more seconds; each hunt also has a 10–11 s limit.
- **Seven hunts**, harder each time: 4 → 9 spots, 0 → 6 swaps (faster each hunt), shorter look time,
  more decoys that share the target's animal or scarf colour, fewer cover types (look-alike spots), and
  on hunts 4, 6 and 7 the **lights go out**: the yard goes dark and each player only sees what is
  inside their own flashlight beam.
- Most points after seven hunts wins. Results show points and how many critters each player found.

Flow (from the shared party kit): title + how-to → lobby (pair phones, join on keys, CPU rivals) →
3-2-1 → hunts → FINISH → results / winner → Play again, Change players, Exit to Exemoo. Pause with
Esc / P / phone Pause.

## Controls
| | Phone (`swing` layout) | Keyboard |
|---|---|---|
| Move cursor | Sweep the phone left/right and tilt up/down (gyro rate, same axes as the Exemoo menu pointer; smoothed) | P1 `W A S D`, P2 `I J K L`, P3 arrows, P4 `T F G H` |
| Pick spot | Action | P1 `E`, P2 `O`, P3 `/`, P4 `Y` |
| Recenter | Recenter (cursor jumps back to the middle) | n/a |
| Pause | Pause | `Esc` or `P` |

P1 can also play with the **mouse** (move to aim, click to pick). P2–P4 join on keys by pressing their
pick key in the lobby. Phones: P1 is the phone the Exemoo shell already paired; P2–P4 scan their own
QR / PIN in the lobby (`ScreenLink`, rooms `haystack-hideout.room.p2..p4`). Your cursor buzzes lightly
when it moves onto a spot.

Pointer tuning at the top of `game.js`: `SENS_X` (degrees of sweep across the screen width, 70) and
`SENS_Y` (degrees across the height, 45). Difficulty per hunt is the `LEVELS` table. Testing aid:
`/play/haystack-hideout/?hunt=7` starts a match at the last (hardest, dark) hunt.

## Files
| File | What |
|---|---|
| `index.html` | Page shell: canvas + UI layer, fonts |
| `game.js` | The game: hunts, layout, shuffles, picking and scoring, CPU rivals, phone/keys/mouse cursors, flashlight darkness, all hideout and yard drawing |
| `party.js` | Party kit copy, **extended**: 5 keys per player (up/down/left/right/pick), lobby key hints, `hide` and `point` how-to icons, HUD "hot" toggle fixed for games without a round timer |
| `art.js`, `sfx.js`, `party.css` | Party kit copies, unchanged (cartoon animals, particles, backdrop; synth sounds and music; screen styles) |
| `INTEGRATION.md` | Landing card, cover SVG and shell settings for the coordinating session |

Not yet tried on real phones, so `SENS_X` / `SENS_Y` may need a pass.
