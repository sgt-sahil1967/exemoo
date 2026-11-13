# Bale Brawl

A two-fighter foam-bopper duel on a round stack of hay bales in the middle of a duck pond. The phone is the
bopper: its angle is the blade angle, a quick swing is a strike, and the big Action button held is guard. A
guard only stops a swing that crosses it (an upright bopper stops side slashes, a level one stops chops).
Every hit shoves the rival back; the first one off the bales gets wet. First to 2 rounds (or 3) wins.
Static game (no build step) served at `/play/bale-brawl/`. three.js from the import map, all art and sound
procedural, no emojis, no image files. Design contract: `PLAN.md`.

## Playing
- **vs CPU** (Easy / Normal / Hard / Champ) or **2 Players** (the second player pairs a phone with a PIN or
  QR in the lobby, or plays on the keys). Best of 3 or 5. Settings are remembered.
- A round lasts 45 s. If nobody falls in, **sudden death**: the outer bales drop away and hits shove harder.
- Both fall in at the same time: a draw, the round is replayed.

## Controls
| | Player 1 | Player 2 |
|---|---|---|
| Phone | point at the screen, swing to strike, hold Action to guard, Recenter re-aims | same (second phone, own PIN) |
| Swing right / left / up / chop | D / A / W / S | Right / Left / Up / Down |
| Diagonal swing | two keys within 60 ms | same |
| Guard (hold) | Space (blade upright; W / S = level; Q / E = diagonals) | Enter (Up / Down = level) |
| Mouse | move = blade, left-drag flick = swing, right button = guard (blade line from centre to pointer) | |

Shift while swinging = full power. Escape or P pauses, M mutes, R recenters.
Inside the Exemoo shell, Player 1 is the phone already paired; its d-pad and Action drive the menus.

## Files
`js/main.js` boot, loop and flow; `js/rules.js` pure `Match` (rounds, best of, clock, sudden death, draws);
`js/ui.js` + `ui.css` menus and HUD; `js/players.js` phones and key swords per player; `js/keys.js` keyboard
and mouse to `SwordIntent`. Engine side (`engine.js`, `combat.js`, `ai.js`, `world.js`, `fighter.js`, `fx.js`,
`audio.js`, `sword-input.js`, `constants.js`) is described in `PLAN.md`.

## Dev
- `?stub` runs `main.js` on `dev/stub-engine.js`, a flat 2D stand-in with the same engine interface (also
  used automatically while `js/engine.js` does not exist). `?debug` exposes `window.__bb`.
- `dev/ui-test.html` shows every screen, the HUD and the pop-ups without any engine.
- Tests: `/opt/homebrew/opt/node@24/bin/node --test server/test/bale-brawl-*.test.js`.
