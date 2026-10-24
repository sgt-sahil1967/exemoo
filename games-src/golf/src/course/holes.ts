/**
 * Authored data for the 9 holes of "Birdie Resort". Local frame per hole: tee at (0, 0), play
 * toward −Z, +X is right. See HoleSpec in ./hole.ts for field meanings.
 *
 *  1  Welcome Mat     par 4  straight, wide, gentle; greenside bunkers.
 *  2  Pond Hop        par 3  short iron over a pond from a slightly raised tee.
 *  3  Palm Parade     par 5  long gentle dogleg right lined with palms; fairway bunkers.
 *  4  Pine Bend       par 4  dogleg left, pines guard the corner, tiered green.
 *  5  Creek Crossing  par 4  creek crosses the fairway just past a good drive; slight right.
 *  6  Cliffhanger     par 3  steep downhill from a tee 15 m up; bunkers left, right and front.
 *  7  Risk & Reward   par 5  dogleg left around a lake; a second water crossing guards the green.
 *  8  The Chute       par 4  long, narrow, tree-lined, uphill to a sloping tiered green.
 *  9  Island Finale   par 4  approach over water to an island green (bail-out bridge on the right).
 */
import type { HoleSpec } from './hole';

const BACK = -Math.PI / 2; // tier direction toward the back of the green (−Z)

