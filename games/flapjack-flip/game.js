// Flapjack Flip: your phone is the frying pan. Each order asks for 1, 2 or 3 flips; flick the pan
// up with just the right snap so the pancake spins exactly that many times and lands flat.
// Six orders, best total wins. Original Exemoo party minigame.
import { startParty } from './party.js';
import {
  INK, TAU, clamp, lerp, rand, rr, inked, circle, ellipse, limb, gloss, shadow, label, sparkle, drawAnimal, Particles,
} from './art.js';

const TOSSES = 6;
const WINDOW = 6; // seconds to flick once an order is up
const FLICK_START = 230; // deg/s of rotation that starts a flick
const PER_FLIP = 330; // deg/s of peak flick speed per extra flip
const FLICK_BASE = 120;

let players = [];
let demo = true;
let toss = 0;
let targets = [];
let windowT = 0;
let betweenT = 0; // pause after every pancake has landed
let lastW = 1280, lastH = 720;
const fx = new Particles();

const flipsTxt = (n) => `${n} FLIP${n === 1 ? '' : 'S'}`;
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 0.5;

const game = {
  id: 'flapjack-flip',
  title: 'Flapjack Flip',
  tagline: 'Flick the pan, flip the pancake, land it flat!',
  accent: '#ff9a1f',
  music: { bpm: 122, root: 65, scale: [0, 2, 4, 7, 9], prog: [0, 5, 7, 5], lead: 'pluck', seed: 5 },
  howTo: [
    { icon: 'pancake', title: 'Read the order', text: 'Each order asks for 1, 2 or 3 flips. Everyone cooks the same order.' },
    { icon: 'flick', title: 'Flick the pan', text: 'Hold the phone like a pan handle and flick it up. A harder flick spins more.' },
    { icon: 'trophy', title: 'Land it flat', text: 'Exact flips and a flat landing score big. Six orders, best total wins.' },
  ],
  keysHelp: 'Keyboard: hold your action key to charge the power bar, release it on the right number of flips.',

  start(list, opts) {
    demo = opts.demo;
    players = list;
    toss = 0;
    targets = makeTargets();
    windowT = WINDOW;
    betweenT = 0;
    for (const p of list) {
      p.g = {
        score: 0, stack: 0, stage: 'wait', r: 0, airT: 0, dur: 1, result: null, resultT: 0,
        charging: false, charge: 0, chargeDir: 1,
        flick: { on: false, peak: 0, t0: 0 }, lastPeak: 0,
        cpu: { skill: rand(0.5, 0.9), at: rand(0.8, 2.6) },
        demoT: rand(0.5, 3), blink: 0, blinkT: rand(1, 4), panKick: 0, joy: 0, sizzle: rand(0, 0.3),
      };
    }
  },

  onGo(party) {
    beginToss(party);
  },

  packet(p, pkt) {
    const g = p.g;
    if (!g) return;
    const gy = pkt.gyro || { alpha: 0, beta: 0, gamma: 0 };
    const mag = Math.sqrt(gy.alpha * gy.alpha + gy.beta * gy.beta + gy.gamma * gy.gamma);
    const party = game._party;
    const open = party && party.state === 'play' && g.stage === 'wait' && windowT > 0 && betweenT <= 0;
    if (!open) {
      g.flick.on = false;
      return;
    }
    const now = performance.now();
    const f = g.flick;
    if (!f.on) {
      if (mag > FLICK_START) {
        f.on = true;
        f.peak = mag;
        f.t0 = now;
      }
      return;
    }
    f.peak = Math.max(f.peak, mag);
    if (mag < f.peak * 0.45 || now - f.t0 > 220) {
      f.on = false;
      g.lastPeak = f.peak;
      launch(p, clamp((f.peak - FLICK_BASE) / PER_FLIP, 0.2, 6), party);
    }
  },

  action(p, source) {
    const g = p.g;
    const party = game._party;
    if (source !== 'keys' || !party || party.state !== 'play') return;
    if (g.stage !== 'wait' || windowT <= 0 || betweenT > 0) return;
    g.charging = true;
    g.charge = 0;
    g.chargeDir = 1;
  },

  update(dt, party) {
    game._party = party;
    fx.update(dt);
    const st = party.state;
    const live = st === 'play';

    if (live) {
      if (betweenT > 0) {
        betweenT -= dt;
        if (betweenT <= 0) {
          toss++;
          if (toss >= TOSSES) party.finish();
          else beginToss(party);
        }
      } else {
        windowT -= dt;
        if (windowT <= 1.5 && windowT + dt > 1.5) party.audio.tone(1000, 0.08, { type: 'square', vol: 0.1 });
      }
    }

    let allDone = players.length > 0;
    for (const p of players) {
      const g = p.g;
      g.blinkT -= dt;
      if (g.blinkT < 0) {
        g.blink = 0.15;
        g.blinkT = rand(2, 5);
      }
      g.blink = Math.max(0, g.blink - dt);
      g.panKick = Math.max(0, g.panKick - dt * 3);
      g.resultT = Math.max(0, g.resultT - dt);
      g.joy = Math.max(0, g.joy - dt);

      if (demo) {
        if (g.stage === 'wait') {
          g.demoT -= dt;
          if (g.demoT <= 0) launch(p, targets[toss % targets.length] + gauss() * 0.25, party);
        }
      } else if (live && g.stage === 'wait' && betweenT <= 0) {
        // sizzle while waiting
        g.sizzle -= dt;
        if (g.sizzle <= 0) {
          g.sizzle = rand(0.15, 0.35);
          party.audio.noise(0.12, { freq: 6000, q: 1, vol: 0.012, type: 'highpass' });
        }
        if (p.kind === 'cpu') {
          g.cpu.at -= dt;
          if (g.cpu.at <= 0) launch(p, targets[toss] + gauss() * (0.42 - g.cpu.skill * 0.36), party);
        } else if (g.charging) {
          g.charge += g.chargeDir * 2.4 * dt;
          if (g.charge >= 4.6) {
            g.charge = 4.6;
            g.chargeDir = -1;
          } else if (g.charge <= 0) {
            g.charge = 0;
            g.chargeDir = 1;
          }
          if (!p.held('action')) {
            g.charging = false;
            launch(p, Math.max(0.2, g.charge), party);
          }
        }
        if (windowT <= 0 && g.stage === 'wait') {
          g.charging = false;
          setResult(p, { text: 'TOO SLOW', pts: 0, color: '#c9d3e8' }, party);
          g.stage = 'done';
        }
      }

      if (g.stage === 'air') {
        g.airT += dt;
        if (g.airT >= g.dur) land(p, party);
      }
      if (g.stage !== 'done') allDone = false;
      if (demo && g.stage === 'done' && g.resultT <= 0.6) {
        g.stage = 'wait';
        g.demoT = rand(1, 2.5);
        if (g.stack > 5) g.stack = 1;
      }
    }
    if (live && allDone && betweenT <= 0) betweenT = 1.6;
  },

  results() {
    return players.map((p) => ({ p, score: p.g.score, text: `${p.g.score} pts` }));
  },

  hudText() {
    const n = Math.min(toss + 1, TOSSES);
    const tgt = targets[Math.min(toss, TOSSES - 1)];
    return `Order ${n}/${TOSSES} · ${flipsTxt(tgt)}`;
  },

  draw(ctx, w, h, party) {
    lastW = w;
    lastH = h;
    drawKitchen(ctx, w, h);
    const lanes = party.lanes(w, players.length, 470);
    players.forEach((p, i) => drawLane(ctx, p, lanes[i], h, party));
    drawTicket(ctx, w, h, party);
    fx.draw(ctx);
  },
};

