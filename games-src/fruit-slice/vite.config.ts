import { defineConfig } from 'vite';

// Exemoo build: the shell pairs the phone, so the game's own signalling / phone server is gone.
export default defineConfig({
  resolve: { dedupe: ['three'] },
  build: { target: 'es2022', chunkSizeWarningLimit: 1500 },
});
