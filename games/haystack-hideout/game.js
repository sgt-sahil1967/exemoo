// Haystack Hideout: farm critters dash out, stand by their hiding spots for a moment, then dive in.
// The spots shuffle (and later the lights go out), the farmer calls out who to find, and every
// player points a coloured flashlight cursor with their phone and picks a spot. First correct pick
// scores most, wrong picks lock you out for a moment. Seven hunts, each harder than the last.
// Original Exemoo party minigame.
import { startParty } from './party.js';
import {
  INK, TAU, clamp, lerp, ease, rand, rr, inked, circle, ellipse, gloss, shadow, label, sparkle, farmBackdrop, drawAnimal, Particles,
} from './art.js';

const HUNTS = 7;
// Difficulty per hunt: spots, hidden animals, swaps, seconds per swap, show time, lights out,
// decoy chance (others share the target's kind or scarf), cover types in play (fewer = look-alikes).
const LEVELS = [
  { spots: 4, animals: 3, swaps: 0, swapDur: 0.8, show: 3.2, dark: false, decoy: 0.2, types: 4, seek: 10 },
  { spots: 5, animals: 3, swaps: 1, swapDur: 0.8, show: 3.0, dark: false, decoy: 0.35, types: 5, seek: 10 },
  { spots: 6, animals: 4, swaps: 2, swapDur: 0.72, show: 2.9, dark: false, decoy: 0.45, types: 6, seek: 10 },
  { spots: 6, animals: 5, swaps: 3, swapDur: 0.66, show: 2.8, dark: true, decoy: 0.55, types: 4, seek: 10 },
  { spots: 7, animals: 5, swaps: 4, swapDur: 0.6, show: 2.7, dark: false, decoy: 0.65, types: 3, seek: 10 },
  { spots: 8, animals: 6, swaps: 5, swapDur: 0.54, show: 2.6, dark: true, decoy: 0.75, types: 3, seek: 11 },
  { spots: 9, animals: 7, swaps: 6, swapDur: 0.48, show: 2.6, dark: true, decoy: 0.85, types: 2, seek: 11 },
];
const KINDS = ['cow', 'pig', 'sheep', 'chick'];
const KIND_NAMES = { cow: 'Calf', pig: 'Piglet', sheep: 'Lamb', chick: 'Chick' };
const SCARVES = [
  { name: 'Pink', c: '#ff6fb5' },
  { name: 'Purple', c: '#9b5cff' },
  { name: 'Orange', c: '#ff8a1f' },
  { name: 'Teal', c: '#19c3c3' },
];
const COVERS = ['hay', 'barrel', 'bush', 'crate', 'hutch', 'pumpkin'];
const LOCKOUT = 1.8;
// Testing aid: ?hunt=5 starts a match at hunt 5.
const START_HUNT = clamp((parseInt(new URLSearchParams(location.search).get('hunt'), 10) || 1) - 1, 0, HUNTS - 1);
const SENS_X = 70; // degrees of phone sweep across the whole screen width
const SENS_Y = 45; // degrees of phone tilt across the whole screen height

let players = [];
let demo = true;
let party = null;
const fx = new Particles();
const floats = [];
let VW = innerWidth, VH = innerHeight; // last drawn viewport (for pointer and layout maths)
let darkCanvas = null;

/** Current hunt. */
const H = {
  idx: 0, lv: LEVELS[0], phase: 'idle', t: 0,
  spots: [], target: -1, swapsLeft: 0, swapGap: 0,
  dark: false, darkAmt: 0, seekT: 0, deadline: 0, finders: [], caption: '', capT: 0,
};

const pick = (a) => a[(Math.random() * a.length) | 0];
const shuffled = (a) => {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};
const sameAnimal = (a, b) => a && b && a.kind === b.kind && a.scarf === b.scarf;
const nameOf = (a) => `${SCARVES[a.scarf].name}-scarf ${KIND_NAMES[a.kind]}`;

// ───────────── layout ─────────────
function rowsFor(n) {
  if (n <= 4) return [n];
  return [Math.floor(n / 2), Math.ceil(n / 2)];
}
/** Screen places for n spots: bottom-centre x/y and size s (px). Back rows first. */
function places(n, w, h) {
  const rows = rowsFor(n);
  const maxCnt = Math.max(...rows);
  const out = [];
  const gap = (w * 0.84) / maxCnt;
  rows.forEach((cnt, r) => {
    const k = rows.length === 1 ? 1 : r / (rows.length - 1);
    const y = rows.length === 1 ? h * 0.76 : lerp(h * 0.6, h * 0.85, k);
    const depth = rows.length === 1 ? 1 : lerp(0.8, 1, k);
    const s = Math.min(gap * 0.7, h * 0.21) * depth;
    for (let i = 0; i < cnt; i++) out.push({ x: w / 2 + (i - (cnt - 1) / 2) * gap * lerp(0.92, 1, k), y, s });
  });
  return out;
}
function spotPos(sp, P) {
  const a = P[sp.place];
  if (sp.moveT < sp.moveDur && sp.to != null) {
    const b = P[sp.to];
    const k = ease(clamp(sp.moveT / sp.moveDur, 0, 1));
    const arc = Math.sin(Math.PI * k) * sp.arc;
    const s = lerp(a.s, b.s, k);
    return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) - arc * s * 0.55, s, ground: lerp(a.y, b.y, k), lift: arc };
  }
  return { x: a.x, y: a.y, s: a.s, ground: a.y, lift: 0 };
}

