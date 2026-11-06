# Barn Blink

An original 1–4 player **reaction-time** party game for Exemoo. Eight short reflex rounds in the
barnyard: everyone stares at the signal board by the barn, waits through a tense random pause, and hits
their buzzer the instant the right cue appears. Every reaction is shown in milliseconds. Jump early and
it is a false start.

Static game (no build step), Canvas 2D graphics and Web Audio sound, all procedural. No image or sound
files, no emojis. Served at `/play/barn-blink/`.

## Rounds
Each match is 8 rounds: round 1 is a plain lamp, rounds 2–7 are a shuffled mix (no type twice in a row),
round 8 is the **Final Showdown** (lamp, double points).

| Round | Cue | Traps |
|---|---|---|
| **Green Means Go** | lamp turns from red to green (silent) | none, just a random 1.8–5.2 s wait |
| **No Fakes** | lamp turns green | the lamp flashes yellow now and then |
| **Only the &lt;animal&gt;** | the target animal (cow, pig, sheep or chick, shown in the intro) pops out of the hatch | 1–4 other animals pop out first |
| **Only &lt;colour&gt;** | the sign flips to the target colour; each colour also has its own shape (red circle, yellow triangle, blue square, green star) | 1–4 other colours first |
| **Ears Only** | the rooster crows (the board only shows CROW! 450 ms later, so ears win) | clucks, moos and oinks |
| **Flick It** | lamp turns green: **phone players must flick the phone** (gyro rate over 300 deg/s); keyboard players press their key | flicking while waiting is a false start; the phone's Action button does nothing this round |
| **Feel It** | every phone buzzes (haptic); the board shows BUZZ! 600 ms later | none. Only picked when every human player is on a phone |

## Scoring
- Fastest valid reaction: **5**, then **3**, **2**, **1** (doubled in the Final Showdown).
- **False start** (any press while waiting, or faster than 90 ms after the cue): **minus 2**, out for the round.
- No reaction within 1.6 s of the cue: TOO SLOW, 0.
- Final ranking by points; ties are broken by each player's best reaction time. The results screen shows
  points and best ms.

The round ends early as soon as everyone has reacted (or false-started). Pausing during a wait or cue
replays the round from its intro (a false start already made keeps its penalty), so a pause can never
be used to peek or to dodge a penalty.

## Controls
| | Phone (swing pad) | Keyboard |
|---|---|---|
| React | big **Action** button (flick the phone in Flick rounds) | P1 `W`, P2 `I`, P3 `↑`, P4 `N` |
| Join (lobby) | scan the slot's QR / type its PIN | press your action key (P2–P4) |
| Pause | Pause | `Esc` or `P` |
| Menus | d-pad + Action | mouse, Tab / Enter |

P1 is the phone already paired with the Exemoo shell; P2–P4 pair their own phone in the lobby
(`ScreenLink` rooms `barn-blink.room.p2..p4`), exactly like the other party games. "CPU rivals" fills
empty slots with CPU animals (reaction ~210–420 ms, and they occasionally fall for a trap).

Phone latency note: reactions are timed on the TV when the press arrives, so a phone adds its network
delay (typically 20–60 ms on the LAN). Everyone on phones is fair; mixing phones and keyboards slightly
favours the keyboard.

## Files
| File | What |
|---|---|
| `index.html` | page shell (canvas + UI layer, fonts) |
| `game.js` | the game: round sequence, cues and traps, timing, scoring, CPU, drawing (board, rooster, barn, buzzers), sounds (crow, cluck, moo, oink, heartbeat) |
| `party.js` | party kit copy from `games/shake-freeze`: players and pairing, lobby, 3-2-1 countdown, pause, FINISH, results / winner, replay, exit. This copy adds the `ear` and `buzz` how-to icons |
| `art.js` | party kit copy: cartoon animals, ink outlines, particles, farm backdrop |
| `sfx.js` | party kit copy: Web Audio synth one-shots and the music loop (music stops during waits so sound cues are clear) |
| `party.css` | party kit copy: title, lobby, HUD, countdown, results styles |
| `INTEGRATION.md` | landing card, cover, README rows and shell settings for the coordinating session |

Tuning constants are at the top of `game.js` (`PTS`, `FALSE_PEN`, `WINDOW`, `MIN_MS`, `FLICK_RATE`,
`VISUAL_DELAY`). Not yet tried on real phones, so `FLICK_RATE` may need a pass.