function makeTargets() {
  const t = [1, 2, 1, 3, 2, 3];
  // light shuffle, keeping an easy one first
  for (let i = t.length - 1; i > 1; i--) {
    const j = 1 + ((Math.random() * i) | 0);
    [t[i], t[j]] = [t[j], t[i]];
  }
  return t;
}

function beginToss(party) {
  windowT = WINDOW;
  betweenT = 0;
  for (const p of players) {
    const g = p.g;
    g.stage = 'wait';
    g.charging = false;
    g.flick.on = false;
    g.cpu.at = rand(0.9, 3.2);
  }
  party.banner(flipsTxt(targets[toss]), '#ffd21f', 1300);
  party.audio.play('ding');
  for (const p of players) if (p.kind === 'human') p.haptic(25);
}

function launch(p, r, party) {
  const g = p.g;
  if (g.stage !== 'wait') return;
  g.r = clamp(r, 0.2, 6);
  g.stage = 'air';
  g.airT = 0;
  g.dur = 0.55 + 0.24 * Math.min(g.r, 4.6);
  g.panKick = 1;
  if (!demo) {
    party.audio.play('whoosh');
    party.audio.tone(220, 0.08, { type: 'sine', vol: 0.2, slide: 200 });
    if (p.kind === 'human') p.haptic(20);
  }
}

