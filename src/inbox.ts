// What each inbox holds, counted at each face: the pulls are signed while the seed is held, one per
// profile and host, then sent once it is dropped, so no main key outlives the action. Each profile's
// inbox key is mixed with the same seed and held only until its pulls are back: what they find is
// opened, so a grant, which is a key and never shown, is not counted, nor is what cannot be opened.
// What counts was sent by someone else: never a profile's copy of what it sent, through the app (its
// main key) or through an access key. The one thing the profile sends itself that counts is a
// request, which its AI sends with an inbox key to ask the person for something only they can do.
// The inbox screen marks what it showed as read. One page a host each time.

import { inboxKey, mainKey } from '../standard/keys/src/index.ts'
import { type CheckedMessage, type SignedPull, pull, pullRequest } from '../standard/records/src/index.ts'
import { openMessage } from '../standard/records/src/private.ts'
import { type LocalProfile, inboxCounts, localProfiles, saveInboxCounts } from './local.ts'

export type Pull = { address: string; host: string; request: SignedPull; identity: string }

export async function signPulls(seed: Uint8Array, profiles: LocalProfile[] = localProfiles()): Promise<Pull[]> {
  const counts = inboxCounts()
  const pulls: Pull[] = []
  for (const p of profiles) {
    const main = await mainKey(seed, p.label)
    const { identity } = await inboxKey(main.privateKey)
    for (const host of p.hosts) pulls.push({ address: p.address, host, request: pullRequest(main, counts[p.address]?.after[host] ?? 0, Date.now()), identity })
  }
  return pulls
}

/** Whether a message found counts: one from someone else that opens and is not a grant; from the profile itself, only a request an access key sent. */
async function counts({ message: m }: CheckedMessage, p: Pull): Promise<boolean> {
  if (m.from === p.address && m.key === undefined) return false
  const opened = await openMessage(m, p.identity).catch(() => null)
  if (!opened) return false
  return m.from === p.address ? typeof opened.body.request === 'string' : !('grant' in opened.body)
}

/** The pulls sent, and what each found added to its profile's count. A host that fails is asked again at the next face. */
export async function sendPulls(pulls: Pull[]): Promise<void> {
  const pages = await Promise.all(
    pulls.map((p) =>
      pull(p.host, p.request).then(
        async (page) => ({ p, page, fresh: (await Promise.all(page.messages.map((m) => counts(m, p)))).filter(Boolean).length }),
        () => null,
      ),
    ),
  )
  const counted = inboxCounts()
  for (const got of pages) {
    if (!got) continue
    const { p, page, fresh } = got
    const was = counted[p.address] ?? { count: 0, after: {} }
    counted[p.address] = { count: was.count + fresh, after: { ...was.after, [p.host]: Math.max(was.after[p.host] ?? 0, page.cursor) } }
  }
  saveInboxCounts(counted)
}

/** The profile's inbox read up to these cursors, by host: nothing left to count. */
export function markRead(address: string, cursors: Record<string, number>): void {
  const counts = inboxCounts()
  const was = counts[address]?.after ?? {}
  const after = { ...was }
  for (const [host, cursor] of Object.entries(cursors)) after[host] = Math.max(was[host] ?? 0, cursor)
  saveInboxCounts({ ...counts, [address]: { count: 0, after } })
}
