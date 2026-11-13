import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type {
  FruitKind, GameMode, GameScreen, GameToPhone, HudState, PowerUpKind, RunStats, Settings, ThrowableKind,
} from '../contracts';
import {
  FRUIT_KINDS, FRUIT_SPECS, createBombModel, createFruitModel, disposeObject, prewarmAssets, sliceFruit,
} from '../assets';
import {
  BladeTrail, CameraRig, Environment, ExplosionFX, JuiceFX, Popups, PostFX, ScreenFX, SparkFX, StainLayer,
  createRenderer,
} from '../fx';
import { SoundEngine } from '../audio';
import { UI } from '../ui';
import { PhoneLink } from '../net';
import { SliceLink } from '../../../../public/sdk/adapters.js';
import { inExemooShell } from '../../../../public/sdk/exemoo.js';
import { MotionPointer, MousePointer, PointerHub } from '../input';
import {
  ACTION_Z, ARCADE_BOMB_PENALTY, COMBO_WINDOW, CRITICAL_CHANCE, CRITICAL_POINTS, CUT_SPEED, EXTRA_LIFE_EVERY,
  FRUIT_SCALE, GRAVITY, KILL_Y, LAUNCH_Y, MENU_FRUITS, MISS_Y, MODE_RULES, POWERUP_DURATION, SWOOSH_SPEED, TABLE,
} from './constants';
import { type FruitEnt, type HalfEnt, integrateSpin, randomSpin } from './entities';
import { type LaunchRequest, Spawner } from './Spawner';

type Phase = 'menu' | 'countdown' | 'playing' | 'ending' | 'gameover';

interface MenuFruit {
  mode: GameMode;
  kind: FruitKind;
  obj: THREE.Group | null;
  base: THREE.Vector3;
  respawn: number;
  hover: number;
  /** pop-in animation 0→1 */
  appear: number;
}

const MENU_RADIUS = 0.8;
const POWERUP_COLORS: Record<PowerUpKind, string> = { freeze: '#7fd8ff', frenzy: '#ff7a3d', double: '#ffcf3d' };

const _v = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _n = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3();
const _fwd = new THREE.Vector3();
const _qInv = new THREE.Quaternion();

export class Game {
  private readonly canvas: HTMLCanvasElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(45, 16 / 9, 0.1, 80);
  private readonly rig: CameraRig;
  private readonly env: Environment;
  private post: PostFX | null = null;
  private readonly trail: BladeTrail;
  private readonly stains: StainLayer;
  private readonly juice: JuiceFX;
  private readonly explosion: ExplosionFX;
  private readonly sparks: SparkFX;
  private readonly screenFx: ScreenFX;
  private readonly popups: Popups;
  private readonly sound = new SoundEngine();
  private readonly ui: UI;
  /** Inside Exemoo the shell already paired the phone; the adapter speaks this game's PhoneLink API. */
  private readonly inShell = inExemooShell();
  private readonly link: PhoneLink = this.inShell ? (new SliceLink({ layout: 'slice', title: 'Fruit Slice', menuHold: () => this.screen !== 'playing' }) as unknown as PhoneLink) : new PhoneLink();
  private readonly motion: MotionPointer;
  private readonly mouse: MousePointer;
  private readonly pointer: PointerHub;
  private settings: Settings;

  private screen: GameScreen = 'pair';
  private phase: Phase = 'menu';
  private paused = false;
  private mode: GameMode = 'classic';
  private spawner: Spawner | null = null;
  private pending: LaunchRequest[] = [];
  private fruits: FruitEnt[] = [];
  private halves: HalfEnt[] = [];
  private menuFruits: MenuFruit[] = [];
  private menuLock = 0;

  // run state
  private score = 0;
  private best = 0;
  private lives = 3;
  private timeLeft = 0;
  private nextExtraLife = EXTRA_LIFE_EVERY;
  private stats: RunStats = blankStats();
  private powerUps = new Map<PowerUpKind, number>();
  private endTimer = 0;
  private endReason: 'bomb' | 'lives' | 'time' = 'lives';
  private pomegranateSpawned = false;
  private lastTickSecond = -1;

  // blade state
  private prevPx = 0;
  private prevPy = 0;
  private prevActive = false;
  private bladeSpeed = 0;
  private swooshCooldown = 0;
  private comboCount = 0;
  private comboTimer = 0;
  private comboAge = 0;
  private comboPos = new THREE.Vector3();
  private slowTime = 0;
  private bombFuse: ReturnType<SoundEngine['loop']> | null = null;

  private time = 0;
  private last = performance.now();
  private fpsAcc = 0;
  private fpsFrames = 0;
  private phoneStateTimer = 0;
  private lastLinkStatus = '';

