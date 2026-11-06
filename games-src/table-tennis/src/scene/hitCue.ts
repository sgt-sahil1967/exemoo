/**
 * Hit cues — the visual half of the accessible hitting mechanic (see game/hitTiming.ts).
 *
 *  - Timing ring: a camera-facing ring around the ball that shrinks onto it as the ball arrives.
 *    White while you wait, GREEN when it's time to swing, red once it's too late. Sprites face every
 *    camera, so it works in 2-player split screen as well.
 *  - Landing marker: where the incoming ball will bounce on your half (pulsing ring on the table).
 *  - Aim pads: three pads (left / middle / right) on the far half; the lit one is where your shot goes.
 */
import {
  AdditiveBlending,
  CanvasTexture,
  CircleGeometry,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  RingGeometry,
  Sprite,
  SpriteMaterial,
  Vector3,
} from 'three';
import { PALETTE, TABLE, type Side } from '../core/contracts';

export type CueState = 'wait' | 'swing' | 'late' | 'armed';

export interface HitCue {
  /** Ball position (world). */
  ball: Vector3;
  /** 0 → ring wide open, 1 → ring closed on the ball (= swing now). */
  fill: number;
  state: CueState;
  /** Where the incoming ball will bounce on this side (null once it has bounced). */
  landing: Vector3 | null;
  /** World positions of the three aim pads (left, middle, right from the hitter's view) and the lit one. */
  pads: [Vector3, Vector3, Vector3] | null;
  zone: -1 | 0 | 1;
}

const STATE_COLOR: Record<CueState, string> = {
  wait: '#ffffff',
  swing: PALETTE.good,
  armed: PALETTE.gold,
  late: PALETTE.danger,
};
const SIDE_COLOR: Record<Side, string> = { player: PALETTE.accent, opponent: PALETTE.accent2 };

function ringTexture(width: number): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  g.strokeStyle = '#fff';
  g.lineWidth = width;
  g.beginPath();
  g.arc(64, 64, 64 - width / 2 - 2, 0, Math.PI * 2);
  g.stroke();
  const t = new CanvasTexture(c);
  return t;
}

function glowTexture(): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(64, 64, 8, 64, 64, 62);
  grd.addColorStop(0, 'rgba(255,255,255,0.9)');
  grd.addColorStop(0.45, 'rgba(255,255,255,0.35)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  return new CanvasTexture(c);
}

/** Size of the target ring (world metres) — the approach ring closes onto this. */
const BASE = 0.16;
const OPEN = 4.2; // approach ring starts at BASE × OPEN
const PAD_R = 0.17;

class SideCue {
  readonly group = new Group();
  private target: Sprite;
  private approach: Sprite;
  private glow: Sprite;
  private landing: Mesh;
  private pads: Mesh[] = [];
  private t = 0;
  private cur: HitCue | null = null;
  private pop = 0;

  constructor(
    private side: Side,
    tex: { thin: CanvasTexture; thick: CanvasTexture; glow: CanvasTexture },
  ) {
    const sprite = (map: CanvasTexture, order: number) => {
      const s = new Sprite(new SpriteMaterial({ map, transparent: true, depthTest: false, depthWrite: false, toneMapped: false }));
      s.renderOrder = order;
      return s;
    };
    this.glow = sprite(tex.glow, 20);
    (this.glow.material as SpriteMaterial).blending = AdditiveBlending;
    this.target = sprite(tex.thin, 21);
    this.approach = sprite(tex.thick, 22);
    this.group.add(this.glow, this.target, this.approach);

    const flat = (geo: RingGeometry | CircleGeometry, color: string, opacity: number) => {
      const m = new Mesh(geo, new MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, toneMapped: false }));
      m.rotation.x = -Math.PI / 2;
      m.renderOrder = 4;
      return m;
    };
    this.landing = flat(new RingGeometry(0.055, 0.085, 40), SIDE_COLOR[side], 0.85);
    this.group.add(this.landing);
    for (let i = 0; i < 3; i++) {
      const pad = flat(new CircleGeometry(PAD_R, 40), SIDE_COLOR[side], 0.12);
      const rim = flat(new RingGeometry(PAD_R - 0.018, PAD_R, 48), '#ffffff', 0.5);
      rim.rotation.x = 0;
      rim.position.z = 0.001;
      pad.add(rim);
      this.pads.push(pad);
      this.group.add(pad);
    }
    this.group.visible = false;
  }

  set(cue: HitCue | null) {
    if (cue && !this.cur) this.pop = 0;
    this.cur = cue;
  }

  update(dt: number) {
    this.t += dt;
    const c = this.cur;
    this.group.visible = !!c;
    if (!c) return;
    this.pop = Math.min(1, this.pop + dt * 5);
    const col = new Color(STATE_COLOR[c.state]);
    const f = Math.max(0, Math.min(1, c.fill));
    // ring
    for (const s of [this.target, this.approach, this.glow]) s.position.copy(c.ball);
    const closing = c.state === 'wait' ? f : 1;
    const ra = BASE * (1 + (OPEN - 1) * (1 - closing) * (1 - closing * 0.15));
    this.approach.scale.setScalar(ra * (0.6 + 0.4 * this.pop));
    (this.approach.material as SpriteMaterial).color.copy(col);
    (this.approach.material as SpriteMaterial).opacity = c.state === 'late' ? 0.55 : 0.4 + 0.6 * f;
    const beat = c.state === 'swing' ? 1 + 0.12 * Math.sin(this.t * 30) : 1;
    this.target.scale.setScalar(BASE * beat);
    (this.target.material as SpriteMaterial).color.copy(c.state === 'wait' ? new Color(SIDE_COLOR[this.side]) : col);
    (this.target.material as SpriteMaterial).opacity = 0.9;
    this.glow.visible = c.state === 'swing' || c.state === 'armed';
    this.glow.scale.setScalar(BASE * 2.1 * beat);
    (this.glow.material as SpriteMaterial).color.copy(col);
    (this.glow.material as SpriteMaterial).opacity = 0.7;
    // landing marker
    this.landing.visible = !!c.landing;
    if (c.landing) {
      this.landing.position.set(c.landing.x, TABLE.height + 0.004, c.landing.z);
      this.landing.scale.setScalar(1 + 0.18 * Math.sin(this.t * 9));
    }
    // aim pads
    const showPads = !!c.pads;
    this.pads.forEach((p, i) => {
      p.visible = showPads;
      if (!c.pads) return;
      p.position.set(c.pads[i].x, TABLE.height + 0.003, c.pads[i].z);
      const lit = i - 1 === c.zone;
      (p.material as MeshBasicMaterial).opacity = lit ? 0.55 + 0.1 * Math.sin(this.t * 6) : 0.1;
      p.scale.setScalar(lit ? 1.08 : 0.9);
    });
  }
}

export class HitCues {
  readonly group = new Group();
  private sides: Record<Side, SideCue>;

  constructor() {
    const tex = { thin: ringTexture(9), thick: ringTexture(14), glow: glowTexture() };
    this.sides = { player: new SideCue('player', tex), opponent: new SideCue('opponent', tex) };
    this.group.add(this.sides.player.group, this.sides.opponent.group);
  }

  set(side: Side, cue: HitCue | null) {
    this.sides[side].set(cue);
  }

  update(dt: number) {
    this.sides.player.update(dt);
    this.sides.opponent.update(dt);
  }
}
