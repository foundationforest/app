// The markets, from their files as the build hands them over (build/markets.ts), through the markets'
// browser entry, which takes them as data and runs no eval: the directory, each market file,
// checkEntry and previewOf. As the app shows them: each market and role a pair, in the market's own words,
// "Tutoring tutor", no symbol between (on screen, the market in bold and the role muted: Named, in
// ui.tsx); every market with its roles, as New profile lists them; each kind of entry's fields for
// a role; and the other side of a market.

import { type Field, type Fields, type Kind, type Market, SHARED, loadMarkets, previewOf } from '@foundationforest/markets/browser'
import files from 'virtual:markets'

export type { Field, Fields, Kind, Market }
/** The post fields that matter first, as the markets manual's Preview says: the markets' own. */
export { previewOf }

export const markets = loadMarkets(files)

/** The kinds of entry, each at `<kind>/<id>` in a profile's folder: posts, then reviews, vouches and reports. */
export const KINDS: Kind[] = ['post', 'review', 'vouch', 'report']

/** One market and role: the label a profile of it has, and how the app names it. `offers` when the role's posts are offers. */
export type Pair = { label: string; market: string; role: string; words: string; offers: boolean; posts: 'offers' | 'requests' | 'posts' }

/** A market's name in words: `home-cleaning` is Home cleaning. */
export const marketWords = (name: string) => {
  const words = name.replaceAll('-', ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/** Every market and role in the directory, in its order. */
export const pairs: Pair[] = markets.directory.markets.flatMap((m) =>
  m.roles.map((r) => ({ label: `${m.name}/${r.role}`, market: m.name, role: r.role, words: `${marketWords(m.name)} ${r.role}`, offers: r.posts === 'offers', posts: r.posts })),
)

/** A role in words: `seller` is Seller. */
export const roleWords = (role: string) => marketWords(role)

/** A market as New profile lists it: its name, its words, and its roles. */
export type MarketRoles = { market: string; words: string; roles: Pair[] }

/** Every market in the directory, in its order, each with every role. */
export const marketList: MarketRoles[] = markets.directory.markets.map((m) => ({ market: m.name, words: marketWords(m.name), roles: pairs.filter((p) => p.market === m.name) }))

/** The pair a label names; one the directory no longer lists is named from the label itself. */
export function pairOf(label: string): Pair {
  const found = pairs.find((p) => p.label === label)
  if (found) return found
  const [market = label, role = ''] = label.split('/')
  return { label, market, role, words: role ? `${marketWords(market)} ${role}` : marketWords(market), offers: false, posts: 'posts' }
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

/** A role's post, in its market's word for it: an offer, a request or a post. */
export const POST_WORDS = { offers: 'Offer', requests: 'Request', posts: 'Post' } as const

/** A role's posts in its word, `n` of them: 3 offers, 1 request. */
export const postCount = (n: number, label: string) => `${n} ${POST_WORDS[pairOf(label).posts].toLowerCase()}${n === 1 ? '' : 's'}`

/** A role's posts as a heading, in its word: Your offers, Your requests, Your posts. */
export const yourPosts = (label: string) => `Your ${POST_WORDS[pairOf(label).posts].toLowerCase()}s`

/** A kind's name on screen, for a profile of `label`. */
export function kindWords(kind: Kind, label: string): string {
  if (kind === 'post') return POST_WORDS[pairOf(label).posts]
  return kind.charAt(0).toUpperCase() + kind.slice(1)
}

/**
 * The fields a `kind` entry by a `role` profile holds in `market`: a post's, those of the market's
 * post fields that are for its role, and contact, which every post may hold and no market lists; a
 * review's, the shared ones and the market's own, those for the
 * role of the profile it is about (`aboutRole`), all of them while that is not known; a vouch's and a
 * report's, the shared ones.
 */
export function fieldsOf(market: Market, kind: Kind, role: string, aboutRole?: string): Fields {
  const forRole = (fields: Fields, who: string | undefined): Fields =>
    Object.fromEntries(Object.entries(fields).filter(([, f]) => !f.roles || who === undefined || f.roles.includes(who)))
  if (kind === 'post') return { ...forRole(market.post, role), ...SHARED.post }
  if (kind === 'review') return { ...SHARED.review, ...forRole(market.review ?? {}, aboutRole) }
  return SHARED[kind]
}
