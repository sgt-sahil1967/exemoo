// Straw Shot: farm-range archery for 1-4 players. Point your phone at the screen to aim your coloured
// crosshair, hold the big Action button to draw the bow, keep your hand still so the sway settles, and
// let go to loose the arrow. Five ends of three arrows: hay-bale bullseyes near and far, a moving hay
// cart, wind, and a balloon finale. Everyone shoots at the same targets at the same time.
// Original Exemoo party minigame.
import { startParty } from './party.js';
import {
  INK, TAU, clamp, lerp, rand, rr, inked, circle, ellipse, limb, gloss, shadow, label, sparkle, farmBackdrop, drawAnimal, Particles,
} from './art.js';

// ───────────── tuning ─────────────
const AIM_YAW = 26; // degrees of phone turn from centre to the left / right screen edge
const AIM_PITCH = 16; // degrees of phone tilt from centre to the top / bottom screen edge
const DRAW_TIME = 0.95; // seconds to reach full draw
const MIN_POWER = 0.2; // releasing below this puts the arrow back (no shot)
const FATIGUE_AFTER = 4; // seconds at full draw before the arms start to shake
const ARROWS = 3; // per end
const END_TIME = 24; // seconds per end
const TALLY_TIME = 3.2;
const RING_PTS = [10, 8, 6, 4, 2];
const RING_COLORS = ['#ffd21f', '#ff3b30', '#2f7cff', '#2fc65a', '#ffffff'];
const BALLOON_PTS = 5;
const STRAW_PTS = 1;

const ENDS = [
  { name: 'Warm Up', wind: 0, gust: 0, targets: [{ x: 0.5, d: 0.12 }] },
  { name: 'Near and Far', wind: 0.3, gust: 0.1, targets: [{ x: 0.3, d: 0.08 }, { x: 0.7, d: 0.78 }] },
  { name: 'Hay Cart', wind: 0, gust: 0, targets: [{ x: 0.5, d: 0.3, move: { amp: 0.27, speed: 0.85 } }, { x: 0.18, d: 0.88 }] },
  { name: 'Windy Field', wind: 0.85, gust: 0.35, targets: [{ x: 0.2, d: 0.55 }, { x: 0.5, d: 0.18 }, { x: 0.8, d: 0.9 }] },
  { name: 'Balloon Finale', wind: 0.45, gust: 0.25, balloons: true, targets: [{ x: 0.5, d: 0.58, move: { amp: 0.32, speed: 1.25 } }] },
];

let players = [];
let demo = true;
let lastW = 1280, lastH = 720;
const fx = new Particles();
const E = { i: 0, phase: 'ready', t: 0, wind: 0, gust: 0, windSign: 1, clock: 0 };
let targets = [];
let flying = [];
let groundArrows = [];
let balloons = [];
let balloonT = 0;
let popups = [];
const straws = Array.from({ length: 26 }, () => ({ x: Math.random(), y: Math.random(), s: rand(0.6, 1.3), r: rand(0, TAU) }));

// ───────────── geometry ─────────────
const horizonY = (h) => h * 0.44;
const plateH = (h) => Math.max(64, h * 0.13);

/** Screen geometry of a target right now (or `ahead` seconds from now). */
function geo(T, w = lastW, h = lastH, ahead = 0) {
  const hz = horizonY(h);
  const k = lerp(1, 0.32, T.d);
  const gy = hz + (h - hz) * (0.66 - 0.6 * T.d);
  const faceR = h * 0.092 * k;
  const baleR = faceR * 1.3;
  let x = T.x0;
  if (T.move) x += T.move.amp * Math.sin(T.phase + (E.clock + ahead) * T.move.speed);
  return { cx: x * w, cy: gy - baleR - h * 0.045 * k, gy, faceR, baleR, k };
}

function windNow() {
  return E.windSign * E.wind + E.gust * Math.sin(E.clock * 0.9) * (0.6 + 0.4 * Math.sin(E.clock * 2.3));
}

function setupEnd(i) {
  E.i = i;
  const cfg = ENDS[i];
  E.wind = cfg.wind;
  E.gust = cfg.gust;
  E.windSign = Math.random() < 0.5 ? -1 : 1;
  targets = cfg.targets.map((t) => ({ x0: t.x, d: t.d, move: t.move, phase: rand(0, TAU), stuck: [], wob: 0 }));
  flying = [];
  groundArrows = [];
  balloons = [];
  balloonT = 0.5;
  for (const p of players) {
    const g = p.g;
    g.arrows = ARROWS;
    g.endPts = 0;
    g.drawing = false;
    g.power = 0;
    g.cool = 0;
  }
}

