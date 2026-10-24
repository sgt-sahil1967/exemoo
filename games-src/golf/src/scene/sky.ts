/** Sky dome, distant hills/mountains backdrop, drifting low-poly clouds and occasional birds. */
import {
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { fbm, mulberry32, smoothstep } from './util';

export const SKY = {
  horizon: '#cdeeff',
  mid: '#7cc8ff',
  zenith: '#2a86ea',
};

export function createSkyDome() {
  const geo = new SphereGeometry(2400, 32, 16);
  const mat = new ShaderMaterial({
    side: BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      uHorizon: { value: new Color(SKY.horizon) },
      uMid: { value: new Color(SKY.mid) },
      uZenith: { value: new Color(SKY.zenith) },
      uSun: { value: new Vector3(0.4, 0.6, 0.3).normalize() },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = p.xyww;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uHorizon; uniform vec3 uMid; uniform vec3 uZenith; uniform vec3 uSun;
      varying vec3 vDir;
      void main() {
        float y = vDir.y;
        vec3 c = mix(uHorizon, uMid, smoothstep(-0.02, 0.18, y));
        c = mix(c, uZenith, smoothstep(0.15, 0.75, y));
        float s = max(dot(normalize(vDir), uSun), 0.0);
        c += vec3(1.0, 0.95, 0.8) * (pow(s, 600.0) * 2.0 + pow(s, 12.0) * 0.18);
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const mesh = new Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = -10;
  mesh.name = 'sky';
  return {
    mesh,
    setSun(d: Vector3) {
      (mat.uniforms.uSun.value as Vector3).copy(d).normalize();
    },
  };
}

/** Rings of rolling hills + bluish mountains around the hole so the world never ends. */
export function buildBackdrop(
  cx: number,
  cz: number,
  innerR: number,
  heightAt: (x: number, z: number) => number,
  baseY: number,
) {
  const group = new Group();
  group.name = 'backdrop';
  const geos: BufferGeometry[] = [];
  const mats: MeshLambertMaterial[] = [];

  const ring = (r0: number, r1: number, amp: number, freq: number, colIn: string, colOut: string, seed: number, attach: boolean) => {
    const segA = 160;
    const segR = 10;
    const pos = new Float32Array((segA + 1) * (segR + 1) * 3);
    const col = new Float32Array((segA + 1) * (segR + 1) * 3);
    const cIn = new Color(colIn);
    const cOut = new Color(colOut);
    const tmp = new Color();
    for (let i = 0; i <= segA; i++) {
      const a = (i / segA) * Math.PI * 2;
      const dx = Math.cos(a);
      const dz = Math.sin(a);
      const edgeH = attach ? heightAt(cx + dx * r0, cz + dz * r0) - 4 : baseY - 6;
      for (let j = 0; j <= segR; j++) {
        const t = j / segR;
        const r = r0 + (r1 - r0) * t;
        const x = cx + dx * r;
        const z = cz + dz * r;
        const n = fbm(Math.cos(a) * freq + seed, Math.sin(a) * freq + seed * 2 + t * 1.3);
        const bump = Math.sin(Math.PI * Math.min(1, t * 1.15)) ** 0.8;
        const h = edgeH + (amp * (0.35 + n)) * bump * smoothstep(0, 0.25, t) - (t > 0.9 ? (t - 0.9) * 200 : 0);
        const k = (i * (segR + 1) + j) * 3;
        pos[k] = x;
        pos[k + 1] = h;
        pos[k + 2] = z;
        tmp.copy(cIn).lerp(cOut, Math.min(1, t * 1.4 + n * 0.25));
        col[k] = tmp.r;
        col[k + 1] = tmp.g;
        col[k + 2] = tmp.b;
      }
    }
    const idx: number[] = [];
    for (let i = 0; i < segA; i++) {
      for (let j = 0; j < segR; j++) {
        const a = i * (segR + 1) + j;
        const b = a + segR + 1;
        idx.push(a, a + 1, b, b, a + 1, b + 1);
      }
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(pos, 3));
    g.setAttribute('color', new BufferAttribute(col, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    geos.push(g);
    const m = new MeshLambertMaterial({ vertexColors: true, side: DoubleSide });
    mats.push(m);
    const mesh = new Mesh(g, m);
    mesh.receiveShadow = false;
    group.add(mesh);
  };
  ring(innerR, innerR + 300, 16, 2.6, '#4c9a36', '#69ad55', 3, true);
  ring(innerR + 280, innerR + 1100, 200, 1.9, '#79a98f', '#9fc6dc', 11, false);

  // flat ground far below, in case anything peeks through
  const dg = new BufferGeometry();
  const R = 3500;
  dg.setAttribute('position', new BufferAttribute(new Float32Array([-R, 0, -R, R, 0, -R, -R, 0, R, R, 0, R]), 3));
  dg.setIndex([0, 2, 1, 1, 2, 3]);
  const disc = new Mesh(dg, new MeshBasicMaterial({ color: '#5aa845' }));
  disc.position.set(cx, baseY - 8, cz);
  geos.push(dg);
  group.add(disc);
  return {
    group,
    dispose() {
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
      (disc.material as MeshBasicMaterial).dispose();
    },
  };
}

/** Fluffy low-poly clouds drifting with the wind. */
export function createClouds() {
  const rnd = mulberry32(42);
  const group = new Group();
  group.name = 'clouds';
  const mat = new MeshLambertMaterial({ color: '#ffffff', emissive: new Color('#b9cfe6'), emissiveIntensity: 0.55, fog: false });
  const shapes: BufferGeometry[] = [];
  for (let s = 0; s < 5; s++) {
    const parts: BufferGeometry[] = [];
    const n = 5 + Math.floor(rnd() * 4);
    for (let i = 0; i < n; i++) {
      const r = 10 + rnd() * 9 * (1 - Math.abs(i - n / 2) / n);
      const g = new IcosahedronGeometry(r, 1);
      g.scale(1, 0.72, 1);
      g.translate((i - n / 2) * 13 + rnd() * 6, rnd() * 5 + r * 0.2, (rnd() - 0.5) * 14);
      parts.push(g);
    }
    parts.forEach((p) => p.deleteAttribute('uv'));
    const merged = mergeGeometries(parts)!;
    parts.forEach((p) => p.dispose());
    shapes.push(merged);
  }
  const clouds: { mesh: Mesh; ang: number; rad: number }[] = [];
  for (let i = 0; i < 18; i++) {
    const mesh = new Mesh(shapes[i % shapes.length], mat);
    const s = 0.8 + rnd() * 0.9;
    mesh.scale.set(s, s * (0.8 + rnd() * 0.3), s);
    mesh.rotation.y = rnd() * Math.PI * 2;
    const ang = rnd() * Math.PI * 2;
    const rad = 380 + rnd() * 700;
    mesh.position.set(Math.cos(ang) * rad, 130 + rnd() * 140, Math.sin(ang) * rad);
    group.add(mesh);
    clouds.push({ mesh, ang, rad });
  }
  const vel = new Vector3(1.5, 0, 0.5);
  return {
    group,
    setWind(x: number, z: number) {
      vel.set(x * 1.4 + 0.6, 0, z * 1.4 + 0.3);
    },
    update(dt: number, center: Vector3) {
      for (const c of clouds) {
        c.mesh.position.x += vel.x * dt;
        c.mesh.position.z += vel.z * dt;
        const dx = c.mesh.position.x - center.x;
        const dz = c.mesh.position.z - center.z;
        const d = Math.hypot(dx, dz);
        if (d > 1250) {
          // wrap to the opposite side
          c.mesh.position.x = center.x - (dx / d) * 1150;
          c.mesh.position.z = center.z - (dz / d) * 1150;
        }
      }
    },
    recenter(center: Vector3) {
      for (const c of clouds) {
        c.mesh.position.x = center.x + Math.cos(c.ang) * c.rad;
        c.mesh.position.z = center.z + Math.sin(c.ang) * c.rad;
      }
    },
    dispose() {
      shapes.forEach((s) => s.dispose());
      mat.dispose();
    },
  };
}

/** Tiny V-shaped birds that glide across now and then. */
export function createBirds() {
  const group = new Group();
  group.name = 'birds';
  const mat = new MeshBasicMaterial({ color: '#33414d', side: DoubleSide });
  const wingGeo = new BufferGeometry();
  wingGeo.setAttribute('position', new BufferAttribute(new Float32Array([0, 0, -0.25, 0, 0, 0.25, 1.1, 0.0, 0.15]), 3));
  const birds: { root: Group; l: Mesh; r: Mesh; phase: number; off: Vector3 }[] = [];
  for (let i = 0; i < 5; i++) {
    const root = new Group();
    const l = new Mesh(wingGeo, mat);
    const r = new Mesh(wingGeo, mat);
    r.scale.x = -1;
    root.add(l, r);
    group.add(root);
    birds.push({ root, l, r, phase: i * 1.3, off: new Vector3(-i * 2.2 * (i % 2 ? 1 : -1), Math.random() * 1.5, i * 2.6) });
  }
  group.visible = false;
  let t = 0;
  let next = 6 + Math.random() * 10;
  const start = new Vector3();
  const dir = new Vector3();
  let life = 0;
  return {
    group,
    update(dt: number, focus: Vector3) {
      t += dt;
      if (!group.visible) {
        next -= dt;
        if (next <= 0) {
          const a = Math.random() * Math.PI * 2;
          dir.set(Math.cos(a), 0, Math.sin(a));
          start.copy(focus).addScaledVector(dir, -160).add(new Vector3(-dir.z * 40, 35 + Math.random() * 25, dir.x * 40));
          group.position.copy(start);
          group.rotation.y = Math.atan2(-dir.x, -dir.z);
          group.visible = true;
          life = 0;
        }
        return;
      }
      life += dt;
      group.position.addScaledVector(dir, dt * 12);
      group.position.y += Math.sin(life * 0.5) * dt * 0.8;
      for (const b of birds) {
        b.root.position.copy(b.off);
        const flap = Math.sin(t * 7 + b.phase);
        const glide = Math.sin(t * 0.6 + b.phase) > 0.2 ? 0.15 : flap * 0.6;
        b.l.rotation.z = glide;
        b.r.rotation.z = -glide;
      }
      if (life > 28) {
        group.visible = false;
        next = 20 + Math.random() * 30;
      }
    },
    dispose() {
      wingGeo.dispose();
      mat.dispose();
    },
  };
}
