import * as THREE from 'three';
import { Rect, targetSkeleton, WallDef } from './poses';
import { BONES, L, Sample, sampleBody, Skeleton } from './skeleton';

export const WALL_W = 4.6;
export const WALL_H = 2.7;
const THICK = 0.32;
const CW = 1024;
const CH = Math.round((CW * WALL_H) / WALL_W);
const PX = CW / WALL_W; // canvas pixels per metre

/** Generous hole radii (metres) around each target bone; the torso/head get extra room. */
const HOLE_R = 0.19;
const TORSO_R = 0.16;
const HIP_R = 0.14;
const HEAD_R = 0.25;

/** Body part of each entry in BONES: 0 core, 1 left arm, 2 right arm, 3 left leg, 4 right leg (5 = head samples). */
const BONE_GROUP = BONES.map(([a, b]) => {
  const j = b === 'lShoulder' || b === 'rShoulder' || b === 'lHip' || b === 'rHip' ? 'core' : b;
  if (/^l(Elbow|Wrist)$/.test(j)) return 1;
  if (/^r(Elbow|Wrist)$/.test(j)) return 2;
  if (/^l(Knee|Ankle|Toe)$/.test(j)) return 3;
  if (/^r(Knee|Ankle|Toe)$/.test(j)) return 4;
  return 0;
});

export interface Capsule { ax: number; ay: number; bx: number; by: number; r: number }

/** Hole shape for a target pose: a capsule around every bone plus the head. */
export function holeCapsules(target: Skeleton): Capsule[] {
  const caps: Capsule[] = [];
  for (const [a, b] of BONES) {
    const pa = target[a], pb = target[b];
    const r = a === 'pelvis' && b === 'neck' ? TORSO_R : b === 'lHip' || b === 'rHip' ? HIP_R : HOLE_R;
    caps.push({ ax: pa.x, ay: pa.y, bx: pb.x, by: pb.y, r });
  }
  const h = target.head;
  caps.push({ ax: h.x, ay: h.y, bx: h.x, by: h.y, r: HEAD_R });
  return caps;
}

export const inCapsules = (caps: Capsule[], x: number, y: number) => caps.some((c) => distSeg(x, y, c) <= c.r);
export const inRects = (rects: Rect[], x: number, y: number) =>
  rects.some((r) => x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1);

/** How close (metres) some part of the body must come to each point of a silhouette. */
const COVER_R = 0.2;

/**
 * Fit score in 0..1 plus per-bone results for colouring. Each body part (core, each arm,
 * each leg) is scored separately and the worst part weighs heavily, so a fitting torso
 * can't carry a wrong arm. With `target` (silhouette walls) each part must also fill its
 * part of the hole, so a small pose can't hide inside a bigger silhouette.
 */
export function scoreFit(inside: (x: number, y: number) => boolean, samples: Sample[], target?: Sample[]) {
  const bones = new Float32Array(BONES.length).fill(1);
  const ok = [0, 0, 0, 0, 0, 0], all = [0, 0, 0, 0, 0, 0];
  let head = 1;
  for (const s of samples) {
    const ins = inside(s.x, s.y);
    const g = s.bone < 0 ? 5 : BONE_GROUP[s.bone];
    all[g]++;
    if (ins) ok[g]++;
    else if (s.bone >= 0) bones[s.bone] = 0;
    else head = 0;
  }
  const parts = all.map((n, i) => (n ? ok[i] / n : 1));
  if (target) {
    const cov = [0, 0, 0, 0, 0, 0], tot = [0, 0, 0, 0, 0, 0];
    const r2 = COVER_R * COVER_R;
    for (const t of target) {
      const g = t.bone < 0 ? 5 : BONE_GROUP[t.bone];
      tot[g]++;
      const covered = samples.some((s) => (s.bone < 0 ? 5 : BONE_GROUP[s.bone]) === g && (s.x - t.x) ** 2 + (s.y - t.y) ** 2 <= r2);
      if (covered) cov[g]++;
    }
    for (let i = 0; i < parts.length; i++) if (tot[i]) parts[i] = Math.min(parts[i], cov[i] / tot[i]);
  }
  // Squared so a half-right limb costs much more than a little wobble does.
  for (let i = 0; i < parts.length; i++) parts[i] *= parts[i];
  const mean = parts.reduce((a, b) => a + b, 0) / parts.length;
  return { score: 0.5 * mean + 0.5 * Math.min(...parts), bones, head };
}