// ───────────── hunts ─────────────
function newHunt(idx) {
  H.idx = idx;
  H.lv = LEVELS[Math.min(idx, LEVELS.length - 1)];
  const lv = H.lv;
  H.phase = 'idle';
  H.t = 0;
  H.finders = [];
  H.dark = lv.dark && !demo;
  H.swapsLeft = demo ? 2 : lv.swaps;
  H.swapGap = 0;
  H.seekT = 0;
  H.deadline = lv.seek;
  const types = shuffled(COVERS).slice(0, lv.types);
  const target = { kind: pick(KINDS), scarf: (Math.random() * SCARVES.length) | 0 };
  const animals = [target];
  while (animals.length < lv.animals) {
    let a;
    do {
      if (Math.random() < lv.decoy) {
        a = Math.random() < 0.5 ? { kind: target.kind, scarf: (Math.random() * 4) | 0 } : { kind: pick(KINDS), scarf: target.scarf };
      } else a = { kind: pick(KINDS), scarf: (Math.random() * 4) | 0 };
    } while (sameAnimal(a, target));
    animals.push(a);
  }
  const holders = shuffled([...Array(lv.spots).keys()]);
  H.spots = [];
  for (let i = 0; i < lv.spots; i++) {
    H.spots.push({
      id: i, place: i, to: null, moveT: 0, moveDur: 0, arc: 0,
      cover: types[i % types.length],
      animal: null, out: 0, pop: 0, peek: 0, wob: 0, enterDelay: 0, enterK: 0, fromLeft: true,
      blink: 0, blinkT: rand(1, 4), mood: 'happy',
    });
  }
  // keep the cover mix shuffled across places
  const covers = shuffled(H.spots.map((s) => s.cover));
  H.spots.forEach((s, i) => (s.cover = covers[i]));
  animals.forEach((a, i) => {
    const sp = H.spots[holders[i]];
    sp.animal = a;
    sp.out = 1;
    sp.enterDelay = i * 0.12;
  });
  H.target = holders[0];
  for (const p of players) {
    const g = p.g;
    if (!g) continue;
    g.foundThis = false;
    g.lock = 0;
    g.order = -1;
    g.cpu.tries = 0;
    g.cpu.aim = null;
    g.cpu.ruled = new Set();
  }
}

function setPhase(ph) {
  H.phase = ph;
  H.t = 0;
  const a = party?.audio;
  if (ph === 'enter') {
    const P = places(H.spots.length, VW, VH);
    for (const sp of H.spots) sp.fromLeft = P[sp.place].x < VW / 2;
    caption('Here they come!');
    if (!demo) a?.play('whoosh');
  } else if (ph === 'show') caption('Watch where they hide!');
  else if (ph === 'hide') caption('Into the hideouts!');
  else if (ph === 'shuffle') caption(H.swapsLeft > 3 ? 'Shuffle shuffle shuffle!' : 'Keep your eyes on them!');
  else if (ph === 'call') {
    caption('');
    if (H.dark && !demo) {
      party.banner('LIGHTS OUT!', '#ffd21f', 1300);
      a?.tone(520, 0.4, { type: 'triangle', vol: 0.15, slide: -380 });
      a?.noise(0.25, { freq: 900, q: 1, vol: 0.12 });
    }
  } else if (ph === 'seek') {
    caption('');
    H.seekT = 0;
    H.deadline = H.lv.seek;
    const tgt = H.spots[H.target].animal;
    if (!demo) {
      voice(tgt.kind, 0.05);
      party.banner('FIND IT!', '#ffd21f', 900);
      for (const p of players) {
        if (p.kind === 'human') p.haptic(40);
        if (p.cpu) planCpu(p, true);
      }
    }
  } else if (ph === 'reveal') {
    caption('');
    for (const sp of H.spots) sp.wob = 0.4;
    if (!demo) {
      const tgt = H.spots[H.target];
      voice(tgt.animal.kind, 0.15);
      if (!H.finders.length) party.toast('Nobody found it this time!', '#fff');
    }
  }
}

function caption(t) {
  H.caption = t;
  H.capT = 0;
}

// ───────────── audio bits ─────────────
function voice(kind, at = 0) {
  const a = party?.audio;
  if (!a) return;
  if (kind === 'cow') {
    a.tone(190, 0.55, { type: 'sawtooth', vol: 0.11, slide: -70, at, attack: 0.06 });
    a.tone(95, 0.55, { type: 'square', vol: 0.05, slide: -30, at, attack: 0.06 });
  } else if (kind === 'pig') {
    a.tone(440, 0.11, { type: 'square', vol: 0.09, slide: -220, at });
    a.tone(400, 0.12, { type: 'square', vol: 0.09, slide: -200, at: at + 0.15 });
  } else if (kind === 'sheep') {
    for (let i = 0; i < 6; i++) a.tone(i % 2 ? 560 : 520, 0.07, { type: 'sawtooth', vol: 0.07, at: at + i * 0.06 });
  } else {
    a.tone(1700, 0.09, { type: 'sine', vol: 0.15, slide: 700, at });
    a.tone(1800, 0.09, { type: 'sine', vol: 0.15, slide: 700, at: at + 0.14 });
  }
}
function thump(pan = 0) {
  const a = party?.audio;
  if (!a || demo) return;
  a.tone(130, 0.16, { type: 'sine', vol: 0.3, slide: -70, pan });
  a.noise(0.12, { freq: 500, q: 0.7, vol: 0.18, type: 'lowpass', pan });
}

// ───────────── picking ─────────────
function hovered(p, P) {
  const g = p.g;
  const x = g.sx * VW, y = g.sy * VH;
  let best = null, bd = Infinity;
  for (const sp of H.spots) {
    const q = spotPos(sp, P);
    const dx = x - q.x, dy = y - (q.y - q.s * 0.45);
    const d = Math.hypot(dx, dy);
    if (d < q.s * 0.62 && d < bd) {
      bd = d;
      best = sp;
    }
  }
  return best;
}

function tryPick(p) {
  const g = p.g;
  if (!g || demo || H.phase !== 'seek' || g.foundThis || g.lock > 0) return;
  const P = places(H.spots.length, VW, VH);
  const sp = hovered(p, P);
  if (!sp) {
    party.audio.play('click');
    return;
  }
  const q = spotPos(sp, P);
  const pan = clamp((q.x / VW) * 2 - 1, -1, 1);
  if (sp.id === H.target) {
    const order = H.finders.length;
    const fast = order === 0 && H.seekT < 3;
    const pts = Math.max(1, 3 - order) + (fast ? 1 : 0);
    g.score += pts;
    g.found++;
    g.foundThis = true;
    g.order = order;
    H.finders.push(p);
    floats.push({ x: q.x, y: q.y - q.s * 1.1, text: `+${pts}${fast ? ' FAST!' : ''}`, color: p.color, t: 0 });
    party.audio.play('ding');
    party.audio.tone(order === 0 ? 1320 : 990, 0.18, { type: 'square', vol: 0.08, at: 0.08, pan });
    if (p.kind === 'human') p.haptic(order === 0 ? [60, 30, 120] : 80);
    if (order === 0) {
      party.toast(`${p.label} found it first!`, p.color);
      H.deadline = Math.min(H.deadline, H.seekT + 4);
    }
    fx.burst(q.x, q.y - q.s * 0.5, 16, { colors: [p.color, '#fff', '#ffd21f'], speed: 260, size: 6 });
  } else {
    g.lock = LOCKOUT;
    g.wrong++;
    sp.peek = 1;
    sp.wob = 0.5;
    party.audio.play('buzz');
    if (p.kind === 'human') p.haptic([40, 30, 40]);
    party.shake(0.35);
    floats.push({ x: q.x, y: q.y - q.s * 1.1, text: sp.animal ? 'Wrong critter!' : 'Empty!', color: '#fff', t: 0, bad: true });
    fx.burst(q.x, q.y - q.s * 0.3, 10, { colors: ['#e8d9b0', '#fff'], shape: 'puff', speed: 140, size: 10, gravity: -60, life: 0.8 });
    for (const o of players) if (o.cpu) o.g.cpu.ruled.add(sp.id);
  }
}

