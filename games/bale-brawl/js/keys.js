// Keyboard and mouse to SwordIntent (PLAN.md 3.2 and 3.7). Used when a player has no phone.
//
//   createKeySword({ keys: 0 | 1 | 'p1' | 'p2', mouse, canvas }) -> Control & { active, enabled, dispose() }
//
// Player 1: D / A / W / S swing right / left / up / chop, Space guards, Q / E diagonal guard blade.
// Player 2: Right / Left / Up / Down swing, Enter guards, Up or Down while guarding = level blade.
// Two swing keys pressed within 60 ms make a diagonal. Shift = full power. Mouse (P1 only): move = blade
// pose, left-drag flick = swing, right button held = guard with the blade line from centre to pointer.

const PI = Math.PI;
const DIAG_MS = 60;
const REST = { yaw: 0, pitch: 0.5 };
const KEY_POWER = 0.75;

const SCHEMES = [
  {
    swing: { KeyD: 0, KeyA: PI, KeyW: PI / 2, KeyS: -PI / 2 },
    guard: 'Space',
    level: ['KeyW', 'KeyS'],
    diag: { KeyQ: (3 * PI) / 4, KeyE: PI / 4 },
    names: 'WASD + Space',
  },
  {
    swing: { ArrowRight: 0, ArrowLeft: PI, ArrowUp: PI / 2, ArrowDown: -PI / 2 },
    guard: 'Enter',
    level: ['ArrowUp', 'ArrowDown'],
    diag: {},
    names: 'arrows + Enter',
  },
];

export const KEY_HELP = [SCHEMES[0].names, SCHEMES[1].names];

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const wrapPi = (a) => ((a % PI) + PI) % PI;

