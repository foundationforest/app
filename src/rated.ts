// What the index said of each of the person's profiles, held in this page's memory while it is open,
// so a screen shows it at once and reads it again as it opens; never stored. A profile whose read
// failed is held as failed, so a screen says so in one quiet line and shows no rating.

import type { Rated } from './services/index.ts'

export type Held = { rated: Rated } | { failed: true }

const held = new Map<string, Held>()
const listeners = new Set<() => void>()

/** What the index said of the profile at `address` when last read in this page, if it was. */
export const ratedOf = (address: string): Held | undefined => held.get(address)

/** What the index said of the profile at `address`, now. */
export function holdRated(address: string, h: Held): void {
  held.set(address, h)
  for (const l of listeners) l()
}

/** Nothing held: after Forget. */
export function letGoRated(): void {
  held.clear()
  for (const l of listeners) l()
}

export function onRated(listener: () => void): () => void {
  listeners.add(listener)
  return () => void listeners.delete(listener)
}
