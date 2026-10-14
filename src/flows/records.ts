// The profile's own offers and reviews, written with its main key to every host its hosts record
// names: a new one at a fresh id, a new version at its path (the fields the sheet does not show
// kept as they were), or removed, with a null body; paid for from its folder, topped up from the
// vault when a host says it holds too little (vault.ts, `paying`). The shapes are the standard's
// (records/schemas/offer.json and review.json); a price is in the index's devnet dollar. An offer
// also carries the fields its market's file suggests, each optional; a review, a score for each
// rating name the market lists, and goes only to a profile the index has registered on the other
// side of the reviewer's market (the same market, when it is one-sided).

import { mainKey } from '../../standard/keys/src/index.ts'
import { type Body, type Json, hex, nextTime, ownerRecord, publicKeyFromAddress } from '../../standard/records/src/index.ts'
import { DOLLAR, type Field, type Market, splitLabel } from '../cards.ts'
import type { LocalProfile } from '../local.ts'
import { publishRecords, readOwn } from '../services/host.ts'
import { ServiceError } from '../services/http.ts'
import * as indexes from '../services/indexes.ts'
import { settings } from '../settings.ts'
import { paying } from '../vault.ts'

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
  const record = ownerRecord(main, path, body(before), nextTime(Date.now(), view, path))
  await paying(seed, settings().host, p.address, () => publishRecords(view.hosts.length ? view.hosts : p.hosts, [record]))
}

/** The offer's own fields, the standard's: a market's file cannot name one of them again. */
const OFFER_OWN = new Set(['direction', 'description', 'price', 'terms', 'availability', 'remote', 'location', 'media', 'expires', 'createdAt'])

/** The fields of a market's file the offer sheet shows: text, integers, booleans and arrays of text. Others it leaves alone. */
export function offerFieldsOf(market: Market | null | undefined): [string, Field][] {
  return Object.entries(market?.offerFields?.properties ?? {}).filter(
    ([name, f]) => !OFFER_OWN.has(name) && (['string', 'integer', 'boolean'].includes(f.type) || (f.type === 'array' && (f.items?.type ?? 'string') === 'string')),
  )
}

/** A field's value as the sheet holds it: text (an integer typed as text), the items of an array, or a boolean. */
export type FieldValue = string | string[] | boolean

/** What the sheet shows for a field from what the offer holds. */
export function shownValue(f: Field, v: unknown): FieldValue {
  if (f.type === 'boolean') return v === true
  if (f.type === 'array') return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
  if (f.type === 'integer') return Number.isSafeInteger(v) ? String(v) : ''
  return typeof v === 'string' ? v : ''
}

const bytes = (text: string) => new TextEncoder().encode(text).length

/** A language tag as BCP 47 spells it (`pt-br` is `pt-BR`); null when it is not one, a language's name (`english`) among them. */
export function languageTag(text: string): string | null {
  try {
    const tag = Intl.getCanonicalLocales(text.trim())[0]
    return tag && /^[a-z]{2,3}(-|$)/.test(tag) ? tag : null
  } catch {
    return null
  }
}

/** One item of an array field, as the offer writes it; null when the field takes no such item. */
export function itemOf(f: Field, text: string): string | null {
  const item = f.items?.format === 'language' ? languageTag(text) : text.trim()
  if (!item) return null
  return (f.items?.maxLength === undefined || bytes(item) <= f.items.maxLength) && (f.items?.minLength === undefined || bytes(item) >= f.items.minLength) ? item : null
}

/** A field's value as the offer writes it: undefined when left empty, every field being optional; null when it does not fit the field. */
export function fieldValue(f: Field, v: FieldValue | undefined): Json | undefined {
  if (f.type === 'boolean') return v === true ? true : undefined
  if (f.type === 'array') {
    const items = Array.isArray(v) ? v : []
    if (!items.length) return undefined
    return items.length <= (f.maxLength ?? Infinity) && items.every((i) => itemOf(f, i) === i) ? items : null
  }
  const text = typeof v === 'string' ? v.trim() : ''
  if (!text) return undefined
  if (f.type === 'integer') {
    const n = /^-?[0-9]{1,15}$/.test(text) ? Number(text) : NaN
    return Number.isSafeInteger(n) && n >= (f.minimum ?? -Infinity) && n <= (f.maximum ?? Infinity) ? n : null
  }
  return f.maxLength === undefined || bytes(text) <= f.maxLength ? text : null
}

