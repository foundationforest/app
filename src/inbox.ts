// What each inbox holds, counted at each face: the pulls are signed while the seed is open, one per
// profile and host, then sent once it is closed, so no main key outlives the action. Messages are
// counted, not opened; reading them comes with the inbox screen. One page a host each time.

import { mainKey } from '../standard/keys/src/index.ts'
import { type SignedPull, pull, pullRequest } from '../standard/records/src/index.ts'
import { type LocalProfile, inboxCounts, localProfiles, saveInboxCounts } from './local.ts'

export type Pull = { address: string; host: string; request: SignedPull }

export async function signPulls(seed: Uint8Array, profiles: LocalProfile[] = localProfiles()): Promise<Pull[]> {
  const counts = inboxCounts()
  const pulls: Pull[] = []
  for (const p of profiles) {
    const main = await mainKey(seed, p.label)
    for (const host of p.hosts) pulls.push({ address: p.address, host, request: pullRequest(main, counts[p.address]?.after[host] ?? 0, Date.now()) })
  }
  return pulls
}

/** The pulls sent, and what each found added to its profile's count. A host that fails is asked again at the next face. */
export async function sendPulls(pulls: Pull[]): Promise<void> {
  const pages = await Promise.all(pulls.map((p) => pull(p.host, p.request).then((page) => ({ p, page }), () => null)))
  const counts = inboxCounts()
  for (const got of pages) {
    if (!got) continue
    const { p, page } = got
    const was = counts[p.address] ?? { count: 0, after: {} }
    counts[p.address] = { count: was.count + page.messages.length, after: { ...was.after, [p.host]: Math.max(was.after[p.host] ?? 0, page.cursor) } }
  }
  saveInboxCounts(counts)
}
