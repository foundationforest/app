// The page's side of the proofs: a worker for one request, stopped when it answers. To prove, it is
// given a copy of the seed, moved to it rather than shared; to check, the verifications. A worker
// whose script cannot be loaded, its version since replaced by a deploy, reloads the page once to
// take the new one (version.ts).

import type { VerificationCheck } from '@foundationforest/folders'

import type { CheckProofs } from '../flows/inbox.ts'
import type { Prove } from '../flows/profile.ts'
import { Reloading, reloadOnce } from '../version.ts'
import type { Reply, Request } from './worker.ts'

function inWorker(request: Request, transfer: Transferable[] = []): Promise<Extract<Reply, { ok: true }>> {
  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
  return new Promise<Extract<Reply, { ok: true }>>((resolve, reject) => {
    worker.onmessage = (e: MessageEvent<Reply>) => (e.data.ok ? resolve(e.data) : reject(new Error(e.data.error)))
    // A script that never loaded fires a plain error event; one that failed while it ran, an ErrorEvent.
    worker.onerror = (e) => reject(!(e instanceof ErrorEvent) && reloadOnce() ? new Reloading() : new Error(e.message || 'The proof could not be made.'))
    worker.postMessage(request, transfer)
  }).finally(() => worker.terminate())
}

export const proveInWorker: Prove = async (seed, stamp, label) => {
  const copy = new Uint8Array(seed)
  return (await inWorker({ kind: 'prove', seed: copy, stamp, label }, [copy.buffer])).made!
}

export const checkInWorker: CheckProofs = async (checks: VerificationCheck[]) => (await inWorker({ kind: 'check', checks })).checked === true