/** `fields`: the market's fields the sheet shows, each by name: its value, or undefined to leave it out. */
export type OfferInput = { description: string; price?: { amount: string; per: Per }; fields?: Record<string, Json | undefined> }

/**
 * An offer as the sheet writes it: its description, its price in the devnet dollar, and its
 * market's fields, over what was there. A buyer's profile asks for something rather than offering
 * it, so its direction is `request`.
 */
export function offerBody(input: OfferInput, role: string, before: Body | null): Body {
  const { price: _, ...kept } = before ?? {}
  const body: Body = {
    ...kept,
    direction: typeof before?.direction === 'string' ? before.direction : role === 'buyer' ? 'request' : 'offer',
    description: input.description,
    ...(input.price && { price: { amount: input.price.amount, mint: DOLLAR, per: input.price.per } }),
    createdAt: typeof before?.createdAt === 'string' ? before.createdAt : now(),
  }
  for (const [name, value] of Object.entries(input.fields ?? {})) {
    if (OFFER_OWN.has(name)) continue
    if (value === undefined) delete body[name]
    else body[name] = value
  }
  return body
}

/** The ratings a review sheet scores: each name the market lists, overall first; overall alone until the market is known. */
export const ratingNames = (market: Market | null | undefined) => ['overall', ...(market?.ratings ?? []).filter((n) => n !== 'overall')]

/** `ratings`: a score for each rating name the sheet shows, or '' to leave it out. */
export type ReviewInput = { subject: string; ratings: Record<string, string>; text: string }

/** A review as the sheet writes it: who, its scores, the text, over what was there. */
export function reviewBody(input: ReviewInput, before: Body | null): Body {
  const { text: _, ratings: was, ...kept } = before ?? {}
  const ratings: Record<string, Json> = isObject(was) ? { ...was } : {}
  for (const [name, score] of Object.entries(input.ratings)) {
    if (score) ratings[name] = score
    else delete ratings[name]
  }
  return {
    ...kept,
    subject: input.subject,
    ...(Object.keys(ratings).length > 0 && { ratings }),
    ...(input.text.trim() && { text: input.text.trim() }),
    createdAt: typeof before?.createdAt === 'string' ? before.createdAt : now(),
  }
}

export const writeOffer = (seed: Uint8Array, p: LocalProfile, id: string, input: OfferInput | null) =>
  writeOwn(seed, p, `offer/${id}`, (before) => input && offerBody(input, p.label.split('/')[1]!, before))

export const writeReview = (seed: Uint8Array, p: LocalProfile, id: string, input: ReviewInput | null) => writeOwn(seed, p, `review/${id}`, (before) => input && reviewBody(input, before))

/** Refused: the profile is not on the other side of the reviewer's market, as the index has it. */
export const OTHER_SIDE = 'Reviews go to the other side of your market.'

/** The role a profile reviews: a buyer for a seller, a seller for a buyer, a peer for a peer. */
export const otherRole = (role: string) => (role === 'seller' ? 'buyer' : role === 'buyer' ? 'seller' : role)

/** Whether the index's twin of a profile has it registered as `market/role`: that its own market and role, and a registry row the index counts under that label. */
export function registeredAs(twin: any, market: string, role: string): boolean {
  if (twin?.profile?.market !== market || twin.profile.role !== role || !Array.isArray(twin.stamps)) return false
  return twin.stamps.some((s: any) => s?.counted === true && s.label === `${market}/${role}`)
}

/** Whether `p` may review `subject`: the index has it registered on the other side of p's market. Not when the index holds no such profile. */
export async function reviewable(index: string, p: LocalProfile, subject: string): Promise<boolean> {
  const { market, role } = splitLabel(p.label)
  try {
    return registeredAs(await indexes.profile(index, subject), market, otherRole(role))
  } catch (err) {
    if (err instanceof ServiceError && err.status === 404) return false
    throw err
  }
}

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
