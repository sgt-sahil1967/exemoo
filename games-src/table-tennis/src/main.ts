import './style.css';
import type { ControllerButton, Handedness, LinkStatus, PaddleInput, Settings, Side } from './core/contracts';
import { Stage } from './scene/stage';
import { UI } from './ui/ui';
import { Sfx } from './audio/sfx';
import { MouseInput } from './input/mouseInput';
import { PhoneInput } from './input/phoneInput';
import { PhoneLink } from './net/phoneLink';
import { SpinshotLink } from '../../../public/sdk/adapters.js';
import { inExemooShell } from '../../../public/sdk/exemoo.js';
import { Match } from './game/match';
import { CHALLENGES } from './game/challenges';
import { freshStats, loadSettings, loadStats, saveSettings, saveStats } from './game/store';

const params = new URLSearchParams(location.search);
const debug = params.has('debug');

let settings: Settings = loadSettings();
let stats = loadStats();

const stage = new Stage(document.getElementById('app')!, { quality: settings.quality, theme: settings.theme });
const ui = new UI(document.getElementById('ui')!, settings, stats, CHALLENGES);
const sfx = new Sfx();
const mouse = new MouseInput(document.body);
/** Inside Exemoo the shell already paired player 1's phone: use it instead of a PIN room of our own. */
const inShell = inExemooShell();
const link: PhoneLink = inShell ? (new SpinshotLink({ layout: 'swing', title: 'Table Tennis' }) as unknown as PhoneLink) : new PhoneLink();
/** Player 2's phone (2-player split screen) pairs through its own PIN room. */
const link2 = new PhoneLink({ storageKey: 'spinshot.room.p2' });
if (inShell) {
  // Player 2 opens the Exemoo pad straight into the paddle layout.
  link2.controllerUrl = async () => {
    const info = await fetch('/api/info').then((r) => r.json()).catch(() => null);
    const base = info?.padUrl || `${location.origin}/pad`;
    return `${base}?pin=${link2.pin}&layout=swing&title=${encodeURIComponent('Player 2')}`;
  };
}
let phone: PhoneInput | null = null;
let phone2: PhoneInput | null = null;
let hand2: Handedness = 'right';
let linkStarted = false;
let link2Started = false;
let calibrating = false;
let lastPairInfo = '';
const lastVersusInfo = ['', ''];

const P1_COLOR = '#ff6b4a';
const P2_COLOR = '#2ec4b6';

const phoneReady = () => !!phone && link.status === 'connected';
const phone2Ready = () => !!phone2 && link2.status === 'connected';
const input = (): PaddleInput => (phoneReady() ? phone! : mouse);
const input2 = (): PaddleInput | null => (phone2Ready() ? phone2 : null);
/** Sends to a side's phone if it is connected. */
const sendTo = (side: Side, msg: Parameters<PhoneLink['send']>[0]) => {
  if (side === 'player' ? phoneReady() : phone2Ready()) (side === 'player' ? link : link2).send(msg);
};
const sendBoth = (msg: Parameters<PhoneLink['send']>[0]) => {
  sendTo('player', msg);
  sendTo('opponent', msg);
};

const match = new Match({
  stage,
  ui,
  sfx,
  input,
  input2,
  hand2: () => hand2,
  settings: () => settings,
  stats: () => stats,
  saveStats: () => {
    saveStats(stats);
    ui.setStats(stats);
  },
  phone: (msg, side = 'player') => {
    if ('score' in msg) {
      const s = match.phoneScore(side);
      if (s) sendTo(side, { t: 'score', ...s });
    } else if ('power' in msg) sendTo('player', { t: 'power', ...match.phonePower() });
    else if ('sound' in msg) sendTo(side, { t: 'sound', name: msg.sound, q: msg.q });
    else sendTo(side, { t: 'screen', screen: msg.screen, label: msg.label });
  },
});

// ───────────────────────────── helpers ─────────────────────────────
function applySettings(s: Settings) {
  const prev = settings;
  settings = s;
  saveSettings(s);
  if (s.theme !== prev.theme) stage.setTheme(s.theme);
  if (s.quality !== prev.quality) stage.setQuality(s.quality);
  sfx.setVolumes(s.masterVolume, s.musicVolume, s.sfxVolume);
  phone?.setHandedness(s.handedness);
  phone?.setSensitivity(s.sensitivity);
}

