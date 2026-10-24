/**
 * Paddle model. Origin = blade centre. Blade plane normal = local +Z, handle along local −Y.
 * Red (forehand) rubber faces local −Z — the face that points at the opponent in the
 * calibrated neutral pose (PaddleState.orientation identity → face pointing −Z).
 * Black rubber faces local +Z.
 */
import { ExtrudeGeometry, Group, LatheGeometry, Mesh, Shape, Vector2 } from 'three';
import { mat } from './util';

export const BLADE_RX = 0.076;
export const BLADE_RY = 0.08;
/** Grip point (where the hand holds) in paddle-local coords. */
export const GRIP_Y = -0.125;

function bladeShape(rx: number, ry: number): Shape {
  const s = new Shape();
  s.absellipse(0, 0.004, rx, ry, 0, Math.PI * 2, false, 0);
  return s;
}

export function makePaddle(): Group {
  const g = new Group();
  const wood = mat('#d8b07a', { rough: 0.7 });
  const red = mat('#d8303b', { rough: 0.6 });
  const black = mat('#1e1f24', { rough: 0.6 });
  const core = new ExtrudeGeometry(bladeShape(BLADE_RX, BLADE_RY), { depth: 0.006, bevelEnabled: false, curveSegments: 28 });
  core.translate(0, 0, -0.003);
  g.add(new Mesh(core, wood));
  const rubberGeo = new ExtrudeGeometry(bladeShape(BLADE_RX - 0.0015, BLADE_RY - 0.0015), {
    depth: 0.0022,
    bevelEnabled: true,
    bevelThickness: 0.0008,
    bevelSize: 0.0012,
    bevelSegments: 2,
    curveSegments: 28,
  });
  const redM = new Mesh(rubberGeo, red);
  redM.position.z = -0.003 - 0.0022 - 0.0004;
  g.add(redM);
  const blackM = new Mesh(rubberGeo, black);
  blackM.position.z = 0.003 + 0.0004;
  g.add(blackM);
  // flared handle
  const pts: Vector2[] = [];
  const prof: [number, number][] = [
    [0.0, 0.0],
    [0.017, 0.0],
    [0.0135, 0.02],
    [0.0135, 0.06],
    [0.0175, 0.09],
    [0.019, 0.098],
    [0.0, 0.1],
  ];
  for (const [r, y] of prof) pts.push(new Vector2(r, -y));
  const handleGeo = new LatheGeometry(pts, 14);
  const handle = new Mesh(handleGeo, mat('#b9844c', { rough: 0.65 }));
  handle.scale.set(1, 1, 0.62);
  handle.position.y = -BLADE_RY + 0.012;
  g.add(handle);
  // little flared collar where handle meets blade
  const collar = new Mesh(new LatheGeometry([new Vector2(0, 0), new Vector2(0.026, 0), new Vector2(0.015, -0.03), new Vector2(0, -0.03)], 14), mat('#c99a62', { rough: 0.65 }));
  collar.scale.set(1, 1, 0.45);
  collar.position.y = -BLADE_RY + 0.02;
  g.add(collar);
  g.traverse((o) => {
    if ((o as Mesh).isMesh) o.castShadow = true;
  });
  return g;
}