function judge(r, target) {
  if (r > 4.6 || r > target + 1.6) return { text: 'TOO HIGH', pts: 0, color: '#ff3b30', lost: true };
  if (r < 0.45) return { text: 'FLOP', pts: 0, color: '#c9d3e8', flop: true };
  const k = Math.round(r);
  const frac = Math.abs(r - k);
  const flat = frac < 0.22;
  if (k === target) {
    if (frac < 0.08) return { text: 'PERFECT', pts: 100, color: '#ffd21f', flat: true, perfect: true };
    if (flat) return { text: 'GOOD', pts: 70, color: '#2fc65a', flat: true };
    return { text: 'WOBBLY', pts: 35, color: '#2f7cff' };
  }
  if (flat) return { text: flipsTxt(k), pts: 30, color: '#ff9a1f', flat: true };
  return { text: 'MESSY', pts: 15, color: '#ff9a1f' };
}

function land(p, party) {
  const g = p.g;
  const target = targets[Math.min(toss, TOSSES - 1)];
  const res = judge(g.r, target);
  g.stage = 'done';
  setResult(p, res, party);
  if (!demo) g.score += res.pts;
  if (res.pts > 0) g.stack++;
  const pos = panPos(p);
  if (!demo) {
    if (res.perfect) {
      party.audio.play('ding');
      party.audio.play('pop');
      if (pos) fx.burst(pos.x, pos.y - 30, 30, { speed: 380, up: 220 });
      if (p.kind === 'human') p.haptic([40, 30, 40]);
      g.joy = 1.4;
    } else if (res.lost) {
      party.audio.play('splat');
      if (p.kind === 'human') p.haptic([150]);
    } else if (res.flop) {
      party.audio.tone(160, 0.2, { type: 'triangle', vol: 0.2, slide: -60 });
      if (p.kind === 'human') p.haptic(60);
    } else {
      party.audio.play('pop');
      party.audio.noise(0.25, { freq: 5000, type: 'highpass', vol: 0.05 });
      if (p.kind === 'human') p.haptic(res.flat ? 30 : 80);
      if (res.flat) g.joy = 0.8;
    }
  }
  if (pos && !res.lost) fx.burst(pos.x, pos.y - 6, 8, { colors: ['#fff', '#fff6e0'], shape: 'puff', speed: 80, up: 60, size: 8, gravity: -40, life: 0.8 });
}

function setResult(p, res, party) {
  p.g.result = { ...res, r: p.g.r, peak: p.g.lastPeak };
  p.g.resultT = demo ? 1.6 : 99;
  void party;
}

// ───────────── layout ─────────────
function laneOf(p) {
  const party = game._party;
  if (!party) return null;
  return party.lanes(lastW, players.length, 470)[players.indexOf(p)];
}
function sizesOf(lane) {
  const s = Math.min(lane.w * 0.46, lastH * 0.27);
  return { s, footY: lastH * 0.78, x: lane.cx - lane.w * 0.14 };
}
function panPos(p) {
  const l = laneOf(p);
  if (!l) return null;
  const { s, footY, x } = sizesOf(l);
  return { x: x + s * 0.62, y: footY - s * 0.62 - p.g.panKick * s * 0.12, s };
}

