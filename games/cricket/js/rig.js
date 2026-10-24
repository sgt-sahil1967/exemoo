// Humanoid: an invisible jointed "driver" skeleton with FK poses, blending, a run cycle and two-bone arm
// IK (so batters' hands stay on the bat handle through every shot). It draws as a toy figure until the
// rigged player model loads (`useModel`), then the model's bones follow the driver every frame (`sync`),
// recoloured in the team kit; helmets, caps, pads and gloves stay on the driver joints.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mat } from './world.js';
import { svgTexture, shirtSvg, faceSvg, padSvg, gloveSvg, helmetSvg } from './svg.js';

/** Textures are shared between players with the same kit (nine fielders = one set). */
const texCache = new Map();
const cachedTex = (key, make) => { if (!texCache.has(key)) texCache.set(key, make()); return texCache.get(key); };

const SEG = 24;
const JOINTS = ['hips', 'spine', 'chest', 'neck', 'head', 'shoulderL', 'elbowL', 'wristL', 'shoulderR', 'elbowR', 'wristR', 'hipL', 'kneeL', 'ankleL', 'hipR', 'kneeR', 'ankleR'];
export const UPPER = 0.29, FORE = 0.27; // arm segment lengths (m)

/**
 * kit: { shirt, trousers, skin, cap: 'helmet'|'cap'|'hat'|null, capColor, pads, gloves, coat }
 * Character faces +z in its own frame; joint .rotation.x < 0 swings a limb forward.
 */
export class Humanoid {
  constructor(kit) {
    this.kit = { skin: '#ffd9b0', trousers: '#f4f4f0', shirt: '#2f7cff', capColor: '#1747b5', ...kit };
    this.root = new THREE.Group();
    this.j = {};
    this.target = {}; // joint → THREE.Euler (target pose)
    this.rootOffset = new THREE.Vector3();
    this.rootTarget = new THREE.Vector3();
    this.blend = 12; // pose follow speed (1/s)
    this.upper = UPPER; this.fore = FORE; // arm segment lengths (become the model's)
    this.body = []; // toy-figure meshes, hidden once the model is in
    this.model = null;
    this.#build();
  }

