/**
 * Webcam body tracker for the shell (MediaPipe Pose Landmarker, lite model, ~30 fps).
 * Gives the absolute position of the player's playing hand, which the phone's IMU can't know.
 *
 * Events: 'pose' ({wrist:{x,y}, elbow:{x,y}, shoulder:{x,y}, scale, visible, hand, t, at, world})
 *         'status' (text)
 * Coordinates are normalised to the image, mirrored so x grows to the player's right like a mirror.
 * `world`: MediaPipe 3D world landmarks in metres, hip-centred and NOT mirrored (+x image right,
 * +y down, -z toward the camera), as [x, y, z, visibility] for shoulders (ls rs), wrists (lw rw),
 * hips (lh rh) and ankles (la ra). `at`: capture time as epoch ms (performance.timeOrigin + now −
 * camera latency), a clock shared with the game iframe and with clock-synced phone packets.
 * `img`: raw (unsmoothed) 2D landmarks, mirrored like `wrist`, as [x, y, visibility] for shoulders (ls rs),
 * elbows (le re), wrists (lw rw) and hips (lh rh); `aspect` = frame width / height. Sent whenever a body is
 * found, even when the playing wrist is hidden (then `visible` is false), for games that track arms themselves.
 */
import { Emitter } from './protocol.js';

const VISION = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21';
const MODEL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
const L = { shoulder: 11, elbow: 13, wrist: 15 }; // left side; right side = +1
const MIN_VIS = 0.5;
const WORLD = { ls: 11, rs: 12, lw: 15, rw: 16, lh: 23, rh: 24, la: 27, ra: 28 };
const IMG = { ls: 11, rs: 12, le: 13, re: 14, lw: 15, rw: 16, lh: 23, rh: 24 };
/** Typical webcam capture-to-video-frame delay, subtracted from the frame time. */
const CAMERA_LATENCY_MS = 40;

export class CameraTracker extends Emitter {
  running = false;
  /** 'right' | 'left' — which hand holds the phone. */
  hand = 'right';
  last = null;

  constructor(video) {
    super();
    this.video = video;
    this.detector = null;
    this.stream = null;
    this.lastVideoTime = -1;
    this.smooth = null;
  }

  async start() {
    if (this.running) return true;
    if (!navigator.mediaDevices?.getUserMedia) {
      this.emit('status', 'Camera needs HTTPS or localhost');
      return false;
    }
    try {
      this.emit('status', 'Waiting for camera permission...');
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }, audio: false });
      this.video.srcObject = this.stream;
      this.video.muted = true;
      this.video.playsInline = true;
      await this.video.play();
      if (!this.detector) {
        this.emit('status', 'Loading body tracker...');
        const { FilesetResolver, PoseLandmarker } = await import(`${VISION}/+esm`);
        const vision = await FilesetResolver.forVisionTasks(`${VISION}/wasm`);
        const make = (delegate) => PoseLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: MODEL, delegate }, runningMode: 'VIDEO', numPoses: 1 });
        try {
          this.detector = await make('GPU');
        } catch {
          this.detector = await make('CPU');
        }
      }
    } catch (e) {
      console.warn('[exemoo camera]', e);
      this.emit('status', 'Camera unavailable');
      this.stop();
      return false;
    }
    this.running = true;
    this.emit('status', 'Camera on');
    this.#loop();
    return true;
  }

  stop() {
    this.running = false;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.video.srcObject = null;
    this.last = null;
    this.emit('status', 'Camera off');
  }

  #loop = () => {
    if (!this.running) return;
    const v = this.video;
    if (this.detector && v.readyState >= 2 && v.currentTime !== this.lastVideoTime) {
      this.lastVideoTime = v.currentTime;
      const res = this.detector.detectForVideo(v, performance.now());
      this.#onLandmarks(res.landmarks?.[0], res.worldLandmarks?.[0]);
    }
    requestAnimationFrame(this.#loop);
  };

  #onLandmarks(lm, wl) {
    if (!lm) return this.#lost();
    const img = {};
    for (const [name, i] of Object.entries(IMG)) img[name] = [1 - lm[i].x, lm[i].y, lm[i].visibility ?? 1];
    const aspect = this.video.videoWidth && this.video.videoHeight ? this.video.videoWidth / this.video.videoHeight : 4 / 3;
    // MediaPipe "left" is the person's left. Mirror x so it reads like a mirror image.
    const side = this.hand === 'right' ? 1 : 0;
    const pt = (i) => ({ x: 1 - lm[i].x, y: lm[i].y, v: lm[i].visibility ?? 1 });
    const wrist = pt(L.wrist + side), elbow = pt(L.elbow + side), shoulder = pt(L.shoulder + side);
    const other = pt(L.shoulder + (1 - side));
    if (wrist.v < MIN_VIS || shoulder.v < MIN_VIS) return this.#lost({ img, aspect });
    const scale = Math.hypot(shoulder.x - other.x, shoulder.y - other.y) || 0.2; // shoulder width
    // Light smoothing; the phone IMU covers the fast part of the motion.
    const k = 0.5;
    const s = this.smooth;
    const mix = (a, b) => (s ? { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k } : { x: b.x, y: b.y });
    this.smooth = { wrist: mix(s?.wrist ?? wrist, wrist), elbow: mix(s?.elbow ?? elbow, elbow), shoulder: mix(s?.shoulder ?? shoulder, shoulder) };
    const t = performance.now();
    let world = null;
    if (wl) {
      world = {};
      for (const [name, i] of Object.entries(WORLD)) world[name] = [wl[i].x, wl[i].y, wl[i].z, wl[i].visibility ?? 1];
    }
    this.last = { ...this.smooth, scale, visible: true, hand: this.hand, t, at: performance.timeOrigin + t - CAMERA_LATENCY_MS, world, img, aspect };
    this.emit('pose', this.last);
  }

  #lost(body = null) {
    if (this.last?.visible === false && !body && !this.last.img) return;
    this.smooth = null;
    const t = performance.now();
    this.last = { visible: false, t, at: performance.timeOrigin + t - (body ? CAMERA_LATENCY_MS : 0), ...body };
    this.emit('pose', this.last);
  }
}

