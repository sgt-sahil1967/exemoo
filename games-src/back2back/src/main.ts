/**
 * Back2Back: a two-player co-op racer and shooter for one screen and two phones.
 *   Player 1 (Driver) tilts their phone to steer; GAS / BRAKE / ITEM (nitro).
 *   Player 2 (Shooter) points their phone at the screen to aim; hold Action to fire.
 * One shared hull. Upgrades (Engine, Armor, Rapid, Spread) are collected on the road. Difficulty ramps
 * up every 25 s (curves, traffic, raider fire rate, speed).
 *
 * Phones: see phones.ts. Screen: canvas (render.ts) + DOM menus/HUD (ui.ts). Rules: sim.ts.
 */
import { Game, type DriveIn, type AimIn, type GameEvent } from './sim';
import { Stage } from './stage';
import { Phones, type Who } from './phones';
import { createUI, upgradeName } from './ui';
import { zoneAt } from './track';
import { loadSettings, saveSettings, step as stepSetting, DEFAULTS, crosshairSvg, type Settings, type Key } from './settings';
import './style.css';

type State = 'title' | 'pairing' | 'countdown' | 'play' | 'paused' | 'over';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const game = new Game();
const stage = new Stage(canvas, game);
const phones = new Phones();
const ui = createUI(document.getElementById('overlay') as HTMLElement, document.getElementById('hud') as HTMLElement);

const BEST_KEY = 'back2back.best';
const ATTRACT_DRIVE = (t: number): DriveIn => ({ steer: Math.sin(t * 0.6) * 0.35, gas: true, brake: false, nitro: false, drift: false });
const NO_AIM: AimIn = { rx: 0.5, ry: 0.56, fire: false };

let state: State = 'title';

// ───────────── settings ─────────────
const settings: Settings = loadSettings();
let settingsBack: (() => void) | null = null;

function applySettings(): void {
  stage.shakeScale = settings.shake === 'off' ? 0 : settings.shake === 'low' ? 0.4 : 1;
  stage.setQuality(settings.quality);
  buildCrosshair();
}

/** Input after sensitivity: the shooter's aim is stretched about the centre, the driver's steering scaled. */
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
function driveIn(): DriveIn {
  const d = phones.driveInput();
  return { ...d, steer: Math.max(-1, Math.min(1, d.steer * settings.steerSens)) };
}
function aimIn(): AimIn {
  const a = phones.aimInput();
  return { rx: clamp01(0.5 + (a.rx - 0.5) * settings.aimSens), ry: clamp01(0.56 + (a.ry - 0.56) * settings.aimSens), fire: a.fire };
}

function openSettings(back: () => void, focus?: string): void {
  settingsBack = back;
  ui.showSettings({
    s: settings,
    focus,
    onStep: (key: Key, dir: 1 | -1) => {
      stepSetting(settings, key, dir);
      saveSettings(settings);
      applySettings();
      openSettings(back, `button[data-k="${key}"][data-d="${dir}"]`);
    },
    onReset: () => {
      Object.assign(settings, DEFAULTS);
      saveSettings(settings);
      applySettings();
      openSettings(back, '#bReset');
    },
    onBack: () => {
      settingsBack = null;
      back();
    },
  });
}
let countdown = 0;
let countdownShown = -1;
let last = performance.now();
let bestRun = 0;
try {
  bestRun = Number(localStorage.getItem(BEST_KEY)) || 0;
} catch {
  /* no storage */
}

// ───────────── screen ─────────────
window.addEventListener('resize', () => stage.resize());
stage.onZone((z, i) => {
  if (state === 'play' && i > 0) {
    ui.toast(`Zone ${i + 1}: ${z.name}`, '#ffffff');
    stage.cine.play('zone', { caption: z.name, sub: `Zone ${i + 1}` });
  }
});

// ───────────── sound (tiny synth; silent if audio is unavailable) ─────────────
let audio: AudioContext | null = null;
function unlockAudio(): void {
  if (audio) return;
  try {
    audio = new AudioContext();
  } catch {
    audio = null;
  }
}
window.addEventListener('pointerdown', unlockAudio, { once: false });
window.addEventListener('keydown', unlockAudio);

