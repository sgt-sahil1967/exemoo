// Bumper Carts - engine: glues sim, ai, world, carts, fx, audio and cameras behind the interface of
// PLAN.md 5.3. main.js drives it with update(dt) / render() every frame.
//
// Notes for the integrator:
// - The sim keeps stepping while inactive, so a cart already falling plays out to its splash and respawn.
// - On the 'title' camera with the engine inactive, present carts drive themselves as an attract demo
//   (CPU carts use their AI); demo events are NOT emitted and play no sound. Any setActive(true),
//   resetRound() or a camera change ends the demo.
// - Besides the contract events, the engine also emits honk {i}, wall {panel, i, speed}, splash {i, x, z}.
import * as THREE from 'three';
import { Sim } from './sim.js';
import { createAI } from './ai.js';
import { createWorld } from './world.js';
import { createCart } from './cart.js';
import { createFx } from './fx.js';
import { createAudio } from './audio.js';
import { SEATS, ARENA, CHARGE, FENCE } from './constants.js';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const damp = (a, b, rate, dt) => a + (b - a) * (1 - Math.exp(-rate * dt));
const PLAY_PITCH = 52 * Math.PI / 180;

export async function createEngine({ canvas } = {}) {
  if (!canvas) throw new Error('createEngine: canvas required');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(2, globalThis.devicePixelRatio || 1));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const world = createWorld();
  const scene = world.scene;
  const camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 700);
  camera.position.set(0, 14, 12);
  const fx = createFx(scene);
  const audioCore = createAudio();
  const sim = new Sim({ seed: (Math.random() * 1e9) >>> 0 });

  const listeners = new Map();
  function emit(type, payload) {
    const set = listeners.get(type);
    if (!set) return;
    for (const cb of [...set]) { try { cb(payload); } catch (e) { console.error('[bumper-carts] listener', type, e); } }
  }

  // ── seats ──
  const slots = [0, 1, 2, 3].map((i) => ({ i, cfg: null, visual: null, control: null, ai: null, key: '', streakT: 0, dustT: 0, bubT: 0 }));
  function setCart(i, opts) {
    const slot = slots[i];
    if (!slot) return;
    if (!opts) {
      slot.cfg = null; slot.control = null; slot.ai = null;
      if (slot.visual) { slot.visual.dispose(); slot.visual = null; slot.key = ''; }
      sim.setPresent(i, false);
      audioCore.stopCharge(i);
      return;
    }
    const base = SEATS[i];
    const cpu = opts.cpu || null;
    const cfg = { name: opts.name ?? base.name, color: opts.color ?? base.color, animal: opts.animal ?? base.animal, control: opts.control ?? null, cpu };
    slot.cfg = cfg;
    const tag = cpu ? 'CPU' : `P${i + 1}`;
    const key = `${cfg.animal}|${cfg.color}|${tag}`;
    if (key !== slot.key) {
      if (slot.visual) slot.visual.dispose();
      slot.visual = createCart({ animal: cfg.animal, color: cfg.color, tag });
      scene.add(slot.visual.root);
      slot.key = key;
    }
    if (cpu) {
      if (!slot.ai || slot.ai.level !== cpu) slot.ai = createAI({ level: cpu, index: i, sim, seed: (sim.seed + i * 101) >>> 0 });
      slot.control = slot.ai;
    } else { slot.ai = null; slot.control = cfg.control; }
    sim.setPresent(i, true);
  }

  // ── state ──
  let active = false, paused = false, disposed = false, demo = false;
  let camMode = 'title', camSnap = true, time = 0, hitStop = 0, storm = false, celebrating = false;
  const camPos = new THREE.Vector3(0, 14, 14), camLook = new THREE.Vector3();
  const camTarget = new THREE.Vector3(), lookTarget = new THREE.Vector3();
  const playFit = { aspect: -1, pos: new THREE.Vector3(), look: new THREE.Vector3() };
  const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();

  world.on('panelSplash', (x, z) => { fx.mudSplash(x, z, 0.45); if (!demo) audioCore.play('splash'); });

  function colorOf(i) { return slots[i]?.cfg?.color || '#ffffff'; }
  function cartPos(i, out) { const c = sim.carts[i]; return out.set(c.x, 0.35, c.z); }

  function handle(ev, loud) {
    const { type, ...p } = ev;
    const say = (name, arg) => { if (loud) audioCore.play(name, arg); };
    switch (type) {
      case 'charge':
        if (!p.full) { if (loud) audioCore.startCharge(p.i, CHARGE.time); } else say('full');
        break;
      case 'honk': audioCore.stopCharge(p.i); say('honk'); break;
      case 'dash': {
        audioCore.stopCharge(p.i);
        say('whoosh', p.charge);
        const c = sim.carts[p.i];
        fx.dust(tmp.set(c.x, 0, c.z), 6, 1.2);
        fx.shake(0.02 + p.charge * 0.05, 0.15);
        break;
      }
      case 'bump': {
        const pw = p.power;
        cartPos(p.a, tmp); cartPos(p.b, tmp2);
        tmp.lerp(tmp2, 0.5);
        fx.impact(tmp, pw, p.by >= 0 ? colorOf(p.by) : '#ffd21f');
        say('bonk', pw);
        fx.shake(0.03 + pw * 0.14, 0.2 + pw * 0.1);
        if (pw > 0.45) hitStop = Math.max(hitStop, 0.03 + pw * 0.06);
        world.cheer(pw * 0.6);
        for (const i of [p.a, p.b]) if (!sim.carts[i].charging) audioCore.stopCharge(i);
        break;
      }
      case 'clash': {
        cartPos(p.a, tmp); cartPos(p.b, tmp2);
        tmp.lerp(tmp2, 0.5);
        fx.clashSpark(tmp);
        say('clash');
        fx.shake(0.16, 0.3);
        hitStop = 0.09;
        world.cheer(0.6);
        audioCore.stopCharge(p.a); audioCore.stopCharge(p.b);
        break;
      }
      case 'fence': {
        world.setFence(sim.fence);
        world.panelCentre(p.panel, tmp);
        tmp2.set(tmp.x, 0, tmp.z).normalize();
        fx.splinters(tmp, tmp2, p.hp === 0 ? 22 : 7);
        say(p.hp === 0 ? 'smash' : 'crack');
        fx.shake(p.hp === 0 ? 0.12 : 0.06, 0.25);
        if (p.hp === 0) world.cheer(0.7);
        break;
      }
      case 'wall': world.panelHit(p.panel, p.speed / 6); say('wall', clamp(p.speed / 8, 0, 1)); break;
      case 'fall': audioCore.stopCharge(p.i); say('crowd', 0.8); world.cheer(1); break;
      case 'splash':
        fx.mudSplash(p.x, p.z, 1);
        world.ripple(p.x, p.z, 1.3);
        say('splash');
        fx.shake(0.1, 0.3);
        world.cheer(1.2);
        break;
      case 'respawn': say('drop'); break;
      default: break;
    }
    if (loud) emit(type, p);
  }

  // ── cameras ──
  const fitCam = new THREE.PerspectiveCamera();
  const fitPts = [];
  for (let k = 0; k < 32; k++) {
    const a = (k / 32) * Math.PI * 2, r = ARENA.radius + 0.55;
    fitPts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r), new THREE.Vector3(Math.cos(a) * ARENA.radius, 1.3, Math.sin(a) * ARENA.radius));
  }
  /** Fixed 3/4 view: fit every rim point inside the frame (top margin left for the HUD). */
  function fitPlay() {
    if (playFit.aspect === camera.aspect && playFit.fov === camera.fov) return;
    playFit.aspect = camera.aspect; playFit.fov = camera.fov;
    fitCam.fov = camera.fov; fitCam.aspect = camera.aspect; fitCam.near = 0.1; fitCam.far = 500; fitCam.updateProjectionMatrix();
    const off = new THREE.Vector3(0, Math.sin(PLAY_PITCH), Math.cos(PLAY_PITCH));
    const look = new THREE.Vector3(0, 0, 0.4);
    const X = 0.93, YLO = -0.9, YHI = 0.74;
    const measure = (d) => {
      fitCam.position.copy(look).addScaledVector(off, d);
      fitCam.lookAt(look);
      fitCam.updateMatrixWorld(true);
      let xm = 0, ylo = 1e9, yhi = -1e9;
      for (const p of fitPts) {
        const v = tmp.copy(p).project(fitCam);
        xm = Math.max(xm, Math.abs(v.x)); ylo = Math.min(ylo, v.y); yhi = Math.max(yhi, v.y);
      }
      return { xm, ylo, yhi };
    };
    let d = 20;
    for (let pass = 0; pass < 4; pass++) {
      let lo = 4, hi = 120;
      for (let k = 0; k < 28; k++) {
        const mid = (lo + hi) / 2, m = measure(mid);
        const fits = m.xm <= X && m.ylo >= YLO && m.yhi <= YHI && (m.yhi - m.ylo) <= (YHI - YLO);
        if (fits) hi = mid; else lo = mid;
      }
      d = hi;
      const m = measure(d);
      const cy = (m.ylo + m.yhi) / 2 - (YLO + YHI) / 2;
      look.z -= cy * d * Math.tan((camera.fov * Math.PI) / 360) * 0.9;
    }
    playFit.look.copy(look);
    playFit.pos.copy(look).addScaledVector(off, d);
  }

  function updateCamera(dt) {
    let rate = 3;
    if (camMode === 'title') {
      const a = time * 0.08 + 0.9;
      const ab = clamp(1.5 / Math.max(0.5, camera.aspect), 1, 2);
      camTarget.set(Math.cos(a) * 17 * ab, 8.5 * ab, Math.sin(a) * 17 * ab);
      lookTarget.set(0, 0.3, 0);
      rate = 2.5;
    } else if (camMode === 'results') {
      const ab = clamp(1.6 / Math.max(0.5, camera.aspect), 1, 2.4);
      camTarget.set(0, 2.5 + (ab - 1) * 0.8, 6.2 * ab);
      lookTarget.set(0, 1.05, 0);
      rate = 2.2;
    } else {
      fitPlay();
      camTarget.copy(playFit.pos);
      lookTarget.copy(playFit.look);
      rate = 3.5;
    }
    if (camSnap) { camPos.copy(camTarget); camLook.copy(lookTarget); camSnap = false; }
    camPos.x = damp(camPos.x, camTarget.x, rate, dt);
    camPos.y = damp(camPos.y, camTarget.y, rate, dt);
    camPos.z = damp(camPos.z, camTarget.z, rate, dt);
    camLook.x = damp(camLook.x, lookTarget.x, rate * 1.3, dt);
    camLook.y = damp(camLook.y, lookTarget.y, rate * 1.3, dt);
    camLook.z = damp(camLook.z, lookTarget.z, rate * 1.3, dt);
    camera.position.copy(camPos).add(fx.shakeOffset);
    camera.lookAt(camLook);
  }

  function setDemo(on) {
    if (demo === on) return;
    demo = on;
    sim.setActive(active || demo);
    if (!on) audioCore.stopAllCharges();
  }

  // ── public API ──
  const engine = {
    on(event, cb) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(cb);
      return () => listeners.get(event)?.delete(cb);
    },
    setCart,
    resetRound(seed) {
      setDemo(false);
      sim.reset(seed != null ? seed : (Math.random() * 1e9) >>> 0);
      for (const s of slots) if (s.cfg && s.cfg.cpu) s.ai = s.control = createAI({ level: s.cfg.cpu, index: s.i, sim, seed: (sim.seed + s.i * 101) >>> 0 });
      storm = false; celebrating = false; hitStop = 0;
      fx.clear();
      world.setPodium(false);
      world.setFence(sim.fence);
      audioCore.stopAllCharges();
      for (const s of slots) if (s.visual) s.visual.setMode('play');
    },
    setActive(on) {
      active = !!on;
      if (active) setDemo(false);
      sim.setActive(active || demo);
      if (!active) audioCore.stopAllCharges();
    },
    setPaused(on) { paused = !!on; audioCore.setPaused(paused); },
    dropFence() {
      sim.dropFence();
      storm = true;
      world.setFence(sim.fence, true);
      fx.shake(0.15, 0.8);
      world.cheer(1.2);
    },
    setCamera(mode) {
      if (!['title', 'play', 'results'].includes(mode)) return;
      if (mode !== camMode && demo) {
        setDemo(false);
        if (mode === 'play') engine.resetRound();
      }
      if (mode === 'title' && celebrating) engine.resetRound();
      camMode = mode;
    },
    celebrate(order = []) {
      if (!order || !order.length) {
        // empty order = clear the podium, carts back on the floor
        celebrating = false;
        world.setPodium(false);
        for (const s of slots) if (s.visual && s.visual.mode !== 'play') s.visual.setMode('play');
        return;
      }
      celebrating = true;
      setDemo(false);
      world.setPodium(true);
      const ranked = new Set();
      order.forEach((i, r) => {
        const s = slots[i];
        if (!s || !s.visual) return;
        ranked.add(i);
        const spot = world.podiumSpot(r, new THREE.Vector3());
        s.visual.setMode('podium', { spot, rank: r });
        if (r === 0) fx.confetti(tmp.copy(spot).setY(spot.y + 1.2), 90);
      });
      for (const s of slots) if (s.visual && !ranked.has(s.i)) s.visual.setMode('hidden');
      world.cheer(1.5);
    },
    snapshot() { return sim.snapshot(); },
    update(dt) {
      if (disposed) return;
      dt = clamp(+dt || 0, 0, 0.1);
      if (paused) { updateCamera(0); return; }
      time += dt;
      // attract demo on the title screen
      setDemo(!active && camMode === 'title' && !celebrating);
      if (demo && sim.fence.filter((h) => h > 0).length < FENCE.panels / 2) { engine.resetRound(); setDemo(true); }

      let simScale = 1;
      if (hitStop > 0) { hitStop -= dt; simScale = 0.15; }
      const intents = slots.map((s) => {
        if (!s.cfg) return null;
        let it = null;
        try { it = s.control && s.control.read ? s.control.read(dt) : null; } catch (e) { it = null; }
        return it;
      });
      const events = sim.step(dt * simScale, intents);
      for (const ev of events) handle(ev, !demo);
      world.setFence(sim.fence, storm);

      // carts
      let speedSum = 0, n = 0;
      for (const s of slots) {
        if (!s.visual) continue;
        const c = sim.carts[s.i];
        s.visual.update(dt * (hitStop > 0 ? 0.3 : 1), s.cfg ? c : null, { tags: camMode === 'play' });
        if (s.visual.mode !== 'play' || !c.present) continue;
        const sp = Math.hypot(c.vx, c.vz);
        if (c.state !== 'fall' && c.state !== 'out') { speedSum += sp; n++; }
        if (c.state === 'dash') {
          s.streakT -= dt;
          if (s.streakT <= 0) { s.streakT = 0.03; fx.whoosh(tmp.set(c.x, 0, c.z), tmp2.set(c.vx / (sp || 1), 0, c.vz / (sp || 1)), colorOf(s.i)); }
        }
        if (c.state === 'stun' && sp > 3) {
          s.dustT -= dt;
          if (s.dustT <= 0) { s.dustT = 0.06; fx.dust(tmp.set(c.x, 0, c.z), 1, 0.6); }
        }
        if (c.state === 'out') {
          s.bubT -= dt;
          if (s.bubT <= 0) { s.bubT = 0.12; fx.bubbles(c.x, c.z); }
        }
      }
      audioCore.setMotor(demo || !n ? 0 : speedSum / n / 6);
      world.update(dt);
      updateCamera(dt);
      fx.update(dt, camera);
    },
    render() { if (!disposed) renderer.render(scene, camera); },
    resize() {
      const w = canvas.clientWidth || globalThis.innerWidth || 1280;
      const h = canvas.clientHeight || globalThis.innerHeight || 720;
      renderer.setPixelRatio(Math.min(2, globalThis.devicePixelRatio || 1));
      renderer.setSize(w, h, false);
      camera.aspect = w / Math.max(1, h);
      camera.fov = camera.aspect < 1 ? 52 : 40;
      camera.updateProjectionMatrix();
    },
    audio: {
      unlock: () => audioCore.unlock(),
      play: (name) => audioCore.play(name),
      setMuted: (on) => audioCore.setMuted(on),
      music: (on) => audioCore.music(on),
    },
    dispose() {
      disposed = true;
      listeners.clear();
      for (const s of slots) if (s.visual) s.visual.dispose();
      fx.dispose();
      world.dispose();
      audioCore.dispose();
      renderer.dispose();
    },
    // dev / debug access (not part of the contract)
    _debug: { sim, scene, camera, renderer, slots, world, fx, get demo() { return demo; } },
  };
  engine.resize();
  engine.update(0);
  return engine;
}
