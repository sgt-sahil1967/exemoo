import * as THREE from 'three';
import { connectExemoo, pressKey } from '../../../public/sdk/exemoo.js';
import './style.css';
import { Audio } from './audio';
import { Figure } from './figure';
import { Particles } from './fx';
import { difficulty, KEY_HELP, KeyboardPose, KIND_KEYS, TIER_SCORE, WallKind, WALLS } from './poses';
import { SPAWN_Z, Stage } from './scene';
import { sampleBody, Sample, Skeleton } from './skeleton';
import { CameraPose, PoseTrack } from './tracker';
import { Wall, wallIcon } from './walls';

type State = 'title' | 'calib' | 'countdown' | 'play' | 'over';
/** keys: 1P keyboard · camera: 1P camera · camera2: 2P split screen · cpu: keyboard vs CPU */
type Mode = 'keys' | 'camera' | 'camera2' | 'cpu';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const ui = {
  hud: $('hud'), phuds: $('phuds'), tpl: $<HTMLTemplateElement>('phud-tpl'), keysHelp: $('keys-help'),
  cam: $('cam'), camOverlay: $<HTMLCanvasElement>('cam-overlay'),
  title: $('title'), camStatus: $('cam-status'), calib: $('calib'), calibMsg: $('calib-msg'),
  calibBar: $('calib-bar').firstElementChild as HTMLElement, btnUpper: $('btn-upper'),
  over: $('over'), finalSolo: $('final-solo'), finalScore: $('final-score'), finalVersus: $('final-versus'),
  finalDetail: $('final-detail'), finalBest: $('final-best'), retryHint: $('retry-hint'), mute: $('mute'),
};

const START_LIVES = 3;
const PASS_POINTS = 100;
const PASS_FIT = 0.86;
const JUMP_FIT = 0.97;
const KINDS = Object.keys(WALLS) as WallKind[];

const stage = new Stage($<HTMLCanvasElement>('stage'));
const audio = new Audio();
const keyboard = new KeyboardPose();
let camera: CameraPose | null = null;
let mode: Mode = 'keys';

let state: State = 'title';
let stateT = 0;
let countdownStep = -1;
let handsUpT = 0;
let calibShownUpperT = 0;
let endT = 0;
/** Shared dice rolls so both players in a versus game face the same wall sequence. */
let rolls: number[] = [];

let best = 0;
try { best = Number(localStorage.getItem('pp-best') || 0); } catch { /* storage blocked */ }

const isVersus = () => mode === 'camera2' || mode === 'cpu';
const usesCamera = () => mode === 'camera' || mode === 'camera2';
function show(el: HTMLElement, on: boolean) { el.classList.toggle('hidden', !on); }

// ---------------------------------------------------------------- CPU opponent

/** Drives a KeyboardPose like a (fallible) human: reacts late sometimes, misses more as it speeds up. */
class Cpu {
  readonly pose = new KeyboardPose(false);
  private plan: { wall: Wall; keys: string[]; reactAt: number; miss: boolean; jumped: boolean } | null = null;

  update(dt: number, wall: Wall | null, level: number): Skeleton {
    if (wall && this.plan?.wall !== wall) {
      const miss = Math.random() < Math.min(0.45, 0.08 + level * 0.05);
      const right = KIND_KEYS[wall.def.kind] ?? [];
      const others = KINDS.filter((k) => k !== wall.def.kind && (KIND_KEYS[k] ?? []).join() !== right.join());
      const wrong = KIND_KEYS[others[Math.floor(Math.random() * others.length)]] ?? ['ArrowUp'];
      this.plan = { wall, keys: miss ? (wrong.length ? wrong : ['ArrowUp']) : right, reactAt: 0.7 + Math.random() * 0.8, miss, jumped: false };
    }
    const p = this.plan;
    if (wall && p && wall.timeToImpact < p.reactAt) {
      this.pose.hold(p.keys);
      if (wall.def.peak && !p.miss && !p.jumped && wall.timeToImpact < 0.3) { p.jumped = true; this.pose.jump(); }
    } else {
      this.pose.hold([]);
    }
    return this.pose.update(dt);
  }
}

