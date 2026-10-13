import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'icon-180.png'],
      manifest: {
        name: 'Forest',
        short_name: 'Forest',
        description: 'Your profiles, your seed, on your device.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#EDEAE0',
        theme_color: '#EDEAE0',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // The proof's worker carries snarkjs; it is precached with the rest.
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallbackDenylist: [/^\/circuits\//],
        runtimeCaching: [
          // Named by their SHA-256 (standard.sh), so a cached copy is always the right one. Fetched
          // the first time a proof is made, not at install: most visits make none.
          { urlPattern: /\/circuits\/[0-9a-f]{64}\.(wasm|zkey)$/, handler: 'CacheFirst', options: { cacheName: 'circuits' } },
        ],
      },
    }),
  ],
  resolve: {
    // One copy for the app and the registry client, so a key or a transaction made by one is the
    // other's own class. test/bundle.test.ts checks both name the same version.
    dedupe: ['@solana/web3.js'],
  },
  worker: { format: 'es' },
  // Every asset a file of the app's own, never a data: URI, so the CSP (vercel.json) takes fonts and images from 'self' alone.
  build: { assetsInlineLimit: 0 },
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
    testTimeout: 120_000,
    hookTimeout: 120_000,
  },
})
