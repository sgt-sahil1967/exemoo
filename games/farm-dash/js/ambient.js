// Ambient life: birds, clouds, animated billboards, signals, steam vents and flickering lamps.
// Everything is procedural. No lights are created (avoids shader recompiles).
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const WRAP = 200;          // scrolling props loop over this distance
const DESPAWN_Z = 25;
const rand = (a, b) => a + Math.random() * (b - a);
const TAU = Math.PI * 2;

function canvasTex(w, h, draw, repeat = false) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  if (draw) draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return { tex: t, g, w, h };
}

// LED marquee strip: text on a dotted LED matrix, scrolled via texture.offset.
function marqueeTex(text, color, bg) {
  return canvasTex(1024, 128, (g, w, h) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.font = '900 86px Impact, "Arial Black", sans-serif';
    g.textBaseline = 'middle';
    g.shadowColor = color; g.shadowBlur = 18;
    g.fillStyle = color;
    const tw = g.measureText(text).width;
    for (let x = 20; x < w; x += tw + 40) g.fillText(text, x, h / 2 + 4);
    g.shadowBlur = 0;
    g.fillStyle = 'rgba(0,0,0,0.55)'; // LED grid
    for (let y = 0; y < h; y += 8) g.fillRect(0, y, w, 3);
    for (let x = 0; x < w; x += 8) g.fillRect(x, 0, 3, h);
  }, true);
}

function drawNeon(g, w, h, frame) {
  g.fillStyle = '#140a24'; g.fillRect(0, 0, w, h);
  const on = frame % 12 < 9 || frame % 2 === 0; // blink burst every 1.2s
  for (let i = 0; i < 28; i++) { // chasing border bulbs
    const t = i / 28, lit = (i + frame) % 4 === 0;
    const x = t < 0.5 ? 10 + t * 2 * (w - 20) : w - 10 - (t - 0.5) * 2 * (w - 20);
    const y = t < 0.5 ? 10 : h - 10;
    g.fillStyle = lit ? '#ffe45c' : '#4a3a20';
    g.beginPath(); g.arc(x, y, 5, 0, TAU); g.fill();
  }
  g.font = '900 64px Impact, "Arial Black", sans-serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineWidth = 6;
  g.shadowBlur = on ? 26 : 0; g.shadowColor = '#ff3b8d';
  g.strokeStyle = on ? '#ff3b8d' : '#4a1730';
  g.strokeText('RUN FASTER!', w / 2, h / 2);
  g.fillStyle = on ? '#ffe0f0' : '#3a1a2a';
  g.fillText('RUN FASTER!', w / 2, h / 2);
  g.shadowBlur = 0; g.textAlign = 'left';
}

function drawBurger(g, w, h, frame) {
  const hue = (frame * 4) % 360;
  const grad = g.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, `hsl(${hue},90%,55%)`);
  grad.addColorStop(1, `hsl(${(hue + 70) % 360},90%,50%)`);
  g.fillStyle = grad; g.fillRect(0, 0, w, h);
  const bob = Math.sin(frame * 0.6) * 6, cx = 70, cy = h / 2 + bob;
  g.fillStyle = '#e8a33d'; g.beginPath(); g.arc(cx, cy - 6, 44, Math.PI, 0); g.fill();
  g.fillStyle = '#4fc23a'; g.fillRect(cx - 48, cy - 6, 96, 10);
  g.fillStyle = '#6b3a1e'; g.fillRect(cx - 46, cy + 4, 92, 16);
  g.fillStyle = '#e8a33d'; g.fillRect(cx - 44, cy + 20, 88, 14);
  g.font = '900 54px Impact, "Arial Black", sans-serif';
  g.textBaseline = 'middle';
  g.lineWidth = 8; g.strokeStyle = '#111'; g.fillStyle = '#fff';
  const s = 1 + 0.06 * Math.sin(frame * 0.9);
  g.save(); g.translate(140, h / 2 - 16); g.scale(s, s);
  g.strokeText('MEGA BURGER', 0, 0); g.fillText('MEGA BURGER', 0, 0); g.restore();
  g.font = 'bold 26px "Arial Black", sans-serif';
  g.fillStyle = frame % 6 < 3 ? '#ffe45c' : '#fff';
  g.fillText('NOW 2X BIGGER', 150, h / 2 + 38);
}

export class Ambient {
  constructor(scene) {
    this.root = new THREE.Group();
    scene.add(this.root);
    this.scrollers = []; // objects that scroll with the world
    this.buildBirds();
    this.buildClouds();
    this.buildBillboards();
    this.buildSignals();
    this.buildVents();
    this.buildLamps();
  }

