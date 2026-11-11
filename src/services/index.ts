// The index (services' index/README.md, Its API): what it says of one profile, read from its JSON
// page, /profiles/<address>.json, open to any origin and needing nothing unlocked. The app takes its
// rating, the listings it holds of the profile (so a review's listing shows even once deleted) and
// how many it lists, the reviews, vouches and reports it counted about it, each with its time, and
// how many the profile wrote. What it says is its own word: another index may rate the same profile
// another way.

import type { Body } from '@foundationforest/folders'

import { Unreachable } from './http.ts'

/** The three kinds of entry about a profile. */
export type Said = 'review' | 'vouch' | 'report'

/** A review, vouch or report the index counted about a profile: its kind, its address (`<writer>/<kind>/<id>`), who wrote it, its body, and when. */
export type Received = { kind: Said; address: string; writer: string; body: Body; time?: number }

/** What the index says of a profile: its rating, from 1 to 10 (null with none), how many reviews it counted, what it counted about it, newest first, its listings by address and how many it lists, and how many reviews, vouches and reports the profile wrote. */
export type Rated = { rating: number | null; reviews: number; received: Received[]; listings: Record<string, Body>; listed: number; written: number }

const SERVICE = 'index'

const NONE: Rated = { rating: null, reviews: 0, received: [], listings: {}, listed: 0, written: 0 }

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
  const listings: Record<string, Body> = {}
  let listed = 0
  for (const l of Array.isArray(page.listings) ? page.listings : []) {
    if (!isObject(l) || typeof l.address !== 'string' || !isObject(l.body)) continue
    listings[l.address] = l.body as Body
    if (l.listed === true) listed++
  }
  const given = (list: unknown) => (Array.isArray(list) ? list.filter(isObject).length : 0)
  const written = given(reviews?.given) + given(vouches?.given) + given(reports?.given)
  return { rating: typeof value === 'number' ? value : null, reviews: received.filter((r) => r.kind === 'review').length, received, listings, listed, written }
}