// ───────────── game ─────────────
const game = {
  id: 'straw-shot',
  title: 'Straw Shot',
  tagline: 'Point, draw, steady... loose! Farm-range archery for up to four.',
  accent: '#2fc65a',
  music: { bpm: 104, root: 60, scale: [0, 2, 4, 7, 9], prog: [0, 5, 3, 4], lead: 'pluck', seed: 23 },
  howTo: [
    { icon: 'aim', title: 'Point to aim', text: 'Hold your phone like a remote, top edge at the screen. Press Recenter to centre your crosshair.' },
    { icon: 'bow', title: 'Hold to draw', text: 'Hold the big button to pull the bow. Keep still: the wobble settles. Let go to shoot.' },
    { icon: 'target', title: 'Hit the gold', text: 'Rings score 10, 8, 6, 4, 2. Weak draws drop low, wind pushes sideways, carts move.' },
  ],
  keysHelp: 'Keyboard: move your crosshair with W A S D (P1), I J K L (P2), arrows (P3) or T F G H (P4); hold Space, U, Enter or R to draw and release to shoot. Five ends of three arrows.',

  start(list, opts) {
    demo = opts.demo;
    players = list;
    E.clock = 0;
    for (const p of list) {
      p.g = {
        ax: 0.5 + (p.n - 1.5) * 0.06, ay: 0.45, rx: 0.5 + (p.n - 1.5) * 0.06, ry: 0.45,
        ref: null, qLive: false, gyroYaw: 0, gyroPitch: 0, lastT: 0,
        shake: 0, shakeRaw: 0, swayAmp: 0, swayPh: rand(0, TAU), swayX: 0, swayY: 0,
        drawing: false, power: 0, holdT: 0, steadyT: 0, fullBuzz: false, cool: 0,
        arrows: ARROWS, total: 0, endPts: 0, golds: 0, hits: 0, joy: 0, sad: 0,
        kvx: 0, kvy: 0,
        cpu: { skill: rand(0.45, 0.85), wait: rand(0.4, 1.4), tgt: null, err: { x: 0, y: 0 }, holdFor: 0, hold: false },
      };
    }
    setupEnd(demo ? (Math.random() * ENDS.length) | 0 : 0);
    E.phase = demo ? 'shoot' : 'ready';
    E.t = END_TIME;
    popups = [];
  },

  onGo(party) {
    E.phase = 'shoot';
    E.t = END_TIME;
    party.banner(`End 1: ${ENDS[0].name}`, '#fff', 1500);
  },

  packet(p, pkt) {
    const g = p.g;
    if (!g) return;
    const q = pkt.q || { x: 0, y: 0, z: 0, w: 1 };
    if (!g.qLive && (Math.abs(q.x) + Math.abs(q.y) + Math.abs(q.z) > 1e-4)) {
      g.qLive = true;
      g.ref = null;
    }
    const gy = pkt.gyro || { alpha: 0, beta: 0, gamma: 0 };
    const dt = g.lastT ? clamp((((pkt.t - g.lastT) >>> 0) || 16) / 1000, 0, 0.1) : 0;
    g.lastT = pkt.t;
    let yaw, pitch;
    if (g.qLive) {
      if (!g.ref) g.ref = makeRef(q);
      const v = rotate(g.ref.axis, q);
      yaw = wrapDeg(Math.atan2(v.x, v.y) * 57.2958 - g.ref.yaw);
      pitch = Math.asin(clamp(v.z, -1, 1)) * 57.2958 - g.ref.pitch;
    } else {
      // No orientation sensor: integrate the gyro rate like the Exemoo menu pointer does.
      if (!g.ref) {
        g.ref = { gyro: true };
        g.gyroYaw = 0;
        g.gyroPitch = 0;
      }
      if (Math.abs(gy.beta) > 2) g.gyroYaw -= gy.beta * dt;
      if (Math.abs(gy.alpha) > 2) g.gyroPitch += gy.alpha * dt;
      g.gyroYaw = clamp(g.gyroYaw, -AIM_YAW * 1.1, AIM_YAW * 1.1);
      g.gyroPitch = clamp(g.gyroPitch, -AIM_PITCH * 1.1, AIM_PITCH * 1.1);
      yaw = g.gyroYaw;
      pitch = g.gyroPitch;
    }
    g.rx = clamp(0.5 + yaw / (2 * AIM_YAW), 0.02, 0.98);
    g.ry = clamp(0.56 - pitch / (2 * AIM_PITCH), 0.04, 0.9);
    const mag = Math.hypot(gy.alpha, gy.beta, gy.gamma);
    g.shakeRaw = Math.max(clamp((mag - 6) / 80, 0, 1), g.shakeRaw * 0.88);
  },

  recenter(p) {
    const g = p.g;
    if (!g) return;
    g.ref = null;
    if (!p.usingPhone) {
      g.rx = 0.5;
      g.ry = 0.56;
    }
  },

  update(dt, party) {
    const st = party.state;
    const live = !demo && st === 'play';
    E.clock += dt;
    fx.update(dt);
    for (const t of targets) t.wob = Math.max(0, t.wob - dt * 2.5);
    for (const s of straws) {
      s.x += (windNow() * 0.22 + 0.01) * dt * s.s;
      s.y += Math.sin(E.clock * 2 + s.r) * 0.01 * dt;
      s.r += dt * 3 * s.s;
      if (s.x > 1.05) s.x -= 1.1;
      if (s.x < -0.05) s.x += 1.1;
    }
    popups = popups.filter((u) => (u.t += dt) < u.life);

    // balloons (finale)
    if (ENDS[E.i].balloons && (E.phase === 'shoot' || E.phase === 'ready')) {
      balloonT -= dt;
      if (balloonT <= 0 && balloons.length < 6) {
        balloonT = rand(0.9, 1.8);
        balloons.push({ x: rand(0.12, 0.88), y: 0.82, vy: rand(0.07, 0.11), ph: rand(0, TAU), c: ['#ff3b30', '#ffd21f', '#2f7cff', '#2fc65a', '#ff8fb1'][(Math.random() * 5) | 0] });
      }
    }
    for (const b of balloons) {
      b.y -= b.vy * dt;
      b.x += (Math.sin(E.clock * 1.4 + b.ph) * 0.02 + windNow() * 0.02) * dt;
    }
    balloons = balloons.filter((b) => b.y > -0.1);

    const canShootPhase = demo || (live && E.phase === 'shoot' && E.t > 0);
    for (const p of players) updatePlayer(p, dt, party, canShootPhase);

    // arrows in flight
    for (const a of flying) {
      a.t += dt;
      if (a.t >= a.T && !a.done) {
        a.done = true;
        land(a, party);
      }
    }
    flying = flying.filter((a) => !a.done);

    if (demo) {
      if (players.every((p) => p.g.arrows <= 0 && !p.g.drawing) && !flying.length) {
        for (const t of targets) t.stuck = [];
        groundArrows = [];
        for (const p of players) p.g.arrows = ARROWS;
      }
      return;
    }
    if (st !== 'play') return;

    if (E.phase === 'shoot') {
      E.t = Math.max(0, E.t - dt);
      const allDone = players.every((p) => p.g.arrows <= 0 && !p.g.drawing);
      if ((E.t <= 0 || allDone) && !flying.length) {
        for (const p of players) p.g.drawing = false;
        E.phase = 'tally';
        E.t = TALLY_TIME;
        party.audio.play('ding');
        const best = Math.max(...players.map((p) => p.g.endPts));
        for (const p of players) if (best > 0 && p.g.endPts === best) p.g.joy = 2;
      }
    } else if (E.phase === 'tally') {
      E.t -= dt;
      if (E.t <= 0) {
        if (E.i + 1 < ENDS.length) {
          setupEnd(E.i + 1);
          E.phase = 'shoot';
          E.t = END_TIME;
          party.banner(`End ${E.i + 1}: ${ENDS[E.i].name}`, E.i === ENDS.length - 1 ? '#ffd21f' : '#fff', 1500);
          party.audio.play('go');
          for (const p of players) if (p.kind === 'human') p.haptic(40);
        } else {
          E.phase = 'done';
          party.finish();
        }
      }
    }
  },

  onFinish() {
    const best = Math.max(...players.map((p) => p.g.total));
    for (const p of players) p.g.joy = p.g.total === best ? 5 : 0;
  },

  hudText(party) {
    const n = `End ${E.i + 1}/${ENDS.length}`;
    if (party.state === 'countdown') return n;
    if (E.phase === 'shoot') return `${n} · ${Math.ceil(E.t)}s`;
    if (E.phase === 'tally') return `${n} done`;
    return 'Final';
  },

  results() {
    return players.map((p) => ({
      p,
      score: p.g.total + p.g.golds * 0.001,
      text: `${p.g.total} pts${p.g.golds ? ` · ${p.g.golds} gold${p.g.golds === 1 ? '' : 's'}` : ''}`,
    }));
  },

  draw(ctx, w, h, party) {
    lastW = w;
    lastH = h;
    const hz = horizonY(h);
    farmBackdrop(ctx, w, h, hz, { t: E.clock });
    drawRange(ctx, w, h, hz);
    // targets far to near
    const order = targets.slice().sort((a, b) => b.d - a.d);
    for (const T of order) drawTarget(ctx, T, geo(T, w, h), w, h);
    for (const a of groundArrows) drawStub(ctx, a.x, a.y, a.len, a.color, -0.5);
    for (const b of balloons) drawBalloon(ctx, b, w, h);
    drawStraws(ctx, w, h, hz);
    for (const a of flying) drawFlying(ctx, a, h);
    fx.draw(ctx);
    drawWind(ctx, w, h);
    for (const p of players) drawCrosshair(ctx, p, w, h, party);
    drawPlates(ctx, w, h, party);
    for (const u of popups) {
      const k = u.t / u.life;
      ctx.save();
      ctx.globalAlpha = Math.min(1, (1 - k) * 3);
      label(ctx, u.text, u.x, u.y - k * h * 0.06, u.size * (k < 0.12 ? 0.6 + k * 3.3 : 1), { fill: u.color });
      ctx.restore();
    }
    if (!demo && E.phase === 'tally' && party.state === 'play') drawTally(ctx, w, h);
    if (!demo && E.phase === 'shoot' && party.state === 'play' && E.t <= 5 && E.t > 0 && players.some((p) => p.g.arrows > 0)) {
      label(ctx, 'Shoot!', w / 2, h * 0.17, Math.min(w * 0.05, 56), { fill: '#ff3b30' });
    }
  },
};

