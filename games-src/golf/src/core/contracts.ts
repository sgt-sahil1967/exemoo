/**
 * BIRDIE — shared contracts (Wii-Sports-style golf with a phone as the club).
 *
 * Every module (course, physics, input, controller, scene, UI, audio, game) builds against the
 * types and constants in this file. Do not change a signature here without updating every
 * implementer. Adding optional fields is fine.
 *
 * World frame (metres, seconds, radians), right-handed, Y up.
 *   - Each hole has its OWN local frame. The tee is at x≈0, z≈0. Holes generally play toward −Z
 *     (forward = −Z), and may dogleg left (−X) or right (+X).
 *   - "Yaw" is the rotation about +Y. yaw = 0 faces −Z. Positive yaw turns LEFT (counter-clockwise
 *     seen from above), so the forward unit vector for yaw θ is (−sin θ, 0, −cos θ).
 *   - Distances shown to the player are in YARDS (1 yd = 0.9144 m), like Wii Sports.
 */
import type { Vector3 } from 'three';

// ───────────────────────────────── Units / constants ─────────────────────────────────
export const YARD = 0.9144;
export const toYards = (m: number) => m / YARD;
export const GRAVITY = 9.81;

export const BALL = {
  radius: 0.02135,
  mass: 0.04593,
} as const;

/** Cup (hole) radius in metres (4.25 in diameter). */
export const CUP_RADIUS = 0.054;

/** forward unit vector for a yaw (see frame notes above). */
export function yawForward(yaw: number, out: { x: number; y: number; z: number }) {
  out.x = -Math.sin(yaw);
  out.y = 0;
  out.z = -Math.cos(yaw);
  return out;
}
/** yaw that faces from a to b (xz only). */
export function yawTo(ax: number, az: number, bx: number, bz: number): number {
  return Math.atan2(-(bx - ax), -(bz - az));
}

// ───────────────────────────────────── Surfaces ──────────────────────────────────────
export type Surface =
  | 'tee'
  | 'fairway'
  | 'fringe'
  | 'green'
  | 'rough'
  | 'deepRough'
  | 'sand'
  | 'water'
  | 'path'
  | 'ob';

export interface SurfaceProps {
  /** Coefficient of restitution for the normal component of a landing. */
  bounce: number;
  /** Tangential velocity kept on impact (0…1). */
  impactFriction: number;
  /** Rolling deceleration, m/s². */
  rollDecel: number;
  /** Multiplier on shot distance when hitting FROM this lie. */
  lieDistance: number;
  /** Extra random direction error (radians, 1σ) when hitting FROM this lie. */
  lieError: number;
  /** Display name. */
  label: string;
  /** Base colour used by scene + minimap. */
  color: string;
}

export const SURFACES: Record<Surface, SurfaceProps> = {
  tee: { bounce: 0.32, impactFriction: 0.72, rollDecel: 1.4, lieDistance: 1.0, lieError: 0, label: 'Tee', color: '#7fcf5a' },
  fairway: { bounce: 0.3, impactFriction: 0.7, rollDecel: 1.25, lieDistance: 1.0, lieError: 0.004, label: 'Fairway', color: '#72c450' },
  fringe: { bounce: 0.25, impactFriction: 0.66, rollDecel: 1.5, lieDistance: 0.98, lieError: 0.005, label: 'Fringe', color: '#63bb4a' },
  green: { bounce: 0.2, impactFriction: 0.6, rollDecel: 0.62, lieDistance: 1.0, lieError: 0, label: 'Green', color: '#86d65e' },
  rough: { bounce: 0.18, impactFriction: 0.45, rollDecel: 3.6, lieDistance: 0.82, lieError: 0.02, label: 'Rough', color: '#4f9d3a' },
  deepRough: { bounce: 0.12, impactFriction: 0.3, rollDecel: 6, lieDistance: 0.62, lieError: 0.04, label: 'Deep Rough', color: '#3f8530' },
  sand: { bounce: 0.06, impactFriction: 0.18, rollDecel: 9, lieDistance: 0.6, lieError: 0.03, label: 'Bunker', color: '#f2dc9b' },
  water: { bounce: 0, impactFriction: 0, rollDecel: 99, lieDistance: 0, lieError: 0, label: 'Water', color: '#3fa7e0' },
  path: { bounce: 0.5, impactFriction: 0.85, rollDecel: 0.9, lieDistance: 0.95, lieError: 0.01, label: 'Path', color: '#d9cdb4' },
  ob: { bounce: 0.15, impactFriction: 0.4, rollDecel: 4, lieDistance: 0, lieError: 0, label: 'Out of Bounds', color: '#3a7a2c' },
};

