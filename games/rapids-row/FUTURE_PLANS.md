# Rapids Row — future plans

Ideas for upcoming versions. Nothing here is built yet. Notes under each idea point at the code it would touch
(see `CONTRACT.md` for the module layout).

## Story and lore

**Premise.** The two paddlers (P1 red, P2 blue) are best friends who have fallen out over a silly gag. The
**Cow Overlord** steps in and tells them to sort it out the only fair way: by racing a canoe together down the river.

**Arc.**
1. **Intro cutscene:** the gag and the falling-out, then the Cow Overlord's decree.
2. **Sunny River (map 1):** the friends bicker at first and slowly start paddling in sync.
3. **Ending:** they learn to forgive each other's mistakes. As a reward, the Cow Overlord gives them both a glass of milk.
   - **Punchline:** P1 pulls out a pack of chocolate sandwich cookies (Oreo-style, but our own design with no brand) to share with the milk.
4. **Cliffhanger:** a hook into the Jungle Temple level (map 2), e.g. something snatches the cookies, or a mysterious map is found in the milk crate.

**Script and voiceover.** The user will provide the script and the voice lines. The game needs:
- A cutscene player:
  - a sequence of shots using the in-game camera and characters
  - subtitles in the Exemoo UI style
  - a skip button the phone's d-pad can reach
- A voice-line hook in `audio.js`, e.g. `audio.voice(id)` with ducking of music and the river loop.
- Story beats triggered at the start, the finish and on map unlock.

**New assets:**
- the Cow Overlord model: a big regal cow with a crown and cape on a throne or hill, with idle and talking animations
- glasses of milk
- the cookie pack
- character facial expressions: angry, sheepish, happy

## Checkpoint reset: slap animation and funny hits

- **Trigger:** when the crew wipes out and resets to a checkpoint, the players can *optionally* trigger a funny hitting moment:
  - a slap
  - a bonk with the paddle
  - a splash to the face
  - a noogie, etc.
- **Opt-in only:** it happens only when a player chooses to. For example, a player presses a "Slap!" button on their phone during the respawn beat. It must not play on every reset.
- **Characters:** each character gets their own set of reactions: getting hit, dizzy stars, the hitter's smug face.
- **Code touched:** `models.makeBoat` needs rower animation clips (or procedural poses) beyond the paddle cycle. `main.js` `wipeout()` / `respawn()` need a short window where the pad shows the button (`exemoo.setLayout(..., buttons)`).

## Death / wipeout animations

Today a wipeout is a banner, a splash and a camera shake. Planned per-hazard animations:

| Hazard | Animation |
|---|---|
| Croc | the canoe gets chomped and tossed |
| Whirlpool | the canoe spins down the drain |
| Spikes | the canoe pops and the paddlers fly out |
| Waterfall edge | the canoe goes over the edge with a cartoon fall |

After any of these, the paddlers bob up sputtering before the respawn.

- **Code touched:** `wipeout()` in `main.js` already pauses paddling for `WIPE_S`. The animation would play in that window. Lengthen it per hazard type.

## Jumps

- **Ramps:** ramps and waterfall drops that launch the canoe into the air.
- **In the air:** airtime, with landing splashes and a speed boost for a clean, straight landing.
- **Physics:** `boat.js` needs a vertical state (`y`, `vy`, gravity, no water drag or steering while airborne).
- **Track data:** tracks mark ramps as a new obstacle `type: 'ramp'` with `solid: false`, so a contact launches the boat rather than bouncing it.

## More bridges

Map 2 already has rope, stone-arch and low wooden bridges. Ideas:
- bridges on map 1
- a drawbridge that raises and lowers on a timer
- a collapsing bridge that drops debris into the river as you approach

## Final boss fight

A boss arena at the end of a level (or a dedicated boss river), e.g. a giant river creature or the Cow Overlord's champion.

**Two phases that alternate:**
1. **Defend:** the boss launches attacks (rocks, waves, tentacle slams, whirlpools) with clear telegraphs (shadows on the water, warning rings). The players row to dodge and move around the arena. Rowing works as it does now, with circles to paddle and back-paddling.
2. **Attack:** when the boss is on stand-by (tired, stunned, mouth open), the players throw rocks at it.
   - **Throw input:** a quick flick or overhand motion with the phone. This is a new gesture next to the circle stroke, detected in `rowing.js` or a new `throw.js`.
   - **Aim:** the boat's heading, or the phone's tilt.
   - **Hits:** knock off a chunk of the boss health bar.

**Needed:**
- a boss state machine (idle, telegraph, attack, stand-by, hit, defeated)
- an arena track or map with a free-roam area (not just a river corridor)
- a boss health bar in `ui.js`
- rock pickups floating in the arena, or an unlimited ammo cooldown
- a victory cutscene that ties into the story ending (the milk and the cookies)

## Notes for whoever builds this

- Both phones already stream motion. The throw gesture can reuse the packet pipeline (`StrokeDetector` sits beside a new `ThrowDetector`).
- Moving obstacles, hazards and checkpoint respawn are already in the track/boat contract (v2 in `CONTRACT.md`). Boss projectiles can be moving hazard obstacles.
- Audio for voiceovers should come from the user's provided recordings. Generated audio stays Gemini-only (`scripts/gen-rapids-audio.mjs`).
