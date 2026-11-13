// Pure road geometry shared by the sim and the 3D world. `d` = metres along the road, `x` = lateral
// offset from the road centreline. World: the road runs toward -Z; world point = (center(d) + x, y, -d).
import * as THREE from 'three';

export const ROAD_HALF = 10; // metres, centreline to edge
export const ZONE_LEN = 1400; // metres per zone; a boss waits at the end of each

/** Curve strength grows with distance (never with time, so the road never changes under the car). */
export function ampAt(d: number): number {
  return 0.62 + 0.38 * Math.min(1, d / 7000);
}

// Each zone has a straight "boss arc" (STRAIGHT_START..zone end..+STRAIGHT_END) where the road is dead straight and
// centred on x=0, so the fight is fair. Between those, the zone's own flavour of bends is faded in/out with a C1 envelope.
const LEAD = 200; // straight metres after a zone boundary (boss arc, second half)
const ACTIVE = 950; // metres of curves per zone (leaves 250 m straight before the next boundary + LEAD after)
const FADE = 170;

const sstep = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

function seg(d: number): { i: number; v: number } {
  const i = Math.floor((d - LEAD) / ZONE_LEN);
  return { i, v: d - LEAD - i * ZONE_LEN };
}

function envelope(v: number): number {
  return sstep(v / FADE) * sstep((ACTIVE - v) / FADE);
}

/** Lateral shape (metres) for each zone flavour; v = metres into the active stretch, amp 0.6..1. */
function shape(kind: number, v: number, amp: number): number {
  const T = Math.PI * 2;
  switch (kind) {
    case 0: // meadow: wide lazy S
      return amp * (30 * Math.sin((T * v) / 640) + 6 * Math.sin((T * v) / 230 + 1));
    case 1: // barnyard: chicanes (quick left-right-left pairs)
      return amp * (23 * Math.sin((T * v) / 290) + 9 * Math.sin((T * v) / 150 + 0.6));
    case 2: // creek: one long sweeper to the left with a lazy ripple
      return -amp * (62 * Math.pow(Math.sin((Math.PI * v) / ACTIVE), 2) - 7 * Math.sin((T * v) / 260));
    case 3: // canyon: tight zigzag hairpins
      return amp * (30 * Math.sin((T * v) / 260) + 3.5 * Math.sin((3 * T * v) / 260));
    default: // sunset: rolling mixed
      return amp * (26 * Math.sin((T * v) / 520) + 16 * Math.sin((T * v) / 230 + 1.3) + 5 * Math.sin((T * v) / 120));
  }
}

export function center(d: number): number {
  const { i, v } = seg(d);
  if (i < 0 || v >= ACTIVE) return 0;
  return envelope(v) * shape(i % 5, v, ampAt(d));
}

/** d(center)/d(d): lateral metres per forward metre. */
export function slope(d: number): number {
  return (center(d + 1) - center(d - 1)) / 2;
}

/** d2(center)/d(d)2: 1/m. Positive = road bending toward +x (right as seen from the driver). */
export function curvature(d: number): number {
  return (center(d + 2) - 2 * center(d) + center(d - 2)) / 4;
}

/** Signed upcoming-turn strength in -1..1 over the next `look` metres (+ = bends right, -1/+1 ~ 60 degrees of heading change). */
export function turnAhead(d: number, look = 60): number {
  const h0 = Math.atan(slope(d));
  let best = 0;
  for (let k = 1; k <= 6; k++) {
    const dh = Math.atan(slope(d + (look * k) / 6)) - h0;
    if (Math.abs(dh) > Math.abs(best)) best = dh;
  }
  return Math.max(-1, Math.min(1, best / (Math.PI / 3)));
}

/** True on the dead-straight stretches (boss arcs and the start). */
export function isStraight(d: number): boolean {
  const { i, v } = seg(d);
  return i < 0 || v <= 0 || v >= ACTIVE;
}

/** Yaw for an object that is built facing -Z so it follows the road direction. */
export function heading(d: number): number {
  return -Math.atan(slope(d));
}

export function trackToWorld(d: number, x: number, y = 0, out = new THREE.Vector3()): THREE.Vector3 {
  return out.set(center(d) + x, y, -d);
}

export interface Zone {
  name: string;
  sky: [number, number]; // zenith, horizon colours
  fog: number;
  grass: [number, number]; // two checker tones
  ground: number; // road verge / far ground
  road: number;
  accent: number;
  sun: number;
  kind: 'meadow' | 'barnyard' | 'creek' | 'canyon' | 'sunset';
}

export const ZONES: Zone[] = [
  { name: 'Sunny Meadow', kind: 'meadow', sky: [0x4fb8ff, 0xcdf0ff], fog: 0xcdf0ff, grass: [0x5fd03a, 0x52c530], ground: 0x6fdc4a, road: 0x555a70, accent: 0xffd21f, sun: 0xfff3c4 },
  { name: 'Barnyard Bend', kind: 'barnyard', sky: [0x5cc0ff, 0xe3f6ff], fog: 0xe3f6ff, grass: [0x7ed957, 0x6ccb47], ground: 0x8ee063, road: 0x5b5f73, accent: 0xff3b30, sun: 0xfff1b8 },
  { name: 'Creek Crossing', kind: 'creek', sky: [0x3aa8e8, 0xc4ecff], fog: 0xc4ecff, grass: [0x4fc27a, 0x43b46c], ground: 0x59cf86, road: 0x4f5670, accent: 0x2f7cff, sun: 0xffffff },
  { name: 'Red Rock Run', kind: 'canyon', sky: [0xff9a4a, 0xffe1b0], fog: 0xffd9a8, grass: [0xe6a45c, 0xd9964f], ground: 0xeab16b, road: 0x6a5a5a, accent: 0xff8a00, sun: 0xffe2b0 },
  { name: 'Sunset Hills', kind: 'sunset', sky: [0x7a4dff, 0xffb48a], fog: 0xffb89a, grass: [0x8fcf55, 0x82c34a], ground: 0x9ad65f, road: 0x4d4a68, accent: 0xff5c8a, sun: 0xffc48a },
];

export const zoneIndex = (d: number) => Math.floor(Math.max(0, d) / ZONE_LEN);
export const zoneAt = (d: number): Zone => ZONES[zoneIndex(d) % ZONES.length];