function tone(freq: number, dur: number, type: OscillatorType = 'square', vol = 0.05, slide = 0): void {
  if (!audio) return;
  try {
    const o = audio.createOscillator();
    const g = audio.createGain();
    o.type = type;
    o.frequency.value = freq;
    if (slide) o.frequency.linearRampToValueAtTime(freq + slide, audio.currentTime + dur);
    g.gain.value = vol * settings.volume * 1.4;
    g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + dur);
    o.connect(g).connect(audio.destination);
    o.start();
    o.stop(audio.currentTime + dur);
  } catch {
    /* ignore */
  }
}
// Engine: a low saw through a lowpass, pitched by gear + rpm, louder on the throttle.
let engine: { osc: OscillatorNode; osc2: OscillatorNode; gain: GainNode; lp: BiquadFilterNode } | null = null;
function engineTick(on: boolean, gear: number, rpm: number, gas: boolean, speed: number): void {
  if (!audio) return;
  try {
    if (!engine) {
      const osc = audio.createOscillator();
      const osc2 = audio.createOscillator();
      const gain = audio.createGain();
      const lp = audio.createBiquadFilter();
      osc.type = 'sawtooth';
      osc2.type = 'square';
      lp.type = 'lowpass';
      lp.frequency.value = 500;
      gain.gain.value = 0;
      osc.connect(lp);
      osc2.connect(lp);
      lp.connect(gain).connect(audio.destination);
      osc.start();
      osc2.start();
      engine = { osc, osc2, gain, lp };
    }
    const f = 38 + gear * 6 + rpm * 70 + speed * 0.25;
    const now = audio.currentTime;
    engine.osc.frequency.setTargetAtTime(f, now, 0.05);
    engine.osc2.frequency.setTargetAtTime(f * 0.5, now, 0.05);
    engine.lp.frequency.setTargetAtTime(280 + rpm * 500 + (gas ? 350 : 0), now, 0.08);
    engine.gain.gain.setTargetAtTime(on && settings.engine ? (gas ? 0.035 : 0.014) * settings.volume * 1.4 : 0, now, 0.1);
  } catch {
    /* ignore */
  }
}

const SFX: Record<string, () => void> = {
  shift: () => tone(150, 0.07, 'square', 0.025, -60),
  shot: () => tone(880, 0.05, 'square', 0.03, -300),
  hit: () => tone(520, 0.08, 'triangle', 0.06),
  kill: () => tone(330, 0.25, 'sawtooth', 0.05, 500),
  hurt: () => tone(160, 0.3, 'sawtooth', 0.09, -90),
  pickup: () => {
    tone(660, 0.1, 'triangle', 0.07);
    setTimeout(() => tone(880, 0.12, 'triangle', 0.07), 90);
  },
  nitro: () => tone(220, 0.4, 'sawtooth', 0.05, 440),
  go: () => tone(990, 0.3, 'square', 0.05),
  beep: () => tone(660, 0.12, 'square', 0.05),
  over: () => tone(240, 0.8, 'sawtooth', 0.07, -180),
};

// ───────────── state flow ─────────────
function setState(s: State): void {
  state = s;
}

function gotoTitle(): void {
  setState('title');
  resultsIn = 0;
  stage.stormReset();
  stage.cine.skip();
  game.reset();
  phones.setMode('menu');
  ui.hudShow(false);
  showTitleScreen();
}

function showTitleScreen(focus?: string): void {
  settingsBack = null;
  ui.showTitle({
    best: bestRun,
    onPlay: gotoPairing,
    onHow: () => {
      ui.showHow({ onBack: () => showTitleScreen('#bHow') });
    },
    onSettings: () => openSettings(() => showTitleScreen('#bSet')),
    onExit: phones.inShell ? quit : undefined,
  });
  if (focus) document.querySelector<HTMLButtonElement>(focus)?.focus();
}

function gotoPairing(): void {
  setState('pairing');
  phones.setMode('menu');
  ui.hudShow(false);
  refreshPairing();
}