// ───────────── orientation maths ─────────────
function rotate(v, q) {
  // v' = q v q*
  const { x, y, z, w } = q;
  const ix = w * v.x + y * v.z - z * v.y;
  const iy = w * v.y + z * v.x - x * v.z;
  const iz = w * v.z + x * v.y - y * v.x;
  const iw = -x * v.x - y * v.y - z * v.z;
  return {
    x: ix * w + iw * -x + iy * -z - iz * -y,
    y: iy * w + iw * -y + iz * -x - ix * -z,
    z: iz * w + iw * -z + ix * -y - iy * -x,
  };
}
const wrapDeg = (a) => ((((a + 180) % 360) + 360) % 360) - 180;
/** Pick the phone axis that points at the screen: the top edge (remote grip) or, if that points at the ceiling, the back. */
function makeRef(q) {
  let axis = { x: 0, y: 1, z: 0 };
  let v = rotate(axis, q);
  if (Math.abs(v.z) > 0.82) {
    axis = { x: 0, y: 0, z: -1 };
    v = rotate(axis, q);
  }
  return { axis, yaw: Math.atan2(v.x, v.y) * 57.2958, pitch: Math.asin(clamp(v.z, -1, 1)) * 57.2958 };
}

// ───────────── players ─────────────
function laneOf(p, party, w = lastW) {
  return party.lanes(w, players.length, 420)[players.indexOf(p)];
}
function bowPos(p, party, w = lastW, h = lastH) {
  const l = laneOf(p, party, w);
  return { x: l ? l.cx : w / 2, y: h - plateH(h) - 18 };
}
function crossPos(p, w = lastW, h = lastH) {
  const g = p.g;
  return { x: g.ax * w + g.swayX * h, y: g.ay * h + g.swayY * h };
}
function panOf(p, party) {
  const l = laneOf(p, party);
  return l ? clamp((l.cx / lastW) * 2 - 1, -0.8, 0.8) : 0;
}

