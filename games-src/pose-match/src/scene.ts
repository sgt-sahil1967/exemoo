import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

export const SPAWN_Z = -46;

const CAM_POS = new THREE.Vector3(0, 2.3, 6.4);
const CAM_LOOK = new THREE.Vector3(0, 1.0, -6);
const NEON = ['#ff3d8b', '#7dfcff', '#ffd02a', '#9b4dff'];

// ---------------------------------------------------------------- procedural textures

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, srgb = true) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function skyTexture() {
  return canvasTex(1024, 512, (g) => {
    const grad = g.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#020108');
    grad.addColorStop(0.35, '#0a0420');
    grad.addColorStop(0.5, '#2a0d4f');
    grad.addColorStop(0.56, '#5a1670');
    grad.addColorStop(1, '#0a0420');
    g.fillStyle = grad;
    g.fillRect(0, 0, 1024, 512);
    // Soft nebula smudges.
    for (let i = 0; i < 14; i++) {
      const x = Math.random() * 1024, y = 80 + Math.random() * 160, r = 60 + Math.random() * 140;
      const n = g.createRadialGradient(x, y, 0, x, y, r);
      n.addColorStop(0, i % 2 ? 'rgba(255,61,139,0.10)' : 'rgba(80,120,255,0.10)');
      n.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = n;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    for (let i = 0; i < 700; i++) {
      const y = Math.random() * 250;
      g.fillStyle = `rgba(255,255,255,${0.25 + Math.random() * 0.7})`;
      const s = Math.random() < 0.08 ? 2 : 1;
      g.fillRect(Math.random() * 1024, y, s, s);
    }
  });
}

/** Runway tiles: colour map + a matching emissive map holding only the neon seams. */
function runwayTextures() {
  const draw = (emissive: boolean) => (g: CanvasRenderingContext2D) => {
    g.fillStyle = emissive ? '#000' : '#140c34';
    g.fillRect(0, 0, 256, 256);
    if (!emissive) {
      const grad = g.createLinearGradient(0, 0, 256, 256);
      grad.addColorStop(0, 'rgba(255,255,255,0.05)');
      grad.addColorStop(1, 'rgba(0,0,0,0.12)');
      g.fillStyle = grad;
      g.fillRect(4, 4, 248, 248);
    }
    g.strokeStyle = emissive ? '#5a3dff' : '#2a1a6a';
    g.lineWidth = 3;
    g.strokeRect(1.5, 1.5, 253, 253);
    g.strokeStyle = emissive ? '#ff3d8b' : '#3a1a4a';
    g.lineWidth = 2;
    g.beginPath(); g.moveTo(128, 0); g.lineTo(128, 256); g.stroke();
  };
  const map = canvasTex(256, 256, draw(false));
  const em = canvasTex(256, 256, draw(true));
  for (const t of [map, em]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 30); }
  return { map, em };
}

