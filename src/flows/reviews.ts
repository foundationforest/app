// Reviews, vouches and reports. Those about the person's profiles come from the index, which counted
// them, read with nothing unlocked: it is asked about each profile from this device, so it can tell
// they are one person's, as the host already can. Those a profile wrote come from its own folder.
//
// What is new about a profile is what the index counted after the time the device keeps for it, the
// newest its Reviews or Notifications has shown (device.ts). A profile the device has no time for yet
// is marked at the newest the index holds now, so nothing old shows as new on a new device.
//
// Notifications lists, from every profile, first a row for each with new messages (a message has no
// time until it is unlocked: an inbox entry holds only who it is for and its envelope), then every
// review, vouch and report the index counted about any of them, newest first, each new one marked.

import type { Profile } from '../device.ts'
import { saveSeen, seen } from '../device.ts'
import { type Held, holdRated } from '../rated.ts'
import { type Rated, type Received, readRated } from '../services/index.ts'
import type { Posted } from './posts.ts'

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

/** What a profile wrote about others, of its posts: its reviews, vouches and reports, newest first. */
export const givenOf = (posts: Posted[]): Posted[] => posts.filter((p) => p.kind !== 'post')

/** One of Notifications' rows: a profile's new messages, by how many; or a review, vouch or report about one of the person's profiles (`on`), and whether it is new. */
export type Notice = { messages: number; on: string } | { received: Received; on: string; fresh: boolean }

/**
 * Notifications' rows, from every profile in `list`: those with new messages first, in `list`'s
 * order; then every review, vouch and report the index counted about any of them, newest first,
 * each new when it came after `since`, the time the device kept for its profile as the screen
 * opened (none: nothing is new).
 */
export function notices(list: Profile[], messages: Record<string, string[]>, rated: Record<string, Held | undefined>, since: Record<string, number>): Notice[] {
  const rows: Notice[] = list.filter((p) => (messages[p.address]?.length ?? 0) > 0).map((p) => ({ messages: messages[p.address]!.length, on: p.address }))
  const said = list.flatMap((p) => {
    const held = rated[p.address]
    return held && 'rated' in held ? held.rated.received.map((r) => ({ received: r, on: p.address, fresh: (r.time ?? 0) > (since[p.address] ?? Infinity) })) : []
  })
  said.sort((a, b) => (b.received.time ?? 0) - (a.received.time ?? 0))
  return [...rows, ...said]
}
