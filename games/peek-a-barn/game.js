// Peek-a-Barn: a fast party memory game. Behind every little barn door hides a farm picture; take turns
// opening two doors with the phone d-pad (or the keyboard) and match pairs before your turn clock runs out.
// Pairs in a row build a streak bonus, one secret pair is golden (double points), everyone gets a quick
// peek at the start, and every few misses a Barn Breeze swaps some doors around. Original Exemoo game.
import { startParty } from './party.js';
import { INK, TAU, clamp, lerp, ease, rand, rr, inked, circle, ellipse, limb, gloss, label, sparkle, farmBackdrop, drawAnimal, Particles } from './art.js';

// ───────────── tuning ─────────────
const TURN_TIME = 7; // seconds to make a pick (resets after every pair)
const SECOND_PICK_MIN = 4; // after the first door, at least this long for the second
const PEEK_TIME = 2.6; // all doors open at the start
const SHOW_MISS = 1.0; // how long a wrong pair stays open
const SHOW_MATCH = 0.5;
const PAIR_POINTS = 100;
const STREAK_BONUS = 50; // per extra pair in the same turn
const BREEZE_EVERY = 4; // misses between Barn Breezes
const BREEZE_TIME = 1.5;
const CPU_PEEK_RECALL = 0.3; // CPUs remember fewer doors from the opening peek than from real flips
const CPU_FORGET = 0.1; // chance per turn change that a CPU forgets each remembered door (scaled by skill)

const PICS = ['apple', 'carrot', 'corn', 'pumpkin', 'egg', 'milk', 'cheese', 'sunflower', 'strawberry', 'mushroom', 'horseshoe', 'bell', 'hay', 'melon', 'grapes'];

let players = [];
let demo = true;
let cards = [];
let cols = 6, rows = 4;
let goldenId = -1;
const fx = new Particles();
let popups = [];
let wind = 0;
const T = { phase: 'idle', idx: 0, active: null, timer: 0, picks: [], resolveT: 0, waitT: 0, misses: 0, peekT: 0, breezeT: 0, announce: 0, lastTick: 0, demoT: 0 };
let L = null; // layout cache
let lastW = 1280, lastH = 720;

