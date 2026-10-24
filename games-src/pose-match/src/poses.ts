import { Vector3 } from 'three';
import { limb, PoseDirs, Skeleton, solveSkeleton, standingDirs } from './skeleton';

export type WallKind =
  | 'armsUp' | 'armsDown' | 'leftUp' | 'rightUp' | 'wide' | 'tpose' | 'duck' | 'jump'
  | 'flex' | 'scarecrow' | 'star' | 'handsHead' | 'squat'
  | 'discoL' | 'discoR' | 'stretchL' | 'stretchR' | 'flamingoL' | 'flamingoR';

/** Axis-aligned opening in the wall plane (metres; x across, y up from the floor). */
export interface Rect { x0: number; x1: number; y0: number; y1: number }

export interface WallDef {
  kind: WallKind;
  label: string;
  /** Spoken callout (plain text; audio.say speaks it). */
  voice: string;
  color: string;
  /** Silhouette walls have a target pose; barrier walls use rectangle openings. */
  silhouette: boolean;
  /** Barrier openings (only for non-silhouette walls). */
  openings?: Rect[];
  /** Judged on the best moment rather than the average (jumps can't be held). */
  peak?: boolean;
  /** Difficulty tier: only spawned once the player's score is high enough (see TIER_SCORE). */
  tier: 1 | 2 | 3;
}

/** Opening sizes for barrier walls (metres). */
export const DUCK_TOP = 1.3;
export const DUCK_HALF_W = 1.3;
export const JUMP_BAR = 0.22;
export const SQUAT_TOP = 0.95;
export const SQUAT_HALF_W = 0.9;

const def = (kind: WallKind, label: string, voice: string, color: string, tier: 1 | 2 | 3, extra: Partial<WallDef> = {}): WallDef =>
  ({ kind, label, voice, color, tier, silhouette: true, ...extra });

export const WALLS: Record<WallKind, WallDef> = {
  armsUp: def('armsUp', 'ARMS UP!', 'Arms up!', '#ff3d8b', 1),
  armsDown: def('armsDown', 'ARMS DOWN!', 'Arms down!', '#ff8a1f', 1),
  leftUp: def('leftUp', 'LEFT ARM UP!', 'Left arm up!', '#9b4dff', 1),
  rightUp: def('rightUp', 'RIGHT ARM UP!', 'Right arm up!', '#2ad0c4', 1),
  wide: def('wide', 'GO WIDE!', 'Go wide!', '#ffd02a', 1),
  tpose: def('tpose', 'ARMS OUT!', 'Arms out!', '#3d8bff', 1),
  duck: def('duck', 'DUCK!', 'Duck!', '#ff4f3d', 1, {
    silhouette: false, openings: [{ x0: -DUCK_HALF_W, x1: DUCK_HALF_W, y0: 0, y1: DUCK_TOP }],
  }),
  jump: def('jump', 'JUMP!', 'Jump!', '#5ee34a', 1, {
    silhouette: false, peak: true, openings: [{ x0: -2.3, x1: 2.3, y0: JUMP_BAR, y1: 2.7 }],
  }),
  flex: def('flex', 'FLEX!', 'Flex those muscles!', '#ff5fd2', 2),
  scarecrow: def('scarecrow', 'SCARECROW!', 'Scarecrow!', '#00e0a4', 2),
  star: def('star', 'STAR!', 'Be a star!', '#ffb800', 2),
  handsHead: def('handsHead', 'HANDS ON HEAD!', 'Hands on head!', '#7a6bff', 2),
  squat: def('squat', 'LOW SQUAT!', 'Get low!', '#ff6a00', 2, {
    silhouette: false, openings: [{ x0: -SQUAT_HALF_W, x1: SQUAT_HALF_W, y0: 0, y1: SQUAT_TOP }],
  }),
  discoL: def('discoL', 'DISCO LEFT!', 'Disco left!', '#e83cff', 3),
  discoR: def('discoR', 'DISCO RIGHT!', 'Disco right!', '#3cc8ff', 3),
  stretchL: def('stretchL', 'LEAN LEFT!', 'Lean left!', '#a8ff3c', 3),
  stretchR: def('stretchR', 'LEAN RIGHT!', 'Lean right!', '#ff3c6e', 3),
  flamingoL: def('flamingoL', 'LEFT KNEE OUT!', 'Left knee out!', '#ff9ec7', 3),
  flamingoR: def('flamingoR', 'RIGHT KNEE OUT!', 'Right knee out!', '#9effe0', 3),
};

/** Wall number at which each tier starts appearing. */
export const TIER_SCORE = { 1: 0, 2: 300, 3: 800 } as const;

