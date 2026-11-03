// What a profile's card shows, read from its folder at the host with nothing to unlock: its folder is
// public. How it is verified is the verifications its profile entry carries, by which of the
// verifier's keys each names: the face key's a face check, the ID key's an ID check. How many posts
// it holds is its folder's entries at post/<id>.

import { liveContent, proofsOf } from '@foundationforest/folders'

import { type About, type Check, about } from '../services/verifier.ts'
import { readView } from '../services/host.ts'
import type { Services } from '../config.ts'

export type { Check }

/** The checks a profile entry's verifications are from, at this verifier. */
export function checksOf(body: unknown, verifier: About): Check[] {
  const keys = new Set(proofsOf(body as Parameters<typeof proofsOf>[0]).filter((p) => p.circuit === 'verification').map((p) => p.verifier))
  return [...(keys.has(verifier.face.key) ? ['face' as const] : []), ...(keys.has(verifier.id.key) ? ['id' as const] : [])]
}

/** What a profile's card shows: how it is verified, and how many posts it holds. */
export type Card = { checks: Check[]; posts: number }

/** A profile's card, as the host serves its folder. Null when the host holds no profile entry for it. */
export async function readCard(s: Services, address: string): Promise<Card | null> {
  const [view, verifier] = await Promise.all([readView(s.host, address), about(s.verifier)])
  const body = view.current.get('profile')?.entry.body
  return body ? { checks: checksOf(body, verifier), posts: [...liveContent(view)].filter(([path, { entry }]) => /^post\/[^/]+$/.test(path) && entry.body).length } : null
}
