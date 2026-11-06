// CPU racers: follow the centreline with a personal lane, cut inside on turns,
// dodge hazards, drift on long corners and use items tactically.
const wrapA = a => Math.atan2(Math.sin(a), Math.cos(a));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export class AIDriver {
  constructor(kart, skill) {
    this.k = kart;
    this.skill = skill;                      // 0..1
    this.baseLane = (Math.random() - .5) * 8;
    this.lane = this.baseLane;
    this.laneTimer = 2 + Math.random() * 4;
    this.itemDelay = 1 + Math.random() * 2;
    this.stuckT = 0; this.reverseT = 0;
    this.driftHold = false;
    this.wobble = Math.random() * 10;
  }

  think(dt, game) {
    const k = this.k, tr = game.track, inp = k.input;
    inp.item = false;
    const sp = Math.max(k.speed, 12);
    const look = Math.round((9 + sp * .5) / tr.seg);
    const ti = tr.wrap(k.idx + look);
    const far = tr.wrap(k.idx + look * 2);
    const cAhead = tr.curv[far];

    this.laneTimer -= dt;
    if (this.laneTimer < 0) { this.laneTimer = 2 + Math.random() * 4; this.baseLane = (Math.random() - .5) * 9; }
    let target = this.baseLane - clamp(cAhead * 160, -5, 5) * this.skill;
    // dodge hazards near the aim point
    const p0 = tr.at(ti, target);
    const avoid = (x, z, r) => {
      const d = Math.hypot(p0.x - x, p0.z - z);
      if (d < r + 2.5) {
        const n = tr.nearest(x, z, ti, {});
        target = n.lat > target ? n.lat - r - 3 : n.lat + r + 3;
      }
    };
    if (this.skill > .3) {
      for (const m of tr.patches) avoid(m.x, m.z, m.r);
      for (const c of tr.colliders) avoid(c.x, c.z, c.r);
      for (const c of tr.crossers) avoid(c.x, c.z, 2.2);
      for (const h of game.items.hazards) avoid(h.x, h.z, 1.5);
    }
    // moving hazards report where they will be when we get there
    const dodge = (lat, r) => {
      if (Math.abs(target - lat) >= r + 2.2) return;
      let t = lat > target ? lat - r - 2.6 : lat + r + 2.6;
      if (Math.abs(t) > 8.5) t = lat > target ? lat + r + 2.6 : lat - r - 2.6;
      target = t;
    };
    if (this.skill > .2) for (const h of tr.hazards) h.avoid(dodge, k, game);
    // line up with boost ramps
    for (const r of tr.ramps) {
      if (!r.boost) continue;
      let d = r.i - k.idx; if (d < 0) d += tr.N;
      if (d * tr.seg < 60 && d * tr.seg > 2 && Math.random() < this.skill + .3) target = r.lat;
    }
    target = clamp(target, -8, 8);
    this.lane += (target - this.lane) * Math.min(1, dt * 2.2);
    const p = tr.at(ti, this.lane + Math.sin(game.time * .7 + this.wobble) * (1 - this.skill) * 2);
    const desired = Math.atan2(p.x - k.x, p.z - k.z);
    const diff = wrapA(desired - k.heading);
    inp.steer = clamp(-diff * 2.6, -1, 1);
    inp.gas = true; inp.brake = false;
    if (Math.abs(diff) > 1.1 && k.speed > 18) { inp.gas = false; inp.brake = true; }
    // wait at the level crossing while the train passes
    this.waiting = tr.hazards.some(h => h.stopFor(k));
    if (this.waiting) { inp.gas = false; inp.brake = k.speed > 2; }

    // drifting on long bends
    const cNow = tr.curv[tr.wrap(k.idx + Math.round(6 / tr.seg))];
    if (!this.driftHold && Math.abs(cNow) > .018 && k.speed > 26 && Math.random() < this.skill * dt * 6 && Math.sign(-cNow) === Math.sign(inp.steer)) this.driftHold = true;
    if (this.driftHold && (Math.abs(cNow) < .008 || k.speed < 14)) this.driftHold = false;
    inp.drift = this.driftHold;
    // tricks off ramps
    if (k.jump && k.airborne && !k.trickDone && k.airT > .12) { this.trickTap = !this.trickTap; inp.drift = this.trickTap && Math.random() < this.skill + .2; }

    // stuck recovery
    if (game.raceOn && Math.abs(k.speed) < 3 && k.spinT <= 0 && !this.waiting) this.stuckT += dt; else this.stuckT = 0;
    if (this.stuckT > 1.4) { this.reverseT = 1; this.stuckT = 0; }
    if (this.reverseT > 0) { this.reverseT -= dt; inp.gas = false; inp.brake = true; inp.steer = -inp.steer; inp.drift = false; }

    // items
    if (k.item) {
      this.itemDelay -= dt;
      if (this.itemDelay <= 0) {
        let use = false;
        const karts = game.karts;
        switch (k.item) {
          case 'carrot': case 'carrot3': use = Math.abs(cAhead) < .012; break;
          case 'bee': case 'clover': use = true; break;
          case 'egg': use = karts.some(o => o !== k && aheadWithin(k, o, 55, .25)) || this.itemDelay < -8; break;
          case 'mud': use = karts.some(o => o !== k && behindWithin(k, o, 25)) || this.itemDelay < -8; break;
        }
        if (use) { inp.item = true; this.itemDelay = .6 + Math.random() * 2.5; }
      }
    }
  }
}

function aheadWithin(k, o, dist, cone) {
  const dx = o.x - k.x, dz = o.z - k.z, d = Math.hypot(dx, dz);
  if (d > dist || d < 2) return false;
  return Math.abs(wrapA(Math.atan2(dx, dz) - k.heading)) < cone;
}
function behindWithin(k, o, dist) {
  const dx = o.x - k.x, dz = o.z - k.z, d = Math.hypot(dx, dz);
  return d < dist && (dx * k.fx + dz * k.fz) < 0;
}
