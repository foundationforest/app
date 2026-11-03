// What a profile's card shows, read from its folder at the host with nothing to unlock: its folder is
// public. How it is verified is the verifications its profile entry carries, by which of the
// verifier's keys each names: the face key's a face check, the ID key's an ID check. How many posts
// it holds is its folder's entries at post/<id>. With them, the access keys its profile entry lists
// now, unended, by address, so Settings can tell one this device doesn't know.

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

/** The strongest of `checks`, which a profile shows: the ID check, else the face check; null with neither. */
export const strongest = (checks: Check[]): Check | null => (checks.includes('id') ? 'id' : checks.includes('face') ? 'face' : null)

/** What a profile's card shows: how it is verified, and how many posts it holds; and the access keys it lists now. */
export type Card = { checks: Check[]; posts: number; keys: string[] }

/** A profile's card, as the host serves its folder. Null when the host holds no profile entry for it. */
export async function readCard(s: Services, address: string): Promise<Card | null> {
  const [view, verifier] = await Promise.all([readView(s.host, address), about(s.verifier)])
  const body = view.current.get('profile')?.entry.body
  if (!body) return null
  const posts = [...liveContent(view)].filter(([path, { entry }]) => /^post\/[^/]+$/.test(path) && entry.body).length
  return { checks: checksOf(body, verifier), posts, keys: view.keys.filter((k) => k.until === undefined).map((k) => k.key) }
}