export function createKeySword({ keys = 0, mouse = false, canvas = null } = {}) {
  const idx = keys === 1 || keys === 'p2' ? 1 : 0;
  const scheme = SCHEMES[idx];
  const swingCodes = new Set(Object.keys(scheme.swing));
  const held = new Set();
  let buffer = []; // { dir, t, shift } for swing keys pressed in the last DIAG_MS
  let queued = null; // resolved swing waiting for the next read
  let lean = 0; // last swing direction, decays
  let leanDir = 0;
  let live = false;
  let lastInput = 0;
  let enabled = true;
  // mouse
  let mx = 0.5, my = 0.5; // 0..1 of the canvas
  let mouseSeen = false;
  let rightDown = false;
  let drag = null; // { samples: [{x,y,t}] }
  let yaw = REST.yaw, pitch = REST.pitch;

  const now = () => performance.now();
  const sword = {
    active: false,
    get enabled() { return enabled; },
    set enabled(v) {
      enabled = !!v;
      if (!enabled) release();
    },
    recenter() {
      mx = 0.5;
      my = 0.5;
    },
    read(dt) {
      resolveBuffer(false);
      const t = now();
      const guard = held.has(scheme.guard) || rightDown;
      lean = Math.max(0, lean - dt / 0.45);
      const k = lean * lean;
      let ty = REST.yaw + Math.cos(leanDir) * 0.4 * k;
      let tp = REST.pitch + Math.sin(leanDir) * 0.3 * k;
      if (mouse && mouseSeen) {
        ty = clamp((mx - 0.5) * 2.4, -1.4, 1.4);
        tp = clamp(0.5 + (0.5 - my) * 2.4, -1.2, 1.4);
      }
      const a = 1 - Math.exp(-dt / 0.05);
      yaw += (ty - yaw) * a;
      pitch += (tp - pitch) * a;

      let blade = PI / 2 - Math.cos(leanDir) * 0.3 * k;
      if (guard) {
        blade = PI / 2;
        if (scheme.level.some((c) => held.has(c))) blade = 0;
        for (const c in scheme.diag) if (held.has(c)) blade = scheme.diag[c];
        if (rightDown && mouse && mouseSeen) {
          const dx = mx - 0.5, dy = -(my - 0.5) * ((canvas?.clientHeight || 1) / (canvas?.clientWidth || 1));
          if (Math.hypot(dx, dy) > 0.03) blade = wrapPi(Math.atan2(dy, dx));
        }
      } else if (mouse && mouseSeen) {
        blade = PI / 2;
      }

      let swing = null;
      if (queued && !guard) swing = queued;
      queued = null;
      sword.active = live && t - lastInput < 4000;
      return { live, yaw, pitch, bladeAngle: clamp(blade, 0, PI), guard, swing };
    },
    dispose() {
      removeEventListener('keydown', onKeyDown, true);
      removeEventListener('keyup', onKeyUp, true);
      removeEventListener('blur', release);
      if (canvas && mouse) {
        canvas.removeEventListener('pointermove', onMove);
        canvas.removeEventListener('pointerdown', onDown);
        removeEventListener('pointerup', onUp);
        canvas.removeEventListener('contextmenu', noMenu);
      }
    },
  };

  function release() {
    held.clear();
    buffer = [];
    rightDown = false;
    drag = null;
  }
  function touch() {
    live = true;
    lastInput = now();
  }
  /** Turn buffered swing keys into one swing once the diagonal window has passed (or force it). */
  function resolveBuffer(force) {
    if (!buffer.length) return;
    if (!force && now() - buffer[0].t < DIAG_MS) return;
    let x = 0, y = 0;
    const first = buffer[0];
    for (const b of buffer) {
      x += Math.cos(b.dir);
      y += Math.sin(b.dir);
    }
    const dir = Math.hypot(x, y) < 0.1 ? first.dir : Math.atan2(y, x);
    const shift = buffer.some((b) => b.shift);
    queued = { dir, power: shift ? 1 : KEY_POWER };
    leanDir = dir;
    lean = 1;
    buffer = [];
  }

  function typing(e) {
    const el = e.target;
    return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
  }
  function onKeyDown(e) {
    if (!enabled || typing(e)) return;
    const c = e.code;
    const mine = swingCodes.has(c) || c === scheme.guard || c in scheme.diag;
    if (!mine) return;
    e.preventDefault();
    if (e.repeat) return;
    touch();
    held.add(c);
    // While guarding, W/S (or Up/Down) pick the blade line instead of swinging.
    if (swingCodes.has(c) && !held.has(scheme.guard) && !rightDown) {
      buffer.push({ dir: scheme.swing[c], t: now(), shift: e.shiftKey });
    }
  }
  function onKeyUp(e) {
    const c = e.code;
    if (held.delete(c) && enabled) e.preventDefault();
  }

  // ---- mouse (player 1 only) ----
  const noMenu = (e) => e.preventDefault();
  function norm(e) {
    const r = canvas.getBoundingClientRect();
    mx = clamp((e.clientX - r.left) / r.width, 0, 1);
    my = clamp((e.clientY - r.top) / r.height, 0, 1);
    return { x: e.clientX, y: e.clientY, t: now() };
  }
  function onMove(e) {
    if (!enabled) return;
    const p = norm(e);
    mouseSeen = true;
    touch();
    if (drag) {
      drag.samples.push(p);
      while (drag.samples.length > 2 && p.t - drag.samples[0].t > 140) drag.samples.shift();
    }
  }
  function onDown(e) {
    if (!enabled) return;
    const p = norm(e);
    mouseSeen = true;
    touch();
    if (e.button === 2) {
      rightDown = true;
      drag = null;
      e.preventDefault();
    } else if (e.button === 0) {
      drag = { samples: [p] };
    }
  }
  function onUp(e) {
    if (e.button === 2) {
      rightDown = false;
      return;
    }
    if (e.button !== 0 || !drag) return;
    if (enabled) {
      const p = canvas ? norm(e) : { x: e.clientX, y: e.clientY, t: now() };
      drag.samples.push(p);
      const s = drag.samples;
      let a = s[0];
      for (const q of s) if (p.t - q.t <= 140) { a = q; break; }
      const dx = p.x - a.x, dy = p.y - a.y;
      const dist = Math.hypot(dx, dy);
      const dtS = Math.max(0.02, (p.t - a.t) / 1000);
      if (dist > 28 && !rightDown && !held.has(scheme.guard)) {
        const dir = Math.atan2(-dy, dx);
        queued = { dir, power: clamp(dist / dtS / 2600, 0.35, 1) };
        leanDir = dir;
        lean = 1;
      }
    }
    drag = null;
  }

  addEventListener('keydown', onKeyDown, true);
  addEventListener('keyup', onKeyUp, true);
  addEventListener('blur', release);
  if (canvas && mouse) {
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerdown', onDown);
    addEventListener('pointerup', onUp);
    canvas.addEventListener('contextmenu', noMenu);
  }
  return sword;
}
