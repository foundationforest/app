// The standard's four packages and the app's own modules bundle for the browser, with no Node
// module anywhere on the way: the build fails at the first one. Checked on records' reference host
// too, which is Node only, so the check is known to catch one. The app's @solana/web3.js is the
// registry client's version, since the two share one copy (vite.config.ts, `dedupe`). And the CSP
// in vercel.json lets the page reach the services in the settings, devnet's, and no other; the
// browser test (test/browser/app.ts) runs the built app under it. And the old address,
// app.devnet.forest.foundation, redirects to the app's own, app.forest.foundation.

import { readFileSync } from 'node:fs'
import { builtinModules } from 'node:module'
import { fileURLToPath } from 'node:url'

import { type Plugin, build } from 'vite'
import { expect, test } from 'vitest'

import { DEVNET } from '../src/settings.ts'

const root = fileURLToPath(new URL('..', import.meta.url))
const builtins = new Set(builtinModules)

/**
 * Node modules that third-party code asks for only to see whether it runs on Node, inside a
 * try/catch, and does without in a browser. Anything else fails.
 */
const PROBES: [importer: RegExp, id: string, why: string][] = [
  [/node_modules\/bn\.js\//, 'buffer', "bn.js's own package.json maps it to nothing in browsers"],
  [/node_modules\/@cloudflare\/(blindrsa|voprf)-ts\/.*sjcl/, 'crypto', "sjcl's entropy probe, which falls back to Web Crypto"],
]

/**
 * Fails the build at any import of a Node module, naming who imported it: a `node:` import, or a
 * builtin's name that resolves to no browser package (`buffer` resolves to the npm package
 * `buffer`, which is fine; `fs` resolves to nothing, and Vite would put an empty stub in its place).
 */
const noNode = (): Plugin => ({
  name: 'no-node',
  enforce: 'pre',
  async resolveId(id, importer, options) {
    if (!id.startsWith('node:') && !builtins.has(id.split('/')[0]!)) return null
    if (PROBES.some(([from, name]) => name === id && from.test(importer ?? ''))) return null
    const resolved = id.startsWith('node:') ? null : await this.resolve(id, importer, { ...options, skipSelf: true })
    if (!resolved || resolved.external || resolved.id.includes('browser-external')) this.error(`${id}, imported by ${importer?.replace(root, '')}`)
    return resolved
  },
})

async function bundle(entry: string) {
  const out = await build({
    root,
    configFile: false,
    logLevel: 'silent',
    publicDir: false,
    plugins: [noNode()],
    resolve: { dedupe: ['@solana/web3.js'] },
    worker: { format: 'es' },
    // The entry's exports kept, so nothing is shaken out and the sizes are what the app would carry.
    build: { write: false, minify: true, rollupOptions: { input: entry, preserveEntrySignatures: 'strict' }, reportCompressedSize: false },
  })
  const outputs = (Array.isArray(out) ? out : [out]) as { output: { type: string; fileName: string; code?: string; source?: string | Uint8Array }[] }[]
  return outputs.flatMap((o) => o.output).map((f) => ({ name: f.fileName, bytes: (f.code ?? f.source ?? '').length }))
}

test("the standard's packages and the app's modules bundle for the browser, no Node module", async () => {
  const files = await bundle(`${root}test/bundle/probe.ts`)
  const js = files.filter((f) => f.name.endsWith('.js'))
  expect(js.length).toBeGreaterThan(0)
  for (const f of js) console.log(`  ${f.name}: ${(f.bytes / 1024).toFixed(0)} KiB minified`)
})

test("the check catches a Node module: records' reference host does not bundle", async () => {
  await expect(bundle(`${root}standard/records/src/host.ts`)).rejects.toThrow(/node:/)
})

test("the app's @solana/web3.js is the registry client's", () => {
  const version = (path: string) => JSON.parse(readFileSync(`${root}${path}`, 'utf8')).version
  expect(version('node_modules/@solana/web3.js/package.json')).toBe(version('standard/registry/client/node_modules/@solana/web3.js/package.json'))
})

test("vercel.json's CSP: the page connects to itself and devnet's services alone", () => {
  const vercel = JSON.parse(readFileSync(`${root}vercel.json`, 'utf8'))
  const csp: string = vercel.headers.find((h: any) => h.source === '/(.*)').headers.find((h: any) => h.key === 'Content-Security-Policy').value
  const connect = csp.split(';').map((d) => d.trim().split(/\s+/)).find(([name]) => name === 'connect-src')!.slice(1)
  // The MCP door is only shown, for the person to give their AI: the page never asks it anything.
  const { mcp: _, ...services } = DEVNET
  expect(connect.sort()).toEqual(["'self'", ...Object.values(services)].sort())
  expect(csp).not.toContain('app.devnet.forest.foundation')
})

test("vercel.json: the old address redirects to the new one, its path kept, with a 308", () => {
  const vercel = JSON.parse(readFileSync(`${root}vercel.json`, 'utf8'))
  expect(vercel.redirects).toEqual([
    { source: '/:path*', has: [{ type: 'host', value: 'app.devnet.forest.foundation' }], destination: 'https://app.forest.foundation/:path*', statusCode: 308 },
  ])
})
