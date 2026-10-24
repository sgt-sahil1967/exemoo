/**
 * SPINSHOT — shared contracts.
 *
 * Every module (physics, rules, AI, scene, UI, audio, input, net) builds against the
 * types and constants in this file. Do not change a signature here without updating
 * every implementer.
 *
 * World frame (metres, seconds, radians), right-handed, Y up:
 *   - Origin on the floor under the centre of the table.
 *   - Table long axis is Z. The human player stands at +Z (near the camera),
 *     the opponent at −Z. Width is X (+X = player's right when facing −Z).
 *   - Table playing surface is at y = TABLE.height.
 */
import type { Quaternion, Vector3 } from 'three';

// ───────────────────────────── Dimensions (ITTF) ─────────────────────────────
export const TABLE = {
  length: 2.74,
  width: 1.525,
  height: 0.76,
  thickness: 0.025,
  /** Net top above the playing surface. */
  netHeight: 0.1525,
  /** How far the net posts stick out beyond each side line. */
  netOverhang: 0.1525,
} as const;

export const BALL = {
  radius: 0.02,
  mass: 0.0027,
} as const;

export const GRAVITY = 9.81;

/** Half extents for convenience. */
export const HALF_L = TABLE.length / 2;
export const HALF_W = TABLE.width / 2;

// ──────────────────────────────── Core types ─────────────────────────────────
export type Side = 'player' | 'opponent';
export const other = (s: Side): Side => (s === 'player' ? 'opponent' : 'player');
/** Sign of Z on a side's half of the table: player half is +Z. */
export const sideSign = (s: Side): 1 | -1 => (s === 'player' ? 1 : -1);
/** Which half of the table a z coordinate is on. */
export const sideOfZ = (z: number): Side => (z >= 0 ? 'player' : 'opponent');

export type Difficulty = 'rookie' | 'club' | 'pro' | 'legend';
export type Handedness = 'right' | 'left';
export type Quality = 'low' | 'medium' | 'high';
export type ThemeName = 'club' | 'arena';

export interface BallState {
  pos: Vector3;
  vel: Vector3;
  /** Angular velocity, rad/s, world frame. Topspin for a ball travelling −Z is spin.x < 0. */
  spin: Vector3;
}

export type BallEvent =
  | { type: 'bounce'; side: Side; pos: Vector3; speed: number }
  | { type: 'net'; pos: Vector3; speed: number } // touched the net/net cord (may still continue over)
  | { type: 'edge'; side: Side; pos: Vector3 } // clipped the table edge (counts as a bounce on that side)
  | { type: 'floor'; pos: Vector3; speed: number }
  | { type: 'out'; pos: Vector3 }; // left the play volume without touching the floor (e.g. far away); point over

/** A requested shot, in gameplay terms. Physics solves the actual launch velocity. */
export interface ShotRequest {
  /** Desired landing point on the receiver's half (y ignored). */
  target: Vector3;
  /** Desired ball speed right after contact, m/s (typ. 4 … 22). */
  speed: number;
  /** Spin to impart, rad/s world frame (typ. magnitude 0 … 900). */
  spin: Vector3;
  /** 0 … 1: random error spread applied to the result (0 = perfect). */
  error: number;
}

/** Everything the presentation layers need to know about a hit. */
export interface HitInfo {
  by: Side;
  pos: Vector3;
  /** Speed of the ball after contact, m/s. */
  speed: number;
  /** 0 … 1 normalised power for FX/audio. */
  power: number;
  kind: StrokeKind;
  /** 0 … 1 how well-timed the stroke was (1 = sweet spot). */
  quality: number;
}

export type StrokeKind = 'serve' | 'drive' | 'loop' | 'smash' | 'push' | 'chop' | 'block' | 'lob' | 'flick';

// ───────────────────────────────── Physics ───────────────────────────────────
/** src/physics/ball.ts */
export interface BallSim {
  readonly state: BallState;
  /** Reset to a new state (vectors are copied). */
  set(pos: Vector3, vel: Vector3, spin: Vector3): void;
  /** Advance by dt (internally sub-stepped). Returns events in chronological order. */
  step(dt: number): BallEvent[];
}

