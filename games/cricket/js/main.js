// Exemoo Cricket — endless innings. Camera behind the striker's stumps. You bat in front of the laptop
// camera: where your hands go sets the direction, how far and fast sets the power, and when sets the
// timing (batcam.js). The phone is a remote (menus, vibration). Without a camera, click / Space + mouse.
import * as THREE from 'three';
import { connectExemoo } from '/sdk/exemoo.js';
import { createWorld, makeStumps, BOUNDARY, FIELD_Z } from './world.js';
import { Humanoid, POSES, runPose, makeBat, loadPlayerModel } from './rig.js';
import { swingFeatures } from './imu.js';
import { SwingDetector, SWING_LEAD, SWING_ON } from './batcam.js';
import { BallTrail } from './trail.js';
import { loadGenerated, genTexture } from './genassets.js';
import { createHandOverlay } from './handcam.js';
import { createTimingBar } from './timingbar.js';
import { createHowTo } from './howto.js';
import { grade as timingGrade } from './physics.js';
import { shotVelocity, stepBall, outOfField, predictPath } from './physics.js';
import { planFielding, captainMove, FIELDING } from './fielding.js';

const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const smooth = (t) => t * t * (3 - 2 * t);
const exemoo = connectExemoo({ layout: 'remote', title: 'Cricket', stream: true, menuCursor: () => state === 'menu' || state === 'over' || paused });

/** Settings (menu): players' look and time of day. Stored per browser; changing one reloads the game. */
const SETTINGS_KEY = 'exemoo.cricket.settings';
const settings = { players: 'men', time: 'day' };
try { Object.assign(settings, JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')); } catch { /* ignore */ }
function changeSetting(key, value) {
  settings[key] = value;
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* ignore */ }
  location.reload();
}
const { renderer, scene, camera, crowd, board, boardMats, fasciaMats } = createWorld($('scene'), { night: settings.time === 'night' });
const myStumps = makeStumps(scene, 1.22);
makeStumps(scene, -21.2);

// ═════════════════════════════ cast ═════════════════════════════
const batter = new Humanoid({ shirt: '#2f7cff', accent: '#ffd21f', capColor: '#1747b5', cap: 'helmet', pads: true, gloves: true, number: '7', name: 'MOO', hair: '#3a2516' });
batter.root.position.set(-0.36, 0, 0.55);
batter.root.rotation.y = Math.PI / 2; // side-on: chest to the off side (screen right), left shoulder to the bowler
scene.add(batter.root);
const bat = makeBat();
scene.add(bat);
/** Non-striker: waits at the bowler's end, runs the other way when the batters take a run. */
const partner = new Humanoid({ shirt: '#2f7cff', accent: '#ffd21f', capColor: '#1747b5', cap: 'helmet', pads: true, gloves: true, number: '3', name: 'MOO', hair: '#1b1b1b' });
const PARTNER_HOME = new THREE.Vector3(-1.1, 0, -19.7);
partner.root.position.copy(PARTNER_HOME);
scene.add(partner.root);
const partnerBat = makeBat();
partnerBat.position.set(0, -0.06, 0.02);
partner.j.wristR.add(partnerBat); // carried in the right hand
partner.pose(POSES.idle); partner.snap();
/** The two creases the batters run between (z), and the lines they run on (x). */
const CREASE = { near: 0.55, far: -19.7 }, RUN_X = { striker: -1.1, partner: 1.1 };

const bowler = new Humanoid({ shirt: '#ff3b30', accent: '#ffffff', capColor: '#b3160f', cap: 'cap', number: '11', name: 'BULL', hair: '#1b1b1b', beard: true });
scene.add(bowler.root);
const umpire = new Humanoid({ shirt: '#ffffff', accent: '#2a2a3a', trousers: '#2a2a3a', capColor: '#fbfbf6', cap: 'hat', coat: true, skin: '#e8b48a', hair: '#d8d8d8' });
umpire.root.position.set(-1.0, 0, -23.3);
scene.add(umpire.root);
umpire.pose(POSES.umpWatch); umpire.snap();
// Wicket-keeper, crouched just off the line so the camera sees past him.
const keeper = new Humanoid({ shirt: '#ffd21f', accent: '#ff3b30', capColor: '#c79a00', cap: 'helmet', pads: true, gloves: true, number: '1', name: 'GLOVES' });
const KEEPER_HOME = new THREE.Vector3(1.35, 0, 2.5);
keeper.root.position.copy(KEEPER_HOME);
keeper.root.rotation.y = Math.PI; // faces the bowler
scene.add(keeper.root);
keeper.pose(POSES.keeper); keeper.snap();
/** The keeper as a fielder (takes edges and stopped balls behind the stumps). */
const keeperF = { h: keeper, name: 'the keeper', mode: 'idle', phase: 0, home: KEEPER_HOME };

const BALL_R = 0.036;
const ball = new THREE.Mesh(new THREE.SphereGeometry(BALL_R * 1.6, 24, 16), new THREE.MeshPhysicalMaterial({ color: '#d4221c', roughness: 0.35, clearcoat: 0.8 }));
ball.castShadow = true;
scene.add(ball);
const trail = new BallTrail(scene);
const ballShadow = new THREE.Mesh(new THREE.CircleGeometry(0.07, 20), new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.25, depthWrite: false }));
ballShadow.rotation.x = -Math.PI / 2;
scene.add(ballShadow);

// ═════════════════════════════ field ═════════════════════════════
// Angles around the batter: 0 = straight back past the bowler, + = to the screen's right (off side).
const SPOTS = [
  ['mid-off', 0.35, 28], ['mid-on', -0.35, 28], ['cover', 0.95, 26], ['midwicket', -0.95, 26], ['point', 1.45, 24], ['square leg', -1.45, 24],
  ['long-off', 0.25, 60], ['long-on', -0.25, 60], ['deep cover', 0.85, 58], ['deep midwicket', -0.85, 58], ['third man', 2.4, 56], ['fine leg', -2.4, 56],
  ['gully', 1.9, 16], ['slip', 2.6, 13], ['straight hit', 0.05, 46],
];
const FIELD_N = 9;
const posOf = (a, r) => new THREE.Vector3(Math.sin(a) * r, 0, -Math.cos(a) * r);
const fielders = Array.from({ length: FIELD_N }, () => {
  const h = new Humanoid({ shirt: '#ffd21f', accent: '#ff3b30', capColor: '#c79a00', cap: 'cap', trousers: '#fbfbf6', number: '', name: '' });
  scene.add(h.root);
  return { h, a: 0, r: 0, home: new THREE.Vector3(), name: '', phase: Math.random() * 6, mode: 'idle' };
});
/** Everyone on the field. Rigged player models replace the toy figures once loaded (rig.js). */
const people = [batter, partner, bowler, umpire, keeper, ...fielders.map((f) => f.h)];
/** Soft contact shadow under each player (grounds them on the grass, day or night). */
const blobTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(0,0,0,0.55)'); grd.addColorStop(0.6, 'rgba(0,0,0,0.25)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
})();
const blobs = people.map((h) => {
  const b = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }));
  b.rotation.x = -Math.PI / 2;
  b.renderOrder = 1;
  scene.add(b);
  return { h, b };
});
const blobV = new THREE.Vector3();
function placeBlobs() {
  for (const { h, b } of blobs) {
    h.j.hips.getWorldPosition(blobV);
    b.position.set(blobV.x, 0.03, blobV.z);
    const lift = Math.max(0, h.root.position.y);
    b.material.opacity = 1 / (1 + lift * 2);
  }
}
const modelsReady = loadPlayerModel(new URL(`../models/player-${settings.players === 'women' ? 'women' : 'men'}.glb`, import.meta.url).href)
  .then((gltf) => { for (const h of people) h.useModel(gltf); })
  .catch((e) => console.warn('[cricket] player model unavailable, keeping the toy figures', e));
