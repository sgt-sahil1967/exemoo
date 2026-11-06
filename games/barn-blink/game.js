// Barn Blink: a reflex showdown in the barnyard. Every round has exactly one cue (a green lamp, the
// right animal, the right colour, a rooster's crow, a buzz in your hand) hidden behind a random wait
// and a few traps. Hit Action (or flick the phone) the instant it comes. Fastest scores most, anything
// before the cue is a false start. Original Exemoo party minigame.
import { startParty } from './party.js';
import {
  INK, TAU, clamp, rand, rr, inked, circle, ellipse, limb, gloss, shadow, label, sparkle, farmBackdrop, drawAnimal, Particles, ANIMAL_NAMES,
} from './art.js';

// ───────────── tuning ─────────────
const PTS = [5, 3, 2, 1]; // points for 1st..4th fastest valid reaction
const FALSE_PEN = 2; // points lost for a false start
const WINDOW = 1600; // ms after the cue to react before you are "too slow"
const MIN_MS = 90; // faster than this after the cue is anticipation = false start
const FLICK_RATE = 300; // deg/s of rotation that counts as a flick
const INTRO = 2.8, SCORE = 3.0; // seconds
const VISUAL_DELAY = { crow: 450, buzz: 600 }; // ms before sound/buzz cues also show on screen

const ANIMALS = ['cow', 'pig', 'sheep', 'chick'];
const COLOURS = {
  red: { c: '#ff3b30', name: 'RED', shape: 'circle' },
  yellow: { c: '#ffd21f', name: 'YELLOW', shape: 'triangle' },
  blue: { c: '#2f7cff', name: 'BLUE', shape: 'square' },
  green: { c: '#2fc65a', name: 'GREEN', shape: 'star' },
};
const LAMP = { red: '#ff3b30', yellow: '#ffd21f', green: '#2fc65a' };

const pick = (a) => a[(Math.random() * a.length) | 0];
const pickNot = (a, ...not) => pick(a.filter((x) => !not.includes(x)));
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let players = [];
let demo = true;
let P = null; // party
let lastW = 1280, lastH = 720;
let seq = [];
let R = null; // current round
let lastUpd = 0;
let musicWant = 'off';
const fx = new Particles();

function info(round) {
  const t = round.type;
  if (round.double) return { title: 'FINAL SHOWDOWN', text: 'Green means go. Double points!' };
  if (t === 'lamp') return { title: 'GREEN MEANS GO', text: 'Hit Action the moment the lamp turns green.' };
  if (t === 'fake') return { title: 'NO FAKES', text: 'Only green counts. Yellow flashes are traps!' };
  if (t === 'animal') {
    const n = ANIMAL_NAMES[round.target].toUpperCase();
    return { title: `ONLY THE ${n}`, text: `Animals pop out of the hatch. Hit it only for the ${n.toLowerCase()}.` };
  }
  if (t === 'colour') {
    const c = COLOURS[round.target];
    return { title: `ONLY ${c.name}`, text: `The sign flips colours. Hit it only on ${c.name.toLowerCase()} (the ${c.shape}).` };
  }
  if (t === 'crow') return { title: 'EARS ONLY', text: 'Wait for the rooster to crow. Clucks, moos and oinks are traps!' };
  if (t === 'flick') return { title: 'FLICK IT', text: 'Phones: flick the phone on green. Keyboard: hit your action key.' };
  if (t === 'buzz') return { title: 'FEEL IT', text: 'Hit Action the moment your phone buzzes in your hand.' };
  return { title: '', text: '' };
}

function buildSeq() {
  const humans = players.filter((p) => p.kind === 'human');
  const allPhones = humans.length > 0 && humans.every((p) => p.usingPhone);
  const mid = shuffle(['fake', 'animal', 'crow', 'colour', 'flick', allPhones ? 'buzz' : pick(['animal', 'colour'])]);
  for (let i = 1; i < mid.length; i++) {
    if (mid[i] === mid[i - 1]) {
      const j = (i + 1) % mid.length;
      [mid[i], mid[j]] = [mid[j], mid[i]];
    }
  }
  return ['lamp', ...mid, 'lamp'];
}

function newRound(i) {
  const type = seq[i];
  R = {
    i, type, phase: 'intro', t: INTRO, cueAt: 0, show: null, popT: 0, decT: 0, flash: 0, decoys: 0, heart: 0,
    double: i === seq.length - 1, target: null, order: [], winner: null, sayT: 0, say: '',
  };
  if (type === 'animal') R.target = pick(ANIMALS);
  if (type === 'colour') R.target = pick(Object.keys(COLOURS));
  R.show = type === 'animal' || type === 'colour' ? R.target : 'red';
  for (const p of players) {
    const g = p.g;
    g.r = { st: 'wait', ms: 0, pts: 0, early: false };
    g.press = 0;
    g.cpu.falseAt = 0;
  }
  if (P) P.audio.play('join');
}