  #build() {
    const k = this.kit;
    const accent = k.accent || k.capColor;
    const shirt = mat(k.shirt, 0.55), trousers = mat(k.trousers, 0.7), skin = mat(k.skin, 0.55);
    // Detail lives in textures (shirt artwork, faces, pads, gloves, helmet badge), not extra geometry.
    const shirtTex = cachedTex(`shirt|${k.shirt}|${accent}|${k.number}|${k.name}|${!!k.coat}`, () => svgTexture(shirtSvg({ color: k.shirt, accent, number: k.number ?? '', name: k.name ?? '', logo: !k.coat }), 1024, 512, { repeat: [1, 1] }));
    const torsoMat = new THREE.MeshStandardMaterial({ map: shirtTex, roughness: 0.6, envMapIntensity: 0.6 });
    const faceTex = cachedTex(`face|${k.skin}|${k.hair}|${k.beard}`, () => svgTexture(faceSvg({ skin: k.skin, hair: k.hair || '#3a2516', beard: !!k.beard, brows: k.hair || '#3a2516' }), 1024, 512, { repeat: [1, 1] }));
    const faceMat = new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.55, envMapIntensity: 0.5 });
    const J = (name, parent, x, y, z) => { const o = new THREE.Group(); o.name = name; o.position.set(x, y, z); (parent ?? this.root).add(o); this.j[name] = o; this.target[name] = new THREE.Euler(); return o; };
    let acc = false; // kit accessories (helmet, cap, hat, gloves, pads) stay when the model replaces the body
    const part = (joint, geo, m, x = 0, y = 0, z = 0) => { const p = new THREE.Mesh(geo, m); p.position.set(x, y, z); p.castShadow = true; p.receiveShadow = true; joint.add(p); if (!acc) this.body.push(p); return p; };

    const hips = J('hips', null, 0, 0.98, 0);
    part(hips, new THREE.CapsuleGeometry(0.16, 0.12, 8, SEG).scale(1.15, 1, 0.8), trousers, 0, 0, 0);
    const spine = J('spine', hips, 0, 0.1, 0);
    const chest = J('chest', spine, 0, 0.18, 0);
    // Torso: a lathed barrel, flattened front-to-back.
    const prof = [[0.0, -0.22], [0.15, -0.21], [0.17, -0.1], [0.19, 0.06], [0.2, 0.16], [0.16, 0.24], [0.07, 0.28], [0, 0.28]].map(([x, y]) => new THREE.Vector2(x, y));
    part(chest, new THREE.LatheGeometry(prof, 32).scale(1.1, 1, 0.72), torsoMat, 0, 0.0, 0);
    if (k.coat) part(chest, new THREE.LatheGeometry(prof.map((v) => new THREE.Vector2(v.x * 1.08, v.y - 0.06)), SEG).scale(1.1, 1.25, 0.75), mat('#ffffff', 0.6), 0, -0.04, 0);
    // collar stripe
    part(chest, new THREE.TorusGeometry(0.075, 0.018, 8, SEG).rotateX(Math.PI / 2), mat(k.capColor, 0.5), 0, 0.265, 0);
    const neck = J('neck', chest, 0, 0.28, 0);
    part(neck, new THREE.CylinderGeometry(0.05, 0.06, 0.09, 16), skin, 0, 0.04, 0);
    const head = J('head', neck, 0, 0.1, 0);
    part(head, new THREE.SphereGeometry(0.125, 40, 28).scale(1, 1.08, 1.02), faceMat, 0, 0.11, 0);
    part(head, new THREE.SphereGeometry(0.02, 12, 8).scale(1, 0.9, 1.2), skin, 0, 0.1, 0.123); // nose
    for (const x of [-0.125, 0.125]) part(head, new THREE.SphereGeometry(0.03, 12, 8).scale(0.5, 1, 1), skin, x, 0.11, 0);
    const shellTex = cachedTex(`shell|${k.capColor}|${accent}`, () => svgTexture(helmetSvg(k.capColor, k.cap === 'helmet' ? '#ffd21f' : '#ffffff'), 1024, 512, { repeat: [1, 1] }));
    const capM = new THREE.MeshPhysicalMaterial({ map: shellTex, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.15 });
    acc = true;
    if (k.cap === 'helmet') {
      // Crown over the whole head (badge at the front), shell round the sides/back, open face.
      part(head, new THREE.SphereGeometry(0.142, 40, 12, 0, Math.PI * 2, 0, Math.PI * 0.3), capM, 0, 0.12, -0.005);
      part(head, new THREE.SphereGeometry(0.142, 40, 16, Math.PI / 2 + 0.85, Math.PI * 2 - 1.7, 0, Math.PI * 0.56), capM, 0, 0.12, -0.005);
      part(head, new THREE.CylinderGeometry(0.15, 0.15, 0.02, 32, 1, false, -0.9, 1.8).scale(1, 1, 1.15), capM, 0, 0.13, 0.02);
      const grille = mat('#c9ced8', 0.3, { metalness: 0.9 });
      for (const [y, r] of [[0.07, 0.15], [0.02, 0.145]]) part(head, new THREE.TorusGeometry(r, 0.006, 6, 32, 1.9).rotateX(Math.PI / 2).rotateY(-(Math.PI / 2 - 0.95)), grille, 0, y, 0);
      for (const a of [-0.5, 0, 0.5]) { const bar = part(head, new THREE.CylinderGeometry(0.005, 0.005, 0.07, 6), grille, Math.sin(a) * 0.148, 0.045, Math.cos(a) * 0.148); bar.rotation.x = 0.15; }
    } else if (k.cap === 'cap') {
      part(head, new THREE.SphereGeometry(0.135, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), capM, 0, 0.14, 0);
      part(head, new THREE.CylinderGeometry(0.11, 0.11, 0.015, 24, 1, false, -1, 2).scale(1, 1, 1.4), capM, 0, 0.15, 0.06);
    } else if (k.cap === 'hat') {
      part(head, new THREE.CylinderGeometry(0.27, 0.27, 0.018, 40), mat(k.capColor, 0.6), 0, 0.2, 0);
      part(head, new THREE.CylinderGeometry(0.12, 0.135, 0.12, 32), mat(k.capColor, 0.6), 0, 0.26, 0);
    }
    acc = false;
    // Arms
    for (const [side, sx] of [['L', 1], ['R', -1]]) {
      const sh = J('shoulder' + side, chest, sx * 0.22, 0.2, 0);
      part(sh, new THREE.SphereGeometry(0.07, 20, 14), shirt, 0, 0, 0);
      part(sh, new THREE.CapsuleGeometry(0.058, UPPER - 0.08, 8, SEG), shirt, 0, -UPPER / 2, 0);
      const el = J('elbow' + side, sh, 0, -UPPER, 0);
      part(el, new THREE.CapsuleGeometry(0.048, FORE - 0.07, 8, SEG), k.coat ? mat('#ffffff', 0.6) : skin, 0, -FORE / 2, 0);
      const wr = J('wrist' + side, el, 0, -FORE, 0);
      acc = !!k.gloves;
      if (k.gloves) part(wr, new RoundedBoxGeometry(0.1, 0.12, 0.08, 4, 0.035), new THREE.MeshStandardMaterial({ map: cachedTex(`glove|${accent}`, () => svgTexture(gloveSvg(accent), 256, 256, { repeat: [1, 1] })), roughness: 0.6 }), 0, -0.05, 0);
      else part(wr, new THREE.SphereGeometry(0.048, 20, 14).scale(0.9, 1.15, 0.7), skin, 0, -0.045, 0);
      acc = false;
    }
    // Legs
    for (const [side, sx] of [['L', 1], ['R', -1]]) {
      const hp = J('hip' + side, hips, sx * 0.1, -0.06, 0);
      part(hp, new THREE.CapsuleGeometry(0.075, 0.32, 8, SEG), trousers, 0, -0.21, 0);
      const kn = J('knee' + side, hp, 0, -0.44, 0);
      part(kn, new THREE.CapsuleGeometry(0.062, 0.32, 8, SEG), trousers, 0, -0.21, 0);
      if (k.pads) {
        acc = true;
        part(kn, new RoundedBoxGeometry(0.16, 0.5, 0.12, 4, 0.05), new THREE.MeshStandardMaterial({ map: cachedTex(`pad|${accent}`, () => svgTexture(padSvg(accent), 256, 512, { repeat: [1, 1] })), roughness: 0.55 }), 0, -0.2, 0.05);
        acc = false;
      }
      const an = J('ankle' + side, kn, 0, -0.43, 0);
      part(an, new RoundedBoxGeometry(0.11, 0.08, 0.25, 4, 0.035), mat('#ffffff', 0.5), 0, -0.04, 0.05);
      part(an, new RoundedBoxGeometry(0.115, 0.03, 0.26, 2, 0.01), mat('#3a3a4a', 0.7), 0, -0.08, 0.05);
    }
  }

  /** Set the target pose: { joint: [x, y, z], root: [x, y, z] }. Unlisted joints relax to 0. */
  pose(p, { keep = false } = {}) {
    if (!keep) for (const n of JOINTS) this.target[n].set(0, 0, 0);
    for (const [n, v] of Object.entries(p)) {
      if (n === 'root') this.rootTarget.set(v[0], v[1], v[2]);
      else if (this.target[n]) this.target[n].set(v[0], v[1], v[2]);
    }
    if (!p.root && !keep) this.rootTarget.set(0, 0, 0);
  }

  /** Blend joints toward the target pose. */
  update(dt) {
    const k = 1 - Math.exp(-dt * this.blend);
    const q = new THREE.Quaternion();
    for (const n of JOINTS) {
      q.setFromEuler(this.target[n]);
      this.j[n].quaternion.slerp(q, k);
    }
    this.rootOffset.lerp(this.rootTarget, k);
    this.j.hips.position.set(this.rootOffset.x, 0.98 + this.rootOffset.y, this.rootOffset.z);
  }

  /** Snap instantly to the target pose (no blending). */
  snap() {
    for (const n of JOINTS) this.j[n].quaternion.setFromEuler(this.target[n]);
    this.rootOffset.copy(this.rootTarget);
    this.update(0);
  }

  /** Two-bone IK: put the `side` wrist at a world-space point (elbow bends toward `pole`, world). */
  reach(side, worldTarget, pole) {
    const sh = this.j['shoulder' + side], el = this.j['elbow' + side];
    sh.parent.updateWorldMatrix(true, false);
    const chestInv = sh.parent.matrixWorld.clone().invert();
    const t = worldTarget.clone().applyMatrix4(chestInv).sub(sh.position); // target relative to shoulder, chest space
    const pl = pole.clone().applyMatrix4(chestInv).sub(sh.position);
    const U = this.upper, F = this.fore;
    const d = Math.min(t.length(), U + F - 1e-3);
    // Elbow angle from the law of cosines.
    const cosE = (U * U + F * F - d * d) / (2 * U * F);
    const bend = Math.PI - Math.acos(Math.max(-1, Math.min(1, cosE)));
    const cosA = (U * U + d * d - F * F) / (2 * U * d);
    const a = Math.acos(Math.max(-1, Math.min(1, cosA)));
    // Shoulder: point the upper arm at the target, then lift it by `a` toward the pole.
    const dir = t.clone().normalize();
    const n = new THREE.Vector3().crossVectors(dir, pl).normalize(); // bend-plane normal
    if (n.lengthSq() < 1e-6) n.set(1, 0, 0);
    const upperDir = dir.clone().applyAxisAngle(n, a);
    const qs = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), upperDir);
    sh.quaternion.copy(qs);
    // Elbow bends in the same plane, expressed in the upper arm's frame.
    const nLocal = n.clone().applyQuaternion(qs.clone().invert());
    el.quaternion.setFromAxisAngle(nLocal, -bend);
  }

  /**
   * Swap the toy body for the rigged player model (from `loadPlayerModel`). The model is scaled so its hips
   * sit where the driver's do, and the driver takes the model's proportions, so poses, the arm IK and the
   * kit accessories line up. Each mapped bone then follows its driver joint (`sync`). Returns false if the
   * model lacks a needed bone (the toy body stays).
   */
  useModel(gltf) {
    const scene = SkeletonUtils.clone(gltf.scene);
    // GLTFLoader drops dots from node names (DEF-upper_arm.L → DEF-upper_armL): look bones up without them.
    const found = {};
    scene.traverse((o) => { if (o.isBone) found[o.name.replace(/\./g, '')] = o; });
    const bones = new Proxy(found, { get: (t, name) => t[String(name).replace(/\./g, '')] });
    const prof = PROFILES.find((pr) => pr.map.every(([, b]) => bones[b]));
    if (!prof) {
      console.warn('[cricket] player model has no known skeleton');
      return false;
    }
    const BONE_MAP = prof.map;
    const holder = new THREE.Group();
    holder.add(scene);
    this.root.add(holder);
    const v = new THREE.Vector3();
    const charPos = (o) => (this.root.updateMatrixWorld(true), this.root.worldToLocal(o.getWorldPosition(v.clone())));
    // The driver faces +z with its left side at +x: turn the model round if it faces the other way.
    if (charPos(bones[prof.map.find(([j]) => j === 'shoulderL')[1]]).x < 0) holder.rotation.y = Math.PI;
    holder.scale.setScalar(0.98 / Math.max(0.3, charPos(bones[prof.map[0][1]]).y));
    const P = {};
    for (const [j, b] of BONE_MAP) P[j] = charPos(bones[b]);
    for (const [j, b] of Object.entries(prof.extra)) P[j] = charPos(bones[b]);
    // The driver takes the model's proportions (axes unchanged, so every pose still means the same).
    const len = (a, b) => P[a].distanceTo(P[b]);
    const J = this.j;
    J.spine.position.set(0, P.spine.y - P.hips.y, 0);
    J.chest.position.set(0, P.chest.y - P.spine.y, 0);
    J.neck.position.set(0, P.neck.y - P.chest.y, 0);
    J.head.position.set(0, P.head.y - P.neck.y, 0);
    for (const [S, sx] of [['L', 1], ['R', -1]]) {
      J['shoulder' + S].position.set(sx * Math.abs(P['shoulder' + S].x - P.chest.x), P['shoulder' + S].y - P.chest.y, 0);
      J['elbow' + S].position.set(0, -len('shoulder' + S, 'elbow' + S), 0);
      J['wrist' + S].position.set(0, -len('elbow' + S, 'wrist' + S), 0);
      J['hip' + S].position.set(sx * Math.abs(P['hip' + S].x - P.hips.x), P['hip' + S].y - P.hips.y, 0);
      J['knee' + S].position.set(0, -len('hip' + S, 'knee' + S), 0);
      J['ankle' + S].position.set(0, -len('knee' + S, 'ankle' + S), 0);
    }
    this.upper = len('shoulderL', 'elbowL');
    this.fore = len('elbowL', 'wristL');
    // Rest alignment: turn each model bone so it points along its driver joint's rest direction.
    const rootQ = this.root.getWorldQuaternion(new THREE.Quaternion()).invert();
    const map = [];
    for (const [j, b] of BONE_MAP) {
      const bone = bones[b];
      const restQ = rootQ.clone().multiply(bone.getWorldQuaternion(new THREE.Quaternion()));
      // A bone with nothing to point at (head; feet without toe bones) keeps its parent's alignment.
      const to = DIR_CHILD[j];
      const align = !P[to] || to === j ? map.at(-1).align.clone()
        : new THREE.Quaternion().setFromUnitVectors(P[to].clone().sub(P[j]).normalize(), DRIVER_DIR[j] ?? DOWN);
      map.push({ joint: J[j], bone, align, off: align.clone().multiply(restQ) });
    }
    // Team kit: recolour the model's own materials (shirt, trousers, shoes, skin, hair), or for a bare
    // mannequin colour each vertex by the body part its bone belongs to.
    const k = this.kit;
    scene.traverse((o) => {
      if (!o.isSkinnedMesh) return;
      if (prof.dress === 'materials') o.material = Array.isArray(o.material) ? o.material.map((m) => kitMaterialFor(o, m, k)) : kitMaterialFor(o, o.material, k);
      else {
        o.geometry = kitGeometry(o, k);
        o.material = kitMaterial(k);
      }
      o.castShadow = o.receiveShadow = true;
      o.frustumCulled = false;
    });
    this.headBone = prof.map.find(([j]) => j === 'head')[1];
    this.chestBone = prof.map.find(([j]) => j === 'chest')[1];
    for (const p of this.body) p.visible = false;
    this.model = { holder, bones, map, arms: [] };
    this.sync();
    this.#fitHeadwear(scene);
    this.model = { holder, bones, map, arms: ['L', 'R'].map((S) => [map.find((e) => e.joint === J['shoulder' + S]).bone, map.find((e) => e.joint === J['elbow' + S]).bone, map.find((e) => e.joint === J['wrist' + S]).bone, J['wrist' + S], J['elbow' + S]]) };
    this.sync();
    return true;
  }

  /**
   * Helmets, caps and hats were made for the toy head (radius 0.125 m, centre 0.11 m up the head joint).
   * Measure the model's head (vertices that follow the head bone) and move and scale the headwear onto it.
   */
  #fitHeadwear(scene) {
    const head = this.j.head;
    const hats = head.children.filter((c) => c.isMesh && !this.body.includes(c));
    if (!hats.length) return;
    const pts = [];
    scene.traverse((o) => {
      // Measure the skull, not the hair (or eyes/brows) on top of it.
      if (!o.isSkinnedMesh || /hair|eye/i.test(o.material?.name ?? '')) return;
      const headName = this.headBone.replace(/\./g, '');
      const headIdx = o.skeleton.bones.findIndex((b) => b.name.replace(/\./g, '') === headName);
      const si = o.geometry.attributes.skinIndex, sw = o.geometry.attributes.skinWeight;
      for (let i = 0; i < si.count; i += 3) {
        let best = 0, bw = -1;
        for (let c = 0; c < 4; c++) { const w = sw.getComponent(i, c); if (w > bw) { bw = w; best = si.getComponent(i, c); } }
        if (best === headIdx && bw > 0.6) pts.push(o.getVertexPosition(i, new THREE.Vector3()).applyMatrix4(o.matrixWorld));
      }
    });
    if (pts.length < 20) return;
    const box = new THREE.Box3().setFromPoints(pts);
    const centre = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    // The skull, not the jaw: aim at the upper part of the head box.
    centre.y += size.y * 0.06;
    const fit = new THREE.Group();
    fit.position.copy(head.worldToLocal(centre.clone()));
    fit.scale.setScalar(Math.max(size.x, size.z) / 2 / 0.125 * 1.04);
    head.add(fit);
    for (const h of hats) {
      h.position.y -= 0.11;
      fit.add(h);
    }
  }

  /** Box (in `joint`'s frame) around the model vertices that mostly follow bone `boneName`. */
  #jointBox(boneName, joint) {
    const want = boneName.replace(/\./g, ''), pts = [];
    this.model.holder.traverse((o) => {
      if (!o.isSkinnedMesh || /hair|eye/i.test(o.material?.name ?? '')) return;
      const idx = o.skeleton.bones.findIndex((b) => b.name.replace(/\./g, '') === want);
      if (idx < 0) return;
      const si = o.geometry.attributes.skinIndex, sw = o.geometry.attributes.skinWeight;
      for (let i = 0; i < si.count; i += 2) {
        let best = 0, bw = -1;
        for (let c = 0; c < 4; c++) { const w = sw.getComponent(i, c); if (w > bw) { bw = w; best = si.getComponent(i, c); } }
        if (best === idx && bw > 0.5) pts.push(joint.worldToLocal(o.getVertexPosition(i, new THREE.Vector3()).applyMatrix4(o.matrixWorld)));
      }
    });
    return pts.length > 10 ? new THREE.Box3().setFromPoints(pts) : null;
  }

  /** A team crest on the left of the shirt's chest (texture with transparency). */
  addBadge(tex) {
    const chest = this.j.chest;
    let x = 0.075, y = 0.12, z = 0.15, size = 0.1;
    const box = this.model && this.#jointBox(this.chestBone, chest);
    if (box) {
      const c = box.getCenter(new THREE.Vector3()), sz = box.getSize(new THREE.Vector3());
      x = sz.x * 0.2; y = c.y + sz.y * 0.18; z = box.max.z + 0.006; size = Math.min(0.12, sz.x * 0.3);
    }
    const badge = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.05, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -2 }));
    badge.position.set(x, y, z);
    chest.add(badge);
    return badge;
  }

  /** Pose the model like the driver (call after the frame's poses and IK, before rendering). */
  sync() {
    const m = this.model;
    if (!m) return;
    this.root.updateMatrixWorld(true);
    const qa = _q1, qp = _q2;
    for (const { joint, bone, off } of m.map) {
      joint.getWorldQuaternion(qa).multiply(off);
      bone.parent.getWorldQuaternion(qp).invert();
      bone.quaternion.copy(qp.multiply(qa));
      if (joint === this.j.hips || joint === this.j.ankleL || joint === this.j.ankleR) bone.position.copy(bone.parent.worldToLocal(joint.getWorldPosition(_v1)));
      bone.updateMatrixWorld(true);
    }
    // Hands exactly where the driver's are (on the bat handle): two-bone IK on the model's own arms.
    for (const [up, fo, hand, wrist, elbow] of m.arms) twoBoneIK(up, fo, hand, wrist.getWorldPosition(_v2), elbow.getWorldPosition(_v3));
  }
}