// ---------------------------------------------------------------- players

class Player {
  readonly root = new THREE.Group();
  readonly figure = new Figure();
  readonly particles = new Particles();
  readonly el: HTMLElement;
  private q = <T extends HTMLElement = HTMLElement>(sel: string) => this.el.querySelector(sel) as T;
  readonly h;
  walls: Wall[] = [];
  active: Wall | null = null;
  score = 0;
  lives = START_LIVES;
  streak = 0;
  passed = 0;
  wallCount = 0;
  level = 1;
  gap = 0.6;
  lastKind: WallKind | null = null;
  samples: Sample[] = [];
  fitInfo: { bones: Float32Array; head: number; weight: number } | undefined;
  cpu: Cpu | null = null;
  track: PoseTrack | null = null;

  constructor(readonly idx: number, readonly name: string) {
    this.root.add(this.figure.group, this.particles.mesh);
    stage.scene.add(this.root);
    this.el = (ui.tpl.content.firstElementChild as HTMLElement).cloneNode(true) as HTMLElement;
    this.el.classList.add(`p${idx + 1}`);
    ui.phuds.append(this.el);
    this.h = {
      score: this.q('.score'), streak: this.q('.streak'), lives: this.q('.lives'), level: this.q('.level'),
      next: this.q('.next'), nextIcon: this.q<HTMLCanvasElement>('.next-icon'), nextLabel: this.q('.next-label'),
      eta: this.q('.eta i'), fit: this.q('.fit'), fitBar: this.q('.fit-bar i'), fitPct: this.q('.fit-pct'),
      banner: this.q('.banner'), flash: this.q('.flash'),
    };
    this.q('.ptag').textContent = name;
  }

  get out() { return this.lives <= 0; }
  /** Finished: out of lives and nothing still flying at them. */
  get done() { return this.out && !this.active; }

  reset() {
    this.clearWalls();
    this.score = 0; this.lives = START_LIVES; this.streak = 0; this.passed = 0; this.wallCount = 0;
    this.level = 1; this.gap = 0.6; this.lastKind = null; this.fitInfo = undefined;
    this.el.classList.remove('is-out');
    this.h.next.classList.remove('on');
    this.h.fit.classList.remove('on');
    this.h.level.textContent = 'SPEED 1';
    this.renderLives();
    this.renderScore();
  }

  clearWalls() {
    for (const w of this.walls) { this.root.remove(w.group); w.dispose(); }
    this.walls = [];
    this.active = null;
  }

  dispose() {
    this.clearWalls();
    stage.scene.remove(this.root);
    this.el.remove();
  }

  banner(html: string, color: string) {
    const b = this.h.banner;
    b.innerHTML = html;
    b.style.color = color;
    b.classList.remove('show');
    void b.offsetWidth;
    b.classList.add('show');
  }

  flash(color: string) {
    const f = this.h.flash;
    f.style.background = color;
    f.classList.add('on');
    requestAnimationFrame(() => requestAnimationFrame(() => f.classList.remove('on')));
  }

  renderLives() {
    this.h.lives.innerHTML = Array.from({ length: START_LIVES }, (_, i) => `<span class="heart ${i < this.lives ? '' : 'lost'}"><svg viewBox="0 0 24 22" width="26" height="24"><path d="M12 21 2.5 11.5A5.5 5.5 0 0 1 12 4a5.5 5.5 0 0 1 9.5 7.5z" fill="#ff3d6b" stroke="#1b1b3a" stroke-width="2"/></svg></span>`).join('');
  }

  renderScore() {
    this.h.score.textContent = String(this.score);
    this.h.streak.textContent = this.streak >= 2 ? `${this.streak} in a row` : '';
  }

  skeleton(dt: number): Skeleton {
    if (this.cpu) return this.cpu.update(dt, this.active, this.level);
    if (this.track) return this.track.skeleton();
    return keyboard.update(dt);
  }

