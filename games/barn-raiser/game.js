// Barn Raiser: steer a hay-loft crane with your hand in front of the laptop camera, drop hay bales,
// crates and crates of sleepy animals onto a tower that grows above the barn. Overhangs are sliced
// off, perfect drops keep the width and chain a bonus, misses cost one of three tries.
// Players take turns in front of the camera (hot seat); phone tilt or keys work without a camera.
// Original Exemoo party minigame.
import { startParty } from './party.js';
import { INK, RED, YELLOW, BLUE, GREEN, TAU, clamp, lerp, rand, rr, inked, circle, gloss, label, sparkle, cloud, farmBackdrop, drawAnimal, Particles } from './art.js';

// ───────────── tuning (world units: 1 unit ≈ 1 px at 760 px screen height) ─────────────
const BH = 46; // block height
const BASE_W = 250; // barn roof deck
const START_W = 190;
const MAX_W = 200;
const MIN_LAND = 14; // narrower overlap than this = the load slips off
const PERFECT = 8; // centre error for a perfect drop
const LIVES = 3;
const TURN_SECONDS = 45;
const ROPE = 96;
const PEND = ROPE + BH / 2; // pendulum length to the load centre
const GRAV = 1500;
const READY_SECONDS = 4;
const TURNOVER_SECONDS = 2.2;
const ANIMALS = ['cow', 'pig', 'sheep', 'chick'];
const MAX_TILT = 0.5; // rad of phone roll for full sweep

let party = null;
let players = [];
let demo = true;
let turn = 0;
/** 'ready' | 'play' | 'turnover' | 'done' */
let phase = 'ready';
let phaseT = 0;
let lastBeep = 0;
let record = 0; // tallest tower this session
let demoG = null;
let W = 1280, H = 720;
const fx = new Particles();
const popups = [];

// ───────────── camera / hand input ─────────────
const cam = {
  inShell: false,
  on: null, // shell camera running (null = unknown)
  everPose: false,
  lastPoseAt: 0,
  lastBodyAt: 0,
  lastVisAt: 0,
  pose: null,
  x: 0, // -1..1 hand position, mirrored like a mirror
  rawX: 0,
  center: 0,
  otherUp: false,
  otherH: 0, // 0..1 how far the free hand is raised toward the drop line
  hist: [],
  lastGesture: 0,
  gestureFlash: 0,
  asked: false,
};

function onPose(pose) {
  const now = performance.now();
  cam.everPose = true;
  cam.on = true;
  cam.lastPoseAt = now;
  cam.pose = pose;
  if (pose.img) cam.lastBodyAt = now;
  if (!pose.visible || !pose.wrist || !pose.shoulder) {
    cam.hist.length = 0;
    return;
  }
  cam.lastVisAt = now;
  const img = pose.img;
  const right = pose.hand !== 'left';
  const side = right ? 1 : -1;
  const sc = pose.scale || 0.2;
  let mid = pose.shoulder.x - side * sc * 0.5;
  let shY = pose.shoulder.y;
  if (img?.ls && img?.rs && img.ls[2] > 0.5 && img.rs[2] > 0.5) {
    mid = (img.ls[0] + img.rs[0]) / 2;
    shY = (img.ls[1] + img.rs[1]) / 2;
  }
  // The steering hand rests a little to its own side; reach across the body or out wide to sweep.
  cam.rawX = pose.wrist.x - (mid + side * sc * 0.35);
  cam.x = clamp((cam.rawX - cam.center) / (sc * 1.35), -1, 1);
  cam.sc = sc;
  cam.shY = shY;

  // Gesture 1: raise the other hand above your head line.
  const o = img?.[right ? 'lw' : 'rw'];
  if (o && o[2] > 0.5) {
    const line = shY - sc * 0.55;
    cam.otherH = clamp((shY + sc * 0.2 - o[1]) / (shY + sc * 0.2 - line), 0, 1);
    if (!cam.otherUp && o[1] < line) {
      cam.otherUp = true;
      gesture();
    } else if (cam.otherUp && o[1] > shY - sc * 0.1) cam.otherUp = false;
  } else {
    cam.otherH = 0;
    cam.otherUp = false;
  }
  // Gesture 2: a quick downward jab of the steering hand.
  cam.hist.push({ t: now, x: pose.wrist.x, y: pose.wrist.y });
  while (cam.hist.length && now - cam.hist[0].t > 180) cam.hist.shift();
  const h0 = cam.hist[0];
  if (h0 && now - h0.t > 90 && pose.wrist.y - h0.y > sc * 0.85 && Math.abs(pose.wrist.x - h0.x) < sc * 0.5) {
    cam.hist.length = 0;
    gesture();
  }
}

function gesture() {
  const now = performance.now();
  if (now - cam.lastGesture < 650) return;
  cam.lastGesture = now;
  cam.gestureFlash = 1;
  const p = current();
  if (p && p.kind === 'human' && phase === 'play' && party?.state === 'play') drop(p.g);
}

const camFresh = () => performance.now() - cam.lastVisAt < 450;
function camStatus() {
  const now = performance.now();
  if (!cam.inShell) return { ok: false, text: 'Camera works inside Exemoo', sub: 'Tilt a phone or use keys' };
  if (cam.on === false || (!cam.everPose && cam.on !== true)) return { ok: false, text: 'Camera is off', sub: 'Turn it on from the title screen' };
  if (camFresh()) return { ok: true, text: 'Hand tracked', sub: 'Raise other hand to drop' };
  if (now - cam.lastBodyAt < 600) return { ok: false, text: 'Show your hand', sub: 'Keep your steering hand in view' };
  return { ok: false, text: 'Step into view', sub: 'Stand back so the camera sees you' };
}

// ───────────── towers ─────────────
function newTower(p) {
  return {
    p,
    blocks: [],
    score: 0,
    floors: 0,
    lives: LIVES,
    streak: 0,
    best: 0,
    time: 0,
    perfects: 0,
    camY: -150,
    sway: 0,
    swayPh: 0,
    trolleyX: 0,
    trolleyV: 0,
    trolleyA: 0,
    theta: 0,
    omega: 0,
    targetX: 0,
    keyX: 0,
    lastKeyAt: -9,
    src: 'keys',
    load: null,
    falling: null,
    spawnT: 0.3,
    chunks: [],
    wind: 0,
    windTarget: 0,
    windT: 6,
    cpu: { err: 0, wait: 0, skill: rand(0.6, 0.92) },
    animalNext: ANIMALS[(Math.random() * 4) | 0],
    over: false,
  };
}