// ─────────────────────────────────────── Clubs ───────────────────────────────────────
export type ClubId = '1W' | '3W' | '5W' | '4I' | '5I' | '6I' | '7I' | '8I' | '9I' | 'PW' | 'SW' | 'PT';

export interface Club {
  id: ClubId;
  name: string;
  /** Loft, degrees (putter ≈ 3). */
  loft: number;
  /** Typical full-power carry on flat ground with no wind, YARDS. */
  carryYards: number;
  /** Ball speed at 100% power, m/s (physics owns the exact tuning; this is the reference). */
  ballSpeed: number;
  /** Backspin at 100% power, rpm. */
  spinRpm: number;
  kind: 'wood' | 'iron' | 'wedge' | 'putter';
}

/** Order = bag order (longest first). Physics may fine-tune ballSpeed so carryYards is accurate. */
export const CLUBS: readonly Club[] = [
  { id: '1W', name: 'Driver', loft: 10.5, carryYards: 245, ballSpeed: 70, spinRpm: 2700, kind: 'wood' },
  { id: '3W', name: '3 Wood', loft: 15, carryYards: 220, ballSpeed: 65, spinRpm: 3600, kind: 'wood' },
  { id: '5W', name: '5 Wood', loft: 18, carryYards: 205, ballSpeed: 62, spinRpm: 4300, kind: 'wood' },
  { id: '4I', name: '4 Iron', loft: 22, carryYards: 185, ballSpeed: 58, spinRpm: 4800, kind: 'iron' },
  { id: '5I', name: '5 Iron', loft: 25, carryYards: 175, ballSpeed: 56, spinRpm: 5300, kind: 'iron' },
  { id: '6I', name: '6 Iron', loft: 28, carryYards: 165, ballSpeed: 54, spinRpm: 6200, kind: 'iron' },
  { id: '7I', name: '7 Iron', loft: 32, carryYards: 152, ballSpeed: 51, spinRpm: 7000, kind: 'iron' },
  { id: '8I', name: '8 Iron', loft: 36, carryYards: 140, ballSpeed: 48, spinRpm: 7900, kind: 'iron' },
  { id: '9I', name: '9 Iron', loft: 41, carryYards: 128, ballSpeed: 45, spinRpm: 8600, kind: 'iron' },
  { id: 'PW', name: 'Pitching Wedge', loft: 46, carryYards: 112, ballSpeed: 42, spinRpm: 9300, kind: 'wedge' },
  { id: 'SW', name: 'Sand Wedge', loft: 56, carryYards: 85, ballSpeed: 36, spinRpm: 10000, kind: 'wedge' },
  { id: 'PT', name: 'Putter', loft: 3, carryYards: 0, ballSpeed: 8, spinRpm: 0, kind: 'putter' },
];
export const clubById = (id: ClubId) => CLUBS.find((c) => c.id === id)!;

// ─────────────────────────────────────── Wind ────────────────────────────────────────
export interface Wind {
  /** Direction the wind blows TOWARD, as a yaw (see frame notes). */
  yaw: number;
  /** m/s (0…10). Displayed as m/s or mph by the UI. */
  speed: number;
}

// ───────────────────────────────────── Course / holes ────────────────────────────────
/** src/course — static description, authored per hole (pure data + generators). */
export interface HoleDef {
  /** 1-based number on the course. */
  number: number;
  name: string;
  par: 3 | 4 | 5;
  /** 'beginner' | 'intermediate' | 'expert' — Wii Sports style 3-hole groups. */
  tier: 'beginner' | 'intermediate' | 'expert';
}

export interface Tree {
  pos: Vector3; // base of trunk on the ground
  /** Collision radius of the canopy (m). Trunk radius ≈ 0.25. */
  radius: number;
  height: number;
  kind: 'round' | 'pine' | 'palm';
}