  spawnWall() {
    // Harder walls unlock as this player's score climbs; the shared roll keeps versus fair.
    const pool = KINDS.filter((k) => this.score >= TIER_SCORE[WALLS[k].tier] && k !== this.lastKind);
    while (rolls.length <= this.wallCount) rolls.push(Math.random());
    const kind = pool[Math.floor(rolls[this.wallCount] * pool.length)];
    this.lastKind = kind;
    const w = new Wall(WALLS[kind], difficulty(this.score).travel, SPAWN_Z);
    this.wallCount++;
    this.walls.push(w);
    this.active = w;
    this.root.add(w.group);
    const ctx = this.h.nextIcon.getContext('2d')!;
    ctx.clearRect(0, 0, 96, 96);
    ctx.drawImage(wallIcon(w), 0, 0);
    this.h.nextLabel.textContent = w.def.label;
    this.h.nextLabel.style.color = w.def.color;
    this.h.next.classList.add('on');
    if (this.idx === 0) audio.play('whoosh', 0.7);
    if (!isVersus()) audio.say(w.def.voice);
  }

  resolve(w: Wall) {
    const h = w.fitHistory;
    const mean = h.length ? h.reduce((a, b) => a + b, 0) / h.length : 0;
    const ok = w.def.peak ? Math.max(0, ...h) >= JUMP_FIT : mean >= PASS_FIT;
    w.resolved = ok ? 'pass' : 'fail';
    this.active = null;
    this.h.next.classList.remove('on');
    const chest = new THREE.Vector3(0, 1.3, 0.2);
    const solo = !isVersus();
    if (ok) {
      this.score += PASS_POINTS;
      this.streak++;
      this.passed++;
      this.banner(`PASS!<small>+${PASS_POINTS}</small>`, '#5dffa0');
      this.flash('#2bff7a');
      this.particles.burst(chest, 90, ['#ffd02a', '#ff3d8b', '#7dfcff', '#5dffa0', '#ffffff'], 3.5, 4.5);
      audio.play('pass', solo ? 1 : 0.7);
      if (solo) audio.say(mean >= 0.97 && w.def.silhouette ? 'v_perfect' : this.streak % 2 ? 'v_pass' : 'v_nice');
      this.checkLevel();
    } else {
      this.lives--;
      this.streak = 0;
      w.splat(this.samples);
      this.figure.hit();
      stage.kick(1);
      this.banner('SPLAT!', '#ff2a55');
      this.flash('#ff1040');
      this.particles.burst(chest, 70, ['#28ff78', '#1fd860', '#b6ffcf'], 3, 3.5, 0.08);
      this.particles.burst(new THREE.Vector3(0, 0.2, 1.6), 50, ['#1fa3ff', '#bfe8ff'], 2, 5, 0.05);
      audio.play('splat', solo ? 1 : 0.8);
      if (solo) {
        setTimeout(() => audio.play('lifelost', 0.7), 250);
        audio.say(this.lives > 0 && Math.random() < 0.4 ? 'v_ouch' : 'v_splat');
      }
      this.renderLives();
      if (this.out) {
        this.h.fit.classList.remove('on');
        if (!solo) {
          setTimeout(() => this.el.classList.add('is-out'), 900);
          audio.say(`${this.name} is out!`);
        }
      }
    }
    this.gap = difficulty(this.score).gap;
    this.renderScore();
  }

  /** Speed level went up: tell the player and push the music tempo. */
  private checkLevel() {
    const lvl = difficulty(this.score).level;
    if (lvl <= this.level) return;
    this.level = lvl;
    this.h.level.textContent = `SPEED ${lvl}`;
    this.h.level.classList.add('bump');
    setTimeout(() => this.h.level.classList.remove('bump'), 600);
    setTimeout(() => this.banner(`SPEED UP!<small>LEVEL ${lvl}</small>`, '#ffd02a'), 700);
    audio.play('go', 0.6);
    if (!isVersus()) setTimeout(() => audio.say('Speed up!'), 700);
    const top = Math.max(...players.map((p) => p.level));
    audio.setMusicRate(Math.min(1.3, 1 + (top - 1) * 0.05));
  }