const _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _q3 = new THREE.Quaternion();
const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3();
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _d = new THREE.Vector3(), _e = new THREE.Vector3();

const side = (S, names) => names.map(([j, b]) => [j + S, b.replace('{S}', S)]);
/**
 * Known skeletons: driver joint → model bone, extra direction points (fingertips, toes), and how to dress.
 *   Quaternius Ultimate Animated Character Pack (dressed people, named materials)
 *   Quaternius Animated Base Character (bare mannequin, Rigify DEF bones)
 */
const PROFILES = [
  {
    // Quaternius base humans ("Man in Long Sleeves", "Woman Casual"): one mesh, materials Shirt/Pants/Skin/Hair…;
    // the feet are IK bones at the root, so they are placed as well as turned.
    dress: 'materials',
    map: [['hips', 'Hips'], ['spine', 'Abdomen'], ['chest', 'Torso'], ['neck', 'Neck'], ['head', 'Head'],
      ...['L', 'R'].flatMap((S) => side(S, [['shoulder', 'UpperArm.{S}'], ['elbow', 'LowerArm.{S}'], ['wrist', 'Palm.{S}']])),
      ...['L', 'R'].flatMap((S) => side(S, [['hip', 'UpperLeg.{S}'], ['knee', 'LowerLeg.{S}'], ['ankle', 'Foot.{S}']]))],
    extra: { fingerL: 'Fingers.L', fingerR: 'Fingers.R' },
  },
  {
    dress: 'materials',
    map: [['hips', 'Hips'], ['spine', 'Abdomen'], ['chest', 'Chest'], ['neck', 'Neck'], ['head', 'Head'],
      ...['L', 'R'].flatMap((S) => side(S, [['shoulder', 'UpperArm.{S}'], ['elbow', 'LowerArm.{S}'], ['wrist', 'Wrist.{S}']])),
      ...['L', 'R'].flatMap((S) => side(S, [['hip', 'UpperLeg.{S}'], ['knee', 'LowerLeg.{S}'], ['ankle', 'Foot.{S}']]))],
    extra: { fingerL: 'Middle2.L', fingerR: 'Middle2.R' },
  },
  {
    dress: 'bones',
    map: [['hips', 'DEF-hips'], ['spine', 'DEF-spine.001'], ['chest', 'DEF-spine.003'], ['neck', 'DEF-neck'], ['head', 'DEF-head'],
      ...['L', 'R'].flatMap((S) => side(S, [['shoulder', 'DEF-upper_arm.{S}'], ['elbow', 'DEF-forearm.{S}'], ['wrist', 'DEF-hand.{S}']])),
      ...['L', 'R'].flatMap((S) => side(S, [['hip', 'DEF-thigh.{S}'], ['knee', 'DEF-shin.{S}'], ['ankle', 'DEF-foot.{S}']]))],
    extra: { fingerL: 'DEF-f_middle.01.L', fingerR: 'DEF-f_middle.01.R', toeL: 'DEF-toe.L', toeR: 'DEF-toe.R' },
  },
];
/** For each bone, the point it points at in the model. */
const DIR_CHILD = {
  hips: 'spine', spine: 'chest', chest: 'neck', neck: 'head', head: 'head',
  shoulderL: 'elbowL', elbowL: 'wristL', wristL: 'fingerL', shoulderR: 'elbowR', elbowR: 'wristR', wristR: 'fingerR',
  hipL: 'kneeL', kneeL: 'ankleL', ankleL: 'toeL', hipR: 'kneeR', kneeR: 'ankleR', ankleR: 'toeR',
};
/** The same directions on the driver at rest (all joint rotations zero). */
const UP = new THREE.Vector3(0, 1, 0), DOWN = new THREE.Vector3(0, -1, 0), FWD = new THREE.Vector3(0, 0, 1);
const DRIVER_DIR = { hips: UP, spine: UP, chest: UP, neck: UP, head: UP, ankleL: FWD, ankleR: FWD };

