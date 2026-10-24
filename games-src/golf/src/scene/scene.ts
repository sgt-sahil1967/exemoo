/** GolfScene implementation: renderer, lights, world building and per-frame orchestration. */
import {
  ACESFilmicToneMapping,
  Color,
  DirectionalLight,
  Fog,
  Group,
  HemisphereLight,
  Material,
  Mesh,
  PCFShadowMap,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three';
import type { CameraMode, ClubId, ClubPose, FxKind, GolferAnim, GolferLook, GolfScene, Hole, Quality, Wind } from '../core/contracts';
import { yawForward } from '../core/contracts';
import { AimView } from './aim';
import { BallView } from './ball';
import { CameraRig } from './cameras';
import { Fx } from './fx';
import { Golfer } from './golfer';
import { GreenGrid } from './greenGrid';
import { buildPin } from './pin';
import { buildBackdrop, createBirds, createClouds, createSkyDome, SKY } from './sky';
import { buildTerrain } from './terrain';
import { buildTrees } from './trees';
import { buildWater } from './water';
import { clamp } from './util';

const SUN_DIR = new Vector3(-0.45, 0.78, 0.42).normalize();

interface HoleWorld {
  group: Group;
  water: ReturnType<typeof buildWater> | null;
  pin: ReturnType<typeof buildPin>;
  dispose(): void;
  heightAt(x: number, z: number): number;
}

export class GolfSceneImpl implements GolfScene {
  readonly canvas: HTMLCanvasElement;
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(50, 1, 0.08, 6000);
  private rig = new CameraRig(this.camera);
  private sun = new DirectionalLight('#fff3dc', 2.6);
  private hemi = new HemisphereLight('#cfeaff', '#5c8f3a', 1.35);
  private fog = new Fog(SKY.horizon, 200, 1100);
  private sky = createSkyDome();
  private clouds = createClouds();
  private birds = createBirds();
  private golfer = new Golfer();
  private ball = new BallView();
  private aim = new AimView();
  private grid = new GreenGrid();
  private fxs = new Fx();
  private world: HoleWorld | null = null;
  private hole: Hole | null = null;
  private quality: Quality = 'high';
  private t = 0;
  private w = 1;
  private h = 1;
  private golferArgs: { pos: Vector3; yaw: number; look: GolferLook; club: ClubId } | null = null;
  private wind: Wind = { yaw: 0, speed: 2 };
  private focus = new Vector3();
  private ro: ResizeObserver | null = null;

  constructor(container: HTMLElement) {
    // MSAA only on standard-density screens: at 2× pixel ratio edges are already smooth and MSAA is 4× the fill cost.
    this.renderer = new WebGLRenderer({ antialias: (typeof devicePixelRatio === 'number' ? devicePixelRatio : 1) < 1.5, powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFShadowMap;
    // Shadows are re-rendered every other frame (see render()): half the shadow-pass cost, same look.
    this.renderer.shadowMap.autoUpdate = false;
    this.canvas = this.renderer.domElement;
    this.canvas.style.display = 'block';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    container.appendChild(this.canvas);

    this.scene.background = new Color(SKY.horizon);
    this.scene.fog = this.fog;
    this.scene.add(this.sky.mesh, this.hemi, this.sun, this.sun.target, this.clouds.group, this.birds.group);
    this.sun.castShadow = true;
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.03;
    this.sky.setSun(SUN_DIR);
    this.scene.add(this.golfer.root, this.ball.group, this.aim.group, this.grid.group, this.fxs.group);
    this.applyQuality();

    const r = container.getBoundingClientRect();
    this.resize(r.width || innerWidth, r.height || innerHeight);
    if (typeof ResizeObserver !== 'undefined') {
      this.ro = new ResizeObserver((e) => {
        const cr = e[0].contentRect;
        if (cr.width > 0 && cr.height > 0 && (Math.abs(cr.width - this.w) > 0.5 || Math.abs(cr.height - this.h) > 0.5)) this.resize(cr.width, cr.height);
      });
      this.ro.observe(container);
    }
  }

  get cameraBusy() {
    return this.rig.busy;
  }

  /** View yaw of the camera (handy for HUD wind arrows). */
  get viewYaw() {
    return this.rig.viewYaw;
  }

  private applyQuality() {
    const q = this.quality;
    const dpr = typeof devicePixelRatio === 'number' ? devicePixelRatio : 1;
    const pr = q === 'low' ? 1 : q === 'medium' ? Math.min(dpr, 1.5) : Math.min(dpr, 2);
    this.renderer.setPixelRatio(pr);
    this.grid.setPixelRatio(pr);
    const shadows = q !== 'low';
    if (this.renderer.shadowMap.enabled !== shadows) {
      this.renderer.shadowMap.enabled = shadows;
      this.scene.traverse((o) => {
        if (o instanceof Mesh) {
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach((m: Material) => (m.needsUpdate = true));
        }
      });
    }
    this.sun.castShadow = shadows;
    const size = q === 'high' ? 2048 : 1024;
    if (this.sun.shadow.mapSize.x !== size) {
      this.sun.shadow.mapSize.set(size, size);
      this.sun.shadow.map?.dispose();
      this.sun.shadow.map = null;
    }
    this.fxs.setQuality(q);
  }

  setQuality(q: Quality) {
    if (q === this.quality) return;
    this.quality = q;
    this.applyQuality();
    if (this.hole) this.setHole(this.hole);
  }

  setHole(hole: Hole) {
    this.disposeWorld();
    this.hole = hole;
    const group = new Group();
    group.name = 'hole';
    const maxTex = Math.min(4096, this.renderer.capabilities.maxTextureSize);
    const terrain = buildTerrain(hole, this.quality, maxTex);
    group.add(terrain.mesh);
    const hf = terrain.heightAt;
    const water = hole.waterLevel !== null && terrain.waterBox ? buildWater(hole.waterLevel, terrain.waterBox, hf) : null;
    if (water) {
      water.setSun(SUN_DIR);
      group.add(water.mesh);
    }
    const trees = buildTrees(hole, hf, terrain.ext, this.quality);
    group.add(trees.group);
    const ext = terrain.ext;
    const cx = (ext.minX + ext.maxX) / 2;
    const cz = (ext.minZ + ext.maxZ) / 2;
    const innerR = Math.min(ext.maxX - ext.minX, ext.maxZ - ext.minZ) / 2 - 10;
    const backdrop = buildBackdrop(cx, cz, innerR, hf, Math.min(hole.tee.y, hole.pin.y));
    group.add(backdrop.group);
    const pin = buildPin(hole);
    pin.setWind(this.wind.yaw, this.wind.speed);
    group.add(pin.group);
    this.scene.add(group);

    this.golfer.setHeightFn(hf);
    this.ball.setHeightFn(hf);
    this.aim.setHeightFn(hf);
    this.fxs.setHeightFn(hf);
    this.fxs.clear();
    this.grid.setHole(hole);
    this.rig.setHole(hole, hf);
    this.clouds.recenter(new Vector3(cx, 0, cz));
    this.world = {
      group,
      water,
      pin,
      heightAt: hf,
      dispose() {
        terrain.dispose();
        water?.dispose();
        trees.dispose();
        backdrop.dispose();
        pin.dispose();
      },
    };
    if (this.golferArgs) {
      const g = this.golferArgs;
      this.setGolfer(g.pos, g.yaw, g.look, g.club);
    }
  }

  private disposeWorld() {
    if (!this.world) return;
    this.scene.remove(this.world.group);
    this.world.dispose();
    this.world = null;
  }

  setWind(w: Wind) {
    this.wind = { ...w };
    const f = yawForward(w.yaw, new Vector3());
    this.clouds.setWind(f.x * w.speed, f.z * w.speed);
    this.world?.water?.setWind(f.x * w.speed, f.z * w.speed);
    this.world?.pin.setWind(w.yaw, w.speed);
  }

  setBall(pos: Vector3, visible = true) {
    this.ball.set(pos, visible);
  }

  setBallFlying(on: boolean) {
    this.ball.setFlying(on);
  }

  setGolfer(pos: Vector3, yaw: number, look: GolferLook, club: ClubId) {
    this.golferArgs = { pos: pos.clone(), yaw, look: { ...look }, club };
    this.golfer.place(pos, yaw, look, club);
  }

  setGolferPose(anim: GolferAnim, pose?: ClubPose) {
    this.golfer.setAnim(anim, pose);
  }

  setAim(from: Vector3 | null, landing?: Vector3, putt?: boolean) {
    this.aim.set(from, landing, putt);
  }

  setGreenGrid(on: boolean) {
    this.grid.set(on);
  }

  setCamera(mode: CameraMode, opts?: { ball?: Vector3; target?: Vector3; yaw?: number; instant?: boolean }) {
    this.rig.set(mode, opts);
  }

  /** Dev/debug: pin the camera to an explicit pose (null releases it). */
  debugCamera(pos: Vector3 | null, look?: Vector3) {
    this.debugCam = pos ? { pos: pos.clone(), look: (look ?? new Vector3()).clone() } : null;
  }
  private debugCam: { pos: Vector3; look: Vector3 } | null = null;

  /** Jump to the end of a running flyover. */
  skipFlyover() {
    this.rig.skipFlyover();
  }

  fx(kind: FxKind, pos: Vector3) {
    this.fxs.spawn(kind, pos);
  }

  worldToScreen(p: Vector3) {
    const v = p.clone().applyMatrix4(this.camera.matrixWorldInverse);
    if (v.z > -this.camera.near) return null;
    v.applyMatrix4(this.camera.projectionMatrix);
    return { x: (v.x * 0.5 + 0.5) * this.w, y: (-v.y * 0.5 + 0.5) * this.h };
  }

  update(dt: number) {
    dt = clamp(dt, 0, 0.1);
    this.t += dt;
    this.rig.trackBall(this.ball.pos, dt);
    this.golfer.update(dt);
    this.rig.update(dt);
    if (this.debugCam) {
      this.camera.position.copy(this.debugCam.pos);
      this.camera.up.set(0, 1, 0);
      this.camera.lookAt(this.debugCam.look);
    }
    this.camera.updateMatrixWorld();
    const cam = this.camera.position;
    this.ball.update(dt, this.camera);
    this.aim.update(dt);
    this.grid.update(dt, this.t);
    this.fxs.update(dt);
    this.world?.water?.update(this.t);
    this.world?.pin.update(this.t, dt, cam);
    this.sky.mesh.position.copy(cam);
    this.clouds.update(dt, this.focus);
    this.birds.update(dt, this.ball.pos);

    // shadow camera follows the action (what the camera looks at, near the ball)
    const mode = this.rig.mode;
    const fwd = this.camera.getWorldDirection(new Vector3());
    const ground = this.world ? this.world.heightAt(cam.x, cam.z) : 0;
    const height = Math.max(1, cam.y - ground);
    const range = mode === 'top' || mode === 'menu' || mode === 'flyover' ? 120 : 34;
    this.focus.copy(cam).addScaledVector(fwd, mode === 'address' || mode === 'green' ? 12 : Math.min(60, height * 1.2 + 10));
    if (mode === 'follow' || mode === 'landing' || mode === 'celebrate') this.focus.lerp(this.ball.pos, 0.6);
    if (this.world) this.focus.y = this.world.heightAt(this.focus.x, this.focus.z);
    const sc = this.sun.shadow.camera;
    if (sc.right !== range) {
      sc.left = -range;
      sc.right = range;
      sc.top = range;
      sc.bottom = -range;
      sc.near = 1;
      sc.far = 400;
      sc.updateProjectionMatrix();
    }
    // snap to shadow texels to avoid shimmering
    const texel = (range * 2) / this.sun.shadow.mapSize.x;
    const fx = Math.round(this.focus.x / texel) * texel;
    const fz = Math.round(this.focus.z / texel) * texel;
    this.sun.target.position.set(fx, this.focus.y, fz);
    this.sun.position.set(fx, this.focus.y, fz).addScaledVector(SUN_DIR, 200);
    this.sun.target.updateMatrixWorld();

    // fog scales with altitude so overhead views stay clear
    const top = mode === 'top';
    this.fog.near = top ? height * 2.5 : 260 + height * 1.6;
    this.fog.far = top ? height * 6 : 1500 + height * 3;
  }

  private frameNo = 0;
  render() {
    if (this.frameNo++ % 2 === 0) this.renderer.shadowMap.needsUpdate = true;
    this.renderer.render(this.scene, this.camera);
  }

  resize(w: number, h: number) {
    this.w = Math.max(1, w);
    this.h = Math.max(1, h);
    this.renderer.setSize(this.w, this.h, false);
    this.camera.aspect = this.w / this.h;
    this.camera.fov = this.camera.aspect < 0.8 ? 62 : 50;
    this.camera.updateProjectionMatrix();
  }

  dispose() {
    this.ro?.disconnect();
    this.disposeWorld();
    this.golfer.dispose();
    this.ball.dispose();
    this.aim.dispose();
    this.grid.dispose();
    this.fxs.dispose();
    this.clouds.dispose();
    this.birds.dispose();
    this.renderer.dispose();
    this.canvas.remove();
  }
}

export function createScene(container: HTMLElement): GolfScene {
  return new GolfSceneImpl(container);
}
