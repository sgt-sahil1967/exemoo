import * as THREE from 'three';

/** Broadcast-style camera that trails the near player, plus a slow orbit for the menu. */
export class ChaseCamera {
  mode: 'chase' | 'orbit' = 'orbit';
  private pos = new THREE.Vector3(0, 6, 24);
  private look = new THREE.Vector3(0, 0.5, 0);
  private shake = 0;

  constructor(private cam: THREE.PerspectiveCamera) {}

  kick(amount: number) {
    this.shake = Math.max(this.shake, amount);
  }

  update(dt: number, t: number, player: THREE.Vector3, ball: THREE.Vector3 | null) {
    const wantPos = new THREE.Vector3();
    const wantLook = new THREE.Vector3();
    if (this.mode === 'orbit') {
      const a = t * 0.06;
      wantPos.set(Math.sin(a) * 26, 9 + Math.sin(t * 0.13) * 2, Math.cos(a) * 26);
      wantLook.set(0, 0.5, 0);
    } else {
      const px = player.x;
      const pz = Math.min(player.z, 14.2);
      wantPos.set(px * 0.55, 4.0, pz + 6.4);
      wantLook.set(px * 0.25 + (ball ? ball.x * 0.08 : 0), 0, pz - 13.5);
    }
    const k = 1 - Math.exp(-dt * (this.mode === 'orbit' ? 1.2 : 4.5));
    this.pos.lerp(wantPos, k);
    this.look.lerp(wantLook, k);
    this.cam.position.copy(this.pos);
    if (this.shake > 0.001) {
      this.cam.position.x += (Math.random() - 0.5) * this.shake;
      this.cam.position.y += (Math.random() - 0.5) * this.shake;
      this.shake *= Math.exp(-dt * 12);
    }
    this.cam.lookAt(this.look);
  }

  snap() {
    // Jump straight to the target next frame.
    this.pos.set(0, 4, 18.9);
    this.look.set(0, 0, -1);
  }
}
