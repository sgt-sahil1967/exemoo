// Shake & Freeze: shake your phone to whip up a milkshake, but freeze the moment the
// Gander turns around. Get caught shaking and you spill. First full glass (or the fullest at the
// bell) wins. Original Exemoo party minigame.
import { startParty } from './party.js';
import {
  INK, TAU, clamp, lerp, rand, rr, inked, circle, ellipse, limb, gloss, shadow, label, sparkle, farmBackdrop, drawAnimal, Particles,
} from './art.js';

const ROUND = 45;
const FILL_RATE = 0.062; // glass per second at full shake
const FREEZE_LIMIT = 0.32; // intensity that counts as moving while watched
const GRACE = 0.35; // seconds after the Gander turns before you can be caught
const SPILL = 0.12;
const FLAVOURS = { cow: '#ff8fb1', pig: '#a98bff', sheep: '#8fe3b0', chick: '#ffe27a' };

let players = [];
let demo = true;
let finisher = null;
const fx = new Particles();
const W = { st: 'away', t: 3, look: 0, glow: 0, turn: 0, bluff: false }; // the Gander

function newWatcher(first) {
  W.st = 'away';
  W.t = first ? rand(2.4, 3.6) : rand(1.6, 4.2);
  W.turn = 0;
}

const game = {
  id: 'shake-freeze',
  title: 'Shake & Freeze',
  tagline: 'Shake to whip your milkshake. Freeze when the Gander looks!',
  accent: '#ff5c8a',
  roundSeconds: ROUND,
  music: { bpm: 132, root: 62, scale: [0, 2, 4, 7, 9], prog: [0, 9, 5, 7], lead: 'square', seed: 11 },
  howTo: [
    { icon: 'shake', title: 'Shake!', text: 'Shake your phone hard to fill your milkshake glass.' },
    { icon: 'eye', title: 'Watch the Gander', text: 'When the lamp goes yellow, she is about to turn around.' },
    { icon: 'still', title: 'Freeze!', text: 'Red lamp: hold perfectly still or your shake spills.' },
  ],
  keysHelp: 'Keyboard: mash your left and right keys to shake, stop pressing to freeze. First full glass wins, or the fullest after 45 seconds.',

  start(list, opts) {
    demo = opts.demo;
    finisher = null;
    players = list;
    for (const p of list) {
      p.g = {
        fill: demo ? rand(0.2, 0.7) : 0,
        inten: 0, raw: 0, kb: 0,
        grav: null, lastPkt: 0,
        caught: 0, safeLook: false, spillAnim: 0,
        phase: rand(0, TAU), rattle: 0, blink: 0, blinkT: rand(1, 4),
        cpu: { skill: rand(0.62, 0.92), react: 0, wait: 0, stopped: false },
        full: false, joy: 0,
      };
    }
    newWatcher(true);
  },

  onGo() {
    newWatcher(true);
  },

  packet(p, pkt) {
    const g = p.g;
    if (!g) return;
    const a = pkt.acc || { x: 0, y: 0, z: 0 };
    // High-pass the acceleration (some phones still include gravity), then measure the shake.
    if (!g.grav) g.grav = { x: a.x, y: a.y, z: a.z };
    g.grav.x += (a.x - g.grav.x) * 0.08;
    g.grav.y += (a.y - g.grav.y) * 0.08;
    g.grav.z += (a.z - g.grav.z) * 0.08;
    const hx = a.x - g.grav.x, hy = a.y - g.grav.y, hz = a.z - g.grav.z;
    const accMag = Math.sqrt(hx * hx + hy * hy + hz * hz);
    const gy = pkt.gyro || { alpha: 0, beta: 0, gamma: 0 };
    const gyroMag = Math.sqrt(gy.alpha * gy.alpha + gy.beta * gy.beta + gy.gamma * gy.gamma);
    const raw = Math.max(clamp((accMag - 1.2) / 12, 0, 1), clamp((gyroMag - 50) / 600, 0, 1));
    // Keep the strongest recent sample so a 60 Hz stream never under-reads a hard shake.
    g.raw = Math.max(raw, g.raw * 0.85);
    g.lastPkt = performance.now();
  },

  press(p, which) {
    if (!p.g) return;
    p.g.kb = Math.min(1.25, p.g.kb + 0.26);
  },

  recenter() {},

  update(dt, party) {
    const st = party.state;
    const live = st === 'play';
    fx.update(dt);

    // ── the Gander ──
    if (st === 'play' || demo) {
      W.t -= dt;
      if (W.st === 'away' && W.t <= 0) {
        W.st = 'warn';
        const late = party.roundT > 25 ? 0.75 : 1;
        W.t = rand(0.55, 1.05) * late;
        W.bluff = !demo && party.roundT > 8 && Math.random() < 0.22;
        if (!demo) {
          party.audio.tone(330, 0.5, { type: 'triangle', vol: 0.2, slide: 220 });
          party.audio.tone(660, 0.12, { type: 'square', vol: 0.06, at: 0.02 });
          for (const p of players) if (p.kind === 'human') p.haptic(30);
        }
      } else if (W.st === 'warn' && W.t <= 0) {
        if (W.bluff) {
          W.st = 'away';
          W.t = rand(1.2, 3);
          if (!demo) party.audio.tone(500, 0.25, { type: 'triangle', vol: 0.15, slide: -200 });
        } else {
          W.st = 'look';
          W.look = 0;
          W.t = rand(1.4, 2.6);
          for (const p of players) p.g.safeLook = false;
          if (!demo) honk(party);
        }
      } else if (W.st === 'look') {
        W.look += dt;
        if (W.t <= 0) newWatcher(false);
      }
    }
    W.turn = lerp(W.turn, W.st === 'look' ? 1 : 0, 1 - Math.exp(-dt * 14));
    W.glow += dt;

    // ── players ──
    for (const p of players) {
      const g = p.g;
      g.phase += dt * (8 + g.inten * 26);
      g.blinkT -= dt;
      if (g.blinkT < 0) {
        g.blink = 0.15;
        g.blinkT = rand(2, 5);
      }
      g.blink = Math.max(0, g.blink - dt);
      g.kb *= Math.exp(-2.6 * dt);
      g.spillAnim = Math.max(0, g.spillAnim - dt);
      g.joy = Math.max(0, g.joy - dt);

      // raw shake input this frame
      let raw;
      if (demo) raw = W.st === 'look' ? 0 : 0.5 + 0.4 * Math.sin(party.t * 1.3 + p.n * 1.7);
      else if (p.kind === 'cpu') raw = cpuShake(p, dt, party);
      else if (p.usingPhone) {
        raw = g.raw;
        if (performance.now() - g.lastPkt > 120) g.raw *= Math.exp(-8 * dt);
      } else raw = Math.min(1, g.kb);
      if (!live && !demo) raw = st === 'countdown' ? raw : 0;
      const k = raw > g.inten ? 14 : 8;
      g.inten += (raw - g.inten) * (1 - Math.exp(-k * dt));
      if (demo) {
        g.fill = 0.45 + 0.3 * Math.sin(party.t * 0.4 + p.n);
        continue;
      }

      if (g.caught > 0) g.caught -= dt;
      if (!live) continue;

      // fill while not caught
      if (g.caught <= 0 && !g.full) {
        g.fill = Math.min(1, g.fill + FILL_RATE * g.inten * dt);
        g.rattle -= dt;
        if (g.inten > 0.3 && g.rattle <= 0) {
          g.rattle = 0.09 + Math.random() * 0.05;
          party.audio.noise(0.05, { freq: 3500 + Math.random() * 2500, q: 4, vol: 0.05 * g.inten, pan: panOf(p, party) });
        }
      }
      // caught?
      if (W.st === 'look' && W.look > GRACE && !g.safeLook && g.inten > FREEZE_LIMIT && g.caught <= 0 && !g.full) {
        g.safeLook = true;
        g.caught = 1.3;
        g.spillAnim = 1;
        g.fill = Math.max(0, g.fill - SPILL);
        party.audio.play('splat');
        party.audio.play('buzz');
        party.shake(0.6);
        p.haptic([220]);
        const c = cupPos(p, party);
        if (c) fx.burst(c.x, c.y - 30, 26, { colors: [FLAVOURS[p.animal], '#fff', FLAVOURS[p.animal]], shape: 'drop', speed: 380, up: 200, size: 7 });
      }
      if (g.fill >= 1 && !g.full) {
        g.full = true;
        g.joy = 3;
        if (!finisher) finisher = p;
        party.audio.play('ding');
        party.audio.play('pop');
        p.haptic([60, 40, 160]);
        const c = glassPos(p, party);
        if (c) fx.burst(c.x, c.y - c.h, 40, { speed: 420, up: 260 });
        party.toast(`${p.label} filled the glass!`, p.color);
        party.finish();
      }
    }
  },

  onFinish() {
    for (const p of players) p.g.joy = p === finisher ? 4 : 0;
  },

  results() {
    return players.map((p) => ({
      p,
      score: Math.round(p.g.fill * 1000) / 10 + (p === finisher ? 50 : 0),
      text: p.g.fill >= 1 ? 'FULL GLASS' : `${Math.round(p.g.fill * 100)}%`,
    }));
  },

  draw(ctx, w, h, party) {
    lastW = w;
    lastH = h;
    const horizon = h * 0.4;
    farmBackdrop(ctx, w, h, horizon, { t: party.t, top: W.st === 'look' && !demo ? '#ff8f7a' : '#5ec2ff', bottom: W.st === 'look' && !demo ? '#ffd2b8' : '#bfe8ff' });
    drawStand(ctx, w, horizon);
    drawGander(ctx, w * 0.5, horizon + 8, Math.min(h * 0.3, w * 0.2), party);
    drawLamp(ctx, w * 0.5 - Math.min(h * 0.3, w * 0.2) * 0.95, horizon + 8, Math.min(h * 0.22, 150));

    const lanes = party.lanes(w, players.length, 480);
    players.forEach((p, i) => drawPlayer(ctx, p, lanes[i], h, party));
    fx.draw(ctx);

    if (W.st === 'look' && !demo && party.state === 'play') {
      label(ctx, 'FREEZE!', w / 2, horizon * 0.42, Math.min(w * 0.09, 110), { fill: '#ff3b30' });
    } else if (W.st === 'warn' && !demo && party.state === 'play') {
      label(ctx, 'Uh oh...', w / 2, horizon * 0.42, Math.min(w * 0.06, 70), { fill: '#ffd21f' });
    }
  },
};