const topH = (g) => g.blocks.length * BH;
const topBlock = (g) => g.blocks[g.blocks.length - 1] || { x: 0, w: BASE_W, base: true };
function swayOff(g, i) {
  const n = Math.max(1, g.blocks.length);
  return g.sway * Math.sin(g.swayPh) * Math.pow((i + 1) / n, 1.3);
}
const damping = (g) => Math.max(0.35, 1.3 - g.floors * 0.05);
const railH = (g) => g.camY + 530;
const range = () => Math.min(340, (W / 2) / (H / 760) - 190);

function nextKind(g) {
  const f = g.floors + 1;
  if (f % 5 === 0) return 'snooze';
  return f % 3 === 0 ? 'crate' : 'hay';
}

function spawnLoad(g) {
  const kind = nextKind(g);
  g.load = { w: topBlock(g).base ? START_W : topBlock(g).w, kind, animal: kind === 'snooze' ? g.animalNext : null, t: 0, seed: Math.random() };
  if (kind === 'snooze') g.animalNext = ANIMALS[(Math.random() * 4) | 0];
  g.cpu.err = rand(-1, 1) * (7 + g.floors * 2.4) * (1.35 - g.cpu.skill) + (Math.random() < 0.1 + g.floors * 0.01 ? rand(-1, 1) * 60 : 0);
  g.cpu.wait = rand(0.5, 1.2);
  // The crane hands over each load with a swing that grows with the tower: time the release.
  g.theta = (Math.random() < 0.5 ? -1 : 1) * Math.min(0.5, 0.16 + g.floors * 0.018);
  g.omega = 0;
  g.cpu.hold = 0;
}

function loadPos(g) {
  const pivotH = railH(g) - 30;
  const cx = g.trolleyX + Math.sin(g.theta) * PEND;
  const ch = pivotH - Math.cos(g.theta) * PEND;
  return { x: cx, h: ch, pivotH };
}

function drop(g) {
  if (!g || !g.load || g.falling || g.over || g.load.t < 0.25) return;
  const lp = loadPos(g);
  const vx = (g.trolleyV + Math.cos(g.theta) * g.omega * PEND) * 0.45;
  g.falling = { ...g.load, x: lp.x, h: lp.h - BH / 2, vx, vy: 0, rot: g.theta, vr: 0 };
  g.load = null;
  g.theta = 0;
  g.omega = 0;
  party?.audio.play('whoosh');
  if (g.p.kind === 'human') g.p.haptic(25);
}

function addPopup(x, h, text, color = '#fff', size = 40) {
  popups.push({ x, h, text, color, size, t: 0 });
}

function land(g, f) {
  const top = topBlock(g);
  const n = g.blocks.length;
  const off = top.base ? 0 : swayOff(g, n - 1);
  const tx = top.x + off;
  const d = f.x - tx;
  const audio = party?.audio;
  const lo = Math.max(f.x - f.w / 2, tx - top.w / 2);
  const hi = Math.min(f.x + f.w / 2, tx + top.w / 2);
  const overlap = hi - lo;
  const landH = topH(g);
  if (overlap < MIN_LAND) {
    // Slipped off: tumbles to the ground, costs a try.
    g.chunks.push({ ...f, h: landH, vx: Math.sign(d || 1) * 160 + f.vx, vy: -120, vr: Math.sign(d || 1) * 3, life: 2.5 });
    g.lives--;
    g.streak = 0;
    audio?.play('splat');
    audio?.play('buzz');
    party?.shake(0.6);
    addPopup(f.x, landH + 80, g.lives > 0 ? `MISS! ${g.lives} ${g.lives === 1 ? 'try' : 'tries'} left` : 'NO TRIES LEFT', RED, 38);
    if (g.p.kind === 'human') g.p.haptic([80, 50, 80]);
    if (g.lives <= 0) endTurn(g, 'lives');
    else g.spawnT = 0.7;
    return;
  }
  let nx, nw, perfect = false;
  if (Math.abs(d) <= PERFECT) {
    perfect = true;
    g.streak++;
    g.perfects++;
    nx = top.base ? tx : top.x;
    nw = Math.min(MAX_W, f.w + (g.streak >= 3 ? 8 : 0));
    if (top.base) nw = f.w;
  } else {
    g.streak = 0;
    nw = overlap;
    nx = (lo + hi) / 2 - off;
    // Slice off the overhang.
    const cutW = f.w - overlap;
    if (cutW > 1) {
      const side = d > 0 ? 1 : -1;
      const cx = side > 0 ? hi + cutW / 2 : lo - cutW / 2;
      g.chunks.push({ kind: f.kind, animal: null, w: cutW, x: cx, h: landH, vx: side * 120 + f.vx * 0.5, vy: -60, rot: 0, vr: side * 2.5, life: 2.5, seed: f.seed });
      fx.burst(side > 0 ? hi : lo, -(landH + BH / 2), 10, { colors: ['#f7c843', '#e7b230', '#fff3a8'], speed: 220, size: 5, shape: 'dot', gravity: 900 });
    }
    g.sway = Math.min(26, g.sway + Math.min(1, Math.abs(d) / top.w) * 22);
  }
  if (top.base && !perfect) nx = (lo + hi) / 2;
  g.blocks.push({ x: nx, w: nw, kind: f.kind, animal: f.animal, seed: f.seed, squash: 0.35, t: 0 });
  g.floors = g.blocks.length;
  const floorPts = 10 + g.floors;
  let pts = floorPts;
  const lh = topH(g);
  const sx = nx + swayOff(g, g.blocks.length - 1);
  if (perfect) {
    const bonus = 20 + 10 * Math.min(4, g.streak - 1);
    pts += bonus;
    addPopup(sx, lh + 60, g.streak > 1 ? `PERFECT x${g.streak}` : 'PERFECT!', YELLOW, 46);
    audio?.play('ding');
    audio?.tone(520 * Math.pow(2, Math.min(8, g.streak) / 12), 0.18, { type: 'triangle', vol: 0.18, at: 0.08 });
    fx.burst(sx, -lh, 26, { speed: 420, up: 180, size: 7 });
  } else {
    audio?.play('pop');
  }
  if (f.kind === 'snooze') {
    const sb = perfect ? 60 : 30;
    pts += sb;
    addPopup(sx, lh + 110, `SNOOZE BONUS +${sb}`, '#bfe8ff', 32);
    audio?.play('cheer');
  }
  addPopup(sx + nw / 2 + 50, lh + 20, `+${pts}`, '#fff', 30);
  g.score += pts;
  g.best = Math.max(g.best, g.floors);
  party?.shake(perfect ? 0.25 : 0.35);
  fx.burst(sx, -(lh - BH), 8, { colors: ['#fff'], speed: 160, up: 40, size: 9, shape: 'puff', gravity: -40, life: 0.6, spread: Math.PI, dir: 0 });
  if (g.p.kind === 'human') g.p.haptic(perfect ? [30, 30, 60] : 35);
  if (g.floors > record && !demo) {
    if (record > 0 && g.floors === record + 1) addPopup(sx, lh + 160, 'NEW RECORD!', GREEN, 40);
    record = g.floors;
  }
  g.spawnT = 0.45;
}

