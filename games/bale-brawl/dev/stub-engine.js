// Stand-in for js/engine.js so the menus, flow and HUD can be built and tested without the 3D engine.
// Same interface as PLAN.md 3.4 (createEngine, on, setFighter, snapshot, events ...), but the "world"
// is a flat 2D drawing and the fight is a rough copy of the real rules. NOT the real game.
// main.js loads this only when js/engine.js is missing or the URL has ?stub.

export const STUB_CONSTANTS = Object.freeze({
  ARENA: { radius: 4.2, teeter: 0.6, startX: 1.3 },
  FIGHT: { engageGap: 1.6, reach: 2.0, walk: 1.2 },
  MATCH: { bestOf: [3, 5], roundSeconds: 45, suddenShrinkSeconds: 12, suddenMinScale: 0.45, countdown: 3, ringoutPause: 2.2 },
  PLAYERS: [
    { name: 'Red Cow', color: '#ff3b30', animal: 'cow' },
    { name: 'Blue Pig', color: '#2f7cff', animal: 'pig' },
  ],
  CPU_CAST: {
    easy: { name: 'Woolsworth', animal: 'sheep', color: '#2fc65a' },
    normal: { name: 'Billy Bonk', animal: 'goat', color: '#ffd21f' },
    hard: { name: 'Sir Loin', animal: 'bull', color: '#7b4dff' },
    champ: { name: 'Red Comb', animal: 'rooster', color: '#ff8a1f' },
  },
});

/** Crude phone sword for when js/sword-input.js is missing: Action = guard, a quick gyro spike = swing. */
export function createStubPhoneSword() {
  let guard = false, yaw = 0, pitch = 0.5, live = false, swing = null, cool = 0, y0 = null;
  return {
    push(p) {
      live = true;
      guard = !!(p.buttons & 1);
      const rate = Math.hypot(p.gyro?.alpha || 0, p.gyro?.beta || 0);
      if (rate > 300 && cool <= 0 && !guard) {
        swing = { dir: Math.atan2(p.gyro.alpha, -p.gyro.beta), power: Math.min(1, rate / 700) };
        cool = 0.4;
      }
      if (p.q && (p.q.w || p.q.x || p.q.y || p.q.z)) {
        const { x, y, z, w } = p.q;
        const vx = 2 * (x * y - w * z), vy = 1 - 2 * (x * x + z * z), vz = 2 * (y * z + w * x);
        const h = Math.atan2(vx, vy);
        if (y0 == null) y0 = h;
        yaw = Math.max(-1.4, Math.min(1.4, h - y0));
        pitch = Math.asin(Math.max(-1, Math.min(1, vz)));
      }
    },
    setGuard(v) { guard = !!v; },
    recenter() { y0 = null; },
    read(dt) {
      cool -= dt;
      const s = swing;
      swing = null;
      return { live, yaw, pitch, bladeAngle: Math.PI / 2, guard, swing: s };
    },
    debug: {},
  };
}

