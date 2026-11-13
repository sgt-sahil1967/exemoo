// Lanes: maple boards with markings, pin decks, gutters, cappings, kickbacks, pits, approach floor.
// Five lanes side by side; the player's lane is the middle one at x = 0. All sizes come from constants.js.
import * as THREE from 'three';
import { LANE, PIN_SPOTS } from '../constants.js';
import { rng, makeCanvas, tex, merge, tbox, floorQuad, drawBoards } from './util.js';

export const LANE_PITCH = 1.72; // centre to centre
export const LANE_OFFSETS = [-2, -1, 0, 1, 2].map((k) => k * LANE_PITCH);
export const HALL_HALF = 2.5 * LANE_PITCH; // half width of the block of lanes
export const DECK_Z = LANE.kickbackStartZ; // the pin deck board starts where the kickbacks start
export const HOUSING_TOP = 1.05; // top of kickbacks / pinsetter interior

const HW = LANE.halfWidth, GW = LANE.gutterWidth;

function laneTexture() {
  const W = 1024, H = 4096, c = makeCanvas(W, H), g = c.getContext('2d'), r = rng(11);
  const len = -DECK_Z;
  drawBoards(g, 0, 0, W, H, { n: LANE.boards, rand: r, hue: 33, sat: 58, light: 65, dl: 4.5, segLen: [500, 1500] });
  const sx = W / LANE.width, sy = H / len;
  const px = (x) => (x + HW) * sx, py = (z) => -z * sy;
  const bw = LANE.width / LANE.boards, boardX = (b) => -HW + (b - 0.5) * bw;
  const ink = 'rgba(70,30,16,0.88)';
  // guide dots, about 6 and 7 ft past the foul line
  g.fillStyle = ink;
  for (const [z, boards] of [[-1.83, [3, 5, 8, 11, 14]], [-2.13, [3, 5, 8, 11, 14]]]) {
    for (const b of boards) for (const bb of [b, 40 - b]) {
      g.beginPath(); g.ellipse(px(boardX(bb)), py(z), 0.011 * sx, 0.011 * sy, 0, 0, Math.PI * 2); g.fill();
    }
  }
  // the seven arrows: a shallow V with the centre arrow furthest down the lane
  for (let k = -3; k <= 3; k++) {
    const x = boardX(20 + 5 * k), z0 = LANE.arrowsZ - 0.26 + Math.abs(k) * 0.17;
    g.beginPath();
    g.moveTo(px(x), py(z0 - 0.1));
    g.lineTo(px(x + 0.024), py(z0 + 0.1));
    g.lineTo(px(x), py(z0 + 0.055));
    g.lineTo(px(x - 0.024), py(z0 + 0.1));
    g.closePath(); g.fill();
  }
  // range finders
  g.fillStyle = 'rgba(70,30,16,0.7)';
  for (const [b, za, zb] of [[10, -10.36, -11.28], [30, -10.36, -11.28], [15, -12.19, -13.11], [25, -12.19, -13.11]]) {
    g.fillRect(px(boardX(b) - bw / 2), py(za), bw * sx, (za - zb) * sy);
  }
  // faint wear from thousands of balls down the middle
  const wear = g.createLinearGradient(0, 0, W, 0);
  wear.addColorStop(0, 'rgba(60,30,10,0.10)'); wear.addColorStop(0.2, 'rgba(255,240,215,0.0)');
  wear.addColorStop(0.5, 'rgba(255,240,215,0.07)'); wear.addColorStop(0.8, 'rgba(255,240,215,0.0)'); wear.addColorStop(1, 'rgba(60,30,10,0.10)');
  g.fillStyle = wear; g.fillRect(0, 0, W, H);
  return tex(c, { aniso: 16 });
}