// ───────────── CPU rivals ─────────────
function planCpu(p, first) {
  const c = p.g.cpu;
  const memory = clamp(c.skill - H.idx * 0.045 + c.tries * 0.25, 0.2, 0.96);
  c.wait = (first ? rand(1.7, 3.4) : rand(0.4, 1.1)) * (1.3 - c.skill * 0.5);
  if (Math.random() < memory) c.aim = H.target;
  else {
    const others = H.spots.filter((s) => s.id !== H.target && !c.ruled.has(s.id));
    const decoys = others.filter((s) => s.animal);
    c.aim = (decoys.length && Math.random() < 0.7 ? pick(decoys) : others.length ? pick(others) : H.spots[H.target]).id;
  }
}
function updateCpu(p, dt, P) {
  const g = p.g, c = g.cpu;
  if (H.phase !== 'seek' || g.foundThis) {
    // idle drift
    c.idle += dt;
    g.x = clamp(g.x + Math.sin(c.idle * 0.9 + p.n) * dt * 0.03, 0.05, 0.95);
    g.y = clamp(g.y + Math.cos(c.idle * 0.7 + p.n * 2) * dt * 0.03, 0.4, 0.92);
    return;
  }
  if (g.lock > 0) return;
  if (c.aim == null) planCpu(p, false);
  c.wait -= dt;
  if (c.wait > 0) return;
  const q = spotPos(H.spots[c.aim], P);
  const tx = q.x / VW, ty = (q.y - q.s * 0.45) / VH;
  const k = 1 - Math.exp(-dt * (3 + c.skill * 3));
  g.x += (tx - g.x) * k + Math.sin(c.idle * 7) * dt * 0.01;
  g.y += (ty - g.y) * k;
  c.idle += dt;
  if (Math.hypot((tx - g.sx) * VW, (ty - g.sy) * VH) < q.s * 0.2) {
    tryPick(p);
    if (!g.foundThis) {
      c.tries++;
      c.aim = null;
    }
  }
}

