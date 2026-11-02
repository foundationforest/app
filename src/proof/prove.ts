// The page's side of the proof: a worker for one verification, given a copy of the seed, moved to it
// rather than shared, and stopped when it answers. A worker whose script cannot be loaded, its
// version since replaced by a deploy, reloads the page once to take the new one (version.ts).

import type { Prove } from '../flows/profile.ts'
import { Reloading, reloadOnce } from '../version.ts'
import type { Reply, Request } from './worker.ts'

export const proveInWorker: Prove = (seed, stamp, label) => {
  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
  const copy = new Uint8Array(seed)
  return new Promise<Extract<Reply, { ok: true }>['made']>((resolve, reject) => {
    worker.onmessage = (e: MessageEvent<Reply>) => (e.data.ok ? resolve(e.data.made) : reject(new Error(e.data.error)))
    // A script that never loaded fires a plain error event; one that failed while it ran, an ErrorEvent.
    worker.onerror = (e) => reject(!(e instanceof ErrorEvent) && reloadOnce() ? new Reloading() : new Error(e.message || 'The proof could not be made.'))
    worker.postMessage({ seed: copy, stamp, label } satisfies Request, [copy.buffer])
  }).finally(() => worker.terminate())
}
