// Pins, balls, the pin end (masking unit, neon sign, rack, sweep) and the barn around the lanes.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { LANE, PIN, PIN_PROFILE, PIN_SPOTS, BALL, PLAYERS } from '../constants.js';
import { rng, makeCanvas, tex, merge, mergeColored, xf, tbox, drawBoards, neonText, neonPath, dotTexture, lerp, FONT } from './util.js';
import { LANE_PITCH, LANE_OFFSETS, HALL_HALF, DECK_Z, HOUSING_TOP } from './lane.js';

// ───────────────────────────── pins ─────────────────────────────
export function pinGeometry() {
  const P = PIN_PROFILE, H = PIN.height, last = P.length - 2;
  const rAt = (h) => {
    let i = 0;
    while (i < last && h > P[i + 1][0]) i++;
    const p0 = P[Math.max(i - 1, 0)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(i + 2, P.length - 1)];
    const d = p2[0] - p1[0], t = Math.min(1, Math.max(0, (h - p1[0]) / d));
    if (i === last) return p1[1] * Math.sqrt(Math.max(0, 1 - t * t)); // rounded crown
    const m1 = (p2[1] - p0[1]) / (p2[0] - p0[0]) * d, m2 = (p3[1] - p1[1]) / (p3[0] - p1[0]) * d;
    const t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * p1[1] + (t3 - 2 * t2 + t) * m1 + (-2 * t3 + 3 * t2) * p2[1] + (t3 - t2) * m2;
  };
  const pts = [new THREE.Vector2(0, 0), new THREE.Vector2(P[0][1] - 0.003, 0), new THREE.Vector2(P[0][1], 0.003)];
  const N = 64;
  for (let j = 1; j <= N; j++) {
    const s = j / N, h = Math.max(0.006, H * (1 - Math.pow(1 - s, 1.4)));
    pts.push(new THREE.Vector2(Math.max(0, rAt(h)), h));
  }
  pts[pts.length - 1].set(0, H);
  const g = new THREE.LatheGeometry(pts, 40);
  const pos = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setY(i, pos.getY(i) / H);
  g.computeVertexNormals();
  // lathe seam: copy the normals of the first column onto the last so the seam is invisible
  const n = g.attributes.normal, rows = pts.length;
  for (let j = 0; j < rows; j++) n.setXYZ(40 * rows + j, n.getX(j), n.getY(j), n.getZ(j));
  return g;
}

