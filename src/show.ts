// How an entry's values read on screen, by their type (the markets manual's Types): a choice by its
// label where its field has one, else in words, a number with its field's unit (1 night, 3 nights),
// money as people write a price, in the device's own number format ($20, €30 per hour), a place as
// its area and how far round it reaches (several, each in turn), a moment as a date and time, hours
// as days and times (and, for the row that opens them, their first days and times); and a listing's
// preview, the fields its market shows first, and its card.
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

/** A number with its field's unit: 60 minutes, 1 night; one with no unit, as it was written. */
export const numberText = (field: Pick<Field, 'unit'>, value: unknown) => (field.unit ? `${String(value)} ${unitWords(field.unit, value)}` : String(value))

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

export const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

/** A moment's time, in the device's words for it. */
const when = (time: unknown) => (typeof time === 'string' && !Number.isNaN(Date.parse(time)) ? new Date(time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '')

/** A field's value as one line, or empty when there is nothing to show. */
export function valueText(field: Field, value: unknown): string {
  if (value === undefined || value === null) return ''
  switch (field.type) {
    case 'choice':
      return (Array.isArray(value) ? value : [value]).map((v) => choiceWords(field, String(v))).join(', ')
    case 'words':
      return Array.isArray(value) ? value.join(', ') : ''
    case 'money':
      return isObject(value) ? priceText(value) : ''
    case 'place':
      // Several, each in turn: Lisbon, within 10 km; Porto, within 10 km.
      return (Array.isArray(value) ? value : [value])
        .filter(isObject)
        .map(placeText)
        .filter(Boolean)
        .join('; ')
    case 'number':
      return numberText(field, value)
    case 'moment':
      return isObject(value) ? `${when(value.from)} to ${when(value.to)}` : when(value)
    case 'hours':
      if (!isObject(value) || !Array.isArray(value.slots)) return ''
      return value.slots
        .filter(isObject)
        .map((slot) => `${[...(slot.days as string[])].sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b)).map((d) => valueWords(d).slice(0, 3)).join(' ')} ${slot.from}–${slot.to}`)
        .join(', ')
    case 'file':
      return ''
    default:
      return String(value)
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

/**
 * A price as people write it, in the device's own number format (or `locale`'s): $20, $12.50, €30
 * per hour, 30 € per hour. An amount that is no number, or a currency that is no code, reads as it
 * was written: 30 coins.
 */
export function priceText(money: { amount?: unknown; currency?: unknown; per?: unknown }, locale?: string): string {
  const { amount, per } = priceParts(money, locale)
  return per ? `${amount} ${per}` : amount
}

/** A price in its two parts, as a listing's card shows them: the amount ($30), and what it is for (per hour), empty for the whole deal. */
export function priceParts(money: { amount?: unknown; currency?: unknown; per?: unknown }, locale?: string): { amount: string; per: string } {
  const amount = Number(money.amount)
  let text = `${String(money.amount)} ${String(money.currency)}`
  if (typeof money.amount === 'string' && money.amount.trim() !== '' && Number.isFinite(amount)) {
    try {
      text = new Intl.NumberFormat(locale, { style: 'currency', currency: String(money.currency), trailingZeroDisplay: 'stripIfInteger' }).format(amount)
    } catch {
      // Not a currency code: as it was written.
    }
  }
  return { amount: text, per: typeof money.per === 'string' && money.per ? `per ${money.per}` : '' }
}

/** A listing's preview: the fields its market shows first, those it has, in one line each. */
export function previewLines(market: Market, body: Body): string[] {
  return previewOf(market)
    .map((name) => (market.listing[name] ? valueText(market.listing[name], body[name]) : ''))
    .filter(Boolean)
}

/**
 * A listing's card, in every market: its title, its description's first line, else its preview's
 * first; one quiet line, the next of its preview's fields it holds (but its description, its price
 * and its photos); and its price in its two parts, wherever the market's preview puts it, or none.
 */
export function cardLines(market: Market, body: Body): { title: string; line: string; price: { amount: string; per: string } | null } {
  const shown = previewOf(market)
    .filter((name) => name !== 'price' && name !== 'description' && market.listing[name] && market.listing[name].type !== 'file')
    .map((name) => valueText(market.listing[name]!, body[name]))
    .filter(Boolean)
  const description = market.listing.description && typeof body.description === 'string' ? (body.description.trim().split('\n')[0] ?? '').trim() : ''
  const [title = '', line = ''] = description ? [description, ...shown] : shown
  const money = body.price
  const price = market.listing.price?.type === 'money' && typeof money === 'object' && money !== null && !Array.isArray(money) ? priceParts(money) : null
  return { title, line, price }
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