function updatePlayer(p, dt, party, canShootPhase) {
  const g = p.g;
  const cpu = demo || p.kind === 'cpu';
  g.joy = Math.max(0, g.joy - dt);
  g.sad = Math.max(0, g.sad - dt);
  g.cool = Math.max(0, g.cool - dt);

  // aim input
  let holding = false;
  if (cpu) {
    holding = cpuThink(p, dt, canShootPhase);
    g.shake = 0.06 + (1 - g.cpu.skill) * 0.35;
  } else {
    let mx = 0, my = 0;
    if (p.held('left')) mx -= 1;
    if (p.held('right')) mx += 1;
    if (p.held('up')) my -= 1;
    if (p.held('down')) my += 1;
    const keyAim = mx || my;
    if (keyAim) {
      const sp = g.drawing ? 0.22 : 0.5;
      g.kvx = lerp(g.kvx, mx * sp, 1 - Math.exp(-dt * 10));
      g.kvy = lerp(g.kvy, my * sp * 1.3, 1 - Math.exp(-dt * 10));
    } else {
      g.kvx = lerp(g.kvx, 0, 1 - Math.exp(-dt * 16));
      g.kvy = lerp(g.kvy, 0, 1 - Math.exp(-dt * 16));
    }
    if (Math.abs(g.kvx) + Math.abs(g.kvy) > 0.002) {
      g.rx = clamp(g.rx + g.kvx * dt, 0.02, 0.98);
      g.ry = clamp(g.ry + g.kvy * dt, 0.04, 0.9);
    }
    const phoneHeld = p.usingPhone && p.phone.act;
    holding = phoneHeld || p.held('action');
    let shake;
    if (p.usingPhone && !keyAim) {
      shake = g.shakeRaw;
      if (performance.now() - p.phone.lastPacket > 150) g.shakeRaw *= Math.exp(-6 * dt);
    } else shake = keyAim && g.drawing ? 0.45 : 0.05;
    g.shake = lerp(g.shake, shake, 1 - Math.exp(-dt * 8));
  }

  // smoothing: heavy when nearly still (kills jitter), light when sweeping (low lag)
  const dist = Math.hypot(g.rx - g.ax, g.ry - g.ay);
  const rate = cpu ? 14 : 8 + 60 * Math.min(1, dist * 9);
  const k = 1 - Math.exp(-rate * dt);
  g.ax += (g.rx - g.ax) * k;
  g.ay += (g.ry - g.ay) * k;

  // bow
  const canShoot = canShootPhase && g.arrows > 0;
  if (!g.drawing && holding && canShoot && g.cool <= 0 && !g.waitRelease) {
    g.drawing = true;
    g.power = 0;
    g.holdT = 0;
    g.steadyT = 0;
    g.fullBuzz = false;
    if (!demo) party.audio.tone(150, 0.45, { type: 'sawtooth', vol: 0.04, slide: 110, pan: panOf(p, party) });
  }
  if (!holding) g.waitRelease = false;
  if (g.drawing) {
    if (!canShootPhase) {
      g.drawing = false;
      g.waitRelease = true;
    } else {
      g.power = Math.min(1, g.power + dt / DRAW_TIME);
      if (g.power >= 1) g.holdT += dt;
      if (g.power >= 1 && !g.fullBuzz) {
        g.fullBuzz = true;
        if (!demo) {
          party.audio.tone(1500, 0.04, { type: 'square', vol: 0.05, pan: panOf(p, party) });
          p.haptic(12);
        }
      }
      if (g.shake < 0.2) g.steadyT += dt;
      else g.steadyT = Math.max(0, g.steadyT - dt * 2.5);
      const fatigue = Math.min(0.05, Math.max(0, g.holdT - FATIGUE_AFTER) * 0.014);
      const target = (0.004 + 0.02 * (1 - clamp(g.steadyT / 1.3, 0, 1)) + g.shake * 0.028 + fatigue) * (0.35 + 0.65 * g.power);
      g.swayAmp = lerp(g.swayAmp, target, 1 - Math.exp(-dt * 5));
      if (!holding) {
        g.drawing = false;
        if (g.power >= MIN_POWER) fire(p, party);
        else if (!demo) party.audio.tone(300, 0.08, { type: 'triangle', vol: 0.06, slide: -100 });
      }
    }
  }
  if (!g.drawing) g.swayAmp = lerp(g.swayAmp, 0, 1 - Math.exp(-dt * 6));
  if (!g.drawing && !holding) g.power = Math.max(0, g.power - dt * 4);
  g.swayPh += dt * (1 + g.shake);
  const t = g.swayPh;
  g.swayX = g.swayAmp * (Math.sin(t * 1.7) * 0.7 + Math.sin(t * 3.3 + 1.1) * 0.3);
  g.swayY = g.swayAmp * (Math.cos(t * 1.3 + 0.4) * 0.7 + Math.sin(t * 2.7) * 0.3);
}

function cpuThink(p, dt, canShoot) {
  const g = p.g, c = p.g.cpu, w = lastW, h = lastH;
  if (!canShoot || g.arrows <= 0) {
    c.hold = false;
    // idle drift toward the middle
    g.rx = lerp(g.rx, 0.5 + (p.n - 1.5) * 0.08, 1 - Math.exp(-dt * 0.8));
    g.ry = lerp(g.ry, 0.45, 1 - Math.exp(-dt * 0.8));
    return false;
  }
  if (c.tgt && c.tgt.balloon && !balloons.includes(c.tgt.balloon)) c.tgt = null;
  if (c.tgt && !c.tgt.balloon && !targets.includes(c.tgt.T)) c.tgt = null;
  if (!c.tgt) {
    const alive = balloons.filter((b) => b.y < 0.7 && b.y > 0.2);
    if (alive.length && Math.random() < 0.35 * c.skill) c.tgt = { balloon: alive[(Math.random() * alive.length) | 0] };
    else c.tgt = { T: targets[(Math.random() * targets.length) | 0] };
    const spread = (1 - c.skill) * 1.5 + 0.18;
    c.err = { x: rand(-1, 1) * spread, y: rand(-1, 1) * spread };
  }
  // where to aim: lead moving targets, partly allow for wind
  let x, y, d, r;
  if (c.tgt.balloon) {
    const b = c.tgt.balloon;
    d = 0.5;
    const T = flightTime(d, 1);
    x = (b.x + windNow() * 0.02 * T) * w;
    y = (b.y - b.vy * T) * h;
    r = h * 0.03;
  } else {
    const T0 = c.tgt.T;
    d = T0.d;
    const gg = geo(T0, w, h, flightTime(d, 1) * (0.5 + 0.5 * c.skill));
    x = gg.cx;
    y = gg.cy;
    r = gg.faceR;
  }
  x -= windDrift(d, 1, h) * (0.45 + 0.55 * c.skill);
  x += c.err.x * r;
  y += c.err.y * r;
  const tx = clamp(x / w, 0.02, 0.98), ty = clamp(y / h, 0.04, 0.9);
  const sp = (g.drawing ? 0.25 : 0.55) * (0.7 + c.skill * 0.6) * dt;
  g.rx += clamp(tx - g.rx, -sp, sp);
  g.ry += clamp(ty - g.ry, -sp, sp);
  const close = Math.hypot(tx - g.ax, ty - g.ay) < 0.02;
  if (c.wait > 0) {
    c.wait -= dt;
    c.hold = false;
  } else if (!g.drawing) {
    if (close && g.cool <= 0) {
      c.hold = true;
      c.holdFor = rand(1.05, 1.9);
    }
  } else {
    c.holdFor -= dt;
    if (c.holdFor <= 0 && g.power >= 0.95) {
      c.hold = false;
      c.wait = rand(0.5, 1.5);
      c.tgt = null;
    }
  }
  return c.hold;
}

// ───────────── shooting ─────────────
function flightTime(d, power) {
  return (0.32 + 0.5 * d) / (0.6 + 0.4 * power);
}
function windDrift(d, power, h) {
  return windNow() * h * 0.075 * (0.3 + d) * (1.25 - 0.25 * power);
}
function depthAt(x, y, w, h) {
  for (const T of targets.slice().sort((a, b) => a.d - b.d)) {
    const gg = geo(T, w, h);
    if (Math.hypot(x - gg.cx, y - gg.cy) < gg.baleR * 1.15) return T.d;
  }
  const hz = horizonY(h);
  if (y > hz) return clamp((0.66 - (y - hz) / (h - hz)) / 0.6, 0, 1);
  return 1;
}

