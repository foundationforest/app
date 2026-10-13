// The app's files that are neither hashed nor kept in public/: the favicon and the PWA icons, made at
// each build from the mark's one component (src/mark.tsx), ink on paper, 8 units around it; and the
// web manifest. None of them is precached: the service worker asks the network for them first
// (vite.config.ts), so a new mark or manifest shows at the next open. Served from memory in dev.

import { Resvg } from '@resvg/resvg-js'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { Plugin } from 'vite'

import { Mark } from './src/mark.tsx'

/** The theme's paper and ink (src/theme.css). */
export const PAPER = '#EDEAE0'
export const INK = '#121A15'

/** The PNG icons: the home screen's on Apple devices, and the manifest's two. */
export const PNG_SIZES = { 'icon-180.png': 180, 'icon-192.png': 192, 'icon-512.png': 512 }

/** The mark as its component draws it, its shapes in ink on a square of paper 8 units wider on each side. */
export function iconSvg(): string {
  const drawn = renderToStaticMarkup(createElement(Mark))
  const attr = (name: string) => new RegExp(`\\s${name}="([^"]*)"`).exec(drawn)![1]!
  const [x, y, w, h] = attr('viewBox').split(' ').map(Number) as [number, number, number, number]
  const box = [x - 8, y - 8, w + 16, h + 16]
  const shapes = drawn.slice(drawn.indexOf('>') + 1, drawn.lastIndexOf('</svg>'))
  const stroke = ['stroke-width', 'stroke-linecap', 'stroke-linejoin'].map((name) => `${name}="${attr(name)}"`).join(' ')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box.join(' ')}"><rect x="${box[0]}" y="${box[1]}" width="${box[2]}" height="${box[3]}" fill="${PAPER}"/><g fill="${attr('fill')}" stroke="${INK}" ${stroke}>${shapes}</g></svg>\n`
}

/** The icon, as a PNG `size` pixels square. */
export const iconPng = (size: number): Buffer => new Resvg(iconSvg(), { fitTo: { mode: 'width', value: size } }).render().asPng()

const TYPES: Record<string, string> = { svg: 'image/svg+xml', png: 'image/png', webmanifest: 'application/manifest+json' }

/** Emits the icons and `manifest` into the build, and serves them in dev. */
export function shell(manifest: object): Plugin {
  const files = (): Record<string, string | Buffer> => ({
    'icon.svg': iconSvg(),
    ...Object.fromEntries(Object.entries(PNG_SIZES).map(([name, size]) => [name, iconPng(size)])),
    'manifest.webmanifest': `${JSON.stringify(manifest, null, 2)}\n`,
  })
  return {
    name: 'forest:shell',
    generateBundle() {
      for (const [fileName, source] of Object.entries(files())) this.emitFile({ type: 'asset', fileName, source })
    },
    configureServer(server) {
      const made = files()
      server.middlewares.use((req, res, next) => {
        const name = req.url?.split('?')[0]?.slice(1) ?? ''
        if (!(name in made)) return next()
        res.setHeader('Content-Type', TYPES[name.split('.').pop()!]!)
        res.end(made[name])
      })
    },
  }
}
