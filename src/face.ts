// One face, one action: the seed opened by `withSeed` for the action, and, in the same opening, the
// pulls that count each inbox (inbox.ts), signed after the action so they cover a profile it made.
// The pulls go out once the seed is closed.

import { sendPulls, signPulls, type Pull } from './inbox.ts'
import { withSeed } from './seed/locked.ts'

export async function withFace<T>(action: (seed: Uint8Array) => Promise<T>): Promise<T> {
  let pulls: Pull[] = []
  const result = await withSeed(async (seed) => {
    const out = await action(seed)
    pulls = await signPulls(seed).catch(() => [])
    return out
  })
  void sendPulls(pulls)
  return result
}