/** Runtime hole: everything physics, scene, UI and game need to play it. src/course/hole.ts */
export interface Hole {
  readonly def: HoleDef;
  /** Tee ball position (on the ground at the tee). */
  readonly tee: Vector3;
  /** Cup centre on the green surface. */
  readonly pin: Vector3;
  /** Approx green centre & radius (for cameras / putting mode). */
  readonly greenCenter: Vector3;
  readonly greenRadius: number;
  /** Playable/visible terrain rectangle. Outside = ob. */
  readonly bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  /** Centre line from tee to pin (for default aim, cameras, flyover, minimap). */
  readonly centerline: readonly Vector3[];
  readonly trees: readonly Tree[];
  /** Water surface height if the hole has water, else null. */
  readonly waterLevel: number | null;
  /** Length tee→pin along the centreline, yards (what's printed on the scorecard). */
  readonly yards: number;

  heightAt(x: number, z: number): number;
  normalAt(x: number, z: number, out?: Vector3): Vector3;
  surfaceAt(x: number, z: number): Surface;
  /** Where to drop after a water hazard: on the line from the pin through `entry`, back to dry
   *  non-hazard ground no nearer the hole, ~2 m from the margin. */
  waterDrop(entry: Vector3, lastShotFrom: Vector3): Vector3;
  /** A good default aim point from `from` (next centreline target ≤ club reach, or the pin). */
  aimTarget(from: Vector3, maxCarryM: number): Vector3;
}

export interface CourseDef {
  id: string;
  name: string;
  holes: HoleDef[];
}

// ─────────────────────────────────────── Physics ─────────────────────────────────────
/** What the swing produced, in gameplay terms (src/input → game → physics). */
export interface ShotInput {
  club: ClubId;
  /** 0 … 1.15 (>1 = overswing: more distance but extra error, shown red on the meter). */
  power: number;
  /** World yaw the player aimed at. */
  aimYaw: number;
  /** −1 … +1 face/path: negative = hook (curves LEFT for a right-hander), positive = slice (RIGHT). */
  curve: number;
  /** 0 … 1 strike quality (1 = pure). Low quality = topped / thin shots. */
  quality: number;
  /** Lie the ball is hit from. */
  lie: Surface;
}

export interface BallState {
  pos: Vector3;
  vel: Vector3;
  /** Angular velocity rad/s, world frame. */
  spin: Vector3;
  phase: 'rest' | 'flight' | 'rolling' | 'holed' | 'water' | 'ob';
}

export type BallEvent =
  | { type: 'launch'; pos: Vector3; speed: number }
  | { type: 'apex'; pos: Vector3; height: number }
  | { type: 'land'; pos: Vector3; surface: Surface; speed: number; carryM: number }
  | { type: 'bounce'; pos: Vector3; surface: Surface; speed: number }
  | { type: 'tree'; pos: Vector3; speed: number }
  | { type: 'pin'; pos: Vector3 } // hit the flagstick
  | { type: 'lip'; pos: Vector3 } // lipped out
  | { type: 'holed'; pos: Vector3 }
  | { type: 'water'; pos: Vector3 }
  | { type: 'ob'; pos: Vector3 }
  | { type: 'rest'; pos: Vector3; surface: Surface };

/** src/physics/ball.ts */
export interface BallSim {
  readonly state: BallState;
  setHole(hole: Hole): void;
  setWind(w: Wind): void;
  /** Place the ball at rest. */
  place(pos: Vector3): void;
  /** Strike the ball from its current rest position. */
  strike(shot: ShotInput, rng?: () => number): void;
  /** Advance (internally sub-stepped). Events in chronological order. */
  step(dt: number): BallEvent[];
  /** Predict where a perfect shot (curve 0, quality 1, no randomness) would first land, with wind.
   *  Used for the landing marker. `power` defaults to 1. */
  predictLanding(from: Vector3, club: ClubId, aimYaw: number, power?: number): Vector3;
  /** Predicted rolling path of a putt (for an optional putting guide). */
  predictPutt(from: Vector3, aimYaw: number, power: number, maxPoints?: number): Vector3[];
}

