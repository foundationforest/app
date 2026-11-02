// The proof's worker: one request, one answer, off the page's thread. It fetches the proving files
// (the service worker keeps them after the first time), checks each against the SHA-256 setup.json
// names, makes the verification with the standard's own `proveVerification`, and zeroes the seed it
// was handed, which no one else holds.

import { b64u } from '@foundationforest/folders'
import { proofBytes, proveVerification, stampFromJson } from '@foundationforest/proofs'

import { FILES, type ProofFile } from './files.ts'

export type Request = { seed: Uint8Array; stamp: string; label: string }
export type Made = { verifier: string; verifierName: string; label: string; proof: string }
export type Reply = { ok: true; made: Made } | { ok: false; error: string }

// snarkjs's field library starts a worker of its own per core, from a blob: URL, which the app's CSP
// refuses (worker-src 'self', vercel.json). With no Worker here it proves on this one thread: a few
// seconds on a phone, once per profile.
;(globalThis as { Worker?: unknown }).Worker = undefined

const scope = self as unknown as { onmessage: ((e: MessageEvent<Request>) => void) | null; postMessage(message: Reply): void }

async function fetchChecked(file: ProofFile): Promise<Uint8Array> {
  const res = await fetch(file.path)
  if (!res.ok) throw new Error(`The proving files could not be loaded (${res.status}).`)
  const bytes = new Uint8Array(await res.arrayBuffer())
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), (b) => b.toString(16).padStart(2, '0')).join('')
  if (hash !== file.sha256) throw new Error('The proving files are not the ones the standard names.')
  return bytes
}

scope.onmessage = async (e) => {
  const { seed, stamp, label } = e.data
  try {
    const [wasm, zkey] = await Promise.all([fetchChecked(FILES.wasm), fetchChecked(FILES.zkey)])
    const r = await proveVerification({ seed, stamp: stampFromJson(JSON.parse(stamp)), label, artifacts: { wasm, zkey } })
    scope.postMessage({ ok: true, made: { verifier: r.verifier, verifierName: r.verifierName, label, proof: b64u.encode(proofBytes(r.proof)) } })
  } catch (err) {
    scope.postMessage({ ok: false, error: err instanceof Error ? err.message : String(err) })
  } finally {
    seed.fill(0)
  }
}