function fire(p, party) {
  const g = p.g, w = lastW, h = lastH;
  const c = crossPos(p, w, h);
  const d = depthAt(c.x, c.y, w, h);
  const power = g.power;
  const T = flightTime(d, power);
  const drop = h * 0.3 * Math.pow(1 - power, 1.6) * (0.5 + d);
  const drift = windDrift(d, power, h);
  const b = bowPos(p, party, w, h);
  flying.push({ p, x0: b.x, y0: b.y - h * 0.05, x1: c.x + drift, y1: c.y + drop, t: 0, T, d, power, done: false });
  g.arrows--;
  g.cool = 0.35;
  g.power = 0;
  g.waitRelease = false;
  if (!demo) {
    const pan = panOf(p, party);
    party.audio.tone(210, 0.28, { type: 'triangle', vol: 0.26, slide: -70, pan });
    party.audio.tone(420, 0.12, { type: 'sine', vol: 0.1, pan });
    party.audio.noise(0.2, { freq: 2600, q: 1.2, vol: 0.1, slide: -1800, pan });
    p.haptic(35);
  }
}

function popup(text, x, y, color, size) {
  popups.push({ text, x, y, color, size, t: 0, life: 1.3 });
}

function land(a, party) {
  const p = a.p, g = p.g, w = lastW, h = lastH;
  const pan = clamp((a.x1 / w) * 2 - 1, -0.8, 0.8);
  const audio = demo ? null : party.audio;
  const score = (pts) => {
    if (demo) return;
    g.total += pts;
    g.endPts += pts;
    if (pts > 0) g.hits++;
  };
  // balloons float in front of the bales
  for (const b of balloons) {
    if (Math.hypot(a.x1 - b.x * w, a.y1 - b.y * h) < h * 0.042) {
      balloons.splice(balloons.indexOf(b), 1);
      score(BALLOON_PTS);
      fx.burst(b.x * w, b.y * h, 18, { colors: [b.c, '#fff', b.c], speed: 300, up: 40, size: 6, gravity: 500 });
      popup(`+${BALLOON_PTS}`, b.x * w, b.y * h - h * 0.04, p.color, h * 0.05);
      audio?.play('pop');
      if (!demo) p.haptic([20, 30, 20]);
      return;
    }
  }
  const order = targets.filter((T) => T.d <= a.d + 0.12).sort((x, y) => x.d - y.d);
  for (const T of order) {
    const gg = geo(T, w, h);
    const dx = a.x1 - gg.cx, dy = a.y1 - gg.cy;
    const r = Math.hypot(dx, dy) / gg.faceR;
    if (r > 1.3) continue;
    let pts = STRAW_PTS, ring = -1;
    if (r <= 1) {
      ring = Math.min(4, Math.floor(r * 5));
      pts = RING_PTS[ring];
    }
    T.stuck.push({ ox: dx / gg.faceR, oy: dy / gg.faceR, color: p.color, rot: rand(-0.7, -0.2) });
    T.wob = 1;
    score(pts);
    fx.burst(a.x1, a.y1, ring === 0 ? 10 : 7, { colors: ['#f2c45a', '#ffe08a', '#d9a640'], speed: 220 * gg.k + 60, up: 80, size: 4 * gg.k + 2, gravity: 600, life: 0.8 });
    const fs = h * 0.045 * (0.6 + 0.4 * gg.k) + 10;
    if (ring === 0) {
      if (!demo) g.golds++;
      g.joy = 1.6;
      popup('BULLSEYE!', gg.cx, gg.cy - gg.baleR - fs * 0.6, '#ffd21f', fs * 1.25);
      fx.burst(gg.cx, gg.cy, 30, { speed: 420, up: 220 });
      audio?.play('ding');
      audio?.play('cheer');
      if (!demo) {
        p.haptic([40, 40, 120]);
        party.shake(0.35);
      }
    } else {
      popup(ring < 0 ? `+${pts} straw` : `+${pts}`, a.x1, a.y1 - fs * 0.8, ring < 0 ? '#fff' : p.color, fs);
      if (!demo) p.haptic(ring <= 1 ? [30, 30, 60] : 40);
    }
    audio?.noise(0.13, { freq: 420, q: 0.9, vol: 0.36, type: 'lowpass', pan });
    audio?.tone(120, 0.12, { type: 'sine', vol: 0.28, slide: -40, pan });
    if (ring >= 0 && ring <= 1) audio?.tone(ring === 0 ? 1320 : 990, 0.18, { type: 'triangle', vol: 0.12, at: 0.05, pan });
    return;
  }
  // miss
  const hz = horizonY(h);
  g.sad = 1;
  if (a.y1 > hz) {
    groundArrows.push({ x: a.x1, y: a.y1, len: h * 0.05 * lerp(1, 0.35, a.d), color: p.color });
    fx.burst(a.x1, a.y1, 6, { colors: ['#b98a4a', '#62d23c'], shape: 'puff', speed: 80, up: 30, size: 6, life: 0.6, gravity: 0 });
    audio?.noise(0.12, { freq: 300, q: 0.8, vol: 0.2, type: 'lowpass', pan });
  } else {
    audio?.play('whoosh');
  }
  popup('Miss', a.x1, Math.min(a.y1, h * 0.75) - h * 0.03, '#fff', h * 0.035 + 8);
}

