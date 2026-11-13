// Back2Back post-processing: HDR scene -> (bloom) -> ACES/sRGB OutputPass -> screen-space FX pass
// (radial blur, chromatic aberration, speed streaks, vignette, hurt/boost/slow-mo grading, flash).
// The FX pass runs AFTER OutputPass, in display space, so the base look matches direct rendering.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export interface PostState {
  speed: number; // m/s 0..90
  nitro: boolean;
  hurt: number; // 0..1 pulse
  boost: number; // 0..1 drift/boost glow
  slow: number; // 0..1 slow-mo amount
  flash: number; // 0..1 white flash
  tint?: number; // unused
}

export interface Post {
  render(dt: number, s: PostState): void;
  resize(w: number, h: number): void;
  setQuality(q: 'high' | 'low'): void;
}

const MAX_PR = 1.5;

const FxShader = {
  name: 'B2BFx',
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uTime: { value: 0 },
    uSpeed: { value: 0 }, // 0..1
    uNitro: { value: 0 }, // 0..1 (smoothed)
    uHurt: { value: 0 },
    uBoost: { value: 0 },
    uSlow: { value: 0 },
    uFlash: { value: 0 },
    uAspect: { value: 1 },
    uLow: { value: 0 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime, uSpeed, uNitro, uHurt, uBoost, uSlow, uFlash, uAspect, uLow;
    varying vec2 vUv;

    float hash(float n) { return fract(sin(n * 91.3458) * 47453.5453); }

    void main() {
      vec2 p = vUv - 0.5;
      vec2 pa = vec2(p.x * uAspect, p.y);
      float r = length(pa);
      float fast = max(uSpeed, uNitro);
      float edge = smoothstep(0.12, 0.75, r);

      // radial blur + chromatic aberration (full quality only)
      float blurAmt = (uSpeed * 0.018 + uNitro * 0.03) * edge;
      float ca = (uSpeed * 0.0018 + uNitro * 0.003 + uHurt * 0.004) * edge;
      vec3 col;
      if (uLow > 0.5) {
        col = texture2D(tDiffuse, vUv).rgb;
      } else {
        vec2 dir = -p;
        vec3 acc = vec3(0.0);
        for (int i = 0; i < 5; i++) {
          float k = float(i) / 4.0;
          vec2 uv = vUv + dir * blurAmt * k;
          vec2 o = p * ca * (1.0 + k);
          acc += vec3(texture2D(tDiffuse, uv + o).r, texture2D(tDiffuse, uv).g, texture2D(tDiffuse, uv - o).b);
        }
        col = acc * 0.2;
      }

      // radial speed streaks
      if (fast > 0.35) {
        float a = atan(pa.y, pa.x);
        float seg = a * 22.0;
        float id = floor(seg);
        float h = hash(id + floor(uTime * 14.0 + hash(id) * 5.0) * 7.31);
        float w = abs(fract(seg) - 0.5);
        float line = smoothstep(0.16 + 0.1 * h, 0.0, w) * step(0.55, h);
        float reach = smoothstep(0.30 + (1.0 - fast) * 0.2, 0.85, r);
        float s = line * reach * smoothstep(0.35, 1.0, fast) * (0.18 + 0.22 * uNitro);
        col += s * mix(vec3(1.0), vec3(0.75, 0.88, 1.0), uNitro);
      }

      // slow-mo: desaturate + tighter vignette
      float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
      col = mix(col, vec3(lum), uSlow * 0.6);

      // vignette
      float vig = smoothstep(0.42 - uSlow * 0.12, 0.98, r);
      col *= 1.0 - vig * (0.28 + uSlow * 0.4 + uSpeed * 0.1);

      // warm boost glow from the edges
      col += vec3(1.0, 0.55, 0.18) * uBoost * (0.05 + 0.2 * vig);
      col = mix(col, col * vec3(1.06, 1.0, 0.94), uBoost * 0.5);

      // hurt pulse: red edge wash
      col = mix(col, vec3(0.9, 0.05, 0.04), uHurt * (0.12 + 0.55 * vig));

      // white flash
      col = mix(col, vec3(1.0), uFlash);

      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

export function createPost(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera): Post {
  let quality: 'high' | 'low' = 'high';
  let failed = false;
  let composer: EffectComposer | null = null;
  let bloom: UnrealBloomPass | null = null;
  let fx: ShaderPass | null = null;
  let nitroSm = 0;
  let time = 0;
  let w = 1;
  let h = 1;
  const size = new THREE.Vector2();

  try {
    renderer.getSize(size);
    w = size.x || 1;
    h = size.y || 1;
    const pr = Math.min(MAX_PR, renderer.getPixelRatio());
    const rt = new THREE.WebGLRenderTarget(w * pr, h * pr, { type: THREE.HalfFloatType, samples: 4 });
    composer = new EffectComposer(renderer, rt);
    composer.setPixelRatio(pr);
    composer.setSize(w, h);
    composer.addPass(new RenderPass(scene, camera));
    // Guard: NaN / Inf / absurd HDR values (from additive glow sprites) would be smeared across the frame by bloom.
    composer.addPass(
      new ShaderPass({
        name: 'B2BSanitize',
        uniforms: { tDiffuse: { value: null as THREE.Texture | null } },
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader:
          'uniform sampler2D tDiffuse; varying vec2 vUv; void main(){ vec4 c = texture2D(tDiffuse, vUv); if (!(c.r == c.r) || !(c.g == c.g) || !(c.b == c.b) || !(c.a == c.a)) c = vec4(0.0, 0.0, 0.0, 1.0); gl_FragColor = vec4(clamp(c.rgb, 0.0, 8.0), 1.0); }',
      }),
    );
    bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.18, 0.55, 1.0);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    fx = new ShaderPass(FxShader);
    composer.addPass(fx);
    fx.uniforms.uAspect.value = w / h;
  } catch (e) {
    console.warn('[post] composer init failed, using direct render', e);
    failed = true;
  }

  const u = fx?.uniforms;

  function applyQuality(): void {
    if (!composer || !bloom || !u) return;
    const low = quality === 'low';
    bloom.enabled = !low;
    u.uLow.value = low ? 1 : 0;
  }

  function setBloom(s: PostState): void {
    if (!bloom) return;
    bloom.strength = 0.16 + 0.34 * nitroSm + 0.3 * s.flash + 0.12 * s.boost;
    bloom.radius = 0.5 + 0.2 * nitroSm;
    bloom.threshold = 1.0 - 0.06 * nitroSm;
  }

  return {
    render(dt, s) {
      if (failed || !composer || !u) {
        renderer.render(scene, camera);
        return;
      }
      time += dt;
      nitroSm += ((s.nitro ? 1 : 0) - nitroSm) * Math.min(1, dt * 6);
      u.uTime.value = time;
      u.uSpeed.value = Math.min(1, Math.max(0, s.speed / 90));
      u.uNitro.value = nitroSm;
      u.uHurt.value = s.hurt;
      u.uBoost.value = s.boost;
      u.uSlow.value = s.slow;
      u.uFlash.value = s.flash;
      setBloom(s);
      try {
        composer.render(dt);
      } catch (e) {
        console.warn('[post] composer render failed, falling back', e);
        failed = true;
        renderer.setRenderTarget(null);
        renderer.render(scene, camera);
      }
    },
    resize(nw, nh) {
      w = Math.max(1, nw);
      h = Math.max(1, nh);
      if (!composer || !u) return;
      composer.setPixelRatio(Math.min(MAX_PR, renderer.getPixelRatio()));
      composer.setSize(w, h);
      u.uAspect.value = w / h;
    },
    setQuality(q) {
      quality = q;
      applyQuality();
    },
  };
}