export async function createEngine({ canvas }) {
  const C = STUB_CONSTANTS;
  const ctx = canvas.getContext('2d');
  const listeners = new Map();
  const emit = (ev, p = {}) => (listeners.get(ev) || []).forEach((cb) => cb(p));
  const fighters = [0, 1].map(() => ({ cfg: null, x: 0, vel: 0, stagger: 0, stun: 0, pend: null, cool: 0, guardT: 0, intent: null, out: false, cpuT: 1, teeterT: 0 }));
  let active = false, paused = false, scale = 1, scaleTarget = 1, scaleRate = 0, knock = 1, camMode = 'title', celeb = -2, t = 0, splashT = -1, splashWho = -2;
  let ringoutLoser = -2, ringoutAt = -1;
  const log = [];

  function resetRound() {
    fighters.forEach((f, i) => Object.assign(f, { x: i ? C.ARENA.startX : -C.ARENA.startX, vel: 0, stagger: 0, stun: 0, pend: null, cool: 0, out: false, teeterT: 0, cpuT: 1 + Math.random() }));
    scale = scaleTarget = 1; scaleRate = 0; knock = 1; celeb = -2; splashT = -1; ringoutLoser = -2; ringoutAt = -1; active = false;
  }
  resetRound();

  const radius = () => C.ARENA.radius * scale;
  const dirOf = (i) => (i === 0 ? 1 : -1);

  function cpuIntent(i, dt) {
    const f = fighters[i], o = fighters[1 - i];
    f.cpuT -= dt;
    const inReach = Math.abs(f.x - o.x) < C.FIGHT.reach;
    const guard = inReach && ((t * 0.7 + i) % 3 < 1.1);
    let swing = null;
    if (f.cpuT <= 0 && !guard) {
      f.cpuT = 1.2 + Math.random() * 1.2;
      swing = { dir: [0, Math.PI, Math.PI / 2, -Math.PI / 2][Math.floor(Math.random() * 4)], power: 0.5 + Math.random() * 0.4, windup: 0.4 };
    }
    return { live: true, yaw: 0, pitch: 0.5, bladeAngle: Math.PI / 2, guard, swing };
  }

  function land(i, st) {
    const a = fighters[i], v = fighters[1 - i];
    if (a.out || v.out || Math.abs(a.x - v.x) >= C.FIGHT.reach) return;
    if (v.pend && v.pend.t < 0.12) {
      [a, v].forEach((f, k) => (f.vel += -dirOf(k ? 1 - i : i) * 0.35 * 4));
      emit('clash', {});
      v.pend = null;
      return;
    }
    const vi = 1 - i;
    const gi = v.intent?.guard && v.guardT > 0.06;
    let mult = v.stagger > 0 ? 1.6 : 1;
    if (gi) {
      const aa = (((Math.PI - st.dir) % Math.PI) + Math.PI) % Math.PI;
      const b = v.intent.bladeAngle ?? Math.PI / 2;
      let d = Math.abs(aa - b);
      d = Math.min(d, Math.PI - d);
      if (d >= (50 * Math.PI) / 180) {
        a.stagger = v.guardT < 0.25 ? 1.0 : 0.7;
        emit('block', { attacker: i, blocker: vi, perfect: v.guardT < 0.25 });
        return;
      }
      mult *= 0.5;
    }
    const k = (0.45 + 0.6 * st.power) * mult * knock;
    v.vel += dirOf(i) * k * 4;
    v.stun = 0.35;
    emit('hit', { attacker: i, victim: vi, power: st.power, knock: k, edge: Math.min(1, Math.abs(v.x) / radius()) });
  }

  const engine = {
    on(ev, cb) {
      if (!listeners.has(ev)) listeners.set(ev, new Set());
      listeners.get(ev).add(cb);
      return () => listeners.get(ev).delete(cb);
    },
    setFighter(i, cfg) { fighters[i].cfg = cfg; },
    resetRound,
    setActive(on) { active = !!on; },
    setPaused(on) { paused = !!on; },
    setArenaScale(s, secs) { scaleTarget = s; scaleRate = Math.abs(1 - s) / Math.max(0.01, secs); },
    setKnockScale(k) { knock = k; },
    setCamera(m) { camMode = m; },
    celebrate(i) { celeb = i; },
    snapshot() {
      return {
        arenaRadius: radius(),
        fighters: fighters.map((f) => ({
          x: f.x, edge: Math.max(0, Math.min(1, (Math.abs(f.x) - (radius() - 1.5)) / 1.5)),
          guard: !!(f.intent?.guard && f.guardT > 0.06), stagger: f.stagger, bladeAngle: f.intent?.bladeAngle ?? Math.PI / 2, live: !!f.intent?.live,
        })),
      };
    },
    update(dt) {
      if (paused) return;
      t += dt;
      if (scale > scaleTarget) scale = Math.max(scaleTarget, scale - scaleRate * dt);
      for (let i = 0; i < 2; i++) {
        const f = fighters[i], o = fighters[1 - i];
        f.intent = f.cfg?.cpu ? (active && !f.out ? cpuIntent(i, dt) : null) : f.cfg?.control?.read(dt) || null;
        f.stagger = Math.max(0, f.stagger - dt);
        f.stun = Math.max(0, f.stun - dt);
        f.cool = Math.max(0, f.cool - dt);
        f.guardT = f.intent?.guard ? f.guardT + dt : 0;
        if (!active || f.out) continue;
        const free = f.stagger <= 0 && f.stun <= 0;
        if (f.intent?.swing && free && f.cool <= 0 && !f.pend) {
          const s = f.intent.swing;
          f.pend = { t: s.windup ?? 0.09, dir: s.dir, power: s.power };
          f.cool = 0.38;
          emit('swing', { i, dir: s.dir, power: s.power });
        }
        if (f.pend) {
          f.pend.t -= dt;
          if (f.pend.t <= 0) {
            const st = f.pend;
            f.pend = null;
            land(i, st);
          }
        }
        if (free && Math.abs(f.x - o.x) > C.FIGHT.engageGap) f.x += dirOf(i) * C.FIGHT.walk * dt;
        f.x += f.vel * dt;
        f.vel *= Math.exp(-dt / 0.08);
        if (Math.abs(f.x) > radius() - C.ARENA.teeter && f.teeterT <= 0) {
          f.teeterT = 1;
          emit('edge', { i });
        }
        f.teeterT -= dt;
      }
      if (active) {
        const out = fighters.map((f) => Math.abs(f.x) > radius());
        if (out[0] || out[1]) {
          if (ringoutAt < 0) ringoutAt = t;
          if (out[0] && out[1] || t - ringoutAt > 0.25 || (out[0] !== out[1])) {
            const loser = out[0] && out[1] ? -1 : out[0] ? 0 : 1;
            active = false;
            fighters.forEach((f, k) => (f.out = loser === -1 || loser === k));
            ringoutLoser = loser;
            emit('ringout', { loser, winner: loser === -1 ? -1 : 1 - loser });
            splashT = 0.9;
          }
        }
      }
      if (splashT > 0) {
        splashT -= dt;
        if (splashT <= 0) emit('splash', { loser: ringoutLoser });
      }
    },
    render() {
      const w = canvas.width = canvas.clientWidth, h = canvas.height = canvas.clientHeight;
      ctx.fillStyle = '#9be0ff'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#2bb5e8'; ctx.fillRect(0, h * 0.62, w, h * 0.38);
      const sc = Math.min(w / 12, h / 6), cx = w / 2, by = h * 0.62;
      ctx.fillStyle = '#f2c45a'; ctx.strokeStyle = '#1b1b3a'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.rect(cx - radius() * sc, by - 14, radius() * 2 * sc, 70); ctx.fill(); ctx.stroke();
      fighters.forEach((f, i) => {
        const col = f.cfg?.color || '#fff';
        const y = f.out ? by + 90 : by - 40;
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx + f.x * sc, y, 30, 0, 7); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#1b1b3a'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText((f.cfg?.name || '') + (f.cfg?.animal ? ` (${f.cfg.animal})` : ''), cx + f.x * sc, y - 40);
        if (f.intent?.guard) { ctx.strokeStyle = '#fff'; ctx.strokeRect(cx + f.x * sc - 36, y - 36, 72, 72); ctx.strokeStyle = '#1b1b3a'; }
        if (celeb === i) ctx.fillText('WINNER', cx + f.x * sc, y + 54);
      });
      ctx.fillStyle = '#1b1b3a'; ctx.textAlign = 'left'; ctx.font = '13px sans-serif';
      ctx.fillText(`STUB ENGINE (no 3D) - camera: ${camMode}`, 10, h - 10);
    },
    resize() {},
    audio: { unlock() {}, play(n) { log.push(n); }, setMuted() {}, music() {} },
    dispose() {},
    isStub: true,
  };
  return engine;
}
