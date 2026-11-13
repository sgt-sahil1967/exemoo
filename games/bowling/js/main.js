// Moo Bowl: game loop and state machine. Ties together physics, world, input, UI, audio and rules
// (see ../CONTRACT.md) and talks to the Exemoo shell through /sdk/exemoo.js.
//
//   title -> address (aim, input armed) -> rolling (physics) -> call (result shown)
//         -> pinsetter (sweep or fresh rack) -> address ... -> results
import { LANE, THROW, PLAYERS, MPS_TO_MPH } from './constants.js';
import { BowlingGame } from './rules.js';

const $ = (id) => document.getElementById(id);
const boot = (pct, msg) => {
  $('bootBar').style.width = `${pct}%`;
  if (msg) $('bootMsg').textContent = msg;
};
const ALL_PINS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const HINTS = {
  'camera+phone': 'Move your hand to line up. Hold still, then swing back and through',
  camera: 'Move your hand to line up. Hold still, then swing back and through',
  phone: 'D-pad to line up. Hold the big button, swing, let go to bowl',
  mouse: 'Press, pull back and flick forward to bowl. Or arrows and Space',
};

// Set once the game state exists: true while a menu (title, results, pause) is up, for the gyro menu cursor.
let menuProbe = () => false;

async function loadSdk() {
  try {
    const { connectExemoo } = await import('/sdk/exemoo.js');
    return connectExemoo({ layout: 'remote', title: 'Moo Bowl', menuCursor: () => menuProbe() });
  } catch {
    // Opened outside the Exemoo server: mouse and keyboard only.
    const off = () => () => {};
    return { inShell: false, phone: { connected: false }, on: off, held: () => false, setLayout() {}, setStream() {}, haptic() {}, send() {}, setCamera() {}, exit() {}, nav: () => false };
  }
}

