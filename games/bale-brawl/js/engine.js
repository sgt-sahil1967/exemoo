// Bale Brawl - engine: glues combat (sim), ai, world, fighters, fx, audio and cameras behind the
// interface of PLAN.md 3.4. main.js drives it with update(dt) / render() every frame.
import * as THREE from 'three';
import { Combat } from './combat.js';
import { createAI } from './ai.js';
import { createWorld } from './world.js';
import { createFighter } from './fighter.js';
import { createFx } from './fx.js';
import { createAudio } from './audio.js';
import { PLAYERS, CPU_CAST, ARENA } from './constants.js';

const PI = Math.PI;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const damp = (a, b, rate, dt) => a + (b - a) * (1 - Math.exp(-rate * dt));

export async function createEngine({ canvas } = {}) {
  if (!canvas) throw new Error('createEngine: canvas required');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(2, globalThis.devicePixelRatio || 1));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const world = createWorld();
  const scene = world.scene;
  const camera = new THREE.PerspectiveCamera(48, 16 / 9, 0.1, 700);
  camera.position.set(12, 5, 12);
  const fx = createFx(scene);
  const audioCore = createAudio();
  const combat = new Combat();

  const listeners = new Map();
  function emit(type, payload) {
    const set = listeners.get(type);
    if (!set) return;
    for (const cb of [...set]) { try { cb(payload); } catch (e) { console.error('[bale-brawl] listener', type, e); } }
  }

  // ── fighters ──
  const slots = [0, 1].map((i) => ({
    i, cfg: { ...PLAYERS[i], control: null, cpu: null }, visual: null, control: null, ai: null,
    prevPhase: null, dripT: 0, intent: null,
  }));
  function buildVisual(slot) {
    if (slot.visual) slot.visual.dispose();
    slot.visual = createFighter({ animal: slot.cfg.animal, color: slot.cfg.color, name: slot.cfg.name });
    scene.add(slot.visual.root);
  }
  function setFighter(i, opts = {}) {
    const slot = slots[i];
    if (!slot) return;
    const prev = slot.cfg;
    const cpu = opts.cpu || null;
    const base = cpu ? CPU_CAST[cpu] || {} : PLAYERS[i];
    const cfg = {
      name: opts.name ?? base.name, color: opts.color ?? base.color, animal: opts.animal ?? base.animal,
      control: opts.control ?? null, cpu,
    };
    slot.cfg = cfg;
    if (!slot.visual || prev.animal !== cfg.animal || prev.color !== cfg.color) buildVisual(slot);
    if (cpu) {
      slot.ai = createAI({ level: cpu, index: i, combat, seed: (Math.random() * 1e6) | 0 });
      slot.control = slot.ai;
    } else {
      slot.ai = null;
      slot.control = cfg.control;
    }
  }
  slots.forEach(buildVisual);

  // ── state ──
  let active = false, paused = false, disposed = false;
  let camMode = 'title', ringCam = null;   // ringCam: { loser, t, splashT }
  let hitStop = 0, slowMo = 0, time = 0;
  let suddenOn = false;
  const camPos = new THREE.Vector3(12, 5, 12), camLook = new THREE.Vector3(0, 0.5, 0);
  let camSnap = true;

  // bale splashes from the shrinking arena
  world.on('baleSplash', (x, z) => { fx.smallSplash(x, z); audioCore.play('plop'); });

  const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();

  function handle(ev) {
    const { type, ...payload } = ev;
    const F = combat.fighters;
    switch (type) {
      case 'hit': {
        const V = slots[payload.victim].visual;
        const pw = payload.power;
        V.chestWorld(tmp);
        fx.impact(tmp, pw, slots[payload.attacker].cfg.color);
        fx.hayPuff(tmp2.set(F[payload.victim].x, 0.05, 0), 8 + Math.round(pw * 8), 0.8 + pw * 0.5);
        fx.shake(0.05 + pw * 0.1, 0.22);
        hitStop = 0.04 + pw * 0.05;
        audioCore.play('bonk', pw);
        world.cheer(0.4 + pw * 0.5);
        if (payload.edge > 0.75) audioCore.play('crowd', 0.6);
        break;
      }
      case 'block': {
        const B = slots[payload.blocker].visual;
        B.tipWorld(tmp);
        B.chestWorld(tmp2);
        tmp.lerp(tmp2, 0.45);
        fx.blockSpark(tmp);
        fx.shake(0.04, 0.15);
        hitStop = payload.perfect ? 0.08 : 0.05;
        audioCore.play('block');
        if (payload.perfect) world.cheer(0.5);
        break;
      }
      case 'clash': {
        slots[0].visual.tipWorld(tmp); slots[1].visual.tipWorld(tmp2);
        tmp.lerp(tmp2, 0.5);
        fx.blockSpark(tmp); fx.impact(tmp, 0.4, '#ffffff');
        fx.shake(0.06, 0.2);
        hitStop = 0.07;
        audioCore.play('clash');
        world.cheer(0.4);
        break;
      }
      case 'edge': audioCore.play('edge'); break;
      case 'ringout': {
        active = false;
        slowMo = 0.45;
        ringCam = { loser: payload.loser, t: 0, splashT: -1 };
        audioCore.play('crowd', 1.2);
        world.cheer(1);
        break;
      }
      case 'splash': {
        for (const f of F) {
          if (!f.out) continue;
          fx.splash(f.x, 0, 1);
          world.ripple(f.x, 0, 1.4);
          world.scatterDucks(f.x, 0);
        }
        fx.shake(0.12, 0.35);
        audioCore.play('splash');
        setTimeout(() => audioCore.play('quack'), 250);
        world.cheer(1.2);
        if (ringCam) ringCam.splashT = ringCam.t;
        break;
      }
      default: break;
    }
    emit(type, payload);
  }

  // ── cameras ──
  const camTarget = new THREE.Vector3(), lookTarget = new THREE.Vector3();
  function aspectBoost() {
    // portrait / narrow screens: step back so both fighters fit
    return clamp(1.6 / Math.max(0.5, camera.aspect), 1, 2.2);
  }
  function updateCamera(dt) {
    const F = combat.fighters;
    const V0 = slots[0].visual.root.position, V1 = slots[1].visual.root.position;
    const ab = aspectBoost();
    let rate = 4;
    let mode = camMode;
    if (ringCam) {
      ringCam.t += dt;
      // stay on the fall until the host moves on after the splash
      mode = 'ringout';
    }
    if (mode === 'title') {
      const a = time * 0.07 + 0.6;
      camTarget.set(Math.cos(a) * 13.5, 5.2, Math.sin(a) * 13.5);
      lookTarget.set(0, 0.2, 0);
      rate = 3;
    } else if (mode === 'duel1p') {
      const x0 = F[0].out ? V0.x : F[0].x, x1 = F[1].out ? V1.x : F[1].x;
      // Over P1's right shoulder but swung well out to the side (+z) and up, so the
      // line of sight to the rival clears P1's body even at clinch range (minGap). Framing
      // is anchored on the pair's midpoint + clamped gap and damped at a gentle rate, so
      // shoving back and forth does not jitter; the look point leans toward the rival so
      // the pond rim behind them stays in frame and ring-outs read.
      const gap = clamp(x1 - x0, 0.6, 6);
      const mid = (x0 + x1) / 2;
      const ax = mid - gap * 0.5 * 0.85; // ~P1, but softened toward the middle
      const back = (1.05 + gap * 0.22) * ab;
      camTarget.set(ax - back, 3.45 + (ab - 1) * 0.7, (4.3 + gap * 0.15) * ab);
      lookTarget.set(mid + gap * 0.3 + 0.45, 0.55, -0.4);
      rate = 3.6;
    } else if (mode === 'duel2p') {
      const x0 = F[0].x, x1 = F[1].x;
      const mid = (x0 + x1) / 2, span = Math.abs(x1 - x0);
      const dist = Math.max(5.3, span * 1.45 + 3.0) * ab;
      camTarget.set(mid, 2.05, dist);
      lookTarget.set(mid, 0.75, 0);
      rate = 4;
    } else if (mode === 'results') {
      const w = winnerIndex();
      if (w >= 0) {
        const R = slots[w].visual.root;
        const face = w === 0 ? 1 : -1;
        camTarget.set(R.position.x + face * 3.3 * ab, 1.35, 1.3 * face);
        lookTarget.set(R.position.x, 0.95, 0);
      } else {
        camTarget.set(0, 3.2, 8.5 * ab);
        lookTarget.set(0, 0.5, 0);
      }
      rate = 2.5;
    } else if (mode === 'ringout') {
      const L = ringCam.loser;
      let fx0, fy0;
      if (L >= 0) { fx0 = F[L].x; fy0 = Math.max(ARENA.waterY, F[L].y); }
      else { fx0 = 0; fy0 = -0.8; }
      const side = fx0 >= 0 ? 1 : -1;
      if (L >= 0) {
        camTarget.set(fx0 - side * 3.2, fy0 + 1.7, 5.4 * ab);
        lookTarget.set(fx0 + side * 0.4, fy0 + 0.2, 0);
      } else {
        camTarget.set(0, 2.6, 11 * ab);
        lookTarget.set(0, -0.8, 0);
      }
      rate = 3.2;
    }
    if (camSnap) { camPos.copy(camTarget); camLook.copy(lookTarget); camSnap = false; }
    camPos.x = damp(camPos.x, camTarget.x, rate, dt);
    camPos.y = damp(camPos.y, camTarget.y, rate, dt);
    camPos.z = damp(camPos.z, camTarget.z, rate, dt);
    camLook.x = damp(camLook.x, lookTarget.x, rate * 1.4, dt);
    camLook.y = damp(camLook.y, lookTarget.y, rate * 1.4, dt);
    camLook.z = damp(camLook.z, lookTarget.z, rate * 1.4, dt);
    camera.position.copy(camPos).add(fx.shakeOffset);
    camera.lookAt(camLook);
  }

  let celebrated = -2;
  function winnerIndex() {
    if (celebrated >= 0) return celebrated;
    const r = combat.result;
    return r ? r.winner : -1;
  }

  // ── public API ──
  const engine = {
    on(event, cb) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(cb);
      return () => listeners.get(event)?.delete(cb);
    },
    setFighter,
    resetRound() {
      combat.reset();
      active = false;
      ringCam = null;
      celebrated = -2;
      suddenOn = false;
      hitStop = 0; slowMo = 0;
      fx.clear();
      for (const s of slots) { s.visual.setMode('fight'); s.prevPhase = null; }
      if (camMode !== 'title') camSnap = true;
    },
    setActive(on) {
      active = !!on;
      combat.setActive(active);
      active = combat.active;
    },
    setPaused(on) { paused = !!on; audioCore.setPaused(paused); },
    setArenaScale(scale, seconds = 0) {
      combat.setArenaScale(scale, seconds);
      if (scale < 1) { suddenOn = true; audioCore.play('rumble'); }
    },
    setKnockScale(k) { combat.setKnockScale(k); },
    setCamera(mode) {
      if (!['title', 'duel1p', 'duel2p', 'results'].includes(mode)) return;
      const changed = mode !== camMode;
      camMode = mode;
      if (ringCam && (ringCam.splashT >= 0 ? ringCam.t - ringCam.splashT > 0.3 : false)) ringCam = null;
      if (changed && (mode === 'duel1p' || mode === 'duel2p') && !ringCam) camSnap = true;
    },
    celebrate(i) {
      celebrated = i;
      const F = combat.fighters;
      for (const s of slots) {
        const f = F[s.i];
        if (s.i === i && !f.out) {
          s.visual.setMode('dance');
          fx.confetti(tmp.set(f.x, 1.2, 0), 70);
        } else if (f.out) {
          s.visual.setMode('sulk', { spot: world.bankSpot(Math.sign(f.x) || (s.i === 0 ? -1 : 1)) });
        } else s.visual.setMode('fight');
      }
      if (i < 0 && !F.some((f) => f.out)) celebrated = -2;
    },
    snapshot() { return combat.snapshot(); },
    update(dt) {
      if (disposed) return;
      dt = clamp(+dt || 0, 0, 0.1);
      if (paused) { updateCamera(0); return; }
      time += dt;
      // hit-stop and ring-out slow motion
      let simScale = 1;
      if (hitStop > 0) { hitStop -= dt; simScale = 0.1; }
      else if (slowMo > 0) { slowMo -= dt; simScale = 0.5; }
      const simDt = dt * simScale;
      const intents = slots.map((s) => {
        let it = null;
        try { it = s.control && s.control.read ? s.control.read(dt) : null; } catch (e) { it = null; }
        if (it && !active) it = { ...it, guard: false, swing: null };
        s.intent = it;
        return it;
      });
      const events = combat.step(simDt, intents);
      for (const ev of events) handle(ev);
      if (combat.over) active = false;

      // fighters
      const F = combat.fighters;
      for (const s of slots) {
        const f = F[s.i];
        s.visual.update(dt * (hitStop > 0 ? 0.25 : 1), f, { active });
        const phase = f.swing ? f.swing.phase : null;
        if (phase === 'strike' && s.prevPhase !== 'strike') {
          audioCore.play('whoosh', f.swing.power);
          s.visual.tipWorld(tmp);
          fx.whoosh(tmp, tmp2.set(0, 0.6, 0), '#ffffff');
        }
        s.prevPhase = phase;
        if (s.visual.mode === 'sulk' || (f.out && f.splashed)) {
          s.dripT -= dt;
          if (s.dripT <= 0) { s.dripT = 0.07 + Math.random() * 0.08; s.visual.headWorld(tmp); fx.drip(tmp); }
        }
      }
      world.setArenaRadius(combat.arenaRadius, suddenOn);
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
      camera.fov = camera.aspect < 1 ? 58 : 48;
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
      for (const s of slots) s.visual.dispose();
      fx.dispose();
      world.dispose();
      audioCore.dispose();
      renderer.dispose();
    },
    // dev / debug access (not part of the contract)
    _debug: { combat, scene, camera, renderer, slots, world, fx },
  };
  engine.resize();
  engine.update(0);
  return engine;
}
