import * as THREE from 'three';
import { canvas, canvasTexture, glowTexture } from '../assets';
import { COURT } from '../constants';

function feltTexture(): THREE.Texture {
  const [c, g] = canvas(256, 128);
  g.fillStyle = '#d6f03a';
  g.fillRect(0, 0, 256, 128);
  for (let i = 0; i < 2500; i++) {
    g.fillStyle = `rgba(${Math.random() < 0.5 ? '255,255,200' : '120,140,20'},0.12)`;
    g.fillRect(Math.random() * 256, Math.random() * 128, 2, 2);
  }
  g.strokeStyle = '#f7f7ea';
  g.lineWidth = 5;
  g.beginPath();
  for (let x = 0; x <= 256; x += 2) {
    const y = 64 + Math.sin((x / 256) * Math.PI * 4) * 34;
    if (x === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.stroke();
  return canvasTexture(c);
}

/** Ball mesh, contact shadow and a camera-facing trail ribbon. */
export class BallView {
  group = new THREE.Group();
  mesh: THREE.Mesh;
  private shadow: THREE.Mesh;
  private trail: THREE.Mesh;
  private trailPts: THREE.Vector3[] = [];
  private trailGeo: THREE.BufferGeometry;
  private trailMat: THREE.MeshBasicMaterial;
  private readonly N = 26;

  constructor() {
    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.042, 24, 16),
      new THREE.MeshStandardMaterial({ map: feltTexture(), roughness: 0.85, emissive: '#3a4a00', emissiveIntensity: 0.6 }),
    );
    this.group.add(this.mesh);

    const [c, g] = canvas(64, 64);
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(0,0,0,0.75)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    this.shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(0.22, 0.22),
      new THREE.MeshBasicMaterial({ map: canvasTexture(c), transparent: true, depthWrite: false }),
    );
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.renderOrder = 2;
    this.group.add(this.shadow);

    this.trailGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(this.N * 2 * 3);
    const alpha = new Float32Array(this.N * 2 * 4);
    const idx: number[] = [];
    for (let i = 0; i < this.N - 1; i++) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    this.trailGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.trailGeo.setAttribute('color', new THREE.BufferAttribute(alpha, 4));
    this.trailGeo.setIndex(idx);
    this.trailMat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    this.trail = new THREE.Mesh(this.trailGeo, this.trailMat);
    this.trail.frustumCulled = false;
    this.group.add(this.trail);
  }

  resetTrail() {
    this.trailPts.length = 0;
  }

  update(p: THREE.Vector3, v: THREE.Vector3, spin: number, dt: number, cam: THREE.Camera, visible: boolean) {
    this.group.visible = visible;
    this.mesh.position.copy(p);
    this.mesh.rotation.x -= spin * dt * 30 + v.length() * dt * 2;
    this.shadow.position.set(p.x, 0.004, p.z);
    const h = Math.max(0, p.y);
    this.shadow.scale.setScalar(1 + h * 0.5);
    (this.shadow.material as THREE.MeshBasicMaterial).opacity = Math.max(0.15, 0.85 - h * 0.18);

    this.trailPts.unshift(p.clone());
    if (this.trailPts.length > this.N) this.trailPts.pop();
    const speed = v.length();
    const intensity = THREE.MathUtils.clamp((speed - 8) / 22, 0, 1);
    const pos = this.trailGeo.attributes.position as THREE.BufferAttribute;
    const col = this.trailGeo.attributes.color as THREE.BufferAttribute;
    const camPos = cam.position;
    const side = new THREE.Vector3();
    const dir = new THREE.Vector3();
    const toCam = new THREE.Vector3();
    for (let i = 0; i < this.N; i++) {
      const pt = this.trailPts[Math.min(i, this.trailPts.length - 1)] ?? p;
      const nx = this.trailPts[Math.min(i + 1, this.trailPts.length - 1)] ?? pt;
      dir.subVectors(pt, nx);
      if (dir.lengthSq() < 1e-8) dir.set(0, 0, 1);
      toCam.subVectors(camPos, pt);
      side.crossVectors(dir, toCam).normalize();
      const f = 1 - i / (this.N - 1);
      const w = 0.04 * f + 0.004;
      pos.setXYZ(i * 2, pt.x + side.x * w, pt.y + side.y * w, pt.z + side.z * w);
      pos.setXYZ(i * 2 + 1, pt.x - side.x * w, pt.y - side.y * w, pt.z - side.z * w);
      const a = f * f * intensity * (i < this.trailPts.length ? 1 : 0);
      col.setXYZW(i * 2, 0.85 * a, 1.0 * a, 0.35 * a, a);
      col.setXYZW(i * 2 + 1, 0.85 * a, 1.0 * a, 0.35 * a, a);
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;
  }
}

interface Particle {
  p: THREE.Vector3;
  v: THREE.Vector3;
  life: number;
  max: number;
}

/** Sparks, flashes, dust puffs and ball marks. */
export class Effects {
  group = new THREE.Group();
  private sparks: Particle[] = [];
  private sparkGeo = new THREE.BufferGeometry();
  private sparkMat: THREE.PointsMaterial;
  private readonly MAX = 400;
  private flashes: { s: THREE.Sprite; life: number; max: number; scale: number }[] = [];
  private marks: { m: THREE.Mesh; life: number }[] = [];
  private glow = glowTexture(128);
  private markTex: THREE.Texture;
  reticle: THREE.Group;
  targetBand: THREE.Mesh;

