// A market's color: its name's, from a palette of ten by a small stable hash (FNV-1a), so one market
// is one color on every device and no color is tied to a name; two markets may share one. Its own
// module, with no drawing in it, so a test reads it as it is.

/** The ten colors a market's avatar takes. */
export const PALETTE = ['#3d76c9', '#b6508d', '#5a60c8', '#1e998c', '#d97a2b', '#7a5bc9', '#d4524e', '#6a9f2a', '#2f86a6', '#a0742f'] as const

/** 32-bit FNV-1a over the UTF-8 bytes of `text`. */
export function fnv1a(text: string): number {
  let hash = 0x811c9dc5
  for (const byte of new TextEncoder().encode(text)) hash = Math.imul(hash ^ byte, 0x01000193) >>> 0
  return hash
}

/** A market's color, from its name alone. */
export const colorOf = (market: string): string => PALETTE[fnv1a(market) % PALETTE.length]!