/** Turn `bone` (world) so its direction from→to becomes from→want. */
function aim(bone, from, to, want) {
  _d.subVectors(to, from).normalize();
  _e.subVectors(want, from).normalize();
  _q3.setFromUnitVectors(_d, _e);
  bone.getWorldQuaternion(_q1);
  _q1.premultiply(_q3);
  bone.parent.getWorldQuaternion(_q2).invert();
  bone.quaternion.copy(_q2.multiply(_q1));
  bone.updateMatrixWorld(true);
}

/** Two-bone IK in world space: hand at `target`, elbow bending toward `pole`. */
function twoBoneIK(up, fo, hand, target, pole) {
  const S = up.getWorldPosition(_a), E = fo.getWorldPosition(_b), H = hand.getWorldPosition(_c);
  const l1 = S.distanceTo(E), l2 = E.distanceTo(H);
  const toT = target.clone().sub(S);
  const d = Math.max(Math.abs(l1 - l2) + 1e-3, Math.min(l1 + l2 - 1e-3, toT.length()));
  const dir = toT.normalize();
  const perp = pole.clone().sub(S);
  perp.addScaledVector(dir, -perp.dot(dir));
  if (perp.lengthSq() < 1e-8) perp.copy(E).sub(S).addScaledVector(dir, -E.clone().sub(S).dot(dir));
  perp.normalize();
  const x = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
  const elbowWant = S.clone().addScaledVector(dir, x).addScaledVector(perp, h);
  aim(up, S.clone(), E.clone(), elbowWant);
  const E2 = fo.getWorldPosition(new THREE.Vector3()), H2 = hand.getWorldPosition(new THREE.Vector3());
  aim(fo, E2, H2, S.clone().addScaledVector(dir, d));
}