Promise.all([modelsReady, loadGenerated()]).then(([, gen]) => applyGenerated(gen));

/** Gemini-made artwork (genassets.js): ball leather, bat sticker, team crests, sponsor boards. */
function applyGenerated(gen) {
  if (gen.ball) {
    ball.material.map = genTexture(gen.ball, 1, { bg: '#8e1616' }); // leather under any gaps at the poles
    ball.material.color.set('#ffffff');
    ball.material.needsUpdate = true;
  }
  if (gen['bat-sticker']) bat.userData.sticker.material = new THREE.MeshStandardMaterial({ map: genTexture(gen['bat-sticker'], 1), transparent: true, alphaTest: 0.05, roughness: 0.45 });
  if (gen['crest-blue']) batter.addBadge(genTexture(gen['crest-blue'], 1));
  if (gen['crest-yellow']) {
    const crest = genTexture(gen['crest-yellow'], 1);
    for (const h of [bowler, keeper, ...fielders.map((f) => f.h)]) h.addBadge(crest);
  }
  // Stand banners (fascia), one per stand.
  fasciaMats.forEach((m, i) => {
    const a = gen[`fascia-${i + 1}`];
    if (!a) return;
    const tex = genTexture(a, 2, { repeat: [m.map.repeat.x, 1] });
    m.map = m.emissiveMap = tex;
    m.needsUpdate = true;
  });
  Object.keys(gen).filter((k) => k.startsWith('board-')).sort().slice(0, boardMats.length / 2).forEach((k, i) => {
    const m = boardMats[boardMats.length / 2 + i], tex = genTexture(gen[k], 2);
    m.map = m.emissiveMap = tex;
    m.needsUpdate = true;
  });
}

function placeField() {
  SPOTS.slice().sort(() => Math.random() - 0.5).slice(0, FIELD_N).forEach(([name, a, r], i) => {
    const f = fielders[i];
    f.a = a + (Math.random() - 0.5) * 0.15;
    f.r = r + (Math.random() - 0.5) * 4;
    f.name = name;
    f.home.copy(posOf(f.a, f.r));
    f.h.root.position.copy(f.home);
    f.h.root.lookAt(0, 0, 0);
    f.mode = 'idle';
  });
  drawMap();
}

/** Shots this innings ({aim, dist}), for the captain. */
const shotHistory = [];
/** Captain: plug the area the batter keeps hitting to (fielding.js), announced on the map. */
function captain() {
  const m = captainMove(fielders.map((f) => ({ x: f.home.x, z: f.home.z })), shotHistory);
  if (!m) return;
  const f = fielders[m.index];
  f.a = m.aim; f.r = m.r;
  f.home.copy(posOf(f.a, f.r));
  const near = SPOTS.reduce((b, s) => (Math.abs(wrap(s[1] - m.aim)) + Math.abs(s[2] - m.r) / 40 < Math.abs(wrap(b[1] - m.aim)) + Math.abs(b[2] - m.r) / 40 ? s : b));
  f.name = near[0];
  shotNote('Field change', `A fielder moves to ${f.name}`);
}

// Top-down field map (batter at the bottom, straight hits go up).
const MAPR = 80 / BOUNDARY;
const mapXY = (a, r) => [Math.sin(a) * r * MAPR, -Math.cos(a) * r * MAPR + 28];
let lastShotLine = null;
function drawMap(aim = null) {
  let s = `<circle cx="0" cy="0" r="80" fill="none" stroke="#fff" stroke-width="3" opacity=".85"/><rect x="-3" y="10" width="6" height="20" fill="#e8c27a" stroke="#1b1b3a" stroke-width="1.5"/>`;
  if (lastShotLine) { const [x, y] = mapXY(lastShotLine.a, Math.min(BOUNDARY, lastShotLine.d)); s += `<path d="M0 28 L${x} ${y}" stroke="${lastShotLine.c}" stroke-width="4" stroke-linecap="round" opacity=".8"/>`; }
  if (practice.target) { const [x, y] = mapXY(practice.target[1], BOUNDARY * 0.95); s += `<path d="M0 28 L${x} ${y}" stroke="#2f7cff" stroke-width="7" stroke-linecap="round" stroke-dasharray="10 6"/><circle cx="${x}" cy="${y}" r="9" fill="#2f7cff" stroke="#1b1b3a" stroke-width="2.5"/>`; }
  if (aim !== null) { const [x, y] = mapXY(aim, BOUNDARY * 0.9); s += `<path d="M0 28 L${x} ${y}" stroke="#ffd21f" stroke-width="5" stroke-linecap="round" stroke-dasharray="6 6"/>`; }
  for (const f of fielders) { const [x, y] = mapXY(f.a, f.r); s += `<circle cx="${x}" cy="${y}" r="6" fill="#ffd21f" stroke="#1b1b3a" stroke-width="2.5"/>`; }
  s += `<circle cx="0" cy="28" r="6" fill="#2f7cff" stroke="#1b1b3a" stroke-width="2.5"/>`;
  $('map').innerHTML = s;
}

// ═════════════════════════════ sound (short tones only) ═════════════════════════════
let ac = null;
function tone(freq, dur = 0.12, type = 'triangle', vol = 0.25) {
  try {
    ac ||= new AudioContext();
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, ac.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + dur);
  } catch { /* no audio */ }
}

/** Vibration patterns for the phone (ms on/off), by event. */
const BUZZ = {
  PERFECT: [40, 30, 90], GOOD: [45], EARLY: [20], LATE: [20], EDGED: [10, 25, 10], block: [15],
  four: [30, 40, 30, 40, 80], six: [50, 40, 50, 40, 160], wicket: [120, 80, 220],
};
/** The phone in your hand buzzes and plays the sound (bat crack, boundary, wicket). */
function feel(event, q = 1) {
  exemoo.haptic(BUZZ[event] ?? 25);
  const name = event === 'EDGED' ? 'edge' : BUZZ[event] && !['four', 'six', 'wicket'].includes(event) ? 'bat' : event;
  exemoo.send({ t: 'sound', name, q: Math.round(q * 100) / 100 });
}

// ═════════════════════════════ inputs: camera bat, phone remote ═════════════════════════════
const inputs = { camAt: 0, camOn: false, phoneOn: false };
const batcam = new SwingDetector();
/** Camera picture-in-picture with the tracked arms and hands (handcam.js). */
const handcam = createHandOverlay();
handcam.setVisible(false);
/** Right-side timing bar: the ball coming in, when to start the swing, where the bat met it (timingbar.js). */
const timingBar = createTimingBar({ lead: SWING_LEAD });
timingBar.setVisible(false);
/** Practice target zones (name, aim). */
const ZONES = [['fine leg', -2.4], ['square leg', -1.45], ['midwicket', -0.85], ['straight', 0], ['cover', 0.85], ['point', 1.45], ['third man', 2.4]];
/** Practice shot types: asked for before each ball in 'type' mode (name, prompt). */
const TYPES = [['drive', 'DRIVE: hands down'], ['loft', 'LOFT: hands up'], ['block', 'BLOCK: short, gentle']];
/**
 * Practice mode, logged as the label of every swing: 'zones' asks for a target zone before each ball, 'type'
 * asks for a shot type (drive, loft or block), which is what the phone-motion features are fitted against.
 */