// ───────────── drawing ─────────────
function drawKitchen(ctx, w, h) {
  // tiled wall
  const ts = Math.max(30, Math.round(w / 30));
  ctx.fillStyle = '#e6f6ff';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#bfe8ff';
  for (let y = 0, r = 0; y < h * 0.62; y += ts, r++) for (let x = (r % 2) * ts; x < w; x += ts * 2) ctx.fillRect(x, y, ts, ts);
  // window with the farm outside
  const ww = Math.min(w * 0.18, 220), wx = w * 0.06, wy = h * 0.08;
  rr(ctx, wx, wy, ww, ww * 0.7, 10);
  inked(ctx, '#5ec2ff', 5);
  ctx.save();
  rr(ctx, wx, wy, ww, ww * 0.7, 10);
  ctx.clip();
  ctx.fillStyle = '#62d23c';
  ctx.fillRect(wx, wy + ww * 0.45, ww, ww * 0.3);
  ctx.fillStyle = '#e8483b';
  ctx.fillRect(wx + ww * 0.55, wy + ww * 0.28, ww * 0.25, ww * 0.2);
  ctx.restore();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(wx + ww / 2, wy);
  ctx.lineTo(wx + ww / 2, wy + ww * 0.7);
  ctx.moveTo(wx, wy + ww * 0.35);
  ctx.lineTo(wx + ww, wy + ww * 0.35);
  ctx.stroke();
  // hanging utensils
  for (let i = 0; i < 3; i++) {
    const ux = w * 0.82 + i * 34, uy = h * 0.06;
    limb(ctx, ux, uy, ux, uy + 60 + i * 10, '#c9d3e8', 6);
    circle(ctx, ux, uy + 70 + i * 10, 13, i === 1 ? '#ff9a1f' : '#c9d3e8', 4);
  }
  // counter / stove top
  const cy = h * 0.78;
  rr(ctx, -10, cy - 14, w + 20, 28, 8);
  inked(ctx, '#ffffff', 5);
  ctx.fillStyle = '#2f7cff';
  ctx.fillRect(0, cy + 14, w, h - cy);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, cy + 14);
  ctx.lineTo(w, cy + 14);
  ctx.stroke();
  ctx.fillStyle = '#2468d6';
  for (let x = 0; x < w; x += 90) ctx.fillRect(x + 40, cy + 30, 10, h - cy);
}

function drawTicket(ctx, w, h, party) {
  if (demo || party.state === 'title' || party.state === 'lobby') return;
  const tgt = targets[Math.min(toss, TOSSES - 1)];
  const tw = Math.min(260, w * 0.22), th = tw * 0.5;
  const x = w - tw - 24, y = 90;
  ctx.save();
  ctx.translate(x + tw / 2, y);
  ctx.rotate(Math.sin(party.t * 1.5) * 0.03);
  limb(ctx, 0, -40, 0, 0, '#c9d3e8', 3);
  rr(ctx, -tw / 2, 0, tw, th, 8);
  inked(ctx, '#fffbe8', 5);
  label(ctx, 'ORDER', 0, th * 0.25, th * 0.2, { fill: '#ff9a1f', drop: false });
  label(ctx, flipsTxt(tgt), 0, th * 0.62, th * 0.32, { fill: '#fff' });
  if (party.state === 'play' && betweenT <= 0 && windowT > 0) {
    const k = clamp(windowT / WINDOW, 0, 1);
    rr(ctx, -tw / 2 + 10, th - 14, (tw - 20) * k, 8, 4);
    inked(ctx, k < 0.25 ? '#ff3b30' : '#2fc65a', 2);
  }
  ctx.restore();
}

