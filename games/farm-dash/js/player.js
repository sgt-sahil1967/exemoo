// Original runner character ("Juno") built from rounded primitives with cel shading
// and ink outlines, plus procedural animation.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const lerp = (a, b, t) => a + (b - a) * t;

// 3-step ramp gives the toon materials hard-edged light bands
const toonRamp = (() => {
  const t = new THREE.DataTexture(new Uint8Array([70, 150, 230, 255]), 4, 1, THREE.RedFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
})();
const toon = (color, o = {}) => new THREE.MeshToonMaterial({ color, gradientMap: toonRamp, ...o });
const inkMat = new THREE.MeshBasicMaterial({ color: '#16121c', side: THREE.BackSide });

const G = {
  sphere: (r, ws = 20, hs = 14) => new THREE.SphereGeometry(r, ws, hs),
  capsule: (r, len) => new THREE.CapsuleGeometry(r, len, 6, 14),
  cyl: (rt, rb, h, s = 16) => new THREE.CylinderGeometry(rt, rb, h, s),
  box: (w, h, d) => new THREE.BoxGeometry(w, h, d),
  torus: (r, t, arc = Math.PI * 2) => new THREE.TorusGeometry(r, t, 8, 24, arc),
};

// Adds a mesh to parent; ink > 0 adds an inverted-hull outline of that relative thickness.
function add(parent, geo, mat, { p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1], ink = 0.06, shadow = true } = {}) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(...p);
  m.rotation.set(...r);
  m.scale.set(...s);
  m.castShadow = shadow;
  if (ink > 0) {
    const o = new THREE.Mesh(geo, inkMat);
    o.scale.setScalar(1 + ink);
    m.add(o);
  }
  parent.add(m);
  return m;
}