const practice = { on: false, mode: 'off', target: null, want: null };
const swingLog = [];
let logToServer = false;
fetch('/api/info', { cache: 'no-store' }).then((r) => r.json()).then((i) => (logToServer = !!i.swingLog)).catch(() => {});
const camLive = () => performance.now() - inputs.camAt < 500;
const nowAt = () => performance.timeOrigin + performance.now();
/** Recent raw camera frames, kept for the training log. */
const camFrames = [];
/** The camera's reading of the last swing, shown on the map for a moment. */
let lastRead = null;

exemoo.on('pose', (pose) => {
  if (!pose.img) return;
  inputs.camAt = performance.now();
  camFrames.push({ at: Math.round(pose.at), img: pose.img });
  while (camFrames.length && pose.at - camFrames[0].at > 3000) camFrames.shift();
  const ev = batcam.update(pose);
  handcam.update(pose, batcam);
  if (ev === 'start') swing({ intent: batcam.swing });
  else if (ev === 'restart') reswing(batcam.swing);
  else if (ev === 'end') readSwing(batcam.swing);
});
// The phone's motion stream and compass, kept for the training log only: they do not change how shots play yet.
const imuFrames = [], compassFrames = [];
let imuLinear = true;
exemoo.on('packet', (p) => {
  if (!p.q || typeof p.at !== 'number') return;
  const r2 = (n) => Math.round(n * 100) / 100;
  imuFrames.push({ at: Math.round(p.at), q: p.q, acc: { x: r2(p.acc.x), y: r2(p.acc.y), z: r2(p.acc.z) }, gyro: p.gyro });
  while (imuFrames.length && p.at - imuFrames[0].at > 3000) imuFrames.shift();
});
exemoo.on('message', (m) => {
  if (m?.t !== 'compass') return;
  imuLinear = !!m.lin;
  compassFrames.push({ at: Math.round(nowAt()), ios: m.ios ?? null, iosAcc: m.iosAcc ?? null, abs: m.abs ?? null });
  while (compassFrames.length && nowAt() - compassFrames[0].at > 3000) compassFrames.shift();
});
exemoo.on('camera', (on) => (inputs.camOn = on));
exemoo.on('status', (s) => (inputs.phoneOn = !!s.connected));
exemoo.on('button', (b) => {
  if (b === 'recenter') return calibrate();
  if (b === 'pause' || (paused && b === 'action')) return togglePause();
  if (state === 'menu' || state === 'over') exemoo.nav(b);
});
setInterval(() => {
  $('chipCam').classList.toggle('ok', camLive());
  $('chipPhone').classList.toggle('ok', inputs.phoneOn);
  $('camBtn').hidden = !exemoo.inShell || camLive() || inputs.camOn;
  handcam.setVisible(camLive() || inputs.camOn);
}, 500);
$('camBtn').onclick = () => exemoo.setCamera(true);

let mouseAim = 0;
addEventListener('pointermove', (e) => (mouseAim = (e.clientX / innerWidth - 0.5) * 2.6));

let paused = false;
/** Pause / resume (phone Pause, P or Escape). The whole simulation stops; the camera is ignored. */
function togglePause() {
  if (['menu', 'over'].includes(state)) return;
  paused = !paused;
  $('paused').classList.toggle('hidden', !paused);
  exemoo.haptic(paused ? [30] : [15, 30, 15]);
}

function calibrate() {
  batcam.reset();
  exemoo.haptic([20, 40, 20]);
}

function pickTarget() {
  if (!practice.on) return (practice.target = practice.want = null);
  if (practice.mode === 'type') {
    let w;
    do w = TYPES[Math.floor(Math.random() * TYPES.length)];
    while (w === practice.want);
    practice.target = null;
    practice.want = w;
    $('targetLabel').textContent = 'PLAY A';
    $('target').textContent = w[1];
    return;
  }
  practice.want = null;
  $('targetLabel').textContent = 'HIT TO';
  let z;
  do z = ZONES[Math.floor(Math.random() * ZONES.length)];
  while (z === practice.target && ZONES.length > 1);
  practice.target = z;
  $('target').textContent = z[0].toUpperCase();
}
const PRACTICE_MODES = ['off', 'zones', 'type'];
const PRACTICE_TEXT = { off: 'Practice: OFF', zones: 'Practice: target zones', type: 'Practice: shot types' };
function setPractice(mode) {
  practice.mode = mode;
  practice.on = mode !== 'off';
  $('practiceBtn').textContent = PRACTICE_TEXT[mode];
  $('targetPill').hidden = !practice.on;
  pickTarget();
  drawMap();
}

/** Training log: the swing intent, its label and the raw camera frames around it (dev server only). */
function readSwing(sw) {
  lastRead = { aim: sw.direction, t: performance.now() };
  const label = !practice.on ? null
    : practice.want ? { type: practice.want[0], source: 'practice-type' }
    : practice.target ? { zone: practice.target[0], aim: practice.target[1], source: 'practice' } : null;
  const r3 = (n) => (Number.isFinite(n) ? Math.round(n * 1000) / 1000 : null);
  const rec = {
    v: 4,
    at: Math.round(sw.onsetAt),
    label,
    intent: { direction: r3(sw.direction), lift: r3(sw.lift), power: r3(sw.power), dx: r3(sw.dx), up: r3(sw.up), length: r3(sw.length), peak: r3(sw.peak), contactAt: Math.round(sw.contactAt) },
    usedAim: sw.usedAim ?? null,
    game: { state, ball: balls + 1 },
    frames: camFrames.filter((f) => f.at >= sw.onsetAt - 600 && f.at <= sw.onsetAt + 800),
    // Phone motion around the swing: summary features, the raw packets and the compass samples (empty without a phone).
    imu: swingFeatures(imuFrames, sw.onsetAt, sw.contactAt, compassFrames, imuLinear),
    imuFrames: imuFrames.filter((f) => f.at >= sw.onsetAt - 600 && f.at <= sw.onsetAt + 800).map((f) => ({ at: f.at, q: [f.q.x, f.q.y, f.q.z, f.q.w].map((n) => Math.round(n * 1e4) / 1e4), acc: [f.acc.x, f.acc.y, f.acc.z], gyro: [f.gyro.alpha, f.gyro.beta, f.gyro.gamma].map((n) => Math.round(n)) })),
    compass: compassFrames.filter((c) => c.at >= sw.onsetAt - 600 && c.at <= sw.onsetAt + 800),
  };
  swingLog.push(rec);
  if (swingLog.length > 100) swingLog.shift();
  if (logToServer) fetch('/api/swings', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(rec), keepalive: true }).catch(() => {});
}
function previewAim() {
  if (lastRead && performance.now() - lastRead.t < 2500) return lastRead.aim;
  return camLive() ? null : mouseAim;
}

// ═════════════════════════════ batting animation ═════════════════════════════
/**
 * The bat sweeps around a centre in front of the chest; the hands follow it with arm IK.
 * u(θ) = cosθ·U + sinθ·V is the blade direction: θ < 0 = lifted back, 0 = through the ball, > 0 = follow-through.
 * V points where the shot goes; cross-bat shots (pull, cut) tilt the plane toward horizontal.
 */
