// The proof's worker: one request, one answer. snarkjs runs here, off the page's thread.
import '../buffer.ts'

import { type ProveRequest, fetchArtifact, prove } from './prove.ts'

const scope = self as unknown as {
  onmessage: ((e: MessageEvent<ProveRequest>) => void) | null
  postMessage(message: unknown, transfer?: Transferable[]): void
  location: { href: string }
}

scope.onmessage = async (e) => {
  try {
    const proved = await prove(e.data, (artifact) => fetchArtifact(artifact, scope.location.href))
    scope.postMessage({ ok: true, proved }, [proved.transaction.buffer, proved.proof.buffer])
  } catch (err) {
    scope.postMessage({ ok: false, error: err instanceof Error ? err.message : String(err) })
  }
}
