// The browser test's page (harness.html): the app's own modules, built the way the app is built
// (production, the proof's worker bundled), and served with the app's public/ for the proving files.
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'

const app = fileURLToPath(new URL('../..', import.meta.url))

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  publicDir: `${app}public`,
  resolve: { dedupe: ['@solana/web3.js'] },
  worker: { format: 'es' },
  logLevel: 'warn',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 4096,
    rollupOptions: { input: fileURLToPath(new URL('harness.html', import.meta.url)) },
  },
})