  constructor() {
    this.sparkGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.MAX * 3), 3));
    this.sparkGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(this.MAX * 3), 3));
    this.sparkMat = new THREE.PointsMaterial({
      size: 0.09,
      map: this.glow,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    const pts = new THREE.Points(this.sparkGeo, this.sparkMat);
    pts.frustumCulled = false;
    this.group.add(pts);

    const [c, g] = canvas(64, 64);
    g.fillStyle = 'rgba(0,0,0,0)';
    g.fillRect(0, 0, 64, 64);
    const grad = g.createRadialGradient(32, 32, 4, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255,255,255,0.0)');
    grad.addColorStop(0.6, 'rgba(255,255,255,0.55)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.beginPath();
    g.ellipse(32, 32, 30, 30, 0, 0, Math.PI * 2);
    g.fill();
    this.markTex = canvasTexture(c);

    // Aim reticle on the far court.
    this.reticle = new THREE.Group();
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.42, 0.5, 48),
      new THREE.MeshBasicMaterial({ color: new THREE.Color('#c8ff2e').multiplyScalar(1.4), transparent: true, opacity: 0.8, depthWrite: false, toneMapped: false }),
    );
    const dot = new THREE.Mesh(
      new THREE.CircleGeometry(0.1, 24),
      new THREE.MeshBasicMaterial({ color: '#c8ff2e', transparent: true, opacity: 0.85, depthWrite: false, toneMapped: false }),
    );
    for (const m of [ring, dot]) {
      m.rotation.x = -Math.PI / 2;
      this.reticle.add(m);
    }
    this.reticle.position.y = 0.01;
    this.reticle.visible = false;
    this.group.add(this.reticle);

    // Deep-target band for the daily goal.
    this.targetBand = new THREE.Mesh(
      new THREE.PlaneGeometry(COURT.singlesHalfW * 2, COURT.halfLen - COURT.serviceLine),
      new THREE.MeshBasicMaterial({ color: '#c8ff2e', transparent: true, opacity: 0.18, depthWrite: false, toneMapped: false }),
    );
    this.targetBand.rotation.x = -Math.PI / 2;
    this.targetBand.position.set(0, 0.006, -(COURT.serviceLine + COURT.halfLen) / 2);
    this.targetBand.visible = false;
    this.group.add(this.targetBand);
  }

  burst(at: THREE.Vector3, n: number, color: THREE.Color, speed: number, up = 1) {
    for (let i = 0; i < n; i++) {
      if (this.sparks.length >= this.MAX) this.sparks.shift();
      const v = new THREE.Vector3(Math.random() - 0.5, Math.random() * up, Math.random() - 0.5).normalize().multiplyScalar(speed * (0.4 + Math.random()));
      const max = 0.25 + Math.random() * 0.35;
      this.sparks.push({ p: at.clone(), v, life: max, max });
    }
    this.sparkColor = color;
  }
  private sparkColor = new THREE.Color(1, 1, 1);

  flash(at: THREE.Vector3, color: string, scale: number, life = 0.25) {
    const s = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: this.glow, color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
    );
    s.position.copy(at);
    this.group.add(s);
    this.flashes.push({ s, life, max: life, scale });
  }

  mark(at: THREE.Vector3, out: boolean) {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(0.16, 0.26),
      new THREE.MeshBasicMaterial({
        map: this.markTex,
        color: out ? '#ff3b3b' : '#e8f0ff',
        transparent: true,
        depthWrite: false,
        opacity: out ? 1 : 0.5,
        toneMapped: !out,
      }),
    );
    m.rotation.x = -Math.PI / 2;
    m.position.set(at.x, 0.005, at.z);
    if (out) m.scale.setScalar(2.2);
    this.group.add(m);
    this.marks.push({ m, life: out ? 3 : 2.5 });
  }

  update(dt: number, t: number) {
    const pos = this.sparkGeo.attributes.position as THREE.BufferAttribute;
    const col = this.sparkGeo.attributes.color as THREE.BufferAttribute;
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.life -= dt;
      if (s.life <= 0) {
        this.sparks.splice(i, 1);
        continue;
      }
      s.v.y -= 6 * dt;
      s.v.multiplyScalar(1 - 2.5 * dt);
      s.p.addScaledVector(s.v, dt);
    }
    for (let i = 0; i < this.MAX; i++) {
      const s = this.sparks[i];
      if (s) {
        const f = s.life / s.max;
        pos.setXYZ(i, s.p.x, s.p.y, s.p.z);
        col.setXYZ(i, this.sparkColor.r * f * 2, this.sparkColor.g * f * 2, this.sparkColor.b * f * 2);
      } else {
        pos.setXYZ(i, 0, -100, 0);
      }
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;
    this.sparkGeo.setDrawRange(0, this.MAX);

    for (let i = this.flashes.length - 1; i >= 0; i--) {
      const f = this.flashes[i];
      f.life -= dt;
      const k = Math.max(0, f.life / f.max);
      f.s.scale.setScalar(f.scale * (1.6 - k * 0.6));
      f.s.material.opacity = k;
      if (f.life <= 0) {
        this.group.remove(f.s);
        f.s.material.dispose();
        this.flashes.splice(i, 1);
      }
    }
    for (let i = this.marks.length - 1; i >= 0; i--) {
      const mk = this.marks[i];
      mk.life -= dt;
      const mat = mk.m.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.min(mat.opacity, Math.max(0, mk.life / 1.2));
      if (mk.life <= 0) {
        this.group.remove(mk.m);
        mk.m.geometry.dispose();
        mat.dispose();
        this.marks.splice(i, 1);
      }
    }
    const pulse = 1 + Math.sin(t * 6) * 0.08;
    this.reticle.scale.setScalar(pulse);
    (this.targetBand.material as THREE.MeshBasicMaterial).opacity = 0.14 + Math.sin(t * 3) * 0.06;
  }
}