function deckTexture() {
  const W = 1024, H = 1536, c = makeCanvas(W, H), g = c.getContext('2d'), r = rng(23);
  const len = DECK_Z - LANE.deckEndZ;
  drawBoards(g, 0, 0, W, H, { n: LANE.boards, rand: r, hue: 27, sat: 52, light: 47, dl: 4, segLen: [700, 1600] });
  const sx = W / LANE.width, sy = H / len;
  const px = (x) => (x + HW) * sx, py = (z) => (DECK_Z - z) * sy;
  // joint between lane and deck
  g.fillStyle = 'rgba(30,14,6,0.7)'; g.fillRect(0, 0, W, 3);
  for (const s of PIN_SPOTS) {
    g.fillStyle = 'rgba(24,16,20,0.62)';
    g.beginPath(); g.ellipse(px(s.x), py(s.z), 0.0305 * sx, 0.0305 * sy, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(255,225,190,0.25)'; g.lineWidth = 2;
    g.beginPath(); g.ellipse(px(s.x), py(s.z), 0.034 * sx, 0.034 * sy, 0, 0, Math.PI * 2); g.stroke();
  }
  // scuffs where pins slide
  for (let i = 0; i < 260; i++) {
    g.strokeStyle = `rgba(255,235,210,${0.02 + r() * 0.05})`; g.lineWidth = 1 + r() * 1.5;
    const x = r() * W, y = r() * H, a = r() * Math.PI * 2, l = 10 + r() * 50;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  return tex(c, { aniso: 16 });
}

function approachTexture() {
  const W = 1024, H = 2048, c = makeCanvas(W, H), g = c.getContext('2d'), r = rng(37);
  const n = Math.round(LANE.boards * LANE_PITCH / LANE.width);
  drawBoards(g, 0, 0, W, H, { n, rand: r, hue: 31, sat: 55, light: 60, dl: 5, segLen: [350, 900] });
  const sx = W / LANE_PITCH, sy = H / LANE.approach;
  const px = (x) => (x + LANE_PITCH / 2) * sx, py = (z) => (LANE.approach - z) * sy; // canvas top = far from the foul line
  const bw = LANE.width / LANE.boards;
  g.fillStyle = 'rgba(70,30,16,0.88)';
  for (const z of [0.1, 3.66, 4.45]) for (let b = 5; b <= 35; b += 5) {
    if (z < 1 && (b === 5 || b === 35)) continue;
    g.beginPath(); g.ellipse(px((b - 20) * bw), py(z), 0.012 * sx, 0.012 * sy, 0, 0, Math.PI * 2); g.fill();
  }
  return tex(c, { aniso: 16, wrap: true });
}

function curtainTexture() {
  const W = 512, H = 256, c = makeCanvas(W, H), g = c.getContext('2d');
  g.fillStyle = '#0b0b12'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 26; i++) {
    const x = (i + 0.5) / 26 * W, grd = g.createLinearGradient(x - 10, 0, x + 10, 0);
    grd.addColorStop(0, 'rgba(0,0,0,0)'); grd.addColorStop(0.5, 'rgba(70,70,100,0.35)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(x - 10, 0, 20, H);
  }
  const v = g.createLinearGradient(0, 0, 0, H);
  v.addColorStop(0, 'rgba(0,0,0,0.75)'); v.addColorStop(0.6, 'rgba(0,0,0,0.1)'); v.addColorStop(1, 'rgba(0,0,0,0.3)');
  g.fillStyle = v; g.fillRect(0, 0, W, H);
  return tex(c);
}

/** One half-pipe gutter strip. xInner is the lane edge, dir = +1 / -1 is the side it lies on. */
function gutterGeo(xInner, dir, z0, z1) {
  const d = LANE.gutterDepth, R = (GW * GW / 4 + d * d) / (2 * d), cx = xInner + dir * GW / 2, cy = R - d;
  const phi0 = Math.asin(GW / 2 / R), N = 12, pos = [], uv = [], idx = [];
  for (let i = 0; i <= N; i++) {
    const phi = -phi0 + 2 * phi0 * i / N, x = cx + R * Math.sin(phi), y = cy - R * Math.cos(phi);
    pos.push(x, y, z0, x, y, z1); uv.push(i / N, 0, i / N, 1);
  }
  for (let i = 0; i < N; i++) { const a = i * 2, b = a + 2, c = a + 1, e = a + 3; idx.push(a, b, c, b, e, c); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}

/**
 * Build every lane. `reflective(material, strength)` patches a material to show the planar reflection.
 * Reflective surfaces go on layer `noReflLayer` only so the mirror pass skips them.
 */
export function buildLanes({ scene, reflective, noReflLayer }) {
  const group = new THREE.Group();
  const lanes = [], decks = [], gutters = [], caps = [], kicks = [], pits = [], curtains = [], tails = [];
  LANE_OFFSETS.forEach((cx, i) => {
    const flip = i % 2 === 1;
    lanes.push(floorQuad(cx - HW, cx + HW, 0, DECK_Z, 0, flip ? 1 : 0, flip ? 0 : 1));
    decks.push(floorQuad(cx - HW, cx + HW, DECK_Z, LANE.deckEndZ, 0));
    for (const dir of [-1, 1]) {
      gutters.push(gutterGeo(cx + dir * HW, dir, 0, LANE.deckEndZ));
      const gx = HW + GW; // outer gutter edge
      const capW = LANE_PITCH / 2 - gx;
      // division capping from the foul line to the kickback
      caps.push(tbox(capW, 0.09, -DECK_Z, cx + dir * (gx + capW / 2), -0.015, DECK_Z / 2));
      // little flat rim between gutter and kickback beside the deck
      caps.push(tbox(LANE.kickbackX - gx, 0.06, DECK_Z - LANE.deckEndZ, cx + dir * (gx + LANE.kickbackX) / 2, -0.03, (DECK_Z + LANE.deckEndZ) / 2));
      // kickback wall
      const kw = LANE_PITCH / 2 - LANE.kickbackX, kh = HOUSING_TOP - LANE.pitFloorY, kl = DECK_Z - LANE.pitBackZ;
      kicks.push(tbox(kw, kh, kl, cx + dir * (LANE.kickbackX + kw / 2), LANE.pitFloorY + kh / 2, (DECK_Z + LANE.pitBackZ) / 2));
    }
    pits.push(floorQuad(cx - LANE.kickbackX, cx + LANE.kickbackX, LANE.deckEndZ, LANE.pitBackZ, LANE.pitFloorY));
    // tail plank: the end face of the deck dropping into the pit
    tails.push(tbox(LANE.kickbackX * 2, -LANE.pitFloorY + 0.06, 0.02, cx, LANE.pitFloorY / 2 - 0.03, LANE.deckEndZ - 0.0101));
    const cur = new THREE.PlaneGeometry(LANE.kickbackX * 2, HOUSING_TOP - LANE.pitFloorY);
    cur.translate(cx, (HOUSING_TOP + LANE.pitFloorY) / 2, LANE.pitBackZ);
    curtains.push(cur);
  });

  const laneMat = reflective(new THREE.MeshStandardMaterial({ map: laneTexture(), roughness: 0.34, envMapIntensity: 0.3 }), 1.0);
  const deckMat = reflective(new THREE.MeshStandardMaterial({ map: deckTexture(), roughness: 0.3, envMapIntensity: 0.3 }), 0.85);
  const apprMat = reflective(new THREE.MeshStandardMaterial({ map: approachTexture(), roughness: 0.38, envMapIntensity: 0.3 }), 0.7);
  const add = (geo, mat, { receive = true, refl = false } = {}) => {
    const m = new THREE.Mesh(geo, mat);
    m.receiveShadow = receive; m.matrixAutoUpdate = false;
    if (refl) m.layers.set(noReflLayer);
    group.add(m);
    return m;
  };
  add(merge(lanes), laneMat, { refl: true });
  add(merge(decks), deckMat, { refl: true });
  add(floorQuad(-HALL_HALF, HALL_HALF, LANE.approach, 0, 0, 0, 5, 1, 0), apprMat, { refl: true, receive: false });
  add(merge(gutters), new THREE.MeshStandardMaterial({ color: '#262633', roughness: 0.36, metalness: 0.1 }));
  add(merge(caps), new THREE.MeshStandardMaterial({ color: '#2a2440', roughness: 0.42 }));
  add(merge(kicks), new THREE.MeshStandardMaterial({ color: '#1d1a2c', roughness: 0.6 }));
  add(merge(pits), new THREE.MeshStandardMaterial({ color: '#0c0c12', roughness: 0.95 }));
  add(merge(tails), new THREE.MeshStandardMaterial({ color: '#3a2413', roughness: 0.7 }));
  add(merge(curtains), new THREE.MeshStandardMaterial({ map: curtainTexture(), roughness: 0.95, color: '#9a9ab0' }));
  // foul line across every lane, with the little sensor housings at each lane edge
  const foul = [];
  for (const cx of LANE_OFFSETS) {
    foul.push(tbox(LANE.width + GW * 2, 0.004, 0.022, cx, 0.0005, -0.001));
  }
  const fl = add(merge(foul), new THREE.MeshStandardMaterial({ color: '#17131f', roughness: 0.4 }), { receive: false });
  fl.layers.set(noReflLayer);
  const sensors = [];
  for (const cx of LANE_OFFSETS) for (const dir of [-1, 1]) sensors.push(tbox(0.07, 0.05, 0.1, cx + dir * (LANE_PITCH / 2 - 0.045), 0.05, -0.05));
  add(merge(sensors), new THREE.MeshStandardMaterial({ color: '#b3160f', roughness: 0.4, emissive: '#ff2a1a', emissiveIntensity: 0.6 }), { receive: false });
  scene.add(group);
  return { group, laneMat, deckMat, apprMat };
}
