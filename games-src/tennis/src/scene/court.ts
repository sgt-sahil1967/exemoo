import * as THREE from 'three';
import { COURT, netHeightAt } from '../constants';
import { canvas, canvasTexture, grainTexture } from '../assets';

export interface CourtColors {
  court: string;
  surround: string;
}

/** Playing surface, lines, net and posts. Colours can be swapped per theme. */
export class Court {
  group = new THREE.Group();
  private courtMat: THREE.MeshStandardMaterial;
  private surroundMat: THREE.MeshStandardMaterial;

  constructor() {
    const grain = grainTexture(512, 0.07, 0.05);
    grain.repeat.set(6, 12);
    const grain2 = grain.clone();
    grain2.repeat.set(14, 22);

    this.surroundMat = new THREE.MeshStandardMaterial({ color: '#173a7a', roughness: 0.82, map: grain2, roughnessMap: grain2 });
    this.courtMat = new THREE.MeshStandardMaterial({
      color: '#2456b8',
      roughness: 0.78,
      map: grain,
      roughnessMap: grain,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });

    const surround = new THREE.Mesh(new THREE.PlaneGeometry(21, 38), this.surroundMat);
    surround.rotation.x = -Math.PI / 2;
    surround.receiveShadow = true;
    this.group.add(surround);

    const court = new THREE.Mesh(new THREE.PlaneGeometry(COURT.doublesHalfW * 2 + 0.6, COURT.halfLen * 2 + 1.2), this.courtMat);
    court.rotation.x = -Math.PI / 2;
    court.receiveShadow = true;
    this.group.add(court);

    this.buildLines();
    this.buildNet();
  }

  setColors(c: CourtColors) {
    this.courtMat.color.set(c.court);
    this.surroundMat.color.set(c.surround);
  }

  private buildLines() {
    const mat = new THREE.MeshStandardMaterial({
      color: '#f4f6fa',
      roughness: 0.55,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4,
    });
    const L = COURT.halfLen;
    const sw = COURT.singlesHalfW;
    const dw = COURT.doublesHalfW;
    const s = COURT.serviceLine;
    const w = 0.05;
    const geo = new THREE.PlaneGeometry(1, 1);
    const line = (x0: number, z0: number, x1: number, z1: number, width = w) => {
      const m = new THREE.Mesh(geo, mat);
      m.rotation.x = -Math.PI / 2;
      const horizontal = Math.abs(x1 - x0) > Math.abs(z1 - z0);
      m.scale.set(horizontal ? Math.abs(x1 - x0) + width : width, horizontal ? width : Math.abs(z1 - z0) + width, 1);
      m.position.set((x0 + x1) / 2, 0.001, (z0 + z1) / 2);
      m.receiveShadow = true;
      this.group.add(m);
    };
    for (const sgn of [-1, 1]) {
      line(-dw, sgn * L, dw, sgn * L, 0.1); // baselines
      line(sgn * dw, -L, sgn * dw, L); // doubles sidelines
      line(sgn * sw, -L, sgn * sw, L); // singles sidelines
      line(-sw, sgn * s, sw, sgn * s); // service lines
      line(0, sgn * L, 0, sgn * (L - 0.1)); // centre marks
    }
    line(0, -s, 0, s); // centre service line
  }

  private buildNet() {
    const span = COURT.postX * 2;
    // Mesh texture: dark cords on transparent.
    const [c, g] = canvas(64, 64);
    g.strokeStyle = 'rgba(20,22,26,0.95)';
    g.lineWidth = 3;
    for (let i = 0; i <= 64; i += 16) {
      g.beginPath();
      g.moveTo(i, 0);
      g.lineTo(i, 64);
      g.stroke();
      g.beginPath();
      g.moveTo(0, i);
      g.lineTo(64, i);
      g.stroke();
    }
    const tex = canvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(span / 0.18, 1.07 / 0.18);

    const netGeo = new THREE.PlaneGeometry(span, 1, 96, 1);
    const pos = netGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const top = pos.getY(i) > 0;
      pos.setY(i, top ? netHeightAt(x) - 0.03 : 0.02);
      pos.setZ(i, top ? 0 : 0.02);
    }
    netGeo.computeVertexNormals();
    const net = new THREE.Mesh(
      netGeo,
      new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.35, transparent: false, side: THREE.DoubleSide, roughness: 0.9 }),
    );
    net.castShadow = true;
    this.group.add(net);

    // White tape following the sag.
    const tapeGeo = new THREE.BoxGeometry(span, 0.065, 0.025, 96, 1, 1);
    const tp = tapeGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < tp.count; i++) tp.setY(i, tp.getY(i) + netHeightAt(tp.getX(i)) - 0.03);
    tapeGeo.computeVertexNormals();
    const tapeMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.5 });
    const tape = new THREE.Mesh(tapeGeo, tapeMat);
    tape.castShadow = true;
    this.group.add(tape);

    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.05, COURT.netH, 0.02), tapeMat);
    strap.position.set(0, COURT.netH / 2, 0);
    this.group.add(strap);

    const postMat = new THREE.MeshStandardMaterial({ color: '#1d2a22', roughness: 0.35, metalness: 0.6 });
    for (const sgn of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, COURT.postH + 0.04, 16), postMat);
      post.position.set(sgn * (COURT.postX + 0.03), (COURT.postH + 0.04) / 2, 0);
      post.castShadow = true;
      this.group.add(post);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), postMat);
      cap.position.set(post.position.x, COURT.postH + 0.04, 0);
      this.group.add(cap);
    }
  }
}