// ───────────── game ─────────────
const game = {
  id: 'haystack-hideout',
  title: 'Haystack Hideout',
  tagline: 'Watch the critters hide, follow the shuffle, then point and pick first!',
  accent: '#ffb000',
  music: { bpm: 112, root: 60, scale: [0, 2, 3, 7, 9], prog: [0, 5, 3, 7], lead: 'marimba', seed: 23 },
  howTo: [
    { icon: 'hide', title: 'Watch them hide', text: 'Critters dive into haystacks, barrels and bushes. Then the spots shuffle!' },
    { icon: 'point', title: 'Point your phone', text: 'Sweep your phone to move your coloured flashlight. Recenter if it drifts.' },
    { icon: 'button', title: 'Pick it first', text: 'Press Action on the right spot. First find scores most, wrong picks lock you out.' },
  ],
  keysHelp:
    'Keyboard: P1 W A S D + E, P2 I J K L + O, P3 arrows + /, P4 T F G H + Y. P1 can also use the mouse. Seven hunts, most points wins.',

  start(list, opts) {
    const wasDemo = demo;
    demo = opts.demo;
    players = list;
    for (const p of list) {
      p.g = {
        x: 0.5, y: 0.62, sx: 0.5, sy: 0.62, vx: 0, vy: 0, lastT: 0, mouse: false,
        score: 0, found: 0, wrong: 0, foundThis: false, order: -1, lock: 0, hover: null,
        cpu: { skill: rand(0.5, 0.8), wait: 0, aim: null, tries: 0, idle: rand(0, 9), ruled: new Set() },
      };
      // spread cursors out a little so they don't stack
      p.g.x = p.g.sx = 0.3 + p.n * 0.13;
    }
    if (!demo || !wasDemo || !H.spots.length) {
      floats.length = 0;
      newHunt(demo ? 0 : START_HUNT);
      if (demo) setPhase('enter');
    }
  },

  onGo(pt) {
    setPhase('enter');
  },

  packet(p, pkt) {
    const g = p.g;
    if (!g) return;
    const dt = g.lastT ? Math.min(0.1, (((pkt.t - g.lastT) >>> 0) || 16) / 1000) : 0;
    g.lastT = pkt.t;
    const gy = pkt.gyro || { alpha: 0, beta: 0, gamma: 0 };
    // Same axes as the Exemoo menu pointer: beta sweeps left/right, alpha up/down.
    const bx = Math.abs(gy.beta) > 2.5 ? gy.beta : 0;
    const ay = Math.abs(gy.alpha) > 2.5 ? gy.alpha : 0;
    g.x = clamp(g.x - (bx * dt) / SENS_X, 0.02, 0.98);
    g.y = clamp(g.y - (ay * dt) / SENS_Y, 0.08, 0.97);
    g.mouse = false;
  },

  action(p) {
    tryPick(p);
  },

  press() {},

  recenter(p) {
    if (!p.g) return;
    p.g.x = 0.5;
    p.g.y = 0.62;
  },

  update(dt, pt) {
    const st = pt.state;
    VW = innerWidth;
    VH = innerHeight;
    fx.update(dt);
    for (const f of floats) f.t += dt;
    while (floats.length && floats[0].t > 1.4) floats.shift();
    const P = places(H.spots.length, VW, VH);
    const running = demo || st === 'play' || st === 'over';
    H.capT += dt;

    // ── hunt phases ──
    if (running) {
      H.t += dt;
      const lv = H.lv;
      if (H.phase === 'enter') {
        let all = true;
        for (const sp of H.spots) {
          if (!sp.animal) continue;
          sp.enterK = clamp((H.t - sp.enterDelay) / 0.9, 0, 1);
          if (sp.enterK < 1) all = false;
        }
        if (all) setPhase('show');
      } else if (H.phase === 'show') {
        if (H.t > (demo ? 2.4 : lv.show)) setPhase('hide');
      } else if (H.phase === 'hide') {
        let i = 0, all = true;
        for (const sp of H.spots) {
          if (!sp.animal) continue;
          const k = clamp((H.t - i * 0.11) / 0.32, 0, 1);
          if (sp.out > 0 && k >= 1) {
            sp.wob = 0.45;
            const q = spotPos(sp, P);
            thump(clamp((q.x / VW) * 2 - 1, -1, 1));
            fx.burst(q.x, q.y - q.s * 0.2, 8, { colors: ['#f3e7c4', '#fff'], shape: 'puff', speed: 120, size: 9, gravity: -40, life: 0.6 });
          }
          sp.out = 1 - k;
          if (k < 1) all = false;
          i++;
        }
        if (all && H.t > 0.4) setPhase(H.swapsLeft > 0 ? 'shuffle' : demo ? 'reveal' : 'call');
      } else if (H.phase === 'shuffle') {
        const moving = H.spots.some((s) => s.to != null);
        if (!moving) {
          H.swapGap -= dt;
          if (H.swapGap <= 0) {
            if (H.swapsLeft <= 0) setPhase(demo ? 'reveal' : 'call');
            else {
              H.swapsLeft--;
              const [a, b] = shuffled(H.spots).slice(0, 2);
              const dur = demo ? 0.8 : lv.swapDur;
              for (const [s, o, arc] of [[a, b, 1], [b, a, 0.3]]) {
                s.to = o.place;
                s.moveT = 0;
                s.moveDur = dur;
                s.arc = arc;
              }
              if (!demo) {
                party.audio.play('whoosh');
                party.audio.tone(300, dur * 0.8, { type: 'triangle', vol: 0.08, slide: 300 });
              }
            }
          }
        }
        for (const s of H.spots) {
          if (s.to == null) continue;
          s.moveT += dt;
          if (s.moveT >= s.moveDur) {
            s.place = s.to;
            s.to = null;
            s.moveT = s.moveDur = 0;
            s.wob = 0.3;
            H.swapGap = demo ? 0.3 : 0.12;
          }
        }
      } else if (H.phase === 'call') {
        if (H.t > (H.dark ? 1.4 : 0.6)) setPhase('seek');
      } else if (H.phase === 'seek') {
        H.seekT += dt;
        const allFound = players.length && players.every((p) => p.g.foundThis);
        if (allFound || H.seekT >= H.deadline) {
          if (!allFound) party.audio.tone(330, 0.3, { type: 'square', vol: 0.08, slide: -120 });
          setPhase('reveal');
        }
      } else if (H.phase === 'reveal') {
        const tgt = H.spots[H.target];
        tgt.pop = Math.min(1, tgt.pop + dt * 4);
        for (const sp of H.spots) if (sp.animal && sp !== tgt) sp.pop = Math.min(0.75, sp.pop + dt * 3 * clamp(H.t - 0.4, 0, 1));
        if (H.t > (demo ? 2.4 : 2.8)) {
          if (demo) {
            newHunt((H.idx + 1) % 4);
            setPhase('enter');
          } else if (H.idx + 1 >= HUNTS) {
            if (st === 'play') pt.finish();
          } else {
            newHunt(H.idx + 1);
            setPhase('enter');
          }
        }
      }
    }
    const wantDark = H.dark && (H.phase === 'call' || H.phase === 'seek') ? 1 : 0;
    H.darkAmt = lerp(H.darkAmt, wantDark, 1 - Math.exp(-dt * (wantDark ? 4 : 6)));

    // ── spots ──
    for (const sp of H.spots) {
      sp.wob = Math.max(0, sp.wob - dt);
      sp.peek = Math.max(0, sp.peek - dt * 0.9);
      if (H.phase !== 'reveal') sp.pop = Math.max(0, sp.pop - dt * 5);
      sp.blinkT -= dt;
      if (sp.blinkT < 0) {
        sp.blink = 0.14;
        sp.blinkT = rand(1.5, 4);
      }
      sp.blink = Math.max(0, sp.blink - dt);
    }

    // ── cursors ──
    for (const p of players) {
      const g = p.g;
      if (!g) continue;
      g.lock = Math.max(0, g.lock - dt);
      if (!demo && p.cpu) updateCpu(p, dt, P);
      else if (!demo && p.kind === 'human' && !p.usingPhone && !g.mouse) {
        const dx = (p.held('right') ? 1 : 0) - (p.held('left') ? 1 : 0);
        const dy = (p.held('down') ? 1 : 0) - (p.held('up') ? 1 : 0);
        const k = 1 - Math.exp(-dt * 12);
        g.vx = lerp(g.vx, dx * 0.62, k);
        g.vy = lerp(g.vy, dy * 0.62 * (VW / VH), k);
        g.x = clamp(g.x + g.vx * dt, 0.02, 0.98);
        g.y = clamp(g.y + g.vy * dt, 0.08, 0.97);
      }
      const k = 1 - Math.exp(-dt * (p.cpu ? 30 : 20));
      g.sx += (g.x - g.sx) * k;
      g.sy += (g.y - g.sy) * k;
      const hv = H.phase === 'seek' && !g.foundThis ? hovered(p, P) : null;
      const id = hv ? hv.id : null;
      if (id !== g.hover && id != null && p.kind === 'human' && p.usingPhone) p.haptic(8);
      g.hover = id;
    }
  },

  draw(ctx, w, h, pt) {
    VW = w;
    VH = h;
    const t = pt.t;
    const horizon = h * 0.36;
    farmBackdrop(ctx, w, h, horizon, { t });
    drawYard(ctx, w, h, horizon, t);

    const P = places(H.spots.length, w, h);
    const order = H.spots.slice().sort((a, b) => spotPos(a, P).ground - spotPos(b, P).ground);
    // hover rings on the ground (under everything)
    for (const sp of H.spots) {
      const q = spotPos(sp, P);
      const hov = players.filter((p) => p.g && p.g.hover === sp.id);
      hov.forEach((p, i) => {
        ctx.save();
        ctx.lineWidth = 7;
        ctx.strokeStyle = p.color;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.ellipse(q.x, q.ground, q.s * (0.62 + i * 0.09), q.s * (0.17 + i * 0.03), 0, 0, TAU);
        ctx.stroke();
        ctx.restore();
      });
    }
    for (const sp of order) drawSpot(ctx, sp, P, t, w);
    // animals standing out front / running in
    for (const sp of order) drawOutAnimal(ctx, sp, P, t, w);

    fx.draw(ctx);
    drawDark(ctx, w, h);
    if (!demo) for (const p of players) drawCursor(ctx, p, w, h, t);
    for (const f of floats) {
      const k = f.t / 1.4;
      ctx.save();
      ctx.globalAlpha = clamp(1.6 - k * 1.6, 0, 1);
      label(ctx, f.text, f.x, f.y - k * 50, Math.max(22, w * 0.022), { fill: f.bad ? '#ff6b5e' : f.color });
      ctx.restore();
    }
    if (!demo) {
      drawCallCard(ctx, w, h, t);
      drawChips(ctx, w, h, t);
    }
    if (H.caption && pt.state !== 'paused' && !(demo && pt.state !== 'title' && pt.state !== 'lobby')) {
      const a = clamp(H.capT * 4, 0, 1);
      ctx.save();
      ctx.globalAlpha = a;
      label(ctx, H.caption, w / 2, demo ? h * 0.25 : h * 0.2, Math.max(28, Math.min(54, w * 0.04)), { fill: '#ffd21f' });
      ctx.restore();
    }
  },

  hudText() {
    return `Hunt ${Math.min(HUNTS, H.idx + 1)} / ${HUNTS}`;
  },

  results() {
    return players.map((p) => ({
      p,
      score: p.g.score,
      text: `${p.g.score} pts · ${p.g.found} found`,
    }));
  },
};

