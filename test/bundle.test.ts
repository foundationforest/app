// The standard's four packages and the app's own modules bundle for the browser, with no Node
// module anywhere on the way: the build fails at the first one. Checked on records' reference host
// too, which is Node only, so the check is known to catch one. And the app's @solana/web3.js is the
// registry client's version, since the two share one copy (vite.config.ts, `dedupe`).

import { readFileSync } from 'node:fs'
import { builtinModules } from 'node:module'
import { fileURLToPath } from 'node:url'

import { type Plugin, build } from 'vite'
import { expect, test } from 'vitest'

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