function endTurn(g, why) {
  if (g.over) return;
  g.over = true;
  g.load = null;
  if (demo) return;
  phase = 'turnover';
  phaseT = 0;
  g.endWhy = why;
  party?.audio.play('whistle');
}

function current() {
  return demo ? null : players[turn];
}

// ───────────── control per turn ─────────────
function anyHumanHeld(which) {
  if (!party) return false;
  return party.all.some((p) => (p.kind === 'human' || p.n === 0) && p.held(which));
}

function controlTarget(g, dt) {
  const p = g.p;
  const now = party ? party.t : 0;
  if (p.kind === 'cpu' || demo) return cpuControl(g, dt);
  const dir = (anyHumanHeld('right') ? 1 : 0) - (anyHumanHeld('left') ? 1 : 0);
  if (dir) {
    g.keyX = clamp(g.keyX + dir * 1.5 * dt, -1, 1);
    g.lastKeyAt = now;
    g.src = 'keys';
    return g.keyX;
  }
  if (now - g.lastKeyAt < 1.2) return g.keyX;
  if (camFresh()) {
    g.src = 'camera';
    g.keyX = cam.x;
    return cam.x;
  }
  // Their own phone, or a shared phone when they have none (pass it along with the turn).
  const pp = p.usingPhone ? p : !p.phone.connected ? party.all.find((q) => q.usingPhone) : null;
  if (pp) {
    g.src = 'phone';
    g.keyX = pp.tiltX || 0;
    return g.keyX;
  }
  g.src = 'keys';
  return g.keyX;
}

function cpuControl(g, dt) {
  const R = range();
  if (!g.load || g.falling) return g.targetX / R;
  const top = topBlock(g);
  const aim = (top.base ? 0 : top.x + swayOff(g, g.blocks.length - 1)) + g.cpu.err;
  const lp = loadPos(g);
  // Lead the target: steer the trolley so the load (not the trolley) ends up over the aim point.
  const want = clamp(aim + (aim - lp.x) * 0.25, -R, R);
  if (Math.abs(lp.x - aim) < 4 && Math.abs(g.omega) < 0.3 && Math.abs(g.trolleyV) < 30) {
    g.cpu.hold += dt;
    if (g.cpu.hold > g.cpu.wait) drop(g);
  } else g.cpu.hold = Math.max(0, g.cpu.hold - dt * 0.5);
  if (g.load && g.load.t > 5) drop(g);
  return want / R;
}

// ───────────── simulation ─────────────
function stepTower(g, dt, live) {
  const R = range();
  // camera follows the top
  const camTarget = Math.max(-150, topH(g) - 240);
  g.camY = lerp(g.camY, camTarget, 1 - Math.exp(-dt * 3));
  g.sway = Math.max(0, g.sway - dt * 3.2);
  g.swayPh += dt * 3.1;
  for (const b of g.blocks) {
    b.t += dt;
    b.squash = Math.max(0, b.squash - dt * 2.2);
  }

  // wind gusts above floor 8
  g.windT -= dt;
  if (g.windT <= 0) {
    g.windT = rand(4, 8);
    g.windTarget = g.floors >= 8 && Math.random() < 0.7 ? (Math.random() < 0.5 ? -1 : 1) * (120 + g.floors * 14) : 0;
  }
  g.wind = lerp(g.wind, g.windTarget, 1 - Math.exp(-dt * 1.2));

  if (live && !g.over) {
    if (!g.load && !g.falling) {
      g.spawnT -= dt;
      if (g.spawnT <= 0) spawnLoad(g);
    }
    const tx = controlTarget(g, dt);
    g.targetX = clamp(tx, -1, 1) * R;
  }
  // trolley: soft spring toward the hand target
  const k = 22, c = 2 * Math.sqrt(k) * 1.05;
  const a = k * (g.targetX - g.trolleyX) - c * g.trolleyV;
  g.trolleyA = a;
  g.trolleyV += a * dt;
  g.trolleyX = clamp(g.trolleyX + g.trolleyV * dt, -R - 20, R + 20);
  // load pendulum
  if (g.load) {
    g.load.t += dt;
    const alpha = -(GRAV / PEND) * Math.sin(g.theta) - (a * 0.55 / PEND) * Math.cos(g.theta) - damping(g) * g.omega + (g.wind / PEND) * Math.cos(g.theta);
    g.omega += alpha * dt;
    g.theta = clamp(g.theta + g.omega * dt, -1, 1);
  } else {
    g.theta *= 1 - dt * 5;
    g.omega = 0;
  }
  // falling load
  const f = g.falling;
  if (f) {
    f.vy += GRAV * 1.3 * dt;
    f.vx += g.wind * 0.25 * dt;
    f.x += f.vx * dt;
    f.h -= f.vy * dt;
    f.rot *= 1 - Math.min(1, dt * 7);
    if (f.h <= topH(g)) {
      g.falling = null;
      land(g, f);
    }
  }
  for (const ch of g.chunks) {
    ch.vy += GRAV * dt;
    ch.x += ch.vx * dt;
    ch.h -= ch.vy * dt;
    ch.rot = (ch.rot || 0) + ch.vr * dt;
    ch.life -= dt;
  }
  g.chunks = g.chunks.filter((ch) => ch.life > 0 && ch.h > -400);
}

// ───────────── drawing helpers ─────────────
function mixColor(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (s) => Math.round(lerp((pa >> s) & 255, (pb >> s) & 255, t));
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}

