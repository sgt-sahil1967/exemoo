/**
 * Rapids Row: two phones, one canoe. Stitches the modules together (see ../CONTRACT.md):
 *   track.js (river + scenery) · models.js / water.js (art) · rowing.js / boat.js (input + physics)
 *   audio.js (Gemini-generated sounds) · ui.js (menus + HUD)
 *
 * Player 1 (left paddle) is the phone the Exemoo shell already paired. Player 2 (right paddle) pairs a
 * second phone through its own PIN room, like table-tennis' 2-player mode. A player without a phone
 * paddles on the keyboard (P1 W/S, P2 ↑/↓). Opened outside the shell, both players pair their own room.
 *
 * Two rivers (maps.js). Map 2 has hazards: touching one wipes the crew out back to the last checkpoint.
 *
 * URL flags: ?debug (input overlay), ?auto (autopilot paddles both sides, for testing), ?map=<id>.
 */
import * as THREE from 'three';
import { connectExemoo } from '/sdk/exemoo.js';
import { ScreenLink } from '/js/screen-link.js';
import { normalizeButton } from '/js/protocol.js';
import { MAPS } from './maps.js';
import * as models from './models.js';
import { createWater } from './water.js';
import { StrokeDetector, KeyStroker } from './rowing.js';
import { Boat } from './boat.js';
import { createAudio } from './audio.js';
import { createUI } from './ui.js';

const P_COLORS = ['#ff3b30', '#2f7cff'];
const params = new URLSearchParams(location.search);
const DEBUG = params.has('debug');
const AUTO = params.has('auto');

// ───────────────────────────── scene ─────────────────────────────
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
const camera = new THREE.PerspectiveCamera(60, 1, 0.3, 2000);
function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

const audio = createAudio('assets/audio/');
const ui = createUI(document.getElementById('ui'));
/** sky.js (new skies) when it loads, else the original sky in models.js. */
const skyModule = import('./sky.js').catch(() => null);

// The current river. loadMap() swaps all of these.
let map = null, scene = null, sky = null, track = null, scenery = null, boatArt = null, splashes = null, boat = null;
let coinsTotal = 0;

function disposeScene(sc) {
  sc?.traverse((o) => {
    o.geometry?.dispose();
    for (const m of [].concat(o.material || [])) {
      for (const v of Object.values(m)) if (v?.isTexture) v.dispose();
      m.dispose();
    }
  });
}

async function loadMap(id) {
  const next = MAPS.find((m) => m.id === id) || MAPS[0];
  if (map === next && scene) return;
  const mod = await next.load();
  const skyMod = await skyModule;
  const sc = new THREE.Scene();
  const newSky = skyMod?.makeSky ? skyMod.makeSky(sc, next.sky, renderer) : models.makeSky(sc);
  renderer.toneMappingExposure = newSky.exposure || 1;
  const newTrack = mod.createTrack();
  const water = createWater(newTrack);
  // Water reflections match the sky preset.
  const pal = skyMod?.PRESETS?.[next.sky];
  if (pal && water.setSky) water.setSky({ top: pal.top, mid: pal.mid, horizon: pal.horizon, sunDir: newSky.sunDir, sunColor: pal.sunCol });
  const newScenery = mod.buildScenery(sc, newTrack, models, water);
  const art = models.makeBoat({ colors: P_COLORS });
  sc.add(art.group);
  const oldScene = scene;
  [map, scene, sky, track, scenery, boatArt] = [next, sc, newSky, newTrack, newScenery, art];
  splashes = models.makeSplashes(sc);
  boat = new Boat(track);
  boat.onHit(onBoatHit);
  coinsTotal = track.pickups.length;
  ui.hud.setGates?.(track.gates.map((g) => g.s / track.finishS));
  disposeScene(oldScene);
  camInit = false;
}

// ───────────────────────────── phones ─────────────────────────────
const exemoo = connectExemoo({ layout: 'swing', title: 'Rapids Row · Left paddle', stream: true });
const inShell = exemoo.inShell;
let padBase = null;
const info = fetch('/api/info').then((r) => r.json()).catch(() => null);