function startDemo() {
  match.start({ mode: 'demo', difficulty: 'pro', gamesToWin: 1 });
  input().setSwingEnabled(false);
  phone2?.setSwingEnabled(false);
}

function toMenu(screen: 'main' | 'title' = 'main') {
  match.stop();
  ui.hud.show(false);
  ui.show(screen);
  startDemo();
  sfx.music('menu');
  sendBoth({ t: 'screen', screen: 'menu' });
  sendTo('player', { t: 'power', charges: -1, max: 0, active: false });
}

function setPaused(p: boolean) {
  if (!match.active || match.mode === 'demo') return;
  match.paused = p;
  input().setSwingEnabled(!p);
  if (match.versus) input2()?.setSwingEnabled(!p);
  sfx.muffleMusic(p);
  if (p) {
    ui.show('pause');
    sendBoth({ t: 'screen', screen: 'paused' });
  } else {
    ui.show('none');
    sendBoth({ t: 'screen', screen: 'rally' });
  }
}

function refreshPairing() {
  if (!linkStarted) return;
  link
    .controllerUrl()
    .then((url) => {
      const key = `${link.pin}|${url}|${link.status}|${link.transport}`;
      if (key === lastPairInfo) return;
      lastPairInfo = key;
      ui.setPairing({ pin: link.pin, url, status: link.status, transport: link.transport });
    })
    .catch(() => {});
}

function ensureLink() {
  if (linkStarted) return;
  linkStarted = true;
  link.start().catch((e) => ui.setPairing({ pin: '', url: '', status: 'error', transport: 'none', detail: String(e?.message ?? e) }));
}

function ensureLink2() {
  if (link2Started) return;
  link2Started = true;
  link2.start().catch((e) => ui.setVersusPairing(2, { pin: '', url: '', status: 'error', transport: 'none', detail: String(e?.message ?? e) }));
}

/** Both QR/PIN cards on the 2-player pairing screen. */
function refreshVersusPairing() {
  ([[1, link, linkStarted], [2, link2, link2Started]] as const).forEach(([slot, l, started]) => {
    if (!started) return;
    l.controllerUrl()
      .then((url) => {
        const key = `${l.pin}|${url}|${l.status}|${l.transport}`;
        if (key === lastVersusInfo[slot - 1]) return;
        lastVersusInfo[slot - 1] = key;
        ui.setVersusPairing(slot, { pin: l.pin, url, status: l.status, transport: l.transport });
      })
      .catch(() => {});
  });
}

// ───────────────────────────── phone link ─────────────────────────────
link.on('status', (s: LinkStatus, detail?: string) => {
  refreshPairing();
  refreshVersusPairing();
  if (detail) ui.setPairing({ pin: link.pin, url: '', status: s, transport: link.transport, detail });
  ui.setController(phoneReady() ? 'phone' : 'mouse', s);
  if (s === 'connected') {
    if (!phone) {
      phone = new PhoneInput(link, { handedness: settings.handedness, sensitivity: settings.sensitivity });
      phone.onButton((b) => onButton(b, 'player'));
      // The chip above was set before the input existed; the Exemoo link only reports "connected" once.
      ui.setController('phone', s);
    }
    match.bindInput();
    sfx.ui('select');
    ui.toast('Phone connected');
    if (ui.screen === 'pair' || ui.screen === 'title' || ui.screen === 'main') {
      calibrating = true;
      phone.beginCalibration();
      ui.show('calibrate');
      link.send({ t: 'screen', screen: 'calibrate', label: 'Hold your phone upright like a paddle, screen facing you' });
    }
    if (ui.screen === 'versus-pair') {
      phone.beginCalibration();
      link.send({ t: 'player', n: 1, color: P1_COLOR });
    } else link.send({ t: 'theme', color: P1_COLOR });
    sendTo('player', { t: 'power', ...match.phonePower() });
  } else if (s === 'disconnected' || s === 'waiting') {
    match.bindInput();
    if (match.active && match.mode !== 'demo' && !match.paused) {
      setPaused(true);
      ui.toast('Phone disconnected — reconnect or continue with mouse');
    }
  }
});