export class Player {
  constructor() {
    const C = {
      skin: toon('#e0a774'), cheek: toon('#ef8f7a'), hair: toon('#2b1a14'),
      jacket: toon('#ffc531'), stripe: toon('#17b9a8'), lining: toon('#e0521f'),
      tee: toon('#f7f3ea'), pants: toon('#2c2f45'), pantsStripe: toon('#f7f3ea'),
      shoe: toon('#f6f6f2'), shoeAccent: toon('#ff4d6d'), sole: toon('#2c2f45'),
      beanie: toon('#17b9a8'), pom: toon('#ff4d6d'), phones: toon('#2c2f45'), phonesPad: toon('#ff4d6d'),
      pack: toon('#8a5cf6'), packAccent: toon('#ffc531'), metal: toon('#c8ccd6'),
      eyeWhite: new THREE.MeshBasicMaterial({ color: '#ffffff' }), pupil: new THREE.MeshBasicMaterial({ color: '#16121c' }),
    };

    this.group = new THREE.Group();          // at the feet, follows lane/height
    this.pivot = new THREE.Group();           // roll pivot near the body centre
    this.pivot.position.y = 0.55;
    this.group.add(this.pivot);
    this.body = new THREE.Group();            // origin at the hips
    this.body.position.y = 0.25;
    this.pivot.add(this.body);
    const B = this.body;

    // --- torso: puffy cropped jacket over a tee (character faces -z) ---
    add(B, G.capsule(0.22, 0.2), C.tee, { p: [0, 0.3, 0], s: [1.15, 1, 0.82] });
    add(B, G.capsule(0.245, 0.22), C.jacket, { p: [0, 0.36, 0.01], s: [1.18, 1, 0.86] });
    add(B, G.torus(0.24, 0.035), C.stripe, { p: [0, 0.15, 0.01], r: [Math.PI / 2, 0, 0], s: [1.14, 0.84, 1], ink: 0.1 }); // ribbed hem
    for (const side of [-1, 1]) {
      add(B, G.box(0.04, 0.42, 0.04), C.stripe, { p: [side * 0.28, 0.37, 0.0], ink: 0 }); // side stripes
    }
    // open jacket front reveals the tee with a lightning-bolt print
    add(B, G.box(0.17, 0.4, 0.05), C.tee, { p: [0, 0.34, -0.19], ink: 0 });
    const bolt = new THREE.Shape([[0.03, 0.08], [-0.04, -0.01], [0.0, -0.01], [-0.03, -0.08], [0.05, 0.02], [0.01, 0.02]].map(([x, y]) => new THREE.Vector2(x, y)));
    add(B, new THREE.ShapeGeometry(bolt), C.pom, { p: [0, 0.36, -0.217], r: [0, Math.PI, 0], ink: 0, shadow: false });
    add(B, G.box(0.015, 0.4, 0.06), C.metal, { p: [-0.09, 0.34, -0.19], ink: 0 });       // zipper edges
    add(B, G.box(0.015, 0.4, 0.06), C.metal, { p: [0.09, 0.34, -0.19], ink: 0 });
    add(B, G.capsule(0.2, 0.06), C.lining, { p: [0, 0.6, 0.08], r: [0, 0, Math.PI / 2], s: [1, 1, 0.75] }); // collar
    add(B, G.cyl(0.08, 0.09, 0.12), C.skin, { p: [0, 0.64, 0], ink: 0 });               // neck

    // --- backpack: rounded shell with straps (the camera mostly sees the back) ---
    const pack = new THREE.Group(); pack.position.set(0, 0.36, 0.25); B.add(pack);
    add(pack, G.sphere(0.24), C.pack, { s: [1, 1.1, 0.55] });
    add(pack, G.sphere(0.13), C.packAccent, { p: [0, -0.08, 0.1], s: [1.1, 0.8, 0.5] });
    add(pack, G.box(0.18, 0.025, 0.03), C.metal, { p: [0, -0.02, 0.165], ink: 0 });       // zip
    add(pack, G.torus(0.06, 0.018), C.metal, { p: [0, 0.27, 0.0], ink: 0 });              // carry loop
    add(pack, G.sphere(0.035, 10, 8), C.pom, { p: [0.13, 0.1, 0.13], ink: 0.3 });          // keychain charm
    for (const side of [-1, 1]) {
      add(B, G.torus(0.13, 0.025, Math.PI), C.pack, { p: [side * 0.15, 0.5, 0.02], r: [0, Math.PI / 2, 0], ink: 0.2 });
    }

    // --- head ---
    this.head = new THREE.Group();
    this.head.position.y = 0.7;
    B.add(this.head);
    const H = this.head;
    add(H, G.sphere(0.25, 24, 18), C.skin, { p: [0, 0.22, 0], s: [1, 1.04, 0.96] });
    for (const side of [-1, 1]) {
      add(H, G.sphere(0.06, 10, 8), C.skin, { p: [side * 0.245, 0.2, 0.02], s: [0.6, 1, 1] }); // ears
      add(H, G.sphere(0.075, 14, 10), C.eyeWhite, { p: [side * 0.09, 0.22, -0.215], s: [0.85, 1.1, 0.5], ink: 0.25 });
      add(H, G.sphere(0.04, 10, 8), C.pupil, { p: [side * 0.085, 0.215, -0.245], s: [1, 1.2, 0.5], ink: 0 });
      add(H, G.sphere(0.012, 6, 4), C.eyeWhite, { p: [side * 0.075, 0.235, -0.26], ink: 0 }); // eye shine
      add(H, G.box(0.09, 0.022, 0.02), C.hair, { p: [side * 0.095, 0.315, -0.225], r: [0, 0, side * -0.18], ink: 0 }); // brows
      add(H, G.sphere(0.04, 10, 8), C.cheek, { p: [side * 0.15, 0.13, -0.19], s: [1, 0.6, 0.4], ink: 0, shadow: false });
    }
    add(H, G.sphere(0.03, 10, 8), C.skin, { p: [0, 0.17, -0.245], ink: 0.2 });           // nose
    add(H, G.torus(0.045, 0.012, Math.PI), C.pupil, { p: [0, 0.1, -0.225], r: [0, 0, Math.PI], ink: 0 }); // grin

    // hair tufts poking out under the beanie at the back and sides
    for (let i = 0; i < 7; i++) {
      const a = Math.PI * 0.15 + (i / 6) * Math.PI * 0.7;
      add(H, new THREE.ConeGeometry(0.06, 0.16, 6), C.hair, {
        p: [Math.cos(a) * 0.21, 0.2 - Math.abs(i - 3) * 0.01, Math.sin(a) * 0.19],
        r: [Math.sin(a) * 1.9, 0, -Math.cos(a) * 1.9], ink: 0.12,
      });
    }
    add(H, G.sphere(0.24), C.hair, { p: [0, 0.25, 0.07], s: [0.98, 0.8, 0.9], ink: 0 });  // hairline under the beanie

    // beanie with folded cuff and pom-pom
    add(H, new THREE.SphereGeometry(0.265, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), C.beanie, { p: [0, 0.28, 0.01], s: [1, 1.12, 1] });
    add(H, G.torus(0.25, 0.05), C.beanie, { p: [0, 0.31, 0.01], r: [Math.PI / 2 - 0.08, 0, 0], s: [1, 1, 0.8], ink: 0.1 });
    add(H, G.sphere(0.075, 12, 10), C.pom, { p: [0, 0.6, 0.03], ink: 0.12 });

    // over-ear headphones on the beanie
    add(H, G.torus(0.28, 0.025, Math.PI), C.phones, { p: [0, 0.24, 0.03], ink: 0.25 });
    for (const side of [-1, 1]) {
      add(H, G.cyl(0.085, 0.085, 0.07), C.phones, { p: [side * 0.275, 0.21, 0.03], r: [0, 0, Math.PI / 2], ink: 0.12 });
      add(H, G.cyl(0.06, 0.06, 0.02), C.phonesPad, { p: [side * 0.315, 0.21, 0.03], r: [0, 0, Math.PI / 2], ink: 0 });
    }

    // --- limbs: shoulder/hip root -> elbow/knee joint ---
    const limb = (x, y, upperLen, lowerLen, r, upperMat, lowerMat, decorate) => {
      const root = new THREE.Group(); root.position.set(x, y, 0);
      add(root, G.capsule(r, upperLen - r), upperMat, { p: [0, -upperLen / 2, 0] });
      const joint = new THREE.Group(); joint.position.y = -upperLen; root.add(joint);
      add(joint, G.capsule(r * 0.88, lowerLen - r), lowerMat, { p: [0, -lowerLen / 2, 0] });
      decorate(root, joint, lowerLen);
      B.add(root);
      return { root, joint };
    };
    const arm = (side) => limb(side * 0.33, 0.56, 0.3, 0.27, 0.085, C.jacket, C.jacket, (root, joint, len) => {
      add(root, G.sphere(0.095), C.jacket, { p: [0, -0.02, 0], ink: 0.08 });                // puffy shoulder
      add(root, G.box(0.03, 0.26, 0.03), C.stripe, { p: [side * 0.08, -0.15, 0], ink: 0 });
      add(joint, G.cyl(0.085, 0.085, 0.06), C.stripe, { p: [0, -len + 0.04, 0] });          // cuff
      const hand = add(joint, G.sphere(0.075), C.skin, { p: [0, -len - 0.04, 0], s: [0.9, 1.1, 1] });
      add(hand, G.sphere(0.035), C.skin, { p: [-side * 0.06, 0.02, -0.03], ink: 0.15 });    // thumb
    });
    const leg = (side) => limb(side * 0.13, 0.02, 0.38, 0.36, 0.11, C.pants, C.pants, (root, joint, len) => {
      add(root, G.box(0.025, 0.34, 0.025), C.pantsStripe, { p: [side * 0.11, -0.19, 0], ink: 0 });
      add(joint, G.box(0.022, 0.3, 0.022), C.pantsStripe, { p: [side * 0.096, -0.15, 0], ink: 0 });
      add(joint, G.cyl(0.1, 0.105, 0.07), C.pants, { p: [0, -len + 0.02, 0] });            // jogger cuff
      // chunky sneaker
      const shoe = new THREE.Group(); shoe.position.y = -len - 0.06; joint.add(shoe);
      add(shoe, G.capsule(0.09, 0.2), C.shoe, { p: [0, 0, -0.07], r: [Math.PI / 2, 0, 0], s: [1.1, 1, 0.85] });
      add(shoe, G.box(0.21, 0.07, 0.42), C.sole, { p: [0, -0.07, -0.07], ink: 0.08 });
      add(shoe, G.box(0.215, 0.025, 0.43), C.shoeAccent, { p: [0, -0.025, -0.07], ink: 0 });
      add(shoe, G.cyl(0.095, 0.1, 0.08), C.shoe, { p: [0, 0.06, 0.02] });                  // ankle collar
      add(shoe, G.sphere(0.05, 10, 8), C.shoeAccent, { p: [side * 0.09, 0.0, -0.02], s: [0.3, 1, 1.6], ink: 0 }); // side swoosh
      for (let i = 0; i < 3; i++) add(shoe, G.box(0.1, 0.015, 0.02), C.shoeAccent, { p: [0, 0.07 - i * 0.02, -0.1 - i * 0.05], ink: 0 }); // laces
    });
    this.armL = arm(-1);
    this.armR = arm(1);
    this.legL = leg(-1);
    this.legR = leg(1);

    this.phase = 0;
    this.rollAngle = 0;
    this.flash = 0;
  }