/** Putting: power 1.0 means the ball would roll this far on a flat green (metres). The putter has
 *  a "range" selectable by the game: short / medium / long scale this. */
export const PUTT_RANGE_M = { short: 6, medium: 14, long: 26 } as const;
export type PuttRange = keyof typeof PUTT_RANGE_M;

// ─────────────────────────────────── Input (the swing) ───────────────────────────────
/** Golf controller buttons. 'swing' is HELD to make a swing count (like holding A on a Wiimote);
 *  swinging without it is a practice swing. */
export type ControllerButton =
  | 'swing'
  | 'a'
  | 'b'
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'minus'
  | 'plus'
  | 'map'
  | 'pause'
  | 'recenter';

export type InputMode = 'menu' | 'aim' | 'putt' | 'watch';

/** Live club pose (from phone or mouse), already calibrated. Drives the avatar & power meter. */
export interface ClubPose {
  connected: boolean;
  /** −0.2 … 1.2: how far back the club is (0 = address, 1 = full backswing at top, <0 = forward/follow). */
  backswing: number;
  /** −1 … +1 club face twist relative to address (neg = closed/hook, pos = open/slice). */
  face: number;
  /** Swing button held right now. */
  armed: boolean;
  /** 0 … 1 current swing speed (for whoosh audio / motion blur). */
  speed: number;
  /** Shaft angle in the swing plane, radians: 0 = pointing at the ball, +π/2 = horizontal behind,
   *  ≈ +π at the top; negative = follow-through. For animating the avatar 1:1. */
  shaftAngle: number;
}

export interface SwingEvent {
  /** performance.now() of impact. */
  time: number;
  /** 0 … 1.15 (see ShotInput.power). For putts: fraction of PUTT range. */
  power: number;
  /** −1 … +1 (see ShotInput.curve). */
  curve: number;
  /** 0 … 1 strike quality (tempo/smoothness). */
  quality: number;
  /** Backswing reached before the downswing, 0 … 1.2. */
  backswing: number;
  /** true if the swing button was not held: practice swing, don't hit. */
  practice: boolean;
}

export interface SwingInput {
  readonly kind: 'phone' | 'mouse';
  readonly pose: ClubPose;
  onSwing(cb: (e: SwingEvent) => void): () => void;
  /** Fires on PRESS of a button (not while held). */
  onButton(cb: (b: ControllerButton) => void): () => void;
  /** Change detection behaviour: menu (no swings), aim (full swing), putt (gentle pendulum), watch (none). */
  setMode(m: InputMode): void;
  /** Use the current pose as address. */
  recenter(): void;
  vibrate(pattern: number | number[]): void;
  update(dt: number): void;
  dispose(): void;
}

// ───────────────────────────────── Phone link (network) ──────────────────────────────
export type LinkStatus = 'idle' | 'connecting' | 'waiting' | 'pairing' | 'connected' | 'disconnected' | 'error';
export type LinkTransport = 'webrtc' | 'relay' | 'none';
export type Handedness = 'right' | 'left';

/** Decoded sensor packet (see src/net/packets.ts for the wire format). */
export interface SensorPacket {
  seq: number;
  t: number;
  q: { x: number; y: number; z: number; w: number };
  acc: { x: number; y: number; z: number };
  /** Rotation rate, deg/s, device frame (alpha=z, beta=x, gamma=y). */
  gyro: { alpha: number; beta: number; gamma: number };
  buttons: number;
  /** Camera assist (Exemoo shell): wrist (x,y) + shoulder (sx,sy) in 0…1 image coords, mirrored; scale = shoulder width. */
  cam?: { x: number; y: number; sx: number; sy: number; scale: number } | null;
}

/** What the phone screen should show. */
export type PhoneScreen = 'menu' | 'aim' | 'swing' | 'putt' | 'watch' | 'paused' | 'scorecard' | 'calibrate';

/** Game → phone (reliable control channel). */
export type GameToPhone =
  | { t: 'haptic'; pattern: number | number[] }
  | { t: 'screen'; screen: PhoneScreen; label?: string }
  | { t: 'hud'; hole: number; par: number; stroke: number; club: string; toPinYds: number; player: string; color: string }
  | { t: 'theme'; color: string };

