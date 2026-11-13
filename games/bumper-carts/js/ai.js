// Bumper Carts - CPU drivers. createAI returns a Control ({ read(dt) -> CartIntent, recenter() }) that reads
// the live Sim directly (pure, seeded). Levels from PLAN.md section 6: easy / normal / hard.
import { AI, ARENA, CART, CHARGE, FENCE } from './constants.js';
import { rng, panelAngle, panelAt } from './sim.js';

const PI = Math.PI;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const norm = (x, z) => { const m = Math.hypot(x, z); return m < 1e-6 ? { x: 0, z: 0, m: 0 } : { x: x / m, z: z / m, m }; };
const rot = (v, a) => ({ x: v.x * Math.cos(a) - v.z * Math.sin(a), z: v.x * Math.sin(a) + v.z * Math.cos(a) });
const toIntent = (x, z, charge = false) => {
  const m = Math.hypot(x, z);
  const k = m > 1 ? 1 / m : 1;
  return { live: true, x: x * k, y: -z * k, charge };
};
const IDLE = Object.freeze({ live: true, x: 0, y: 0, charge: false });

export function createAI({ level = 'normal', index = 0, sim, seed = 1 } = {}) {
  if (!sim) throw new Error('createAI: sim required');
  const L = AI[level] || AI.normal;
  const rand = rng((seed >>> 0) + index * 7919 + 1);
  const st = {
    planT: 0, target: -1, push: { x: 1, z: 0 }, lineUp: false, wantCharge: 0.8, err: 0, mode: 'seek', modeT: 0,
    willCharge: false, wander: rand() * PI * 2,
  };

  const me = () => sim.carts[index];
  const alive = (c) => c.present && c.state !== 'fall' && c.state !== 'out';

  function nearestGap(x, z) {
    // nearest broken panel centre (direction) to a point, or null
    let best = null, bd = 1e9;
    for (let k = 0; k < sim.fence.length; k++) {
      if (sim.fence[k] > 0) continue;
      const a = panelAngle(k);
      const gx = Math.cos(a) * FENCE.radius, gz = Math.sin(a) * FENCE.radius;
      const d = Math.hypot(gx - x, gz - z);
      if (d < bd) { bd = d; best = { x: gx, z: gz, d }; }
    }
    return best;
  }

  function pickTarget(c) {
    let best = -1, bs = -1e9;
    const maxKo = Math.max(...sim.kos);
    for (const o of sim.carts) {
      if (o === c || !alive(o) || o.safeT > 0) continue;
      const d = Math.hypot(o.x - c.x, o.z - c.z);
      let s;
      if (L.target === 'nearest') s = -d;
      else {
        s = sim.edgeOf(o) * 6 - d * 0.6;
        if (L.leaderBias && maxKo > 0 && sim.kos[o.i] === maxKo) s += L.leaderBias;
      }
      if (o.i === st.target) s += 0.5;   // a little stickiness
      if (s > bs) { bs = s; best = o.i; }
    }
    return best;
  }

  function replan(c) {
    st.planT = L.replan * (0.85 + rand() * 0.3);
    st.target = pickTarget(c);
    st.err = (rand() * 2 - 1) * L.aimErr;
    st.lineUp = rand() < L.lineUp;
    st.willCharge = rand() < L.chargeP;
    if (st.mode !== 'charge') st.wantCharge = level === 'easy' ? 0.35 + rand() * 0.45 : level === 'normal' ? 0.55 + rand() * 0.45 : 0.75 + rand() * 0.25;
    if (st.target < 0) return;
    const T = sim.carts[st.target];
    let push;
    if (st.lineUp) {
      const gap = nearestGap(T.x, T.z);
      if (gap && gap.d < 6) push = norm(gap.x - T.x, gap.z - T.z);
      else push = norm(T.x, T.z);
      if (push.m === 0) push = norm(T.x - c.x, T.z - c.z);
    } else push = norm(T.x - c.x, T.z - c.z);
    if (push.m === 0) push = { x: 1, z: 0 };
    st.push = push;
  }

  /** Danger: how far past the safe margin I am (0 = fine). Gaps count as an extra margin. */
  function rimDanger(c) {
    const d = Math.hypot(c.x, c.z);
    let margin = L.rimMargin;
    if (level !== 'easy') {
      const k = panelAt(c.x, c.z);
      if (sim.fence[k] <= 0) margin += 0.8;
    }
    return Math.max(0, d - (ARENA.radius - CART.radius - margin));
  }

  function read(dt = 0) {
    const c = me();
    if (!c || !alive(c)) { st.mode = 'seek'; return IDLE; }
    st.planT -= dt;
    st.modeT -= dt;
    if (st.planT <= 0) replan(c);

    // 1. dodge an incoming dash (hard)
    if (L.dodge && !c.charging) {
      for (const o of sim.carts) {
        if (o === c || !alive(o) || o.dashT <= 0) continue;
        const to = norm(c.x - o.x, c.z - o.z), v = norm(o.vx, o.vz);
        if (to.m < 4.5 && v.x * to.x + v.z * to.z > Math.cos(0.45)) {
          // sidestep, toward the centre side
          let sx = -v.z, sz = v.x;
          if (sx * -c.x + sz * -c.z < 0) { sx = -sx; sz = -sz; }
          return toIntent(sx, sz);
        }
      }
    }

    // 2. back off the rim / open gaps
    const danger = rimDanger(c);
    if (danger > 0) {
      const home = norm(-c.x, -c.z);
      if (c.charging) return toIntent(home.x, home.z, false);   // release toward the middle
      st.mode = 'seek';
      return toIntent(home.x, home.z);
    }

    const T = st.target >= 0 ? sim.carts[st.target] : null;
    if (!T || !alive(T) || T.safeT > 0) {
      // nobody to hit: cruise around the middle
      st.wander += dt * 0.6;
      const gx = Math.cos(st.wander) * 2 - c.x, gz = Math.sin(st.wander) * 2 - c.z;
      const g = norm(gx, gz);
      if (c.charging) return toIntent(g.x, g.z, false);
      return toIntent(g.x * clamp(g.m, 0, 1), g.z * clamp(g.m, 0, 1));
    }

    const to = norm(T.x - c.x, T.z - c.z);
    // aim point (hard leads a moving target)
    let ax = T.x, az = T.z;
    if (L.lead) {
      const sp = CHARGE.dashMin + (CHARGE.dashMax - CHARGE.dashMin) * Math.max(c.charge, 0.5);
      const tHit = to.m / sp;
      ax += T.vx * tHit; az += T.vz * tHit;
    }
    const aim = rot(norm(ax - c.x, az - c.z), st.err);

    // 3. charging: hold until the wanted charge, then let go along the aim
    if (c.charging) {
      if (c.charge >= st.wantCharge || to.m > AI.chargeRange + 1.5) return toIntent(aim.x, aim.z, false);
      return toIntent(aim.x, aim.z, true);
    }

    // 4. seek: get onto the push line, then charge or just drive through
    const lined = to.m < 0.1 || (to.x * st.push.x + to.z * st.push.z) > Math.cos(AI.lineUpDeg * PI / 180);
    const canCharge = c.dashT <= 0 && c.cooldownT <= 0 && c.stunT <= 0;
    if (lined && to.m < AI.chargeRange && to.m > CART.radius * 2.6 && st.willCharge && canCharge) {
      st.mode = 'charge';
      return toIntent(aim.x, aim.z, true);
    }
    if (lined || !st.lineUp) return toIntent(aim.x, aim.z);
    // go round to the approach point behind the target, skirting it
    const px = T.x - st.push.x * AI.approachGap, pz = T.z - st.push.z * AI.approachGap;
    let g = norm(px - c.x, pz - c.z);
    // the target is in the way: add a sideways component
    const dotT = g.x * to.x + g.z * to.z;
    if (dotT > 0.3 && to.m < g.m + 0.5) {
      let sx = -to.z, sz = to.x;
      if (sx * (px - T.x) + sz * (pz - T.z) < 0) { sx = -sx; sz = -sz; }
      g = norm(g.x + sx * 1.2, g.z + sz * 1.2);
    }
    const slow = clamp(Math.hypot(px - c.x, pz - c.z) / 1.2, 0.35, 1);
    return toIntent(g.x * slow, g.z * slow);
  }

  return {
    level,
    read,
    recenter() {},
    get debug() { return { ...st }; },
  };
}
