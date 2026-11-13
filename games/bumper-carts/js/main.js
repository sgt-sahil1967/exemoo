/**
 * Bumper Carts: boot, frame loop and game flow. Glues engine (3D + sim), rules, ui and players.
 * See ../PLAN.md. Flow: title -> lobby (4 seat cards) -> intro (3-2-1-GO) -> round -> results.
 *
 * Engine choice: js/engine.js (the real one) is loaded when it exists. If it is missing, or the URL has
 * ?stub, ../dev/stub-engine.js (a flat 2D stand-in with the same interface) is used instead and the
 * console says so. The same fallback applies to js/tilt-input.js.
 * URL flags: ?stub (force the stub engine), ?debug (exposes window.__bc for testing).
 */
import { Round } from './rules.js';
import { createUI } from './ui.js';
import { createPlayers } from './players.js';
import { KEY_HELP } from './keys.js';

const params = new URLSearchParams(location.search);
const $ = (id) => document.getElementById(id);

// Seat table (PLAN 1): P1 red cow, P2 blue pig, P3 green sheep, P4 yellow chick.
const CAST = [
  { name: 'Red Cow', color: '#ff3b30', animal: 'cow' },
  { name: 'Blue Pig', color: '#2f7cff', animal: 'pig' },
  { name: 'Green Sheep', color: '#2fc65a', animal: 'sheep' },
  { name: 'Yellow Chick', color: '#ffd21f', animal: 'chick' },
];
const STORM_AT = 25;
const COUNTDOWN = 3;

function boot(pct, msg) {
  $('bootBar').style.width = `${pct}%`;
  if (msg) $('bootMsg').textContent = msg;
}
function bootFail(e) {
  console.error(e);
  $('boot').classList.add('error');
  $('bootMsg').textContent = `Bumper Carts could not start: ${e?.message || e}`;
}

// Set once the UI exists: true while a menu screen is up, for the gyro menu cursor.
let menuProbe = () => false;

async function loadSdk() {
  try {
    const { connectExemoo } = await import('/sdk/exemoo.js');
    return connectExemoo({ layout: 'swing', title: 'Bumper Carts', stream: true, menuCursor: () => menuProbe() });
  } catch {
    // Opened outside the Exemoo server: keyboard only.
    const off = () => () => {};
    return { inShell: false, phone: { connected: false }, on: off, held: () => false, setLayout() {}, setStream() {}, haptic() {}, send() {}, setCamera() {}, exit() {} };
  }
}

/** Real module if it loads, else the stub. Returns { mod, real }. */
async function pick(realPath, stubPath, force = false) {
  if (!force) {
    try {
      return { mod: await import(realPath), real: true };
    } catch (e) {
      if (!/Failed to fetch|Importing a module script failed|error loading|404|Cannot find|not found/i.test(String(e?.message))) console.warn(`${realPath} failed to load`, e);
    }
  }
  return { mod: await import(stubPath), real: false };
}

