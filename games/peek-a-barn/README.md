# Peek-a-Barn

A fast, original party memory game for 1–4 players. The board is a big red barn wall covered in little
barn doors; behind each door hides a farm picture (apple, carrot, corn, pumpkin, egg in a nest, milk bottle,
cheese, sunflower, strawberry, mushroom, horseshoe, cow bell, hay bale, watermelon, grapes). Everything
is drawn procedurally with Canvas 2D and every sound is synthesised with Web Audio. No image or sound files,
no emojis. Static game, no build step, served at `/play/peek-a-barn/`.

## How a round plays
1. **Peek.** After the 3-2-1 countdown every door swings open for 2.6 s. Memorize what you can.
2. **Turns.** Players take turns in order (P1 red cow, P2 blue pig, P3 green sheep, P4 yellow chick). On your
   turn your cursor appears on the board; move it and open two doors. You have **7 seconds** per pick
   (at least 4 s are left for the second door). Run out of time and the turn passes ("TOO SLOW!").
3. **Pairs.** A pair scores **100** and you go again. Each extra pair in the same turn adds **+50**
   (150, 200, 250 ...): a streak. One secret pair is **golden** (gold card face) and scores **double**.
   Matched doors fly into your panel.
4. **Barn Breeze.** Every 4 misses a gust swaps 2–3 pairs of closed doors. They slide across the board
   with a blue glow, so sharp eyes can follow them.
5. When the last pair is found: FINISH, then the results / winner screen (score, pairs, best streak) with
   Play again, Change players and Exit to Exemoo.

Board size: 1 player 5x4 (10 pairs), 2 players 6x4 (12 pairs), 3–4 players 6x5 (15 pairs).

## Controls
| | Phone (`remote` pad) | Keyboard |
|---|---|---|
| Move the cursor | d-pad | arrows or W A S D (shared: whoever's turn it is) |
| Open a door | big **GO** button | Space or Enter |
| Pause | Pause (or Back) | Esc or P |
| Menus | d-pad + GO | Tab / Enter, or the mouse |

Moving skips over empty spots. Pressing on someone else's turn just wiggles your panel.
In the lobby P2–P4 join on the keyboard with their join key (`I`, `↑`, `N`); P1 is always in.
"CPU rivals" fills empty slots. CPUs remember doors they have seen (imperfectly: they recall fewer doors
from the opening peek, slowly forget, may lose track of doors moved by a Barn Breeze, and sometimes slip).

## Phones
In the Exemoo shell, P1 is the phone the shell already paired (`connectExemoo({ layout: 'remote', stream: false })`).
P2–P4 pair their own phone in the lobby by QR / PIN (`ScreenLink` rooms `peek-a-barn.room.p2..p4`, pad URL
`/pad?pin=…&layout=remote&title=…`). Opened outside the shell, P1 also gets a PIN room. The motion stream is
off: the game only needs button presses, so it works on any phone with no sensor permission.

## Files
| File | What |
|---|---|
| `index.html` | Page shell: canvas + UI layer, Lilita One / Baloo 2 fonts |
| `game.js` | The game: board, turns, timer, scoring, streaks, golden pair, Barn Breeze, CPU memory, all drawing including the 15 farm pictures (`drawPic`) |
| `party.js` | Party kit copy (players, pairing, lobby, countdown, pause, FINISH, results, replay, exit). Extended here: `game.layout` / `game.stream` choose the pad layout, phone d-pad and GO buttons reach `game.press` / `game.action` during the round, `game.key(code)` takes shared keyboard keys first, lobby shows each slot's join key, extra how-to icons (`dpad`, `cards`, `streak`) |
| `art.js` | Party kit copy, unchanged: ink-outlined drawing helpers, farm animals, particles, backdrop |
| `sfx.js` | Party kit copy, unchanged: synth one-shots and the music loop |
| `party.css` | Party kit copy; only change: the kit's HUD pill is hidden (the game draws its own turn strip) |
| `INTEGRATION.md` | Landing card, cover SVG, table rows and shell settings for the coordinating session |

## Tuning
Constants at the top of `game.js`: `TURN_TIME`, `SECOND_PICK_MIN`, `PEEK_TIME`, `SHOW_MISS`, `PAIR_POINTS`,
`STREAK_BONUS`, `BREEZE_EVERY`, `CPU_PEEK_RECALL`, `CPU_FORGET`. Tested in a desktop browser with keyboard
and CPU rivals (full rounds to the results screen, wide and portrait layouts); not yet tried with real phones.