/** Body part of a model bone, for the kit colours. */
function partOf(name) {
  if (/head|neck/.test(name)) return 'skin';
  if (/hand|f_|thumb/.test(name)) return 'hand';
  if (/upper_arm|forearm|shoulder|spine/.test(name)) return 'shirt';
  if (/foot|toe/.test(name)) return 'shoes';
  return 'trousers'; // hips, thighs, shins, root
}

const kitCache = new Map();
/** Copy of the model geometry with vertex colours for this kit (cached per kit and mesh). */
function kitGeometry(mesh, k) {
  const key = `${mesh.geometry.uuid}|${k.shirt}|${k.trousers}|${k.skin}|${!!k.coat}`;
  if (kitCache.has(key)) return kitCache.get(key);
  const g = mesh.geometry.clone();
  const colors = {
    skin: new THREE.Color(k.skin), hand: new THREE.Color(k.skin),
    shirt: new THREE.Color(k.coat ? '#ffffff' : k.shirt), trousers: new THREE.Color(k.trousers), shoes: new THREE.Color('#f2f2ee'),
  };
  const names = mesh.skeleton.bones.map((b) => partOf(b.name));
  const si = g.attributes.skinIndex, sw = g.attributes.skinWeight, n = si.count;
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    let best = 0, bw = -1;
    for (let c = 0; c < 4; c++) { const w = sw.getComponent(i, c); if (w > bw) { bw = w; best = si.getComponent(i, c); } }
    const col = colors[names[best]];
    out.set([col.r, col.g, col.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(out, 3));
  kitCache.set(key, g);
  return g;
}
const darker = (hex, f) => '#' + new THREE.Color(hex).multiplyScalar(f).getHexString();
/** Kit colour for one of the dressed model's materials (by material and mesh name), or null to keep it. */
function kitColour(meshName, matName, k) {
  const n = matName.toLowerCase(), m = meshName.toLowerCase();
  if (/skin_dark/.test(n)) return darker(k.skin, 0.82);
  if (/skin/.test(n)) return k.skin;
  if (/hair|eyebrow/.test(n)) return k.hair || '#3a2516';
  if (/eye/.test(n)) return null;
  if (/shirt/.test(n)) return k.coat ? '#ffffff' : k.shirt;
  if (/pants|trouser/.test(n)) return k.trousers;
  if (/shoe/.test(n)) return '#f4f4f0';
  if (/sock/.test(n)) return '#ffffff';
  if (/legs/.test(m)) return k.trousers;
  if (/feet/.test(m)) return /white/.test(n) ? '#f4f4f0' : '#2a2a35';
  if (/body/.test(m)) return k.coat ? '#ffffff' : k.shirt;
  return null;
}
const dressCache = new Map();
function kitMaterialFor(mesh, mat, k) {
  const meshName = `${mesh.parent?.name ?? ''} ${mesh.name}`;
  const col = kitColour(meshName, mat.name || '', k);
  if (!col) return mat;
  const key = `${mat.name}|${col}`;
  if (!dressCache.has(key)) {
    const m = mat.clone();
    m.color.set(col);
    m.roughness = /skin|hair/i.test(mat.name) ? 0.55 : 0.75;
    m.metalness = 0;
    m.envMapIntensity = 0.7;
    dressCache.set(key, m);
  }
  return dressCache.get(key);
}

const matCache = new Map();
function kitMaterial(k) {
  if (!matCache.has('kit')) matCache.set('kit', new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.62, envMapIntensity: 0.6 }));
  return matCache.get('kit');
}