async function main() {
  boot(10, 'Hitching the carts...');
  const forceStub = params.has('stub');
  const [exemoo, engineSel, tiltSel] = await Promise.all([
    loadSdk(),
    pick('./engine.js', '../dev/stub-engine.js', forceStub),
    pick('./tilt-input.js', '../dev/stub-engine.js', forceStub),
  ]);
  const usingStub = !engineSel.real;
  boot(55, 'Flooding the moat...');
  const engine = await engineSel.mod.createEngine({ canvas: $('scene') });
  const createPhoneTilt = tiltSel.real ? tiltSel.mod.createPhoneTilt : tiltSel.mod.createStubPhoneTilt;
  boot(90, 'Waking the animals...');

  const ui = createUI({ root: $('ui') });
  menuProbe = () => !!ui.screen;
  const inShell = !!exemoo.inShell;
  let muted = false;
  try {
    muted = localStorage.getItem('bumper-carts.muted') === '1';
  } catch {
    /* no storage */
  }
  engine.audio.setMuted(muted);

  // ───────────────────────────── state ─────────────────────────────
  let state = 'title'; // title | lobby | intro | play | ending | results   (+ paused flag)
  let paused = false;
  let cfg = ui.getConfig();
  let round = null;
  let seatsInPlay = [0, 1, 2, 3];
  let humans = new Set();
  let introT = 0;
  let introStep = -1;
  let endT = 0;

  const players = createPlayers({
    exemoo,
    createPhoneTilt,
    colors: CAST.map((c) => c.color),
    onButton: (i, b) => onButton(i, b),
    onChange: () => {
      pushStatus();
      if (state === 'lobby') showLobby();
    },
  });

  function pushStatus() {
    ui.setStatus({ muted });
  }

  // ───────────────────────────── cast and lobby ─────────────────────────────
  const joinedSeats = () => players.list.filter((p) => p.joined).map((p) => p.n);

  function computeSeats() {
    const j = joinedSeats();
    humans = new Set(j.length ? j : [0]);
    seatsInPlay = cfg.cpu ? [0, 1, 2, 3] : [...humans].sort((a, b) => a - b);
  }
  function applyCarts() {
    for (let i = 0; i < 4; i++) {
      const c = CAST[i];
      if (humans.has(i)) engine.setCart(i, { name: c.name, color: c.color, animal: c.animal, cpu: null, control: players.list[i].control });
      else if (cfg.cpu) engine.setCart(i, { name: c.name, color: c.color, animal: c.animal, cpu: cfg.level, control: null });
      else engine.setCart(i, null);
    }
  }

  function lobbyCards() {
    return players.list.map((p) => {
      const shellPhone = p.n === 0 && inShell;
      return {
        label: CAST[p.n].name,
        color: CAST[p.n].color,
        joined: p.joined,
        connected: p.connected,
        pin: p.pin,
        url: p.url.replace(/^https?:\/\//, '').replace(/\?.*/, ''),
        qrSrc: p.qrSrc,
        note: shellPhone ? 'Uses your Exemoo phone' : '',
        keysHelp: KEY_HELP[p.n],
        cpu: cfg.cpu,
      };
    });
  }
  function showLobby() {
    const n = joinedSeats().length;
    let note = 'Scan with a phone camera or press your charge key to join.';
    let canStart = true;
    if (!cfg.cpu && n < 2) {
      canStart = false;
      note = 'CPU rivals are off: two or more seats need to join.';
    } else if (n === 0) {
      note = 'Nobody joined yet: Player 1 will play on W A S D + Space.';
    } else if (cfg.cpu && n < 4) {
      note = 'Empty seats are filled by CPU carts.';
    }
    ui.showLobby(lobbyCards(), { note, canStart });
  }

  // ───────────────────────────── flow ─────────────────────────────
  function toTitle() {
    state = 'title';
    setPaused(false, true);
    cfg = ui.getConfig();
    players.setJoining(false);
    players.list.forEach((p, i) => players.stopPairing(i));
    humans = new Set();
    seatsInPlay = [0, 1, 2, 3];
    for (let i = 0; i < 4; i++) engine.setCart(i, { name: CAST[i].name, color: CAST[i].color, animal: CAST[i].animal, cpu: 'normal', control: null });
    engine.setActive(false);
    engine.resetRound();
    engine.setCamera('title');
    engine.celebrate([]);
    players.setKeysEnabled(false);
    ui.hud(null);
    ui.showTitle();
    pushStatus();
  }

  function toLobby() {
    state = 'lobby';
    setPaused(false, true);
    players.setKeysEnabled(false);
    ui.hud(null);
    for (let i = 0; i < 4; i++) players.startPairing(i);
    players.setJoining(true);
    showLobby();
  }

  function onStart(c) {
    engine.audio.unlock();
    engine.audio.play('click');
    cfg = c;
    toLobby();
  }

  function beginRound() {
    engine.audio.play('click');
    players.setJoining(false);
    computeSeats();
    applyCarts();
    round = new Round({ seats: seatsInPlay, seconds: cfg.seconds, stormAt: STORM_AT });
    ui.hideAll();
    setPaused(false, true);
    state = 'intro';
    introT = 0;
    introStep = -1;
    engine.setActive(false);
    engine.resetRound();
    engine.celebrate([]);
    engine.setCamera('play');
    players.setKeysEnabled(false);
    players.list.forEach((p) => p.control.recenter());
    hudNow();
  }

  const LEAD = 1.3;
  function introTick(dt) {
    introT += dt;
    const step = introT < LEAD ? 0 : Math.min(COUNTDOWN + 1, 1 + Math.floor(introT - LEAD)); // 0 hint, 1..3 numbers, 4 GO
    if (step === introStep) return;
    introStep = step;
    if (step === 0) {
      const phone = [...humans].some((i) => players.list[i].usingPhone);
      ui.hint(phone ? 'Hold your phone flat like a tray' : 'Steer with your keys, hold charge and let go to ram');
      engine.audio.play('click');
    } else if (step <= COUNTDOWN) {
      const n = COUNTDOWN - step + 1;
      ui.countdown(n);
      engine.audio.play('count');
      if (n === 1) players.list.forEach((p) => p.control.recenter());
    } else {
      ui.countdown('GO');
      engine.audio.play('go');
      ui.hint(null);
      round.start();
      state = 'play';
      engine.setActive(true);
      players.setKeysEnabled(true);
    }
  }

  function finish(sudden) {
    state = 'ending';
    endT = sudden ? 1.3 : 0.7;
    engine.setActive(false);
    players.setKeysEnabled(false);
    ui.hint(null);
  }

  function showResults() {
    state = 'results';
    const ranking = round.ranking;
    engine.setCamera('results');
    engine.celebrate(ranking);
    ui.hud(null);
    engine.audio.play(humans.has(ranking[0]) ? 'win' : 'lose');
    ui.showResults({ ranking, names: CAST.map((c) => c.name), colors: CAST.map((c) => c.color), scores: round.scores });
  }

  // ───────────────────────────── engine events ─────────────────────────────
  const haptic = (i, pat) => players.list[i]?.haptic(pat);
  engine.on('fall', ({ i, by }) => {
    if (!round || (state !== 'play')) return;
    const r = round.fall(i, by);
    if (r.ignored) return;
    haptic(i, 200);
    if (r.scorer >= 0) {
      ui.callout(r.scorer, 'KO!');
      haptic(r.scorer, [40, 30, 40]);
    } else {
      ui.callout(i, 'OOPS');
    }
    if (r.over) finish(true);
  });
  engine.on('bump', ({ a, b, power, by }) => {
    const hard = Math.round(20 + 60 * power);
    if (by === a) {
      haptic(b, hard);
      haptic(a, 20);
    } else if (by === b) {
      haptic(a, hard);
      haptic(b, 20);
    } else {
      haptic(a, hard);
      haptic(b, hard);
    }
  });
  engine.on('clash', ({ a, b }) => {
    ui.callout(-1, 'CLASH');
    haptic(a, 30);
    haptic(b, 30);
  });
  engine.on('charge', ({ i, full }) => {
    if (full) haptic(i, 15);
  });

  // ───────────────────────────── pause / buttons / keys ─────────────────────────────
  const inRound = () => state === 'intro' || state === 'play';
  function setPaused(on, silent = false) {
    if (on && !inRound()) return;
    if (paused === on) return;
    paused = on;
    engine.setPaused(on);
    if (!silent) ui.showPause(on);
    else if (!on) ui.showPause(false);
    players.setKeysEnabled(!on && state === 'play');
  }

  function onButton(i, b) {
    engine.audio.unlock();
    if (ui.nav(b)) return;
    if (b === 'pause') setPaused(!paused);
    else if (b === 'recenter') players.recenter(i);
    else if (b === 'back' && paused) setPaused(false);
  }

  ui.on('start', onStart);
  ui.on('pause', () => setPaused(true));
  ui.on('resume', () => setPaused(false));
  ui.on('restart', () => beginRound());
  ui.on('again', () => beginRound());
  ui.on('changePlayers', toLobby);
  ui.on('exit', () => (inShell ? exemoo.exit() : (location.href = '/')));
  ui.on('lobbyBack', toTitle);
  ui.on('lobbyReady', beginRound);
  ui.on('mute', toggleMute);

  function toggleMute() {
    muted = !muted;
    engine.audio.setMuted(muted);
    try {
      localStorage.setItem('bumper-carts.muted', muted ? '1' : '0');
    } catch {
      /* no storage */
    }
    pushStatus();
  }

  addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    if (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
      if (inRound()) {
        e.preventDefault();
        setPaused(!paused);
      }
    } else if (e.key === 'm' || e.key === 'M') toggleMute();
    else if (e.key === 'r' || e.key === 'R') {
      if (inRound()) players.list.forEach((p) => p.control.recenter());
    }
  });
  const unlock = () => {
    engine.audio.unlock();
    engine.audio.music(true);
  };
  addEventListener('pointerdown', unlock, { capture: true });
  addEventListener('keydown', unlock, { capture: true });
  addEventListener('resize', () => engine.resize());
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && inRound()) setPaused(true);
  });
  exemoo.on('status', pushStatus);

  // ───────────────────────────── frame loop ─────────────────────────────
  let snap = { carts: [], fence: [] };
  function hudNow() {
    if (!round) return;
    const stateOf = new Map(snap.carts.map((c) => [c.i, c.state]));
    const scores = round.scores;
    ui.hud({
      seats: [0, 1, 2, 3].map((i) => (seatsInPlay.includes(i) ? { name: CAST[i].name, color: CAST[i].color, score: scores[i], state: stateOf.get(i) || 'drive', cpu: !humans.has(i) } : null)),
      timeLeft: round.timeLeft,
      storm: round.state === 'storm' || round.stormed,
      sudden: round.state === 'sudden',
    });
  }

  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    if (!paused) {
      if (state === 'intro') introTick(dt);
      else if (state === 'play') {
        const ev = round.tick(dt);
        if (ev === 'storm') {
          ui.banner('BARN STORM', 'storm', 2000);
          engine.audio.play('storm');
          engine.dropFence();
        } else if (ev === 'sudden') {
          ui.banner('SUDDEN DEATH', 'storm', 2000);
          engine.audio.play('storm');
        } else if (ev === 'over') {
          ui.banner('TIME!', 'ko', 1200);
          finish(false);
        }
      } else if (state === 'ending') {
        endT -= dt;
        if (endT <= 0) showResults();
      }
    }
    engine.update(dt);
    engine.render();
    if (inRound() || state === 'ending') {
      snap = engine.snapshot();
      hudNow();
    }
  }

  if (params.has('debug')) window.__bc = { engine, ui, players, get round() { return round; }, get state() { return state; }, get paused() { return paused; }, get cfg() { return cfg; }, usingStub };

  toTitle();
  boot(100);
  $('boot').classList.add('done');
  setTimeout(() => $('boot').remove(), 700);
  requestAnimationFrame(frame);
  if (usingStub) console.info('[bumper-carts] running on the STUB engine (js/engine.js not found or ?stub)');
}

main().catch(bootFail);
