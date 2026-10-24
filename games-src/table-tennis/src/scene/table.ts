/**
 * ITTF table: blue top, white lines, dark apron, undercarriage, net with wobble.
 */
import {
  BoxGeometry,
  BufferAttribute,
  CylinderGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  Vector3,
} from 'three';
import { HALF_L, HALF_W, PALETTE, TABLE } from '../core/contracts';
import { makeNetTexture } from './textures';
import { mat, mergeStatic, shadowed } from './util';

export class TableView {
  readonly group = new Group();
  private net: Mesh;
  private netBase: Float32Array;
  private wobbles: { x: number; t: number; amp: number }[] = [];

  constructor() {
    const g = this.group;
    const top = TABLE.height;
    const th = TABLE.thickness;

    const topMat = mat(PALETTE.table, { rough: 0.55 });
    const edgeMat = mat(PALETTE.tableDark, { rough: 0.6 });
    const underMat = mat('#22324f', { rough: 0.9 });
    const slab = new Mesh(new BoxGeometry(TABLE.width, th, TABLE.length), [edgeMat, edgeMat, topMat, underMat, edgeMat, edgeMat]);
    slab.position.y = top - th / 2;
    g.add(slab);

    // white lines (geometry for crisp edges at any distance)
    const lineMat = mat(PALETTE.line, { rough: 0.45 });
    const ly = top + 0.0006;
    const lh = 0.0012;
    const side = new BoxGeometry(0.02, lh, TABLE.length);
    for (const s of [-1, 1]) {
      const m = new Mesh(side, lineMat);
      m.position.set(s * (HALF_W - 0.01), ly, 0);
      g.add(m);
      const e = new Mesh(new BoxGeometry(TABLE.width, lh, 0.02), lineMat);
      e.position.set(0, ly, s * (HALF_L - 0.01));
      g.add(e);
    }
    const centre = new Mesh(new BoxGeometry(0.003, lh, TABLE.length - 0.04), lineMat);
    centre.position.set(0, ly, 0);
    g.add(centre);

    // apron
    const apronMat = mat('#1a2a48', { rough: 0.8 });
    const apronH = 0.07;
    for (const s of [-1, 1]) {
      const a = new Mesh(new BoxGeometry(0.025, apronH, TABLE.length - 0.12), apronMat);
      a.position.set(s * (HALF_W - 0.06), top - th - apronH / 2, 0);
      g.add(a);
      const b = new Mesh(new BoxGeometry(TABLE.width - 0.12, apronH, 0.025), apronMat);
      b.position.set(0, top - th - apronH / 2, s * (HALF_L - 0.06));
      g.add(b);
    }

    // undercarriage: four legs, cross bars, central spine, wheels
    const metal = mat('#2c3140', { rough: 0.5, metal: 0.3 });
    const legH = top - th - apronH;
    const legGeo = new BoxGeometry(0.045, legH, 0.045);
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const leg = new Mesh(legGeo, metal);
        leg.position.set(sx * (HALF_W - 0.16), legH / 2, sz * (HALF_L - 0.3));
        g.add(leg);
        const foot = new Mesh(new CylinderGeometry(0.04, 0.045, 0.04, 12), mat('#1b1e27', { rough: 0.6 }));
        foot.position.set(sx * (HALF_W - 0.16), 0.02, sz * (HALF_L - 0.3));
        g.add(foot);
      }
      const bar = new Mesh(new BoxGeometry(TABLE.width - 0.32, 0.04, 0.04), metal);
      bar.position.set(0, 0.22, sx * (HALF_L - 0.3));
      g.add(bar);
    }
    const spine = new Mesh(new BoxGeometry(0.06, 0.06, TABLE.length - 0.6), metal);
    spine.position.set(0, 0.22, 0);
    g.add(spine);
    for (const sz of [-1, 1]) {
      const diag = new Mesh(new BoxGeometry(0.035, 0.035, 0.75), metal);
      diag.position.set(0, (legH + 0.22) / 2 + 0.05, sz * 0.62);
      diag.rotation.x = sz * 0.62;
      g.add(diag);
    }
    shadowed(g, true, true);
    slab.castShadow = true;

    // ── net ──
    const netW = TABLE.width + 2 * TABLE.netOverhang;
    const netH = TABLE.netHeight;
    const netGeo = new PlaneGeometry(netW, netH - 0.012, 36, 4);
    const tex = makeNetTexture();
    tex.repeat.set(netW / 0.014, (netH - 0.012) / 0.014);
    const netMat = new MeshStandardMaterial({
      map: tex,
      transparent: true,
      alphaTest: 0.25,
      side: DoubleSide,
      roughness: 0.9,
      color: '#ffffff',
    });
    this.net = new Mesh(netGeo, netMat);
    this.net.position.set(0, top + (netH - 0.012) / 2, 0);
    this.net.castShadow = true;
    g.add(this.net);
    this.netBase = (netGeo.attributes.position as BufferAttribute).array.slice() as Float32Array;

    const tape = new Mesh(new BoxGeometry(netW, 0.015, 0.006), mat('#ffffff', { rough: 0.5 }));
    tape.position.set(0, top + netH - 0.0075, 0);
    tape.castShadow = true;
    g.add(tape);
    // bottom cord
    const cord = new Mesh(new BoxGeometry(netW, 0.004, 0.004), mat('#1d2333'));
    cord.position.set(0, top + 0.004, 0);
    g.add(cord);

    // posts + clamps
    const postMat = mat('#262b38', { rough: 0.45, metal: 0.4 });
    for (const s of [-1, 1]) {
      const px = s * (HALF_W + TABLE.netOverhang);
      const post = new Mesh(new CylinderGeometry(0.009, 0.011, netH + 0.01, 10), postMat);
      post.position.set(px, top + (netH + 0.01) / 2, 0);
      g.add(post);
      const arm = new Mesh(new BoxGeometry(TABLE.netOverhang + 0.04, 0.018, 0.035), postMat);
      arm.position.set(s * (HALF_W + TABLE.netOverhang / 2 - 0.01), top + 0.012, 0);
      g.add(arm);
      const clamp = new Mesh(new BoxGeometry(0.05, 0.07, 0.045), postMat);
      clamp.position.set(s * (HALF_W + 0.005), top - 0.02, 0);
      g.add(clamp);
      const knob = new Mesh(new CylinderGeometry(0.016, 0.016, 0.02, 12), mat(PALETTE.accent, { rough: 0.5 }));
      knob.position.set(s * (HALF_W + 0.005), top - 0.06, 0);
      g.add(knob);
      post.castShadow = arm.castShadow = clamp.castShadow = true;
    }
    mergeStatic(g);
  }

  /** Trigger a net wobble at world position. */
  wobble(pos: Vector3, amp = 1): void {
    this.wobbles.push({ x: pos.x, t: 0, amp });
    if (this.wobbles.length > 4) this.wobbles.shift();
  }

  update(dt: number): void {
    if (this.wobbles.length === 0) return;
    const geo = this.net.geometry;
    const p = geo.attributes.position as BufferAttribute;
    const arr = p.array as Float32Array;
    const halfH = (TABLE.netHeight - 0.012) / 2;
    for (const w of this.wobbles) w.t += dt;
    this.wobbles = this.wobbles.filter((w) => w.t < 1.4);
    for (let i = 0; i < p.count; i++) {
      const x = this.netBase[i * 3];
      const y = this.netBase[i * 3 + 1];
      const hang = 0.35 + 0.65 * ((halfH - y) / (2 * halfH)); // bottom moves more
      let z = 0;
      for (const w of this.wobbles) {
        const dx = x - w.x;
        const fall = Math.exp(-(dx * dx) / 0.12);
        z += w.amp * 0.022 * fall * hang * Math.sin(w.t * 34 - Math.abs(dx) * 9) * Math.exp(-w.t * 4.5);
      }
      arr[i * 3 + 2] = z;
    }
    p.needsUpdate = true;
    if (this.wobbles.length === 0) {
      arr.set(this.netBase);
      p.needsUpdate = true;
    }
    geo.computeVertexNormals();
  }
}