let lastW = 1280, lastH = 720;
function panOf(p, party) {
  const lanes = party.lanes(lastW, players.length, 480);
  const l = lanes[players.indexOf(p)];
  return l ? clamp((l.cx / lastW) * 2 - 1, -0.8, 0.8) : 0;
}
function laneOf(p, party) {
  return party.lanes(lastW, players.length, 480)[players.indexOf(p)];
}
function sizes(lane, h) {
  const s = Math.min(lane.w * 0.48, h * 0.3);
  return { s, footY: h * 0.94, x: lane.cx - lane.w * 0.13 };
}
function cupPos(p, party) {
  const l = laneOf(p, party);
  if (!l) return null;
  const { s, footY, x } = sizes(l, lastH);
  return { x, y: footY - s * 1.05 };
}
function glassPos(p, party) {
  const l = laneOf(p, party);
  if (!l) return null;
  const { s, footY } = sizes(l, lastH);
  const gw = Math.min(l.w * 0.22, s * 0.5);
  return { x: l.cx + l.w * 0.28, y: footY - 6, h: s * 1.0, w: gw };
}

function cpuShake(p, dt, party) {
  const c = p.g.cpu;
  const want = c.skill * (0.85 + 0.15 * Math.sin(party.t * 3 + p.n));
  if (W.st === 'away') {
    if (c.stopped) {
      c.wait -= dt;
      if (c.wait <= 0) c.stopped = false;
      return 0;
    }
    c.react = rand(0.25, 0.8);
    return want;
  }
  if (W.st === 'warn' || W.st === 'look') {
    if (!c.stopped) {
      c.react -= dt;
      if (c.react <= 0) {
        c.stopped = true;
        c.wait = rand(0.15, 0.5);
      }
      return want;
    }
    return 0;
  }
  return 0;
}

