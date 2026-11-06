# Barn Raiser

An original Exemoo party game for 1–4 players, played **with the laptop camera**. A hay-loft crane runs
along a girder above the barn. Your **hand** steers the crane's trolley left and right, the load swings
on its rope beneath it, and a **gesture** drops it onto the tower growing out of the barn roof.

- Overhangs are **sliced off**, so every sloppy drop leaves a narrower top to land on.
- A **perfect** drop (centred within a few units) keeps the full width, chains a streak bonus and,
  from the third perfect in a row, grows the bale back a little.
- Off-centre drops make the tower **wobble** for a moment, so the target sways.
- Every 5th load is a **snooze crate** with a sleepy farm animal inside: land it for a bonus
  (double if perfect). Floors are flagged every 5.
- From floor 8, **wind gusts** push the load. Each new load arrives with a swing that grows with height,
  and the rope damps less the higher you build: time the release when it passes over the tower.
- A load that misses the tower entirely tumbles off and costs one of **3 tries**. A turn ends after
  3 misses or 45 seconds. The camera scrolls up with the tower and the sky turns to sunset and stars.

**Scoring:** each floor is worth 10 + its floor number; perfect +20 (+10 per streak step, up to +60);
snooze crate +30 (+60 if perfect). Highest score after everyone's turn wins. The dashed BEST line
shows the tallest tower this session.

## Turns (hot seat)
The shell's camera tracks one body, so players take **turns**: P1 builds, then P2, and so on. Before each
turn a card names the player ("Blue Pig's turn") with a 3-2-1, so the next person can step in front of
the camera. CPU rivals (lobby toggle) take their own turns. Results show floors and points per player.

## Controls
| Input | Steer | Drop |
|---|---|---|
| **Camera** (shell camera assist) | move your steering hand (the shell's tracked hand, right by default) left / right, mirrored like a mirror | **raise your other hand** above your head, or **jab** the steering hand down fast |
| **Phone** (`swing` pad, any player) | tilt the phone left / right (roll) | **Action** button |
| **Keyboard** | hold your left / right keys (P1 A/D, P2 J/L, P3 arrows, P4 B/M) | your action key (W, I, Up, N) or **Space** |

Priority: keys you are holding win for a moment, then the camera when it sees your hand, then phone tilt.
A player without a phone of their own can use a shared phone (the shell phone) on their turn.
**Recenter** (phone) sets the middle for both tilt and the camera hand. Esc / P pauses.

The bottom-left **camera panel** shows what the camera reads: a mirrored stick figure, your steering hand
(ring in your colour), the free hand (turns yellow when raised) and the dashed "raise above here" line,
with a status line: *Hand tracked*, *Show your hand*, *Step into view*, *Camera is off* or, outside the
shell, *Camera works inside Exemoo*. Below it a bar shows the trolley target and its source
(HAND / TILT / KEYS / CPU). With no camera the game plays fully on tilt or keys.

Camera: in the shell the title screen has a **Camera: On/Off** button (it calls `exemoo.setCamera`),
and if no pose arrives within 2.5 s of loading the game asks the shell once to turn camera assist on.

## Files
| File | What |
|---|---|
| `index.html` | page shell: canvas + UI layer, fonts |
| `game.js` | the game: hand/pose mapping and gestures, crane trolley + rope pendulum, slicing, scoring, turns, CPU, all drawing (barn, bales, crates, crane, sky, camera panel, scoreboard) |
| `party.js` | party kit copied from `games/shake-freeze` (title + how-to, lobby with per-player PIN/QR, countdown, pause, results, exit). Two hooks added: `game.titleButtons()` and `game.onAct()`, plus three how-to icons (camera, raise, bale) |
| `art.js`, `sfx.js`, `party.css` | kit copies, unchanged (cartoon animals and helpers, Web Audio synth + music, screens) |
| `INTEGRATION.md` | landing card, cover, table rows and shell settings for the coordinating session |

All graphics are Canvas 2D and all sound is synthesised. No asset files, no emojis.