  addScroller(obj, z) {
    obj.position.z = z;
    this.root.add(obj);
    this.scrollers.push(obj);
  }

  // ---------- birds ----------
  buildBirds() {
    const mat = new THREE.MeshStandardMaterial({ color: '#2a2833', roughness: 0.9 });
    const bodyGeo = new THREE.ConeGeometry(0.16, 0.9, 5).rotateX(Math.PI / 2);
    const wingL = new THREE.BoxGeometry(1.0, 0.04, 0.38).translate(-0.5, 0, 0);
    const wingR = new THREE.BoxGeometry(1.0, 0.04, 0.38).translate(0.5, 0, 0);
    this.flocks = [];
    for (let f = 0; f < 3; f++) {
      const group = new THREE.Group();
      const birds = [];
      const n = 5 + Math.floor(Math.random() * 4);
      for (let i = 0; i < n; i++) {
        const b = new THREE.Group();
        const l = new THREE.Mesh(wingL, mat), r = new THREE.Mesh(wingR, mat);
        b.add(new THREE.Mesh(bodyGeo, mat), l, r);
        const row = Math.ceil(i / 2), side = i % 2 ? 1 : -1;
        b.userData = { l, r, ox: side * row * 1.6 + rand(-0.4, 0.4), oy: rand(-0.6, 0.6), oz: -row * 1.5 + rand(-0.4, 0.4), ph: rand(0, TAU), fr: rand(9, 12) };
        b.scale.setScalar(1.4);
        group.add(b);
        birds.push(b);
      }
      this.root.add(group);
      const flock = { group, birds, heading: 0, turn: 0, v: 0, y: 0 };
      this.respawnFlock(flock, true);
      this.flocks.push(flock);
    }
  }

  respawnFlock(fl, anywhere) {
    const dir = Math.random() < 0.5 ? 1 : -1;
    fl.group.position.set(anywhere ? rand(-60, 60) : -dir * 95, 0, rand(-140, -50));
    fl.y = rand(12, 25);
    fl.heading = dir * Math.PI / 2 + rand(-0.5, 0.5); // atan2(dx, dz)
    fl.turn = rand(-0.08, 0.08);
    fl.v = rand(7, 11);
  }

  // ---------- clouds ----------
  buildClouds() {
    const geo = new THREE.IcosahedronGeometry(1, 2);
    const mat = new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#fff4e8', emissiveIntensity: 0.45, roughness: 1, fog: false });
    this.clouds = [];
    for (let c = 0; c < 10; c++) {
      const cloud = new THREE.Group();
      const puffs = 4 + Math.floor(Math.random() * 3);
      for (let i = 0; i < puffs; i++) {
        const m = new THREE.Mesh(geo, mat);
        const s = rand(0.6, 1.1) * (i === 0 ? 1.3 : 1);
        m.scale.set(s, s * 0.75, s);
        m.position.set((i - puffs / 2) * 0.9 + rand(-0.3, 0.3), rand(0, 0.4) + (i === 0 ? 0.3 : 0), rand(-0.4, 0.4));
        cloud.add(m);
      }
      cloud.scale.setScalar(rand(6, 12));
      cloud.position.set(rand(-120, 120), rand(30, 60), rand(-200, -120));
      cloud.userData.v = rand(1.5, 4);
      this.root.add(cloud);
      this.clouds.push(cloud);
    }
  }