// ───────────────────────────── fusion ─────────────────────────────
/**
 * Camera + phone fusion. The phone's pitch and roll are referenced to gravity and stay true, but its
 * heading (rotation about the vertical) drifts. The camera sees which way the forearm points
 * (shoulder → wrist, sideways in the image), which is an absolute heading. HeadingFusion keeps a
 * correction angle that slowly pulls the phone heading onto the camera's, only while the phone is
 * moving gently (never mid-swing), and applies it to every orientation quaternion.
 */
export class HeadingFusion {
  correction = 0; // rad, applied about world up
  #offset = null; // phone heading − camera heading at the reference pose
  #lastT = 0;
  gain = 0.6; // 1/s

  reset() {
    this.#offset = null;
    this.correction = 0;
  }

  /** Feed a packet (+ latest pose); returns the packet with a drift-corrected quaternion. */
  apply(p, pose) {
    const now = performance.now();
    const dt = this.#lastT ? Math.min(0.1, (now - this.#lastT) / 1000) : 0;
    this.#lastT = now;
    const q = p.q;
    const camOk = pose?.visible && now - pose.t < 300;
    if (camOk) {
      const phone = heading(q) + this.correction;
      const cam = Math.atan2(pose.wrist.x - pose.shoulder.x, pose.scale * 1.6); // forearm sideways angle
      if (this.#offset === null) this.#offset = phone - cam;
      const spin = Math.hypot(p.gyro.alpha, p.gyro.beta, p.gyro.gamma);
      if (spin < 120) {
        const err = wrap(phone - cam - this.#offset);
        this.correction -= err * Math.min(1, this.gain * dt);
      }
    }
    if (Math.abs(this.correction) < 1e-4) return camOk ? { ...p, cam: camPart(pose) } : p;
    const h = this.correction / 2;
    // World-up is +Z in the W3C device-orientation frame: pre-multiply by Rz(correction).
    const r = { x: 0, y: 0, z: Math.sin(h), w: Math.cos(h) };
    return { ...p, q: mul(r, q), cam: camOk ? camPart(pose) : null };
  }
}

const camPart = (pose) => ({ x: pose.wrist.x, y: pose.wrist.y, sx: pose.shoulder.x, sy: pose.shoulder.y, scale: pose.scale });
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const mul = (a, b) => ({
  w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
  x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
  y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
  z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
});
/** Horizontal heading of whichever device axis (top or screen normal) is closest to horizontal. */
function heading({ x, y, z, w }) {
  const top = { x: 2 * (x * y - w * z), y: 1 - 2 * (x * x + z * z), z: 2 * (y * z + w * x) };
  const face = { x: 2 * (x * z + w * y), y: 2 * (y * z - w * x), z: 1 - 2 * (x * x + y * y) };
  const v = Math.abs(top.z) < Math.abs(face.z) ? top : face;
  return Math.atan2(v.x, v.y);
}