const toU = (x: number) => (x + WALL_W / 2) * PX;
const toV = (y: number) => (WALL_H - y) * PX;

function distSeg(px: number, py: number, c: Capsule) {
  const dx = c.bx - c.ax, dy = c.by - c.ay;
  const l2 = dx * dx + dy * dy;
  const t = l2 > 0 ? Math.max(0, Math.min(1, ((px - c.ax) * dx + (py - c.ay) * dy) / l2)) : 0;
  return Math.hypot(px - (c.ax + dx * t), py - (c.ay + dy * t));
}

function shade(hex: string, k: number) {
  const c = new THREE.Color(hex);
  return `#${c.multiplyScalar(k).getHexString()}`;
}

export class Wall {
  readonly group = new THREE.Group();
  readonly def: WallDef;
  readonly target: Skeleton | null;
  private capsules: Capsule[] = [];
  private targetSamples?: Sample[];
  private openings: Rect[] = [];
  private canvas = document.createElement('canvas');
  private ctx: CanvasRenderingContext2D;
  private tex: THREE.CanvasTexture;
  private mats: THREE.MeshStandardMaterial[] = [];
  /** Seconds until the wall reaches the player's plane (z = 0). */
  timeToImpact: number;
  readonly travel: number;
  readonly speed: number;
  fitHistory: number[] = [];
  resolved: null | 'pass' | 'fail' = null;
  warned = false;

  constructor(def: WallDef, travel: number, spawnZ: number) {
    this.def = def;
    this.travel = travel;
    this.timeToImpact = travel;
    this.speed = -spawnZ / travel;
    this.target = def.silhouette ? targetSkeleton(def.kind) : null;
    if (this.target) {
      this.capsules = holeCapsules(this.target);
      this.targetSamples = sampleBody(this.target);
    }
    this.openings = def.openings ?? [];

    this.canvas.width = CW;
    this.canvas.height = CH;
    this.ctx = this.canvas.getContext('2d')!;
    this.paint();
    this.tex = new THREE.CanvasTexture(this.canvas);
    this.tex.colorSpace = THREE.SRGBColorSpace;
    this.tex.anisotropy = 4;
    this.build();
    this.group.position.z = spawnZ;
  }

  /** Is a point (wall-plane metres) inside the opening? */
  inside(x: number, y: number): boolean {
    return this.target ? inCapsules(this.capsules, x, y) : inRects(this.openings, x, y);
  }

  /** Fit score for the current body samples (see scoreFit). */
  fit(samples: Sample[]) {
    return scoreFit((x, y) => this.inside(x, y), samples, this.targetSamples);
  }