function beginWait() {
  R.phase = 'wait';
  R.heart = 0.3;
  const now = performance.now();
  if (R.type === 'animal' || R.type === 'colour') {
    R.decoys = 1 + ((Math.random() * 4) | 0);
    R.decT = rand(1.0, 1.8);
    R.show = null;
  } else {
    R.t = R.double ? rand(2.4, 6.0) : rand(1.8, 5.2);
    R.show = 'red';
    R.decT = rand(0.8, 1.6);
  }
  for (const p of players) {
    const c = p.g.cpu;
    let rt = 0.2 + rand(0, 0.16) / c.skill;
    if (R.type === 'crow' || R.type === 'buzz') rt += 0.04;
    if (R.type === 'animal' || R.type === 'colour') rt += 0.07;
    if (R.type === 'flick') rt += 0.05;
    c.rt = rt;
    c.falseAt = p.kind === 'cpu' && Math.random() < 0.04 ? now + rand(500, 2600) : 0;
  }
}

function decoyTemptsCpu() {
  const now = performance.now();
  for (const p of players) {
    if (p.kind === 'cpu' && p.g.r.st === 'wait' && !p.g.cpu.falseAt && Math.random() < 0.08) p.g.cpu.falseAt = now + rand(170, 320);
  }
}

function cue() {
  R.phase = 'cue';
  R.cueAt = performance.now();
  R.popT = 0;
  for (const p of players) p.g.cpu.falseAt = 0;
  const a = P.audio;
  if (R.type === 'animal' || R.type === 'colour') {
    R.show = R.target;
    popSound(a);
  } else if (R.type === 'crow') crowSound(a);
  else if (R.type === 'buzz') {
    for (const p of players) if (p.kind === 'human') p.haptic([160]);
  } else R.show = 'green';
}

function endRound() {
  R.phase = 'score';
  R.t = SCORE;
  const mult = R.double ? 2 : 1;
  const order = R.order.slice().sort((x, y) => x.g.r.ms - y.g.r.ms);
  order.forEach((p, k) => {
    const g = p.g;
    g.r.pts = (PTS[k] || 0) * mult;
    g.score += g.r.pts;
    g.best = g.best ? Math.min(g.best, g.r.ms) : g.r.ms;
    g.sum += g.r.ms;
    g.n++;
    if (k === 0) g.firsts++;
  });
  for (const p of players) if (p.g.r.st === 'wait') p.g.r.st = 'slow';
  R.winner = order[0] || null;
  if (R.winner) {
    P.audio.play('ding');
    const l = laneOf(R.winner);
    if (l) fx.burst(l.cx, lastH * 0.62, 30, { speed: 380, up: 240 });
    if (R.winner.kind === 'human') R.winner.haptic([50, 40, 50]);
  } else P.audio.play('buzz');
}

function falseStart(p, early) {
  const g = p.g;
  g.r.st = 'out';
  g.r.early = early;
  g.score -= FALSE_PEN;
  g.falses++;
  P.audio.play('buzz');
  P.shake(0.4);
  if (p.kind === 'human') p.haptic([220]);
  const l = laneOf(p);
  if (l) fx.burst(l.cx + l.w * 0.2, lastH * 0.8, 18, { colors: ['#ff3b30', '#fff', '#1b1b3a'], speed: 300, up: 160, size: 6 });
  if (R.phase === 'wait' ? players.every((q) => q.g.r.st === 'out') : R.phase === 'cue' && players.every((q) => q.g.r.st !== 'wait')) endRound();
}

function react(p, now) {
  if (!R || demo || !P || P.state !== 'play') return;
  const g = p.g;
  if (g.r.st !== 'wait') return;
  if (R.phase === 'wait') return falseStart(p, false);
  if (R.phase !== 'cue') return;
  if (now - R.cueAt < MIN_MS) return falseStart(p, true);
  g.r.st = 'done';
  g.r.ms = Math.round(now - R.cueAt);
  g.press = 1;
  R.order.push(p);
  const pan = panOf(p);
  P.audio.tone(R.order.length === 1 ? 1046 : 784, 0.12, { type: 'square', vol: 0.14, pan });
  P.audio.noise(0.06, { freq: 900, vol: 0.2, pan });
  if (p.kind === 'human') p.haptic(30);
  if (players.every((q) => q.g.r.st !== 'wait')) endRound();
}

