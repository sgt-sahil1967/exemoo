/**
 * Shared contracts between modules. Every module agent codes against these
 * types; do NOT change them without coordinating with the integrator.
 *
 * WORLD LAYOUT (meters, Y up, right-handed, Three.js conventions)
 * - Table top surface is the plane y = 0. Table spans x ∈ [-4.2, 4.2], z ∈ [-2.2, 1.6].
 * - Camera sits at (0, 3.4, 7.4) looking at (0, 2.1, -1.0), fov 45.
 * - Fruits fly in the "action plane" z ≈ -1.2 (± 0.4), launched from below the
 *   far table edge (y ≈ -1.5), arcing up to y ≈ 3.5..5.5 then falling back.
 * - Sliced halves receive forward velocity (+z) so they land and bounce on the
 *   table top, rest, then fade out.
 * - Blade pointer lives in normalized screen space (NDC, x,y ∈ [-1, 1], y up).
 *   Hit testing is done in screen space against projected fruit circles.
 */
import type * as THREE from 'three';

// ---------------------------------------------------------------- fruits ---

export type FruitKind =
  | 'apple' | 'orange' | 'watermelon' | 'banana' | 'pineapple' | 'strawberry'
  | 'coconut' | 'kiwi' | 'lemon' | 'peach' | 'plum' | 'mango' | 'dragonfruit';

/** Arcade-mode power-up fruits (look like glowing tinted bananas/orbs). */
export type PowerUpKind = 'freeze' | 'frenzy' | 'double';

/** Everything that can be thrown. 'pomegranate' is the multi-hit bonus fruit. */
export type ThrowableKind = FruitKind | PowerUpKind | 'bomb' | 'pomegranate';

export interface FruitSpec {
  kind: FruitKind | PowerUpKind | 'pomegranate';
  /** Bounding radius in world meters (used for hit test + physics). 0.22..0.48 */
  radius: number;
  /** Juice particle / splat colour (hex). */
  juiceColor: number;
  /** Flesh (cut face) base colour (hex). */
  fleshColor: number;
  /** Base points for slicing it. */
  points: number;
  /** Relative spawn weight in normal waves. */
  weight: number;
}

/** A half returned by the slicer. */
export interface SliceHalf {
  /**
   * Ready-to-add object whose geometry has been RE-CENTERED so that its local
   * origin is the centroid of this half. Shares the fruit's local frame
   * orientation (i.e. set object.quaternion = fruit.quaternion).
   */
  object: THREE.Object3D;
  /** Centroid of this half in the ORIGINAL fruit-local space (pre-scale applied). */
  localOffset: THREE.Vector3;
}

export interface SliceResult {
  halves: [SliceHalf, SliceHalf];
}

/** src/assets/fruits.ts must export these (see AssetsModule). */
export interface AssetsModule {
  FRUIT_SPECS: Record<FruitKind | PowerUpKind | 'pomegranate', FruitSpec>;
  /** All regular fruit kinds usable in waves. */
  FRUIT_KINDS: FruitKind[];
  /**
   * Build a stylized low-poly model centred on origin, bounding radius == spec.radius.
   * Returned group's userData.kind = kind. Cheap to call repeatedly (shared
   * geometries/materials cached internally; clones are fine).
   */
  createFruitModel(kind: FruitKind | PowerUpKind | 'pomegranate'): THREE.Group;
  /** Bomb model (radius ≈ 0.36). userData.fuseTip: THREE.Object3D (where sparks emit). */
  createBombModel(): THREE.Group;
  /**
   * Split a model produced by createFruitModel by a plane through the fruit's
   * local origin. planeNormalLocal is in the model's local space (unit vector).
   * Cut faces are capped with a flesh material (procedural texture per kind).
   * Small attachments (stems, leaves) go to whichever side their centre is on.
   * Must finish in < 3 ms for any fruit on a mid laptop.
   */
  sliceFruit(model: THREE.Group, planeNormalLocal: THREE.Vector3): SliceResult;
  /** Dispose geometries/materials that are NOT shared caches. */
  disposeObject(obj: THREE.Object3D): void;
}

// ----------------------------------------------------------------- input ---