// ───────────── drawing ─────────────
function drawRange(ctx, w, h, hz) {
  // barn and hay stack on the horizon
  const bs = Math.min(h * 0.16, w * 0.12);
  const bx = w * 0.84, by = hz + 2;
  ctx.beginPath();
  ctx.moveTo(bx - bs * 0.6, by);
  ctx.lineTo(bx - bs * 0.6, by - bs * 0.6);
  ctx.lineTo(bx - bs * 0.35, by - bs * 0.95);
  ctx.lineTo(bx + bs * 0.35, by - bs * 0.95);
  ctx.lineTo(bx + bs * 0.6, by - bs * 0.6);
  ctx.lineTo(bx + bs * 0.6, by);
  ctx.closePath();
  inked(ctx, '#ff3b30', 4);
  rr(ctx, bx - bs * 0.2, by - bs * 0.42, bs * 0.4, bs * 0.42, 2);
  inked(ctx, '#fff6e0', 3);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(bx - bs * 0.2, by - bs * 0.42);
  ctx.lineTo(bx + bs * 0.2, by);
  ctx.moveTo(bx + bs * 0.2, by - bs * 0.42);
  ctx.lineTo(bx - bs * 0.2, by);
  ctx.stroke();
  for (let i = 0; i < 3; i++) {
    const hx = w * 0.1 + i * bs * 0.36, hy = by;
    rr(ctx, hx, hy - bs * 0.26, bs * 0.34, bs * 0.26, 4);
    inked(ctx, '#f2c45a', 3);
  }
  rr(ctx, w * 0.1 + bs * 0.18, by - bs * 0.5, bs * 0.34, bs * 0.24, 4);
  inked(ctx, '#ffd86e', 3);
  // fence posts along the back
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.fillStyle = '#fff6e0';
  for (let x = w * 0.02; x < w; x += w / 22) {
    if (x > bx - bs * 0.7 && x < bx + bs * 0.7) continue;
    rr(ctx, x, hz - h * 0.025, 6, h * 0.025, 2);
    ctx.fill();
    ctx.stroke();
  }
  // chalk range lines toward the vanishing point
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,.55)';
  ctx.lineWidth = 4;
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(w / 2 + i * w * 0.04, hz + 3);
    ctx.lineTo(w / 2 + i * w * 0.36, h);
    ctx.stroke();
  }
  // distance stripes
  for (const d of [0.25, 0.5, 0.75]) {
    const y = hz + (h - hz) * (0.66 - 0.6 * d);
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTarget(ctx, T, gg, w, h) {
  const { cx, cy, gy, faceR, baleR, k } = gg;
  const lw = Math.max(2, 4.5 * k);
  shadow(ctx, cx, gy, baleR * 1.1, baleR * 0.2);
  if (T.move) {
    // rail and hay cart
    ctx.strokeStyle = '#8a5a2b';
    ctx.lineWidth = Math.max(2, 5 * k);
    const half = T.move.amp * w + baleR * 1.4;
    const rx = T.x0 * w;
    ctx.beginPath();
    ctx.moveTo(rx - half, gy);
    ctx.lineTo(rx + half, gy);
    ctx.stroke();
    rr(ctx, cx - baleR * 1.2, gy - baleR * 0.55, baleR * 2.4, baleR * 0.4, 4 * k);
    inked(ctx, '#d48a3a', lw);
    for (const sx of [-1, 1]) {
      const wx = cx + sx * baleR * 0.8, wy = gy - baleR * 0.12;
      circle(ctx, wx, wy, baleR * 0.2, '#ff3b30', lw);
      ctx.save();
      ctx.translate(wx, wy);
      ctx.rotate(cx * 0.05);
      ctx.strokeStyle = INK;
      ctx.lineWidth = Math.max(1.5, 2.5 * k);
      ctx.beginPath();
      ctx.moveTo(-baleR * 0.2, 0);
      ctx.lineTo(baleR * 0.2, 0);
      ctx.moveTo(0, -baleR * 0.2);
      ctx.lineTo(0, baleR * 0.2);
      ctx.stroke();
      ctx.restore();
    }
  } else {
    // wooden A-frame stand
    for (const sx of [-1, 1]) limb(ctx, cx + sx * baleR * 0.45, cy + baleR * 0.6, cx + sx * baleR * 0.75, gy, '#c07a35', Math.max(3, 9 * k));
  }
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.sin(T.wob * 18) * T.wob * 0.06);
  // round straw bale
  circle(ctx, 0, 0, baleR, '#f2c45a', lw);
  ctx.strokeStyle = '#d9a640';
  ctx.lineWidth = Math.max(1.5, 3 * k);
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * TAU;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * faceR * 1.04, Math.sin(a) * faceR * 1.04);
    ctx.lineTo(Math.cos(a + 0.08) * baleR * 0.95, Math.sin(a + 0.08) * baleR * 0.95);
    ctx.stroke();
  }
  // painted rings
  for (let i = 4; i >= 0; i--) circle(ctx, 0, 0, faceR * (i + 1) / 5, RING_COLORS[i], Math.max(1.5, (i === 4 ? 4 : 2.5) * k));
  gloss(ctx, -faceR * 0.4, -faceR * 0.5, faceR * 0.22, faceR * 0.12, 0.5);
  // stuck arrows
  for (const s of T.stuck) drawStub(ctx, s.ox * faceR, s.oy * faceR, faceR * 0.55, s.color, s.rot);
  ctx.restore();
}

/** An arrow stuck in something, seen from behind: short shaft and coloured fletching. */
function drawStub(ctx, x, y, len, color, rot) {
  const ex = x + Math.cos(Math.PI / 2 + rot) * len, ey = y + Math.sin(Math.PI / 2 + rot) * len;
  ctx.lineCap = 'round';
  ctx.strokeStyle = INK;
  ctx.lineWidth = Math.max(3, len * 0.16);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(ex, ey);
  ctx.stroke();
  ctx.strokeStyle = '#a8642a';
  ctx.lineWidth = Math.max(1.5, len * 0.08);
  ctx.stroke();
  const fr = Math.max(3, len * 0.22);
  ctx.save();
  ctx.translate(ex, ey);
  ctx.rotate(rot);
  for (let i = 0; i < 3; i++) {
    ctx.rotate(TAU / 3);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(fr * 0.4, -fr * 0.2);
    ctx.lineTo(fr, fr * 0.35);
    ctx.lineTo(0, fr * 0.2);
    ctx.closePath();
    inked(ctx, color, 1.5);
  }
  ctx.restore();
  circle(ctx, x, y, Math.max(1.5, len * 0.07), INK, 0);
}

function drawFlying(ctx, a, h) {
  const s = clamp(a.t / a.T, 0, 1);
  const arc = h * (0.08 + 0.14 * a.d) * (1.25 - a.power * 0.35);
  const pos = (u) => ({ x: lerp(a.x0, a.x1, u), y: lerp(a.y0, a.y1, u) - arc * 4 * u * (1 - u) });
  const p0 = pos(s), p1 = pos(Math.min(1, s + 0.02));
  const ang = Math.atan2(p1.y - p0.y, p1.x - p0.x);
  const len = h * 0.13 * (1 - s * (0.55 + 0.35 * a.d));
  ctx.save();
  ctx.translate(p0.x, p0.y);
  ctx.rotate(ang);
  // shaft
  ctx.lineCap = 'round';
  ctx.strokeStyle = INK;
  ctx.lineWidth = Math.max(3, len * 0.09);
  ctx.beginPath();
  ctx.moveTo(-len, 0);
  ctx.lineTo(0, 0);
  ctx.stroke();
  ctx.strokeStyle = '#c98a45';
  ctx.lineWidth = Math.max(1.5, len * 0.045);
  ctx.stroke();
  // head
  ctx.beginPath();
  ctx.moveTo(len * 0.16, 0);
  ctx.lineTo(-len * 0.02, -len * 0.07);
  ctx.lineTo(-len * 0.02, len * 0.07);
  ctx.closePath();
  inked(ctx, '#cfd6e6', 2);
  // fletching
  for (const sy of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(-len * 0.72, 0);
    ctx.lineTo(-len * 0.88, sy * len * 0.12);
    ctx.lineTo(-len * 1.02, sy * len * 0.12);
    ctx.lineTo(-len * 0.96, 0);
    ctx.closePath();
    inked(ctx, a.p.color, 2);
  }
  ctx.restore();
}

