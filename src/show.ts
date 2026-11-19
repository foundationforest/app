// How an entry's answers read on screen, by their piece (the pieces page): a choice by the market's
// own words for it (`xl` is XL, `es` Spanish); a number with its unit, a range as the markets read
// it (9 to 11 years, 18 years or more); a price as people say it, in the device's own number format:
// €15 an hour, €60 for 3 hours, €25 for 45 minutes, €40 for the whole job, a request's as the most it
// would pay (Up to €60 for 3 hours), its note read with it; a place by the caption the places service
// gives its centre (Around Chamberí, Madrid), never stored, else by its size alone (Within 10 km); a
// date in the markets' words (Monday to Friday, 9:00 to 13:00), with its time zone named where it is
// not the device's own (Madrid time); a link as it is. And a listing's preview, the fields its market
// shows first, and its card. Each answer is read by its shape: one a market no longer gives that
// field (a listing it outgrew) shows as nothing, never breaking the screen it is on.
// A contact opens with a tap when it is a phone number, an email or a link.

import type { Body } from '@foundationforest/folders'

import { type DateValue, type Field, type Market, type PlaceValue, type PriceValue, WEEKDAYS, type Weekday, choiceWords, markets, previewOf } from './markets.ts'

/** A place's caption, the name places gives its centre, when it is known; undefined until then, or when places can't say. */
export type Caption = (place: PlaceValue) => string | undefined

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

/** A field's answers: a list for a field that takes several (and every price), else the one; one answer where a list belongs, as an older market held a price, a list of one, so nothing breaks. */
export const answersOf = (field: Pick<Field, 'piece' | 'several'>, value: unknown): unknown[] =>
  value === undefined || value === null ? [] : Array.isArray(value) ? (field.several || field.piece === 'price' ? value : []) : [value]

/** Whether a value is a place, as a listing holds it. */
export const isPlace = (v: unknown): v is PlaceValue => isObject(v) && typeof v.lat === 'string' && typeof v.lon === 'string' && Number.isInteger(v.radiusKm)

/** Whether a value is a price, as a listing holds it. */
export const isPrice = (v: unknown): v is PriceValue => isObject(v) && typeof v.amount === 'string' && typeof v.currency === 'string'

const DECIMAL = /^-?[0-9]+(\.[0-9]+)?$/
const DAY = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/
const TIME = /^[0-9]{2}:[0-9]{2}$/
const decimal = (v: unknown) => typeof v === 'string' && DECIMAL.test(v)
const maybe = (v: unknown, fits: (v: unknown) => boolean) => v === undefined || fits(v)
const isDay = (v: unknown) => typeof v === 'string' && DAY.test(v)
const isTime = (v: unknown) => typeof v === 'string' && TIME.test(v)

/** Whether one answer has its piece's shape, so the markets can read it: a market that changed may hold one that no longer does. */
const readable = (field: Field, v: unknown): boolean => {
  switch (field.piece) {
    case 'choice':
    case 'text':
    case 'link':
      return typeof v === 'string'
    case 'number':
      return decimal(v) || (isObject(v) && (decimal(v.from) || decimal(v.to)) && maybe(v.from, decimal) && maybe(v.to, decimal))
    case 'price':
      return isPrice(v) && decimal(v.amount) && maybe(v.count, decimal)
    case 'place':
      return isPlace(v) && decimal(v.lat) && decimal(v.lon)
    case 'date': {
      if (!isObject(v) || !maybe(v.start, isTime) || !maybe(v.end, isTime) || !maybe(v.from, isDay) || !maybe(v.to, isDay)) return false
      if (v.on !== undefined) return isDay(v.on)
      if (v.every !== undefined) return Array.isArray(v.every) && v.every.length > 0 && v.every.every((d) => WEEKDAYS.includes(d as Weekday))
      return v.from !== undefined || v.to !== undefined
    }
    default:
      return false
  }
}

/** One answer as the markets read it, or nothing where it can't be read. */
const readOne = (field: Field, v: unknown): string => {
  try {
    return markets.read({ ...field, several: undefined }, field.piece === 'price' ? [v] : v)
  } catch {
    return ''
  }
}

