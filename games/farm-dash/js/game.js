import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { createAssets } from './assets.js';
import { World, LANE_X } from './world.js';
import { Player } from './player.js';
import { AudioFX } from './audio.js';
import { InputController } from './input.js';
import { Ambient } from './ambient.js';
import { FX } from './fx.js';

const GRAVITY = 40;
const JUMP_V = 13.5;
const SNEAKER_JUMP_V = 17.5;
const ROLL_TIME = 0.65;
const POWER_TIME = { magnet: 10, double: 10, sneakers: 10 };
const POWER_LABEL = { magnet: 'Magnet', double: '2× Score', sneakers: 'Super Jump' };
const START_SPEED = 16, MAX_SPEED = 34;

const $ = (id) => document.getElementById(id);
const ui = {
  menu: $('menu'), hud: $('hud'), over: $('gameover'), pause: $('pause'),
  score: $('score'), coins: $('coins'), mult: $('mult'), powers: $('powers'), toast: $('toast'),
  finalScore: $('final-score'), finalCoins: $('final-coins'), best: $('best'), newBest: $('new-best'),
  camBtn: $('enable-camera'), kbBtn: $('play-keyboard'), startHint: $('start-hint'),
  camWrap: $('cam-wrap'), camStatus: $('camera-status'), menuStatus: $('menu-status'),
  recal: $('recalibrate'), mute: $('mute'), restart: $('restart'), resume: $('resume'),
};

// ---------- renderer / scene ----------
const renderer = new THREE.WebGLRenderer({ canvas: $('game'), antialias: true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
const assets = createAssets();
scene.background = assets.sky;
scene.fog = new THREE.Fog('#ffe2b8', 55, 150);

const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 300);
scene.add(new THREE.HemisphereLight('#cfe8ff', '#6b5a48', 1.1));
const sun = new THREE.DirectionalLight('#fff1d6', 2.2);
sun.position.set(-8, 18, 6);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -40, near: 1, far: 70 });
sun.shadow.bias = -0.0008;
sun.target.position.set(0, 0, -12);
scene.add(sun, sun.target);

const world = new World(scene, assets);
const player = new Player();
scene.add(player.group);
const audio = new AudioFX();
const ambient = new Ambient(scene);

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = w / h < 1 ? 78 : 62;   // widen on portrait screens
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

const fx = new FX(scene, camera);
const POWER_COLOR = { magnet: '#ff3b3b', double: '#a24bff', sneakers: '#21d07a' };

// ---------- game state ----------
let state = 'menu';
let best = Number(localStorage.getItem('subwayRunnerBest') || 0);
let p, run, time = 0, overAt = 0, shake = 0;

function newRun() {
  p = { lane: 1, fromLane: 1, targetLane: 1, x: 0, prevX: 0, y: 0, vy: 0, onGround: true, roll: 0, stumbleCd: 0 };
  run = { speed: START_SPEED, score: 0, coins: 0, powers: {}, stumbles: [], slow: 0 };
  world.reset();
  fx.reset();
  player.reset();
  player.group.position.set(0, 0, 0);
}
newRun();

function startGame() {
  if (state === 'playing') return;
  if (state === 'over' && performance.now() - overAt < 1200) return;
  audio.unlock();
  if (state === 'over') newRun();
  state = 'playing';
  ui.menu.classList.add('hidden');
  ui.over.classList.add('hidden');
  ui.pause.classList.add('hidden');
  ui.hud.classList.remove('hidden');
  audio.play('start');
  audio.startMusic();
}

function togglePause() {
  if (state === 'playing') { state = 'paused'; ui.pause.classList.remove('hidden'); audio.stopMusic(); }
  else if (state === 'paused') { state = 'playing'; ui.pause.classList.add('hidden'); audio.startMusic(); }
}

function gameOver() {
  state = 'over';
  overAt = performance.now();
  shake = 0.5;
  audio.play('crash');
  fx.crash(p.x, p.y);
  audio.stopMusic();
  const score = Math.floor(run.score);
  const isBest = score > best;
  if (isBest) { best = score; try { localStorage.setItem('subwayRunnerBest', String(best)); } catch {} }
  setTimeout(() => {
    ui.finalScore.textContent = score.toLocaleString();
    ui.finalCoins.textContent = run.coins;
    ui.best.textContent = best.toLocaleString();
    ui.newBest.classList.toggle('hidden', !isBest);
    ui.hud.classList.add('hidden');
    ui.over.classList.remove('hidden');
  }, 900);
}

let toastTimer;
function toast(text) {
  ui.toast.textContent = text;
  ui.toast.classList.remove('show');
  void ui.toast.offsetWidth;
  ui.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ui.toast.classList.remove('show'), 1400);
}