function refreshPairing(): void {
  if (state !== 'pairing') return;
  const inShell = phones.inShell;
  ui.showPairing({
    driver: {
      label: inShell ? 'Player 1 · Driver (your Exemoo phone)' : 'Player 1 · Driver',
      sub: phones.driver.connected ? 'Tilt to steer · ITEM = nitro' : inShell ? 'Connect your phone in the Exemoo menu, or drive with the keyboard' : 'Scan to drive · or use the keyboard',
      connected: phones.driver.connected,
      pin: inShell ? '' : phones.driver.pin,
      qrSrc: inShell ? '' : qr(phones.padUrl('driver')),
      color: '#ff3b30',
    },
    shooter: {
      label: 'Player 2 · Shooter',
      sub: phones.shooter.connected ? 'Point to aim · hold Action to fire' : 'Scan with a second phone · or use the mouse',
      connected: phones.shooter.connected,
      pin: phones.shooter.pin,
      qrSrc: qr(phones.padUrl('shooter')),
      color: '#2f7cff',
    },
    onStart: startCountdown,
    onBack: gotoTitle,
  });
  ui.focusFirst();
}

const qr = (url: string) => (url ? `/api/qr?text=${encodeURIComponent(url)}` : '');

function startCountdown(): void {
  game.reset();
  resultsIn = 0;
  stage.stormReset();
  stage.cine.skip();
  stage.cine.play('intro', {});
  setState('countdown');
  countdown = 3.4;
  countdownShown = -1;
  phones.setMode('play');
  ui.hudShow(true);
}

function resume(): void {
  setState('play');
  ui.hideOverlay();
  phones.setMode('play');
}

function showPauseScreen(): void {
  ui.showPause({ onResume: resume, onRestart: startCountdown, onQuit: quit, onSettings: () => openSettings(() => showPauseScreen()) });
  ui.focusFirst();
}

function togglePause(): void {
  if (settingsBack) {
    settingsBack();
    return;
  }
  if (state === 'play') {
    setState('paused');
    phones.setMode('menu');
    ui.showPause({ onResume: resume, onRestart: startCountdown, onQuit: quit, onSettings: () => openSettings(() => showPauseScreen()) });
    ui.focusFirst();
  } else if (state === 'paused') {
    resume();
  }
}

let resultsIn = 0;

function finish(): void {
  setState('over');
  phones.setMode('menu');
  if (game.overBy === 'storm') {
    stage.startStormEnd();
    resultsIn = 4.6;
    ui.toast('THE STORM GOT YOU!', '#9b4dff');
  } else {
    stage.cine.play('crash', {});
    showResults();
  }
}

function showResults(): void {
  document.getElementById('toast')?.classList.remove('show');
  const isBest = game.D > bestRun;
  if (isBest) {
    bestRun = game.D;
    try {
      localStorage.setItem(BEST_KEY, String(Math.round(bestRun)));
    } catch {
      /* no storage */
    }
  }
  const accuracy = game.shots ? Math.round((game.shotHits / game.shots) * 100) : 0;
  ui.showResults({
    dist: game.D,
    score: game.score,
    kills: game.kills,
    accuracy,
    level: game.level,
    best: bestRun,
    isBest,
    storm: game.overBy === 'storm',
    onAgain: startCountdown,
    onQuit: gotoTitle,
  });
  ui.focusFirst();
}

function quit(): void {
  if (phones.inShell) phones.sdk.exit();
  else gotoTitle();
}

// ───────────── phone buttons ─────────────
phones.onButton = (who: Who, b: string) => {
  if (who === 'shooter' && b === 'recenter') phones.shooter.aim.recenter();
  if (state === 'play') {
    if (b === 'pause') togglePause();
    return;
  }
  if (state === 'paused' && b === 'pause') return resume();
  if (state === 'countdown') return;
  phones.nav(b);
};
phones.onChange = () => refreshPairingIfNeeded();
function refreshPairingIfNeeded(): void {
  if (state === 'pairing') refreshPairing();
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyP' || e.code === 'Escape') {
    if (state === 'play' || state === 'paused') togglePause();
    else if (settingsBack) settingsBack();
  }
});

