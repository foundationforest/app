import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

import { markets } from './build/markets.ts'
import { proofs } from './build/proofs.ts'
import { PAPER, shell } from './build/shell.ts'

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url))

/**
 * The standard's packages, by name, from the checkout standard.sh builds (standard/ at STANDARD):
 * the app's code and services' credits client (services/host/client/client.ts) import them so.
 * Their own dependencies come from the standard's node_modules. tsconfig.json names the same files.
 */
export const standard = [
  { find: /^@foundationforest\/keys$/, replacement: here('./standard/keys/dist/index.js') },
  { find: /^@foundationforest\/folders$/, replacement: here('./standard/folders/dist/index.js') },
  { find: /^@foundationforest\/folders\/locked$/, replacement: here('./standard/folders/dist/locked.js') },
  { find: /^@foundationforest\/proofs$/, replacement: here('./standard/proofs/dist/index.js') },
]

/** The markets' browser entry, from the checkout standard.sh builds (markets/ at MARKETS): it takes the files as data and runs no eval. */
export const marketsEntry = [{ find: /^@foundationforest\/markets\/browser$/, replacement: here('./markets/build/dist/browser.js') }]

/** The map's chunks: the place screen's map with MapLibre (src/fields/PlaceMap.tsx), and MapLibre's worker. */
export const MAP_CODE = ['assets/PlaceMap-*', 'assets/maplibre-gl-worker-*']

export default defineConfig({
  plugins: [
    react(),
    markets(),
    proofs(),
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
        // The map's code (MapLibre, and its worker) is not: it comes with the place screen alone.
        globPatterns: ['assets/**/*.{js,css,woff2}'],
        globIgnores: [...MAP_CODE],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: null,
        runtimeCaching: [
          // The page, the manifest and the icons: from the network first, so each open takes the
          // newest version deployed; the copy kept here serves only when the network does not answer.
          { urlPattern: ({ request, url }) => request.mode === 'navigate' || /^\/(manifest\.webmanifest|icon[\w-]*\.(svg|png))$/.test(url.pathname), handler: 'NetworkFirst', options: { cacheName: 'shell' } },
          // Named by their SHA-256 (build/proofs.ts), so a cached copy is always the right one. Fetched
          // the first time a proof is made, not at install: most visits make none.
          { urlPattern: /\/proofs\/[0-9a-f]{64}\.(wasm|zkey)$/, handler: 'CacheFirst', options: { cacheName: 'proofs' } },
          // The map's code, named by a hash of its content too: fetched the first time a place screen opens, then kept.
          { urlPattern: /\/assets\/(PlaceMap|maplibre-gl-worker)-[\w-]+\.js$/, handler: 'CacheFirst', options: { cacheName: 'map' } },
        ],
      },
    }),
  ],
  resolve: { alias: [...standard, ...marketsEntry] },
  worker: { format: 'es' },
  // Every asset a file of the app's own, never a data: URI, so the CSP (vercel.json) takes fonts and images from 'self' alone.
  build: { assetsInlineLimit: 0, chunkSizeWarningLimit: 4096 },
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
    testTimeout: 180_000,
    hookTimeout: 180_000,
    reporters: ['default', './test/no-skips.ts'],
  },
})
