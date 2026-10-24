// Motion (webcam pose) + keyboard/touch input for the 3-lane runner.
const VISION_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/+esm';
const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm';
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

const LANE_BOUNDS = [0.38, 0.62];
const LANE_HYST = 0.03;
const X_EMA = 0.35;          // smoothing for torso x
const CALIB_FRAMES = 20;
const BASE_ADAPT = 0.01;     // very slow baseline drift while neutral
const JUMP_RISE = 0.18;      // torso lengths
const ROLL_DROP = 0.30;
const NEUTRAL_BAND = 0.10;
const JUMP_VEL = 1.6;        // torso lengths / second upward (hips)
const NO_BODY_MS = 1000;
const MIN_VIS = 0.5;

const BONES = [[11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [24, 26], [26, 28]];
const JOINTS = [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];

const KEYMAP = {
  ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'jump', KeyW: 'jump', Space: 'jump', ArrowDown: 'roll', KeyS: 'roll',
  Escape: 'pause', KeyP: 'pause',
};

const vis = (p) => (p && (p.visibility ?? 1)) || 0;

export class InputController {
  constructor({ onAction, onStatus, video, overlay } = {}) {
    this.onAction = onAction || (() => {});
    this.onStatus = onStatus || (() => {});
    this.video = video;
    this.overlay = overlay;
    this.ctx = overlay ? overlay.getContext('2d') : null;
    this._camera = false;
    this._keyboard = false;
    this.detector = null;
    this._lastVideoTime = -1;
    this._resetPose();
  }

  get cameraActive() { return this._camera; }

  _resetPose() {
    this.smoothX = null;
    this.lane = 1;
    this.baseline = null;     // { sh, hip, width }
    this.calib = [];
    this.jumpArmed = true;
    this.rollArmed = true;
    this.handsWas = false;
    this.prevHip = null;
    this.prevT = 0;
    this.lastSeen = 0;
    this.noBodyReported = false;
    this.gesture = null;      // { text, t }
  }

  _emit(action, data, label) {
    if (label) this.gesture = { text: label, t: performance.now() };
    this.onAction(action, data);
  }

  enableKeyboard() {
    if (this._keyboard) return;
    this._keyboard = true;
    window.addEventListener('keydown', (e) => {
      const action = KEYMAP[e.code] || (e.key === 'Escape' ? 'pause' : null);
      if (!action) return;
      e.preventDefault();
      if (e.repeat) return;
      this.onAction(action);
    });
    let start = null;
    window.addEventListener('touchstart', (e) => {
      const t = e.changedTouches[0];
      start = t ? { x: t.clientX, y: t.clientY } : null;
    }, { passive: true });
    window.addEventListener('touchend', (e) => {
      const t = e.changedTouches[0];
      if (!start || !t) return;
      const dx = t.clientX - start.x, dy = t.clientY - start.y;
      start = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return;
      if (Math.abs(dx) > Math.abs(dy)) this.onAction(dx < 0 ? 'left' : 'right');
      else this.onAction(dy < 0 ? 'jump' : 'roll');
    }, { passive: true });
  }

  async startCamera() {
    if (this._camera) return true;
    if (!navigator.mediaDevices?.getUserMedia) {
      this.onStatus('Camera access requires HTTPS or localhost.');
      return false;
    }
    try {
      this.onStatus('Waiting for camera permission…');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }, audio: false,
      });
      this.video.srcObject = stream;
      this.video.muted = true;
      this.video.playsInline = true;
      await this.video.play();
    } catch (err) {
      console.error(err);
      this.onStatus('Camera unavailable or permission denied — use keyboard/touch instead.');
      return false;
    }
    try {
      this.onStatus('Loading pose detector…');
      const { FilesetResolver, PoseLandmarker } = await import(VISION_URL);
      const vision = await FilesetResolver.forVisionTasks(WASM_URL);
      const make = (delegate) => PoseLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate },
        runningMode: 'VIDEO', numPoses: 1,
      });
      try { this.detector = await make('GPU'); } catch (e) {
        console.warn('GPU delegate failed, using CPU', e);
        this.detector = await make('CPU');
      }
    } catch (err) {
      console.error(err);
      this.onStatus('Pose detector failed to load — check internet access. Keyboard/touch still work.');
      return false;
    }
    this._camera = true;
    this._resetPose();
    this.lastSeen = performance.now();
    this.onStatus('Step into view so your shoulders and hips are visible…');
    const loop = () => { this._tick(); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    return true;
  }

  calibrate() {
    this.baseline = null;
    this.calib = [];
    this.jumpArmed = this.rollArmed = true;
    this.prevHip = null;
    this.onStatus('Calibrating — stand still in a neutral pose…');
  }

  _tick() {
    const v = this.video;
    if (!this.detector || v.readyState < 2 || !v.videoWidth) return;
    if (v.currentTime === this._lastVideoTime) return;
    this._lastVideoTime = v.currentTime;
    const now = performance.now();
    let pts = null;
    try { pts = this.detector.detectForVideo(v, now).landmarks?.[0] || null; } catch (e) { console.warn(e); }
    const ok = pts && [11, 12, 23, 24].every((i) => vis(pts[i]) > MIN_VIS);
    if (ok) this._process(pts, now);
    else if (now - this.lastSeen > NO_BODY_MS && !this.noBodyReported) {
      this.noBodyReported = true;
      this.onStatus('No body detected — step back so your shoulders and hips are visible');
    }
    this._draw(ok ? pts : null, now);
  }

  _process(p, now) {
    if (this.noBodyReported) {
      this.noBodyReported = false;
      this.onStatus(this.baseline ? 'Tracking — move to play!' : 'Calibrating — stand still…');
    }
    this.lastSeen = now;
    const sh = (p[11].y + p[12].y) / 2, hip = (p[23].y + p[24].y) / 2;
    const width = Math.abs(p[11].x - p[12].x);
    const cx = 1 - (p[11].x + p[12].x + p[23].x + p[24].x) / 4;

    // Lane with EMA + hysteresis
    this.smoothX = this.smoothX == null ? cx : this.smoothX + X_EMA * (cx - this.smoothX);
    let lane = 0;
    LANE_BOUNDS.forEach((b, i) => {
      const edge = this.lane > i ? b - LANE_HYST : b + LANE_HYST;
      if (this.smoothX > edge) lane = i + 1;
    });
    if (lane !== this.lane) { this.lane = lane; this._emit('lane', lane, `LANE ${lane}`); }

    // Hands up (rising edge)
    const nose = p[0];
    const hands = vis(p[15]) > MIN_VIS && vis(p[16]) > MIN_VIS && vis(nose) > 0.3 &&
      p[15].y < nose.y && p[16].y < nose.y;
    if (hands && !this.handsWas) this._emit('handsUp', undefined, 'HANDS UP');
    this.handsWas = hands;

    // Calibration
    if (!this.baseline) {
      this.calib.push({ sh, hip, width });
      if (this.calib.length >= CALIB_FRAMES) {
        const avg = (k) => this.calib.reduce((s, c) => s + c[k], 0) / this.calib.length;
        this.baseline = { sh: avg('sh'), hip: avg('hip'), width: avg('width') };
        this.calib = [];
        this.onStatus('Calibrated — move to play!');
      }
      this.prevHip = hip; this.prevT = now;
      return;
    }

    const b = this.baseline;
    const torso = Math.max(0.05, b.hip - b.sh);
    const riseSh = (b.sh - sh) / torso, riseHip = (b.hip - hip) / torso;   // + = up
    const dt = Math.max(1, now - this.prevT) / 1000;
    const hipVel = this.prevHip == null ? 0 : (this.prevHip - hip) / torso / dt; // + = up
    this.prevHip = hip; this.prevT = now;

    const jumping = (riseSh > JUMP_RISE && riseHip > JUMP_RISE) || (hipVel > JUMP_VEL && riseHip > 0.08);
    if (jumping && this.jumpArmed) {
      this.jumpArmed = false;
      this._emit('jump', undefined, 'JUMP');
    }
    const ducking = -riseSh > ROLL_DROP && riseHip < 0.05 && !jumping;
    if (ducking && this.rollArmed) {
      this.rollArmed = false;
      this._emit('roll', undefined, 'ROLL');
    }

    const neutral = Math.abs(riseSh) < NEUTRAL_BAND && Math.abs(riseHip) < NEUTRAL_BAND;
    if (neutral) {
      this.jumpArmed = this.rollArmed = true;
      b.sh += BASE_ADAPT * (sh - b.sh);
      b.hip += BASE_ADAPT * (hip - b.hip);
      b.width += BASE_ADAPT * (width - b.width);
    }
  }

  _draw(p, now) {
    const c = this.overlay, ctx = this.ctx, v = this.video;
    if (!ctx) return;
    if (c.width !== v.videoWidth || c.height !== v.videoHeight) {
      c.width = v.videoWidth; c.height = v.videoHeight;
    }
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);

    // Lane zones (mirrored coords: drawn directly in player-view space)
    const edges = [0, ...LANE_BOUNDS, 1];
    ctx.fillStyle = 'rgba(0, 255, 255, 0.10)';
    ctx.fillRect(edges[this.lane] * W, 0, (edges[this.lane + 1] - edges[this.lane]) * W, H);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = Math.max(1, W / 320);
    ctx.setLineDash([]);
    for (const bx of LANE_BOUNDS) {
      ctx.beginPath(); ctx.moveTo(bx * W, 0); ctx.lineTo(bx * W, H); ctx.stroke();
    }

    // Jump / duck thresholds relative to baseline
    if (this.baseline) {
      const b = this.baseline, torso = Math.max(0.05, b.hip - b.sh);
      ctx.setLineDash([10, 8]);
      const hline = (y, color) => {
        ctx.strokeStyle = color; ctx.beginPath(); ctx.moveTo(0, y * H); ctx.lineTo(W, y * H); ctx.stroke();
      };
      hline(b.sh - JUMP_RISE * torso, 'rgba(120, 255, 120, 0.7)');
      hline(b.sh, 'rgba(255, 255, 255, 0.3)');
      hline(b.sh + ROLL_DROP * torso, 'rgba(255, 170, 60, 0.7)');
      ctx.setLineDash([]);
    }

    // Mirrored skeleton
    if (p) {
      const X = (pt) => (1 - pt.x) * W, Y = (pt) => pt.y * H;
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = Math.max(2, W / 160);
      ctx.lineCap = 'round';
      for (const [a, b] of BONES) {
        if (vis(p[a]) < 0.3 || vis(p[b]) < 0.3) continue;
        ctx.beginPath(); ctx.moveTo(X(p[a]), Y(p[a])); ctx.lineTo(X(p[b]), Y(p[b])); ctx.stroke();
      }
      ctx.fillStyle = '#ffffff';
      const r = Math.max(3, W / 120);
      for (const i of JOINTS) {
        if (vis(p[i]) < 0.3) continue;
        ctx.beginPath(); ctx.arc(X(p[i]), Y(p[i]), r, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Fading gesture label
    if (this.gesture) {
      const a = 1 - (now - this.gesture.t) / 1200;
      if (a <= 0) this.gesture = null;
      else {
        ctx.globalAlpha = a;
        ctx.font = `bold ${Math.round(H / 9)}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.lineWidth = Math.max(2, W / 200);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.strokeText(this.gesture.text, W / 2, H * 0.14);
        ctx.fillStyle = '#ffff66';
        ctx.fillText(this.gesture.text, W / 2, H * 0.14);
        ctx.globalAlpha = 1;
      }
    }
  }
}
