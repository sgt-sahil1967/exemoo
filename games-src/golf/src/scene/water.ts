/** Glossy animated water: a plane at waterLevel with ripples, fresnel, sun glint and shore foam. */
import {
  Color,
  DataTexture,
  LinearFilter,
  Mesh,
  PlaneGeometry,
  RedFormat,
  ShaderMaterial,
  UniformsLib,
  UniformsUtils,
  UnsignedByteType,
  Vector2,
  Vector3,
} from 'three';
import type { Box } from './terrain';

const vert = /* glsl */ `
#include <common>
#include <fog_pars_vertex>
varying vec3 vWorld;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`;

const frag = /* glsl */ `
#include <common>
#include <fog_pars_fragment>
uniform float uTime;
uniform sampler2D uDepth;
uniform vec3 uShallow;
uniform vec3 uDeep;
uniform vec3 uSky;
uniform vec3 uSunDir;
uniform vec2 uWind;
varying vec3 vWorld;
varying vec2 vUv;
void main() {
  float depth = texture2D(uDepth, vUv).r * 2.5;
  vec2 p = vWorld.xz;
  vec2 w = uWind * uTime;
  // analytic ripple normal from a few travelling sines
  float t = uTime;
  vec2 g = vec2(0.0);
  g += vec2(0.8, 0.3) * cos(dot(p + w, vec2(0.8, 0.3)) * 1.1 + t * 1.7) * 0.06;
  g += vec2(-0.4, 0.9) * cos(dot(p - w * 0.5, vec2(-0.4, 0.9)) * 1.7 + t * 2.1) * 0.045;
  g += vec2(0.6, -0.7) * cos(dot(p, vec2(0.6, -0.7)) * 3.1 + t * 2.9) * 0.025;
  g += vec2(-0.9, -0.2) * cos(dot(p + w, vec2(-0.9, -0.2)) * 5.3 + t * 3.7) * 0.015;
  vec3 n = normalize(vec3(-g.x, 1.0, -g.y));
  vec3 v = normalize(cameraPosition - vWorld);
  float fres = pow(1.0 - max(dot(n, v), 0.0), 4.0);
  vec3 base = mix(uShallow, uDeep, smoothstep(0.0, 1.6, depth));
  vec3 col = mix(base, uSky, 0.06 + fres * 0.5);
  vec3 h = normalize(uSunDir + v);
  float spec = pow(max(dot(n, h), 0.0), 220.0);
  col += vec3(1.0, 0.97, 0.9) * spec * 2.2;
  // sparkly glints
  float gl = pow(max(dot(n, h), 0.0), 900.0);
  col += gl * 2.0;
  // shore foam band (wobbles with time)
  float edge = 0.16 + 0.06 * sin(p.x * 0.9 + t * 1.3) * sin(p.y * 0.7 - t);
  float foam = 1.0 - smoothstep(edge * 0.4, edge, depth);
  col = mix(col, vec3(1.0), foam * 0.85);
  float alpha = mix(0.8, 0.94, smoothstep(0.0, 1.0, depth));
  alpha = max(alpha, foam);
  gl_FragColor = vec4(col, alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}`;

export interface WaterBuild {
  mesh: Mesh;
  update(t: number): void;
  setWind(x: number, z: number): void;
  setSun(dir: Vector3): void;
  dispose(): void;
}

export function buildWater(level: number, box: Box, heightAt: (x: number, z: number) => number): WaterBuild {
  const w = box.maxX - box.minX;
  const h = box.maxZ - box.minZ;
  // depth texture (water depth below the surface), 0.5 m/px
  const tw = Math.max(4, Math.min(1024, Math.ceil(w / 0.5)));
  const th = Math.max(4, Math.min(1024, Math.ceil(h / 0.5)));
  const data = new Uint8Array(tw * th);
  for (let j = 0; j < th; j++) {
    // PlaneGeometry rotated -90° about X: uv.v = 1 at minZ ... we map v=0 → maxZ
    const z = box.maxZ - ((j + 0.5) / th) * h;
    for (let i = 0; i < tw; i++) {
      const x = box.minX + ((i + 0.5) / tw) * w;
      const d = level - heightAt(x, z);
      data[j * tw + i] = Math.max(0, Math.min(255, (d / 2.5) * 255));
    }
  }
  const depthTex = new DataTexture(data, tw, th, RedFormat, UnsignedByteType);
  depthTex.magFilter = LinearFilter;
  depthTex.minFilter = LinearFilter;
  depthTex.needsUpdate = true;

  const geo = new PlaneGeometry(w, h, 1, 1);
  geo.rotateX(-Math.PI / 2);
  const mat = new ShaderMaterial({
    uniforms: UniformsUtils.merge([
      UniformsLib.fog,
      {
        uTime: { value: 0 },
        uDepth: { value: null },
        uShallow: { value: new Color('#5fd6e0') },
        uDeep: { value: new Color('#1670d4') },
        uSky: { value: new Color('#bfe6ff') },
        uSunDir: { value: new Vector3(0.4, 0.8, 0.3).normalize() },
        uWind: { value: new Vector2() },
      },
    ]),
    vertexShader: vert,
    fragmentShader: frag,
    transparent: true,
    fog: true,
    depthWrite: false,
  });
  mat.uniforms.uDepth.value = depthTex;
  const mesh = new Mesh(geo, mat);
  mesh.position.set((box.minX + box.maxX) / 2, level, (box.minZ + box.maxZ) / 2);
  mesh.renderOrder = 1;
  mesh.name = 'water';
  return {
    mesh,
    update(t) {
      mat.uniforms.uTime.value = t;
    },
    setWind(x, z) {
      (mat.uniforms.uWind.value as Vector2).set(x * 0.15, z * 0.15);
    },
    setSun(dir) {
      (mat.uniforms.uSunDir.value as Vector3).copy(dir).normalize();
    },
    dispose() {
      geo.dispose();
      mat.dispose();
      depthTex.dispose();
    },
  };
}