/**
 * One player's controller. In the shell P1 rides the SDK; everyone else gets a ScreenLink PIN room.
 * `detector` is the phone's StrokeDetector, `keys` the keyboard fallback; `input` is whichever is live.
 */
function makePlayer(n) {
  const p = {
    n,
    detector: new StrokeDetector(),
    keys: new KeyStroker(n === 0 ? { forward: 'KeyW', back: 'KeyS' } : { forward: 'ArrowUp', back: 'ArrowDown' }),
    connected: false,
    pin: '',
    url: '',
    link: null,
    lastPacket: 0,
    get input() {
      return this.connected && performance.now() - this.lastPacket < 1500 ? this.detector : this.keys;
    },
    haptic: () => {},
  };
  const onStroke = ({ strength }) => strokeFx(n, strength);
  p.detector.onStroke(onStroke);
  p.keys.onStroke(onStroke);
  return p;
}
const players = [makePlayer(0), makePlayer(1)];

function onPacket(p, packet) {
  p.lastPacket = performance.now();
  p.detector.push(packet);
}

if (inShell) {
  const p1 = players[0];
  p1.haptic = (pattern) => exemoo.haptic(pattern);
  exemoo.on('status', (s) => {
    const was = p1.connected;
    p1.connected = s.connected;
    if (s.connected && !was) {
      exemoo.send({ t: 'theme', color: P_COLORS[0] });
      ui.toast('Left paddle phone ready', P_COLORS[0]);
    }
    refreshPairing();
  });
  exemoo.on('packet', (packet) => onPacket(p1, packet));
  exemoo.on('button', (b) => onButton(0, b));
} else {
  attachLink(players[0], 'rapids.room.p1');
}
attachLink(players[1], 'rapids.room.p2');

/** Pair a player's phone through its own PIN room and point the pad straight at the paddle layout. */
function attachLink(p, storageKey) {
  const link = new ScreenLink({ storageKey });
  p.link = link;
  p.haptic = (pattern) => link.connected && link.send({ t: 'haptic', pattern });
  const title = `Rapids Row · ${p.n === 0 ? 'Left' : 'Right'} paddle`;
  link.on('room', (pin) => {
    p.pin = pin;
    info.then((i) => {
      padBase = i?.padUrl || `${location.origin}/pad`;
      p.url = `${padBase}?pin=${pin}&layout=swing&title=${encodeURIComponent(title)}`;
      refreshPairing();
    });
  });
  link.on('status', (s) => {
    const ok = s === 'connected';
    if (ok && !p.connected) {
      link.send({ t: 'layout', layout: 'swing', title, buttons: [], stream: true });
      link.send({ t: 'stream', on: true });
      link.send({ t: 'theme', color: P_COLORS[p.n] });
      ui.toast(`${p.n === 0 ? 'Left' : 'Right'} paddle phone ready`, P_COLORS[p.n]);
      audio.play('click');
    } else if (!ok && p.connected && state === 'race') {
      ui.toast(`Player ${p.n + 1} phone lost — keyboard takes over`, P_COLORS[p.n]);
    }
    p.connected = ok;
    refreshPairing();
  });
  link.on('packet', (packet) => onPacket(p, packet));
  link.on('message', (m) => {
    if (m.t === 'button') onButton(p.n, normalizeButton(m.b));
  });
  info.then((i) => {
    if (Array.isArray(i?.iceServers)) link.iceServers = i.iceServers;
    link.start();
  });
}

const qrSrc = (url) => (url ? `/api/qr?text=${encodeURIComponent(url)}` : '');

// ───────────────────────────── game state ─────────────────────────────
/** 'title' | 'pairing' | 'countdown' | 'race' | 'paused' | 'results' */
let state = 'title';
let raceT = 0;
let countT = 0;
let coins = 0;
let hits = 0;
let nextGate = 0;
let zoneIdx = -1;
const collected = new Set();
let riverLoop = null;
let rapidsLoop = null;
let wipeT = 0;
let wipes = 0;
let keyboardOnly = false;
const bestKey = () => `rapids-row.best.${map.id}`;
const getBest = (id) => {
  try {
    return Number(localStorage.getItem(`rapids-row.best.${id}`)) || null;
  } catch {
    return null;
  }
};