const swingState = { theta: -0.35, from: -0.35, to: -0.35, t: 0, dur: 0.001, aim: 0, loft: 0 };
const BAT_C = new THREE.Vector3(0.02, 1.16, 0.2), BAT_R = 0.34;
const tmp = { q: new THREE.Quaternion(), v: new THREE.Vector3(), u: new THREE.Vector3(), U: new THREE.Vector3(), V: new THREE.Vector3(), W: new THREE.Vector3() };
function swingPlane(aim, loft) {
  // Shot direction in the batter's local frame.
  const dirW = new THREE.Vector3(Math.sin(aim), 0, -Math.cos(aim));
  tmp.q.copy(batter.root.quaternion).invert();
  const V = dirW.applyQuaternion(tmp.q).normalize();
  const e = clamp((Math.abs(aim) - 0.7) * 1.1, 0, 1.15); // 0 = straight bat, ~1.1 = cross bat
  const W = new THREE.Vector3().crossVectors(V, new THREE.Vector3(0, 1, 0)).normalize();
  const U = new THREE.Vector3(0, -1, 0).multiplyScalar(Math.cos(e)).addScaledVector(W, Math.sin(e) * Math.sign(aim || 1)).normalize();
  return { U, V: V.clone().addScaledVector(new THREE.Vector3(0, 1, 0), loft * 0.25).normalize() };
}
function setBatTheta(theta, aim, loft) {
  const { U, V } = swingPlane(aim, loft);
  const u = U.clone().multiplyScalar(Math.cos(theta)).addScaledVector(V, Math.sin(theta)).normalize(); // local blade dir
  const handTopL = BAT_C.clone().addScaledVector(u, BAT_R * 0.55);
  const handTop = batter.root.localToWorld(handTopL.clone());
  const uW = u.clone().applyQuaternion(batter.root.quaternion);
  bat.position.copy(handTop).addScaledVector(uW, -0.04);
  bat.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), uW);
  // Turn the face toward the shot.
  const vW = V.clone().applyQuaternion(batter.root.quaternion);
  const faceNow = new THREE.Vector3(0, 0, 1).applyQuaternion(bat.quaternion);
  const proj = vW.clone().addScaledVector(uW, -vW.dot(uW)).normalize();
  const ang = Math.atan2(new THREE.Vector3().crossVectors(faceNow, proj).dot(uW), faceNow.dot(proj));
  bat.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(uW, ang));
  // Hands on the handle: top hand (left) above the bottom hand (right).
  batter.root.updateMatrixWorld(true);
  const poleL = batter.root.localToWorld(new THREE.Vector3(0.5, 0.9, 0.7));
  const poleR = batter.root.localToWorld(new THREE.Vector3(-0.5, 0.8, 0.6));
  batter.reach('L', handTop.clone().addScaledVector(uW, 0.03), poleL);
  batter.reach('R', handTop.clone().addScaledVector(uW, 0.14), poleR);
}

// ═════════════════════════════ game ═════════════════════════════
let state = 'menu'; // menu | stance | ready | bowling | live | after | after-out | over
let runs = 0, balls = 0, t = 0, phaseT = 0, recent = [];
let best = 0;
try { best = +(localStorage.getItem('exemoo.cricket.best') || 0); } catch { /* ignore */ }
let delivery = null, swingAt = -1, swingInfo = null, camShake = 0, umpireT = 0, bowlerT = 0;
/** After the ball: 'run' (n runs), 'celebrate', 'out' or null. */
let batterAct = null;
/** How long the result stays up before the next ball (s): longer while the batters are still running. */
let afterHold = 2;
let returnThrow = null; // { f, from, to, t, dur }
$('bestHud').textContent = best;
$('bestMenu').textContent = best ? `Best innings: ${best}` : '';

function start() {
  runs = 0; balls = 0; recent = []; lastShotLine = null; shotHistory.length = 0;
  $('menu').classList.add('hidden'); $('result').classList.add('hidden');
  resetStumps(); placeField(); updateHud();
  if (exemoo.inShell && !camLive() && !inputs.camOn) exemoo.setCamera(true);
  state = 'stance'; phaseT = 0;
  $('stance').classList.remove('hidden');
}
function updateHud() {
  $('runs').textContent = runs;
  $('balls').textContent = balls;
  $('bestHud').textContent = Math.max(best, runs);
  board.set({ runs, balls, best: Math.max(best, runs) });
  $('last').innerHTML = recent.slice(-8).map((r) => `<i class="${r === 'W' ? 'w' : r === 4 ? 'r4' : r === 6 ? 'r6' : ''}">${r === 0 ? '·' : r}</i>`).join('');
}
function call(text, color = 'var(--yellow)') { board.set({ call: text }); setTimeout(() => board.set({ call: '' }), 2200); const el = $('call'); el.textContent = text; el.style.color = color; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 1100); }
function shotNote(name, detail) { const el = $('shot'); el.innerHTML = `<b>${name}</b>${detail}`; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 1500); }
function resetStumps() { myStumps.parts.forEach((p, i) => { p.position.copy(myStumps.home[i].p); p.rotation.copy(myStumps.home[i].r); p.userData.v = null; }); }

const RUNUP = 2.0, RELEASE_AT = 2.35; // seconds into the bowler's routine
function nextBall() {
  state = 'ready'; phaseT = 0; swingAt = -1; swingInfo = null; bowlerT = 0;
  batterAct = null; returnThrow = null;
  batter.root.position.set(-0.36, 0, 0.55); batter.root.rotation.y = Math.PI / 2;
  partner.root.position.copy(PARTNER_HOME); partner.root.rotation.set(0, 0, 0);
  afterHold = 2;
  keeper.root.position.copy(KEEPER_HOME);
  keeper.root.rotation.set(0, Math.PI, 0);
  keeperF.mode = 'idle';
  ball.visible = false;
  if (balls > 0 && balls % 6 === 0) placeField();
  else captain();
  fielders.forEach((f) => { f.h.root.position.copy(f.home); f.h.root.lookAt(0, 0, 0); f.mode = 'idle'; });
  swingState.theta = swingState.from = swingState.to = -0.35;
  trail.reset();
  timingBar.reset();
  pickTarget();
  updateHud(); drawMap();
}
function bowl() {
  state = 'bowling';
  const speed = 23 + Math.random() * 8 + Math.min(10, balls * 0.25);
  const line = (Math.random() - 0.5) * 0.5;
  const bounceZ = -3.5 - Math.random() * 3;
  const start = new THREE.Vector3(0.62, 2.25, -19.6);
  const t1 = (bounceZ - start.z) / speed;
  const v = new THREE.Vector3((line * 0.7 - start.x) / t1, (0 - start.y + 4.9 * t1 * t1) / t1, speed);
  delivery = { p: start.clone(), v, bounced: false, line, hit: false, done: false, age: 0, releaseT: t, contactT: t + t1 + -bounceZ / speed };
  ball.position.copy(start);
  ball.visible = true;
  tone(220, 0.08, 'square', 0.06);
  // Lift the bat as the ball is released.
  animateBat(-2.1, 0.32);
}
function animateBat(to, dur) {
  swingState.from = swingState.theta; swingState.to = to; swingState.t = 0; swingState.dur = dur;
}
/** A swing: from the camera (`intent`, see batcam.js) or a click / Space (mouse aims). */
function swing(info) {
  if (paused || ['menu', 'over', 'stance', 'after-out'].includes(state)) return;
  const it = info.intent;
  const aim = it ? it.direction : mouseAim;
  const loft = it ? it.lift : 0.35;
  Object.assign(info, { aim, loft, power: it ? it.power : info.power ?? 0.7 });
  // The camera says when the bat meets the ball. The latest swing before the ball arrives counts, so a
  // backlift the camera mistook for a swing is replaced by the real stroke.
  const toContact = it ? (it.contactAt - nowAt()) / 1000 : 0.12;
  if (state === 'bowling' && delivery && !delivery.hit) {
    swingAt = t + toContact;
    swingInfo = info;
  }
  if (swingState.to > 1 && swingState.t < swingState.dur && swingState.t < 0.15) return; // just started one
  swingState.aim = aim; swingState.loft = loft;
  // The animated blade reaches the ball ~40% into the swing.
  if (swingState.theta > -1.5) swingState.theta = -2.1;
  animateBat(2.3 + loft * 0.6, clamp(Math.max(0, toContact) / 0.4, 0.2, 0.45));
}

