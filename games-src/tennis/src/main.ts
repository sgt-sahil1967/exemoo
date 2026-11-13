import './style.css';
import { World } from './scene/world';
import { ChaseCamera } from './camera/chase';
import { MouseKeyboardInput } from './input/swing';
import { CombinedInput, PhoneRacketInput } from './input/phone';
import { connectExemoo } from '../../../public/sdk/exemoo.js';
import { Sfx } from './audio';
import { UI, type Mode } from './ui/ui';
import { Match } from './game/match';
import type { ThemeName } from './scene/stadium';

const params = new URLSearchParams(location.search);
const debug = params.has('debug');

let theme: ThemeName = 'midnight';
try {
  const saved = localStorage.getItem('courtace.theme');
  if (saved === 'midnight' || saved === 'riviera') theme = saved;
} catch {
  /* storage unavailable */
}
if (params.get('theme') === 'riviera' || params.get('theme') === 'midnight') theme = params.get('theme') as ThemeName;

const world = new World(document.getElementById('app')!);
world.setTheme(theme);
const cam = new ChaseCamera(world.camera);
// Mouse/keyboard always works; inside Exemoo the paired phone is the racket too.
const phone = new PhoneRacketInput();
const input = new CombinedInput(new MouseKeyboardInput(document.body), phone);
const exemoo = connectExemoo({ layout: 'swing', title: 'Tennis', menuCursor: () => navButtons().length > 0 });
const sfx = new Sfx();
const ui = new UI(theme);
const match = new Match(world, ui, sfx, input, cam);
let lastMode: Mode = 'match';

ui.onTheme = (t) => {
  sfx.ensure();
  sfx.ui();
  world.setTheme(t);
  try {
    localStorage.setItem('courtace.theme', t);
  } catch {
    /* storage unavailable */
  }
};
ui.onPlay = (m) => {
  sfx.ensure();
  sfx.ui();
  lastMode = m;
  ui.showMenu(false);
  cam.snap();
  // Swallow the click that started the match so it doesn't count as a swing.
  setTimeout(() => match.start(m), 0);
};
const setPaused = (p: boolean) => {
  if (!match.active) return;
  match.paused = p;
  input.enabled = !p;
  ui.pause(p);
};
ui.onPause = () => setPaused(true);
ui.onResume = () => setPaused(false);
ui.onQuit = () => {
  setPaused(false);
  ui.pause(false);
  ui.hideResult();
  match.stop();
  ui.showMenu(true);
};
ui.onAgain = () => {
  ui.hideResult();
  cam.snap();
  match.start(lastMode);
};
ui.onMute = (m) => sfx.setMuted(m);

window.addEventListener('keydown', (e) => {
  if (e.code === 'Escape') setPaused(!match.paused);
  if (debug && e.code === 'KeyT') match.debugTiebreak();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && !debug) setPaused(true);
});

// ───────────────────────────── phone (Exemoo) ─────────────────────────────
exemoo.on('status', (s) => {
  if (s.connected && !phone.connected) phone.recenter();
  phone.connected = s.connected;
});
exemoo.on('packet', (p) => phone.onPacket(p));

/** Menus are plain buttons: the d-pad walks through the visible ones, Action clicks. */
let navIndex = 0;
// offsetParent is null for position:fixed overlays, so check for a layout box instead.
const visible = (el: Element) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
function navButtons(): HTMLElement[] {
  for (const id of ['result', 'pause', 'menu']) {
    const box = document.getElementById(id);
    if (box && !box.classList.contains('hidden') && visible(box)) return [...box.querySelectorAll<HTMLElement>('button')].filter(visible);
  }
  return [];
}
function navFocus(step: number) {
  const list = navButtons();
  if (!list.length) return;
  navIndex = (navIndex + step + list.length) % list.length;
  list[navIndex].focus();
  list[navIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  exemoo.haptic(8);
}
exemoo.on('button', (b) => {
  sfx.ensure();
  if (b === 'recenter') {
    phone.recenter();
    exemoo.haptic([20, 40, 20]);
    return;
  }
  const list = navButtons();
  if (!list.length) {
    // In a rally: the big button swings (handled from the packet bitmask), pause/back pause.
    if (b === 'pause' || b === 'back') setPaused(true);
    return;
  }
  if (b === 'up' || b === 'left') navFocus(-1);
  else if (b === 'down' || b === 'right') navFocus(1);
  else if (b === 'action') (document.activeElement instanceof HTMLButtonElement && list.includes(document.activeElement) ? document.activeElement : list[0]).click();
  else if (b === 'pause' && match.paused) setPaused(false);
  else if (b === 'back') {
    if (match.paused) ui.onQuit?.();
    else document.getElementById('btn-menu')?.click();
  }
});

if (params.has('auto')) match.autoPlay = Number(params.get('auto')) || 0.04;
const speed = Number(params.get('speed')) || 1;
if (params.has('play')) ui.onPlay((params.get('play') as Mode) || 'match');

let fpsEl: HTMLDivElement | null = null;
if (debug) {
  fpsEl = document.createElement('div');
  fpsEl.style.cssText = 'position:fixed;bottom:8px;right:8px;font:12px monospace;color:#c8ff2e;z-index:9;background:#000a;padding:4px 6px;border-radius:4px';
  document.body.appendChild(fpsEl);
  Object.assign(window, { match, world });
}

let last = performance.now();
let frames = 0;
let fpsT = 0;
function loop(now: number) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const t = now / 1000;
  for (let i = 0; i < speed; i++) match.update(dt);
  cam.update(dt, t, match.me.pos, match.focus());
  world.update(t, dt);
  world.render();
  if (fpsEl) {
    frames++;
    fpsT += dt;
    if (fpsT > 0.5) {
      fpsEl.textContent = `${Math.round(frames / fpsT)} fps`;
      frames = 0;
      fpsT = 0;
    }
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
