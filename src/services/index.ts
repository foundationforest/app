// The index (services' index/README.md, Its API): what it says of one profile, read from its JSON
// page, /profiles/<address>.json, open to any origin and needing nothing unlocked. The app takes its
// rating, how many listings it lists, the reviews, vouches and reports it counted about it, each
// with its time, and how many the profile wrote. And one listing, from its own page, /profiles/<profile>/listing/<id>.json:
// its body, whether it is listed, its profile's market and role, and the profile's rating, for a
// message written from it and the About box a message or a review that names it shows. What it says
// is its own word: another index may rate the same profile another way.

import type { Body } from '@foundationforest/folders'

import { Unreachable } from './http.ts'

/** The three kinds of entry about a profile. */
export type Said = 'review' | 'vouch' | 'report'

/** A review, vouch or report the index counted about a profile: its kind, its address (`<writer>/<kind>/<id>`), who wrote it, its body, and when. */
export type Received = { kind: Said; address: string; writer: string; body: Body; time?: number }

/** What the index says of a profile: its rating, from 1 to 10 (null with none), how many reviews it counted, what it counted about it, newest first, how many listings it lists, and how many reviews, vouches and reports the profile wrote. */
export type Rated = { rating: number | null; reviews: number; received: Received[]; listed: number; written: number }

const SERVICE = 'index'

const NONE: Rated = { rating: null, reviews: 0, received: [], listed: 0, written: 0 }

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

/** The counted entries of one kind, from the index's `received` list of it. */
function counted(kind: Said, list: unknown, by: 'reviewer' | 'writer'): Received[] {
  if (!Array.isArray(list)) return []
  return list
    .filter((r): r is Record<string, unknown> => isObject(r) && r.counted === true && typeof r.address === 'string' && typeof r[by] === 'string' && isObject(r.body))
    .map((r) => ({ kind, address: r.address as string, writer: r[by] as string, body: r.body as Body, ...(Number.isSafeInteger(r.time) && { time: r.time as number }) }))
}

/** What the index at `origin` says of the profile at `address`; nothing yet when it holds no profile entry for it. */
export async function readRated(origin: string, address: string): Promise<Rated> {
  let res: Response
  try {
    res = await fetch(`${origin}/profiles/${address}.json`, { cache: 'no-store', redirect: 'error' })
  } catch {
    throw new Unreachable(SERVICE)
  }
  if (res.status === 404) return NONE
  const page: any = res.ok ? await res.json().catch(() => null) : null
  if (!isObject(page) || page.address !== address) throw new Unreachable(SERVICE)
  const { ratings, reviews, vouches, reports } = page as any
  const value = ratings?.value
  const received = [...counted('review', reviews?.received, 'reviewer'), ...counted('vouch', vouches?.received, 'writer'), ...counted('report', reports?.received, 'writer')]
  received.sort((a, b) => (b.time ?? 0) - (a.time ?? 0))
  let listed = 0
  for (const l of Array.isArray(page.listings) ? page.listings : []) if (isObject(l) && l.listed === true) listed++
  const given = (list: unknown) => (Array.isArray(list) ? list.filter(isObject).length : 0)
  const written = given(reviews?.given) + given(vouches?.given) + given(reports?.given)
  return { rating: typeof value === 'number' ? value : null, reviews: received.filter((r) => r.kind === 'review').length, received, listed, written }
}

/** A listing as the index holds it: its profile, that profile's market and role, its body, whether it is listed (a deleted one is kept, not listed), and its profile's rating, from 1 to 10 (null with none). */
export type IndexedListing = { profile: string; market: string | null; role: string | null; body: Body; listed: boolean; rating: number | null }

/** A listing's full address: `<profile address>/listing/<id>`, as a review's `listing` names it. */
export const LISTING_ADDRESS = /^([^/\s]+)\/listing\/([^/\s]+)$/

/** The listing at `address` (`<profile>/listing/<id>`), as the index at `origin` holds it; null when it holds none there. */
export async function readListing(origin: string, address: string): Promise<IndexedListing | null> {
  if (!LISTING_ADDRESS.test(address)) return null
  let res: Response
  try {
    res = await fetch(`${origin}/profiles/${address}.json`, { cache: 'no-store', redirect: 'error' })
  } catch {
    throw new Unreachable(SERVICE)
  }
  if (res.status === 404) return null
  const page: any = res.ok ? await res.json().catch(() => null) : null
  if (!isObject(page) || typeof page.profile !== 'string' || !isObject(page.listing) || page.listing.address !== address || !isObject(page.listing.body)) throw new Unreachable(SERVICE)
  const value = (page as any).ratings?.value
  return {
    profile: page.profile,
    market: typeof page.market === 'string' ? page.market : null,
    role: typeof page.role === 'string' ? page.role : null,
    body: page.listing.body as Body,
    listed: page.listing.listed === true,
    rating: typeof value === 'number' ? value : null,
  }
}