/** One sampled point of a predicted path. */
export interface PathPoint {
  t: number;
  pos: Vector3;
  vel: Vector3;
  /** Number of table bounces that happened before this sample. */
  bounces: number;
}

// ───────────────────────────────── Rules ─────────────────────────────────────
export type FaultReason =
  | 'net' // ball did not clear the net
  | 'out' // landed off the table
  | 'double-bounce' // receiver let it bounce twice / missed
  | 'missed' // swung and missed, or never reached
  | 'own-side' // return bounced on the hitter's own side
  | 'volley' // struck before it bounced on the hitter's side
  | 'serve-fault' // illegal serve (did not bounce on server's side first, etc.)
  | 'double-hit';

export interface PointResult {
  winner: Side;
  reason: FaultReason | 'winner';
  /** Who made the error (undefined for clean winners). */
  faultBy?: Side;
  /** Rally length in hits. */
  rally: number;
  ace: boolean;
}

// ──────────────────────────────── Input ──────────────────────────────────────
/** Paddle state from the phone (or mouse fallback), already calibrated to the player's frame. */
export interface PaddleState {
  connected: boolean;
  /** Paddle orientation in world frame, relative to the calibrated neutral pose
   *  (neutral = blade upright, face pointing −Z towards the opponent). */
  orientation: Quaternion;
  /** −1 … +1: where the paddle "points" left/right (yaw). Drives lateral reach & aim. */
  aimX: number;
  /** −1 … +1: where the paddle points down/up (pitch). Drives height & depth. */
  aimY: number;
  /** Face tilt in radians: >0 open (face toward sky, backspin), <0 closed (face toward table, topspin). */
  face: number;
  /** true when the paddle is turned to a backhand grip (based on roll). */
  backhand: boolean;
  /** Smoothed current swing speed, 0 … 1. */
  swing: number;
}

export interface SwingEvent {
  /** performance.now() of the swing peak. */
  time: number;
  /** 0 … 1 normalised swing strength. */
  power: number;
  /** Swing direction in the player's view frame, unit-ish: x = right, y = up, z = forward (toward opponent). */
  dir: { x: number; y: number; z: number };
  /** Paddle state captured at the peak. */
  paddle: PaddleState;
}

/** 'power' triggers the slow-mo power-up (vs-AI matches only). */
export type ControllerButton = 'action' | 'pause' | 'recenter' | 'up' | 'down' | 'left' | 'right' | 'back' | 'power';

export interface PaddleInput {
  readonly kind: 'phone' | 'mouse';
  /** Latest paddle state (updated in update()). */
  readonly state: PaddleState;
  onSwing(cb: (e: SwingEvent) => void): () => void;
  onButton(cb: (b: ControllerButton) => void): () => void;
  /** Use the current pose as the neutral pose. */
  recenter(): void;
  /** Ask the device to vibrate (no-op for mouse). */
  vibrate(pattern: number | number[]): void;
  /** Called once per frame. */
  update(dt: number): void;
  /** Enable/disable swing detection (e.g. while menus are open). */
  setSwingEnabled(on: boolean): void;
  dispose(): void;
}

// ─────────────────────────── Phone link (network) ────────────────────────────
export type LinkStatus = 'idle' | 'connecting' | 'waiting' | 'pairing' | 'connected' | 'disconnected' | 'error';
export type LinkTransport = 'webrtc' | 'relay' | 'none';

/** Decoded sensor packet (see controller.ts / phoneLink.ts for the wire format). */
export interface SensorPacket {
  seq: number;
  /** Phone clock, ms (uint32 wrap). */
  t: number;
  /** Device orientation quaternion (from W3C alpha/beta/gamma, ZXY intrinsic). */
  q: { x: number; y: number; z: number; w: number };
  /** Linear acceleration without gravity, m/s², device frame. */
  acc: { x: number; y: number; z: number };
  /** Rotation rate, deg/s, device frame (alpha=z, beta=x, gamma=y). Zero if the device has none. */
  gyro: { alpha: number; beta: number; gamma: number };
  /** Bitmask of held buttons on the phone UI. */
  buttons: number;
  /** Camera assist (Exemoo shell): wrist (x,y) + shoulder (sx,sy) in 0…1 image coords, mirrored; scale = shoulder width. */
  cam?: { x: number; y: number; sx: number; sy: number; scale: number } | null;
}