// ───────────── drawing ─────────────
function drawYard(ctx, w, h, horizon, t) {
  // big red barn at the back left
  const bw = Math.min(w * 0.17, h * 0.32), bx = w * 0.1, by = horizon + 6;
  ctx.save();
  shadow(ctx, bx, by, bw * 0.6, bw * 0.08);
  rr(ctx, bx - bw / 2, by - bw * 0.62, bw, bw * 0.62, 4);
  inked(ctx, '#e8352b', 4);
  ctx.beginPath();
  ctx.moveTo(bx - bw * 0.58, by - bw * 0.6);
  ctx.lineTo(bx, by - bw * 1.0);
  ctx.lineTo(bx + bw * 0.58, by - bw * 0.6);
  ctx.closePath();
  inked(ctx, '#b8241c', 4);
  ctx.beginPath();
  ctx.moveTo(bx - bw * 0.44, by - bw * 0.62);
  ctx.lineTo(bx, by - bw * 0.9);
  ctx.lineTo(bx + bw * 0.44, by - bw * 0.62);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 5;
  ctx.stroke();
  circle(ctx, bx, by - bw * 0.74, bw * 0.07, '#ffd21f', 3);
  rr(ctx, bx - bw * 0.22, by - bw * 0.4, bw * 0.44, bw * 0.4, 3);
  inked(ctx, '#fff', 4);
  ctx.strokeStyle = '#e8352b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(bx - bw * 0.2, by - bw * 0.38);
  ctx.lineTo(bx + bw * 0.2, by - 2);
  ctx.moveTo(bx + bw * 0.2, by - bw * 0.38);
  ctx.lineTo(bx - bw * 0.2, by - 2);
  ctx.moveTo(bx, by - bw * 0.4);
  ctx.lineTo(bx, by);
  ctx.stroke();
  gloss(ctx, bx - bw * 0.3, by - bw * 0.5, bw * 0.08, bw * 0.04, 0.35);
  ctx.restore();
  // fence along the right
  const fy = horizon + 4;
  ctx.save();
  for (let x = w * 0.3; x < w + 20; x += 46) {
    rr(ctx, x - 5, fy - 34, 10, 36, 3);
    inked(ctx, '#fff', 3);
  }
  rr(ctx, w * 0.3 - 10, fy - 28, w, 7, 3);
  inked(ctx, '#fff', 3);
  rr(ctx, w * 0.3 - 10, fy - 16, w, 7, 3);
  inked(ctx, '#fff', 3);
  ctx.restore();
  // round trees
  for (const [tx, ts] of [[0.86, 1], [0.95, 0.8], [0.27, 0.75]]) {
    const x = w * tx, s = Math.min(w, h * 1.8) * 0.05 * ts;
    shadow(ctx, x, horizon + 4, s * 0.8, s * 0.18);
    rr(ctx, x - s * 0.14, horizon - s * 1.1, s * 0.28, s * 1.14, 3);
    inked(ctx, '#a8642a', 3);
    circle(ctx, x, horizon - s * 1.5, s * 0.9, '#2fb04a', 4);
    circle(ctx, x - s * 0.3, horizon - s * 1.75, s * 0.4, '#5fd36a', 0);
  }
}

