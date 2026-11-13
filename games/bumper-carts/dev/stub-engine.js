// Stand-in for js/engine.js so the menus, flow and HUD can be built and tested without the 3D engine.
// Same interface and events as PLAN.md 5.3 (createEngine, on, setCart, snapshot, fall / bump events ...),
// but the "world" is a flat top-down 2D drawing and the physics is a rough copy of PLAN section 3.
// NOT the real game. main.js loads this only when the URL has ?stub or js/engine.js fails to load.

const R = 7; // floor radius, fence ring
const CART_R = 0.55;
const SPAWN = 3.5;
const PANELS = 16;

/** Crude phone tilt for when js/tilt-input.js is missing: Action = charge, gravity in the phone frame = steer. */
export function createStubPhoneTilt() {
  let x = 0, y = 0, charge = false, live = false, x0 = null, y0 = null;
  return {
    push(p, actionHeld) {
      live = true;
      charge = !!actionHeld;
      const q = p?.q;
      if (q && (q.w || q.x || q.y || q.z)) {
        const rx = -2 * (q.x * q.z - q.w * q.y), ry = -2 * (q.y * q.z + q.w * q.x);
        if (x0 == null) { x0 = rx; y0 = ry; }
        x = Math.max(-1, Math.min(1, (rx - x0) / 0.4));
        y = Math.max(-1, Math.min(1, (ry - y0) / 0.4));
      }
    },
    recenter() { x0 = null; },
    read() { return { live, x, y, charge }; },
    debug: {},
  };
}

