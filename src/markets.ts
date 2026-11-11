// The markets, from their files as the build hands them over (build/markets.ts), through the markets'
// browser entry, which takes them as data and runs no eval: the directory, each market file,
// checkEntry and previewOf. As the app shows them: each market and role a pair, in the market's own words,
// "Tutoring tutor", no symbol between (on screen, the market in bold and the role muted: Named, in
// ui.tsx); every market with its roles and whether it is beta, as New profile lists them; each kind
// of entry's fields for a role; the other side of a market; and a market that is gone, one a profile
// this device remembers was made in, which the directory no longer lists.

import { type Field, type Fields, type Kind, type Market, type Markets, type Role, SHARED, loadMarkets, previewOf } from '@foundationforest/markets/browser'
import files from 'virtual:markets'

export type { Field, Fields, Kind, Market }
/** The listing fields that matter first, as the markets manual's Preview says: the markets' own. */
export { previewOf }

export const markets = loadMarkets(files)

/** The kinds of entry, each at `<kind>/<id>` in a profile's folder: listings, then reviews, vouches and reports. */
export const KINDS: Kind[] = ['listing', 'review', 'vouch', 'report']

/** One market and role: the label a profile of it has, and how the app names it. `offers` when the role's listings are offers; `listings`, its role's, none for a label the directory no longer lists. */
export type Pair = { label: string; market: string; role: string; words: string; offers: boolean; listings?: Role['listings'] }

/** A market's name in words: `home-cleaning` is Home cleaning. */
export const marketWords = (name: string) => {
  const words = name.replaceAll('-', ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/** Every market and role in the directory, in its order. */
export const pairs: Pair[] = markets.directory.markets.flatMap((m) =>
  m.roles.map((r) => ({ label: `${m.name}/${r.role}`, market: m.name, role: r.role, words: `${marketWords(m.name)} ${r.role}`, offers: r.listings === 'offers', listings: r.listings })),
)

/** A role as a title says it, its hyphens as spaces and a capital first: Player, Developer. */
export const roleWords = (role: string) => {
  const words = role.replaceAll('-', ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/** A market as New profile lists it: its name, its words, its roles, and whether it is beta (the markets manual's Status), else live. */
export type MarketRoles = { market: string; words: string; roles: Pair[]; beta: boolean }

/** The markets in a directory, in its order, each with every role: live and beta alike. */
export const listOf = (directory: Markets['directory']): MarketRoles[] =>
  directory.markets.map((m) => ({ market: m.name, words: marketWords(m.name), roles: pairs.filter((p) => p.market === m.name), beta: m.status === 'beta' }))

/** Every market in the directory, in its order, each with every role. */
export const marketList: MarketRoles[] = listOf(markets.directory)

/** What the app says, once, where someone makes a profile or a listing in a beta market: word for word as services' pages say it. */
export const BETA = 'Beta: it works, at your own risk, and may change.'

/** Whether the market of `label`, a profile this device remembers, is gone: the directory no longer lists it. */
export const gone = (label: string) => !markets.market(pairOf(label).market)

/** The line a profile whose market is gone shows, in the index's words for the same case: Its market, Clothing, is no longer in the markets directory. */
export const goneLine = (label: string) => `Its market, ${marketWords(pairOf(label).market)}, is no longer in the markets directory, so it can't post.`

/** The pair a label names; one the directory no longer lists is named from the label itself. */
export function pairOf(label: string): Pair {
  const found = pairs.find((p) => p.label === label)
  if (found) return found
  const [market = label, role = ''] = label.split('/')
  return { label, market, role, words: role ? `${marketWords(market)} ${role}` : marketWords(market), offers: false }
}

/**
 * The role on the other side of `role` in `market`: the other role where it has two or more (any
 * other), the same role where it has one (a match of two players). Undefined when the market or the
 * role is not in the directory.
 */
export function otherSide(market: string, role: string): string[] {
  const roles = markets.market(market)?.roles.map((r) => r.role) ?? []
  if (!roles.includes(role)) return []
  return roles.length === 1 ? roles : roles.filter((r) => r !== role)
}

/** A role's listing, in its market's word for it: an offer or a request. */
export const LISTING_WORDS = { offers: 'Offer', requests: 'Request' } as const

/** A listing's word for a profile of `label`: its role's, or Listing for a role the directory no longer lists. */
const listingWord = (label: string) => {
  const { listings } = pairOf(label)
  return listings ? LISTING_WORDS[listings] : 'Listing'
}

/** A role's listings in its word, `n` of them: 3 offers, 1 request. */
export const listingCount = (n: number, label: string) => `${n} ${listingWord(label).toLowerCase()}${n === 1 ? '' : 's'}`

/** A role's listings as a heading, in its word: Your offers, Your requests. */
export const yourListings = (label: string) => `Your ${listingWord(label).toLowerCase()}s`

/** A kind's name on screen, for a profile of `label`. */
export function kindWords(kind: Kind, label: string): string {
  if (kind === 'listing') return listingWord(label)
  return kind.charAt(0).toUpperCase() + kind.slice(1)
}

/**
 * The fields a `kind` entry by a `role` profile holds in `market`: a listing's, those of the
 * market's listing fields that are for its role, and contact, which every listing may hold and no
 * market lists; a review's, the shared ones and the market's own, those for the role of the profile
 * it is about (`aboutRole`), all of them while that is not known; a vouch's and a report's, the
 * shared ones.
 */
export function fieldsOf(market: Market, kind: Kind, role: string, aboutRole?: string): Fields {
  const forRole = (fields: Fields, who: string | undefined): Fields =>
    Object.fromEntries(Object.entries(fields).filter(([, f]) => !f.roles || who === undefined || f.roles.includes(who)))
  if (kind === 'listing') return { ...forRole(market.listing, role), ...SHARED.listing }
  if (kind === 'review') return { ...SHARED.review, ...forRole(market.review ?? {}, aboutRole) }
  return SHARED[kind]
}

/** The person's profiles in the order the app lists them: those whose role offers first, then by their words. */
export const offersFirst = <P extends { label: string }>(list: P[]): Array<P & { pair: Pair }> =>
  list.map((p) => ({ ...p, pair: pairOf(p.label) })).sort((a, b) => Number(b.pair.offers) - Number(a.pair.offers) || a.pair.words.localeCompare(b.pair.words))