/** Speed level shown in the HUD: goes up every LEVEL_POINTS. */
export const LEVEL_POINTS = 500;

/**
 * Difficulty from score: walls travel faster and arrive closer together as points go up.
 * travel = seconds from spawn to impact, gap = pause before the next wall.
 */
export function difficulty(score: number) {
  const steps = score / 100;
  return {
    level: Math.floor(score / LEVEL_POINTS) + 1,
    travel: Math.max(1.35, 4.8 * Math.pow(0.95, steps)),
    gap: Math.max(0.25, 1.1 * Math.pow(0.93, steps)),
  };
}

/** Keyboard help line for the HUD. */
export const KEY_HELP = [
  '← → ↑ arms', 'T out', 'W wide', 'F flex', 'R scarecrow', 'S star', 'H hands on head',
  'Q/E disco', 'A/D lean', 'Z/C knee out', '↓ duck', 'X squat', 'Space jump',
].join(' · ');

const jit = (amt: number) => (Math.random() * 2 - 1) * amt;

type Side = -1 | 1;
function arm(d: PoseDirs, side: Side, upper: number, fore: number) {
  if (side === -1) { d.lUpperArm = limb(-1, upper); d.lForearm = limb(-1, fore); }
  else { d.rUpperArm = limb(1, upper); d.rForearm = limb(1, fore); }
}
function leg(d: PoseDirs, side: Side, thigh: number, shin: number) {
  if (side === -1) { d.lThigh = limb(-1, thigh); d.lShin = limb(-1, shin); }
  else { d.rThigh = limb(1, thigh); d.rShin = limb(1, shin); }
}
const armsUp = (d: PoseDirs, side: Side, j: number) => arm(d, side, 160 + j, 168 + j);
/** Tilt the spine and head sideways toward `side`. */
function lean(d: PoseDirs, side: Side, deg: number) {
  d.spine = limb(side, 180 - deg);
  d.head = limb(side, 180 - deg * 1.2);
}

/**
 * Target pose for a silhouette wall. `j` scales the random variety
 * (0 = the canonical pose, used by keyboard mode).
 */
export function targetDirs(kind: WallKind, j = 1): PoseDirs {
  const d = standingDirs();
  const r = (amt: number) => jit(amt * j);
  switch (kind) {
    case 'armsUp': armsUp(d, -1, r(6)); armsUp(d, 1, r(6)); break;
    case 'armsDown': { const a = 22 + r(4); arm(d, -1, a, a - 4); arm(d, 1, a, a - 4); break; }
    case 'leftUp': armsUp(d, -1, r(6)); break;
    case 'rightUp': armsUp(d, 1, r(6)); break;
    case 'wide': {
      const legs = 24 + r(4), arms = 42 + r(8);
      leg(d, -1, legs, legs); leg(d, 1, legs, legs);
      arm(d, -1, arms, arms + 4); arm(d, 1, arms, arms + 4);
      break;
    }
    case 'tpose': { const a = 90 + r(8); arm(d, -1, a, a); arm(d, 1, a, a); break; }
    // Elbows at shoulder height, forearms up (double biceps).
    case 'flex': { const a = 92 + r(5); arm(d, -1, a, 178); arm(d, 1, a, 178); break; }
    // Elbows out at shoulder height, forearms hanging straight down.
    case 'scarecrow': { const a = 90 + r(5); arm(d, -1, a, 3); arm(d, 1, a, 3); break; }
    case 'star': {
      const a = 132 + r(5), legs = 24 + r(3);
      arm(d, -1, a, a); arm(d, 1, a, a);
      leg(d, -1, legs, legs); leg(d, 1, legs, legs);
      break;
    }
    // Elbows out and up, hands meeting on top of the head.
    case 'handsHead': arm(d, -1, 145, 250); arm(d, 1, 145, 250); break;
    // One arm up diagonally, the other down diagonally.
    case 'discoL': arm(d, -1, 140 + r(5), 140); arm(d, 1, 38 + r(5), 38); break;
    case 'discoR': arm(d, 1, 140 + r(5), 140); arm(d, -1, 38 + r(5), 38); break;
    // Side stretch: lean one way, the opposite arm arcs over the head.
    case 'stretchL': case 'stretchR': {
      const s: Side = kind === 'stretchL' ? -1 : 1;
      lean(d, s, 22 + r(3));
      arm(d, (-s) as Side, 160, 215);
      arm(d, s, 12, 8);
      break;
    }
    // Knee raised out to the side, arms out for balance.
    case 'flamingoL': case 'flamingoR': {
      const s: Side = kind === 'flamingoL' ? -1 : 1;
      leg(d, s, 55 + r(4), 12);
      arm(d, -1, 75, 75); arm(d, 1, 75, 75);
      break;
    }
    default: break;
  }
  return d;
}