const game = {
  id: 'barn-blink',
  title: 'Barn Blink',
  tagline: 'Wait for it... wait for it... NOW! The fastest reflexes in the barnyard win.',
  accent: '#2fc65a',
  music: { bpm: 112, root: 60, scale: [0, 2, 4, 7, 9], prog: [0, 5, 9, 7], lead: 'marimba', seed: 23 },
  howTo: [
    { icon: 'timer', title: 'Wait for it', text: 'Each round has one cue, after a random wait. Lamp, animal, colour, crow or buzz.' },
    { icon: 'button', title: 'Hit it fast!', text: 'Press Action (or flick on flick rounds) the instant it comes. Fastest gets 5 points.' },
    { icon: 'eye', title: 'Spot the traps', text: 'Fakes, wrong animals and wrong colours tempt you. Jump early: minus 2.' },
  ],
  keysHelp: 'Keyboard: each player has one action key: W (P1), I (P2), Up arrow (P3), N (P4). 8 rounds, the last counts double.',

  start(list, opts) {
    demo = opts.demo;
    players = list;
    for (const p of list) {
      p.g = {
        score: 0, falses: 0, best: 0, sum: 0, n: 0, firsts: 0,
        r: { st: 'wait', ms: 0, pts: 0, early: false },
        press: 0, gmag: 0, blink: 0, blinkT: rand(1, 4),
        cpu: { skill: rand(0.7, 1), rt: 0.3, falseAt: 0 },
      };
    }
    seq = demo ? ['lamp'] : buildSeq();
    // placeholder round: the demo loop behind the menus, or the idle lamp during the 3-2-1 countdown
    R = { i: 0, type: 'lamp', phase: demo ? 'demo' : 'pre', t: 0, show: 'red', popT: 0, double: false, order: [] };
  },

  onGo(party) {
    P = party;
    seq = buildSeq();
    newRound(0);
    lastUpd = performance.now();
  },

  action(p, src) {
    if (R && R.type === 'flick' && src === 'phone') return; // phones must flick on flick rounds
    react(p, performance.now());
  },

  packet(p, pkt) {
    const g = p.g;
    if (!g) return;
    const gy = pkt.gyro || { alpha: 0, beta: 0, gamma: 0 };
    const mag = Math.sqrt(gy.alpha * gy.alpha + gy.beta * gy.beta + gy.gamma * gy.gamma);
    g.gmag = Math.max(mag, g.gmag * 0.8);
    if (R && R.type === 'flick' && (R.phase === 'wait' || R.phase === 'cue') && mag > FLICK_RATE) react(p, performance.now());
  },

  recenter() {},

  hudText() {
    if (!R || demo || R.phase === 'pre') return '';
    return R.double ? 'FINAL x2' : `Round ${R.i + 1} / ${seq.length}`;
  },

  update(dt, party) {
    P = party;
    fx.update(dt);
    const now = performance.now();
    for (const p of players) {
      const g = p.g;
      g.press = Math.max(0, g.press - dt * 1.2);
      g.blinkT -= dt;
      if (g.blinkT < 0) {
        g.blink = 0.15;
        g.blinkT = rand(2, 5);
      }
      g.blink = Math.max(0, g.blink - dt);
      if (!p.usingPhone) g.gmag *= Math.exp(-6 * dt);
    }

    if (demo || R.phase === 'pre') {
      if (demo) {
        R.t += dt;
        const k = R.t % 5;
        R.show = k < 3 ? 'red' : k < 3.4 ? 'yellow' : k < 3.7 ? 'red' : 'green';
      }
      musicWant = 'menu';
      party.audio.setMusic(musicWant);
      return;
    }
    if (party.state !== 'play') {
      lastUpd = now;
      return;
    }

    // a pause (update not called) during the wait or the cue would be unfair: replay the round.
    // Points are only awarded at the end of a round, so nothing to undo; false starts keep their penalty.
    if (now - lastUpd > 400 && (R.phase === 'wait' || R.phase === 'cue')) {
      newRound(R.i);
      party.toast('Round restarted');
    }
    lastUpd = now;
    R.popT += dt;
    R.sayT = Math.max(0, R.sayT - dt);

    if (R.phase === 'intro') {
      R.t -= dt;
      if (R.t <= 0) beginWait();
    } else if (R.phase === 'wait') {
      R.heart -= dt;
      if (R.heart <= 0) {
        R.heart = 0.72;
        party.audio.tone(78, 0.14, { type: 'sine', vol: 0.32, slide: -20 });
        party.audio.tone(64, 0.16, { type: 'sine', vol: 0.24, slide: -16, at: 0.16 });
      }
      if (R.type === 'animal' || R.type === 'colour') {
        R.decT -= dt;
        if (R.decT < 0.16 && R.show) R.show = null; // hatch blinks shut between pops
        if (R.decT <= 0) {
          if (R.decoys > 0) {
            R.decoys--;
            R.show = R.type === 'animal' ? pickNot(ANIMALS, R.target) : pickNot(Object.keys(COLOURS), R.target);
            R.popT = 0;
            R.decT = rand(0.8, 1.4);
            popSound(party.audio);
            decoyTemptsCpu();
          } else cue();
        }
      } else {
        R.t -= dt;
        if (R.type === 'fake') {
          R.decT -= dt;
          R.flash -= dt;
          if (R.flash <= 0 && R.show === 'yellow') R.show = 'red';
          if (R.decT <= 0 && R.t > 0.7) {
            R.show = 'yellow';
            R.flash = rand(0.25, 0.45);
            R.decT = rand(0.9, 1.7);
            party.audio.tone(520, 0.08, { type: 'triangle', vol: 0.12 });
            decoyTemptsCpu();
          }
        } else if (R.type === 'crow') {
          R.decT -= dt;
          if (R.decT <= 0 && R.t > 0.7) {
            R.decT = rand(1.0, 1.8);
            const d = pick(['cluck', 'moo', 'oink']);
            R.say = d.toUpperCase();
            R.sayT = 0.7;
            decoySound(party.audio, d);
            decoyTemptsCpu();
          }
        }
        if (R.t <= 0) cue();
      }
      for (const p of players) {
        const c = p.g.cpu;
        if (c.falseAt && now >= c.falseAt && R.phase === 'wait' && p.g.r.st === 'wait') {
          c.falseAt = 0;
          falseStart(p, false);
        }
      }
    } else if (R.phase === 'cue') {
      for (const p of players) {
        if (p.kind === 'cpu' && p.g.r.st === 'wait' && now - R.cueAt >= p.g.cpu.rt * 1000) react(p, R.cueAt + p.g.cpu.rt * 1000);
      }
      if (R.phase === 'cue' && now - R.cueAt > WINDOW) endRound();
    } else if (R.phase === 'score') {
      R.t -= dt;
      if (R.t <= 0) {
        if (R.i + 1 < seq.length) newRound(R.i + 1);
        else {
          R.phase = 'done';
          party.finish();
        }
      }
    }

    musicWant = R.phase === 'intro' || R.phase === 'score' ? 'menu' : 'off';
    party.audio.setMusic(musicWant);
  },

  onFinish() {},

  results() {
    return players.map((p) => {
      const g = p.g;
      // rank by points, then by best reaction time
      const tie = g.best ? (1000 - Math.min(999, g.best)) / 100000 : 0;
      return { p, score: g.score + tie, text: `${g.score} pts · ${g.best ? `best ${g.best} ms` : 'no hits'}` };
    });
  },

  draw(ctx, w, h, party) {
    lastW = w;
    lastH = h;
    const horizon = h * 0.44;
    const tense = R && !demo && (R.phase === 'wait' || R.phase === 'cue');
    farmBackdrop(ctx, w, h, horizon, {
      t: party.t,
      top: tense ? '#3f7fd0' : '#5ec2ff',
      bottom: tense ? '#9fcbe8' : '#bfe8ff',
    });
    drawBarn(ctx, w, horizon);

    const B = Math.min(h * 0.3, w * 0.26);
    const bx = w / 2, by = Math.max(70 + B / 2, h * 0.27);
    if (R) {
      drawBoard(ctx, bx, by, B, party);
      drawRooster(ctx, bx - B * 0.85, horizon + h * 0.04, B * 0.62, R.type === 'crow' && R.phase === 'cue' && performance.now() - R.cueAt < 900, party.t);
      drawTexts(ctx, bx, by + B / 2, w, B, party);
    }

    const lanes = party.lanes(w, players.length, 420);
    players.forEach((p, i) => drawLane(ctx, p, lanes[i], h, party));
    fx.draw(ctx);

    if (tense) {
      // vignette for tension
      const gr = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
      gr.addColorStop(0, 'rgba(27,27,58,0)');
      gr.addColorStop(1, 'rgba(27,27,58,.35)');
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

// ───────────── helpers ─────────────
function laneOf(p) {
  if (!P) return null;
  return P.lanes(lastW, players.length, 420)[players.indexOf(p)];
}
function panOf(p) {
  const l = laneOf(p);
  return l ? clamp((l.cx / lastW) * 2 - 1, -0.8, 0.8) : 0;
}

// ───────────── sounds ─────────────
function popSound(a) {
  a.tone(420, 0.09, { type: 'sine', vol: 0.28, slide: 700 });
  a.noise(0.04, { freq: 2600, vol: 0.1 });
}
function crowSound(a) {
  // "cock-a-doodle-doo" from sawtooth swoops
  const n = [
    [620, 0.12, 280, 0], [760, 0.1, 80, 0.15], [820, 0.12, 100, 0.28], [900, 0.55, -380, 0.43],
  ];
  for (const [f, d, s, at] of n) {
    a.tone(f, d, { type: 'sawtooth', vol: 0.16, slide: s, at, attack: 0.01 });
    a.tone(f * 1.5, d, { type: 'square', vol: 0.05, slide: s * 1.5, at, attack: 0.01 });
  }
}
function decoySound(a, kind) {
  if (kind === 'cluck') {
    for (const at of [0, 0.16]) {
      a.tone(520, 0.07, { type: 'square', vol: 0.13, slide: -260, at });
      a.noise(0.04, { freq: 1800, vol: 0.08, at });
    }
  } else if (kind === 'moo') {
    a.tone(170, 0.7, { type: 'sawtooth', vol: 0.12, slide: -40, attack: 0.12 });
    a.tone(172, 0.7, { type: 'triangle', vol: 0.18, slide: -40, attack: 0.12 });
  } else {
    for (const at of [0, 0.2]) {
      a.tone(300, 0.12, { type: 'square', vol: 0.1, slide: 160, at });
      a.noise(0.1, { freq: 700, q: 3, vol: 0.12, at });
    }
  }
}

// ───────────── drawing ─────────────
function drawBarn(ctx, w, horizon) {
  const bw = Math.min(w * 0.18, 230), bh = bw * 0.78;
  const x = w - bw * 0.62, y = horizon + 6;
  ctx.save();
  ctx.translate(x, y);
  rr(ctx, -bw / 2, -bh, bw, bh, 6);
  inked(ctx, '#e8402f', 5);
  ctx.beginPath();
  ctx.moveTo(-bw * 0.6, -bh + 2);
  ctx.lineTo(0, -bh - bw * 0.42);
  ctx.lineTo(bw * 0.6, -bh + 2);
  ctx.closePath();
  inked(ctx, '#b8322a', 5);
  rr(ctx, -bw * 0.2, -bh * 0.62, bw * 0.4, bh * 0.62, 4);
  inked(ctx, '#fff6e0', 4);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-bw * 0.2, -bh * 0.62);
  ctx.lineTo(bw * 0.2, 0);
  ctx.moveTo(bw * 0.2, -bh * 0.62);
  ctx.lineTo(-bw * 0.2, 0);
  ctx.stroke();
  circle(ctx, 0, -bh - bw * 0.12, bw * 0.09, '#fff6e0', 4);
  ctx.restore();
}

function drawBoard(ctx, cx, cy, B, party) {
  const t = party.t;
  // posts
  for (const sx of [-1, 1]) {
    rr(ctx, cx + sx * B * 0.32 - B * 0.04, cy, B * 0.08, B * 0.85, 4);
    inked(ctx, '#a8642a', 4);
  }
  // frame
  rr(ctx, cx - B / 2, cy - B / 2, B, B, B * 0.12);
  inked(ctx, '#d48a3a', 6);
  ctx.strokeStyle = '#a8642a';
  ctx.lineWidth = 3;
  for (const k of [-0.3, 0.3]) {
    ctx.beginPath();
    ctx.moveTo(cx - B * 0.46, cy + B * k * 1.45);
    ctx.lineTo(cx + B * 0.46, cy + B * k * 1.45);
    ctx.stroke();
  }
  const ix = cx - B * 0.4, iy = cy - B * 0.4, iw = B * 0.8;
  const dark = R.type === 'crow' || R.type === 'buzz';
  rr(ctx, ix, iy, iw, iw, B * 0.08);
  inked(ctx, dark ? '#2a2850' : R.type === 'animal' ? '#bfe8ff' : '#fff6e0', 5);
  const pop = Math.min(1, R.popT / 0.12);
  const now = performance.now();

  if (R.type === 'lamp' || R.type === 'fake' || R.type === 'flick') {
    const col = LAMP[R.show] || LAMP.red;
    ctx.save();
    ctx.shadowColor = col;
    ctx.shadowBlur = R.show === 'green' ? 60 : 24;
    circle(ctx, cx, cy, B * 0.3, col, 6);
    ctx.restore();
    circle(ctx, cx, cy, B * 0.3, null, 6);
    gloss(ctx, cx - B * 0.1, cy - B * 0.12, B * 0.08, B * 0.05, 0.7);
    if (R.type === 'flick' && R.show === 'green') {
      ctx.strokeStyle = INK;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy, B * 0.37, -2.6, -0.5);
      ctx.stroke();
      const ax = cx + Math.cos(-0.5) * B * 0.37, ay = cy + Math.sin(-0.5) * B * 0.37;
      ctx.beginPath();
      ctx.moveTo(ax - B * 0.08, ay - B * 0.02);
      ctx.lineTo(ax, ay);
      ctx.lineTo(ax - B * 0.01, ay - B * 0.09);
      ctx.stroke();
    }
    if (R.show === 'green') {
      sparkle(ctx, cx + B * 0.3, cy - B * 0.3, B * 0.07, '#fff');
      sparkle(ctx, cx - B * 0.32, cy + B * 0.26, B * 0.05, '#ffd21f');
    }
  } else if (R.type === 'animal') {
    ctx.save();
    rr(ctx, ix, iy, iw, iw, B * 0.08);
    ctx.clip();
    // hay floor
    ctx.fillStyle = '#ffd77a';
    ctx.fillRect(ix, iy + iw * 0.82, iw, iw * 0.2);
    if (R.show) {
      const s = B * 0.8 * (0.6 + 0.4 * pop);
      drawAnimal(ctx, R.show, cx, iy + iw * 0.93 + (1 - pop) * B * 0.2, s, { mood: R.phase === 'intro' || R.show === R.target ? 'cheer' : 'happy' });
    } else {
      // closed hatch doors
      for (const sx of [-1, 1]) {
        rr(ctx, sx < 0 ? ix : cx, iy, iw / 2, iw, 2);
        inked(ctx, '#c9561a', 4);
        ctx.strokeStyle = '#fff6e0';
        ctx.lineWidth = 6;
        ctx.beginPath();
        const x0 = sx < 0 ? ix + 8 : cx + 8, x1 = sx < 0 ? cx - 8 : ix + iw - 8;
        ctx.moveTo(x0, iy + 8);
        ctx.lineTo(x1, iy + iw - 8);
        ctx.moveTo(x1, iy + 8);
        ctx.lineTo(x0, iy + iw - 8);
        ctx.stroke();
      }
    }
    ctx.restore();
    rr(ctx, ix, iy, iw, iw, B * 0.08);
    inked(ctx, null, 5);
  } else if (R.type === 'colour') {
    if (R.show) {
      const c = COLOURS[R.show];
      drawShape(ctx, c.shape, cx, cy, B * 0.3 * (0.7 + 0.3 * pop), c.c);
    } else {
      label(ctx, '?', cx, cy, B * 0.4, { fill: '#e8dcc0', drop: false });
    }
  } else if (R.type === 'crow') {
    const shown = R.phase === 'cue' && now - R.cueAt > VISUAL_DELAY.crow;
    if (shown || R.phase === 'score') label(ctx, 'CROW!', cx, cy, B * 0.2, { fill: '#ffd21f' });
    else {
      drawEar(ctx, cx, cy, B * 0.26);
      if (R.sayT > 0) label(ctx, R.say, cx, cy + B * 0.3, B * 0.1, { fill: '#ff8fb1' });
    }
  } else if (R.type === 'buzz') {
    const shown = R.phase === 'cue' && now - R.cueAt > VISUAL_DELAY.buzz;
    const wob = shown ? Math.sin(t * 60) * 0.08 : 0;
    drawPhone(ctx, cx, cy, B * 0.5, wob, shown ? '#ffd21f' : '#7f86b0');
    if (shown || R.phase === 'score') label(ctx, 'BUZZ!', cx, cy + B * 0.32, B * 0.12, { fill: '#ffd21f' });
  }
}

function drawShape(ctx, shape, x, y, r, fill) {
  ctx.beginPath();
  if (shape === 'circle') ctx.arc(x, y, r, 0, TAU);
  else if (shape === 'square') {
    rr(ctx, x - r * 0.88, y - r * 0.88, r * 1.76, r * 1.76, r * 0.18);
  } else if (shape === 'triangle') {
    ctx.moveTo(x, y - r * 1.05);
    ctx.lineTo(x + r * 1.05, y + r * 0.8);
    ctx.lineTo(x - r * 1.05, y + r * 0.8);
    ctx.closePath();
  } else {
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5, rad = i % 2 ? r * 0.48 : r * 1.1;
      ctx[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rad, y + Math.sin(a) * rad);
    }
    ctx.closePath();
  }
  inked(ctx, fill, 6);
  gloss(ctx, x - r * 0.3, y - r * 0.35, r * 0.18, r * 0.1, 0.6);
}

