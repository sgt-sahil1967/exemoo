import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Court } from './court';
import { Stadium, THEMES, type ThemeName } from './stadium';
import type { BoardState } from './scoreboard';

const VignetteShader = {
  uniforms: { tDiffuse: { value: null }, uStrength: { value: 0.35 } },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse; uniform float uStrength;
    varying vec2 vUv;
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      vec2 d = vUv - 0.5;
      float v = 1.0 - dot(d, d) * uStrength * 2.2;
      gl_FragColor = vec4(c.rgb * v, c.a);
    }`,
};

export class World {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera: THREE.PerspectiveCamera;
  court = new Court();
  stadium!: Stadium;
  theme: ThemeName = 'midnight';
  private stadiums = new Map<ThemeName, Stadium>();
  private composer: EffectComposer;
  private bloom: UnrealBloomPass;
  private lastBoard: BoardState | null = null;

  constructor(container: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 1200);
    this.camera.position.set(0, 4.2, 19);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    this.scene.add(this.court.group);

    const size = this.renderer.getDrawingBufferSize(new THREE.Vector2());
    const rt = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples: 4 });
    this.composer = new EffectComposer(this.renderer, rt);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.7, 0.5, 0.85);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new ShaderPass(VignetteShader));
    this.composer.addPass(new OutputPass());

    this.setTheme('midnight');
    window.addEventListener('resize', () => this.resize());
  }

  setTheme(name: ThemeName) {
    this.theme = name;
    const def = THEMES[name];
    let s = this.stadiums.get(name);
    if (!s) {
      s = new Stadium(def);
      this.stadiums.set(name, s);
      this.scene.add(s.group);
    }
    for (const [n, st] of this.stadiums) st.group.visible = n === name;
    this.stadium = s;
    this.court.setColors(def.court);
    this.scene.fog = new THREE.Fog(def.fog[0], def.fog[1], def.fog[2]);
    this.scene.environmentIntensity = def.envIntensity;
    this.renderer.toneMappingExposure = def.exposure;
    this.bloom.strength = def.bloom.strength;
    this.bloom.radius = def.bloom.radius;
    this.bloom.threshold = def.bloom.threshold;
    if (this.lastBoard) s.scoreboard.draw(this.lastBoard);
  }

  drawBoard(b: BoardState) {
    this.lastBoard = b;
    this.stadium.scoreboard.draw(b);
  }

  update(t: number, dt: number) {
    this.stadium.update(t, dt);
  }

  render() {
    this.composer.render();
  }

  private resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
  }
}