// ───────────── events → sound, haptics, toasts ─────────────
function handleEvents(events: GameEvent[]): void {
  for (const e of events) {
    switch (e.k) {
      case 'shot':
        SFX.shot();
        break;
      case 'hit':
        SFX.hit();
        phones.haptic('shooter', 10);
        break;
      case 'kill':
        SFX.kill();
        phones.haptic('shooter', 25);
        break;
      case 'hurt':
        SFX.hurt();
        phones.haptic('driver', [60, 40, 60]);
        phones.haptic('shooter', 40);
        break;
      case 'pickup':
        SFX.pickup();
        ui.toast(e.u === 'shield' ? 'Shield!' : e.u === 'repair' ? 'Repaired!' : `${upgradeName(e.u)} up!`, e.u === 'armor' || e.u === 'shield' ? '#2f7cff' : '#ffd21f');
        break;
      case 'combo':
        ui.toast(`COMBO ×${e.mult}!`, '#ff3b30');
        SFX.pickup();
        break;
      case 'boss':
        if (e.phase === 'spawn') {
          const village = e.style === 'village';
          ui.toast(village ? 'BOSS: Village Uprising!' : 'BOSS: Mega Harvester!', '#ff3b30');
          stage.cine.play('boss', { caption: village ? 'VILLAGE UPRISING' : 'MEGA HARVESTER', sub: village ? 'Break the gate, topple the chief' : 'Zone boss' });
        } else {
          stage.cine.play('bossDown', { caption: e.style === 'village' ? 'VILLAGE FALLS' : 'BOSS DOWN', sub: 'Nice shooting!' });
          ui.toast('Boss down!', '#ffd21f');
          phones.haptic('shooter', [30, 30, 80]);
          phones.haptic('driver', [30, 30, 80]);
        }
        break;
      case 'shift':
        SFX.shift();
        break;
      case 'drift':
        if (e.phase === 'boost') {
          ui.toast(['', 'Mini boost!', 'Super boost!', 'ULTRA boost!'][e.tier], '#ffd21f');
          SFX.nitro();
          phones.haptic('driver', 25);
        } else if (e.phase === 'tier') {
          tone(500 + e.tier * 180, 0.06, 'square', 0.04);
          phones.haptic('driver', 8);
        }
        break;
      case 'pad':
        ui.toast('BOOST!', '#ffd21f');
        SFX.nitro();
        break;
      case 'jump':
        ui.toast('Air time!', '#ffffff');
        tone(300, 0.3, 'triangle', 0.06, 500);
        break;
      case 'land':
        tone(120, 0.15, 'sawtooth', 0.07, -60);
        phones.haptic('driver', 30);
        break;
      case 'near':
        ui.toast(e.air ? 'Sky clear! +60' : 'Close call! +30', '#2fc65a');
        tone(1100, 0.05, 'square', 0.03);
        break;
      case 'overheat':
        ui.toast('OVERHEAT!', '#ff3b30');
        SFX.hurt();
        phones.haptic('shooter', [80, 40, 80]);
        break;
      case 'spin':
        ui.toast('Spun out on the verge!', '#ff8a00');
        SFX.hurt();
        phones.haptic('driver', [40, 30, 40]);
        break;
      case 'air':
        ui.toast(e.kind === 'bomber' ? 'Bomber overhead!' : 'Drone!', '#4fd0ff');
        tone(700, 0.2, 'triangle', 0.05, -200);
        break;
      case 'slip':
        ui.toast('Oil slick!', '#9b4dff');
        break;
      case 'nitro':
        SFX.nitro();
        phones.haptic('driver', 20);
        break;
      case 'storm':
        ui.toast('LIGHTNING! Keep moving!', '#9b4dff');
        phones.haptic('driver', [60, 30, 60]);
        SFX.over();
        break;
      case 'ambush':
        ui.toast('Free hit from the guards!', '#ff3b30');
        phones.haptic('driver', [50, 20, 50]);
        break;
      case 'escaped':
        ui.toast('Through the village!', '#ffffff');
        break;
      case 'over':
        SFX.over();
        break;
    }
  }
}

