import { Vector3 } from 'three';
import { OneEuroBank } from './filters';
import { ModelVariant, N_LANDMARKS, PoseDetector, PoseFrame } from './pose-detector';
import type { WorkerIn, WorkerOut } from './pose-worker';
import { L, Skeleton, solveSkeleton, standingDirs } from './skeleton';

// MediaPipe landmark indices.
const NOSE = 0, L_EAR = 7, R_EAR = 8, L_SH = 11, R_SH = 12, L_EL = 13, R_EL = 14, L_WR = 15, R_WR = 16;
const L_HIP = 23, R_HIP = 24, L_KN = 25, R_KN = 26, L_AN = 27, R_AN = 28, L_FT = 31, R_FT = 32;

const SKETCH: [number, number][] = [
  [L_SH, R_SH], [L_SH, L_EL], [L_EL, L_WR], [R_SH, R_EL], [R_EL, R_WR], [L_SH, L_HIP], [R_SH, R_HIP],
  [L_HIP, R_HIP], [L_HIP, L_KN], [L_KN, L_AN], [R_HIP, R_KN], [R_KN, R_AN], [L_AN, L_FT], [R_AN, R_FT],
];
/** Preview colours per player: [bones, joints]. */
const COLORS = [['#7dfcff', '#ff3d8b'], ['#ffd02a', '#9b4dff']];

/** Switch from the full to the lite model if inference is slower than this (ms). */
const SLOW_MS = 28;
/** Max look-ahead used to hide inference latency (seconds). */
const PREDICT_MAX = 0.045;

export type CalibState = { progress: number; message: string; done: boolean };
export interface TrackerStats { fps: number; inferenceMs: number; model: ModelVariant; delegate: string; worker: boolean }
interface Landmark2D { x: number; y: number; visibility: number }

/**
 * One tracked person → fixed-size skeleton. Bone directions come from MediaPipe's 3D
 * world landmarks; the only positional signal is the hip's vertical movement in the
 * image (relative to a calibrated standing height), which drives jumping and crouching.
 * Landmarks are smoothed with One-Euro filters.
 */
export class PoseTrack {
  private world: Vector3[] = Array.from({ length: N_LANDMARKS }, () => new Vector3());
  private vel: Vector3[] = Array.from({ length: N_LANDMARKS }, () => new Vector3());
  private vis = new Float32Array(N_LANDMARKS);
  private img: Landmark2D[] = Array.from({ length: N_LANDMARKS }, () => ({ x: 0, y: 0, visibility: 0 }));
  private worldFilter = new OneEuroBank(N_LANDMARKS, 3, 1.4, 0.6);
  private imgFilter = new OneEuroBank(N_LANDMARKS, 2, 1.6, 1.2);
  private haveWorld = false;
  private lastResultTs = 0;
  private lastSeen = 0;

  private lift = 0;
  private baseHipPx = 0;
  private baseTorsoPx = 0;
  private calibSamples: { hip: number; torso: number }[] = [];
  private dirs = standingDirs();
  private skel = solveSkeleton(this.dirs, 0);
  upperBodyOnly = false;
  calibrated = false;

  constructor(private video: HTMLVideoElement) {}

  /** Raw image x of the hip centre (0..1, un-mirrored); used to tell players apart. */
  get hipX() { return (this.img[L_HIP].x + this.img[R_HIP].x) / 2; }

  /** Feed one person's landmarks from a detector frame (block `p` of `r`). */
  ingest(r: PoseFrame, p: number) {
    const now = performance.now();
    // Reset filters after a tracking gap so we don't smear from a stale pose.
    const gap = !this.haveWorld || now - this.lastSeen > 500;
    if (gap) { this.worldFilter.reset(); this.imgFilter.reset(); }
    const dt = gap ? 1 / 30 : Math.max(1e-3, (r.ts - this.lastResultTs) / 1000);
    this.lastResultTs = r.ts;
    const wo = p * N_LANDMARKS * 3, io = p * N_LANDMARKS * 4;
    for (let i = 0; i < N_LANDMARKS; i++) {
      // Figure space: viewed from behind, so flip X and Y and keep Z (a 180° turn).
      const wx = -r.world[wo + i * 3], wy = -r.world[wo + i * 3 + 1], wz = r.world[wo + i * 3 + 2];
      this.world[i].set(
        this.worldFilter.filter(i, 0, wx, dt),
        this.worldFilter.filter(i, 1, wy, dt),
        this.worldFilter.filter(i, 2, wz, dt),
      );
      this.vel[i].set(this.worldFilter.velocity(i, 0), this.worldFilter.velocity(i, 1), this.worldFilter.velocity(i, 2));
      const im = this.img[i];
      im.x = this.imgFilter.filter(i, 0, r.image[io + i * 4], dt);
      im.y = this.imgFilter.filter(i, 1, r.image[io + i * 4 + 1], dt);
      const v = r.image[io + i * 4 + 3];
      im.visibility = this.vis[i] = gap ? v : this.vis[i] * 0.5 + v * 0.5;
    }
    this.haveWorld = true;
    this.lastSeen = now;
  }