  private paint() {
    const g = this.ctx, col = this.def.color;
    const grad = g.createLinearGradient(0, 0, 0, CH);
    grad.addColorStop(0, shade(col, 1.08));
    grad.addColorStop(1, shade(col, 0.72));
    g.fillStyle = grad;
    g.fillRect(0, 0, CW, CH);
    // Foam-block texture: soft polka dots and panel seams.
    g.fillStyle = 'rgba(255,255,255,0.13)';
    for (let y = 18; y < CH; y += 44) {
      for (let x = (y / 44) % 2 ? 40 : 18; x < CW; x += 44) {
        g.beginPath();
        g.arc(x, y, 7, 0, Math.PI * 2);
        g.fill();
      }
    }
    g.strokeStyle = 'rgba(0,0,0,0.14)';
    g.lineWidth = 4;
    for (let x = CW / 4; x < CW; x += CW / 4) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, CH); g.stroke(); }

    if (this.target) {
      // Glow rim, then cut the silhouette out.
      g.lineCap = g.lineJoin = 'round';
      const stroke = (extra: number, style: string) => {
        g.strokeStyle = style;
        g.fillStyle = style;
        for (const c of this.capsules) {
          if (c.ax === c.bx && c.ay === c.by) {
            g.beginPath();
            g.arc(toU(c.ax), toV(c.ay), c.r * PX + extra, 0, Math.PI * 2);
            g.fill();
          } else {
            g.lineWidth = c.r * 2 * PX + extra * 2;
            g.beginPath();
            g.moveTo(toU(c.ax), toV(c.ay));
            g.lineTo(toU(c.bx), toV(c.by));
            g.stroke();
          }
        }
      };
      stroke(16, 'rgba(255,255,255,0.35)');
      stroke(7, '#ffffff');
      g.globalCompositeOperation = 'destination-out';
      stroke(0, '#000');
      g.globalCompositeOperation = 'source-over';
    } else {
      this.paintBarrier();
    }
  }

  /** Barrier walls: rectangular cut-outs with hazard-striped edges and the callout painted on. */
  private paintBarrier() {
    const g = this.ctx;
    const stripes = (x0: number, x1: number, y: number, up: boolean) => {
      g.save();
      g.beginPath();
      g.rect(x0 - 14, up ? y - 26 : y, x1 - x0 + 28, 26);
      g.clip();
      g.fillStyle = '#111';
      for (let x = x0 - 40; x < x1 + 40; x += 36) {
        g.beginPath();
        g.moveTo(x, y - 30); g.lineTo(x + 18, y - 30); g.lineTo(x - 2, y + 30); g.lineTo(x - 20, y + 30);
        g.fill();
      }
      g.restore();
    };
    for (const r of this.openings) {
      const x0 = toU(r.x0), x1 = toU(r.x1);
      // Stripe the solid edge just above / below the opening, where it isn't the wall boundary.
      if (r.y1 < WALL_H) stripes(x0, x1, toV(r.y1), true);
      if (r.y0 > 0) stripes(x0, x1, toV(r.y0), false);
    }
    g.fillStyle = '#ffffff';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    // Label goes in the biggest solid band: above a floor-level opening, else on the low bar.
    const floorOpen = this.openings.find((r) => r.y0 <= 0);
    if (floorOpen) {
      const top = toV(floorOpen.y1);
      g.font = `900 ${Math.min(120, top * 0.6)}px "Arial Black", Impact, sans-serif`;
      g.fillText(this.def.label, CW / 2, top / 2, CW * 0.9);
    }
    g.globalCompositeOperation = 'destination-out';
    for (const r of this.openings) g.fillRect(toU(r.x0), toV(r.y1), (r.x1 - r.x0) * PX, (r.y1 - r.y0) * PX);
    g.globalCompositeOperation = 'source-over';
    if (!floorOpen) {
      const bar = Math.min(...this.openings.map((r) => r.y0));
      const word = this.def.label.replace(/!$/, '');
      g.font = '900 34px "Arial Black", Impact, sans-serif';
      g.fillText(`▲ ${word} ▲   ▲ ${word} ▲   ▲ ${word} ▲`, CW / 2, (toV(bar) + CH) / 2);
    }
  }

  private build() {
    const mk = () => {
      const m = new THREE.MeshPhysicalMaterial({
        map: this.tex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.45,
        clearcoat: 0.6, clearcoatRoughness: 0.3,
        emissive: '#ffffff', emissiveMap: this.tex, emissiveIntensity: 0.12, transparent: true,
      });
      this.mats.push(m);
      return m;
    };
    const plane = new THREE.PlaneGeometry(WALL_W, WALL_H);
    const front = new THREE.Mesh(plane, mk());
    const back = new THREE.Mesh(plane, mk());
    front.position.set(0, WALL_H / 2, -THICK / 2);
    back.position.set(0, WALL_H / 2, THICK / 2);
    front.castShadow = back.castShadow = true;
    this.group.add(front, back);

    // Frame posts and beam give the portal some heft.
    const frameMat = new THREE.MeshStandardMaterial({ color: shade(this.def.color, 0.45), metalness: 0.6, roughness: 0.35, transparent: true });
    this.mats.push(frameMat);
    const post = new THREE.BoxGeometry(0.22, WALL_H + 0.2, THICK + 0.1);
    for (const s of [-1, 1]) {
      const p = new THREE.Mesh(post, frameMat);
      p.position.set(s * (WALL_W / 2 + 0.11), (WALL_H + 0.2) / 2, 0);
      p.castShadow = true;
      this.group.add(p);
    }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(WALL_W + 0.44, 0.2, THICK + 0.1), frameMat);
    beam.position.y = WALL_H + 0.1;
    this.group.add(beam);
    // Neon strip on the beam in the wall colour.
    const neon = new THREE.Mesh(
      new THREE.BoxGeometry(WALL_W + 0.3, 0.05, 0.02),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(this.def.color).multiplyScalar(2.2), transparent: true }),
    );
    neon.position.set(0, WALL_H + 0.1, THICK / 2 + 0.06);
    this.mats.push(neon.material as unknown as THREE.MeshStandardMaterial);
    this.group.add(neon);
  }

  /** Paint goo where the body hit the wall. */
  splat(samples: Sample[]) {
    const g = this.ctx;
    g.fillStyle = 'rgba(40, 255, 120, 0.92)';
    let n = 0;
    for (const s of samples) {
      if (this.inside(s.x, s.y) || n++ % 2) continue;
      const u = toU(s.x), v = toV(s.y);
      for (let k = 0; k < 3; k++) {
        g.beginPath();
        g.arc(u + (Math.random() - 0.5) * 40, v + (Math.random() - 0.5) * 40, 6 + Math.random() * 16, 0, Math.PI * 2);
        g.fill();
      }
      // Drips
      g.fillRect(u - 3, v, 6, 20 + Math.random() * 50);
    }
    this.tex.needsUpdate = true;
  }

  setOpacity(o: number) {
    for (const m of this.mats) {
      m.opacity = o;
      m.depthWrite = o > 0.9;
    }
  }

  dispose() {
    this.tex.dispose();
    for (const m of this.mats) m.dispose();
    this.group.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
  }
}