/** Unified blade pointer, sampled by the game every frame. */
export interface PointerState {
  /** NDC position, x,y ∈ [-1,1] (may slightly exceed when phone points off-screen). */
  x: number;
  y: number;
  /** Whether the blade is currently "live" (mouse held / phone connected & calibrated). */
  active: boolean;
  /** Where the input comes from. */
  source: 'phone' | 'mouse' | 'touch' | 'none';
}

export interface PointerSource {
  /** Called once per frame before reading state. dt seconds. */
  update(dt: number): void;
  readonly state: PointerState;
}

// --------------------------------------------------------------- network ---

export type LinkStatus =
  | 'idle'          // not started
  | 'signaling'     // contacting signaling server
  | 'waiting'       // room created, PIN shown, waiting for phone
  | 'connecting'    // phone joined, WebRTC negotiating
  | 'connected'     // data flowing (datachannel or ws relay)
  | 'disconnected'  // phone left; room still open, waiting for re-join
  | 'error';

export interface LinkInfo {
  status: LinkStatus;
  pin?: string;
  /** Full URL the phone should open (encoded in QR). */
  joinUrl?: string;
  /** 'webrtc' | 'relay' once connected. */
  transport?: 'webrtc' | 'relay';
  message?: string;
}

/** One IMU sample decoded from a SEN1 packet. */
export interface SensorSample {
  seq: number;
  /** Phone clock ms (uint32 wrap). */
  t: number;
  /** Device orientation quaternion (x,y,z,w) as produced by sword-relay controller. */
  quat: [number, number, number, number];
  /** Linear acceleration m/s² (x,y,z), device frame. */
  accel: [number, number, number];
  /** performance.now() when received. */
  receivedAt: number;
  /** Exemoo pad: the on-screen blade button is held. Undefined for controllers without one. */
  held?: boolean;
}

/** Buttons the phone controller can press. */
export type PhoneButton = 'calibrate' | 'pause' | 'select';

/** Messages game -> phone (JSON over the data channel or relay). */
export type GameToPhone =
  | { t: 'haptic'; pattern: number[] }                     // navigator.vibrate pattern
  | { t: 'state'; screen: GameScreen; score?: number; lives?: number; mode?: GameMode; best?: number }
  | { t: 'theme'; color: string };

// ------------------------------------------------------------------ game ---

export type GameMode = 'classic' | 'arcade' | 'zen';

export type GameScreen = 'pair' | 'menu' | 'playing' | 'paused' | 'gameover' | 'settings';

export interface Settings {
  masterVolume: number;   // 0..1
  sfxVolume: number;      // 0..1
  musicVolume: number;    // 0..1
  sensitivity: number;    // 0.5..2 (phone pointer gain)
  bladeColor: string;     // css hex, e.g. '#7df9ff'
  screenShake: boolean;
  haptics: boolean;
  quality: 'low' | 'high';
  showFps: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  masterVolume: 0.9,
  sfxVolume: 1,
  musicVolume: 0.55,
  sensitivity: 1,
  bladeColor: '#8ef6ff',
  screenShake: true,
  haptics: true,
  quality: 'high',
  showFps: false,
};

export interface RunStats {
  fruitsSliced: number;
  fruitsMissed: number;
  bombsHit: number;
  combos: number;
  bestCombo: number;
  criticals: number;
  /** seconds */
  duration: number;
}

export interface HudState {
  mode: GameMode;
  score: number;
  best: number;
  /** classic only */
  lives?: number;
  maxLives?: number;
  /** arcade / zen: seconds left */
  timeLeft?: number;
  /** current score multiplier (1 or 2) */
  multiplier: number;
  /** active arcade power-ups with progress 0..1 remaining */
  powerUps: { kind: PowerUpKind; remaining: number }[];
}

export type SfxName =
  | 'swoosh' | 'slice' | 'squish' | 'splat' | 'thud' | 'throw'
  | 'bombFuse' | 'explosion' | 'combo' | 'critical' | 'miss' | 'lifeLost'
  | 'gameOver' | 'start' | 'countdown' | 'go' | 'menuSelect' | 'hover'
  | 'freeze' | 'frenzy' | 'double' | 'pomegranateHit' | 'pomegranateBurst'
  | 'newBest' | 'connect' | 'disconnect' | 'tick' | 'timeUp';

export interface PlayOptions {
  volume?: number;   // 0..1, default 1
  pitch?: number;    // playback-rate multiplier, default 1 (randomise lightly yourself)
  pan?: number;      // -1..1
}

export interface SoundHandle { stop(): void; }