export const HOLE_SPECS: HoleSpec[] = [
  {
    number: 1,
    name: 'Welcome Mat',
    par: 4,
    tier: 'beginner',
    seed: 1101,
    path: [[0, 0], [0, -120], [6, -230], [0, -312]],
    fairway: [[0, 0], [34, 0], [42, 21], [230, 23], [290, 17], [330, 15]],
    elev: [[0, 1], [150, 0], [312, 1.5]],
    hills: 1.6,
    green: { r: 15, slope: [0.004, 0.015], pin: [-3, -4], wob: 0.08 },
    bunkers: [
      { x: 27, z: -214, rx: 9, rz: 5, rot: 0.3, wob: 0.15 },
      { x: -19, z: -306, rx: 4.5, rz: 8, wob: 0.15 },
      { x: 18, z: -322, rx: 4, rz: 7, rot: -0.3, wob: 0.15 },
    ],
    trees: { kinds: { round: 3, pine: 1 }, count: 110, gap: 14, band: 30, clusters: [[-40, -150, 12, 8], [44, -280, 12, 7]] },
  },
  {
    number: 2,
    name: 'Pond Hop',
    par: 3,
    tier: 'beginner',
    seed: 2202,
    path: [[0, 0], [0, -70], [-3, -138]],
    fairway: [[0, 0], [92, 0], [100, 12], [140, 12]],
    elev: [[0, 3.5], [40, 1.5], [138, 0.5]],
    hills: 1.2,
    green: { r: 14, slope: [-0.012, 0.012], pin: [2, -2], wob: 0.1 },
    bunkers: [
      { x: 2, z: -158, rx: 9, rz: 3.5, wob: 0.15 },
      { x: -20, z: -132, rx: 3.5, rz: 6, wob: 0.15 },
    ],
    water: [{ x: 0, z: -62, rx: 24, rz: 19, rot: 0.2, wob: 0.15 }],
    trees: { kinds: { round: 2, palm: 2 }, count: 70, gap: 12, band: 26 },
  },
  {
    number: 3,
    name: 'Palm Parade',
    par: 5,
    tier: 'beginner',
    seed: 3303,
    path: [[0, 0], [0, -150], [8, -260], [40, -360], [50, -455]],
    fairway: [[0, 0], [38, 0], [46, 21], [260, 24], [380, 18], [470, 16]],
    elev: [[0, 0], [200, 2], [455, 1]],
    hills: 2,
    green: { r: 16, slope: [-0.018, 0.008], pin: [4, 3], wob: 0.1, rot: 0.3 },
    bunkers: [
      { x: -22, z: -246, rx: 6, rz: 10, wob: 0.15 },
      { x: 58, z: -338, rx: 5, rz: 9, rot: 0.3, wob: 0.15 },
      { x: 30, z: -447, rx: 4, rz: 8, wob: 0.15 },
      { x: 68, z: -468, rx: 5, rz: 4, wob: 0.15 },
    ],
    trees: { kinds: { palm: 4, round: 1 }, count: 150, gap: 12, band: 28 },
  },
  {
    number: 4,
    name: 'Pine Bend',
    par: 4,
    tier: 'intermediate',
    seed: 4404,
    path: [[0, 0], [0, -130], [-5, -225], [-55, -300], [-95, -350]],
    fairway: [[0, 0], [40, 0], [48, 18], [220, 20], [290, 16], [390, 14]],
    elev: [[0, 3], [200, 0], [379, 2]],
    hills: 2.2,
    green: { r: 14, slope: [0.006, 0.02], pin: [2, 5], tier: { angle: BACK, offset: -2, h: 0.35 }, wob: 0.1 },
    bunkers: [
      { x: 26, z: -246, rx: 6, rz: 11, rot: -0.4, wob: 0.15 },
      { x: -84, z: -366, rx: 7, rz: 4, rot: 0.6, wob: 0.15 },
      { x: -111, z: -339, rx: 4, rz: 7, rot: 0.6, wob: 0.15 },
    ],
    trees: { kinds: { pine: 4, round: 1 }, count: 140, gap: 10, band: 30, clusters: [[-48, -220, 16, 18]] },
  },
  {
    number: 5,
    name: 'Creek Crossing',
    par: 4,
    tier: 'intermediate',
    seed: 5505,
    path: [[0, 0], [0, -210], [14, -290], [28, -352]],
    fairway: [[0, 0], [40, 0], [46, 20], [200, 22], [300, 18], [360, 15]],
    elev: [[0, 2], [150, 1], [262, -0.5], [352, 2.5]],
    hills: 1.8,
    green: { r: 14, slope: [-0.015, 0.012], pin: [-3, -2], wob: 0.1 },
    bunkers: [
      { x: -19, z: -300, rx: 5, rz: 9, wob: 0.15 },
      { x: 14, z: -339, rx: 6, rz: 3.5, rot: 0.3, wob: 0.15 },
      { x: 45, z: -357, rx: 4, rz: 7, wob: 0.15 },
    ],
    water: [{ x: 9, z: -262, rx: 75, rz: 5.5, rot: -0.17, wob: 0.25 }],
    trees: { kinds: { round: 2, pine: 2 }, count: 130, gap: 12, band: 30 },
  },
  {
    number: 6,
    name: 'Cliffhanger',
    par: 3,
    tier: 'intermediate',
    seed: 6606,
    path: [[0, 0], [0, -80], [4, -165]],
    fairway: [[0, 0], [108, 0], [118, 12], [170, 12]],
    elev: [[0, 15], [50, 11], [115, 2], [165, 0]],
    hills: 1.5,
    green: { r: 15, slope: [0.02, 0.006], pin: [-4, -3], tier: { angle: 0, offset: 3, h: -0.3 }, wob: 0.1 },
    bunkers: [
      { x: -15, z: -161, rx: 4, rz: 9, wob: 0.15 },
      { x: 22, z: -168, rx: 4.5, rz: 8, wob: 0.15 },
      { x: 3, z: -144, rx: 8, rz: 3, wob: 0.15 },
    ],
    trees: { kinds: { pine: 2, round: 2 }, count: 90, gap: 12, band: 28 },
  },
  {
    number: 7,
    name: 'Risk & Reward',
    par: 5,
    tier: 'expert',
    seed: 7707,
    path: [[0, 0], [0, -240], [-50, -370], [-70, -472]],
    fairway: [[0, 0], [44, 0], [52, 20], [260, 22], [380, 17], [490, 15]],
    elev: [[0, 4], [240, 1], [481, 2]],
    hills: 2,
    green: { r: 14, slope: [0.012, 0.018], pin: [3, -3], tier: { angle: BACK, offset: -2, h: 0.3 }, wob: 0.1 },
    bunkers: [
      { x: 24, z: -252, rx: 6, rz: 12, wob: 0.15 },
      { x: -52, z: -474, rx: 3.5, rz: 7, wob: 0.15 },
      { x: -88, z: -482, rx: 4, rz: 7, wob: 0.15 },
    ],
    water: [
      { x: -82, z: -292, rx: 34, rz: 50, wob: 0.12 },
      { x: -58, z: -420, rx: 34, rz: 7, rot: 0.25, wob: 0.2 },
    ],
    trees: { kinds: { palm: 2, round: 2 }, count: 150, gap: 12, band: 30 },
  },
  {
    number: 8,
    name: 'The Chute',
    par: 4,
    tier: 'expert',
    seed: 8808,
    path: [[0, 0], [0, -170], [10, -290], [28, -384]],
    fairway: [[0, 0], [40, 0], [48, 14], [300, 14], [390, 12]],
    elev: [[0, 0], [200, 2], [384, 7]],
    hills: 1.6,
    rough: 9,
    green: { r: 13, slope: [0.008, 0.026], pin: [-2, 6], tier: { angle: BACK, offset: -3, h: 0.35 }, wob: 0.1 },
    bunkers: [
      { x: -17, z: -240, rx: 4, rz: 9, wob: 0.15 },
      { x: 25, z: -275, rx: 4, rz: 8, wob: 0.15 },
      { x: 12, z: -373, rx: 4, rz: 6, wob: 0.15 },
      { x: 44, z: -390, rx: 4, rz: 7, wob: 0.15 },
      { x: 28, z: -404, rx: 7, rz: 3, wob: 0.15 },
    ],
    trees: { kinds: { pine: 5, round: 1 }, count: 200, gap: 5, band: 22 },
  },
  {
    number: 9,
    name: 'Island Finale',
    par: 4,
    tier: 'expert',
    seed: 9909,
    path: [[0, 0], [-5, -150], [5, -260], [0, -357]],
    fairway: [[0, 0], [40, 0], [46, 20], [285, 20], [300, 0]],
    elev: [[0, 3], [200, 1], [357, 1.5]],
    hills: 1.6,
    green: { r: 14, slope: [-0.012, 0.014], pin: [3, -3], wob: 0.08 },
    bunkers: [{ x: -13, z: -367, rx: 3, rz: 4.5, wob: 0.1 }],
    water: [{ x: 0, z: -347, rx: 46, rz: 42, wob: 0.1 }],
    islands: [
      { x: 0, z: -357, rx: 22, rz: 22 },
      { x: 34, z: -360, rx: 28, rz: 6.5 },
    ],
    trees: { kinds: { palm: 4, round: 1 }, count: 120, gap: 12, band: 28 },
  },
];