/** The camera saw a backlift turn into the real stroke: re-time the swing from the turning point. */
function reswing(it) {
  if (swingInfo?.intent === it && delivery && !delivery.hit && state === 'bowling') swingAt = t + (it.contactAt - nowAt()) / 1000;
  else if (!swingInfo || swingInfo.intent !== it) return swing({ intent: it });
  swingState.aim = it.direction; swingState.loft = it.lift;
  swingState.theta = -2.1;
  animateBat(2.3 + it.lift * 0.6, clamp(Math.max(0, (it.contactAt - nowAt()) / 1000) / 0.4, 0.2, 0.45));
}

const SHOTS = [[-2.3, 'Leg glance'], [-1.5, 'Pull'], [-0.75, 'On drive'], [-0.2, 'Straight drive'], [0.75, 'Cover drive'], [1.5, 'Cut'], [2.3, 'Late cut']];
function shotName(a, lofted) {
  let n = SHOTS[0][1];
  for (const [lim, name] of SHOTS) if (a >= lim - 0.35) n = name;
  return lofted ? `Lofted ${n.toLowerCase()}` : n;
}

const GRADE_TEXT = { PERFECT: 'Perfect timing', EARLY: 'Too early', LATE: 'Too late', EDGED: 'Off the edge' };
function shotLabel(shot) {
  if (shot.kind === 'edge') return shot.aim > 0 ? 'Outside edge' : 'Inside edge';
  if (shot.kind === 'block') return Math.abs(shot.aim) < 0.5 ? 'Forward defence' : 'Soft push';
  return shotName(shot.aim, shot.kind === 'loft');
}

/** The ball reaches the bat: timing error + the camera's stroke → exit velocity (physics.js). */
function judge() {
  const d = delivery;
  const err = swingAt < 0 ? Infinity : swingAt - d.contactT; // − early, + late
  const info = swingInfo;
  if (!info || !Number.isFinite(err)) return false;
  // The camera kept refining the stroke while the bat came through: read it again at contact.
  const it = info.intent;
  if (it) Object.assign(info, { aim: it.direction, loft: it.lift, power: it.power });
  const shot = shotVelocity({ direction: info.aim, lift: info.loft, power: info.power }, err);
  if (!shot) return false;
  if (it) it.usedAim = info.aim;
  d.hit = true;
  d.b = { x: d.p.x, y: Math.max(d.p.y, 0.35), z: Math.min(d.p.z, -0.2), vx: shot.v.x, vy: shot.v.y, vz: shot.v.z, landed: false, bounces: 0 };
  d.v.set(shot.v.x, shot.v.y, shot.v.z);
  Object.assign(d, { quality: shot.grade, shot, aim: shot.aim, lofted: shot.kind === 'loft', landed: false });
  // Fielding: who gets to the ball first on its predicted path, and how (fielding.js).
  const players = fielders.map((f, i) => ({ id: i, x: f.h.root.position.x, z: f.h.root.position.z }));
  players.push({ id: 'K', x: keeper.root.position.x, z: keeper.root.position.z, react: FIELDING.keeperReact, keeper: true });
  d.plan = planFielding(predictPath(d.b, shot.v), players);
  d.fielder = d.plan.by === null ? null : d.plan.by === 'K' ? keeperF : fielders[d.plan.by];
  if (d.fielder) d.fielder.mode = 'intercept';
  // The batters set off as soon as the ball is played into the field (the plan says how many they'll make).
  if (d.plan.runs > 0 && d.plan.runs < 4) batterAct = { kind: 'run', n: d.plan.runs, t: -FIELDING.startRun };
  const perfect = shot.grade === 'PERFECT';
  tone(perfect ? 880 : shot.kind === 'edge' ? 1300 : 520, 0.15, 'triangle', 0.3);
  feel(shot.kind === 'block' ? 'block' : shot.grade, shot.quality);
  camShake = perfect ? 0.06 : 0.03;
  crowd.cheer(perfect ? 0.5 : 0.25);
  const onTarget = practice.want
    ? (shot.kind === practice.want[0] ? ' · as asked!' : ` · wanted a ${practice.want[0]}, got ${shot.kind === 'edge' ? 'an edge' : `a ${shot.kind}`}`)
    : practice.target && Math.abs(wrap(shot.aim - practice.target[1])) < 0.4 ? ' · on target!' : '';
  const timing = GRADE_TEXT[shot.grade] ?? (err < 0 ? 'A touch early' : 'A touch late');
  timingBar.result(err, shot.grade);
  handcam.flash(shot.grade, { PERFECT: '#2fc65a', GOOD: '#ffd21f', EARLY: '#ff9a3c', LATE: '#ff9a3c', EDGED: '#ff3b30' }[shot.grade]);
  shotNote(shotLabel(shot), timing + onTarget);
  return true;
}

/** Tell the player why the ball went by untouched: no swing seen, hands lost, too slow, or just off in time. */
function missNote(err) {
  let why;
  if (swingAt >= 0) why = `${Math.round(Math.abs(err) * 1000)} ms ${err < 0 ? 'early' : 'late'}: start on the SWING! line`;
  else if (!camLive()) return; // no camera: nothing to say about it
  else if (nowAt() - batcam.seenAt > 600) why = 'Hands not in view: step back so both arms show';
  else if (nowAt() - batcam.peakAt < 1000 && batcam.peakV > SWING_ON * 0.4) why = 'Swing not fast enough: make it quicker and bigger';
  else why = 'No swing seen: start when the ball crosses the SWING! line';
  shotNote('Missed', why);
  handcam.flash('NO SWING', '#ff9a3c');
}

const tmpV = new THREE.Vector3();
/** The planned fielder reaches the ball: catch, drop, stop, fumble or collect. */
function field(d) {
  const f = d.fielder, pl = d.plan;
  if (pl.action === 'catch') {
    d.held = true;
    return settle('W', f === keeperF ? 'CAUGHT BEHIND!' : `CAUGHT by ${f.name}!`);
  }
  if (pl.action === 'drop' || pl.action === 'fumble') {
    // Spilled: the ball pops loose and the fielder gathers it a moment later.
    shotNote(pl.action === 'drop' ? 'Dropped!' : 'Fumbled!', `${f.name[0].toUpperCase()}${f.name.slice(1)} spills it`);
    Object.assign(d.b, { vx: d.b.vx * 0.15, vz: d.b.vz * 0.15, vy: Math.max(1, d.b.vy * 0.1), rolling: false, landed: true });
    pl.t = d.age + (pl.action === 'drop' ? FIELDING.dropDelay : FIELDING.fumbleDelay) * 0.8;
    pl.action = 'collect';
    pl.at = { x: d.b.x, y: 0, z: d.b.z };
    return;
  }
  d.held = true;
  settle(pl.runs);
}

