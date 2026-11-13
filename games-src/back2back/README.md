# Back2Back

Two-player co-op racer and shooter for Exemoo. One screen, two phones (or keyboard and mouse).

- **Player 1 · Driver** steers by tilting the phone (kart wheel). The throttle is yours: hold GAS to run (nothing keeps the car moving), BRAKE slows, DRIFT through bends charges a boost (up to 3 stars), ITEM fires a 1.6 s nitro (8 s recharge). A five-speed gearbox, weight transfer, understeer and slides give it a heavier, less arcade feel.
- **Player 2 · Shooter** points the phone at the screen to aim (Recenter re-centres the crosshair); hold Action to fire. Aim assist locks onto targets, hits on the upper part of a vehicle crit, and the gun overheats if held too long.
- **The storm** starts 130 m behind and speeds up the longer you run. The driver card shows its distance (and whether you are pulling away). Inside 40 m lightning hits the hull; at 0 m the run ends in a short storm-engulfing finale.
- 3D (three.js, Moo Moo Farm style) with post-processing, cinematic shots (intro, boss, boss down, zone, crash), curvy roads (S-bends, chicanes, hairpins; boss arcs are straight), ramps and boost pads, five 1400 m zones (Sunny Meadow, Barnyard Bend, Creek Crossing, Red Rock Run, Sunset Hills, then repeating harder).
- **Bosses:** zones 1, 3, 5 end with the Mega Harvester; zones 2, 4, 6 end with a fixed bandit village (towers, raider huts, a gate to shoot open, a chief). Guards left standing get a free attack as you pass.
- Enemies fire at your actual lane (including from the side); drones and bombers attack from the air; the road verge and ditch hurt.
- One shared hull (5, +1 per Armor). Chain kills for a combo multiplier up to ×5. Pickups: Engine, Armor, Rapid, Spread, Shield, Repair.
- Settings (saved in the browser): crosshair size / style / colour, aim and steering sensitivity, volume, engine sound, graphics quality, camera shake.

Phones pair through the shell (Driver, when opened from the Exemoo menu) and a PIN room for the second phone (Driver outside the shell, Shooter always). Without phones: ← → (A/D) steer, ↑ (W) gas, ↓ (S) brake, Z drift, Shift (E) nitro; P / Esc pauses; the mouse aims and clicks to fire (Space also fires).

```bash
npm install          # first time (or let `npm run build` at the repo root do it)
npm run build        # tsc + vite build into ../../games/back2back/ (served at /play/back2back/)
```

Source: `src/sim.ts` (rules, driving model, storm), `src/settings.ts` (player settings), `src/cine.ts` (camera shots), `src/post.ts` (post-processing), `src/props.ts` / `src/flyers.ts` / `src/village.ts` (ramps and pads, air enemies, village boss), `src/stage.ts` (three.js camera, object views, aim), `src/world.ts` (road and zone scenery), `src/models.ts` / `src/fx.ts` (cartoon models, particles), `src/track.ts` (road maths), `src/phones.ts` (input and pairing), `src/aim.ts` (phone orientation to crosshair, same maths as Straw Shot), `src/ui.ts` (menus and HUD), `src/main.ts` (state flow).