/** The device's own time zone, by its IANA name. */
export const deviceZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone

/** A time zone as people name it, by its city: Europe/Madrid is Madrid time, America/Argentina/Buenos_Aires Buenos Aires time. */
export const zoneWords = (zone: string) => `${(zone.split('/').at(-1) ?? zone).replaceAll('_', ' ')} time`

/** A date answer in the markets' words, its zone named where it is not the device's own: Saturdays, 10:00 to 14:00, Madrid time. */
export function dateText(field: Field, v: DateValue, here = deviceZone()): string {
  const said = readOne(field, v)
  return said && v.zone && v.zone !== here ? `${said}, ${zoneWords(v.zone)}` : said
}

/** A number of hours, as decimal text, as people say a length: 45 minutes, 90 minutes, 1 hour, 3 hours, 2.5 hours. */
export function lengthWords(count: string): string {
  const n = Number(count)
  if (Number.isInteger(n)) return `${n} ${n === 1 ? 'hour' : 'hours'}`
  const minutes = Math.round(n * 60)
  return n < 2 ? `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}` : `${count} hours`
}

/** A word for several of a `per`, as the markets say it: weeks, months, and a person's people. */
export const perPlural = (per: string) => (per === 'person' ? 'people' : /(s|x|z|ch|sh)$/.test(per) ? `${per}es` : `${per}s`)

/** An amount of a currency, in the device's own number format (or `locale`'s): €15, $12.50, MX$1,300. A currency that is no code reads as it was written. */
export function amountText(p: { amount: string; currency: string }, locale?: string): string {
  const amount = Number(p.amount)
  if (p.amount.trim() !== '' && Number.isFinite(amount)) {
    try {
      return new Intl.NumberFormat(locale, { style: 'currency', currency: p.currency, trailingZeroDisplay: 'stripIfInteger' }).format(amount)
    } catch {
      // Not a currency code: as it was written.
    }
  }
  return `${p.amount} ${p.currency}`
}

/**
 * A price in its two parts, as a card shows them: the amount (€15), and what it is for, as people
 * say it: an hour, a month, for 3 hours, for 45 minutes, for 2 people; empty for the whole deal.
 */
export function priceParts(p: PriceValue, locale?: string): { amount: string; per: string } {
  const amount = amountText(p, locale)
  if (!p.per) return { amount, per: '' }
  const per = p.per.replaceAll('-', ' ')
  const count = p.count ?? '1'
  if (Number(count) === 1) return { amount, per: `${/^(hour|[aeio])/.test(per) ? 'an' : 'a'} ${per}` }
  return { amount, per: p.per === 'hour' ? `for ${lengthWords(count)}` : `for ${count} ${perPlural(per)}` }
}

/** A price as people say it: €15 an hour, €60 for 3 hours, €40; a request's, the most it would pay: Up to €60 for 3 hours. Its note apart. */
export function priceText(p: PriceValue, request = false, locale?: string): string {
  const { amount, per } = priceParts(p, locale)
  const said = per ? `${amount} ${per}` : amount
  return request ? `Up to ${said}` : said
}

/** A place in words: its caption, when places gave one (Around Chamberí, Madrid; an exact spot, Near Chamberí, Madrid), else its size (Within 10 km, An exact spot). */
export function placeText(p: PlaceValue, caption?: string): string {
  if (caption) return p.radiusKm === 0 ? `Near ${caption}` : `Around ${caption}`
  return p.radiusKm === 0 ? 'An exact spot' : `Within ${p.radiusKm} km`
}

/** Each answer of a field in its own words, those that can be read: the lines a listing shows for it. */
export function answerLines(field: Field, value: unknown, o: { request?: boolean; caption?: Caption } = {}): string[] {
  const answers = answersOf(field, value).filter((v) => readable(field, v))
  switch (field.piece) {
    case 'photo':
      return []
    case 'choice':
      return answers.length ? [answers.map((v, i) => choiceWords(field, v as string, i === 0)).join(', ')] : []
    case 'price':
      return answers.map((v) => priceText(v as PriceValue, o.request))
    case 'place':
      return answers.map((v) => placeText(v as PlaceValue, o.caption?.(v as PlaceValue)))
    case 'date':
      return answers.map((v) => dateText(field, v as DateValue)).filter(Boolean)
    case 'number':
      return answers.map((v) => readOne(field, v)).filter(Boolean)
    default:
      return answers.filter((v): v is string => typeof v === 'string' && v.trim() !== '')
  }
}