  get tracking() {
    return this.haveWorld && performance.now() - this.lastSeen < 800;
  }

  private px(i: number) {
    const lm = this.img[i];
    return { x: lm.x * this.video.videoWidth, y: lm.y * this.video.videoHeight };
  }

  private hipAndTorsoPx() {
    const sh = [this.px(L_SH), this.px(R_SH)], hp = [this.px(L_HIP), this.px(R_HIP)];
    const shY = (sh[0].y + sh[1].y) / 2, shX = (sh[0].x + sh[1].x) / 2;
    const hipY = (hp[0].y + hp[1].y) / 2, hipX = (hp[0].x + hp[1].x) / 2;
    return { hip: hipY, torso: Math.hypot(shX - hipX, shY - hipY) };
  }

  private inFrame(i: number, minVis = 0.6) {
    const lm = this.img[i];
    return this.vis[i] > minVis && lm.x > 0.01 && lm.x < 0.99 && lm.y > 0.01 && lm.y < 0.99;
  }

  resetCalibration() {
    this.calibrated = false;
    this.calibSamples = [];
    this.lift = 0;
  }

  /** Feed once per frame while calibrating; needs the player still and in frame. */
  calibrate(): CalibState {
    if (this.calibrated) return { progress: 1, message: 'Locked in!', done: true };
    if (!this.tracking) return { progress: 0, message: 'Step into view of the camera', done: false };
    const core = [NOSE, L_SH, R_SH, L_HIP, R_HIP].every((i) => this.inFrame(i));
    const legs = [L_AN, R_AN].every((i) => this.inFrame(i, 0.3));
    if (!core) {
      this.calibSamples = [];
      return { progress: 0, message: 'Step back so your head and hips are visible', done: false };
    }
    if (!legs && !this.upperBodyOnly) {
      // Don't switch to upper-body by itself (that freezes the legs); the player can pick it with the button.
      return { progress: this.calibSamples.length / 40, message: 'Step back until your feet are in frame', done: false };
    }
    const s = this.hipAndTorsoPx();
    // Compare with the running average (not the last frame) so tracking jitter doesn't wipe progress;
    // a real move only drops the older half of the samples.
    const n = this.calibSamples.length;
    const avg = n ? this.calibSamples.reduce((t, c) => t + c.hip, 0) / n : s.hip;
    if (n && Math.abs(avg - s.hip) > s.torso * 0.2) this.calibSamples = this.calibSamples.slice(Math.floor(n / 2));
    this.calibSamples.push(s);
    const need = 40;
    if (this.calibSamples.length >= need) {
      this.baseHipPx = this.calibSamples.reduce((t, c) => t + c.hip, 0) / this.calibSamples.length;
      this.baseTorsoPx = this.calibSamples.reduce((t, c) => t + c.torso, 0) / this.calibSamples.length;
      this.calibrated = true;
      return { progress: 1, message: 'Locked in!', done: true };
    }
    return { progress: this.calibSamples.length / need, message: 'Hold still, arms by your sides…', done: false };
  }

  /** True while both wrists are above the head: used as a hands-free "start" gesture. */
  handsUp() {
    if (!this.tracking) return false;
    const nose = this.img[NOSE].y;
    return this.vis[L_WR] > 0.5 && this.vis[R_WR] > 0.5 && this.img[L_WR].y < nose && this.img[R_WR].y < nose;
  }

  /** World landmark, extrapolated a little along its velocity to hide inference latency. */
  private predicted(i: number, out: Vector3) {
    const ahead = Math.min(PREDICT_MAX, (performance.now() - this.lastSeen) / 1000) * 0.6;
    return out.copy(this.world[i]).addScaledVector(this.vel[i], ahead);
  }

