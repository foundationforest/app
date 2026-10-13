// The profile's own offers and reviews, written with its main key to every host its hosts record
// names: a new one at a fresh id, a new version at its path (the fields the sheet does not show
// kept as they were), or removed, with a null body. The shapes are the standard's
// (records/schemas/offer.json and review.json); a price is in the index's devnet dollar.

import { mainKey } from '../../standard/keys/src/index.ts'
import { type Body, hex, nextTime, ownerRecord, publicKeyFromAddress } from '../../standard/records/src/index.ts'
import { DOLLAR } from '../cards.ts'
import type { LocalProfile } from '../local.ts'
import { publishRecords, readOwn } from '../services/host.ts'

/** What one amount buys, as the standard names it: `job` is the whole of it. */
export const PER = ['hour', 'day', 'job'] as const
export type Per = (typeof PER)[number]

/** A fresh id for `offer/<id>` or `review/<id>`: 16 random hex digits. */
export const freshId = () => hex.encode(crypto.getRandomValues(new Uint8Array(8)))

/** An amount of dollars as a record writes it: decimal text above 0, at most six decimals. */
export const AMOUNT = /^(0|[1-9][0-9]{0,15})(\.[0-9]{1,6})?$/
export const amountOk = (amount: string) => AMOUNT.test(amount) && /[1-9]/.test(amount)

/** A score as a review writes it: 1 to 10, at most one decimal. */
export const SCORE = /^(10(\.0)?|[1-9](\.[0-9])?)$/

/** A path's last segment, as the standard allows it. */
export const ID = /^[a-z0-9][a-z0-9._-]{0,63}$/

const isObject = (v: unknown): v is Body => v !== null && typeof v === 'object' && !Array.isArray(v)
const now = () => new Date().toISOString()

/** `body(before)` written at `path` with the main key, `before` being the body there now; null removes it. */
export async function writeOwn(seed: Uint8Array, p: LocalProfile, path: string, body: (before: Body | null) => Body | null): Promise<void> {
  const main = await mainKey(seed, p.label)
  const view = await readOwn(p.hosts, p.address)
  const before = view.current.get(path)?.record.body ?? null
  await publishRecords(view.hosts.length ? view.hosts : p.hosts, [ownerRecord(main, path, body(before), nextTime(Date.now(), view, path))])
}

export type OfferInput = { description: string; price?: { amount: string; per: Per } }

/**
 * An offer as the sheet writes it: its description and its price in the devnet dollar, over what
 * was there. A buyer's profile asks for something rather than offering it, so its direction is
 * `request`.
 */
export function offerBody(input: OfferInput, role: string, before: Body | null): Body {
  const { price: _, ...kept } = before ?? {}
  return {
    ...kept,
    direction: typeof before?.direction === 'string' ? before.direction : role === 'buyer' ? 'request' : 'offer',
    description: input.description,
    ...(input.price && { price: { amount: input.price.amount, mint: DOLLAR, per: input.price.per } }),
    createdAt: typeof before?.createdAt === 'string' ? before.createdAt : now(),
  }
}

export type ReviewInput = { subject: string; score: string; text: string }

/** A review as the sheet writes it: who, the overall score, the text, over what was there. */
export function reviewBody(input: ReviewInput, before: Body | null): Body {
  const { text: _, ...kept } = before ?? {}
  const ratings = isObject(before?.ratings) ? before.ratings : {}
  return {
    ...kept,
    subject: input.subject,
    ratings: { ...ratings, overall: input.score },
    ...(input.text.trim() && { text: input.text.trim() }),
    createdAt: typeof before?.createdAt === 'string' ? before.createdAt : now(),
  }
}

export const writeOffer = (seed: Uint8Array, p: LocalProfile, id: string, input: OfferInput | null) =>
  writeOwn(seed, p, `offer/${id}`, (before) => input && offerBody(input, p.label.split('/')[1]!, before))

export const writeReview = (seed: Uint8Array, p: LocalProfile, id: string, input: ReviewInput | null) => writeOwn(seed, p, `review/${id}`, (before) => input && reviewBody(input, before))

const text = (v: unknown, max: number) => typeof v === 'string' && v.length <= max

/** Whether a body fits the standard's offer shape, so far as its required fields and price go. */
export function offerFits(v: unknown): v is Body {
  if (!isObject(v) || (v.direction !== 'offer' && v.direction !== 'request') || !text(v.description, 3000)) return false
  if ('createdAt' in v && typeof v.createdAt !== 'string') return false
  if (!('price' in v)) return true
  const price = v.price
  return isObject(price) && typeof price.amount === 'string' && /^(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(price.amount) && text(price.mint, 44) && (price.mint as string).length >= 32 && PER.includes(price.per as Per)
}

/** Whether a body fits the standard's review shape, so far as its subject, ratings and text go. */
export function reviewFits(v: unknown): v is Body {
  if (!isObject(v) || !publicKeyFromAddress(v.subject)) return false
  if ('createdAt' in v && typeof v.createdAt !== 'string') return false
  if ('text' in v && !text(v.text, 3000)) return false
  return !('ratings' in v) || (isObject(v.ratings) && Object.values(v.ratings).every((r) => typeof r === 'string' && SCORE.test(r)))
}