function honk(party) {
  const a = party.audio;
  a.tone(420, 0.16, { type: 'sawtooth', vol: 0.2, slide: -80 });
  a.tone(425, 0.16, { type: 'square', vol: 0.1, slide: -80 });
  a.tone(400, 0.22, { type: 'sawtooth', vol: 0.2, slide: -120, at: 0.2 });
  a.tone(405, 0.22, { type: 'square', vol: 0.1, slide: -120, at: 0.2 });
}

// ───────────── drawing ─────────────
function drawStand(ctx, w, horizon) {
  // dairy stand awning behind the Gander
  const sw = Math.min(w * 0.46, 620), sx = w / 2 - sw / 2, top = horizon - Math.min(horizon * 0.62, 220);
  rr(ctx, sx + 14, top + 40, sw - 28, horizon - top - 40, 10);
  inked(ctx, '#fff6e0', 5);
  for (let i = 0; i < 8; i++) {
    const x0 = sx + (i * sw) / 8;
    ctx.beginPath();
    ctx.moveTo(x0, top);
    ctx.lineTo(x0 + sw / 8, top);
    ctx.lineTo(x0 + sw / 8, top + 38);
    ctx.arc(x0 + sw / 16, top + 38, sw / 16, 0, Math.PI);
    ctx.closePath();
    inked(ctx, i % 2 ? '#fff' : '#ff5c8a', 4);
  }
  label(ctx, 'MILK BAR', w / 2, top + 22, Math.min(30, sw * 0.07), { fill: '#ffd21f' });
}