  constructor(root: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'game-canvas';
    root.appendChild(this.canvas);
    const overlay = document.createElement('div');
    overlay.className = 'fx-layer';
    root.appendChild(overlay);
    const uiRoot = document.createElement('div');
    uiRoot.className = 'ui-root';
    root.appendChild(uiRoot);

    this.ui = new UI(uiRoot, {
      onModeSelect: (m) => this.selectMode(m),
      onPause: () => this.setPaused(true),
      onResume: () => this.setPaused(false),
      onRestart: () => this.startRun(this.mode),
      onQuit: () => this.toMenu(),
      onSettingsChange: (s) => this.applySettings(s),
      onCalibrate: () => this.calibrate(),
      onPlayWithMouse: () => this.toMenu(),
      onShowPairing: () => this.showScreen('pair'),
    });
    this.ui.setHooks({
      onCountdownTick: (n) => this.sound.play(n > 0 ? 'countdown' : 'go'),
      onHover: () => this.sound.play('hover', { volume: 0.5 }),
      onClick: () => {
        this.sound.unlock();
        this.sound.play('menuSelect');
      },
      onScreenChange: (sc) => {
        this.screen = sc;
      },
    });
    this.settings = this.ui.getSettings();

    this.renderer = createRenderer(this.canvas, this.settings.quality);
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.45;
    pmrem.dispose();
    this.rig = new CameraRig(this.camera);
    this.env = new Environment(this.scene, this.settings.quality);
    this.stains = new StainLayer(this.scene);
    this.juice = new JuiceFX(this.scene, this.stains);
    this.explosion = new ExplosionFX(this.scene);
    this.sparks = new SparkFX(this.scene);
    this.trail = new BladeTrail(this.scene, this.camera);
    this.screenFx = new ScreenFX(overlay);
    this.popups = new Popups(overlay, this.camera);
    if (this.settings.quality === 'high') this.post = new PostFX(this.renderer, this.scene, this.camera, 'high');

    this.motion = new MotionPointer(this.link);
    this.mouse = new MousePointer(this.canvas);
    this.pointer = new PointerHub(this.motion, this.mouse);

    this.link.onInfo(() => this.onLinkInfo());
    this.link.onButton((b) => {
      if (b === 'calibrate') this.calibrate();
      else if (b === 'pause') {
        if (this.phase === 'playing' || this.phase === 'countdown') this.setPaused(!this.paused);
      } else if (b === 'select') {
        if (this.screen !== 'playing') this.ui.pressPrimary();
      }
    });
    this.link.start().catch((e) => console.warn('[link]', e));

    // unlock audio on first gesture anywhere
    const unlock = () => this.sound.unlock();
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock);
    window.addEventListener('keydown', (e) => this.onKey(e));
    window.addEventListener('resize', () => this.resize());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.phase === 'playing') this.setPaused(true);
    });

    this.applySettings(this.settings);
    this.resize();
    prewarmAssets(this.renderer);
    this.buildMenuFruits();
    this.showScreen('pair');
    this.ui.setLink(this.link.info);
    requestAnimationFrame(this.frame);
  }

  // ------------------------------------------------------------ screens ---

  private showScreen(s: GameScreen) {
    this.screen = s;
    this.ui.show(s);
    if (s === 'menu' || s === 'pair') this.sound.startMusic('menu');
    this.sendPhone({ t: 'state', screen: s, score: this.score, lives: this.lives, mode: this.mode, best: this.best });
  }

  private onLinkInfo() {
    const info = this.link.info;
    this.ui.setLink(info, this.link.packetRate);
    if (info.status === this.lastLinkStatus) return;
    const prev = this.lastLinkStatus;
    this.lastLinkStatus = info.status;
    if (info.status === 'connected') {
      this.sound.play('connect');
      this.ui.toast(`Phone connected${info.transport === 'relay' ? ' (relay)' : ''}`);
      this.sendPhone({ t: 'theme', color: this.settings.bladeColor });
      this.motion.calibrate();
      if (this.screen === 'pair') setTimeout(() => this.screen === 'pair' && this.toMenu(), 900);
      else this.sendPhone({ t: 'state', screen: this.screen, score: this.score, lives: this.lives, mode: this.mode });
    } else if (prev === 'connected') {
      this.sound.play('disconnect');
      this.ui.toast('Phone disconnected — waiting for it to rejoin');
      if (this.phase === 'playing') this.setPaused(true);
    }
  }

  private toMenu() {
    this.clearRun();
    this.phase = 'menu';
    this.paused = false;
    this.sound.setMuffled(false);
    this.showScreen('menu');
    for (const m of this.menuFruits) if (!m.obj) m.respawn = 0.2;
  }

  private selectMode(mode: GameMode) {
    if (this.phase !== 'menu' && this.phase !== 'gameover') return;
    this.sound.unlock();
    this.startRun(mode);
  }

  private startRun(mode: GameMode) {
    this.clearRun();
    this.mode = mode;
    const rules = MODE_RULES[mode];
    this.score = 0;
    this.best = this.ui.getBest(mode);
    this.lives = rules.lives ?? 0;
    this.timeLeft = rules.time ?? 0;
    this.nextExtraLife = EXTRA_LIFE_EVERY;
    this.stats = blankStats();
    this.pomegranateSpawned = false;
    this.lastTickSecond = -1;
    this.spawner = new Spawner(mode, FRUIT_KINDS.map((k) => ({ kind: k, weight: FRUIT_SPECS[k].weight })));
    this.stains.clear();
    this.hideMenuFruits();
    this.paused = false;
    this.sound.setMuffled(false);
    this.phase = 'countdown';
    this.showScreen('playing');
    this.pushHud();
    this.sound.play('start');
    this.sound.startMusic('game');
    this.ui.showCountdown(() => {
      if (this.phase === 'countdown') this.phase = 'playing';
    });
  }

  private clearRun() {
    for (const f of this.fruits) this.removeFruit(f);
    this.fruits.length = 0;
    this.pending.length = 0;
    this.powerUps.clear();
    this.spawner = null;
    this.slowTime = 0;
    this.comboCount = 0;
    this.screenFx.setFrost(0);
    this.screenFx.setFrenzy(0);
    this.screenFx.setDanger(0);
    this.rig.setZoom(0);
    this.sound.setTimeScale(1);
    this.stopFuse();
  }

  private setPaused(p: boolean) {
    if (this.phase !== 'playing' && this.phase !== 'countdown') return;
    if (this.paused === p) return;
    this.paused = p;
    this.sound.setMuffled(p || this.powerUps.has('freeze'));
    this.showScreen(p ? 'paused' : 'playing');
    if (p) this.stopFuse();
  }

  private endRun(reason: 'bomb' | 'lives' | 'time') {
    if (this.phase === 'ending' || this.phase === 'gameover') return;
    this.phase = 'ending';
    this.endReason = reason;
    this.endTimer = reason === 'bomb' ? 1.6 : 1.1;
    this.slowTime = reason === 'bomb' ? 1.4 : 0.6;
    this.stopFuse();
    if (reason === 'time') this.sound.play('timeUp');
    this.sound.stopMusic(1.2);
  }

  private finishRun() {
    this.phase = 'gameover';
    this.stats.duration = Math.round(this.stats.duration);
    const isNewBest = this.score > this.best && this.score > 0;
    if (isNewBest) {
      this.ui.setBest(this.mode, this.score);
      this.sound.play('newBest');
    } else this.sound.play('gameOver');
    this.showScreen('gameover');
    this.ui.showGameOver({
      mode: this.mode, score: this.score, best: Math.max(this.best, this.score), isNewBest,
      reason: this.endReason, stats: { ...this.stats },
    });
    this.screenFx.setDanger(0);
    this.screenFx.setFrost(0);
    this.screenFx.setFrenzy(0);
    this.haptic([60, 40, 120]);
  }

  private calibrate() {
    this.motion.calibrate();
    this.ui.toast('Blade recentered');
    this.haptic([20]);
  }

  private applySettings(s: Settings) {
    const qualityChanged = this.settings && s.quality !== this.settings.quality;
    this.settings = s;
    this.sound.setVolumes(s.masterVolume, s.sfxVolume, s.musicVolume);
    this.motion.sensitivity = s.sensitivity;
    this.trail.setColor(s.bladeColor);
    this.sendPhone({ t: 'theme', color: s.bladeColor });
    if (qualityChanged) {
      this.env.setQuality(s.quality);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, s.quality === 'high' ? 2 : 1));
      this.renderer.shadowMap.enabled = true;
      if (s.quality === 'high' && !this.post) this.post = new PostFX(this.renderer, this.scene, this.camera, 'high');
      if (s.quality === 'low' && this.post) {
        this.post.dispose?.();
        this.post = null;
      }
      this.resize();
    }
  }

  private onKey(e: KeyboardEvent) {
    if (e.key === 'Escape' || e.key === 'p') {
      if (this.phase === 'playing' || this.phase === 'countdown') this.setPaused(!this.paused);
    } else if (e.key === 'c') this.calibrate();
  }

  private resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.post?.setSize(w, h);
    this.screenFx.resize();
  }

  // -------------------------------------------------------------- loop ---

  private frame = (now: number) => {
    requestAnimationFrame(this.frame);
    const rawDt = Math.min(0.05, Math.max(0.0001, (now - this.last) / 1000));
    this.last = now;
    this.time += rawDt;

    this.fpsAcc += rawDt;
    this.fpsFrames++;
    if (this.fpsAcc > 0.5) {
      if (this.settings.showFps) this.ui.setFps(Math.round(this.fpsFrames / this.fpsAcc));
      this.fpsAcc = 0;
      this.fpsFrames = 0;
    }

    // time scale: slow-mo on bomb / pomegranate, freeze slows fruit
    if (this.slowTime > 0) this.slowTime -= rawDt;
    const slow = this.slowTime > 0 ? 0.25 : 1;
    const frozen = this.powerUps.has('freeze') ? 0.35 : 1;
    const simDt = this.paused ? 0 : rawDt * slow;
    const fruitDt = simDt * frozen;
    this.sound.setTimeScale(slow < 1 ? 0.8 : 1);

    this.pointer.update(rawDt);
    this.updateBlade(rawDt);
    const ps = this.pointer.state;
    if (this.screen !== 'playing') this.ui.setPointer(ps.x, ps.y, ps.source === 'phone' && ps.active);

    if (!this.paused) {
      if (this.phase === 'menu') this.updateMenu(rawDt);
      if (this.phase === 'playing') this.updatePlaying(simDt, rawDt);
      if (this.phase === 'ending') {
        this.endTimer -= rawDt;
        if (this.endTimer <= 0) this.finishRun();
      }
      this.updateFruits(fruitDt);
      this.updateHalves(simDt);
    }

    this.updateLinkUi(rawDt);
    this.juice.update(simDt);
    this.explosion.update(simDt);
    this.sparks.update(simDt);
    this.stains.update?.(rawDt);
    this.trail.update(rawDt);
    this.screenFx.update(rawDt);
    this.popups.update(rawDt);
    this.env.update(rawDt, this.time);
    this.rig.update(rawDt);

    if (this.post) this.post.render(rawDt);
    else this.renderer.render(this.scene, this.camera);
  };

  private updateLinkUi(dt: number) {
    this.phoneStateTimer -= dt;
    if (this.phoneStateTimer <= 0) {
      this.phoneStateTimer = 0.5;
      this.ui.setLink(this.link.info, this.link.packetRate);
    }
  }

  // ------------------------------------------------------------- blade ---

  private updateBlade(dt: number) {
    const p = this.pointer.state;
    const aspect = this.camera.aspect;
    // On the Exemoo pad the blade (and its cursor dot) only shows while the blade button is held.
    this.trail.showCursor = p.active || !this.inShell;
    this.trail.push(p.x, p.y, p.active, this.time);

    const dx = (p.x - this.prevPx) * aspect;
    const dy = p.y - this.prevPy;
    const dist = Math.hypot(dx, dy);
    // speed in screen heights per second (NDC spans 2)
    const instSpeed = dist / 2 / dt;
    this.bladeSpeed += (instSpeed - this.bladeSpeed) * Math.min(1, dt * 30);

    this.swooshCooldown -= dt;
    if (p.active && this.prevActive && this.bladeSpeed > SWOOSH_SPEED && this.swooshCooldown <= 0) {
      this.swooshCooldown = 0.22;
      this.sound.play('swoosh', { volume: Math.min(1, this.bladeSpeed / 7), pitch: 0.9 + Math.random() * 0.25, pan: p.x * 0.6 });
    }

    const canCut = p.active && this.prevActive && instSpeed > CUT_SPEED && dist > 1e-4 && !this.paused;
    if (canCut) {
      // world-space blade direction for orienting cuts
      this.camera.matrixWorld.extractBasis(_right, _up, _fwd);
      const bladeDir = _v2.copy(_right).multiplyScalar(dx).addScaledVector(_up, dy).normalize();
      this.testCuts(this.prevPx, this.prevPy, p.x, p.y, bladeDir);
    }

    // combo finalisation
    if (this.comboCount > 0) {
      this.comboTimer -= dt;
      this.comboAge += dt;
      if (this.comboTimer <= 0 || this.comboAge > 1.2 || this.bladeSpeed < CUT_SPEED * 0.7) this.finishCombo();
    }

    this.prevPx = p.x;
    this.prevPy = p.y;
    this.prevActive = p.active;
  }

  private testCuts(ax: number, ay: number, bx: number, by: number, bladeDir: THREE.Vector3) {
    const aspect = this.camera.aspect;
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const now = this.time;

    // menu fruits
    if (this.phase === 'menu' && this.menuLock <= 0) {
      for (const m of this.menuFruits) {
        if (!m.obj || m.appear < 0.6) continue;
        if (this.hitTest(m.obj.position, MENU_RADIUS * 1.1, ax, ay, bx, by, aspect, tanHalf)) {
          this.sliceMenuFruit(m, bladeDir);
          return;
        }
      }
    }

    if (this.phase !== 'playing' && this.phase !== 'countdown') return;
    for (let i = this.fruits.length - 1; i >= 0; i--) {
      const f = this.fruits[i];
      if (f.delay > 0 || f.sliced) continue;
      if (f.kind === 'pomegranate' && now - f.lastHit < 0.07) continue;
      if (!this.hitTest(f.obj.position, f.radius * 1.12, ax, ay, bx, by, aspect, tanHalf)) continue;
      this.onFruitCut(f, bladeDir);
      if (this.phase !== 'playing') break;
    }
  }

  /** Screen-space segment-vs-circle test (aspect-corrected NDC). */
  private hitTest(pos: THREE.Vector3, radius: number, ax: number, ay: number, bx: number, by: number, aspect: number, tanHalf: number) {
    _v.copy(pos).project(this.camera);
    if (_v.z > 1) return false;
    const dist = this.camera.position.distanceTo(pos);
    const r = radius / (dist * tanHalf);
    const cx = _v.x * aspect, cy = _v.y;
    const x1 = ax * aspect, y1 = ay, x2 = bx * aspect, y2 = by;
    const ex = x2 - x1, ey = y2 - y1;
    const len2 = ex * ex + ey * ey;
    let t = len2 > 0 ? ((cx - x1) * ex + (cy - y1) * ey) / len2 : 0;
    t = Math.max(0, Math.min(1, t));
    const px = x1 + ex * t - cx, py = y1 + ey * t - cy;
    return px * px + py * py <= r * r;
  }

  // ------------------------------------------------------------- menu ---

  private buildMenuFruits() {
    for (const m of MENU_FRUITS) {
      this.menuFruits.push({ mode: m.mode, kind: m.kind, obj: null, base: new THREE.Vector3(m.x, m.y, ACTION_Z + 0.6), respawn: 0, hover: 0, appear: 0 });
    }
  }

  private hideMenuFruits() {
    for (const m of this.menuFruits) {
      if (m.obj) {
        this.scene.remove(m.obj);
        disposeObject(m.obj);
        m.obj = null;
      }
      m.respawn = 0;
    }
    this.ui.setMenuAnchors([]);
  }

  private updateMenu(dt: number) {
    this.menuLock -= dt;
    const p = this.pointer.state;
    const aspect = this.camera.aspect;
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const anchors: Parameters<UI['setMenuAnchors']>[0] = [];
    const showing = this.screen === 'menu';

    for (let i = 0; i < this.menuFruits.length; i++) {
      const m = this.menuFruits[i];
      if (!m.obj) {
        if (!showing) continue;
        m.respawn -= dt;
        if (m.respawn > 0) continue;
        const created = createFruitModel(m.kind);
        created.position.copy(m.base);
        m.obj = created;
        m.appear = 0;
        m.hover = 0;
        this.scene.add(created);
      }
      const obj = m.obj!;
      m.appear = Math.min(1, m.appear + dt * 2.2);
      const pop = easeOutBack(m.appear);
      const s = MENU_RADIUS / FRUIT_SPECS[m.kind].radius; // normalise so all menu fruits look the same size
      obj.scale.setScalar(s * pop);
      obj.position.set(m.base.x, m.base.y + Math.sin(this.time * 1.6 + i * 2) * 0.12, m.base.z);
      obj.rotation.y += dt * 0.6;
      obj.rotation.z = Math.sin(this.time * 1.1 + i) * 0.15;

      _v.copy(obj.position).project(this.camera);
      const dist = this.camera.position.distanceTo(obj.position);
      const r = MENU_RADIUS / (dist * tanHalf);

      // dwell-to-select for phone users who hover steadily
      const dx = (p.x - _v.x) * aspect, dy = p.y - _v.y;
      const inside = p.source === 'phone' && p.active && dx * dx + dy * dy < r * r * 1.3;
      m.hover = inside && this.bladeSpeed < 1.2 ? m.hover + dt / 1.6 : Math.max(0, m.hover - dt * 2);
      if (m.hover >= 1 && this.menuLock <= 0) {
        this.camera.matrixWorld.extractBasis(_right, _up, _fwd);
        this.sliceMenuFruit(m, _v2.copy(_right).multiplyScalar(0.6).addScaledVector(_up, -1).normalize());
        continue;
      }
      anchors.push({
        id: m.mode, x: _v.x, y: _v.y, r: r * 1.35, hover: m.hover,
        label: m.mode === 'classic' ? 'Classic' : m.mode === 'arcade' ? 'Arcade' : 'Zen',
        sub: m.mode === 'classic' ? '3 lives · avoid bombs' : m.mode === 'arcade' ? '60s · power-ups' : '90s · no bombs',
      });
    }
    if (showing) this.ui.setMenuAnchors(anchors);
  }

  private sliceMenuFruit(m: MenuFruit, bladeDir: THREE.Vector3) {
    if (!m.obj) return;
    const obj = m.obj;
    m.obj = null;
    m.respawn = 1.2;
    this.menuLock = 1;
    const spec = FRUIT_SPECS[m.kind];
    this.spawnHalves(obj, obj.scale.x, spec.radius * obj.scale.x, new THREE.Vector3(0, 1, 0), bladeDir, spec.juiceColor);
    this.juice.burst(obj.position.clone(), bladeDir, spec.juiceColor, 1.4);
    this.sound.play('slice');
    this.sound.play('squish');
    this.haptic([25]);
    this.rig.shake(0.15);
    const mode = m.mode;
    setTimeout(() => {
      if (this.phase === 'menu' && this.screen === 'menu') this.selectMode(mode);
    }, 650);
  }

  // ----------------------------------------------------------- playing ---

  private updatePlaying(simDt: number, rawDt: number) {
    if (!this.spawner) return;
    this.stats.duration += rawDt;

    // timers
    if (MODE_RULES[this.mode].time) {
      this.timeLeft = Math.max(0, this.timeLeft - simDt);
      const sec = Math.ceil(this.timeLeft);
      if (sec <= 5 && sec !== this.lastTickSecond && sec > 0) {
        this.lastTickSecond = sec;
        this.sound.play('tick');
      }
      this.screenFx.setDanger(this.timeLeft < 5 ? 0.35 : 0);
      if (!this.pomegranateSpawned && this.timeLeft < 7 && this.timeLeft > 3) {
        this.pomegranateSpawned = true;
        this.pending.push({ kind: 'pomegranate', x: (Math.random() - 0.5) * 2, apex: 3.3, targetX: 0, delay: 0 });
      }
      const pomActive = this.fruits.some((f) => f.kind === 'pomegranate' && f.hover > 0);
      if (this.timeLeft <= 0 && !pomActive) {
        this.endRun('time');
        return;
      }
    }

    for (const [kind, left] of this.powerUps) {
      const next = left - rawDt;
      if (next <= 0) {
        this.powerUps.delete(kind);
        if (kind === 'freeze') {
          this.screenFx.setFrost(0);
          this.sound.setMuffled(false);
        }
        if (kind === 'frenzy') {
          this.screenFx.setFrenzy(0);
          this.rig.setZoom(0);
          this.sound.startMusic('game');
        }
      } else this.powerUps.set(kind, next);
    }

    const alive = this.fruits.filter((f) => !f.sliced && f.kind !== 'bomb').length;
    const reqs = this.spawner.update(simDt, alive, [...this.powerUps.keys()], MODE_RULES[this.mode].time ? this.timeLeft : undefined);
    if (reqs.length) this.pending.push(...reqs);
    for (let i = this.pending.length - 1; i >= 0; i--) {
      const r = this.pending[i];
      r.delay -= simDt;
      if (r.delay <= 0) {
        this.pending.splice(i, 1);
        this.launch(r);
      }
    }
    this.pushHud();
  }

  private launch(r: LaunchRequest) {
    const isBomb = r.kind === 'bomb';
    const obj = isBomb ? createBombModel() : createFruitModel(r.kind as Exclude<ThrowableKind, 'bomb'>);
    const baseRadius = isBomb ? 0.36 : FRUIT_SPECS[r.kind as Exclude<ThrowableKind, 'bomb'>].radius;
    obj.scale.setScalar(FRUIT_SCALE);
    const z = ACTION_Z + (Math.random() - 0.5) * 0.5;
    const vel = new THREE.Vector3();
    if (r.side) {
      // frenzy: thrown in from the side, flat arc
      obj.position.set(r.x, 1.2 + Math.random() * 1.5, z);
      const t = 1.3 + Math.random() * 0.5;
      vel.set((r.targetX - r.x) / t, (r.apex - obj.position.y) / t + (GRAVITY * t) / 2, 0);
    } else {
      obj.position.set(r.x, LAUNCH_Y, z);
      const vy = Math.sqrt(2 * GRAVITY * Math.max(0.5, r.apex - LAUNCH_Y));
      const tUp = vy / GRAVITY;
      vel.set((r.targetX - r.x) / tUp, vy, 0);
    }
    obj.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    this.scene.add(obj);
    const f: FruitEnt = {
      kind: r.kind, obj, radius: baseRadius * FRUIT_SCALE, vel, spin: randomSpin(new THREE.Vector3(), 1.2, 4.5),
      sliced: false, delay: 0, age: 0, hits: 0, hover: 0, lastHit: -1, noMiss: !!r.side,
      fuseTip: isBomb ? (obj.userData.fuseTip as THREE.Object3D | undefined) : undefined,
    };
    if (r.kind === 'pomegranate') f.spin.multiplyScalar(0.3);
    this.fruits.push(f);
    if (isBomb) this.ensureFuse();
    this.sound.play('throw', { volume: 0.35, pan: THREE.MathUtils.clamp(r.x / 5, -1, 1), pitch: 0.9 + Math.random() * 0.3 });
  }

  private updateFruits(dt: number) {
    if (dt <= 0) return;
    let bombs = 0;
    for (let i = this.fruits.length - 1; i >= 0; i--) {
      const f = this.fruits[i];
      f.age += dt;
      if (f.kind === 'pomegranate' && f.hover > 0) {
        // hangs in the air, shaking, while being sliced
        f.hover -= dt / Math.max(0.25, this.slowTime > 0 ? 0.25 : 1);
        f.vel.multiplyScalar(Math.pow(0.02, dt));
        f.obj.position.addScaledVector(f.vel, dt);
        const wob = 1 + Math.sin(this.time * 40) * 0.03 * Math.min(1, f.hits / 5);
        f.obj.scale.setScalar(FRUIT_SCALE * (1 + f.hits * 0.012) * wob);
        if (f.hover <= 0 || f.hits >= 30) this.burstPomegranate(f);
        continue;
      }
      f.vel.y -= GRAVITY * dt;
      f.obj.position.addScaledVector(f.vel, dt);
      integrateSpin(f.obj, f.spin, dt);
      if (f.kind === 'bomb') {
        bombs++;
        if (f.fuseTip && Math.random() < 0.8) this.sparks.emit(f.fuseTip.getWorldPosition(_v), 2);
      }
      const p = f.obj.position;
      if (!f.noMiss && f.vel.y < 0 && p.y < MISS_Y && !f.sliced) {
        this.onMissed(f);
        this.fruits.splice(i, 1);
        this.removeFruit(f);
        continue;
      }
      if (p.y < KILL_Y || Math.abs(p.x) > 12) {
        this.fruits.splice(i, 1);
        this.removeFruit(f);
      }
    }
    if (bombs === 0) this.stopFuse();
  }

  private onMissed(f: FruitEnt) {
    if (f.kind === 'bomb' || this.phase !== 'playing') return;
    if (f.kind === 'freeze' || f.kind === 'frenzy' || f.kind === 'double' || f.kind === 'pomegranate') return;
    this.stats.fruitsMissed++;
    if (this.mode !== 'classic') return;
    this.lives = Math.max(0, this.lives - 1);
    this.sound.play('lifeLost');
    this.haptic([80]);
    _v.copy(f.obj.position);
    _v.y = 0.4;
    this.popups.score(_v, '✕', '#e8433a');
    this.rig.shake(0.12);
    this.pushHud();
    if (this.lives <= 0) this.endRun('lives');
  }

  // ------------------------------------------------------------ slicing ---

  private onFruitCut(f: FruitEnt, bladeDir: THREE.Vector3) {
    const pos = f.obj.position.clone();
    const mult = this.powerUps.has('double') ? 2 : 1;

    if (f.kind === 'bomb') {
      f.sliced = true;
      this.fruits.splice(this.fruits.indexOf(f), 1);
      this.removeFruit(f);
      this.explosion.explode(pos);
      this.screenFx.flash('#ffffff', this.mode === 'classic' ? 0.9 : 0.4);
      if (this.settings.screenShake) this.rig.shake(1);
      this.sound.play('explosion');
      this.haptic([200, 60, 260]);
      this.stats.bombsHit++;
      if (this.mode === 'classic') {
        this.endRun('bomb');
      } else {
        this.score = Math.max(0, this.score - ARCADE_BOMB_PENALTY);
        this.popups.score(pos, `-${ARCADE_BOMB_PENALTY}`, '#e8433a');
        this.pushHud();
      }
      return;
    }

    if (f.kind === 'pomegranate') {
      f.lastHit = this.time;
      f.hits++;
      if (f.hover <= 0) {
        f.hover = 3.2;
        this.slowTime = 3.2;
        this.rig.setZoom(0.6);
        this.ui.banner('SLICE IT!', 'gold', 1500);
      }
      this.addScore(1 * mult);
      this.juice.burst(pos, bladeDir, 0xc8102e, 0.6);
      this.sound.play('pomegranateHit', { pitch: 1 + Math.min(f.hits, 20) * 0.03 });
      this.popups.score(pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 1.2, 0.6, 0)), `+${mult}`, '#ffcf3d');
      this.haptic([10]);
      return;
    }

    f.sliced = true;
    this.fruits.splice(this.fruits.indexOf(f), 1);
    const spec = FRUIT_SPECS[f.kind as Exclude<ThrowableKind, 'bomb'>];
    this.stopFuseIfNoBombs();

    // halves
    this.spawnHalves(f.obj, FRUIT_SCALE, f.radius, f.vel, bladeDir, spec.juiceColor);
    this.juice.burst(pos, bladeDir, spec.juiceColor, f.radius / 0.5);
    if (Math.random() < 0.12 && f.radius > 0.4) {
      _v.copy(pos).project(this.camera);
      this.screenFx.splat(cssHex(spec.juiceColor), _v.x, _v.y, 0.12 + Math.random() * 0.1);
    }
    this.sound.play('slice', { pan: THREE.MathUtils.clamp(pos.x / 5, -1, 1) });
    this.sound.play('squish', { volume: 0.8, pan: THREE.MathUtils.clamp(pos.x / 5, -1, 1) });
    this.haptic([14]);

    // power-ups
    if (f.kind === 'freeze' || f.kind === 'frenzy' || f.kind === 'double') {
      this.activatePowerUp(f.kind);
      return;
    }

    this.stats.fruitsSliced++;
    let pts = spec.points;
    if (this.mode !== 'zen' && this.bladeSpeed > 3 && Math.random() < CRITICAL_CHANCE) {
      pts += CRITICAL_POINTS;
      this.stats.criticals++;
      this.popups.critical(pos);
      this.sound.play('critical');
      this.slowTime = Math.max(this.slowTime, 0.25);
    } else {
      this.popups.score(pos, `+${pts * mult}`, mult > 1 ? '#ffcf3d' : '#f6ead2');
    }
    this.addScore(pts * mult);

    // combo
    if (this.comboCount === 0) this.comboAge = 0;
    this.comboCount++;
    this.comboTimer = COMBO_WINDOW;
    this.comboPos.lerp(pos, this.comboCount === 1 ? 1 : 0.5);
  }

  private finishCombo() {
    const n = this.comboCount;
    this.comboCount = 0;
    if (n < 3 || this.phase !== 'playing') return;
    const mult = this.powerUps.has('double') ? 2 : 1;
    const bonus = n * mult;
    this.stats.combos++;
    this.stats.bestCombo = Math.max(this.stats.bestCombo, n);
    this.addScore(bonus);
    this.popups.combo(this.comboPos.clone(), n, bonus);
    this.sound.play('combo', { pitch: 1 + Math.min(n - 3, 6) * 0.08 });
    this.haptic([20, 30, 20, 30, 40]);
    if (this.settings.screenShake) this.rig.shake(0.2 + n * 0.04);
  }

  private addScore(pts: number) {
    this.score += pts;
    if (this.mode === 'classic' && this.score >= this.nextExtraLife) {
      this.nextExtraLife += EXTRA_LIFE_EVERY;
      const max = MODE_RULES.classic.lives!;
      if (this.lives < max) {
        this.lives++;
        this.ui.banner('+1 LIFE', 'info', 1400);
        this.sound.play('double');
      }
    }
    this.pushHud();
  }

  private activatePowerUp(kind: PowerUpKind) {
    const fresh = !this.powerUps.has(kind);
    this.powerUps.set(kind, POWERUP_DURATION[kind]);
    this.sound.play(kind);
    this.haptic([30, 40, 30]);
    if (kind === 'freeze') {
      this.ui.banner('FREEZE!', 'freeze', 1400);
      this.screenFx.setFrost(1);
      this.sound.setMuffled(true);
    } else if (kind === 'frenzy') {
      this.ui.banner('FRENZY!', 'frenzy', 1400);
      this.screenFx.setFrenzy(1);
      this.rig.setZoom(0.35);
      this.spawner?.startFrenzy(POWERUP_DURATION.frenzy - 0.5);
      if (fresh) this.sound.startMusic('frenzy');
    } else {
      this.ui.banner('DOUBLE SCORE!', 'double', 1400);
    }
    this.trail.setColor(POWERUP_COLORS[kind]);
    setTimeout(() => this.trail.setColor(this.settings.bladeColor), 600);
  }

  private burstPomegranate(f: FruitEnt) {
    const pos = f.obj.position.clone();
    const idx = this.fruits.indexOf(f);
    if (idx >= 0) this.fruits.splice(idx, 1);
    this.camera.matrixWorld.extractBasis(_right, _up, _fwd);
    this.spawnHalves(f.obj, f.obj.scale.x, f.radius, new THREE.Vector3(0, 2, 0), _right, 0xc8102e);
    this.juice.burst(pos, _up, 0xc8102e, 2.2);
    this.juice.burst(pos, _right, 0xc8102e, 2.2);
    this.screenFx.splat('#c8102e', 0, 0.1, 0.38);
    const bonus = f.hits * (this.powerUps.has('double') ? 2 : 1);
    this.addScore(bonus);
    this.popups.combo(pos, f.hits, bonus);
    this.sound.play('pomegranateBurst');
    this.rig.setZoom(0);
    this.slowTime = 0;
    if (this.settings.screenShake) this.rig.shake(0.5);
    this.haptic([60, 30, 120]);
  }

  /**
   * Cut `src` and throw both halves. The cut plane contains the blade
   * direction and the view direction so the split always reads on screen.
   */
  private spawnHalves(src: THREE.Group, scale: number, radius: number, vel: THREE.Vector3, bladeDir: THREE.Vector3, _color: number) {
    this.camera.matrixWorld.extractBasis(_right, _up, _fwd);
    _fwd.negate(); // camera looks down -Z
    const nWorld = _n.crossVectors(bladeDir, _fwd).normalize();
    if (nWorld.lengthSq() < 0.5) nWorld.copy(_right);
    _qInv.copy(src.quaternion).invert();
    const nLocal = nWorld.clone().applyQuaternion(_qInv).normalize();

    let result;
    try {
      result = sliceFruit(src, nLocal);
    } catch (e) {
      console.warn('[slice] failed', e);
      this.scene.remove(src);
      disposeObject(src);
      return;
    }
    this.scene.remove(src);
    disposeObject(src);

    result.halves.forEach((h, i) => {
      const sign = i === 0 ? 1 : -1;
      const obj = h.object;
      // which side is this half on? use its offset along the normal
      const side = Math.sign(h.localOffset.dot(nLocal)) || sign;
      obj.quaternion.copy(src.quaternion);
      obj.scale.setScalar(scale);
      obj.position.copy(h.localOffset).multiplyScalar(scale).applyQuaternion(src.quaternion).add(src.position);
      obj.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) o.castShadow = true;
      });
      this.scene.add(obj);
      const v = new THREE.Vector3()
        .copy(vel).multiplyScalar(0.45)
        .addScaledVector(nWorld, side * (1.4 + Math.random() * 0.8))
        .add(new THREE.Vector3((Math.random() - 0.5) * 0.4, 1 + Math.random() * 1.2, 1.1 + Math.random() * 1.1));
      const spin = new THREE.Vector3().copy(_fwd).cross(nWorld).multiplyScalar(side * (3 + Math.random() * 4));
      spin.add(randomSpin(new THREE.Vector3(), 0.5, 2));
      this.halves.push({ obj, vel: v, spin, r: radius * 0.5, restTime: 0, life: 0, thudCooldown: 0, fading: 0, baseScale: scale });
    });

    // keep the number of halves bounded
    for (let i = 0; this.halves.length - i > 26; i++) if (this.halves[i].fading <= 0) this.halves[i].fading = 0.0001;
  }

  private updateHalves(dt: number) {
    if (dt <= 0) return;
    for (let i = this.halves.length - 1; i >= 0; i--) {
      const h = this.halves[i];
      h.life += dt;
      h.thudCooldown -= dt;
      const p = h.obj.position;
      h.vel.y -= GRAVITY * 1.15 * dt;
      p.addScaledVector(h.vel, dt);
      integrateSpin(h.obj, h.spin, dt);

      const overTable = p.x > TABLE.minX && p.x < TABLE.maxX && p.z > TABLE.minZ && p.z < TABLE.maxZ;
      if (overTable && p.y < TABLE.topY + h.r) {
        if (h.vel.y < 0) {
          const impact = -h.vel.y;
          p.y = TABLE.topY + h.r;
          h.vel.y = impact > 1.2 ? impact * 0.28 : 0;
          h.vel.x *= 0.72;
          h.vel.z *= 0.6;
          h.spin.multiplyScalar(0.55);
          if (impact > 1.5 && h.thudCooldown <= 0) {
            h.thudCooldown = 0.25;
            this.sound.play('thud', { volume: Math.min(1, impact / 7), pan: THREE.MathUtils.clamp(p.x / 5, -1, 1) });
          }
        }
        // friction while sliding
        const f = Math.pow(0.08, dt);
        h.vel.x *= f;
        h.vel.z *= f;
        h.spin.multiplyScalar(Math.pow(0.05, dt));
        if (h.vel.lengthSq() < 0.05) h.restTime += dt;
      }

      if (h.fading <= 0 && (h.restTime > 2 || h.life > 6)) h.fading = 0.0001;
      if (h.fading > 0) h.fading += dt;
      if (h.fading > 0) {
        const k = Math.max(0, 1 - h.fading / 0.6);
        h.obj.scale.setScalar(h.baseScale * k);
        if (k <= 0) {
          this.removeHalf(i);
          continue;
        }
      }
      if (p.y < KILL_Y) this.removeHalf(i);
    }
  }

  private removeHalf(i: number) {
    const h = this.halves[i];
    this.halves.splice(i, 1);
    this.scene.remove(h.obj);
    disposeObject(h.obj);
  }

  private removeFruit(f: FruitEnt) {
    this.scene.remove(f.obj);
    disposeObject(f.obj);
  }

  // -------------------------------------------------------------- misc ---

  private ensureFuse() {
    if (!this.bombFuse) this.bombFuse = this.sound.loop('bombFuse', { volume: 0.5 });
  }

  private stopFuse() {
    this.bombFuse?.stop();
    this.bombFuse = null;
  }

  private stopFuseIfNoBombs() {
    if (!this.fruits.some((f) => f.kind === 'bomb')) this.stopFuse();
  }

  private hudCache = '';
  private pushHud() {
    const rules = MODE_RULES[this.mode];
    const hud: HudState = {
      mode: this.mode,
      score: this.score,
      best: Math.max(this.best, this.score),
      lives: rules.lives ? this.lives : undefined,
      maxLives: rules.lives,
      timeLeft: rules.time ? this.timeLeft : undefined,
      multiplier: this.powerUps.has('double') ? 2 : 1,
      powerUps: [...this.powerUps].map(([kind, left]) => ({ kind, remaining: left / POWERUP_DURATION[kind] })),
    };
    this.ui.updateHud(hud);
    const key = `${this.score}|${this.lives}`;
    if (key !== this.hudCache) {
      this.hudCache = key;
      this.sendPhone({ t: 'state', screen: this.screen, score: this.score, lives: this.lives, mode: this.mode, best: hud.best });
    }
  }

  private haptic(pattern: number[]) {
    if (this.settings.haptics) this.sendPhone({ t: 'haptic', pattern });
  }

  private sendPhone(msg: GameToPhone) {
    if (this.link.info.status === 'connected') this.link.send(msg);
  }
}

function blankStats(): RunStats {
  return { fruitsSliced: 0, fruitsMissed: 0, bombsHit: 0, combos: 0, bestCombo: 0, criticals: 0, duration: 0 };
}

function easeOutBack(t: number) {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function cssHex(n: number) {
  return '#' + n.toString(16).padStart(6, '0');
}