function drawEar(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(-s * 0.5, -s * 0.1);
  ctx.bezierCurveTo(-s * 0.55, -s * 1.0, s * 0.75, -s * 1.0, s * 0.55, -s * 0.05);
  ctx.bezierCurveTo(s * 0.45, s * 0.35, s * 0.05, s * 0.4, s * 0.05, s * 0.75);
  ctx.bezierCurveTo(s * 0.05, s * 1.05, -s * 0.45, s * 1.05, -s * 0.45, s * 0.7);
  inked(ctx, '#ffd9b0', 5);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-s * 0.2, -s * 0.15);
  ctx.bezierCurveTo(-s * 0.2, -s * 0.6, s * 0.35, -s * 0.55, s * 0.25, -s * 0.1);
  ctx.bezierCurveTo(s * 0.2, s * 0.1, 0, s * 0.15, -s * 0.02, s * 0.35);
  ctx.stroke();
  ctx.strokeStyle = '#7fd3ff';
  ctx.lineWidth = 5;
  for (const k of [1, 1.4]) {
    ctx.beginPath();
    ctx.arc(s * 0.4, -s * 0.2, s * 0.55 * k, -0.6, 0.6);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPhone(ctx, x, y, s, rot, glow) {
  ctx.save();
  ctx.translate(x, y - s * 0.1);
  ctx.rotate(rot);
  rr(ctx, -s * 0.28, -s * 0.5, s * 0.56, s * 0.9, s * 0.1);
  inked(ctx, glow, 5);
  rr(ctx, -s * 0.2, -s * 0.4, s * 0.4, s * 0.6, s * 0.05);
  inked(ctx, '#bfe8ff', 4);
  circle(ctx, 0, s * 0.3, s * 0.04, INK, 0);
  ctx.restore();
  if (glow === '#ffd21f') {
    ctx.strokeStyle = '#ffd21f';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(x + sx * s * 0.4, y - s * 0.35);
      for (let i = 1; i <= 4; i++) ctx.lineTo(x + sx * s * (i % 2 ? 0.5 : 0.4), y - s * 0.35 + i * s * 0.14);
      ctx.stroke();
    }
  }
}

