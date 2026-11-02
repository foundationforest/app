// The proofs' worker: one request, one answer, off the page's thread. To prove, it fetches the
// proving files (the service worker keeps them after the first time), checks each against the
// SHA-256 setup.json names, makes the verification with the standard's own `proveVerification`, and
// zeroes the seed it was handed, which no one else holds. To check, it runs the standard's own
// `checkVerification` on each verification it is given, and answers whether one checks.

import { type VerificationCheck, b64u } from '@foundationforest/folders'
import { checkVerification, proofBytes, proveVerification, stampFromJson } from '@foundationforest/proofs'

import { FILES, type ProofFile } from './files.ts'

export type Request = { kind: 'prove'; seed: Uint8Array; stamp: string; label: string } | { kind: 'check'; checks: VerificationCheck[] }
export type Made = { verifier: string; verifierName: string; label: string; proof: string }
export type Reply = { ok: true; made?: Made; checked?: boolean } | { ok: false; error: string }

// snarkjs's field library starts a worker of its own per core, from a blob: URL, which the app's CSP
// refuses (worker-src 'self', vercel.json). With no Worker here it works on this one thread: a few
// seconds a proof on a phone, once per profile, and a fraction of one a check.
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

async function prove(seed: Uint8Array, stamp: string, label: string): Promise<Made> {
  try {
    const [wasm, zkey] = await Promise.all([fetchChecked(FILES.wasm), fetchChecked(FILES.zkey)])
    const r = await proveVerification({ seed, stamp: stampFromJson(JSON.parse(stamp)), label, artifacts: { wasm, zkey } })
    return { verifier: r.verifier, verifierName: r.verifierName, label, proof: b64u.encode(proofBytes(r.proof)) }
  } finally {
    seed.fill(0)
  }
}

async function check(checks: VerificationCheck[]): Promise<boolean> {
  for (const c of checks) if (await checkVerification(c)) return true
  return false
}

scope.onmessage = async (e) => {
  const r = e.data
  try {
    scope.postMessage(r.kind === 'prove' ? { ok: true, made: await prove(r.seed, r.stamp, r.label) } : { ok: true, checked: await check(r.checks) })
  } catch (err) {
    scope.postMessage({ ok: false, error: err instanceof Error ? err.message : String(err) })
  }
}