/** A block with its top-left corner at (x, y) in y-down world space. */
function drawBlock(ctx, x, y, w, h, kind, o = {}) {
  ctx.save();
  if (kind === 'crate' || kind === 'snooze') {
    rr(ctx, x, y, w, h, 6);
    inked(ctx, kind === 'snooze' ? '#ff8a3d' : '#e08a3c', 4);
    ctx.save();
    rr(ctx, x, y, w, h, 6);
    ctx.clip();
    ctx.strokeStyle = 'rgba(27,27,58,.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y + h / 2);
    ctx.lineTo(x + w, y + h / 2);
    ctx.stroke();
    ctx.restore();
    // corner posts
    ctx.fillStyle = kind === 'snooze' ? '#d0601e' : '#b8692a';
    for (const px of [x + 3, x + w - 13]) if (w > 34) ctx.fillRect(px, y + 3, 10, h - 6);
    if (kind === 'snooze' && w > 40) {
      // round window with a sleepy animal inside
      const r = Math.min(h * 0.38, w * 0.28);
      const cx = x + w / 2, cy = y + h / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, TAU);
      inked(ctx, '#2b2f6b', 3.5);
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r - 1.5, 0, TAU);
      ctx.clip();
      drawAnimal(ctx, o.animal || 'cow', cx, cy + r * 2.9, r * 4.4, { blink: 1, mood: 'happy', color: o.color || BLUE });
      ctx.restore();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, TAU);
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = INK;
      ctx.stroke();
    } else if (w > 40) {
      ctx.strokeStyle = '#a2561e';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(x + 16, y + 6);
      ctx.lineTo(x + w - 16, y + h - 6);
      ctx.moveTo(x + w - 16, y + 6);
      ctx.lineTo(x + 16, y + h - 6);
      ctx.stroke();
    }
    gloss(ctx, x + w * 0.22, y + h * 0.25, Math.min(w * 0.18, 30), 5, 0.35);
  } else {
    rr(ctx, x, y, w, h, 10);
    inked(ctx, '#f7c843', 4);
    ctx.save();
    rr(ctx, x, y, w, h, 10);
    ctx.clip();
    // straw texture
    ctx.strokeStyle = '#d9a52a';
    ctx.lineWidth = 2;
    const s = o.seed || 0.3;
    for (let i = 0; i < w / 9; i++) {
      const sx = x + ((i * 9 + s * 37) % w);
      ctx.beginPath();
      ctx.moveTo(sx, y + 6 + ((i * 7) % 9));
      ctx.lineTo(sx + 6, y + h - 8 - ((i * 5) % 7));
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,255,255,.25)';
    ctx.fillRect(x, y, w, h * 0.28);
    ctx.restore();
    // twine bands
    ctx.strokeStyle = RED;
    ctx.lineWidth = 4;
    const bands = w > 90 ? [0.28, 0.72] : w > 30 ? [0.5] : [];
    for (const b of bands) {
      ctx.beginPath();
      ctx.moveTo(x + w * b, y + 2);
      ctx.lineTo(x + w * b, y + h - 2);
      ctx.stroke();
    }
    // stray straws
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 10);
    ctx.lineTo(x - 5, y + 6);
    ctx.moveTo(x + w - 4, y + h - 12);
    ctx.lineTo(x + w + 5, y + h - 8);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBarn(ctx) {
  // barn below the deck at height 0, walls down to -170 (ground)
  const w = 300, top = 0, bottom = 172;
  ctx.save();
  rr(ctx, -w / 2, top, w, bottom, 6);
  inked(ctx, RED, 5);
  ctx.fillStyle = 'rgba(0,0,0,.08)';
  for (let x = -w / 2 + 22; x < w / 2; x += 26) ctx.fillRect(x, top + 4, 4, bottom - 8);
  // door
  rr(ctx, -54, top + 60, 108, bottom - 60, 4);
  inked(ctx, '#fff', 5);
  rr(ctx, -46, top + 68, 92, bottom - 72, 3);
  inked(ctx, '#d42a20', 4);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(-44, top + 70);
  ctx.lineTo(44, bottom - 6);
  ctx.moveTo(44, top + 70);
  ctx.lineTo(-44, bottom - 6);
  ctx.stroke();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  // loft window
  rr(ctx, -26, top + 14, 52, 34, 6);
  inked(ctx, '#fff', 4);
  rr(ctx, -19, top + 20, 38, 22, 4);
  inked(ctx, '#2b2f6b', 3);
  // deck (the foundation the tower stands on)
  rr(ctx, -BASE_W / 2 - 16, top - 16, BASE_W + 32, 22, 6);
  inked(ctx, '#a0602a', 5);
  ctx.fillStyle = 'rgba(255,255,255,.25)';
  ctx.fillRect(-BASE_W / 2 - 10, top - 13, BASE_W + 20, 5);
  ctx.restore();
}

