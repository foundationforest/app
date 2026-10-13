// A build served as Vercel serves it, by vercel.json: its headers on every response; a file where
// the path names one (a directory, its index.html); else its rewrites, each source read as the
// regular expression Vercel makes of it; else a 404. `root` may change while it runs, as a deploy
// changes what the address serves. `override` replaces a header's value (the CSP's connect-src,
// pointed at the stand-ins).

import { existsSync, readFileSync, statSync } from 'node:fs'
import { type Server, createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const app = fileURLToPath(new URL('../..', import.meta.url))

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.wasm': 'application/wasm',
}

type Vercel = { headers: { source: string; headers: { key: string; value: string }[] }[]; rewrites: { source: string; destination: string }[] }

/** Whether a vercel.json source matches the path: these sources are plain regular expressions, as Vercel compiles them (path-to-regexp, `^(?:<source>)$`). */
const matches = (source: string, path: string) => new RegExp(`^(?:${source})$`).test(path)

export async function serveLikeVercel({ root, port, override = {} }: { root: string; port: number; override?: Record<string, string> }) {
  const vercel = JSON.parse(readFileSync(`${app}vercel.json`, 'utf8')) as Vercel
  const site = { root, server: undefined as unknown as Server }
  /** The file a path names under the root, if there is one. */
  const file = (path: string) => {
    const at = join(site.root, normalize(decodeURIComponent(path)).replace(/^(\.\.[/\\])+/, ''))
    const named = path.endsWith('/') ? join(at, 'index.html') : at
    return existsSync(named) && statSync(named).isFile() ? named : undefined
  }
  site.server = createServer((req, res) => {
    const path = new URL(req.url!, 'http://x').pathname
    for (const rule of vercel.headers) if (matches(rule.source, path)) for (const { key, value } of rule.headers) res.setHeader(key, override[key] ?? value)
    const found = file(path) ?? file(vercel.rewrites.find((r) => matches(r.source, path))?.destination ?? '\0')
    if (!found) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('The page could not be found.')
      return
    }
    res.writeHead(200, { 'Content-Type': TYPES[extname(found)] ?? 'application/octet-stream' }).end(readFileSync(found))
  })
  await new Promise<void>((resolve) => site.server.listen(port, '127.0.0.1', resolve))
  return {
    get root() {
      return site.root
    },
    set root(dir: string) {
      site.root = dir
    },
    close: () => new Promise<void>((resolve) => (site.server.close(() => resolve()), site.server.closeAllConnections())),
  }
}