// ---------- actions ----------
function moveTo(lane) {
  lane = Math.max(0, Math.min(2, lane));
  if (lane === p.targetLane) return;
  p.fromLane = p.targetLane;
  p.targetLane = lane;
  audio.play('lane');
}

function onAction(action, data) {
  if (action === 'pause') { togglePause(); return; }
  if (state === 'menu' || state === 'over') {
    if (action === 'handsUp' || (action === 'jump' && !input.cameraActive) ) startGame();
    return;
  }
  if (state === 'paused') { if (action === 'handsUp') togglePause(); return; }
  if (state !== 'playing') return;
  switch (action) {
    case 'left': moveTo(p.targetLane - 1); break;
    case 'right': moveTo(p.targetLane + 1); break;
    case 'lane': moveTo(data); break;
    case 'jump':
      if (p.onGround) {
        p.vy = run.powers.sneakers > 0 ? SNEAKER_JUMP_V : JUMP_V;
        p.onGround = false;
        p.roll = 0;
        audio.play('jump');
        fx.jump(p.x, p.y);
      }
      break;
    case 'roll':
      if (p.roll <= 0) { audio.play('roll'); fx.roll(p.x, p.y); }
      p.roll = ROLL_TIME;
      if (!p.onGround) p.vy = Math.min(p.vy, -26);   // slam down from a jump
      break;
  }
}

const input = new InputController({
  onAction,
  onStatus: (text) => { ui.camStatus.textContent = text; ui.menuStatus.textContent = text; },
  video: $('camera-preview'),
  overlay: $('camera-overlay'),
});
input.enableKeyboard();

ui.camBtn.addEventListener('click', async () => {
  audio.unlock();
  audio.play('click');
  ui.camBtn.disabled = true;
  ui.camWrap.classList.remove('hidden');
  const ok = await input.startCamera();
  if (ok) {
    ui.camBtn.classList.add('hidden');
    ui.startHint.textContent = 'Stand back so your whole upper body is visible, then RAISE BOTH HANDS to start';
  } else {
    ui.camBtn.disabled = false;
    ui.camWrap.classList.add('hidden');
  }
});
ui.kbBtn.addEventListener('click', () => { audio.unlock(); startGame(); });
ui.restart.addEventListener('click', () => startGame());
ui.resume.addEventListener('click', () => togglePause());
ui.recal.addEventListener('click', () => input.calibrate());
ui.mute.addEventListener('click', () => {
  audio.unlock();
  audio.setMuted(!audio.muted);
  ui.mute.textContent = audio.muted ? '🔇' : '🔊';
});

// ---------- simulation ----------
function stumble() {
  if (p.stumbleCd > 0) return;
  p.stumbleCd = 0.8;
  p.targetLane = p.fromLane;
  player.flash = 0.8;
  shake = 0.25;
  run.slow = 0.6;
  audio.play('stumble');
  fx.stumble(p.x, p.y);
  const now = time;
  run.stumbles = run.stumbles.filter((t) => now - t < 8);
  run.stumbles.push(now);
  if (run.stumbles.length >= 2) { toast('Caught! Two stumbles'); gameOver(); }
  else toast('Careful!');
}

function step(dt) {
  run.speed = Math.min(MAX_SPEED, START_SPEED + world.travel * 0.004);
  const speed = run.speed * (run.slow > 0 ? 0.7 : 1);
  run.slow -= dt;
  p.stumbleCd -= dt;

  world.update(dt, speed, time);

  // horizontal
  p.prevX = p.x;
  const tx = LANE_X[p.targetLane];
  p.x += (tx - p.x) * Math.min(1, dt * 13);
  if (Math.abs(tx - p.x) < 0.02) { p.x = tx; p.lane = p.targetLane; }

  // vertical
  p.vy -= GRAVITY * dt;
  p.y += p.vy * dt;
  if (p.roll > 0) p.roll -= dt;
  const h = p.roll > 0 ? 0.8 : 1.7;

  const { ground, hit } = world.collide({ x: p.x, prevX: p.prevX, y: p.y, h });
  if (p.y <= ground) {
    if (!p.onGround && p.vy < -4) fx.land(p.x, ground);
    p.y = ground;
    p.vy = 0;
    p.onGround = true;
  } else if (p.y > ground + 0.05) {
    p.onGround = false;
  }

  if (hit) {
    if (hit.type === 'side') stumble();
    else { gameOver(); return; }
  }

  // pickups
  const magnet = run.powers.magnet > 0;
  const mult = run.powers.double > 0 ? 2 : 1;
  const center = new THREE.Vector3(p.x, p.y + 0.9, 0);
  for (let i = world.coins.length - 1; i >= 0; i--) {
    const c = world.coins[i], cp = c.mesh.position;
    if (magnet && cp.z > -22 && cp.z < 2) c.magnet = true;
    if (c.magnet) {
      cp.lerp(center, Math.min(1, dt * 12));
    }
    if (Math.abs(cp.x - center.x) < 0.9 && Math.abs(cp.z) < 0.9 && Math.abs(cp.y - center.y) < 1.2) {
      world.root.remove(c.mesh);
      world.coins.splice(i, 1);
      run.coins += 1;
      run.score += 10 * mult;
      fx.coin(cp);
      audio.play('coin');
    }
  }
  for (let i = world.powerups.length - 1; i >= 0; i--) {
    const pu = world.powerups[i], pp = pu.group.position;
    if (Math.abs(pp.x - center.x) < 1 && Math.abs(pp.z) < 1 && Math.abs(pp.y - center.y) < 1.4) {
      world.root.remove(pu.group);
      world.powerups.splice(i, 1);
      run.powers[pu.type] = POWER_TIME[pu.type];
      fx.powerup(pp, POWER_COLOR[pu.type]);
      audio.play('powerup');
      toast(POWER_LABEL[pu.type] + '!');
    }
  }
  for (const k in run.powers) run.powers[k] = Math.max(0, run.powers[k] - dt);

  run.score += speed * dt * 0.5 * mult;
}