export function pinMaterial() {
  const S = 512, c = makeCanvas(S, S), g = c.getContext('2d'), IN = 0.0254;
  const y = (inch) => (1 - inch * IN / PIN.height) * S;
  g.fillStyle = '#f8f5ee'; g.fillRect(0, 0, S, S);
  const shade = g.createLinearGradient(0, 0, 0, S);
  shade.addColorStop(0, 'rgba(255,255,255,0)'); shade.addColorStop(1, 'rgba(210,190,160,0.22)');
  g.fillStyle = shade; g.fillRect(0, 0, S, S);
  g.fillStyle = '#d9241b';
  g.fillRect(0, y(11.2), S, y(10.62) - y(11.2));
  g.fillRect(0, y(10.2), S, y(9.62) - y(10.2));
  g.fillStyle = '#b9b3a6'; g.fillRect(0, y(0.3), S, S - y(0.3));
  g.fillStyle = '#d9241b'; g.font = `40px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (const u of [0.25, 0.75]) g.fillText('MOO', u * S, y(4.6));
  return new THREE.MeshPhysicalMaterial({ map: tex(c), roughness: 0.24, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.0 });
}

// ───────────────────────────── balls ─────────────────────────────
function hash3(x, y, z) {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1440662683);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function vnoise(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  let fx = x - xi, fy = y - yi, fz = z - zi;
  fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); fz = fz * fz * (3 - 2 * fz);
  const a = lerp(lerp(hash3(xi, yi, zi), hash3(xi + 1, yi, zi), fx), lerp(hash3(xi, yi + 1, zi), hash3(xi + 1, yi + 1, zi), fx), fy);
  const b = lerp(lerp(hash3(xi, yi, zi + 1), hash3(xi + 1, yi, zi + 1), fx), lerp(hash3(xi, yi + 1, zi + 1), hash3(xi + 1, yi + 1, zi + 1), fx), fy);
  return lerp(a, b, fz);
}
const fbm = (x, y, z) => (vnoise(x, y, z) + 0.5 * vnoise(x * 2.1, y * 2.1, z * 2.1) + 0.25 * vnoise(x * 4.3, y * 4.3, z * 4.3)) / 1.75;

/** Swirled pearl skin (equirectangular) with three finger holes painted at u = 0.5 (local +X). */
export function ballMaterial(player) {
  const W = 512, H = 256, small = makeCanvas(W, H), sg = small.getContext('2d');
  const img = sg.createImageData(W, H), d = img.data;
  const base = new THREE.Color(PLAYERS[player].color).convertLinearToSRGB(), dark = new THREE.Color(PLAYERS[player].dark).convertLinearToSRGB();
  // work in display space: Color parses to linear, convert back for painting
  const seed = 5 + player * 17.3;
  for (let j = 0; j < H; j++) {
    const lat = (0.5 - (j + 0.5) / H) * Math.PI, cl = Math.cos(lat), sl = Math.sin(lat);
    for (let i = 0; i < W; i++) {
      const lon = (i + 0.5) / W * Math.PI * 2, x = cl * Math.cos(lon), y = sl, z = cl * Math.sin(lon);
      const w = fbm(x * 1.5 + seed, y * 1.5, z * 1.5 - seed);
      const w2 = fbm(x * 3.1 - seed, y * 3.1 + 4, z * 3.1);
      let s = Math.sin((y * 2.0 + x * 0.8 + w * 6.5 + w2 * 1.6) * 2.7) * 0.5 + 0.5;
      s = s * s * (3 - 2 * s);
      const pearl = Math.pow(Math.max(0, Math.sin((w2 * 5 + w * 3 + z) * 3.1)), 6) * 0.55;
      const k = (i + j * W) * 4;
      d[k] = 255 * Math.min(1, lerp(dark.r * 0.55, base.r, s) + pearl);
      d[k + 1] = 255 * Math.min(1, lerp(dark.g * 0.55, base.g, s) + pearl);
      d[k + 2] = 255 * Math.min(1, lerp(dark.b * 0.55, base.b, s) + pearl);
      d[k + 3] = 255;
    }
  }
  sg.putImageData(img, 0, 0);
  const c = makeCanvas(1024, 512), g = c.getContext('2d');
  g.imageSmoothingQuality = 'high';
  g.drawImage(small, 0, 0, 1024, 512);
  const ppr = 1024 / (Math.PI * 2);
  const hole = (dx, dy, r) => {
    const x = 512 + dx * ppr, y = 256 + dy * ppr, R = r * ppr;
    const grd = g.createRadialGradient(x, y - R * 0.25, R * 0.1, x, y, R);
    grd.addColorStop(0, '#000'); grd.addColorStop(0.8, '#07060c'); grd.addColorStop(1, '#1d1a28');
    g.fillStyle = grd; g.beginPath(); g.arc(x, y, R, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 1.6; g.beginPath(); g.arc(x, y, R + 1, 0.2, Math.PI - 0.2); g.stroke();
  };
  hole(-0.13, -0.15, 0.1); hole(0.13, -0.15, 0.1); hole(0, 0.22, 0.118);
  // maker's mark opposite the holes so the roll reads from every side
  g.save(); g.translate(0, 256); g.fillStyle = 'rgba(255,255,255,0.85)'; g.font = `44px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('MOO', 60, 0); g.fillText('MOO', 1024 + 60, 0); g.restore();
  g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 3; g.beginPath(); g.arc(256, 256, 30, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.arc(768, 256, 30, 0, Math.PI * 2); g.stroke();
  return new THREE.MeshPhysicalMaterial({ map: tex(c), roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.1 });
}
export const ballGeometry = () => new THREE.SphereGeometry(BALL.radius, 48, 32);

// ───────────────────────────── pin end ─────────────────────────────
export const MASK_BOTTOM = 0.66, MASK_TOP = 2.3, MASK_Z = -17.42;
export const RACK_TRAVEL = 0.46;
export const SWEEP_FRONT_Z = DECK_Z - 0.1, SWEEP_BACK_Z = LANE.deckEndZ - 0.12, SWEEP_UP = 0.74;

export function buildPinEnd({ scene, pinGeo, pinMat }) {
  const neons = [];
  const neon = (canvas, w, h, x, y, z, ry = 0, boost = 1.5) => {
    const mat = new THREE.MeshBasicMaterial({ map: tex(canvas), transparent: true, toneMapped: false, depthWrite: false });
    mat.color.setScalar(boost);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.position.set(x, y, z); m.rotation.y = ry; m.renderOrder = 2;
    scene.add(m); neons.push({ mat, base: boost });
    return m;
  };
  // masking unit across all lanes + housing roof
  const W = HALL_HALF * 2;
  const dark = new THREE.MeshStandardMaterial({ color: '#15143a', roughness: 0.32, metalness: 0.2 });
  const mask = new THREE.Mesh(merge([
    tbox(W, MASK_TOP - MASK_BOTTOM, 0.22, 0, (MASK_TOP + MASK_BOTTOM) / 2, MASK_Z - 0.11),
    tbox(W, 0.08, 3.0, 0, HOUSING_TOP + 0.04, MASK_Z - 1.5),
  ]), dark);
  scene.add(mask);
  const trim = new THREE.Mesh(merge([
    tbox(W, 0.05, 0.25, 0, MASK_BOTTOM + 0.025, MASK_Z - 0.11),
    tbox(W, 0.07, 0.27, 0, MASK_TOP, MASK_Z - 0.11),
  ]), new THREE.MeshStandardMaterial({ color: '#ffd21f', roughness: 0.35, emissive: '#ffb300', emissiveIntensity: 0.35 }));
  scene.add(trim);
  // main neon sign
  {
    const c = makeCanvas(2048, 512), g = c.getContext('2d');
    neonText(g, 'MOO', 590, 262, 290, '#ffd21f', { tube: 0.05, fill: true });
    neonText(g, 'BOWL', 1400, 262, 290, '#ff3b5c', { tube: 0.05, fill: true });
    neonPath(g, (p) => { p.roundRect(60, 50, 1928, 412, 120); }, '#3d8bff', 12);
    const star = (x, y, r) => neonPath(g, (p) => { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; p[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr); } p.closePath(); }, '#2fe06a', 7);
    star(215, 256, 62); star(1833, 256, 62);
    neon(c, 4.9, 1.225, 0, 1.56, MASK_Z + 0.012, 0, 1.7);
  }
  // lane numbers under the sign
  {
    const c = makeCanvas(2048, 96), g = c.getContext('2d');
    LANE_OFFSETS.forEach((cx, i) => neonText(g, String(i + 3), (cx + HALL_HALF) / W * 2048, 50, 70, i === 2 ? '#ffd21f' : '#7fb2ff', { tube: 0.09 }));
    neon(c, W, W * 96 / 2048, 0, 0.83, MASK_Z + 0.012, 0, 1.3);
  }
  // rack (pin table): plate with ten cups on two guide rods; local y = 0 is "resting on the pins"
  const rack = new THREE.Group();
  {
    const cz = (PIN_SPOTS[0].z + PIN_SPOTS[9].z) / 2, parts = [tbox(1.34, 0.05, 1.08, 0, PIN.height + 0.075, cz)];
    for (const s of PIN_SPOTS) parts.push(xf(new THREE.CylinderGeometry(0.058, 0.066, 0.1, 16, 1, true), [s.x, PIN.height + 0.0, s.z]));
    for (const sx of [-0.6, 0.6]) parts.push(tbox(0.05, 0.9, 0.05, sx, PIN.height + 0.55, cz));
    const m = new THREE.Mesh(merge(parts), new THREE.MeshStandardMaterial({ color: '#2b2b44', roughness: 0.45, metalness: 0.5, side: THREE.DoubleSide }));
    m.castShadow = true; rack.add(m);
    rack.position.y = RACK_TRAVEL;
  }
  scene.add(rack);
  // sweep bar: local origin on the lane at the bar
  const sweep = new THREE.Group();
  {
    const bw = LANE.kickbackX * 2 - 0.05;
    const bar = new THREE.Mesh(new RoundedBoxGeometry(bw, 0.1, 0.05, 2, 0.012), new THREE.MeshStandardMaterial({ color: '#e6332a', roughness: 0.4 }));
    bar.position.y = 0.07; bar.castShadow = true;
    const c = makeCanvas(512, 40), g = c.getContext('2d');
    g.fillStyle = '#fff'; g.font = `34px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('MOO  BOWL', 256, 22);
    const label = new THREE.Mesh(new THREE.PlaneGeometry(bw * 0.7, bw * 0.7 * 40 / 512), new THREE.MeshBasicMaterial({ map: tex(c), transparent: true }));
    label.position.set(0, 0.07, 0.0262);
    const arms = new THREE.Mesh(merge([-1, 1].map((s) => tbox(0.035, 0.9, 0.035, s * (bw / 2 - 0.03), 0.52, -0.02, { rx: -0.12 }))), new THREE.MeshStandardMaterial({ color: '#8d8fa3', roughness: 0.35, metalness: 0.8 }));
    arms.castShadow = true;
    sweep.add(bar, label, arms);
    sweep.position.set(0, SWEEP_UP, SWEEP_FRONT_Z);
  }
  scene.add(sweep);
  // pins on the neighbouring lanes
  const sets = [null, [4, 6, 7, 8, 9, 10], null, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [2, 4, 5, 7, 8]];
  const list = [];
  LANE_OFFSETS.forEach((cx, i) => { if (cx === 0) return; for (const s of PIN_SPOTS) if (!sets[i] || sets[i].includes(s.id)) list.push([cx + s.x, s.z]); });
  const inst = new THREE.InstancedMesh(pinGeo, pinMat, list.length);
  const m4 = new THREE.Matrix4();
  list.forEach(([x, z], i) => { m4.makeRotationY(i * 1.7); m4.setPosition(x, 0, z); inst.setMatrixAt(i, m4); });
  inst.castShadow = true; inst.receiveShadow = true;
  scene.add(inst);
  return { rack, sweep, neons, neon };
}

// ───────────────────────────── barn ─────────────────────────────
export const BARN = { wallX: 6.3, zBack: 9.5, zFront: -17.7, eave: 4.6, ridge: 7.6, deckY: 0.16 };

function makeCow(seed) {
  const r = rng(seed + 3), WHITE = '#fffaf0', INKC = '#26243a', PINK = '#ffb3c1', patch = r() > 0.4 ? INKC : '#9a5a2c';
  const sph = (rx, ry, rz, p, seg = 16) => xf(new THREE.SphereGeometry(1, seg, Math.max(8, seg * 0.7 | 0)), p, [0, 0, 0], [rx, ry, rz]);
  const body = [[xf(new THREE.CapsuleGeometry(0.44, 0.72, 8, 22), [0, 0.95, 0.05], [Math.PI / 2, 0, 0]), WHITE]];
  for (let i = 0; i < 6; i++) {
    const a = r() * Math.PI * 2, z = -0.45 + r() * 1.0, s = 0.16 + r() * 0.14, up = 0.35 + r() * 0.6;
    body.push([sph(s, s, s * 1.3, [Math.cos(a) * 0.36, 0.95 + Math.sin(a) * 0.36 * up + 0.05, z + 0.05], 12), patch]);
  }
  for (const lx of [-0.25, 0.25]) for (const lz of [-0.42, 0.55]) {
    body.push([xf(new THREE.CylinderGeometry(0.12, 0.1, 0.62, 12), [lx, 0.33, lz]), WHITE]);
    body.push([xf(new THREE.CylinderGeometry(0.105, 0.11, 0.12, 12), [lx, 0.06, lz]), INKC]);
  }
  body.push([sph(0.19, 0.14, 0.2, [0, 0.52, 0.5], 12), PINK]);
  body.push([xf(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 6), [0, 1.0, 0.98], [0.25, 0, 0]), WHITE]);
  body.push([sph(0.07, 0.12, 0.07, [0, 0.68, 1.06], 8), patch]);
  const head = [[sph(0.33, 0.31, 0.35, [0, 0.1, -0.05], 20), WHITE], [sph(0.24, 0.17, 0.18, [0, -0.03, -0.33], 16), PINK],
    [sph(0.17, 0.16, 0.12, [0.17, 0.2, -0.16], 12), patch]];
  for (const s of [-1, 1]) {
    head.push([sph(0.03, 0.04, 0.02, [s * 0.08, -0.02, -0.5], 8), '#7a2e3e']);
    head.push([sph(0.085, 0.1, 0.055, [s * 0.18, 0.17, -0.27], 12), '#ffffff']);
    head.push([sph(0.048, 0.062, 0.03, [s * 0.185, 0.165, -0.31], 10), INKC]);
    head.push([sph(0.2, 0.085, 0.12, [s * 0.38, 0.2, 0.0], 12), WHITE]);
    head.push([sph(0.14, 0.05, 0.08, [s * 0.39, 0.2, -0.04], 10), PINK]);
    head.push([xf(new THREE.ConeGeometry(0.07, 0.22, 10), [s * 0.16, 0.46, 0], [0, 0, -s * 0.3]), '#fff0c4']);
  }
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.62, envMapIntensity: 0.6 });
  const cow = new THREE.Group(), b = new THREE.Mesh(mergeColored(body), mat), h = new THREE.Mesh(mergeColored(head), mat);
  h.position.set(0, 1.22, -0.72);
  cow.add(b, h);
  cow.userData = { head: h, body: b, seed };
  return cow;
}

export function buildBarn({ scene, neon }) {
  const B = BARN, r = rng(91);
  const zLen = B.zBack - B.zFront, zMid = (B.zBack + B.zFront) / 2;
  const plankTex = (() => {
    const c = makeCanvas(1024, 1024), g = c.getContext('2d');
    drawBoards(g, 0, 0, 1024, 1024, { n: 8, rand: rng(5), hue: 25, sat: 48, light: 40, dl: 6, seam: 0.75, segLen: [900, 2400], grain: 1.4 });
    return tex(c, { wrap: true });
  })();
  const timberTex = (() => {
    const c = makeCanvas(512, 512), g = c.getContext('2d');
    drawBoards(g, 0, 0, 512, 512, { n: 2, rand: rng(6), hue: 24, sat: 45, light: 34, dl: 4, seam: 0.2, segLen: [2000, 3000], grain: 2.2 });
    return tex(c, { wrap: true });
  })();
  const wallMat = new THREE.MeshStandardMaterial({ map: plankTex, roughness: 0.85, color: '#c9a889', envMapIntensity: 0.4 });
  const roofMat = new THREE.MeshStandardMaterial({ map: plankTex, roughness: 0.9, color: '#6f5644', envMapIntensity: 0.3 });
  const timberMat = new THREE.MeshStandardMaterial({ map: timberTex, roughness: 0.75, color: '#d0a57c', envMapIntensity: 0.4 });
  const redMat = new THREE.MeshStandardMaterial({ map: plankTex, roughness: 0.7, color: '#b53a2e', envMapIntensity: 0.4 });
  const floorMat = new THREE.MeshStandardMaterial({ map: plankTex, roughness: 0.55, color: '#8a6a55', envMapIntensity: 0.5 });
  const creamMat = new THREE.MeshStandardMaterial({ color: '#f1e3c8', roughness: 0.6 });
  const add = (geos, mat) => { const m = new THREE.Mesh(merge(geos), mat); m.matrixAutoUpdate = false; scene.add(m); return m; };

  // shell
  const uv = 0.5;
  add([
    tbox(0.2, B.eave + 0.4, zLen, -B.wallX - 0.1, B.eave / 2, zMid, { uv }), tbox(0.2, B.eave + 0.4, zLen, B.wallX + 0.1, B.eave / 2, zMid, { uv }),
    tbox(B.wallX * 2, B.ridge, 0.2, 0, B.ridge / 2, B.zBack + 0.1, { uv }),
    tbox(B.wallX * 2, B.ridge - MASK_TOP + 0.1, 0.2, 0, (B.ridge + MASK_TOP) / 2, B.zFront - 0.1, { uv }),
    // side returns beside the masking unit
    ...[-1, 1].map((s) => tbox(B.wallX - HALL_HALF, MASK_TOP, 0.2, s * (B.wallX + HALL_HALF) / 2, MASK_TOP / 2, MASK_Z - 0.1, { uv })),
  ], wallMat);
  const slope = Math.hypot(B.wallX + 0.3, B.ridge - B.eave), ang = Math.atan2(B.ridge - B.eave, B.wallX);
  add([-1, 1].map((s) => tbox(slope + 0.3, 0.12, zLen, s * B.wallX / 2, (B.eave + B.ridge) / 2 + 0.1, zMid, { rz: -s * ang, uv })), roofMat);
  // floors: concourse behind the approach and raised side decks
  add([
    tbox(B.wallX * 2, 0.1, B.zBack - LANE.approach, 0, -0.05, (B.zBack + LANE.approach) / 2, { uv }),
    ...[-1, 1].map((s) => tbox(B.wallX - HALL_HALF, B.deckY + 0.3, LANE.approach - MASK_Z, s * (B.wallX + HALL_HALF) / 2, B.deckY / 2 - 0.15, (LANE.approach + MASK_Z) / 2, { uv })),
  ], floorMat);
  // wainscot + trim
  const wains = [], trims = [];
  for (const s of [-1, 1]) {
    wains.push(tbox(0.05, 1.25, zLen, s * (B.wallX - 0.025), B.deckY + 0.625, zMid, { uv }));
    trims.push(tbox(0.08, 0.07, zLen, s * (B.wallX - 0.04), B.deckY + 1.28, zMid));
  }
  add(wains, redMat);
  // timber frame
  const frame = [], trussZ = [];
  for (let z = 7.5; z > B.zFront; z -= 3.5) trussZ.push(z);
  for (const z of trussZ) {
    frame.push(tbox(B.wallX * 2, 0.24, 0.24, 0, B.eave, z, { uv: 1 }));
    frame.push(tbox(0.22, B.ridge - B.eave - 0.2, 0.22, 0, (B.eave + B.ridge) / 2 - 0.1, z, { uv: 1 }));
    for (const s of [-1, 1]) {
      frame.push(tbox(slope, 0.24, 0.2, s * B.wallX / 2, (B.eave + B.ridge) / 2 - 0.1, z, { rz: -s * ang }));
      const sl = Math.hypot(B.wallX / 2, (B.ridge - B.eave) / 2 - 0.2);
      frame.push(tbox(sl, 0.16, 0.16, s * B.wallX / 4, B.eave + (B.ridge - B.eave) / 4, z, { rz: s * Math.atan2((B.ridge - B.eave) / 2 - 0.2, B.wallX / 2) }));
      frame.push(tbox(0.24, B.eave, 0.24, s * (B.wallX - 0.12), B.eave / 2, z));
    }
  }
  for (const s of [-1, 1]) for (const k of [0.3, 0.62, 0.98]) {
    frame.push(tbox(0.16, 0.18, zLen, s * B.wallX * k, lerp(B.ridge, B.eave, k) - 0.02, zMid, { rz: -s * ang }));
  }
  add(frame, timberMat);

  // windows with evening sky
  const skyC = makeCanvas(256, 256), sg = skyC.getContext('2d');
  const grd = sg.createLinearGradient(0, 0, 0, 256);
  [[0, '#161a4d'], [0.4, '#4a2f78'], [0.68, '#d6506a'], [0.86, '#ff9a4a'], [1, '#ffd98a']].forEach(([k, c]) => grd.addColorStop(k, c));
  sg.fillStyle = grd; sg.fillRect(0, 0, 256, 256);
  sg.fillStyle = '#fff'; for (let i = 0; i < 26; i++) sg.fillRect(r() * 256, r() * 110, 1.5, 1.5);
  sg.fillStyle = '#1b1438'; sg.beginPath(); sg.moveTo(0, 256); sg.lineTo(0, 215); sg.quadraticCurveTo(70, 180, 140, 222); sg.quadraticCurveTo(200, 196, 256, 226); sg.lineTo(256, 256); sg.fill();
  const skyMat = new THREE.MeshBasicMaterial({ map: tex(skyC), toneMapped: false }); skyMat.color.setScalar(1.15);
  const panes = [], wins = [];
  for (const s of [-1, 1]) for (const z of [-1.5, -6.5, -11.5, -15.4, 3.5]) {
    const x = s * (B.wallX - 0.012), y = 3.05, w = 1.7, h = 1.35;
    panes.push(xf(new THREE.PlaneGeometry(w, h), [x, y, z], [0, -s * Math.PI / 2, 0]));
    const xt = s * (B.wallX - 0.04);
    trims.push(tbox(0.08, 0.1, w + 0.2, xt, y + h / 2 + 0.05, z), tbox(0.08, 0.1, w + 0.2, xt, y - h / 2 - 0.05, z),
      tbox(0.08, h, 0.1, xt, y, z - w / 2 - 0.05), tbox(0.08, h, 0.1, xt, y, z + w / 2 + 0.05), tbox(0.06, h, 0.05, xt, y, z), tbox(0.06, 0.05, w, xt, y, z));
    wins.push([x, y, z]);
  }
  // hayloft window in the gable above the pins
  panes.push(xf(new THREE.CircleGeometry(0.75, 40), [0, 5.75, B.zFront + 0.012]));
  trims.push(xf(new THREE.TorusGeometry(0.78, 0.07, 8, 40), [0, 5.75, B.zFront + 0.03]), tbox(1.5, 0.06, 0.06, 0, 5.75, B.zFront + 0.03), tbox(0.06, 1.5, 0.06, 0, 5.75, B.zFront + 0.03));
  add(panes, skyMat);
  add(trims, creamMat);

  // string lights
  const bulbs = [], wire = [];
  const strand = (a, b, sag, n) => {
    let prev = null;
    for (let i = 0; i <= n; i++) {
      const t = i / n, p = [lerp(a[0], b[0], t), lerp(a[1], b[1], t) - sag * 4 * t * (1 - t), lerp(a[2], b[2], t)];
      if (prev) wire.push(...prev, ...p);
      if (i > 0 && i < n) bulbs.push([p[0], p[1] - 0.06, p[2]]);
      prev = p;
    }
  };
  for (let i = 0; i < trussZ.length - 1; i++) {
    const s = i % 2 ? 1 : -1;
    strand([s * (B.wallX - 0.3), B.eave - 0.25, trussZ[i]], [-s * (B.wallX - 0.3), B.eave - 0.25, trussZ[i + 1]], 0.85, 22);
  }
  for (const s of [-1, 1]) strand([s * (B.wallX - 0.15), 2.15, 4], [s * (B.wallX - 0.15), 2.15, MASK_Z], 0.0, 44);
  const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.Float32BufferAttribute(wire, 3));
  scene.add(new THREE.LineSegments(wg, new THREE.LineBasicMaterial({ color: '#17110c' })));
  const bulbMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffcf8a').multiplyScalar(3.2) });
  const bulbMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.042, 10, 8), bulbMat, bulbs.length);
  const m4 = new THREE.Matrix4(), bp = new Float32Array(bulbs.length * 3);
  bulbs.forEach((p, i) => { m4.makeTranslation(p[0], p[1], p[2]); bulbMesh.setMatrixAt(i, m4); bp.set(p, i * 3); });
  scene.add(bulbMesh);
  const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.BufferAttribute(bp, 3));
  const glowMat = new THREE.PointsMaterial({ map: dotTexture(64), color: '#ffb866', size: 0.55, sizeAttenuation: true, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });
  scene.add(new THREE.Points(gg, glowMat));

  // pendant lamps over the approach
  const shades = [], discs = [];
  for (const cx of LANE_OFFSETS) {
    shades.push(xf(new THREE.ConeGeometry(0.34, 0.26, 24, 1, true), [cx, 3.3, 1.7]), tbox(0.02, B.eave - 3.4, 0.02, cx, (B.eave + 3.4) / 2, 1.7));
    discs.push(xf(new THREE.CircleGeometry(0.3, 24), [cx, 3.2, 1.7], [Math.PI / 2, 0, 0]));
  }
  add(shades, new THREE.MeshStandardMaterial({ color: '#2c5a44', roughness: 0.4, metalness: 0.3, side: THREE.DoubleSide }));
  add(discs, new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd9a0').multiplyScalar(2.6) }));

  // hay bales
  const hayC = makeCanvas(256, 256), hg = hayC.getContext('2d');
  hg.fillStyle = '#d3a640'; hg.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2600; i++) {
    hg.strokeStyle = `hsla(${40 + r() * 12},${55 + r() * 25}%,${38 + r() * 34}%,0.8)`; hg.lineWidth = 1 + r();
    const x = r() * 256, y = r() * 256, a = (r() - 0.5) * 0.7, l = 8 + r() * 26;
    hg.beginPath(); hg.moveTo(x, y); hg.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); hg.stroke();
  }
  hg.fillStyle = '#7a4a1c'; hg.fillRect(62, 0, 5, 256); hg.fillRect(190, 0, 5, 256);
  const baleSpots = [];
  const stack = (x, z, ry) => baleSpots.push([x, 0.25, z, ry], [x + 0.08, 0.75, z + 0.05, ry + 0.12], [x - 1.05 * Math.cos(ry), 0.25, z + 1.05 * Math.sin(ry), ry + 0.05]);
  stack(-5.45, -15.6, 0.1); stack(5.5, -15.9, -0.15); stack(5.55, -1.2, 1.5); stack(-5.5, -4.6, 1.62);
  baleSpots.push([-5.5, 0.25, -11.0, 1.5], [5.5, 0.25, -9.6, 1.6], [-5.4, 0.25, 6.6, 0.3], [5.2, 0.25, 7.2, -0.4], [5.25, 0.75, 7.15, -0.2]);
  const bales = new THREE.InstancedMesh(new RoundedBoxGeometry(1.0, 0.5, 0.56, 3, 0.07), new THREE.MeshStandardMaterial({ map: tex(hayC), roughness: 0.95, envMapIntensity: 0.3 }), baleSpots.length);
  const e = new THREE.Euler(), q = new THREE.Quaternion(), one = new THREE.Vector3(1, 1, 1);
  baleSpots.forEach(([x, y, z, ry], i) => {
    const onDeck = Math.abs(x) > HALL_HALF && z < LANE.approach;
    e.set(0, ry, 0); q.setFromEuler(e); m4.compose(new THREE.Vector3(x, y + (onDeck ? B.deckY : 0), z), q, one); bales.setMatrixAt(i, m4);
  });
  scene.add(bales);

  // cows watching from the side decks
  const cows = [];
  for (const [x, z, ry, seed, sc] of [[-5.25, -8.2, -Math.PI / 2 - 0.35, 1, 0.92], [5.2, -12.6, Math.PI / 2 + 0.3, 2, 0.88], [5.3, -5.4, Math.PI / 2 + 0.55, 5, 0.8]]) {
    const cow = makeCow(seed);
    cow.position.set(x, B.deckY, z); cow.rotation.y = ry; cow.scale.setScalar(sc);
    cow.userData.baseY = B.deckY;
    scene.add(cow); cows.push(cow);
  }

  // ball returns between lane pairs
  const bodies = [], chrome = [], stripes = [], returnSpots = [];
  for (const x of [LANE_PITCH / 2, -1.5 * LANE_PITCH]) {
    bodies.push(xf(new RoundedBoxGeometry(0.5, 0.44, 1.35, 4, 0.09), [x, 0.22, 5.0]));
    bodies.push(xf(new THREE.SphereGeometry(0.3, 24, 16), [x, 0.44, 4.48], [0, 0, 0], [0.86, 0.85, 1.0]));
    stripes.push(tbox(0.51, 0.06, 1.2, x, 0.3, 5.05));
    for (const s of [-1, 1]) chrome.push(xf(new THREE.CylinderGeometry(0.014, 0.014, 0.95, 8), [x + s * 0.085, 0.475, 5.15], [Math.PI / 2, 0, 0]));
    chrome.push(xf(new THREE.TorusGeometry(0.1, 0.014, 8, 20, Math.PI), [x, 0.475, 5.625], [-Math.PI / 2, 0, 0]));
    for (let i = 0; i < 3; i++) returnSpots.push([x, 0.475 + Math.sqrt(BALL.radius ** 2 - 0.085 ** 2), 4.88 + i * 0.226]);
  }
  add(bodies, new THREE.MeshStandardMaterial({ color: '#23224e', roughness: 0.3, metalness: 0.2 }));
  add(stripes, new THREE.MeshStandardMaterial({ color: '#ff3b30', roughness: 0.4 }));
  add(chrome, new THREE.MeshStandardMaterial({ color: '#d8dbe6', roughness: 0.15, metalness: 1 }));

  // neon signs on the walls
  const sign = (w, h, draw, pw, x, y, z, ry, boost = 1.4) => { const c = makeCanvas(w, h); draw(c.getContext('2d')); return neon(c, pw, pw * h / w, x, y, z, ry, boost); };
  const cowFace = (g) => {
    neonPath(g, (p) => { p.ellipse(256, 270, 130, 120, 0, 0, Math.PI * 2); }, '#ff5fa2', 9);
    neonPath(g, (p) => { p.ellipse(256, 330, 78, 48, 0, 0, Math.PI * 2); }, '#ffd21f', 8);
    neonPath(g, (p) => { p.moveTo(150, 190); p.quadraticCurveTo(80, 150, 70, 200); p.quadraticCurveTo(100, 235, 140, 225); p.moveTo(362, 190); p.quadraticCurveTo(432, 150, 442, 200); p.quadraticCurveTo(412, 235, 372, 225); }, '#ff5fa2', 8);
    neonPath(g, (p) => { p.moveTo(190, 160); p.quadraticCurveTo(170, 100, 200, 70); p.moveTo(322, 160); p.quadraticCurveTo(342, 100, 312, 70); }, '#7fd4ff', 8);
    neonPath(g, (p) => { p.arc(210, 240, 9, 0, 7); p.moveTo(311, 240); p.arc(302, 240, 9, 0, 7); p.moveTo(238, 330); p.arc(230, 330, 8, 0, 7); p.moveTo(290, 330); p.arc(282, 330, 8, 0, 7); }, '#ffffff', 6);
  };
  sign(512, 512, cowFace, 1.9, -3.1, 3.9, B.zFront + 0.02, 0, 1.5);
  sign(1024, 512, (g) => { neonText(g, 'STRIKE', 512, 170, 200, '#2fe06a', { tube: 0.06 }); neonText(g, 'CITY', 512, 370, 200, '#3d8bff', { tube: 0.06 }); }, 2.5, 3.1, 3.85, B.zFront + 0.02, 0, 1.5);
  sign(1024, 256, (g) => { neonText(g, 'HAY THERE', 512, 132, 150, '#ffd21f', { tube: 0.07 }); }, 2.6, -B.wallX + 0.06, 2.0, -9.0, Math.PI / 2, 1.4);
  sign(1024, 256, (g) => { neonText(g, 'OPEN LATE', 512, 132, 150, '#ff5fa2', { tube: 0.07 }); }, 2.6, B.wallX - 0.06, 2.0, -3.9, -Math.PI / 2, 1.4);
  sign(1024, 256, (g) => { neonText(g, 'LET IT ROLL', 512, 132, 140, '#7fd4ff', { tube: 0.07 }); }, 2.6, B.wallX - 0.06, 2.0, -13.6, -Math.PI / 2, 1.4);

  // idle monitors over the neighbouring lanes
  const mc = makeCanvas(512, 256), mg = mc.getContext('2d');
  mg.fillStyle = '#12123a'; mg.fillRect(0, 0, 512, 256);
  mg.fillStyle = '#ffd21f'; mg.font = `86px ${FONT}`; mg.textAlign = 'center'; mg.textBaseline = 'middle'; mg.fillText('MOO BOWL', 256, 110);
  mg.fillStyle = '#9fb4ff'; mg.font = `34px ${FONT}`; mg.fillText('LANE OPEN', 256, 190);
  const idle = [], cases = [];
  for (const cx of LANE_OFFSETS) {
    cases.push(tbox(MONITOR.w + 0.1, MONITOR.h + 0.1, 0.1, cx, MONITOR.y, MONITOR.z - 0.06, { rx: MONITOR.tilt }), tbox(0.04, B.eave - MONITOR.y - 0.3, 0.04, cx - 0.5, (B.eave + MONITOR.y + 0.3) / 2, MONITOR.z - 0.08), tbox(0.04, B.eave - MONITOR.y - 0.3, 0.04, cx + 0.5, (B.eave + MONITOR.y + 0.3) / 2, MONITOR.z - 0.08));
    if (cx !== 0) idle.push(xf(new THREE.PlaneGeometry(MONITOR.w, MONITOR.h), [cx, MONITOR.y, MONITOR.z], [MONITOR.tilt, 0, 0]));
  }
  add(cases, new THREE.MeshStandardMaterial({ color: '#16162a', roughness: 0.4 }));
  const idleMat = new THREE.MeshBasicMaterial({ map: tex(mc), toneMapped: false }); idleMat.color.setScalar(0.8);
  add(idle, idleMat);

  return { cows, bulbMat, glowMat, returnSpots };
}
export const MONITOR = { w: 1.3, h: 0.65, y: 3.3, z: -6.2, tilt: 0.2 };