function drawRooster(ctx, x, y, s, crowing, t) {
  const u = s / 100;
  const lw = Math.max(2.5, 4.2 * u);
  ctx.save();
  ctx.translate(x, y);
  shadow(ctx, 0, 0, 28 * u, 6 * u);
  for (const sx of [-1, 1]) limb(ctx, sx * 8 * u, -2 * u, sx * 6 * u, -26 * u, '#ff9a1f', 5 * u);
  for (const sx of [-1, 1]) ellipse(ctx, sx * 10 * u, -2 * u, 9 * u, 3.5 * u, 0, '#ff9a1f', lw * 0.7);
  // tail
  const tails = ['#1b8a4a', '#2f7cff', '#2fc65a'];
  for (let i = 0; i < 3; i++) {
    ctx.save();
    ctx.translate(-22 * u, -52 * u);
    ctx.rotate(-1.0 + i * 0.38 + Math.sin(t * 2 + i) * 0.04);
    ellipse(ctx, 0, -22 * u, 8 * u, 24 * u, 0, tails[i], lw);
    ctx.restore();
  }
  ellipse(ctx, 0, -44 * u, 30 * u, 23 * u, 0, '#e8742a', lw);
  ellipse(ctx, 6 * u, -38 * u, 16 * u, 12 * u, 0, '#ffb15c', 0);
  ellipse(ctx, -4 * u, -46 * u, 15 * u, 10 * u, 0.3, '#c9561a', lw * 0.8);
  gloss(ctx, -10 * u, -56 * u, 8 * u, 4 * u);
  // neck + head
  const lift = crowing ? 8 * u : 0;
  const hx = 16 * u, hy = -80 * u - lift;
  limb(ctx, 8 * u, -58 * u, hx, hy, '#e8742a', 17 * u);
  // comb
  for (let i = 0; i < 3; i++) circle(ctx, hx - 8 * u + i * 7 * u, hy - 14 * u - (i === 1 ? 3 * u : 0), 6 * u, '#ff3b30', lw * 0.8);
  circle(ctx, hx, hy, 14 * u, '#e8742a', lw);
  // beak
  ctx.save();
  ctx.translate(hx + 12 * u, hy + 1 * u);
  if (crowing) ctx.rotate(-0.35);
  const open = crowing ? 0.5 + 0.5 * Math.abs(Math.sin(t * 18)) : 0;
  ctx.beginPath();
  ctx.moveTo(0, -5 * u);
  ctx.lineTo(13 * u, -1 * u - open * 4 * u);
  ctx.lineTo(0, 1 * u);
  ctx.closePath();
  inked(ctx, '#ffd21f', lw * 0.8);
  ctx.beginPath();
  ctx.moveTo(0, 1 * u);
  ctx.lineTo(11 * u, 3 * u + open * 6 * u);
  ctx.lineTo(0, 5 * u);
  ctx.closePath();
  inked(ctx, '#ffb000', lw * 0.8);
  ctx.restore();
  ellipse(ctx, hx + 9 * u, hy + 12 * u, 4 * u, 6 * u, 0, '#ff3b30', lw * 0.7);
  if (crowing) {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(hx, hy - 3 * u);
    ctx.lineTo(hx + 7 * u, hy - 3 * u);
    ctx.stroke();
  } else {
    circle(ctx, hx + 4 * u, hy - 3 * u, 3 * u, INK, 0);
    circle(ctx, hx + 5 * u, hy - 4 * u, 1 * u, '#fff', 0);
  }
  ctx.restore();
}