function drawCrane(ctx, g, color, x0, x1) {
  const rh = railH(g);
  const y = -rh;
  // girder
  ctx.save();
  rr(ctx, x0 - 20, y - 22, x1 - x0 + 40, 22, 4);
  inked(ctx, BLUE, 5);
  ctx.strokeStyle = '#1f5fd6';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = Math.floor(x0 / 40) * 40; x < x1; x += 40) {
    ctx.moveTo(x, y - 19);
    ctx.lineTo(x + 20, y - 3);
    ctx.lineTo(x + 40, y - 19);
  }
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.35)';
  ctx.fillRect(x0 - 16, y - 19, x1 - x0 + 32, 4);
  // trolley
  const tx = g.trolleyX;
  rr(ctx, tx - 30, y - 6, 60, 34, 8);
  inked(ctx, color, 5);
  gloss(ctx, tx - 14, y + 3, 12, 4, 0.5);
  for (const wx of [-17, 17]) circle(ctx, tx + wx, y - 6, 8, '#fff', 4);
  // rope + load
  const lp = loadPos(g);
  if (g.load) {
    const ang = g.theta;
    const hx = tx + Math.sin(ang) * ROPE, hy = -(lp.pivotH - Math.cos(ang) * ROPE);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(tx, y + 28);
    ctx.lineTo(hx, hy);
    ctx.stroke();
    ctx.strokeStyle = '#c8a46a';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    // drop guide
    const top = topBlock(g);
    const aim = top.base ? 0 : top.x + swayOff(g, g.blocks.length - 1);
    const good = Math.abs(lp.x - aim) <= PERFECT;
    ctx.save();
    ctx.setLineDash([8, 10]);
    ctx.lineDashOffset = -performance.now() / 40;
    ctx.strokeStyle = good ? 'rgba(47,198,90,.95)' : 'rgba(255,255,255,.75)';
    ctx.lineWidth = good ? 5 : 3;
    ctx.beginPath();
    ctx.moveTo(lp.x, -(lp.h - BH / 2) + 4);
    ctx.lineTo(lp.x, -topH(g) - 2);
    ctx.stroke();
    ctx.restore();
    if (good) sparkle(ctx, lp.x, -topH(g) - 12, 9, YELLOW);
    // hook + load
    const drop = (1 - Math.min(1, g.load.t / 0.25)) * 40;
    ctx.save();
    ctx.translate(lp.x, -lp.h - drop);
    ctx.rotate(ang);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, -BH / 2 - 2);
    ctx.lineTo(-g.load.w * 0.32, -BH / 2 + 4);
    ctx.moveTo(0, -BH / 2 - 2);
    ctx.lineTo(g.load.w * 0.32, -BH / 2 + 4);
    ctx.stroke();
    circle(ctx, 0, -BH / 2 - 4, 6, YELLOW, 3);
    drawBlock(ctx, -g.load.w / 2, -BH / 2, g.load.w, BH, g.load.kind, { seed: g.load.seed, animal: g.load.animal, color });
    if (g.load.kind === 'snooze') {
      const zt = performance.now() / 600;
      for (let i = 0; i < 3; i++) {
        const k = (zt + i / 3) % 1;
        label(ctx, 'z', g.load.w / 2 + 6 + k * 18, -BH / 2 - 8 - k * 40, 14 + k * 10, { fill: '#fff', drop: false });
      }
    }
    ctx.restore();
  } else {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(tx, y + 28);
    ctx.lineTo(tx, y + 28 + ROPE * 0.6);
    ctx.stroke();
    ctx.strokeStyle = '#c8a46a';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    circle(ctx, tx, y + 32 + ROPE * 0.6, 6, YELLOW, 3);
  }
  ctx.restore();
}

function drawTowerWorld(ctx, g, color) {
  drawBarn(ctx);
  for (let i = 0; i < g.blocks.length; i++) {
    const b = g.blocks[i];
    const x = b.x + swayOff(g, i);
    const y = -(i + 1) * BH;
    ctx.save();
    if (b.squash > 0) {
      ctx.translate(x, y + BH);
      ctx.scale(1 + b.squash * 0.25, 1 - b.squash * 0.25);
      ctx.translate(-x, -(y + BH));
    }
    drawBlock(ctx, x - b.w / 2, y, b.w, BH, b.kind, { seed: b.seed, animal: b.animal, color });
    ctx.restore();
    if ((i + 1) % 5 === 0) {
      // floor marker flag on the side of every 5th floor
      const fxp = x - b.w / 2 - 6;
      ctx.save();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(fxp, y + BH - 4);
      ctx.lineTo(fxp - 26, y + 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(fxp - 26, y + 4);
      ctx.lineTo(fxp - 50, y + 8);
      ctx.lineTo(fxp - 30, y + 18);
      ctx.closePath();
      inked(ctx, color, 3);
      ctx.restore();
      label(ctx, String(i + 1), fxp - 42, y + 30, 18, { drop: false });
    }
  }
  for (const ch of g.chunks) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, ch.life * 1.5);
    ctx.translate(ch.x, -ch.h - BH / 2);
    ctx.rotate(ch.rot || 0);
    drawBlock(ctx, -ch.w / 2, -BH / 2, ch.w, BH, ch.kind, { seed: ch.seed, animal: ch.animal, color });
    ctx.restore();
  }
  const f = g.falling;
  if (f) {
    ctx.save();
    ctx.translate(f.x, -f.h - BH / 2);
    ctx.rotate(f.rot);
    drawBlock(ctx, -f.w / 2, -BH / 2, f.w, BH, f.kind, { seed: f.seed, animal: f.animal, color });
    ctx.restore();
  }
}

function drawSky(ctx, g, w, h, S, oy, t) {
  const alt = clamp(g.camY / 2600, 0, 1);
  const top = mixColor('#5ec2ff', '#26307a', alt);
  const bottom = mixColor('#bfe8ff', '#ffb98a', Math.min(1, alt * 1.4));
  const horizon = oy + 172 * S;
  if (horizon < h + 40) {
    farmBackdrop(ctx, w, h, horizon, { top, bottom, t });
  } else {
    const gr = ctx.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, top);
    gr.addColorStop(1, bottom);
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, w, h);
  }
  // stars high up
  if (alt > 0.45) {
    ctx.save();
    ctx.globalAlpha = (alt - 0.45) * 1.8;
    for (let i = 0; i < 40; i++) {
      const sx = (i * 397.3) % w, sy = ((i * 211.7 + g.camY * 0.05 * S) % (h * 0.9));
      sparkle(ctx, sx, sy, 3 + (i % 3) * 1.5, '#fff6c4');
    }
    ctx.restore();
  }
  // parallax clouds at fixed heights
  for (let i = 0; i < 14; i++) {
    const ch = 380 + i * 330;
    const y = h * 0.86 - (ch - g.camY * 0.5) * S;
    if (y < -60 || y > h + 60) continue;
    const x = (((i * 0.37 + t * 0.004 * (1 + (i % 3) * 0.4)) % 1.3) - 0.15) * w;
    cloud(ctx, x, y, (0.8 + (i % 3) * 0.35) * S * 1.2);
  }
}

function drawPanel(ctx, x, y, w, h, color) {
  ctx.save();
  rr(ctx, x, y + 6, w, h, 18);
  ctx.fillStyle = INK;
  ctx.fill();
  rr(ctx, x, y, w, h, 18);
  inked(ctx, color || '#fff', 4);
  ctx.restore();
}