  update(dt: number, skel: Skeleton) {
    sampleBody(skel, this.samples);
    this.fitInfo = undefined;
    for (const w of this.walls) {
      w.timeToImpact -= dt;
      w.group.position.z = -w.speed * w.timeToImpact;
      // Fade out once it has passed the player.
      if (w.resolved) w.setOpacity(Math.max(0, 1 - w.group.position.z / 3.5) * 0.6);
    }
    for (const w of this.walls.filter((w) => w.group.position.z > 6)) { this.root.remove(w.group); w.dispose(); }
    this.walls = this.walls.filter((w) => w.group.position.z <= 6);

    const w = this.active;
    if (w) {
      const f = w.fit(this.samples);
      const near = Math.max(0, Math.min(1, 1 - (w.timeToImpact - 0.2) / 1.4));
      this.fitInfo = { bones: f.bones, head: f.head, weight: near };
      this.h.fit.classList.toggle('on', w.timeToImpact < 2.2);
      const pct = Math.round(f.score * 100);
      this.h.fitBar.style.width = `${pct}%`;
      const goal = w.def.peak ? JUMP_FIT : PASS_FIT;
      this.h.fitBar.style.background = f.score >= goal ? 'var(--green)' : f.score >= goal - 0.15 ? 'var(--yellow)' : 'var(--red)';
      this.h.fitPct.textContent = `${pct}%`;
      this.h.eta.style.transform = `scaleX(${Math.max(0, w.timeToImpact / w.travel)})`;
      if (!w.warned && w.timeToImpact < 0.8) {
        w.warned = true;
        if (this.idx === 0 || !isVersus()) audio.play('warn', 0.5);
      }
      const lead = w.def.peak ? 0.45 : 0.35;
      if (w.timeToImpact < lead) w.fitHistory.push(f.score);
      if (w.timeToImpact <= -0.08) this.resolve(w);
    } else {
      this.h.fit.classList.remove('on');
      this.gap -= dt;
      if (this.gap <= 0 && !this.out) this.spawnWall();
    }
  }
}

let players: Player[] = [];

function setupPlayers() {
  for (const p of players) p.dispose();
  const n = isVersus() ? 2 : 1;
  players = Array.from({ length: n }, (_, i) => new Player(i, mode === 'cpu' && i === 1 ? 'CPU' : `P${i + 1}`));
  if (mode === 'cpu') players[1].cpu = new Cpu();
  if (usesCamera() && camera) players.forEach((p, i) => (p.track = camera!.tracks[i]));
  ui.phuds.classList.toggle('split', n === 2);
  stage.views = n as 1 | 2;
}

// ---------------------------------------------------------------- flow

function setState(s: State) {
  state = s;
  stateT = 0;
  if (s === 'calib') calibShownUpperT = 0;
  show(ui.title, s === 'title');
  show(ui.calib, s === 'calib');
  show(ui.over, s === 'over');
  show(ui.hud, s === 'countdown' || s === 'play');
  show(ui.keysHelp, mode === 'keys' || mode === 'cpu');
  show(ui.cam, usesCamera() && s !== 'title');
  ui.cam.classList.toggle('big', s === 'calib');
}

async function startCamera(n: 1 | 2) {
  audio.unlock();
  audio.play('click');
  mode = n === 2 ? 'camera2' : 'camera';
  const btns = ui.title.querySelectorAll('button');
  btns.forEach((b) => (b.disabled = true));
  try {
    if (!camera) {
      const cam = new CameraPose();
      await cam.start((s) => (ui.camStatus.textContent = s), n);
      ui.cam.prepend(cam.video);
      camera = cam;
    } else {
      ui.camStatus.textContent = 'Loading pose model…';
      await camera.setPlayers(n);
    }
    for (const t of camera.tracks) t.resetCalibration();
    ui.camStatus.textContent = '';
    setupPlayers();
    setState('calib');
    audio.say(n === 2 ? 'Both players, get in position!' : 'v_ready');
  } catch (e) {
    console.error(e);
    ui.camStatus.textContent = `Camera unavailable (${(e as Error).message || e}). Try keyboard mode.`;
  } finally {
    btns.forEach((b) => (b.disabled = false));
  }
}