function coverShape(ctx, kind, s, t) {
  // drawn with origin at bottom centre
  const lw = Math.max(3, s * 0.035);
  if (kind === 'hay') {
    ctx.beginPath();
    ctx.moveTo(-s * 0.55, 0);
    ctx.bezierCurveTo(-s * 0.58, -s * 0.7, -s * 0.3, -s * 0.92, 0, -s * 0.92);
    ctx.bezierCurveTo(s * 0.3, -s * 0.92, s * 0.58, -s * 0.7, s * 0.55, 0);
    ctx.closePath();
    inked(ctx, '#f7c843', lw);
    ctx.strokeStyle = '#d29a12';
    ctx.lineWidth = lw * 0.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (const [x, y, dx, dy] of [[-0.3, -0.2, 0.1, -0.12], [0.1, -0.3, 0.12, 0.06], [-0.12, -0.55, 0.08, -0.1], [0.25, -0.62, -0.1, -0.08], [-0.36, -0.48, 0.06, 0.1], [0.32, -0.25, 0.04, -0.14]]) {
      ctx.moveTo(x * s, y * s);
      ctx.lineTo((x + dx) * s, (y + dy) * s);
    }
    ctx.stroke();
    rr(ctx, -s * 0.56, -s * 0.36, s * 1.12, s * 0.1, s * 0.04);
    inked(ctx, '#d48a3a', lw * 0.8);
    gloss(ctx, -s * 0.22, -s * 0.7, s * 0.14, s * 0.07, 0.5);
  } else if (kind === 'barrel') {
    ctx.beginPath();
    ctx.moveTo(-s * 0.36, 0);
    ctx.quadraticCurveTo(-s * 0.48, -s * 0.44, -s * 0.36, -s * 0.86);
    ctx.lineTo(s * 0.36, -s * 0.86);
    ctx.quadraticCurveTo(s * 0.48, -s * 0.44, s * 0.36, 0);
    ctx.closePath();
    inked(ctx, '#b8743a', lw);
    ctx.strokeStyle = '#8a5226';
    ctx.lineWidth = lw * 0.7;
    ctx.beginPath();
    for (const x of [-0.18, 0, 0.18]) {
      ctx.moveTo(x * s, -s * 0.84);
      ctx.quadraticCurveTo(x * s * 1.25, -s * 0.43, x * s, -s * 0.02);
    }
    ctx.stroke();
    for (const y of [-0.2, -0.66]) {
      rr(ctx, -s * 0.45, y * s - s * 0.045, s * 0.9, s * 0.09, s * 0.03);
      inked(ctx, '#6c6f8c', lw * 0.7);
    }
    ellipse(ctx, 0, -s * 0.86, s * 0.36, s * 0.07, 0, '#d48a4a', lw * 0.8);
    gloss(ctx, -s * 0.2, -s * 0.5, s * 0.06, s * 0.16, 0.35);
  } else if (kind === 'bush') {
    ctx.beginPath();
    for (const [x, y, r] of [[-0.34, -0.26, 0.26], [0.34, -0.26, 0.26], [-0.18, -0.58, 0.28], [0.18, -0.6, 0.3], [0, -0.32, 0.34], [0, -0.78, 0.18]]) {
      ctx.moveTo(x * s + r * s, y * s);
      ctx.arc(x * s, y * s, r * s, 0, TAU);
    }
    inked(ctx, '#2fb04a', lw);
    ctx.fillStyle = '#2fb04a';
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.42, s * 0.5, s * 0.3, 0, 0, TAU);
    ctx.fill();
    for (const [x, y] of [[-0.24, -0.62], [0.2, -0.7], [0.32, -0.3], [-0.38, -0.3]]) circle(ctx, x * s, y * s, s * 0.11, '#5fd36a', 0);
    for (const [x, y] of [[-0.1, -0.4], [0.24, -0.46], [-0.3, -0.18], [0.06, -0.66]]) circle(ctx, x * s, y * s, s * 0.04, '#ff3b30', lw * 0.5);
  } else if (kind === 'crate') {
    const cw = s * 0.82, ch = s * 0.78;
    rr(ctx, -cw / 2, -ch, cw, ch, s * 0.04);
    inked(ctx, '#e0a85e', lw);
    ctx.strokeStyle = '#b07a36';
    ctx.lineWidth = lw * 0.7;
    ctx.beginPath();
    for (const y of [0.33, 0.66]) {
      ctx.moveTo(-cw / 2, -ch * y);
      ctx.lineTo(cw / 2, -ch * y);
    }
    ctx.stroke();
    ctx.strokeStyle = INK;
    ctx.lineWidth = lw * 0.9;
    rr(ctx, -cw / 2 + lw * 2, -ch + lw * 2, cw - lw * 4, ch - lw * 4, s * 0.02);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-cw / 2 + lw * 2, -ch + lw * 2);
    ctx.lineTo(cw / 2 - lw * 2, -lw * 2);
    ctx.stroke();
    gloss(ctx, -cw * 0.28, -ch * 0.8, s * 0.08, s * 0.04, 0.5);
  } else if (kind === 'hutch') {
    const cw = s * 0.86, ch = s * 0.56;
    rr(ctx, -cw / 2, -ch, cw, ch, s * 0.03);
    inked(ctx, '#ff5a4a', lw);
    ctx.beginPath();
    ctx.moveTo(-cw * 0.6, -ch);
    ctx.lineTo(0, -s * 0.96);
    ctx.lineTo(cw * 0.6, -ch);
    ctx.closePath();
    inked(ctx, '#b8241c', lw);
    // two little barn doors
    for (const sx of [-1, 1]) {
      const dx = sx < 0 ? -cw * 0.36 : 0;
      rr(ctx, dx + lw * 0.5, -ch * 0.82, cw * 0.36 - lw, ch * 0.82, s * 0.02);
      inked(ctx, '#fff', lw * 0.8);
      ctx.strokeStyle = '#ff5a4a';
      ctx.lineWidth = lw * 0.8;
      ctx.beginPath();
      ctx.moveTo(dx + lw * 2, -ch * 0.78);
      ctx.lineTo(dx + cw * 0.36 - lw * 2, -lw * 2);
      ctx.moveTo(dx + cw * 0.36 - lw * 2, -ch * 0.78);
      ctx.lineTo(dx + lw * 2, -lw * 2);
      ctx.stroke();
    }
    gloss(ctx, -cw * 0.25, -s * 0.72, s * 0.08, s * 0.03, 0.45);
  } else if (kind === 'pumpkin') {
    for (const [x, rx, c] of [[-0.26, 0.26, '#ff8a1f'], [0.26, 0.26, '#ff8a1f'], [0, 0.3, '#ff9d3a']]) {
      ellipse(ctx, x * s, -s * 0.38, rx * s, s * 0.38, 0, c, lw);
    }
    rr(ctx, -s * 0.05, -s * 0.9, s * 0.1, s * 0.18, s * 0.03);
    inked(ctx, '#3f8f2a', lw * 0.8);
    ctx.beginPath();
    ctx.moveTo(s * 0.04, -s * 0.8);
    ctx.quadraticCurveTo(s * 0.22, -s * 0.92, s * 0.26, -s * 0.8);
    ctx.quadraticCurveTo(s * 0.16, -s * 0.78, s * 0.04, -s * 0.76);
    inked(ctx, '#2fc65a', lw * 0.7);
    gloss(ctx, -s * 0.1, -s * 0.6, s * 0.06, s * 0.12, 0.4);
  }
}