/** Messages the game sends to the phone on the reliable control channel. */
export type GameToPhone =
  | { t: 'haptic'; pattern: number | number[] }
  | { t: 'screen'; screen: 'menu' | 'calibrate' | 'serve' | 'rally' | 'paused' | 'result'; label?: string }
  | { t: 'score'; me: number; them: number; gamesMe: number; gamesThem: number; serving: boolean }
  | { t: 'theme'; color: string }
  /** Which player this phone controls in 2-player mode (n = 1 near end, 2 far end); sent on connect. */
  | { t: 'player'; n: 1 | 2; color: string }
  /** Slow-mo power-up state. charges < 0 = not available in this mode (hide the button). */
  | { t: 'power'; charges: number; max: number; active: boolean };

/** Messages the phone sends on the reliable control channel. */
export type PhoneToGame = { t: 'button'; b: ControllerButton } | { t: 'hello'; ua: string; hand?: Handedness };

export interface PhoneLinkEvents {
  status: (s: LinkStatus, detail?: string) => void;
  packet: (p: SensorPacket) => void;
  message: (m: PhoneToGame) => void;
}

// ────────────────────────────── Scene / presentation ─────────────────────────
export type CameraMode = 'menu' | 'play' | 'serve' | 'point' | 'celebrate';

export interface AvatarPose {
  /** Body root on the floor. */
  body: Vector3;
  /** Paddle centre in world space. */
  paddlePos: Vector3;
  /** Paddle orientation in world space (blade plane normal = local +Z, handle = local −Y). */
  paddleRot: Quaternion;
}

// ───────────────────────────────── Settings ──────────────────────────────────
export interface Settings {
  difficulty: Difficulty;
  handedness: Handedness;
  /** Games needed to win a match: 1, 2, or 3 (best of 1/3/5). */
  gamesToWin: 1 | 2 | 3;
  /** 0 … 1 how much the game helps (auto-positioning, timing window, aim correction). */
  assist: number;
  /** 0.5 … 2 swing sensitivity multiplier. */
  sensitivity: number;
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  quality: Quality;
  theme: ThemeName;
  showTrajectory: boolean;
  haptics: boolean;
  playerName: string;
}

export const DEFAULT_SETTINGS: Settings = {
  difficulty: 'club',
  handedness: 'right',
  gamesToWin: 2,
  assist: 0.6,
  sensitivity: 1,
  masterVolume: 0.8,
  musicVolume: 0.4,
  sfxVolume: 0.9,
  quality: 'high',
  theme: 'club',
  showTrajectory: false,
  haptics: true,
  playerName: 'You',
};

/** 'versus' = local split-screen 2 players, two phones (player 1 at +Z, player 2 at −Z). */
export type GameMode = 'match' | 'practice' | 'challenge' | 'demo' | 'versus';

/** Slow-mo power-up tuning. */
export const SLOWMO = {
  /** Real-time seconds the effect lasts. */
  duration: 3,
  /** Simulation speed while active. */
  timeScale: 0.35,
  /** Uses per game (resets at the start of each game). */
  perGame: 2,
} as const;

export interface CareerStats {
  matchesPlayed: number;
  matchesWon: number;
  pointsWon: number;
  pointsLost: number;
  longestRally: number;
  fastestShotKmh: number;
  aces: number;
  /** Best challenge scores by id. */
  challengeBest: Record<string, number>;
}

export const DEFAULT_STATS: CareerStats = {
  matchesPlayed: 0,
  matchesWon: 0,
  pointsWon: 0,
  pointsLost: 0,
  longestRally: 0,
  fastestShotKmh: 0,
  aces: 0,
  challengeBest: {},
};

/** Visual palette shared by scene and UI so everything feels like one system. */
export const PALETTE = {
  ink: '#1d2333',
  paper: '#f6f3ec',
  table: '#2f6fd6',
  tableDark: '#1f4fa3',
  line: '#ffffff',
  accent: '#ff6b4a', // coral — player
  accent2: '#2ec4b6', // teal — opponent
  gold: '#ffc94a',
  ball: '#fff8ea',
  danger: '#ff4d6d',
  good: '#3ddc97',
} as const;
