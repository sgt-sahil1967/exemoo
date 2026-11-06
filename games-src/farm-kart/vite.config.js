// Farm Kart inside Exemoo. src/ is a verbatim mirror of ../farm-kart/src (scripts/sync-farm-kart.mjs);
// the only swap is src/phones.js → exemoo/phones.js, done here so the mirror never needs editing.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const ADAPTER = path.join(ROOT, 'exemoo', 'phones.js');

function exemooAdapter() {
  return {
    name: 'farm-kart-exemoo',
    enforce: 'pre',
    resolveId(id, importer) {
      if (importer && path.dirname(importer) === path.join(ROOT, 'src') && /^\.\/phones(\.js)?$/.test(id)) return ADAPTER;
      return null;
    },
  };
}

export default defineConfig({
  plugins: [exemooAdapter()],
  publicDir: false,
  build: { target: 'es2022', chunkSizeWarningLimit: 1500 },
  server: { port: 5197 },
});