  reset() {
    this.group.rotation.set(0, 0, 0);
    this.pivot.rotation.set(0, 0, 0);
    this.pivot.position.y = 0.55;
    this.body.position.y = 0.25;
    this.rollAngle = 0;
    this.flash = 0;
    this.setVisible(true);
  }

  setVisible(v) { this.group.visible = v; }

  // s: { mode: 'run'|'air'|'roll'|'dead'|'idle', speed, lean, rollT (0..1), dt }
  animate(s) {
    const dt = s.dt;
    const k = Math.min(1, dt * 14);
    let hipL, hipR, kneeL, kneeR, shL, shR, elL, elR, lean = -0.12, bob = 0, headTilt = 0;

    if (s.mode === 'run' || s.mode === 'idle') {
      const rate = s.mode === 'idle' ? 2.4 : 6 + s.speed * 0.32;
      this.phase += dt * rate;
      const p = this.phase;
      const amp = s.mode === 'idle' ? 0.08 : 1;
      hipL = Math.sin(p) * 0.95 * amp; hipR = -hipL;
      kneeL = -Math.max(0, -Math.sin(p + 0.6)) * 1.5 * amp - 0.1;
      kneeR = -Math.max(0, Math.sin(p + 0.6)) * 1.5 * amp - 0.1;
      shL = -Math.sin(p) * 0.9 * amp; shR = -shL;
      elL = elR = 0.4 + 0.9 * amp;
      bob = Math.abs(Math.sin(p)) * 0.07 * amp;
      headTilt = Math.sin(p * 2) * 0.04 * amp;
      if (s.mode === 'idle') { lean = 0; bob = Math.sin(p) * 0.015; }
    } else if (s.mode === 'air') {
      hipL = 1.0; kneeL = -1.5; hipR = -0.35; kneeR = -0.9;
      shL = -2.6; shR = -2.3; elL = elR = 0.3;
      lean = -0.05; headTilt = -0.15;
    } else if (s.mode === 'roll') {
      hipL = hipR = 1.9; kneeL = kneeR = -2.3;
      shL = shR = 1.2; elL = elR = 1.6;
      lean = -0.6; headTilt = 0.3;
    } else { // dead
      hipL = 0.3; hipR = -0.2; kneeL = kneeR = -0.3;
      shL = -2.8; shR = -2.6; elL = elR = 0.2;
      lean = 0;
    }

    const set = (o, v) => { o.rotation.x = lerp(o.rotation.x, v, k); };
    set(this.legL.root, hipL); set(this.legR.root, hipR);
    set(this.legL.joint, kneeL); set(this.legR.joint, kneeR);
    set(this.armL.root, shL); set(this.armR.root, shR);
    set(this.armL.joint, elL); set(this.armR.joint, elR);
    set(this.head, headTilt);
    this.armL.root.rotation.z = lerp(this.armL.root.rotation.z, s.mode === 'air' ? -0.35 : -0.12, k);
    this.armR.root.rotation.z = lerp(this.armR.root.rotation.z, s.mode === 'air' ? 0.35 : 0.12, k);
    this.body.rotation.x = lerp(this.body.rotation.x, lean, k);
    this.body.position.y = 0.25 + bob;

    // tumble forward while rolling
    if (s.mode === 'roll') {
      this.rollAngle = -s.rollT * Math.PI * 2;
      this.pivot.position.y = lerp(this.pivot.position.y, 0.42, k);
    } else {
      this.rollAngle = lerp(this.rollAngle, 0, k);
      this.pivot.position.y = lerp(this.pivot.position.y, 0.55, k);
    }
    this.pivot.rotation.x = this.rollAngle;
    if (s.mode === 'dead') {
      this.pivot.rotation.x = lerp(this.pivot.rotation.x, 1.45, Math.min(1, dt * 6));
      this.pivot.position.y = lerp(this.pivot.position.y, 0.25, Math.min(1, dt * 6));
    }

    // lean into lane changes
    this.group.rotation.z = lerp(this.group.rotation.z, -s.lean * 0.25, k);
    this.group.rotation.y = lerp(this.group.rotation.y, (s.turn || 0) - s.lean * 0.3, Math.min(1, dt * 6));

    // blink while invulnerable after a stumble
    if (this.flash > 0) {
      this.flash -= dt;
      this.group.visible = Math.floor(this.flash * 16) % 2 === 0 || this.flash <= 0;
    }
  }
}