function drawLamp(ctx, x, y, hgt) {
  const col = W.st === 'look' ? '#ff3b30' : W.st === 'warn' ? (Math.floor(W.glow * 8) % 2 ? '#ffd21f' : '#fff3a8') : '#2fc65a';
  limb(ctx, x, y, x, y - hgt * 0.55, '#8a8fb0', hgt * 0.06);
  rr(ctx, x - hgt * 0.17, y - hgt, hgt * 0.34, hgt * 0.5, hgt * 0.1);
  inked(ctx, '#3a3d5c', 5);
  ctx.save();
  ctx.shadowColor = col;
  ctx.shadowBlur = 30;
  circle(ctx, x, y - hgt * 0.75, hgt * 0.12, col, 4);
  ctx.restore();
  gloss(ctx, x - hgt * 0.04, y - hgt * 0.79, hgt * 0.04, hgt * 0.025, 0.7);
}

function drawGander(ctx, x, y, s, party) {
  const u = s / 100;
  const turn = W.turn; // 0 = back to us, 1 = facing us
  const wob = W.st === 'warn' ? Math.sin(party.t * 30) * 0.08 : 0;
  ctx.save();
  ctx.translate(x, y);
  shadow(ctx, 0, 0, 40 * u, 8 * u);
  // crate
  rr(ctx, -40 * u, -22 * u, 80 * u, 22 * u, 4 * u);
  inked(ctx, '#d48a3a', 4);
  ctx.strokeStyle = '#a8642a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-36 * u, -11 * u);
  ctx.lineTo(36 * u, -11 * u);
  ctx.stroke();
  ctx.translate(0, -22 * u);
  // feet
  for (const sx of [-1, 1]) ellipse(ctx, sx * 12 * u, -2 * u, 10 * u, 4 * u, 0, '#ff9a1f', 3);
  // body
  ellipse(ctx, 0, -32 * u, 34 * u, 30 * u, 0, '#fff', 5);
  // wings (raised when looking)
  for (const sx of [-1, 1]) {
    ctx.save();
    ctx.translate(sx * 26 * u, -36 * u);
    ctx.rotate(sx * (0.3 + turn * 0.7));
    ellipse(ctx, sx * 8 * u, 0, 16 * u, 10 * u, 0, '#eef0ff', 4);
    ctx.restore();
  }
  gloss(ctx, -12 * u, -46 * u, 10 * u, 6 * u);
  // neck + head
  ctx.save();
  ctx.translate(0, -58 * u);
  ctx.rotate(wob);
  limb(ctx, 0, 0, 0, -32 * u, '#fff', 14 * u);
  const hx = 0, hy = -42 * u;
  circle(ctx, hx, hy, 17 * u, '#fff', 5);
  if (turn > 0.5) {
    // face
    const ang = W.st === 'look';
    for (const sx of [-1, 1]) {
      ellipse(ctx, hx + sx * 7 * u, hy - 3 * u, 4.5 * u, 6 * u, 0, '#fff', 3);
      circle(ctx, hx + sx * 7 * u, hy - 2 * u, 2.6 * u, ang ? '#ff3b30' : INK, 0);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(hx + sx * 13 * u, hy - 13 * u);
      ctx.lineTo(hx + sx * 2 * u, hy - 8 * u);
      ctx.stroke();
    }
    // open beak
    ctx.beginPath();
    ctx.moveTo(hx - 8 * u, hy + 5 * u);
    ctx.lineTo(hx + 8 * u, hy + 5 * u);
    ctx.lineTo(hx, hy + 18 * u);
    ctx.closePath();
    inked(ctx, '#ff9a1f', 3);
    ctx.beginPath();
    ctx.moveTo(hx - 7 * u, hy + 9 * u);
    ctx.lineTo(hx + 7 * u, hy + 9 * u);
    ctx.stroke();
  } else {
    // back of the head, beak peeking out to the side
    ctx.beginPath();
    ctx.moveTo(hx + 14 * u, hy + 2 * u);
    ctx.lineTo(hx + 26 * u, hy + 5 * u);
    ctx.lineTo(hx + 14 * u, hy + 8 * u);
    ctx.closePath();
    inked(ctx, '#ff9a1f', 3);
    // music notes while humming
    if (W.st === 'away') {
      const k = (party.t * 0.8) % 1;
      ctx.save();
      ctx.globalAlpha = 1 - k;
      noteGlyph(ctx, hx + 30 * u + k * 20 * u, hy - 10 * u - k * 40 * u, 7 * u);
      ctx.restore();
    }
  }
  // sun hat
  ellipse(ctx, hx, hy - 12 * u, 26 * u, 6 * u, 0, '#ffd21f', 4);
  ctx.beginPath();
  ctx.ellipse(hx, hy - 16 * u, 14 * u, 11 * u, 0, Math.PI, TAU);
  inked(ctx, '#ffd21f', 4);
  rr(ctx, hx - 14 * u, hy - 19 * u, 28 * u, 5 * u, 2 * u);
  inked(ctx, '#ff3b30', 3);
  ctx.restore();
  if (W.st === 'warn') label(ctx, '?', 34 * u, -128 * u, 30 * u, { fill: '#ffd21f' });
  ctx.restore();
}