/** Load the rigged player model once; every Humanoid then calls `useModel(gltf)`. */
export function loadPlayerModel(url = new URL('../models/player-men.glb', import.meta.url).href) {
  return new GLTFLoader().loadAsync(url);
}

// ─────────────────────────────── poses ───────────────────────────────
export const POSES = {
  idle: { hips: [0, 0, 0], kneeL: [0.08, 0, 0], kneeR: [0.08, 0, 0], shoulderL: [0, 0, 0.12], shoulderR: [0, 0, -0.12], elbowL: [-0.15, 0, 0], elbowR: [-0.15, 0, 0] },
  // Fielder walking in / ready crouch as the bowler delivers.
  ready: { root: [0, -0.18, 0], spine: [0.35, 0, 0], neck: [-0.3, 0, 0], hipL: [-0.55, 0, 0.12], hipR: [-0.55, 0, -0.12], kneeL: [0.9, 0, 0], kneeR: [0.9, 0, 0], ankleL: [-0.35, 0, 0], ankleR: [-0.35, 0, 0], shoulderL: [-0.6, 0, 0.25], shoulderR: [-0.6, 0, -0.25], elbowL: [-0.6, 0, 0], elbowR: [-0.6, 0, 0] },
  // Batter's stance (legs/torso; the arms are IK on the bat).
  stance: { root: [0, -0.06, 0], spine: [0.22, 0, 0], neck: [-0.15, 1.05, 0], head: [0, 0.35, 0], hipL: [-0.18, 0, 0.18], hipR: [-0.1, 0, -0.16], kneeL: [0.32, 0, 0], kneeR: [0.26, 0, 0], ankleL: [-0.12, 0, 0], ankleR: [-0.12, 0, 0] },
  // Umpire signals
  umpWatch: { spine: [0.38, 0, 0], neck: [-0.3, 0, 0], kneeL: [0.25, 0, 0], kneeR: [0.25, 0, 0], hipL: [-0.2, 0, 0], hipR: [-0.2, 0, 0], shoulderL: [-0.2, 0, 0.2], shoulderR: [-0.2, 0, -0.2], elbowL: [-1.2, 0, 0], elbowR: [-1.2, 0, 0] },
  umpOut: { shoulderR: [-2.9, 0, 0], elbowR: [-0.1, 0, 0], shoulderL: [0, 0, 0.1] },
  umpSix: { shoulderL: [-3.0, 0, 0.25], shoulderR: [-3.0, 0, -0.25], elbowL: [0, 0, 0], elbowR: [0, 0, 0] },
  umpFour: { shoulderR: [-1.5, 0, -0.3], elbowR: [0, 0, 0] },
  // Bowler delivery stride: bound, gather, release, follow-through (arms + legs).
  bowlGather: { root: [0, 0.25, 0], spine: [-0.15, 0.6, 0], hipL: [-1.1, 0, 0], kneeL: [1.4, 0, 0], hipR: [0.3, 0, 0], kneeR: [0.4, 0, 0], shoulderL: [-2.6, 0, 0.2], shoulderR: [0.8, 0, -0.3], elbowL: [-0.3, 0, 0] },
  bowlRelease: { root: [0, 0, 0], spine: [0.45, -0.4, 0], hipL: [-0.5, 0, 0], kneeL: [0.1, 0, 0], hipR: [0.9, 0, 0], kneeR: [0.9, 0, 0], shoulderL: [0.6, 0, 0.3], shoulderR: [-3.0, 0, -0.1], elbowR: [0, 0, 0] },
  bowlFollow: { root: [0, -0.1, 0], spine: [0.8, -0.8, 0], hipL: [-0.9, 0, 0], kneeL: [0.6, 0, 0], hipR: [0.2, 0, 0], kneeR: [1.0, 0, 0], shoulderL: [0.9, 0, 0.4], shoulderR: [0.9, 0, 0.5], elbowR: [-0.4, 0, 0] },
  celebrate: { shoulderL: [-2.8, 0, 0.4], shoulderR: [-2.8, 0, -0.4], elbowL: [-0.2, 0, 0], elbowR: [-0.2, 0, 0], root: [0, 0.05, 0] },
  // Wicket-keeper: deep squat, gloves together in front.
  keeper: { root: [0, -0.42, 0], spine: [0.55, 0, 0], neck: [-0.55, 0, 0], hipL: [-1.5, 0, 0.35], hipR: [-1.5, 0, -0.35], kneeL: [2.1, 0, 0], kneeR: [2.1, 0, 0], ankleL: [-0.55, 0, 0], ankleR: [-0.55, 0, 0], shoulderL: [-0.9, 0, -0.2], shoulderR: [-0.9, 0, 0.2], elbowL: [-0.5, 0, 0], elbowR: [-0.5, 0, 0] },
  keeperUp: { root: [0, -0.1, 0], spine: [0.3, 0, 0], neck: [-0.25, 0, 0], hipL: [-0.4, 0, 0.2], hipR: [-0.4, 0, -0.2], kneeL: [0.6, 0, 0], kneeR: [0.6, 0, 0], shoulderL: [-1.2, 0, -0.2], shoulderR: [-1.2, 0, 0.2], elbowL: [-0.6, 0, 0], elbowR: [-0.6, 0, 0] },
  throwBack: { spine: [-0.1, 0.5, 0], shoulderR: [-2.7, 0, 0.6], elbowR: [-1.2, 0, 0], shoulderL: [-1.3, 0, 0.3], hipL: [-0.5, 0, 0], kneeL: [0.3, 0, 0], hipR: [0.3, 0, 0] },
  throwRelease: { spine: [0.4, -0.6, 0], shoulderR: [-1.0, 0, -0.4], elbowR: [-0.2, 0, 0], shoulderL: [0.5, 0, 0.3], hipL: [-0.7, 0, 0], kneeL: [0.5, 0, 0], hipR: [0.5, 0, 0], kneeR: [0.4, 0, 0] },
  walkOff: { spine: [0.15, 0, 0], neck: [0.45, 0, 0] },
  dive: { root: [0, -0.55, 0], spine: [0.7, 0, 0], hipL: [-1.2, 0, 0.3], kneeL: [0.4, 0, 0], hipR: [-0.6, 0, -0.3], kneeR: [1.2, 0, 0], shoulderL: [-2.6, 0, 0.3], shoulderR: [-2.6, 0, -0.3] },
};