function drawSpot(ctx, sp, P, t, w) {
  const q = spotPos(sp, P);
  // ground shadow stays on the ground while a spot hops over another
  shadow(ctx, q.x, q.ground, q.s * 0.56 * (1 - q.lift * 0.3), q.s * 0.12);
  // critter peeking up from behind (reveal / wrong-pick peek)
  const pop = Math.max(sp.pop, sp.peek > 0 ? ease(Math.min(1, sp.peek * 2.2)) * 0.8 : 0);
  if (sp.animal && pop > 0.01) {
    const isT = sp.id === H.target && H.phase === 'reveal';
    if (isT) {
      ctx.save();
      const gr = ctx.createRadialGradient(q.x, q.y - q.s * 0.9, 0, q.x, q.y - q.s * 0.9, q.s * 1.1);
      gr.addColorStop(0, 'rgba(255,240,140,.85)');
      gr.addColorStop(1, 'rgba(255,240,140,0)');
      ctx.fillStyle = gr;
      ctx.fillRect(q.x - q.s * 1.2, q.y - q.s * 2.1, q.s * 2.4, q.s * 2.4);
      ctx.restore();
    }
    drawAnimal(ctx, sp.animal.kind, q.x, q.y - q.s * 0.58 * pop, q.s * 0.78, {
      color: SCARVES[sp.animal.scarf].c,
      mood: isT ? 'cheer' : H.phase === 'reveal' ? 'happy' : 'shock',
      blink: sp.blink > 0 ? 1 : 0,
      bob: isT ? Math.abs(Math.sin(t * 8)) * q.s * 0.06 : 0,
    });
  }
  // cover
  const wob = sp.wob > 0 ? Math.sin(sp.wob * 40) * sp.wob * 0.35 : 0;
  ctx.save();
  ctx.translate(q.x, q.y);
  ctx.scale(1 + wob * 0.6, 1 - wob);
  ctx.rotate(q.lift * 0.08 * Math.sin(t * 20));
  coverShape(ctx, sp.cover, q.s, t);
  ctx.restore();
  if (sp.peek > 0 && !sp.animal) {
    ctx.save();
    ctx.globalAlpha = clamp(sp.peek * 2, 0, 1);
    label(ctx, '?', q.x, q.y - q.s * 1.05 - (1 - sp.peek) * 20, q.s * 0.35, { fill: '#fff' });
    ctx.restore();
  }
  if (H.phase === 'reveal' && sp.id === H.target) {
    for (let i = 0; i < 3; i++) {
      const a = t * 2 + i * 2.1;
      sparkle(ctx, q.x + Math.cos(a) * q.s * 0.7, q.y - q.s * 0.9 + Math.sin(a) * q.s * 0.4, q.s * 0.09, '#ffd21f');
    }
  }
}

function drawOutAnimal(ctx, sp, P, t, w) {
  if (!sp.animal || sp.out <= 0.01) return;
  const q = spotPos(sp, P);
  const s = q.s * 0.8;
  let x = q.x, y = q.y + q.s * 0.12, bob = 0, lean = 0, alpha = 1, scale = 1;
  if (H.phase === 'enter' || (H.phase === 'idle' && !demo)) {
    const k = H.phase === 'idle' ? 0 : sp.enterK;
    if (k <= 0) return;
    const sx = sp.fromLeft ? -w * 0.08 : w * 1.08;
    x = lerp(sx, q.x, ease(k));
    bob = k < 1 ? Math.abs(Math.sin(k * 14)) * s * 0.12 : 0;
    lean = k < 1 ? (sp.fromLeft ? 0.15 : -0.15) : 0;
  } else if (H.phase === 'hide') {
    // dive: hop up and shrink into the cover
    const k = 1 - sp.out;
    y = lerp(y, q.y - q.s * 0.5, k) - Math.sin(Math.PI * k) * q.s * 0.45;
    scale = lerp(1, 0.45, k);
    alpha = clamp(sp.out * 1.6, 0, 1);
    lean = k * 0.6;
  } else {
    bob = Math.abs(Math.sin(t * 5 + sp.id)) * s * 0.05;
  }
  ctx.save();
  ctx.globalAlpha = alpha;
  drawAnimal(ctx, sp.animal.kind, x, y, s * scale, {
    color: SCARVES[sp.animal.scarf].c,
    mood: H.phase === 'hide' ? 'effort' : 'happy',
    blink: sp.blink > 0 ? 1 : 0,
    bob,
    lean,
    hands: H.phase === 'show' && sp.id % 2 === 0 ? [null, { x: x + s * 0.4, y: y - s * 0.75 - Math.sin(t * 9 + sp.id) * s * 0.08 }] : undefined,
  });
  ctx.restore();
}

function drawDark(ctx, w, h) {
  if (H.darkAmt < 0.01) return;
  if (!darkCanvas) darkCanvas = document.createElement('canvas');
  const cw = Math.ceil(w / 2), ch = Math.ceil(h / 2);
  if (darkCanvas.width !== cw || darkCanvas.height !== ch) {
    darkCanvas.width = cw;
    darkCanvas.height = ch;
  }
  const d = darkCanvas.getContext('2d');
  d.globalCompositeOperation = 'source-over';
  d.clearRect(0, 0, cw, ch);
  d.fillStyle = `rgba(8,10,34,${0.93 * H.darkAmt})`;
  d.fillRect(0, 0, cw, ch);
  d.globalCompositeOperation = 'destination-out';
  const r = Math.min(cw, ch) * 0.2;
  for (const p of players) {
    const g = p.g;
    if (!g || g.foundThis) continue;
    const x = g.sx * cw, y = g.sy * ch;
    const gr = d.createRadialGradient(x, y, r * 0.35, x, y, r);
    gr.addColorStop(0, 'rgba(0,0,0,1)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    d.fillStyle = gr;
    d.beginPath();
    d.arc(x, y, r, 0, TAU);
    d.fill();
  }
  ctx.drawImage(darkCanvas, 0, 0, w, h);
  // warm tint inside each beam
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const p of players) {
    const g = p.g;
    if (!g || g.foundThis) continue;
    const x = g.sx * w, y = g.sy * h, R = r * 2;
    const gr = ctx.createRadialGradient(x, y, 0, x, y, R);
    gr.addColorStop(0, `rgba(255,230,150,${0.12 * H.darkAmt})`);
    gr.addColorStop(1, 'rgba(255,230,150,0)');
    ctx.fillStyle = gr;
    ctx.fillRect(x - R, y - R, R * 2, R * 2);
  }
  ctx.restore();
}

