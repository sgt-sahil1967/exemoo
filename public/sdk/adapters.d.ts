// Loose types: each game casts these to its own PhoneLink type.
export declare function legacyQuat(q: { x: number; y: number; z: number; w: number }): [number, number, number, number];
export declare class SpinshotLink {
  constructor(opts?: { layout?: string; title?: string; buttons?: { b: string; label: string }[]; buttonMap?: Record<string, string>; maskBits?: Record<string, number> });
  [key: string]: any;
}
export declare class SliceLink {
  constructor(opts?: { layout?: string; title?: string; menuHold?: () => boolean });
  [key: string]: any;
}
