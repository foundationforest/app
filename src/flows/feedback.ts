// Feedback, what people say about a profile: its reviews, vouches and reports. Those about the
// person's profiles come from the index, which counted them, read with nothing unlocked: it is asked
// about each profile from this device, so it can tell they are one person's, as the host already
// can. Those a profile wrote come from its own folder.
//
// What is new about a profile is what the index counted after the time the device keeps for it, the
// newest its Reviews or Notifications has shown (device.ts). A profile the device has no time
// for yet is marked at the newest the index holds now, so nothing old shows as new on a new device.
//
// Notifications lists every review, vouch and report the index counted about any of the person's
// profiles, newest first, each new one marked; messages are the inbox's.

import type { Profile } from '../device.ts'
import { saveSeen, seen } from '../device.ts'
import { type Held, holdRated } from '../rated.ts'
import { type Rated, type Received, readRated } from '../services/index.ts'
import type { Posted } from './entries.ts'

export type { Rated, Received }

/** The time of the newest entry the index counted about a profile; 0 with none. */
export const newest = (r: Rated): number => Math.max(0, ...r.received.map((x) => x.time ?? 0))

/** What the index counted about a profile after `since`. */
export const newOf = (r: Rated, since: number): Received[] => r.received.filter((x) => (x.time ?? 0) > since)

/** What the index says of each profile in `list`, read now and held in the page; a profile it cannot be read for, held as failed. */
export async function rate(index: string, list: Profile[]): Promise<void> {
  await Promise.all(
    list.map(async (p) => {
      try {
        const rated = await readRated(index, p.address)
        if (!(p.address in seen())) saveSeen({ [p.address]: newest(rated) })
        holdRated(p.address, { rated })
      } catch {
        holdRated(p.address, { failed: true })
      }
    }),
  )
}

/** What a profile wrote about others, of its entries: its reviews, vouches and reports, newest first. */
export const givenOf = (entries: Posted[]): Posted[] => entries.filter((e) => e.kind !== 'listing')

/** One of Notifications' rows: a review, vouch or report about one of the person's profiles (`on`), and whether it is new. */
export type Notice = { received: Received; on: string; fresh: boolean }

/**
 * Notifications' rows: every review, vouch and report the index counted about any profile in
 * `list`, newest first, each new when it came after `since`, the time the device kept for its
 * profile as the screen opened (none: nothing is new).
 */
export function notices(list: Profile[], rated: Record<string, Held | undefined>, since: Record<string, number>): Notice[] {
  const said = list.flatMap((p) => {
    const held = rated[p.address]
    return held && 'rated' in held ? held.rated.received.map((r) => ({ received: r, on: p.address, fresh: (r.time ?? 0) > (since[p.address] ?? Infinity) })) : []
  })
  return said.sort((a, b) => (b.received.time ?? 0) - (a.received.time ?? 0))
}
