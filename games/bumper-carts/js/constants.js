// Bumper Carts - every tuning number (PLAN.md section 6). Plain frozen objects, no imports.
// Units: metres, seconds, radians (unless a key says deg / ms). Floor plane is (x, z), y up, floor top y = 0.
// +x = screen right, +z = toward the camera ("up the screen" is -z).

const D2R = Math.PI / 180;
const deep = (o) => { for (const k of Object.keys(o)) if (o[k] && typeof o[k] === 'object') deep(o[k]); return Object.freeze(o); };

export const ARENA = deep({
  radius: 7,            // fence circle / floor edge (m)
  fallLine: 7.3,        // a cart whose centre passes this is falling
  spawnRing: 3.5,       // spawn points sit on this circle
  spawnPoints: 8,       // respawn candidates on the spawn ring
  moatInner: 7.45,      // visual: floor skirt ends, mud starts
  moatOuter: 11,        // visual: mud ends, bank starts
  mudY: -0.95,          // visual: mud surface height
});

export const CART = deep({
  radius: 0.55,
  accel: 14,            // m/s^2 at full intent
  drag: 2.5,            // 1/s  (top speed accel/drag = 5.6 m/s)
  turnRate: 9,          // rad/s facing turns toward velocity (or intent while charging)
  turnMinSpeed: 0.35,   // m/s below this the facing holds
  aimDead: 0.12,        // intent magnitude below this = dash along facing
});

export const CHARGE = deep({
  time: 1.0,            // s to full charge
  min: 0.15,            // releases under this are a honk (nothing happens)
  dashMin: 7,           // m/s dash at the minimum charge
  dashMax: 15,          // m/s dash at full charge
  dashTime: 0.35,       // s
  cooldown: 0.6,        // s after the dash ends
  accelMul: 0.25,       // drive accel while charging
  dragMul: 2,           // drag while charging
  dashDragMul: 0.3,     // drag while dashing
});

export const BUMP = deep({
  rest: 0.9,            // cart-cart restitution
  knock: 0.45,          // ram bonus per m/s of the rammer's approach speed
  dashMul: 1.6,         // rammer is dashing
  chargeMul: 1.25,      // victim is charging
  stunMul: 1.3,         // victim is already stunned
  dashKeep: 0.35,       // a dashing rammer keeps this fraction of its pre-hit speed
  clashClosing: 12,     // m/s, both dashing and closing faster = CLASH
  clashStun: 0.4,       // s
  stunMin: 0.15,        // s, stun = stunMin + stunPower * power
  stunPower: 0.5,
  powerDiv: 15,         // power = clamp(closing / powerDiv, 0, 1)
  creditPower: 0.25,    // above this power the victim remembers who hit it
  creditWindow: 4,      // s
  eventMin: 0.1,        // bump events fire at this power and above
  evenMargin: 1.0,      // m/s, approach speeds closer than this = an even bump (by = -1)
});

export const FENCE = deep({
  panels: 16,
  radius: 7,
  hp: 2,                // whole, cracked, gone
  breakSpeed: 6,        // m/s outward normal speed that takes 1 hp
  rest: 0.7,            // fence / post restitution
  postRadius: 0.15,     // posts sit between panels and never break
  wallEvent: 1.5,       // m/s, softer bounces emit a 'wall' thud above this (visual / sound only)
});

export const MATCH = deep({
  roundSeconds: 90,
  roundOptions: [60, 90, 120],
  stormAt: 25,          // s left: BARN STORM, every panel falls
  fallTime: 0.9,        // s from leaving the floor to the splash
  respawn: 2.0,         // s spent 'out' after the splash
  safeTime: 1.5,        // s of blinking after the drop-in
  fallMinOut: 2.0,      // m/s minimum outward speed while falling (clears the floor edge)
});

export const TILT = deep({
  dead: 0.07,           // ~4 deg
  full: 0.42,           // ~25 deg
  smoothMs: 40,         // one-pole smoothing
  noPacketMs: 1500,     // live goes false after this long without packets
  recenterMax: 0.5,     // recenter ignored if |raw| is above this (phone not near flat)
  gyroSpring: 1.5,      // s, gyro-only fallback springs back to flat with this time constant
  gyroMinDeg: 2,        // deg/s gyro noise floor
});

const lvl = (replan, aimErrDeg, chargeP, lead, lineUp, rimMargin, dodge, target, leaderBias) =>
  ({ replan, aimErr: aimErrDeg * D2R, chargeP, lead, lineUp, rimMargin, dodge, target, leaderBias });

export const AI = deep({
  //            replan aimErr chargeP lead  lineUp rimMargin dodge  target    leaderBias
  easy:   lvl(0.6,  25,  0.30, false, 0.0, 0.6, false, 'nearest', 0),
  normal: lvl(0.35, 12,  0.60, false, 0.5, 1.4, false, 'rim',     0),
  hard:   lvl(0.2,  5,   0.90, true,  1.0, 1.7, true,  'rim',     1.5),
  levels: ['easy', 'normal', 'hard'],
  lineUpDeg: 28,        // attacker is "lined up" if its line to the target is this close to the push line
  chargeRange: 5.5,     // m, only charge at targets nearer than this
  approachGap: 2.0,     // m behind the target on the push line
});

export const SEATS = deep([
  { name: 'Red Cow', color: '#ff3b30', animal: 'cow' },
  { name: 'Blue Pig', color: '#2f7cff', animal: 'pig' },
  { name: 'Green Sheep', color: '#2fc65a', animal: 'sheep' },
  { name: 'Yellow Chick', color: '#ffd21f', animal: 'chick' },
]);

export const PALETTE = deep({
  ink: '#1b1b3a', red: '#ff3b30', yellow: '#ffd21f', blue: '#2f7cff', green: '#2fc65a',
  wood: '#b8763e', woodLight: '#d99a5b', mud: '#6b4426', mudDark: '#4a2d17', straw: '#f2c45a', fence: '#fbf7ef',
});
