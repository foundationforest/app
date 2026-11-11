// How an entry's values read on screen, by their type (the markets manual's Types): a choice by its
// label where its field has one, else in words, a number with its field's unit (1 night, 3 nights),
// or a range in the index's words (9 to 11 years, 18 years and over, 11 years and under), money as
// people write a price, in the device's own number format, with its count as the index says it ($20,
// €30 per hour, MX$1,300 for 5 lessons), every price a listing gives in full and, where a listing
// shows small, its first and how many more (+1 more); a place as its area and how far round it
// reaches (several, each in turn), a moment as a date and time, hours as days and times (and, for the
// row that opens them, their first days and times); and a listing's preview, the fields its market
// shows first, and its card. Each value is read by its shape: one a market no longer gives that
// field (a listing it outgrew) shows as nothing, never breaking the screen it is on.
// A contact opens with a tap when it is a phone number, an email or a link.

import type { Body } from '@foundationforest/folders'

import type { Field, Market } from './markets.ts'
import { previewOf } from './markets.ts'
import { unitWords } from './units.ts'

/** A value in words, hyphens as spaces and a capital first: `new-with-tags` is New with tags. */
export const valueWords = (value: string) => {
  const words = value.replaceAll('-', ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/** A choice's value as people read it: its label where its field has one (`xl` is XL), else in words. */
export const choiceWords = (field: Pick<Field, 'labels'>, value: string) => (field.labels && Object.hasOwn(field.labels, value) ? field.labels[value]! : valueWords(value))

/** A place: its area, then how far round it reaches; nothing more for radius 0, that exact spot. An older place, with no radius, as its area. */
export function placeText(place: { area?: unknown; radiusKm?: unknown }): string {
  const area = typeof place.area === 'string' ? place.area : ''
  if (typeof place.radiusKm !== 'number') return area
  if (place.radiusKm === 0) return area || 'An exact spot'
  return area ? `${area}, within ${place.radiusKm} km` : `Within ${place.radiusKm} km`
}

/** A place in two lines, as its row in a form shows it: its name, else what it is; and how far round it reaches. */
export function placeLines(place: { area?: unknown; radiusKm?: unknown }): { main: string; more: string } {
  const area = typeof place.area === 'string' ? place.area : ''
  if (typeof place.radiusKm !== 'number') return { main: area, more: '' }
  const reach = place.radiusKm === 0 ? 'Exact spot' : `Within ${place.radiusKm} km`
  if (place.radiusKm === 0 && !area) return { main: 'An exact spot', more: '' }
  return area ? { main: area, more: reach } : { main: reach, more: '' }
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

/** One number with its unit after it, one or many as the number says: 60 minutes, 1 night; with no unit, the number alone. */
const withUnit = (unit: string | undefined, n: string) => (unit ? `${n} ${unitWords(unit, n)}` : n)

/**
 * A number with its field's unit: 60 minutes, 1 night; one with no unit, as it was written. A range,
 * in the index's words: from one number to another, 9 to 11 years; with an end left out, for no limit
 * that way, 18 years and over, 11 years and under. Anything else, nothing.
 */
export function numberText(field: { unit?: string }, value: unknown): string {
  if (typeof value === 'string') return withUnit(field.unit, value)
  if (!isObject(value)) return ''
  const from = typeof value.from === 'string' && value.from ? value.from : undefined
  const to = typeof value.to === 'string' && value.to ? value.to : undefined
  if (from && to) return field.unit ? `${from} to ${to} ${unitWords(field.unit, to)}` : `${from} to ${to}`
  if (from) return `${withUnit(field.unit, from)} and over`
  if (to) return `${withUnit(field.unit, to)} and under`
  return ''
}

export const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

/** A moment's time, in the device's words for it. */
const when = (time: unknown) => (typeof time === 'string' && !Number.isNaN(Date.parse(time)) ? new Date(time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '')

/** The strings a value holds: itself, or each of a list. */
const strings = (v: unknown): string[] => (Array.isArray(v) ? v : [v]).filter((x): x is string => typeof x === 'string')

/** A field's value as one line, or empty when there is nothing to show: every price a listing gives, each in turn. */
export function valueText(field: Field, value: unknown): string {
  if (value === undefined || value === null) return ''
  switch (field.type) {
    case 'choice':
      return strings(value)
        .map((v) => choiceWords(field, v))
        .join(', ')
    case 'words':
      return Array.isArray(value) ? strings(value).join(', ') : ''
    case 'money':
      return pricesOf(value)
        .map((m) => priceText(m))
        .join(', ')
    case 'place':
      // Several, each in turn: Lisbon, within 10 km; Porto, within 10 km.
      return (Array.isArray(value) ? value : [value])
        .filter(isObject)
        .map(placeText)
        .filter(Boolean)
        .join('; ')
    case 'number':
      return (Array.isArray(value) ? value : [value])
        .map((v) => numberText(field, v))
        .filter(Boolean)
        .join(', ')
    case 'moment':
      if (!isObject(value)) return when(value)
      return when(value.from) && when(value.to) ? `${when(value.from)} to ${when(value.to)}` : when(value.from)
    case 'hours':
      if (!isObject(value) || !Array.isArray(value.slots)) return ''
      return value.slots
        .filter((slot) => isObject(slot) && typeof slot.from === 'string' && typeof slot.to === 'string')
        .map((slot) => `${strings(slot.days).sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b)).map((d) => valueWords(d).slice(0, 3)).join(' ')} ${slot.from}–${slot.to}`)
        .join(', ')
    case 'file':
      return ''
    default:
      return typeof value === 'string' ? value : typeof value === 'number' ? String(value) : ''
  }
}

/** Days in words, in the week's order: one, a run of three or more from one to another (Monday to Thursday), else each (Monday, Wednesday). */
export function daysText(days: string[]): string {
  const sorted = DAYS.filter((d) => days.includes(d))
  const at = sorted.map((d) => DAYS.indexOf(d))
  const run = sorted.length >= 3 && at.every((n, i) => i === 0 || n === at[i - 1]! + 1)
  return run ? `${valueWords(sorted[0]!)} to ${valueWords(sorted.at(-1)!)}` : sorted.map(valueWords).join(', ')
}

/** Hours in two lines, as their row in a form shows them: the first slot's days; its times, and how many more slots. */
export function hoursLines(value: unknown): { main: string; more: string } | null {
  const slots = isObject(value) && Array.isArray(value.slots) ? value.slots.filter(isObject) : []
  const [first] = slots
  if (!first) return null
  const times = `${String(first.from)} to ${String(first.to)}`
  return { main: daysText(Array.isArray(first.days) ? (first.days as string[]) : []), more: slots.length > 1 ? `${times}, and ${slots.length - 1} more` : times }
}

/** One price: an amount of a currency, and what it is for, `count` of its `per` (1 when left out), none for the whole deal. */
export type Money = { amount: string; currency: string; per?: string; count?: number }

/**
 * Each price a value gives, in its writer's order: a listing's price is always a list of them in the
 * markets' format; one held as a single money, as an older market had it, shows as a list of one.
 * Only those that are money.
 */
export function pricesOf(value: unknown): Money[] {
  return (Array.isArray(value) ? value : [value]).filter((m): m is Money => isObject(m) && typeof m.amount === 'string' && typeof m.currency === 'string')
}

/** A word for several of a `per`, as the index says it: lessons, classes, and a person's people. */
export const perPlural = (per: string) => (per === 'person' ? 'people' : /(s|x|z|ch|sh)$/.test(per) ? `${per}es` : `${per}s`)

/**
 * A price as people write it, in the device's own number format (or `locale`'s): $20, $12.50, €30
 * per hour, 30 € per hour, MX$1,300 for 5 lessons. An amount that is no number, or a currency that
 * is no code, reads as it was written: 30 coins.
 */
export function priceText(money: { amount?: unknown; currency?: unknown; per?: unknown; count?: unknown }, locale?: string): string {
  const { amount, per } = priceParts(money, locale)
  return per ? `${amount} ${per}` : amount
}

/**
 * A price in its two parts, as a listing's card shows them: the amount ($30), and what it is for, as
 * the index says it: per hour, or for a pack its count of its per, for 5 lessons; empty for the whole deal.
 */
export function priceParts(money: { amount?: unknown; currency?: unknown; per?: unknown; count?: unknown }, locale?: string): { amount: string; per: string } {
  const amount = Number(money.amount)
  let text = `${String(money.amount)} ${String(money.currency)}`
  if (typeof money.amount === 'string' && money.amount.trim() !== '' && Number.isFinite(amount)) {
    try {
      text = new Intl.NumberFormat(locale, { style: 'currency', currency: String(money.currency), trailingZeroDisplay: 'stripIfInteger' }).format(amount)
    } catch {
      // Not a currency code: as it was written.
    }
  }
  const per = typeof money.per === 'string' && money.per ? money.per : ''
  const count = Number.isInteger(money.count) ? (money.count as number) : 1
  return { amount: text, per: !per ? '' : count > 1 ? `for ${count} ${perPlural(per)}` : `per ${per}` }
}

/** How many more prices than the one shown, as the index says it where a listing shows small: +1 more. */
export const morePrices = (n: number) => `+${n} more`

/** A listing's preview: the fields its market shows first, those it has, in one line each; its price, small, the first and how many more. */
export function previewLines(market: Market, body: Body): string[] {
  return previewOf(market)
    .map((name) => {
      const field = market.listing[name]
      if (!field) return ''
      if (field.type !== 'money') return valueText(field, body[name])
      const [first, ...more] = pricesOf(body[name])
      return first ? [priceText(first), ...(more.length ? [morePrices(more.length)] : [])].join(', ') : ''
    })
    .filter(Boolean)
}

/**
 * A listing's card, in every market: its title, its description's first line, else its preview's
 * first; one quiet line, the next of its preview's fields it holds (but its description, its price
 * and its photos); and its first price in its two parts, with how many more it gives, wherever the
 * market's preview puts it, or none.
 */
export function cardLines(market: Market, body: Body): { title: string; line: string; price: { amount: string; per: string; more: number } | null } {
  const shown = previewOf(market)
    .filter((name) => name !== 'price' && name !== 'description' && market.listing[name] && market.listing[name].type !== 'file')
    .map((name) => valueText(market.listing[name]!, body[name]))
    .filter(Boolean)
  const description = market.listing.description && typeof body.description === 'string' ? (body.description.trim().split('\n')[0] ?? '').trim() : ''
  const [title = '', line = ''] = description ? [description, ...shown] : shown
  const [first, ...more] = market.listing.price?.type === 'money' ? pricesOf(body.price) : []
  return { title, line, price: first ? { ...priceParts(first), more: more.length } : null }
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