function startKeys(m: 'keys' | 'cpu') {
  audio.unlock();
  audio.play('click');
  mode = m;
  setupPlayers();
  newGame();
}

function newGame() {
  rolls = [];
  for (const p of players) p.reset();
  countdownStep = -1;
  endT = 0;
  audio.setMusicRate(1);
  setState('countdown');
}

function toMenu() {
  audio.stopMusic();
  for (const p of players) p.clearWalls();
  for (const p of players) p.el.classList.remove('is-out');
  setState('title');
}

function gameOver() {
  audio.stopMusic(1.2);
  const humans = players.filter((p) => !p.cpu);
  const top = Math.max(...humans.map((p) => p.score));
  const isBest = top > best;
  if (isBest) {
    best = top;
    try { localStorage.setItem('pp-best', String(best)); } catch { /* storage blocked */ }
  }
  const versus = players.length > 1;
  show(ui.finalSolo, !versus);
  show(ui.finalVersus, versus);
  let winner: Player | null = null;
  if (versus) {
    const [a, b] = players;
    winner = a.score === b.score ? null : a.score > b.score ? a : b;
    ui.finalVersus.innerHTML = players.map((p) =>
      `<div class="pres ${p === winner ? 'win' : ''}"><div class="label">${p.name}${p === winner ? ' · WINNER' : ''}</div><b>${p.score}</b><small>${p.passed} walls · speed ${p.level}</small></div>`,
    ).join('');
    ui.finalDetail.textContent = winner ? `${winner.name} wins!` : "It's a tie!";
  } else {
    const p = players[0];
    ui.finalScore.textContent = String(p.score);
    ui.finalDetail.textContent = `${p.passed} of ${p.wallCount} walls cleared · reached speed ${p.level}`;
  }
  ui.finalBest.textContent = isBest && top > 0 ? 'NEW HIGH SCORE!' : `Best: ${best}`;
  ui.retryHint.textContent = usesCamera() ? 'Raise both hands above your head to play again' : 'Press Space or Enter to play again';
  handsUpT = 0;
  for (const p of players) { p.h.banner.classList.remove('show'); p.el.classList.remove('is-out'); }
  setState('over');
  audio.play('gameover');
  setTimeout(() => {
    if (isBest && top > 0) { audio.play('newbest'); audio.say('v_newbest'); }
    else if (versus) audio.say(winner ? `${winner.name} wins!` : "It's a tie!");
    else audio.say('v_gameover');
  }, isBest && top > 0 ? 1800 : 300);
}

// ---------------------------------------------------------------- loop

setupPlayers();

