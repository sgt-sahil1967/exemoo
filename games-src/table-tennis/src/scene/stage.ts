/**
 * SPINSHOT stage: renderer, lights, environment theme, table, avatars, ball, FX, scoreboard, camera.
 * See docs/API.md section C.
 */
import {
  ACESFilmicToneMapping,
  Color,
  DirectionalLight,
  Fog,
  HemisphereLight,
  Mesh,
  MathUtils,
  PCFShadowMap,
  PerspectiveCamera,
  Scene,
  SpotLight,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
  type Material,
} from 'three';
import type { AvatarPose, CameraMode, Handedness, Quality, Side, ThemeName } from '../core/contracts';
import { HALF_W, PALETTE, TABLE } from '../core/contracts';
import { buildEnvironment, type Environment } from './arena';
import { Avatar } from './avatar';
import { BallView } from './ball';
import { CameraRig } from './camera';
import { FxSystem, pointScale } from './fx';
import { ScoreboardView } from './scoreboard';
import { TableView } from './table';
import { disposeTree } from './util';

/** Opacity of the human player's body (paddle stays opaque). */
const PLAYER_GHOST = 0.13;
/** Slow-mo grade: cool tint colour and how far each channel is pushed toward it at k = 1. */
const SLOW_COOL = new Color('#5f86c8');
const SLOW_EASE_RATE = 4; // k units per second (~0.25 s in/out)

export class Stage {
  readonly camera: PerspectiveCamera;
  readonly renderer: WebGLRenderer;
  readonly scene = new Scene();
  readonly fx: {
    bounce(pos: Vector3, side: Side): void;
    hit(pos: Vector3, power: number, side: Side): void;
    net(pos: Vector3): void;
    floor(pos: Vector3): void;
    pointWon(side: Side): void;
    confetti(): void;
  };

  private container: HTMLElement;
  private quality: Quality;
  private theme: ThemeName;
  private env: Environment | null = null;
  private hemi = new HemisphereLight();
  private sun = new DirectionalLight();
  private spot = new SpotLight();
  private table = new TableView();
  private ball = new BallView();
  private fxs = new FxSystem();
  private board = new ScoreboardView();
  private rig: CameraRig;
  private camera2: PerspectiveCamera;
  private rig2: CameraRig;
  private split = false;
  private vw = 1;
  private vh = 1;
  private slowTarget = 0;
  private slowK = 0;
  private baseExposure = 1;
  private baseBg = new Color();
  private baseHemiSky = new Color();
  private baseHemiGround = new Color();
  private baseHemi = 1;
  private avatars: Record<Side, Avatar>;
  private time = 0;
  private ghost = PLAYER_GHOST;
  private ro: ResizeObserver | null = null;
  private onResize = (): void => this.resize();