function updateHud() {
  ui.score.textContent = Math.floor(run.score).toLocaleString();
  ui.coins.textContent = run.coins;
  ui.mult.textContent = run.powers.double > 0 ? '×2' : '×1';
  ui.mult.classList.toggle('hot', run.powers.double > 0);
  let html = '';
  for (const k in run.powers) {
    const t = run.powers[k];
    if (t > 0) html += `<div class="power ${k}"><span>${POWER_LABEL[k]}</span><i style="width:${(t / POWER_TIME[k]) * 100}%"></i></div>`;
  }
  ui.powers.innerHTML = html;
}

// ---------- render loop ----------
const camPos = new THREE.Vector3(0, 4.4, 7.6);
const camLook = new THREE.Vector3(0, 1.4, -8);
let last = performance.now();
let hudTick = 0;

function frame(now) {
  requestAnimationFrame(frame);
  let dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  time += dt;

  if (state === 'playing') {
    // sub-step so fast speeds never tunnel through thin obstacles
    const n = Math.ceil(dt / (1 / 120));
    for (let i = 0; i < n && state === 'playing'; i++) step(dt / n);
    if ((hudTick += dt) > 0.05) { hudTick = 0; updateHud(); }
  } else if (state === 'menu') {
    world.update(dt, 6, time);
  }
  ambient.update(state === 'paused' ? 0 : dt, state === 'playing' ? run.speed : state === 'menu' ? 6 : 0, time);

  // animate character
  const mode = state === 'over' ? 'dead' : state === 'menu' ? 'idle' : state === 'paused' ? 'idle'
    : p.roll > 0 && p.onGround ? 'roll' : !p.onGround ? 'air' : 'run';
  player.group.position.set(p.x, p.y, 0);
  player.animate({
    dt: state === 'paused' ? 0 : dt,
    mode, speed: run.speed,
    turn: state === 'menu' ? Math.PI : 0,   // face the camera on the title screen
    lean: (LANE_X[p.targetLane] - p.x) / 2.5,
    rollT: 1 - Math.max(0, p.roll) / ROLL_TIME,
  });

  // camera follow
  const targetPos = new THREE.Vector3(p.x * 0.75, 4.4 + p.y * 0.75, 7.6);
  const targetLook = new THREE.Vector3(p.x * 0.6, 1.4 + p.y * 0.6, -8);
  if (state === 'menu') { targetPos.set(Math.sin(time * 0.3) * 1.5, 1.5, 3.4); targetLook.set(0, 1.05, 0); }
  camPos.lerp(targetPos, Math.min(1, dt * 6));
  camLook.lerp(targetLook, Math.min(1, dt * 8));
  camera.position.copy(camPos);
  if (shake > 0) {
    shake -= dt;
    camera.position.x += (Math.random() - 0.5) * shake;
    camera.position.y += (Math.random() - 0.5) * shake;
  }
  camera.lookAt(camLook);
  sun.position.set(p.x - 8, 18, 6);
  sun.target.position.set(p.x, 0, -12);

  fx.update(state === 'paused' ? 0 : dt, {
    x: p.x, y: p.y, onGround: p.onGround, rolling: p.roll > 0, speed: run.speed,
    playing: state === 'playing', powers: run.powers,
  });
  renderer.render(scene, camera);
}
requestAnimationFrame(frame);

ui.best.textContent = best.toLocaleString();
