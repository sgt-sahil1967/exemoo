import * as THREE from 'three';
import { canvasTexture, crowdAtlas } from '../assets';

export interface Seat {
  pos: THREE.Vector3;
  /** Rotation about Y so the billboard faces the court. */
  rotY: number;
}

const SHIRTS = [
  '#e9ecef', '#f8f9fa', '#1d3557', '#457b9d', '#e63946', '#2a9d8f', '#f4a261', '#264653', '#ffb703', '#8ecae6',
  '#6d597a', '#b5838d', '#ffffff', '#222831', '#c8ff2e', '#ff006e', '#3a86ff', '#fb8500', '#7f5539', '#adb5bd',
];

const vert = /* glsl */ `
uniform float uTime;
uniform float uExcite;
attribute float aCell;
attribute float aPhase;
attribute float aSkin;
varying vec2 vUv;
varying vec3 vShirt;
varying float vSkin;
varying float vCell;
varying float vDepth;
void main() {
  vUv = uv;
  vShirt = instanceColor;
  vSkin = aSkin;
  float cell = aCell;
  float r = fract(aPhase * 7.31);
  if (uExcite > 0.35 && fract(aPhase * 3.7) > 0.4) cell = 1.0;
  vCell = cell;
  vec3 p = position;
  float jump = uExcite * max(0.0, sin(uTime * 8.0 + aPhase * 6.283)) * 0.2 * step(0.3, r);
  p.y += jump + sin(uTime * 1.1 + aPhase * 40.0) * 0.012;
  p.x += sin(uTime * 0.7 + aPhase * 17.0) * 0.015;
  vec4 mv = modelViewMatrix * instanceMatrix * vec4(p, 1.0);
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

const frag = /* glsl */ `
uniform sampler2D uAtlas;
uniform float uLight;
uniform vec3 uFogColor;
uniform vec2 uFog;
varying vec2 vUv;
varying vec3 vShirt;
varying float vSkin;
varying float vCell;
varying float vDepth;
void main() {
  vec2 uv = vec2((vCell + vUv.x) / 6.0, vUv.y);
  float a = texture2D(uAtlas, uv).a;
  if (a < 0.5) discard;
  vec3 skin = mix(vec3(0.93, 0.72, 0.58), vec3(0.32, 0.2, 0.13), vSkin);
  float head = smoothstep(0.56, 0.6, vUv.y);
  vec3 col = mix(vShirt, skin, head);
  col *= uLight * (0.7 + 0.3 * vUv.y);
  float f = smoothstep(uFog.x, uFog.y, vDepth);
  col = mix(col, uFogColor, f);
  gl_FragColor = vec4(col, 1.0);
}
`;

export class Crowd {
  mesh: THREE.InstancedMesh;
  private mat: THREE.ShaderMaterial;
  private excite = 0;

  constructor(seats: Seat[], light: number, fog: THREE.Fog) {
    const geo = new THREE.PlaneGeometry(0.56, 0.7);
    geo.translate(0, 0.35, 0);
    const n = seats.length;
    const cells = new Float32Array(n);
    const phases = new Float32Array(n);
    const skins = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const r = Math.random();
      cells[i] = r < 0.35 ? 0 : r < 0.5 ? 3 : r < 0.62 ? 2 : r < 0.75 ? 4 : r < 0.88 ? 5 : 0;
      phases[i] = Math.random();
      skins[i] = Math.pow(Math.random(), 1.6);
    }
    geo.setAttribute('aCell', new THREE.InstancedBufferAttribute(cells, 1));
    geo.setAttribute('aPhase', new THREE.InstancedBufferAttribute(phases, 1));
    geo.setAttribute('aSkin', new THREE.InstancedBufferAttribute(skins, 1));

    const placeholder = document.createElement('canvas');
    placeholder.width = placeholder.height = 4;
    this.mat = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: {
        uTime: { value: 0 },
        uExcite: { value: 0 },
        uAtlas: { value: canvasTexture(placeholder) },
        uLight: { value: light },
        uFogColor: { value: fog.color.clone() },
        uFog: { value: new THREE.Vector2(fog.near, fog.far) },
      },
      side: THREE.DoubleSide,
    });
    this.mesh = new THREE.InstancedMesh(geo, this.mat, n);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const c = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const seat = seats[i];
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), seat.rotY);
      const k = 0.92 + Math.random() * 0.16;
      s.set(k, k, k);
      m.compose(seat.pos, q, s);
      this.mesh.setMatrixAt(i, m);
      c.set(SHIRTS[(Math.random() * SHIRTS.length) | 0]);
      this.mesh.setColorAt(i, c);
    }
    this.mesh.frustumCulled = false;

    crowdAtlas().then((atlas) => {
      const old = this.mat.uniforms.uAtlas.value as THREE.Texture;
      this.mat.uniforms.uAtlas.value = canvasTexture(atlas);
      old.dispose();
    });
  }

  /** Make the crowd cheer; decays over time. */
  cheer(amount: number) {
    this.excite = Math.max(this.excite, amount);
  }

  update(t: number, dt: number) {
    this.excite = Math.max(0, this.excite - dt * 0.45);
    this.mat.uniforms.uTime.value = t;
    this.mat.uniforms.uExcite.value = Math.min(1, this.excite);
  }
}