/** Font size that keeps `text` (Lilita One) within `maxW` px. */
function fit(ctx, text, size, maxW) {
  ctx.font = `${size}px 'Lilita One'`;
  const tw = ctx.measureText(text).width + size * 0.4;
  return tw > maxW ? size * (maxW / tw) : size;
}

function drawTexts(ctx, cx, top, w, B, party) {
  if (R.phase === 'pre') return;
  if (demo) {
    label(ctx, 'BARN BLINK', cx, top + 38, Math.min(48, w * 0.05), { fill: '#2fc65a' });
    return;
  }
  const inf = info(R);
  const big = Math.min(46, w * 0.045);
  const small = Math.min(24, w * 0.022);
  if (R.phase === 'intro') {
    const k = Math.min(1, (INTRO - R.t) / 0.25);
    const head = `Round ${R.i + 1}: ${inf.title}`;
    label(ctx, head, cx, top + 36, fit(ctx, head, big, w * 0.94) * (0.6 + 0.4 * k), { fill: R.double ? '#ffd21f' : '#fff' });
    label(ctx, inf.text, cx, top + 36 + big * 0.95, fit(ctx, inf.text, small, w * 0.94), { fill: '#fff' });
  } else if (R.phase === 'wait' || R.phase === 'cue') {
    label(ctx, inf.title, cx, top + 30, big * 0.7, { fill: R.double ? '#ffd21f' : '#fff' });
    if (R.phase === 'wait') {
      const pul = 1 + Math.sin(party.t * 8) * 0.06;
      label(ctx, 'Wait for it...', cx, top + 30 + big * 0.85, small * 1.2 * pul, { fill: '#ffd21f' });
    } else if (R.type !== 'crow' && R.type !== 'buzz') {
      label(ctx, R.type === 'flick' ? 'FLICK!' : 'NOW!', cx, top + 30 + big * 0.95, big * 1.1, { fill: '#2fc65a' });
    }
  } else if (R.phase === 'score' || R.phase === 'done') {
    if (R.winner) {
      const win = `${R.winner.label}  ${R.winner.g.r.ms} ms!`;
      label(ctx, win, cx, top + 36, fit(ctx, win, big * 0.9, w * 0.94), { fill: R.winner.color });
      label(ctx, R.double ? 'Double points!' : 'Fastest reflexes this round', cx, top + 36 + big * 0.9, small, { fill: '#fff' });
    } else label(ctx, 'Nobody made it!', cx, top + 36, big * 0.9, { fill: '#ff3b30' });
  }
}