/** Run to the planned intercept point so as to arrive with the ball (after reacting). */
function intercept(f, dt) {
  const d = delivery, pl = d.plan, h = f.h;
  const to = tmpV.set(pl.at.x - h.root.position.x, 0, pl.at.z - h.root.position.z);
  const len = to.length(), left = pl.t - d.age;
  const react = f === keeperF ? FIELDING.keeperReact : FIELDING.react;
  let moving = false;
  if (d.age > react && len > 0.15) {
    const speed = left > 0.05 ? Math.min(FIELDING.run, len / left) : FIELDING.run;
    h.root.position.addScaledVector(to.normalize(), Math.min(len, speed * dt));
    moving = speed > 1;
  }
  h.root.lookAt(d.p.x, 0, d.p.z);
  h.blend = 18;
  h.pose(pl.dive && left < 0.3 ? POSES.dive : moving ? runPose(f.phase * 12, 1) : f === keeperF ? POSES.keeperUp : POSES.ready);
}

function settle(result, how) {
  delivery.done = true;
  balls++;
  if (delivery.hit) shotHistory.push({ aim: delivery.aim, dist: Math.hypot(delivery.p.x, delivery.p.z) });
  if (delivery.hit) lastShotLine = { a: delivery.aim, d: Math.hypot(delivery.p.x, delivery.p.z), c: result === 'W' ? '#ff3b30' : result >= 4 ? '#2fc65a' : '#ffffff' };
  if (result === 'W') {
    recent.push('W');
    call('OUT!', 'var(--red)');
    tone(110, 0.4, 'sawtooth', 0.2);
    feel('wicket');
    umpire.pose(POSES.umpOut); umpireT = 2;
    batterAct = { kind: 'out', t: 0 };
    fielders.forEach((f) => (f.mode = 'celebrate'));
    crowd.cheer(1);
    updateHud();
    state = 'after-out';
    return setTimeout(() => gameOver(how), 1800);
  }
  runs += result;
  recent.push(result);
  if (result >= 4) batterAct = { kind: 'celebrate', t: 0 };
  else if (result > 0 && batterAct?.kind !== 'run') batterAct = { kind: 'run', n: result, t: 0 };
  else if (result === 0) batterAct = null;
  // The next ball waits until the batters have finished their runs.
  afterHold = batterAct?.kind === 'run' ? Math.max(2, batterAct.n * FIELDING.runTime - batterAct.t + 0.8) : 2;
  // A fielder who stopped it throws it back in to the keeper.
  if (delivery.hit && delivery.fielder && delivery.fielder !== keeperF && result < 4) startThrow(delivery.fielder);
  if (result >= 4) feel(result === 6 ? 'six' : 'four');
  if (result === 6) { call('SIX!', 'var(--green)'); umpire.pose(POSES.umpSix); umpireT = 1.8; crowd.cheer(1); }
  else if (result === 4) { call('FOUR!', 'var(--blue)'); umpire.pose(POSES.umpFour); umpireT = 1.8; crowd.cheer(0.8); }
  else if (result > 0) call(`${result} RUN${result > 1 ? 'S' : ''}`, '#fff');
  else call('DOT', '#fff');
  state = 'after'; phaseT = 0;
  updateHud(); drawMap();
}
function startThrow(f) {
  f.mode = 'throw';
  const from = f.h.root.position.clone().setY(1.8);
  const to = keeper.root.position.clone().setY(1.0);
  returnThrow = { f, from, to, t: 0, dur: 0.5 + from.distanceTo(to) / 26, released: false };
  ball.visible = true;
}

function gameOver(how) {
  state = 'over';
  const isBest = runs > best;
  if (isBest) { best = runs; try { localStorage.setItem('exemoo.cricket.best', String(best)); } catch { /* ignore */ } }
  $('outHow').textContent = how;
  $('final').textContent = runs;
  $('finalSub').textContent = `${balls} balls · ${recent.filter((r) => r === 4).length} fours · ${recent.filter((r) => r === 6).length} sixes${isBest ? ' · NEW BEST!' : ` · best ${best}`}`;
  $('result').classList.remove('hidden');
  $('bestMenu').textContent = `Best innings: ${best}`;
  $('again').focus();
}

$('play').onclick = start;
$('again').onclick = start;
$('practiceBtn').onclick = () => setPractice(PRACTICE_MODES[(PRACTICE_MODES.indexOf(practice.mode) + 1) % PRACTICE_MODES.length]);
/** How-to-bat guide (howto.js): from the menu, H, and automatically on the first visit. */
const howto = createHowTo();
$('howtoBtn').onclick = () => howto.show();
addEventListener('keydown', (e) => { if (e.code === 'KeyH') howto.toggle(); });
try {
  if (!localStorage.getItem('exemoo.cricket.seenHowto')) { howto.show(); localStorage.setItem('exemoo.cricket.seenHowto', '1'); }
} catch { /* ignore */ }
$('playersBtn').textContent = `Players: ${settings.players === 'women' ? 'Women' : 'Men'}`;
$('playersBtn').onclick = () => changeSetting('players', settings.players === 'women' ? 'men' : 'women');
$('timeBtn').textContent = `Time: ${settings.time === 'night' ? 'Night' : 'Day'}`;
$('timeBtn').onclick = () => changeSetting('time', settings.time === 'night' ? 'day' : 'night');
$('toMenu').onclick = () => (exemoo.inShell ? exemoo.exit() : (location.href = '/'));
addEventListener('keydown', (e) => {
  if ((e.code === 'Space' || e.code === 'Enter') && !['menu', 'over'].includes(state)) { e.preventDefault(); swing({ power: 0.7 }); }
  if (e.code === 'KeyR') calibrate();
  if (e.code === 'KeyP' || e.code === 'Escape') togglePause();
});
$('scene').addEventListener('pointerdown', () => swing({ power: 0.7 }));

// ═════════════════════════════ per-frame animation ═════════════════════════════
const camHome = new THREE.Vector3(0.7, 2.7, 7.8), look = new THREE.Vector3(0.1, 0.55, -21);
const focusNow = look.clone(), camPos = camHome.clone();
let fovHome = 40;
function fitFov() { fovHome = Math.max(40, (2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(24)) / camera.aspect) * 180) / Math.PI); }
addEventListener('resize', fitFov);
fitFov();

function animateBowler(dt) {
  bowlerT += dt;
  const b = bowler;
  if (state === 'ready' || (state === 'bowling' && bowlerT < RELEASE_AT + 0.8) || state === 'live') {
    if (bowlerT < RUNUP) {
      // Run-up: accelerating strides toward the crease.
      const k = bowlerT / RUNUP;
      b.root.position.set(0.55, 0, -34 + 12 * smooth(k));
      b.blend = 20;
      b.pose(runPose(bowlerT * 11, 0.55 + k * 0.45));
    } else if (bowlerT < RELEASE_AT) {
      b.root.position.z = -22 + (bowlerT - RUNUP) * 1.5;
      b.blend = 16;
      b.pose(POSES.bowlGather);
    } else if (bowlerT < RELEASE_AT + 0.2) {
      b.blend = 26;
      b.pose(POSES.bowlRelease);
    } else {
      b.blend = 8;
      b.pose(POSES.bowlFollow);
      b.root.position.z += dt * 2.5 * Math.max(0, 1 - (bowlerT - RELEASE_AT) / 1.2);
    }
  } else {
    b.blend = 6;
    b.pose(POSES.idle);
    b.root.position.lerp(new THREE.Vector3(1.6, 0, -24), Math.min(1, dt * 1.5));
  }
  b.root.rotation.y = 0;
  b.update(dt);
}