function drawBalloon(ctx, b, w, h) {
  const x = b.x * w, y = b.y * h, r = h * 0.032;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y + r * 1.2);
  ctx.quadraticCurveTo(x + Math.sin(E.clock * 3 + b.ph) * r * 0.6, y + r * 2.2, x, y + r * 3.2);
  ctx.stroke();
  ellipse(ctx, x, y, r, r * 1.2, 0, b.c, 3.5);
  ctx.beginPath();
  ctx.moveTo(x - r * 0.2, y + r * 1.3);
  ctx.lineTo(x + r * 0.2, y + r * 1.3);
  ctx.lineTo(x, y + r * 1.15);
  ctx.closePath();
  inked(ctx, b.c, 2);
  gloss(ctx, x - r * 0.35, y - r * 0.45, r * 0.2, r * 0.32, 0.7);
  label(ctx, `${BALLOON_PTS}`, x, y + 1, r * 0.95, { fill: '#fff', drop: false });
}

function drawStraws(ctx, w, h, hz) {
  const wn = windNow();
  if (Math.abs(wn) < 0.08) return;
  ctx.save();
  ctx.globalAlpha = clamp(Math.abs(wn) * 1.2, 0.2, 0.85);
  ctx.strokeStyle = '#ffe08a';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (const s of straws) {
    const x = s.x * w, y = s.y * hz * 1.35;
    const l = 8 * s.s;
    ctx.beginPath();
    ctx.moveTo(x - Math.cos(s.r) * l, y - Math.sin(s.r) * l * 0.4);
    ctx.lineTo(x + Math.cos(s.r) * l, y + Math.sin(s.r) * l * 0.4);
    ctx.stroke();
  }
  ctx.restore();
}

function drawWind(ctx, w, h) {
  const wn = windNow();
  const s = Math.min(h * 0.11, 90);
  const x = 22 + s * 0.2, y = 18;
  rr(ctx, x - 12, y, s * 2.3, s * 1.05, 16);
  inked(ctx, 'rgba(255,255,255,.9)', 4);
  // pole + windsock
  limb(ctx, x + s * 0.12, y + s * 0.95, x + s * 0.12, y + s * 0.12, '#8a8fb0', 4);
  const dir = Math.sign(wn) || 1;
  const strength = clamp(Math.abs(wn), 0, 1.2);
  ctx.save();
  ctx.translate(x + s * 0.12, y + s * 0.2);
  if (dir < 0) ctx.scale(-1, 1);
  const droop = (1 - Math.min(1, strength)) * 1.1;
  ctx.rotate(droop + Math.sin(E.clock * 9) * 0.05 * strength);
  const L = s * 0.75;
  for (let i = 0; i < 4; i++) {
    const x0 = (i / 4) * L, x1 = ((i + 1) / 4) * L;
    const r0 = s * 0.16 * (1 - i * 0.12), r1 = s * 0.16 * (1 - (i + 1) * 0.12);
    ctx.beginPath();
    ctx.moveTo(x0, -r0);
    ctx.lineTo(x1, -r1 + Math.sin(E.clock * 12 + i) * 1.5);
    ctx.lineTo(x1, r1 + Math.sin(E.clock * 12 + i) * 1.5);
    ctx.lineTo(x0, r0);
    ctx.closePath();
    inked(ctx, i % 2 ? '#fff' : '#ff3b30', 3);
  }
  ctx.restore();
  const mph = Math.round(strength * 10);
  label(ctx, 'WIND', x + s * 1.35, y + s * 0.3, s * 0.26, { fill: '#2f7cff', drop: false });
  const arrow = mph === 0 ? 'calm' : `${dir < 0 ? '<' : ''}${mph}${dir > 0 ? '>' : ''}`;
  label(ctx, arrow, x + s * 1.35, y + s * 0.7, s * 0.34, { fill: mph >= 6 ? '#ff3b30' : '#fff' });
}

function drawCrosshair(ctx, p, w, h, party) {
  const g = p.g;
  if (!g) return;
  if (!demo && party.state !== 'play' && party.state !== 'countdown') return;
  const c = crossPos(p, w, h);
  const base = Math.max(22, h * 0.04);
  const r = base * (1 - g.power * 0.35);
  const done = g.arrows <= 0 && !g.drawing;
  ctx.save();
  ctx.globalAlpha = done ? 0.35 : 1;
  // ink ring + colour ring
  ctx.lineCap = 'round';
  for (const [col, lw] of [[INK, 9], [p.color, 4.5]]) {
    ctx.strokeStyle = col;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.arc(c.x, c.y, r, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TAU;
      ctx.moveTo(c.x + Math.cos(a) * r * 0.55, c.y + Math.sin(a) * r * 0.55);
      ctx.lineTo(c.x + Math.cos(a) * r * 1.35, c.y + Math.sin(a) * r * 1.35);
    }
    ctx.stroke();
  }
  circle(ctx, c.x, c.y, 3.5, p.color, 2);
  // draw-power arc
  if (g.drawing || g.power > 0) {
    const full = g.power >= 1;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(c.x, c.y, r + 11, -Math.PI / 2, -Math.PI / 2 + TAU * g.power);
    ctx.stroke();
    ctx.strokeStyle = full ? (Math.floor(E.clock * 10) % 2 ? '#2fc65a' : '#b8ffcf') : '#ffd21f';
    ctx.lineWidth = 5;
    ctx.stroke();
    if (full && g.steadyT > 1.3 && g.shake < 0.2) sparkle(ctx, c.x + r + 18, c.y - r - 10, 9, '#ffd21f');
  }
  label(ctx, `P${p.n + 1}`, c.x + r * 1.1, c.y + r * 1.35, Math.max(14, base * 0.55), { fill: p.color, align: 'left' });
  ctx.restore();
}