/** Phone → game. */
export type PhoneToGame = { t: 'button'; b: ControllerButton } | { t: 'hello'; ua: string; hand?: Handedness };

export interface PhoneLinkEvents {
  status: (s: LinkStatus, detail?: string) => void;
  packet: (p: SensorPacket) => void;
  message: (m: PhoneToGame) => void;
}

// ────────────────────────────────── Scene / presentation ─────────────────────────────
export type CameraMode =
  | 'menu' // slow orbit over the course
  | 'flyover' // hole intro: tee → green → back
  | 'address' // behind the golfer looking down the aim line
  | 'follow' // chase the ball in flight
  | 'landing' // static camera near predicted landing, watching it come down
  | 'green' // putting: low behind the ball toward the cup
  | 'top' // overhead map view of the hole (the "1" button)
  | 'celebrate'; // orbit the golfer / cup

export type GolferAnim = 'idle' | 'address' | 'swing' | 'follow' | 'celebrate' | 'disappointed' | 'putt';

export type FxKind = 'divot' | 'sand' | 'splash' | 'leaves' | 'confetti' | 'cupDrop' | 'dust' | 'sparkle';

export interface GolferLook {
  /** Shirt colour. */
  color: string;
  skin: string;
  hair: string;
  /** Simple choices; the scene builds a Mii-like character. */
  hat: 'none' | 'cap' | 'visor';
}

/** src/scene/scene.ts — Three.js presentation. All world positions are in the current hole frame. */
export interface GolfScene {
  readonly canvas: HTMLCanvasElement;
  setHole(hole: Hole): void;
  setWind(w: Wind): void;
  setBall(pos: Vector3, visible?: boolean): void;
  /** Ball spin/flying flag for the trail. */
  setBallFlying(on: boolean): void;
  setGolfer(pos: Vector3, yaw: number, look: GolferLook, club: ClubId): void;
  /** Drive the golfer from the live club pose (address/backswing mirror the phone in real time). */
  setGolferPose(anim: GolferAnim, pose?: ClubPose): void;
  /** Aim helpers: line on the ground from ball toward landing point + landing ring. null hides. */
  setAim(from: Vector3 | null, landing?: Vector3, putt?: boolean): void;
  /** Putting grid showing green slopes. */
  setGreenGrid(on: boolean): void;
  setCamera(mode: CameraMode, opts?: { ball?: Vector3; target?: Vector3; yaw?: number; instant?: boolean }): void;
  /** Flyover finished? (returns true once complete; the game can skip early). */
  readonly cameraBusy: boolean;
  fx(kind: FxKind, pos: Vector3): void;
  /** Project a world point to CSS pixels (null if behind camera). */
  worldToScreen(p: Vector3): { x: number; y: number } | null;
  setQuality(q: Quality): void;
  update(dt: number): void;
  render(): void;
  resize(w: number, h: number): void;
}

// ─────────────────────────────────────── Audio ───────────────────────────────────────
export type SfxName =
  | 'click' // ui move
  | 'select' // ui confirm
  | 'back'
  | 'whoosh' // practice/real swing whoosh (vol ∝ speed)
  | 'hitWood'
  | 'hitIron'
  | 'hitPutt'
  | 'hitBad' // topped / duff
  | 'land' // soft thud on grass
  | 'sand'
  | 'splash'
  | 'tree'
  | 'pin' // clang off the flagstick
  | 'cup' // ball rattles into cup
  | 'lip'
  | 'applause'
  | 'cheer' // big cheer (birdie or better)
  | 'aww' // crowd groan (water/ob/lip)
  | 'chime' // banner
  | 'connect';

export interface AudioEngine {
  unlock(): void; // call from a user gesture
  play(name: SfxName, opts?: { volume?: number; rate?: number; pan?: number }): void;
  /** Swing whoosh following live club speed 0…1 (call each frame; 0 silences). */
  setSwingWhoosh(speed: number): void;
  music(track: 'menu' | 'course' | 'results' | null): void;
  /** Outdoor ambience (birds, breeze); intensity 0…1 follows wind. */
  ambience(on: boolean, wind?: number): void;
  setVolumes(master: number, music: number, sfx: number): void;
}