export function targetSkeleton(kind: WallKind, j = 1): Skeleton {
  return solveSkeleton(targetDirs(kind, j), 0);
}

// ---------------------------------------------------------------- keyboard pose source

const lerpDir = (a: Vector3, b: Vector3, t: number) => a.lerp(b, t).normalize();

/** Letter keys that hold a whole silhouette pose. */
const POSE_KEYS: Record<string, WallKind> = {
  KeyF: 'flex', KeyR: 'scarecrow', KeyS: 'star', KeyH: 'handsHead',
  KeyQ: 'discoL', KeyE: 'discoR', KeyA: 'stretchL', KeyD: 'stretchR', KeyZ: 'flamingoL', KeyC: 'flamingoR',
};

/** Keys that strike each wall's pose (jump walls also need a Space tap). Used by the CPU player. */
export const KIND_KEYS: Record<string, string[]> = {
  armsUp: ['ArrowUp'], armsDown: [], leftUp: ['ArrowLeft'], rightUp: ['ArrowRight'], wide: ['KeyW'], tpose: ['KeyT'],
  duck: ['ArrowDown'], jump: [], squat: ['KeyX'],
  ...Object.fromEntries(Object.entries(POSE_KEYS).map(([k, kind]) => [kind, [k]])),
};

/**
 * Keyboard stand-in for the camera, so the game is playable (and testable) anywhere.
 *   ←/→ raise left/right arm   ↑ both arms up   T arms out   W wide stance
 *   F R S H Q E A D Z C  hold a silhouette pose (POSE_KEYS)
 *   ↓ duck (hold)   X deep squat (hold)   Space jump
 */
export class KeyboardPose {
  private keys = new Set<string>();
  private dirs = standingDirs();
  private lift = 0;
  private jumpT = -1;
  private skel = solveSkeleton(this.dirs, 0);

  /** @param listen false for a pose driven by code (CPU opponent) instead of the keyboard. */
  constructor(listen = true) {
    if (!listen) return;
    addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !this.keys.has('Space') && this.jumpT < 0) this.jumpT = 0;
      this.keys.add(e.code);
    });
    addEventListener('keyup', (e) => this.keys.delete(e.code));
    addEventListener('blur', () => this.keys.clear());
  }

  /** Hold exactly these keys (code-driven poses). */
  hold(codes: string[]) {
    this.keys = new Set(codes);
  }

  jump() {
    if (this.jumpT < 0) this.jumpT = 0;
  }

  update(dt: number): Skeleton {
    const k = this.keys;
    const poseKey = Object.keys(POSE_KEYS).find((c) => k.has(c));
    const target = poseKey ? targetDirs(POSE_KEYS[poseKey], 0) : standingDirs();
    const both = k.has('ArrowUp');
    if (both || k.has('ArrowLeft')) armsUp(target, -1, 0);
    if (both || k.has('ArrowRight')) armsUp(target, 1, 0);
    if (k.has('KeyT')) { arm(target, -1, 90, 90); arm(target, 1, 90, 90); }
    if (k.has('KeyW')) {
      leg(target, -1, 24, 24); leg(target, 1, 24, 24);
      if (!both && !k.has('ArrowLeft') && !k.has('ArrowRight') && !k.has('KeyT')) {
        arm(target, -1, 42, 46); arm(target, 1, 42, 46);
      }
    }
    let liftTarget = 0;
    const squat = k.has('KeyX');
    if (k.has('ArrowDown') || squat) {
      const bend = squat ? 1.1 : 0.75;
      target.spine = new Vector3(0, Math.cos(bend), -Math.sin(bend));
      target.head = new Vector3(0, 0.6, -0.8).normalize();
      target.lUpperArm = new Vector3(-0.3, -0.6, -0.75).normalize();
      target.rUpperArm = new Vector3(0.3, -0.6, -0.75).normalize();
      liftTarget = squat ? -0.8 : -0.5;
    }
    if (this.jumpT >= 0) {
      this.jumpT += dt;
      const p = this.jumpT / 0.65;
      liftTarget = p < 1 ? 0.08 + Math.sin(p * Math.PI) * 0.26 : 0;
      if (p >= 1) this.jumpT = -1;
    }

    const t = 1 - Math.exp(-dt * 16);
    for (const key of Object.keys(this.dirs) as (keyof PoseDirs)[]) lerpDir(this.dirs[key], target[key], t);
    this.lift += (liftTarget - this.lift) * (this.jumpT >= 0 ? 1 : t);
    return solveSkeleton(this.dirs, this.lift, this.skel);
  }
}