/** Running: pose for phase (radians), speed 0…1 scales stride. */
export function runPose(phase, speed = 1) {
  const s = Math.sin(phase), c = Math.cos(phase), k = Math.min(1, speed);
  return {
    root: [0, -0.04 + Math.abs(Math.sin(phase)) * 0.07 * k, 0],
    spine: [0.18 * k, 0, 0],
    neck: [-0.12 * k, 0, 0],
    hipL: [-0.75 * s * k, 0, 0.05], hipR: [0.75 * s * k, 0, -0.05],
    kneeL: [(0.35 + 0.75 * Math.max(0, c)) * k, 0, 0], kneeR: [(0.35 + 0.75 * Math.max(0, -c)) * k, 0, 0],
    ankleL: [0.2 * c * k, 0, 0], ankleR: [-0.2 * c * k, 0, 0],
    shoulderL: [0.75 * s * k, 0, 0.12], shoulderR: [-0.75 * s * k, 0, -0.12],
    elbowL: [-0.9 * k, 0, 0], elbowR: [-0.9 * k, 0, 0],
  };
}

// ─────────────────────────────── bat ───────────────────────────────
export function makeBat() {
  const g = new THREE.Group(); // origin = top of the handle, blade toward −y
  const shape = new THREE.Shape();
  const w = 0.054, len = 0.56;
  shape.moveTo(-w, 0); shape.lineTo(w, 0); shape.lineTo(w * 1.05, -len + 0.05); shape.quadraticCurveTo(w, -len, 0, -len); shape.quadraticCurveTo(-w, -len, -w * 1.05, -len + 0.05); shape.lineTo(-w, 0);
  const blade = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.035, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.01, bevelSegments: 3, curveSegments: 12 }), new THREE.MeshPhysicalMaterial({ color: '#f1d79b', roughness: 0.45, clearcoat: 0.5 }));
  blade.position.set(0, -0.3, -0.018); blade.castShadow = true; g.add(blade);
  const sticker = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.14), mat('#2f7cff', 0.4)); sticker.position.set(0, -0.42, 0.029); g.add(sticker);
  g.userData.sticker = sticker;
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.019, 0.3, 16), mat('#1b1b3a', 0.7)); handle.position.y = -0.15; handle.castShadow = true; g.add(handle);
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.22, 16), mat('#ff3b30', 0.8)); grip.position.y = -0.12; g.add(grip);
  return g;
}