function animateFielders(dt) {
  for (const f of fielders) {
    const h = f.h;
    f.phase += dt;
    if (f.mode === 'intercept' && delivery?.plan && !delivery.done) {
      intercept(f, dt);
    } else if (f.mode === 'throw' && returnThrow?.f === f) {
      h.root.lookAt(keeper.root.position.x, 0, keeper.root.position.z);
      h.blend = 14;
      h.pose(returnThrow.t < 0.35 ? POSES.throwBack : POSES.throwRelease);
    } else if (f.mode === 'celebrate') {
      h.blend = 8;
      h.pose({ ...POSES.celebrate, root: [0, 0.05 + Math.abs(Math.sin(f.phase * 8)) * 0.15, 0] });
    } else if (state === 'bowling' || state === 'live') {
      h.blend = 8;
      h.pose(POSES.ready);
    } else {
      // Walk back to position, then idle.
      const to = f.home.clone().sub(h.root.position); to.y = 0;
      if (to.length() > 0.3) { h.root.position.addScaledVector(to.normalize(), Math.min(to.length(), 2.4 * dt)); h.pose(runPose(f.phase * 7, 0.35)); h.root.lookAt(f.home.x, 0, f.home.z); }
      else { h.pose(POSES.idle); h.root.lookAt(0, 0, 0); }
      h.blend = 8;
    }
    h.update(dt);
  }
}

/** Non-striker: ready at the bowler's end, mirrors the striker's runs (they cross mid-pitch). */
function animatePartner(dt) {
  const act = batterAct;
  partner.blend = 12;
  if (act?.kind === 'run' && act.t >= 0) {
    const T = FIELDING.runTime, n = Math.min(act.n, 3), lap = Math.min(n - 1, Math.floor(act.t / T));
    const k = act.t >= n * T ? 1 : smooth((act.t - lap * T) / T);
    const toNear = lap % 2 === 0;
    const z = toNear ? CREASE.far + (CREASE.near - CREASE.far) * k : CREASE.near + (CREASE.far - CREASE.near) * k;
    partner.root.position.set(RUN_X.partner, 0, z);
    partner.root.rotation.y = toNear ? 0 : Math.PI;
    partner.pose(act.t < n * T ? runPose(act.t * 11 + 1.5, 1) : POSES.idle);
  } else {
    // Backing up: a couple of steps down the pitch as the bowler lets go.
    const backUp = state === 'bowling' || state === 'live' ? 1.2 : 0;
    const want = PARTNER_HOME.z + backUp;
    const zNow = partner.root.position.z;
    partner.root.position.z = zNow + (want - zNow) * Math.min(1, dt * 2.5);
    partner.pose(Math.abs(want - zNow) > 0.05 ? runPose(t * 6, 0.3) : POSES.idle);
  }
  partner.update(dt);
}

function animateBatter(dt) {
  // Legs + torso from the stance pose; the torso turns with the swing.
  const s = swingState;
  s.t += dt;
  const k = clamp(s.t / s.dur, 0, 1);
  s.theta = s.from + (s.to - s.from) * smooth(k);
  // Settle back to the stance after the follow-through (unless celebrating / walking off).
  if (k >= 1 && s.to > 1 && !batterAct) animateBat(-0.35, 0.6);
  // Waiting for the ball: little taps of the bat in the crease.
  if (k >= 1 && (state === 'ready' || state === 'stance') && bowlerT < RUNUP - 0.3) s.theta = -0.35 + Math.max(0, Math.sin(t * 5)) * -0.22;
  const act = batterAct;
  if (act) {
    act.t += dt;
    batter.blend = 10;
    if (act.kind === 'run' && act.t >= 0) {
      // Each run is the full length between the creases; the batter ends at the far end after an odd number.
      const T = FIELDING.runTime, n = Math.min(act.n, 3), lap = Math.min(n - 1, Math.floor(act.t / T));
      const k = act.t >= n * T ? 1 : smooth((act.t - lap * T) / T);
      const toFar = lap % 2 === 0;
      const z = toFar ? CREASE.near + (CREASE.far - CREASE.near) * k : CREASE.far + (CREASE.near - CREASE.far) * k;
      const running = act.t < n * T;
      batter.root.position.set(RUN_X.striker, 0, z);
      batter.root.rotation.y = toFar ? Math.PI : 0;
      batter.pose(running ? runPose(act.t * 11, 1) : POSES.idle);
      batter.update(dt);
      setBatTheta(-0.9, 0, 0);
      return;
    } else if (act.kind === 'celebrate') {
      // Bat raised to the crowd.
      batter.pose({ ...POSES.stance, spine: [-0.1, 0, 0], neck: [-0.3, 1.0, 0] });
      batter.update(dt);
      s.theta += (3.0 - s.theta) * Math.min(1, dt * 4);
      setBatTheta(s.theta, 0, 0.8);
      return;
    } else if (act.kind === 'out' && act.t > 0.6) {
      // Head down, walk back toward the pavilion (the camera).
      batter.root.rotation.y = 0;
      batter.root.position.z += dt * 1.2;
      batter.pose({ ...runPose(act.t * 5, 0.3), ...POSES.walkOff });
      batter.update(dt);
      setBatTheta(-0.6, 0, 0);
      return;
    }
  }
  const turn = clamp(s.theta / 2.3, -1, 1);
  batter.blend = 14;
  batter.pose({
    ...POSES.stance,
    spine: [0.22 - Math.max(0, turn) * 0.12, turn * 0.35, 0],
    chest: [0, turn * 0.45, 0],
    hipL: [-0.18 - Math.max(0, turn) * 0.35, 0, 0.18], kneeL: [0.32 + Math.max(0, turn) * 0.25, 0, 0],
  });
  batter.update(dt);
  setBatTheta(s.theta, s.aim, s.loft);
}