export async function createEngine({ canvas }) {
  const ctx = canvas.getContext('2d');
  const listeners = new Map();
  const emit = (ev, p = {}) => (listeners.get(ev) || []).forEach((cb) => cb(p));
  const mk = () => ({ cfg: null, x: 0, z: 0, vx: 0, vz: 0, face: 0, charge: 0, dashT: 0, cool: 0, stun: 0, safe: 0, state: 'drive', stateT: 0, lastBy: -1, lastAt: -99, held: false, cpuT: 0, cpuAim: 0, cpuCharge: false });
  const carts = [mk(), mk(), mk(), mk()];
  let fence = Array(PANELS).fill(2);
  let active = false, paused = false, camMode = 'title', celeb = [], t = 0, shake = 0;

  function spawn(i) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    return [Math.cos(a) * SPAWN, Math.sin(a) * SPAWN];
  }
  function place(i) {
    const c = carts[i];
    [c.x, c.z] = spawn(i);
    Object.assign(c, { vx: 0, vz: 0, charge: 0, dashT: 0, cool: 0, stun: 0, safe: 0, state: 'drive', stateT: 0, lastBy: -1, lastAt: -99, held: false });
    c.face = Math.atan2(-c.z, -c.x);
  }
  function resetRound() {
    fence = Array(PANELS).fill(2);
    carts.forEach((_, i) => place(i));
    celeb = [];
    active = false;
  }
  resetRound();

  function intentOf(i) {
    const c = carts[i];
    if (!c.cfg) return { live: false, x: 0, y: 0, charge: false };
    if (!c.cfg.cpu) return c.cfg.control?.read(0.016) || { live: false, x: 0, y: 0, charge: false };
    // scripted CPU: wander toward the nearest other cart, charge now and then
    c.cpuT -= 0.016;
    if (c.cpuT <= 0) {
      c.cpuT = 0.5 + Math.random();
      let best = null, bd = 1e9;
      carts.forEach((o, k) => { if (k !== i && o.cfg && o.state === 'drive') { const d = Math.hypot(o.x - c.x, o.z - c.z); if (d < bd) { bd = d; best = o; } } });
      c.cpuAim = best ? Math.atan2(best.z - c.z, best.x - c.x) + (Math.random() - 0.5) * 0.5 : Math.random() * 6.28;
      c.cpuCharge = bd < 4 && Math.random() < 0.45;
    }
    return { live: true, x: Math.cos(c.cpuAim) * 0.8, y: -Math.sin(c.cpuAim) * 0.8, charge: c.cpuCharge };
  }

  function setState(c, s) { c.state = s; c.stateT = 0; }

  function stepCart(i, dt) {
    const c = carts[i];
    if (!c.cfg) return;
    c.stateT += dt;
    c.safe = Math.max(0, c.safe - dt);
    c.cool = Math.max(0, c.cool - dt);
    c.stun = Math.max(0, c.stun - dt);
    if (c.state === 'fall') {
      c.x += c.vx * dt; c.z += c.vz * dt;
      if (c.stateT > 0.9) setState(c, 'out'); 
      return;
    }
    if (c.state === 'out') {
      if (c.stateT > 2) {
        let bd = -1, bp = null;
        for (let k = 0; k < 4; k++) {
          const [sx, sz] = spawn(k);
          const d = Math.min(...carts.map((o, j) => (j !== i && o.cfg && o.state !== 'out' ? Math.hypot(o.x - sx, o.z - sz) : 99)));
          if (d > bd) { bd = d; bp = [sx, sz]; }
        }
        [c.x, c.z] = bp; c.vx = c.vz = 0; c.safe = 1.5; c.charge = 0; setState(c, 'drive');
        emit('respawn', { i });
      }
      return;
    }
    const it = active ? intentOf(i) : { live: false, x: 0, y: 0, charge: false };
    const free = c.stun <= 0;
    const charging = free && it.charge && c.cool <= 0 && c.dashT <= 0;
    if (charging) {
      if (c.state !== 'charge') { setState(c, 'charge'); emit('charge', { i, full: false }); }
      const was = c.charge;
      c.charge = Math.min(1, c.charge + dt / 1.0);
      if (was < 1 && c.charge >= 1) emit('charge', { i, full: true });
    } else if (c.state === 'charge') {
      const ch = c.charge;
      c.charge = 0;
      if (ch >= 0.15) {
        const m = Math.hypot(it.x, -it.y), a = m > 0.1 ? Math.atan2(-it.y, it.x) : c.face;
        const sp = 7 + 8 * ch;
        c.vx = Math.cos(a) * sp; c.vz = Math.sin(a) * sp; c.face = a;
        c.dashT = 0.35; c.cool = 0.95; setState(c, 'dash');
        emit('dash', { i, charge: ch });
      } else setState(c, 'drive');
    }
    if (c.state === 'dash' && c.dashT <= 0) setState(c, 'drive');
    c.dashT = Math.max(0, c.dashT - dt);
    if (c.state === 'dash' && c.dashT <= 0) setState(c, 'drive');
    const acc = (c.state === 'charge' ? 0.25 : 1) * 14;
    if (free && c.state !== 'dash') { c.vx += it.x * acc * dt; c.vz += -it.y * acc * dt; }
    const drag = (c.state === 'charge' ? 5 : c.state === 'dash' ? 0.75 : 2.5) * dt;
    c.vx -= c.vx * drag; c.vz -= c.vz * drag;
    c.x += c.vx * dt; c.z += c.vz * dt;
    if (Math.hypot(c.vx, c.vz) > 0.6) c.face = Math.atan2(c.vz, c.vx);
  }

  function collide() {
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
      const a = carts[i], b = carts[j];
      if (!a.cfg || !b.cfg) continue;
      if (['fall', 'out'].includes(a.state) || ['fall', 'out'].includes(b.state)) continue;
      const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz) || 1e-6;
      if (d >= CART_R * 2) continue;
      const nx = dx / d, nz = dz / d;
      const push = (CART_R * 2 - d) / 2;
      a.x -= nx * push; a.z -= nz * push; b.x += nx * push; b.z += nz * push;
      if (a.safe > 0 || b.safe > 0) continue;
      const closing = (a.vx - b.vx) * nx + (a.vz - b.vz) * nz;
      if (closing <= 0) continue;
      const j2 = 0.95 * closing;
      const av = Math.hypot(a.vx, a.vz), bv = Math.hypot(b.vx, b.vz);
      a.vx -= j2 * nx; a.vz -= j2 * nz; b.vx += j2 * nx; b.vz += j2 * nz;
      const power = Math.min(1, closing / 15);
      if (a.state === 'dash' && b.state === 'dash' && closing > 12) {
        a.stun = b.stun = 0.4; emit('clash', { a: i, b: j }); shake = 0.4; continue;
      }
      const by = a.state === 'dash' ? i : b.state === 'dash' ? j : av > bv ? i : bv > av ? j : -1;
      if (by === i) { b.vx += nx * 0.45 * av; b.vz += nz * 0.45 * av; }
      if (by === j) { a.vx -= nx * 0.45 * bv; a.vz -= nz * 0.45 * bv; }
      a.stun = b.stun = Math.max(a.stun, 0.15 + 0.5 * power);
      if (power > 0.25) { if (by === i) { b.lastBy = i; b.lastAt = t; } else if (by === j) { a.lastBy = j; a.lastAt = t; } }
      if (power >= 0.1) { emit('bump', { a: i, b: j, power, by }); shake = Math.max(shake, power * 0.5); }
    }
  }

  function fenceCheck(i) {
    const c = carts[i];
    if (!c.cfg || c.state === 'fall' || c.state === 'out') return;
    const r = Math.hypot(c.x, c.z);
    if (r > R + 0.3) {
      setState(c, 'fall');
      const by = c.lastBy >= 0 && t - c.lastAt <= 4 ? c.lastBy : -1;
      c.lastBy = -1;
      emit('fall', { i, by });
      return;
    }
    if (r < R - CART_R) return;
    const p = Math.floor((((Math.atan2(c.z, c.x) / (Math.PI * 2)) + 1) % 1) * PANELS);
    if (fence[p] > 0) {
      const nx = c.x / r, nz = c.z / r, vn = c.vx * nx + c.vz * nz;
      if (vn > 0) {
        if (vn > 6) { fence[p]--; emit('fence', { panel: p, hp: fence[p], i }); shake = Math.max(shake, 0.4); }
        c.vx -= 1.7 * vn * nx; c.vz -= 1.7 * vn * nz;
        c.x = nx * (R - CART_R); c.z = nz * (R - CART_R);
      }
    }
  }

  const engine = {
    on(ev, cb) {
      if (!listeners.has(ev)) listeners.set(ev, new Set());
      listeners.get(ev).add(cb);
      return () => listeners.get(ev).delete(cb);
    },
    setCart(i, cfg) { carts[i].cfg = cfg || null; place(i); },
    resetRound,
    setActive(on) { active = !!on; },
    setPaused(on) { paused = !!on; },
    dropFence() { fence = fence.map(() => 0); shake = 0.6; },
    setCamera(m) { camMode = m; },
    celebrate(order) { celeb = Array.isArray(order) ? order : []; },
    snapshot() {
      return {
        carts: carts.filter((c) => c.cfg).map((c) => ({ i: carts.indexOf(c), x: c.x, z: c.z, state: c.state, charge: c.charge, safe: c.safe > 0, edge: Math.max(0, Math.min(1, Math.hypot(c.x, c.z) / R)) })),
        fence: [...fence],
      };
    },
    update(dt) {
      if (paused) return;
      t += dt;
      shake = Math.max(0, shake - dt);
      for (let i = 0; i < 4; i++) stepCart(i, dt);
      if (active) {
        collide();
        for (let i = 0; i < 4; i++) fenceCheck(i);
      }
    },
    render() {
      const w = (canvas.width = canvas.clientWidth), h = (canvas.height = canvas.clientHeight);
      ctx.fillStyle = '#7a5230'; ctx.fillRect(0, 0, w, h);
      const sc = Math.min(w, h * 1.15) / (2 * (R + 2.2));
      const sx = shake > 0 ? (Math.random() - 0.5) * 8 * shake : 0;
      const cx = w / 2 + sx, cy = h * 0.55;
      ctx.lineWidth = 4; ctx.strokeStyle = '#1b1b3a';
      ctx.fillStyle = '#d9a455'; ctx.beginPath(); ctx.arc(cx, cy, R * sc, 0, 7); ctx.fill(); ctx.stroke();
      for (let p = 0; p < PANELS; p++) {
        if (fence[p] <= 0) continue;
        const a0 = (p / PANELS) * Math.PI * 2, a1 = ((p + 0.82) / PANELS) * Math.PI * 2;
        ctx.strokeStyle = fence[p] === 2 ? '#fff' : '#d9b6a0'; ctx.lineWidth = 9;
        ctx.beginPath(); ctx.arc(cx, cy, (R + 0.1) * sc, a0, a1); ctx.stroke();
      }
      ctx.lineWidth = 4; ctx.strokeStyle = '#1b1b3a'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
      carts.forEach((c, i) => {
        if (!c.cfg || c.state === 'out') return;
        const px = cx + c.x * sc, py = cy + c.z * sc * 0.92;
        const k = c.state === 'fall' ? Math.max(0.3, 1 - c.stateT) : 1;
        ctx.globalAlpha = c.safe > 0 && Math.floor(t * 10) % 2 ? 0.4 : 1;
        ctx.fillStyle = c.cfg.color || '#fff';
        ctx.beginPath(); ctx.arc(px, py, CART_R * sc * k * (1 + c.charge * 0.1), 0, 7); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(c.face) * CART_R * sc, py + Math.sin(c.face) * CART_R * sc * 0.92); ctx.stroke();
        if (c.charge > 0) { ctx.strokeStyle = '#ffd21f'; ctx.beginPath(); ctx.arc(px, py, CART_R * sc + 6, -1.57, -1.57 + c.charge * 6.28); ctx.stroke(); ctx.strokeStyle = '#1b1b3a'; }
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#1b1b3a';
        ctx.fillText(`${c.cfg.name || ''}${c.cfg.cpu ? ' (CPU)' : ''}`, px, py - CART_R * sc - 8);
        const rk = celeb.indexOf(i);
        if (rk >= 0) ctx.fillText(`#${rk + 1}`, px, py + CART_R * sc + 18);
      });
      ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.font = '13px sans-serif';
      ctx.fillText(`STUB ENGINE (2D, not the real game) - camera: ${camMode}`, 10, h - 10);
    },
    resize() {},
    audio: { unlock() {}, play() {}, setMuted() {}, music() {} },
    dispose() {},
    isStub: true,
  };
  return engine;
}