function noteGlyph(ctx, x, y, r) {
  ellipse(ctx, x, y, r, r * 0.75, -0.4, INK, 0);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + r * 0.9, y);
  ctx.lineTo(x + r * 0.9, y - r * 3);
  ctx.lineTo(x + r * 2, y - r * 2.4);
  ctx.stroke();
}

function drawPlayer(ctx, p, lane, h, party) {
  const g = p.g;
  if (!g || !lane) return;
  const { s, footY, x } = sizes(lane, h);
  // lane tint
  ctx.save();
  ctx.globalAlpha = 0.14;
  ctx.fillStyle = p.color;
  ctx.fillRect(lane.x0 + 4, h * 0.46, lane.w - 8, h * 0.54);
  ctx.restore();

  const caught = g.caught > 0;
  const jig = Math.sin(g.phase) * g.inten;
  const cupX = x + jig * s * 0.06, cupY = footY - s * 1.05 + Math.cos(g.phase * 1.03) * g.inten * s * 0.16;
  const mood = caught ? 'sad' : g.full || g.joy > 0 ? 'cheer' : W.st === 'look' && !demo ? 'shock' : g.inten > 0.45 ? 'effort' : 'happy';
  drawAnimal(ctx, p.animal, x, footY, s, {
    color: p.color,
    mood,
    blink: g.blink > 0 ? 1 : 0,
    hands: [{ x: cupX - s * 0.13, y: cupY + s * 0.05 }, { x: cupX + s * 0.13, y: cupY + s * 0.05 }],
    bob: Math.abs(jig) * s * 0.04 + (g.joy > 0 ? Math.abs(Math.sin(party.t * 10)) * s * 0.08 : 0),
    lean: caught ? Math.sin(party.t * 20) * 0.05 : jig * 0.05,
  });
  // shaker cup
  ctx.save();
  ctx.translate(cupX, cupY);
  ctx.rotate(jig * 0.25);
  const cw = s * 0.2, ch = s * 0.36;
  ctx.beginPath();
  ctx.moveTo(-cw * 0.5, -ch * 0.5);
  ctx.lineTo(cw * 0.5, -ch * 0.5);
  ctx.lineTo(cw * 0.38, ch * 0.5);
  ctx.lineTo(-cw * 0.38, ch * 0.5);
  ctx.closePath();
  inked(ctx, '#d9f1ff', 4);
  rr(ctx, -cw * 0.56, -ch * 0.66, cw * 1.12, ch * 0.2, 5);
  inked(ctx, p.color, 4);
  ellipse(ctx, 0, -ch * 0.72, cw * 0.18, ch * 0.06, 0, '#fff', 3);
  gloss(ctx, -cw * 0.2, 0, cw * 0.08, ch * 0.3, 0.6);
  ctx.restore();
  if (g.inten > 0.35 && !caught) {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(cupX + sx * s * 0.22, cupY - s * 0.1);
      ctx.lineTo(cupX + sx * s * 0.3, cupY - s * 0.14);
      ctx.moveTo(cupX + sx * s * 0.22, cupY + s * 0.02);
      ctx.lineTo(cupX + sx * s * 0.32, cupY + s * 0.02);
      ctx.stroke();
    }
  }
  if (caught && g.spillAnim > 0) {
    label(ctx, 'SPILL!', cupX, cupY - s * 0.45, s * 0.2, { fill: '#ff3b30' });
  }

  // milkshake glass meter
  const gw = Math.min(lane.w * 0.22, s * 0.5), gh = s * 1.0;
  const gx = lane.cx + lane.w * 0.28, gy = footY - 6;
  drawGlass(ctx, gx, gy, gw, gh, g.fill, FLAVOURS[p.animal], party.t, g.full);
  label(ctx, `${Math.round(g.fill * 100)}%`, gx, gy + 2 - gh - (g.full ? gw * 0.9 : gw * 0.25) - 18, Math.max(18, s * 0.17), { fill: g.full ? '#ffd21f' : '#fff' });
  // name tag
  label(ctx, `P${p.n + 1}`, lane.x0 + 34, h * 0.5, 26, { fill: p.color });
  if (p.kind === 'cpu') label(ctx, 'CPU', lane.x0 + 34, h * 0.5 + 28, 16, { fill: '#fff', drop: false });
}