function chevronTexture() {
  const t = canvasTex(128, 128, (g) => {
    g.clearRect(0, 0, 128, 128);
    g.strokeStyle = '#ffffff';
    g.lineWidth = 14;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    // Arrow pointing toward +V (toward the player once laid on the floor).
    g.beginPath(); g.moveTo(22, 44); g.lineTo(64, 84); g.lineTo(106, 44); g.stroke();
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function causticsTexture() {
  const t = canvasTex(256, 256, (g) => {
    g.fillStyle = '#000';
    g.fillRect(0, 0, 256, 256);
    g.strokeStyle = 'rgba(160,230,255,0.55)';
    g.lineWidth = 2.5;
    for (let i = 0; i < 26; i++) {
      g.beginPath();
      const y0 = Math.random() * 256;
      for (let x = -10; x <= 266; x += 8) {
        const y = y0 + Math.sin(x * 0.05 + i) * 10 + Math.sin(x * 0.13 + i * 2) * 5;
        x < 0 ? g.moveTo(x, y) : g.lineTo(x, y);
      }
      g.stroke();
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// ---------------------------------------------------------------- light cones

const coneVert = /* glsl */ `
  varying vec2 vUv; varying vec3 vN; varying vec3 vV;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`;
const coneFrag = /* glsl */ `
  uniform vec3 color; uniform float intensity;
  varying vec2 vUv; varying vec3 vN; varying vec3 vV;
  void main() {
    float along = pow(vUv.y, 1.6);
    float edge = pow(abs(dot(vN, vV)), 1.5);
    float a = along * edge * intensity;
    gl_FragColor = vec4(color * a, a);
  }`;

function makeCone(color: string, length: number, radius: number) {
  const geo = new THREE.ConeGeometry(radius, length, 32, 1, true);
  geo.translate(0, -length / 2, 0); // apex at origin, opening toward -Y
  const mat = new THREE.ShaderMaterial({
    uniforms: { color: { value: new THREE.Color(color) }, intensity: { value: 0.18 } },
    vertexShader: coneVert,
    fragmentShader: coneFrag,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: false,
  });
  const m = new THREE.Mesh(geo, mat);
  m.renderOrder = 10;
  return m;
}

interface Beam { cone: THREE.Mesh; light?: THREE.SpotLight; origin: THREE.Vector3; phase: number; speed: number }

// ---------------------------------------------------------------- stage

export class Stage {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(50, 1, 0.1, 400);
  readonly renderer: THREE.WebGLRenderer;
  private composer: EffectComposer;
  private bloom: UnrealBloomPass;
  private chevrons!: THREE.Texture;
  private caustics!: THREE.Texture;
  private pool!: THREE.Mesh;
  private ring!: THREE.MeshBasicMaterial;
  private beams: Beam[] = [];
  private bars: { mat: THREE.MeshBasicMaterial; i: number }[] = [];
  private bulbs: { mesh: THREE.Mesh; phase: number }[] = [];
  private crowdBodies!: THREE.InstancedMesh;
  private crowdHeads!: THREE.InstancedMesh;
  private crowd: { x: number; y: number; z: number; phase: number; amp: number; s: number }[] = [];
  private phones!: THREE.InstancedMesh;
  private screen!: { ctx: CanvasRenderingContext2D; tex: THREE.CanvasTexture; t: number };
  private hype = 0;
  private shake = 0;
  private t = 0;
  private m4 = new THREE.Matrix4();
  private q = new THREE.Quaternion();
  private v3 = new THREE.Vector3();
  private s3 = new THREE.Vector3();

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.85;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    const s = this.scene;
    s.fog = new THREE.FogExp2('#1a0a36', 0.018);
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    s.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    s.environmentIntensity = 0.28;
    pmrem.dispose();

    this.camera.position.copy(CAM_POS);
    this.camera.lookAt(CAM_LOOK);

    this.buildSky();
    this.buildLights();
    this.buildRunway();
    this.buildPlatformAndPool();
    this.buildArena();
    this.buildTrusses();
    this.buildScreen();
    this.buildBeams();

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(s, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.35, 0.45, 0.95);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    addEventListener('resize', () => this.resize());
    this.resize();
  }

  private buildSky() {
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(180, 48, 24),
      new THREE.MeshBasicMaterial({ map: skyTexture(), side: THREE.BackSide, fog: false, depthWrite: false }),
    );
    sky.rotation.y = Math.PI;
    this.scene.add(sky);
  }

  private buildLights() {
    const s = this.scene;
    s.add(new THREE.HemisphereLight('#8f7dff', '#1a0626', 0.45));
    const key = new THREE.DirectionalLight('#fff2e6', 1.9);
    key.position.set(4, 9, 7);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.02;
    Object.assign(key.shadow.camera, { left: -3.5, right: 3.5, top: 3.5, bottom: -1.5, near: 2, far: 22 });
    s.add(key);
    // Rim lights from up-track give the figure (seen from behind) bright edges.
    const rimC = new THREE.DirectionalLight('#5ff8ff', 1.3);
    rimC.position.set(-3, 4, -8);
    const rimP = new THREE.DirectionalLight('#ff3d8b', 1.1);
    rimP.position.set(4, 3, -7);
    s.add(rimC, rimP);
  }

  private buildRunway() {
    const s = this.scene;
    const { map, em } = runwayTextures();
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(5.6, 60),
      new THREE.MeshPhysicalMaterial({
        map, emissiveMap: em, emissive: '#ffffff', emissiveIntensity: 0.5,
        roughness: 0.28, metalness: 0.35, clearcoat: 1, clearcoatRoughness: 0.08,
      }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.z = -29.2;
    floor.receiveShadow = true;
    s.add(floor);

    // Scrolling chevrons pointing at the player.
    this.chevrons = chevronTexture();
    this.chevrons.repeat.set(1, 18);
    const chev = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 56),
      new THREE.MeshBasicMaterial({
        map: this.chevrons, color: new THREE.Color('#ff3d8b').multiplyScalar(0.9), transparent: true,
        opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false,
      }),
    );
    chev.rotation.x = -Math.PI / 2;
    chev.position.set(0, 0.006, -29);
    s.add(chev);

    // Glowing rails (HDR colours so bloom picks them up).
    for (const [x, c] of [[-2.85, '#ff3d8b'], [2.85, '#7dfcff']] as const) {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.06, 60),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(2.2) }),
      );
      rail.position.set(x, 0.03, -29.2);
      s.add(rail);
    }
    // Dark side gutters.
    const gutterMat = new THREE.MeshStandardMaterial({ color: '#0b0620', roughness: 0.5, metalness: 0.3 });
    for (const x of [-4.3, 4.3]) {
      const g = new THREE.Mesh(new THREE.PlaneGeometry(3, 64), gutterMat);
      g.rotation.x = -Math.PI / 2;
      g.position.set(x, -0.01, -29);
      s.add(g);
    }
  }

  private buildPlatformAndPool() {
    const s = this.scene;
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.86, 0.08, 64),
      new THREE.MeshPhysicalMaterial({ color: '#241460', metalness: 0.6, roughness: 0.25, clearcoat: 1, emissive: '#2a1070', emissiveIntensity: 0.6 }),
    );
    pad.receiveShadow = true;
    s.add(pad);
    this.ring = new THREE.MeshBasicMaterial({ color: new THREE.Color('#7dfcff').multiplyScalar(2) });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.022, 8, 96), this.ring);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.045;
    s.add(ring);

    // Splash pool behind the player.
    this.caustics = causticsTexture();
    this.caustics.repeat.set(3, 1.4);
    this.pool = new THREE.Mesh(
      new THREE.PlaneGeometry(7, 3.2, 48, 20),
      new THREE.MeshPhysicalMaterial({
        color: '#0b4fb8', roughness: 0.12, metalness: 0.0, clearcoat: 1, clearcoatRoughness: 0.02,
        emissive: '#3ab8ff', emissiveMap: this.caustics, emissiveIntensity: 0.3, transparent: true, opacity: 0.92,
      }),
    );
    this.pool.rotation.x = -Math.PI / 2;
    this.pool.position.set(0, -0.22, 2.5);
    s.add(this.pool);
    const tile = new THREE.Mesh(
      new THREE.BoxGeometry(7.6, 0.5, 3.6),
      new THREE.MeshStandardMaterial({ color: '#0a2a6a', roughness: 0.6 }),
    );
    tile.position.set(0, -0.55, 2.5);
    s.add(tile);
    const edgeMat = new THREE.MeshPhysicalMaterial({ color: '#c9c2e6', roughness: 0.5, clearcoat: 0.3 });
    const edge = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.12, 0.25), edgeMat);
    edge.position.set(0, -0.06, 0.85);
    s.add(edge);
    const edgeGlow = new THREE.Mesh(
      new THREE.BoxGeometry(7.6, 0.025, 0.03),
      new THREE.MeshBasicMaterial({ color: new THREE.Color('#7dfcff').multiplyScalar(1.4) }),
    );
    edgeGlow.position.set(0, 0.0, 0.98);
    s.add(edgeGlow);
  }

  private buildArena() {
    const s = this.scene;
    const standMat = new THREE.MeshStandardMaterial({ color: '#1a0f3d', roughness: 0.7, metalness: 0.2 });
    const lipMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#9b4dff').multiplyScalar(1.4) });
    const TIERS = 4;
    for (const side of [-1, 1]) {
      for (let t = 0; t < TIERS; t++) {
        const x = side * (5.2 + t * 1.0), y = 0.45 + t * 0.6;
        const tier = new THREE.Mesh(new THREE.BoxGeometry(1.0, y * 2, 52), standMat);
        tier.position.set(x, 0, -24);
        s.add(tier);
        const lip = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 52), lipMat);
        lip.position.set(x - side * 0.5, y + 0.01, -24);
        s.add(lip);
      }
      // Front barrier with LED ad strip.
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.7, 52),
        new THREE.MeshStandardMaterial({ color: '#120a2a', emissive: NEON[side < 0 ? 0 : 1], emissiveIntensity: 0.25 }),
      );
      wall.position.set(side * 4.55, 0.35, -24);
      s.add(wall);
    }

    // Crowd: instanced bodies + heads that bounce with excitement.
    const PER_ROW = 34;
    const n = 2 * TIERS * PER_ROW;
    this.crowdBodies = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.17, 0.32, 4, 8), new THREE.MeshStandardMaterial({ roughness: 0.8 }), n);
    this.crowdHeads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.12, 10, 8), new THREE.MeshStandardMaterial({ color: '#2a1d3a', roughness: 0.7 }), n);
    const shirts = ['#3a1d6e', '#5a1840', '#173a6a', '#4a3a10', '#2a2a40', '#601a1a'].map((c) => new THREE.Color(c));
    let i = 0;
    for (const side of [-1, 1]) {
      for (let t = 0; t < TIERS; t++) {
        for (let k = 0; k < PER_ROW; k++) {
          const z = -1.5 - k * 1.45 - Math.random() * 0.5;
          this.crowd.push({
            x: side * (5.2 + t * 1.0) + (Math.random() - 0.5) * 0.3,
            y: (0.45 + t * 0.6) * 2 * 0.5 + 0.45,
            z, phase: Math.random() * 10, amp: 0.03 + Math.random() * 0.05, s: 0.85 + Math.random() * 0.3,
          });
          this.crowdBodies.setColorAt(i, shirts[(i * 7) % shirts.length]);
          i++;
        }
      }
    }
    s.add(this.crowdBodies, this.crowdHeads);

    // Phone flashes scattered through the crowd.
    this.phones = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(0.06, 0.1),
      new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffffff').multiplyScalar(3), side: THREE.DoubleSide }),
      40,
    );
    s.add(this.phones);
  }

  private buildTrusses() {
    const s = this.scene;
    const trussMat = new THREE.MeshStandardMaterial({ color: '#2a2440', metalness: 0.8, roughness: 0.35 });
    const postGeo = new THREE.BoxGeometry(0.18, 4.6, 0.18);
    const beamGeo = new THREE.BoxGeometry(7.2, 0.22, 0.22);
    const barGeo = new THREE.BoxGeometry(6.6, 0.06, 0.06);
    const bulbGeo = new THREE.SphereGeometry(0.07, 8, 6);
    for (let k = 0; k < 6; k++) {
      const z = -3 - k * 8;
      for (const x of [-3.6, 3.6]) {
        const p = new THREE.Mesh(postGeo, trussMat);
        p.position.set(x, 2.3, z);
        s.add(p);
        // Marquee bulbs up each post.
        for (let b = 0; b < 6; b++) {
          const mesh = new THREE.Mesh(bulbGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color(NEON[(k + b) % 3]).multiplyScalar(2) }));
          mesh.position.set(x + (x < 0 ? 0.12 : -0.12), 0.5 + b * 0.7, z + 0.1);
          this.bulbs.push({ mesh, phase: b * 0.9 + k * 0.5 });
          s.add(mesh);
        }
      }
      const beam = new THREE.Mesh(beamGeo, trussMat);
      beam.position.set(0, 4.6, z);
      s.add(beam);
      const mat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
      const bar = new THREE.Mesh(barGeo, mat);
      bar.position.set(0, 4.46, z + 0.12);
      s.add(bar);
      this.bars.push({ mat, i: k });
    }
  }

  private buildScreen() {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 384;
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(1.15, 1.15, 1.15), fog: false });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(16, 6), mat);
    screen.position.set(0, 6.2, -60);
    this.scene.add(screen);
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(16.6, 6.6, 0.3),
      new THREE.MeshStandardMaterial({ color: '#15102a', metalness: 0.7, roughness: 0.4, fog: false }),
    );
    frame.position.set(0, 6.2, -60.2);
    this.scene.add(frame);
    this.screen = { ctx: c.getContext('2d')!, tex, t: 1 };
  }

  private drawScreen() {
    const g = this.screen.ctx, t = this.t;
    const w = 1024, h = 384;
    const grad = g.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#1a0640');
    grad.addColorStop(0.5 + Math.sin(t * 0.7) * 0.3, '#4a0f6a');
    grad.addColorStop(1, '#06243f');
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    // Equaliser bars.
    for (let i = 0; i < 32; i++) {
      const bh = (0.25 + 0.75 * Math.abs(Math.sin(t * 3 + i * 0.6) * Math.cos(t * 1.7 + i * 0.25))) * 110 * (1 + this.hype);
      g.fillStyle = NEON[i % NEON.length];
      g.globalAlpha = 0.5;
      g.fillRect(i * 32 + 4, h - 44 - bh, 24, bh);
    }
    g.globalAlpha = 1;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = '900 120px "Arial Black", Impact, sans-serif';
    g.lineWidth = 10;
    g.strokeStyle = '#0b0820';
    const bob = Math.sin(t * 4) * 6;
    g.strokeText('POSE PORTAL', w / 2, 140 + bob);
    const tg = g.createLinearGradient(0, 80, 0, 200);
    tg.addColorStop(0, '#7dfcff');
    tg.addColorStop(1, '#ff3d8b');
    g.fillStyle = tg;
    g.fillText('POSE PORTAL', w / 2, 140 + bob);
    // Marquee ticker.
    g.fillStyle = '#0b0820';
    g.fillRect(0, h - 44, w, 44);
    g.fillStyle = '#ffd02a';
    g.font = '800 30px system-ui, sans-serif';
    g.textAlign = 'left';
    const msg = 'FIT THE WALL  ·  DON\'T GET SPLATTED  ·  STRIKE A POSE  ·  ';
    const mw = g.measureText(msg).width;
    const off = -((t * 140) % mw);
    for (let x = off; x < w; x += mw) g.fillText(msg, x, h - 22);
    this.screen.tex.needsUpdate = true;
  }

  private buildBeams() {
    const defs: [number, number, number, string, boolean][] = [
      [-3.2, 4.5, -3, '#ff3d8b', true],
      [3.2, 4.5, -3, '#7dfcff', true],
      [-3.2, 4.5, -11, '#9b4dff', false],
      [3.2, 4.5, -11, '#ffd02a', false],
      [-3.2, 4.5, -19, '#7dfcff', false],
      [3.2, 4.5, -19, '#ff3d8b', false],
    ];
    defs.forEach(([x, y, z, c, real], i) => {
      const cone = makeCone(c, 6.5, 1.1);
      cone.position.set(x, y, z);
      // The front pair sits right in front of the player: keep their light, drop the glowing cone.
      if (real) cone.visible = false;
      this.scene.add(cone);
      const beam: Beam = { cone, origin: new THREE.Vector3(x, y, z), phase: i * 1.3, speed: 0.5 + (i % 3) * 0.15 };
      if (real) {
        const l = new THREE.SpotLight(c, 12, 14, 0.32, 0.55, 1.4);
        l.position.set(x, y, z);
        this.scene.add(l, l.target);
        beam.light = l;
      }
      this.beams.push(beam);
    });
  }

  /** 1 = full screen, 2 = side-by-side split screen. */
  get views() { return this.viewCount; }
  set views(n: 1 | 2) {
    if (n === this.viewCount) return;
    this.viewCount = n;
    this.resize();
  }
  private viewCount: 1 | 2 = 1;

  resize() {
    const w = innerWidth, h = innerHeight;
    const vw = w / this.viewCount;
    this.renderer.setSize(w, h, false);
    this.composer.setPixelRatio(this.renderer.getPixelRatio());
    // One composer the size of a single view, rendered once per view.
    this.composer.setSize(vw, h);
    // Bloom at half resolution: it's blurry anyway and this halves its cost.
    const pr = this.renderer.getPixelRatio();
    this.bloom.setSize(Math.round(vw * pr / 2), Math.round(h * pr / 2));
    this.bloom.resolution.set(vw / 2, h / 2);
    this.camera.aspect = vw / h;
    // Keep the whole wall in view on tall/narrow screens (and split-screen halves).
    this.camera.fov = vw / h < 1 ? 70 : 50;
    this.camera.updateProjectionMatrix();
  }

  kick(amount: number) {
    this.shake = Math.max(this.shake, amount);
    this.hype = Math.max(this.hype, amount);
  }

  /**
   * Animate and render. `beforeView(i)` runs before each view is drawn so the caller
   * can show only that player's figure and walls (the stage itself is shared).
   */
  update(dt: number, beforeView?: (view: number) => void) {
    this.t += dt;
    const t = this.t;
    this.hype = Math.max(0, this.hype - dt * 0.5);

    this.chevrons.offset.y = -t * 0.9;
    this.caustics.offset.set(t * 0.03, t * 0.05);
    this.ring.color.setHSL(0.5 + Math.sin(t * 1.5) * 0.04, 1, 0.5).multiplyScalar(1.6 + Math.sin(t * 3) * 0.6);

    // Sweeping beams.
    const dir = this.v3;
    for (const b of this.beams) {
      const tx = Math.sin(t * b.speed + b.phase) * 2.2;
      const tz = b.origin.z - 3 + Math.cos(t * b.speed * 0.8 + b.phase) * 3;
      dir.set(tx - b.origin.x, -b.origin.y, tz - b.origin.z).normalize();
      b.cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
      (b.cone.material as THREE.ShaderMaterial).uniforms.intensity.value = 0.14 + this.hype * 0.2;
      if (b.light) b.light.target.position.set(tx, 0, tz);
    }
    // Chasing light bars over the runway.
    for (const bar of this.bars) {
      const k = (Math.sin(t * 3 - bar.i * 0.9) + 1) / 2;
      bar.mat.color.setHSL((0.85 + bar.i * 0.08 + t * 0.05) % 1, 1, 0.55).multiplyScalar(0.6 + k * 2.4);
    }
    for (const b of this.bulbs) b.mesh.visible = Math.sin(t * 5 + b.phase) > -0.35;

    // Crowd bounce.
    const excite = 1 + this.hype * 3;
    this.crowd.forEach((c, i) => {
      const bob = Math.max(0, Math.sin(t * 6 + c.phase)) * c.amp * excite;
      this.m4.compose(this.v3.set(c.x, c.y + bob, c.z), this.q.identity(), this.s3.setScalar(c.s));
      this.crowdBodies.setMatrixAt(i, this.m4);
      this.m4.compose(this.v3.set(c.x, c.y + 0.42 * c.s + bob * 1.2, c.z), this.q, this.s3);
      this.crowdHeads.setMatrixAt(i, this.m4);
    });
    this.crowdBodies.instanceMatrix.needsUpdate = true;
    this.crowdHeads.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < 40; i++) {
      const c = this.crowd[(i * 37) % this.crowd.length];
      const on = Math.sin(t * (0.6 + (i % 5) * 0.2) + i * 2.1) > 0.75;
      this.m4.compose(this.v3.set(c.x - Math.sign(c.x) * 0.2, c.y + 0.75, c.z), this.q.identity(), this.s3.setScalar(on ? 1 : 0));
      this.phones.setMatrixAt(i, this.m4);
    }
    this.phones.instanceMatrix.needsUpdate = true;

    this.screen.t += dt;
    if (this.screen.t > 1 / 15) { this.screen.t = 0; this.drawScreen(); }

    // Ripple the pool.
    const pos = this.pool.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i);
      pos.setZ(i, Math.sin(x * 2 + t * 2) * 0.03 + Math.cos(y * 3 + t * 1.6) * 0.03);
    }
    pos.needsUpdate = true;
    this.pool.geometry.computeVertexNormals();

    this.shake = Math.max(0, this.shake - dt * 2.5);
    const sx = (Math.random() - 0.5) * this.shake * 0.25, sy = (Math.random() - 0.5) * this.shake * 0.2;
    this.camera.position.set(CAM_POS.x + sx, CAM_POS.y + sy, CAM_POS.z);
    this.camera.lookAt(CAM_LOOK.x + sx * 0.5, CAM_LOOK.y, CAM_LOOK.z);
    const w = innerWidth, h = innerHeight, vw = w / this.viewCount;
    this.renderer.setScissorTest(this.viewCount > 1);
    for (let i = 0; i < this.viewCount; i++) {
      this.renderer.setViewport(i * vw, 0, vw, h);
      this.renderer.setScissor(i * vw, 0, vw, h);
      beforeView?.(i);
      this.composer.render();
    }
    this.renderer.setScissorTest(false);
  }
}