// ───────────────────────────────────────── Game ──────────────────────────────────────
export type Quality = 'low' | 'medium' | 'high';

export type GameMode =
  | 'round' // stroke play over a hole selection
  | 'training-putt' // sink putts of increasing length
  | 'training-approach' // closest to the pin, 5 balls
  | 'training-drive'; // longest drive in fairway, 5 balls

export type HoleSet = 'beginner' | 'intermediate' | 'expert' | 'front9';

export interface PlayerSetup {
  name: string;
  look: GolferLook;
  /** Phone or mouse. All players can share one phone (hot-seat), the default. */
}

export interface GameSetup {
  mode: GameMode;
  holes: HoleSet;
  players: PlayerSetup[]; // 1 … 4, hot-seat
  /** Wind strength preset. */
  wind: 'calm' | 'normal' | 'strong';
}

export interface Settings {
  handedness: Handedness;
  /** 0.5 … 2 swing sensitivity multiplier. */
  sensitivity: number;
  /** Swing requires holding the SWING button (Wii-style). If false, every full swing counts. */
  holdToSwing: boolean;
  showLandingMarker: boolean;
  showPuttGuide: boolean;
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  quality: Quality;
  haptics: boolean;
  units: 'yards' | 'meters';
}

export const DEFAULT_SETTINGS: Settings = {
  handedness: 'right',
  sensitivity: 1,
  holdToSwing: true,
  showLandingMarker: true,
  showPuttGuide: false,
  masterVolume: 0.85,
  musicVolume: 0.35,
  sfxVolume: 0.9,
  quality: 'high',
  haptics: true,
  units: 'yards',
};

export interface CareerStats {
  roundsPlayed: number;
  bestRound: Partial<Record<HoleSet, number>>; // best score relative to par
  holesInOne: number;
  eagles: number;
  birdies: number;
  longestDriveYds: number;
  longestPuttYds: number;
  trainingBest: Partial<Record<GameMode, number>>;
}

export const DEFAULT_STATS: CareerStats = {
  roundsPlayed: 0,
  bestRound: {},
  holesInOne: 0,
  eagles: 0,
  birdies: 0,
  longestDriveYds: 0,
  longestPuttYds: 0,
  trainingBest: {},
};

/** Score names relative to par. */
export function scoreName(strokes: number, par: number): string {
  if (strokes === 1) return 'Hole in One!';
  const d = strokes - par;
  if (d <= -3) return 'Albatross!';
  if (d === -2) return 'Eagle!';
  if (d === -1) return 'Birdie!';
  if (d === 0) return 'Par';
  if (d === 1) return 'Bogey';
  if (d === 2) return 'Double Bogey';
  if (d === 3) return 'Triple Bogey';
  return `+${d}`;
}

/** Stroke limit per hole: pick up at par + MAX_OVER_PAR. */
export const MAX_OVER_PAR = 4;

/** Player colours (shirt + UI accent) for players 1–4. */
export const PLAYER_COLORS = ['#ff5a5f', '#3b82f6', '#f5b700', '#8b5cf6'] as const;

/** Visual palette shared by scene and UI so everything feels like one system.
 *  Style: bright, clean, flat-shaded "Wii Sports" look — saturated greens, sky blue, white UI cards
 *  with soft shadows and rounded corners, chunky friendly type. */
export const PALETTE = {
  ink: '#22303c',
  inkSoft: '#5b6b78',
  paper: '#ffffff',
  paperDim: '#eef4f7',
  sky: '#8fd3ff',
  skyHigh: '#3fa0ef',
  grass: '#72c450',
  grassDark: '#4f9d3a',
  green: '#86d65e',
  sand: '#f2dc9b',
  water: '#3fa7e0',
  accent: '#20a4f3', // Wii blue
  accent2: '#59c135', // go green
  gold: '#ffc83d',
  danger: '#ff4d4f',
  good: '#3ddc97',
  flag: '#ff3b30',
} as const;