function refreshPairing() {
  if (state !== 'pairing') return;
  const card = (p) => ({
    connected: p.connected,
    label: p.n === 0 ? (inShell ? 'Uses your Exemoo phone' : 'Left paddle') : 'Right paddle',
    pin: p.pin,
    url: p.url.replace(/^https?:\/\//, '').replace(/\?.*/, ''),
    qrSrc: p.connected ? '' : qrSrc(p.url),
  });
  ui.showPairing({ p1: card(players[0]), p2: card(players[1]), onStart: startCountdown, onBack: showMaps });
}

function showTitle() {
  state = 'title';
  ui.hideAll();
  ui.hud.hide();
  ui.showTitle({ onPlay: () => showMaps(false), onKeyboard: () => showMaps(true) });
  if (boat) resetRace();
}

function showMaps(kb = keyboardOnly) {
  audio.unlock();
  keyboardOnly = kb;
  state = 'maps';
  ui.hideAll();
  ui.showMaps({
    maps: MAPS.map((m) => ({ ...m, best: getBest(m.id) })),
    selected: map?.id,
    onBack: showTitle,
    onPick: async (id) => {
      if (state !== 'maps') return;
      state = 'loading';
      ui.toast('Loading river…');
      try {
        await loadMap(id);
      } catch (e) {
        console.error(e);
        ui.toast('That river failed to load');
        return showMaps();
      }
      if (keyboardOnly) startCountdown();
      else showPairing();
    },
  });
}

function showPairing() {
  audio.unlock();
  state = 'pairing';
  ui.hideAll();
  refreshPairing();
}

function resetRace() {
  boat.reset();
  raceT = 0;
  coins = 0;
  hits = 0;
  nextGate = 0;
  zoneIdx = -1;
  wipeT = 0;
  wipes = 0;
  track.update?.(0);
  for (const i of collected) scenery.pickupMeshes[i] && (scenery.pickupMeshes[i].visible = true);
  collected.clear();
  for (const p of players) {
    p.detector.recenter();
  }
}

function startCountdown() {
  audio.unlock();
  ui.hideAll();
  resetRace();
  state = 'countdown';
  countT = 3.999;
  ui.showCountdown(3);
  audio.play('beep');
  ui.hud.show();
  if (!riverLoop) {
    riverLoop = audio.loop('river_loop', { volume: 0.35 });
    rapidsLoop = audio.loop('rapids_loop', { volume: 0 });
  }
  audio.setMusic(true);
}

function setPaused(on) {
  if (on && state === 'race') {
    state = 'paused';
    ui.showPause({ onResume: () => setPaused(false), onRestart: startCountdown, onQuit: quit });
  } else if (!on && state === 'paused') {
    ui.clearScreen();
    state = 'race';
  }
}

function quit() {
  audio.setMusic(false);
  if (inShell) exemoo.exit();
  else showTitle();
}

function finish() {
  state = 'results';
  audio.play('finish');
  setTimeout(() => audio.play('cheer', { volume: 0.8 }), 400);
  for (const p of players) p.haptic([60, 40, 60, 40, 120]);
  let best = null;
  try {
    best = Number(localStorage.getItem(bestKey())) || null;
    if (!best || raceT < best) localStorage.setItem(bestKey(), String(raceT));
  } catch {
    /* no storage */
  }
  // Par: a crew that paddles well most of the way (~7 m/s average).
  const par = track.finishS / 17;
  const stars = 1 + (raceT < par * 1.3) + (raceT < par && coins >= coinsTotal * 0.5);
  ui.showResults({ time: raceT, coins, coinsTotal, best: best ? Math.min(best, raceT) : raceT, stars, hits: hits + wipes, onAgain: startCountdown, onQuit: showMaps });
}

// ───────────────────────────── buttons ─────────────────────────────
function onButton(n, b) {
  audio.unlock();
  if (b === 'recenter') {
    players[n].detector.recenter();
    return ui.toast(`Player ${n + 1} recentered`, P_COLORS[n]);
  }
  if (state === 'race') {
    if (b === 'pause' || b === 'back') setPaused(true);
    return; // Action = back-paddle, read from the packet's button mask
  }
  if (state === 'paused' && b === 'pause') return setPaused(false);
  if (state === 'countdown') return;
  if (b === 'back' && state === 'pairing') return showMaps();
  if (b === 'back' && state === 'maps') return showTitle();
  if (exemoo.nav(b)) audio.play('click', { volume: 0.5 });
}
addEventListener('keydown', (e) => {
  audio.unlock();
  if ((e.code === 'Escape' || e.code === 'KeyP') && (state === 'race' || state === 'paused')) setPaused(state === 'race');
});

// ───────────────────────────── feedback ─────────────────────────────
function strokeFx(n, strength) {
  if (state !== 'race' && state !== 'countdown') return;
  const tip = boatArt.paddleTip(n);
  splashes.emit(tip.x, 0.05, tip.z, 0.4 + strength * 0.6);
  audio.play(`splash_${1 + ((Math.random() * 3) | 0)}`, { volume: 0.35 + strength * 0.5, rate: 0.9 + Math.random() * 0.2, pan: n === 0 ? -0.5 : 0.5 });
  players[n].haptic(12);
}

function onBoatHit({ kind, strength, x, z, hazard }) {
  if (state !== 'race') return;
  if (hazard) return wipeout(kind);
  hits++;
  const name = kind === 'bank' ? 'bank_scrape' : kind === 'log' ? 'log_hit' : 'rock_hit';
  audio.play(name, { volume: 0.4 + strength * 0.6 });
  splashes.emit(x, 0.1, z, 0.5 + strength * 0.5);
  shake = Math.max(shake, 0.25 + strength * 0.5);
  for (const p of players) p.haptic(kind === 'bank' ? 40 : [50, 30, 80]);
}

/** Hazard touched: splash, a beat of drama, then back to the last checkpoint passed. */
const WIPE_S = 1.4;
function wipeout(kind) {
  if (wipeT > 0) return;
  wipeT = WIPE_S;
  wipes++;
  const what = { croc: 'CHOMP!', whirlpool: 'SUCKED UNDER!', waterfall: 'OVER THE EDGE!', spikes: 'OUCH, SPIKES!' }[kind] || 'WIPEOUT!';
  ui.banner(what);
  audio.play(kind === 'log' || kind === 'swinglog' ? 'log_hit' : 'rock_hit', { volume: 1 });
  splashes.emit(boat.x, 0.2, boat.z, 1);
  splashes.emit(boat.x + 1, 0.2, boat.z - 1, 1);
  shake = 0.9;
  for (const p of players) p.haptic([120, 60, 200]);
}
function respawn() {
  const g = track.gates[nextGate - 1];
  let at = { x: track.start.x, z: track.start.z, heading: track.start.heading, s: track.start.s };
  if (g) {
    const a = track.sample(g.s + 4);
    at = { x: a.x, z: a.z, heading: Math.atan2(-a.tx, -a.tz), s: g.s + 4 };
  }
  boat.reset(at);
  camInit = false;
  ui.toast(g ? `Back to ${g.label || 'checkpoint'}` : 'Back to the start', '#ff9a1f');
  audio.play('checkpoint', { volume: 0.5, rate: 0.8 });
}

// ───────────────────────────── camera ─────────────────────────────
let shake = 0;
const camPos = new THREE.Vector3();
const camLook = new THREE.Vector3();
let camInit = false;
function updateCamera(dt) {
  const fx = -Math.sin(boat.heading), fz = -Math.cos(boat.heading);
  // Blend the boat's heading with the river ahead so bends read before you reach them.
  const ahead = track.sample(Math.min(track.length, boat.s + 18 + Math.abs(boat.speed) * 0.8));
  const lx = boat.x + fx * 7 + (ahead.x - boat.x) * 0.25, lz = boat.z + fz * 7 + (ahead.z - boat.z) * 0.25;
  const v = Math.abs(boat.speed);
  const back = 11 + Math.min(7, v * 0.3);
  const want = new THREE.Vector3(boat.x - fx * back, 5.2 + Math.min(3, v * 0.12), boat.z - fz * back);
  // A touch of FOV kick sells the speed.
  const fov = 60 + Math.min(14, v * 0.6);
  if (Math.abs(camera.fov - fov) > 0.05) {
    camera.fov += (fov - camera.fov) * (1 - Math.exp(-dt * 3));
    camera.updateProjectionMatrix();
  }
  const k = camInit ? 1 - Math.exp(-dt * 4) : 1;
  camPos.lerp(want, k);
  camLook.lerp(new THREE.Vector3(lx, 0.8, lz), camInit ? 1 - Math.exp(-dt * 6) : 1);
  camInit = true;
  camera.position.copy(camPos);
  if (shake > 0) {
    camera.position.x += (Math.random() - 0.5) * shake;
    camera.position.y += (Math.random() - 0.5) * shake * 0.5;
    shake = Math.max(0, shake - dt * 1.5);
  }
  camera.lookAt(camLook);
}

// Title/pairing: slow drone flyover of the river.
function updateFlyover(t) {
  const s = (t * 9) % (track.length - 60);
  const a = track.sample(s), b = track.sample(Math.min(track.length, s + 45));
  camPos.set(a.x + a.tz * 14, 16, a.z - a.tx * 14);
  camLook.set(b.x, 0, b.z);
  camera.position.copy(camPos);
  camera.lookAt(camLook);
  camInit = false;
}

// ───────────────────────────── autopilot (?auto) ─────────────────────────────
/** Paddles both sides and steers toward a point ahead on the centerline, avoiding nothing. Testing only. */
function autopilot() {
  const a = track.sample(Math.min(track.length, boat.s + 14));
  const want = Math.atan2(-(a.x - boat.x), -(a.z - boat.z));
  let err = want - boat.heading;
  err = Math.atan2(Math.sin(err), Math.cos(err));
  const turn = Math.max(-1, Math.min(1, err * 2.5)); // + = turn left = right paddle stronger
  const base = 0.85;
  return [
    { power: Math.max(0, Math.min(1, base - turn * 0.6)), reverse: false, phase: (raceT * 1.4) % 1 },
    { power: Math.max(0, Math.min(1, base + turn * 0.6)), reverse: false, phase: (raceT * 1.4 + 0.02) % 1 },
  ];
}

// ───────────────────────────── loop ─────────────────────────────
const dbg = document.getElementById('dbg');
dbg.hidden = !DEBUG;
let last = performance.now();
let elapsed = 0;

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  requestAnimationFrame(frame);
  if (!scene) return;
  elapsed += dt;
  for (const p of players) {
    p.detector.update(dt);
    p.keys.update(dt);
  }

  if (state === 'countdown') {
    const before = Math.ceil(countT);
    countT -= dt;
    const after = Math.ceil(countT);
    if (after !== before) {
      ui.showCountdown(Math.max(0, after - 1));
      audio.play(after - 1 > 0 ? 'beep' : 'go');
      if (after - 1 === 0) {
        for (const p of players) p.haptic(80);
        setTimeout(() => state === 'race' && ui.clearScreen(), 900);
      }
    }
    if (countT <= 1) state = 'race';
  }

  const racing = state === 'race';
  if (racing || state === 'countdown') {
    const live = players.map((p) => p.input);
    const inputs = AUTO ? autopilot() : live.map((i) => ({ power: i.power, reverse: i.reverse, phase: i.phase }));
    if (racing) {
      raceT += dt;
      track.update?.(raceT);
      if (wipeT > 0) {
        // Crew is in the drink: no paddling until the respawn.
        wipeT -= dt;
        boat.step(dt, [{ power: 0, reverse: false, phase: 0 }, { power: 0, reverse: false, phase: 0 }]);
        if (wipeT <= 0) respawn();
      } else boat.step(dt, inputs);
      updateRace(dt, inputs);
    }
    for (let i = 0; i < 2; i++) boatArt.setPaddle(i, inputs[i].phase, inputs[i].power, inputs[i].reverse);
    boatArt.setLean(Math.max(-1, Math.min(1, -(boat.yawRate || 0) * 0.8)));
    updateCamera(dt);
  } else if (state === 'title' || state === 'pairing' || state === 'maps' || state === 'loading') {
    track.update?.(elapsed);
    updateFlyover(elapsed);
  }

  boatArt.group.position.set(boat.x, 0, boat.z);
  boatArt.group.rotation.y = boat.heading;
  boatArt.update(dt);
  splashes.update(dt);
  scenery.update(dt, elapsed, camera);
  sky.update(elapsed, camera);
  renderer.render(scene, camera);
  if (DEBUG) debugText();
}

