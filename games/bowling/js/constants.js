// Moo Bowl: shared dimensions and tables. Pure data, no imports (runs in browsers and Node).
// Units are metres, kilograms, seconds, radians. Y is up. The lane runs toward -Z.
// The foul line is z = 0, the lane surface is y = 0, the lane centre is x = 0.
// The bowler stands at z > 0 looking toward -Z, so +X is the bowler's RIGHT.

const IN = 0.0254;

export const LANE = {
  width: 1.0668, // 41.5 in, x from -0.5334 to +0.5334
  halfWidth: 0.5334,
  length: 18.288, // foul line to the centre of the head pin (60 ft)
  approach: 4.6, // approach floor runs from z = 0 to z = +4.6
  gutterWidth: 0.235, // each side, outside the lane edge
  gutterDepth: 0.047, // lowest point of the gutter below the lane surface
  deckEndZ: -19.156, // back edge of the pin deck; the pit starts here
  pitFloorY: -0.12, // pit floor, below the lane surface
  pitBackZ: -20.25, // rear cushion (curtain) of the pit
  kickbackX: 0.79, // inner face of the side walls beside the pin deck (|x|), from z = -17.6 back
  kickbackStartZ: -17.6,
  arrowsZ: -4.57, // the seven aiming arrows, about 15 ft down the lane
  boards: 39, // the lane is 39 boards wide
  oilEndZ: -12.2, // the oiled front part (low friction) ends about here; the dry back end hooks
};

export const BALL = {
  radius: 0.1085,
  mass: 6.8, // 15 lb
};

export const PIN = {
  height: 0.381, // 15 in
  mass: 1.53,
  maxRadius: 0.0605,
  baseRadius: 0.0258,
  comHeight: 0.147, // centre of mass above the base
  spacing: 0.3048, // 12 in between neighbouring pin centres
  rowSpacing: 0.26396, // 12 in * sin(60 deg)
};

/** Standard pin spots. Pin 1 is the head pin, 7 is back-left and 10 is back-right as the bowler sees them. */
export const PIN_SPOTS = (() => {
  const out = [];
  let id = 1;
  for (let row = 0; row < 4; row++) {
    for (let i = 0; i <= row; i++) {
      out.push({ id: id++, row, x: (i - row / 2) * PIN.spacing, z: -LANE.length - row * PIN.rowSpacing });
    }
  }
  return out;
})();

/**
 * Pin outline as [height above the base, radius] pairs (USBC shape), base first, top last.
 * Use it for the lathe mesh and for the physics collider so they match. Pin local origin is the
 * CENTRE OF THE BASE: the pin stands on local y = 0 and its top is at local y = 0.381.
 */
export const PIN_PROFILE = [
  [0.0, 2.031 / 2],
  [0.75, 2.828 / 2],
  [2.25, 3.906 / 2],
  [3.375, 4.51 / 2],
  [4.5, 4.766 / 2],
  [5.875, 4.563 / 2],
  [7.25, 3.703 / 2],
  [8.625, 2.472 / 2],
  [9.375, 1.965 / 2],
  [10.0, 1.797 / 2],
  [10.875, 1.87 / 2],
  [11.75, 2.094 / 2],
  [12.625, 2.406 / 2],
  [13.5, 2.547 / 2],
  [14.25, 2.2 / 2],
  [14.75, 1.45 / 2],
  [15.0, 0.0],
].map(([h, r]) => [h * IN, r * IN]);

/** Limits of a throw. Input clamps to these, physics accepts anything inside them. */
export const THROW = {
  minSpeed: 3.5, // m/s (about 8 mph)
  maxSpeed: 10.5, // m/s (about 23.5 mph)
  typicalSpeed: 7.6, // m/s (17 mph), a comfortable throw
  maxX: 0.46, // |x| of the ball centre at the foul line
  maxAngle: 0.1, // rad, |angle| of the launch direction
};

/** Player colours (ball and UI). Exemoo palette. */
export const PLAYERS = [
  { name: 'Red', color: '#ff3b30', dark: '#b3160f' },
  { name: 'Blue', color: '#2f7cff', dark: '#1747b5' },
  { name: 'Yellow', color: '#ffd21f', dark: '#c79a00' },
  { name: 'Green', color: '#2fc65a', dark: '#16883a' },
];

export const INK = '#1b1b3a';
export const MPS_TO_MPH = 2.23694;
