// The orders the app lists things in. The person's own profiles keep the order they were made in,
// on Home, in the sidebar and in Messages' chips, by when each was made (its label entry in the
// Profiles folder says, device.ts); one whose time the device doesn't know yet comes after, offers
// first and by their words. Everything else (a profile's offers, the conversations in Messages and
// in an offer, the reviews a profile received, the ones it wrote): what is new or needs the person
// (a count, a dot or a !) first, newest first; then the rest, newest first. A list shown keeps its
// order while it is on screen (hooks.ts, `useSteady`), and takes this one the next time it shows.

import { type Pair, offersFirst } from './markets.ts'

/** The person's profiles in the order they were made in, by when each label's was (`made`); those whose time isn't known yet after, offers first and by their words. */
export function inMadeOrder<P extends { label: string }>(list: P[], made: Record<string, number>): Array<P & { pair: Pair }> {
  const at = (p: P) => made[p.label] ?? Infinity
  // A stable sort, so what ties keeps offersFirst's order.
  return offersFirst(list).sort((a, b) => (at(a) === at(b) ? 0 : at(a) < at(b) ? -1 : 1))
}

/** `items`, what is `flagged` (new, or needing the person) first, newest first by `time`; then the rest, newest first. */
export function newFirst<T>(items: readonly T[], flagged: (item: T) => boolean, time: (item: T) => number): T[] {
  return [...items].sort((a, b) => Number(flagged(b)) - Number(flagged(a)) || time(b) - time(a))
}

/** The keys of a list shown, in its order: those kept, as they were, and any new since it showed on top, in `now`'s order. */
export function steady(kept: readonly string[] | null, now: readonly string[]): string[] {
  if (kept === null) return [...now]
  const still = new Set(now)
  const known = new Set(kept)
  return [...now.filter((k) => !known.has(k)), ...kept.filter((k) => still.has(k))]
}