function drawCursor(ctx, p, w, h, t) {
  const g = p.g;
  if (!g) return;
  const x = g.sx * w, y = g.sy * h;
  const r = Math.max(18, Math.min(w, h) * 0.028);
  ctx.save();
  if (g.foundThis) {
    // hidden after a find so the cursor doesn't give the spot away (the score chip says Found)
    ctx.restore();
    return;
  }
  const locked = g.lock > 0;
  const seeking = H.phase === 'seek';
  ctx.globalAlpha = seeking ? 1 : 0.6;
  // ring
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.lineWidth = 11;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.lineWidth = 6;
  ctx.strokeStyle = locked ? '#9a9ab0' : p.color;
  ctx.stroke();
  if (locked) {
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#ff3b30';
    ctx.beginPath();
    ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + TAU * (g.lock / LOCKOUT));
    ctx.stroke();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x - r * 0.35, y - r * 0.35);
    ctx.lineTo(x + r * 0.35, y + r * 0.35);
    ctx.moveTo(x + r * 0.35, y - r * 0.35);
    ctx.lineTo(x - r * 0.35, y + r * 0.35);
    ctx.stroke();
  } else {
    circle(ctx, x, y, r * 0.22, p.color, 3);
  }
  // tag
  const tx = x + r * 0.8, ty = y - r * 1.1;
  rr(ctx, tx - 4, ty - 13, 38, 26, 9);
  inked(ctx, p.color, 3);
  label(ctx, `P${p.n + 1}`, tx + 15, ty + 1, 16, { drop: false, fill: p.color === '#ffd21f' ? INK : '#fff', stroke: p.color === '#ffd21f' ? '#fff' : INK });
  ctx.restore();
}

function drawCallCard(ctx, w, h, t) {
  if (!['call', 'seek', 'reveal'].includes(H.phase)) return;
  const tgt = H.spots[H.target]?.animal;
  if (!tgt) return;
  const k = ease(clamp(H.phase === 'call' ? H.t * 3 : 1, 0, 1));
  const cw = Math.min(620, w * 0.92), ch = Math.min(118, h * 0.16);
  const x0 = w / 2 - cw / 2, y0 = Math.max(70, h * 0.09) - (1 - k) * 200;
  ctx.save();
  rr(ctx, x0, y0 + 6, cw, ch, 22);
  ctx.fillStyle = INK;
  ctx.fill();
  rr(ctx, x0, y0, cw, ch, 22);
  inked(ctx, '#fff', 5);
  // portrait badge
  const bx = x0 + ch * 0.62, by = y0 + ch / 2;
  ctx.save();
  ctx.beginPath();
  ctx.arc(bx, by, ch * 0.42, 0, TAU);
  ctx.fillStyle = '#bfe8ff';
  ctx.fill();
  ctx.clip();
  drawAnimal(ctx, tgt.kind, bx, by + ch * 0.62, ch * 0.92, { color: SCARVES[tgt.scarf].c, mood: 'happy', blink: (t % 3) < 0.12 ? 1 : 0 });
  ctx.restore();
  circle(ctx, bx, by, ch * 0.42, null, 4);
  const tx = x0 + ch * 1.2 + (cw - ch * 1.2) / 2;
  label(ctx, H.phase === 'reveal' ? (H.finders.length ? 'FOUND!' : 'HERE IT WAS!') : 'FIND THE', tx, y0 + ch * 0.3, ch * 0.22, { drop: false, fill: '#ffd21f' });
  label(ctx, nameOf(tgt), tx, y0 + ch * 0.64, Math.min(ch * 0.32, (cw - ch * 1.3) / (nameOf(tgt).length * 0.55)), { fill: SCARVES[tgt.scarf].c });
  // time bar
  if (H.phase === 'seek') {
    const left = clamp(1 - H.seekT / H.deadline, 0, 1);
    const bx0 = x0 + ch * 1.2, bw = cw - ch * 1.2 - 22;
    rr(ctx, bx0, y0 + ch - 16, bw, 9, 5);
    inked(ctx, '#e6e8f2', 2.5);
    if (left > 0.01) {
      rr(ctx, bx0, y0 + ch - 16, bw * left, 9, 5);
      inked(ctx, left < 0.3 ? '#ff3b30' : '#2fc65a', 2.5);
    }
  }
  ctx.restore();
}

function drawChips(ctx, w, h, t) {
  const n = players.length;
  if (!n) return;
  const cw = Math.min(230, (w - 40) / n - 10), ch = 46;
  const x0 = w / 2 - (n * (cw + 10) - 10) / 2, y = h - ch - 12;
  players.forEach((p, i) => {
    const g = p.g;
    const x = x0 + i * (cw + 10);
    rr(ctx, x, y + 5, cw, ch, 14);
    ctx.fillStyle = INK;
    ctx.fill();
    rr(ctx, x, y, cw, ch, 14);
    inked(ctx, '#fff', 4);
    ctx.save();
    rr(ctx, x, y, cw, ch, 14);
    ctx.clip();
    ctx.fillStyle = p.color;
    ctx.fillRect(x, y, 44, ch);
    ctx.restore();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + 44, y);
    ctx.lineTo(x + 44, y + ch);
    ctx.stroke();
    label(ctx, `P${p.n + 1}`, x + 22, y + ch / 2, 18, { drop: false, fill: p.color === '#ffd21f' ? INK : '#fff', stroke: p.color === '#ffd21f' ? '#fff' : INK });
    ctx.save();
    ctx.font = `800 ${cw < 170 ? 14 : 16}px 'Baloo 2', system-ui, sans-serif`;
    ctx.fillStyle = INK;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    const status = g.foundThis ? (g.order === 0 ? 'FIRST!' : 'Found!') : g.lock > 0 ? 'Locked' : p.cpu ? 'CPU' : p.usingPhone ? 'Phone' : 'Keys';
    ctx.fillText(status, x + 52, y + ch / 2);
    ctx.restore();
    label(ctx, String(g.score), x + cw - 24, y + ch / 2, 26, { drop: false, fill: g.foundThis ? '#2fc65a' : '#fff' });
  });
}

party = startParty(game);

// Mouse fallback for player 1: point with the mouse, click to pick.
const canvas = document.getElementById('scene');
canvas.addEventListener('pointermove', (e) => {
  const p = party.all[0];
  if (!p.g || p.kind !== 'human' || p.usingPhone) return;
  p.g.x = clamp(e.clientX / innerWidth, 0.02, 0.98);
  p.g.y = clamp(e.clientY / innerHeight, 0.08, 0.97);
  p.g.mouse = true;
});
canvas.addEventListener('pointerdown', (e) => {
  const p = party.all[0];
  if (!p.g || p.kind !== 'human' || (party.state !== 'play')) return;
  p.g.x = p.g.sx = clamp(e.clientX / innerWidth, 0.02, 0.98);
  p.g.y = p.g.sy = clamp(e.clientY / innerHeight, 0.08, 0.97);
  p.g.mouse = true;
  tryPick(p);
});
addEventListener('keydown', (e) => {
  // keys take over from the mouse again
  const p = party.all[0];
  if (p.g && Object.values(p.keys).includes(e.code)) p.g.mouse = false;
});
