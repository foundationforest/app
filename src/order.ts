// The order the app lists the person's profiles in, on Home and in the sidebar alike: those with
// something new first (a new message, a new review, vouch or report, an entry of theirs a market
// outgrew), then the most recently used on this device (opened, posted from, written from: device.ts,
// `used`); among those never used here, those whose role offers first, then by their words.

import { type Pair, offersFirst } from './markets.ts'

/** `list` in the app's order: what is `fresh` first, then by when each was last `used`, then offers first and by words. */
export function ordered<P extends { label: string; address: string }>(list: P[], fresh: (address: string) => boolean, used: Record<string, number>): Array<P & { pair: Pair }> {
  // A stable sort, so what ties keeps offersFirst's order.
  return offersFirst(list).sort((a, b) => Number(fresh(b.address)) - Number(fresh(a.address)) || (used[b.address] ?? -1) - (used[a.address] ?? -1))
}