function gridFor(n) {
  if (n <= 1) return [5, 4];
  if (n === 2) return [6, 4];
  return [6, 5];
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildBoard(n) {
  [cols, rows] = gridFor(n);
  const pairs = (cols * rows) / 2;
  const ids = shuffle(PICS.map((_, i) => i)).slice(0, pairs);
  goldenId = ids[(Math.random() * ids.length) | 0];
  const deck = shuffle([...ids, ...ids]);
  cards = deck.map((id, slot) => ({ id, slot, up: false, flip: 0, gone: false, flyT: -1, owner: null, move: null, wig: 0, hot: 0, seen: 0 }));
}

const liveCards = () => cards.filter((c) => !c.gone);
const cardAt = (slot) => cards.find((c) => c.slot === slot && !c.gone) || null;

const game = {
  id: 'peek-a-barn',
  title: 'Peek-a-Barn',
  tagline: 'Open two barn doors. Find the pairs. Remember everything!',
  accent: '#ff3b30',
  layout: 'remote',
  stream: false,
  music: { bpm: 116, root: 60, scale: [0, 2, 4, 7, 9], prog: [0, 5, 3, 4], lead: 'marimba', seed: 23 },
  howTo: [
    { icon: 'eye', title: 'Peek!', text: 'All doors open for a moment at the start. Memorize fast!' },
    { icon: 'dpad', title: 'Pick two', text: 'On your turn, move with the d-pad and press GO to open a door.' },
    { icon: 'streak', title: 'Pairs in a row', text: 'A pair = 100 and another go. Streaks add +50 each. Gold pair x2!' },
  ],
  keysHelp:
    'Keyboard: everyone shares the arrows (or W A S D) and Space / Enter on their turn. 7 seconds per pick. Every 4 misses a Barn Breeze swaps some doors, so watch them move!',
  lobbyHelp:
    "Phones: scan your slot's code (or open the link and type the PIN). Keyboard players press their join key; on your turn use the arrows or W A S D and Space.",

  start(list, opts) {
    demo = opts.demo;
    players = list;
    buildBoard(list.length);
    popups = [];
    for (const p of list) {
      p.g = {
        score: 0, pairs: 0, streak: 0, best: 0,
        cur: { c: Math.floor(cols / 2) - 1 + (p.n % 2), r: Math.floor(rows / 2) - 1 + (p.n >> 1) },
        mood: 'happy', moodT: 0, blink: 0, blinkT: rand(1, 4), bump: 0,
        ai: { skill: rand(0.45, 0.75), mem: new Set(), target: null, stepT: 0, thinkT: 0 },
      };
      p.g.cur.c = clamp(p.g.cur.c, 0, cols - 1);
      p.g.cur.r = clamp(p.g.cur.r, 0, rows - 1);
    }
    Object.assign(T, { phase: demo ? 'demo' : 'idle', idx: 0, active: null, timer: TURN_TIME, picks: [], misses: 0, announce: 0, demoT: 0 });
  },

  onGo(party) {
    T.phase = 'peek';
    T.peekT = PEEK_TIME;
    for (const c of cards) {
      c.up = true;
      seenBy(c, CPU_PEEK_RECALL);
    }
    party.audio.play('whoosh');
  },

  key(code, repeat) {
    const map = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', Space: 'action', Enter: 'action', NumpadEnter: 'action' };
    const b = map[code];
    if (!b) return false;
    const p = T.active;
    if (p && p.kind === 'human' && T.phase === 'pick') {
      if (b === 'action') {
        if (!repeat) tryFlip(p);
      } else moveCursor(p, b);
    }
    return true;
  },

  press(p, which) {
    if (which === 'up' || which === 'down' || which === 'left' || which === 'right') {
      if (p === T.active && T.phase === 'pick') moveCursor(p, which);
      else nudge(p);
    }
  },

  action(p) {
    if (p === T.active && T.phase === 'pick') tryFlip(p);
    else nudge(p);
  },

  hudText() {
    return ''; // the turn strip on the barn wall shows turn, clock and pairs left (the kit HUD pill is hidden in party.css)
  },

  update(dt, party) {
    P = party;
    fx.update(dt);
    wind = Math.max(0, wind - dt * 0.7);
    for (const c of cards) {
      const target = c.up || c.gone ? 1 : 0;
      c.flip = clamp(c.flip + Math.sign(target - c.flip) * dt * 6, 0, 1);
      if (c.move) {
        c.move.t += dt / 0.9;
        if (c.move.t >= 1) c.move = null;
      }
      if (c.flyT >= 0 && c.flyT < 1) c.flyT = Math.min(1, c.flyT + dt * 1.6);
      c.wig = Math.max(0, c.wig - dt * 3);
      c.hot = Math.max(0, c.hot - dt);
    }
    popups = popups.filter((q) => (q.t += dt) < 1.3);
    for (const p of players) {
      const g = p.g;
      g.blinkT -= dt;
      if (g.blinkT < 0) {
        g.blink = 0.14;
        g.blinkT = rand(2, 5);
      }
      g.blink = Math.max(0, g.blink - dt);
      g.moodT = Math.max(0, g.moodT - dt);
      if (g.moodT <= 0) g.mood = 'happy';
      g.bump = Math.max(0, g.bump - dt * 3);
    }
    T.announce = Math.max(0, T.announce - dt);

    if (demo) return demoTick(dt);
    if (party.state !== 'play') return;

    switch (T.phase) {
      case 'peek':
        T.peekT -= dt;
        if (T.peekT <= 0) {
          for (const c of cards) c.up = false;
          party.audio.play('whoosh');
          T.phase = 'wait';
          T.waitT = 0.5;
          T.after = () => beginTurn(0);
        }
        break;
      case 'wait':
        T.waitT -= dt;
        if (T.waitT <= 0) T.after();
        break;
      case 'pick': {
        T.timer -= dt;
        const s = Math.ceil(T.timer);
        if (T.timer <= 3 && s !== T.lastTick && T.timer > 0) {
          T.lastTick = s;
          party.audio.tone(1100, 0.07, { type: 'square', vol: 0.09 });
        }
        if (T.timer <= 0) return timeout();
        if (T.active.kind === 'cpu') cpuThink(T.active, dt);
        break;
      }
      case 'reveal':
        T.resolveT -= dt;
        if (T.resolveT <= 0) resolve();
        break;
      case 'breeze':
        T.breezeT -= dt;
        if (T.breezeT <= 0) nextTurn();
        break;
    }
  },

  onFinish() {
    T.phase = 'done';
    let top = -1;
    for (const p of players) top = Math.max(top, p.g.score);
    for (const p of players) {
      p.g.mood = p.g.score === top ? 'cheer' : 'sad';
      p.g.moodT = 99;
    }
  },

  results() {
    return players.map((p) => ({
      p,
      score: p.g.score,
      text: `${p.g.score} pts · ${p.g.pairs} pair${p.g.pairs === 1 ? '' : 's'}${p.g.best >= 2 ? ` · best streak ${p.g.best}` : ''}`,
    }));
  },

  draw(ctx, w, h, party) {
    lastW = w;
    lastH = h;
    L = layout(w, h);
    drawScene(ctx, w, h, party);
  },
};

let P = null; // party handle for helpers

// ───────────── turn logic ─────────────
function beginTurn(i) {
  T.idx = i % players.length;
  T.active = players[T.idx];
  T.picks = [];
  T.timer = TURN_TIME;
  T.lastTick = 99;
  T.phase = 'pick';
  T.announce = 1.2;
  const p = T.active;
  p.g.ai.target = null;
  p.g.ai.thinkT = rand(0.35, 0.7);
  if (players.length > 1) {
    P.audio.tone(660, 0.1, { type: 'triangle', vol: 0.16 });
    P.audio.tone(880, 0.14, { type: 'triangle', vol: 0.16, at: 0.09 });
  }
  if (p.kind === 'human') p.haptic([30, 50, 30]);
}

function nextTurn() {
  cpuForget();
  beginTurn(T.idx + 1);
}

function moveCursor(p, dir) {
  const g = p.g;
  const dc = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
  const dr = dir === 'up' ? -1 : dir === 'down' ? 1 : 0;
  let c = g.cur.c, r = g.cur.r;
  // Step in that direction, skipping empty spots; if the row/column is empty from here, look one lane over.
  for (let k = 1; k < Math.max(cols, rows); k++) {
    const nc = g.cur.c + dc * k, nr = g.cur.r + dr * k;
    if (nc < 0 || nc >= cols || nr < 0 || nr >= rows) break;
    if (cardAt(nr * cols + nc)) {
      c = nc;
      r = nr;
      break;
    }
  }
  if (c === g.cur.c && r === g.cur.r) {
    const nc = clamp(g.cur.c + dc, 0, cols - 1), nr = clamp(g.cur.r + dr, 0, rows - 1);
    c = nc;
    r = nr;
  }
  if (c !== g.cur.c || r !== g.cur.r) {
    g.cur.c = c;
    g.cur.r = r;
    P?.audio.tone(520 + r * 40 + c * 25, 0.05, { type: 'triangle', vol: 0.1 });
  }
}

function nudge(p) {
  if (!p.g || T.phase === 'done') return;
  p.g.bump = 1;
}

function tryFlip(p) {
  const card = cardAt(p.g.cur.r * cols + p.g.cur.c);
  if (!card || card.up || card.move) {
    p.g.bump = 1;
    P.audio.tone(200, 0.08, { type: 'square', vol: 0.08 });
    return;
  }
  flipUp(card);
}

function flipUp(card) {
  card.up = true;
  card.wig = 1;
  T.picks.push(card);
  seenBy(card);
  P.audio.tone(540, 0.06, { type: 'triangle', vol: 0.16, slide: 400 });
  P.audio.noise(0.08, { freq: 1600, q: 1.5, vol: 0.08 });
  if (T.active.kind === 'human') T.active.haptic(15);
  const p = T.active;
  p.g.ai.target = null;
  p.g.ai.thinkT = rand(0.3, 0.55);
  if (T.picks.length === 1) {
    T.timer = Math.max(T.timer, SECOND_PICK_MIN);
  } else {
    const [a, b] = T.picks;
    T.phase = 'reveal';
    T.resolveT = a.id === b.id ? SHOW_MATCH : SHOW_MISS;
  }
}

function resolve() {
  const [a, b] = T.picks;
  const p = T.active;
  const g = p.g;
  T.picks = [];
  if (a.id === b.id) {
    g.streak++;
    g.best = Math.max(g.best, g.streak);
    g.pairs++;
    const gold = a.id === goldenId;
    const pts = (PAIR_POINTS + STREAK_BONUS * (g.streak - 1)) * (gold ? 2 : 1);
    g.score += pts;
    g.mood = 'cheer';
    g.moodT = 1.4;
    for (const c of [a, b]) {
      c.gone = true;
      c.owner = p;
      c.flyT = 0;
      const q = cardCenter(c);
      fx.burst(q.x, q.y, gold ? 34 : 18, { speed: 360, up: 200, colors: gold ? ['#ffd21f', '#fff', '#ffe27a'] : undefined });
    }
    for (const pl of players) pl.g.ai.mem.delete(a), pl.g.ai.mem.delete(b);
    const q = cardCenter(b);
    let txt = `+${pts}`;
    if (gold) txt += ' GOLD!';
    else if (g.streak >= 2) txt += ` STREAK x${g.streak}`;
    popups.push({ text: txt, x: q.x, y: q.y, t: 0, color: gold ? '#ffd21f' : p.color, big: gold || g.streak >= 2 });
    P.audio.play('ding');
    P.audio.play('pop');
    if (gold) P.audio.play('win');
    else if (g.streak >= 2) [0, 1, 2].forEach((i) => P.audio.tone(784 * Math.pow(1.26, i), 0.12, { type: 'square', vol: 0.08, at: 0.1 + i * 0.07 }));
    if (p.kind === 'human') p.haptic(gold ? [60, 40, 60, 40, 160] : [40, 30, 90]);
    P.shake(gold ? 0.5 : 0.25);
    if (!liveCards().length) {
      T.phase = 'done';
      P.finish();
      return;
    }
    // Another go for the same player.
    T.phase = 'pick';
    T.timer = TURN_TIME;
    T.lastTick = 99;
    g.ai.target = null;
    g.ai.thinkT = rand(0.35, 0.6);
  } else {
    a.up = false;
    b.up = false;
    a.wig = b.wig = 0.6;
    missed(p);
  }
}

function timeout() {
  const p = T.active;
  for (const c of T.picks) c.up = false;
  T.picks = [];
  const q = cursorCenter(p);
  popups.push({ text: 'TOO SLOW!', x: q.x, y: q.y, t: 0, color: '#ff3b30', big: true });
  missed(p);
}

function missed(p) {
  p.g.streak = 0;
  p.g.mood = 'sad';
  p.g.moodT = 1.1;
  P.audio.play('buzz');
  if (p.kind === 'human') p.haptic(120);
  T.misses++;
  const down = liveCards().filter((c) => !c.up);
  if (T.misses % BREEZE_EVERY === 0 && down.length >= 4) {
    T.phase = 'wait';
    T.waitT = 0.35;
    T.after = () => breeze();
  } else {
    T.phase = 'wait';
    T.waitT = 0.25;
    T.after = nextTurn;
  }
}

/** Barn Breeze: swap a few face-down doors, with a visible slide so sharp eyes can follow them. */
function breeze() {
  const down = shuffle(liveCards().filter((c) => !c.up));
  const swaps = Math.min(down.length >= 8 ? 3 : 2, Math.floor(down.length / 2));
  for (let i = 0; i < swaps; i++) {
    const a = down[i * 2], b = down[i * 2 + 1];
    a.move = { from: a.slot, t: 0, lift: 1 };
    b.move = { from: b.slot, t: 0, lift: -1 };
    [a.slot, b.slot] = [b.slot, a.slot];
    a.hot = b.hot = 2.2;
    for (const p of players) {
      if (p.kind !== 'cpu') continue;
      for (const c of [a, b]) if (Math.random() > p.g.ai.skill * 0.7) p.g.ai.mem.delete(c);
    }
  }
  wind = 1.6;
  T.phase = 'breeze';
  T.breezeT = BREEZE_TIME;
  P.audio.play('whoosh');
  P.audio.noise(1.1, { freq: 700, q: 1.2, vol: 0.18, slide: 1400, attack: 0.2 });
  for (const p of players) if (p.kind === 'human') p.haptic([20, 30, 20, 30, 20]);
}

/** Every CPU might remember a card it saw face up (`f` scales the chance: the quick peek is harder). */
function seenBy(card, f = 1) {
  for (const p of players) {
    if (p.kind !== 'cpu' || !p.g) continue;
    if (Math.random() < p.g.ai.skill * f) p.g.ai.mem.add(card);
  }
}

/** CPUs slowly forget, like people do. */
function cpuForget() {
  for (const p of players) {
    if (p.kind !== 'cpu') continue;
    const k = CPU_FORGET * (1.4 - p.g.ai.skill);
    for (const c of [...p.g.ai.mem]) if (Math.random() < k) p.g.ai.mem.delete(c);
  }
}

function cpuChoose(p) {
  const ai = p.g.ai;
  const live = liveCards().filter((c) => !c.up);
  const known = live.filter((c) => ai.mem.has(c));
  const unknown = live.filter((c) => !ai.mem.has(c));
  const pickAny = (arr) => arr[(Math.random() * arr.length) | 0];
  const slip = Math.random() < (1 - ai.skill) * 0.35;
  if (T.picks.length === 0) {
    if (!slip) {
      for (const a of known) {
        const b = known.find((c) => c !== a && c.id === a.id);
        if (b) return a;
      }
    }
    return pickAny(unknown.length ? unknown : live);
  }
  const first = T.picks[0];
  if (!slip) {
    const mate = known.find((c) => c.id === first.id);
    if (mate) return mate;
  }
  const fresh = unknown.filter((c) => c !== first);
  return pickAny(fresh.length ? fresh : live.filter((c) => c !== first));
}

function cpuThink(p, dt) {
  const ai = p.g.ai;
  if (ai.thinkT > 0) {
    ai.thinkT -= dt;
    return;
  }
  if (!ai.target || ai.target.gone || ai.target.up) {
    ai.target = cpuChoose(p);
    ai.stepT = 0.1;
    if (!ai.target) return;
  }
  ai.stepT -= dt;
  if (ai.stepT > 0) return;
  ai.stepT = 0.12;
  const tc = ai.target.slot % cols, tr = Math.floor(ai.target.slot / cols);
  const g = p.g;
  if (g.cur.c !== tc) g.cur.c += Math.sign(tc - g.cur.c);
  else if (g.cur.r !== tr) g.cur.r += Math.sign(tr - g.cur.r);
  else {
    if (ai.target.move) return;
    flipUp(ai.target);
    return;
  }
  P.audio.tone(520 + g.cur.r * 40 + g.cur.c * 25, 0.04, { type: 'triangle', vol: 0.06 });
  if (g.cur.c === tc && g.cur.r === tr) ai.stepT = rand(0.2, 0.35);
}

function demoTick(dt) {
  T.demoT -= dt;
  if (T.demoT > 0) return;
  T.demoT = 0.55;
  const ups = cards.filter((c) => c.up);
  if (ups.length >= 2) for (const c of ups) c.up = false;
  else {
    const c = cards[(Math.random() * cards.length) | 0];
    c.up = true;
    c.wig = 1;
  }
}

// ───────────── layout ─────────────
function layout(w, h) {
  const n = Math.max(1, players.length);
  const wide = w >= h * 1.15;
  const m = Math.max(10, Math.min(w, h) * 0.02);
  let panels = [];
  let bx, by, bw, bh;
  if (wide) {
    const pw = Math.min(w * 0.21, 290);
    const ph = Math.min((h - m * 2 - (n - 1) * m) / n, 150);
    const top = (h - (ph * n + m * (n - 1))) / 2;
    panels = players.map((p, i) => ({ x: m, y: top + i * (ph + m), w: pw, h: ph }));
    bx = m * 2 + pw;
    by = m;
    bw = w - bx - m;
    bh = h - m * 2;
  } else {
    const ph = Math.min(h * 0.13, 110);
    const pw = (w - m * (n + 1)) / n;
    panels = players.map((p, i) => ({ x: m + i * (pw + m), y: m, w: pw, h: ph }));
    bx = m;
    by = m * 2 + ph;
    bw = w - m * 2;
    bh = h - by - m;
  }
  const strip = Math.min(64, bh * 0.1);
  const pad = Math.min(bw, bh) * 0.035;
  const gx = bx + pad, gy = by + strip + pad, gw = bw - pad * 2, gh = bh - strip - pad * 2;
  const gap = Math.max(6, Math.min(gw, gh) * 0.022);
  const cw = Math.min((gw - gap * (cols - 1)) / cols, ((gh - gap * (rows - 1)) / rows) * 0.8);
  const ch = cw / 0.8;
  const tw = cw * cols + gap * (cols - 1), th = ch * rows + gap * (rows - 1);
  const ox = gx + (gw - tw) / 2, oy = gy + (gh - th) / 2;
  return { wide, panels, bx, by, bw, bh, strip, cw, ch, gap, ox, oy, tw, th };
}

function slotPos(slot) {
  const c = slot % cols, r = Math.floor(slot / cols);
  return { x: L.ox + c * (L.cw + L.gap) + L.cw / 2, y: L.oy + r * (L.ch + L.gap) + L.ch / 2 };
}
function cardCenter(c) {
  if (!L) L = layout(lastW, lastH);
  const to = slotPos(c.slot);
  if (!c.move) return to;
  const from = slotPos(c.move.from);
  const k = ease(clamp(c.move.t, 0, 1));
  return { x: lerp(from.x, to.x, k), y: lerp(from.y, to.y, k) - Math.sin(Math.PI * k) * L.ch * 0.35 * c.move.lift };
}
function cursorCenter(p) {
  if (!L) L = layout(lastW, lastH);
  return slotPos(p.g.cur.r * cols + p.g.cur.c);
}

// ───────────── drawing ─────────────
function drawScene(ctx, w, h, party) {
  farmBackdrop(ctx, w, h, h * 0.34, { t: party.t });
  // wind streaks during a Barn Breeze
  if (wind > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, wind) * 0.8;
    ctx.strokeStyle = '#fff';
    ctx.lineCap = 'round';
    ctx.lineWidth = 6;
    for (let i = 0; i < 9; i++) {
      const y = (h * (i + 0.5)) / 9 + Math.sin(i * 3.1) * 20;
      const x = ((party.t * 900 + i * 337) % (w + 400)) - 200;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 80, y - 18, x + 180, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // the board: a barn wall
  const { bx, by, bw, bh } = L;
  ctx.save();
  ctx.translate(Math.sin(party.t * 40) * wind * 2, 0);
  rr(ctx, bx, by + 6, bw, bh, 26);
  ctx.fillStyle = INK;
  ctx.fill();
  rr(ctx, bx, by, bw, bh, 26);
  inked(ctx, '#c8402f', 5);
  ctx.save();
  rr(ctx, bx, by, bw, bh, 26);
  ctx.clip();
  ctx.strokeStyle = 'rgba(120,20,20,.35)';
  ctx.lineWidth = 3;
  const plank = Math.max(26, bw / 22);
  for (let x = bx + plank; x < bx + bw; x += plank) {
    ctx.beginPath();
    ctx.moveTo(x, by);
    ctx.lineTo(x, by + bh);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,255,255,.12)';
  ctx.fillRect(bx, by, bw, L.strip * 0.5);
  // hay floor inside the grid frame
  rr(ctx, L.ox - L.gap, L.oy - L.gap, L.tw + L.gap * 2, L.th + L.gap * 2, 16);
  ctx.fillStyle = 'rgba(80,10,10,.35)';
  ctx.fill();
  ctx.restore();
  rr(ctx, bx, by, bw, bh, 26);
  inked(ctx, null, 5);

  // empty spots
  for (let s = 0; s < cols * rows; s++) {
    if (cardAt(s)) continue;
    const q = slotPos(s);
    rr(ctx, q.x - L.cw / 2, q.y - L.ch / 2, L.cw, L.ch, L.cw * 0.12);
    ctx.fillStyle = 'rgba(255,210,120,.18)';
    ctx.fill();
    ctx.setLineDash([8, 8]);
    ctx.strokeStyle = 'rgba(255,235,180,.45)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.setLineDash([]);
  }
  // cards still on the board (moving ones last so they pass over the others)
  const onBoard = cards.filter((c) => !c.gone || c.flyT < 0.35);
  onBoard.sort((a, b) => (a.move ? 1 : 0) - (b.move ? 1 : 0));
  for (const c of onBoard) if (!c.gone) drawCard(ctx, c, party);
  // cursor of the active player (or every player in the menus)
  if (!demo && T.active && (T.phase === 'pick' || T.phase === 'reveal')) drawCursor(ctx, T.active, party);
  ctx.restore();

  // turn strip
  drawStrip(ctx, party);
  if (!demo) drawPairsLeft(ctx);
  // panels
  players.forEach((p, i) => drawPanel(ctx, p, L.panels[i], party));
  // matched cards flying to their owner
  for (const c of cards) if (c.gone && c.flyT >= 0 && c.flyT < 1) drawFlying(ctx, c, party);
  fx.draw(ctx);
  for (const q of popups) {
    const k = q.t / 1.3;
    ctx.save();
    ctx.globalAlpha = Math.min(1, (1 - k) * 3);
    const s = (q.big ? 34 : 28) * (L.cw / 110) * (k < 0.15 ? 0.6 + (k / 0.15) * 0.4 : 1);
    label(ctx, q.text, q.x, q.y - k * 70, Math.max(20, s), { fill: q.color });
    ctx.restore();
  }

  if (!demo && party.state === 'play') {
    const cx = L.ox + L.tw / 2, cy = L.oy + L.th / 2;
    const big = Math.min(L.tw * 0.14, 120);
    if (T.phase === 'peek') {
      label(ctx, 'PEEK!', cx, cy, big * (1 + 0.05 * Math.sin(party.t * 10)), { fill: '#ffd21f' });
      const k = T.peekT / PEEK_TIME;
      rr(ctx, cx - big * 1.6, cy + big * 0.7, big * 3.2, 18, 9);
      inked(ctx, '#fff', 4);
      rr(ctx, cx - big * 1.6, cy + big * 0.7, big * 3.2 * k, 18, 9);
      inked(ctx, '#ffd21f', 4);
    } else if (T.phase === 'breeze') {
      label(ctx, 'BARN BREEZE!', cx, cy - big * 0.2, big * 0.75, { fill: '#7fd3ff' });
      label(ctx, 'Doors swapped. Did you see?', cx, cy + big * 0.45, big * 0.3, { fill: '#fff' });
    }
  }
}

function drawCard(ctx, c, party) {
  const q = cardCenter(c);
  const w = L.cw, h = L.ch;
  const f = c.flip;
  const sx = Math.max(0.04, Math.abs(Math.cos(f * Math.PI)));
  const faceUp = f > 0.5;
  const wig = Math.sin(c.wig * 18) * c.wig * 0.06;
  ctx.save();
  ctx.translate(q.x, q.y);
  ctx.rotate(wig);
  const lift = c.move ? 1.1 : 1;
  ctx.scale(sx * lift, lift);
  // drop
  rr(ctx, -w / 2, -h / 2 + 6, w, h, w * 0.12);
  ctx.fillStyle = INK;
  ctx.fill();
  if (faceUp) {
    const gold = c.id === goldenId;
    rr(ctx, -w / 2, -h / 2, w, h, w * 0.12);
    inked(ctx, gold ? '#ffd21f' : '#fff6e0', 4);
    rr(ctx, -w / 2 + w * 0.08, -h / 2 + w * 0.08, w * 0.84, h - w * 0.16, w * 0.08);
    inked(ctx, gold ? '#ffe98a' : '#ffffff', 0);
    drawPic(ctx, PICS[c.id], 0, 0, w * 0.86);
    if (gold) {
      sparkle(ctx, -w * 0.3, -h * 0.33, w * 0.09 * (1 + 0.3 * Math.sin(party.t * 6)), '#fff');
      sparkle(ctx, w * 0.32, h * 0.3, w * 0.07 * (1 + 0.3 * Math.cos(party.t * 5)), '#fff');
    }
  } else {
    drawDoor(ctx, w, h, c);
  }
  if (c.hot > 0 && !faceUp) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, c.hot) * (0.5 + 0.5 * Math.sin(party.t * 14));
    rr(ctx, -w / 2 - 4, -h / 2 - 4, w + 8, h + 8, w * 0.14);
    ctx.strokeStyle = '#7fd3ff';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

function drawDoor(ctx, w, h) {
  const r = w * 0.12;
  rr(ctx, -w / 2, -h / 2, w, h, r);
  inked(ctx, '#ff3b30', 4);
  // white frame + X brace
  const fw = w * 0.1;
  ctx.save();
  rr(ctx, -w / 2, -h / 2, w, h, r);
  ctx.clip();
  ctx.fillStyle = '#e02d22';
  ctx.fillRect(-w / 2, h * 0.05, w, h / 2);
  ctx.restore();
  rr(ctx, -w / 2 + fw * 0.4, -h / 2 + fw * 0.4, w - fw * 0.8, h - fw * 0.8, r * 0.7);
  ctx.strokeStyle = INK;
  ctx.lineWidth = fw + 5;
  ctx.stroke();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = fw;
  ctx.stroke();
  const x0 = -w / 2 + fw, x1 = w / 2 - fw, y0 = -h / 2 + fw, y1 = h / 2 - fw;
  for (const [a, b, c, d] of [[x0, y0, x1, y1], [x1, y0, x0, y1]]) limb(ctx, a, b, c, d, '#fff', fw * 0.75);
  // hay loft window
  circle(ctx, 0, 0, w * 0.13, '#ffd21f', 3);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-w * 0.13, 0);
  ctx.lineTo(w * 0.13, 0);
  ctx.moveTo(0, -w * 0.13);
  ctx.lineTo(0, w * 0.13);
  ctx.stroke();
  gloss(ctx, -w * 0.22, -h * 0.32, w * 0.12, h * 0.05, 0.5);
}

function drawCursor(ctx, p, party) {
  const q = cursorCenter(p);
  const pulse = 1 + 0.04 * Math.sin(party.t * 9);
  const w = L.cw * 1.12 * pulse, h = L.ch * 1.1 * pulse;
  rr(ctx, q.x - w / 2, q.y - h / 2, w, h, L.cw * 0.16);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 19;
  ctx.stroke();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 13;
  ctx.stroke();
  ctx.strokeStyle = p.color;
  ctx.lineWidth = 7;
  ctx.stroke();
  // tag
  const tx = q.x, ty = q.y - h / 2 - 2;
  rr(ctx, tx - 24, ty - 16, 48, 26, 10);
  inked(ctx, p.color, 3.5);
  label(ctx, `P${p.n + 1}`, tx, ty - 3, 18, { fill: '#fff', drop: false });
  // little pointing arrow
  const ay = q.y + h / 2 + 4 + Math.abs(Math.sin(party.t * 6)) * 6;
  ctx.beginPath();
  ctx.moveTo(q.x, ay);
  ctx.lineTo(q.x - 12, ay + 16);
  ctx.lineTo(q.x + 12, ay + 16);
  ctx.closePath();
  inked(ctx, p.color, 3.5);
}

function drawFlying(ctx, c, party) {
  const from = slotPos(c.slot);
  const owner = players.indexOf(c.owner);
  const pan = L.panels[owner];
  if (!pan) return;
  const to = { x: pan.x + pan.w * 0.75, y: pan.y + pan.h * 0.5 };
  const k = ease(clamp((c.flyT - 0.25) / 0.75, 0, 1));
  const x = lerp(from.x, to.x, k), y = lerp(from.y, to.y, k) - Math.sin(Math.PI * k) * 120;
  const s = lerp(1, 0.3, k);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(k * TAU * 0.5);
  ctx.scale(s, s);
  const w = L.cw, h = L.ch;
  rr(ctx, -w / 2, -h / 2, w, h, w * 0.12);
  inked(ctx, c.id === goldenId ? '#ffd21f' : '#fff6e0', 4);
  drawPic(ctx, PICS[c.id], 0, 0, w * 0.86);
  ctx.restore();
}

function drawStrip(ctx, party) {
  const x = L.bx + L.bw / 2, y = L.by + L.strip * 0.55;
  const size = Math.min(L.strip * 0.6, 38);
  if (demo || party.state === 'countdown') {
    label(ctx, 'Peek-a-Barn', x, y, size, { fill: '#ffd21f' });
    return;
  }
  const p = T.active;
  if (!p || T.phase === 'peek') {
    label(ctx, 'Memorize the doors!', x, y, size, { fill: '#ffd21f' });
    return;
  }
  if (T.phase === 'done') {
    label(ctx, 'Barn cleared!', x, y, size, { fill: '#ffd21f' });
    return;
  }
  const pop = 1 + T.announce * 0.25 * Math.max(0, Math.sin(T.announce * 8));
  const txt = players.length > 1 ? `${p.label}'s turn${p.kind === 'cpu' ? ' (CPU)' : ''}` : 'Your turn';
  label(ctx, txt, x, y, size * pop, { fill: p.color });
  const st = p.g.streak;
  if (st >= 1 && T.phase === 'pick') label(ctx, `Next pair: STREAK x${st + 1}`, L.bx + L.bw - 18, y, Math.max(14, size * 0.5), { fill: '#ffd21f', align: 'right' });
  // turn clock: a bar across the top of the grid plus the seconds
  const k = clamp(T.timer / TURN_TIME, 0, 1);
  const bh = Math.max(10, L.gap * 0.9), bx = L.ox, bw = L.tw, by = L.oy - L.gap - bh - 4;
  rr(ctx, bx, by, bw, bh, bh / 2);
  inked(ctx, 'rgba(255,255,255,.85)', 3);
  if (k > 0.01) {
    rr(ctx, bx, by, bw * k, bh, bh / 2);
    inked(ctx, T.timer <= 3 ? (Math.floor(party.t * 6) % 2 ? '#ff3b30' : '#ffd21f') : p.color, 3);
  }
  if (T.phase === 'pick') label(ctx, `${Math.max(0, Math.ceil(T.timer))}`, bx + bw + 22, by + bh / 2, Math.max(18, size * 0.6), { fill: T.timer <= 3 ? '#ff3b30' : '#fff' });
}

function drawPairsLeft(ctx) {
  const n = liveCards().length / 2;
  label(ctx, `${n} pair${n === 1 ? '' : 's'} left`, L.bx + 18, L.by + L.strip * 0.55, Math.max(14, Math.min(L.strip * 0.32, 22)), { fill: '#fff', align: 'left', drop: false });
}

function drawPanel(ctx, p, r, party) {
  if (!r) return;
  const g = p.g;
  const isTurn = !demo && p === T.active && T.phase !== 'peek' && T.phase !== 'done';
  const bump = Math.sin(g.bump * 20) * g.bump * 5;
  ctx.save();
  ctx.translate(bump, 0);
  if (isTurn) {
    ctx.save();
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 24 + 10 * Math.sin(party.t * 6);
    rr(ctx, r.x - 4, r.y - 4, r.w + 8, r.h + 8, 22);
    inked(ctx, '#ffd21f', 5);
    ctx.restore();
  }
  rr(ctx, r.x, r.y + 5, r.w, r.h, 18);
  ctx.fillStyle = INK;
  ctx.fill();
  rr(ctx, r.x, r.y, r.w, r.h, 18);
  inked(ctx, '#fff', 4);
  ctx.save();
  rr(ctx, r.x, r.y, r.w, r.h, 18);
  ctx.clip();
  ctx.fillStyle = p.color;
  ctx.globalAlpha = 0.22;
  ctx.fillRect(r.x, r.y, r.h * 0.95, r.h);
  ctx.globalAlpha = 1;
  const s = r.h * 1.15;
  drawAnimal(ctx, p.animal, r.x + r.h * 0.48, r.y + r.h * 1.38 - (g.mood === 'cheer' ? Math.abs(Math.sin(party.t * 9)) * r.h * 0.08 : 0), s, {
    color: p.color,
    mood: g.mood,
    blink: g.blink > 0 ? 1 : 0,
  });
  ctx.restore();
  rr(ctx, r.x, r.y, r.w, r.h, 18);
  inked(ctx, null, 4);
  const tx = r.x + r.h * 0.98;
  const avail = r.w - r.h * 0.98 - 10;
  const name = avail > 120 ? p.label : `P${p.n + 1}`;
  ctx.save();
  ctx.fillStyle = INK;
  ctx.font = `800 ${Math.max(12, Math.min(r.h * 0.17, 20))}px 'Baloo 2', system-ui, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.fillText(`${name}${p.kind === 'cpu' ? ' · CPU' : ''}`, tx, r.y + r.h * 0.22);
  ctx.restore();
  label(ctx, `${g.score}`, tx, r.y + r.h * 0.55, Math.max(18, Math.min(r.h * 0.34, 46)), { fill: p.color, align: 'left' });
  // matched pairs as mini doors
  const ms = Math.max(6, Math.min(r.h * 0.14, 16));
  const maxShow = Math.max(1, Math.floor((avail - 4) / (ms * 0.9)));
  for (let i = 0; i < Math.min(g.pairs, maxShow); i++) {
    rr(ctx, tx + i * ms * 0.9, r.y + r.h * 0.8 - ms * 0.6, ms * 0.75, ms, 3);
    inked(ctx, '#fff6e0', 2);
  }
  if (isTurn && g.streak >= 1) label(ctx, `x${g.streak + 1}`, r.x + r.w - 10, r.y + r.h * 0.22, Math.min(r.h * 0.2, 24), { fill: '#ffd21f', align: 'right' });
  ctx.restore();
}

// ───────────── farm pictures (all procedural) ─────────────
export function drawPic(ctx, kind, x, y, s) {
  const u = s / 100;
  const lw = Math.max(2, 3.4 * u);
  ctx.save();
  ctx.translate(x, y);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  const line = (pts, color = INK, width = lw) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(pts[0] * u, pts[1] * u);
    for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i] * u, pts[i + 1] * u);
    ctx.stroke();
  };
  const leaf = (lx, ly, rx, ry, rot, col = '#2fc65a') => ellipse(ctx, lx * u, ly * u, rx * u, ry * u, rot, col, lw);
  switch (kind) {
    case 'apple': {
      limb(ctx, 0, -24 * u, 5 * u, -42 * u, '#8a5a2b', 5 * u);
      leaf(15, -38, 13, 6, -0.5);
      ctx.beginPath();
      ctx.moveTo(0, -24 * u);
      ctx.bezierCurveTo(22 * u, -38 * u, 46 * u, -18 * u, 40 * u, 10 * u);
      ctx.bezierCurveTo(36 * u, 36 * u, 16 * u, 44 * u, 0, 36 * u);
      ctx.bezierCurveTo(-16 * u, 44 * u, -36 * u, 36 * u, -40 * u, 10 * u);
      ctx.bezierCurveTo(-46 * u, -18 * u, -22 * u, -38 * u, 0, -24 * u);
      inked(ctx, '#ff3b30', lw);
      gloss(ctx, -20 * u, -8 * u, 7 * u, 12 * u, 0.6);
      break;
    }
    case 'carrot': {
      ctx.rotate(-0.55);
      leaf(-8, -40, 5, 14, -0.4);
      leaf(8, -40, 5, 14, 0.4);
      leaf(0, -44, 5, 15, 0);
      ctx.beginPath();
      ctx.moveTo(-17 * u, -28 * u);
      ctx.quadraticCurveTo(0, -38 * u, 17 * u, -28 * u);
      ctx.lineTo(3 * u, 46 * u);
      ctx.quadraticCurveTo(0, 50 * u, -3 * u, 46 * u);
      ctx.closePath();
      inked(ctx, '#ff8a1f', lw);
      line([-12, -10, -4, -10]);
      line([6, 4, 11, 4]);
      line([-6, 20, -1, 20]);
      gloss(ctx, -8 * u, -18 * u, 3 * u, 10 * u, 0.6);
      break;
    }
    case 'corn': {
      ctx.rotate(0.25);
      ellipse(ctx, 0, -4 * u, 18 * u, 40 * u, 0, '#ffd21f', lw);
      ctx.fillStyle = '#f0a800';
      for (let r = -3; r <= 3; r++) for (let c = -1; c <= 1; c++) {
        const yy = -4 + r * 10, xx = c * 9 * Math.cos((r / 4) * 1.2);
        ctx.beginPath();
        ctx.arc(xx * u, yy * u, 2.6 * u, 0, TAU);
        ctx.fill();
      }
      for (const sx of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(0, 44 * u);
        ctx.quadraticCurveTo(sx * 34 * u, 20 * u, sx * 16 * u, -24 * u);
        ctx.quadraticCurveTo(sx * 16 * u, 18 * u, 0, 44 * u);
        inked(ctx, '#2fc65a', lw);
      }
      gloss(ctx, -7 * u, -24 * u, 3 * u, 8 * u, 0.7);
      break;
    }
    case 'pumpkin': {
      limb(ctx, 0, -26 * u, 6 * u, -40 * u, '#5a8a2b', 7 * u);
      ellipse(ctx, -20 * u, 8 * u, 22 * u, 32 * u, 0, '#ff8a1f', lw);
      ellipse(ctx, 20 * u, 8 * u, 22 * u, 32 * u, 0, '#ff8a1f', lw);
      ellipse(ctx, 0, 8 * u, 20 * u, 34 * u, 0, '#ff9f3a', lw);
      ctx.strokeStyle = '#2fc65a';
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.arc(14 * u, -32 * u, 6 * u, Math.PI, TAU * 0.95);
      ctx.stroke();
      gloss(ctx, -6 * u, -8 * u, 4 * u, 10 * u, 0.6);
      break;
    }
    case 'egg': {
      ellipse(ctx, 0, 28 * u, 42 * u, 15 * u, 0, '#d9a55a', lw);
      ellipse(ctx, 0, -4 * u, 24 * u, 32 * u, 0, '#fff6e0', lw);
      ctx.fillStyle = '#e8c79a';
      for (const [a, b, r] of [[8, -14, 3], [-10, 6, 2.5], [6, 12, 2]]) {
        ctx.beginPath();
        ctx.arc(a * u, b * u, r * u, 0, TAU);
        ctx.fill();
      }
      gloss(ctx, -9 * u, -16 * u, 5 * u, 9 * u, 0.8);
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(0, 28 * u, 42 * u, 15 * u, 0, 0, Math.PI);
      ctx.lineTo(-42 * u, 26 * u);
      ctx.closePath();
      inked(ctx, '#d9a55a', lw);
      ctx.restore();
      line([-30, 30, -10, 36]);
      line([4, 38, 26, 30]);
      line([-18, 24, 10, 26], '#a8742a', lw * 0.8);
      break;
    }
    case 'milk': {
      rr(ctx, -11 * u, -36 * u, 22 * u, 26 * u, 6 * u);
      inked(ctx, '#ffffff', lw);
      rr(ctx, -25 * u, -16 * u, 50 * u, 60 * u, 14 * u);
      inked(ctx, '#ffffff', lw);
      rr(ctx, -14 * u, -46 * u, 28 * u, 12 * u, 4 * u);
      inked(ctx, '#2f7cff', lw);
      rr(ctx, -25 * u, 4 * u, 50 * u, 22 * u, 2 * u);
      inked(ctx, '#2f7cff', lw);
      ellipse(ctx, -6 * u, 15 * u, 7 * u, 5 * u, 0.3, '#fff', 0);
      ellipse(ctx, 9 * u, 13 * u, 4 * u, 3 * u, -0.2, '#fff', 0);
      gloss(ctx, -16 * u, -4 * u, 3 * u, 8 * u, 0.8);
      break;
    }
    case 'cheese': {
      ctx.beginPath();
      ctx.moveTo(-42 * u, -2 * u);
      ctx.lineTo(34 * u, -30 * u);
      ctx.lineTo(42 * u, -8 * u);
      ctx.closePath();
      inked(ctx, '#ffe27a', lw);
      ctx.beginPath();
      ctx.moveTo(-42 * u, -2 * u);
      ctx.lineTo(42 * u, -8 * u);
      ctx.lineTo(42 * u, 28 * u);
      ctx.lineTo(-42 * u, 28 * u);
      ctx.closePath();
      inked(ctx, '#ffd21f', lw);
      for (const [a, b, r] of [[-20, 10, 6], [8, 16, 8], [28, 4, 5], [-2, 0, 3]]) ellipse(ctx, a * u, b * u, r * u, r * 0.8 * u, 0, '#f0a800', lw * 0.6);
      break;
    }
    case 'sunflower': {
      limb(ctx, 0, 12 * u, 0, 48 * u, '#2fc65a', 5 * u);
      leaf(12, 34, 12, 5, -0.5);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU;
        ellipse(ctx, Math.cos(a) * 24 * u, -8 * u + Math.sin(a) * 24 * u, 12 * u, 6 * u, a, '#ffd21f', lw * 0.8);
      }
      circle(ctx, 0, -8 * u, 18 * u, '#8a5a2b', lw);
      ctx.fillStyle = '#5a3a1a';
      for (let i = 0; i < 7; i++) {
        const a = i * 2.4, r = 4 + (i % 3) * 4;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * r * u, -8 * u + Math.sin(a) * r * u, 2 * u, 0, TAU);
        ctx.fill();
      }
      gloss(ctx, -6 * u, -15 * u, 5 * u, 3 * u, 0.5);
      break;
    }
    case 'strawberry': {
      ctx.beginPath();
      ctx.moveTo(0, 42 * u);
      ctx.bezierCurveTo(-32 * u, 22 * u, -40 * u, -20 * u, -16 * u, -26 * u);
      ctx.quadraticCurveTo(0, -30 * u, 16 * u, -26 * u);
      ctx.bezierCurveTo(40 * u, -20 * u, 32 * u, 22 * u, 0, 42 * u);
      inked(ctx, '#ff3b30', lw);
      ctx.fillStyle = '#ffe27a';
      for (const [a, b] of [[-14, -10], [0, -14], [14, -10], [-18, 6], [-4, 2], [10, 4], [20, -2], [-8, 18], [6, 20], [0, 32]]) {
        ctx.beginPath();
        ctx.ellipse(a * u, b * u, 1.8 * u, 2.8 * u, 0, 0, TAU);
        ctx.fill();
      }
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i - 2) * 0.55;
        leaf(Math.cos(a) * 12, -28 + Math.sin(a) * 4 + 4, 10, 4.5, a);
      }
      limb(ctx, 0, -30 * u, 0, -42 * u, '#2fc65a', 4 * u);
      gloss(ctx, -14 * u, -4 * u, 4 * u, 9 * u, 0.6);
      break;
    }
    case 'mushroom': {
      rr(ctx, -13 * u, -6 * u, 26 * u, 46 * u, 11 * u);
      inked(ctx, '#fff6e0', lw);
      ctx.beginPath();
      ctx.ellipse(0, -2 * u, 42 * u, 36 * u, 0, Math.PI, TAU);
      ctx.closePath();
      inked(ctx, '#ff3b30', lw);
      for (const [a, b, r] of [[-22, -12, 6], [0, -26, 7], [22, -12, 6], [-8, -8, 3.5], [12, -28, 3]]) circle(ctx, a * u, b * u, r * u, '#fff', lw * 0.6);
      gloss(ctx, -24 * u, -24 * u, 4 * u, 7 * u, 0.5);
      break;
    }
    case 'horseshoe': {
      const R = 30 * u, a0 = -0.08 * Math.PI, a1 = 1.08 * Math.PI;
      ctx.lineCap = 'round';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 18 * u + lw * 2;
      ctx.beginPath();
      ctx.arc(0, -4 * u, R, a0, a1);
      ctx.stroke();
      ctx.strokeStyle = '#9aa3c4';
      ctx.lineWidth = 18 * u;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.55)';
      ctx.lineWidth = 4 * u;
      ctx.beginPath();
      ctx.arc(0, -4 * u, R - 4 * u, 0.55 * Math.PI, 0.95 * Math.PI);
      ctx.stroke();
      ctx.fillStyle = INK;
      for (let i = 0; i < 6; i++) {
        const a = a0 + 0.1 + (i / 5) * (a1 - a0 - 0.2);
        ctx.beginPath();
        ctx.arc(Math.cos(a) * R, -4 * u + Math.sin(a) * R, 2.4 * u, 0, TAU);
        ctx.fill();
      }
      sparkle(ctx, 0, -18 * u, 9 * u, '#ffd21f');
      break;
    }
    case 'bell': {
      ctx.beginPath();
      ctx.moveTo(-32 * u, 22 * u);
      ctx.quadraticCurveTo(-26 * u, -34 * u, 0, -34 * u);
      ctx.quadraticCurveTo(26 * u, -34 * u, 32 * u, 22 * u);
      ctx.closePath();
      inked(ctx, '#ffd21f', lw);
      circle(ctx, 0, 34 * u, 8 * u, '#e0a800', lw);
      rr(ctx, -38 * u, 18 * u, 76 * u, 11 * u, 5 * u);
      inked(ctx, '#ffc400', lw);
      ellipse(ctx, -10 * u, -40 * u, 10 * u, 6 * u, 0.4, '#ff3b30', lw);
      ellipse(ctx, 10 * u, -40 * u, 10 * u, 6 * u, -0.4, '#ff3b30', lw);
      circle(ctx, 0, -38 * u, 4 * u, '#ff3b30', lw);
      gloss(ctx, -14 * u, -12 * u, 4 * u, 12 * u, 0.7);
      break;
    }
    case 'hay': {
      rr(ctx, -42 * u, -26 * u, 84 * u, 58 * u, 14 * u);
      inked(ctx, '#f2c94c', lw);
      ctx.strokeStyle = '#c9971f';
      ctx.lineWidth = lw * 0.7;
      for (let i = 0; i < 9; i++) {
        const yy = -18 + i * 6;
        ctx.beginPath();
        ctx.moveTo((-34 + (i % 3) * 4) * u, yy * u);
        ctx.lineTo((34 - (i % 2) * 6) * u, (yy + 1) * u);
        ctx.stroke();
      }
      for (const xx of [-16, 16]) {
        rr(ctx, (xx - 3) * u, -27 * u, 6 * u, 60 * u, 2 * u);
        inked(ctx, '#ff3b30', lw * 0.7);
      }
      break;
    }
    case 'melon': {
      ctx.beginPath();
      ctx.arc(0, -12 * u, 44 * u, 0.05 * Math.PI, 0.95 * Math.PI);
      ctx.closePath();
      inked(ctx, '#2fc65a', lw);
      ctx.beginPath();
      ctx.arc(0, -12 * u, 36 * u, 0.06 * Math.PI, 0.94 * Math.PI);
      ctx.closePath();
      inked(ctx, '#ff5c6a', lw * 0.7);
      ctx.fillStyle = INK;
      for (const [a, b] of [[-16, 2], [0, 8], [16, 2], [-7, 14], [8, 14]]) {
        ctx.beginPath();
        ctx.ellipse(a * u, b * u, 2.2 * u, 3.6 * u, 0, 0, TAU);
        ctx.fill();
      }
      gloss(ctx, -18 * u, -4 * u, 8 * u, 3 * u, 0.5);
      break;
    }
    case 'grapes': {
      limb(ctx, 0, -32 * u, 4 * u, -44 * u, '#8a5a2b', 4 * u);
      leaf(16, -38, 14, 8, -0.3);
      const pts = [[-18, -20], [0, -22], [18, -20], [-10, -4], [10, -4], [-20, -6], [20, -6], [0, 12], [-10, 26], [10, 26], [0, 38], [-14, 12], [14, 12]];
      pts.sort((a, b) => a[1] - b[1]);
      for (const [a, b] of pts) {
        circle(ctx, a * u, b * u, 10 * u, '#8e5bd6', lw * 0.8);
        gloss(ctx, (a - 3) * u, (b - 4) * u, 2.5 * u, 2 * u, 0.7);
      }
      break;
    }
  }
  ctx.restore();
}

startParty(game);