// ───────────── crosshair (DOM, over the 3D view) ─────────────
const xh = document.createElement('div');
xh.id = 'xhair';
document.body.append(xh);
let xhRing: SVGCircleElement | null = null;
function buildCrosshair(): void {
  xh.innerHTML = crosshairSvg(settings.crosshairStyle, settings.crosshairColor);
  xh.style.setProperty('--xh', `${Math.round(44 * settings.crosshairSize)}px`);
  xhRing = xh.querySelector('#xhRing') as SVGCircleElement | null;
}
applySettings();
function crosshair(rx: number, ry: number, ready: number, on: boolean): void {
  xh.style.display = on ? 'block' : 'none';
  xh.style.transform = `translate(${rx * innerWidth}px, ${ry * innerHeight}px)`;
  if (xhRing) xhRing.style.strokeDashoffset = String(163.4 * (1 - Math.max(0, Math.min(1, ready))));
}

// ───────────── loop ─────────────
function frame(now: number): void {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  const t = now / 1000;

  if (state === 'countdown') {
    countdown -= dt;
    const n = Math.ceil(countdown - 0.4);
    if (n !== countdownShown && countdown > 0.4) {
      countdownShown = n;
      ui.showCountdown(n);
      SFX.beep();
    }
    if (countdown <= 0.4 && countdownShown !== 0) {
      countdownShown = 0;
      ui.showCountdown(0);
      SFX.go();
    }
    if (countdown <= 0) {
      setState('play');
      game.speed = Math.min(game.speed, 16);
      ui.hideOverlay();
    }
    game.step(dt, ATTRACT_DRIVE(t), NO_AIM, false);
  } else if (state === 'play') {
    game.step(dt * stage.timeScale, driveIn(), aimIn(), true);
    handleEvents(game.events);
    for (const e of game.events) stage.handle(e);
    game.events.length = 0;
    if (game.over) finish();
  } else if (state === 'over') {
    if (resultsIn > 0) {
      resultsIn -= dt;
      if (resultsIn <= 0) showResults();
    }
  } else if (state === 'title' || state === 'pairing') {
    game.step(dt, ATTRACT_DRIVE(t), NO_AIM, false);
  }

  engineTick(state === 'play', game.gear, game.rpm, driveIn().gas && !game.over, game.speed);
  const aim = aimIn();
  const ready = Math.max(0, 1 - Math.max(0, game.shotCd) / game.shotInterval);
  const showAim = state === 'play' || state === 'countdown';
  stage.update(dt, t, driveIn(), aim, showAim);
  {
    const th = stage.turnHint;
    const el = document.getElementById('turn');
    if (el) {
      const on = state === 'play' && Math.abs(th) > 0.25;
      el.textContent = on ? (th > 0 ? '›'.repeat(Math.abs(th) > 0.6 ? 3 : 2) : '‹'.repeat(Math.abs(th) > 0.6 ? 3 : 2)) : '';
      el.className = Math.abs(th) > 0.6 ? 'sharp' : '';
    }
  }
  crosshair(aim.rx, aim.ry, ready, showAim);
  xh.classList.toggle('lock', !!game.lock && showAim);

  if (state === 'play' || state === 'paused') {
    ui.hudUpdate({
      hull: game.hull,
      maxHull: game.maxHull,
      speed: game.speed,
      gear: game.gear,
      dist: game.D,
      score: game.score,
      level: game.level,
      kills: game.kills,
      upg: game.upg,
      storm: game.stormGap,
      stormV: game.stormV,
      mult: game.mult,
      comboFrac: game.comboT / 3.2,
      shield: game.shield,
      boss: game.bossFrac,
      bossName: game.bossStyle === 'village' ? 'VILLAGE UPRISING' : 'MEGA HARVESTER',
      zone: zoneAt(game.D).name,
      heat: game.heat,
      overheated: game.heatLockT > 0,
      drift: game.driftCharge,
      driftTier: game.driftTier,
      air: game.airT > 0,
      nitroReady: game.nitroCd <= 0,
      nitroOn: game.nitroT > 0,
      ready,
      driverIn: phones.inputLabel('driver'),
      shooterIn: phones.inputLabel('shooter'),
      driverOn: phones.driver.connected,
      shooterOn: phones.shooter.connected,
    });
  }
  requestAnimationFrame(frame);
}

gotoTitle();
requestAnimationFrame((t) => {
  last = t;
  frame(t);
});
