// Wobble Tower: hold your phone flat like a tray and tilt it to keep a growing tower of eggs
// balanced. Your hen keeps laying eggs on top, and the taller the tower the more it is worth, but
// the harder it wobbles. Press Action to bank the tower into your basket before it topples.
// Original Exemoo party minigame.
import { startParty } from './party.js';
import {
  INK, TAU, clamp, lerp, rand, rr, inked, circle, ellipse, limb, gloss, shadow, label, sparkle, farmBackdrop, drawAnimal, Particles,
} from './art.js';

const ROUND = 50;
const MAX_TILT = 0.6; // rad of tray tilt (about 35 degrees of phone roll)
const TOPPLE = 0.62; // rad of lean before the tower falls
const MAX_EGGS = 12;
const value = (n) => (n * (n + 1)) / 2; // 1, 3, 6, 10, 15, 21, 28 ...

let players = [];
let demo = true;
const fx = new Particles();
const wind = { f: 0, target: 0, t: 4, show: 0, leaves: [] };
let lastW = 1280, lastH = 720;

const game = {
  id: 'wobble-tower',
  title: 'Wobble Tower',
  tagline: 'Balance the egg tower. Bank it before it topples!',
  accent: '#2fc65a',
  roundSeconds: ROUND,
  music: { bpm: 104, root: 60, scale: [0, 2, 4, 7, 9], prog: [0, 5, 9, 7], lead: 'marimba', seed: 23 },
  howTo: [
    { icon: 'tilt', title: 'Tilt to balance', text: 'Hold your phone flat like a tray. Tilt toward the lean to catch the tower.' },
    { icon: 'basket', title: 'Eggs pile up', text: 'Your hen keeps adding eggs. Taller towers are worth much more.' },
    { icon: 'button', title: 'Bank it', text: 'Press the big button to bank the tower before it topples. Eggs left at the bell count too.' },
  ],
  keysHelp: 'Keyboard: hold your left / right keys to tilt the tray, tap your action key to bank. Recenter on the phone sets "flat".',

  start(list, opts) {
    demo = opts.demo;
    players = list;
    for (const p of list) {
      const keepOffset = p.g?.offset || 0;
      p.g = {
        phi: 0, phiRaw: 0, offset: keepOffset, roll: 0,
        theta: rand(-0.05, 0.05), omega: 0,
        n: demo ? 3 + ((p.n * 2) % 5) : 0,
        score: 0,
        fallT: 0, dropT: rand(0.5, 1.2), egg: null, bankAnim: 0, bankVal: 0, splatT: 0,
        cpu: { skill: rand(0.55, 0.9), goal: (4 + Math.random() * 5) | 0, err: 0, errT: 0, lag: rand(0.08, 0.16) },
        blink: 0, blinkT: rand(1, 4), basket: 0,
      };
    }
    wind.f = 0;
    wind.target = 0;
    wind.t = rand(5, 8);
    wind.show = 0;
  },

  packet(p, pkt) {
    const g = p.g;
    if (!g || !pkt.q) return;
    const q = pkt.q;
    // Device roll (rotation about its long axis), positive = right edge down. Same formula as Farm Dash.
    const roll = Math.atan2(2 * (q.w * q.y - q.z * q.x), 1 - 2 * (q.x * q.x + q.y * q.y));
    g.roll = roll;
    g.phiRaw = clamp(roll - g.offset, -MAX_TILT, MAX_TILT);
  },

  recenter(p) {
    if (p.g) p.g.offset = p.g.roll;
  },

  action(p) {
    const st = game._party?.state;
    if (st !== 'play') return;
    bank(p, game._party);
  },

  update(dt, party) {
    game._party = party;
    const st = party.state;
    const live = st === 'play';
    fx.update(dt);

    // shared wind gusts
    if (live || demo) {
      wind.t -= dt;
      if (wind.t <= 0) {
        if (wind.target === 0) {
          const strength = demo ? 0.5 : rand(0.6, 1.1) + Math.min(0.6, party.roundT / 60);
          wind.target = (Math.random() < 0.5 ? -1 : 1) * strength;
          wind.t = rand(0.9, 1.6);
          wind.show = 1.2;
          if (!demo) {
            party.audio.noise(1.4, { freq: 400, q: 0.7, vol: 0.22, slide: 600, attack: 0.3, pan: wind.target > 0 ? 0.6 : -0.6 });
            party.banner(wind.target > 0 ? 'GUST >>' : '<< GUST', '#bfe8ff', 1000);
          }
        } else {
          wind.target = 0;
          wind.t = rand(3.5, 7) * (party.roundT > 30 ? 0.7 : 1);
        }
      }
    }
    wind.f = lerp(wind.f, wind.target, 1 - Math.exp(-dt * 4));
    wind.show = Math.max(0, wind.show - dt);
    // leaves in the wind
    if (Math.abs(wind.f) > 0.15 && Math.random() < Math.abs(wind.f) * dt * 30) {
      wind.leaves.push({ x: wind.f > 0 ? -20 : lastW + 20, y: rand(0.1, 0.8) * lastH, vy: rand(-40, 40), r: rand(0, TAU), c: Math.random() < 0.5 ? '#2fc65a' : '#ffb000' });
    }
    for (const l of wind.leaves) {
      l.x += wind.f * 900 * dt + Math.sign(wind.f || 1) * 60 * dt;
      l.y += l.vy * dt + Math.sin(l.r * 3) * 30 * dt;
      l.r += dt * 4;
    }
    wind.leaves = wind.leaves.filter((l) => l.x > -40 && l.x < lastW + 40);

    for (const p of players) {
      const g = p.g;
      g.blinkT -= dt;
      if (g.blinkT < 0) {
        g.blink = 0.15;
        g.blinkT = rand(2, 5);
      }
      g.blink = Math.max(0, g.blink - dt);
      g.bankAnim = Math.max(0, g.bankAnim - dt);
      g.splatT = Math.max(0, g.splatT - dt);

      // tray tilt from the player's input
      let target = 0;
      if (demo || p.kind === 'cpu') target = cpuTilt(p, dt);
      else if (p.usingPhone) target = g.phiRaw;
      else target = (p.held('right') ? 0.45 : 0) - (p.held('left') ? 0.45 : 0);
      if (!demo && p.kind !== 'cpu' && p.usingPhone) g.phi = lerp(g.phi, target, 1 - Math.exp(-dt * 25));
      else g.phi += clamp(target - g.phi, -3 * dt, 3 * dt);

      if (!live && !demo) {
        // countdown: tray follows the hand, tower holds still
        g.theta = lerp(g.theta, 0, 1 - Math.exp(-dt * 6));
        g.omega = 0;
        continue;
      }

      // eggs from the hen
      if (g.fallT > 0) {
        g.fallT -= dt;
        if (g.fallT <= 0) {
          g.theta = 0;
          g.omega = 0;
          g.dropT = 0.4;
        }
        continue;
      }
      if (g.egg) {
        g.egg.t += dt / 0.45;
        if (g.egg.t >= 1) {
          g.egg = null;
          g.n = Math.min(MAX_EGGS, g.n + 1);
          g.omega += rand(-0.45, 0.45) + (g.n === 1 ? rand(-0.1, 0.1) : 0);
          if (!demo) {
            party.audio.tone(900 + g.n * 40, 0.08, { type: 'sine', vol: 0.18, slide: -300 });
            if (p.kind === 'human') p.haptic(15);
          }
          g.dropT = demo ? rand(1.5, 2.5) : Math.max(1.5, 2.5 - party.roundT * 0.015);
        }
      } else if (g.n < MAX_EGGS) {
        g.dropT -= dt;
        if (g.dropT <= 0) {
          g.egg = { t: 0 };
          if (!demo) party.audio.tone(1300, 0.12, { type: 'triangle', vol: 0.1, slide: 400 });
        }
      }
      if (demo && g.n >= 7) {
        g.n = 2;
      }

      // tower physics: an inverted pendulum steered by the tray
      if (g.n > 0) {
        const A = 1.6 + 0.32 * g.n;
        const push = wind.f * (0.8 + 0.05 * g.n);
        // sub-steps for stability
        const steps = 4;
        for (let i = 0; i < steps; i++) {
          const a2 = A * Math.sin(g.theta) - 6 * g.phi - 1.0 * g.omega + push;
          g.omega += a2 * (dt / steps);
          g.theta += g.omega * (dt / steps);
        }
        if (Math.abs(g.theta) > TOPPLE) topple(p, party);
      } else {
        g.theta = lerp(g.theta, g.phi * 0.3, 1 - Math.exp(-dt * 8));
        g.omega = 0;
      }
    }
  },

  onFinish() {
    // eggs still on the tray at the bell count too
    for (const p of players) {
      const g = p.g;
      if (g.n > 0 && g.fallT <= 0) {
        g.bankVal = value(g.n);
        g.score += g.bankVal;
        g.basket += g.n;
        g.n = 0;
        g.bankAnim = 1.2;
      }
    }
  },

  results() {
    return players.map((p) => ({ p, score: p.g.score, text: `${p.g.score} pts` }));
  },

  hudText(party) {
    const left = Math.ceil(party.timeLeft);
    return `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
  },

  draw(ctx, w, h, party) {
    lastW = w;
    lastH = h;
    const horizon = h * 0.3;
    farmBackdrop(ctx, w, h, horizon, { t: party.t });
    drawBarn(ctx, w, horizon);
    // rafter for the hens
    const beamY = h * 0.11;
    rr(ctx, -10, beamY - 10, w + 20, 20, 6);
    inked(ctx, '#b8763e', 5);
    for (let x = 30; x < w; x += 120) {
      circle(ctx, x, beamY, 3, INK, 0);
    }
    const lanes = party.lanes(w, players.length, 460);
    players.forEach((p, i) => drawLane(ctx, p, lanes[i], h, beamY, party));
    // leaves
    for (const l of wind.leaves) {
      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(l.r);
      ellipse(ctx, 0, 0, 9, 4.5, 0, l.c, 2.5);
      ctx.restore();
    }
    if (Math.abs(wind.f) > 0.2) {
      ctx.save();
      ctx.globalAlpha = clamp(Math.abs(wind.f), 0, 0.6);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      for (let i = 0; i < 7; i++) {
        const y = h * (0.2 + i * 0.1);
        const x = ((party.t * 900 * Math.sign(wind.f) + i * 271) % (w + 400) + w + 400) % (w + 400) - 200;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - Math.sign(wind.f) * 120, y);
        ctx.stroke();
      }
      ctx.restore();
    }
    fx.draw(ctx);
  },
};

function bank(p, party) {
  const g = p.g;
  if (g.n <= 0 || g.fallT > 0) return;
  g.bankVal = value(g.n);
  g.score += g.bankVal;
  g.basket += g.n;
  const c = trayPos(p);
  if (c) fx.burst(c.x, c.y - 40, 14 + g.n * 3, { colors: ['#ffd21f', '#fff', p.color], speed: 300, up: 200 });
  g.n = 0;
  g.theta = 0;
  g.omega = 0;
  g.egg = null;
  g.dropT = 0.8;
  g.bankAnim = 1.2;
  party.audio.play('ding');
  party.audio.tone(700 + g.bankVal * 6, 0.25, { type: 'square', vol: 0.08, at: 0.08 });
  p.haptic([30, 30, 60]);
}

function topple(p, party) {
  const g = p.g;
  const c = trayPos(p);
  if (c && !demo) {
    for (let i = 0; i < g.n; i++) {
      const hgt = (i + 0.5) * eggSize(p).h;
      const ex = c.x + Math.sin(g.theta) * hgt, ey = c.y - Math.cos(g.theta) * hgt;
      fx.burst(ex, ey, 6, { colors: ['#fff6e0', '#ffd21f', '#ffb000'], shape: 'drop', speed: 260, up: 120, size: 6 });
    }
  }
  if (!demo) {
    party.audio.play('splat');
    party.audio.tone(500, 0.5, { type: 'triangle', vol: 0.15, slide: -350, at: 0.05 });
    p.haptic([200, 60, 120]);
    party.shake(0.4);
  }
  g.n = 0;
  g.egg = null;
  g.fallT = demo ? 0.8 : 1.6;
  g.splatT = 1.6;
  g.theta = Math.sign(g.theta) * TOPPLE;
}

function cpuTilt(p, dt) {
  const g = p.g, c = g.cpu;
  c.errT -= dt;
  if (c.errT <= 0) {
    c.errT = rand(0.3, 0.8);
    c.err = rand(-1, 1) * (1 - c.skill) * 0.25;
  }
  const A = 1.6 + 0.32 * g.n;
  const k1 = A / 6 + 0.55 + c.skill * 0.3;
  const k2 = 0.3 + c.skill * 0.15;
  // react with a little lag: use a slightly stale estimate
  const th = g.theta - g.omega * c.lag, om = g.omega;
  let target = clamp(k1 * th + k2 * om + wind.f * (0.8 + 0.05 * g.n) / 6 + c.err, -MAX_TILT, MAX_TILT);
  if (g.n === 0) target = 0;
  // bank decision
  if (!demo && game._party?.state === 'play' && g.n > 0 && g.fallT <= 0) {
    const nervous = Math.abs(g.theta) > 0.38 && g.n >= 3;
    if (g.n >= c.goal || nervous) {
      bank(p, game._party);
      c.goal = (4 + Math.random() * 5 * c.skill + 1) | 0;
    }
  }
  return target;
}

// ───────────── drawing ─────────────
function eggSize(p) {
  const l = laneOf(p);
  const s = l ? sizesOf(l).s : 160;
  return { w: s * 0.15, h: s * 0.13 };
}
function laneOf(p) {
  const party = game._party;
  if (!party) return null;
  return party.lanes(lastW, players.length, 460)[players.indexOf(p)];
}
function sizesOf(lane) {
  const s = Math.min(lane.w * 0.5, lastH * 0.24);
  return { s, footY: lastH * 0.95, x: lane.cx };
}
function trayPos(p) {
  const l = laneOf(p);
  if (!l) return null;
  const { s, footY, x } = sizesOf(l);
  return { x, y: footY - s * 1.32 };
}

function drawBarn(ctx, w, horizon) {
  const bw = Math.min(w * 0.22, 280), bx = w * 0.12, by = horizon;
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.lineTo(bx, by - bw * 0.5);
  ctx.lineTo(bx + bw * 0.5, by - bw * 0.85);
  ctx.lineTo(bx + bw, by - bw * 0.5);
  ctx.lineTo(bx + bw, by);
  ctx.closePath();
  inked(ctx, '#e8483b', 5);
  rr(ctx, bx + bw * 0.3, by - bw * 0.42, bw * 0.4, bw * 0.42, 4);
  inked(ctx, '#fff', 4);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(bx + bw * 0.3, by - bw * 0.42);
  ctx.lineTo(bx + bw * 0.7, by);
  ctx.moveTo(bx + bw * 0.7, by - bw * 0.42);
  ctx.lineTo(bx + bw * 0.3, by);
  ctx.stroke();
  // silo
  const sx = w * 0.82;
  rr(ctx, sx, by - bw * 0.75, bw * 0.28, bw * 0.75, 6);
  inked(ctx, '#c9d3e8', 5);
  ctx.beginPath();
  ctx.arc(sx + bw * 0.14, by - bw * 0.75, bw * 0.14, Math.PI, TAU);
  inked(ctx, '#2f7cff', 5);
}

function drawHen(ctx, x, y, s, laying, t) {
  const u = s / 60;
  // nest
  ellipse(ctx, x, y + 4 * u, 26 * u, 9 * u, 0, '#e8b24a', 4);
  ctx.strokeStyle = '#a8642a';
  ctx.lineWidth = 2;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * 9 * u - 6 * u, y + 1 * u);
    ctx.lineTo(x + i * 9 * u + 6 * u, y + 8 * u);
    ctx.stroke();
  }
  const bob = laying ? Math.sin(t * 40) * 2 * u : Math.sin(t * 3) * u;
  ellipse(ctx, x, y - 8 * u + bob, 22 * u, 16 * u, 0, '#fff', 4);
  ellipse(ctx, x - 6 * u, y - 8 * u + bob, 10 * u, 7 * u, 0.3, '#f0f0f8', 3);
  circle(ctx, x + 16 * u, y - 24 * u + bob, 10 * u, '#fff', 4);
  // comb + beak + wattle
  for (let i = 0; i < 3; i++) circle(ctx, x + 12 * u + i * 4 * u, y - 34 * u + bob, 3.5 * u, '#ff3b30', 2.5);
  ctx.beginPath();
  ctx.moveTo(x + 25 * u, y - 26 * u + bob);
  ctx.lineTo(x + 33 * u, y - 23 * u + bob);
  ctx.lineTo(x + 25 * u, y - 20 * u + bob);
  ctx.closePath();
  inked(ctx, '#ff9a1f', 2.5);
  circle(ctx, x + 18 * u, y - 26 * u + bob, 2 * u, INK, 0);
  ellipse(ctx, x + 25 * u, y - 16 * u + bob, 2.5 * u, 4 * u, 0, '#ff3b30', 2);
  // tail
  ctx.beginPath();
  ctx.moveTo(x - 20 * u, y - 12 * u + bob);
  ctx.lineTo(x - 32 * u, y - 26 * u + bob);
  ctx.lineTo(x - 22 * u, y - 4 * u + bob);
  ctx.closePath();
  inked(ctx, '#fff', 3);
}

function drawEgg(ctx, x, y, w, h, rot, tint = '#fff6e0') {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.55);
  ctx.bezierCurveTo(w * 0.62, -h * 0.55, w * 0.58, h * 0.5, 0, h * 0.5);
  ctx.bezierCurveTo(-w * 0.58, h * 0.5, -w * 0.62, -h * 0.55, 0, -h * 0.55);
  ctx.closePath();
  inked(ctx, tint, 3.5);
  gloss(ctx, -w * 0.15, -h * 0.2, w * 0.1, h * 0.12, 0.8);
  ctx.restore();
}

function drawLane(ctx, p, lane, h, beamY, party) {
  const g = p.g;
  if (!g || !lane) return;
  const { s, footY, x } = sizesOf(lane);
  // lane tint
  ctx.save();
  ctx.globalAlpha = 0.13;
  ctx.fillStyle = p.color;
  ctx.fillRect(lane.x0 + 4, beamY + 10, lane.w - 8, h);
  ctx.restore();

  // hen over the lane
  const henX = x, henY = beamY - 6;
  drawHen(ctx, henX, henY, Math.min(60, lane.w * 0.18), !!g.egg, party.t + p.n);

  const tray = { x: x + g.phi * s * 0.12, y: footY - s * 1.32 };
  const { w: ew, h: eh } = { w: s * 0.15, h: s * 0.13 };
  const mood = g.splatT > 0 ? 'sad' : g.bankAnim > 0 ? 'cheer' : Math.abs(g.theta) > 0.35 && g.n > 0 ? 'shock' : g.n >= 5 ? 'effort' : 'happy';
  const cph = Math.cos(g.phi), sph = Math.sin(g.phi);
  const tw = s * 0.62;
  const handL = { x: tray.x - tw * 0.38 * cph, y: tray.y + 10 - tw * 0.38 * sph };
  const handR = { x: tray.x + tw * 0.38 * cph, y: tray.y + 10 + tw * 0.38 * sph };
  drawAnimal(ctx, p.animal, x, footY, s, {
    color: p.color,
    mood,
    blink: g.blink > 0 ? 1 : 0,
    hands: [handL, handR],
    lean: g.phi * 0.12,
    bob: g.bankAnim > 0 ? Math.abs(Math.sin(party.t * 12)) * s * 0.06 : 0,
  });

  // tray
  ctx.save();
  ctx.translate(tray.x, tray.y);
  ctx.rotate(g.phi);
  rr(ctx, -tw / 2, -6, tw, 12, 6);
  inked(ctx, '#c9d3e8', 4);
  ctx.fillStyle = '#fff';
  ctx.globalAlpha = 0.6;
  ctx.fillRect(-tw / 2 + 8, -3, tw * 0.5, 3);
  ctx.restore();

  // tower (leans by theta around the tray centre)
  if (g.n > 0) {
    const base = { x: tray.x, y: tray.y - 6 };
    for (let i = 0; i < g.n; i++) {
      const d = (i + 0.5) * eh;
      const bend = g.theta * (1 + (i / Math.max(1, g.n)) * 0.35);
      const ex = base.x + Math.sin(bend) * d, ey = base.y - Math.cos(bend) * d;
      drawEgg(ctx, ex, ey, ew, eh * 1.08, bend + Math.sin(i * 2.1) * 0.06, i % 4 === 3 ? '#ffe9c4' : '#fff6e0');
    }
    // value tag
    const topY = base.y - g.n * eh - 30;
    label(ctx, `+${value(g.n)}`, base.x + Math.sin(g.theta) * g.n * eh, topY, Math.max(20, s * 0.16), { fill: '#ffd21f' });
    // danger ring
    if (Math.abs(g.theta) > 0.3) {
      const k = (Math.abs(g.theta) - 0.3) / (TOPPLE - 0.3);
      ctx.save();
      ctx.globalAlpha = clamp(k, 0, 1) * (0.5 + 0.5 * Math.sin(party.t * 25));
      label(ctx, g.theta > 0 ? '>>' : '<<', base.x + (g.theta > 0 ? 1 : -1) * s * 0.55, base.y - g.n * eh * 0.5, s * 0.22, { fill: '#ff3b30' });
      ctx.restore();
    }
  }
  // falling egg from the hen
  if (g.egg) {
    const t = g.egg.t;
    const top = henY + 4, land = tray.y - 6 - (g.n + 0.5) * eh;
    const ey = lerp(top, land, t * t);
    const ex = lerp(henX, tray.x + Math.sin(g.theta) * g.n * eh, t);
    drawEgg(ctx, ex, ey, ew, eh * 1.08, t * 3);
  }
  if (g.splatT > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(g.splatT, 0, 1);
    const sx = tray.x + (g.theta > 0 ? 1 : -1) * s * 0.5;
    ellipse(ctx, sx, footY - 4, s * 0.3, s * 0.06, 0, '#fff6e0', 3);
    ellipse(ctx, sx + 4, footY - 6, s * 0.1, s * 0.04, 0, '#ffb000', 2);
    label(ctx, 'SPLAT!', tray.x, tray.y - s * 0.5, s * 0.22, { fill: '#ffd21f' });
    ctx.restore();
  }
  if (g.bankAnim > 0 && g.bankVal) {
    ctx.save();
    ctx.globalAlpha = clamp(g.bankAnim, 0, 1);
    label(ctx, `BANKED +${g.bankVal}`, x, tray.y - s * 0.6 - (1.2 - g.bankAnim) * 50, Math.max(20, s * 0.16), { fill: '#2fc65a' });
    ctx.restore();
  }

  // basket + score
  const bx = lane.x0 + lane.w * 0.14, by = footY - 4;
  const bw = Math.min(lane.w * 0.2, s * 0.5);
  for (let i = 0; i < Math.min(6, g.basket); i++) drawEgg(ctx, bx - bw * 0.3 + (i % 3) * bw * 0.3, by - bw * 0.62 - ((i / 3) | 0) * 8, bw * 0.3, bw * 0.36, 0);
  ctx.beginPath();
  ctx.moveTo(bx - bw * 0.55, by - bw * 0.55);
  ctx.lineTo(bx + bw * 0.55, by - bw * 0.55);
  ctx.lineTo(bx + bw * 0.42, by);
  ctx.lineTo(bx - bw * 0.42, by);
  ctx.closePath();
  inked(ctx, '#d48a3a', 4);
  ctx.strokeStyle = '#a8642a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(bx - bw * 0.48, by - bw * 0.35);
  ctx.lineTo(bx + bw * 0.48, by - bw * 0.35);
  ctx.moveTo(bx - bw * 0.45, by - bw * 0.15);
  ctx.lineTo(bx + bw * 0.45, by - bw * 0.15);
  ctx.stroke();
  label(ctx, String(g.score), bx, by - bw * 1.05, Math.max(22, bw * 0.4), { fill: '#fff' });
  label(ctx, `P${p.n + 1}`, lane.x1 - 30, beamY + 40, 24, { fill: p.color });
  if (p.kind === 'cpu') label(ctx, 'CPU', lane.x1 - 30, beamY + 66, 15, { drop: false });
  if (g.n >= 8) sparkle(ctx, tray.x + s * 0.4, tray.y - g.n * eh, 10 + Math.sin(party.t * 8) * 3, '#ffd21f');
  void shadow;
  void limb;
}

startParty(game);
