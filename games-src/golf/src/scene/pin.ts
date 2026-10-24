/** Cup, flagstick with a fluttering triangular flag, and tee markers. */
import {
  BufferAttribute,
  BufferGeometry,
  CircleGeometry,
  CylinderGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshStandardMaterial,
  RingGeometry,
  SphereGeometry,
  Vector3,
} from 'three';
import { CUP_RADIUS, PALETTE } from '../core/contracts';
import type { Hole } from '../core/contracts';
import { angleDiff, clamp } from './util';

const FLAG_L = 0.62;
const FLAG_H = 0.42;
const SEG_X = 10;
const SEG_Y = 4;
const POLE_H = 2.3;

export function buildPin(hole: Hole) {
  const group = new Group();
  group.name = 'pin';
  const geos: BufferGeometry[] = [];
  const mats: { dispose(): void }[] = [];

  // cup: dark hole with a white liner rim, tilted to the green normal
  const cup = new Group();
  const n = hole.normalAt(hole.pin.x, hole.pin.z, new Vector3());
  cup.position.copy(hole.pin);
  cup.position.y = hole.heightAt(hole.pin.x, hole.pin.z) + 0.004;
  cup.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), n);
  const holeGeo = new CircleGeometry(CUP_RADIUS * 1.15, 24).rotateX(-Math.PI / 2);
  const holeMat = new MeshBasicMaterial({ color: '#10170f', polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
  const rimGeo = new RingGeometry(CUP_RADIUS * 1.15, CUP_RADIUS * 1.4, 24).rotateX(-Math.PI / 2);
  const rimMat = new MeshBasicMaterial({ color: '#f4f4ef', polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
  cup.add(new Mesh(holeGeo, holeMat), new Mesh(rimGeo, rimMat));
  geos.push(holeGeo, rimGeo);
  mats.push(holeMat, rimMat);
  group.add(cup);

  // flagstick (scaled up a little when far away so it stays readable)
  const stick = new Group();
  stick.position.copy(hole.pin);
  stick.position.y = cup.position.y;
  const poleGeo = new CylinderGeometry(0.022, 0.022, POLE_H, 8).translate(0, POLE_H / 2, 0);
  const poleMat = new MeshStandardMaterial({ color: '#ffffff', roughness: 0.4 });
  const pole = new Mesh(poleGeo, poleMat);
  pole.castShadow = true;
  const knobGeo = new SphereGeometry(0.04, 10, 8).translate(0, POLE_H, 0);
  const knob = new Mesh(knobGeo, new MeshStandardMaterial({ color: '#ffd23d', roughness: 0.3 }));
  mats.push(poleMat, knob.material as MeshStandardMaterial);
  geos.push(poleGeo, knobGeo);
  stick.add(pole, knob);

  // flag: triangle, cloth-simulated with sines
  const flagGeo = new BufferGeometry();
  const verts = (SEG_X + 1) * (SEG_Y + 1);
  const pos = new Float32Array(verts * 3);
  const idx: number[] = [];
  for (let i = 0; i < SEG_X; i++) {
    for (let j = 0; j < SEG_Y; j++) {
      const a = i * (SEG_Y + 1) + j;
      const b = a + SEG_Y + 1;
      idx.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  flagGeo.setAttribute('position', new BufferAttribute(pos, 3));
  flagGeo.setIndex(idx);
  const flagMat = new MeshLambertMaterial({ color: PALETTE.flag, side: DoubleSide });
  const flag = new Mesh(flagGeo, flagMat);
  flag.castShadow = true;
  flag.position.y = POLE_H - 0.03;
  geos.push(flagGeo);
  mats.push(flagMat);
  const flagPivot = new Group();
  flagPivot.add(flag);
  stick.add(flagPivot);
  group.add(stick);

  let windYaw = 0;
  let windSpeed = 2;
  let curYaw = 0;
  const update = (t: number, dt: number, camPos: Vector3) => {
    // flag points where the wind blows to; flag's +X → world forward of wind yaw
    curYaw += angleDiff(curYaw, windYaw) * Math.min(1, dt * 2);
    flagPivot.rotation.y = curYaw + Math.PI / 2;
    const amp = 0.025 + clamp(windSpeed / 10, 0, 1) * 0.09;
    const droop = 1 - clamp(windSpeed / 4, 0, 1);
    for (let i = 0; i <= SEG_X; i++) {
      const u = i / SEG_X;
      for (let j = 0; j <= SEG_Y; j++) {
        const v = j / SEG_Y;
        const k = (i * (SEG_Y + 1) + j) * 3;
        const wave = Math.sin(u * 5.5 - t * (5 + windSpeed * 1.2)) * amp * u * 1.4;
        const hang = droop * u * u * 0.35;
        pos[k] = u * FLAG_L - hang * 0.5;
        pos[k + 1] = -FLAG_H / 2 + (v - 0.5) * FLAG_H * (1 - u) - hang;
        pos[k + 2] = wave + Math.sin(v * 3 + t * 3) * amp * 0.2 * u;
      }
    }
    flagGeo.getAttribute('position').needsUpdate = true;
    flagGeo.computeVertexNormals();
    const d = camPos.distanceTo(stick.position);
    const s = clamp(d / 70, 1, 3.2);
    stick.scale.setScalar(s);
  };

  // tee markers: two coloured balls either side of the tee
  const tee = new Group();
  const fwd = new Vector3(hole.centerline[1].x - hole.tee.x, 0, hole.centerline[1].z - hole.tee.z).normalize();
  const side = new Vector3(-fwd.z, 0, fwd.x);
  const markerGeo = new SphereGeometry(0.13, 16, 12);
  const markerMat = new MeshStandardMaterial({ color: '#2f7bff', roughness: 0.35 });
  geos.push(markerGeo);
  mats.push(markerMat);
  for (const s of [-1, 1]) {
    const mk = new Mesh(markerGeo, markerMat);
    const x = hole.tee.x + side.x * 3.2 * s + fwd.x * 0.8;
    const z = hole.tee.z + side.z * 3.2 * s + fwd.z * 0.8;
    mk.position.set(x, hole.heightAt(x, z) + 0.1, z);
    mk.castShadow = true;
    tee.add(mk);
  }
  group.add(tee);

  return {
    group,
    stick,
    setWind(yaw: number, speed: number) {
      windYaw = yaw;
      windSpeed = speed;
    },
    update,
    dispose() {
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
    },
  };
}