  // ---------- billboards ----------
  buildBillboards() {
    const frameMat = new THREE.MeshStandardMaterial({ color: '#2d3340', metalness: 0.5, roughness: 0.5 });
    const legMat = new THREE.MeshStandardMaterial({ color: '#8a8f99', metalness: 0.6, roughness: 0.4 });
    const frameGeo = new THREE.BoxGeometry(4.8, 2.5, 0.2);
    const screenGeo = new THREE.PlaneGeometry(4.4, 2.1);
    const legGeo = new THREE.BoxGeometry(0.18, 6.3, 0.18);
    const trimGeo = new THREE.BoxGeometry(4.9, 0.12, 0.35);
    const mk = (draw) => { const c = canvasTex(512, 244); draw(c.g, c.w, c.h, 0); c.draw = draw; c.frame = -1; return c; };
    const zappy = marqueeTex('ZAPPY COLA  *  ICE COLD  *', '#ff5a1f', '#160a04');
    const pixel = marqueeTex('PIXEL PHONE  *  99% MORE PIXELS  *', '#29e0ff', '#04101a');
    zappy.tex.repeat.set(0.45, 1); pixel.tex.repeat.set(0.45, 1);
    const screens = [
      { c: zappy, scroll: 0.07 },
      { c: mk(drawNeon) },
      { c: pixel, scroll: 0.09 },
      { c: mk(drawBurger) },
    ];
    this.screens = screens;
    for (let i = 0; i < 4; i++) {
      const side = i % 2 ? 1 : -1;
      const bb = new THREE.Group();
      const frame = new THREE.Mesh(frameGeo, frameMat); frame.position.y = 7.5; bb.add(frame);
      const trim = new THREE.Mesh(trimGeo, frameMat); trim.position.set(0, 6.2, 0.05); bb.add(trim);
      const screen = new THREE.Mesh(screenGeo, new THREE.MeshBasicMaterial({ map: screens[i].c.tex }));
      screen.position.set(0, 7.5, 0.11); bb.add(screen);
      for (const lx of [-1.6, 1.6]) { const leg = new THREE.Mesh(legGeo, legMat); leg.position.set(lx, 3.15, -0.1); bb.add(leg); }
      bb.position.x = side * 9.8;
      bb.rotation.y = -side * 1.1;
      this.addScroller(bb, -35 - i * 50);
    }
  }