// Player 2's phone link.
link2.on('status', (s: LinkStatus) => {
  refreshVersusPairing();
  if (s === 'connected') {
    if (!phone2) {
      phone2 = new PhoneInput(link2, { handedness: hand2, sensitivity: settings.sensitivity });
      phone2.onButton((b) => onButton(b, 'opponent'));
    }
    phone2.beginCalibration();
    match.bindInput();
    sfx.ui('select');
    ui.toast('Player 2 connected');
    link2.send({ t: 'player', n: 2, color: P2_COLOR });
    link2.send({ t: 'power', charges: -1, max: 0, active: false });
    link2.send({ t: 'screen', screen: 'calibrate', label: 'Player 2 — hold your phone upright like a paddle' });
    // Player 1's phone (if any) gets its badge too once a 2-player game is being set up.
    if (phoneReady()) link.send({ t: 'player', n: 1, color: P1_COLOR });
  } else if (s === 'disconnected' || s === 'waiting') {
    match.bindInput();
    if (match.active && match.versus && !match.paused) {
      setPaused(true);
      ui.toast('Player 2 disconnected — waiting for their phone');
    }
  }
});
link2.on('message', (m) => {
  if (m.t === 'hello' && m.hand) hand2 = m.hand;
});

// ───────────────────────────── controller buttons ─────────────────────────────
function onButton(b: ControllerButton, from: Side = 'player') {
  sfx.unlock();
  const inMenu = ui.screen !== 'none';
  if (b === 'recenter') {
    (from === 'opponent' ? phone2 : input())?.recenter();
    ui.toast(from === 'opponent' ? 'Player 2 paddle recentered' : 'Paddle recentered');
    return;
  }
  if (b === 'power') {
    // Slow-mo is a single-player power-up; player 2's phone never shows the button.
    if (!inMenu && from === 'player') match.activatePower();
    return;
  }
  if (!inMenu) {
    if (b === 'pause' || b === 'back') setPaused(true);
    // Tap-to-hit fallback: the phone's big button is a swing; ◀ ▶ pick the side of the table to aim at.
    else if (b === 'action') match.tap(from);
    else if (b === 'left' || b === 'right') match.nudgeAim(from, b === 'left' ? -1 : 1);
    return;
  }
  switch (b) {
    case 'up':
    case 'down':
    case 'left':
    case 'right':
      ui.navigate(b);
      break;
    case 'action':
      ui.activate();
      break;
    case 'back':
      ui.back();
      break;
    case 'pause':
      if (ui.screen === 'pause') setPaused(false);
      else ui.back();
      break;
  }
}
mouse.onButton((b) => onButton(b, 'player'));

// ───────────────────────────── UI callbacks ─────────────────────────────
ui.onSound = (k) => sfx.ui(k);
ui.onPause = () => setPaused(true);
ui.onCalibrateDone = () => {
  calibrating = false;
  input().recenter();
  ui.show('main');
};
ui.onStart = (cfg) => {
  sfx.unlock();
  ui.show('none');
  // Let the click that started the match finish before swings count.
  setTimeout(() => {
    match.start(cfg);
    input().setSwingEnabled(true);
  }, 120);
};
ui.onSettings = (s) => applySettings(s);
ui.onResume = () => setPaused(false);
ui.onQuit = () => toMenu('main');
ui.onRestart = () => {
  const cfg = lastCfg;
  ui.show('none');
  if (cfg) setTimeout(() => match.start(cfg), 120);
};
ui.onRecenter = () => {
  input().recenter();
  ui.toast('Paddle recentered');
};
ui.onPair = () => {
  ensureLink();
  refreshPairing();
};
ui.onVersusPair = () => {
  ensureLink();
  ensureLink2();
  if (phoneReady()) link.send({ t: 'player', n: 1, color: P1_COLOR });
  lastVersusInfo[0] = lastVersusInfo[1] = '';
  refreshVersusPairing();
};
ui.onUseMouse = () => {
  ui.show('main');
  ui.toast('Mouse: click (or Space) when the ring turns green · move left/right to aim');
};
ui.onResetStats = () => {
  stats = freshStats();
  saveStats(stats);
  ui.setStats(stats);
};
let lastCfg: Parameters<typeof match.start>[0] | null = null;
const origStart = match.start.bind(match);
match.start = (cfg) => {
  if (cfg.mode !== 'demo') lastCfg = cfg;
  origStart(cfg);
};
match.onFinished = (r) => {
  ui.hud.show(false);
  ui.showResult(r);
  input().setSwingEnabled(false);
  phone2?.setSwingEnabled(false);
  sfx.music('menu');
  sendBoth({ t: 'screen', screen: 'result', label: r.title });
};

