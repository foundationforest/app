// The page's side of the proof: a worker for one proof, given the secret (moved, not copied, so the
// page keeps no copy of it), and stopped when it answers.

import type { ProveRequest, Proved } from './prove.ts'

export function proveInWorker(request: ProveRequest): Promise<Proved> {
  const worker = new Worker(new URL('./prove.worker.ts', import.meta.url), { type: 'module' })
  return new Promise<Proved>((resolve, reject) => {
    worker.onmessage = (e: MessageEvent<{ ok: true; proved: Proved } | { ok: false; error: string }>) =>
      e.data.ok ? resolve(e.data.proved) : reject(new Error(e.data.error))
    worker.onerror = (e) => reject(new Error(e.message || 'the proof worker failed'))
    worker.postMessage(request, [request.secret.buffer])
  }).finally(() => worker.terminate())
}
