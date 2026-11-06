# games/

Each game lives in `games/<id>/` and is served at `/play/<id>/`. A folder counts as installed
when it contains an `index.html` (see `/api/info`). The Exemoo shell opens it full-screen in an
iframe and hands it the phone the player already paired.

| id | Source | Phone layout |
|---|---|---|
| `pad-test` | static (this folder) | swing, switchable (footer → Test controller) |
| `fruit-slice`, `table-tennis`, `golf`, `tennis`, `pose-match` | `../games-src/<id>/`, `npm run build` | slice / swing / swing / swing / remote |
| `farm-dash` | static (copy of `../subway runner` + `js/exemoo-remote.js`) | remote + tilt |
| `cricket` | static, new | swing |
| `rapids-row` | static, new (see `rapids-row/CONTRACT.md`) | swing (2 phones) |
| `farm-kart` | `../games-src/farm-kart/` = mirror of `../../farm-kart` + `exemoo/` adapter; `node scripts/sync-farm-kart.mjs` | kart in races, remote in menus (1–4 phones) |
| `shake-freeze`, `wobble-tower`, `flapjack-flip` | static, new party minigames (Canvas 2D, no build). Shared kit `party.js` / `art.js` / `sfx.js` / `party.css` is copied into each folder | swing (1–4 phones: P1 = shell phone, P2–P4 pair their own PIN) |

## Adding a game (Phase 3)

1. Build with Vite `base: '/play/<id>/'` and copy `dist/` into `games/<id>/`. Files under
   `assets/` are cached forever, so keep Vite's content-hashed names.
2. If the game already has a PhoneLink (table-tennis / golf / fruit-slice style), swap it for
   `SpinshotLink` or `SliceLink` from `/sdk/adapters.js` when `inExemooShell()`. Otherwise delete the game's own pairing (QR screen, `PhoneLink`, controller page, server). Use the SDK:

```js
// Not bundled: the shell serves it. Vite needs the ignore comment.
const { connectExemoo } = await import(/* @vite-ignore */ '/sdk/exemoo.js');
const exemoo = connectExemoo({ layout: 'swing', title: 'Golf' });

if (!exemoo.inShell) useMouseAndKeyboard();       // opened directly, not from Exemoo
exemoo.on('status', ({ connected, transport, latency }) => …);
exemoo.on('packet', (p) => {                      // ~60 Hz while the layout streams motion
  // p = { seq, t, q:{x,y,z,w}, acc:{x,y,z}, gyro:{alpha,beta,gamma}, buttons }
  // Same SEN2 fields the table-tennis / golf / fruit-slice input code already reads.
  if (exemoo.held(p, 'action')) …;
});
exemoo.on('button', (b) => …);                    // 'action' 'pause' 'recenter' 'up' 'down' 'left' 'right' 'back'
exemoo.haptic(30);                                // buzz the phone
exemoo.setLayout('remote', 'Golf');               // e.g. while a menu is open
exemoo.setStream(false);                          // stop motion packets
exemoo.exit();                                    // back to the Exemoo menu
exemoo.nav(b);                                    // d-pad / Action over the page's visible buttons
// connectExemoo({ keys: { action: 'Space', pause: 'Escape' } }) turns phone buttons into key presses
```

## Phone layouts

| Layout | Phone shows | Motion stream | For |
|---|---|---|---|
| `swing` | Big hold-to-swing button (`action` held), Pause, Recenter, d-pad | on | golf, table tennis, tennis, cricket |
| `slice` | Whole screen is the blade (`action` held while touching), Pause, Recenter | on | fruit slice |
| `remote` | GO, Pause, Back, d-pad | off | camera games: pose match, farm dash |
| `kart` | Steering wheel (tilt, or ◀ ▶ buttons), DRIFT / BRAKE / ITEM / GAS, pos / lap / item HUD, Pause | off (sends `{t:'in', s, g, b, d, i}` ~30 Hz instead) | farm kart (`public/js/pad-kart.js`) |

Every layout has a Home button (hold 0.6 s). The shell handles it: the game is closed and the
phone goes back to the menu pointer. Keyboard and mouse still reach the game normally.