  // ---------- railway signals ----------
  buildSignals() {
    const post = new THREE.MeshStandardMaterial({ color: '#3a3f47', roughness: 0.6, metalness: 0.4 });
    const poleGeo = new THREE.CylinderGeometry(0.07, 0.09, 4.2, 8);
    const headGeo = new THREE.BoxGeometry(0.42, 1.25, 0.3);
    const lampGeo = new THREE.CircleGeometry(0.13, 12);
    const cols = ['#ff2b2b', '#ffc21a', '#2bff6a'];
    this.sigOn = cols.map((c) => new THREE.MeshBasicMaterial({ color: c }));
    this.sigOff = cols.map((c) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(0.18) }));
    this.signals = [];
    for (let i = 0; i < 4; i++) {
      const side = i % 2 ? 1 : -1;
      const s = new THREE.Group();
      const pole = new THREE.Mesh(poleGeo, post); pole.position.y = 2.1; s.add(pole);
      const head = new THREE.Mesh(headGeo, post); head.position.y = 4.4; s.add(head);
      const lamps = [];
      for (let k = 0; k < 3; k++) {
        const l = new THREE.Mesh(lampGeo, this.sigOff[k]);
        l.position.set(0, 4.8 - k * 0.38, 0.16);
        s.add(l); lamps.push(l);
      }
      s.position.x = side * 6.0;
      s.userData = { lamps, offset: rand(0, 6), state: -1 };
      this.addScroller(s, -30 - i * 50);
      this.signals.push(s);
    }
  }

  // ---------- steam vents ----------
  buildVents() {
    const grateTex = canvasTex(64, 64, (g, w, h) => {
      g.fillStyle = '#2a2a2e'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#111'; for (let x = 6; x < w; x += 10) g.fillRect(x, 4, 5, h - 8);
    }).tex;
    const grateGeo = new THREE.BoxGeometry(0.9, 0.08, 0.9);
    const grateMat = new THREE.MeshStandardMaterial({ map: grateTex, roughness: 0.8, metalness: 0.4 });
    const puffGeo = new THREE.IcosahedronGeometry(0.5, 1);
    this.vents = [];
    for (let i = 0; i < 4; i++) {
      const side = i % 2 ? -1 : 1;
      const v = new THREE.Group();
      v.add(new THREE.Mesh(grateGeo, grateMat));
      const puffs = [];
      for (let k = 0; k < 6; k++) {
        const m = new THREE.Mesh(puffGeo, new THREE.MeshStandardMaterial({ color: '#f4f1ee', emissive: '#ffffff', emissiveIntensity: 0.25, transparent: true, depthWrite: false, opacity: 0 }));
        m.userData = { off: k / 6, jx: rand(-1, 1), jz: rand(-1, 1) };
        v.add(m); puffs.push(m);
      }
      v.position.set(side * 5.6, 0.04, 0);
      v.userData = { puffs, rate: rand(0.45, 0.7) };
      this.addScroller(v, -47 - i * 50);
      this.vents.push(v);
    }
  }

  // ---------- flickering lamps ----------
  buildLamps() {
    const postMat = new THREE.MeshStandardMaterial({ color: '#d8d8d8', metalness: 0.5, roughness: 0.4 });
    const poleGeo = new THREE.CylinderGeometry(0.07, 0.09, 5.5, 8);
    const armGeo = new THREE.BoxGeometry(1.1, 0.08, 0.08);
    const bulbGeo = new THREE.BoxGeometry(0.4, 0.12, 0.25);
    this.bulbOn = new THREE.MeshBasicMaterial({ color: '#fff3c4' });
    this.bulbOff = new THREE.MeshBasicMaterial({ color: '#6b6250' });
    this.lamps = [];
    // existing lamps sit at z = -4 (mod 20); ours sit at -14 (mod 20), alternating sides every 20
    for (let k = 0; k < 10; k++) {
      const side = k % 2 ? 1 : -1;
      const g = new THREE.Group();
      const pole = new THREE.Mesh(poleGeo, postMat); pole.position.set(side * 6.5, 2.75, 0); g.add(pole);
      const arm = new THREE.Mesh(armGeo, postMat); arm.position.set(side * 6.0, 5.45, 0); g.add(arm);
      const bulb = new THREE.Mesh(bulbGeo, this.bulbOn); bulb.position.set(side * 5.55, 5.35, 0); g.add(bulb);
      g.userData = { bulb, flaky: k % 3 === 0, timer: rand(1, 5), burst: 0 };
      this.addScroller(g, -14 - k * 20);
      this.lamps.push(g);
    }
  }

  // ---------- per-frame ----------
  update(dt, speed, time) {
    const d = speed * dt;
    for (const o of this.scrollers) {
      o.position.z += d;
      if (o.position.z > DESPAWN_Z) o.position.z -= WRAP;
    }

    // birds: drift with a slow curve, slight parallax from the scroll
    for (const fl of this.flocks) {
      fl.heading += fl.turn * dt;
      const p = fl.group.position;
      p.x += Math.sin(fl.heading) * fl.v * dt;
      p.z += Math.cos(fl.heading) * fl.v * dt + d * 0.15;
      p.y = fl.y + Math.sin(time * 0.5 + fl.v) * 1.2;
      fl.group.rotation.y = fl.heading;
      for (const b of fl.birds) {
        const u = b.userData, a = Math.sin(time * u.fr + u.ph);
        u.l.rotation.z = a * 0.7;
        u.r.rotation.z = -a * 0.7;
        b.position.set(u.ox, u.oy + a * 0.12 + Math.sin(time * 0.9 + u.ph) * 0.3, u.oz);
      }
      if (Math.abs(p.x) > 110 || p.z > 10 || p.z < -220) this.respawnFlock(fl, false);
    }

    for (const c of this.clouds) {
      c.position.x += c.userData.v * dt;
      if (c.position.x > 130) c.position.x -= 260;
    }

    // billboards: marquees scroll every frame, canvases redraw at ~10 fps
    const frame = Math.floor(time * 10);
    for (const s of this.screens) {
      if (s.scroll) s.c.tex.offset.x = (s.c.tex.offset.x + s.scroll * dt) % 1;
      else if (s.c.frame !== frame) {
        s.c.frame = frame;
        s.c.draw(s.c.g, s.c.w, s.c.h, frame);
        s.c.tex.needsUpdate = true;
      }
    }

    // signals: red -> green -> yellow, about 2.2s each
    for (const s of this.signals) {
      const u = s.userData;
      const state = [0, 2, 1][Math.floor((time + u.offset) / 2.2) % 3];
      if (state !== u.state) {
        u.state = state;
        for (let k = 0; k < 3; k++) u.lamps[k].material = k === state ? this.sigOn[k] : this.sigOff[k];
      }
    }

    // steam: each puff loops through rise / expand / fade (driven by time, so dt = 0 is safe)
    for (const v of this.vents) {
      const rate = v.userData.rate;
      for (const m of v.userData.puffs) {
        const u = m.userData;
        const t = (time * rate + u.off) % 1;
        m.position.set(u.jx * t * 0.4 + Math.sin(time * 2 + u.off * 9) * 0.08 * t, 0.15 + t * 2.6, u.jz * t * 0.3);
        m.scale.setScalar(0.35 + t * 1.3);
        m.material.opacity = 0.6 * Math.sin(Math.min(1, t * 4) * Math.PI / 2) * (1 - t);
      }
    }

    // lamps: flaky ones occasionally sputter
    for (const l of this.lamps) {
      const u = l.userData;
      if (!u.flaky) continue;
      u.timer -= dt;
      if (u.timer <= 0) { u.burst = rand(0.3, 0.9); u.timer = rand(2, 6); }
      let on = true;
      if (u.burst > 0) { u.burst -= dt; on = Math.random() < 0.45; }
      u.bulb.material = on ? this.bulbOn : this.bulbOff;
    }
  }
}