/** Mirrored mini view of what the camera reads, plus the hand position bar. */
function drawCamPanel(ctx, x, y, pColor, g) {
  const w = 230, h = 196;
  drawPanel(ctx, x, y, w, h, '#fff');
  const st = camStatus();
  label(ctx, 'CAMERA', x + 16, y + 18, 17, { align: 'left', fill: st.ok ? GREEN : '#ffb02e', drop: false });
  circle(ctx, x + w - 22, y + 18, 7, st.ok ? GREEN : camFresh() ? YELLOW : '#c8c8d8', 3);
  const vx = x + 14, vy = y + 34, vw = w - 28, vh = 100;
  rr(ctx, vx, vy, vw, vh, 10);
  inked(ctx, '#26307a', 3.5);
  ctx.save();
  rr(ctx, vx, vy, vw, vh, 10);
  ctx.clip();
  const pose = cam.pose;
  const fresh = performance.now() - cam.lastBodyAt < 600;
  if (pose?.img && fresh) {
    const img = pose.img;
    const px = (p) => vx + p[0] * vw;
    const py = (p) => vy + p[1] * vh;
    const ok = (p) => p && p[2] > 0.4;
    // drop line
    if (cam.shY != null && cam.sc) {
      const ly = vy + (cam.shY - cam.sc * 0.55) * vh;
      ctx.save();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = cam.otherUp ? YELLOW : 'rgba(255,255,255,.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(vx, ly);
      ctx.lineTo(vx + vw, ly);
      ctx.stroke();
      ctx.restore();
    }
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#bfe8ff';
    ctx.lineWidth = 4;
    const seg = (a, b) => {
      if (!ok(img[a]) || !ok(img[b])) return;
      ctx.beginPath();
      ctx.moveTo(px(img[a]), py(img[a]));
      ctx.lineTo(px(img[b]), py(img[b]));
      ctx.stroke();
    };
    for (const [a, b] of [['ls', 'rs'], ['ls', 'le'], ['le', 'lw'], ['rs', 're'], ['re', 'rw'], ['ls', 'lh'], ['rs', 'rh'], ['lh', 'rh']]) seg(a, b);
    if (ok(img.ls) && ok(img.rs)) {
      const hx = (px(img.ls) + px(img.rs)) / 2, hy = (py(img.ls) + py(img.rs)) / 2;
      const r = Math.abs(px(img.ls) - px(img.rs)) * 0.32;
      circle(ctx, hx, hy - r * 1.7, Math.max(5, r), '#ffd9b0', 2.5);
    }
    const right = pose.hand !== 'left';
    const steer = img[right ? 'rw' : 'lw'], other = img[right ? 'lw' : 'rw'];
    if (ok(other)) circle(ctx, px(other), py(other), cam.otherUp ? 11 : 7, cam.otherUp ? YELLOW : '#fff', 2.5);
    if (ok(steer)) {
      circle(ctx, px(steer), py(steer), 10, pColor, 3);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px(steer), py(steer), 15 + Math.sin(performance.now() / 150) * 2, 0, TAU);
      ctx.stroke();
    }
  } else {
    // no body: a dashed outline of where to stand
    ctx.save();
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = 'rgba(255,255,255,.55)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(vx + vw / 2, vy + 30, 12, 0, TAU);
    ctx.moveTo(vx + vw / 2 - 34, vy + 52);
    ctx.lineTo(vx + vw / 2 + 34, vy + 52);
    ctx.lineTo(vx + vw / 2 + 28, vy + vh + 4);
    ctx.moveTo(vx + vw / 2 - 34, vy + 52);
    ctx.lineTo(vx + vw / 2 - 28, vy + vh + 4);
    ctx.stroke();
    ctx.restore();
  }
  if (cam.gestureFlash > 0) {
    ctx.globalAlpha = cam.gestureFlash;
    label(ctx, 'DROP!', vx + vw / 2, vy + vh / 2, 30, { fill: YELLOW });
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  label(ctx, st.text, x + 16, vy + vh + 18, 18, { align: 'left', fill: st.ok ? '#fff' : '#ffd21f', drop: false });
  ctx.save();
  ctx.font = "700 13px 'Baloo 2', system-ui, sans-serif";
  ctx.fillStyle = INK;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(st.sub, x + 16, vy + vh + 40);
  ctx.restore();
  // position bar: what steers the crane right now
  if (g) {
    const by = y + h + 18, bx = x + 14, bw = w - 28;
    drawPanel(ctx, x, by - 12, w, 40, '#fff');
    rr(ctx, bx + 54, by + 2, bw - 60, 10, 5);
    inked(ctx, '#e8ecf6', 2.5);
    const R = range();
    const m = bx + 54 + ((clamp(g.targetX / R, -1, 1) + 1) / 2) * (bw - 60);
    circle(ctx, m, by + 7, 9, pColor, 3);
    const srcName = g.p.kind === 'cpu' ? 'CPU' : g.src === 'camera' ? 'HAND' : g.src === 'phone' ? 'TILT' : 'KEYS';
    label(ctx, srcName, bx, by + 8, 15, { align: 'left', fill: g.src === 'camera' ? GREEN : BLUE, drop: false });
  }
}

function drawLives(ctx, x, y, n) {
  for (let i = 0; i < LIVES; i++) {
    ctx.save();
    ctx.globalAlpha = i < n ? 1 : 0.25;
    drawBlock(ctx, x + i * 34, y, 28, 16, 'hay', { seed: i * 0.3 });
    ctx.restore();
  }
}

function drawScoreboard(ctx, w, cur) {
  // current player card, top-left
  const g = cur.g;
  drawPanel(ctx, 16, 16, 250, 108, '#fff');
  ctx.save();
  rr(ctx, 16, 16, 250, 34, 18);
  ctx.save();
  ctx.clip();
  ctx.fillStyle = cur.color;
  ctx.fillRect(16, 16, 250, 34);
  ctx.restore();
  ctx.restore();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(18, 50);
  ctx.lineTo(264, 50);
  ctx.stroke();
  label(ctx, `P${cur.n + 1} ${cur.label}${cur.kind === 'cpu' ? ' (CPU)' : ''}`, 30, 34, 20, { align: 'left', drop: false });
  label(ctx, String(g.score), 30, 80, 34, { align: 'left', fill: YELLOW });
  label(ctx, `${g.floors} floor${g.floors === 1 ? '' : 's'}`, 252, 74, 18, { align: 'right', fill: '#fff', drop: false });
  drawLives(ctx, 150, 92, g.lives);
  // everybody, top-right
  const rowH = 34;
  const bw = 210, bx = w - bw - 16;
  drawPanel(ctx, bx, 16, bw, 16 + players.length * rowH, '#fff');
  players.forEach((p, i) => {
    const yy = 24 + i * rowH;
    const isCur = p === cur;
    if (isCur) {
      rr(ctx, bx + 6, yy, bw - 12, rowH - 4, 10);
      inked(ctx, '#fff6c4', 0);
    }
    circle(ctx, bx + 24, yy + 15, 10, p.color, 3);
    ctx.save();
    ctx.font = "800 16px 'Baloo 2', system-ui, sans-serif";
    ctx.fillStyle = INK;
    ctx.textBaseline = 'middle';
    ctx.fillText(p.label, bx + 42, yy + 16);
    ctx.textAlign = 'right';
    const done = i < turn || (i === turn && p.g.over);
    ctx.fillText(i > turn ? 'up next' : `${p.g.score}${done ? '' : '...'}`, bx + bw - 14, yy + 16);
    ctx.restore();
  });
}