function step(dt) {
  t += dt; phaseT += dt;
  if (state === 'stance') {
    const p = Math.min(1, phaseT / 1.2);
    $('stanceBar').style.width = p * 100 + '%';
    if (p >= 1) {
      calibrate();
      $('stance').classList.add('hidden');
      nextBall();
    }
  }
  if (state === 'ready' && bowlerT >= RELEASE_AT) bowl();
  if (state === 'ready' || state === 'bowling') { if ((step.mapT = (step.mapT || 0) + dt) > 0.1) { step.mapT = 0; drawMap(previewAim()); } }

  if (delivery && !delivery.done) {
    const d = delivery;
    d.age += dt;
    if (d.hit) {
      stepBall(d.b, dt);
      d.p.set(d.b.x, d.b.y, d.b.z);
      d.v.set(d.b.vx, d.b.vy, d.b.vz);
      d.landed = d.b.landed;
    } else {
      d.v.y -= 9.8 * dt;
      d.p.addScaledVector(d.v, dt);
    }
    if (!d.hit) {
      if (!d.bounced && d.p.y <= BALL_R && d.v.y < 0) { d.bounced = true; d.p.y = BALL_R; d.v.y = Math.abs(d.v.y) * 0.55; d.v.z *= 0.92; tone(300, 0.04, 'square', 0.04); }
      // Judge at the bat; a late swing still counts until the ball is almost at the stumps.
      if (state === 'bowling' && d.p.z >= -0.3 && (swingAt >= 0 || d.p.z >= 0.9)) {
        state = 'live';
        if (!judge()) {
          d.bowled = Math.abs(d.line) < 0.13;
          // Show where the swing landed against the ball (or that there was none).
          const err = swingAt < 0 ? 0.3 : swingAt - d.contactT;
          timingBar.result(err, swingAt < 0 ? 'MISS' : timingGrade(err));
          missNote(err);
        }
      }
      if (d.bowled && d.p.z >= 1.18) {
        myStumps.parts.forEach((p) => (p.userData.v = new THREE.Vector3((Math.random() - 0.5) * 3, 2 + Math.random() * 2, 2 + Math.random() * 2)));
        settle('W', 'BOWLED!');
      } else if (d.p.z > KEEPER_HOME.z - 0.4 && !d.bowled) { d.v.multiplyScalar(0.1); settle(0); }
    } else {
      if (d.fielder && d.age >= d.plan.t) field(d);
      else if (outOfField(d.p.x, d.p.z)) settle(d.landed ? 4 : 6);
      else if (d.age > 12) settle(0); // safety net
    }
    ball.position.copy(d.p);
    ball.rotation.x -= dt * Math.min(40, d.v.length() * 1.2); // spin, so the seam shows
    // Trail: faint for the delivery, coloured by timing once hit; it runs out when the ball is held or stops.
    if (d.held || (d.hit && d.b.rolling && Math.hypot(d.b.vx, d.b.vz) < 3)) trail.fade(t);
    else {
      trail.style(d.hit ? d.shot.grade : 'delivery');
      trail.push(ball.position, t);
    }
  } else trail.fade(t);
  // A caught or gathered ball sits in the fielder's hand until it is thrown.
  if (delivery?.held && !returnThrow) ball.position.copy(delivery.fielder.h.j.wristR.getWorldPosition(tmpV));
  if (state === 'after' && phaseT > afterHold) { delivery = null; nextBall(); }

  ballShadow.visible = ball.visible;
  ballShadow.position.set(ball.position.x, 0.02, ball.position.z);
  ballShadow.material.opacity = clamp(0.3 - ball.position.y * 0.03, 0.05, 0.3);

  for (const p of myStumps.parts) {
    const v = p.userData.v; if (!v) continue;
    v.y -= 9.8 * dt; p.position.addScaledVector(v, dt); p.rotation.x += dt * 8;
    if (p.position.y < 0.03) { p.position.y = 0.03; p.userData.v = null; }
  }

  if (returnThrow) {
    const r = returnThrow;
    r.t += dt;
    const k = clamp((r.t - 0.35) / r.dur, 0, 1);
    if (r.t < 0.35) ball.position.copy(r.f.h.j.wristR.getWorldPosition(new THREE.Vector3()));
    else {
      ball.position.lerpVectors(r.from, r.to, k);
      ball.position.y += Math.sin(Math.PI * k) * Math.min(8, r.from.distanceTo(r.to) * 0.12);
    }
    if (k >= 1) { r.f.mode = 'idle'; ball.position.copy(keeper.j.wristL.getWorldPosition(new THREE.Vector3())); }
  }
  // Keeper: squat while the bowler runs in, rise as the ball arrives, gather throws.
  keeperF.phase += dt;
  if (keeperF.mode === 'intercept' && delivery?.plan && !delivery.done) intercept(keeperF, dt);
  else {
    keeper.blend = 9;
    keeper.pose(state === 'live' || state === 'after' || state === 'after-out' ? POSES.keeperUp : POSES.keeper);
  }
  if (delivery && !delivery.hit && !delivery.done && delivery.p.z > 0.5) {
    // Ball beat the bat: keeper takes it.
    const hands = keeper.j.wristL.getWorldPosition(new THREE.Vector3());
    if (delivery.p.z > KEEPER_HOME.z - 0.6) delivery.p.lerp(hands, 0.6);
  }
  keeper.update(dt);
  animateBowler(dt);
  animateFielders(dt);
  animateBatter(dt);
  animatePartner(dt);
  if ((umpireT -= dt) <= 0) umpire.pose(POSES.umpWatch);
  umpire.blend = 7;
  umpire.update(dt);
  crowd.update(t, dt);
  if (scene.userData.windmill) scene.userData.windmill.rotation.z += dt * 0.6;

  // Camera: behind the striker's stumps; after a hit it rises and pans with the ball, then comes back.
  const following = (delivery?.hit && !delivery.done) || (state === 'after' && delivery?.hit && phaseT < 1.3);
  const wantPos = following ? new THREE.Vector3(camHome.x * 0.3, 6 + Math.min(10, Math.hypot(ball.position.x, ball.position.z) * 0.12), camHome.z + 3) : camHome;
  camPos.lerp(wantPos, Math.min(1, dt * (following ? 1.8 : 2.5)));
  focusNow.lerp(following ? ball.position : look, Math.min(1, dt * (following ? 4 : 2.5)));
  const fov = following ? fovHome + 14 : fovHome;
  if (Math.abs(camera.fov - fov) > 0.05) { camera.fov += (fov - camera.fov) * Math.min(1, dt * 2); camera.updateProjectionMatrix(); }
  camera.position.copy(camPos);
  if (camShake > 0) { camera.position.x += (Math.random() - 0.5) * camShake; camera.position.y += (Math.random() - 0.5) * camShake; camShake = Math.max(0, camShake - dt * 0.2); }
  camera.lookAt(focusNow);
  // Debug close-ups: window.__cricket.cam = { pos: [x,y,z], at: [x,y,z], fov }
  const dbg = window.__cricket?.cam;
  if (dbg) { camera.position.set(...dbg.pos); camera.lookAt(...dbg.at); if (dbg.fov) { camera.fov = dbg.fov; camera.updateProjectionMatrix(); } }
}

let last = performance.now();
function frame(now) {
  if (renderer.domElement.clientWidth !== innerWidth || renderer.domElement.clientHeight !== innerHeight) { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; fitFov(); camera.updateProjectionMatrix(); }
  const dt = paused ? 0 : Math.min(0.05, (now - last) / 1000);
  last = now;
  step(dt);
  for (const h of people) h.sync();
  trail.update(camera);
  placeBlobs();
  handcam.draw();
  const d = delivery;
  timingBar.setVisible(!['menu', 'over'].includes(state));
  timingBar.update({ active: state === 'bowling' && !!d && !d.hit, sinceRelease: d ? t - d.releaseT : 0, flightTime: d ? d.contactT - d.releaseT : 0 });
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
camera.position.copy(camHome); camera.fov = fovHome; camera.updateProjectionMatrix(); camera.lookAt(look);
bowler.root.position.set(1.6, 0, -24);
placeField(); updateHud();
fielders.forEach((f) => { f.h.pose(POSES.idle); f.h.snap(); });
batter.pose(POSES.stance); batter.snap();
$('play').focus();
requestAnimationFrame(frame);
window.__cricket = { batter, bat, bowler, umpire, camera, swing, setBatTheta, swingState, batcam, swingLog, practice, ball, state: () => state, delivery: () => delivery, time: () => t };
