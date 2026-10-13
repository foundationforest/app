// One face, one action: the seed asked of the passkey by `withSeed` for the action, and, with it, the
// pulls that count each inbox (inbox.ts), signed after the action so they cover a profile it made.
// The pulls go out once the seed is dropped, with the inbox keys that open what they find.

import { sendPulls, signPulls, type Pull } from './inbox.ts'
import { withSeed } from './seed/seed.ts'

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
