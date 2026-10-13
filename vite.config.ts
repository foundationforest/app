import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

import { PAPER, shell } from './shell.ts'

export default defineConfig({
  plugins: [
    react(),
    // The icons, made from the mark, and the manifest: emitted here, not by the PWA plugin, which would precache the manifest.
    shell({
      name: 'Forest',
      short_name: 'Forest',
      lang: 'en',
      description: 'Your profiles, opened with your passkey.',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      background_color: PAPER,
      theme_color: PAPER,
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    }),
    // The service worker. A new one takes over as soon as it is installed, found when the app opens,
    // and the page it finds open keeps running; the next navigation is the new version's.
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false,
      workbox: {
        // Precached, and served from there first: the files named by a hash of their content, so a
        // cached copy is always the right one. The proof's worker carries snarkjs; it is one of them.
        globPatterns: ['assets/**/*.{js,css,woff2}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: null,
        runtimeCaching: [
          // index.html, the manifest and the icons: from the network first, so each open takes the
          // newest version deployed; the copy kept here serves only when the network does not answer.
          { urlPattern: ({ request, url }) => request.mode === 'navigate' || /^\/(manifest\.webmanifest|icon[\w-]*\.(svg|png))$/.test(url.pathname), handler: 'NetworkFirst', options: { cacheName: 'shell' } },
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
