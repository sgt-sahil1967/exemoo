// Bale Brawl - all tuning numbers (PLAN.md section 4). Plain frozen objects, no imports.
// Units: metres, seconds, radians (unless a key says deg / ms). Y up, bale top y = 0.

const D2R = Math.PI / 180;
const deep = (o) => { for (const k of Object.keys(o)) if (o[k] && typeof o[k] === 'object') deep(o[k]); return Object.freeze(o); };

export const ARENA = deep({
  radius: 4.2,          // bale top radius (fighters ring out past this)
  waterY: -2.4,         // pond surface
  startX: 1.3,          // fighter 0 at -startX, fighter 1 at +startX
  teeter: 0.6,          // teeter band inside the rim
  baleTop: 0,
});

export const FIGHT = deep({
  engageGap: 1.6,       // auto footwork walks until the gap is this
  reach: 2.0,           // a strike only lands if the gap is under this
  walkSpeed: 1.2,       // m/s
  rimWalk: 0.25,        // the fighter nearer the rim walks in at this fraction of walkSpeed
  knockBase: 0.45,      // knockback = knockBase + knockPower * power (m)
  knockPower: 0.60,
  staggerMul: 1.6,      // victim already staggered
  wrongGuardMul: 0.5,   // guard up but at the wrong angle
  suddenMul: 1.5,       // applied by the host via setKnockScale
  knockDecay: 0.25,     // s, knock velocity decays over this
  hitStun: 0.35,        // s, victim cannot swing or guard
  clashWindow: 0.12,    // s, both strikes land within this = clash
  clashPush: 0.35,      // m each
  doubleRingout: 0.25,  // s, both off within this = draw
  minGap: 0.9,          // bodies never overlap closer than this
  fallTime: 0.9,        // s from ring-out to splash
});

export const SWING = deep({
  startRate: 220,       // deg/s
  fullRate: 700,        // deg/s
  maxMs: 180,           // ms, a swing fires at the latest this long after it starts
  cooldown: 0.38,       // s refractory after a swing
  humanDelay: 0.09,     // s default wind-up before a strike lands
  strikeTime: 0.16,     // s the visible arc lasts after the strike lands (recovery)
  lookbackMs: 60,       // ms before the start used as the tip-travel origin
  smoothMs: 35,         // ms one-pole filter on yaw/pitch
  bladeMinHypot: 0.35,  // bladeAngle only updates while hypot(bx,by) is above this
  noPacketMs: 1500,     // ms without packets = not live
});

export const GUARD = deep({
  raiseTime: 0.06,      // s before a raised guard counts
  lowerTime: 0.08,      // s to lower (cannot swing until lowered)
  blockMinDeg: 50,      // blocked if angle between swing line and blade is at least this (0..90)
  blockMin: 50 * D2R,
  staggerOnBlock: 0.7,  // s attacker stagger
  staggerPerfect: 1.0,  // s attacker stagger on a perfect block
  perfectWindow: 0.25,  // s guard raised less than this before the strike = perfect
  blockerSlide: 0.12,   // m
});

const diff = (readDelay, readAcc, guardUp, gapMin, gapMax, windup, powMin, powMax, counter, slip, combo) =>
  ({ readDelay, readAcc, guardUp, gapMin, gapMax, windup, powMin, powMax, counter, slip, combo });

export const AI = deep({
  easy:   diff(0.55, 0.55, 0.30, 1.6, 2.6, 0.50, 0.40, 0.70, 0.25, 0.00, 0.00),
  normal: diff(0.38, 0.72, 0.50, 1.1, 1.9, 0.40, 0.50, 0.85, 0.55, 0.30, 0.15),
  hard:   diff(0.26, 0.86, 0.68, 0.8, 1.4, 0.32, 0.60, 1.00, 0.85, 0.60, 0.40),
  champ:  diff(0.18, 0.94, 0.80, 0.6, 1.1, 0.26, 0.70, 1.00, 1.00, 0.85, 0.60),
  pressEdge: { hard: 0.7, champ: 0.6 },   // attack-gap multiplier while the rival teeters
  levels: ['easy', 'normal', 'hard', 'champ'],
});

export const MATCH = deep({
  bestOf: [3, 5], roundSeconds: 45, suddenShrinkSeconds: 12, suddenMinScale: 0.45, countdown: 3, ringoutPause: 2.2,
  splashDelay: 0.9,
});

export const PLAYERS = deep([
  { name: 'Red Cow', color: '#ff3b30', animal: 'cow' },
  { name: 'Blue Pig', color: '#2f7cff', animal: 'pig' },
]);

export const CPU_CAST = deep({
  easy: { name: 'Woolsworth', animal: 'sheep', color: '#2fc65a' },
  normal: { name: 'Billy Bonk', animal: 'goat', color: '#ffd21f' },
  hard: { name: 'Sir Loin', animal: 'bull', color: '#7b4dff' },
  champ: { name: 'Red Comb', animal: 'rooster', color: '#ff8a1f' },
});

export const PALETTE = deep({
  ink: '#1b1b3a', red: '#ff3b30', yellow: '#ffd21f', blue: '#2f7cff', green: '#2fc65a',
  water: '#2bb5e8', waterDeep: '#1679b8', straw: '#f2c45a', wood: '#b8763e',
});