async function main() {
  boot(10, 'Loading the alley...');
  const [physicsMod, worldMod, inputMod, uiMod, audioMod, rapierMod, exemoo] = await Promise.all([
    import('./physics.js'),
    import('./world.js'),
    import('./input.js'),
    import('./ui.js'),
    import('./audio.js'),
    import('../vendor/rapier3d-compat.js'),
    loadSdk(),
  ]);
  boot(45, 'Waxing the lane...');
  const canvas = $('scene');
  const RAPIER = rapierMod.default ?? rapierMod;
  const [physics, world] = await Promise.all([physicsMod.createPhysics({ RAPIER }), worldMod.createWorld({ canvas })]);
  boot(85, 'Setting the pins...');
  const audio = audioMod.createAudio();
  const ui = uiMod.createUI({ root: document.body });
  const input = inputMod.createInput({ exemoo, canvas });

  // ───────────────────────────── state ─────────────────────────────
  let state = 'title'; // title | address | rolling | call | pinsetter | results
  let paused = false;
  menuProbe = () => state === 'title' || state === 'results' || paused;
  let game = null;
  let config = { players: 1, hand: 'right' };
  let stateT = 0; // seconds in the current state
  let lastPlayer = -1;
  let status = { camera: false, phone: false, source: 'mouse' };
  let cameraOn = false;
  let roll = null; // facts about the ball being rolled: { gutter, hits, firstHit }
  let guideKey = '';
  let token = 0; // bumps on restart / exit so stale async steps stop

  const playerInfo = (i) => ({ name: config.players === 1 ? 'You' : PLAYERS[i].name, color: PLAYERS[i].color });
  const setState = (s) => {
    state = s;
    stateT = 0;
  };
  const wait = (s) => new Promise((r) => setTimeout(r, s * 1000));

  function padLayout() {
    // Menus: remote (GO / d-pad). Bowling: swing (motion stream + hold button).
    const menu = state === 'title' || state === 'results' || paused;
    exemoo.setLayout(menu ? 'remote' : 'swing', 'Moo Bowl');
  }
  function pushStatus() {
    ui.setStatus({ camera: status.camera || cameraOn, phone: status.phone || !!exemoo.phone?.connected, source: status.source, muted: audio.muted });
  }

  // ───────────────────────────── overhead monitor ─────────────────────────────
  function drawMonitor() {
    const cv = world.monitorCanvas;
    if (!cv) return;
    const g = cv.getContext('2d'), W = cv.width, H = cv.height;
    g.fillStyle = '#10102a';
    g.fillRect(0, 0, W, H);
    g.textBaseline = 'middle';
    if (!game) {
      g.fillStyle = '#ffd21f';
      g.textAlign = 'center';
      g.font = `400 ${H * 0.34}px 'Lilita One', sans-serif`;
      g.fillText('MOO BOWL', W / 2, H * 0.45);
      g.fillStyle = '#fff';
      g.font = `800 ${H * 0.09}px 'Baloo 2', sans-serif`;
      g.fillText('Lane 7', W / 2, H * 0.78);
      return world.monitorChanged();
    }
    const n = config.players, cur = game.current;
    const rowH = Math.min(H * 0.3, (H - 30) / n), top = (H - rowH * n) / 2;
    const nameW = W * 0.16, totalW = W * 0.11, fw = (W - nameW - totalW - 24) / 10.5;
    for (let p = 0; p < n; p++) {
      const y = top + p * rowH, sheet = game.sheet(p), info = playerInfo(p);
      const active = cur && cur.player === p;
      g.fillStyle = active ? '#26265a' : '#18183a';
      g.fillRect(8, y + 3, W - 16, rowH - 6);
      g.fillStyle = info.color;
      g.fillRect(8, y + 3, 10, rowH - 6);
      g.textAlign = 'left';
      g.font = `400 ${rowH * 0.36}px 'Lilita One', sans-serif`;
      g.fillText(info.name, 28, y + rowH / 2);
      let x = nameW + 12;
      for (let f = 0; f < 10; f++) {
        const w = f === 9 ? fw * 1.5 : fw, fr = sheet.frames[f];
        g.strokeStyle = active && cur.frame === f ? '#ffd21f' : '#4a4a86';
        g.lineWidth = active && cur.frame === f ? 4 : 2;
        g.strokeRect(x + 2, y + 8, w - 4, rowH - 16);
        g.fillStyle = '#fff';
        g.textAlign = 'center';
        g.font = `800 ${rowH * 0.24}px 'Baloo 2', sans-serif`;
        g.fillText((fr.symbols || []).join(' '), x + w / 2, y + rowH * 0.32);
        g.fillStyle = '#ffd21f';
        g.font = `400 ${rowH * 0.3}px 'Lilita One', sans-serif`;
        if (fr.cumulative != null) g.fillText(String(fr.cumulative), x + w / 2, y + rowH * 0.68);
        x += w;
      }
      g.fillStyle = '#fff';
      g.textAlign = 'right';
      g.font = `400 ${rowH * 0.46}px 'Lilita One', sans-serif`;
      g.fillText(String(sheet.total), W - 20, y + rowH / 2);
    }
    world.monitorChanged();
  }

  // ───────────────────────────── flow ─────────────────────────────
  function toTitle() {
    token++;
    game = null;
    paused = false;
    setState('title');
    input.disarm();
    physics.resetPins();
    world.syncPins(physics.pins);
    world.syncBall(physics.ball);
    world.setHeldBall({ visible: false, x: 0, swing: 0, player: 0 });
    world.setAim({ visible: false, x: 0, angle: 0, path: [] });
    world.setCamera('title');
    ui.showPause(false);
    ui.hideResults();
    ui.hint(null);
    ui.throwStats(null);
    ui.meter({ visible: false, power: 0, aim: 0, curve: 0 });
    ui.showTitle();
    audio.music('title');
    audio.ambience(true);
    audio.roll({ active: false, speed: 0, x: 0, z: 0, gutter: false });
    input.handcam?.setVisible(false);
    drawMonitor();
    padLayout();
    pushStatus();
  }

  function startGame(cfg) {
    token++;
    config = { players: Math.max(1, Math.min(4, cfg?.players | 0 || 1)), hand: cfg?.hand === 'left' ? 'left' : 'right' };
    game = new BowlingGame(config.players);
    lastPlayer = -1;
    paused = false;
    input.setHand(config.hand);
    physics.resetPins();
    world.syncPins(physics.pins);
    world.syncBall(physics.ball);
    ui.hideTitle();
    ui.hideResults();
    ui.showPause(false);
    audio.unlock();
    audio.ui('start');
    audio.music('game');
    audio.ambience(true);
    // The game is built around the camera: ask the shell for it if it is not on yet.
    if (exemoo.inShell && !cameraOn) exemoo.setCamera(true);
    beginBall();
  }

  function beginBall() {
    const cur = game.current;
    if (!cur) return showResults();
    setState('address');
    const info = playerInfo(cur.player);
    world.setBallPlayer(cur.player);
    world.setCamera('address', { x: 0 });
    ui.setTurn({ player: cur.player, frame: cur.frame, ball: cur.ball, name: info.name, color: info.color });
    ui.setSheets(game, cur.player);
    ui.setPinDeck(cur.standingBefore);
    ui.throwStats(null);
    if (cur.player !== lastPlayer && config.players > 1) ui.callout(`${info.name}'s turn`, 'info');
    lastPlayer = cur.player;
    guideKey = '';
    input.arm();
    input.handcam?.setVisible(true);
    ui.hint(HINTS[status.source] || HINTS.mouse);
    drawMonitor();
    padLayout();
  }

  function onThrow(t) {
    if (state !== 'address' || paused) return;
    const speed = Math.max(THROW.minSpeed, Math.min(THROW.maxSpeed, +t.speed || THROW.typicalSpeed));
    const x = Math.max(-THROW.maxX, Math.min(THROW.maxX, +t.x || 0));
    const angle = Math.max(-THROW.maxAngle, Math.min(THROW.maxAngle, +t.angle || 0));
    const curve = Math.max(-1, Math.min(1, +t.curve || 0));
    setState('rolling');
    roll = { gutter: false, hits: 0, firstHit: false };
    physics.throwBall({ x, angle, speed, curve });
    world.setHeldBall({ visible: false, x, swing: 1, player: game.current.player });
    world.setAim({ visible: false, x, angle, path: [] });
    world.setCamera('follow');
    audio.release(speed);
    exemoo.haptic(35);
    ui.hint(null);
    ui.meter({ visible: false, power: 0, aim: 0, curve: 0 });
    // Boards are counted from the bowling-hand side, as bowlers do.
    const bw = LANE.width / LANE.boards;
    const fromRight = Math.max(1, Math.min(LANE.boards, Math.ceil((LANE.halfWidth - x) / bw)));
    ui.throwStats({ speedMph: speed * MPS_TO_MPH, curve, board: config.hand === 'left' ? LANE.boards + 1 - fromRight : fromRight });
  }

  function handleEvents() {
    for (const e of physics.drainEvents()) {
      const s = e.strength ?? 0.5;
      switch (e.type) {
        case 'ballPin':
          audio.pinHit(s, e.x);
          world.impact({ x: e.x, y: e.y, z: e.z, strength: s });
          if (roll && !roll.firstHit) {
            roll.firstHit = true;
            exemoo.haptic(70);
          }
          if (roll) roll.hits++;
          break;
        case 'pinPin':
        case 'pinWall':
          audio.pinClack(s, e.x);
          if (s > 0.55) world.impact({ x: e.x, y: e.y, z: e.z, strength: s * 0.5 });
          break;
        case 'pinFloor':
          audio.pinFloor(s);
          break;
        case 'ballGutter':
          audio.gutter();
          if (roll) roll.gutter = true;
          break;
        case 'ballPit':
          audio.ballPit();
          break;
        case 'pinDown':
          ui.setPinDeck(physics.standing());
          break;
      }
    }
  }

  async function onSettled() {
    const my = token;
    const standing = physics.standing();
    const r = game.roll(standing);
    setState('call');
    audio.roll({ active: false, speed: 0, x: 0, z: -19, gutter: false });
    ui.setSheets(game, r.player);
    ui.setPinDeck(standing);
    drawMonitor();

    const perfect = game.sheet(r.player).frames[9].cumulative === 300;
    if (r.mark === 'strike') {
      const turkey = r.streak >= 3;
      const text = perfect ? 'PERFECT GAME!' : r.streak === 3 ? 'TURKEY!' : r.streak > 3 ? `${r.streak} IN A ROW!` : r.streak === 2 ? 'DOUBLE!' : 'STRIKE!';
      ui.callout(text, turkey ? 'turkey' : 'strike');
      audio.call(turkey ? 'turkey' : 'strike');
      audio.crowd('cheer');
      world.celebrate(turkey ? 'turkey' : 'strike');
      exemoo.haptic(turkey ? [90, 50, 90, 50, 90, 50, 220] : [90, 50, 90, 50, 180]);
    } else if (r.mark === 'spare') {
      ui.callout('SPARE!', 'spare');
      audio.call('spare');
      audio.crowd('clap');
      world.celebrate('spare');
      exemoo.haptic([70, 40, 120]);
    } else if (r.count === 0) {
      const gutter = !!roll?.gutter;
      ui.callout(gutter ? 'GUTTER BALL' : 'MISS', 'gutter');
      audio.call('gutter');
      audio.crowd('aww');
      world.celebrate('gutter');
    } else if (r.isSplit || r.mark === 'split') {
      ui.callout('SPLIT!', 'split');
      audio.call('split');
      world.celebrate('split');
    } else {
      ui.callout(r.count === 1 ? '1 PIN' : `${r.count} PINS`, 'info');
      audio.call('open');
      if (r.count >= 8) audio.crowd('clap');
    }

    await wait(1.5);
    if (my !== token) return;
    setState('pinsetter');
    world.setCamera('pins');
    world.syncBall({ present: false });
    const fresh = r.resetPins || r.gameDone || standing.length === 0;
    if (fresh) audio.rack();
    else audio.sweep();
    await world.pinsetter(fresh ? 'rack' : 'sweep', { standing: fresh ? ALL_PINS : standing });
    if (my !== token) return;
    physics.resetPins(fresh ? ALL_PINS : standing);
    world.syncPins(physics.pins);
    world.syncBall(physics.ball);
    if (game.over) showResults();
    else beginBall();
  }

  function showResults() {
    setState('results');
    input.disarm();
    input.handcam?.setVisible(false);
    world.setCamera('results');
    world.setHeldBall({ visible: false, x: 0, swing: 0, player: 0 });
    world.setAim({ visible: false, x: 0, angle: 0, path: [] });
    ui.hint(null);
    ui.throwStats(null);
    const players = Array.from({ length: config.players }, (_, i) => playerInfo(i));
    ui.showResults(game, players);
    audio.music('results');
    audio.crowd('cheer');
    world.celebrate('strike');
    drawMonitor();
    padLayout();
  }

  function setPaused(on) {
    if (state === 'title' || state === 'results') return;
    if (paused === on) return;
    paused = on;
    ui.showPause(on);
    audio.ui(on ? 'back' : 'select');
    if (on) {
      input.disarm();
      audio.roll({ active: false, speed: 0, x: 0, z: 0, gutter: false });
    } else if (state === 'address') input.arm();
    padLayout();
  }

  // ───────────────────────────── wiring ─────────────────────────────
  input.on('throw', onThrow);
  input.on('status', (s) => {
    const before = status.source;
    status = { ...status, ...s };
    if (state === 'address' && before !== status.source) ui.hint(HINTS[status.source] || HINTS.mouse);
    pushStatus();
  });
  ui.on('start', startGame);
  ui.on('pause', () => setPaused(true));
  ui.on('resume', () => setPaused(false));
  ui.on('restart', () => startGame(config));
  ui.on('exit', toTitle);
  ui.on('continue', toTitle);
  ui.on('camera', () => {
    audio.ui('select');
    if (exemoo.inShell) exemoo.setCamera(!cameraOn);
    else ui.callout('Open from Exemoo to use the camera', 'info');
  });
  ui.on('mute', () => {
    audio.setMuted(!audio.muted);
    pushStatus();
  });
  exemoo.on('camera', (on) => {
    cameraOn = !!on;
    pushStatus();
  });
  exemoo.on('pose', () => {
    if (!cameraOn) {
      cameraOn = true;
      pushStatus();
    }
  });
  exemoo.on('status', pushStatus);
  exemoo.on('button', (b) => {
    audio.unlock();
    if (ui.nav(b)) return audio.ui(b === 'action' ? 'select' : 'move');
    if (b === 'pause') setPaused(!paused);
    else if (b === 'back' && paused) setPaused(false);
  });
  const unlock = () => {
    audio.unlock();
    if (state === 'title') audio.music('title');
  };
  addEventListener('pointerdown', unlock, { capture: true });
  addEventListener('keydown', unlock, { capture: true });
  addEventListener('resize', () => world.resize());
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && (state === 'address' || state === 'rolling')) setPaused(true);
  });

  // ───────────────────────────── frame loop ─────────────────────────────
  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    if (!paused) {
      stateT += dt;
      input.update(dt);
      if (state === 'address') {
        const a = input.aim, cur = game.current;
        world.setHeldBall({ visible: true, x: a.x, swing: a.swing, player: cur.player });
        world.setCamera('address', { x: a.x });
        const m = input.meter;
        const curve = m?.visible ? m.curve : 0;
        const key = `${a.x.toFixed(3)}|${a.angle.toFixed(4)}|${curve.toFixed(2)}`;
        if (key !== guideKey) {
          guideKey = key;
          world.setAim({ visible: true, x: a.x, angle: a.angle, path: physics.predictPath({ x: a.x, angle: a.angle, speed: THROW.typicalSpeed, curve }) });
        }
        if (m) ui.meter(m);
      } else if (state === 'rolling') {
        physics.step(dt);
        handleEvents();
        world.syncPins(physics.pins);
        world.syncBall(physics.ball);
        const b = physics.ball;
        const rolling = b.present && (b.state === 'lane' || b.state === 'gutter');
        audio.roll({ active: rolling, speed: b.speed || 0, x: b.x, z: b.z, gutter: b.state === 'gutter' });
        if ((physics.settled && stateT > 0.4) || stateT > 16) onSettled();
      } else if (state === 'call') {
        // Let the last pins wobble and roll while the result is on screen.
        physics.step(dt);
        handleEvents();
        world.syncPins(physics.pins);
        world.syncBall(physics.ball);
      }
    }
    world.update(paused ? 0 : dt);
    world.render();
  }

  // Debug handle for tuning from the console (not used by the game).
  window.mooBowl = {
    physics, world, input, ui, audio,
    get state() { return state; },
    get game() { return game; },
    throw: (t = {}) => onThrow({ x: 0.14, angle: -0.03, speed: THROW.typicalSpeed, curve: -0.5, ...t }),
    start: (cfg) => startGame(cfg),
  };

  toTitle();
  try {
    await document.fonts?.ready;
  } catch {
    /* fonts are optional */
  }
  drawMonitor();
  boot(100);
  $('boot').classList.add('done');
  requestAnimationFrame(frame);
}

main().catch((e) => {
  console.error('[moo bowl] failed to start', e);
  $('boot').classList.add('error');
  $('bootMsg').textContent = `Moo Bowl could not start: ${e?.message || e}`;
});