  private dir(from: number, to: number, out: Vector3, fallback: Vector3, minVis = 0.35) {
    if (Math.min(this.vis[from], this.vis[to]) < minVis) return out.lerp(fallback, 0.2).normalize();
    const d = this.predicted(to, new Vector3()).sub(this.predicted(from, new Vector3()));
    if (d.lengthSq() < 1e-8) return out;
    return out.copy(d.normalize());
  }

  skeleton(): Skeleton {
    if (!this.haveWorld) return this.skel;
    const d = this.dirs, rest = standingDirs();
    const P = (i: number) => this.predicted(i, new Vector3());
    const mid = (a: number, b: number) => P(a).add(P(b)).multiplyScalar(0.5);
    const shMid = mid(L_SH, R_SH), hipMid = mid(L_HIP, R_HIP), earMid = mid(L_EAR, R_EAR);
    d.spine.copy(shMid.clone().sub(hipMid).normalize());
    d.head.copy(earMid.sub(shMid).normalize());
    d.shoulderAxis.copy(P(L_SH).sub(P(R_SH)).normalize());
    d.hipAxis.copy(P(L_HIP).sub(P(R_HIP)).normalize());
    this.dir(L_SH, L_EL, d.lUpperArm, rest.lUpperArm);
    this.dir(L_EL, L_WR, d.lForearm, rest.lForearm);
    this.dir(R_SH, R_EL, d.rUpperArm, rest.rUpperArm);
    this.dir(R_EL, R_WR, d.rForearm, rest.rForearm);
    const legMin = this.upperBodyOnly ? 2 : 0.2;
    // Shins fall back to their thigh's direction (not standing straight) when an ankle is hidden,
    // so a leg spread still reads as a spread.
    this.dir(L_HIP, L_KN, d.lThigh, rest.lThigh, legMin);
    this.dir(L_KN, L_AN, d.lShin, d.lThigh, legMin);
    this.dir(L_AN, L_FT, d.lFoot, rest.lFoot, legMin);
    this.dir(R_HIP, R_KN, d.rThigh, rest.rThigh, legMin);
    this.dir(R_KN, R_AN, d.rShin, d.rThigh, legMin);
    this.dir(R_AN, R_FT, d.rFoot, rest.rFoot, legMin);
    // Feet should point roughly forward; MediaPipe foot depth is noisy.
    for (const f of [d.lFoot, d.rFoot]) { f.z = Math.min(f.z, -0.5); f.normalize(); }

    let lift = 0;
    if (this.calibrated) {
      const { hip } = this.hipAndTorsoPx();
      lift = (-(hip - this.baseHipPx) / this.baseTorsoPx) * L.spine;
      lift = Math.max(-0.8, Math.min(0.6, lift));
    }
    // Landmarks are already One-Euro filtered; this just takes the edge off.
    this.lift += (lift - this.lift) * 0.8;
    return solveSkeleton(d, this.lift, this.skel);
  }