let last = performance.now();
function frame(now: number) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  stateT += dt;

  if (camera) {
    camera.poll(now);
    if (!ui.cam.classList.contains('hidden')) {
      const c = ui.camOverlay;
      if (c.width !== c.clientWidth) { c.width = c.clientWidth; c.height = c.clientHeight; }
      camera.drawPreview(c.getContext('2d')!);
    }
  }
  const skels = players.map((p) => p.skeleton(dt));

  switch (state) {
    case 'calib': {
      const states = players.map((p) => p.track!.calibrate());
      ui.calibMsg.textContent = players.length > 1
        ? states.map((c, i) => `${players[i].name}: ${c.done ? 'ready' : c.message}`).join('   ·   ')
        : states[0].message;
      ui.calibBar.style.width = `${Math.round((states.reduce((a, c) => a + c.progress, 0) / states.length) * 100)}%`;
      calibShownUpperT += dt;
      if (calibShownUpperT > 5) show(ui.btnUpper, !players[0].track!.upperBodyOnly);
      if (states.every((c) => c.done)) { audio.play('pass', 0.6); newGame(); }
      break;
    }
    case 'countdown': {
      const step = Math.floor(stateT / 0.9);
      if (step !== countdownStep && step <= 3) {
        countdownStep = step;
        if (step < 3) {
          for (const p of players) p.banner(String(3 - step), '#ffd02a');
          audio.play('tick');
          audio.say(`v_${3 - step}`);
        } else {
          for (const p of players) p.banner('GO!', '#7dfcff');
          audio.play('go');
          audio.say('v_go');
          audio.startMusic();
        }
      }
      if (stateT > 3.3) setState('play');
      break;
    }
    case 'play': {
      players.forEach((p, i) => p.update(dt, skels[i]));
      // Let the last splat play out before the results screen.
      if (players.every((p) => p.done)) {
        endT += dt;
        if (endT > 1.4) gameOver();
      }
      break;
    }
    case 'over': {
      if (usesCamera() && camera && stateT > 1.5) {
        const up = players.some((p) => p.track?.handsUp());
        handsUpT = up ? handsUpT + dt : 0;
        ui.retryHint.textContent = handsUpT > 0
          ? `Keep them up… ${Math.ceil((1.2 - handsUpT) * 10) / 10}s`
          : 'Raise both hands above your head to play again';
        if (handsUpT > 1.2) newGame();
      }
      break;
    }
    default: break;
  }

  players.forEach((p, i) => {
    p.figure.update(skels[i], dt, state === 'play' ? p.fitInfo : undefined);
    p.particles.update(dt);
  });
  // Each split-screen view only shows its own player's figure and walls.
  stage.update(dt, (view) => players.forEach((p, i) => (p.root.visible = players.length === 1 || i === view)));
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// ---------------------------------------------------------------- inputs

ui.mute.textContent = audio.muted ? 'Muted' : 'Sound';
function toggleMute() { ui.mute.textContent = audio.toggleMute() ? 'Muted' : 'Sound'; }

$('btn-camera').addEventListener('click', () => startCamera(1));
$('btn-camera2').addEventListener('click', () => startCamera(2));
$('btn-keys').addEventListener('click', () => startKeys('keys'));
$('btn-cpu').addEventListener('click', () => startKeys('cpu'));
$('btn-retry').addEventListener('click', () => { audio.play('click'); newGame(); });
$('btn-menu').addEventListener('click', () => { audio.play('click'); toMenu(); });
ui.btnUpper.addEventListener('click', () => {
  if (camera) for (const t of camera.tracks) t.upperBodyOnly = true;
  show(ui.btnUpper, false);
});
ui.mute.addEventListener('click', toggleMute);
addEventListener('keydown', (e) => {
  if (e.code === 'KeyM') toggleMute();
  if (e.code === 'Escape' && state !== 'title') toMenu();
  if (state === 'over' && stateT > 0.8 && (e.code === 'Space' || e.code === 'Enter')) {
    e.preventDefault();
    newGame();
  }
  if (e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault();
});
ui.keysHelp.textContent = KEY_HELP;
Object.assign(ui.keysHelp.style, { whiteSpace: 'normal', maxWidth: 'min(760px, 92vw)', textAlign: 'center' });
setState('title');

if (import.meta.env.DEV) {
  Object.assign(window, {
    pp: {
      get state() { return state; },
      get players() { return players; },
      // 1P shorthands used by test scripts.
      get score() { return players[0].score; },
      get lives() { return players[0].lives; },
      get walls() { return players[0].walls; },
    },
  });
}

// ───────────────────────────── Exemoo phone remote ─────────────────────────────
// The camera tracks the body; the phone just drives the menus and pause/exit.
const exemoo = connectExemoo({ layout: 'remote', title: 'Pose Match', menuCursor: () => state === 'title' || state === 'calib' || state === 'over' });
exemoo.on('button', (b) => {
  if ((state === 'title' || state === 'over') && exemoo.nav(b, { skip: '#mute' })) return;
  if (b === 'pause' || b === 'back') pressKey('Escape');
  else if (b === 'action') pressKey('Space');
  else if (['up', 'down', 'left', 'right'].includes(b)) pressKey(`Arrow${b[0].toUpperCase()}${b.slice(1)}`);
});