// ───────────────────────────────────────── UI ────────────────────────────────────────
/** src/ui — DOM overlay (menus, HUD, scorecard). */
export type UIScreen =
  | 'none' // gameplay, HUD only
  | 'loading'
  | 'title'
  | 'connect' // pair phone: PIN + QR, "play with mouse" option
  | 'setup' // mode, hole set, players (1–4 names + colours), wind → emits 'start'
  | 'settings'
  | 'howto'
  | 'stats'
  | 'pause'
  | 'scorecard' // between holes / on demand
  | 'results'; // end of round or training

export interface HudState {
  visible: boolean;
  holeNumber: number;
  par: number;
  yards: number;
  stroke: number; // stroke about to be played (1-based)
  playerName: string;
  playerColor: string;
  scoreToPar: number; // running total for this player
  toPinYds: number;
  lie: Surface;
  club: ClubId;
  /** Clubs selectable right now (putter only on the green, no driver off the fairway, …). */
  clubs: ClubId[];
  /** Full-power carry of the current club in yards (after lie penalty), 0 for putter. */
  clubCarryYds: number;
  puttRange: PuttRange | null;
  wind: Wind;
  /** Camera yaw so the wind arrow can be drawn relative to the view. */
  viewYaw: number;
  /** Elevation change to pin in yards (+ = uphill), shown on approach. */
  elevationYds: number;
  /** Training challenge line, e.g. "Ball 3/5 · Best 4.2 yd". */
  trainingLine: string;
  units: 'yards' | 'meters';
}

export interface ScorecardData {
  courseName: string;
  holes: { number: number; par: number; yards: number }[];
  players: { name: string; color: string; strokes: (number | null)[] }[];
  /** Index (into holes) of the hole just finished / current, for highlighting. */
  current: number;
  final: boolean;
}

export interface ResultsData {
  title: string; // "Round Complete" / "Putting Challenge"
  /** Winner first. */
  rows: { name: string; color: string; value: string; sub?: string; best?: boolean }[];
  notes?: string[]; // e.g. "New best!", "Birdies: 3"
}

export interface UIEvents {
  start: (setup: GameSetup) => void;
  resume: () => void;
  quit: () => void; // back to title
  restart: () => void; // restart the round with the same setup
  next: () => void; // continue from scorecard / results
  settings: (s: Settings) => void;
  /** User clicked "Play with mouse" on the connect screen, or "Connect phone". */
  connect: (how: 'phone' | 'mouse') => void;
  recenter: () => void;
  /** Gameplay button clicks from on-screen HUD (for mouse users): club ±, map, putt range. */
  hudButton: (b: 'clubPrev' | 'clubNext' | 'map' | 'pause' | 'puttRange' | 'aimLeft' | 'aimRight') => void;
}

export interface GameUI {
  readonly screen: UIScreen;
  showScreen(s: UIScreen, data?: ScorecardData | ResultsData | { message?: string }): void;
  /** Merge-update the HUD (call freely; cheap when unchanged). */
  hud(state: Partial<HudState>): void;
  /** Live power meter. backswing 0…1.2 fills it (red above 1), armed shows whether the swing button
   *  is held. `result` freezes the meter at the hit and shows curve (hook/slice) briefly. null hides. */
  power(m: { backswing: number; armed: boolean; putt: boolean; result?: { power: number; curve: number } } | null): void;
  /** Big centred banner: "Nice Shot!", "Birdie!", "OB", "Water Hazard", "Hole 3 · Par 4 · 412 yd". */
  banner(text: string, kind: 'info' | 'good' | 'great' | 'bad', ms?: number, sub?: string): void;
  /** Small transient message (bottom). */
  toast(text: string): void;
  /** Hole minimap (top-down) with ball, pin, aim landing point. */
  minimap(hole: Hole | null, ball?: Vector3, aim?: Vector3): void;
  /** Floating label anchored to a screen position (e.g. distance on the landing ring). null hides. */
  marker(id: string, screen: { x: number; y: number } | null, text?: string): void;
  setLink(status: LinkStatus, pin: string, controllerUrl: string, transport: LinkTransport): void;
  setSettings(s: Settings): void;
  setStats(s: CareerStats): void;
  /** Phone d-pad / A / B navigation for menus. Returns true if consumed by an open screen. */
  navigate(b: ControllerButton): boolean;
  on<K extends keyof UIEvents>(ev: K, cb: UIEvents[K]): () => void;
}