  /** Draw this person's landmarks over the (mirrored) preview canvas. */
  draw(ctx: CanvasRenderingContext2D, colors: string[]) {
    if (!this.tracking) return;
    const { width: w, height: h } = ctx.canvas;
    ctx.lineWidth = 3;
    ctx.strokeStyle = colors[0];
    ctx.fillStyle = colors[1];
    for (const [a, b] of SKETCH) {
      if (this.vis[a] < 0.4 || this.vis[b] < 0.4) continue;
      ctx.beginPath();
      ctx.moveTo(this.img[a].x * w, this.img[a].y * h);
      ctx.lineTo(this.img[b].x * w, this.img[b].y * h);
      ctx.stroke();
    }
    for (const i of [NOSE, L_WR, R_WR, L_AN, R_AN]) {
      if (this.vis[i] < 0.4) continue;
      ctx.beginPath();
      ctx.arc(this.img[i].x * w, this.img[i].y * h, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/**
 * Webcam + pose model, tracking one or two people. Inference runs in a module Web
 * Worker (main-thread fallback), fed straight from requestVideoFrameCallback with at
 * most one frame in flight, so the render loop never blocks on the model.
 *
 * In two-player mode, tracks[0] is whoever stands on the LEFT of the mirrored preview
 * (player 1) and tracks[1] the one on the right.
 */
export class CameraPose {
  readonly video = document.createElement('video');
  readonly tracks = [new PoseTrack(this.video), new PoseTrack(this.video)];
  private worker: Worker | null = null;
  private local: PoseDetector | null = null;
  private ready = false;
  private inFlight = false;
  private switching = false;
  // Start on the lite model: a mid-game model switch (the old auto-downgrade) could leave tracking stuck.
  private model: ModelVariant = 'lite';
  private sentAt = 0;
  private switchAt = 0;
  private delegate = 'GPU';
  private numPoses = 1;
  private lastVideoTime = -1;
  private initArgs = { wasmBase: '', modelBase: '' };

  private fpsCount = 0;
  private fpsT0 = 0;
  private fps = 0;
  private inferEma = 0;
  private results = 0;

  get stats(): TrackerStats {
    return { fps: this.fps, inferenceMs: this.inferEma, model: this.model, delegate: this.delegate, worker: !!this.worker };
  }

  get players() { return this.numPoses; }

  async start(onStatus: (s: string) => void, players = 1) {
    this.numPoses = players;
    onStatus('Requesting camera…');
    const stream = await navigator.mediaDevices.getUserMedia({
      // Small frames are plenty for the model (it runs at 256×256) and cut capture latency.
      video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 60 }, facingMode: 'user' },
      audio: false,
    });
    this.video.srcObject = stream;
    this.video.playsInline = true;
    this.video.muted = true;
    await this.video.play();

    onStatus('Loading pose model…');
    const abs = (p: string) => new URL(`${import.meta.env.BASE_URL}${p}`, location.href).href;
    this.initArgs = { wasmBase: abs('mediapipe'), modelBase: abs('models/') };
    try {
      await this.startWorker();
    } catch (e) {
      console.warn('Pose worker unavailable, running on the main thread:', e);
      this.worker?.terminate();
      this.worker = null;
      this.local = new PoseDetector();
      await this.local.init(this.initArgs.wasmBase, this.initArgs.modelBase, this.model, false, this.numPoses);
      this.delegate = this.local.delegate;
    }
    this.ready = true;
    this.pump();
  }

  /** Switch between tracking one and two people (reloads the model). */
  async setPlayers(n: number) {
    if (n === this.numPoses || !this.ready) { this.numPoses = n; return; }
    this.numPoses = n;
    await this.reinit(this.model);
  }

  private reinit(model: ModelVariant) {
    this.switching = true;
    this.switchAt = performance.now();
    this.model = model;
    if (this.worker) {
      const msg: WorkerIn = { type: 'init', ...this.initArgs, model, numPoses: this.numPoses };
      this.worker.postMessage(msg);
      return new Promise<void>((resolve) => {
        const check = () => (this.switching ? setTimeout(check, 50) : resolve());
        check();
      });
    }
    return this.local!.init(this.initArgs.wasmBase, this.initArgs.modelBase, model, false, this.numPoses)
      .finally(() => { this.switching = false; });
  }

  private startWorker() {
    return new Promise<void>((resolve, reject) => {
      const w = new Worker(new URL('./pose-worker.ts', import.meta.url), { type: 'module' });
      this.worker = w;
      const timer = setTimeout(() => reject(new Error('worker init timed out')), 25000);
      w.onerror = (e) => { clearTimeout(timer); reject(new Error(e.message || 'worker error')); };
      w.onmessage = (e: MessageEvent<WorkerOut>) => {
        const m = e.data;
        if (m.type === 'ready') {
          clearTimeout(timer);
          this.delegate = m.delegate;
          this.model = m.model;
          this.switching = false;
          this.inFlight = false;
          resolve();
        } else if (m.type === 'error') {
          if (!this.ready) { clearTimeout(timer); reject(new Error(m.message)); }
          else { console.warn('pose worker:', m.message); this.inFlight = false; this.switching = false; }
        } else {
          this.inFlight = false;
          this.onResult(m);
        }
      };
      const msg: WorkerIn = { type: 'init', ...this.initArgs, model: this.model, numPoses: this.numPoses };
      w.postMessage(msg);
    });
  }

  /** Feed every new camera frame to the detector as soon as it's decoded. */
  private pump() {
    const v = this.video as HTMLVideoElement & {
      requestVideoFrameCallback?: (cb: (now: number, meta: { mediaTime: number }) => void) => number;
    };
    if (!v.requestVideoFrameCallback) return; // poll() drives detection instead
    const onFrame = () => {
      this.submit(performance.now());
      v.requestVideoFrameCallback!(onFrame);
    };
    v.requestVideoFrameCallback(onFrame);
  }

  private submit(now: number) {
    // Watchdog: a frame or model switch that never answers must not freeze tracking.
    if (this.inFlight && now - this.sentAt > 1000) this.inFlight = false;
    if (this.switching && now - this.switchAt > 8000) this.switching = false;
    if (!this.ready || this.switching || this.video.readyState < 2) return;
    if (this.video.currentTime === this.lastVideoTime) return;
    if (this.worker) {
      if (this.inFlight) return; // drop frames rather than queue them: lowest latency
      this.inFlight = true;
      this.sentAt = now;
      this.lastVideoTime = this.video.currentTime;
      createImageBitmap(this.video).then(
        (bitmap) => {
          const msg: WorkerIn = { type: 'frame', bitmap, ts: now };
          this.worker!.postMessage(msg, [bitmap]);
        },
        () => { this.inFlight = false; },
      );
    } else if (this.local) {
      this.lastVideoTime = this.video.currentTime;
      const r = this.local.detect(this.video, now);
      if (r) this.onResult(r);
    }
  }

  /** Fallback driver when requestVideoFrameCallback isn't available. Cheap no-op otherwise. */
  poll(now: number) {
    const v = this.video as HTMLVideoElement & { requestVideoFrameCallback?: unknown };
    if (!v.requestVideoFrameCallback) this.submit(now);
  }

  private onResult(r: PoseFrame) {
    this.inferEma = this.inferEma ? this.inferEma * 0.9 + r.inferenceMs * 0.1 : r.inferenceMs;
    this.results++;
    this.maybeDowngrade();
    if (!r.count) return;

    const now = performance.now();
    this.fpsCount++;
    if (now - this.fpsT0 > 1000) {
      this.fps = (this.fpsCount * 1000) / (now - this.fpsT0);
      this.fpsCount = 0;
      this.fpsT0 = now;
    }
    this.assign(r);
  }

  /** Hand each detected person to a track. */
  private assign(r: PoseFrame) {
    const N4 = N_LANDMARKS * 4;
    const people = Array.from({ length: r.count }, (_, p) => {
      const o = p * N4;
      const hipX = (r.image[o + L_HIP * 4] + r.image[o + R_HIP * 4]) / 2;
      const hipY = (r.image[o + L_HIP * 4 + 1] + r.image[o + R_HIP * 4 + 1]) / 2;
      const shY = (r.image[o + L_SH * 4 + 1] + r.image[o + R_SH * 4 + 1]) / 2;
      return { p, hipX, size: Math.abs(hipY - shY) };
    }).sort((a, b) => b.size - a.size); // biggest (closest) people first

    if (this.numPoses === 1) {
      this.tracks[0].ingest(r, people[0].p);
      return;
    }
    if (people.length >= 2) {
      // Raw image x is un-mirrored: larger x = left side of the mirrored preview = player 1.
      const [a, b] = people.slice(0, 2).sort((u, v) => v.hipX - u.hipX);
      this.tracks[0].ingest(r, a.p);
      this.tracks[1].ingest(r, b.p);
      return;
    }
    // Only one person visible: give it to the track it's nearest to, else decide by side.
    const one = people[0];
    const [t0, t1] = this.tracks;
    let target: PoseTrack;
    if (t0.tracking && t1.tracking) target = Math.abs(t0.hipX - one.hipX) < Math.abs(t1.hipX - one.hipX) ? t0 : t1;
    else if (t0.tracking && Math.abs(t0.hipX - one.hipX) < 0.15) target = t0;
    else if (t1.tracking && Math.abs(t1.hipX - one.hipX) < 0.15) target = t1;
    else target = one.hipX > 0.5 ? t0 : t1;
    target.ingest(r, one.p);
  }

  /** If the full model can't keep up on this machine, drop to lite once. */
  private maybeDowngrade() {
    if (this.model !== 'full' || this.switching || this.results < 45 || this.inferEma < SLOW_MS) return;
    console.info(`pose: full model ~${this.inferEma.toFixed(1)}ms/frame, switching to lite`);
    this.inferEma = 0;
    this.results = 0;
    void this.reinit('lite');
  }

  /** Draw every active player's landmarks over the (mirrored) preview canvas. */
  drawPreview(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (let i = 0; i < this.numPoses; i++) this.tracks[i].draw(ctx, COLORS[i]);
  }
}