function drawPancake(ctx, x, y, rx, angle, cooked = 1) {
  // side-on disc: vertical size follows cos(angle); colour shows which face is up
  const c = Math.cos(angle);
  const ry = Math.max(3, Math.abs(c) * rx * 0.32);
  const top = c >= 0 ? '#ffc95c' : '#f2a640';
  ellipse(ctx, x, y + 4, rx, ry + 4, 0, '#d98a2b', 4);
  ellipse(ctx, x, y, rx, ry, 0, top, 4);
  if (Math.abs(c) > 0.4) {
    ctx.save();
    ctx.globalAlpha = 0.35 * cooked;
    ctx.fillStyle = '#c87a20';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.ellipse(x + (i - 1.5) * rx * 0.35, y + Math.sin(i * 2) * ry * 0.3, rx * 0.08, ry * 0.18, 0, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawLane(ctx, p, lane, h, party) {
  const g = p.g;
  if (!g || !lane) return;
  const { s, footY, x } = sizesOf(lane);
  // stove burner
  const pan = panPos(p);
  ctx.save();
  ctx.globalAlpha = 0.5 + 0.2 * Math.sin(party.t * 9 + p.n);
  const bg = ctx.createRadialGradient(pan.x, footY - 10, 2, pan.x, footY - 10, s * 0.35);
  bg.addColorStop(0, '#ffb000');
  bg.addColorStop(1, 'rgba(255,90,0,0)');
  ctx.fillStyle = bg;
  ctx.fillRect(pan.x - s * 0.4, footY - s * 0.3, s * 0.8, s * 0.32);
  ctx.restore();
  ellipse(ctx, pan.x, footY - 10, s * 0.3, s * 0.06, 0, '#3a3d5c', 4);

  // chef
  const mood = g.result && g.resultT > 0 ? (g.result.pts >= 70 ? 'cheer' : g.result.pts === 0 ? 'sad' : 'happy') : g.charging || g.stage === 'air' ? 'effort' : 'happy';
  const handR = { x: pan.x - s * 0.36, y: pan.y + s * 0.06 };
  const ret = drawAnimal(ctx, p.animal, x, footY, s, {
    color: p.color,
    mood,
    blink: g.blink > 0 ? 1 : 0,
    hands: [{ x: x - s * 0.3, y: footY - s * 0.5 }, handR],
    bob: g.joy > 0 ? Math.abs(Math.sin(party.t * 12)) * s * 0.06 : 0,
  });
  drawChefHat(ctx, ret.top.x, ret.top.y + s * 0.1, s * 0.3);

  // pan
  const tilt = -g.panKick * 0.5;
  ctx.save();
  ctx.translate(pan.x, pan.y);
  ctx.rotate(tilt);
  limb(ctx, -s * 0.36, s * 0.06, -s * 0.18, 0, '#3a3350', s * 0.05);
  ellipse(ctx, 0, 0, s * 0.24, s * 0.07, 0, '#3a3d5c', 4);
  ellipse(ctx, 0, -s * 0.012, s * 0.2, s * 0.05, 0, '#55597a', 0);
  ctx.restore();

  // pancake
  const prx = s * 0.17;
  if (g.stage === 'air') {
    const k = clamp(g.airT / g.dur, 0, 1);
    const res = judge(g.r, targets[Math.min(toss, TOSSES - 1)]);
    const peakH = res.lost ? h * 1.2 : s * (0.5 + 0.5 * Math.min(g.r, 4.6));
    const yy = pan.y - 4 - peakH * 4 * k * (1 - k) - (res.lost ? k * h : 0);
    drawPancake(ctx, pan.x, yy, prx, g.r * TAU * k);
  } else if (g.stage === 'wait' || (g.stage === 'done' && g.result && !g.result.lost)) {
    // resting pancake: at the end of a toss it lies at its landing angle
    const ang = g.stage === 'done' && g.result ? (g.r % 1) * TAU : 0;
    if (g.stage === 'done' && g.result && g.result.flop) drawPancake(ctx, pan.x, pan.y - 6, prx, Math.PI * 0.6);
    else drawPancake(ctx, pan.x, pan.y - 6, prx, Math.abs(Math.cos(ang)) > 0.2 ? ang : 0.35 * Math.PI);
    if (g.stage === 'wait') {
      // steam
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        const sx = pan.x + (i - 1) * prx * 0.6, k = (party.t * 0.8 + i * 0.33) % 1;
        ctx.globalAlpha = 0.5 * (1 - k);
        ctx.beginPath();
        ctx.moveTo(sx, pan.y - 14 - k * 40);
        ctx.quadraticCurveTo(sx + 8, pan.y - 24 - k * 40, sx, pan.y - 34 - k * 40);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // plate stack
  const px = lane.x0 + lane.w * 0.13, py = footY - 14;
  const pw = Math.min(lane.w * 0.13, s * 0.28);
  ellipse(ctx, px, py, pw * 1.1, pw * 0.25, 0, '#fff', 4);
  for (let i = 0; i < Math.min(g.stack, 8); i++) {
    ellipse(ctx, px, py - 8 - i * pw * 0.16, pw * 0.9, pw * 0.2, 0, i % 2 ? '#f2a640' : '#ffc95c', 3);
  }
  if (g.stack > 0) {
    const ty = py - 8 - (Math.min(g.stack, 8) - 1) * pw * 0.16;
    rr(ctx, px - pw * 0.25, ty - pw * 0.18, pw * 0.5, pw * 0.16, 4);
    inked(ctx, '#fff3a0', 3);
  }

  // score + result
  label(ctx, String(g.score), lane.cx, h * 0.9, Math.max(26, s * 0.2), { fill: '#fff' });
  label(ctx, `P${p.n + 1}${p.kind === 'cpu' ? ' CPU' : ''}`, lane.cx, h * 0.96, 18, { fill: p.color, drop: false });
  if (g.result && g.resultT > 0 && g.stage === 'done') {
    const bump = 1 + Math.max(0, (g.resultT > 90 ? g.resultT - 98.6 : 0)) * 0.6;
    label(ctx, g.result.text, pan.x - s * 0.1, pan.y - s * 0.75, Math.max(22, s * 0.19) * bump, { fill: g.result.color });
    if (!demo && g.result.text !== 'TOO SLOW') {
      label(ctx, `${g.result.r.toFixed(1)} flips${g.result.pts ? `  +${g.result.pts}` : ''}`, pan.x - s * 0.1, pan.y - s * 0.52, Math.max(15, s * 0.1), { fill: '#fff', drop: false });
    }
    if (g.result.perfect) sparkle(ctx, pan.x + s * 0.3, pan.y - s * 0.85, 12 + Math.sin(party.t * 10) * 4, '#ffd21f');
  }
  // keyboard power bar
  if (g.charging) {
    const bx = lane.x1 - 34, by0 = footY - s * 1.2, bh = s * 1.0;
    rr(ctx, bx - 12, by0, 24, bh, 10);
    inked(ctx, '#fff', 4);
    const k = g.charge / 4.6;
    rr(ctx, bx - 8, by0 + bh * (1 - k) + 4, 16, Math.max(4, bh * k - 8), 6);
    inked(ctx, '#ff9a1f', 0);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    for (let f = 1; f <= 4; f++) {
      const yy = by0 + bh * (1 - f / 4.6);
      ctx.beginPath();
      ctx.moveTo(bx - 18, yy);
      ctx.lineTo(bx + 18, yy);
      ctx.stroke();
      label(ctx, String(f), bx - 30, yy, 16, { drop: false, fill: f === targets[Math.min(toss, TOSSES - 1)] ? '#ffd21f' : '#fff' });
    }
  }
  void shadow;
  void gloss;
  void lerp;
}

function drawChefHat(ctx, x, y, s) {
  rr(ctx, x - s * 0.42, y - s * 0.28, s * 0.84, s * 0.3, 6);
  inked(ctx, '#fff', 4);
  ctx.beginPath();
  ctx.arc(x - s * 0.28, y - s * 0.42, s * 0.24, 0, TAU);
  ctx.moveTo(x + s * 0.52, y - s * 0.42);
  ctx.arc(x + s * 0.28, y - s * 0.42, s * 0.24, 0, TAU);
  ctx.moveTo(x + s * 0.3, y - s * 0.6);
  ctx.arc(x, y - s * 0.6, s * 0.3, 0, TAU);
  inked(ctx, '#fff', 4);
  rr(ctx, x - s * 0.4, y - s * 0.26, s * 0.8, s * 0.24, 5);
  inked(ctx, '#fff', 0);
}

startParty(game);