  constructor(container: HTMLElement, opts: { quality: Quality; theme: ThemeName }) {
    this.container = container;
    this.quality = opts.quality;
    this.theme = opts.theme;
    this.renderer = new WebGLRenderer({ antialias: opts.quality !== 'low', powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.shadowMap.type = PCFShadowMap;
    const cv = this.renderer.domElement;
    cv.style.display = 'block';
    cv.style.width = '100%';
    cv.style.height = '100%';
    container.appendChild(cv);

    this.camera = new PerspectiveCamera(52, 1.6, 0.05, 80);
    this.rig = new CameraRig(this.camera);
    this.camera2 = new PerspectiveCamera(52, 1.6, 0.05, 80);
    this.rig2 = new CameraRig(this.camera2, 'opponent');

    // light rig (constant light count across themes)
    this.scene.add(this.hemi);
    this.sun.position.set(-3, 7, 2.5);
    this.sun.target.position.set(0, 0.6, 0);
    const sc = this.sun.shadow.camera;
    sc.left = -4.2;
    sc.right = 4.2;
    sc.top = 4.6;
    sc.bottom = -4.6;
    sc.near = 1;
    sc.far = 20;
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.02;
    this.sun.shadow.radius = 4;
    this.scene.add(this.sun, this.sun.target);
    this.spot.position.set(0, 6.6, 0.4);
    this.spot.target.position.set(0, TABLE.height, 0);
    this.spot.angle = 0.55;
    this.spot.penumbra = 0.85;
    this.spot.decay = 2;
    this.spot.distance = 0;
    this.scene.add(this.spot, this.spot.target);

    this.scene.add(this.table.group, this.ball.group, this.fxs.group, this.board.group);
    this.board.group.position.set(-(HALF_W + 1.05), 0, -0.15);
    this.board.group.rotation.y = 0.42;

    this.avatars = { player: new Avatar('player', PALETTE.accent), opponent: new Avatar('opponent', PALETTE.accent2) };
    this.avatars.player.setGhost(PLAYER_GHOST);
    this.scene.add(this.avatars.player.group, this.avatars.opponent.group);

    this.fxs.onShake = (a) => this.shake(a);
    this.fxs.onPulse = (side, color) => this.env?.pulse(side, color);
    const f = this.fxs;
    this.fx = {
      bounce: (p, s) => f.bounce(p, s),
      hit: (p, pw, s) => f.hit(p, pw, s),
      net: (p) => {
        f.net(p);
        this.table.wobble(p);
      },
      floor: (p) => f.floor(p),
      pointWon: (s) => f.pointWon(s),
      confetti: () => f.confettiBurst(),
    };

    this.applyTheme();
    this.applyQuality();
    window.addEventListener('resize', this.onResize);
    if (typeof ResizeObserver !== 'undefined') {
      this.ro = new ResizeObserver(this.onResize);
      this.ro.observe(container);
    }
    this.resize();
  }

  // ─────────────────────────────── theme / quality ───────────────────────────────
  setTheme(t: ThemeName): void {
    if (t === this.theme) return;
    this.theme = t;
    this.applyTheme();
  }

  setQuality(q: Quality): void {
    if (q === this.quality) return;
    const shadowsChanged = (q === 'low') !== (this.quality === 'low');
    this.quality = q;
    this.applyQuality();
    this.applyTheme(); // crowd density depends on quality
    if (shadowsChanged) {
      this.scene.traverse((o) => {
        const m = (o as Mesh).material as Material | Material[] | undefined;
        if (!m) return;
        for (const x of Array.isArray(m) ? m : [m]) x.needsUpdate = true;
      });
    }
  }

  private applyTheme(): void {
    if (this.env) {
      this.scene.remove(this.env.group);
      disposeTree(this.env.group);
    }
    this.env = buildEnvironment(this.theme, this.quality);
    this.scene.add(this.env.group);
    const L = this.env.lights;
    this.scene.background = new Color(L.background);
    this.scene.fog = new Fog(L.fog[0], L.fog[1], L.fog[2]);
    this.hemi.color.set(L.hemiSky);
    this.hemi.groundColor.set(L.hemiGround);
    this.hemi.intensity = L.hemi;
    // remember the theme's base look so slow-mo can blend from it and restore it exactly
    this.baseBg.set(L.background);
    this.baseHemiSky.set(L.hemiSky);
    this.baseHemiGround.set(L.hemiGround);
    this.baseHemi = L.hemi;
    this.baseExposure = L.exposure;
    this.sun.color.set(L.dirColor);
    this.sun.intensity = L.dir;
    this.sun.position.set(...L.dirPos);
    this.spot.color.set(L.spotColor);
    this.spot.intensity = L.spot;
    this.renderer.toneMappingExposure = L.exposure;
    this.applySlowLook();
  }

  private applyQuality(): void {
    const q = this.quality;
    const dpr = window.devicePixelRatio || 1;
    this.renderer.setPixelRatio(q === 'low' ? 1 : q === 'medium' ? Math.min(dpr, 1.5) : Math.min(dpr, 2));
    this.renderer.shadowMap.enabled = q !== 'low';
    this.sun.castShadow = q !== 'low';
    const size = q === 'high' ? 2048 : 1024;
    if (this.sun.shadow.mapSize.x !== size) {
      this.sun.shadow.mapSize.set(size, size);
      this.sun.shadow.map?.dispose();
      this.sun.shadow.map = null;
    }
    this.sun.shadow.radius = q === 'high' ? 5 : 3;
    this.resize();
  }

  private resize(): void {
    const w = Math.max(1, this.container.clientWidth || window.innerWidth);
    const h = Math.max(1, this.container.clientHeight || window.innerHeight);
    this.vw = w;
    this.vh = h;
    this.renderer.setSize(w, h, false);
    const aspect = (this.split ? w / 2 : w) / h;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
    this.camera2.aspect = aspect;
    this.camera2.updateProjectionMatrix();
  }

  /** Split screen on/off: left = player camera, right = mirrored opponent camera. */
  setSplit(on: boolean): void {
    if (on === this.split) return;
    this.split = on;
    // the opponent only needs the ghost (depth pre-pass) machinery while it is rendered ghosted
    this.avatars.opponent.setGhost(on ? PLAYER_GHOST : null);
    if (on) this.rig2.snap();
    this.resize();
  }

  /** Slow-mo look target 0..1; the applied value eases toward it (~0.25 s). */
  setSlowMo(k: number): void {
    this.slowTarget = MathUtils.clamp(k, 0, 1);
  }

  /** Apply the eased slow-mo grade on top of the current theme's base look. */
  private applySlowLook(): void {
    const k = this.slowK;
    const e = k * k * (3 - 2 * k);
    this.renderer.toneMappingExposure = this.baseExposure * (1 - 0.22 * e);
    if (this.scene.background instanceof Color) this.scene.background.copy(this.baseBg).lerp(SLOW_COOL, 0.45 * e);
    if (this.scene.fog) this.scene.fog.color.copy(this.baseBg).lerp(SLOW_COOL, 0.45 * e);
    this.hemi.color.copy(this.baseHemiSky).lerp(SLOW_COOL, 0.4 * e);
    this.hemi.groundColor.copy(this.baseHemiGround).lerp(SLOW_COOL, 0.3 * e);
    this.hemi.intensity = this.baseHemi * (1 - 0.1 * e);
    this.rig.slowMo = e;
    this.rig2.slowMo = e;
    this.ball.setSlowMo(e);
  }

  // ─────────────────────────────── gameplay views ───────────────────────────────
  setBall(pos: Vector3, spin: Vector3, visible: boolean): void {
    this.ball.set(pos, spin, visible);
  }

  setAvatar(side: Side, pose: AvatarPose, opts?: { backhand?: boolean; handedness?: Handedness; swing?: number }): void {
    this.avatars[side].setPose(pose, opts);
  }

  avatarReact(side: Side, mood: 'idle' | 'cheer' | 'sad'): void {
    this.avatars[side].react(mood);
  }

  setAvatarColors(side: Side, color: string): void {
    this.avatars[side].setColor(color);
  }

  setTrajectory(points: Vector3[] | null): void {
    this.fxs.setTrajectory(points);
  }

  setTargets(targets: { id: string; pos: Vector3; radius: number; color?: string }[]): void {
    this.fxs.setTargets(targets);
  }

  hitTarget(id: string): void {
    this.fxs.hitTarget(id);
  }

  setScoreboard(s: { player: number; opponent: number; gamesP: number; gamesO: number; names: [string, string] }): void {
    this.board.set(s);
  }

  /** `opts.side` (extension): whose end the 'celebrate' orbit circles; default 'player'. */
  setCameraMode(mode: CameraMode, opts?: { side?: Side }): void {
    this.rig.setMode(mode, opts);
    this.rig2.setMode(mode, opts);
  }

  shake(amount: number): void {
    this.rig.shake(amount);
    this.rig2.shake(amount);
  }

  update(dt: number, focus: { ball: Vector3; player: Vector3; opponent?: Vector3 }): void {
    dt = Math.max(0, Math.min(dt, 0.1));
    this.time += dt;
    this.env?.update(dt, this.time);
    this.avatars.player.update(dt);
    this.avatars.opponent.update(dt);
    this.table.update(dt);
    this.board.update(dt);
    if (this.slowK !== this.slowTarget) {
      const d = SLOW_EASE_RATE * dt;
      this.slowK = Math.abs(this.slowTarget - this.slowK) <= d ? this.slowTarget : this.slowK + Math.sign(this.slowTarget - this.slowK) * d;
      this.applySlowLook();
    }
    this.rig.update(dt, focus);
    if (this.split) this.rig2.update(dt, { ball: focus.ball, player: focus.opponent ?? focus.ball });
    const close = this.rig.mode === 'play' || this.rig.mode === 'serve' || this.rig.mode === 'point';
    this.ghost += ((close ? PLAYER_GHOST : 1) - this.ghost) * (1 - Math.exp(-4 * dt));
    this.camera.updateMatrixWorld();
    this.ball.update(dt, this.camera);
    this.fxs.update(dt);
    const hPx = this.renderer.domElement.height;
    pointScale.value = hPx / (2 * Math.tan(MathUtils.degToRad(this.camera.fov) / 2));
  }

  render(): void {
    const r = this.renderer;
    if (!this.split) {
      r.setScissorTest(false);
      r.setViewport(0, 0, this.vw, this.vh);
      this.avatars.player.setOpacity(this.ghost);
      r.render(this.scene, this.camera);
      return;
    }
    const hw = Math.floor(this.vw / 2);
    r.setScissorTest(true);
    // left: player camera, ghost the player's body
    r.setViewport(0, 0, hw, this.vh);
    r.setScissor(0, 0, hw, this.vh);
    this.avatars.player.setOpacity(this.ghost);
    this.avatars.opponent.setOpacity(1);
    r.render(this.scene, this.camera);
    // right: opponent camera, ghost the opponent's body
    r.setViewport(hw, 0, this.vw - hw, this.vh);
    r.setScissor(hw, 0, this.vw - hw, this.vh);
    this.avatars.player.setOpacity(1);
    this.avatars.opponent.setOpacity(this.ghost);
    this.camera2.updateMatrixWorld();
    this.ball.faceCamera(this.camera2);
    r.render(this.scene, this.camera2);
    // restore for the next frame's single-pass users / left-pass trail orientation
    r.setScissorTest(false);
    r.setViewport(0, 0, this.vw, this.vh);
  }

  /** Extension: release GPU resources and listeners. */
  dispose(): void {
    window.removeEventListener('resize', this.onResize);
    this.ro?.disconnect();
    if (this.env) disposeTree(this.env.group);
    disposeTree(this.scene);
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
