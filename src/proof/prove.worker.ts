// The proof's worker: one request, one answer. snarkjs runs here, off the page's thread.

import { type ProveRequest, fetchArtifact, prove } from './prove.ts'

const scope = self as unknown as {
  onmessage: ((e: MessageEvent<ProveRequest>) => void) | null
  postMessage(message: unknown, transfer?: Transferable[]): void
  location: { href: string }
}

// snarkjs's field library starts a worker of its own per core, from a blob: URL, which the app's CSP
// refuses (worker-src 'self', vercel.json). With no Worker here it proves on this one thread: about
// twice as long on four cores, once per profile.
;(globalThis as { Worker?: unknown }).Worker = undefined

scope.onmessage = async (e) => {
  try {
    const proved = await prove(e.data, (artifact) => fetchArtifact(artifact, scope.location.href))
    scope.postMessage({ ok: true, proved }, [proved.transaction.buffer, proved.proof.buffer])
  } catch (err) {
    scope.postMessage({ ok: false, error: err instanceof Error ? err.message : String(err) })
  }
}
