export interface ExemooPacket {
  seq: number;
  t: number;
  q: { x: number; y: number; z: number; w: number };
  acc: { x: number; y: number; z: number };
  gyro: { alpha: number; beta: number; gamma: number };
  buttons: number;
  /** Camera assist: wrist (x,y) and shoulder (sx,sy) in 0…1 image coords (mirrored), scale = shoulder width. */
  cam?: { x: number; y: number; sx: number; sy: number; scale: number } | null;
  /** Sample time in epoch ms (performance.timeOrigin + performance.now()), clock-synced to the phone when `synced`. */
  at?: number;
  synced?: boolean;
}
/** MediaPipe world landmark in metres, hip-centred, not mirrored: [x (image right), y (down), z (- toward camera), visibility]. */
export type ExemooWorldPoint = [number, number, number, number];
export interface ExemooPose {
  visible: boolean;
  wrist?: { x: number; y: number };
  elbow?: { x: number; y: number };
  shoulder?: { x: number; y: number };
  scale?: number;
  /** Capture time in epoch ms. */
  at?: number;
  world?: Partial<Record<'ls' | 'rs' | 'lw' | 'rw' | 'lh' | 'rh' | 'la' | 'ra', ExemooWorldPoint>> | null;
}
export interface ExemooPhone {
  connected: boolean;
  transport: 'webrtc' | 'relay' | 'none';
  latency: number;
  pin: string;
  padUrl: string;
}
export type ExemooButton = 'action' | 'pause' | 'recenter' | 'up' | 'down' | 'left' | 'right' | 'back' | 'power';
export type ExemooLayout = 'swing' | 'slice' | 'remote';
export interface Exemoo {
  inShell: boolean;
  phone: ExemooPhone;
  on(ev: 'packet', cb: (p: ExemooPacket) => void): () => void;
  on(ev: 'button', cb: (b: ExemooButton) => void): () => void;
  on(ev: 'status', cb: (s: ExemooPhone) => void): () => void;
  on(ev: 'pose', cb: (p: ExemooPose) => void): () => void;
  on(ev: 'message', cb: (m: { t: string; [k: string]: unknown }) => void): () => void;
  held(p: ExemooPacket, b: ExemooButton): boolean;
  setLayout(layout: ExemooLayout, title?: string, buttons?: ExemooExtraButton[]): void;
  setStream(on: boolean): void;
  haptic(pattern?: number | number[]): void;
  send(m: { t: string; [k: string]: unknown }): void;
  exit(): void;
  nav(b: string, opts?: { skip?: string }): boolean;
  airCursor(opts?: { active?: () => boolean; speed?: number }): { hot(): Element | null; center(): void };
}
export declare const inExemooShell: () => boolean;
export interface ExemooExtraButton {
  b: string;
  label: string;
}
export declare function connectExemoo(opts?: { layout?: ExemooLayout; title?: string; stream?: boolean; buttons?: ExemooExtraButton[]; keys?: Partial<Record<string, string>> }): Exemoo;
export declare function pressKey(code: string): void;
