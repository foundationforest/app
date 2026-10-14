// What the board and a card page show of a profile. The person's own records (offers, reviews they
// wrote, access keys) come from the profile's hosts, read by POST, so they show as soon as they are
// written. What others say (the score, the reviews about it) and the markets' role words come from
// the index, whose twins are its own format, not the standard's.

import { type AccessKey, liveContent } from '../standard/records/src/index.ts'
import type { LocalProfile } from './local.ts'
import { readOwn } from './services/host.ts'
import { ServiceError } from './services/http.ts'
import * as indexes from './services/indexes.ts'

export type Side = 'seller' | 'buyer'

/**
 * A field a market's file adds to its offers, in lexicon syntax, as the index reads it: text (its
 * `knownValues` suggestions, its `maxLength` in bytes), an integer, a boolean, or an array of text
 * (its `maxLength` and `minLength` counting items; a language's `format` is `language`, a BCP 47 tag).
 */
export type Field = {
  type: string
  description?: string
  knownValues?: string[]
  maxLength?: number
  minLength?: number
  minimum?: number
  maximum?: number
  items?: { type?: string; format?: string; maxLength?: number; minLength?: number }
}

export type Market = {
  name: string
  folder: string
  sides: 'one' | 'two'
  roleNames?: Record<Side, string>
  /** The fields its offers may carry, all of them suggestions. */
  offerFields?: { properties?: Record<string, Field> }
  /** The rating names its reviews usually give, overall among them. */
  ratings?: string[]
}

const markets = new Map<string, Promise<Market | null>>()

/** A market's file, from the index's twin of it; null when the index does not use it. Asked once per page load. */
export function marketOf(index: string, name: string): Promise<Market | null> {
  const key = `${index} ${name}`
  if (!markets.has(key)) {
    const got = indexes.market(index, name).then(
      (twin) => twin.market as Market,
      (err) => (markets.delete(key), err instanceof ServiceError && err.status === 404 ? null : Promise.reject(err)),
    )
    markets.set(key, got)
  }
  return markets.get(key)!
}

export const splitLabel = (label: string) => {
  const at = label.indexOf('/')
  return { market: label.slice(0, at), role: label.slice(at + 1) }
}

/** The plain word for a role: the market's role name, else the role itself. */
export const roleWord = (role: string, market: Market | null | undefined) => market?.roleNames?.[role as Side] ?? role

/** The roles a market's sides allow, as the index reads them: seller and buyer when two, peer when one. */
export const rolesOf = (market: Market) => (market.sides === 'two' ? ['seller', 'buyer'] : ['peer'])

/** A slug as words: `music-lessons` is "Music lessons". */
export const words = (slug: string) => (slug.charAt(0).toUpperCase() + slug.slice(1)).replace(/-/g, ' ')

/** The dollar an offer's price is written in: the index's devnet dollar, the classic test dollar devnet's services are paid in. */
export const DOLLAR = 'J2QBACfPPb1ys2UyGx3ecXHgCr4hWuHFT3C2Nr6TSVSa'

/** The dollars the foundation's index shows as dollars (its config/currencies.json): mainnet and devnet USDC, and devnet's two test dollars. */
const DOLLARS = new Set([
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
  'J2QBACfPPb1ys2UyGx3ecXHgCr4hWuHFT3C2Nr6TSVSa',
  'g55mjY4swDAFt16TZds3tsmoK55qkdhDLn4kb32RGZz',
])

type Price = { amount?: unknown; mint?: unknown; per?: unknown }

export function priceText(price: Price | undefined): string | null {
  if (!price || typeof price.amount !== 'string') return null
  const per = price.per === 'hour' ? ' / hour' : price.per === 'day' ? ' / day' : ''
  return `${DOLLARS.has(price.mint as string) ? '$' : ''}${price.amount}${per}`
}

/** An offer's title: the first line of its description. */
export const titleOf = (description: unknown) => (typeof description === 'string' ? description.split('\n')[0]!.trim().slice(0, 80) : '')

/** An offer as a row shows it, and its body, for the sheet that changes it. */
export type Offer = { path: string; title: string; price: string | null; body: Record<string, any> }
export type Written = { path: string; subject: string; score: string | null; text: string | null; body: Record<string, any> }
export type Own = { offers: Offer[]; written: Written[]; access: AccessKey[] }

/** The profile's own records, newest first: its offers, the reviews it wrote, and the access keys that can act now. */
export async function ownRecords(p: LocalProfile): Promise<Own> {
  const view = await readOwn(p.hosts, p.address)
  const live = [...liveContent(view)].sort(([, a], [, b]) => b.record.time - a.record.time)
  const body = (c: (typeof live)[number][1]) => c.record.body as Record<string, any>
  return {
    offers: live.filter(([path]) => path.startsWith('offer/')).map(([path, c]) => ({ path, title: titleOf(body(c).description), price: priceText(body(c).price), body: body(c) })),
    written: live
      .filter(([path]) => path.startsWith('review/'))
      .map(([path, c]) => ({
        path,
        subject: String(body(c).subject ?? ''),
        score: typeof body(c).ratings?.overall === 'string' ? body(c).ratings.overall : null,
        text: typeof body(c).text === 'string' ? body(c).text : null,
        body: body(c),
      })),
    access: view.access.filter((e) => e.scope),
  }
}

export type Received = { uri: string; reviewer: string; score: number | null; text: string | null }
export type Indexed = { rating: { value: number; reviews: number } | null; received: Received[] }

/** What the index says of the profile: its rating out of 10 and how many reviews it rests on, and the reviews about it. Null when the index has not stored it. */
export async function indexed(index: string, address: string): Promise<Indexed | null> {
  let twin: any
  try {
    twin = await indexes.profile(index, address)
  } catch (err) {
    if (err instanceof ServiceError && err.status === 404) return null
    throw err
  }
  const rating = twin?.scores?.rating
  return {
    rating: rating && typeof rating.value === 'number' ? { value: rating.value, reviews: Number(rating.details?.reviews ?? 0) } : null,
    received: (twin?.reviews?.received ?? []).map((r: any) => ({ uri: String(r.uri), reviewer: String(r.reviewer), score: typeof r.overall === 'number' ? r.overall : null, text: r.text ?? null })),
  }
}

/** A card's name for a thread or a sender: its market and its role's word, as the index names it. */
export const cardName = (market: string, role: string, file: Market | null | undefined) => `${words(market)} ${roleWord(role, file)}`

/** A time as the person reads it: their own date and clock. */
export const localTime = (ms: number) => new Date(ms).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })

/** An address, short: its first and last four. */
export const short = (address: string) => (address.length > 12 ? `${address.slice(0, 4)}…${address.slice(-4)}` : address)
