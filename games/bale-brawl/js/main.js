/**
 * Bale Brawl: boot, frame loop and game flow. Glues engine (3D + combat), rules, ui and players.
 * See ../PLAN.md. Flow: title -> (lobby for 2 players) -> rounds -> results.
 *
 * Engine choice: js/engine.js (the real one) is loaded when it exists. If it is missing, or the URL has
 * ?stub, ../dev/stub-engine.js (a flat 2D stand-in with the same interface) is used instead and a hint
 * says so. The same fallback applies to js/sword-input.js and js/constants.js.
 * URL flags: ?stub (force the stub engine), ?debug (exposes window.__bb for testing).
 */
import { Match } from './rules.js';
import { createUI } from './ui.js';
import { createPlayers } from './players.js';
import { KEY_HELP } from './keys.js';

const params = new URLSearchParams(location.search);
const $ = (id) => document.getElementById(id);

function boot(pct, msg) {
  $('bootBar').style.width = `${pct}%`;
  if (msg) $('bootMsg').textContent = msg;
}
function bootFail(e) {
  console.error(e);
  const b = $('boot');
  b.classList.add('error');
  $('bootMsg').textContent = `Bale Brawl could not start: ${e?.message || e}`;
}

// Set once the UI exists: true while a menu screen is up, for the gyro menu cursor.
let menuProbe = () => false;