/** A field's answer as one line, or empty when there is nothing to show: several in turn. */
export const answerText = (field: Field, value: unknown, o: { request?: boolean; caption?: Caption } = {}) =>
  answerLines(field, value, o).join(field.piece === 'choice' || field.piece === 'number' ? ', ' : '; ')

/** How many more prices than the one shown, where a listing shows small: +1 more. */
export const morePrices = (n: number) => `+${n} more`

/** A listing's preview: the fields its market shows first, those it has, in one line each; its price, the first and how many more. */
export function previewLines(market: Market, body: Body, o: { request?: boolean; caption?: Caption } = {}): string[] {
  return previewOf(market)
    .map((name) => {
      const field = market.listing[name]
      if (!field) return ''
      if (field.piece !== 'price') return answerText(field, body[name], o)
      const [first, ...more] = answerLines(field, body[name], o)
      return first ? [first, ...(more.length ? [morePrices(more.length)] : [])].join(', ') : ''
    })
    .filter(Boolean)
}

/**
 * A listing's card, in every market: its title, its description's first line, else its preview's
 * first; one quiet line, the next of its preview's fields it holds (but its description, its price
 * and its photos); and its first price in its two parts, with how many more it gives, wherever the
 * market's preview puts it, or none. A request's price says Up to.
 */
export function cardLines(market: Market, body: Body, o: { request?: boolean; caption?: Caption } = {}): { title: string; line: string; price: { amount: string; per: string; more: number } | null } {
  const shown = previewOf(market)
    .filter((name) => name !== 'price' && name !== 'description' && market.listing[name] && market.listing[name].piece !== 'photo')
    .map((name) => answerText(market.listing[name]!, body[name], o))
    .filter(Boolean)
  const description = market.listing.description && typeof body.description === 'string' ? (body.description.trim().split('\n')[0] ?? '').trim() : ''
  const [title = '', line = ''] = description ? [description, ...shown] : shown
  const field = market.listing.price
  const [first, ...more] = field?.piece === 'price' ? answersOf(field, body.price).filter(isPrice) : []
  if (!first) return { title, line, price: null }
  const parts = priceParts(first)
  return { title, line, price: { amount: o.request ? `Up to ${parts.amount}` : parts.amount, per: parts.per, more: more.length } }
}

/** Where a contact opens with a tap: a phone number, an email, or a link. Undefined for anything else, a handle, which shows as it is. */
export function contactHref(contact: string): string | undefined {
  const text = contact.trim()
  if (/^https?:\/\/\S+$/i.test(text)) return text
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return `mailto:${text}`
  if (/^\+?[\d\s().-]{6,}$/.test(text) && (text.match(/\d/g) ?? []).length >= 6) return `tel:${text.replace(/[^\d+]/g, '')}`
  return undefined
}

/** A rating as the index gives it, from 1 to 10, to one decimal: 9.4. */
export const ratingText = (rating: number) => rating.toFixed(1)

/** How many reviews: 1 review, 12 reviews. */
export const reviewCount = (n: number) => `${n} review${n === 1 ? '' : 's'}`

/** What came about a profile, by kind, as its rating line says it with no score yet: 1 vouch, 2 vouches, 1 report. */
export function saidCount(received: Array<{ kind: 'review' | 'vouch' | 'report' }>): string {
  const n = (kind: string) => received.filter((r) => r.kind === kind).length
  const words: Array<[number, string, string]> = [
    [n('review'), 'review', 'reviews'],
    [n('vouch'), 'vouch', 'vouches'],
    [n('report'), 'report', 'reports'],
  ]
  return words
    .filter(([count]) => count > 0)
    .map(([count, one, many]) => `${count} ${count === 1 ? one : many}`)
    .join(', ')
}

/** How many profiles: 1 profile, 2 profiles. */
export const profileCount = (n: number) => `${n} profile${n === 1 ? '' : 's'}`
