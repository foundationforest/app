// The markets, from the directory the markets' package gives at build time (build/markets.ts), as
// the app shows them: each market and role a pair, in the market's own words, "Tutoring · tutor".

import directory from 'virtual:markets'

/** One market and role: the label a profile of it has, and how the app names it. `offers` when the role's posts are offers. */
export type Pair = { label: string; market: string; role: string; words: string; offers: boolean }

/** A market's name in words: `home-cleaning` is Home cleaning. */
export const marketWords = (name: string) => {
  const words = name.replaceAll('-', ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/** Every market and role in the directory, in its order. */
export const pairs: Pair[] = directory.markets.flatMap((m) =>
  m.roles.map((r) => ({ label: `${m.name}/${r.role}`, market: m.name, role: r.role, words: `${marketWords(m.name)} · ${r.role}`, offers: r.posts === 'offers' })),
)

/** The pair a label names; one the directory no longer lists is named from the label itself. */
export function pairOf(label: string): Pair {
  const found = pairs.find((p) => p.label === label)
  if (found) return found
  const [market = label, role = ''] = label.split('/')
  return { label, market, role, words: role ? `${marketWords(market)} · ${role}` : marketWords(market), offers: false }
}