function updateRace(dt, inputs) {
  // Coins: anything within reach of the hull.
  for (let i = 0; i < track.pickups.length; i++) {
    if (collected.has(i)) continue;
    const c = track.pickups[i];
    const dx = c.x - boat.x, dz = c.z - boat.z;
    if (dx * dx + dz * dz < 2.6 * 2.6) {
      collected.add(i);
      coins++;
      scenery.collectPickup(i);
      audio.play('coin', { volume: 0.6, rate: 1 + Math.min(0.3, (coins % 10) * 0.03) });
    }
  }
  // Checkpoints and zones.
  while (nextGate < track.gates.length && boat.s >= track.gates[nextGate].s) {
    ui.banner(track.gates[nextGate].label ? `${track.gates[nextGate].label} ✓` : 'CHECKPOINT!');
    audio.play('checkpoint');
    nextGate++;
  }
  const z = track.zones.findIndex((zn) => boat.s >= zn.s0 && boat.s < zn.s1);
  if (z >= 0 && z !== zoneIdx) {
    if (zoneIdx >= 0) ui.banner(track.zones[z].name);
    if (/cow|meadow/i.test(track.zones[z].name)) audio.play('moo', { volume: 0.7 });
    zoneIdx = z;
  }
  const here = track.sample(boat.s);
  rapidsLoop?.setVolume(Math.max(0, Math.min(0.6, (here.current - 2.5) / 3.5)));
  riverLoop?.setVolume(0.35);

  const p1 = players[0].input, p2 = players[1].input;
  ui.hud.update({
    time: raceT,
    progress: Math.max(0, Math.min(1, boat.s / track.finishS)),
    speed: Math.abs(boat.speed),
    coins,
    coinsTotal,
    zone: track.zones[zoneIdx]?.name || '',
    p1: { power: inputs[0].power, rate: p1.rate || 0, reverse: inputs[0].reverse },
    p2: { power: inputs[1].power, rate: p2.rate || 0, reverse: inputs[1].reverse },
    sync: boat.sync || 0,
  });
  if (boat.finished) finish();
}

function debugText() {
  const f = (v) => (typeof v === 'number' ? v.toFixed(2) : String(v));
  const lines = [`state ${state}  t ${raceT.toFixed(1)}  s ${boat.s.toFixed(0)}/${track.finishS.toFixed(0)}  v ${boat.speed.toFixed(2)}  lat ${f(boat.lateral)}`];
  for (const p of players) {
    const i = p.input;
    lines.push(`P${p.n + 1} ${i === p.detector ? 'phone' : 'keys '} pow ${f(i.power)} rate ${f(i.rate)} ph ${f(i.phase)} rev ${i.reverse}`);
    if (i === p.detector && p.detector.debug) lines.push('   ' + JSON.stringify(p.detector.debug, (k, v) => (typeof v === 'number' ? +v.toFixed(2) : v)));
  }
  dbg.textContent = lines.join('\n');
}

window.__rapids = { get track() { return track; }, get boat() { return boat; }, get map() { return map; }, players, get state() { return state; }, startCountdown, loadMap, renderer };
audio.ready?.catch(() => {});
requestAnimationFrame(frame);
loadMap(params.get('map') || MAPS[0].id).then(() => {
  showTitle();
  if (AUTO) startCountdown();
});