async function loadSdk() {
  try {
    const { connectExemoo } = await import('/sdk/exemoo.js');
    return connectExemoo({ layout: 'swing', title: 'Bale Brawl', stream: true, menuCursor: () => menuProbe() });
  } catch {
    // Opened outside the Exemoo server: keyboard and mouse only.
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
  boot(10, 'Stacking the bales...');
  const forceStub = params.has('stub');
  const [exemoo, consts, engineSel, swordSel] = await Promise.all([
    loadSdk(),
    pick('./constants.js', '../dev/stub-engine.js').then((r) => (r.real ? r.mod : { MATCH: r.mod.STUB_CONSTANTS.MATCH, PLAYERS: r.mod.STUB_CONSTANTS.PLAYERS, CPU_CAST: r.mod.STUB_CONSTANTS.CPU_CAST })),
    pick('./engine.js', '../dev/stub-engine.js', forceStub),
    pick('./sword-input.js', '../dev/stub-engine.js', forceStub),
  ]);
  const { MATCH, PLAYERS, CPU_CAST } = consts;
  const usingStub = !engineSel.real;
  boot(55, 'Filling the pond...');
  const engine = await engineSel.mod.createEngine({ canvas: $('scene') });
  const createPhoneSword = swordSel.real ? swordSel.mod.createPhoneSword : swordSel.mod.createStubPhoneSword;
  boot(90, 'Waking the animals...');

  const ui = createUI({ root: $('ui') });
  menuProbe = () => !!ui.screen;
  const inShell = !!exemoo.inShell;
  let muted = false;
  try {
    muted = localStorage.getItem('bale-brawl.muted') === '1';
  } catch {
    /* no storage */
  }
  engine.audio.setMuted(muted);

  // ───────────────────────────── players ─────────────────────────────
  let state = 'title'; // title | lobby | intro | fight | ringout | results   (+ paused flag)
  let paused = false;
  const players = createPlayers({
    exemoo,
    canvas: $('scene'),
    createPhoneSword,
    colors: PLAYERS.map((p) => p.color),
    onButton: (i, b) => onButton(i, b),
    onChange: () => {
      pushStatus();
      if (state === 'lobby') showLobby();
    },
  });

  function pushStatus() {
    ui.setStatus({ phones: [players.list[0].connected, players.list[1].connected], muted });
  }

  // ───────────────────────────── match setup ─────────────────────────────
  let cfg = ui.getConfig();
  let match = null;
  let cast = null; // [{name,color,animal,cpu}] x2
  let lastWasDraw = false;
  let introT = 0;
  let introStep = -1;
  let afterT = 0;
  let pendingOut = null; // { loser, winner, t }
  let resolved = true;

  function makeCast() {
    const rival = cfg.mode === 'cpu' ? { ...CPU_CAST[cfg.difficulty], cpu: cfg.difficulty } : { ...PLAYERS[1], cpu: null };
    return [{ ...PLAYERS[0], cpu: null }, rival];
  }
  function applyFighters() {
    cast.forEach((c, i) => engine.setFighter(i, { name: c.name, color: c.color, animal: c.animal, cpu: c.cpu, control: c.cpu ? null : players.list[i].control }));
  }

  function toTitle() {
    state = 'title';
    setPaused(false, true);
    cfg = ui.getConfig();
    cast = [{ ...PLAYERS[0], cpu: null }, { ...CPU_CAST.normal, cpu: 'normal' }];
    applyFighters();
    engine.setActive(false);
    engine.resetRound();
    engine.setCamera('title');
    engine.celebrate(-1);
    players.setKeysEnabled(false);
    ui.hud(null);
    ui.showTitle();
    pushStatus();
  }

  function lobbyCards() {
    return [0, 1].map((i) => {
      const p = players.list[i];
      const shellPhone = i === 0 && inShell;
      return {
        label: `${PLAYERS[i].name}${shellPhone ? ' (your Exemoo phone)' : ''}`,
        color: PLAYERS[i].color,
        connected: p.connected,
        pin: p.pin,
        url: p.url.replace(/^https?:\/\//, '').replace(/\?.*/, ''),
        qrSrc: p.qrSrc,
        note: shellPhone ? 'Waiting for your Exemoo phone' : '',
        keysHelp: KEY_HELP[i],
      };
    });
  }
  function showLobby() {
    ui.showLobby(lobbyCards());
  }

  function onStart(c) {
    engine.audio.unlock();
    engine.audio.play('click');
    cfg = c;
    cast = makeCast();
    applyFighters();
    if (c.mode === 'versus') {
      state = 'lobby';
      players.startPairing(0);
      players.startPairing(1);
      showLobby();
    } else {
      beginMatch();
    }
  }

  function beginMatch() {
    match = new Match({ bestOf: cfg.bestOf, roundSeconds: MATCH.roundSeconds });
    lastWasDraw = false;
    cast = makeCast();
    applyFighters();
    ui.hideAll();
    setPaused(false, true);
    startRoundSequence();
  }

  // ───────────────────────────── round flow ─────────────────────────────
  const nextRoundNo = () => (match.state === 'roundOver' && !lastWasDraw ? match.round + 1 : match.round);

  function startRoundSequence() {
    state = 'intro';
    introT = 0;
    introStep = -1;
    resolved = false;
    pendingOut = null;
    engine.setActive(false);
    engine.resetRound();
    engine.setKnockScale(1);
    engine.celebrate(-1);
    engine.setCamera(cfg.mode === 'cpu' ? 'duel1p' : 'duel2p');
    players.setKeysEnabled(true);
    players.list.forEach((p) => p.control.recenter());
  }

  const LEAD = 1.1;
  function introTick(dt) {
    introT += dt;
    const total = MATCH.countdown;
    const step = introT < LEAD ? 0 : Math.min(total + 1, 1 + Math.floor(introT - LEAD)); // 0 banner, 1..total numbers, total+1 GO
    if (step === introStep) return;
    introStep = step;
    if (step === 0) {
      ui.banner(`ROUND ${nextRoundNo()}`, 'round', 1100);
      engine.audio.play('round');
      const phone = players.list[0].usingPhone || (cfg.mode === 'versus' && players.list[1].usingPhone);
      ui.hint(phone ? 'Point your bopper at the screen' : 'Mouse or WASD to aim and swing, Space to guard');
    } else if (step <= total) {
      ui.countdown(total - step + 1);
      engine.audio.play('count');
      if (total - step + 1 === 1) players.list.forEach((p) => p.control.recenter());
    } else {
      ui.countdown('GO');
      engine.audio.play('go');
      ui.hint(null);
      match.startRound();
      state = 'fight';
      engine.setActive(true);
    }
  }

  function onSudden() {
    ui.banner('SUDDEN DEATH', 'sudden', 2000);
    engine.audio.play('sudden');
    engine.setArenaScale(MATCH.suddenMinScale, MATCH.suddenShrinkSeconds);
    engine.setKnockScale(1.5);
  }

  /** Score the ring-out (once) and schedule the next round or the results. */
  function resolveRingout() {
    if (resolved || !pendingOut) return;
    resolved = true;
    const { loser } = pendingOut;
    const r = match.ringOut(loser);
    if (r.ignored) return;
    lastWasDraw = r.draw;
    if (loser >= 0) players.list[loser].haptic(200);
    else players.list.forEach((p) => p.haptic(200));
    if (r.draw) {
      ui.banner('DRAW, again!', 'draw', MATCH.ringoutPause * 1000);
      engine.celebrate(-1);
    } else {
      const w = r.roundWinner;
      engine.celebrate(w);
      ui.banner(r.matchWinner != null ? `${cast[w].name} wins!` : `${cast[w].name} scores!`, 'ringout', MATCH.ringoutPause * 1000);
      engine.audio.play(cast[w].cpu ? 'lose' : 'round');
    }
    afterT = MATCH.ringoutPause;
  }

  function showResults() {
    state = 'results';
    players.setKeysEnabled(false);
    const w = match.winner;
    engine.setCamera('results');
    engine.celebrate(w ?? -1);
    ui.hud(null);
    ui.hint(null);
    engine.audio.play(w === 0 || cfg.mode === 'versus' ? 'win' : 'lose');
    ui.showResults({ winner: w, names: cast.map((c) => c.name), colors: cast.map((c) => c.color), wins: match.wins, rounds: match.wins[0] + match.wins[1] });
  }

  // ───────────────────────────── engine events ─────────────────────────────
  engine.on('hit', ({ attacker, victim }) => {
    ui.callout(victim, 'BONK!');
    players.list[victim].haptic(60);
    players.list[attacker].haptic(25);
  });
  engine.on('block', ({ attacker, blocker }) => {
    ui.callout(blocker, 'BLOCKED');
    players.list[attacker].haptic([40, 30, 40]);
  });
  engine.on('clash', () => ui.callout(-1, 'CLASH'));
  engine.on('ringout', ({ loser }) => {
    if (state !== 'fight') return;
    state = 'ringout';
    pendingOut = { loser, t: 0 };
    ui.banner(loser === -1 ? 'DOUBLE SPLASH!' : 'RING OUT!', 'ringout', 1400);
    afterT = 0;
  });
  engine.on('splash', () => {
    if (state === 'ringout') resolveRingout();
  });

  // ───────────────────────────── pause / buttons / keys ─────────────────────────────
  const inRound = () => state === 'intro' || state === 'fight' || state === 'ringout';
  function setPaused(on, silent = false) {
    if (on && !inRound()) return;
    if (paused === on) return;
    paused = on;
    engine.setPaused(on);
    if (!silent) ui.showPause(on);
    else if (!on) ui.showPause(false);
    players.setKeysEnabled(!on && inRound());
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
  ui.on('restart', () => beginMatch());
  ui.on('rematch', () => beginMatch());
  ui.on('menu', toTitle);
  ui.on('exit', () => (inShell ? exemoo.exit() : (location.href = '/')));
  ui.on('lobbyBack', () => {
    players.stopPairing(0);
    players.stopPairing(1);
    toTitle();
  });
  ui.on('lobbyReady', beginMatch);
  ui.on('mute', toggleMute);

  function toggleMute() {
    muted = !muted;
    engine.audio.setMuted(muted);
    try {
      localStorage.setItem('bale-brawl.muted', muted ? '1' : '0');
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
    if (document.hidden && (state === 'fight' || state === 'intro')) setPaused(true);
  });
  exemoo.on('status', pushStatus);

  // ───────────────────────────── frame loop ─────────────────────────────
  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    if (!paused) {
      if (state === 'intro') introTick(dt);
      else if (state === 'fight') {
        if (match.tick(dt) === 'sudden') onSudden();
      } else if (state === 'ringout') {
        if (pendingOut) pendingOut.t += dt;
        if (!resolved && pendingOut && pendingOut.t > 2.5) resolveRingout(); // splash never came
        if (resolved) {
          afterT -= dt;
          if (afterT <= 0) {
            if (match.state === 'matchOver') showResults();
            else startRoundSequence();
          }
        }
      }
    }
    engine.update(dt);
    engine.render();
    if (inRound()) {
      const snap = engine.snapshot();
      ui.hud({
        names: cast.map((c) => c.name),
        colors: cast.map((c) => c.color),
        wins: match.wins,
        need: match.need,
        round: state === 'intro' ? nextRoundNo() : match.round,
        timeLeft: state === 'intro' ? MATCH.roundSeconds : match.timeLeft,
        sudden: match.state === 'sudden',
        edge: snap.fighters.map((f) => f.edge),
        guard: snap.fighters.map((f) => f.guard),
      });
    }
  }

  if (params.has('debug')) window.__bb = { engine, ui, players, get match() { return match; }, get state() { return state; }, get paused() { return paused; }, get cfg() { return cfg; }, usingStub };

  toTitle();
  boot(100);
  $('boot').classList.add('done');
  setTimeout(() => $('boot').remove(), 700);
  requestAnimationFrame(frame);
  if (usingStub) console.info('[bale-brawl] running on the STUB engine (js/engine.js not found or ?stub)');
}

main().catch(bootFail);