function drawGlass(ctx, x, y, w, h, fill, col, t, full) {
  // glass body (tapered)
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(x - w * 0.5, y - h);
    ctx.lineTo(x + w * 0.5, y - h);
    ctx.lineTo(x + w * 0.36, y);
    ctx.lineTo(x - w * 0.36, y);
    ctx.closePath();
  };
  path();
  inked(ctx, 'rgba(220,240,255,.75)', 0);
  // liquid
  ctx.save();
  path();
  ctx.clip();
  const ly = y - h * fill;
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(x - w, y + 2);
  for (let i = 0; i <= 12; i++) ctx.lineTo(x - w + (i / 12) * w * 2, ly + Math.sin(t * 5 + i) * 3);
  ctx.lineTo(x + w, y + 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.35)';
  for (let i = 0; i < 5; i++) {
    const by = y - ((t * 30 + i * 37) % Math.max(1, h * fill));
    ctx.beginPath();
    ctx.arc(x - w * 0.2 + (i % 3) * w * 0.18, by, 3, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
  path();
  inked(ctx, null, 5);
  gloss(ctx, x - w * 0.28, y - h * 0.6, w * 0.06, h * 0.28, 0.7);
  // tick marks
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  for (let i = 1; i < 4; i++) {
    const yy = y - (h * i) / 4;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.3, yy);
    ctx.lineTo(x + w * 0.45, yy);
    ctx.stroke();
  }
  // straw
  limb(ctx, x + w * 0.1, y - h * 0.4, x + w * 0.35, y - h - w * 0.5, '#ff3b30', 5);
  if (full) {
    // whipped cream + cherry
    for (let i = 0; i < 3; i++) circle(ctx, x - w * 0.25 + i * w * 0.25, y - h - w * 0.08, w * 0.22, '#fff', 4);
    circle(ctx, x, y - h - w * 0.28, w * 0.24, '#fff', 4);
    circle(ctx, x, y - h - w * 0.58, w * 0.13, '#ff3b30', 4);
    gloss(ctx, x - w * 0.04, y - h - w * 0.62, w * 0.04, w * 0.03, 0.8);
    sparkle(ctx, x + w * 0.6, y - h - w * 0.4 + Math.sin(t * 6) * 4, 10, '#ffd21f');
  }
}

startParty(game);
