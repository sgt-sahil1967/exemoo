# Bumper Carts

Up to four farm animals ride padded hay carts on a round barn-dance floor ringed by a picket fence, above a
mud moat. Hold the phone flat like a tray and tilt: the cart drives the way you tilt. Hold the big Action
button to wind up a charge (the cart slows and shakes), let go to ram. Hard bumps crack the fence, then break
it, and a cart knocked through a gap lands in the mud: a KO for whoever bumped it last. Everyone respawns.
Most KOs when the bell rings wins; a tie goes to sudden death among the tied.
Static game (no build step) served at `/play/bumper-carts/`. three.js from the import map, all art and sound
procedural, no emojis, no image files. Design contract: `PLAN.md`.

## Playing
- Title: CPU rivals on or off, CPU level (Easy / Normal / Hard), round length (60 / 90 / 120 s). Remembered.
- Lobby: four seat cards. Player 1 is the Exemoo phone inside the shell; every other seat shows a QR code and
  PIN to pair a phone, or press that seat's charge key to join on the keys. Empty seats become CPU carts when
  CPU rivals are on (with them off, at least two seats must join).
- At 25 s left the BARN STORM drops every remaining fence panel. A cart that drives out alone loses a point
  (never below 0).

## Controls
| Seat | Phone | Move | Charge (hold, release to ram) |
|---|---|---|---|
| P1 | tilt flat, hold Action | W A S D | Space |
| P2 | same, own PIN | arrows | Enter |
| P3 | same, own PIN | I J K L | U |
| P4 | same, own PIN | numpad 8 4 5 6 | numpad 0 |

Escape or P pauses, M mutes, R recenters. The phone's Recenter button makes the current angle neutral. A
phone that goes quiet for 1.5 s hands its seat back to its keys. Inside the shell the d-pad and Action drive
the menus.

## Files
`js/main.js` boot, loop and flow; `js/rules.js` pure `Round` (clock, storm, scores, sudden death);
`js/ui.js` + `ui.css` menus and HUD; `js/players.js` four seats (phone or keys); `js/keys.js` keyboard to
`CartIntent`. Engine side (`engine.js`, `sim.js`, `ai.js`, `world.js`, `cart.js`, `fx.js`, `audio.js`,
`tilt-input.js`, `constants.js`) is described in `PLAN.md`.

## Dev
- `?stub` runs `main.js` on `dev/stub-engine.js`, a flat 2D stand-in with the same engine interface (also used
  automatically while `js/engine.js` fails to load). `?debug` exposes `window.__bc`.
- `dev/ui-test.html` shows every screen, the HUD and the pop-ups without any engine.
- Tests: `/opt/homebrew/opt/node@24/bin/node --test server/test/bumper-carts-*.test.js`.
