import * as THREE from 'three';
import { canvas, canvasTexture } from '../assets';

let stringTex: THREE.Texture | null = null;

function strings(): THREE.Texture {
  if (stringTex) return stringTex;
  const [c, g] = canvas(128, 160);
  g.strokeStyle = 'rgba(245,245,235,0.9)';
  g.lineWidth = 2;
  for (let x = 6; x < 128; x += 9) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, 160);
    g.stroke();
  }
  for (let y = 6; y < 160; y += 9) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(128, y);
    g.stroke();
  }
  stringTex = canvasTexture(c);
  return stringTex;
}

/** Racket built along −y from the grip (origin at the hand). */
export function makeRacket(color: string): THREE.Group {
  const g = new THREE.Group();
  const frameMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.4 });
  const gripMat = new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.9 });

  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.016, 0.2, 10), gripMat);
  handle.position.y = -0.04;
  g.add(handle);

  const headCenter = -0.48;
  const head = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.011, 8, 40), frameMat);
  head.scale.set(1, 1.32, 1);
  head.position.y = headCenter;
  head.rotation.y = Math.PI / 2; // face plane contains the swing direction
  g.add(head);

  const strMesh = new THREE.Mesh(
    new THREE.CircleGeometry(0.122, 32),
    new THREE.MeshBasicMaterial({ map: strings(), transparent: true, alphaTest: 0.2, side: THREE.DoubleSide }),
  );
  strMesh.scale.set(1, 1.3, 1);
  strMesh.position.y = headCenter;
  strMesh.rotation.y = Math.PI / 2;
  g.add(strMesh);

  for (const s of [-1, 1]) {
    const throat = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.2, 8), frameMat);
    throat.position.set(0, -0.215, s * 0.045);
    throat.rotation.x = s * 0.33;
    g.add(throat);
  }
  g.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) o.castShadow = true;
  });
  return g;
}
