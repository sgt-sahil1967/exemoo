// Copies the MediaPipe WASM runtime into public/ and downloads the pose models,
// so the game runs without any CDN at play time. The tracker starts on "full" and
// drops to "lite" automatically on machines where full is too slow.
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const wasmSrc = join(root, 'node_modules/@mediapipe/tasks-vision/wasm');
const wasmDst = join(root, 'public/mediapipe');
const modelDir = join(root, 'public/models');
const VARIANTS = ['full', 'lite'];
const modelUrl = (v) =>
  `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_${v}/float16/1/pose_landmarker_${v}.task`;

mkdirSync(wasmDst, { recursive: true });
cpSync(wasmSrc, wasmDst, { recursive: true });
console.log('copied wasm ->', wasmDst);

mkdirSync(modelDir, { recursive: true });
for (const v of VARIANTS) {
  const dst = join(modelDir, `pose_landmarker_${v}.task`);
  if (existsSync(dst)) {
    console.log(`model ${v} already present`);
    continue;
  }
  const res = await fetch(modelUrl(v));
  if (!res.ok) throw new Error(`model ${v} download failed: HTTP ${res.status}`);
  writeFileSync(dst, Buffer.from(await res.arrayBuffer()));
  console.log(`downloaded model ${v} ->`, dst);
}