/** Small silhouette icon of a wall, for the HUD "next up" preview. */
export function wallIcon(wall: Wall, size = 96): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const s = size / 2.9;
  const u = (x: number) => size / 2 + x * s;
  const v = (y: number) => size - 4 - y * s;
  g.fillStyle = wall.def.color;
  g.fillRect(0, 0, size, size);
  g.fillStyle = '#0b0820';
  g.strokeStyle = '#0b0820';
  g.lineCap = 'round';
  if (wall.target) {
    for (const [a, b] of BONES) {
      g.lineWidth = (a === 'pelvis' && b === 'neck' ? 0.22 : 0.13) * s * 2;
      g.beginPath();
      g.moveTo(u(wall.target[a].x), v(wall.target[a].y));
      g.lineTo(u(wall.target[b].x), v(wall.target[b].y));
      g.stroke();
    }
    g.beginPath();
    g.arc(u(wall.target.head.x), v(wall.target.head.y), (L.headR + 0.06) * s, 0, Math.PI * 2);
    g.fill();
  } else {
    for (const r of wall.def.openings ?? []) {
      const x0 = Math.max(0, u(r.x0)), x1 = Math.min(size, u(r.x1));
      const y0 = r.y1 >= WALL_H ? 0 : v(r.y1), y1 = r.y0 <= 0 ? size : v(r.y0);
      g.fillRect(x0, y0, x1 - x0, y1 - y0);
    }
  }
  return c;
}