// ───────────── the game ─────────────
const game = {
  id: 'barn-raiser',
  title: 'Barn Raiser',
  tagline: 'Steer the hay crane with your hand. Stack the tallest tower!',
  accent: '#ff8a3d',
  music: { bpm: 112, root: 62, scale: [0, 2, 4, 7, 9], prog: [0, 7, 9, 5], lead: 'pluck', seed: 41 },
  howTo: [
    { icon: 'camera', title: 'Hand steers', text: 'Stand in front of the laptop camera. Move your hand left and right to slide the crane.' },
    { icon: 'raise', title: 'Raise to drop', text: 'Lift your other hand above your head (or jab down fast, or press Action) to drop the load.' },
    { icon: 'bale', title: 'Stack it high', text: 'Overhangs get sliced off. Perfect drops chain a bonus. Three misses and your turn ends.' },
  ],
  keysHelp: 'Players take turns. No camera? Tilt your phone and press Action, or hold left / right and press your action key (Space works too). Recenter sets the middle.',

  titleButtons() {
    if (!cam.inShell) return '';
    const on = camFresh() || cam.on === true;
    return `<button class="btn" data-act="camera">Camera: ${on ? 'On' : 'Off'}</button>`;
  },
  onAct(act, btn) {
    if (act !== 'camera' || !party) return;
    const on = !(camFresh() || cam.on === true);
    party.exemoo.setCamera(on);
    cam.on = on;
    if (!on) cam.everPose = false;
    btn.textContent = `Camera: ${on ? 'On' : 'Off'}`;
    party.toast(on ? 'Camera on: allow it if the browser asks' : 'Camera off: tilt or keys');
  },

  start(list, opts) {
    demo = opts.demo;
    players = list;
    turn = 0;
    phase = 'ready';
    phaseT = 0;
    lastBeep = 0;
    popups.length = 0;
    for (const p of list) {
      p.g = newTower(p);
      p.tiltX = p.tiltX || 0;
    }
    if (demo) {
      demoG = newTower({ kind: 'cpu', color: RED, label: 'Demo', n: 0, haptic() {} });
      demoG.cpu.skill = 0.85;
    }
  },

  packet(p, pkt) {
    if (!pkt.q) return;
    const q = pkt.q;
    const roll = Math.atan2(2 * (q.w * q.y - q.z * q.x), 1 - 2 * (q.x * q.x + q.y * q.y));
    p.roll = roll;
    p.tiltX = clamp((roll - (p.rollOffset || 0)) / MAX_TILT, -1, 1);
  },

  recenter(p) {
    p.rollOffset = p.roll || 0;
    if (camFresh()) cam.center = cam.rawX;
  },

  action(p, src) {
    const c = current();
    if (!c || c.kind !== 'human' || phase !== 'play' || party?.state !== 'play') return;
    if (src === 'phone' && p !== c && c.usingPhone) return; // only the player on turn, unless they share a phone
    drop(c.g);
  },

  onGo() {
    phase = 'play';
    phaseT = 0;
  },

  onFinish() {
    phase = 'done';
  },

  update(dt, pt) {
    party = pt;
    fx.update(dt);
    cam.gestureFlash = Math.max(0, cam.gestureFlash - dt * 2.5);
    for (const pp of popups) pp.t += dt;
    while (popups.length && popups[0].t > 1.4) popups.shift();
    if (demo || !players.length) {
      if (!demoG) return;
      stepTower(demoG, dt, true);
      if (demoG.over || demoG.floors >= 16) {
        demoG.resetT = (demoG.resetT || 0) + dt;
        if (demoG.resetT > 2.5) {
          demoG = newTower(demoG.p);
          demoG.cpu.skill = 0.85;
        }
      }
      return;
    }
    const st = pt.state;
    const cur = players[turn];
    if (!cur) return;
    const g = cur.g;
    if (st === 'countdown') {
      stepTower(g, dt, false);
      return;
    }
    if (st !== 'play' && st !== 'over') return;
    phaseT += dt;
    if (phase === 'ready') {
      stepTower(g, dt, false);
      const left = READY_SECONDS - phaseT;
      const n = Math.ceil(left);
      if (n <= 3 && n > 0 && n !== lastBeep) {
        lastBeep = n;
        pt.audio.play('beep');
      }
      if (left <= 0) {
        phase = 'play';
        phaseT = 0;
        lastBeep = 0;
        pt.audio.play('go');
        pt.banner('GO!', YELLOW, 900);
        if (cur.kind === 'human') cur.haptic(80);
      }
    } else if (phase === 'play') {
      if (!g.over) {
        g.time += dt;
        const left = TURN_SECONDS - g.time;
        if (left <= 5 && Math.ceil(left) !== lastBeep && left > 0) {
          lastBeep = Math.ceil(left);
          pt.audio.tone(1200, 0.08, { type: 'square', vol: 0.1 });
        }
        if (left <= 0 && !g.falling) {
          endTurn(g, 'time');
        }
      }
      stepTower(g, dt, true);
    } else if (phase === 'turnover') {
      stepTower(g, dt, false);
      if (phaseT > TURNOVER_SECONDS) {
        if (turn + 1 < players.length) {
          turn++;
          phase = 'ready';
          phaseT = 0;
          lastBeep = 0;
          popups.length = 0;
          pt.audio.play('join');
        } else {
          phase = 'done';
          pt.finish();
        }
      }
    } else {
      stepTower(g, dt, false);
    }
  },

  hudText() {
    const cur = current();
    if (!cur) return '';
    if (phase === 'ready') return `Turn ${turn + 1} / ${players.length}`;
    const left = Math.max(0, Math.ceil(TURN_SECONDS - cur.g.time));
    return `0:${String(left).padStart(2, '0')}`;
  },

  draw(ctx, w, h, pt) {
    W = w;
    H = h;
    party = pt;
    const S = h / 760;
    const cur = current();
    const g = cur ? cur.g : demoG;
    if (!g) {
      ctx.fillStyle = '#5ec2ff';
      ctx.fillRect(0, 0, w, h);
      return;
    }
    const color = cur ? cur.color : RED;
    const oy = h * 0.86 + g.camY * S;
    drawSky(ctx, g, w, h, S, oy, pt.t);
    // record line
    if (record > 0 && !demo) {
      const ry = oy - record * BH * S;
      if (ry > 40 && ry < h) {
        ctx.save();
        ctx.setLineDash([14, 10]);
        ctx.strokeStyle = 'rgba(255,255,255,.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, ry);
        ctx.lineTo(w, ry);
        ctx.stroke();
        ctx.restore();
        label(ctx, `BEST ${record}`, w - 24, ry - 16, 20, { align: 'right', fill: '#fff' });
      }
    }
    ctx.save();
    ctx.translate(w / 2, oy);
    ctx.scale(S, S);
    drawTowerWorld(ctx, g, color);
    const half = w / 2 / S;
    drawCrane(ctx, g, color, -half, half);
    fx.draw(ctx);
    for (const pp of popups) {
      const k = pp.t / 1.4;
      ctx.globalAlpha = Math.min(1, (1 - k) * 3);
      label(ctx, pp.text, pp.x, -(pp.h + k * 70), pp.size * (k < 0.15 ? 0.6 + k * 2.7 : 1), { fill: pp.color });
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    // wind sock
    if (Math.abs(g.wind) > 40) {
      const dir = Math.sign(g.wind);
      const a = clamp(Math.abs(g.wind) / 300, 0, 1);
      ctx.save();
      ctx.globalAlpha = 0.85;
      label(ctx, dir > 0 ? 'WIND >>' : '<< WIND', w / 2, 120 * S + 40, 22 + a * 10, { fill: '#bfe8ff' });
      for (let i = 0; i < 6; i++) {
        const lx = ((pt.t * 260 * dir + i * w / 6) % w + w) % w;
        const ly = h * (0.25 + 0.1 * (i % 3)) + Math.sin(pt.t * 3 + i) * 12;
        ctx.strokeStyle = 'rgba(255,255,255,.7)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx - dir * 50 * a, ly);
        ctx.stroke();
      }
      ctx.restore();
    }

    if (demo || !cur) {
      drawCamPanel(ctx, 16, h - 270, RED, null);
      return;
    }
    drawScoreboard(ctx, w, cur);
    drawCamPanel(ctx, 16, h - 268, color, g);

    // turn intro card
    if (phase === 'ready' || pt.state === 'countdown') {
      const cw = Math.min(560, w - 40), ch = 220;
      const cx = (w - cw) / 2, cy = Math.max(70, h * 0.3 - ch / 2);
      drawPanel(ctx, cx, cy, cw, ch, '#fff');
      ctx.save();
      ctx.beginPath();
      ctx.rect(cx, cy, 150, ch);
      ctx.clip();
      drawAnimal(ctx, cur.animal, cx + 80, cy + ch - 16, 150, { color: cur.color, mood: 'cheer' });
      ctx.restore();
      label(ctx, `${cur.label}'s turn`, cx + 160, cy + 50, 40, { align: 'left', fill: cur.color });
      const hint = cur.kind === 'cpu'
        ? 'CPU rival is stacking. Watch and learn!'
        : camStatus().ok
          ? 'Camera sees you. Steer with your hand!'
          : cam.inShell
            ? 'Step in front of the camera, or tilt your phone.'
            : 'Tilt your phone or use the keys.';
      ctx.save();
      ctx.font = "800 19px 'Baloo 2', system-ui, sans-serif";
      ctx.fillStyle = INK;
      ctx.textBaseline = 'middle';
      wrapText(ctx, hint, cx + 162, cy + 96, cw - 180, 24);
      ctx.restore();
      if (phase === 'ready' && pt.state === 'play') {
        const n = Math.max(1, Math.ceil(READY_SECONDS - phaseT));
        label(ctx, n > 3 ? 'Get ready' : String(n), cx + 160 + (cw - 180) / 2, cy + ch - 46, n > 3 ? 36 : 64, { fill: YELLOW });
      }
    }
    if (phase === 'turnover' || phase === 'done') {
      const cw = Math.min(520, w - 40), ch = 170;
      const cx = (w - cw) / 2, cy = h * 0.3 - ch / 2;
      drawPanel(ctx, cx, cy, cw, ch, '#fff');
      const why = g.endWhy === 'time' ? "TIME'S UP!" : 'TOWER DONE!';
      label(ctx, why, w / 2, cy + 46, 42, { fill: cur.color });
      label(ctx, `${g.floors} floors  ·  ${g.score} points`, w / 2, cy + 104, 30, { fill: '#fff' });
      ctx.save();
      ctx.font = "800 17px 'Baloo 2', system-ui, sans-serif";
      ctx.fillStyle = INK;
      ctx.textAlign = 'center';
      ctx.fillText(turn + 1 < players.length ? `Next up: ${players[turn + 1].label}` : 'Final tower!', w / 2, cy + 146);
      ctx.restore();
    }
  },

  results() {
    return players.map((p) => ({ p, score: p.g.score, text: `${p.g.floors} floors · ${p.g.score}` }));
  },
};

function wrapText(ctx, text, x, y, maxW, lh) {
  const words = text.split(' ');
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lh;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, y);
}

party = startParty(game);
cam.inShell = party.exemoo.inShell;
party.exemoo.on('pose', onPose);
party.exemoo.on('camera', (on) => {
  cam.on = !!on;
  if (!on) cam.everPose = false;
});
// Space drops for whoever is on turn (handy for hot-seat on one keyboard).
addEventListener('keydown', (e) => {
  if (e.code !== 'Space' || e.repeat) return;
  const c = current();
  if (party.state === 'play' && c?.kind === 'human' && phase === 'play') {
    e.preventDefault();
    drop(c.g);
  }
});
// This game is played with the camera: if the shell's camera assist is not on yet, ask for it once.
if (cam.inShell) {
  setTimeout(() => {
    if (!cam.everPose && !cam.asked) {
      cam.asked = true;
      party.exemoo.setCamera(true);
    }
  }, 2500);
}
