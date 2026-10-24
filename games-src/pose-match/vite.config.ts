import { defineConfig } from 'vite';

export default defineConfig({
  // The pose worker is an ES module (MediaPipe loads its wasm glue with dynamic import()).
  worker: { format: 'es' },
  optimizeDeps: { exclude: ['@mediapipe/tasks-vision'] },
});
