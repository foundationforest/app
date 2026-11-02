// The verification circuit's proving files, from the standard's committed setup
// (standard/proofs/verification/setup/), copied into the build under their SHA-256 and served from
// the app's own origin to the proof's worker (src/proof/). Each is checked against setup.json as it
// is copied: a file that is not the one setup.json names stops the build. Named by its hash, a
// cached copy is always the right one (vite.config.ts caches them for good). Served in dev too.

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import type { Plugin } from 'vite'

const SETUP = new URL('../standard/proofs/verification/setup/', import.meta.url)
/** The two files a proof needs: the witness generator and the proving key. */
const NAMES = ['verification.wasm', 'verification.zkey'] as const

/** Each file's bytes, under the path the app fetches it at: proofs/<sha256>.<wasm|zkey>. */
export function proofFiles(): Record<string, Buffer> {
  const setup = JSON.parse(readFileSync(new URL('setup.json', SETUP), 'utf8')) as { files: Record<string, { sha256: string; bytes: number }> }
  const out: Record<string, Buffer> = {}
  for (const name of NAMES) {
    const want = setup.files[name]!
    const bytes = readFileSync(new URL(name, SETUP))
    const got = createHash('sha256').update(bytes).digest('hex')
    if (got !== want.sha256 || bytes.length !== want.bytes) throw new Error(`${name} is not the file setup.json names: SHA-256 ${got}, want ${want.sha256}`)
    out[`proofs/${want.sha256}.${name.split('.').pop()}`] = bytes
  }
  return out
}

export function proofs(): Plugin {
  return {
    name: 'forest:proofs',
    generateBundle() {
      for (const [fileName, source] of Object.entries(proofFiles())) this.emitFile({ type: 'asset', fileName, source })
    },
    configureServer(server) {
      const files = proofFiles()
      server.middlewares.use((req, res, next) => {
        const file = files[req.url?.split('?')[0]?.slice(1) ?? '']
        if (!file) return next()
        res.setHeader('Content-Type', req.url!.includes('.wasm') ? 'application/wasm' : 'application/octet-stream')
        res.end(file)
      })
    },
  }
}