function drawPlates(ctx, w, h, party) {
  const ph = plateH(h);
  const lanes = party.lanes(w, players.length, 420);
  players.forEach((p, i) => {
    const l = lanes[i], g = p.g;
    if (!l || !g) return;
    // bow, pointing at the crosshair
    const b = bowPos(p, party, w, h);
    drawBow(ctx, p, b.x, b.y, Math.min(h * 0.11, l.w * 0.3), w, h);
    // name plate
    const x = l.x0 + 8, y = h - ph - 6, pw = l.w - 16;
    rr(ctx, x, y, pw, ph, 18);
    inked(ctx, '#fff', 5);
    rr(ctx, x, y, ph * 1.05, ph, 18);
    inked(ctx, p.color, 5);
    ctx.save();
    rr(ctx, x, y, ph * 1.05, ph, 18);
    ctx.clip();
    const mood = g.joy > 0 ? 'cheer' : g.sad > 0 ? 'sad' : g.drawing ? (g.power >= 1 ? 'effort' : 'happy') : 'happy';
    drawAnimal(ctx, p.animal, x + ph * 0.52, y + ph * 1.5, ph * 1.25, { color: p.color, mood, bob: g.joy > 0 ? Math.abs(Math.sin(E.clock * 10)) * ph * 0.06 : 0 });
    ctx.restore();
    rr(ctx, x, y, ph * 1.05, ph, 18);
    inked(ctx, null, 5);
    const tx = x + ph * 1.2;
    const avail = pw - ph * 1.2 - 8;
    label(ctx, `P${p.n + 1}${p.kind === 'cpu' ? ' CPU' : ''}`, tx, y + ph * 0.26, Math.min(ph * 0.24, avail * 0.2), { fill: p.color, align: 'left', drop: false });
    label(ctx, `${g.total}`, x + pw - 12, y + ph * 0.36, Math.min(ph * 0.48, avail * 0.3), { fill: '#ffd21f', align: 'right' });
    // quiver: arrows left this end
    const qs = Math.min(ph * 0.22, avail / 7);
    for (let k = 0; k < ARROWS; k++) {
      const ax = tx + k * qs * 1.25 + qs * 0.5, ay = y + ph * 0.72;
      const has = k < g.arrows;
      ctx.save();
      ctx.globalAlpha = has ? 1 : 0.25;
      limb(ctx, ax, ay + qs * 0.6, ax, ay - qs * 0.5, '#c98a45', Math.max(2, qs * 0.12));
      ctx.beginPath();
      ctx.moveTo(ax, ay - qs * 0.95);
      ctx.lineTo(ax - qs * 0.22, ay - qs * 0.55);
      ctx.lineTo(ax + qs * 0.22, ay - qs * 0.55);
      ctx.closePath();
      inked(ctx, '#cfd6e6', 2);
      ctx.beginPath();
      ctx.moveTo(ax, ay + qs * 0.25);
      ctx.lineTo(ax - qs * 0.3, ay + qs * 0.7);
      ctx.lineTo(ax + qs * 0.3, ay + qs * 0.7);
      ctx.closePath();
      inked(ctx, p.color, 2);
      ctx.restore();
    }
    if (!demo && g.endPts > 0) label(ctx, `+${g.endPts}`, x + pw - 12, y + ph * 0.76, Math.min(ph * 0.24, avail * 0.18), { fill: p.color, align: 'right', drop: false });
  });
}

function drawBow(ctx, p, x, y, s, w, h) {
  const g = p.g;
  const c = crossPos(p, w, h);
  const ang = clamp(Math.atan2(c.y - y, c.x - x) + Math.PI / 2, -1.1, 1.1);
  const pull = g.drawing ? g.power : 0;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  // limbs (seen from above and behind: a curved bow, string pulled toward us)
  const tipX = s * 0.95, tipY = s * 0.05;
  const nockY = s * 0.12 + pull * s * 0.55;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-tipX, tipY);
  ctx.lineTo(0, nockY);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();
  for (const [col, lw] of [[INK, s * 0.17 + 6], ['#d48a3a', s * 0.17], ['#ffb85c', s * 0.05]]) {
    ctx.strokeStyle = col;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(-tipX, tipY);
    ctx.quadraticCurveTo(-s * 0.5, -s * 0.42, 0, -s * 0.42);
    ctx.quadraticCurveTo(s * 0.5, -s * 0.42, tipX, tipY);
    ctx.stroke();
  }
  rr(ctx, -s * 0.12, -s * 0.52, s * 0.24, s * 0.2, 5);
  inked(ctx, p.color, 3);
  // nocked arrow
  if (g.arrows > 0 && (g.cool <= 0 || g.drawing)) {
    limb(ctx, 0, nockY, 0, -s * 0.85, '#c98a45', Math.max(3, s * 0.06));
    ctx.beginPath();
    ctx.moveTo(0, -s * 1.02);
    ctx.lineTo(-s * 0.09, -s * 0.8);
    ctx.lineTo(s * 0.09, -s * 0.8);
    ctx.closePath();
    inked(ctx, '#cfd6e6', 3);
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(0, nockY - s * 0.05);
      ctx.lineTo(sx * s * 0.12, nockY + s * 0.02);
      ctx.lineTo(sx * s * 0.12, nockY - s * 0.14);
      ctx.lineTo(0, nockY - s * 0.22);
      ctx.closePath();
      inked(ctx, p.color, 2.5);
    }
  }
  ctx.restore();
}

function drawTally(ctx, w, h) {
  const rows = players.slice().sort((a, b) => b.g.endPts - a.g.endPts);
  const rh = Math.min(56, h * 0.07);
  const cw = Math.min(560, w * 0.8), ch = rh * (rows.length + 1.6) + 20;
  const x = (w - cw) / 2, y = h * 0.42 - ch / 2;
  ctx.save();
  ctx.fillStyle = INK;
  rr(ctx, x, y + 8, cw, ch, 26);
  ctx.fill();
  rr(ctx, x, y, cw, ch, 26);
  inked(ctx, '#fff6e0', 6);
  label(ctx, `End ${E.i + 1}: ${ENDS[E.i].name}`, w / 2, y + rh * 0.75, rh * 0.62, { fill: '#2fc65a' });
  rows.forEach((p, i) => {
    const ry = y + rh * (1.75 + i);
    circle(ctx, x + 40, ry, rh * 0.28, p.color, 4);
    label(ctx, p.label, x + 40 + rh * 0.5, ry, rh * 0.42, { fill: '#fff', align: 'left', drop: false });
    label(ctx, `+${p.g.endPts}`, x + cw - 150, ry, rh * 0.5, { fill: p.g.endPts ? p.color : '#c8c8d8', align: 'right' });
    label(ctx, `${p.g.total}`, x + cw - 30, ry, rh * 0.5, { fill: '#ffd21f', align: 'right' });
  });
  ctx.restore();
}

startParty(game);
