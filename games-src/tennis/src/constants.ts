// Court dimensions in metres. Origin at the centre of the net, y up.
// The human player is on the +z side, the AI on the -z side.
export const COURT = {
  halfLen: 11.885,
  singlesHalfW: 4.115,
  doublesHalfW: 5.485,
  serviceLine: 6.4,
  netH: 0.914,
  postH: 1.07,
  postX: 6.4,
};

export const BALL_R = 0.033;

export function netHeightAt(x: number): number {
  const t = Math.min(1, Math.abs(x) / COURT.postX);
  return COURT.netH + (COURT.postH - COURT.netH) * t * t;
}

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => t * t * (3 - 2 * t);

export function gauss(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