function drawLane(ctx, p, lane, h, party) {
  const g = p.g;
  if (!g || !lane) return;
  ctx.save();
  ctx.globalAlpha = 0.14;
  ctx.fillStyle = p.color;
  ctx.fillRect(lane.x0 + 4, h * 0.56, lane.w - 8, h * 0.44);
  ctx.restore();

  const s = Math.min(lane.w * 0.42, h * 0.22);
  const footY = h * 0.95;
  const ax = lane.cx - s * 0.32;
  const bx = ax + s * 0.6;
  const live = R && !demo && R.phase !== 'pre';
  const r = g.r;
  const phase = live ? R.phase : 'demo';

  // buzzer plunger
  const press = r.st === 'done' && (phase === 'cue' || phase === 'score') ? Math.max(0.35, g.press) : g.press;
  const capH = s * 0.55;
  rr(ctx, bx - s * 0.06, footY - capH, s * 0.12, capH, 4);
  inked(ctx, '#8a8fb0', 4);
  rr(ctx, bx - s * 0.22, footY - s * 0.1, s * 0.44, s * 0.12, 6);
  inked(ctx, '#3a3d5c', 4);
  const capY = footY - capH + press * s * 0.06;
  rr(ctx, bx - s * 0.2, capY - s * 0.05, s * 0.4, s * 0.08, 4);
  inked(ctx, '#3a3d5c', 4);
  ctx.beginPath();
  ctx.ellipse(bx, capY - s * 0.05, s * 0.18, s * (0.13 - press * 0.06), 0, Math.PI, TAU);
  ctx.closePath();
  inked(ctx, p.color, 4);
  gloss(ctx, bx - s * 0.07, capY - s * 0.11 + press * s * 0.03, s * 0.04, s * 0.02, 0.7);

  // animal
  let mood = 'happy';
  if (live) {
    if (r.st === 'out') mood = 'sad';
    else if (phase === 'score' && R.winner === p) mood = 'cheer';
    else if (r.st === 'slow') mood = 'sad';
    else if (phase === 'wait') mood = 'effort';
    else if (phase === 'cue' && r.st === 'wait') mood = 'shock';
    else if (r.st === 'done') mood = 'cheer';
  }
  const hover = phase === 'wait' && r.st === 'wait' ? Math.sin(party.t * 14 + p.n) * s * 0.015 : 0;
  const handTop = { x: bx, y: capY - s * 0.13 - (press > 0.3 ? 0 : s * 0.12) + hover };
  drawAnimal(ctx, p.animal, ax, footY, s, {
    color: p.color,
    mood,
    blink: g.blink > 0 ? 1 : 0,
    hands: [null, handTop],
    lean: press * 0.08 + (r.st === 'out' ? Math.sin(party.t * 18) * 0.04 : 0),
    bob: phase === 'score' && R.winner === p ? Math.abs(Math.sin(party.t * 10)) * s * 0.08 : 0,
  });

  // bubble above head
  if (live) {
    let txt = '', col = '#fff';
    if (r.st === 'out') {
      txt = r.early ? 'TOO EARLY' : 'FALSE START';
      col = '#ff3b30';
    } else if (r.st === 'done') {
      txt = `${r.ms} ms`;
      col = R.winner === p || (phase === 'cue' && R.order[0] === p) ? '#ffd21f' : '#fff';
    } else if (r.st === 'slow') {
      txt = 'TOO SLOW';
      col = '#bfc4e0';
    }
    const ty = footY - s * 1.12;
    if (txt) {
      ctx.font = `${Math.round(s * 0.17)}px 'Lilita One'`;
      const tw = ctx.measureText(txt).width + s * 0.2;
      rr(ctx, lane.cx - tw / 2, ty - s * 0.13, tw, s * 0.26, s * 0.1);
      inked(ctx, 'rgba(27,27,58,.75)', 4);
      label(ctx, txt, lane.cx, ty, s * 0.17, { fill: col, drop: false });
      if (phase === 'score' || phase === 'done') {
        const pts = r.st === 'out' ? `-${FALSE_PEN}` : r.pts ? `+${r.pts}` : '';
        if (pts) label(ctx, pts, lane.cx + tw / 2 + s * 0.14, ty - s * 0.1, s * 0.2, { fill: r.st === 'out' ? '#ff3b30' : '#2fc65a' });
      }
    } else if (phase === 'cue' && r.st === 'wait' && p.kind === 'human' && R.type === 'flick' && p.usingPhone) {
      label(ctx, 'FLICK!', lane.cx, ty, s * 0.18, { fill: '#2fc65a' });
    }
  }

  // name plate + score
  const plateY = h * 0.6;
  label(ctx, `P${p.n + 1}`, lane.x0 + 14, plateY, 26, { fill: p.color, align: 'left' });
  if (live) label(ctx, `${g.score} pts`, lane.x0 + 62, plateY, 22, { fill: '#fff', align: 'left' });
  const how = p.kind === 'cpu' ? 'CPU' : p.usingPhone ? 'PHONE' : `KEY ${p.keyNames[2]}`;
  label(ctx, how, lane.x0 + 14, plateY + 26, 14, { fill: '#fff', align: 'left', drop: false });
  if (live && g.best && lane.w > 300) label(ctx, `best ${g.best} ms`, lane.x1 - 14, plateY, 16, { fill: '#ffd21f', align: 'right', drop: false });
}

startParty(game);