// ───────────────────────────── global input ─────────────────────────────
const unlockOnce = () => {
  sfx.unlock();
  sfx.setVolumes(settings.masterVolume, settings.musicVolume, settings.sfxVolume);
  sfx.music(match.active && match.mode !== 'demo' ? 'match' : 'menu');
  window.removeEventListener('pointerdown', unlockOnce);
  window.removeEventListener('keydown', unlockOnce);
};
window.addEventListener('pointerdown', unlockOnce);
window.addEventListener('keydown', unlockOnce);
document.addEventListener('visibilitychange', () => {
  if (document.hidden && !debug) setPaused(true);
});
window.addEventListener('beforeunload', () => {
  link.stop();
  link2.stop();
});

// ───────────────────────────── boot ─────────────────────────────
ui.setController('mouse', 'idle');
ui.show('title');
startDemo();
// Start pairing straight away so the PIN is ready by the time the player opens the pair screen.
ensureLink();

if (params.has('auto')) match.autoSwing = Number(params.get('auto')) || 0.05;
if (debug) {
  Object.assign(window, { match, stage, ui, sfx, link, link2, mouse });
  Object.defineProperty(window, 'phone', { get: () => phone });
}
if (params.has('play')) ui.onStart({ mode: (params.get('play') as 'match') || 'match', difficulty: settings.difficulty, gamesToWin: 1, challengeId: params.get('challenge') ?? undefined });

let last = performance.now();
let fpsEl: HTMLDivElement | null = null;
let frames = 0;
let fpsT = 0;
if (debug) {
  fpsEl = document.createElement('div');
  fpsEl.style.cssText = 'position:fixed;bottom:8px;right:8px;font:12px ui-monospace,monospace;color:#1d2333;z-index:99;background:#fff9;padding:4px 6px;border-radius:6px';
  document.body.appendChild(fpsEl);
}

function frame(now: number) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  mouse.update(dt);
  phone?.update(dt);
  phone2?.update(dt);

  // Calibration screen: live preview and auto-complete.
  if (ui.screen === 'calibrate' && phone) {
    ui.setCalibration(phone.calibration, phone.state);
    if (calibrating && phone.calibration >= 1) {
      calibrating = false;
      sfx.score(true);
      link.send({ t: 'haptic', pattern: [40, 60, 40] });
      setTimeout(() => ui.screen === 'calibrate' && ui.show('main'), 700);
    }
  }
  // Phone acts as an air pointer in menus.
  if (phoneReady() && ui.screen !== 'none' && ui.screen !== 'calibrate') {
    const st = phone!.state;
    ui.pointer((st.aimX + 1) / 2, (1 - st.aimY) / 2, true);
  } else ui.pointer(0, 0, false);

  match.update(dt);
  stage.update(dt, { ball: match.focusBall, player: match.focusPlayer, opponent: match.focusOpponent });
  stage.render();

  if (fpsEl) {
    frames++;
    fpsT += dt;
    if (fpsT > 0.5) {
      fpsEl.textContent = `${Math.round(frames / fpsT)} fps · ${link.status}/${link.transport}`;
      frames = 0;
      fpsT = 0;
    }
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

if (debug) {
  // Step the simulation manually (for testing while the tab is hidden and rAF is paused).
  Object.assign(window, {
    advance(sec: number, render = false) {
      const steps = Math.round(sec * 60);
      for (let i = 0; i < steps; i++) {
        mouse.update(1 / 60);
        phone?.update(1 / 60);
        phone2?.update(1 / 60);
        match.update(1 / 60);
        stage.update(1 / 60, { ball: match.focusBall, player: match.focusPlayer, opponent: match.focusOpponent });
      }
      if (render) stage.render();
    },
  });
}
